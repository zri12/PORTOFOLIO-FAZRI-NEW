import { portfolioSeed } from "../data/seed/portfolioSeed";
import { slugify, uid, writeJson } from "../lib/storage";
import { isSupabaseEnabled } from "../lib/supabase/client";
import { supabasePortfolioRepository } from "./supabasePortfolioRepository";
import type {
  Article,
  Certificate,
  ContactMessage,
  CreativeWork,
  Experience,
  MediaItem,
  PortfolioData,
  Project,
  SiteSettings,
  Technology,
  VisitorComment,
} from "../types/portfolio";

const STORAGE_KEY = "fazri-portfolio-demo-v3";
const CACHE_KEY = "fazri-portfolio-supabase-cache-v4";
const CACHE_SCHEMA_VERSION = 4;
const CACHE_MAX_AGE_MS = 6 * 60 * 60 * 1000;
const CHANGE_EVENT = "portfolio-data-change";
let cachedData: PortfolioData | null = null;
let cachedRaw: string | null = null;
let refreshPromise: Promise<PortfolioData> | null = null;
let backendSyncPromise: Promise<void> | null = null;
let realtimeUnsubscribe: (() => void) | null = null;

function cloneSeed(): PortfolioData {
  return JSON.parse(JSON.stringify(portfolioSeed)) as PortfolioData;
}

function cloneData(data: PortfolioData): PortfolioData {
  return JSON.parse(JSON.stringify(data)) as PortfolioData;
}

function emptySupabaseData(): PortfolioData {
  const seed = cloneSeed();
  return {
    profile: seed.profile,
    projects: [],
    techStack: [],
    creativeWorks: [],
    experiences: [],
    certificates: [],
    articles: [],
    comments: [],
    messages: [],
    media: [],
    settings: seed.settings,
  };
}

function asArray<T>(value: unknown, fallback: T[]): T[] {
  return Array.isArray(value) ? (value as T[]) : fallback;
}

function normalizeData(value: Partial<PortfolioData> | null | undefined): PortfolioData {
  const seed = cloneSeed();
  if (!value || typeof value !== "object") return seed;

  const seedProjectsBySlug = new Map(seed.projects.map((project) => [project.slug, project]));
  const projects = asArray(value.projects, seed.projects).map((project, index) => {
    const fallback = seedProjectsBySlug.get(project.slug) || seed.projects[index] || seed.projects[0];
    return {
      ...fallback,
      ...project,
      id: project.id || fallback.id || uid("project"),
      slug: project.slug || slugify(project.title || fallback.title),
      techStack: asArray(project.techStack, fallback.techStack),
      objectives: asArray(project.objectives, fallback.objectives),
      targetUsers: asArray(project.targetUsers, fallback.targetUsers),
      responsibilities: asArray(project.responsibilities, fallback.responsibilities),
      features: asArray(project.features, fallback.features),
      process: asArray(project.process, fallback.process),
      gallery: asArray(project.gallery, fallback.gallery),
      challenges: asArray(project.challenges, fallback.challenges),
      decisions: asArray(project.decisions, fallback.decisions),
      coverImage: project.coverImage ?? fallback.coverImage ?? "",
      heroImage: project.heroImage ?? fallback.heroImage ?? "",
      mobilePreviewImage: project.mobilePreviewImage ?? fallback.mobilePreviewImage ?? "",
      relatedProjectSlug: project.relatedProjectSlug ?? fallback.relatedProjectSlug,
      displayOrder: project.displayOrder ?? fallback.displayOrder ?? index + 1,
    };
  });

  return {
    profile: { ...seed.profile, ...(value.profile || {}) },
    projects,
    techStack: asArray(value.techStack, seed.techStack).map((item, index) => ({
      ...seed.techStack[index % seed.techStack.length],
      ...item,
      id: item.id || uid("tech"),
      logoUrl: item.logoUrl || "",
      active: item.active ?? true,
      featured: item.featured ?? false,
      displayOrder: item.displayOrder ?? index + 1,
    })),
    creativeWorks: asArray(value.creativeWorks, seed.creativeWorks).map((item, index) => ({
      ...seed.creativeWorks[index % seed.creativeWorks.length],
      ...item,
      id: item.id || uid("creative"),
      gallery: asArray(item.gallery, seed.creativeWorks[index % seed.creativeWorks.length].gallery),
      displayOrder: item.displayOrder ?? index + 1,
    })),
    experiences: asArray(value.experiences, seed.experiences).map((item, index) => ({
      ...seed.experiences[index % seed.experiences.length],
      ...item,
      id: item.id || uid("exp"),
      responsibilities: asArray(item.responsibilities, seed.experiences[index % seed.experiences.length].responsibilities),
      technologies: asArray(item.technologies, seed.experiences[index % seed.experiences.length].technologies),
      displayOrder: item.displayOrder ?? index + 1,
    })),
    certificates: asArray(value.certificates, seed.certificates).map((item, index) => ({
      ...seed.certificates[index % seed.certificates.length],
      ...item,
      id: item.id || uid("cert"),
      displayOrder: item.displayOrder ?? index + 1,
    })),
    articles: asArray(value.articles, seed.articles).map((item, index) => ({
      ...seed.articles[index % Math.max(seed.articles.length, 1)],
      ...item,
      id: item.id || uid("article"),
      slug: item.slug || slugify(item.title || "article"),
      tags: asArray(item.tags, []),
      blocks: asArray(item.blocks, []),
      displayOrder: item.displayOrder ?? index + 1,
    })),
    comments: asArray(value.comments, seed.comments).map((item) => ({ ...item, status: item.status || "approved", likes: item.likes ?? 0, pinned: item.pinned ?? false })),
    messages: asArray(value.messages, seed.messages).map((item) => ({ ...item, status: item.status || "New" })),
    media: asArray(value.media, seed.media),
    settings: { ...seed.settings, ...(value.settings || {}) },
  };
}

