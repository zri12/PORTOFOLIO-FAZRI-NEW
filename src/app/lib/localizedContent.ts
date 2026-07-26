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

const indonesianWords = /\b(yang|dan|dengan|untuk|dari|pada|adalah|ini|itu|sebagai|membangun|cara|fitur|pengguna|sistem)\b/gi;
const englishWords = /\b(the|and|with|for|from|this|that|as|build|how|feature|user|system|project)\b/gi;

export function detectContentLanguage(value: string): ContentLanguage {
  const IndonesianScore = value.match(indonesianWords)?.length ?? 0;
  const englishScore = value.match(englishWords)?.length ?? 0;
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
  const translation = ensureProjectTranslations(project)?.[language];
  return Boolean(translation?.title.trim() && translation.shortDescription.trim());
}

export function hasArticleLanguage(article: Article, language: ContentLanguage) {
  const translation = ensureArticleTranslations(article)?.[language];
  return Boolean(
    translation?.title.trim()
    && translation.excerpt.trim()
    && translation.blocks.some((block) => blockHasContent(block)),
  );
}

function blockHasContent(block: ArticleBlock) {
  if (block.type === "markdown") return Boolean(block.source.trim());
  if (block.type === "image") return Boolean(block.url.trim());
  if (block.type === "list") return block.items.some(Boolean);
  return Boolean(block.text.trim());
}

export function localizeProject(project: Project, language: ContentLanguage): Project {
  const translation = ensureProjectTranslations(project)?.[language];
  return translation ? { ...project, ...translation } : project;
}

export function localizeArticle(article: Article, language: ContentLanguage): Article {
  const translation = ensureArticleTranslations(article)?.[language];
  return translation ? { ...article, ...translation } : article;
}
