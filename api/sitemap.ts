type ApiResponse = {
  setHeader(name: string, value: string): void;
  status(code: number): ApiResponse;
  send(body: string): void;
};

type ContentRow = { slug?: string; updated_at?: string };

const siteUrl = (process.env.SITE_URL || process.env.VITE_SITE_URL || "https://fazrilukman.id").replace(/\/$/, "");

function entry(path: string, lastModified?: string) {
  const lastmod = lastModified ? `<lastmod>${new Date(lastModified).toISOString()}</lastmod>` : "";
  return `<url><loc>${escapeXml(`${siteUrl}${path}`)}</loc>${lastmod}</url>`;
}

function escapeXml(value: string) { return value.replace(/[<>&'"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[character] || character); }

export default async function handler(_request: unknown, response: ApiResponse) {
  const staticPaths = ["/", "/about", "/projects", "/creative-works", "/certificates", "/blog", "/contact"];
  let articles: ContentRow[] = [];
  let projects: ContentRow[] = [];
  let creativeWorks: ContentRow[] = [];
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const result = await fetch(`${supabaseUrl}/rest/v1/articles?select=slug,updated_at&status=eq.published&order=published_at.desc`, {
        headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
      });
      if (result.ok) articles = await result.json() as ContentRow[];
      const [projectResult, creativeResult] = await Promise.all([
        fetch(`${supabaseUrl}/rest/v1/projects?select=slug,updated_at&status=eq.published&order=updated_at.desc`, { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }),
        fetch(`${supabaseUrl}/rest/v1/creative_works?select=slug,updated_at&status=eq.published&order=updated_at.desc`, { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }),
      ]);
      if (projectResult.ok) projects = await projectResult.json() as ContentRow[];
      if (creativeResult.ok) creativeWorks = await creativeResult.json() as ContentRow[];
    } catch {
      articles = [];
    }
  }

  const urls = [
    ...staticPaths.map((path) => entry(path)),
    ...projects.filter((project) => project.slug).map((project) => entry(`/projects/${encodeURIComponent(project.slug || "")}`, project.updated_at)),
    ...creativeWorks.filter((work) => work.slug).map((work) => entry(`/creative-works/${encodeURIComponent(work.slug || "")}`, work.updated_at)),
    ...articles.filter((article) => article.slug).map((article) => entry(`/blog/${encodeURIComponent(article.slug || "")}`, article.updated_at)),
  ].join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;

  response.setHeader("Content-Type", "application/xml; charset=utf-8");
  response.setHeader("Cache-Control", "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400");
  response.status(200).send(xml);
}
