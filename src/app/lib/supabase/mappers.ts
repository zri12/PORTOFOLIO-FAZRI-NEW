import type {
  Article,
  ArticleBlock,
  Certificate,
  ContactMessage,
  CreativeWork,
  Experience,
  PortfolioData,
  Profile,
  Project,
  SiteSettings,
  Technology,
  VisitorComment,
} from "../../types/portfolio";
import { getSupabaseClient, publicBucket } from "./client";

type Row = Record<string, unknown>;

const asStringArray = (value: unknown): string[] => Array.isArray(value) ? value.map(String) : [];
const asString = (value: unknown, fallback = "") => typeof value === "string" ? value : fallback;
const asBool = (value: unknown, fallback = false) => typeof value === "boolean" ? value : fallback;
const asNumber = (value: unknown, fallback = 0) => typeof value === "number" ? value : fallback;
const asDate = (value: unknown) => asString(value).slice(0, 10);

const asArticleBlocks = (value: unknown): ArticleBlock[] => Array.isArray(value)
  ? value.filter((block): block is ArticleBlock => Boolean(block) && typeof block === "object" && typeof (block as { type?: unknown }).type === "string")
  : [];

function publicAssetUrl(value: unknown) {
  const source = asString(value);
  if (!source || source.startsWith("http") || source.startsWith("data:") || source.startsWith("/")) return source;
  const supabase = getSupabaseClient();
  return supabase ? supabase.storage.from(publicBucket).getPublicUrl(source).data.publicUrl : source;
}

const asAssetArray = (value: unknown) => asStringArray(value).map(publicAssetUrl).filter(Boolean);

function storagePathFromPublicUrl(value: string) {
  if (!value.startsWith("http")) return value;
  try {
    const url = new URL(value);
    const marker = `/storage/v1/object/public/${publicBucket}/`;
    const markerIndex = url.pathname.indexOf(marker);
    if (markerIndex < 0) return value;
    return decodeURIComponent(url.pathname.slice(markerIndex + marker.length));
  } catch {
    return value;
  }
}

const toStoredAsset = (value: string | undefined | null) => {
  const source = value?.trim();
  return source ? storagePathFromPublicUrl(source) : null;
};

const toStoredAssetArray = (values: string[]) => values.map((value) => storagePathFromPublicUrl(value)).filter(Boolean);

export function mapProfile(row: Row | null | undefined, fallback: Profile): Profile {
  if (!row) return fallback;
  return {
    fullName: asString(row.full_name, fallback.fullName),
    displayName: asString(row.display_name, fallback.displayName),
    title: asString(row.title, fallback.title),
    greeting: asString(row.greeting, fallback.greeting),
    headline: asString(row.headline, fallback.headline),
    description: asString(row.description, fallback.description),
    biography: asString(row.biography, fallback.biography),
    aboutContent: asString(row.about_content, fallback.aboutContent),
    email: asString(row.email, fallback.email),
    whatsapp: asString(row.whatsapp, fallback.whatsapp),
    location: asString(row.location, fallback.location),
    availability: asString(row.availability, fallback.availability),
    github: asString(row.github_url, fallback.github),
    linkedin: asString(row.linkedin_url, fallback.linkedin),
    instagram: asString(row.instagram_url, fallback.instagram),
    youtube: asString(row.youtube_url, fallback.youtube),
    tiktok: asString(row.tiktok_url, fallback.tiktok),
    cvUrl: asString(row.cv_path, fallback.cvUrl),
    logoUrl: publicAssetUrl(row.logo_path) || fallback.logoUrl || "",
    faviconUrl: publicAssetUrl(row.favicon_path) || fallback.faviconUrl || "",
    aboutImageUrl: publicAssetUrl(row.profile_image_path) || fallback.aboutImageUrl || "",
  };
}

export function profileToRow(profile: Profile): Row {
  return {
    singleton_key: "main",
    full_name: profile.fullName,
    display_name: profile.displayName,
    title: profile.title,
    greeting: profile.greeting,
    headline: profile.headline,
    description: profile.description,
    biography: profile.biography,
    about_content: profile.aboutContent,
    email: profile.email,
    whatsapp: profile.whatsapp,
    location: profile.location,
    availability: profile.availability,
    github_url: profile.github,
    linkedin_url: profile.linkedin,
    instagram_url: profile.instagram,
    youtube_url: profile.youtube,
    tiktok_url: profile.tiktok,
    cv_path: profile.cvUrl,
    logo_path: toStoredAsset(profile.logoUrl),
    favicon_path: toStoredAsset(profile.faviconUrl),
    profile_image_path: toStoredAsset(profile.aboutImageUrl),
  };
}

