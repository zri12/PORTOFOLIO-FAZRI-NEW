import type {
  ArticleBlock,
  ArticleTranslation,
  CertificateTranslation,
  ContentLanguage,
  CreativeWorkTranslation,
  ExperienceTranslation,
  ProjectTranslation,
} from "../types/portfolio";
import {
  detectContentLanguage,
  emptyArticleTranslation,
  emptyCertificateTranslation,
  emptyCreativeWorkTranslation,
  emptyExperienceTranslation,
  emptyProjectTranslation,
} from "./localizedContent";

type TranslationProgress = (message: string) => void;

type MyMemoryResponse = {
  responseData?: {
    translatedText?: unknown;
  };
  responseStatus?: unknown;
  responseDetails?: unknown;
};

const DEFAULT_TRANSLATION_ENDPOINT = "https://api.mymemory.translated.net/get";
const translationEndpoint = import.meta.env.VITE_TRANSLATION_API_URL?.trim() || DEFAULT_TRANSLATION_ENDPOINT;
const MAX_SEGMENT_BYTES = 450;
const textEncoder = new TextEncoder();
const translationCache = new Map<string, string>();
const pendingSlots: Array<() => void> = [];
let activeRequests = 0;

export class AutomaticTranslationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AutomaticTranslationError";
  }
}

export function projectTranslationIsPublishable(value: ProjectTranslation) {
  return Boolean(value.title.trim() && value.shortDescription.trim() && value.overview.trim());
}

export function articleTranslationIsPublishable(value: ArticleTranslation) {
  return Boolean(
    value.title.trim()
    && value.excerpt.trim()
    && value.blocks.some((block) => block.type === "markdown" && block.source.trim()),
  );
}

export function creativeWorkTranslationIsPublishable(value: CreativeWorkTranslation) {
  return Boolean(value.title.trim() && value.description.trim());
}

export function experienceTranslationIsPublishable(value: ExperienceTranslation) {
  return Boolean(value.role.trim() && value.organization.trim() && value.description.trim());
}

export function certificateTranslationIsPublishable(value: CertificateTranslation) {
  return Boolean(value.title.trim() && value.issuer.trim());
}

export async function createAutomaticProjectTranslations(
  translations: Partial<Record<ContentLanguage, ProjectTranslation>>,
  preferredSource: ContentLanguage,
  onProgress?: TranslationProgress,
) {
  const en = { ...emptyProjectTranslation(), ...translations.en };
  const id = { ...emptyProjectTranslation(), ...translations.id };
  const preferred = preferredSource === "en" ? en : id;
  const fallback = preferredSource === "en" ? id : en;
  const source = projectContentScore(preferred) ? preferred : fallback;
  if (!projectContentScore(source)) throw new AutomaticTranslationError("Add project content in English or Indonesian before saving.");

  const detectedLanguage = detectContentLanguage(projectSourceText(source), preferredSource);
  const targetLanguage = oppositeLanguage(detectedLanguage);
  onProgress?.(`Detected ${detectedLanguage === "en" ? "English" : "Indonesian"} project content.`);
  const target = await translateProject(source, detectedLanguage, targetLanguage, onProgress);
  return detectedLanguage === "en" ? { en: source, id: target } : { en: target, id: source };
}

export async function createAutomaticArticleTranslations(
  translations: Partial<Record<ContentLanguage, ArticleTranslation>>,
  preferredSource: ContentLanguage,
  onProgress?: TranslationProgress,
) {
  const en = { ...emptyArticleTranslation(), ...translations.en };
  const id = { ...emptyArticleTranslation(), ...translations.id };
  const preferred = preferredSource === "en" ? en : id;
  const fallback = preferredSource === "en" ? id : en;
  const source = articleContentScore(preferred) ? preferred : fallback;
  if (!articleContentScore(source)) throw new AutomaticTranslationError("Add article content in English or Indonesian before saving.");

  const detectedLanguage = detectContentLanguage(articleSourceText(source), preferredSource);
  const targetLanguage = oppositeLanguage(detectedLanguage);
  onProgress?.(`Detected ${detectedLanguage === "en" ? "English" : "Indonesian"} article content.`);
  const target = await translateArticle(source, detectedLanguage, targetLanguage, onProgress);
  return detectedLanguage === "en" ? { en: source, id: target } : { en: target, id: source };
}

