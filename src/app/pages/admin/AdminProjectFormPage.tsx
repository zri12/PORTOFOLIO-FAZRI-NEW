import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { AdminImageField, AdminGalleryField } from "../../components/admin/AdminImageFields";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import { AdminInput, FormSection } from "../../components/admin/FormSection";
import { usePortfolioData } from "../../hooks/usePortfolioData";
import { slugify } from "../../lib/storage";
import { emptyProjectTranslation, ensureProjectTranslations } from "../../lib/localizedContent";
import { formatAdminSaveError } from "../../lib/supabase/errorMessages";
import { portfolioRepository } from "../../repositories/portfolioRepository";
import type { ContentLanguage, Project, ProjectTranslation } from "../../types/portfolio";

const toLines = (items: string[]) => items.join("\n");
const fromLines = (value: string) => value.split("\n").map((item) => item.trim()).filter(Boolean);
const imageHints = {
  cover: "Uploaded and displayed at its original aspect ratio without cropping.",
  hero: "Uploaded and displayed at its original aspect ratio without cropping.",
  mobile: "Uploaded and displayed at its original aspect ratio without cropping.",
  gallery: "Every gallery image keeps its original aspect ratio and full frame.",
};

type ProjectDraft = Omit<Project, "clientType"> & {
  clientType: Project["clientType"] | "";
};

function createDraftProject(): ProjectDraft {
  const en = emptyProjectTranslation();
  const id = emptyProjectTranslation();
  return {
    id: crypto.randomUUID(),
    slug: "",
    title: "",
    fullName: "",
    category: "",
    type: "",
    role: "",
    year: "",
    status: "draft",
    featured: false,
    clientType: "",
    techStack: [],
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
    gallery: [],
    challenges: [],
    decisions: [],
    testing: "",
    deployment: "",
    result: "",
    liveUrl: "",
    sourceUrl: "",
    coverImage: "",
    heroImage: "",
    mobilePreviewImage: "",
    relatedProjectSlug: "",
    displayOrder: 0,
    translations: { en, id },
  };
}

function prepareProjectForEditor(project: Project): ProjectDraft {
  const translations = ensureProjectTranslations(project) ?? {};
  return {
    ...project,
    translations: {
      en: { ...emptyProjectTranslation(), ...translations.en },
      id: { ...emptyProjectTranslation(), ...translations.id },
    },
  };
}

