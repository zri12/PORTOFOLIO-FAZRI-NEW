import { useEffect, useState } from "react";
import { ImagePlus, Trash } from "lucide-react";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import { EmptyState } from "../../components/common/EmptyState";
import { usePortfolioData } from "../../hooks/usePortfolioData";
import { isSupabaseEnabled } from "../../lib/supabase/client";
import { uploadPortfolioFile } from "../../lib/supabase/storage";
import { portfolioRepository } from "../../repositories/portfolioRepository";

export default function AdminMediaPage() {
  const { media } = usePortfolioData();
  const [objectUrls, setObjectUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => () => objectUrls.forEach((url) => URL.revokeObjectURL(url)), [objectUrls]);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        if (isSupabaseEnabled) {
          const uploaded = await uploadPortfolioFile(file);
          portfolioRepository.createMedia({ name: file.name, type: file.type || "file", size: file.size, url: uploaded.url, note: `Supabase Storage: ${uploaded.path}` });
        } else {
          const url = URL.createObjectURL(file);
          setObjectUrls((items) => [...items, url]);
          portfolioRepository.createMedia({ name: file.name, type: file.type || "file", size: file.size, url, note: "Local development preview only. Configure Supabase for permanent upload." });
        }
      }
      await portfolioRepository.refresh();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader title="Media Library" description="Upload and manage portfolio media assets through Supabase Storage." />
      <label className="mb-8 flex min-h-[180px] cursor-pointer flex-col items-center justify-center border border-dashed border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-8 text-center">
        <ImagePlus className="mb-3 text-[var(--color-accent-main)]" />
        <span className="font-bold">{uploading ? "Uploading..." : "Select or drop files"}</span>
        <span className="mt-2 text-sm text-[var(--color-text-muted)]">{isSupabaseEnabled ? "Files are stored in the public portfolio bucket." : "Supabase is not configured; files use local preview fallback."}</span>
        <input type="file" multiple className="sr-only" disabled={uploading} onChange={(event) => void handleFiles(event.target.files)} />
      </label>
      {error && <p className="mb-6 border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
      {media.length === 0 ? <EmptyState title="No media selected" description="Choose files to create temporary previews and metadata rows." /> : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {media.map((item) => (
            <article key={item.id} className="border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4">
              {item.type.startsWith("image") ? <img src={item.url} alt={item.name} className="aspect-square w-full object-cover" /> : <div className="flex aspect-square items-center justify-center bg-[var(--color-bg-primary)] text-sm text-[var(--color-text-muted)]">{item.type}</div>}
              <h2 className="mt-4 truncate font-bold">{item.name}</h2>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">{Math.round(item.size / 1024)} KB</p>
              <p className="mt-2 text-xs leading-5 text-[var(--color-text-secondary)]">{item.note}</p>
              <div className="mt-3 flex gap-2">
                <button onClick={() => navigator.clipboard?.writeText(item.url)} className="border border-[var(--color-border)] px-3 py-2 text-xs font-bold">Copy URL</button>
                <button onClick={() => portfolioRepository.deleteMedia(item.id)} className="border border-red-500/30 p-2 text-red-300"><Trash size={14} /></button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
