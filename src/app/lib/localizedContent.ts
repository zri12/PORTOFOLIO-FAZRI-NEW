import type {
  Article,
  ArticleTranslation,
  Certificate,
  CertificateTranslation,
  ContentLanguage,
  CreativeWork,
  CreativeWorkTranslation,
  Experience,
  ExperienceTranslation,
  Project,
  ProjectTranslation,
  Profile,
  ProfileTranslation,
  SiteSettings,
  SiteSettingsTranslation,
  Technology,
  TechnologyTranslation,
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

export const emptyCreativeWorkTranslation = (): CreativeWorkTranslation => ({
  title: "",
  role: "",
  description: "",
  brief: "",
});

export const emptyExperienceTranslation = (): ExperienceTranslation => ({
  role: "",
  organization: "",
  location: "",
  description: "",
  responsibilities: [],
});

export const emptyCertificateTranslation = (): CertificateTranslation => ({
  title: "",
  issuer: "",
});

export const technologyTranslationFromLegacy = (technology: Technology): TechnologyTranslation => ({ description: technology.description });
export const settingsTranslationFromLegacy = (settings: SiteSettings): SiteSettingsTranslation => ({ websiteName: settings.websiteName, description: settings.description, copyright: settings.copyright, seoTitle: settings.seoTitle, seoDescription: settings.seoDescription, keywords: settings.keywords });

function hasMeaningfulContent(value: object | undefined) {
  return Boolean(value && Object.values(value).some((field) => {
    if (typeof field === "string") return Boolean(field.trim());
    return Array.isArray(field) && field.length > 0;
  }));
}

function mergeMeaningfulTranslation<T extends object>(source: T, translation: Partial<T> | undefined): T {
  if (!translation) return source;
  const meaningful = Object.fromEntries(Object.entries(translation).filter(([, field]) => {
    if (typeof field === "string") return Boolean(field.trim());
    return !Array.isArray(field) || field.length > 0;
  }));
  return { ...source, ...meaningful };
}

export const profileTranslationFromLegacy = (profile: Profile): ProfileTranslation => ({ title: profile.title, greeting: profile.greeting, headline: profile.headline, description: profile.description, biography: profile.biography, aboutContent: profile.aboutContent, availability: profile.availability });

export function localizeProfile(profile: Profile, language: ContentLanguage): Profile {
  const translations = profile.translations;
  const selected = translations?.[language] || (profile.sourceLanguage === language ? profileTranslationFromLegacy(profile) : undefined) || translations?.[language === "en" ? "id" : "en"] || profileTranslationFromLegacy(profile);
  return mergeMeaningfulTranslation(profile, selected);
}

export function publishedProjectsForLanguage(items: Project[], language: ContentLanguage) {
  return items.filter((item) => item.status === "published" && hasProjectLanguage(item, language)).map((item) => localizeProject(item, language));
}

export function publishedCreativeWorksForLanguage(items: CreativeWork[], language: ContentLanguage) {
  return items.filter((item) => item.status === "published" && hasCreativeWorkLanguage(item, language)).map((item) => localizeCreativeWork(item, language));
}

export function publishedCertificatesForLanguage(items: Certificate[], language: ContentLanguage) {
  return items.filter((item) => item.published && hasCertificateLanguage(item, language)).map((item) => localizeCertificate(item, language));
}

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

export function creativeWorkTranslationFromLegacy(work: CreativeWork): CreativeWorkTranslation {
  const empty = emptyCreativeWorkTranslation();
  return Object.keys(empty).reduce<CreativeWorkTranslation>((result, key) => {
    const typedKey = key as keyof CreativeWorkTranslation;
    Object.assign(result, { [typedKey]: work[typedKey] });
    return result;
  }, emptyCreativeWorkTranslation());
}

export function experienceTranslationFromLegacy(experience: Experience): ExperienceTranslation {
  const empty = emptyExperienceTranslation();
  return Object.keys(empty).reduce<ExperienceTranslation>((result, key) => {
    const typedKey = key as keyof ExperienceTranslation;
    Object.assign(result, { [typedKey]: experience[typedKey] });
    return result;
  }, emptyExperienceTranslation());
}

export function certificateTranslationFromLegacy(certificate: Certificate): CertificateTranslation {
  const empty = emptyCertificateTranslation();
  return Object.keys(empty).reduce<CertificateTranslation>((result, key) => {
    const typedKey = key as keyof CertificateTranslation;
    Object.assign(result, { [typedKey]: certificate[typedKey] });
    return result;
  }, emptyCertificateTranslation());
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

export function ensureCreativeWorkTranslations(work: CreativeWork): CreativeWork["translations"] {
  if (work.translations?.en || work.translations?.id) return work.translations;
  const legacy = creativeWorkTranslationFromLegacy(work);
  const language = detectContentLanguage(`${legacy.title} ${legacy.description} ${legacy.brief}`);
  return { [language]: legacy };
}

export function ensureExperienceTranslations(experience: Experience): Experience["translations"] {
  if (experience.translations?.en || experience.translations?.id) return experience.translations;
  const legacy = experienceTranslationFromLegacy(experience);
  const language = detectContentLanguage(`${legacy.role} ${legacy.description} ${legacy.responsibilities.join(" ")}`);
  return { [language]: legacy };
}

export function ensureCertificateTranslations(certificate: Certificate): Certificate["translations"] {
  if (certificate.translations?.en || certificate.translations?.id) return certificate.translations;
  const legacy = certificateTranslationFromLegacy(certificate);
  const language = detectContentLanguage(`${legacy.title} ${legacy.issuer}`);
  return { [language]: legacy };
}

export function hasProjectLanguage(project: Project, language: ContentLanguage) {
  return Boolean(selectProjectTranslation(project, language));
}

export function hasArticleLanguage(article: Article, language: ContentLanguage) {
  return Boolean(selectArticleTranslation(article, language));
}

export function hasCreativeWorkLanguage(work: CreativeWork, language: ContentLanguage) {
  return Boolean(selectCreativeWorkTranslation(work, language));
}

export function hasExperienceLanguage(experience: Experience, language: ContentLanguage) {
  return Boolean(selectExperienceTranslation(experience, language));
}

export function hasCertificateLanguage(certificate: Certificate, language: ContentLanguage) {
  return Boolean(selectCertificateTranslation(certificate, language));
}

export function localizeProject(project: Project, language: ContentLanguage): Project {
  const translation = selectProjectTranslation(project, language);
  return mergeMeaningfulTranslation(project, translation);
}

export function localizeArticle(article: Article, language: ContentLanguage): Article {
  return mergeMeaningfulTranslation(article, selectArticleTranslation(article, language));
}

export function localizeCreativeWork(work: CreativeWork, language: ContentLanguage): CreativeWork {
  return mergeMeaningfulTranslation(work, selectCreativeWorkTranslation(work, language));
}

export function localizeExperience(experience: Experience, language: ContentLanguage): Experience {
  return mergeMeaningfulTranslation(experience, selectExperienceTranslation(experience, language));
}

export function localizeCertificate(certificate: Certificate, language: ContentLanguage): Certificate {
  return mergeMeaningfulTranslation(certificate, selectCertificateTranslation(certificate, language));
}

export function localizeTechnology(technology: Technology, language: ContentLanguage): Technology {
  const translations = technology.translations;
  const selected = translations?.[language] || translations?.[language === "en" ? "id" : "en"] || technologyTranslationFromLegacy(technology);
  return mergeMeaningfulTranslation(technology, selected);
}

export function localizeSettings(settings: SiteSettings, language: ContentLanguage): SiteSettings {
  const translations = settings.translations;
  const selected = translations?.[language] || (settings.sourceLanguage === language ? settingsTranslationFromLegacy(settings) : undefined) || translations?.[language === "en" ? "id" : "en"] || settingsTranslationFromLegacy(settings);
  return mergeMeaningfulTranslation(settings, selected);
}

function selectProjectTranslation(project: Project, language: ContentLanguage) {
  const translations = ensureProjectTranslations(project);
  const requested = translations?.[language];
  if (projectTranslationHasContent(requested)) return requested;
  const fallbackLanguage = language === "en" ? "id" : "en";
  const fallback = translations?.[fallbackLanguage];
  if (projectTranslationHasContent(fallback)) return fallback;
  return projectTranslationFromLegacy(project);
}

function selectArticleTranslation(article: Article, language: ContentLanguage) {
  const translations = ensureArticleTranslations(article);
  const requested = translations?.[language];
  if (articleTranslationHasContent(requested)) return requested;
  const fallbackLanguage = language === "en" ? "id" : "en";
  const fallback = translations?.[fallbackLanguage];
  if (articleTranslationHasContent(fallback)) return fallback;
  return articleTranslationFromLegacy(article);
}

function selectCreativeWorkTranslation(work: CreativeWork, language: ContentLanguage) {
  const translations = ensureCreativeWorkTranslations(work);
  const requested = translations?.[language];
  if (creativeWorkTranslationHasContent(requested)) return requested;
  const fallbackLanguage = language === "en" ? "id" : "en";
  const fallback = translations?.[fallbackLanguage];
  if (creativeWorkTranslationHasContent(fallback)) return fallback;
  return creativeWorkTranslationFromLegacy(work);
}

function selectExperienceTranslation(experience: Experience, language: ContentLanguage) {
  const translations = ensureExperienceTranslations(experience);
  const requested = translations?.[language];
  if (experienceTranslationHasContent(requested)) return requested;
  const fallbackLanguage = language === "en" ? "id" : "en";
  const fallback = translations?.[fallbackLanguage];
  if (experienceTranslationHasContent(fallback)) return fallback;
  return experienceTranslationFromLegacy(experience);
}

function selectCertificateTranslation(certificate: Certificate, language: ContentLanguage) {
  const translations = ensureCertificateTranslations(certificate);
  const requested = translations?.[language];
  if (certificateTranslationHasContent(requested)) return requested;
  const fallbackLanguage = language === "en" ? "id" : "en";
  const fallback = translations?.[fallbackLanguage];
  if (certificateTranslationHasContent(fallback)) return fallback;
  return certificateTranslationFromLegacy(certificate);
}

function articleTranslationHasContent(translation: ArticleTranslation | undefined): translation is ArticleTranslation {
  return hasMeaningfulContent(translation);
}

function projectTranslationHasContent(translation: ProjectTranslation | undefined): translation is ProjectTranslation {
  return hasMeaningfulContent(translation);
}

function creativeWorkTranslationHasContent(translation: CreativeWorkTranslation | undefined): translation is CreativeWorkTranslation {
  return hasMeaningfulContent(translation);
}

function experienceTranslationHasContent(translation: ExperienceTranslation | undefined): translation is ExperienceTranslation {
  return hasMeaningfulContent(translation);
}

function certificateTranslationHasContent(translation: CertificateTranslation | undefined): translation is CertificateTranslation {
  return hasMeaningfulContent(translation);
}
