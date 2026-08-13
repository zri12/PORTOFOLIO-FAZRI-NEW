import { describe, expect, it } from "vitest";
import { isCurrentTranslationSource, translationEntityFilter, translationSourceState } from "../../../supabase/functions/_shared/translationJob";
import { assertTranslationStructure } from "../../../supabase/functions/_shared/translationStructure";

describe("translation hardening", () => {
  const source = { slug: "article", title: "Source", blocks: [{ id: "block-1", type: "image", url: "https://example.test/image.webp", alt: "Image" }] };

  it("preserves protected URLs, slugs, and article block identity", () => {
    expect(() => assertTranslationStructure(source, { slug: "article", title: "Terjemahan", blocks: [{ id: "block-1", type: "image", url: "https://example.test/image.webp", alt: "Gambar" }] })).not.toThrow();
  });

  it("rejects changed protected fields and arrays", () => {
    expect(() => assertTranslationStructure(source, { slug: "different", title: "Terjemahan", blocks: [{ id: "different", type: "text", url: "https://example.test/changed.webp", alt: "Gambar" }] })).toThrow("protected field");
    expect(() => assertTranslationStructure(source, { slug: "article", title: "Terjemahan", blocks: [] })).toThrow("array structure");
  });

  it("marks jobs stale when the persisted source version or hash changed", () => {
    expect(isCurrentTranslationSource({ translation_version: 3, translation_source_hash: "abc" }, 3, "abc")).toBe(true);
    expect(isCurrentTranslationSource({ translation_version: 4, translation_source_hash: "abc" }, 3, "abc")).toBe(false);
    expect(isCurrentTranslationSource({ translation_version: 3, translation_source_hash: "new" }, 3, "abc")).toBe(false);
  });

  it("resolves every queued entity by its primary-key id and marks missing sources stale", () => {
    expect(translationEntityFilter("site_profiles", "profile-uuid")).toEqual({ column: "id", value: "profile-uuid" });
    expect(translationEntityFilter("site_settings", "settings-uuid")).toEqual({ column: "id", value: "settings-uuid" });
    expect(translationSourceState(null, 1, "hash")).toBe("missing");
    expect(translationSourceState({ translation_version: 2, translation_source_hash: "hash" }, 1, "hash")).toBe("stale");
    expect(translationSourceState({ translation_version: 1, translation_source_hash: "new" }, 1, "hash")).toBe("stale");
    expect(translationSourceState({ translation_version: 1, translation_source_hash: "hash" }, 1, "hash")).toBe("current");
  });
});
