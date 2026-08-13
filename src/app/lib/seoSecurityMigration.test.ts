import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("SEO/security migration", () => {
  it("adds certificate slugs and removes anonymous submission bypasses", () => {
    const sql = readFileSync("supabase/migrations/20260814000000_certificate_slug_and_public_submission_hardening.sql", "utf8");
    expect(sql).toContain("add column if not exists slug text");
    expect(sql).toContain("create unique index if not exists certificates_slug_key");
    expect(sql).toContain("revoke insert, update, delete on public.visitor_comments from anon");
    expect(sql).toContain("status = 'approved'");
  });
});
