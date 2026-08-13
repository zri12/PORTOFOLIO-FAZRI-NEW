import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

type Rewrite = { source: string; destination: string };
type Header = { source: string; headers: Array<{ key: string; value: string }> };
const config = JSON.parse(readFileSync("vercel.json", "utf8")) as { rewrites: Rewrite[]; headers: Header[] };

describe("Vercel public SEO routing", () => {
  it("keeps admin routes in the React SPA before the public renderer catch-all", () => {
    const admin = config.rewrites.findIndex((item) => item.source === "/admin");
    const nestedAdmin = config.rewrites.findIndex((item) => item.source === "/admin/(.*)");
    const renderer = config.rewrites.findIndex((item) => item.destination.startsWith("/api/render?path=/$1"));
    expect(config.rewrites[admin]).toEqual({ source: "/admin", destination: "/index.html" });
    expect(config.rewrites[nestedAdmin]).toEqual({ source: "/admin/(.*)", destination: "/index.html" });
    expect(admin).toBeLessThan(renderer);
    expect(nestedAdmin).toBeLessThan(renderer);
  });

  it("routes public paths to the renderer while preserving sitemap and actual static paths", () => {
    const renderer = config.rewrites.find((item) => item.destination.startsWith("/api/render?path=/$1"));
    expect(renderer?.source).toContain("admin(?:/|$)");
    expect(renderer?.source).toContain("api/");
    expect(renderer?.source).toContain("assets/");
    expect(renderer?.source).toContain("robots.txt$");
    expect(renderer?.source).toContain("sitemap.xml$");
    const publicMatcher = new RegExp(`^${renderer?.source || ""}$`);
    expect(publicMatcher.test("/projects/sinden")).toBe(true);
    expect(publicMatcher.test("/id/projects/sinden")).toBe(true);
    expect(publicMatcher.test("/admin")).toBe(false);
    expect(publicMatcher.test("/admin/login")).toBe(false);
    expect(publicMatcher.test("/assets/index.js")).toBe(false);
    expect(config.rewrites).toContainEqual({ source: "/sitemap.xml", destination: "/api/sitemap" });
  });

  it("keeps admin noindex headers and a valid fallback SEO title", () => {
    expect(config.headers).toEqual(expect.arrayContaining([
      expect.objectContaining({ source: "/admin", headers: expect.arrayContaining([expect.objectContaining({ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" })]) }),
      expect.objectContaining({ source: "/admin/(.*)", headers: expect.arrayContaining([expect.objectContaining({ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" })]) }),
    ]));
    const renderer = readFileSync("api/render.ts", "utf8");
    expect(renderer).toContain("${profile.fullName} — ${profile.title}");
    expect(renderer).not.toContain("â€”");
  });
});
