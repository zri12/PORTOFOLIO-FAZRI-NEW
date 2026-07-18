import { handleCors } from "../_shared/cors.ts";
import { errorResponse, jsonResponse } from "../_shared/response.ts";
import { checkRateLimit } from "../_shared/rateLimit.ts";
import { createAdminClient } from "../_shared/supabaseAdmin.ts";
import { validateContact } from "../_shared/validation.ts";

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;
  if (req.method !== "POST") return errorResponse("Method not allowed.", 405);

  try {
    const supabase = createAdminClient();
    const body = await req.json();
    const payload = validateContact(body);
    const identifier = req.headers.get("x-forwarded-for") || payload.email;
    await checkRateLimit(supabase, identifier, "submit-contact", 5, 3600);
    const { error } = await supabase.from("contact_messages").insert({
      name: payload.name,
      email: payload.email,
      whatsapp: payload.whatsapp,
      project_type: payload.projectType,
      budget_range: payload.budgetRange,
      subject: payload.subject,
      message: payload.message,
      status: "New",
    });
    if (error) throw error;
    return jsonResponse({ ok: true });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Contact submission failed.", 400);
  }
});
