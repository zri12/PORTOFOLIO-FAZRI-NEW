import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { AdminImageField } from "../../components/admin/AdminImageFields";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import { AdminInput, FormSection } from "../../components/admin/FormSection";
import { usePortfolioData } from "../../hooks/usePortfolioData";
import { formatAdminSaveError } from "../../lib/supabase/errorMessages";
import { portfolioRepository } from "../../repositories/portfolioRepository";
import type { Technology } from "../../types/portfolio";

const categories: Technology["category"][] = ["Frontend", "Backend", "Database", "Deployment", "Creative"];
const levels: Technology["level"][] = ["Main Stack", "Frequently Used", "Familiar", "Currently Learning"];

type TechnologyDraft = Omit<Technology, "category" | "level"> & {
  category: Technology["category"] | "";
  level: Technology["level"] | "";
};

function createDraft(): TechnologyDraft {
  return {
    id: crypto.randomUUID(),
    name: "",
    iconKey: "",
    logoUrl: "",
    category: "",
    level: "",
    description: "",
    featured: false,
    active: false,
    displayOrder: 0,
  };
}

export default function AdminTechnologyFormPage() {
  const { id } = useParams();
  const { techStack } = usePortfolioData();
  const navigate = useNavigate();
  const source = id ? techStack.find((item) => item.id === id) : undefined;
  const formKey = id || "new";
  const [draft, setDraft] = useState<TechnologyDraft>(() => source || createDraft());
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
  }, [formKey, isDirty, loadedFormKey, source, techStack]);

  const set = <K extends keyof TechnologyDraft>(key: K, value: TechnologyDraft[K]) => {
    setError("");
    setIsDirty(true);
    setDraft((current) => ({ ...current, [key]: value }));
  };
  const save = async () => {
    if (!draft.category || !draft.level) {
      setError("Select a category and level before saving.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const next: Technology = { ...draft, category: draft.category, level: draft.level };
      portfolioRepository.updateTechnology(next);
      await portfolioRepository.flushPendingWrites();
      setIsDirty(false);
      navigate("/admin/tech-stack");
    } catch (saveError) {
      setError(formatAdminSaveError(saveError, "Technology could not be saved to Supabase."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <AdminPageHeader title={id ? "Edit Technology" : "New Technology"} description="Manage technology name, category, level, logo asset, and visibility state." />
      <div className="grid gap-6">
        <FormSection title="Technology Details">
          <div className="grid gap-4 md:grid-cols-2">
            <AdminInput label="Name" value={draft.name} onChange={(value) => set("name", value)} />
            <AdminInput label="Icon Key / Fallback Text" value={draft.iconKey} onChange={(value) => set("iconKey", value)} />
            <label>
              <span className="mb-2 block text-sm font-semibold text-[var(--color-text-secondary)]">Category</span>
              <select value={draft.category} onChange={(event) => set("category", event.target.value as TechnologyDraft["category"])} className="w-full border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-3 text-sm outline-none">
                <option value="">Select category</option>
                {categories.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-[var(--color-text-secondary)]">Level</span>
              <select value={draft.level} onChange={(event) => set("level", event.target.value as TechnologyDraft["level"])} className="w-full border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-3 text-sm outline-none">
                <option value="">Select level</option>
                {levels.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <AdminInput label="Display Order" value={draft.displayOrder ? String(draft.displayOrder) : ""} onChange={(value) => set("displayOrder", Number(value) || 0)} />
          </div>
          <AdminInput label="Description" value={draft.description} onChange={(value) => set("description", value)} textarea />
          <div className="flex flex-wrap gap-5">
            <label className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)]"><input type="checkbox" checked={draft.active} onChange={(event) => set("active", event.target.checked)} /> Active</label>
            <label className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)]"><input type="checkbox" checked={draft.featured} onChange={(event) => set("featured", event.target.checked)} /> Featured</label>
          </div>
        </FormSection>
        <FormSection title="Logo">
          <AdminImageField label="Technology Logo" value={draft.logoUrl} folder={`technologies/${draft.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") || draft.id}`} hint="Recommended transparent PNG/SVG/WebP, square 512x512px. This appears in admin cards and technology sections." aspect="aspect-square" onChange={(value) => set("logoUrl", value)} />
        </FormSection>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => void save()} disabled={saving} className="bg-[var(--color-text-main)] px-5 py-3 text-sm font-bold text-[var(--color-bg-primary)] disabled:opacity-60">{saving ? "Saving..." : "Save Technology"}</button>
          <button onClick={() => navigate("/admin/tech-stack")} className="border border-[var(--color-border)] px-5 py-3 text-sm font-bold text-[var(--color-text-secondary)]">Cancel</button>
          {error && <span className="self-center text-sm text-red-300">{error}</span>}
        </div>
      </div>
    </div>
  );
}
