import { createClient } from "@supabase/supabase-js";
import { readFile, stat } from "node:fs/promises";
import { basename, join } from "node:path";

const required = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
const missing = required.filter((key) => !process.env[key]?.trim());

if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

const bucket = process.env.SUPABASE_PUBLIC_BUCKET || "portfolio-public";
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const files = [
  "src/imports/fazri.png",
  "src/imports/character-professional.png",
  "src/imports/character-spider.png",
];

for (const file of files) {
  const path = join(process.cwd(), file);
  const bytes = await readFile(path);
  const info = await stat(path);
  const objectPath = `seed/${basename(file)}`;
  const { error } = await supabase.storage.from(bucket).upload(objectPath, bytes, {
    contentType: "image/png",
    upsert: true,
  });
  if (error) {
    console.error(`[FAIL] upload ${file}: ${error.message}`);
    process.exitCode = 1;
    continue;
  }
  await supabase.from("media_assets").upsert({
    bucket_id: bucket,
    object_path: objectPath,
    name: basename(file),
    media_type: "image",
    mime_type: "image/png",
    size_bytes: info.size,
    public: true,
    notes: "Seed portfolio asset",
  }, { onConflict: "bucket_id,object_path" });
  console.log(`[OK] uploaded ${objectPath}`);
}
