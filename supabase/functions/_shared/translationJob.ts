export type TranslationSource = { translation_version: number; translation_source_hash: string | null };

export function isCurrentTranslationSource(current: TranslationSource, version: number, hash: string) {
  return current.translation_version === version && current.translation_source_hash === hash;
}

export function translationEntityFilter(_entityType: string, entityId: string) {
  return { column: "id" as const, value: entityId };
}

export function translationSourceState(current: TranslationSource | null, version: number, hash: string) {
  if (!current) return "missing" as const;
  return isCurrentTranslationSource(current, version, hash) ? "current" as const : "stale" as const;
}
