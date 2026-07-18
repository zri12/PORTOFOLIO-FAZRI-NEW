import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";

const [file, mode = "--dry-run"] = process.argv.slice(2);
if (!file) {
  console.error("Usage: node scripts/import-portfolio-json.mjs portfolio.json [--apply]");
  process.exit(1);
}

const required = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
const missing = required.filter((key) => !process.env[key]?.trim());
if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

const data = JSON.parse(await readFile(file, "utf8"));
for (const key of ["profile", "projects", "techStack", "creativeWorks", "experiences", "certificates"]) {
  if (!(key in data)) throw new Error(`Invalid PortfolioData JSON. Missing ${key}.`);
}

const counts = {
  projects: data.projects?.length || 0,
  technologies: data.techStack?.length || 0,
  creativeWorks: data.creativeWorks?.length || 0,
  experiences: data.experiences?.length || 0,
  certificates: data.certificates?.length || 0,
  comments: data.comments?.length || 0,
  messages: data.messages?.length || 0,
};

console.log("Import preview:", counts);
if (mode !== "--apply") {
  console.log("Dry run only. Re-run with --apply to import.");
  process.exit(0);
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { error } = await supabase.from("site_settings").upsert({
  singleton_key: "main",
  website_name: data.settings.websiteName,
  description: data.settings.description,
  language: data.settings.language,
  copyright: data.settings.copyright,
  default_mode: data.settings.defaultMode,
  smooth_scroll: data.settings.smoothScroll,
  splash_enabled: data.settings.splashEnabled,
  three_enabled: data.settings.threeEnabled,
  comments_enabled: data.settings.commentsEnabled,
  contact_enabled: data.settings.contactEnabled,
  seo_title: data.settings.seoTitle,
  seo_description: data.settings.seoDescription,
  keywords: data.settings.keywords,
}, { onConflict: "singleton_key" });

if (error) throw error;
console.log("Base settings imported. Use the SQL seed as the canonical full import path for relational data.");
