import { useState } from "react";
import { ImagePlus, Trash, Upload } from "lucide-react";
import { uploadPortfolioFile } from "../../lib/supabase/storage";

type ImageFieldProps = {
  label: string;
  value: string;
  folder: string;
  hint: string;
  aspect?: string;
  onChange: (value: string) => void;
};

export function AdminImageField({ label, value, folder, hint, aspect = "aspect-[16/10]", onChange }: ImageFieldProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const upload = async (file: File | null) => {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const result = await uploadPortfolioFile(file, folder);
      onChange(result.url);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--color-text-secondary)]">{label}</p>
          <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">{hint}</p>
        </div>
        {value && (
          <button type="button" onClick={() => onChange("")} className="text-red-300" title="Remove image">
            <Trash size={16} />
          </button>
        )}
      </div>
      <div className={`mt-4 flex ${aspect} items-center justify-center overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface-elevated)]`}>
        {value ? <img src={value} alt={label} className="h-full w-full object-contain" /> : <ImagePlus className="text-[var(--color-text-muted)]" size={28} />}
      </div>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Image URL or uploaded public URL"
        className="mt-3 w-full border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-3 text-xs outline-none focus:border-[var(--color-accent-main)]"
      />
      <label className="mt-3 inline-flex cursor-pointer items-center gap-2 border border-[var(--color-border)] px-3 py-2 text-xs font-bold hover:border-[var(--color-accent-main)]">
        <Upload size={14} /> {busy ? "Uploading..." : "Upload image"}
        <input type="file" accept="image/*" className="hidden" disabled={busy} onChange={(event) => void upload(event.target.files?.[0] || null)} />
      </label>
      {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
    </div>
  );
}

type GalleryFieldProps = {
  label: string;
  values: string[];
  folder: string;
  hint: string;
  onChange: (values: string[]) => void;
};

export function AdminGalleryField({ label, values, folder, hint, onChange }: GalleryFieldProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setError("");
    try {
      const uploads = await Promise.all(Array.from(files).map((file) => uploadPortfolioFile(file, folder)));
      onChange([...values, ...uploads.map((item) => item.url)]);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  const updateAt = (index: number, value: string) => onChange(values.map((item, itemIndex) => itemIndex === index ? value : item));
  const removeAt = (index: number) => onChange(values.filter((_, itemIndex) => itemIndex !== index));

  return (
    <div className="border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-4">
      <p className="text-sm font-semibold text-[var(--color-text-secondary)]">{label}</p>
      <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">{hint}</p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {values.map((value, index) => (
          <div key={`${value}-${index}`} className="border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-3">
            <div className="aspect-[16/10] overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-primary)]">
              {value ? <img src={value} alt={`${label} ${index + 1}`} className="h-full w-full object-contain" /> : null}
            </div>
            <input value={value} onChange={(event) => updateAt(index, event.target.value)} className="mt-2 w-full border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-2 text-xs outline-none" />
            <button type="button" onClick={() => removeAt(index)} className="mt-2 text-xs text-red-300">Remove</button>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => onChange([...values, ""])} className="border border-[var(--color-border)] px-3 py-2 text-xs font-bold">Add URL row</button>
        <label className="inline-flex cursor-pointer items-center gap-2 border border-[var(--color-border)] px-3 py-2 text-xs font-bold hover:border-[var(--color-accent-main)]">
          <Upload size={14} /> {busy ? "Uploading..." : "Upload gallery images"}
          <input type="file" accept="image/*" multiple className="hidden" disabled={busy} onChange={(event) => void upload(event.target.files)} />
        </label>
      </div>
      {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
    </div>
  );
}
