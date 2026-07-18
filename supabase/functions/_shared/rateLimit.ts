export async function checkRateLimit(supabase: ReturnType<typeof import("./supabaseAdmin.ts").createAdminClient>, identifier: string, action: string, limit: number, windowSeconds: number) {
  const windowStart = new Date(Date.now() - windowSeconds * 1000).toISOString();
  const { data } = await supabase
    .from("submission_rate_limits")
    .select("*")
    .eq("identifier", identifier)
    .eq("action", action)
    .maybeSingle();

  if (!data || new Date(data.window_start).toISOString() < windowStart) {
    await supabase.from("submission_rate_limits").upsert({ identifier, action, attempts: 1, window_start: new Date().toISOString() }, { onConflict: "identifier,action" });
    return;
  }

  if (Number(data.attempts) >= limit) throw new Error("Too many submissions. Please try again later.");

  await supabase
    .from("submission_rate_limits")
    .update({ attempts: Number(data.attempts) + 1 })
    .eq("id", data.id);
}
