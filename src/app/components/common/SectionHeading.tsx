import { useLanguage } from "../../context/LanguageContext";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}

export function SectionHeading({ eyebrow, title, description, align = "left" }: SectionHeadingProps) {
  const { t } = useLanguage();
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {eyebrow && <p className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[.18em] text-[var(--color-accent-main)]">{t(eyebrow)}</p>}
      <h2 className="font-manrope text-3xl font-bold tracking-tight text-[var(--color-text-main)] md:text-5xl">{t(title)}</h2>
      {description && <p className="mt-5 text-base leading-7 text-[var(--color-text-secondary)] md:text-lg">{t(description)}</p>}
    </div>
  );
}
