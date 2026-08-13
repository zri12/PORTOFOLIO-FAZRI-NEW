export type SeoLanguage = "en" | "id";

export function localizedSeoPath(path: string, language: SeoLanguage) {
  const normalized = path === "/" ? "/" : `/${path.replace(/^\/+|\/+$/g, "")}`;
  return language === "id" ? normalized === "/" ? "/id" : `/id${normalized}` : normalized;
}

export function canonicalSeoUrl(siteUrl: string, path: string, language: SeoLanguage) {
  return new URL(localizedSeoPath(path, language), `${siteUrl.replace(/\/$/, "")}/`).toString();
}

export function seoHreflang(siteUrl: string, path: string) {
  return { en: canonicalSeoUrl(siteUrl, path, "en"), id: canonicalSeoUrl(siteUrl, path, "id"), xDefault: canonicalSeoUrl(siteUrl, path, "en") };
}
