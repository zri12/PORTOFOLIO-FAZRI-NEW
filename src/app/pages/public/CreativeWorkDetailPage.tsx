import { Link, useParams } from "react-router";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { EmptyState } from "../../components/common/EmptyState";
import { SectionHeading } from "../../components/common/SectionHeading";
import { useLanguage } from "../../context/LanguageContext";
import { useDocumentMeta } from "../../hooks/useDocumentMeta";
import { usePortfolioData } from "../../hooks/usePortfolioData";

export default function CreativeWorkDetailPage() {
  const { slug = "" } = useParams();
  const { creativeWorks } = usePortfolioData();
  const { t } = useLanguage();
  const work = creativeWorks.find((item) => item.slug === slug);

  useDocumentMeta({ title: work ? `${work.title} - Creative Work` : "Creative Work Not Found", description: work?.description || "Creative work detail page." });

  if (!work) {
    return <main className="min-h-screen bg-[var(--color-bg-primary)] px-6 pt-32"><div className="mx-auto max-w-4xl"><EmptyState title={t("Creative work not found")} description={t("The selected work is unavailable.")} /></div></main>;
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg-primary)] pt-32 text-[var(--color-text-main)]">
      <section className="px-6 pb-16">
        <div className="mx-auto max-w-7xl">
          <Link to="/creative-works" className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)]"><ArrowLeft size={16} /> {t("Back to Creative Works")}</Link>
          <div className="grid gap-12 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[.18em] text-[var(--color-accent-main)]">{t(work.category)} / {work.year}</p>
              <h1 className="mt-5 font-manrope text-5xl font-extrabold tracking-tight md:text-7xl">{t(work.title)}</h1>
              <p className="mt-6 text-lg leading-8 text-[var(--color-text-secondary)]">{t(work.description)}</p>
              <div className="mt-8 flex flex-wrap gap-2">{work.tools.map((tool) => <span key={tool} className="border border-[var(--color-border)] px-3 py-2 text-sm">{tool}</span>)}</div>
            </div>
            <img src={work.cover} alt={t(work.title)} className="aspect-[16/11] w-full border border-[var(--color-border)] object-cover" />
          </div>
        </div>
      </section>
      <section className="border-y border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <SectionHeading eyebrow={t("Creative brief")} title={t("Intent, process, and output.")} description={t(work.brief)} />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
                {work.gallery.map((image, index) => <img key={image} src={image} alt={`${t(work.title)} ${t("gallery")} ${index + 1}`} className="aspect-[4/3] w-full border border-[var(--color-border)] object-cover" loading="lazy" />)}
          </div>
          {work.beforeImage && work.afterImage && (
            <div className="mt-14 grid gap-6 md:grid-cols-2">
              <Panel label={t("Before")} image={work.beforeImage} />
              <Panel label={t("After")} image={work.afterImage} />
            </div>
          )}
          {work.videoUrl && <a href={work.videoUrl} target="_blank" rel="noreferrer" className="mt-10 inline-flex items-center gap-2 border-b border-[var(--color-accent-main)] pb-2 text-sm font-bold">{t("Open video reference")} <ExternalLink size={15} /></a>}
        </div>
      </section>
    </main>
  );
}

function Panel({ label, image }: { label: string; image: string }) {
  return <div><p className="mb-3 font-mono text-[10px] uppercase tracking-[.18em] text-[var(--color-text-muted)]">{label}</p><img src={image} alt={label} className="aspect-video w-full border border-[var(--color-border)] object-cover" /></div>;
}