export async function createAutomaticCreativeWorkTranslations(
  translations: Partial<Record<ContentLanguage, CreativeWorkTranslation>>,
  preferredSource: ContentLanguage,
  onProgress?: TranslationProgress,
) {
  const en = { ...emptyCreativeWorkTranslation(), ...translations.en };
  const id = { ...emptyCreativeWorkTranslation(), ...translations.id };
  const preferred = preferredSource === "en" ? en : id;
  const fallback = preferredSource === "en" ? id : en;
  const source = creativeWorkContentScore(preferred) ? preferred : fallback;
  if (!creativeWorkContentScore(source)) throw new AutomaticTranslationError("Add creative work content in English or Indonesian before saving.");

  const detectedLanguage = detectContentLanguage(creativeWorkSourceText(source), preferredSource);
  const targetLanguage = oppositeLanguage(detectedLanguage);
  onProgress?.(`Detected ${detectedLanguage === "en" ? "English" : "Indonesian"} creative work content.`);
  const target = await translateCreativeWork(source, detectedLanguage, targetLanguage, onProgress);
  return detectedLanguage === "en" ? { en: source, id: target } : { en: target, id: source };
}

export async function createAutomaticExperienceTranslations(
  translations: Partial<Record<ContentLanguage, ExperienceTranslation>>,
  preferredSource: ContentLanguage,
  onProgress?: TranslationProgress,
) {
  const en = { ...emptyExperienceTranslation(), ...translations.en };
  const id = { ...emptyExperienceTranslation(), ...translations.id };
  const preferred = preferredSource === "en" ? en : id;
  const fallback = preferredSource === "en" ? id : en;
  const source = experienceContentScore(preferred) ? preferred : fallback;
  if (!experienceContentScore(source)) throw new AutomaticTranslationError("Add experience content in English or Indonesian before saving.");

  const detectedLanguage = detectContentLanguage(experienceSourceText(source), preferredSource);
  const targetLanguage = oppositeLanguage(detectedLanguage);
  onProgress?.(`Detected ${detectedLanguage === "en" ? "English" : "Indonesian"} experience content.`);
  const target = await translateExperience(source, detectedLanguage, targetLanguage, onProgress);
  return detectedLanguage === "en" ? { en: source, id: target } : { en: target, id: source };
}

export async function createAutomaticCertificateTranslations(
  translations: Partial<Record<ContentLanguage, CertificateTranslation>>,
  preferredSource: ContentLanguage,
  onProgress?: TranslationProgress,
) {
  const en = { ...emptyCertificateTranslation(), ...translations.en };
  const id = { ...emptyCertificateTranslation(), ...translations.id };
  const preferred = preferredSource === "en" ? en : id;
  const fallback = preferredSource === "en" ? id : en;
  const source = certificateContentScore(preferred) ? preferred : fallback;
  if (!certificateContentScore(source)) throw new AutomaticTranslationError("Add certificate content in English or Indonesian before saving.");

  const detectedLanguage = detectContentLanguage(certificateSourceText(source), preferredSource);
  const targetLanguage = oppositeLanguage(detectedLanguage);
  onProgress?.(`Detected ${detectedLanguage === "en" ? "English" : "Indonesian"} certificate content.`);
  const target = await translateCertificate(source, detectedLanguage, targetLanguage, onProgress);
  return detectedLanguage === "en" ? { en: source, id: target } : { en: target, id: source };
}

