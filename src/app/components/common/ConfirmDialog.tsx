import { useEffect, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDialog({ open, title, description, confirmLabel = "Confirm", onCancel, onConfirm }: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const previousActiveElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = "hidden";
    cancelButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>("button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])");
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      previousActiveElement?.focus();
    };
  }, [onCancel, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title" aria-describedby="confirm-dialog-description" onMouseDown={(event) => event.target === event.currentTarget && onCancel()}>
      <div ref={dialogRef} className="w-full max-w-md border border-red-500/25 bg-[var(--color-bg-secondary)] shadow-[0_30px_90px_rgba(0,0,0,.55)]">
        <div className="flex items-start justify-between gap-4 border-b border-[var(--color-border)] p-6">
          <div className="flex gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-red-500/35 bg-red-500/10 text-red-300"><AlertTriangle size={20} /></span>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[.18em] text-red-300">Confirmation required</p>
              <h2 id="confirm-dialog-title" className="mt-2 font-manrope text-xl font-bold text-[var(--color-text-main)]">{title}</h2>
            </div>
          </div>
          <button type="button" onClick={onCancel} className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]" aria-label="Close confirmation"><X size={19} /></button>
        </div>
        <p id="confirm-dialog-description" className="px-6 pt-5 text-sm leading-6 text-[var(--color-text-secondary)]">{description}</p>
        <div className="mt-6 flex w-full justify-end gap-3 border-t border-[var(--color-border)] px-6 py-5">
          <button ref={cancelButtonRef} type="button" className="border border-[var(--color-border)] px-4 py-2.5 text-sm font-semibold text-[var(--color-text-secondary)] hover:border-[var(--color-text-muted)] hover:text-[var(--color-text-main)]" onClick={onCancel}>Cancel</button>
          <button type="button" className="bg-red-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-400" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
