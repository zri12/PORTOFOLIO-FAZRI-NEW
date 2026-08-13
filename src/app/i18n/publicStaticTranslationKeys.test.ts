import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { enToId } from "./translations";

const roots = ["src/app/pages/public", "src/app/components/common", "src/app/components/layout", "src/app/components/portfolio"];

function publicSourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => entry.isDirectory()
    ? publicSourceFiles(join(directory, entry.name))
    : entry.name.endsWith(".tsx") || entry.name.endsWith(".ts") ? [join(directory, entry.name)] : []);
}

describe("public static translation coverage", () => {
  it("has an Indonesian entry for every literal passed directly to t()", () => {
    const missing = new Set<string>();
    for (const file of roots.flatMap(publicSourceFiles)) {
      const source = readFileSync(file, "utf8");
      for (const match of source.matchAll(/\bt\(\s*(["'])(.*?)\1\s*\)/gs)) {
        if (!enToId.has(match[2])) missing.add(match[2]);
      }
    }
    expect([...missing].sort()).toEqual([]);
  });
});