async function translateProject(
  value: ProjectTranslation,
  sourceLanguage: ContentLanguage,
  targetLanguage: ContentLanguage,
  onProgress?: TranslationProgress,
): Promise<ProjectTranslation> {
  onProgress?.(`Translating project from ${sourceLanguage.toUpperCase()} to ${targetLanguage.toUpperCase()}...`);
  const [
    title,
    fullName,
    category,
    type,
    role,
    shortDescription,
    fullDescription,
    overview,
    background,
    objectives,
    targetUsers,
    responsibilities,
    solution,
    features,
    architecture,
    dataStructure,
    process,
    challenges,
    decisions,
    testing,
    deployment,
    result,
  ] = await Promise.all([
    translateText(value.title, sourceLanguage, targetLanguage),
    translateText(value.fullName, sourceLanguage, targetLanguage),
    translateText(value.category, sourceLanguage, targetLanguage),
    translateText(value.type, sourceLanguage, targetLanguage),
    translateText(value.role, sourceLanguage, targetLanguage),
    translateText(value.shortDescription, sourceLanguage, targetLanguage),
    translateText(value.fullDescription, sourceLanguage, targetLanguage),
    translateText(value.overview, sourceLanguage, targetLanguage),
    translateText(value.background, sourceLanguage, targetLanguage),
    translateItems(value.objectives, sourceLanguage, targetLanguage),
    translateItems(value.targetUsers, sourceLanguage, targetLanguage),
    translateItems(value.responsibilities, sourceLanguage, targetLanguage),
    translateText(value.solution, sourceLanguage, targetLanguage),
    translateItems(value.features, sourceLanguage, targetLanguage),
    translateText(value.architecture, sourceLanguage, targetLanguage),
    translateText(value.dataStructure, sourceLanguage, targetLanguage),
    translateItems(value.process, sourceLanguage, targetLanguage),
    translateItems(value.challenges, sourceLanguage, targetLanguage),
    translateItems(value.decisions, sourceLanguage, targetLanguage),
    translateText(value.testing, sourceLanguage, targetLanguage),
    translateText(value.deployment, sourceLanguage, targetLanguage),
    translateText(value.result, sourceLanguage, targetLanguage),
  ]);

  return {
    title,
    fullName,
    category,
    type,
    role,
    shortDescription,
    fullDescription,
    overview,
    background,
    objectives,
    targetUsers,
    responsibilities,
    solution,
    features,
    architecture,
    dataStructure,
    process,
    challenges,
    decisions,
    testing,
    deployment,
    result,
  };
}

async function translateArticle(
  value: ArticleTranslation,
  sourceLanguage: ContentLanguage,
  targetLanguage: ContentLanguage,
  onProgress?: TranslationProgress,
): Promise<ArticleTranslation> {
  onProgress?.(`Translating article from ${sourceLanguage.toUpperCase()} to ${targetLanguage.toUpperCase()}...`);
  const [title, excerpt, category, tags, coverAlt, seoTitle, seoDescription, blocks] = await Promise.all([
    translateText(value.title, sourceLanguage, targetLanguage),
    translateText(value.excerpt, sourceLanguage, targetLanguage),
    translateText(value.category, sourceLanguage, targetLanguage),
    translateItems(value.tags, sourceLanguage, targetLanguage),
    translateText(value.coverAlt, sourceLanguage, targetLanguage),
    translateText(value.seoTitle, sourceLanguage, targetLanguage),
    translateText(value.seoDescription, sourceLanguage, targetLanguage),
    Promise.all(value.blocks.map((block) => translateArticleBlock(block, sourceLanguage, targetLanguage))),
  ]);

  return { title, excerpt, category, tags, coverAlt, seoTitle, seoDescription, blocks };
}

async function translateCreativeWork(
  value: CreativeWorkTranslation,
  sourceLanguage: ContentLanguage,
  targetLanguage: ContentLanguage,
  onProgress?: TranslationProgress,
): Promise<CreativeWorkTranslation> {
  onProgress?.(`Translating creative work from ${sourceLanguage.toUpperCase()} to ${targetLanguage.toUpperCase()}...`);
  const [title, role, description, brief] = await Promise.all([
    translateText(value.title, sourceLanguage, targetLanguage),
    translateText(value.role, sourceLanguage, targetLanguage),
    translateText(value.description, sourceLanguage, targetLanguage),
    translateText(value.brief, sourceLanguage, targetLanguage),
  ]);
  return { title, role, description, brief };
}

async function translateExperience(
  value: ExperienceTranslation,
  sourceLanguage: ContentLanguage,
  targetLanguage: ContentLanguage,
  onProgress?: TranslationProgress,
): Promise<ExperienceTranslation> {
  onProgress?.(`Translating experience from ${sourceLanguage.toUpperCase()} to ${targetLanguage.toUpperCase()}...`);
  const [role, organization, location, description, responsibilities] = await Promise.all([
    translateText(value.role, sourceLanguage, targetLanguage),
    translateText(value.organization, sourceLanguage, targetLanguage),
    translateText(value.location, sourceLanguage, targetLanguage),
    translateText(value.description, sourceLanguage, targetLanguage),
    translateItems(value.responsibilities, sourceLanguage, targetLanguage),
  ]);
  return { role, organization, location, description, responsibilities };
}

async function translateCertificate(
  value: CertificateTranslation,
  sourceLanguage: ContentLanguage,
  targetLanguage: ContentLanguage,
  onProgress?: TranslationProgress,
): Promise<CertificateTranslation> {
  onProgress?.(`Translating certificate from ${sourceLanguage.toUpperCase()} to ${targetLanguage.toUpperCase()}...`);
  const [title, issuer] = await Promise.all([
    translateText(value.title, sourceLanguage, targetLanguage),
    translateText(value.issuer, sourceLanguage, targetLanguage),
  ]);
  return { title, issuer };
}

