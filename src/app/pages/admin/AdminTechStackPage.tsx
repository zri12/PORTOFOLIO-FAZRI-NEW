import { useState } from "react";
import { Plus, Trash } from "lucide-react";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import { StatusBadge } from "../../components/admin/StatusBadge";
import { usePortfolioData } from "../../hooks/usePortfolioData";
import { portfolioRepository } from "../../repositories/portfolioRepository";
import type { Technology } from "../../types/portfolio";

export default function AdminTechStackPage() {
  const { techStack } = usePortfolioData();
  const [query, setQuery] = useState("");
  const filtered = techStack.filter((item) => `${item.name} ${item.category}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader title="Tech Stack" description="Manage technology cards, category labels, featured states, active states, and display order." action={<button onClick={() => portfolioRepository.createTechnology({ name: "New Tool" })} className="inline-flex items-center gap-2 bg-[var(--color-text-main)] px-4 py-2.5 text-sm font-bold text-[var(--color-bg-primary)]"><Plus size={16} /> Add Technology</button>} />
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search technologies..." className="mb-6 w-full border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-3 outline-none md:w-96" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((item) => <TechCard key={item.id} item={item} />)}
      </div>
    </div>
  );
}

function TechCard({ item }: { item: Technology }) {
  const update = (patch: Partial<Technology>) => portfolioRepository.updateTechnology({ ...item, ...patch });
  return (
    <article className="border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-12 w-12 items-center justify-center border border-[var(--color-border)] font-manrope font-bold text-[var(--color-accent-main)]">{item.name.slice(0, 2)}</div>
        <button onClick={() => portfolioRepository.deleteTechnology(item.id)} className="text-red-300"><Trash size={16} /></button>
      </div>
      <input value={item.name} onChange={(event) => update({ name: event.target.value })} className="mt-5 w-full bg-transparent font-manrope text-xl font-bold outline-none" />
      <div className="mt-3 flex flex-wrap gap-2"><StatusBadge status={item.category} /><StatusBadge status={item.level} />{item.featured && <StatusBadge status="featured" />}{!item.active && <StatusBadge status="inactive" />}</div>
      <textarea value={item.description} onChange={(event) => update({ description: event.target.value })} rows={3} className="mt-4 w-full border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-3 text-sm outline-none" />
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <select value={item.category} onChange={(event) => update({ category: event.target.value as Technology["category"] })} className="border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-2 text-sm"><option>Frontend</option><option>Backend</option><option>Database</option><option>Deployment</option><option>Creative</option></select>
        <select value={item.level} onChange={(event) => update({ level: event.target.value as Technology["level"] })} className="border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-2 text-sm"><option>Main Stack</option><option>Frequently Used</option><option>Familiar</option><option>Currently Learning</option></select>
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={() => update({ active: !item.active })} className="border border-[var(--color-border)] px-3 py-2 text-xs font-bold">{item.active ? "Deactivate" : "Activate"}</button>
        <button onClick={() => update({ featured: !item.featured })} className="border border-[var(--color-border)] px-3 py-2 text-xs font-bold">{item.featured ? "Unfeature" : "Feature"}</button>
      </div>
    </article>
  );
}
