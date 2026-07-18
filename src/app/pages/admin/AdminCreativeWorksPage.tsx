import { useState } from "react";
import { Link } from "react-router";
import { Copy, Edit, Plus, Trash } from "lucide-react";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import { StatusBadge } from "../../components/admin/StatusBadge";
import { usePortfolioData } from "../../hooks/usePortfolioData";
import { portfolioRepository } from "../../repositories/portfolioRepository";

export default function AdminCreativeWorksPage() {
  const { creativeWorks } = usePortfolioData();
  const [query, setQuery] = useState("");
  const filtered = creativeWorks.filter((item) => `${item.title} ${item.category}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader title="Creative Works" description="Manage local creative archive entries, covers, gallery metadata, publication state, and featured state." action={<Link to="/admin/creative-works/new" className="inline-flex items-center gap-2 bg-[var(--color-text-main)] px-4 py-2.5 text-sm font-bold text-[var(--color-bg-primary)]"><Plus size={16} /> Add Work</Link>} />
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search creative works..." className="mb-6 w-full border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-3 outline-none md:w-96" />
      <div className="grid gap-5 xl:grid-cols-2">
        {filtered.map((item) => (
          <article key={item.id} className="grid gap-4 border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5 md:grid-cols-[180px_1fr]">
            <img src={item.cover} alt={item.title} className="aspect-square w-full object-cover" />
            <div>
              <div className="mb-3 flex flex-wrap gap-2"><StatusBadge status={item.category} /><StatusBadge status={item.status} />{item.featured && <StatusBadge status="featured" />}</div>
              <h2 className="font-manrope text-xl font-bold">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">{item.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => portfolioRepository.createCreativeWork({ ...item, title: `${item.title} Copy`, slug: `${item.slug}-copy`, status: "draft" })} className="border border-[var(--color-border)] p-2" title="Duplicate"><Copy size={15} /></button>
                <Link to={`/admin/creative-works/${item.id}/edit`} className="border border-[var(--color-border)] p-2" title="Edit"><Edit size={15} /></Link>
                <button onClick={() => portfolioRepository.updateCreativeWork({ ...item, status: item.status === "published" ? "draft" : "published" })} className="border border-[var(--color-border)] px-3 py-2 text-xs font-bold">{item.status === "published" ? "Unpublish" : "Publish"}</button>
                <button onClick={() => portfolioRepository.updateCreativeWork({ ...item, featured: !item.featured })} className="border border-[var(--color-border)] px-3 py-2 text-xs font-bold">{item.featured ? "Unfeature" : "Feature"}</button>
                <button onClick={() => portfolioRepository.deleteCreativeWork(item.id)} className="border border-red-500/30 p-2 text-red-300" title="Delete"><Trash size={15} /></button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
