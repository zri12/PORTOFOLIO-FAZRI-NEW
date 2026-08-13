import { handleCors } from "../_shared/cors.ts";
import { errorResponse, jsonResponse } from "../_shared/response.ts";
import { checkRateLimit } from "../_shared/rateLimit.ts";
import { createAdminClient } from "../_shared/supabaseAdmin.ts";
import { validateComment } from "../_shared/validation.ts";
import { requirePublicFeature } from "../_shared/siteSettings.ts";

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;
  if (req.method !== "POST") return errorResponse("Method not allowed.", 405);

  try {
    const supabase = createAdminClient();
    await requirePublicFeature(supabase, "comments_enabled");
    const body = await req.json();
    const payload = validateComment(body);
    const identifier = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || payload.email;
    await checkRateLimit(supabase, identifier, "submit-comment", 8, 3600);
    const { data, error } = await supabase.from("visitor_comments").insert({
      name: payload.name,
      avatar: payload.avatar,
      message: payload.message,
      parent_comment_id: payload.replyToId || null,
      status: "pending",
      likes_count: 0,
      pinned: false,
    }).select("id").single();
    if (error) throw error;
    const { error: contactError } = await supabase.from("visitor_comment_contacts").insert({
      comment_id: data.id,
      email: payload.email,
    });
    if (contactError) throw contactError;
    return jsonResponse({ ok: true, status: "pending" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Comment submission failed.";
    return errorResponse(message, message === "This feature is currently disabled." ? 403 : 400);
  }
});
