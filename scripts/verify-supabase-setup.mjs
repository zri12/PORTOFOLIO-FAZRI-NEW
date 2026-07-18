import { createClient } from "@supabase/supabase-js";

const required = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
const missing = required.filter((key) => !process.env[key]?.trim());

if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const checks = [
  ["site_profiles", (rows) => rows.length >= 1],
  ["site_settings", (rows) => rows.length >= 1],
  ["projects", (rows) => rows.length >= 6],
  ["technologies", (rows) => rows.length >= 20],
  ["project_technologies", (rows) => rows.length >= 6],
  ["creative_works", (rows) => rows.length >= 4],
  ["experiences", (rows) => rows.length >= 3],
  ["certificates", (rows) => rows.length >= 3],
  ["admin_users", (rows) => rows.length >= 1],
];

let failed = false;

for (const [table, predicate] of checks) {
  const { data, error } = await supabase.from(table).select("*");
  if (error) {
    failed = true;
    console.error(`[FAIL] ${table}: ${error.message}`);
    continue;
  }
  const ok = predicate(data || []);
  console.log(`${ok ? "[OK]" : "[FAIL]"} ${table}: ${(data || []).length} rows`);
  if (!ok) failed = true;
}

const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
if (bucketError) {
  failed = true;
  console.error(`[FAIL] storage buckets: ${bucketError.message}`);
} else {
  const names = new Set(buckets.map((bucket) => bucket.name));
  const ok = names.has("portfolio-public") && names.has("portfolio-private");
  console.log(`${ok ? "[OK]" : "[FAIL]"} storage buckets: ${[...names].join(", ")}`);
  if (!ok) failed = true;
}

process.exit(failed ? 1 : 0);
