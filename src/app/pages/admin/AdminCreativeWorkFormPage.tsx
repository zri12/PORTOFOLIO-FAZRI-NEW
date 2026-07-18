import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { AdminGalleryField, AdminImageField } from "../../components/admin/AdminImageFields";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import { AdminInput, FormSection } from "../../components/admin/FormSection";
import { portfolioSeed } from "../../data/seed/portfolioSeed";
import { usePortfolioData } from "../../hooks/usePortfolioData";
import { slugify } from "../../lib/storage";
import { portfolioRepository } from "../../repositories/portfolioRepository";
import type { CreativeWork } from "../../types/portfolio";

const categories: CreativeWork["category"][] = ["UI/UX Design", "Graphic Design", "Photography", "Videography", "Photo Editing", "Video Editing"];

function createDraft(items: CreativeWork[]): CreativeWork {
  return {
    ...(items[0] || portfolioSeed.creativeWorks[0]),
    id: crypto.randomUUID(),
    slug: "new-creative-work",
    title: "New Creative Work",
    cover: "",
    gallery: [],
    beforeImage: "",
    afterImage: "",
    featured: false,
    status: "draft",
    displayOrder: items.length + 1,
  };
}

export default function AdminCreativeWorkFormPage() {
  const { id } = useParams();
  const { creativeWorks } = usePortfolioData();
  const navigate = useNavigate();
  const source = id ? creativeWorks.find((item) => item.id === id) : undefined;
  const [draft, setDraft] = useState<CreativeWork>(() => source || createDraft(creativeWorks));

  useEffect(() => {
    if (source) setDraft(source);
    else if (!id) setDraft(createDraft(creativeWorks));
  }, [creativeWorks, id, source]);

  const set = <K extends keyof CreativeWork>(key: K, value: CreativeWork[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const save = (status: CreativeWork["status"]) => {
    portfolioRepository.updateCreativeWork({ ...draft, status, slug: draft.slug || slugify(draft.title) });
    navigate("/admin/creative-works");
  };

  return (
    <div className="mx-auto max-w-5xl">
      <AdminPageHeader title={id ? "Edit Creative Work" : "New Creative Work"} description="Manage creative work metadata, cover image, comparison images, gallery images, video URL, and publication state." />
      <div className="grid gap-6">
        <FormSection title="Work Details">
          <div className="grid gap-4 md:grid-cols-2">
            <AdminInput label="Title" value={draft.title} onChange={(value) => setDraft({ ...draft, title: value, slug: slugify(value) })} />
            <AdminInput label="Slug" value={draft.slug} onChange={(value) => set("slug", slugify(value))} />
            <label>
              <span className="mb-2 block text-sm font-semibold text-[var(--color-text-secondary)]">Category</span>
              <select value={draft.category} onChange={(event) => set("category", event.target.value as CreativeWork["category"])} className="w-full border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-3 text-sm outline-none">
                {categories.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <AdminInput label="Role" value={draft.role} onChange={(value) => set("role", value)} />
            <AdminInput label="Year" value={draft.year} onChange={(value) => set("year", value)} />
            <AdminInput label="Display Order" value={String(draft.displayOrder)} onChange={(value) => set("displayOrder", Number(value) || 0)} />
            <AdminInput label="Tools (comma separated)" value={draft.tools.join(", ")} onChange={(value) => set("tools", value.split(",").map((item) => item.trim()).filter(Boolean))} />
            <AdminInput label="Duration" value={draft.duration || ""} onChange={(value) => set("duration", value || undefined)} />
          </div>
          <AdminInput label="Description" value={draft.description} onChange={(value) => set("description", value)} textarea />
          <AdminInput label="Brief" value={draft.brief} onChange={(value) => set("brief", value)} textarea />
          <AdminInput label="Video URL" value={draft.videoUrl || ""} onChange={(value) => set("videoUrl", value || undefined)} />
          <div className="flex flex-wrap gap-5">
            <label className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)]"><input type="checkbox" checked={draft.featured} onChange={(event) => set("featured", event.target.checked)} /> Featured</label>
          </div>
        </FormSection>
        <FormSection title="Images">
          <div className="grid gap-4 md:grid-cols-3">
            <AdminImageField label="Cover Image" value={draft.cover} folder={`creative-works/${draft.slug || draft.id}/cover`} hint="Recommended 1600x1000px or 16:10. This is used on creative work cards and detail hero." onChange={(value) => set("cover", value)} />
            <AdminImageField label="Before Image" value={draft.beforeImage || ""} folder={`creative-works/${draft.slug || draft.id}/before`} hint="Optional. Recommended 1600x1000px, same ratio as After Image for clean comparison." onChange={(value) => set("beforeImage", value || undefined)} />
            <AdminImageField label="After Image" value={draft.afterImage || ""} folder={`creative-works/${draft.slug || draft.id}/after`} hint="Optional. Recommended 1600x1000px, matching Before Image dimensions." onChange={(value) => set("afterImage", value || undefined)} />
          </div>
          <AdminGalleryField label="Creative Gallery" values={draft.gallery} folder={`creative-works/${draft.slug || draft.id}/gallery`} hint="Recommended 1600x1000px or consistent 16:10 images. Use 3-8 images for a clean detail page." onChange={(values) => set("gallery", values)} />
        </FormSection>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => save("published")} className="bg-[var(--color-text-main)] px-5 py-3 text-sm font-bold text-[var(--color-bg-primary)]">Publish</button>
          <button onClick={() => save("draft")} className="border border-[var(--color-border)] px-5 py-3 text-sm font-bold">Save Draft</button>
          <button onClick={() => navigate("/admin/creative-works")} className="border border-[var(--color-border)] px-5 py-3 text-sm font-bold text-[var(--color-text-secondary)]">Cancel</button>
        </div>
      </div>
    </div>
  );
}
