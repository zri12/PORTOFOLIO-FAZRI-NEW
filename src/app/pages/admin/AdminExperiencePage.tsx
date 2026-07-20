import { useState } from "react";
import { Plus, Trash } from "lucide-react";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { StatusBadge } from "../../components/admin/StatusBadge";
import { usePortfolioData } from "../../hooks/usePortfolioData";
import { portfolioRepository } from "../../repositories/portfolioRepository";

export default function AdminExperiencePage() {
  const { experiences } = usePortfolioData();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const target = experiences.find((item) => item.id === deleteId);

  return (
    <div className="mx-auto max-w-5xl">
      <AdminPageHeader title="Experience" description="Manage timeline entries, responsibilities, publication state, and related project references." action={<button onClick={() => portfolioRepository.createExperience({ role: "New Role" })} className="inline-flex items-center gap-2 bg-[var(--color-text-main)] px-4 py-2.5 text-sm font-bold text-[var(--color-bg-primary)]"><Plus size={16} /> Add Experience</button>} />
      <div className="space-y-4">
        {experiences.map((item) => (
          <article key={item.id} className="border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex gap-2"><StatusBadge status={item.type} />{item.published ? <StatusBadge status="published" /> : <StatusBadge status="draft" />}</div>
                <input value={item.role} onChange={(event) => portfolioRepository.updateExperience({ ...item, role: event.target.value })} className="mt-4 w-full bg-transparent font-manrope text-xl font-bold outline-none" />
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{item.organization} / {item.period} / {item.location}</p>
              </div>
              <button onClick={() => setDeleteId(item.id)} className="text-red-300" title="Delete"><Trash size={16} /></button>
            </div>
            <textarea value={item.description} onChange={(event) => portfolioRepository.updateExperience({ ...item, description: event.target.value })} rows={3} className="mt-4 w-full border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-3 text-sm outline-none" />
            <button onClick={() => portfolioRepository.updateExperience({ ...item, published: !item.published })} className="mt-3 border border-[var(--color-border)] px-3 py-2 text-xs font-bold">{item.published ? "Unpublish" : "Publish"}</button>
          </article>
        ))}
      </div>
      <ConfirmDialog open={Boolean(deleteId)} title="Delete experience?" description={`"${target?.role || "This experience"}" will be removed permanently. This action cannot be undone.`} confirmLabel="Delete experience" onCancel={() => setDeleteId(null)} onConfirm={() => { if (deleteId) portfolioRepository.deleteExperience(deleteId); setDeleteId(null); }} />
    </div>
  );
}
