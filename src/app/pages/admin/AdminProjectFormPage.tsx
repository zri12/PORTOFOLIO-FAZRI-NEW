import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Check, ChevronDown, Plus, Search, X } from "lucide-react";
import { AdminImageField, AdminGalleryField } from "../../components/admin/AdminImageFields";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import { AdminInput, FormSection } from "../../components/admin/FormSection";
import { inferTechnologyCategory, technologyCatalog } from "../../data/technologyCatalog";
import { usePortfolioData } from "../../hooks/usePortfolioData";
import {
  createAutomaticProjectTranslations,
  projectTranslationIsPublishable,
} from "../../lib/automaticTranslation";
import { slugify } from "../../lib/storage";
import { emptyProjectTranslation, ensureProjectTranslations } from "../../lib/localizedContent";
import { formatAdminSaveError } from "../../lib/supabase/errorMessages";
import { portfolioRepository } from "../../repositories/portfolioRepository";
import type { ContentLanguage, Project, ProjectTranslation, Technology } from "../../types/portfolio";
import { Languages } from "lucide-react";

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
  const [translationStatus, setTranslationStatus] = useState("");
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
    const sourceTranslations = {
      en: { ...emptyProjectTranslation(), ...draft.translations?.en },
      id: { ...emptyProjectTranslation(), ...draft.translations?.id },
    };
    if (!sourceTranslations.en.title.trim() && !sourceTranslations.id.title.trim()) {
      setError("Add a project title in at least one language.");
      return;
    }
    
    if (
      status === "published"
      && (!projectTranslationIsPublishable(sourceTranslations.en) || !projectTranslationIsPublishable(sourceTranslations.id))
    ) {
      setError("Both English and Indonesian versions must have a title, short description, and overview before publishing. Use Auto-Translate to generate the other language.");
      return;
    }
    
    setSaving(true);
    setError("");
    try {
      const primary = sourceTranslations.en;
      const next: Project = {
        ...draft,
        ...primary,
        translations: sourceTranslations,
        clientType: draft.clientType,
        status,
        slug: draft.slug || slugify(primary.title || sourceTranslations.id.title),
      };
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

  const handleTranslate = async () => {
    const targetLang = editingLanguage === "en" ? "id" : "en";
    const sourceTranslations = {
      en: { ...emptyProjectTranslation(), ...draft.translations?.en },
      id: { ...emptyProjectTranslation(), ...draft.translations?.id },
    };
    setError("");
    setTranslationStatus(`Translating to ${targetLang === "en" ? "English" : "Indonesian"}...`);
    try {
      const translated = await createAutomaticProjectTranslations(sourceTranslations, editingLanguage, setTranslationStatus);
      updateDraft((current) => ({
        ...current,
        translations: translated,
      }));
      setIsDirty(true);
      setTranslationStatus("Translation complete!");
      setTimeout(() => setTranslationStatus(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Translation failed.");
      setTranslationStatus("");
    }
  };

  const relatedOptions = projects.filter((project) => project.id !== draft.id);

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader title={id ? "Edit Project" : "New Project"} description="Manage all project metadata, screenshots, case-study sections, gallery images, and related project links." />
      <div className="grid gap-6">
        <LanguageEditorTabs value={editingLanguage} onChange={setEditingLanguage} onTranslate={handleTranslate} isTranslating={!!translationStatus && translationStatus !== "Translation complete!"} />
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
          <TechnologyMultiSelect
            technologies={techStack}
            value={draft.techStack}
            onChange={(next) => set("techStack", next)}
          />
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
          {translationStatus && <span className="self-center text-sm text-[var(--color-accent-main)]" role="status">{translationStatus}</span>}
          {error && <span className="self-center text-sm text-red-300">{error}</span>}
        </div>
      </div>
    </div>
  );
}

type TechnologyOption = {
  name: string;
  category: Technology["category"];
  logoUrl?: string;
};

function TechnologyMultiSelect({
  technologies,
  value,
  onChange,
}: {
  technologies: Technology[];
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const closeWhenOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", closeWhenOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeWhenOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const options = useMemo(() => {
    const byName = new Map<string, TechnologyOption>();
    technologyCatalog.forEach((item) => byName.set(item.name.toLocaleLowerCase(), item));
    technologies.forEach((item) => byName.set(item.name.toLocaleLowerCase(), {
      name: item.name,
      category: item.category,
      logoUrl: item.logoUrl,
    }));
    value.forEach((name) => {
      const key = name.toLocaleLowerCase();
      if (!byName.has(key)) byName.set(key, { name, category: inferTechnologyCategory(name) });
    });
    return Array.from(byName.values());
  }, [technologies, value]);

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredOptions = options.filter((option) =>
    `${option.name} ${option.category}`.toLocaleLowerCase().includes(normalizedQuery),
  );
  const hasExactOption = options.some((option) => option.name.toLocaleLowerCase() === normalizedQuery);
  const categories: Technology["category"][] = ["Frontend", "Backend", "Database", "Deployment", "Creative"];

  const toggle = (name: string) => {
    const existing = value.find((item) => item.toLocaleLowerCase() === name.toLocaleLowerCase());
    onChange(existing ? value.filter((item) => item !== existing) : [...value, name]);
  };

  const addCustom = () => {
    const name = query.trim();
    if (!name) return;
    if (!value.some((item) => item.toLocaleLowerCase() === name.toLocaleLowerCase())) onChange([...value, name]);
    setQuery("");
  };

  return (
    <div ref={rootRef} className="relative">
      <span className="mb-2 block text-sm font-semibold text-[var(--color-text-secondary)]">Technologies and creative tools</span>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((current) => !current)}
        className="flex min-h-12 w-full items-center justify-between gap-3 border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-4 py-3 text-left text-sm outline-none focus:border-[var(--color-accent-main)]"
      >
        <span className={value.length ? "text-[var(--color-text-main)]" : "text-[var(--color-text-muted)]"}>
          {value.length ? `${value.length} selected` : "Search and select multiple technologies"}
        </span>
        <ChevronDown size={17} className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {value.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {value.map((name) => (
            <span key={name} className="inline-flex items-center gap-2 border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 text-xs font-semibold">
              {name}
              <button type="button" onClick={() => toggle(name)} aria-label={`Remove ${name}`} className="text-[var(--color-text-muted)] hover:text-red-300">
                <X size={13} />
              </button>
            </span>
          ))}
        </div>
      )}

      {open && (
        <div className="absolute z-40 mt-2 w-full border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-2xl">
          <label className="flex items-center gap-3 border-b border-[var(--color-border)] px-4">
            <Search size={16} className="shrink-0 text-[var(--color-text-muted)]" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && normalizedQuery && !hasExactOption) {
                  event.preventDefault();
                  addCustom();
                }
              }}
              placeholder="Search React, Laravel, Figma, Premiere Pro..."
              className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-[var(--color-text-muted)]"
            />
          </label>
          <div role="listbox" aria-multiselectable="true" className="max-h-80 overflow-y-auto p-2">
            {categories.map((category) => {
              const categoryOptions = filteredOptions.filter((option) => option.category === category);
              if (!categoryOptions.length) return null;
              return (
                <div key={category} className="mb-3 last:mb-0">
                  <p className="px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[.14em] text-[var(--color-accent-main)]">{category}</p>
                  {categoryOptions.map((option) => {
                    const selected = value.some((item) => item.toLocaleLowerCase() === option.name.toLocaleLowerCase());
                    return (
                      <button
                        key={option.name}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        onClick={() => toggle(option.name)}
                        className={`flex w-full items-center gap-3 px-2 py-2 text-left text-sm hover:bg-white/5 ${selected ? "text-[var(--color-text-main)]" : "text-[var(--color-text-secondary)]"}`}
                      >
                        <span className={`flex h-5 w-5 items-center justify-center border ${selected ? "border-[var(--color-accent-main)] bg-[var(--color-accent-main)] text-[var(--color-bg-primary)]" : "border-[var(--color-border)]"}`}>
                          {selected && <Check size={13} />}
                        </span>
                        {option.logoUrl && <img src={option.logoUrl} alt="" className="h-5 w-5 object-contain" />}
                        <span>{option.name}</span>
                      </button>
                    );
                  })}
                </div>
              );
            })}
            {normalizedQuery && !hasExactOption && (
              <button type="button" onClick={addCustom} className="flex w-full items-center gap-3 border-t border-[var(--color-border)] px-2 py-3 text-left text-sm font-semibold text-[var(--color-accent-main)]">
                <Plus size={16} /> Add custom technology “{query.trim()}”
              </button>
            )}
            {!filteredOptions.length && !normalizedQuery && <p className="p-4 text-sm text-[var(--color-text-muted)]">No technologies available.</p>}
          </div>
          <div className="flex items-center justify-between border-t border-[var(--color-border)] px-4 py-3 text-xs text-[var(--color-text-muted)]">
            <span>Select as many as needed. Type a new name to add a custom item.</span>
            <button type="button" onClick={() => setOpen(false)} className="font-bold text-[var(--color-text-main)]">Done</button>
          </div>
        </div>
      )}
    </div>
  );
}

