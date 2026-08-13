import { describe, expect, it } from "vitest";
import { breadcrumbStructuredData, certificateStructuredData, personStructuredData } from "./seoStructuredData";

describe("structured SEO data", () => {
  it("creates one stable Person entity from CMS values", () => {
    expect(personStructuredData("https://fazrilukman.id/", { fullName: "Fazri Lukman Nurrohman", title: "Creative Web Developer", description: "Portfolio", skills: ["React"] })).toMatchObject({ "@type": "Person", "@id": "https://fazrilukman.id/#person", name: "Fazri Lukman Nurrohman", jobTitle: "Creative Web Developer" });
  });

  it("localizes breadcrumb URLs", () => {
    const data = breadcrumbStructuredData("https://fazrilukman.id", "id", [{ name: "Beranda", path: "/" }, { name: "SINDEN", path: "/projects/sinden" }]);
    expect(data.itemListElement[1].item).toBe("https://fazrilukman.id/id/projects/sinden");
  });

  it("uses the localized portfolio detail URL for certificate entities", () => {
    const certificate = { title: "Cloud Basics", issuer: "Example Academy", category: "Cloud", issueDate: "2026-08-13" };
    const english = certificateStructuredData("https://fazrilukman.id", "en", "/certificates/cloud-basics", certificate);
    const indonesian = certificateStructuredData("https://fazrilukman.id", "id", "/certificates/cloud-basics", certificate);
    const englishCredential = english["@graph"][0] as { url: string };
    const indonesianCredential = indonesian["@graph"][0] as { url: string };
    const indonesianBreadcrumb = indonesian["@graph"][1] as { itemListElement: Array<{ name: string; item?: string }> };

    expect(englishCredential.url).toBe("https://fazrilukman.id/certificates/cloud-basics");
    expect(indonesianCredential.url).toBe("https://fazrilukman.id/id/certificates/cloud-basics");
    expect(indonesianCredential.url).not.toContain("/id/id/");
    expect(indonesianBreadcrumb.itemListElement[0].name).toBe("Beranda");
  });
});
