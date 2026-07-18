import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import { AdminInput, FormSection } from "../../components/admin/FormSection";
import { usePortfolioData } from "../../hooks/usePortfolioData";
import { slugify } from "../../lib/storage";
import { portfolioRepository } from "../../repositories/portfolioRepository";
import type { Project } from "../../types/portfolio";

function createDraftProject(projects: Project[]): Project {
  const base = projects[0];
  return {
    ...base,
    id: crypto.randomUUID(),
    title: "Untitled Project",
    slug: "untitled-project",
    status: "draft",
    featured: false,
    displayOrder: projects.length + 1,
  };
}

export default function AdminProjectFormPage() {
  const { id } = useParams();
  const { projects } = usePortfolioData();
  const navigate = useNavigate();
  const source = id ? projects.find((project) => project.id === id) : undefined;
  const [draft, setDraft] = useState<Project>(() => source || createDraftProject(projects));

  useEffect(() => {
    if (source) setDraft(source);
    else if (!id) setDraft((current) => current || createDraftProject(projects));
  }, [id, projects, source]);

  const set = (key: keyof Project, value: Project[keyof Project]) => setDraft({ ...draft, [key]: value });
  const save = (status: Project["status"]) => {
    const next = { ...draft, status, slug: draft.slug || slugify(draft.title) };
    portfolioRepository.updateProject(next);
    navigate("/admin/projects");
  };

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader title={id ? "Edit Project" : "New Project"} description="Manage case-study content, project metadata, features, process rows, and gallery references." />
      <div className="grid gap-6">
        <FormSection title="Overview">
          <div className="grid gap-4 md:grid-cols-2">
            <AdminInput label="Title" value={draft.title} onChange={(value) => setDraft({ ...draft, title: value, slug: slugify(value) })} />
            <AdminInput label="Slug" value={draft.slug} onChange={(value) => set("slug", slugify(value))} />
            <AdminInput label="Full Name" value={draft.fullName} onChange={(value) => set("fullName", value)} />
            <AdminInput label="Category" value={draft.category} onChange={(value) => set("category", value)} />
            <AdminInput label="Type" value={draft.type} onChange={(value) => set("type", value)} />
            <AdminInput label="Year" value={draft.year} onChange={(value) => set("year", value)} />
            <AdminInput label="Role" value={draft.role} onChange={(value) => set("role", value)} />
            <AdminInput label="Tech Stack (comma separated)" value={draft.techStack.join(", ")} onChange={(value) => set("techStack", value.split(",").map((item) => item.trim()).filter(Boolean))} />
          </div>
          <AdminInput label="Short Description" value={draft.shortDescription} onChange={(value) => set("shortDescription", value)} textarea />
          <AdminInput label="Full Description" value={draft.fullDescription} onChange={(value) => set("fullDescription", value)} textarea />
        </FormSection>
        <FormSection title="Case Study Content">
          <AdminInput label="Overview" value={draft.overview} onChange={(value) => set("overview", value)} textarea />
          <AdminInput label="Background" value={draft.background} onChange={(value) => set("background", value)} textarea />
          <AdminInput label="Solution" value={draft.solution} onChange={(value) => set("solution", value)} textarea />
          <AdminInput label="Features (one per line)" value={draft.features.join("\n")} onChange={(value) => set("features", value.split("\n").filter(Boolean))} textarea />
          <AdminInput label="Process (one per line)" value={draft.process.join("\n")} onChange={(value) => set("process", value.split("\n").filter(Boolean))} textarea />
        </FormSection>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => save("published")} className="bg-[var(--color-text-main)] px-5 py-3 text-sm font-bold text-[var(--color-bg-primary)]">Publish</button>
          <button onClick={() => save("draft")} className="border border-[var(--color-border)] px-5 py-3 text-sm font-bold">Save Draft</button>
          <button onClick={() => navigate("/admin/projects")} className="border border-[var(--color-border)] px-5 py-3 text-sm font-bold text-[var(--color-text-secondary)]">Cancel</button>
        </div>
      </div>
    </div>
  );
}
