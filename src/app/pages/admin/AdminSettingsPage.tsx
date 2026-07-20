import { useEffect, useState } from "react";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import { AdminInput, FormSection } from "../../components/admin/FormSection";
import { usePortfolioData } from "../../hooks/usePortfolioData";
import { portfolioRepository } from "../../repositories/portfolioRepository";

export default function AdminSettingsPage() {
  const { settings } = usePortfolioData();
  const [draft, setDraft] = useState(settings);
  const [json, setJson] = useState("");
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");
  const set = (key: keyof typeof draft, value: string | boolean) => {
    setDirty(true);
    setStatus("idle");
    setError("");
    setDraft({ ...draft, [key]: value });
  };

  useEffect(() => {
    if (!dirty) setDraft(settings);
  }, [dirty, settings]);

  const saveSettings = async () => {
    setStatus("saving");
    setError("");
    try {
      portfolioRepository.updateSettings(draft);
      await portfolioRepository.flushPendingWrites();
      setDirty(false);
      setStatus("saved");
    } catch (saveError) {
      setStatus("error");
      setError(saveError instanceof Error ? saveError.message : "Settings could not be saved to Supabase.");
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <AdminPageHeader title="Settings" description="Manage general settings, animation toggles, contact/comment visibility, SEO text, and demo data import/export." />
      <div className="grid gap-6">
        <FormSection title="General and SEO">
          <AdminInput label="Website Name" value={draft.websiteName} onChange={(value) => set("websiteName", value)} />
          <AdminInput label="Description" value={draft.description} onChange={(value) => set("description", value)} textarea />
          <AdminInput label="SEO Title" value={draft.seoTitle} onChange={(value) => set("seoTitle", value)} />
          <AdminInput label="SEO Description" value={draft.seoDescription} onChange={(value) => set("seoDescription", value)} textarea />
          <AdminInput label="Keywords" value={draft.keywords} onChange={(value) => set("keywords", value)} />
        </FormSection>
        <FormSection title="Feature Toggles">
          {(["smoothScroll", "splashEnabled", "threeEnabled", "commentsEnabled", "contactEnabled"] as const).map((key) => (
            <label key={key} className="flex items-center justify-between border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-3 text-sm"><span>{key}</span><input type="checkbox" checked={draft[key]} onChange={(event) => set(key, event.target.checked)} /></label>
          ))}
        </FormSection>
        <FormSection title="Data">
          <textarea value={json} onChange={(event) => setJson(event.target.value)} rows={8} placeholder="Exported JSON appears here. Paste JSON here before importing." className="w-full border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-3 text-sm outline-none" />
          <div className="flex flex-wrap gap-3">
            <button onClick={() => void saveSettings()} disabled={status === "saving"} className="bg-[var(--color-text-main)] px-5 py-3 text-sm font-bold text-[var(--color-bg-primary)] disabled:opacity-60">{status === "saving" ? "Saving..." : "Save Settings"}</button>
            <button onClick={() => setJson(portfolioRepository.exportData())} className="border border-[var(--color-border)] px-5 py-3 text-sm font-bold">Export JSON</button>
            <button onClick={() => json.trim() && portfolioRepository.importData(json)} className="border border-[var(--color-border)] px-5 py-3 text-sm font-bold">Import JSON</button>
            <button onClick={() => portfolioRepository.resetDemoData()} className="border border-red-500/40 px-5 py-3 text-sm font-bold text-red-300">Reset Demo Data</button>
          </div>
          {status === "saved" && <p className="text-sm text-emerald-300">Saved to the active data source.</p>}
          {status === "error" && <p className="text-sm text-red-300">{error}</p>}
        </FormSection>
      </div>
    </div>
  );
}
