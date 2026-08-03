import type {
  Article,
  ArticleBlock,
  ArticleTranslation,
  ContentLanguage,
  Project,
  ProjectTranslation,
} from "../types/portfolio";

export const contentLanguages: ContentLanguage[] = ["en", "id"];

export const emptyProjectTranslation = (): ProjectTranslation => ({
  title: "",
  fullName: "",
  category: "",
  type: "",
  role: "",
  shortDescription: "",
  fullDescription: "",
  overview: "",
  background: "",
  objectives: [],
  targetUsers: [],
  responsibilities: [],
  solution: "",
  features: [],
  architecture: "",
  dataStructure: "",
  process: [],
  challenges: [],
  decisions: [],
  testing: "",
  deployment: "",
  result: "",
});

export const emptyArticleTranslation = (): ArticleTranslation => ({
  title: "",
  excerpt: "",
  category: "",
  tags: [],
  coverAlt: "",
  seoTitle: "",
  seoDescription: "",
  blocks: [],
});

export function projectTranslationFromLegacy(project: Project): ProjectTranslation {
  const empty = emptyProjectTranslation();
  return Object.keys(empty).reduce<ProjectTranslation>((result, key) => {
    const typedKey = key as keyof ProjectTranslation;
    Object.assign(result, { [typedKey]: project[typedKey] });
    return result;
  }, emptyProjectTranslation());
}

export function articleTranslationFromLegacy(article: Article): ArticleTranslation {
  return {
    title: article.title,
    excerpt: article.excerpt,
    category: article.category,
    tags: article.tags,
    coverAlt: article.coverAlt,
    seoTitle: article.seoTitle,
    seoDescription: article.seoDescription,
    blocks: article.blocks,
  };
}

const indonesianWords = /\b(yang|dan|dengan|untuk|dari|pada|adalah|ini|itu|sebagai|membangun|cara|fitur|pengguna|sistem|aplikasi|website|proyek|data|dapat|menggunakan|membuat|menampilkan|mengelola|berbasis|melalui|hasil|tujuan|solusi|tantangan|halaman|agar|serta|dalam|oleh|atau|telah|akan|juga|tidak|lebih|baru|kami|saya|anda|pengelolaan|hingga|menjadi|membantu)\b/gi;
const englishWords = /\b(the|and|with|for|from|this|that|as|build|how|feature|user|system|project|application|website|data|can|using|create|display|manage|based|through|result|objective|solution|challenge|page|so|also|within|into|more|new|we|you|not|will|have|has|become|help)\b/gi;

export function detectContentLanguage(value: string, fallback: ContentLanguage = "en"): ContentLanguage {
  const IndonesianScore = value.match(indonesianWords)?.length ?? 0;
  const englishScore = value.match(englishWords)?.length ?? 0;
  if (IndonesianScore === englishScore) return fallback;
  return IndonesianScore > englishScore ? "id" : "en";
}

export function ensureProjectTranslations(project: Project): Project["translations"] {
  if (project.translations?.en || project.translations?.id) return project.translations;
  const legacy = projectTranslationFromLegacy(project);
  const language = detectContentLanguage(`${legacy.title} ${legacy.shortDescription} ${legacy.overview}`);
  return { [language]: legacy };
}

export function ensureArticleTranslations(article: Article): Article["translations"] {
  if (article.translations?.en || article.translations?.id) return article.translations;
  const legacy = articleTranslationFromLegacy(article);
  const blockText = legacy.blocks
    .map((block) => block.type === "markdown" ? block.source : "text" in block ? block.text : "")
    .join(" ");
  const language = detectContentLanguage(`${legacy.title} ${legacy.excerpt} ${blockText}`);
  return { [language]: legacy };
}

export function hasProjectLanguage(project: Project, language: ContentLanguage) {
  return Boolean(selectProjectTranslation(project, language));
}

export function hasArticleLanguage(article: Article, language: ContentLanguage) {
  return Boolean(selectArticleTranslation(article, language));
}

function blockHasContent(block: ArticleBlock) {
  if (block.type === "markdown") return Boolean(block.source.trim());
  if (block.type === "image") return Boolean(block.url.trim());
  if (block.type === "list") return block.items.some(Boolean);
  return Boolean(block.text.trim());
}

export function localizeProject(project: Project, language: ContentLanguage): Project {
  const translation = selectProjectTranslation(project, language);
  return translation ? { ...project, ...translation } : project;
}

export function localizeArticle(article: Article, language: ContentLanguage): Article {
  const translation = selectArticleTranslation(article, language);
  return translation ? { ...article, ...translation } : article;
}

function selectProjectTranslation(project: Project, language: ContentLanguage) {
  const translations = ensureProjectTranslations(project);
  const requested = translations?.[language];
  if (projectTranslationHasContent(requested)) return requested;
  const fallbackLanguage = language === "en" ? "id" : "en";
  const fallback = translations?.[fallbackLanguage];
  if (projectTranslationHasContent(fallback)) return fallback;
  return undefined;
}

function selectArticleTranslation(article: Article, language: ContentLanguage) {
  const translations = ensureArticleTranslations(article);
  const requested = translations?.[language];
  if (articleTranslationHasContent(requested)) return requested;
  const fallbackLanguage = language === "en" ? "id" : "en";
  const fallback = translations?.[fallbackLanguage];
  if (articleTranslationHasContent(fallback)) return fallback;
  return undefined;
}

function articleTranslationHasContent(translation: ArticleTranslation | undefined): translation is ArticleTranslation {
  return Boolean(
    translation?.title.trim()
    && translation.excerpt.trim()
    && translation.blocks.some((block) => blockHasContent(block)),
  );
}

function projectTranslationHasContent(translation: ProjectTranslation | undefined): translation is ProjectTranslation {
  return Boolean(
    translation?.title.trim()
    && translation.shortDescription.trim()
    && translation.overview.trim(),
  );
}
