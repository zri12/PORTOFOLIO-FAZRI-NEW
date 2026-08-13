import { describe, expect, it } from "vitest";
import { findMediaReferences } from "./mediaReferences";
import { portfolioSeed } from "../data/seed/portfolioSeed";

describe("media references", () => {
  it("reports profile, project, and SEO uses before deletion", () => {
    const data = structuredClone(portfolioSeed);
    data.profile.logoUrl = "https://cdn.example/logo.webp";
    data.settings.seoImage = "https://cdn.example/logo.webp";
    data.projects[0].coverImage = "https://cdn.example/logo.webp";
    const references = findMediaReferences(data, { id: "logo", name: "logo.webp", type: "image/webp", size: 1, url: "https://cdn.example/logo.webp", createdAt: "", note: "" });
    expect(references).toEqual(expect.arrayContaining(["Profile logo", "SEO image", `Project: ${data.projects[0].title} cover`]));
  });

  it("allows an unused media asset to proceed to storage deletion", () => {
    const references = findMediaReferences(structuredClone(portfolioSeed), { id: "unused", name: "unused.webp", type: "image/webp", size: 1, url: "https://cdn.example/unused.webp", createdAt: "", note: "" });
    expect(references).toEqual([]);
  });
});
