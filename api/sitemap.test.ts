import { afterEach, describe, expect, it, vi } from "vitest";
import sitemap, { resolveSitemapEnvironment } from "./sitemap";

type CapturedResponse = { body: string; headers: Record<string, string>; statusCode: number };
type MockResponse = { setHeader(name: string, value: string): void; status(code: number): MockResponse; send(body: string): void };

function response(): [CapturedResponse, MockResponse] {
  const captured: CapturedResponse = { body: "", headers: {}, statusCode: 0 };
  const apiResponse: MockResponse = {
    setHeader(name, value) { captured.headers[name] = value; },
    status(code) { captured.statusCode = code; return apiResponse; },
    send(body) { captured.body = body; },
  };
  return [captured, apiResponse];
}

describe("production sitemap", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_PUBLISHABLE_KEY;
    delete process.env.VITE_SUPABASE_URL;
    delete process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  });

  it("uses server Supabase environment variables and includes only public localized content", async () => {
    process.env.SUPABASE_URL = "https://project.supabase.co";
    process.env.SUPABASE_PUBLISHABLE_KEY = "server-public-key";
    const requests: Array<{ input: string; headers: HeadersInit | undefined }> = [];
    vi.stubGlobal("fetch", vi.fn(async (input: string, init?: RequestInit) => {
      requests.push({ input, headers: init?.headers });
      const table = input.match(/\/rest\/v1\/([^?]+)/)?.[1];
      const rows = table === "projects" ? [{ slug: "sinden", updated_at: "2026-08-01T00:00:00Z" }]
        : table === "creative_works" ? [{ slug: "visual-study" }]
          : table === "certificates" ? [{ slug: "cloud-basics" }]
            : table === "articles" ? [{ slug: "current-article", published_at: "2026-08-01T00:00:00Z" }, { slug: "future-article", published_at: "2999-01-01T00:00:00Z" }]
              : [];
      return new Response(JSON.stringify(rows), { status: 200 });
    }));
    const [captured, apiResponse] = response();

    await sitemap({}, apiResponse);

    expect(captured.statusCode).toBe(200);
    expect(requests).toHaveLength(4);
    expect(requests.every((request) => request.input.startsWith("https://project.supabase.co/rest/v1/"))).toBe(true);
    expect(requests.every((request) => (request.headers as Record<string, string>).apikey === "server-public-key" && (request.headers as Record<string, string>).Authorization === "Bearer server-public-key")).toBe(true);
    expect(captured.body).toContain("https://fazrilukman.id/projects/sinden");
    expect(captured.body).toContain("https://fazrilukman.id/id/projects/sinden");
    expect(captured.body).toContain("https://fazrilukman.id/creative-works/visual-study");
    expect(captured.body).toContain("https://fazrilukman.id/certificates/cloud-basics");
    expect(captured.body).toContain("https://fazrilukman.id/blog/current-article");
    expect(captured.body).not.toContain("future-article");
    expect(captured.body).not.toContain("/admin");
    expect(captured.body).toContain('hreflang="en" href="https://fazrilukman.id/projects/sinden"');
    expect(captured.body).toContain('hreflang="id" href="https://fazrilukman.id/id/projects/sinden"');
    expect(captured.body).toContain('hreflang="x-default" href="https://fazrilukman.id/projects/sinden"');
  });

  it("retains VITE fallbacks and the production canonical domain fallback", () => {
    expect(resolveSitemapEnvironment({ VITE_SUPABASE_URL: "https://vite.supabase.co", VITE_SUPABASE_PUBLISHABLE_KEY: "vite-public-key" })).toEqual({
      siteUrl: "https://fazrilukman.id",
      supabaseUrl: "https://vite.supabase.co",
      publishableKey: "vite-public-key",
    });
  });
});
