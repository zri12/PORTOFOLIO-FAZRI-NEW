import { useEffect } from "react";

interface MetaOptions {
  title: string;
  description: string;
  canonicalPath?: string;
  siteUrl?: string;
  image?: string;
  type?: "website" | "article";
  noIndex?: boolean;
  language?: string;
  structuredData?: Record<string, unknown> | Record<string, unknown>[];
}

export function useDocumentMeta({ title, description, canonicalPath, siteUrl, image, type = "website", noIndex = false, language, structuredData }: MetaOptions) {
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
    const ensureLink = (rel: string) => {
      let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement("link");
        element.rel = rel;
        document.head.appendChild(element);
      }
      return element;
    };

    const canonicalUrl = canonicalPath ? new URL(canonicalPath, siteUrl || window.location.origin).toString() : window.location.href.split("#")[0];
    document.title = title;
    document.documentElement.lang = language || "en";
    ensureMeta('meta[name="description"]', "name", "description").content = description;
    ensureMeta('meta[name="robots"]', "name", "robots").content = noIndex ? "noindex, nofollow" : "index, follow, max-image-preview:large";
    ensureMeta('meta[property="og:title"]', "property", "og:title").content = title;
    ensureMeta('meta[property="og:description"]', "property", "og:description").content = description;
    ensureMeta('meta[property="og:type"]', "property", "og:type").content = type;
    ensureMeta('meta[property="og:url"]', "property", "og:url").content = canonicalUrl;
    ensureMeta('meta[name="twitter:card"]', "name", "twitter:card").content = image ? "summary_large_image" : "summary";
    ensureMeta('meta[name="twitter:title"]', "name", "twitter:title").content = title;
    ensureMeta('meta[name="twitter:description"]', "name", "twitter:description").content = description;
    ensureLink("canonical").href = canonicalUrl;

    if (image) {
      const absoluteImage = new URL(image, siteUrl || window.location.origin).toString();
      ensureMeta('meta[property="og:image"]', "property", "og:image").content = absoluteImage;
      ensureMeta('meta[name="twitter:image"]', "name", "twitter:image").content = absoluteImage;
    } else {
      document.head.querySelector('meta[property="og:image"]')?.remove();
      document.head.querySelector('meta[name="twitter:image"]')?.remove();
    }

    const schemaId = "page-structured-data";
    document.getElementById(schemaId)?.remove();
    if (structuredData) {
      const script = document.createElement("script");
      script.id = schemaId;
      script.type = "application/ld+json";
      script.text = JSON.stringify(structuredData).replace(/</g, "\\u003c");
      document.head.appendChild(script);
    }
  }, [canonicalPath, description, image, language, noIndex, siteUrl, structuredData, title, type]);
}
