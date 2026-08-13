type JobState = "completed" | "stale" | "pending" | "failed";

type UpdateResult = PromiseLike<{ error: unknown | null }>;
type JobStateClient = {
  from(table: "translation_jobs"): {
    update(values: Record<string, unknown>): { eq(column: string, value: string): UpdateResult };
  };
};

export function formatDatabaseError(error: unknown): string {
  if (error && typeof error === "object") {
    const value = error as { code?: string; message?: string; details?: string; hint?: string };
    const formatted = [value.code, value.message, value.details, value.hint].filter(Boolean).join(" | ");
    if (formatted) return formatted;
  }
  return String(error);
}

async function transitionJob(client: JobStateClient, jobId: string, state: JobState, values: Record<string, unknown>) {
  const { error } = await client.from("translation_jobs").update({
    ...values,
    status: state,
    locked_at: null,
    locked_by: null,
  }).eq("id", jobId);
  if (error) throw new Error(`Failed to persist translation job ${jobId} transition to ${state}: ${formatDatabaseError(error)}`);
}

export function markJobCompleted(client: JobStateClient, jobId: string) {
  return transitionJob(client, jobId, "completed", { completed_at: new Date().toISOString(), last_error: null });
}

export function markJobStale(client: JobStateClient, jobId: string) {
  return transitionJob(client, jobId, "stale", { completed_at: new Date().toISOString(), last_error: null });
}

export function markJobRetry(client: JobStateClient, jobId: string, attempts: number, message: string) {
  return transitionJob(client, jobId, "pending", {
    available_at: new Date(Date.now() + 2 ** Math.min(attempts, 6) * 60_000).toISOString(),
    last_error: message,
  });
}

export function markJobFailed(client: JobStateClient, jobId: string, message: string) {
  return transitionJob(client, jobId, "failed", { completed_at: new Date().toISOString(), last_error: message });
}