function emitChange() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(CHANGE_EVENT));
}

function reportBackendError(error: unknown) {
  console.error("Portfolio Supabase sync failed", error);
}

function persistCache(data: PortfolioData) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CACHE_KEY, JSON.stringify({ schemaVersion: CACHE_SCHEMA_VERSION, savedAt: new Date().toISOString(), data }));
}

function readCache(): PortfolioData | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(CACHE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { schemaVersion?: number; savedAt?: string; data?: PortfolioData };
    const savedAt = parsed.savedAt ? new Date(parsed.savedAt).getTime() : 0;
    const cacheIsCurrent = parsed.schemaVersion === CACHE_SCHEMA_VERSION && Date.now() - savedAt < CACHE_MAX_AGE_MS;
    if (!cacheIsCurrent) {
      window.localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return parsed.data ? normalizeData(parsed.data) : null;
  } catch {
    window.localStorage.removeItem(CACHE_KEY);
    return null;
  }
}

function setCachedData(data: PortfolioData) {
  cachedData = normalizeData(data);
  cachedRaw = JSON.stringify(cachedData);
  if (isSupabaseEnabled) persistCache(cachedData);
  emitChange();
}

function syncToBackend(action: () => Promise<unknown>) {
  if (!isSupabaseEnabled) return Promise.resolve();
  backendSyncPromise = (backendSyncPromise || Promise.resolve())
    .catch(() => undefined)
    .then(async () => {
      await action();
      await portfolioRepository.refresh();
    });
  void backendSyncPromise.catch(reportBackendError);
  return backendSyncPromise;
}

function uuid() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : uid("id");
}

function byOrder<T extends { displayOrder?: number }>(items: T[]) {
  return [...items].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
}

function save(data: PortfolioData) {
  cachedData = data;
  cachedRaw = JSON.stringify(data);
  if (isSupabaseEnabled) persistCache(data);
  else writeJson(STORAGE_KEY, data);
  emitChange();
}

function getData(): PortfolioData {
  if (isSupabaseEnabled) {
    if (cachedData) return cachedData;
    cachedData = readCache() || emptySupabaseData();
    cachedRaw = JSON.stringify(cachedData);
    void portfolioRepository.refresh().catch(reportBackendError);
    return cachedData;
  }
  if (typeof window === "undefined") return cloneSeed();
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (cachedData && cachedRaw === raw) return cachedData;

  const fallback = cloneSeed();
  let stored: Partial<PortfolioData>;
  try {
    stored = raw ? (JSON.parse(raw) as Partial<PortfolioData>) : fallback;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    cachedData = fallback;
    cachedRaw = null;
    return fallback;
  }

  const data = normalizeData(stored);
  const normalizedRaw = JSON.stringify(data);
  if (normalizedRaw !== raw) {
    window.localStorage.setItem(STORAGE_KEY, normalizedRaw);
    cachedRaw = normalizedRaw;
  } else {
    cachedRaw = raw;
  }
  cachedData = data;
  return data;
}

