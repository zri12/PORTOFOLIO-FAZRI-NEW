import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { AdminImageField } from "../../components/admin/AdminImageFields";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import { AdminInput, FormSection } from "../../components/admin/FormSection";
import { usePortfolioData } from "../../hooks/usePortfolioData";
import { formatAdminSaveError } from "../../lib/supabase/errorMessages";
import { portfolioRepository } from "../../repositories/portfolioRepository";
import type { Certificate } from "../../types/portfolio";

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
  const save = async () => {
    setSaving(true);
    setError("");
    try {
      portfolioRepository.updateCertificate(draft);
      await portfolioRepository.flushPendingWrites();
      setIsDirty(false);
      navigate("/admin/certificates");
    } catch (saveError) {
      setError(formatAdminSaveError(saveError, "Certificate could not be saved to Supabase."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <AdminPageHeader title={id ? "Edit Certificate" : "New Certificate"} description="Manage certificate metadata, credential links, preview image, and publication state." />
      <div className="grid gap-6">
        <FormSection title="Certificate Details">
          <div className="grid gap-4 md:grid-cols-2">
            <AdminInput label="Title" value={draft.title} onChange={(value) => set("title", value)} />
            <AdminInput label="Issuer" value={draft.issuer} onChange={(value) => set("issuer", value)} />
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
          <AdminImageField label="Certificate Preview Image" value={draft.image} folder={`certificates/${draft.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || draft.id}`} hint="Upload the certificate at its original size. The website keeps the real image ratio so certificate text remains readable." cropMode="original" onChange={(value) => set("image", value)} />
        </FormSection>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => void save()} disabled={saving} className="bg-[var(--color-text-main)] px-5 py-3 text-sm font-bold text-[var(--color-bg-primary)] disabled:opacity-60">{saving ? "Saving..." : "Save Certificate"}</button>
          <button onClick={() => navigate("/admin/certificates")} className="border border-[var(--color-border)] px-5 py-3 text-sm font-bold text-[var(--color-text-secondary)]">Cancel</button>
          {error && <span className="self-center text-sm text-red-300">{error}</span>}
        </div>
      </div>
    </div>
  );
}
