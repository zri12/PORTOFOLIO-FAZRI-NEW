import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { AdminImageField, AdminGalleryField } from "../../components/admin/AdminImageFields";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import { AdminInput, FormSection } from "../../components/admin/FormSection";
import { portfolioSeed } from "../../data/seed/portfolioSeed";
import { usePortfolioData } from "../../hooks/usePortfolioData";
import { slugify } from "../../lib/storage";
import { formatAdminSaveError } from "../../lib/supabase/errorMessages";
import { portfolioRepository } from "../../repositories/portfolioRepository";
import type { Project } from "../../types/portfolio";

const toLines = (items: string[]) => items.join("\n");
const fromLines = (value: string) => value.split("\n").map((item) => item.trim()).filter(Boolean);
const imageHints = {
  cover: "Recommended 1600x1000px or 16:10. Used for project cards and preview fallback.",
  hero: "Recommended 1920x1200px or 16:10. Use a clean dashboard/browser mockup for the project detail hero.",
  mobile: "Recommended 900x1200px or 3:4. Use mobile/tablet screenshots when available.",
  gallery: "Recommended 1600x1000px or consistent 16:10 images. First image becomes the large gallery item.",
};

function createDraftProject(projects: Project[]): Project {
  const base = projects[0] || portfolioSeed.projects[0];
  return {
    ...base,
    id: crypto.randomUUID(),
    title: "Untitled Project",
    slug: "untitled-project",
    status: "draft",
    featured: false,
    coverImage: "",
    heroImage: "",
    mobilePreviewImage: "",
    gallery: [],
    relatedProjectSlug: "",
    displayOrder: projects.length + 1,
  };
}

export default function AdminProjectFormPage() {
  const { id } = useParams();
  const { projects, techStack } = usePortfolioData();
  const navigate = useNavigate();
  const source = id ? projects.find((project) => project.id === id) : undefined;
  const [draft, setDraft] = useState<Project>(() => source || createDraftProject(projects));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (source) setDraft(source);
    else if (!id) setDraft(createDraftProject(projects));
  }, [id, projects, source]);

  const set = <K extends keyof Project>(key: K, value: Project[K]) => {
    setError("");
    setDraft((current) => ({ ...current, [key]: value }));
  };
  const save = async (status: Project["status"]) => {
    const next = { ...draft, status, slug: draft.slug || slugify(draft.title) };
    setSaving(true);
    setError("");
    try {
      portfolioRepository.updateProject(next);
      await portfolioRepository.flushPendingWrites();
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
        <FormSection title="Project Identity">
          <div className="grid gap-4 md:grid-cols-2">
            <AdminInput label="Title" value={draft.title} onChange={(value) => setDraft({ ...draft, title: value, slug: slugify(value) })} />
            <AdminInput label="Slug" value={draft.slug} onChange={(value) => set("slug", slugify(value))} />
            <AdminInput label="Full Name" value={draft.fullName} onChange={(value) => set("fullName", value)} />
            <AdminInput label="Category" value={draft.category} onChange={(value) => set("category", value)} />
            <AdminInput label="Type" value={draft.type} onChange={(value) => set("type", value)} />
            <AdminInput label="Year" value={draft.year} onChange={(value) => set("year", value)} />
            <AdminInput label="Role" value={draft.role} onChange={(value) => set("role", value)} />
            <AdminInput label="Display Order" value={String(draft.displayOrder)} onChange={(value) => set("displayOrder", Number(value) || 0)} />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <label>
              <span className="mb-2 block text-sm font-semibold text-[var(--color-text-secondary)]">Client Type</span>
              <select value={draft.clientType} onChange={(event) => set("clientType", event.target.value as Project["clientType"])} className="w-full border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-3 text-sm outline-none">
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
          <AdminInput label="Short Description" value={draft.shortDescription} onChange={(value) => set("shortDescription", value)} textarea />
          <AdminInput label="Full Description" value={draft.fullDescription} onChange={(value) => set("fullDescription", value)} textarea />
          <div className="grid gap-4 md:grid-cols-2">
            <AdminInput label="Live URL" value={draft.liveUrl} onChange={(value) => set("liveUrl", value)} />
            <AdminInput label="Source URL" value={draft.sourceUrl} onChange={(value) => set("sourceUrl", value)} />
          </div>
        </FormSection>

        <FormSection title="Images">
          <div className="grid gap-4 lg:grid-cols-3">
            <AdminImageField label="Project Cover Image" value={draft.coverImage} folder={`projects/${draft.slug || draft.id}/cover`} hint={imageHints.cover} onChange={(value) => set("coverImage", value)} />
            <AdminImageField label="Project Detail Hero Image" value={draft.heroImage} folder={`projects/${draft.slug || draft.id}/hero`} hint={imageHints.hero} onChange={(value) => set("heroImage", value)} />
            <AdminImageField label="Mobile / Responsive Preview" value={draft.mobilePreviewImage} folder={`projects/${draft.slug || draft.id}/responsive`} hint={imageHints.mobile} aspect="aspect-[3/4]" onChange={(value) => set("mobilePreviewImage", value)} />
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
          <AdminInput label="Overview" value={draft.overview} onChange={(value) => set("overview", value)} textarea />
          <AdminInput label="Background and Problem" value={draft.background} onChange={(value) => set("background", value)} textarea />
          <AdminInput label="Solution" value={draft.solution} onChange={(value) => set("solution", value)} textarea />
          <AdminInput label="System Architecture" value={draft.architecture} onChange={(value) => set("architecture", value)} textarea />
          <AdminInput label="Data Structure" value={draft.dataStructure} onChange={(value) => set("dataStructure", value)} textarea />
          <AdminInput label="Testing" value={draft.testing} onChange={(value) => set("testing", value)} textarea />
          <AdminInput label="Deployment" value={draft.deployment} onChange={(value) => set("deployment", value)} textarea />
          <AdminInput label="Result" value={draft.result} onChange={(value) => set("result", value)} textarea />
        </FormSection>

        <FormSection title="Detail Lists">
          <div className="grid gap-4 md:grid-cols-2">
            <AdminInput label="Objectives (one per line)" value={toLines(draft.objectives)} onChange={(value) => set("objectives", fromLines(value))} textarea />
            <AdminInput label="Target Users (one per line)" value={toLines(draft.targetUsers)} onChange={(value) => set("targetUsers", fromLines(value))} textarea />
            <AdminInput label="Role and Responsibilities (one per line)" value={toLines(draft.responsibilities)} onChange={(value) => set("responsibilities", fromLines(value))} textarea />
            <AdminInput label="Main Features (one per line)" value={toLines(draft.features)} onChange={(value) => set("features", fromLines(value))} textarea />
            <AdminInput label="Development Process (one per line)" value={toLines(draft.process)} onChange={(value) => set("process", fromLines(value))} textarea />
            <AdminInput label="Challenges (one per line)" value={toLines(draft.challenges)} onChange={(value) => set("challenges", fromLines(value))} textarea />
            <AdminInput label="Technical Decisions (one per line)" value={toLines(draft.decisions)} onChange={(value) => set("decisions", fromLines(value))} textarea />
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
