import { handleCors } from "../_shared/cors.ts";
import { errorResponse, jsonResponse } from "../_shared/response.ts";
import { checkRateLimit } from "../_shared/rateLimit.ts";
import { createAdminClient } from "../_shared/supabaseAdmin.ts";
import { validateComment } from "../_shared/validation.ts";

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;
  if (req.method !== "POST") return errorResponse("Method not allowed.", 405);

  try {
    const supabase = createAdminClient();
    const body = await req.json();
    const payload = validateComment(body);
    const identifier = req.headers.get("x-forwarded-for") || payload.email;
    await checkRateLimit(supabase, identifier, "submit-comment", 8, 3600);
    const { data, error } = await supabase.from("visitor_comments").insert({
      name: payload.name,
      avatar: payload.avatar,
      message: payload.message,
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
    return errorResponse(error instanceof Error ? error.message : "Comment submission failed.", 400);
  }
});
