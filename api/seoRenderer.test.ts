import { describe, expect, it } from "vitest";
import { renderInitialHtml } from "./seoRenderer";

const template = '<!doctype html><html lang="en"><head><!-- server-seo:start --><!-- server-seo:end --></head><body><div id="root"><!-- server-content --></div></body></html>';

describe("server initial SEO HTML", () => {
  it("renders localized initial metadata, links, JSON-LD, and content before hydration", () => {
    const html = renderInitialHtml(template, { language: "id", path: "/projects/sinden", siteUrl: "https://fazrilukman.id", title: "SINDEN — Fazri", description: "Deskripsi Indonesia", jsonLd: { "@context": "https://schema.org", "@type": "CreativeWork", name: "SINDEN" }, content: { heading: "SINDEN", description: "Deskripsi Indonesia" } });
    expect(html).toContain('<html lang="id">');
    expect(html).toContain('<title>SINDEN — Fazri</title>');
    expect(html).toContain('https://fazrilukman.id/id/projects/sinden');
    expect(html).toContain('hreflang="x-default" href="https://fazrilukman.id/projects/sinden"');
    expect(html).toContain('"@type":"CreativeWork"');
    expect(html).toContain('data-server-seo-content="true"');
  });

  it("escapes CMS content before it enters initial HTML", () => {
    const html = renderInitialHtml(template, { language: "en", path: "/", siteUrl: "https://fazrilukman.id", title: "<unsafe>", description: "Safe" });
    expect(html).toContain("&lt;unsafe&gt;");
    expect(html).not.toContain("<title><unsafe>");
  });
});
