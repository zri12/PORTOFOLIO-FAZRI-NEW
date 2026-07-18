import { Link } from "react-router";
import { Edit, Plus, Trash } from "lucide-react";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import { StatusBadge } from "../../components/admin/StatusBadge";
import { usePortfolioData } from "../../hooks/usePortfolioData";
import { portfolioRepository } from "../../repositories/portfolioRepository";

export default function AdminCertificatesPage() {
  const { certificates } = usePortfolioData();
  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader title="Certificates" description="Manage certificate previews, images, credential metadata, publication state, and featured status." action={<Link to="/admin/certificates/new" className="inline-flex items-center gap-2 bg-[var(--color-text-main)] px-4 py-2.5 text-sm font-bold text-[var(--color-bg-primary)]"><Plus size={16} /> Add Certificate</Link>} />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {certificates.map((item) => (
          <article key={item.id} className="overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
            <img src={item.image} alt={item.title} className="aspect-[16/10] w-full object-cover" />
            <div className="p-5">
              <div className="mb-3 flex gap-2"><StatusBadge status={item.category} />{item.published ? <StatusBadge status="published" /> : <StatusBadge status="draft" />}{item.featured && <StatusBadge status="featured" />}</div>
              <h2 className="font-manrope text-xl font-bold">{item.title}</h2>
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{item.issuer} / {item.issueDate}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link to={`/admin/certificates/${item.id}/edit`} className="border border-[var(--color-border)] p-2" title="Edit"><Edit size={15} /></Link>
                <button onClick={() => portfolioRepository.updateCertificate({ ...item, published: !item.published })} className="border border-[var(--color-border)] px-3 py-2 text-xs font-bold">{item.published ? "Unpublish" : "Publish"}</button>
                <button onClick={() => portfolioRepository.updateCertificate({ ...item, featured: !item.featured })} className="border border-[var(--color-border)] px-3 py-2 text-xs font-bold">{item.featured ? "Unfeature" : "Feature"}</button>
                <button onClick={() => portfolioRepository.deleteCertificate(item.id)} className="border border-red-500/30 p-2 text-red-300" title="Delete"><Trash size={15} /></button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
