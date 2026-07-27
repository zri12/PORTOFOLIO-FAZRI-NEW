import { ArrowRight, ArrowUpRight, BookOpenText, Clock3, Files } from "lucide-react";
import { Link } from "react-router";
import { useMemo } from "react";
import { useDocumentMeta } from "../../hooks/useDocumentMeta";
import { usePortfolioData } from "../../hooks/usePortfolioData";
import { useLanguage } from "../../context/LanguageContext";
import type { Article } from "../../types/portfolio";
import { hasArticleLanguage, localizeArticle } from "../../lib/localizedContent";

export default function BlogPage() {
  const { articles, settings, profile } = usePortfolioData();
  const { language, t } = useLanguage();
  const published = articles
    .filter((article) => article.status === "published" && (!article.publishedAt || new Date(article.publishedAt) <= new Date()))
    .filter((article) => hasArticleLanguage(article, language))
    .map((article) => localizeArticle(article, language))
    .sort((a, b) => Number(b.featured) - Number(a.featured) || b.publishedAt.localeCompare(a.publishedAt));
  const featured = published[0];
  const rest = featured ? published.slice(1) : [];
  const categories = Array.from(new Set(published.map((article) => article.category))).slice(0, 4);
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
    <main className="relative overflow-x-clip bg-[var(--color-bg-primary)] pb-28 pt-28 text-[var(--color-text-main)] sm:pt-32">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[680px] bg-[radial-gradient(circle_at_78%_8%,rgba(78,187,232,.11),transparent_34%),linear-gradient(180deg,rgba(255,255,255,.018),transparent)]" />
      <header className="relative mx-auto max-w-7xl px-5 sm:px-6">
        <div className="grid gap-10 border-b border-[var(--color-border)] pb-12 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end lg:pb-16">
          <div>
            <div className="flex items-center gap-3 font-mono text-[10px] font-bold uppercase tracking-[.22em] text-[var(--color-accent-main)]">
              <span className="h-px w-10 bg-current" /> Insights / Journal
            </div>
            <h1 className="mt-6 max-w-4xl font-manrope text-4xl font-bold leading-[1.04] tracking-[-.035em] sm:text-6xl lg:text-7xl">
              {t("Notes from the process of building digital products.")}
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-[var(--color-text-secondary)] sm:text-lg">
              {t("Practical writing about web development, interface design, performance, and the decisions behind a product.")}
            </p>
          </div>
          <aside className="border-l border-[var(--color-border)] pl-6">
            <Files size={20} className="text-[var(--color-accent-main)]" />
            <strong className="mt-6 block font-manrope text-4xl">{String(published.length).padStart(2, "0")}</strong>
            <span className="mt-1 block text-sm text-[var(--color-text-muted)]">{language === "id" ? "Artikel diterbitkan" : "Published articles"}</span>
            {categories.length > 0 && <p className="mt-5 font-mono text-[9px] uppercase leading-6 tracking-[.12em] text-[var(--color-text-muted)]">{categories.join(" · ")}</p>}
          </aside>
        </div>
      </header>

      <section className="relative mx-auto mt-10 max-w-7xl px-5 sm:px-6 lg:mt-14" aria-label={t("Article list")}>
        {published.length === 0 ? (
          <div className="border-y border-[var(--color-border)] py-16">
            <p className="font-manrope text-2xl font-bold">{language === "id" ? "Belum ada artikel yang dipublikasikan." : "No published articles yet."}</p>
            <p className="mt-3 text-[var(--color-text-secondary)]">{language === "id" ? "Artikel akan muncul setelah dipublikasikan melalui admin." : "Articles will appear after they are published through admin."}</p>
          </div>
        ) : (
          <div>
            {featured && <FeaturedArticle article={featured} t={t} language={language} />}
            {rest.length > 0 && (
              <section className="mt-20 sm:mt-24">
                <div className="flex items-end justify-between gap-6 border-b border-[var(--color-border)] pb-5">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[.18em] text-[var(--color-accent-main)]">Archive / {String(rest.length).padStart(2, "0")}</p>
                    <h2 className="mt-3 font-manrope text-3xl font-bold tracking-[-.02em] sm:text-4xl">{language === "id" ? "Catatan terbaru" : "Latest notes"}</h2>
                  </div>
                  <BookOpenText size={24} className="mb-1 text-[var(--color-text-muted)]" />
                </div>
                <div className="grid gap-x-8 gap-y-14 pt-8 md:grid-cols-2">
                  {rest.map((article, index) => <ArticleCard key={article.id} article={article} index={index + 2} t={t} language={language} />)}
                </div>
              </section>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

function FeaturedArticle({ article, t, language }: { article: Article; t: (value: string) => string; language: "en" | "id" }) {
  return (
    <article className="group border-y border-[var(--color-border)]">
      <Link to={`/blog/${article.slug}`} className="relative block overflow-hidden bg-[var(--color-bg-secondary)]">
        {article.coverImage ? (
          <img src={article.coverImage} alt={article.coverAlt || article.title} loading="eager" className="h-auto w-full object-contain" />
        ) : (
          <div className="min-h-[280px] sm:min-h-[380px] lg:min-h-[460px]"><ArticleVisual category={article.category} featured /></div>
        )}
        <span className="absolute left-4 top-4 border border-[var(--color-accent-main)]/35 bg-[var(--color-bg-primary)]/90 px-3 py-2 font-mono text-[9px] uppercase tracking-[.16em] text-[var(--color-accent-main)] backdrop-blur sm:left-6 sm:top-6">Featured / 01</span>
      </Link>
      <div className="grid gap-8 py-8 sm:py-10 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-16">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[.16em] text-[var(--color-accent-main)]">{article.category}</p>
          <p className="mt-4 text-sm text-[var(--color-text-muted)]">{formatArticleDate(article.publishedAt, language)}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {article.tags.slice(0, 3).map((tag) => <span key={tag} className="border-l border-[var(--color-border)] pl-2 font-mono text-[9px] uppercase tracking-[.12em] text-[var(--color-text-muted)]">{tag}</span>)}
          </div>
        </div>
        <div>
          <h2 className="max-w-4xl font-manrope text-3xl font-bold leading-[1.12] tracking-[-.025em] sm:text-5xl"><Link to={`/blog/${article.slug}`} className="transition-colors hover:text-[var(--color-accent-main)]">{article.title}</Link></h2>
          <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--color-text-secondary)]">{article.excerpt}</p>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <Link to={`/blog/${article.slug}`} className="inline-flex items-center gap-3 text-sm font-bold text-[var(--color-accent-main)]">{t("Read article")} <ArrowRight size={16} /></Link>
            <span className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]"><Clock3 size={14} /> {article.readingTime} {t("min read")}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

function ArticleCard({ article, index, t, language }: { article: Article; index: number; t: (value: string) => string; language: "en" | "id" }) {
  return (
    <article className="group flex min-w-0 flex-col border-t border-[var(--color-border)] pt-4">
      <Link to={`/blog/${article.slug}`} className="relative block overflow-hidden bg-[var(--color-surface-elevated)]">
        {article.coverImage ? (
          <img src={article.coverImage} alt={article.coverAlt || article.title} loading="lazy" className="h-auto w-full object-contain" />
        ) : (
          <div className="aspect-[16/10]"><ArticleVisual category={article.category} /></div>
        )}
      </Link>
      <div className="flex flex-1 flex-col pt-6">
        <div className="flex items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[.16em] text-[var(--color-accent-main)]">
          <span className="truncate">{article.category}</span>
          <span>{String(index).padStart(2, "0")}</span>
        </div>
        <h2 className="mt-5 max-w-xl font-manrope text-2xl font-bold leading-[1.18] tracking-[-.015em] sm:text-3xl"><Link to={`/blog/${article.slug}`} className="transition-colors hover:text-[var(--color-accent-main)]">{article.title}</Link></h2>
        <p className="mt-4 line-clamp-3 text-sm leading-7 text-[var(--color-text-secondary)]">{article.excerpt}</p>
        <div className="mt-auto flex items-center justify-between gap-4 pt-7">
          <span className="text-xs text-[var(--color-text-muted)]">{formatArticleDate(article.publishedAt, language)} · {article.readingTime} {t("min read")}</span>
          <Link to={`/blog/${article.slug}`} aria-label={`${t("Read")} ${article.title}`} className="flex h-10 w-10 items-center justify-center border border-[var(--color-border)] text-[var(--color-text-main)] transition-[border-color,color,transform] duration-300 hover:-translate-y-0.5 hover:border-[var(--color-accent-main)] hover:text-[var(--color-accent-main)]"><ArrowUpRight size={18} /></Link>
        </div>
      </div>
    </article>
  );
}

function formatArticleDate(value: string, language: "en" | "id" = "en") {
  if (!value) return language === "id" ? "Tanpa tanggal" : "Undated";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(language === "id" ? "id-ID" : "en-US", { day: "2-digit", month: "short", year: "numeric" }).format(date);
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
