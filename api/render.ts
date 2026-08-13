import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { renderInitialHtml, type InitialSeoPage, type SeoLanguage } from "./seoRenderer.js";

type ApiRequest = { url?: string; headers?: Record<string, string | string[] | undefined> };
type ApiResponse = { setHeader(name: string, value: string): void; status(code: number): ApiResponse; send(body: string): void };
type Row = Record<string, unknown>;

const fallbackProfile = { fullName: "Fazri Lukman Nurrohman", displayName: "Fazri", title: "Creative Web Developer", description: "Portfolio of Fazri Lukman Nurrohman, a Creative Web Developer focused on modern web applications and visual digital experiences.", headline: "Creative web development and visual digital experiences.", biography: "", aboutContent: "", aboutImageUrl: "", github: "", linkedin: "", instagram: "" };
const fallbackSettings = { siteUrl: "https://fazrilukman.id", websiteName: "Fazri Portfolio", seoTitle: "", seoDescription: "", seoImage: "" };

function string(value: unknown, fallback = "") { return typeof value === "string" ? value : fallback; }
function record(value: unknown): Row { return value && typeof value === "object" && !Array.isArray(value) ? value as Row : {}; }
function translations(value: unknown, language: SeoLanguage) { const all = record(value); const chosen = record(all[language]); const alternate = record(all[language === "en" ? "id" : "en"]); return Object.keys(chosen).some((key) => Boolean(string(chosen[key]).trim()) || (Array.isArray(chosen[key]) && chosen[key].length)) ? chosen : alternate; }
function localize(row: Row, language: SeoLanguage, fields: Record<string, string>) { const translated = translations(row.translations, language); return Object.fromEntries(Object.entries(fields).map(([key, column]) => [key, string(translated[key], string(row[column]))])); }
function pathLanguage(pathname: string): { language: SeoLanguage; route: string } { const language = pathname === "/id" || pathname.startsWith("/id/") ? "id" : "en"; const route = language === "id" ? (pathname.slice(3) || "/") : pathname; return { language, route: route.replace(/\/+$/, "") || "/" }; }
function assetUrl(path: string, supabaseUrl: string) { if (!path) return ""; if (/^https?:\/\//i.test(path)) return path; return `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/${encodeURIComponent(process.env.SUPABASE_PUBLIC_BUCKET || "portfolio-public")}/${path.split("/").map(encodeURIComponent).join("/")}`; }
function isPublicDate(value: string) { return !value || (!Number.isNaN(new Date(value).getTime()) && new Date(value) <= new Date()); }
function escapeQuery(value: string) { return encodeURIComponent(value); }

async function fetchRows(path: string): Promise<Row[]> {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !key) throw new Error("Public Supabase server configuration is missing.");
  const result = await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/${path}`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
  if (!result.ok) throw new Error(`Public Supabase query failed: ${result.status}`);
  return await result.json() as Row[];
}

async function template() { return readFile(join(process.cwd(), "dist", "index.html"), "utf8"); }

function profileFrom(row: Row, language: SeoLanguage, supabaseUrl: string) {
  const value = localize(row, language, { title: "title", description: "description", headline: "headline", biography: "biography", aboutContent: "about_content" });
  return { ...fallbackProfile, ...value, fullName: string(row.full_name, fallbackProfile.fullName), displayName: string(row.display_name, fallbackProfile.displayName), aboutImageUrl: assetUrl(string(row.profile_image_path), supabaseUrl), github: string(row.github_url), linkedin: string(row.linkedin_url), instagram: string(row.instagram_url) };
}
function settingsFrom(row: Row, language: SeoLanguage, supabaseUrl: string) {
  const value = localize(row, language, { websiteName: "website_name", seoTitle: "seo_title", seoDescription: "seo_description", description: "description" });
  return { ...fallbackSettings, ...value, siteUrl: string(row.site_url, fallbackSettings.siteUrl), seoImage: assetUrl(string(row.seo_image_path), supabaseUrl) };
}
function person(siteUrl: string, profile: ReturnType<typeof profileFrom>) { return { "@type": "Person", "@id": `${siteUrl}/#person`, name: profile.fullName, url: siteUrl, jobTitle: profile.title, description: profile.description, image: profile.aboutImageUrl || undefined, sameAs: [profile.github, profile.linkedin, profile.instagram].filter(Boolean) }; }
function crumb(siteUrl: string, language: SeoLanguage, entries: Array<{ name: string; path?: string }>) { return { "@type": "BreadcrumbList", itemListElement: entries.map((entry, index) => ({ "@type": "ListItem", position: index + 1, name: entry.name, item: entry.path ? `${siteUrl}${language === "id" ? entry.path === "/" ? "/id" : `/id${entry.path}` : entry.path}` : undefined })) }; }
function page(base: Omit<InitialSeoPage, "jsonLd" | "content"> & Pick<InitialSeoPage, "jsonLd" | "content">) { return base; }

export async function resolveInitialSeoPage(pathname: string): Promise<{ status: number; page: InitialSeoPage }> {
  const { language, route } = pathLanguage(pathname);
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const [profileRows, settingsRows] = await Promise.all([fetchRows("site_profiles?select=*&singleton_key=eq.main&limit=1"), fetchRows("site_settings?select=*&singleton_key=eq.main&limit=1")]);
  const profile = profileFrom(profileRows[0] || {}, language, supabaseUrl);
  const settings = settingsFrom(settingsRows[0] || {}, language, supabaseUrl);
  const siteUrl = settings.siteUrl.replace(/\/$/, "");
  const homeTitle = settings.seoTitle || `${profile.fullName} — ${profile.title}`;
  const homeDescription = settings.seoDescription || profile.description || profile.headline;
  const labels = language === "id" ? { home: "Beranda", about: "Tentang", projects: "Proyek", creative: "Karya Kreatif", certificates: "Sertifikat", blog: "Blog", contact: "Kontak" } : { home: "Home", about: "About", projects: "Projects", creative: "Creative Works", certificates: "Certificates", blog: "Blog", contact: "Contact" };
  const base = { language, siteUrl, image: settings.seoImage || profile.aboutImageUrl, imageAlt: profile.fullName };
  if (route === "/") return { status: 200, page: page({ ...base, path: "/", title: homeTitle, description: homeDescription, content: { heading: profile.fullName, description: profile.headline, body: profile.description }, jsonLd: { "@context": "https://schema.org", "@graph": [{ "@type": "WebSite", "@id": `${siteUrl}/#website`, url: siteUrl, name: settings.websiteName, description: homeDescription }, person(siteUrl, profile), { "@type": "WebPage", url: siteUrl, name: homeTitle, about: { "@id": `${siteUrl}/#person` } }] } }) };
  if (route === "/about") return { status: 200, page: page({ ...base, path: route, title: `${labels.about} | ${profile.fullName}`, description: profile.description, content: { heading: `${labels.about} ${profile.fullName}`, description: profile.headline, body: profile.biography || profile.aboutContent }, jsonLd: { "@context": "https://schema.org", "@graph": [{ "@type": "ProfilePage", name: `${labels.about} ${profile.fullName}`, mainEntity: { "@id": `${siteUrl}/#person` } }, person(siteUrl, profile), crumb(siteUrl, language, [{ name: labels.home, path: "/" }, { name: labels.about }]) ] } }) };
  if (route === "/contact") return { status: 200, page: page({ ...base, path: route, title: `${labels.contact} | ${profile.fullName}`, description: profile.description, content: { heading: labels.contact, description: profile.headline }, jsonLd: { "@context": "https://schema.org", "@graph": [{ "@type": "ContactPage", name: labels.contact }, crumb(siteUrl, language, [{ name: labels.home, path: "/" }, { name: labels.contact }]) ] } }) };

  const dynamic = route.match(/^\/(projects|creative-works|certificates|blog)\/([^/]+)$/);
  const archives: Record<string, { table: string; label: string; filter: string }> = { "/projects": { table: "projects", label: labels.projects, filter: "status=eq.published" }, "/creative-works": { table: "creative_works", label: labels.creative, filter: "status=eq.published" }, "/certificates": { table: "certificates", label: labels.certificates, filter: "published=eq.true" }, "/blog": { table: "articles", label: labels.blog, filter: "status=eq.published" } };
  if (archives[route]) {
    const archive = archives[route]; const rows = (await fetchRows(`${archive.table}?select=*&${archive.filter}`)).filter((row) => archive.table !== "articles" || isPublicDate(string(row.published_at)));
    const items = rows.map((row, index) => ({ "@type": "ListItem", position: index + 1, name: string(translations(row.translations, language).title, string(row.title)), url: `${siteUrl}${language === "id" ? `/id${route}/${string(row.slug)}` : `${route}/${string(row.slug)}`}` }));
    return { status: 200, page: page({ ...base, path: route, title: `${archive.label} | ${profile.fullName}`, description: homeDescription, content: { heading: archive.label, description: homeDescription }, jsonLd: { "@context": "https://schema.org", "@type": route === "/blog" ? "Blog" : "CollectionPage", name: archive.label, mainEntity: { "@type": "ItemList", itemListElement: items } } }) };
  }
  if (dynamic) {
    const [, kind, slug] = dynamic; const table = kind === "projects" ? "projects" : kind === "creative-works" ? "creative_works" : kind === "certificates" ? "certificates" : "articles";
    const filter = table === "certificates" ? "published=eq.true" : "status=eq.published";
    const rows = await fetchRows(`${table}?select=*&slug=eq.${escapeQuery(slug)}&${filter}&limit=1`);
    const row = rows[0];
    if (!row || (table === "articles" && !isPublicDate(string(row.published_at)))) return { status: 404, page: page({ ...base, path: route, title: "Page not found", description: "The requested page is unavailable.", robots: "noindex, nofollow", content: { heading: "Page not found", description: "The requested content is unavailable." } }) };
    const translated = translations(row.translations, language); const title = string(translated.title, string(row.title)); const description = string(translated.seoDescription, string(row.seo_description, string(translated.shortDescription, string(row.short_description, string(translated.description, string(row.description, string(translated.excerpt, string(row.excerpt))))))));
    const imagePath = string(row.hero_path) || string(row.cover_path) || string(row.cover_image_path) || string(row.image_path); const image = assetUrl(imagePath, supabaseUrl) || base.image;
    const kindLabel = kind === "projects" ? labels.projects : kind === "creative-works" ? labels.creative : kind === "certificates" ? labels.certificates : labels.blog;
    const schemaType = kind === "projects" || kind === "creative-works" ? "CreativeWork" : kind === "certificates" ? "EducationalOccupationalCredential" : "BlogPosting";
    const entity: Record<string, unknown> = { "@type": schemaType, "@id": `${siteUrl}${language === "id" ? `/id${route}` : route}#entity`, name: title, headline: kind === "blog" ? title : undefined, description, image: image || undefined, url: `${siteUrl}${language === "id" ? `/id${route}` : route}` };
    if (kind === "blog") Object.assign(entity, { datePublished: string(row.published_at) || undefined, dateModified: string(row.updated_at) || string(row.published_at) || undefined, author: { "@id": `${siteUrl}/#person`, name: profile.fullName }, mainEntityOfPage: `${siteUrl}${language === "id" ? `/id${route}` : route}` });
    if (kind === "certificates") Object.assign(entity, { recognizedBy: string(translated.issuer, string(row.issuer)) ? { "@type": "Organization", name: string(translated.issuer, string(row.issuer)) } : undefined, dateCreated: string(row.issue_date) || undefined, credentialCategory: string(row.category) || undefined, identifier: string(row.credential_id) || undefined });
    return { status: 200, page: page({ ...base, path: route, title: `${title} | ${profile.fullName}`, description: description || homeDescription, image, imageAlt: string(translated.coverAlt, title), type: kind === "blog" ? "article" : "website", content: { heading: title, description: description || homeDescription, body: kind === "blog" ? string(translated.excerpt, string(row.excerpt)) : "" }, jsonLd: { "@context": "https://schema.org", "@graph": [entity, crumb(siteUrl, language, [{ name: labels.home, path: "/" }, { name: kindLabel, path: `/${kind}` }, { name: title }])] } }) };
  }
  return { status: 404, page: page({ ...base, path: route, title: "Page not found", description: "The requested page is unavailable.", robots: "noindex, nofollow", content: { heading: "Page not found", description: "The requested page is unavailable." } }) };
}

export default async function handler(request: ApiRequest, response: ApiResponse) {
  const requested = new URL(request.url || "https://fazrilukman.id/", "https://fazrilukman.id");
  const pathname = requested.searchParams.get("path") || requested.pathname;
  try {
    const [html, resolved] = await Promise.all([template(), resolveInitialSeoPage(pathname)]);
    response.setHeader("Content-Type", "text/html; charset=utf-8");
    response.setHeader("Vary", "Accept-Encoding");
    response.setHeader("Cache-Control", resolved.status === 200 ? "public, s-maxage=300, stale-while-revalidate=600" : "no-store");
    response.status(resolved.status).send(renderInitialHtml(html, resolved.page));
  } catch {
    response.setHeader("Content-Type", "text/html; charset=utf-8");
    response.setHeader("Cache-Control", "no-store");
    response.status(503).send(renderInitialHtml(await template(), { language: pathLanguage(pathname).language, path: pathLanguage(pathname).route, siteUrl: fallbackSettings.siteUrl, title: "Portfolio temporarily unavailable", description: "Please try again shortly.", robots: "noindex, nofollow", content: { heading: "Temporarily unavailable", description: "Please try again shortly." } }));
  }
}
