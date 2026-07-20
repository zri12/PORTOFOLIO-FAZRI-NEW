import { useState } from "react";
import { Link } from "react-router";
import { Edit, Plus, Trash } from "lucide-react";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { StatusBadge } from "../../components/admin/StatusBadge";
import { usePortfolioData } from "../../hooks/usePortfolioData";
import { portfolioRepository } from "../../repositories/portfolioRepository";

export default function AdminTechStackPage() {
  const { techStack } = usePortfolioData();
  const [query, setQuery] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const filtered = techStack.filter((item) => `${item.name} ${item.category}`.toLowerCase().includes(query.toLowerCase()));
  const target = techStack.find((item) => item.id === deleteId);

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader title="Tech Stack" description="Manage technology cards, logo assets, category labels, featured states, active states, and display order." action={<Link to="/admin/tech-stack/new" className="inline-flex items-center gap-2 bg-[var(--color-text-main)] px-4 py-2.5 text-sm font-bold text-[var(--color-bg-primary)]"><Plus size={16} /> Add Technology</Link>} />
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search technologies..." className="mb-6 w-full border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-3 outline-none md:w-96" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((item) => (
          <article key={item.id} className="border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-14 w-14 items-center justify-center border border-[var(--color-border)] bg-[var(--color-bg-primary)] font-manrope font-bold text-[var(--color-accent-main)]">
                {item.logoUrl ? <img src={item.logoUrl} alt={item.name} className="h-9 w-9 object-contain" /> : item.name.slice(0, 2)}
              </div>
              <div className="flex gap-2">
                <Link to={`/admin/tech-stack/${item.id}/edit`} className="border border-[var(--color-border)] p-2" title="Edit"><Edit size={16} /></Link>
                <button onClick={() => setDeleteId(item.id)} className="border border-red-500/30 p-2 text-red-300" title="Delete"><Trash size={16} /></button>
              </div>
            </div>
            <h2 className="mt-5 font-manrope text-xl font-bold">{item.name}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{item.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <StatusBadge status={item.category} />
              <StatusBadge status={item.level} />
              {item.featured && <StatusBadge status="featured" />}
              {!item.active && <StatusBadge status="inactive" />}
            </div>
          </article>
        ))}
      </div>
      <ConfirmDialog open={Boolean(deleteId)} title="Delete technology?" description={`"${target?.name || "This technology"}" will be removed permanently. This action cannot be undone.`} confirmLabel="Delete technology" onCancel={() => setDeleteId(null)} onConfirm={() => { if (deleteId) portfolioRepository.deleteTechnology(deleteId); setDeleteId(null); }} />
    </div>
  );
}
