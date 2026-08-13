type Language = "id" | "en";
import { assertTranslationStructure } from "./translationStructure.ts";

declare const Deno: { env: { get(name: string): string | undefined } };

type GeminiPart = { text?: string };
type GeminiResponse = { candidates?: Array<{ content?: { parts?: GeminiPart[] } }> };
type Env = { get(name: string): string | undefined };

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const TRANSLATION_TIMEOUT_MS = 30_000;
const translationPolicy = "Translate human-readable prose, professional roles and job titles, descriptive headings, profile titles, and ordinary UI/content labels. For example, translate 'Creative Web Developer' as a professional title when appropriate for the target language. Keep identity and technical terms unchanged: names of people, companies, products, brands, and official project names (for example Fazri Lukman Nurrohman and SINDEN); technologies and framework names (for example React, Laravel, and Supabase); URLs, slugs, UUIDs, file paths, code, credential IDs, emails, phone numbers, dates that are not prose, CSS classes, component names, and database field names. Do not treat every capitalized phrase as protected: translate ordinary descriptive language and roles, while preserving only genuine names, brands, projects, and technical identifiers.";

export function buildTranslationPrompt(payload: Record<string, unknown>, sourceLanguage: Language, targetLanguage: Language) {
  return `Translate from ${sourceLanguage} to ${targetLanguage}. Return JSON only, with exactly the same object structure, property keys, array order, and number of array items as the source payload. ${translationPolicy} Do not add, remove, or invent facts. Source payload:\n${JSON.stringify(payload)}`;
}

export function buildGeminiRequest(prompt: string) {
  return {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0, responseMimeType: "application/json" },
  };
}

export function parseGeminiResponse(body: GeminiResponse): Record<string, unknown> {
  const text = body.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim();
  if (!text) throw new Error("Gemini returned no candidate text.");
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Gemini returned malformed JSON.");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Gemini returned an invalid translation payload.");
  return parsed as Record<string, unknown>;
}

async function geminiError(response: Response, model: string) {
  const responseText = (await response.text()).trim();
  let message = responseText || response.statusText || "Unknown Gemini error.";
  try {
    const parsed = JSON.parse(responseText) as { error?: { message?: string } };
    message = parsed.error?.message || message;
  } catch {
    // A non-JSON error body is still useful diagnostic context.
  }
  return new Error(`Translation provider=gemini model=${model} HTTP ${response.status}: ${message}`);
}

export async function translatePayload(
  payload: Record<string, unknown>,
  sourceLanguage: Language,
  targetLanguage: Language,
  dependencies: { env?: Env; fetch?: typeof fetch; timeoutMs?: number } = {},
) {
  const env = dependencies.env ?? Deno.env;
  const provider = env.get("TRANSLATION_PROVIDER")?.trim().toLowerCase();
  const apiKey = env.get("TRANSLATION_API_KEY")?.trim();
  const model = env.get("TRANSLATION_MODEL")?.trim() || "gemini-3.5-flash-lite";
  if (provider !== "gemini") throw new Error("Unsupported translation provider configuration. Expected gemini.");
  if (!apiKey) throw new Error("Translation provider is not configured: TRANSLATION_API_KEY is required.");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), dependencies.timeoutMs ?? TRANSLATION_TIMEOUT_MS);
  try {
    const response = await (dependencies.fetch ?? fetch)(`${GEMINI_API_BASE}/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify(buildGeminiRequest(buildTranslationPrompt(payload, sourceLanguage, targetLanguage))),
      signal: controller.signal,
    });
    if (!response.ok) throw await geminiError(response, model);
    const translated = parseGeminiResponse(await response.json() as GeminiResponse);
    assertTranslationStructure(payload, translated);
    return translated;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw new Error(`Translation provider=gemini model=${model} timed out after ${dependencies.timeoutMs ?? TRANSLATION_TIMEOUT_MS}ms.`);
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export function detectSourceLanguage(payload: Record<string, unknown>, fallback: Language = "en"): Language {
  const prose = JSON.stringify(payload).replace(/https?:\/\/\S+|\b[\w.-]+\/[\w./-]+\b/g, " ");
  const idScore = (prose.match(/\b(yang|dan|dengan|untuk|dari|pada|adalah|ini|sebagai|fitur|pengguna|proyek)\b/gi) || []).length;
  const enScore = (prose.match(/\b(the|and|with|for|from|this|that|feature|user|project|application)\b/gi) || []).length;
  return idScore === enScore ? fallback : idScore > enScore ? "id" : "en";
}
