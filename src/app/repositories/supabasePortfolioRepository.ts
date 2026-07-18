import { portfolioSeed } from "../data/seed/portfolioSeed";
import { getSupabaseClient, isSupabaseEnabled } from "../lib/supabase/client";
import {
  certificateToRow,
  commentToRow,
  creativeWorkToRow,
  experienceToRow,
  mapCertificate,
  mapComment,
  mapCreativeWork,
  mapExperience,
  mapMessage,
  mapProfile,
  mapProject,
  mapSettings,
  mapTechnology,
  mergeWithFallback,
  messageToRow,
  profileToRow,
  projectToRow,
  settingsToRow,
  technologyToRow,
} from "../lib/supabase/mappers";
import type {
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

type Row = Record<string, unknown>;

const VISITOR_ID_KEY = "fazri-portfolio-visitor-id-v1";

function asRows(value: unknown): Row[] {
  return Array.isArray(value) ? value as Row[] : [];
}

function asRow(value: unknown): Row | null {
  return value && typeof value === "object" ? value as Row : null;
}

function getVisitorId() {
  if (typeof window === "undefined") return crypto.randomUUID();
  const existing = window.localStorage.getItem(VISITOR_ID_KEY);
  if (existing) return existing;
  const next = crypto.randomUUID();
  window.localStorage.setItem(VISITOR_ID_KEY, next);
  return next;
}

function toMediaItem(row: Row): MediaItem {
  const bucket = String(row.bucket_id || "portfolio-public");
  const path = String(row.object_path || "");
  const supabase = getSupabaseClient();
  const publicUrl = supabase && path ? supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl : path;
  return {
    id: String(row.id || ""),
    name: String(row.name || path),
    type: String(row.mime_type || row.media_type || "file"),
    size: Number(row.size_bytes || 0),
    url: publicUrl,
    note: String(row.notes || row.alt || "Stored in Supabase Storage."),
    createdAt: String(row.created_at || new Date().toISOString()),
  };
}

export const supabasePortfolioRepository = {
  enabled: isSupabaseEnabled,

  async loadPortfolioData(includePrivate = false): Promise<PortfolioData> {
    const supabase = getSupabaseClient();
    if (!supabase) return portfolioSeed;

    const [
      profileResult,
      settingsResult,
      projectsResult,
      technologiesResult,
      projectTechnologiesResult,
      creativeWorksResult,
      experiencesResult,
      certificatesResult,
      commentsResult,
      messagesResult,
      mediaResult,
    ] = await Promise.all([
      supabase.from("site_profiles").select("*").eq("singleton_key", "main").maybeSingle(),
      supabase.from("site_settings").select("*").eq("singleton_key", "main").maybeSingle(),
      supabase.from("projects").select("*").order("display_order"),
      supabase.from("technologies").select("*").order("display_order"),
      supabase.from("project_technologies").select("project_id, technology_id, display_order"),
      supabase.from("creative_works").select("*").order("display_order"),
      supabase.from("experiences").select("*, projects(slug)").order("display_order"),
      supabase.from("certificates").select("*").order("display_order"),
      supabase.from("visitor_comments").select("*").order("pinned", { ascending: false }).order("created_at", { ascending: false }),
      includePrivate ? supabase.from("contact_messages").select("*").order("created_at", { ascending: false }) : Promise.resolve({ data: [], error: null }),
      supabase.from("media_assets").select("*").order("created_at", { ascending: false }),
    ]);

    const results = [profileResult, settingsResult, projectsResult, technologiesResult, projectTechnologiesResult, creativeWorksResult, experiencesResult, certificatesResult, commentsResult, messagesResult, mediaResult];
    const failure = results.find((result) => "error" in result && result.error);
    if (failure && "error" in failure) throw failure.error;

    const techRows = asRows(technologiesResult.data);
    const technologies = techRows.map(mapTechnology);
    const techById = new Map(technologies.map((technology) => [technology.id, technology.name]));
    const projectTechRows = asRows(projectTechnologiesResult.data);
    const projectTechNames = new Map<string, string[]>();
    projectTechRows
      .sort((a, b) => Number(a.display_order || 0) - Number(b.display_order || 0))
      .forEach((relation) => {
        const projectId = String(relation.project_id || "");
        const techName = techById.get(String(relation.technology_id || ""));
        if (!projectId || !techName) return;
        projectTechNames.set(projectId, [...(projectTechNames.get(projectId) || []), techName]);
      });

    const projects = asRows(projectsResult.data).map((row) => mapProject(row, projectTechNames.get(String(row.id)) || []));
    const projectSlugById = new Map(projects.map((project) => [project.id, project.slug]));

    return mergeWithFallback({
      profile: mapProfile(asRow(profileResult.data), portfolioSeed.profile),
      settings: mapSettings(asRow(settingsResult.data), portfolioSeed.settings),
      projects,
      techStack: technologies,
      creativeWorks: asRows(creativeWorksResult.data).map(mapCreativeWork),
      experiences: asRows(experiencesResult.data).map((row) => mapExperience(row, projectSlugById.get(String(row.related_project_id || "")))),
      certificates: asRows(certificatesResult.data).map(mapCertificate),
      comments: asRows(commentsResult.data).map((row) => mapComment(row)),
      messages: asRows(messagesResult.data).map(mapMessage),
      media: asRows(mediaResult.data).map(toMediaItem),
    }, portfolioSeed);
  },

  subscribe(callback: () => void, includePrivate = false) {
    const supabase = getSupabaseClient();
    const realtimeEnabled = import.meta.env.VITE_ENABLE_REALTIME === "true";
    if (!supabase || !realtimeEnabled) return () => {};
    let timer: number | undefined;
    const schedule = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(callback, 250);
    };
    const tables = [
      "projects",
      "technologies",
      "project_technologies",
      "creative_works",
      "experiences",
      "certificates",
      "visitor_comments",
      "site_profiles",
      "site_settings",
      ...(includePrivate ? ["contact_messages"] : []),
    ];
    const channel = supabase.channel(includePrivate ? "portfolio-admin-data" : "portfolio-public-data");
    tables.forEach((table) => channel.on("postgres_changes", { event: "*", schema: "public", table }, schedule));
    channel.subscribe();
    return () => {
      window.clearTimeout(timer);
      void supabase.removeChannel(channel);
    };
  },

  async upsertProfile(profile: PortfolioData["profile"]) {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { error } = await supabase.from("site_profiles").upsert(profileToRow(profile), { onConflict: "singleton_key" });
    if (error) throw error;
  },

  async upsertSettings(settings: SiteSettings) {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { error } = await supabase.from("site_settings").upsert(settingsToRow(settings), { onConflict: "singleton_key" });
    if (error) throw error;
  },

  async upsertProject(project: Project) {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { data, error } = await supabase.from("projects").upsert({ id: project.id, ...projectToRow(project) }, { onConflict: "id" }).select("id").single();
    if (error) throw error;
    const projectId = String((data as Row).id);
    await supabase.from("project_technologies").delete().eq("project_id", projectId);
    for (const [index, name] of project.techStack.entries()) {
      const { data: tech } = await supabase.from("technologies").select("id").eq("name", name).maybeSingle();
      const techId = asRow(tech)?.id;
      if (techId) await supabase.from("project_technologies").upsert({ project_id: projectId, technology_id: techId, display_order: index + 1 });
    }
  },

  async deleteProject(id: string) {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) throw error;
  },

  async upsertTechnology(item: Technology) {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { error } = await supabase.from("technologies").upsert({ id: item.id, ...technologyToRow(item) }, { onConflict: "id" });
    if (error) throw error;
  },

  async deleteTechnology(id: string) {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { count } = await supabase.from("project_technologies").select("*", { count: "exact", head: true }).eq("technology_id", id);
    if ((count || 0) > 0) throw new Error("Technology is assigned to a project. Remove relations first.");
    const { error } = await supabase.from("technologies").delete().eq("id", id);
    if (error) throw error;
  },

  async upsertCreativeWork(item: CreativeWork) {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { error } = await supabase.from("creative_works").upsert({ id: item.id, ...creativeWorkToRow(item) }, { onConflict: "id" });
    if (error) throw error;
  },

  async deleteCreativeWork(id: string) {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { error } = await supabase.from("creative_works").delete().eq("id", id);
    if (error) throw error;
  },

  async upsertExperience(item: Experience) {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const row = experienceToRow(item);
    if (item.relatedProjectSlug) {
      const { data } = await supabase.from("projects").select("id").eq("slug", item.relatedProjectSlug).maybeSingle();
      row.related_project_id = asRow(data)?.id || null;
    }
    const { error } = await supabase.from("experiences").upsert({ id: item.id, ...row }, { onConflict: "id" });
    if (error) throw error;
  },

  async deleteExperience(id: string) {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { error } = await supabase.from("experiences").delete().eq("id", id);
    if (error) throw error;
  },

  async upsertCertificate(item: Certificate) {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { error } = await supabase.from("certificates").upsert({ id: item.id, ...certificateToRow(item) }, { onConflict: "id" });
    if (error) throw error;
  },

  async deleteCertificate(id: string) {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { error } = await supabase.from("certificates").delete().eq("id", id);
    if (error) throw error;
  },

  async submitContact(item: Omit<ContactMessage, "id" | "date" | "status">) {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { error } = await supabase.functions.invoke("submit-contact", { body: item });
    if (error) throw error;
  },

  async submitComment(item: Omit<VisitorComment, "id" | "date" | "likes" | "pinned" | "status">) {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { error } = await supabase.functions.invoke("submit-comment", { body: item });
    if (error) throw error;
  },

  async likeComment(commentId: string) {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { error } = await supabase.functions.invoke("like-comment", { body: { commentId, visitorId: getVisitorId() } });
    if (error) throw error;
  },

  async upsertComment(item: VisitorComment) {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { error } = await supabase.from("visitor_comments").upsert({ id: item.id, ...commentToRow(item) }, { onConflict: "id" });
    if (error) throw error;
  },

  async deleteComment(id: string) {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { error } = await supabase.from("visitor_comments").delete().eq("id", id);
    if (error) throw error;
  },

  async upsertMessage(item: ContactMessage) {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { error } = await supabase.from("contact_messages").upsert({ id: item.id, ...messageToRow(item) }, { onConflict: "id" });
    if (error) throw error;
  },

  async deleteMessage(id: string) {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    if (error) throw error;
  },

  async deleteMedia(id: string) {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { error } = await supabase.from("media_assets").delete().eq("id", id);
    if (error) throw error;
  },
};
