export async function checkRateLimit(supabase: ReturnType<typeof import("./supabaseAdmin.ts").createAdminClient>, identifier: string, action: string, limit: number, windowSeconds: number) {
  const { data, error } = await supabase.rpc("consume_submission_rate_limit", {
    p_identifier: identifier,
    p_action: action,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });
  if (error) throw error;
  if (data !== true) throw new Error("Too many submissions. Please try again later.");
}
