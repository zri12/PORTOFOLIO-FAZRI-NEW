import { afterEach, describe, expect, it, vi } from "vitest";
import { renderInitialHtml } from "./seoRenderer";
import { resolveInitialSeoPage } from "./render";

const profile = { full_name: "Fazri Lukman Nurrohman", display_name: "Fazri", title: "Creative Web Developer", description: "Portfolio description", headline: "Build useful products", translations: { id: { title: "Pengembang Web Kreatif", description: "Deskripsi portofolio", headline: "Membangun produk berguna" } } };
const settings = { site_url: "https://fazrilukman.id", website_name: "Fazri Portfolio", seo_title: "", seo_description: "", seo_image_path: "", translations: {} };

function mockSupabase(rows: Record<string, unknown[]>) {
  vi.stubGlobal("fetch", vi.fn(async (input: string) => {
    const table = input.match(/\/rest\/v1\/([^?]+)/)?.[1] || "";
    return new Response(JSON.stringify(rows[table] || []), { status: 200 });
  }));
}

describe("Vercel initial HTML route data", () => {
  afterEach(() => { vi.unstubAllGlobals(); delete process.env.SUPABASE_URL; delete process.env.SUPABASE_PUBLISHABLE_KEY; });

  it("returns localized project metadata and HTML before React runs", async () => {
    process.env.SUPABASE_URL = "https://project.supabase.co"; process.env.SUPABASE_PUBLISHABLE_KEY = "safe-public-key";
    mockSupabase({ site_profiles: [profile], site_settings: [settings], projects: [{ slug: "sinden", title: "SINDEN", short_description: "English description", status: "published", translations: { id: { shortDescription: "Deskripsi Indonesia" } } }] });
    const resolved = await resolveInitialSeoPage("/id/projects/sinden");
    const html = renderInitialHtml('<html lang="en"><head><!-- server-seo:start --><!-- server-seo:end --></head><body><!-- server-content --></body></html>', resolved.page);
    expect(resolved.status).toBe(200); expect(html).toContain('<html lang="id">'); expect(html).toContain("Deskripsi Indonesia"); expect(html).toContain("https://fazrilukman.id/id/projects/sinden");
  });

  it("returns 404/noindex for missing, unpublished, and future content", async () => {
    process.env.SUPABASE_URL = "https://project.supabase.co"; process.env.SUPABASE_PUBLISHABLE_KEY = "safe-public-key";
    mockSupabase({ site_profiles: [profile], site_settings: [settings], articles: [{ slug: "future", title: "Future", status: "published", published_at: "2999-01-01T00:00:00Z" }] });
    const resolved = await resolveInitialSeoPage("/blog/future");
    expect(resolved.status).toBe(404); expect(resolved.page.robots).toBe("noindex, nofollow");
  });

  it("emits entity-specific JSON-LD types for article, certificate, and creative work", async () => {
    process.env.SUPABASE_URL = "https://project.supabase.co"; process.env.SUPABASE_PUBLISHABLE_KEY = "safe-public-key";
    for (const [path, table, row, expected] of [["/blog/post", "articles", { slug: "post", title: "Post", status: "published", published_at: "2026-01-01T00:00:00Z" }, "BlogPosting"], ["/certificates/cert", "certificates", { slug: "cert", title: "Cert", published: true }, "EducationalOccupationalCredential"], ["/creative-works/work", "creative_works", { slug: "work", title: "Work", status: "published" }, "CreativeWork"]] as const) {
      mockSupabase({ site_profiles: [profile], site_settings: [settings], [table]: [row] });
      const resolved = await resolveInitialSeoPage(path);
      expect(JSON.stringify(resolved.page.jsonLd)).toContain(expected);
    }
  });
});
