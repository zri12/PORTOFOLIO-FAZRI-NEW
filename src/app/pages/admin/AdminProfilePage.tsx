import { useState } from "react";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import { AdminInput, FormSection } from "../../components/admin/FormSection";
import { usePortfolioData } from "../../hooks/usePortfolioData";
import { uploadPortfolioFile } from "../../lib/supabase/storage";
import { portfolioRepository } from "../../repositories/portfolioRepository";

export default function AdminProfilePage() {
  const { profile } = usePortfolioData();
  const [draft, setDraft] = useState(profile);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState<keyof typeof draft | null>(null);
  const [uploadError, setUploadError] = useState("");
  const update = (key: keyof typeof draft, value: string) => setDraft({ ...draft, [key]: value });
  const uploadImage = async (key: "logoUrl" | "faviconUrl" | "aboutImageUrl", file: File | null) => {
    if (!file) return;
    setUploading(key);
    setUploadError("");
    try {
      const result = await uploadPortfolioFile(file, `profile/${key}`);
      setDraft((current) => ({ ...current, [key]: result.url }));
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <AdminPageHeader title="Profile" description="Manage the owner identity, contact channels, social links, and biography used across the portfolio." />
      <div className="grid gap-6">
        <FormSection title="Identity">
          <div className="grid gap-4 md:grid-cols-2">
            <AdminInput label="Full Name" value={draft.fullName} onChange={(value) => update("fullName", value)} />
            <AdminInput label="Display Name" value={draft.displayName} onChange={(value) => update("displayName", value)} />
            <AdminInput label="Title" value={draft.title} onChange={(value) => update("title", value)} />
            <AdminInput label="Location" value={draft.location} onChange={(value) => update("location", value)} />
          </div>
          <AdminInput label="Headline" value={draft.headline} onChange={(value) => update("headline", value)} textarea />
          <AdminInput label="Biography" value={draft.biography} onChange={(value) => update("biography", value)} textarea />
          <AdminInput label="About Content" value={draft.aboutContent} onChange={(value) => update("aboutContent", value)} textarea />
        </FormSection>
        <FormSection title="Brand and Visual Assets">
          <div className="grid gap-4 lg:grid-cols-3">
            <ImageUpload label="Website Logo" value={draft.logoUrl} busy={uploading === "logoUrl"} onUpload={(file) => void uploadImage("logoUrl", file)} onClear={() => update("logoUrl", "")} />
            <ImageUpload label="Browser Logo / Favicon" value={draft.faviconUrl} busy={uploading === "faviconUrl"} onUpload={(file) => void uploadImage("faviconUrl", file)} onClear={() => update("faviconUrl", "")} />
            <ImageUpload label="About Me Image" value={draft.aboutImageUrl} busy={uploading === "aboutImageUrl"} onUpload={(file) => void uploadImage("aboutImageUrl", file)} onClear={() => update("aboutImageUrl", "")} />
          </div>
          {uploadError && <p className="mt-3 text-sm text-red-300">{uploadError}</p>}
        </FormSection>
        <FormSection title="Contact and Social">
          <div className="grid gap-4 md:grid-cols-2">
            {(["email", "whatsapp", "availability", "github", "linkedin", "instagram", "youtube", "tiktok", "cvUrl"] as const).map((key) => (
              <AdminInput key={key} label={key} value={draft[key]} onChange={(value) => update(key, value)} />
            ))}
          </div>
        </FormSection>
        <div className="flex items-center gap-3">
          <button onClick={() => { portfolioRepository.updateProfile(draft); setSaved(true); }} className="bg-[var(--color-text-main)] px-5 py-3 text-sm font-bold text-[var(--color-bg-primary)]">Save Profile</button>
          <button onClick={() => setDraft(profile)} className="border border-[var(--color-border)] px-5 py-3 text-sm font-bold">Reset</button>
          {saved && <span className="text-sm text-emerald-300">Saved locally.</span>}
        </div>
      </div>
    </div>
  );
}

function ImageUpload({ label, value, busy, onUpload, onClear }: { label: string; value: string; busy: boolean; onUpload: (file: File | null) => void; onClear: () => void }) {
  return (
    <div className="border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-4">
      <p className="text-sm font-semibold text-[var(--color-text-secondary)]">{label}</p>
      <div className="mt-3 flex aspect-[4/3] items-center justify-center overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
        {value ? <img src={value} alt={label} className="h-full w-full object-contain" /> : <span className="text-xs text-[var(--color-text-muted)]">No image</span>}
      </div>
      <label className="mt-3 flex cursor-pointer items-center justify-center border border-[var(--color-border)] px-3 py-2 text-sm font-bold hover:border-[var(--color-accent-main)]">
        {busy ? "Uploading..." : "Upload Image"}
        <input type="file" accept="image/*" className="hidden" disabled={busy} onChange={(event) => onUpload(event.target.files?.[0] || null)} />
      </label>
      {value && <button type="button" onClick={onClear} className="mt-2 w-full px-3 py-2 text-xs text-[var(--color-text-muted)] hover:text-red-300">Remove image</button>}
    </div>
  );
}
