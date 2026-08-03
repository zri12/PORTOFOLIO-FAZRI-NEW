import { Globe2 } from "lucide-react";
import type { ContentLanguage } from "../../types/portfolio";

export function LanguageEditorTabs({
  value,
  onChange,
  onTranslate,
  isTranslating,
  hideTranslateButton,
}: {
  value: ContentLanguage;
  onChange: (language: ContentLanguage) => void;
  onTranslate?: () => void;
  isTranslating?: boolean;
  hideTranslateButton?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
      <div className="flex gap-2">
        <button
          onClick={() => onChange("en")}
          className={`px-4 py-2 text-sm font-bold ${value === "en" ? "bg-[var(--color-text-main)] text-[var(--color-bg-primary)]" : "border border-[var(--color-border)] text-[var(--color-text-secondary)]"}`}
        >
          English
        </button>
        <button
          onClick={() => onChange("id")}
          className={`px-4 py-2 text-sm font-bold ${value === "id" ? "bg-[var(--color-text-main)] text-[var(--color-bg-primary)]" : "border border-[var(--color-border)] text-[var(--color-text-secondary)]"}`}
        >
          Indonesian
        </button>
      </div>
      {!hideTranslateButton && onTranslate && (
        <button
          onClick={onTranslate}
          disabled={isTranslating}
          className="inline-flex items-center gap-2 border border-[var(--color-border)] px-4 py-2 text-sm font-bold text-[var(--color-accent-main)] hover:bg-[var(--color-accent-main)] hover:text-white disabled:opacity-50"
        >
          <Globe2 size={16} />
          {isTranslating ? "Translating..." : `Translate to ${value === "en" ? "English" : "Indonesian"}`}
        </button>
      )}
    </div>
  );
}
