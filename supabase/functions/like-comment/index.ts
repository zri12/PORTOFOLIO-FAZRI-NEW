import { handleCors } from "../_shared/cors.ts";
import { errorResponse, jsonResponse } from "../_shared/response.ts";
import { checkRateLimit } from "../_shared/rateLimit.ts";
import { createAdminClient } from "../_shared/supabaseAdmin.ts";
import { cleanText } from "../_shared/validation.ts";

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;
  if (req.method !== "POST") return errorResponse("Method not allowed.", 405);

  try {
    const supabase = createAdminClient();
    const body = await req.json();
    const commentId = cleanText(body.commentId, 80);
    const visitorId = cleanText(body.visitorId, 80);
    if (!commentId || !visitorId) throw new Error("Missing comment or visitor ID.");
    await checkRateLimit(supabase, visitorId, "like-comment", 60, 3600);
    const { error } = await supabase.from("comment_likes").insert({ comment_id: commentId, visitor_id: visitorId });
    if (error && error.code !== "23505") throw error;
    const { data, error: countError } = await supabase.from("visitor_comments").select("likes_count").eq("id", commentId).single();
    if (countError) throw countError;
    return jsonResponse({ ok: true, likes: data.likes_count });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Like failed.", 400);
  }
});
