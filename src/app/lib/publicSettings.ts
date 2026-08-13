import type { SiteSettings } from "../types/portfolio";

export function isPublicFeatureEnabled(settings: SiteSettings, feature: "contact" | "comments") {
  return feature === "contact" ? settings.contactEnabled : settings.commentsEnabled;
}

export function shouldLoadThree(settings: SiteSettings, isSpiderMode: boolean, sceneReady: boolean, compactViewport: boolean) {
  return settings.threeEnabled && isSpiderMode && sceneReady && !compactViewport;
}
