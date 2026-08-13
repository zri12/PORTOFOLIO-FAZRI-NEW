import { describe, expect, it } from "vitest";
import { isPublishedAt } from "./seo";

describe("indexability matrix", () => {
  it("allows published content but rejects drafts and future scheduled articles", () => {
    const indexable = (status: string, publishedAt?: string) => status === "published" && isPublishedAt(publishedAt, new Date("2026-08-14T00:00:00Z"));
    expect(indexable("published", "2026-08-01T00:00:00Z")).toBe(true);
    expect(indexable("draft", "2026-08-01T00:00:00Z")).toBe(false);
    expect(indexable("published", "2026-09-01T00:00:00Z")).toBe(false);
  });
});
