import { useMemo } from "react";
import { ArrowLeft, Clock3 } from "lucide-react";
import { Link, useParams } from "react-router";
import { useDocumentMeta } from "../../hooks/useDocumentMeta";
import { usePortfolioData } from "../../hooks/usePortfolioData";
import type { ArticleBlock } from "../../types/portfolio";

export default function ArticleDetailPage() {
  const { slug = "" } = useParams();
  const { articles, settings, profile } = usePortfolioData();
  const article = articles.find((item) => item.slug === slug && item.status === "published");
  const schema = useMemo(() => article ? {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.seoDescription || article.excerpt,
    image: article.coverImage || settings.seoImage || undefined,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    mainEntityOfPage: `${settings.siteUrl.replace(/\/$/, "")}/blog/${article.slug}`,
    author: { "@type": "Person", name: article.author || profile.fullName },
    publisher: { "@type": "Person", name: profile.fullName },
  } : undefined, [article, profile.fullName, settings.seoImage, settings.siteUrl]);

  useDocumentMeta({
    title: article ? `${article.seoTitle || article.title} | ${profile.displayName}` : `Artikel tidak ditemukan | ${profile.displayName}`,
    description: article?.seoDescription || article?.excerpt || "Artikel tidak ditemukan.",
    canonicalPath: `/blog/${slug}`,
    siteUrl: settings.siteUrl,
    image: article?.coverImage || settings.seoImage,
    type: "article",
    noIndex: !article,
    language: "id",
    structuredData: schema,
  });

  if (!article) {
    return <main className="mx-auto min-h-[65vh] max-w-5xl px-5 pb-24 pt-36 sm:px-6"><p className="font-mono text-xs uppercase tracking-[.18em] text-[var(--color-accent-main)]">404 / Article</p><h1 className="mt-5 font-manrope text-4xl font-bold">Artikel tidak ditemukan.</h1><Link to="/blog" className="mt-8 inline-flex items-center gap-2 border-b border-current pb-1 font-bold"><ArrowLeft size={17} /> Kembali ke blog</Link></main>;
  }

  const publishedDate = article.publishedAt ? new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date(article.publishedAt)) : "";

  return (
    <main className="bg-[var(--color-bg-primary)] pb-24 pt-28 sm:pt-32">
      <article>
        <header className="mx-auto max-w-5xl px-5 sm:px-6">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-accent-main)]"><ArrowLeft size={16} /> Semua artikel</Link>
          <p className="mt-10 font-mono text-xs font-bold uppercase tracking-[.18em] text-[var(--color-accent-main)]">{article.category}</p>
          <h1 className="mt-5 max-w-4xl font-manrope text-4xl font-bold leading-[1.08] sm:text-6xl">{article.title}</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--color-text-secondary)] sm:text-xl">{article.excerpt}</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[var(--color-border)] py-5 text-sm text-[var(--color-text-muted)]"><span>{article.author}</span><span>{publishedDate}</span><span className="flex items-center gap-2"><Clock3 size={15} /> {article.readingTime} menit baca</span></div>
        </header>

        {article.coverImage && <figure className="mx-auto mt-6 max-w-7xl px-5 sm:px-6"><img src={article.coverImage} alt={article.coverAlt || article.title} className="max-h-[720px] w-full object-cover" /><figcaption className="mt-3 text-xs text-[var(--color-text-muted)]">{article.coverAlt}</figcaption></figure>}

        <div className="mx-auto mt-12 max-w-3xl px-5 sm:px-6">
          {article.blocks.map((block) => <ArticleBlockView key={block.id} block={block} />)}
          {article.tags.length > 0 && <div className="mt-14 flex flex-wrap gap-2 border-t border-[var(--color-border)] pt-6">{article.tags.map((tag) => <span key={tag} className="border border-[var(--color-border)] px-3 py-2 font-mono text-[10px] uppercase tracking-[.12em] text-[var(--color-text-secondary)]">{tag}</span>)}</div>}
        </div>
      </article>
    </main>
  );
}

function ArticleBlockView({ block }: { block: ArticleBlock }) {
  if (block.type === "heading") return block.level === 3 ? <h3 className="mb-4 mt-9 font-manrope text-2xl font-bold">{block.text}</h3> : <h2 className="mb-5 mt-12 font-manrope text-3xl font-bold">{block.text}</h2>;
  if (block.type === "paragraph") return <p className="my-6 text-[1.05rem] leading-8 text-[var(--color-text-secondary)]">{block.text}</p>;
  if (block.type === "quote") return <blockquote className="my-10 border-l-2 border-[var(--color-accent-main)] bg-[var(--color-surface-elevated)] px-6 py-7"><p className="font-manrope text-xl font-semibold leading-8">“{block.text}”</p>{block.attribution && <cite className="mt-4 block text-sm not-italic text-[var(--color-text-muted)]">{block.attribution}</cite>}</blockquote>;
  if (block.type === "image") return <figure className="my-10"><img src={block.url} alt={block.alt} loading="lazy" className="h-auto w-full" />{block.caption && <figcaption className="mt-3 text-sm text-[var(--color-text-muted)]">{block.caption}</figcaption>}</figure>;
  const List = block.ordered ? "ol" : "ul";
  return <List className={`my-7 space-y-3 pl-6 text-[1.05rem] leading-8 text-[var(--color-text-secondary)] ${block.ordered ? "list-decimal" : "list-disc"}`}>{block.items.map((item, index) => <li key={`${block.id}-${index}`}>{item}</li>)}</List>;
}
