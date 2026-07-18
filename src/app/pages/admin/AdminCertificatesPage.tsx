import { Plus, Trash } from "lucide-react";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import { StatusBadge } from "../../components/admin/StatusBadge";
import { usePortfolioData } from "../../hooks/usePortfolioData";
import { portfolioRepository } from "../../repositories/portfolioRepository";

export default function AdminCertificatesPage() {
  const { certificates } = usePortfolioData();
  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader title="Certificates" description="Manage certificate previews, credential metadata, publication state, and featured status." action={<button onClick={() => portfolioRepository.createCertificate({ title: "New Certificate" })} className="inline-flex items-center gap-2 bg-[var(--color-text-main)] px-4 py-2.5 text-sm font-bold text-[var(--color-bg-primary)]"><Plus size={16} /> Add Certificate</button>} />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {certificates.map((item) => (
          <article key={item.id} className="overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
            <img src={item.image} alt={item.title} className="aspect-[16/10] w-full object-cover" />
            <div className="p-5">
              <div className="mb-3 flex gap-2"><StatusBadge status={item.category} />{item.published ? <StatusBadge status="published" /> : <StatusBadge status="draft" />}{item.featured && <StatusBadge status="featured" />}</div>
              <input value={item.title} onChange={(event) => portfolioRepository.updateCertificate({ ...item, title: event.target.value })} className="w-full bg-transparent font-manrope text-xl font-bold outline-none" />
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{item.issuer} / {item.issueDate}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => portfolioRepository.updateCertificate({ ...item, published: !item.published })} className="border border-[var(--color-border)] px-3 py-2 text-xs font-bold">{item.published ? "Unpublish" : "Publish"}</button>
                <button onClick={() => portfolioRepository.updateCertificate({ ...item, featured: !item.featured })} className="border border-[var(--color-border)] px-3 py-2 text-xs font-bold">{item.featured ? "Unfeature" : "Feature"}</button>
                <button onClick={() => portfolioRepository.deleteCertificate(item.id)} className="border border-red-500/30 p-2 text-red-300"><Trash size={15} /></button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