function LanguageEditorTabs({ value, onChange, onTranslate, isTranslating }: { value: ContentLanguage; onChange: (language: ContentLanguage) => void; onTranslate: () => void; isTranslating: boolean }) {
  return (
    <div className="flex flex-col gap-4 border border-[var(--color-border)] bg-[var(--color-surface)] p-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-bold">Project language</p>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">Write in either language. Use Auto-Translate to generate the other language version.</p>
      </div>
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <button type="button" onClick={onTranslate} disabled={isTranslating} className="inline-flex items-center gap-2 border border-[var(--color-accent-main)]/50 bg-[var(--color-accent-main)]/10 px-4 py-2 text-xs font-bold text-[var(--color-accent-main)] transition-colors hover:bg-[var(--color-accent-main)]/20 disabled:opacity-50">
          <Languages size={14} /> {isTranslating ? "Translating..." : `Auto-Translate to ${value === "en" ? "ID" : "EN"}`}
        </button>
        <div className="flex border border-[var(--color-border)]">
          {(["en", "id"] as const).map((language) => (
            <button key={language} type="button" onClick={() => onChange(language)} className={`px-4 py-2 text-xs font-bold uppercase ${value === language ? "bg-[var(--color-text-main)] text-[var(--color-bg-primary)]" : "text-[var(--color-text-secondary)]"}`}>
              {language === "en" ? "English" : "Indonesia"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
