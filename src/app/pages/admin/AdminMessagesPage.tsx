import { Mail, Trash } from "lucide-react";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import { StatusBadge } from "../../components/admin/StatusBadge";
import { usePortfolioData } from "../../hooks/usePortfolioData";
import { portfolioRepository } from "../../repositories/portfolioRepository";
import type { ContactMessage } from "../../types/portfolio";

export default function AdminMessagesPage() {
  const { messages } = usePortfolioData();
  const setStatus = (message: ContactMessage, status: ContactMessage["status"]) => portfolioRepository.updateMessage({ ...message, status });
  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader title="Messages" description="Manage local contact inquiries. Email and WhatsApp actions open external reply targets." />
      <div className="space-y-4">
        {messages.map((message) => (
          <article key={message.id} className="border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5">
            <div className="flex flex-wrap items-center gap-3"><h2 className="font-manrope text-xl font-bold">{message.subject}</h2><StatusBadge status={message.status} /><span className="text-xs text-[var(--color-text-muted)]">{message.date}</span></div>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{message.name} / {message.email} / {message.projectType} / {message.budgetRange}</p>
            <p className="mt-4 text-sm leading-6">{message.message}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {(["New", "Read", "Replied", "Archived"] as const).map((status) => <button key={status} onClick={() => setStatus(message, status)} className="border border-[var(--color-border)] px-3 py-2 text-xs font-bold">{status}</button>)}
              <a href={`mailto:${message.email}?subject=Re: ${message.subject}`} className="inline-flex items-center gap-2 border border-[var(--color-border)] px-3 py-2 text-xs font-bold"><Mail size={14} /> Email</a>
              <a href={`https://wa.me/${message.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="border border-[var(--color-border)] px-3 py-2 text-xs font-bold">WhatsApp</a>
              <button onClick={() => portfolioRepository.deleteMessage(message.id)} className="border border-red-500/30 p-2 text-red-300"><Trash size={15} /></button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
