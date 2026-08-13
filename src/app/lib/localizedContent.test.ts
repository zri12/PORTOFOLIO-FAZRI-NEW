import { describe, expect, it } from "vitest";
import { hasProjectLanguage, localizeArticle, localizeCertificate, localizeProfile, localizeProject, publishedCertificatesForLanguage, publishedCreativeWorksForLanguage, publishedProjectsForLanguage } from "./localizedContent";
import type { Article, Certificate, CreativeWork, Profile, Project } from "../types/portfolio";

describe("localized CMS content", () => {
  it("selects the requested project locale and falls back safely", () => {
    const project = { id: "1", slug: "project", title: "Original", translations: { id: { title: "Proyek Indonesia" } } } as Project;
    expect(localizeProject(project, "id").title).toBe("Proyek Indonesia");
    expect(localizeProject(project, "en").title).toBe("Proyek Indonesia");
  });

  it("accepts partial project prose translations without requiring a translated title", () => {
    const project = { id: "sinden", slug: "sinden", title: "SINDEN", status: "published", shortDescription: "Source description", overview: "Source overview", translations: { id: { title: "", shortDescription: "Deskripsi Indonesia", overview: "Ikhtisar Indonesia", objectives: [] } } } as unknown as Project;
    expect(hasProjectLanguage(project, "id")).toBe(true);
    expect(localizeProject(project, "id")).toMatchObject({ title: "SINDEN", shortDescription: "Deskripsi Indonesia", overview: "Ikhtisar Indonesia" });
  });

  it("keeps a published source project visible while its requested translation is pending", () => {
    const project = { id: "source", slug: "source", title: "Source project", status: "published", shortDescription: "English source", translationStatus: "pending", translations: { en: { title: "Source project", shortDescription: "English source" } } } as Project;
    expect(publishedProjectsForLanguage([project], "id")).toHaveLength(1);
    expect(localizeProject(project, "id").title).toBe("Source project");
  });

  it("keeps source fields when a partial certificate translation intentionally omits its title", () => {
    const certificate = { id: "certificate", title: "AWS Cloud Practitioner", issuer: "Source issuer", translations: { id: { title: "", issuer: "Penerbit Indonesia" } } } as Certificate;
    expect(localizeCertificate(certificate, "id")).toMatchObject({ title: "AWS Cloud Practitioner", issuer: "Penerbit Indonesia" });
  });

  it("preserves article block structure when selecting a locale", () => {
    const blocks = [{ id: "block-1", type: "image" as const, url: "https://example.test/image.webp", alt: "Alt", caption: "Caption" }];
    const article = { id: "1", slug: "article", title: "Original", blocks, translations: { id: { title: "Artikel", blocks } } } as Article;
    const localized = localizeArticle(article, "id");
    expect(localized.blocks[0]).toEqual(blocks[0]);
  });

  it("uses the localized profile prose without applying the static UI dictionary", () => {
    const profile = { title: "Developer", greeting: "Hello", headline: "Source", description: "Source description", biography: "Source bio", aboutContent: "Source about", availability: "Available", translations: { id: { title: "Pengembang", greeting: "Halo", headline: "Judul", description: "Deskripsi", biography: "Bio", aboutContent: "Tentang", availability: "Tersedia" } } } as Profile;
    expect(localizeProfile(profile, "id")).toMatchObject({ title: "Pengembang", greeting: "Halo", headline: "Judul", description: "Deskripsi", biography: "Bio", aboutContent: "Tentang", availability: "Tersedia" });
  });

  it("excludes draft projects and unpublished creative work or certificates", () => {
    expect(publishedProjectsForLanguage([{ id: "draft", status: "draft", translations: { en: { title: "Draft" } } }, { id: "published", status: "published", translations: { en: { title: "Published" } } }] as unknown as Project[], "en").map((item) => item.id)).toEqual(["published"]);
    expect(publishedCreativeWorksForLanguage([{ id: "draft", status: "draft", translations: { en: { title: "Draft" } } }, { id: "published", status: "published", translations: { en: { title: "Published" } } }] as unknown as CreativeWork[], "en").map((item) => item.id)).toEqual(["published"]);
    expect(publishedCertificatesForLanguage([{ id: "hidden", published: false, translations: { en: { title: "Hidden" } } }, { id: "shown", published: true, translations: { en: { title: "Shown" } } }] as unknown as Certificate[], "en").map((item) => item.id)).toEqual(["shown"]);
  });
});
