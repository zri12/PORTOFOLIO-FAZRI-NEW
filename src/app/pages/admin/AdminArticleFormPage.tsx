import { useEffect, useState } from "react";
import { CheckCircle2, Code2, ImagePlus, Save, Trash } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { AdminImageField } from "../../components/admin/AdminImageFields";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import { AdminInput, FormSection } from "../../components/admin/FormSection";
import { usePortfolioData } from "../../hooks/usePortfolioData";
import { normalizeArticleEditorBlocks } from "../../lib/articleMarkdown";
import { formatAdminSaveError } from "../../lib/supabase/errorMessages";
import { slugify } from "../../lib/storage";
import { portfolioRepository } from "../../repositories/portfolioRepository";
import type { Article, ArticleBlock } from "../../types/portfolio";

const blockId = () => crypto.randomUUID();

function newDraft(): Article {
  return { id: crypto.randomUUID(), slug: "", title: "", excerpt: "", category: "", tags: [], coverImage: "", coverAlt: "", author: "", status: "draft", featured: false, publishedAt: "", updatedAt: "", readingTime: 0, seoTitle: "", seoDescription: "", blocks: [{ id: blockId(), type: "markdown", source: "" }], displayOrder: 0 };
}

const prepareArticleForEditor = (article: Article): Article => ({
  ...article,
  blocks: normalizeArticleEditorBlocks(article.blocks),
});

