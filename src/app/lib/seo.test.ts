import { describe, expect, it } from "vitest";
import { buildCanonicalUrl, buildHreflang, isPublishedAt, languageFromPath, localizedPath } from "./seo";

describe("SEO URL architecture", () => {
  it("keeps English paths canonical and prefixes Indonesian counterparts", () => {
    expect(localizedPath("/projects/sinden", "en")).toBe("/projects/sinden");
    expect(localizedPath("/projects/sinden", "id")).toBe("/id/projects/sinden");
    expect(buildCanonicalUrl("/", "id", "https://fazrilukman.id/")).toBe("https://fazrilukman.id/id");
    expect(languageFromPath("/id/blog/article")).toBe("id");
  });

  it("builds reciprocal hreflang URLs without query state", () => {
    expect(buildHreflang("/about", "https://fazrilukman.id")).toEqual({
      en: "https://fazrilukman.id/about",
      id: "https://fazrilukman.id/id/about",
      xDefault: "https://fazrilukman.id/about",
    });
  });

  it("keeps Contact canonical and hreflang URLs stable in both languages", () => {
    expect(buildCanonicalUrl("/contact", "en", "https://fazrilukman.id")).toBe("https://fazrilukman.id/contact");
    expect(buildCanonicalUrl("/contact", "id", "https://fazrilukman.id")).toBe("https://fazrilukman.id/id/contact");
    expect(buildHreflang("/contact", "https://fazrilukman.id")).toEqual({
      en: "https://fazrilukman.id/contact",
      id: "https://fazrilukman.id/id/contact",
      xDefault: "https://fazrilukman.id/contact",
    });
    expect(localizedPath("/id/contact", "id")).toBe("/id/contact");
  });

  it("excludes future publications", () => {
    expect(isPublishedAt("2999-01-01T00:00:00.000Z", new Date("2026-01-01"))).toBe(false);
    expect(isPublishedAt("2025-01-01T00:00:00.000Z", new Date("2026-01-01"))).toBe(true);
  });
});
