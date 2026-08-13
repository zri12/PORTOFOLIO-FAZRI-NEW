import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("translation durability migration", () => {
  it("adds certificate metadata and safely reclaims abandoned processing locks", () => {
    const sql = readFileSync("supabase/migrations/20260813000000_translation_certificates_and_stale_locks.sql", "utf8");
    expect(sql).toContain("alter table public.certificates");
    expect(sql).toContain("translation_version integer not null default 1");
    expect(sql).toContain("status = 'processing' and locked_at < now() - interval '10 minutes'");
    expect(sql).toContain("for update skip locked");
  });
});
