import { useRef, useState } from "react";
import { ImagePlus, Move, RotateCcw, Trash, Upload, X } from "lucide-react";
import { getSupabaseClient, isSupabaseEnabled, publicBucket } from "../../lib/supabase/client";
import { uploadPortfolioFile } from "../../lib/supabase/storage";

type ImageFieldProps = {
  label: string;
  value: string;
  folder: string;
  hint: string;
  aspect?: string;
  cropMode?: "fixed" | "original";
  onChange: (value: string) => void;
};

export function AdminImageField({ label, value, folder, hint, aspect = "aspect-[16/10]", cropMode = "fixed", onChange }: ImageFieldProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [uploaded, setUploaded] = useState(false);
  const [editor, setEditor] = useState<CropRequest | null>(null);
  const previewUrl = getPreviewUrl(value);
  const shouldCrop = cropMode === "fixed";
  const previewFrameClass = shouldCrop ? aspect : "min-h-[160px]";

  const uploadCropped = async (file: File, previewUrl: string) => {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      if (!isSupabaseEnabled) {
        onChange(previewUrl);
        setUploaded(true);
        return;
      }
      const result = await uploadPortfolioFile(file, folder);
      onChange(result.url);
      setUploaded(true);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  const uploadOriginal = async (file: File) => {
    setBusy(true);
    setError("");
    try {
      if (!isSupabaseEnabled) {
        onChange(await fileToDataUrl(file));
        setUploaded(true);
        return;
      }
      const result = await uploadPortfolioFile(file, folder);
      onChange(result.url);
      setUploaded(true);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  const selectFile = async (file: File | null) => {
    if (!file) return;
    setError("");
    if (!shouldCrop) {
      await uploadOriginal(file);
      return;
    }
    setEditor({
      file,
      dataUrl: await fileToDataUrl(file),
      aspectRatio: getAspectRatio(aspect),
      title: label,
      onApply: uploadCropped,
    });
  };

  return (
    <div className="border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--color-text-secondary)]">{label}</p>
          <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">{hint}</p>
        </div>
        {value && (
          <button type="button" onClick={() => { onChange(""); setUploaded(false); }} className="text-red-300" title="Remove image">
            <Trash size={16} />
          </button>
        )}
      </div>
      <div className={`mt-4 flex ${previewFrameClass} items-center justify-center overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface-elevated)]`}>
        {previewUrl ? <img src={previewUrl} alt={label} className={shouldCrop ? "h-full w-full object-contain" : "h-auto max-h-[420px] w-full object-contain"} /> : <ImagePlus className="text-[var(--color-text-muted)]" size={28} />}
      </div>
      <input
        value={value}
        onChange={(event) => { setUploaded(false); onChange(event.target.value); }}
        placeholder="Image URL or uploaded public URL"
        className="mt-3 w-full border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-3 text-xs outline-none focus:border-[var(--color-accent-main)]"
      />
      <label className="mt-3 inline-flex cursor-pointer items-center gap-2 border border-[var(--color-border)] px-3 py-2 text-xs font-bold hover:border-[var(--color-accent-main)]">
        <Upload size={14} /> {busy ? "Uploading..." : shouldCrop ? "Upload and crop image" : "Upload image"}
        <input type="file" accept="image/*" className="hidden" disabled={busy} onChange={(event) => void selectFile(event.target.files?.[0] || null)} />
      </label>
      {!isSupabaseEnabled && <p className="mt-2 text-xs leading-5 text-amber-200/80">Supabase env is not active, so this image is saved as a temporary local preview URL. Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` for permanent uploads.</p>}
      {uploaded && <p className="mt-2 text-xs leading-5 text-emerald-300">Upload complete. Save this form to publish the image URL to the website.</p>}
      {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
      {editor && <CropEditor request={editor} onClose={() => setEditor(null)} />}
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
  const [editor, setEditor] = useState<CropRequest | null>(null);

  const uploadCropped = async (file: File, previewUrl: string) => {
    setBusy(true);
    setError("");
    try {
      if (!isSupabaseEnabled) {
        onChange([...values, previewUrl]);
        return;
      }
      const uploaded = await uploadPortfolioFile(file, folder);
      onChange([...values, uploaded.url]);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setError("");
    try {
      const file = files[0];
      setEditor({
        file,
        dataUrl: await fileToDataUrl(file),
        aspectRatio: 16 / 10,
        title: `${label} ${values.length + 1}`,
        onApply: uploadCropped,
      });
      if (files.length > 1) {
        setError("Crop one gallery image at a time so each preview stays clean.");
      }
    } catch {
      setError("Could not read image file.");
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
              {value ? <img src={getPreviewUrl(value)} alt={`${label} ${index + 1}`} className="h-full w-full object-contain" /> : null}
            </div>
            <input value={value} onChange={(event) => updateAt(index, event.target.value)} className="mt-2 w-full border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-2 text-xs outline-none" />
            <button type="button" onClick={() => removeAt(index)} className="mt-2 text-xs text-red-300">Remove</button>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => onChange([...values, ""])} className="border border-[var(--color-border)] px-3 py-2 text-xs font-bold">Add URL row</button>
        <label className="inline-flex cursor-pointer items-center gap-2 border border-[var(--color-border)] px-3 py-2 text-xs font-bold hover:border-[var(--color-accent-main)]">
          <Upload size={14} /> {busy ? "Uploading..." : "Upload and crop image"}
          <input type="file" accept="image/*" className="hidden" disabled={busy} onChange={(event) => void upload(event.target.files)} />
        </label>
      </div>
      {!isSupabaseEnabled && <p className="mt-2 text-xs leading-5 text-amber-200/80">Supabase env is not active, so uploaded gallery images use temporary local preview URLs until Supabase is configured.</p>}
      {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
      {editor && <CropEditor request={editor} onClose={() => setEditor(null)} />}
    </div>
  );
}

type CropRequest = {
  file: File;
  dataUrl: string;
  aspectRatio: number;
  title: string;
  onApply: (file: File, previewUrl: string) => Promise<void>;
};

function getAspectRatio(aspect: string) {
  const match = aspect.match(/aspect-\[(\d+)\/(\d+)\]/);
  if (!match) return 16 / 10;
  return Number(match[1]) / Number(match[2]);
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function getPreviewUrl(value: string) {
  if (!value || value.startsWith("http") || value.startsWith("data:") || value.startsWith("/") || value.startsWith("blob:")) return value;
  const supabase = getSupabaseClient();
  return supabase ? supabase.storage.from(publicBucket).getPublicUrl(value).data.publicUrl : value;
}

async function cropImage(request: CropRequest, zoom: number, offsetX: number, offsetY: number) {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = reject;
    element.src = request.dataUrl;
  });

  const naturalWidth = image.naturalWidth;
  const naturalHeight = image.naturalHeight;
  const cropWidth = Math.min(naturalWidth, naturalHeight * request.aspectRatio) / zoom;
  const cropHeight = cropWidth / request.aspectRatio;
  const freeX = Math.max(0, naturalWidth - cropWidth);
  const freeY = Math.max(0, naturalHeight - cropHeight);
  const sourceX = Math.min(freeX, Math.max(0, freeX / 2 - (offsetX / 100) * (freeX / 2)));
  const sourceY = Math.min(freeY, Math.max(0, freeY / 2 - (offsetY / 100) * (freeY / 2)));
  const outputWidth = Math.round(Math.min(1800, Math.max(900, cropWidth)));
  const outputHeight = Math.round(outputWidth / request.aspectRatio);

  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not prepare image crop.");
  context.imageSmoothingQuality = "high";
  context.drawImage(image, sourceX, sourceY, cropWidth, cropHeight, 0, 0, outputWidth, outputHeight);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => result ? resolve(result) : reject(new Error("Could not export cropped image.")), "image/webp", 0.92);
  });
  const name = request.file.name.replace(/\.[^.]+$/, "") || "portfolio-image";
  const file = new File([blob], `${name}-cropped.webp`, { type: "image/webp" });
  return { file, previewUrl: canvas.toDataURL("image/webp", 0.9) };
}

const clampMove = (value: number) => Math.min(100, Math.max(-100, value));

function CropEditor({ request, onClose }: { request: CropRequest; onClose: () => void }) {
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const drag = useRef<{ pointerId: number; startX: number; startY: number; originX: number; originY: number } | null>(null);

  const apply = async () => {
    setBusy(true);
    setError("");
    try {
      const cropped = await cropImage(request, zoom, offsetX, offsetY);
      await request.onApply(cropped.file, cropped.previewUrl);
      onClose();
    } catch (cropError) {
      setError(cropError instanceof Error ? cropError.message : "Crop failed.");
    } finally {
      setBusy(false);
    }
  };

  const startDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (busy) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: offsetX,
      originY: offsetY,
    };
  };

  const moveDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const nextX = current.originX + ((event.clientX - current.startX) / Math.max(1, rect.width)) * 220;
    const nextY = current.originY + ((event.clientY - current.startY) / Math.max(1, rect.height)) * 220;
    setOffsetX(clampMove(nextX));
    setOffsetY(clampMove(nextY));
  };

  const stopDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (drag.current?.pointerId === event.pointerId) {
      event.currentTarget.releasePointerCapture(event.pointerId);
      drag.current = null;
    }
  };

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-[var(--color-border)] p-4">
          <div>
            <p className="font-manrope text-xl font-bold">Crop image</p>
            <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">{request.title} - drag the image or use sliders, then apply.</p>
          </div>
          <button type="button" onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]" aria-label="Close crop editor">
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-5 p-4 lg:grid-cols-[1fr_260px]">
          <div className="flex min-h-[280px] items-center justify-center bg-[var(--color-bg-primary)] p-4">
            <div
              className="relative w-full max-w-xl cursor-grab touch-none overflow-hidden border border-[var(--color-border)] bg-black active:cursor-grabbing"
              style={{ aspectRatio: request.aspectRatio }}
              onPointerDown={startDrag}
              onPointerMove={moveDrag}
              onPointerUp={stopDrag}
              onPointerCancel={stopDrag}
            >
              <img
                src={request.dataUrl}
                alt=""
                className="h-full w-full object-cover"
                style={{ transform: `translate(${offsetX * 0.32}%, ${offsetY * 0.32}%) scale(${zoom})`, transformOrigin: "50% 50%" }}
                draggable={false}
              />
              <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/35" />
            </div>
          </div>

          <div className="space-y-4">
            <Slider label="Zoom" value={zoom} min={1} max={2.4} step={0.05} onChange={setZoom} />
            <Slider label="Move X" value={offsetX} min={-100} max={100} step={1} onChange={setOffsetX} />
            <Slider label="Move Y" value={offsetY} min={-100} max={100} step={1} onChange={setOffsetY} />
            <button type="button" onClick={() => { setZoom(1); setOffsetX(0); setOffsetY(0); }} className="inline-flex items-center gap-2 border border-[var(--color-border)] px-3 py-2 text-xs font-bold">
              <RotateCcw size={14} /> Reset
            </button>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={apply} disabled={busy} className="inline-flex flex-1 items-center justify-center gap-2 bg-[var(--color-text-main)] px-4 py-3 text-sm font-bold text-[var(--color-bg-primary)] disabled:opacity-60">
                <Move size={15} /> {busy ? "Applying..." : "Apply crop"}
              </button>
              <button type="button" onClick={onClose} className="border border-[var(--color-border)] px-4 py-3 text-sm font-bold">Cancel</button>
            </div>
            {error && <p className="text-xs text-red-300">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Slider({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (value: number) => void }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between text-xs font-bold text-[var(--color-text-secondary)]">
        {label}
        <span className="font-mono text-[10px] text-[var(--color-text-muted)]">{value.toFixed(step < 1 ? 2 : 0)}</span>
      </span>
      <input type="range" value={value} min={min} max={max} step={step} onChange={(event) => onChange(Number(event.target.value))} className="w-full accent-[var(--color-accent-main)]" />
    </label>
  );
}
