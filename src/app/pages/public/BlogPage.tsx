import { ArrowRight, ArrowUpRight, BookOpenText, Clock3, Sparkles } from "lucide-react";
import { Link } from "react-router";
import { useMemo } from "react";
import { useDocumentMeta } from "../../hooks/useDocumentMeta";
import { usePortfolioData } from "../../hooks/usePortfolioData";
import { useLanguage } from "../../context/LanguageContext";
import type { Article } from "../../types/portfolio";

export default function BlogPage() {
  const { articles, settings, profile } = usePortfolioData();
  const { language, t } = useLanguage();
  const published = articles
    .filter((article) => article.status === "published" && (!article.publishedAt || new Date(article.publishedAt) <= new Date()))
    .sort((a, b) => Number(b.featured) - Number(a.featured) || b.publishedAt.localeCompare(a.publishedAt));
  const featured = published[0];
  const rest = featured ? published.slice(1) : [];
  const schema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `Blog ${profile.fullName}`,
    description: "Articles about web development, interface design, and the process behind digital products.",
    url: `${settings.siteUrl.replace(/\/$/, "")}/blog`,
    author: { "@type": "Person", name: profile.fullName },
  }), [profile.fullName, settings.siteUrl]);

  useDocumentMeta({
    title: `Blog | ${profile.fullName}`,
    description: "Articles and notes from Fazri Lukman Nurrohman about web development, interface design, and building digital products.",
    canonicalPath: "/blog",
    siteUrl: settings.siteUrl,
    image: settings.seoImage,
    language,
    structuredData: schema,
  });

  return (
    <main className="overflow-x-clip bg-[var(--color-bg-primary)] pb-24 pt-28 text-[var(--color-text-main)] sm:pt-32">
      <header className="mx-auto max-w-7xl px-5 sm:px-6">
        <div className="grid gap-8 border-b border-[var(--color-border)] pb-12 lg:grid-cols-[1.12fr_.88fr] lg:items-end">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[.22em] text-[var(--color-accent-main)]">Insights / Journal</p>
            <h1 className="mt-5 max-w-3xl font-manrope text-4xl font-bold leading-tight tracking-[-.025em] sm:text-6xl">{t("Notes from the process of building digital products.")}</h1>
          </div>
          <div className="border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5">
            <Sparkles size={18} className="text-[var(--color-accent-main)]" />
            <p className="mt-5 text-base leading-8 text-[var(--color-text-secondary)]">{t("Practical writing about web development, interface design, performance, and the decisions behind a product.")}</p>
          </div>
        </div>
      </header>

      <section className="mx-auto mt-10 max-w-7xl px-5 sm:px-6" aria-label={t("Article list")}>
        {published.length === 0 ? (
          <div className="border-y border-[var(--color-border)] py-16">
            <p className="font-manrope text-2xl font-bold">{t("No published articles yet.")}</p>
            <p className="mt-3 text-[var(--color-text-secondary)]">{t("New articles will appear here after they are published from the admin.")}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {featured && <FeaturedArticle article={featured} t={t} />}
            {rest.length > 0 && (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {rest.map((article, index) => <ArticleCard key={article.id} article={article} index={index + 2} t={t} />)}
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

function FeaturedArticle({ article, t }: { article: Article; t: (value: string) => string }) {
  return (
    <article className="group grid overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-[0_24px_80px_rgba(0,0,0,.18)] lg:grid-cols-[1.1fr_.9fr]">
      <Link to={`/blog/${article.slug}`} className="relative block min-h-[280px] overflow-hidden bg-[var(--color-bg-secondary)] sm:min-h-[380px] lg:min-h-[460px]">
        {article.coverImage ? (
          <img src={article.coverImage} alt={article.coverAlt || article.title} loading="eager" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]" />
        ) : (
          <ArticleVisual category={article.category} featured />
        )}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/55 to-transparent" />
        <span className="absolute left-5 top-5 border border-[var(--color-accent-main)]/35 bg-[var(--color-bg-primary)]/85 px-3 py-2 font-mono text-[9px] uppercase tracking-[.16em] text-[var(--color-accent-main)] backdrop-blur">Featured</span>
      </Link>
      <div className="flex min-w-0 flex-col p-6 sm:p-8 lg:p-10">
        <div className="flex items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[.16em] text-[var(--color-accent-main)]">
          <span>{article.category}</span>
          <span>01</span>
        </div>
        <h2 className="mt-8 max-w-2xl font-manrope text-3xl font-bold leading-tight tracking-[-.02em] sm:text-5xl"><Link to={`/blog/${article.slug}`} className="hover:text-[var(--color-accent-main)]">{article.title}</Link></h2>
        <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--color-text-secondary)]">{article.excerpt}</p>
        <div className="mt-8 flex flex-wrap gap-2">
          {article.tags.slice(0, 3).map((tag) => <span key={tag} className="border border-[var(--color-border)] px-3 py-2 font-mono text-[9px] uppercase tracking-[.12em] text-[var(--color-text-muted)]">{tag}</span>)}
        </div>
        <div className="mt-auto flex items-center justify-between gap-5 border-t border-[var(--color-border)] pt-6">
          <span className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]"><Clock3 size={14} /> {article.readingTime} {t("min read")}</span>
          <Link to={`/blog/${article.slug}`} className="inline-flex items-center gap-2 text-sm font-bold text-[var(--color-accent-main)]">{t("Read article")} <ArrowRight size={15} /></Link>
        </div>
      </div>
    </article>
  );
}

function ArticleCard({ article, index, t }: { article: Article; index: number; t: (value: string) => string }) {
  return (
    <article className="group flex min-w-0 flex-col overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-primary)] transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-[var(--color-accent-main)]/60 hover:shadow-[0_24px_65px_rgba(0,0,0,.22)]">
      <Link to={`/blog/${article.slug}`} className="relative block aspect-[16/10] overflow-hidden bg-[var(--color-surface-elevated)]">
        {article.coverImage ? (
          <img src={article.coverImage} alt={article.coverAlt || article.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]" />
        ) : (
          <ArticleVisual category={article.category} />
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[.16em] text-[var(--color-accent-main)]">
          <span className="truncate">{article.category}</span>
          <span>{String(index).padStart(2, "0")}</span>
        </div>
        <h2 className="mt-5 font-manrope text-2xl font-bold leading-tight"><Link to={`/blog/${article.slug}`} className="hover:text-[var(--color-accent-main)]">{article.title}</Link></h2>
        <p className="mt-4 line-clamp-3 text-sm leading-7 text-[var(--color-text-secondary)]">{article.excerpt}</p>
        <div className="mt-auto flex items-center justify-between gap-4 border-t border-[var(--color-border)] pt-5">
          <span className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]"><Clock3 size={14} /> {article.readingTime} {t("min read")}</span>
          <Link to={`/blog/${article.slug}`} aria-label={`${t("Read")} ${article.title}`} className="flex h-10 w-10 items-center justify-center border border-[var(--color-border)] text-[var(--color-text-main)] transition-[border-color,color,transform] duration-300 hover:-translate-y-0.5 hover:border-[var(--color-accent-main)] hover:text-[var(--color-accent-main)]"><ArrowUpRight size={18} /></Link>
        </div>
      </div>
    </article>
  );
}

function ArticleVisual({ category, featured = false }: { category: string; featured?: boolean }) {
  return (
    <div className="relative flex h-full w-full overflow-hidden bg-[linear-gradient(145deg,var(--color-bg-secondary),var(--color-surface-elevated))] p-6">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(78,187,232,.08)_1px,transparent_1px)] bg-[length:28px_28px] opacity-70" />
      <div className="relative mt-auto w-full">
        <BookOpenText size={featured ? 42 : 30} className="mb-8 text-[var(--color-accent-main)]" />
        <p className="font-mono text-[10px] uppercase tracking-[.2em] text-[var(--color-accent-main)]">{category}</p>
        <div className="mt-5 grid gap-2">
          <span className="h-px w-full bg-[var(--color-border)]" />
          <span className="h-px w-2/3 bg-[var(--color-border)]" />
        </div>
      </div>
    </div>
  );
}