async function translateArticleBlock(
  block: ArticleBlock,
  sourceLanguage: ContentLanguage,
  targetLanguage: ContentLanguage,
): Promise<ArticleBlock> {
  if (block.type === "markdown") {
    return { ...block, source: await translateMarkdown(block.source, sourceLanguage, targetLanguage) };
  }
  if (block.type === "paragraph") {
    return { ...block, text: await translateText(block.text, sourceLanguage, targetLanguage) };
  }
  if (block.type === "heading") {
    return { ...block, text: await translateText(block.text, sourceLanguage, targetLanguage) };
  }
  if (block.type === "quote") {
    return { ...block, text: await translateText(block.text, sourceLanguage, targetLanguage) };
  }
  if (block.type === "list") {
    return { ...block, items: await translateItems(block.items, sourceLanguage, targetLanguage) };
  }
  const [alt, caption] = await Promise.all([
    translateText(block.alt, sourceLanguage, targetLanguage),
    translateText(block.caption, sourceLanguage, targetLanguage),
  ]);
  return { ...block, alt, caption };
}

async function translateMarkdown(
  source: string,
  sourceLanguage: ContentLanguage,
  targetLanguage: ContentLanguage,
) {
  const lines = source.split("\n");
  const translatedLines = await Promise.all(lines.map(async (line) => {
    if (!line.trim() || /^>\s*--\s*/.test(line)) return line;
    const prefixMatch = line.match(/^(\s*(?:#{1,6}\s+|>\s+|[-*]\s+|\d+\.\s+))/);
    const prefix = prefixMatch?.[1] ?? "";
    const content = prefix ? line.slice(prefix.length) : line;
    return `${prefix}${await translateText(content, sourceLanguage, targetLanguage)}`;
  }));
  return translatedLines.join("\n");
}

async function translateItems(
  items: string[],
  sourceLanguage: ContentLanguage,
  targetLanguage: ContentLanguage,
) {
  return Promise.all(items.map((item) => translateText(item, sourceLanguage, targetLanguage)));
}

async function translateText(
  value: string,
  sourceLanguage: ContentLanguage,
  targetLanguage: ContentLanguage,
) {
  const trimmed = value.trim();
  if (!trimmed || /^https?:\/\//i.test(trimmed) || !/\p{L}/u.test(trimmed)) return value;

  const leading = value.match(/^\s*/)?.[0] || "";
  const trailing = value.match(/\s*$/)?.[0] || "";
  const segments = splitIntoSegments(trimmed);
  const translatedSegments = await Promise.all(
    segments.map((segment) => translateSegment(segment, sourceLanguage, targetLanguage)),
  );
  return `${leading}${translatedSegments.join(" ")}${trailing}`;
}

async function translateSegment(
  segment: string,
  sourceLanguage: ContentLanguage,
  targetLanguage: ContentLanguage,
) {
  const cacheKey = `${sourceLanguage}:${targetLanguage}:${segment}`;
  const cached = translationCache.get(cacheKey);
  if (cached) return cached;

  return withRequestSlot(async () => {
    const cachedAfterWait = translationCache.get(cacheKey);
    if (cachedAfterWait) return cachedAfterWait;

    const url = new URL(translationEndpoint);
    url.searchParams.set("q", segment);
    url.searchParams.set("langpair", `${sourceLanguage}|${targetLanguage}`);
    url.searchParams.set("mt", "1");
    url.searchParams.set("de", "portfolio@fazrilukman.com");

    const controller = new AbortController();
    const timeout = globalThis.setTimeout(() => controller.abort(), 20_000);
    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new AutomaticTranslationError(`Translation service returned HTTP ${response.status}.`);
      const payload = await response.json() as MyMemoryResponse;
      const translatedText = payload.responseData?.translatedText;
      if (Number(payload.responseStatus) !== 200 || typeof translatedText !== "string" || !translatedText.trim()) {
        throw new AutomaticTranslationError(String(payload.responseDetails || "Translation service did not return translated text."));
      }
      if (/MYMEMORY WARNING/i.test(translatedText)) {
        throw new AutomaticTranslationError("The free translation quota is temporarily unavailable. Please try again later.");
      }
      const decodedText = decodeHtmlEntities(translatedText);
      translationCache.set(cacheKey, decodedText);
      return decodedText;
    } catch (error) {
      if (error instanceof AutomaticTranslationError) throw error;
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new AutomaticTranslationError("Automatic translation timed out. Check the connection and try again.");
      }
      throw new AutomaticTranslationError("Automatic translation is unavailable. Check the connection and try again.");
    } finally {
      globalThis.clearTimeout(timeout);
    }
  });
}

let lastRequestTime = 0;

async function withRequestSlot<T>(task: () => Promise<T>) {
  if (activeRequests >= 1) {
    await new Promise<void>((resolve) => pendingSlots.push(resolve));
  }
  activeRequests += 1;
  
  const now = Date.now();
  const timeSinceLast = now - lastRequestTime;
  if (timeSinceLast < 1000) {
    await new Promise((resolve) => globalThis.setTimeout(resolve, 1000 - timeSinceLast));
  }

  try {
    return await task();
  } finally {
    lastRequestTime = Date.now();
    activeRequests -= 1;
    pendingSlots.shift()?.();
  }
}

function splitIntoSegments(value: string) {
  if (byteLength(value) <= MAX_SEGMENT_BYTES) return [value];

  const sentences = value.split(/(?<=[.!?])\s+/);
  const segments: string[] = [];
  let current = "";
  sentences.forEach((sentence) => {
    const candidate = current ? `${current} ${sentence}` : sentence;
    if (byteLength(candidate) <= MAX_SEGMENT_BYTES) {
      current = candidate;
      return;
    }
    if (current) segments.push(current);
    if (byteLength(sentence) <= MAX_SEGMENT_BYTES) {
      current = sentence;
      return;
    }
    const wordSegments = splitLongSentence(sentence);
    segments.push(...wordSegments.slice(0, -1));
    current = wordSegments.at(-1) || "";
  });
  if (current) segments.push(current);
  return segments;
}

function splitLongSentence(value: string) {
  const segments: string[] = [];
  let current = "";
  value.split(/\s+/).forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (byteLength(candidate) <= MAX_SEGMENT_BYTES) {
      current = candidate;
      return;
    }
    if (current) segments.push(current);
    current = word;
  });
  if (current) segments.push(current);
  return segments;
}

