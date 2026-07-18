import { useEffect } from "react";

interface MetaOptions {
  title: string;
  description: string;
}

export function useDocumentMeta({ title, description }: MetaOptions) {
  useEffect(() => {
    document.title = title;
    const ensure = (selector: string, create: () => HTMLMetaElement) => {
      let element = document.head.querySelector<HTMLMetaElement>(selector);
      if (!element) {
        element = create();
        document.head.appendChild(element);
      }
      return element;
    };
    ensure('meta[name="description"]', () => {
      const meta = document.createElement("meta");
      meta.name = "description";
      return meta;
    }).content = description;
    ensure('meta[property="og:title"]', () => {
      const meta = document.createElement("meta");
      meta.setAttribute("property", "og:title");
      return meta;
    }).content = title;
    ensure('meta[property="og:description"]', () => {
      const meta = document.createElement("meta");
      meta.setAttribute("property", "og:description");
      return meta;
    }).content = description;
  }, [description, title]);
}
