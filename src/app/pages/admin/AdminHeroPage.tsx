import { useContext, useState } from "react";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import { AdminInput, FormSection } from "../../components/admin/FormSection";
import { DualCharacterReveal } from "../../components/portfolio/DualCharacterReveal";
import { ThemeModeContext } from "../../context/ThemeModeContext";
import { usePortfolioData } from "../../hooks/usePortfolioData";
import { portfolioRepository } from "../../repositories/portfolioRepository";

export default function AdminHeroPage() {
  const { profile, settings } = usePortfolioData();
  const [profileDraft, setProfileDraft] = useState(profile);
  const [settingsDraft, setSettingsDraft] = useState(settings);
  const { mode, toggleMode } = useContext(ThemeModeContext);
  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader title="Hero and Modes" description="Tune hero copy, default mode, animation settings, splash behavior, and the character reveal preview." />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <FormSection title="Shared Content">
            <AdminInput label="Greeting" value={profileDraft.greeting} onChange={(value) => setProfileDraft({ ...profileDraft, greeting: value })} />
            <AdminInput label="Name" value={profileDraft.fullName} onChange={(value) => setProfileDraft({ ...profileDraft, fullName: value })} />
            <AdminInput label="Title" value={profileDraft.title} onChange={(value) => setProfileDraft({ ...profileDraft, title: value })} />
            <AdminInput label="Headline" value={profileDraft.headline} onChange={(value) => setProfileDraft({ ...profileDraft, headline: value })} textarea />
            <AdminInput label="Description" value={profileDraft.description} onChange={(value) => setProfileDraft({ ...profileDraft, description: value })} textarea />
          </FormSection>
          <FormSection title="Splash and 3D">
            <Toggle label="Splash Enabled" checked={settingsDraft.splashEnabled} onChange={(checked) => setSettingsDraft({ ...settingsDraft, splashEnabled: checked })} />
            <Toggle label="3D Enabled" checked={settingsDraft.threeEnabled} onChange={(checked) => setSettingsDraft({ ...settingsDraft, threeEnabled: checked })} />
            <Toggle label="Smooth Scroll" checked={settingsDraft.smoothScroll} onChange={(checked) => setSettingsDraft({ ...settingsDraft, smoothScroll: checked })} />
            <label className="block"><span className="mb-2 block text-sm font-semibold text-[var(--color-text-secondary)]">Default Mode</span><select value={settingsDraft.defaultMode} onChange={(event) => setSettingsDraft({ ...settingsDraft, defaultMode: event.target.value as "professional" | "spider" })} className="w-full border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-3"><option value="professional">Professional</option><option value="spider">Spider</option></select></label>
          </FormSection>
          <button onClick={() => { portfolioRepository.updateProfile(profileDraft); portfolioRepository.updateSettings(settingsDraft); }} className="bg-[var(--color-text-main)] px-5 py-3 text-sm font-bold text-[var(--color-bg-primary)]">Save Hero Settings</button>
        </div>
        <aside className="border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5">
          <p className="font-mono text-[10px] uppercase tracking-[.16em] text-[var(--color-accent-main)]">Live preview / {mode}</p>
          <div className="mt-5 h-[520px] overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-primary)]">
            <DualCharacterReveal />
          </div>
          <button onClick={toggleMode} className="mt-4 w-full border border-[var(--color-border)] px-4 py-3 text-sm font-bold">Toggle Preview Mode</button>
        </aside>
      </div>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <label className="flex items-center justify-between border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-3 text-sm"><span>{label}</span><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /></label>;
}
