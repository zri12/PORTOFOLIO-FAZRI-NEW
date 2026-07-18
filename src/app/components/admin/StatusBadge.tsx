export function StatusBadge({ status }: { status: string }) {
  const tone = status.toLowerCase().includes("new") || status.toLowerCase().includes("published") || status.toLowerCase().includes("approved")
    ? "border-emerald-400/30 text-emerald-300 bg-emerald-400/10"
    : status.toLowerCase().includes("draft") || status.toLowerCase().includes("pending")
      ? "border-amber-400/30 text-amber-300 bg-amber-400/10"
      : "border-[var(--color-border)] text-[var(--color-text-muted)] bg-[var(--color-bg-primary)]";
  return <span className={`inline-flex border px-2 py-1 text-[10px] font-bold uppercase tracking-[.12em] ${tone}`}>{status}</span>;
}
