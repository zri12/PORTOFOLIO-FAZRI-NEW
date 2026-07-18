import type React from "react";

export function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6">
      <h2 className="mb-5 font-manrope text-xl font-bold">{title}</h2>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

export function AdminInput({ label, value, onChange, textarea = false }: { label: string; value: string; onChange: (value: string) => void; textarea?: boolean }) {
  return (
    <label>
      <span className="mb-2 block text-sm font-semibold text-[var(--color-text-secondary)]">{label}</span>
      {textarea ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={5} className="w-full border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-3 text-sm outline-none focus:border-[var(--color-accent-main)]" />
      ) : (
        <input value={value} onChange={(event) => onChange(event.target.value)} className="w-full border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-3 text-sm outline-none focus:border-[var(--color-accent-main)]" />
      )}
    </label>
  );
}
