import { useState } from "react";
import { Link } from "react-router";
import { ArrowRight, Search } from "lucide-react";
import { EmptyState } from "../../components/common/EmptyState";
import { SectionHeading } from "../../components/common/SectionHeading";
import { useLanguage } from "../../context/LanguageContext";
import { useDocumentMeta } from "../../hooks/useDocumentMeta";
import { usePortfolioData } from "../../hooks/usePortfolioData";

const categories = ["All", "UI/UX Design", "Graphic Design", "Photography", "Videography", "Photo Editing", "Video Editing"];

export default function CreativeWorksPage() {
  const { creativeWorks } = usePortfolioData();
  const { t } = useLanguage();
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  useDocumentMeta({ title: "Creative Works - Fazri", description: "Selected UI design, graphic design, photography, videography, and editing works by Fazri." });

  const works = creativeWorks.filter((work) => {
    const categoryMatch = category === "All" || work.category === category;
    const text = `${work.title} ${work.category} ${work.description} ${work.tools.join(" ")}`.toLowerCase();
    return categoryMatch && text.includes(query.toLowerCase());
  });

  return (
    <main className="min-h-screen bg-[var(--color-bg-primary)] pt-24 text-[var(--color-text-main)] sm:pt-28 lg:pt-32">
      <section className="px-5 pb-10 sm:px-6 sm:pb-12">
        <div className="mx-auto max-w-7xl">
          <SectionHeading eyebrow={t("Creative archive")} title={t("Visual work that supports the web development practice.")} description={t("A compact archive for interface studies, visual design, photography, video, and editing. Web development remains the center; this work supports visual storytelling.")} />
        </div>
      </section>
      <section className="px-5 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 border-y border-[var(--color-border)] py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="no-scrollbar flex snap-x gap-2 overflow-x-auto">
            {categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`shrink-0 border px-4 py-2 text-sm font-semibold ${category === item ? "border-[var(--color-text-main)] bg-[var(--color-text-main)] text-[var(--color-bg-primary)]" : "border-[var(--color-border)] text-[var(--color-text-secondary)]"}`}>{t(item)}</button>)}
          </div>
          <label className="relative lg:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full border border-[var(--color-border)] bg-[var(--color-surface-elevated)] py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[var(--color-accent-main)]" placeholder={t("Search creative works...")} />
          </label>
        </div>
      </section>
      <section className="px-5 py-12 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-7xl">
          {works.length === 0 ? <EmptyState title={t("No creative works found")} description={t("Try another category or search term.")} /> : (
            <div className="grid auto-rows-[240px] gap-4 sm:gap-5 md:grid-cols-6 md:auto-rows-[220px]">
              {works.map((work, index) => (
                <Link key={work.id} to={`/creative-works/${work.slug}`} className={`group relative overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface-elevated)] ${index === 0 ? "md:col-span-4 md:row-span-2" : "md:col-span-2"}`}>
                  <div
                    className="absolute inset-0 opacity-70"
                    style={{
                      backgroundImage: index % 2
                        ? "linear-gradient(135deg, rgba(255,64,85,.25), transparent 48%), linear-gradient(25deg, #111923, #071018)"
                        : "linear-gradient(135deg, rgba(78,187,232,.28), transparent 48%), linear-gradient(25deg, #12232d, #071018)",
                    }}
                  />
                  <img
                    src={work.cover}
                    alt=""
                    aria-hidden="true"
                    className="relative h-full w-full object-cover opacity-75 transition duration-500 group-hover:scale-105 group-hover:opacity-95"
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.hidden = true;
                    }}
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/65 to-transparent p-5">
                    <p className="font-mono text-[9px] uppercase tracking-[.16em] text-[var(--color-accent-secondary)]">{t(work.category)}</p>
                    <h2 className="mt-2 font-manrope text-xl font-bold sm:text-2xl">{t(work.title)}</h2>
                    <span className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-white/80">{t("Open work")} <ArrowRight size={15} /></span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