export default function AdminArticleFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { articles } = usePortfolioData();
  const source = id ? articles.find((item) => item.id === id) : undefined;
  const formKey = id || "new";
  const [draft, setDraft] = useState<Article>(() => source ? prepareArticleForEditor(source) : newDraft());
  const [loadedFormKey, setLoadedFormKey] = useState(formKey);
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (loadedFormKey !== formKey) {
      setDraft(source ? prepareArticleForEditor(source) : newDraft());
      setLoadedFormKey(formKey);
      setIsDirty(false);
      return;
    }

    if (isDirty) return;
    if (source) setDraft(prepareArticleForEditor(source));
  }, [formKey, isDirty, loadedFormKey, source]);

  const set = <K extends keyof Article>(key: K, value: Article[K]) => {
    setError("");
    setIsDirty(true);
    setDraft((current) => ({ ...current, [key]: value }));
  };
  const updateBlock = (index: number, block: ArticleBlock) => set("blocks", draft.blocks.map((item, itemIndex) => itemIndex === index ? block : item));
  const addImageAfter = (index: number) => {
    const next = [...draft.blocks];
    next.splice(
      index + 1,
      0,
      { id: blockId(), type: "image", url: "", alt: "", caption: "" },
      { id: blockId(), type: "markdown", source: "" },
    );
    set("blocks", next);
  };
  const removeImage = (index: number) => set("blocks", normalizeArticleEditorBlocks(draft.blocks.filter((_, itemIndex) => itemIndex !== index)));

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
    const editorBlocks = normalizeArticleEditorBlocks(draft.blocks);
    if (!editorBlocks.some((block) => block.type === "markdown" && block.source.trim())) {
      setError("Write article content before saving.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      portfolioRepository.updateArticle({ ...draft, blocks: editorBlocks, status, title, slug, seoTitle: draft.seoTitle.trim() || title, seoDescription: draft.seoDescription.trim() || draft.excerpt.trim(), coverAlt: draft.coverAlt.trim() || title, readingTime: Math.max(1, draft.readingTime), publishedAt: draft.publishedAt || new Date().toISOString() });
      await portfolioRepository.flushPendingWrites();
      setIsDirty(false);
      navigate("/admin/articles");
    } catch (saveError) {
      setError(formatAdminSaveError(saveError, "Article could not be saved to Supabase."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <AdminPageHeader title={id ? "Edit Article" : "New Article"} description="Write continuous Markdown-style content, insert images between text sections, and manage publication metadata." />
      <div className="grid gap-6">
        <FormSection title="Article Details">
          <AdminInput label="Title" value={draft.title} onChange={(value) => { set("title", value); if (!id && !draft.slug) set("slug", slugify(value)); }} />
          <AdminInput label="Slug" value={draft.slug} onChange={(value) => set("slug", slugify(value))} />
          <AdminInput label="Excerpt" value={draft.excerpt} onChange={(value) => set("excerpt", value)} textarea />
          <div className="grid gap-4 md:grid-cols-2"><AdminInput label="Category" value={draft.category} onChange={(value) => set("category", value)} /><AdminInput label="Tags (comma separated)" value={draft.tags.join(", ")} onChange={(value) => set("tags", value.split(",").map((tag) => tag.trim()).filter(Boolean))} /><AdminInput label="Author" value={draft.author} onChange={(value) => set("author", value)} /><AdminInput label="Reading Time (minutes)" value={draft.readingTime ? String(draft.readingTime) : ""} onChange={(value) => set("readingTime", Number(value) || 0)} /></div>
          <div className="flex flex-wrap gap-5"><p className="text-sm font-semibold text-[var(--color-text-secondary)]">Current status: <span className={draft.status === "published" ? "text-emerald-300" : "text-amber-200"}>{draft.status}</span></p><label className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)]"><input type="checkbox" checked={draft.featured} onChange={(event) => set("featured", event.target.checked)} /> Featured</label></div>
        </FormSection>

        <FormSection title="Cover Image">
          <AdminImageField label="Article Cover" value={draft.coverImage} folder={`articles/${draft.slug || draft.id}/cover`} hint="Use a clear landscape image. The original file remains available in Supabase Storage." aspect="aspect-[16/9]" onChange={(value) => set("coverImage", value)} />
          <AdminInput label="Image Alt Text" value={draft.coverAlt} onChange={(value) => set("coverAlt", value)} />
        </FormSection>

        <FormSection title="Article Content">
          <div className="space-y-4">
            {draft.blocks.map((block, index) => {
              if (block.type === "markdown") {
                return <MarkdownBlockEditor key={block.id} block={block} sectionNumber={draft.blocks.slice(0, index + 1).filter((item) => item.type === "markdown").length} onChange={(next) => updateBlock(index, next)} onAddImage={() => addImageAfter(index)} />;
              }
              if (block.type === "image") {
                return <ImageBlockEditor key={block.id} block={block} imageNumber={draft.blocks.slice(0, index + 1).filter((item) => item.type === "image").length} articleSlug={draft.slug || draft.id} onChange={(next) => updateBlock(index, next)} onRemove={() => removeImage(index)} />;
              }
              return null;
            })}
          </div>
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

type MarkdownBlock = Extract<ArticleBlock, { type: "markdown" }>;
type ImageBlock = Extract<ArticleBlock, { type: "image" }>;

function MarkdownBlockEditor({ block, sectionNumber, onChange, onAddImage }: { block: MarkdownBlock; sectionNumber: number; onChange: (block: MarkdownBlock) => void; onAddImage: () => void }) {
  return (
    <section className="overflow-hidden border border-[var(--color-border)] bg-[#080d13]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-3">
        <div className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[.14em] text-[var(--color-accent-main)]">
          <Code2 size={15} /> Content {String(sectionNumber).padStart(2, "0")}.md
        </div>
        <button type="button" onClick={onAddImage} className="inline-flex items-center gap-2 border border-[var(--color-border)] px-3 py-2 text-xs font-bold hover:border-[var(--color-accent-main)]">
          <ImagePlus size={15} /> Add image after this text
        </button>
      </div>
      <div className="grid gap-2 border-b border-[var(--color-border)] px-4 py-3 font-mono text-[11px] leading-5 text-[var(--color-text-muted)] sm:grid-cols-2 lg:grid-cols-5">
        <span><b className="text-[var(--color-text-secondary)]">##</b> Heading</span>
        <span><b className="text-[var(--color-text-secondary)]">###</b> Subheading</span>
        <span><b className="text-[var(--color-text-secondary)]">&gt;</b> Quote</span>
        <span><b className="text-[var(--color-text-secondary)]">-</b> Bullet list</span>
        <span><b className="text-[var(--color-text-secondary)]">1.</b> Numbered list</span>
      </div>
      <textarea
        rows={18}
        value={block.source}
        onChange={(event) => onChange({ ...block, source: event.target.value })}
        placeholder={"Paste or write the article here...\n\n## Section heading\n\nNormal paragraph text.\n\n> A meaningful quote\n> -- Attribution\n\n- First point\n- Second point"}
        className="min-h-[360px] w-full resize-y bg-transparent p-5 font-mono text-sm leading-7 text-[var(--color-text-main)] outline-none placeholder:text-[var(--color-text-muted)] focus:bg-white/[.015]"
      />
    </section>
  );
}

function ImageBlockEditor({ block, imageNumber, articleSlug, onChange, onRemove }: { block: ImageBlock; imageNumber: number; articleSlug: string; onChange: (block: ImageBlock) => void; onRemove: () => void }) {
  return (
    <section className="border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[.14em] text-[var(--color-accent-main)]"><ImagePlus size={15} /> Image {String(imageNumber).padStart(2, "0")}</span>
        <button type="button" onClick={onRemove} className="inline-flex items-center gap-2 px-2 py-1 text-xs font-bold text-red-300"><Trash size={14} /> Remove image</button>
      </div>
      <div className="grid gap-3">
        <AdminImageField label="Content Image" value={block.url} folder={`articles/${articleSlug}/content`} hint="Upload the image at its original ratio. A new text editor is automatically available below this image." cropMode="original" onChange={(value) => onChange({ ...block, url: value })} />
        <input value={block.alt} onChange={(event) => onChange({ ...block, alt: event.target.value })} placeholder="Alt text" className="border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-3 text-sm outline-none" />
        <input value={block.caption} onChange={(event) => onChange({ ...block, caption: event.target.value })} placeholder="Caption (optional)" className="border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-3 text-sm outline-none" />
      </div>
    </section>
  );
}
