type ApiResponse = { setHeader(name: string, value: string): void; status(code: number): ApiResponse; send(body: string): void };
type ContentRow = { slug?: string; updated_at?: string; published_at?: string };
type SitemapEnvironment = Record<string, string | undefined>;

export function resolveSitemapEnvironment(environment: SitemapEnvironment = process.env) {
  return {
    siteUrl: (environment.SITE_URL || environment.VITE_SITE_URL || "https://fazrilukman.id").replace(/\/$/, ""),
    supabaseUrl: environment.SUPABASE_URL || environment.VITE_SUPABASE_URL,
    publishableKey: environment.SUPABASE_PUBLISHABLE_KEY || environment.VITE_SUPABASE_PUBLISHABLE_KEY,
  };
}

const headers = (publishableKey: string) => ({ apikey: publishableKey, Authorization: `Bearer ${publishableKey}` });
const escapeXml = (value: string) => value.replace(/[<>&'"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[character] || character);
const isPublicDate = (value?: string) => !value || (!Number.isNaN(new Date(value).getTime()) && new Date(value) <= new Date());

function entry(siteUrl: string, path: string, lastModified?: string) {
  const lastmod = lastModified && !Number.isNaN(new Date(lastModified).getTime()) ? `<lastmod>${new Date(lastModified).toISOString()}</lastmod>` : "";
  const en = `${siteUrl}${path}`;
  const id = `${siteUrl}${path === "/" ? "/id" : `/id${path}`}`;
  return `<url><loc>${escapeXml(en)}</loc><xhtml:link rel="alternate" hreflang="en" href="${escapeXml(en)}"/><xhtml:link rel="alternate" hreflang="id" href="${escapeXml(id)}"/><xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(en)}"/>${lastmod}</url><url><loc>${escapeXml(id)}</loc><xhtml:link rel="alternate" hreflang="en" href="${escapeXml(en)}"/><xhtml:link rel="alternate" hreflang="id" href="${escapeXml(id)}"/><xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(en)}"/>${lastmod}</url>`;
}

export default async function handler(_request: unknown, response: ApiResponse) {
  const staticPaths = ["/", "/about", "/projects", "/creative-works", "/certificates", "/blog", "/contact"];
  let articles: ContentRow[] = []; let projects: ContentRow[] = []; let creativeWorks: ContentRow[] = []; let certificates: ContentRow[] = [];
  const { siteUrl, supabaseUrl, publishableKey } = resolveSitemapEnvironment();
  if (supabaseUrl && publishableKey) {
    try {
      const [articleResult, projectResult, creativeResult, certificateResult] = await Promise.all([
        fetch(`${supabaseUrl}/rest/v1/articles?select=slug,updated_at,published_at&status=eq.published`, { headers: headers(publishableKey) }),
        fetch(`${supabaseUrl}/rest/v1/projects?select=slug,updated_at&status=eq.published`, { headers: headers(publishableKey) }),
        fetch(`${supabaseUrl}/rest/v1/creative_works?select=slug,updated_at&status=eq.published`, { headers: headers(publishableKey) }),
        fetch(`${supabaseUrl}/rest/v1/certificates?select=slug,updated_at&published=eq.true`, { headers: headers(publishableKey) }),
      ]);
      if (articleResult.ok) articles = await articleResult.json() as ContentRow[];
      if (projectResult.ok) projects = await projectResult.json() as ContentRow[];
      if (creativeResult.ok) creativeWorks = await creativeResult.json() as ContentRow[];
      if (certificateResult.ok) certificates = await certificateResult.json() as ContentRow[];
    } catch { /* serve a valid static-only sitemap during temporary upstream failure */ }
  }
  const detailEntries = (rows: ContentRow[], prefix: string) => rows
    .filter((row) => typeof row.slug === "string" && row.slug.trim() && isPublicDate(row.published_at))
    .map((row) => entry(siteUrl, `${prefix}/${encodeURIComponent(row.slug!.trim())}`, row.updated_at));
  const urls = [...staticPaths.map((path) => entry(siteUrl, path)), ...detailEntries(projects, "/projects"), ...detailEntries(creativeWorks, "/creative-works"), ...detailEntries(certificates, "/certificates"), ...detailEntries(articles, "/blog")].join("");
  response.setHeader("Content-Type", "application/xml; charset=utf-8");
  response.setHeader("Cache-Control", "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400");
  response.status(200).send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls}</urlset>`);
}
