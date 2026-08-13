import type { ContentLanguage } from "../types/portfolio";
import { canonicalSeoUrl, localizedSeoPath, seoHreflang } from "./seoShared";

export const DEFAULT_SITE_URL = "https://fazrilukman.id";

export function normalizedSiteUrl(value?: string) {
  const candidate = value?.trim() || import.meta.env.VITE_SITE_URL || DEFAULT_SITE_URL;
  try {
    return new URL(candidate).origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export function localizedPath(path: string, language: ContentLanguage) {
  const cleanPath = `/${path.replace(/^\/+/, "")}`.replace(/\/$/, "") || "/";
  const sourcePath = cleanPath === "/id" ? "/" : cleanPath.replace(/^\/id(?=\/|$)/, "") || "/";
  return localizedSeoPath(sourcePath, language);
}

export function languageFromPath(pathname: string): ContentLanguage {
  return pathname === "/id" || pathname.startsWith("/id/") ? "id" : "en";
}

export function buildCanonicalUrl(path: string, language: ContentLanguage, siteUrl?: string) {
  return canonicalSeoUrl(normalizedSiteUrl(siteUrl), path, language);
}

export function buildHreflang(path: string, siteUrl?: string) {
  return seoHreflang(normalizedSiteUrl(siteUrl), path);
}

export function isPublishedAt(value: string | undefined, now = new Date()) {
  if (!value) return true;
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date <= now;
}