function updateData(mutator: (data: PortfolioData) => void) {
  const data = cloneData(getData());
  mutator(data);
  save(data);
  return data;
}

function upsert<T extends { id: string }>(items: T[], item: T) {
  const index = items.findIndex((entry) => entry.id === item.id);
  if (index >= 0) items[index] = item;
  else items.unshift(item);
}

export const portfolioRepository = {
  subscribe(callback: () => void) {
    if (isSupabaseEnabled && !realtimeUnsubscribe && typeof window !== "undefined") {
      realtimeUnsubscribe = supabasePortfolioRepository.subscribe(() => {
        void portfolioRepository.refresh().catch(reportBackendError);
      }, false);
    }
    window.addEventListener(CHANGE_EVENT, callback);
    window.addEventListener("storage", callback);
    const refreshOnResume = () => {
      if (document.visibilityState === "visible") void portfolioRepository.refresh().catch(reportBackendError);
    };
    window.addEventListener("focus", refreshOnResume);
    window.addEventListener("online", refreshOnResume);
    document.addEventListener("visibilitychange", refreshOnResume);
    return () => {
      window.removeEventListener(CHANGE_EVENT, callback);
      window.removeEventListener("storage", callback);
      window.removeEventListener("focus", refreshOnResume);
      window.removeEventListener("online", refreshOnResume);
      document.removeEventListener("visibilitychange", refreshOnResume);
    };
  },
  getSnapshot: getData,
  async refresh() {
    if (!isSupabaseEnabled) return getData();
    if (!refreshPromise) {
      refreshPromise = supabasePortfolioRepository.loadPortfolioData(false)
        .then((data) => {
          setCachedData(data);
          return data;
        })
        .finally(() => {
          refreshPromise = null;
        });
    }
    return refreshPromise;
  },
  async flushPendingWrites() {
    if (backendSyncPromise) await backendSyncPromise;
    return isSupabaseEnabled ? portfolioRepository.refresh() : getData();
  },
  getProfile: () => getData().profile,
  updateProfile(profile: PortfolioData["profile"]) {
    const next = updateData((data) => { data.profile = profile; }).profile;
    syncToBackend(() => supabasePortfolioRepository.upsertProfile(next));
    return next;
  },
  getProjects: () => byOrder(getData().projects),
  getProjectById: (id: string) => getData().projects.find((project) => project.id === id),
  getProjectBySlug: (slug: string) => getData().projects.find((project) => project.slug === slug),
  createProject(project: Partial<Project>) {
    const data = cloneData(getData());
    const base = data.projects[0];
    const fallback = base || portfolioSeed.projects[0];
    const title = project.title || "New Project";
    const created: Project = {
      ...fallback,
      ...project,
      id: uuid(),
      title,
      slug: project.slug || slugify(title),
      status: project.status || "draft",
      featured: project.featured ?? false,
      displayOrder: data.projects.length + 1,
    };
    data.projects.unshift(created);
    save(data);
    syncToBackend(() => supabasePortfolioRepository.upsertProject(created));
    return created;
  },
  updateProject(project: Project) {
    const next = updateData((data) => upsert(data.projects, project)).projects.find((item) => item.id === project.id);
    syncToBackend(() => supabasePortfolioRepository.upsertProject(project));
    return next;
  },
  deleteProject(id: string) {
    updateData((data) => { data.projects = data.projects.filter((project) => project.id !== id); });
    syncToBackend(() => supabasePortfolioRepository.deleteProject(id));
  },
  duplicateProject(id: string) {
    const source = portfolioRepository.getProjectById(id);
    if (!source) return undefined;
    return portfolioRepository.createProject({ ...source, id: undefined, title: `${source.title} Copy`, slug: `${source.slug}-copy`, status: "draft", featured: false });
  },
  getTechStack: () => byOrder(getData().techStack),
  createTechnology(item: Partial<Technology>) {
    const data = cloneData(getData());
    const tech: Technology = {
      id: uuid(),
      name: item.name || "New Technology",
      iconKey: item.iconKey || "code",
      logoUrl: item.logoUrl || "",
      category: item.category || "Frontend",
      level: item.level || "Familiar",
      description: item.description || "Technology used in selected projects.",
      featured: item.featured ?? false,
      active: item.active ?? true,
      displayOrder: data.techStack.length + 1,
    };
    data.techStack.unshift(tech);
    save(data);
    syncToBackend(() => supabasePortfolioRepository.upsertTechnology(tech));
    return tech;
  },
  updateTechnology(item: Technology) {
    updateData((data) => upsert(data.techStack, item));
    syncToBackend(() => supabasePortfolioRepository.upsertTechnology(item));
  },
  deleteTechnology(id: string) {
    updateData((data) => { data.techStack = data.techStack.filter((item) => item.id !== id); });
    syncToBackend(() => supabasePortfolioRepository.deleteTechnology(id));
  },
  getCreativeWorks: () => byOrder(getData().creativeWorks),
  getCreativeWorkBySlug: (slug: string) => getData().creativeWorks.find((work) => work.slug === slug),
  createCreativeWork(item: Partial<CreativeWork>) {
    const base = getData().creativeWorks[0] || portfolioSeed.creativeWorks[0];
    const title = item.title || "New Creative Work";
    const created: CreativeWork = { ...base, ...item, id: uuid(), title, slug: item.slug || slugify(title), status: item.status || "draft", featured: item.featured ?? false };
    updateData((data) => data.creativeWorks.unshift(created));
    syncToBackend(() => supabasePortfolioRepository.upsertCreativeWork(created));
    return created;
  },
  updateCreativeWork(item: CreativeWork) {
    updateData((data) => upsert(data.creativeWorks, item));
    syncToBackend(() => supabasePortfolioRepository.upsertCreativeWork(item));
  },
  deleteCreativeWork(id: string) {
    updateData((data) => { data.creativeWorks = data.creativeWorks.filter((item) => item.id !== id); });
    syncToBackend(() => supabasePortfolioRepository.deleteCreativeWork(id));
  },
  getExperiences: () => byOrder(getData().experiences),
  createExperience(item: Partial<Experience>) {
    const created: Experience = { id: uuid(), role: item.role || "New Experience", organization: item.organization || "Organization", type: item.type || "Project", period: item.period || "2026", location: item.location || "Indonesia", description: item.description || "Experience description.", responsibilities: item.responsibilities || [], technologies: item.technologies || [], relatedProjectSlug: item.relatedProjectSlug, published: item.published ?? true, displayOrder: item.displayOrder ?? getData().experiences.length + 1 };
    updateData((data) => data.experiences.unshift(created));
    syncToBackend(() => supabasePortfolioRepository.upsertExperience(created));
    return created;
  },
  updateExperience(item: Experience) {
    updateData((data) => upsert(data.experiences, item));
    syncToBackend(() => supabasePortfolioRepository.upsertExperience(item));
  },
  deleteExperience(id: string) {
    updateData((data) => { data.experiences = data.experiences.filter((item) => item.id !== id); });
    syncToBackend(() => supabasePortfolioRepository.deleteExperience(id));
  },
  getCertificates: () => byOrder(getData().certificates),
  createCertificate(item: Partial<Certificate>) {
    const base = getData().certificates[0] || portfolioSeed.certificates[0];
    const created: Certificate = { ...base, ...item, id: uuid(), title: item.title || "New Certificate", featured: item.featured ?? false, published: item.published ?? true };
    updateData((data) => data.certificates.unshift(created));
    syncToBackend(() => supabasePortfolioRepository.upsertCertificate(created));
    return created;
  },
  updateCertificate(item: Certificate) {
    updateData((data) => upsert(data.certificates, item));
    syncToBackend(() => supabasePortfolioRepository.upsertCertificate(item));
  },
  deleteCertificate(id: string) {
    updateData((data) => { data.certificates = data.certificates.filter((item) => item.id !== id); });
    syncToBackend(() => supabasePortfolioRepository.deleteCertificate(id));
  },
  getArticles: () => byOrder(getData().articles),
  getArticleById: (id: string) => getData().articles.find((article) => article.id === id),
  getArticleBySlug: (slug: string) => getData().articles.find((article) => article.slug === slug),
  createArticle(item: Partial<Article>) {
    const now = new Date().toISOString();
    const title = item.title || "Artikel Baru";
    const created: Article = {
      id: uuid(),
      slug: item.slug || slugify(title),
      title,
      excerpt: item.excerpt || "Ringkasan artikel.",
      category: item.category || "Web Development",
      tags: item.tags || [],
      coverImage: item.coverImage || "",
      coverAlt: item.coverAlt || title,
      author: item.author || getData().profile.fullName,
      status: item.status || "draft",
      featured: item.featured ?? false,
      publishedAt: item.publishedAt || now,
      updatedAt: now,
      readingTime: item.readingTime || 1,
      seoTitle: item.seoTitle || title,
      seoDescription: item.seoDescription || item.excerpt || "",
      blocks: item.blocks || [{ id: uuid(), type: "paragraph", text: "Mulai menulis artikel di sini." }],
      displayOrder: item.displayOrder ?? getData().articles.length + 1,
    };
    updateData((data) => data.articles.unshift(created));
    syncToBackend(() => supabasePortfolioRepository.upsertArticle(created));
    return created;
  },
  updateArticle(item: Article) {
    const next = { ...item, updatedAt: new Date().toISOString() };
    updateData((data) => upsert(data.articles, next));
    syncToBackend(() => supabasePortfolioRepository.upsertArticle(next));
  },
  deleteArticle(id: string) {
    updateData((data) => { data.articles = data.articles.filter((item) => item.id !== id); });
    syncToBackend(() => supabasePortfolioRepository.deleteArticle(id));
  },
  getComments: () => [...getData().comments].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.date.localeCompare(a.date)),
  createComment(item: Omit<VisitorComment, "id" | "date" | "likes" | "pinned" | "status">) {
    const comment: VisitorComment = { ...item, id: uuid(), date: new Date().toISOString().slice(0, 10), likes: 0, pinned: false, status: "pending" };
    if (!isSupabaseEnabled) updateData((data) => data.comments.unshift(comment));
    syncToBackend(() => supabasePortfolioRepository.submitComment(item));
    return comment;
  },
  updateComment(item: VisitorComment) {
    updateData((data) => upsert(data.comments, item));
    syncToBackend(() => supabasePortfolioRepository.upsertComment(item));
  },
  deleteComment(id: string) {
    updateData((data) => { data.comments = data.comments.filter((item) => item.id !== id); });
    syncToBackend(() => supabasePortfolioRepository.deleteComment(id));
  },
  likeComment(comment: VisitorComment) {
    updateData((data) => {
      const target = data.comments.find((item) => item.id === comment.id);
      if (target) target.likes += 1;
    });
    syncToBackend(() => supabasePortfolioRepository.likeComment(comment.id));
  },
  getMessages: () => [...getData().messages].sort((a, b) => b.date.localeCompare(a.date)),
  createMessage(item: Omit<ContactMessage, "id" | "date" | "status">) {
    const message: ContactMessage = { ...item, id: uuid(), date: new Date().toISOString().slice(0, 10), status: "New" };
    if (!isSupabaseEnabled) updateData((data) => data.messages.unshift(message));
    syncToBackend(() => supabasePortfolioRepository.submitContact(item));
    return message;
  },
  updateMessage(item: ContactMessage) {
    updateData((data) => upsert(data.messages, item));
    syncToBackend(() => supabasePortfolioRepository.upsertMessage(item));
  },
  deleteMessage(id: string) {
    updateData((data) => { data.messages = data.messages.filter((item) => item.id !== id); });
    syncToBackend(() => supabasePortfolioRepository.deleteMessage(id));
  },
  getMedia: () => getData().media,
  createMedia(item: Omit<MediaItem, "id" | "createdAt">) {
    const media: MediaItem = { ...item, id: uuid(), createdAt: new Date().toISOString() };
    updateData((data) => data.media.unshift(media));
    syncToBackend(() => supabasePortfolioRepository.upsertMedia(media));
    return media;
  },
  deleteMedia(id: string) {
    updateData((data) => { data.media = data.media.filter((item) => item.id !== id); });
    syncToBackend(() => supabasePortfolioRepository.deleteMedia(id));
  },
  getSettings: () => getData().settings,
  updateSettings(settings: SiteSettings) {
    const next = updateData((data) => { data.settings = settings; }).settings;
    syncToBackend(() => supabasePortfolioRepository.upsertSettings(next));
    return next;
  },
  exportData: () => JSON.stringify(getData(), null, 2),
  importData(json: string) {
    const parsed = JSON.parse(json) as PortfolioData;
    save(parsed);
    return parsed;
  },
  resetDemoData() {
    const seed = cloneSeed();
    save(seed);
    return seed;
  },
};
