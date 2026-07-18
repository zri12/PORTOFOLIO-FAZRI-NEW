import { Inbox } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export function EmptyState({ title, description }: { title: string; description: string }) {
  const { t } = useLanguage();
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center border border-dashed border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-8 text-center">
      <Inbox className="mb-4 text-[var(--color-accent-main)]" size={30} />
      <h3 className="font-manrope text-xl font-bold text-[var(--color-text-main)]">{t(title)}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-[var(--color-text-muted)]">{t(description)}</p>
    </div>
  );
}
