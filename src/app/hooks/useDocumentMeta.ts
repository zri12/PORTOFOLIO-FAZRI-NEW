import { useEffect } from "react";
import { buildCanonicalUrl, buildHreflang, normalizedSiteUrl } from "../lib/seo";

interface MetaOptions {
  title: string;
  description: string;
  canonicalPath?: string;
  siteUrl?: string;
  image?: string;
  type?: "website" | "article";
  noIndex?: boolean;
  language?: string;
  imageAlt?: string;
  structuredData?: Record<string, unknown> | Record<string, unknown>[];
}

export function useDocumentMeta({ title, description, canonicalPath = "/", siteUrl, image, imageAlt, type = "website", noIndex = false, language = "en", structuredData }: MetaOptions) {
  useEffect(() => {
    const ensureMeta = (selector: string, attribute: "name" | "property", value: string) => {
      let element = document.head.querySelector<HTMLMetaElement>(selector);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, value);
        document.head.appendChild(element);
      }
      return element;
    };
    const ensureLink = (rel: string, hreflang?: string) => {
      const selector = hreflang ? `link[rel="${rel}"][hreflang="${hreflang}"]` : `link[rel="${rel}"]:not([hreflang])`;
      let element = document.head.querySelector<HTMLLinkElement>(selector);
      if (!element) {
        element = document.createElement("link");
        element.rel = rel;
        document.head.appendChild(element);
      }
      return element;
    };

    const locale = language === "id" ? "id" : "en";
    const resolvedSiteUrl = normalizedSiteUrl(siteUrl);
    const canonicalUrl = buildCanonicalUrl(canonicalPath, locale, resolvedSiteUrl);
    const alternates = buildHreflang(canonicalPath, resolvedSiteUrl);
    document.title = title;
    document.documentElement.lang = language || "en";
    ensureMeta('meta[name="description"]', "name", "description").content = description;
    ensureMeta('meta[name="robots"]', "name", "robots").content = noIndex ? "noindex, nofollow" : "index, follow, max-image-preview:large";
    ensureMeta('meta[property="og:title"]', "property", "og:title").content = title;
    ensureMeta('meta[property="og:description"]', "property", "og:description").content = description;
    ensureMeta('meta[property="og:type"]', "property", "og:type").content = type;
    ensureMeta('meta[property="og:url"]', "property", "og:url").content = canonicalUrl;
    ensureMeta('meta[property="og:locale"]', "property", "og:locale").content = locale === "id" ? "id_ID" : "en_US";
    ensureMeta('meta[property="og:locale:alternate"]', "property", "og:locale:alternate").content = locale === "id" ? "en_US" : "id_ID";
    ensureMeta('meta[name="twitter:card"]', "name", "twitter:card").content = image ? "summary_large_image" : "summary";
    ensureMeta('meta[name="twitter:title"]', "name", "twitter:title").content = title;
    ensureMeta('meta[name="twitter:description"]', "name", "twitter:description").content = description;
    ensureLink("canonical").href = canonicalUrl;
    ensureLink("alternate", "en").href = alternates.en;
    ensureLink("alternate", "id").href = alternates.id;
    ensureLink("alternate", "x-default").href = alternates.xDefault;

    if (image) {
      const absoluteImage = new URL(image, siteUrl || window.location.origin).toString();
      ensureMeta('meta[property="og:image"]', "property", "og:image").content = absoluteImage;
      ensureMeta('meta[property="og:image:alt"]', "property", "og:image:alt").content = imageAlt || title;
      ensureMeta('meta[name="twitter:image"]', "name", "twitter:image").content = absoluteImage;
    } else {
      document.head.querySelector('meta[property="og:image"]')?.remove();
      document.head.querySelector('meta[property="og:image:alt"]')?.remove();
      document.head.querySelector('meta[name="twitter:image"]')?.remove();
    }

    const schemaId = "page-structured-data";
    document.getElementById("initial-structured-data")?.remove();
    document.getElementById(schemaId)?.remove();
    if (structuredData) {
      const script = document.createElement("script");
      script.id = schemaId;
      script.type = "application/ld+json";
      script.text = JSON.stringify(structuredData).replace(/</g, "\\u003c");
      document.head.appendChild(script);
    }
  }, [canonicalPath, description, image, imageAlt, language, noIndex, siteUrl, structuredData, title, type]);
}
