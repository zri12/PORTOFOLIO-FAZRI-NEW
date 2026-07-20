import { useMemo, useState } from "react";
import { Link } from "react-router";
import { Copy, Edit, Eye, Plus, Search, Trash } from "lucide-react";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { StatusBadge } from "../../components/admin/StatusBadge";
import { usePortfolioData } from "../../hooks/usePortfolioData";
import { portfolioRepository } from "../../repositories/portfolioRepository";

export default function AdminProjectsPage() {
  const { projects } = usePortfolioData();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const filtered = useMemo(() => projects.filter((project) => (status === "All" || project.status === status) && `${project.title} ${project.category}`.toLowerCase().includes(query.toLowerCase())), [projects, query, status]);
  const target = projects.find((project) => project.id === deleteId);
  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader title="Projects" description="Search, filter, publish, duplicate, edit, and delete web project records." action={<Link to="/admin/projects/new" className="inline-flex items-center gap-2 bg-[var(--color-text-main)] px-4 py-2.5 text-sm font-bold text-[var(--color-bg-primary)]"><Plus size={16} /> New Project</Link>} />
      <div className="mb-6 grid gap-3 md:grid-cols-[1fr_180px]">
        <label className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects..." className="w-full border border-[var(--color-border)] bg-[var(--color-surface-elevated)] py-3 pl-10 pr-3 outline-none" /></label>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3"><option>All</option><option>published</option><option>draft</option><option>archived</option></select>
      </div>
      <div className="grid gap-4">
        {filtered.map((project) => (
          <article key={project.id} className="grid gap-4 border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-3"><h2 className="font-manrope text-xl font-bold">{project.title}</h2><StatusBadge status={project.status} />{project.featured && <StatusBadge status="featured" />}</div>
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{project.category} / {project.techStack.join(", ")}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to={`/projects/${project.slug}`} target="_blank" className="border border-[var(--color-border)] p-2" title="View"><Eye size={16} /></Link>
              <Link to={`/admin/projects/${project.id}/edit`} className="border border-[var(--color-border)] p-2" title="Edit"><Edit size={16} /></Link>
              <button onClick={() => portfolioRepository.duplicateProject(project.id)} className="border border-[var(--color-border)] p-2" title="Duplicate"><Copy size={16} /></button>
              <button onClick={() => portfolioRepository.updateProject({ ...project, status: project.status === "published" ? "draft" : "published" })} className="border border-[var(--color-border)] px-3 text-xs font-bold">{project.status === "published" ? "Unpublish" : "Publish"}</button>
              <button onClick={() => portfolioRepository.updateProject({ ...project, featured: !project.featured })} className="border border-[var(--color-border)] px-3 text-xs font-bold">{project.featured ? "Unfeature" : "Feature"}</button>
              <button onClick={() => setDeleteId(project.id)} className="border border-red-500/30 p-2 text-red-300" title="Delete"><Trash size={16} /></button>
            </div>
          </article>
        ))}
      </div>
      <ConfirmDialog open={Boolean(deleteId)} title="Delete project?" description={`"${target?.title || "This project"}" will be removed permanently. This action cannot be undone.`} confirmLabel="Delete project" onCancel={() => setDeleteId(null)} onConfirm={() => { if (deleteId) portfolioRepository.deleteProject(deleteId); setDeleteId(null); }} />
    </div>
  );
}
