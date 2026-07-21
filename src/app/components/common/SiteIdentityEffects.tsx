import { useEffect } from "react";
import { usePortfolioData } from "../../hooks/usePortfolioData";

export function SiteIdentityEffects() {
  const { profile, settings } = usePortfolioData();

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

  useEffect(() => {
    let verification = document.head.querySelector<HTMLMetaElement>('meta[name="google-site-verification"]');
    const rawValue = settings.googleSiteVerification.trim();
    const content = rawValue.match(/content=["']([^"']+)["']/i)?.[1] || rawValue;
    if (!content) {
      verification?.remove();
      return;
    }
    if (!verification) {
      verification = document.createElement("meta");
      verification.name = "google-site-verification";
      document.head.appendChild(verification);
    }
    verification.content = content;
  }, [settings.googleSiteVerification]);

  return null;
}
