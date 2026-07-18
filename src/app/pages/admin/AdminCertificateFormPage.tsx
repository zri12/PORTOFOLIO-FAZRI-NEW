import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { AdminImageField } from "../../components/admin/AdminImageFields";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import { AdminInput, FormSection } from "../../components/admin/FormSection";
import { portfolioSeed } from "../../data/seed/portfolioSeed";
import { usePortfolioData } from "../../hooks/usePortfolioData";
import { portfolioRepository } from "../../repositories/portfolioRepository";
import type { Certificate } from "../../types/portfolio";

function createDraft(items: Certificate[]): Certificate {
  return {
    ...(items[0] || portfolioSeed.certificates[0]),
    id: crypto.randomUUID(),
    title: "New Certificate",
    issuer: "",
    category: "Development",
    issueDate: new Date().toISOString().slice(0, 10),
    credentialId: "",
    credentialUrl: "",
    image: "",
    featured: false,
    published: true,
    displayOrder: items.length + 1,
  };
}

export default function AdminCertificateFormPage() {
  const { id } = useParams();
  const { certificates } = usePortfolioData();
  const navigate = useNavigate();
  const source = id ? certificates.find((item) => item.id === id) : undefined;
  const [draft, setDraft] = useState<Certificate>(() => source || createDraft(certificates));

  useEffect(() => {
    if (source) setDraft(source);
    else if (!id) setDraft(createDraft(certificates));
  }, [certificates, id, source]);

  const set = <K extends keyof Certificate>(key: K, value: Certificate[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const save = () => {
    portfolioRepository.updateCertificate(draft);
    navigate("/admin/certificates");
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
            <AdminInput label="Display Order" value={String(draft.displayOrder)} onChange={(value) => set("displayOrder", Number(value) || 0)} />
          </div>
          <AdminInput label="Credential URL" value={draft.credentialUrl} onChange={(value) => set("credentialUrl", value)} />
          <div className="flex flex-wrap gap-5">
            <label className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)]"><input type="checkbox" checked={draft.published} onChange={(event) => set("published", event.target.checked)} /> Published</label>
            <label className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)]"><input type="checkbox" checked={draft.featured} onChange={(event) => set("featured", event.target.checked)} /> Featured</label>
          </div>
        </FormSection>
        <FormSection title="Certificate Image">
          <AdminImageField label="Certificate Preview Image" value={draft.image} folder={`certificates/${draft.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || draft.id}`} hint="Recommended 1600x1000px for web certificates or high quality A4 scan. Keep text readable because this opens in a preview modal." onChange={(value) => set("image", value)} />
        </FormSection>
        <div className="flex flex-wrap gap-3">
          <button onClick={save} className="bg-[var(--color-text-main)] px-5 py-3 text-sm font-bold text-[var(--color-bg-primary)]">Save Certificate</button>
          <button onClick={() => navigate("/admin/certificates")} className="border border-[var(--color-border)] px-5 py-3 text-sm font-bold text-[var(--color-text-secondary)]">Cancel</button>
        </div>
      </div>
    </div>
  );
}
