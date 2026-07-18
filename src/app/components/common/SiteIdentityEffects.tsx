import { useEffect } from "react";
import { usePortfolioData } from "../../hooks/usePortfolioData";

export function SiteIdentityEffects() {
  const { profile } = usePortfolioData();

  useEffect(() => {
    const faviconUrl = profile.faviconUrl || profile.logoUrl;
    if (!faviconUrl) return;

    let link = document.head.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = faviconUrl;
  }, [profile.faviconUrl, profile.logoUrl]);

  return null;
}
