import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { AdminImageField } from "../../components/admin/AdminImageFields";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import { AdminInput, FormSection } from "../../components/admin/FormSection";
import { LanguageEditorTabs } from "../../components/admin/LanguageEditorTabs";
import { usePortfolioData } from "../../hooks/usePortfolioData";
import {
  certificateTranslationIsPublishable,
  createAutomaticCertificateTranslations,
} from "../../lib/automaticTranslation";
import { emptyCertificateTranslation } from "../../lib/localizedContent";
import { formatAdminSaveError } from "../../lib/supabase/errorMessages";
import { portfolioRepository } from "../../repositories/portfolioRepository";
import type { Certificate, CertificateTranslation, ContentLanguage } from "../../types/portfolio";

function createDraft(): Certificate {
  return {
    id: crypto.randomUUID(),
    title: "",
    issuer: "",
    category: "",
    issueDate: "",
    credentialId: "",
    credentialUrl: "",
    image: "",
    featured: false,
    published: false,
    displayOrder: 0,
  };
}

export default function AdminCertificateFormPage() {
  const { id } = useParams();
  const { certificates } = usePortfolioData();
  const navigate = useNavigate();
  const source = id ? certificates.find((item) => item.id === id) : undefined;
  const formKey = id || "new";
  const [draft, setDraft] = useState<Certificate>(() => source || createDraft());
  const [loadedFormKey, setLoadedFormKey] = useState(formKey);
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [translationStatus, setTranslationStatus] = useState("");
  const [editingLanguage, setEditingLanguage] = useState<ContentLanguage>("en");

  useEffect(() => {
    if (loadedFormKey !== formKey) {
      setDraft(source || createDraft());
      setLoadedFormKey(formKey);
      setIsDirty(false);
      return;
    }

    if (isDirty) return;
    if (source) setDraft(source);
  }, [certificates, formKey, isDirty, loadedFormKey, source]);

  const set = <K extends keyof Certificate>(key: K, value: Certificate[K]) => {
    setError("");
    setIsDirty(true);
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const translation = { ...emptyCertificateTranslation(), ...(draft.translations?.[editingLanguage] ?? {}) };
  const setTranslation = <K extends keyof CertificateTranslation>(key: K, value: CertificateTranslation[K]) => {
    setIsDirty(true);
    setDraft((current) => ({
      ...current,
      translations: {
        ...current.translations,
        [editingLanguage]: { ...emptyCertificateTranslation(), ...current.translations?.[editingLanguage], [key]: value },
      },
    }));
  };

  const save = async () => {
    const sourceTranslations = {
      en: { ...emptyCertificateTranslation(), ...draft.translations?.en },
      id: { ...emptyCertificateTranslation(), ...draft.translations?.id },
    };
    
    if (!sourceTranslations.en.title.trim() && !sourceTranslations.id.title.trim()) {
      setError("Add a title in at least one language.");
      return;
    }

    setSaving(true);
    setError("");
    
    let finalTranslations = sourceTranslations;
    
    try {
      if (draft.published && (!certificateTranslationIsPublishable(sourceTranslations.en) || !certificateTranslationIsPublishable(sourceTranslations.id))) {
        setTranslationStatus("Generating missing translations...");
        finalTranslations = await createAutomaticCertificateTranslations(sourceTranslations, editingLanguage, setTranslationStatus);
        setTranslationStatus("Translation complete!");
        setTimeout(() => setTranslationStatus(""), 3000);
      }

      const primary = finalTranslations.en;
      const next: Certificate = {
        ...draft,
        ...primary,
        translations: finalTranslations,
      };

      portfolioRepository.updateCertificate(next);
      await portfolioRepository.flushPendingWrites();
      setIsDirty(false);
      navigate("/admin/certificates");
    } catch (saveError) {
      setError(formatAdminSaveError(saveError, "Certificate could not be saved. If translation failed, try saving unpublished first."));
      setTranslationStatus("");
    } finally {
      setSaving(false);
    }
  };

  const handleTranslate = async () => {
    const targetLang = editingLanguage === "en" ? "id" : "en";
    const sourceTranslations = {
      en: { ...emptyCertificateTranslation(), ...draft.translations?.en },
      id: { ...emptyCertificateTranslation(), ...draft.translations?.id },
    };
    setError("");
    setTranslationStatus(`Translating to ${targetLang === "en" ? "English" : "Indonesian"}...`);
    try {
      const translated = await createAutomaticCertificateTranslations(sourceTranslations, editingLanguage, setTranslationStatus);
      setDraft((current) => ({ ...current, translations: translated }));
      setIsDirty(true);
      setTranslationStatus("Translation complete!");
      setTimeout(() => setTranslationStatus(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Translation failed.");
      setTranslationStatus("");
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <AdminPageHeader title={id ? "Edit Certificate" : "New Certificate"} description="Manage certificate metadata, credential links, preview image, and publication state." />
      <div className="grid gap-6">
        <LanguageEditorTabs value={editingLanguage} onChange={setEditingLanguage} onTranslate={handleTranslate} isTranslating={!!translationStatus && translationStatus !== "Translation complete!"} />
        <FormSection title="Certificate Details">
          <div className="grid gap-4 md:grid-cols-2">
            <AdminInput label="Title" value={translation.title} onChange={(value) => { setError(""); setTranslation("title", value); }} />
            <AdminInput label="Issuer" value={translation.issuer} onChange={(value) => setTranslation("issuer", value)} />
            <AdminInput label="Category" value={draft.category} onChange={(value) => set("category", value)} />
            <AdminInput label="Issue Date" value={draft.issueDate} onChange={(value) => set("issueDate", value)} />
            <AdminInput label="Credential ID" value={draft.credentialId} onChange={(value) => set("credentialId", value)} />
            <AdminInput label="Display Order" value={draft.displayOrder ? String(draft.displayOrder) : ""} onChange={(value) => set("displayOrder", Number(value) || 0)} />
          </div>
          <AdminInput label="Credential URL" value={draft.credentialUrl} onChange={(value) => set("credentialUrl", value)} />
          <div className="flex flex-wrap gap-5">
            <label className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)]"><input type="checkbox" checked={draft.published} onChange={(event) => set("published", event.target.checked)} /> Published</label>
            <label className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)]"><input type="checkbox" checked={draft.featured} onChange={(event) => set("featured", event.target.checked)} /> Featured</label>
          </div>
        </FormSection>
        <FormSection title="Certificate Image">
          <AdminImageField label="Certificate Preview Image" value={draft.image} folder={`certificates/${translation.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || draft.id}`} hint="Upload the certificate at its original size. The website keeps the real image ratio so certificate text remains readable." cropMode="original" onChange={(value) => set("image", value)} />
        </FormSection>
        {translationStatus && <p className="border border-[var(--color-accent-main)]/30 bg-[var(--color-accent-main)]/5 p-3 text-sm text-[var(--color-accent-main)]" role="status">{translationStatus}</p>}
        {error && <p className="border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-300" role="alert">{error}</p>}
        <div className="flex flex-wrap gap-3">
          <button onClick={() => void save()} disabled={saving} className="bg-[var(--color-text-main)] px-5 py-3 text-sm font-bold text-[var(--color-bg-primary)] disabled:opacity-60">{saving ? "Saving..." : "Save Certificate"}</button>
          <button onClick={() => navigate("/admin/certificates")} className="border border-[var(--color-border)] px-5 py-3 text-sm font-bold text-[var(--color-text-secondary)]">Cancel</button>
        </div>
      </div>
    </div>
  );
}
