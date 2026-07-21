import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, CheckCircle2, Heading2, ImagePlus, List, Pilcrow, Plus, Quote, Save, Trash } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { AdminImageField } from "../../components/admin/AdminImageFields";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import { AdminInput, FormSection } from "../../components/admin/FormSection";
import { usePortfolioData } from "../../hooks/usePortfolioData";
import { formatAdminSaveError } from "../../lib/supabase/errorMessages";
import { slugify } from "../../lib/storage";
import { portfolioRepository } from "../../repositories/portfolioRepository";
import type { Article, ArticleBlock } from "../../types/portfolio";

const blockId = () => crypto.randomUUID();

function newDraft(author: string, order: number): Article {
  const now = new Date().toISOString();
  return { id: crypto.randomUUID(), slug: "", title: "", excerpt: "", category: "Web Development", tags: [], coverImage: "", coverAlt: "", author, status: "draft", featured: false, publishedAt: now, updatedAt: now, readingTime: 1, seoTitle: "", seoDescription: "", blocks: [{ id: blockId(), type: "paragraph", text: "" }], displayOrder: order };
}

export default function AdminArticleFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { articles, profile } = usePortfolioData();
  const source = id ? articles.find((item) => item.id === id) : undefined;
  const [draft, setDraft] = useState<Article>(() => source || newDraft(profile.fullName, articles.length + 1));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (source) setDraft(source);
  }, [source]);

  const set = <K extends keyof Article>(key: K, value: Article[K]) => {
    setError("");
    setDraft((current) => ({ ...current, [key]: value }));
  };
  const updateBlock = (index: number, block: ArticleBlock) => set("blocks", draft.blocks.map((item, itemIndex) => itemIndex === index ? block : item));
  const removeBlock = (index: number) => set("blocks", draft.blocks.filter((_, itemIndex) => itemIndex !== index));
  const moveBlock = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= draft.blocks.length) return;
    const next = [...draft.blocks];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    set("blocks", next);
  };
  const addBlock = (type: ArticleBlock["type"]) => {
    const block: ArticleBlock = type === "heading" ? { id: blockId(), type, text: "", level: 2 }
      : type === "image" ? { id: blockId(), type, url: "", alt: "", caption: "" }
      : type === "quote" ? { id: blockId(), type, text: "", attribution: "" }
      : type === "list" ? { id: blockId(), type, items: [""], ordered: false }
      : { id: blockId(), type, text: "" };
    set("blocks", [...draft.blocks, block]);
  };

  const save = async (status: Article["status"]) => {
    const title = draft.title.trim();
    const slug = (draft.slug || slugify(title)).trim();
    if (!title || !slug || !draft.excerpt.trim()) {
      setError("Title, slug, and excerpt are required.");
      return;
    }
    if (articles.some((article) => article.id !== draft.id && article.slug.toLowerCase() === slug.toLowerCase())) {
      setError("Slug is already used by another article.");
      return;
    }
    if (!draft.blocks.length) {
      setError("Add at least one content block.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      portfolioRepository.updateArticle({ ...draft, status, title, slug, seoTitle: draft.seoTitle.trim() || title, seoDescription: draft.seoDescription.trim() || draft.excerpt.trim(), coverAlt: draft.coverAlt.trim() || title, readingTime: Math.max(1, draft.readingTime), publishedAt: draft.publishedAt || new Date().toISOString() });
      await portfolioRepository.flushPendingWrites();
      navigate("/admin/articles");
    } catch (saveError) {
      setError(formatAdminSaveError(saveError, "Article could not be saved to Supabase."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <AdminPageHeader title={id ? "Edit Article" : "New Article"} description="Build an article with structured content blocks, images, publication controls, and search metadata." />
      <div className="grid gap-6">
        <FormSection title="Article Details">
          <AdminInput label="Title" value={draft.title} onChange={(value) => { set("title", value); if (!id && !draft.slug) set("slug", slugify(value)); }} />
          <AdminInput label="Slug" value={draft.slug} onChange={(value) => set("slug", slugify(value))} />
          <AdminInput label="Excerpt" value={draft.excerpt} onChange={(value) => set("excerpt", value)} textarea />
          <div className="grid gap-4 md:grid-cols-2"><AdminInput label="Category" value={draft.category} onChange={(value) => set("category", value)} /><AdminInput label="Tags (comma separated)" value={draft.tags.join(", ")} onChange={(value) => set("tags", value.split(",").map((tag) => tag.trim()).filter(Boolean))} /><AdminInput label="Author" value={draft.author} onChange={(value) => set("author", value)} /><AdminInput label="Reading Time (minutes)" value={String(draft.readingTime)} onChange={(value) => set("readingTime", Math.max(1, Number(value) || 1))} /></div>
          <div className="flex flex-wrap gap-5"><p className="text-sm font-semibold text-[var(--color-text-secondary)]">Current status: <span className={draft.status === "published" ? "text-emerald-300" : "text-amber-200"}>{draft.status}</span></p><label className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)]"><input type="checkbox" checked={draft.featured} onChange={(event) => set("featured", event.target.checked)} /> Featured</label></div>
        </FormSection>

        <FormSection title="Cover Image">
          <AdminImageField label="Article Cover" value={draft.coverImage} folder={`articles/${draft.slug || draft.id}/cover`} hint="Use a clear landscape image. The original file remains available in Supabase Storage." aspect="aspect-[16/9]" onChange={(value) => set("coverImage", value)} />
          <AdminInput label="Image Alt Text" value={draft.coverAlt} onChange={(value) => set("coverAlt", value)} />
        </FormSection>

        <FormSection title="Article Content">
          <div className="space-y-4">
            {draft.blocks.map((block, index) => <BlockEditor key={block.id} block={block} index={index} total={draft.blocks.length} articleSlug={draft.slug || draft.id} onChange={(next) => updateBlock(index, next)} onRemove={() => removeBlock(index)} onMove={moveBlock} />)}
          </div>
          <div className="flex flex-wrap gap-2 border-t border-[var(--color-border)] pt-5"><AddBlockButton icon={Pilcrow} label="Paragraph" onClick={() => addBlock("paragraph")} /><AddBlockButton icon={Heading2} label="Heading" onClick={() => addBlock("heading")} /><AddBlockButton icon={ImagePlus} label="Image" onClick={() => addBlock("image")} /><AddBlockButton icon={Quote} label="Quote" onClick={() => addBlock("quote")} /><AddBlockButton icon={List} label="List" onClick={() => addBlock("list")} /></div>
        </FormSection>

        <FormSection title="Google Preview">
          <AdminInput label="SEO Title" value={draft.seoTitle} onChange={(value) => set("seoTitle", value)} />
          <AdminInput label="SEO Description" value={draft.seoDescription} onChange={(value) => set("seoDescription", value)} textarea />
          <div className="border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-4"><p className="text-xs text-emerald-400">{draft.slug ? `${location.origin}/blog/${draft.slug}` : "Article URL"}</p><p className="mt-2 text-lg text-sky-300">{draft.seoTitle || draft.title || "Article title"}</p><p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">{draft.seoDescription || draft.excerpt || "Article description"}</p></div>
        </FormSection>

        {error && <p className="border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-300" role="alert">{error}</p>}
        <div className="flex flex-wrap gap-3"><button type="button" onClick={() => void save("published")} disabled={saving} className="inline-flex items-center gap-2 bg-[var(--color-text-main)] px-5 py-3 text-sm font-bold text-[var(--color-bg-primary)] disabled:opacity-60"><CheckCircle2 size={17} /> {saving ? "Saving..." : draft.status === "published" ? "Update Published Article" : "Publish Article"}</button><button type="button" onClick={() => void save("draft")} disabled={saving} className="inline-flex items-center gap-2 border border-[var(--color-border)] px-5 py-3 text-sm font-bold text-[var(--color-text-secondary)] disabled:opacity-60"><Save size={17} /> Save Draft</button><button type="button" onClick={() => navigate("/admin/articles")} className="border border-[var(--color-border)] px-5 py-3 text-sm font-bold text-[var(--color-text-secondary)]">Cancel</button></div>
      </div>
    </div>
  );
}

function BlockEditor({ block, index, total, articleSlug, onChange, onRemove, onMove }: { block: ArticleBlock; index: number; total: number; articleSlug: string; onChange: (block: ArticleBlock) => void; onRemove: () => void; onMove: (index: number, direction: -1 | 1) => void }) {
  return <section className="border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-4"><div className="mb-4 flex items-center justify-between gap-3"><span className="font-mono text-[10px] font-bold uppercase tracking-[.16em] text-[var(--color-accent-main)]">{String(index + 1).padStart(2, "0")} / {block.type}</span><div className="flex gap-1"><button type="button" disabled={index === 0} onClick={() => onMove(index, -1)} title="Move up" className="p-2 disabled:opacity-30"><ArrowUp size={15} /></button><button type="button" disabled={index === total - 1} onClick={() => onMove(index, 1)} title="Move down" className="p-2 disabled:opacity-30"><ArrowDown size={15} /></button><button type="button" onClick={onRemove} title="Remove block" className="p-2 text-red-300"><Trash size={15} /></button></div></div>{block.type === "paragraph" && <textarea rows={6} value={block.text} onChange={(event) => onChange({ ...block, text: event.target.value })} className="w-full border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-3 text-sm leading-6 outline-none" />}{block.type === "heading" && <div className="grid gap-3 sm:grid-cols-[8rem_1fr]"><select value={block.level} onChange={(event) => onChange({ ...block, level: Number(event.target.value) as 2 | 3 })} className="border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-3 text-sm"><option value={2}>Heading 2</option><option value={3}>Heading 3</option></select><input value={block.text} onChange={(event) => onChange({ ...block, text: event.target.value })} className="border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-3 text-sm outline-none" /></div>}{block.type === "quote" && <div className="grid gap-3"><textarea rows={4} value={block.text} onChange={(event) => onChange({ ...block, text: event.target.value })} className="w-full border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-3 text-sm outline-none" /><input value={block.attribution} onChange={(event) => onChange({ ...block, attribution: event.target.value })} placeholder="Attribution" className="border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-3 text-sm outline-none" /></div>}{block.type === "list" && <div className="grid gap-3"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={block.ordered} onChange={(event) => onChange({ ...block, ordered: event.target.checked })} /> Numbered list</label><textarea rows={6} value={block.items.join("\n")} onChange={(event) => onChange({ ...block, items: event.target.value.split("\n") })} placeholder="One item per line" className="w-full border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-3 text-sm outline-none" /></div>}{block.type === "image" && <div className="grid gap-3"><AdminImageField label="Content Image" value={block.url} folder={`articles/${articleSlug}/content`} hint="Upload an image at its original ratio for this article block." cropMode="original" onChange={(value) => onChange({ ...block, url: value })} /><input value={block.alt} onChange={(event) => onChange({ ...block, alt: event.target.value })} placeholder="Alt text" className="border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-3 text-sm outline-none" /><input value={block.caption} onChange={(event) => onChange({ ...block, caption: event.target.value })} placeholder="Caption (optional)" className="border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-3 text-sm outline-none" /></div>}</section>;
}

function AddBlockButton({ icon: Icon, label, onClick }: { icon: typeof Plus; label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="inline-flex items-center gap-2 border border-[var(--color-border)] px-3 py-2 text-xs font-bold hover:border-[var(--color-accent-main)]"><Icon size={15} /> {label}</button>;
}
