import { ArrowUpRight, Clock3 } from "lucide-react";
import { Link } from "react-router";
import { useMemo } from "react";
import { useDocumentMeta } from "../../hooks/useDocumentMeta";
import { usePortfolioData } from "../../hooks/usePortfolioData";
import { useLanguage } from "../../context/LanguageContext";

export default function BlogPage() {
  const { articles, settings, profile } = usePortfolioData();
  const { language, t } = useLanguage();
  const published = articles
    .filter((article) => article.status === "published" && (!article.publishedAt || new Date(article.publishedAt) <= new Date()))
    .sort((a, b) => Number(b.featured) - Number(a.featured) || b.publishedAt.localeCompare(a.publishedAt));
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
    <main className="bg-[var(--color-bg-primary)] pb-24 pt-28 sm:pt-32">
      <header className="mx-auto max-w-7xl px-5 sm:px-6">
        <p className="font-mono text-xs font-bold uppercase tracking-[.2em] text-[var(--color-accent-main)]">Insights / Journal</p>
        <div className="mt-5 grid gap-6 border-b border-[var(--color-border)] pb-10 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
          <h1 className="max-w-3xl font-manrope text-4xl font-bold leading-tight sm:text-6xl">{t("Notes from the process of building digital products.")}</h1>
          <p className="max-w-xl text-base leading-8 text-[var(--color-text-secondary)] lg:justify-self-end">{t("Practical writing about web development, interface design, performance, and the decisions behind a product.")}</p>
        </div>
      </header>

      <section className="mx-auto mt-10 max-w-7xl px-5 sm:px-6" aria-label={t("Article list")}>
        {published.length === 0 ? (
          <div className="border-y border-[var(--color-border)] py-16">
            <p className="font-manrope text-2xl font-bold">{t("No published articles yet.")}</p>
            <p className="mt-3 text-[var(--color-text-secondary)]">{t("New articles will appear here after they are published from the admin.")}</p>
          </div>
        ) : (
          <div className="grid gap-px bg-[var(--color-border)] md:grid-cols-2 lg:grid-cols-3">
            {published.map((article, index) => (
              <article key={article.id} className={`group flex min-w-0 flex-col bg-[var(--color-bg-primary)] ${index === 0 && published.length > 2 ? "md:col-span-2 lg:col-span-2" : ""}`}>
                <Link to={`/blog/${article.slug}`} className={`relative block overflow-hidden bg-[var(--color-surface-elevated)] ${index === 0 && published.length > 2 ? "aspect-[16/8]" : "aspect-[16/10]"}`}>
                  {article.coverImage ? <img src={article.coverImage} alt={article.coverAlt || article.title} loading={index > 0 ? "lazy" : "eager"} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]" /> : <div className="flex h-full items-end p-6 font-mono text-xs uppercase tracking-[.18em] text-[var(--color-text-muted)]">{article.category}</div>}
                </Link>
                <div className="flex flex-1 flex-col border-x border-b border-[var(--color-border)] p-6 sm:p-7">
                  <div className="flex items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[.16em] text-[var(--color-accent-main)]">
                    <span>{article.category}</span>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <h2 className="mt-5 font-manrope text-2xl font-bold leading-tight sm:text-3xl"><Link to={`/blog/${article.slug}`} className="hover:text-[var(--color-accent-main)]">{article.title}</Link></h2>
                  <p className="mt-4 line-clamp-3 leading-7 text-[var(--color-text-secondary)]">{article.excerpt}</p>
                  <div className="mt-8 flex items-center justify-between gap-4 border-t border-[var(--color-border)] pt-5">
                    <span className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]"><Clock3 size={14} /> {article.readingTime} {t("min read")}</span>
                    <Link to={`/blog/${article.slug}`} aria-label={`${t("Read")} ${article.title}`} className="flex h-10 w-10 items-center justify-center border border-[var(--color-border)] text-[var(--color-text-main)] hover:border-[var(--color-accent-main)] hover:text-[var(--color-accent-main)]"><ArrowUpRight size={18} /></Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
