import { useState } from "react";
import { Copy, Plus, Trash } from "lucide-react";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import { StatusBadge } from "../../components/admin/StatusBadge";
import { usePortfolioData } from "../../hooks/usePortfolioData";
import { portfolioRepository } from "../../repositories/portfolioRepository";
import type { CreativeWork } from "../../types/portfolio";

export default function AdminCreativeWorksPage() {
  const { creativeWorks } = usePortfolioData();
  const [query, setQuery] = useState("");
  const filtered = creativeWorks.filter((item) => `${item.title} ${item.category}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader title="Creative Works" description="Manage local creative archive entries, covers, gallery metadata, publication state, and featured state." action={<button onClick={() => portfolioRepository.createCreativeWork({ title: "New Creative Work" })} className="inline-flex items-center gap-2 bg-[var(--color-text-main)] px-4 py-2.5 text-sm font-bold text-[var(--color-bg-primary)]"><Plus size={16} /> Add Work</button>} />
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search creative works..." className="mb-6 w-full border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-3 outline-none md:w-96" />
      <div className="grid gap-5 xl:grid-cols-2">
        {filtered.map((item) => <CreativeCard key={item.id} item={item} />)}
      </div>
    </div>
  );
}

function CreativeCard({ item }: { item: CreativeWork }) {
  const update = (patch: Partial<CreativeWork>) => portfolioRepository.updateCreativeWork({ ...item, ...patch });
  return (
    <article className="grid gap-4 border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5 md:grid-cols-[180px_1fr]">
      <img src={item.cover} alt={item.title} className="aspect-square w-full object-cover" />
      <div>
        <div className="mb-3 flex flex-wrap gap-2"><StatusBadge status={item.category} /><StatusBadge status={item.status} />{item.featured && <StatusBadge status="featured" />}</div>
        <input value={item.title} onChange={(event) => update({ title: event.target.value })} className="w-full bg-transparent font-manrope text-xl font-bold outline-none" />
        <textarea value={item.description} onChange={(event) => update({ description: event.target.value })} rows={3} className="mt-3 w-full border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-3 text-sm outline-none" />
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={() => portfolioRepository.createCreativeWork({ ...item, title: `${item.title} Copy`, slug: `${item.slug}-copy`, status: "draft" })} className="border border-[var(--color-border)] p-2"><Copy size={15} /></button>
          <button onClick={() => update({ status: item.status === "published" ? "draft" : "published" })} className="border border-[var(--color-border)] px-3 py-2 text-xs font-bold">{item.status === "published" ? "Unpublish" : "Publish"}</button>
          <button onClick={() => update({ featured: !item.featured })} className="border border-[var(--color-border)] px-3 py-2 text-xs font-bold">{item.featured ? "Unfeature" : "Feature"}</button>
          <button onClick={() => portfolioRepository.deleteCreativeWork(item.id)} className="border border-red-500/30 p-2 text-red-300"><Trash size={15} /></button>
        </div>
      </div>
    </article>
  );
}
