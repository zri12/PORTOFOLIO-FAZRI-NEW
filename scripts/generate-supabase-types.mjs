import { spawnSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync, renameSync } from "node:fs";

const output = "src/app/lib/supabase/database.types.ts";
const temp = `${output}.tmp`;
mkdirSync("src/app/lib/supabase", { recursive: true });
const result = process.platform === "win32"
  ? spawnSync(process.env.ComSpec || "cmd.exe", ["/d", "/s", "/c", "supabase gen types typescript --linked --schema public,storage"], { encoding: "utf8" })
  : spawnSync("supabase", ["gen", "types", "typescript", "--linked", "--schema", "public,storage"], { encoding: "utf8" });
if (result.status !== 0 || !result.stdout.trim()) {
  rmSync(temp, { force: true });
  process.stderr.write(result.stderr || "Supabase type generation failed. Link the intended project first.\n");
  process.exit(result.status || 1);
}
writeFileSync(temp, result.stdout);
renameSync(temp, output);
