import { publicBucket, requireSupabaseClient } from "./client";

const safeName = (name: string) => name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-+|-+$/g, "");

export async function uploadPortfolioFile(file: File, folder = "uploads") {
  const supabase = requireSupabaseClient();
  const path = `${folder}/${crypto.randomUUID()}-${safeName(file.name)}`;
  const { error } = await supabase.storage.from(publicBucket).upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
    contentType: file.type || "application/octet-stream",
  });
  if (error) throw error;

  const { data } = supabase.storage.from(publicBucket).getPublicUrl(path);
  const asset = {
    bucket_id: publicBucket,
    object_path: path,
    name: file.name,
    media_type: file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "file",
    mime_type: file.type || "application/octet-stream",
    size_bytes: file.size,
    public: true,
  };
  const { data: row, error: insertError } = await supabase.from("media_assets").insert(asset).select("*").single();
  if (insertError) {
    await supabase.storage.from(publicBucket).remove([path]);
    throw insertError;
  }
  return { row, url: data.publicUrl, path };
}

export async function deletePortfolioFile(path: string) {
  const supabase = requireSupabaseClient();
  const { error } = await supabase.storage.from(publicBucket).remove([path]);
  if (error) throw error;
}
