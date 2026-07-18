import { useState } from "react";
import { AdminImageField } from "../../components/admin/AdminImageFields";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import { AdminInput, FormSection } from "../../components/admin/FormSection";
import { usePortfolioData } from "../../hooks/usePortfolioData";
import { portfolioRepository } from "../../repositories/portfolioRepository";

export default function AdminProfilePage() {
  const { profile } = usePortfolioData();
  const [draft, setDraft] = useState(profile);
  const [saved, setSaved] = useState(false);
  const update = (key: keyof typeof draft, value: string) => setDraft({ ...draft, [key]: value });

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
            <AdminImageField label="Website Logo" value={draft.logoUrl} folder="profile/logo" hint="Recommended transparent PNG/SVG/WebP, square 512x512px. This replaces the FL mark across the website." aspect="aspect-square" onChange={(value) => update("logoUrl", value)} />
            <AdminImageField label="Browser Logo / Favicon" value={draft.faviconUrl} folder="profile/favicon" hint="Recommended square 512x512px PNG/WebP. Browser tabs usually display it as 32x32px." aspect="aspect-square" onChange={(value) => update("faviconUrl", value)} />
            <AdminImageField label="About Me Image" value={draft.aboutImageUrl} folder="profile/about" hint="Recommended portrait 1200x1500px or 4:5. Use a clean background so the overlay card remains readable." aspect="aspect-[4/5]" onChange={(value) => update("aboutImageUrl", value)} />
          </div>
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