export function mapSettings(row: Row | null | undefined, fallback: SiteSettings): SiteSettings {
  if (!row) return fallback;
  return {
    websiteName: asString(row.website_name, fallback.websiteName),
    description: asString(row.description, fallback.description),
    language: asString(row.language, fallback.language),
    copyright: asString(row.copyright, fallback.copyright),
    defaultMode: asString(row.default_mode, fallback.defaultMode) === "spider" ? "spider" : "professional",
    smoothScroll: asBool(row.smooth_scroll, fallback.smoothScroll),
    splashEnabled: asBool(row.splash_enabled, fallback.splashEnabled),
    threeEnabled: asBool(row.three_enabled, fallback.threeEnabled),
    commentsEnabled: asBool(row.comments_enabled, fallback.commentsEnabled),
    contactEnabled: asBool(row.contact_enabled, fallback.contactEnabled),
    seoTitle: asString(row.seo_title, fallback.seoTitle),
    seoDescription: asString(row.seo_description, fallback.seoDescription),
    keywords: asString(row.keywords, fallback.keywords),
    siteUrl: asString(row.site_url, fallback.siteUrl),
    seoImage: publicAssetUrl(row.seo_image_path) || fallback.seoImage,
    googleSiteVerification: asString(row.google_site_verification, fallback.googleSiteVerification),
  };
}

export function settingsToRow(settings: SiteSettings): Row {
  return {
    singleton_key: "main",
    website_name: settings.websiteName,
    description: settings.description,
    language: settings.language,
    copyright: settings.copyright,
    default_mode: settings.defaultMode,
    smooth_scroll: settings.smoothScroll,
    splash_enabled: settings.splashEnabled,
    three_enabled: settings.threeEnabled,
    comments_enabled: settings.commentsEnabled,
    contact_enabled: settings.contactEnabled,
    seo_title: settings.seoTitle,
    seo_description: settings.seoDescription,
    keywords: settings.keywords,
    site_url: settings.siteUrl,
    seo_image_path: toStoredAsset(settings.seoImage),
    google_site_verification: settings.googleSiteVerification || null,
  };
}

export function mapProject(row: Row, techStack: string[] = []): Project {
  return {
    id: asString(row.id),
    slug: asString(row.slug),
    title: asString(row.title),
    fullName: asString(row.full_name),
    category: asString(row.category),
    type: asString(row.project_type),
    role: asString(row.role),
    year: asString(row.year),
    status: asString(row.status, "draft") as Project["status"],
    featured: asBool(row.featured),
    clientType: asString(row.client_type, "Personal Project") as Project["clientType"],
    techStack,
    shortDescription: asString(row.short_description),
    fullDescription: asString(row.full_description),
    overview: asString(row.overview),
    background: asString(row.background),
    objectives: asStringArray(row.objectives),
    targetUsers: asStringArray(row.target_users),
    responsibilities: asStringArray(row.responsibilities),
    solution: asString(row.solution),
    features: asStringArray(row.features),
    architecture: asString(row.architecture),
    dataStructure: asString(row.data_structure),
    process: asStringArray(row.process),
    gallery: asAssetArray(row.gallery),
    challenges: asStringArray(row.challenges),
    decisions: asStringArray(row.decisions),
    testing: asString(row.testing),
    deployment: asString(row.deployment),
    result: asString(row.result),
    liveUrl: asString(row.live_url),
    sourceUrl: asString(row.source_url),
    coverImage: publicAssetUrl(row.cover_path),
    heroImage: publicAssetUrl(row.hero_path),
    mobilePreviewImage: publicAssetUrl(row.mobile_preview_path),
    relatedProjectSlug: asString(row.related_project_slug) || undefined,
    displayOrder: asNumber(row.display_order),
  };
}

