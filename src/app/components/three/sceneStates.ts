export type PublicSceneRoute =
  | "home"
  | "about"
  | "projects"
  | "project-detail"
  | "creative"
  | "creative-detail"
  | "certificates"
  | "contact"
  | "not-found";

export interface SceneStateConfig {
  intensity: number;
  cameraX: number;
  cameraY: number;
  panelSpread: number;
  depth: number;
}

export function getPublicSceneRoute(pathname: string): PublicSceneRoute {
  if (pathname === "/") return "home";
  if (pathname === "/about") return "about";
  if (pathname === "/projects") return "projects";
  if (pathname.startsWith("/projects/")) return "project-detail";
  if (pathname === "/creative-works") return "creative";
  if (pathname.startsWith("/creative-works/")) return "creative-detail";
  if (pathname === "/certificates") return "certificates";
  if (pathname === "/contact") return "contact";
  return "not-found";
}

export const sceneStates: Record<PublicSceneRoute, SceneStateConfig> = {
  home: { intensity: 1, cameraX: 0.25, cameraY: -0.05, panelSpread: 1, depth: 0 },
  about: { intensity: 0.54, cameraX: -0.25, cameraY: 0.05, panelSpread: 0.82, depth: -0.25 },
  projects: { intensity: 0.62, cameraX: 0.34, cameraY: 0.08, panelSpread: 1.15, depth: -0.15 },
  "project-detail": { intensity: 0.68, cameraX: 0.12, cameraY: 0.16, panelSpread: 0.95, depth: 0.1 },
  creative: { intensity: 0.52, cameraX: -0.36, cameraY: -0.02, panelSpread: 1.28, depth: -0.1 },
  "creative-detail": { intensity: 0.46, cameraX: -0.18, cameraY: 0.14, panelSpread: 1.05, depth: 0.05 },
  certificates: { intensity: 0.42, cameraX: 0.22, cameraY: 0.22, panelSpread: 0.72, depth: -0.4 },
  contact: { intensity: 0.58, cameraX: 0, cameraY: -0.18, panelSpread: 0.66, depth: 0.15 },
  "not-found": { intensity: 0.38, cameraX: 0, cameraY: 0, panelSpread: 1.4, depth: -0.7 },
};
