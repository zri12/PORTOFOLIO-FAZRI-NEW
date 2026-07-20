import { useState } from "react";
import { Trash } from "lucide-react";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { StatusBadge } from "../../components/admin/StatusBadge";
import { usePortfolioData } from "../../hooks/usePortfolioData";
import { portfolioRepository } from "../../repositories/portfolioRepository";

export default function AdminCommentsPage() {
  const { comments } = usePortfolioData();
  const [query, setQuery] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const filtered = comments.filter((item) => `${item.name} ${item.message}`.toLowerCase().includes(query.toLowerCase()));
  const target = comments.find((comment) => comment.id === deleteId);
  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader title="Comments" description="Approve, hide, pin, reply, and delete visitor comments from the local guestbook." />
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search comments..." className="mb-6 w-full border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-3 outline-none md:w-96" />
      <div className="space-y-4">
        {filtered.map((comment) => (
          <article key={comment.id} className="border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5">
            <div className="flex flex-wrap items-center gap-3"><h2 className="font-bold">{comment.name}</h2><StatusBadge status={comment.status} />{comment.pinned && <StatusBadge status="pinned" />}<span className="text-xs text-[var(--color-text-muted)]">{comment.date}</span></div>
            <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">{comment.message}</p>
            <input value={comment.adminReply || ""} onChange={(event) => portfolioRepository.updateComment({ ...comment, adminReply: event.target.value })} placeholder="Admin reply..." className="mt-4 w-full border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-3 text-sm outline-none" />
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={() => portfolioRepository.updateComment({ ...comment, status: "approved" })} className="border border-[var(--color-border)] px-3 py-2 text-xs font-bold">Approve</button>
              <button onClick={() => portfolioRepository.updateComment({ ...comment, status: "hidden" })} className="border border-[var(--color-border)] px-3 py-2 text-xs font-bold">Hide</button>
              <button onClick={() => portfolioRepository.updateComment({ ...comment, pinned: !comment.pinned })} className="border border-[var(--color-border)] px-3 py-2 text-xs font-bold">{comment.pinned ? "Unpin" : "Pin"}</button>
              <button onClick={() => setDeleteId(comment.id)} className="border border-red-500/30 p-2 text-red-300" title="Delete"><Trash size={15} /></button>
            </div>
          </article>
        ))}
      </div>
      <ConfirmDialog open={Boolean(deleteId)} title="Delete comment?" description={`The comment from "${target?.name || "this visitor"}" will be removed permanently. This action cannot be undone.`} confirmLabel="Delete comment" onCancel={() => setDeleteId(null)} onConfirm={() => { if (deleteId) portfolioRepository.deleteComment(deleteId); setDeleteId(null); }} />
    </div>
  );
}