export default function AdminProjectFormPage() {
  const { id } = useParams();
  const { projects, techStack } = usePortfolioData();
  const navigate = useNavigate();
  const source = id ? projects.find((project) => project.id === id) : undefined;
  const formKey = id || "new";
  const [draft, setDraft] = useState<ProjectDraft>(() => source ? prepareProjectForEditor(source) : createDraftProject());
  const [loadedFormKey, setLoadedFormKey] = useState(formKey);
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingLanguage, setEditingLanguage] = useState<ContentLanguage>("en");

  useEffect(() => {
    if (loadedFormKey !== formKey) {
      setDraft(source ? prepareProjectForEditor(source) : createDraftProject());
      setLoadedFormKey(formKey);
      setIsDirty(false);
      return;
    }

    if (isDirty) return;
    if (source) setDraft(prepareProjectForEditor(source));
  }, [formKey, isDirty, loadedFormKey, source]);

  const updateDraft = (updater: (current: ProjectDraft) => ProjectDraft) => {
    setError("");
    setIsDirty(true);
    setDraft(updater);
  };

  const set = <K extends keyof ProjectDraft>(key: K, value: ProjectDraft[K]) => {
    updateDraft((current) => ({ ...current, [key]: value }));
  };
  const translation = { ...emptyProjectTranslation(), ...(draft.translations?.[editingLanguage] ?? {}) };
  const setTranslation = <K extends keyof ProjectTranslation>(key: K, value: ProjectTranslation[K]) => {
    updateDraft((current) => ({
      ...current,
      translations: {
        ...current.translations,
        [editingLanguage]: { ...emptyProjectTranslation(), ...current.translations?.[editingLanguage], [key]: value },
      },
    }));
  };
  const save = async (status: Project["status"]) => {
    if (!draft.clientType) {
      setError("Select a client type before saving.");
      return;
    }
    const translations = {
      en: { ...emptyProjectTranslation(), ...draft.translations?.en },
      id: { ...emptyProjectTranslation(), ...draft.translations?.id },
    };
    const complete = (item: ProjectTranslation) => item.title.trim() && item.shortDescription.trim() && item.overview.trim();
    if (status === "published" && (!complete(translations.en) || !complete(translations.id))) {
      setError("Publishing requires title, short description, and overview in both English and Indonesian.");
      return;
    }
    const primary = complete(translations.en) ? translations.en : translations.id;
    if (!primary.title.trim()) {
      setError("Add a project title in at least one language.");
      return;
    }
    const next: Project = { ...draft, ...primary, translations, clientType: draft.clientType, status, slug: draft.slug || slugify(primary.title) };
    setSaving(true);
    setError("");
    try {
      portfolioRepository.updateProject(next);
      await portfolioRepository.flushPendingWrites();
      setIsDirty(false);
      navigate("/admin/projects");
    } catch (saveError) {
      setError(formatAdminSaveError(saveError, "Project could not be saved to Supabase."));
    } finally {
      setSaving(false);
    }
  };

  const relatedOptions = projects.filter((project) => project.id !== draft.id);

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader title={id ? "Edit Project" : "New Project"} description="Manage all project metadata, screenshots, case-study sections, gallery images, and related project links." />
      <div className="grid gap-6">
        <LanguageEditorTabs value={editingLanguage} onChange={setEditingLanguage} />
        <FormSection title="Project Identity">
          <div className="grid gap-4 md:grid-cols-2">
            <AdminInput label={`Title (${editingLanguage.toUpperCase()})`} value={translation.title} onChange={(value) => { setTranslation("title", value); if (!id && !draft.slug) set("slug", slugify(value)); }} />
            <AdminInput label="Slug" value={draft.slug} onChange={(value) => set("slug", slugify(value))} />
            <AdminInput label="Full Name" value={translation.fullName} onChange={(value) => setTranslation("fullName", value)} />
            <AdminInput label="Category" value={translation.category} onChange={(value) => setTranslation("category", value)} />
            <AdminInput label="Type" value={translation.type} onChange={(value) => setTranslation("type", value)} />
            <AdminInput label="Year" value={draft.year} onChange={(value) => set("year", value)} />
            <AdminInput label="Role" value={translation.role} onChange={(value) => setTranslation("role", value)} />
            <AdminInput label="Display Order" value={draft.displayOrder ? String(draft.displayOrder) : ""} onChange={(value) => set("displayOrder", Number(value) || 0)} />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <label>
              <span className="mb-2 block text-sm font-semibold text-[var(--color-text-secondary)]">Client Type</span>
              <select value={draft.clientType} onChange={(event) => set("clientType", event.target.value as ProjectDraft["clientType"])} className="w-full border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-3 text-sm outline-none">
                <option value="">Select client type</option>
                <option>Academic Project</option>
                <option>Client Work</option>
                <option>Personal Project</option>
              </select>
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-[var(--color-text-secondary)]">Status</span>
              <select value={draft.status} onChange={(event) => set("status", event.target.value as Project["status"])} className="w-full border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-3 text-sm outline-none">
                <option>draft</option>
                <option>published</option>
                <option>archived</option>
              </select>
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-[var(--color-text-secondary)]">Related Project</span>
              <select value={draft.relatedProjectSlug || ""} onChange={(event) => set("relatedProjectSlug", event.target.value || undefined)} className="w-full border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-3 text-sm outline-none">
                <option value="">Auto by category</option>
                {relatedOptions.map((project) => <option key={project.id} value={project.slug}>{project.title}</option>)}
              </select>
            </label>
          </div>
          <label className="flex items-center gap-3 text-sm font-semibold text-[var(--color-text-secondary)]">
            <input type="checkbox" checked={draft.featured} onChange={(event) => set("featured", event.target.checked)} />
            Featured on home page
          </label>
          <AdminInput label="Short Description" value={translation.shortDescription} onChange={(value) => setTranslation("shortDescription", value)} textarea />
          <AdminInput label="Full Description" value={translation.fullDescription} onChange={(value) => setTranslation("fullDescription", value)} textarea />
          <div className="grid gap-4 md:grid-cols-2">
            <AdminInput label="Live URL" value={draft.liveUrl} onChange={(value) => set("liveUrl", value)} />
            <AdminInput label="Source URL" value={draft.sourceUrl} onChange={(value) => set("sourceUrl", value)} />
          </div>
        </FormSection>

        <FormSection title="Images">
          <div className="grid gap-4 lg:grid-cols-3">
            <AdminImageField label="Project Cover Image" value={draft.coverImage} folder={`projects/${draft.slug || draft.id}/cover`} hint={imageHints.cover} cropMode="original" onChange={(value) => set("coverImage", value)} />
            <AdminImageField label="Project Detail Hero Image" value={draft.heroImage} folder={`projects/${draft.slug || draft.id}/hero`} hint={imageHints.hero} cropMode="original" onChange={(value) => set("heroImage", value)} />
            <AdminImageField label="Mobile / Responsive Preview" value={draft.mobilePreviewImage} folder={`projects/${draft.slug || draft.id}/responsive`} hint={imageHints.mobile} cropMode="original" onChange={(value) => set("mobilePreviewImage", value)} />
          </div>
          <AdminGalleryField label="Interface Gallery" values={draft.gallery} folder={`projects/${draft.slug || draft.id}/gallery`} hint={imageHints.gallery} onChange={(values) => set("gallery", values)} />
        </FormSection>

        <FormSection title="Tech Stack">
          <div className="grid gap-2 md:grid-cols-3">
            {techStack.map((tech) => (
              <label key={tech.id} className="flex items-center gap-3 border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-3 text-sm">
                <input
                  type="checkbox"
                  checked={draft.techStack.includes(tech.name)}
                  onChange={(event) => {
                    const next = event.target.checked ? [...draft.techStack, tech.name] : draft.techStack.filter((item) => item !== tech.name);
                    set("techStack", next);
                  }}
                />
                {tech.logoUrl ? <img src={tech.logoUrl} alt="" className="h-6 w-6 object-contain" /> : <span className="font-mono text-[10px] text-[var(--color-accent-main)]">{tech.name.slice(0, 2)}</span>}
                <span>{tech.name}</span>
              </label>
            ))}
          </div>
          <AdminInput label="Manual Tech Stack (comma separated, optional if tech is not registered yet)" value={draft.techStack.join(", ")} onChange={(value) => set("techStack", value.split(",").map((item) => item.trim()).filter(Boolean))} />
        </FormSection>

        <FormSection title="Case Study Content">
          <AdminInput label="Overview" value={translation.overview} onChange={(value) => setTranslation("overview", value)} textarea />
          <AdminInput label="Background and Problem" value={translation.background} onChange={(value) => setTranslation("background", value)} textarea />
          <AdminInput label="Solution" value={translation.solution} onChange={(value) => setTranslation("solution", value)} textarea />
          <AdminInput label="System Architecture" value={translation.architecture} onChange={(value) => setTranslation("architecture", value)} textarea />
          <AdminInput label="Data Structure" value={translation.dataStructure} onChange={(value) => setTranslation("dataStructure", value)} textarea />
          <AdminInput label="Testing" value={translation.testing} onChange={(value) => setTranslation("testing", value)} textarea />
          <AdminInput label="Deployment" value={translation.deployment} onChange={(value) => setTranslation("deployment", value)} textarea />
          <AdminInput label="Result" value={translation.result} onChange={(value) => setTranslation("result", value)} textarea />
        </FormSection>

        <FormSection title="Detail Lists">
          <div className="grid gap-4 md:grid-cols-2">
            <AdminInput label="Objectives (one per line)" value={toLines(translation.objectives)} onChange={(value) => setTranslation("objectives", fromLines(value))} textarea />
            <AdminInput label="Target Users (one per line)" value={toLines(translation.targetUsers)} onChange={(value) => setTranslation("targetUsers", fromLines(value))} textarea />
            <AdminInput label="Role and Responsibilities (one per line)" value={toLines(translation.responsibilities)} onChange={(value) => setTranslation("responsibilities", fromLines(value))} textarea />
            <AdminInput label="Main Features (one per line)" value={toLines(translation.features)} onChange={(value) => setTranslation("features", fromLines(value))} textarea />
            <AdminInput label="Development Process (one per line)" value={toLines(translation.process)} onChange={(value) => setTranslation("process", fromLines(value))} textarea />
            <AdminInput label="Challenges (one per line)" value={toLines(translation.challenges)} onChange={(value) => setTranslation("challenges", fromLines(value))} textarea />
            <AdminInput label="Technical Decisions (one per line)" value={toLines(translation.decisions)} onChange={(value) => setTranslation("decisions", fromLines(value))} textarea />
          </div>
        </FormSection>

        <div className="flex flex-wrap gap-3">
          <button onClick={() => void save("published")} disabled={saving} className="bg-[var(--color-text-main)] px-5 py-3 text-sm font-bold text-[var(--color-bg-primary)] disabled:opacity-60">{saving ? "Saving..." : "Publish"}</button>
          <button onClick={() => void save("draft")} disabled={saving} className="border border-[var(--color-border)] px-5 py-3 text-sm font-bold disabled:opacity-60">Save Draft</button>
          <button onClick={() => navigate("/admin/projects")} className="border border-[var(--color-border)] px-5 py-3 text-sm font-bold text-[var(--color-text-secondary)]">Cancel</button>
          {error && <span className="self-center text-sm text-red-300">{error}</span>}
        </div>
      </div>
    </div>
  );
}

function LanguageEditorTabs({ value, onChange }: { value: ContentLanguage; onChange: (language: ContentLanguage) => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
      <div>
        <p className="text-sm font-bold">Project language</p>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">Fill both versions before publishing. Images, links, technology, and status remain shared.</p>
      </div>
      <div className="flex border border-[var(--color-border)]">
        {(["en", "id"] as const).map((language) => (
          <button key={language} type="button" onClick={() => onChange(language)} className={`px-4 py-2 text-xs font-bold uppercase ${value === language ? "bg-[var(--color-text-main)] text-[var(--color-bg-primary)]" : "text-[var(--color-text-secondary)]"}`}>
            {language === "en" ? "English" : "Indonesia"}
          </button>
        ))}
      </div>
    </div>
  );
}
