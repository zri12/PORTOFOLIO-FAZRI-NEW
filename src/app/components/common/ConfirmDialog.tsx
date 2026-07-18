interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDialog({ open, title, description, confirmLabel = "Confirm", onCancel, onConfirm }: ConfirmDialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 px-4" role="dialog" aria-modal="true" onKeyDown={(event) => event.key === "Escape" && onCancel()}>
      <div className="w-full max-w-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6 shadow-2xl">
        <h2 className="font-manrope text-2xl font-bold text-[var(--color-text-main)]">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">{description}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button className="border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)]" onClick={onCancel}>Cancel</button>
          <button className="bg-red-500 px-4 py-2 text-sm font-bold text-white" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