function projectSourceText(value: ProjectTranslation) {
  return [
    value.title,
    value.fullName,
    value.category,
    value.type,
    value.role,
    value.shortDescription,
    value.fullDescription,
    value.overview,
    value.background,
    value.objectives.join(" "),
    value.targetUsers.join(" "),
    value.responsibilities.join(" "),
    value.solution,
    value.features.join(" "),
    value.architecture,
    value.dataStructure,
    value.process.join(" "),
    value.challenges.join(" "),
    value.decisions.join(" "),
    value.testing,
    value.deployment,
    value.result,
  ].join(" ");
}

function articleSourceText(value: ArticleTranslation) {
  return [
    value.title,
    value.excerpt,
    value.category,
    value.tags.join(" "),
    value.coverAlt,
    value.seoTitle,
    value.seoDescription,
    ...value.blocks.map((block) => {
      if (block.type === "markdown") return block.source;
      if (block.type === "list") return block.items.join(" ");
      if (block.type === "image") return `${block.alt} ${block.caption}`;
      return block.text;
    }),
  ].join(" ");
}

function projectContentScore(value: ProjectTranslation) {
  return projectSourceText(value).trim().length;
}

function articleContentScore(value: ArticleTranslation) {
  return articleSourceText(value).trim().length;
}

function creativeWorkSourceText(value: CreativeWorkTranslation) {
  return [value.title, value.role, value.description, value.brief].join(" ");
}

function creativeWorkContentScore(value: CreativeWorkTranslation) {
  return creativeWorkSourceText(value).trim().length;
}

function experienceSourceText(value: ExperienceTranslation) {
  return [value.role, value.organization, value.location, value.description, value.responsibilities.join(" ")].join(" ");
}

function experienceContentScore(value: ExperienceTranslation) {
  return experienceSourceText(value).trim().length;
}

function certificateSourceText(value: CertificateTranslation) {
  return [value.title, value.issuer].join(" ");
}

function certificateContentScore(value: CertificateTranslation) {
  return certificateSourceText(value).trim().length;
}

function oppositeLanguage(language: ContentLanguage): ContentLanguage {
  return language === "en" ? "id" : "en";
}

function byteLength(value: string) {
  return textEncoder.encode(value).length;
}

function decodeHtmlEntities(value: string) {
  const element = document.createElement("textarea");
  element.innerHTML = value;
  return element.value;
}
