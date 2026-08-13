import { canonicalSeoUrl, seoHreflang, type SeoLanguage } from "../src/app/lib/seoShared.js";
export type { SeoLanguage } from "../src/app/lib/seoShared.js";

export type InitialSeoPage = {
  language: SeoLanguage;
  path: string;
  siteUrl: string;
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
  type?: "website" | "article";
  robots?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  content?: { heading: string; description?: string; body?: string };
};

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] || character);
const absolute = (value: string | undefined, siteUrl: string) => value ? new URL(value, `${siteUrl.replace(/\/$/, "")}/`).toString() : undefined;

export function renderInitialHtml(template: string, page: InitialSeoPage) {
  const siteUrl = page.siteUrl.replace(/\/$/, "");
  const alternates = seoHreflang(siteUrl, page.path);
  const en = alternates.en;
  const id = alternates.id;
  const canonical = canonicalSeoUrl(siteUrl, page.path, page.language);
  const image = absolute(page.image, siteUrl);
  const imageTags = image ? `<meta property="og:image" content="${escapeHtml(image)}"><meta property="og:image:alt" content="${escapeHtml(page.imageAlt || page.title)}"><meta name="twitter:image" content="${escapeHtml(image)}">` : "";
  const jsonLd = page.jsonLd ? `<script id="initial-structured-data" type="application/ld+json">${JSON.stringify(page.jsonLd).replace(/</g, "\\u003c")}</script>` : "";
  const metadata = `<!-- server-seo:start --><title>${escapeHtml(page.title)}</title><meta name="description" content="${escapeHtml(page.description)}"><meta name="robots" content="${escapeHtml(page.robots || "index, follow, max-image-preview:large")}"><link rel="canonical" href="${escapeHtml(canonical)}"><link rel="alternate" hreflang="en" href="${escapeHtml(en)}"><link rel="alternate" hreflang="id" href="${escapeHtml(id)}"><link rel="alternate" hreflang="x-default" href="${escapeHtml(en)}"><meta property="og:type" content="${page.type || "website"}"><meta property="og:title" content="${escapeHtml(page.title)}"><meta property="og:description" content="${escapeHtml(page.description)}"><meta property="og:url" content="${escapeHtml(canonical)}"><meta property="og:locale" content="${page.language === "id" ? "id_ID" : "en_US"}"><meta property="og:locale:alternate" content="${page.language === "id" ? "en_US" : "id_ID"}">${imageTags}<meta name="twitter:card" content="${image ? "summary_large_image" : "summary"}"><meta name="twitter:title" content="${escapeHtml(page.title)}"><meta name="twitter:description" content="${escapeHtml(page.description)}">${jsonLd}<!-- server-seo:end -->`;
  const content = page.content ? `<main data-server-seo-content="true"><h1>${escapeHtml(page.content.heading)}</h1>${page.content.description ? `<p>${escapeHtml(page.content.description)}</p>` : ""}${page.content.body ? `<p>${escapeHtml(page.content.body)}</p>` : ""}</main>` : "";
  return template
    .replace(/<html lang="[^"]*">/, `<html lang="${page.language}">`)
    .replace(/<!-- server-seo:start -->[\s\S]*?<!-- server-seo:end -->/, metadata)
    .replace("<!-- server-content -->", content);
}