export function projectToRow(project: Project): Row {
  return {
    slug: project.slug,
    title: project.title,
    full_name: project.fullName,
    category: project.category,
    project_type: project.type,
    role: project.role,
    year: project.year,
    status: project.status,
    featured: project.featured,
    client_type: project.clientType,
    short_description: project.shortDescription,
    full_description: project.fullDescription,
    overview: project.overview,
    background: project.background,
    solution: project.solution,
    architecture: project.architecture,
    data_structure: project.dataStructure,
    testing: project.testing,
    deployment: project.deployment,
    result: project.result,
    live_url: project.liveUrl || null,
    source_url: project.sourceUrl || null,
    cover_path: toStoredAsset(project.coverImage),
    hero_path: toStoredAsset(project.heroImage),
    mobile_preview_path: toStoredAsset(project.mobilePreviewImage),
    related_project_slug: project.relatedProjectSlug || null,
    objectives: project.objectives,
    target_users: project.targetUsers,
    responsibilities: project.responsibilities,
    features: project.features,
    process: project.process,
    gallery: toStoredAssetArray(project.gallery),
    challenges: project.challenges,
    decisions: project.decisions,
    display_order: project.displayOrder,
  };
}

export function mapTechnology(row: Row): Technology {
  return {
    id: asString(row.id),
    name: asString(row.name),
    iconKey: asString(row.icon_key),
    logoUrl: publicAssetUrl(row.logo_path),
    category: asString(row.category, "Frontend") as Technology["category"],
    level: asString(row.level, "Familiar") as Technology["level"],
    description: asString(row.description),
    featured: asBool(row.featured),
    active: asBool(row.active, true),
    displayOrder: asNumber(row.display_order),
  };
}

export const technologyToRow = (item: Technology): Row => ({
  name: item.name,
  icon_key: item.iconKey,
  logo_path: toStoredAsset(item.logoUrl),
  category: item.category,
  level: item.level,
  description: item.description,
  featured: item.featured,
  active: item.active,
  display_order: item.displayOrder,
});

export function mapCreativeWork(row: Row): CreativeWork {
  return {
    id: asString(row.id),
    slug: asString(row.slug),
    title: asString(row.title),
    category: asString(row.category, "UI/UX Design") as CreativeWork["category"],
    role: asString(row.role),
    year: asString(row.year),
    tools: asStringArray(row.tools),
    description: asString(row.description),
    brief: asString(row.brief),
    cover: publicAssetUrl(row.cover_path),
    gallery: asAssetArray(row.gallery),
    beforeImage: publicAssetUrl(row.before_image_path) || undefined,
    afterImage: publicAssetUrl(row.after_image_path) || undefined,
    videoUrl: asString(row.video_url) || undefined,
    duration: asString(row.duration) || undefined,
    featured: asBool(row.featured),
    status: asString(row.status, "draft") as CreativeWork["status"],
    displayOrder: asNumber(row.display_order),
  };
}

export const creativeWorkToRow = (item: CreativeWork): Row => ({
  slug: item.slug,
  title: item.title,
  category: item.category,
  role: item.role,
  year: item.year,
  description: item.description,
  brief: item.brief,
  cover_path: toStoredAsset(item.cover),
  before_image_path: toStoredAsset(item.beforeImage),
  after_image_path: toStoredAsset(item.afterImage),
  video_url: item.videoUrl || null,
  duration: item.duration || null,
  tools: item.tools,
  gallery: toStoredAssetArray(item.gallery),
  featured: item.featured,
  status: item.status,
  display_order: item.displayOrder,
});

export function mapExperience(row: Row, projectSlug?: string): Experience {
  return {
    id: asString(row.id),
    role: asString(row.role),
    organization: asString(row.organization),
    type: asString(row.experience_type),
    period: asString(row.period),
    location: asString(row.location),
    description: asString(row.description),
    responsibilities: asStringArray(row.responsibilities),
    technologies: asStringArray(row.technologies),
    relatedProjectSlug: projectSlug,
    published: asBool(row.published, true),
    displayOrder: asNumber(row.display_order),
  };
}

export const experienceToRow = (item: Experience): Row => ({
  role: item.role,
  organization: item.organization,
  experience_type: item.type,
  period: item.period,
  location: item.location,
  description: item.description,
  responsibilities: item.responsibilities,
  technologies: item.technologies,
  published: item.published,
  display_order: item.displayOrder,
});

