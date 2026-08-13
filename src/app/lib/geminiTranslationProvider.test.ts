import { describe, expect, it, vi } from "vitest";
import {
  buildGeminiRequest,
  buildTranslationPrompt,
  parseGeminiResponse,
  translatePayload,
} from "../../../supabase/functions/_shared/translationProvider.ts";

const env = { get: (name: string) => ({ TRANSLATION_PROVIDER: "gemini", TRANSLATION_API_KEY: "test-key", TRANSLATION_MODEL: "gemini-3.5-flash-lite" })[name] };
const payload = { title: "Halo", slug: "keep-this", blocks: [{ id: "a", type: "paragraph", text: "Selamat datang" }] };

describe("Gemini native translation provider", () => {
  it("distinguishes translatable professional titles from protected identity and technical terms", () => {
    const prompt = buildTranslationPrompt({ title: "Creative Web Developer", project: "SINDEN", person: "Fazri Lukman Nurrohman", stack: ["React", "Laravel", "Supabase"] }, "en", "id");
    expect(prompt).toContain("Translate human-readable prose, professional roles and job titles");
    expect(prompt).toContain("translate 'Creative Web Developer' as a professional title");
    expect(prompt).toContain("Fazri Lukman Nurrohman and SINDEN");
    expect(prompt).toContain("React, Laravel, and Supabase");
    expect(prompt).toContain("Do not treat every capitalized phrase as protected");
  });

  it("builds the native request and uses x-goog-api-key without Bearer auth", async () => {
    const request = buildGeminiRequest("translate me");
    expect(request.generationConfig).toEqual({ temperature: 0, responseMimeType: "application/json" });
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify(payload) }] } }] })));
    await translatePayload(payload, "id", "en", { env, fetch: fetchMock });
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.headers).toMatchObject({ "x-goog-api-key": "test-key" });
    expect(init.headers).not.toHaveProperty("Authorization");
  });

  it("parses multiple Gemini text parts", () => {
    expect(parseGeminiResponse({ candidates: [{ content: { parts: [{ text: '{"title":"Hello",' }, { text: '"slug":"keep"}' }] } }] })).toEqual({ title: "Hello", slug: "keep" });
  });

  it("rejects empty candidates, malformed JSON, HTTP errors, and structure changes", async () => {
    expect(() => parseGeminiResponse({ candidates: [] })).toThrow("no candidate text");
    expect(() => parseGeminiResponse({ candidates: [{ content: { parts: [{ text: "not json" }] } }] })).toThrow("malformed JSON");
    await expect(translatePayload(payload, "en", "id", { env, fetch: async () => new Response(JSON.stringify({ error: { message: "quota" } }), { status: 429 }) })).rejects.toThrow("provider=gemini model=gemini-3.5-flash-lite HTTP 429: quota");
    await expect(translatePayload(payload, "id", "en", { env, fetch: async () => new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify({ ...payload, slug: "changed" }) }] } }] }) ) })).rejects.toThrow("protected field");
  });

  it("times out instead of silently returning source content", async () => {
    const fetchMock: typeof fetch = (_input, init) => new Promise((_, reject) => init?.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")))) as Promise<Response>;
    await expect(translatePayload(payload, "id", "en", { env, fetch: fetchMock, timeoutMs: 1 })).rejects.toThrow("timed out");
  });
});
