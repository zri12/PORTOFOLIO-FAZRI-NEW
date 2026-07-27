import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { AdminGalleryField, AdminImageField } from "../../components/admin/AdminImageFields";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import { AdminInput, FormSection } from "../../components/admin/FormSection";
import { usePortfolioData } from "../../hooks/usePortfolioData";
import { slugify } from "../../lib/storage";
import { formatAdminSaveError } from "../../lib/supabase/errorMessages";
import { portfolioRepository } from "../../repositories/portfolioRepository";
import type { CreativeWork } from "../../types/portfolio";

const categories: CreativeWork["category"][] = ["UI/UX Design", "Graphic Design", "Photography", "Videography", "Photo Editing", "Video Editing"];

type CreativeWorkDraft = Omit<CreativeWork, "category"> & {
  category: CreativeWork["category"] | "";
};

function createDraft(): CreativeWorkDraft {
  return {
    id: crypto.randomUUID(),
    slug: "",
    title: "",
    category: "",
    role: "",
    year: "",
    tools: [],
    description: "",
    brief: "",
    cover: "",
    gallery: [],
    beforeImage: "",
    afterImage: "",
    videoUrl: "",
    duration: "",
    featured: false,
    status: "draft",
    displayOrder: 0,
  };
}

export default function AdminCreativeWorkFormPage() {
  const { id } = useParams();
  const { creativeWorks } = usePortfolioData();
  const navigate = useNavigate();
  const source = id ? creativeWorks.find((item) => item.id === id) : undefined;
  const formKey = id || "new";
  const [draft, setDraft] = useState<CreativeWorkDraft>(() => source || createDraft());
  const [loadedFormKey, setLoadedFormKey] = useState(formKey);
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (loadedFormKey !== formKey) {
      setDraft(source || createDraft());
      setLoadedFormKey(formKey);
      setIsDirty(false);
      return;
    }

    if (isDirty) return;
    if (source) setDraft(source);
  }, [creativeWorks, formKey, isDirty, loadedFormKey, source]);

  const set = <K extends keyof CreativeWorkDraft>(key: K, value: CreativeWorkDraft[K]) => {
    setError("");
    setIsDirty(true);
    setDraft((current) => ({ ...current, [key]: value }));
  };
  const save = async (status: CreativeWork["status"]) => {
    if (!draft.category) {
      setError("Select a category before saving.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const next: CreativeWork = { ...draft, category: draft.category, status, slug: draft.slug || slugify(draft.title) };
      portfolioRepository.updateCreativeWork(next);
      await portfolioRepository.flushPendingWrites();
      setIsDirty(false);
      navigate("/admin/creative-works");
    } catch (saveError) {
      setError(formatAdminSaveError(saveError, "Creative work could not be saved to Supabase."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <AdminPageHeader title={id ? "Edit Creative Work" : "New Creative Work"} description="Manage creative work metadata, cover image, comparison images, gallery images, video URL, and publication state." />
      <div className="grid gap-6">
        <FormSection title="Work Details">
          <div className="grid gap-4 md:grid-cols-2">
            <AdminInput label="Title" value={draft.title} onChange={(value) => {
              setError("");
              setIsDirty(true);
              setDraft((current) => ({ ...current, title: value, slug: slugify(value) }));
            }} />
            <AdminInput label="Slug" value={draft.slug} onChange={(value) => set("slug", slugify(value))} />
            <label>
              <span className="mb-2 block text-sm font-semibold text-[var(--color-text-secondary)]">Category</span>
              <select value={draft.category} onChange={(event) => set("category", event.target.value as CreativeWorkDraft["category"])} className="w-full border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-3 text-sm outline-none">
                <option value="">Select category</option>
                {categories.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <AdminInput label="Role" value={draft.role} onChange={(value) => set("role", value)} />
            <AdminInput label="Year" value={draft.year} onChange={(value) => set("year", value)} />
            <AdminInput label="Display Order" value={draft.displayOrder ? String(draft.displayOrder) : ""} onChange={(value) => set("displayOrder", Number(value) || 0)} />
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
            <AdminImageField label="Cover Image" value={draft.cover} folder={`creative-works/${draft.slug || draft.id}/cover`} hint="The original image ratio and full frame are preserved." cropMode="original" onChange={(value) => set("cover", value)} />
            <AdminImageField label="Before Image" value={draft.beforeImage || ""} folder={`creative-works/${draft.slug || draft.id}/before`} hint="Optional. The original image ratio and full frame are preserved." cropMode="original" onChange={(value) => set("beforeImage", value || undefined)} />
            <AdminImageField label="After Image" value={draft.afterImage || ""} folder={`creative-works/${draft.slug || draft.id}/after`} hint="Optional. The original image ratio and full frame are preserved." cropMode="original" onChange={(value) => set("afterImage", value || undefined)} />
          </div>
          <AdminGalleryField label="Creative Gallery" values={draft.gallery} folder={`creative-works/${draft.slug || draft.id}/gallery`} hint="Recommended 1600x1000px or consistent 16:10 images. Use 3-8 images for a clean detail page." onChange={(values) => set("gallery", values)} />
        </FormSection>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => void save("published")} disabled={saving} className="bg-[var(--color-text-main)] px-5 py-3 text-sm font-bold text-[var(--color-bg-primary)] disabled:opacity-60">{saving ? "Saving..." : "Publish"}</button>
          <button onClick={() => void save("draft")} disabled={saving} className="border border-[var(--color-border)] px-5 py-3 text-sm font-bold disabled:opacity-60">Save Draft</button>
          <button onClick={() => navigate("/admin/creative-works")} className="border border-[var(--color-border)] px-5 py-3 text-sm font-bold text-[var(--color-text-secondary)]">Cancel</button>
          {error && <span className="self-center text-sm text-red-300">{error}</span>}
        </div>
      </div>
    </div>
  );
}