export function mapCertificate(row: Row): Certificate {
  return {
    id: asString(row.id),
    title: asString(row.title),
    issuer: asString(row.issuer),
    category: asString(row.category),
    issueDate: asDate(row.issue_date),
    credentialId: asString(row.credential_id),
    credentialUrl: asString(row.credential_url),
    image: publicAssetUrl(row.image_path),
    featured: asBool(row.featured),
    published: asBool(row.published, true),
    displayOrder: asNumber(row.display_order),
  };
}

export const certificateToRow = (item: Certificate): Row => ({
  title: item.title,
  issuer: item.issuer,
  category: item.category,
  issue_date: item.issueDate || null,
  credential_id: item.credentialId || null,
  credential_url: item.credentialUrl || null,
  image_path: toStoredAsset(item.image),
  featured: item.featured,
  published: item.published,
  display_order: item.displayOrder,
});

export function mapArticle(row: Row): Article {
  return {
    id: asString(row.id),
    slug: asString(row.slug),
    title: asString(row.title),
    excerpt: asString(row.excerpt),
    category: asString(row.category, "Web Development"),
    tags: asStringArray(row.tags),
    coverImage: publicAssetUrl(row.cover_path),
    coverAlt: asString(row.cover_alt),
    author: asString(row.author),
    status: asString(row.status, "draft") as Article["status"],
    featured: asBool(row.featured),
    publishedAt: asString(row.published_at),
    updatedAt: asString(row.updated_at),
    readingTime: asNumber(row.reading_time, 1),
    seoTitle: asString(row.seo_title),
    seoDescription: asString(row.seo_description),
    blocks: asArticleBlocks(row.content),
    displayOrder: asNumber(row.display_order),
  };
}

export const articleToRow = (item: Article): Row => ({
  slug: item.slug,
  title: item.title,
  excerpt: item.excerpt,
  category: item.category,
  tags: item.tags,
  cover_path: toStoredAsset(item.coverImage),
  cover_alt: item.coverAlt,
  author: item.author,
  status: item.status,
  featured: item.featured,
  published_at: item.publishedAt || null,
  reading_time: item.readingTime,
  seo_title: item.seoTitle,
  seo_description: item.seoDescription,
  content: item.blocks,
  display_order: item.displayOrder,
});

export function mapComment(row: Row, email = ""): VisitorComment {
  return {
    id: asString(row.id),
    name: asString(row.name),
    email,
    avatar: asString(row.avatar),
    message: asString(row.message),
    date: asDate(row.created_at),
    likes: asNumber(row.likes_count),
    adminReply: asString(row.admin_reply) || undefined,
    pinned: asBool(row.pinned),
    status: asString(row.status, "approved") as VisitorComment["status"],
  };
}

export const commentToRow = (item: VisitorComment): Row => ({
  name: item.name,
  avatar: item.avatar,
  message: item.message,
  likes_count: item.likes,
  admin_reply: item.adminReply || item.reply || null,
  pinned: item.pinned,
  status: item.status,
  approved_at: item.status === "approved" ? new Date().toISOString() : null,
});

export function mapMessage(row: Row): ContactMessage {
  return {
    id: asString(row.id),
    name: asString(row.name),
    email: asString(row.email),
    whatsapp: asString(row.whatsapp),
    projectType: asString(row.project_type),
    budgetRange: asString(row.budget_range),
    subject: asString(row.subject),
    message: asString(row.message),
    date: asDate(row.created_at),
    status: asString(row.status, "New") as ContactMessage["status"],
  };
}

export const messageToRow = (item: ContactMessage): Row => ({
  name: item.name,
  email: item.email,
  whatsapp: item.whatsapp || null,
  project_type: item.projectType,
  budget_range: item.budgetRange,
  subject: item.subject,
  message: item.message,
  status: item.status,
});

export function mergeWithFallback(data: Partial<PortfolioData>, fallback: PortfolioData): PortfolioData {
  return {
    profile: data.profile || fallback.profile,
    projects: data.projects ?? fallback.projects,
    techStack: data.techStack ?? fallback.techStack,
    creativeWorks: data.creativeWorks ?? fallback.creativeWorks,
    experiences: data.experiences ?? fallback.experiences,
    certificates: data.certificates ?? fallback.certificates,
    articles: data.articles ?? fallback.articles,
    comments: data.comments || [],
    messages: data.messages || [],
    media: data.media || [],
    settings: data.settings || fallback.settings,
  };
}
