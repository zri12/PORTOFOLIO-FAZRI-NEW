import { useMemo, useState } from "react";
import { Edit, ExternalLink, Plus, Search, Trash } from "lucide-react";
import { Link } from "react-router";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import { StatusBadge } from "../../components/admin/StatusBadge";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { usePortfolioData } from "../../hooks/usePortfolioData";
import { formatAdminSaveError } from "../../lib/supabase/errorMessages";
import { portfolioRepository } from "../../repositories/portfolioRepository";

export default function AdminArticlesPage() {
  const { articles } = usePortfolioData();
  const [query, setQuery] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const target = articles.find((item) => item.id === deleteId);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return articles
      .filter((article) => !needle || [article.title, article.category, article.status, article.tags.join(" ")].some((value) => value.toLowerCase().includes(needle)))
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  }, [articles, query]);

  const setPublished = async (id: string) => {
    const article = articles.find((item) => item.id === id);
    if (!article) return;
    setBusyId(id);
    setError("");
    try {
      portfolioRepository.updateArticle({ ...article, status: article.status === "published" ? "draft" : "published", publishedAt: article.publishedAt || new Date().toISOString() });
      await portfolioRepository.flushPendingWrites();
    } catch (saveError) {
      setError(formatAdminSaveError(saveError, "Article publication status could not be updated."));
    } finally {
      setBusyId("");
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setBusyId(deleteId);
    setError("");
    try {
      portfolioRepository.deleteArticle(deleteId);
      await portfolioRepository.flushPendingWrites();
      setDeleteId(null);
    } catch (deleteError) {
      setError(formatAdminSaveError(deleteError, "Article could not be deleted."));
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader title="Articles" description="Write, publish, and maintain SEO-ready articles shown on the public blog." action={<Link to="/admin/articles/new" className="inline-flex items-center gap-2 bg-[var(--color-text-main)] px-4 py-2.5 text-sm font-bold text-[var(--color-bg-primary)]"><Plus size={16} /> New Article</Link>} />
      <label className="mb-6 flex max-w-lg items-center gap-3 border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-3">
        <Search size={17} className="text-[var(--color-text-muted)]" />
        <span className="sr-only">Search articles</span>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, category, tag, or status" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
      </label>
      {error && <p className="mb-5 border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-300" role="alert">{error}</p>}

      {filtered.length === 0 ? (
        <div className="border border-dashed border-[var(--color-border)] px-6 py-14 text-center"><h2 className="font-manrope text-xl font-bold">{articles.length ? "No matching articles" : "No articles yet"}</h2><p className="mt-2 text-sm text-[var(--color-text-secondary)]">{articles.length ? "Try a different search term." : "Create the first article to start your public blog."}</p></div>
      ) : (
        <div className="overflow-hidden border border-[var(--color-border)]">
          {filtered.map((article) => (
            <article key={article.id} className="grid gap-4 border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4 last:border-b-0 sm:grid-cols-[9rem_1fr_auto] sm:items-center sm:p-5">
              <div className="aspect-[16/10] overflow-hidden bg-[var(--color-bg-primary)]">{article.coverImage ? <img src={article.coverImage} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center font-mono text-[10px] uppercase tracking-[.14em] text-[var(--color-text-muted)]">No cover</div>}</div>
              <div className="min-w-0"><div className="flex flex-wrap gap-2"><StatusBadge status={article.status} />{article.featured && <StatusBadge status="featured" />}</div><h2 className="mt-3 truncate font-manrope text-lg font-bold">{article.title}</h2><p className="mt-1 truncate text-sm text-[var(--color-text-secondary)]">{article.category} / {article.readingTime} min read</p></div>
              <div className="flex flex-wrap gap-2 sm:justify-end">
                {article.status === "published" && <Link to={`/blog/${article.slug}`} target="_blank" title="View article" className="flex h-10 w-10 items-center justify-center border border-[var(--color-border)]"><ExternalLink size={16} /></Link>}
                <Link to={`/admin/articles/${article.id}/edit`} title="Edit article" className="flex h-10 w-10 items-center justify-center border border-[var(--color-border)]"><Edit size={16} /></Link>
                <button type="button" disabled={busyId === article.id} onClick={() => void setPublished(article.id)} className="border border-[var(--color-border)] px-3 py-2 text-xs font-bold disabled:opacity-50">{article.status === "published" ? "Unpublish" : "Publish"}</button>
                <button type="button" onClick={() => setDeleteId(article.id)} title="Delete article" className="flex h-10 w-10 items-center justify-center border border-red-500/30 text-red-300"><Trash size={16} /></button>
              </div>
            </article>
          ))}
        </div>
      )}
      <ConfirmDialog open={Boolean(deleteId)} title="Delete article?" description={`“${target?.title || "This article"}” will be permanently removed from the admin and public blog.`} confirmLabel={busyId === deleteId ? "Deleting..." : "Delete article"} onCancel={() => setDeleteId(null)} onConfirm={() => void confirmDelete()} />
    </div>
  );
}
