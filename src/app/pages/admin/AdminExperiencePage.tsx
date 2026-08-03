import { useState } from "react";
import { Plus, Trash } from "lucide-react";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import { LanguageEditorTabs } from "../../components/admin/LanguageEditorTabs";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { StatusBadge } from "../../components/admin/StatusBadge";
import { usePortfolioData } from "../../hooks/usePortfolioData";
import { portfolioRepository } from "../../repositories/portfolioRepository";
import {
  createAutomaticExperienceTranslations,
} from "../../lib/automaticTranslation";
import { emptyExperienceTranslation } from "../../lib/localizedContent";
import type { ContentLanguage, Experience, ExperienceTranslation } from "../../types/portfolio";

export default function AdminExperiencePage() {
  const { experiences } = usePortfolioData();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingLanguage, setEditingLanguage] = useState<ContentLanguage>("en");
  const target = experiences.find((item) => item.id === deleteId);

  return (
    <div className="mx-auto max-w-5xl">
      <AdminPageHeader title="Experience" description="Manage timeline entries, responsibilities, publication state, and related project references." action={<button onClick={() => portfolioRepository.createExperience({ role: "", organization: "", type: "", period: "", location: "", description: "", responsibilities: [], technologies: [], published: false, displayOrder: experiences.length + 1 })} className="inline-flex items-center gap-2 bg-[var(--color-text-main)] px-4 py-2.5 text-sm font-bold text-[var(--color-bg-primary)]"><Plus size={16} /> Add Experience</button>} />
      <div className="mb-6">
        <LanguageEditorTabs value={editingLanguage} onChange={setEditingLanguage} hideTranslateButton />
      </div>
      <div className="space-y-4">
        {experiences.map((item) => (
          <ExperienceCard key={item.id} item={item} editingLanguage={editingLanguage} onDelete={() => setDeleteId(item.id)} />
        ))}
      </div>
      <ConfirmDialog open={Boolean(deleteId)} title="Delete experience?" description={`"${target?.role || "This experience"}" will be removed permanently. This action cannot be undone.`} confirmLabel="Delete experience" onCancel={() => setDeleteId(null)} onConfirm={() => { if (deleteId) portfolioRepository.deleteExperience(deleteId); setDeleteId(null); }} />
    </div>
  );
}

function ExperienceCard({ item, editingLanguage, onDelete }: { item: Experience; editingLanguage: ContentLanguage; onDelete: () => void }) {
  const [translationStatus, setTranslationStatus] = useState("");
  const translation = { ...emptyExperienceTranslation(), ...(item.translations?.[editingLanguage] ?? {}) };

  const setTranslation = (key: keyof ExperienceTranslation, value: string) => {
    portfolioRepository.updateExperience({
      ...item,
      translations: {
        ...item.translations,
        [editingLanguage]: { ...translation, [key]: value },
      },
    });
  };

  const handleTranslate = async () => {
    const targetLang = editingLanguage === "en" ? "id" : "en";
    const sourceTranslations = {
      en: { ...emptyExperienceTranslation(), ...item.translations?.en },
      id: { ...emptyExperienceTranslation(), ...item.translations?.id },
    };
    setTranslationStatus(`Translating to ${targetLang === "en" ? "English" : "Indonesian"}...`);
    try {
      const translated = await createAutomaticExperienceTranslations(sourceTranslations, editingLanguage, setTranslationStatus);
      portfolioRepository.updateExperience({ ...item, translations: translated });
      setTranslationStatus("Translation complete!");
      setTimeout(() => setTranslationStatus(""), 3000);
    } catch (err) {
      setTranslationStatus("Translation failed.");
      setTimeout(() => setTranslationStatus(""), 3000);
    }
  };

  return (
    <article className="border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="w-full">
          <div className="flex gap-2"><StatusBadge status={item.type} />{item.published ? <StatusBadge status="published" /> : <StatusBadge status="draft" />}</div>
          <input value={translation.role} onChange={(event) => setTranslation("role", event.target.value)} placeholder="Role..." className="mt-4 w-full bg-transparent font-manrope text-xl font-bold outline-none" />
          <div className="mt-2 grid gap-2 md:grid-cols-3">
            <input value={translation.organization} onChange={(event) => setTranslation("organization", event.target.value)} placeholder="Organization..." className="border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-2 text-sm outline-none" />
            <input value={item.period} onChange={(event) => portfolioRepository.updateExperience({ ...item, period: event.target.value })} placeholder="Period (e.g. 2022 - Present)..." className="border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-2 text-sm outline-none" />
            <input value={translation.location} onChange={(event) => setTranslation("location", event.target.value)} placeholder="Location..." className="border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-2 text-sm outline-none" />
          </div>
        </div>
        <button onClick={onDelete} className="text-red-300" title="Delete"><Trash size={16} /></button>
      </div>
      <textarea value={translation.description} onChange={(event) => setTranslation("description", event.target.value)} placeholder="Description..." rows={3} className="mt-4 w-full border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-3 text-sm outline-none" />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button onClick={() => portfolioRepository.updateExperience({ ...item, published: !item.published })} className="border border-[var(--color-border)] px-3 py-2 text-xs font-bold">{item.published ? "Unpublish" : "Publish"}</button>
        <button onClick={() => void handleTranslate()} disabled={!!translationStatus && translationStatus !== "Translation complete!"} className="border border-[var(--color-border)] px-3 py-2 text-xs font-bold text-[var(--color-accent-main)] disabled:opacity-50">Translate to {editingLanguage === "en" ? "Indonesian" : "English"}</button>
        {translationStatus && <span className="text-xs text-[var(--color-accent-main)]">{translationStatus}</span>}
      </div>
    </article>
  );
}
