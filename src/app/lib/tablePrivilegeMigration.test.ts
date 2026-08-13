import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("guestbook table privilege hardening migration", () => {
  it("removes excessive anon/authenticated privileges and restores only required access", () => {
    const sql = readFileSync("supabase/migrations/20260815000000_guestbook_table_privileges_least_privilege.sql", "utf8");
    expect(sql).toContain("revoke all privileges on table public.visitor_comments from anon, authenticated");
    expect(sql).toContain("revoke all privileges on table public.comment_likes from anon, authenticated");
    expect(sql).toContain("grant select on table public.visitor_comments to anon");
    expect(sql).toContain("grant select, insert, update, delete on table public.visitor_comments to authenticated");
    expect(sql).toContain("grant select, insert, update, delete on table public.visitor_comment_contacts to authenticated");
    expect(sql).toContain("grant select, insert, update, delete on table public.contact_messages to authenticated");
    expect(sql).toContain("grant select on table public.comment_likes to authenticated");
    expect(sql).toContain("to service_role");
  });
});
