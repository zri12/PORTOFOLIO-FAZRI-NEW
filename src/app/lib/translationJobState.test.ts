import { describe, expect, it } from "vitest";
import { formatDatabaseError, markJobCompleted, markJobFailed, markJobRetry, markJobStale } from "../../../supabase/functions/_shared/translationJobState.ts";

function client(error: unknown = null) {
  const updates: Record<string, unknown>[] = [];
  return {
    updates,
    from: () => ({ update: (values: Record<string, unknown>) => {
      updates.push(values);
      return { eq: async () => ({ error }) };
    } }),
  };
}

describe("translation job state transitions", () => {
  it("moves every non-processing state while clearing its lease", async () => {
    const db = client();
    await markJobCompleted(db, "job-1");
    await markJobStale(db, "job-2");
    await markJobRetry(db, "job-3", 2, "malformed Gemini JSON");
    await markJobFailed(db, "job-4", "structure mismatch");
    expect(db.updates.map((update) => update.status)).toEqual(["completed", "stale", "pending", "failed"]);
    for (const update of db.updates) {
      expect(update).toMatchObject({ locked_at: null, locked_by: null });
    }
    expect(db.updates[2]).toMatchObject({ last_error: "malformed Gemini JSON", available_at: expect.any(String) });
    expect(db.updates[3]).toMatchObject({ last_error: "structure mismatch", completed_at: expect.any(String) });
  });

  it("does not silently ignore a failed state persistence update", async () => {
    await expect(markJobCompleted(client({ message: "RLS denied" }), "job-5")).rejects.toThrow("transition to completed");
  });

  it("formats PostgREST errors without degrading them to an object string", () => {
    expect(formatDatabaseError({ code: "42501", message: "permission denied", details: "row blocked", hint: "use service role" })).toBe("42501 | permission denied | row blocked | use service role");
  });
});
