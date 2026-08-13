import { createAdminClient } from "../_shared/supabaseAdmin.ts";
import { errorResponse, jsonResponse } from "../_shared/response.ts";
import { handleCors } from "../_shared/cors.ts";
import { detectSourceLanguage, translatePayload } from "../_shared/translationProvider.ts";
import { translationEntityFilter, translationSourceState } from "../_shared/translationJob.ts";
import { markJobCompleted, markJobFailed, markJobRetry, markJobStale } from "../_shared/translationJobState.ts";

type Job = { id: string; entity_type: string; entity_id: string; entity_version: number; source_hash: string; source_payload: Record<string, unknown>; attempts: number };
const allowedEntities = new Set(["site_profiles", "site_settings", "projects", "technologies", "creative_works", "experiences", "certificates", "articles"]);

class AuthenticationError extends Error {}

async function assertActiveAdmin(req: Request) {
  const workerSecret = Deno.env.get("TRANSLATION_WORKER_SECRET");
  if (workerSecret && req.headers.get("x-translation-worker-secret") === workerSecret) return;
  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) throw new AuthenticationError("Authentication required.");
  const admin = createAdminClient();
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) throw new AuthenticationError("Invalid authentication.");
  const { data: account, error: accountError } = await admin.from("admin_users").select("active").eq("user_id", data.user.id).maybeSingle();
  if (accountError || !account?.active) throw new AuthenticationError("Active portfolio admin required.");
}

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;
  if (req.method !== "POST") return errorResponse("Method not allowed.", 405);
  try {
    await assertActiveAdmin(req);
    const admin = createAdminClient();
    const requestBody = await req.json().catch(() => ({})) as { limit?: number; sourceLanguage?: "id" | "en" };
    const { data, error } = await admin.rpc("claim_translation_jobs", { p_limit: Math.min(Math.max(requestBody.limit || 3, 1), 10) });
    if (error) throw error;
    const jobs = (data || []) as Job[];
    let completed = 0;
    for (const job of jobs) {
      try {
        if (!allowedEntities.has(job.entity_type)) throw new Error(`Unsupported translation entity: ${job.entity_type}.`);
        const filter = translationEntityFilter(job.entity_type, job.entity_id);
        const { data: current, error: currentError } = await admin.from(job.entity_type).select("translation_version,translation_source_hash,translations").eq(filter.column, filter.value).maybeSingle();
        if (currentError) throw currentError;
        if (translationSourceState(current, job.entity_version, job.source_hash) !== "current") {
          await markJobStale(admin, job.id);
          continue;
        }
        const sourceLanguage = requestBody.sourceLanguage || detectSourceLanguage(job.source_payload, "en");
        const targetLanguage = sourceLanguage === "id" ? "en" : "id";
        const translated = await translatePayload(job.source_payload, sourceLanguage, targetLanguage);
        const translations = { ...(current.translations as Record<string, unknown> || {}), [sourceLanguage]: job.source_payload, [targetLanguage]: translated };
        const { data: updatedEntity, error: updateError } = await admin.from(job.entity_type)
          .update({ translations, source_language: sourceLanguage, translation_status: "ready", translation_updated_at: new Date().toISOString(), translation_error: null })
          .eq(filter.column, filter.value)
          .eq("translation_version", job.entity_version)
          .eq("translation_source_hash", job.source_hash)
          .select("id");
        if (updateError) throw updateError;
        if (!updatedEntity?.length) {
          await markJobStale(admin, job.id);
          continue;
        }
        await markJobCompleted(admin, job.id);
        completed += 1;
      } catch (jobError) {
        const finalFailure = job.attempts >= 5;
        const originalMessage = jobError instanceof Error ? jobError.message.slice(0, 300) : "Translation failed.";
        try {
          if (finalFailure) await markJobFailed(admin, job.id, originalMessage);
          else await markJobRetry(admin, job.id, job.attempts, originalMessage);
          if (allowedEntities.has(job.entity_type)) {
            const filter = translationEntityFilter(job.entity_type, job.entity_id);
            const { error: entityError } = await admin.from(job.entity_type).update({ translation_status: "failed", translation_error: originalMessage }).eq(filter.column, filter.value).eq("translation_version", job.entity_version);
            if (entityError) throw new Error(`Failed to persist entity translation failure: ${entityError.message}`);
          }
        } catch (stateError) {
          const stateMessage = stateError instanceof Error ? stateError.message : String(stateError);
          console.error("Translation job state transition failed", { jobId: job.id, originalMessage, stateMessage });
          throw new Error(`Translation job ${job.id} could not leave processing. Original error: ${originalMessage}. State transition error: ${stateMessage}`);
        }
      }
    }
    return jsonResponse({ ok: true, claimed: jobs.length, completed });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Translation processing failed.";
    return errorResponse(message, error instanceof AuthenticationError ? 401 : 500);
  }
});
