export function assertTranslationStructure(source: unknown, translated: unknown, path = "payload"): void {
  if (Array.isArray(source)) {
    if (!Array.isArray(translated) || source.length !== translated.length) throw new Error(`Translation changed array structure at ${path}.`);
    source.forEach((value, index) => assertTranslationStructure(value, translated[index], `${path}[${index}]`));
    return;
  }
  if (source && typeof source === "object") {
    if (!translated || typeof translated !== "object" || Array.isArray(translated)) throw new Error(`Translation changed object structure at ${path}.`);
    const sourceObject = source as Record<string, unknown>;
    const translatedObject = translated as Record<string, unknown>;
    const sourceKeys = Object.keys(sourceObject).sort();
    const translatedKeys = Object.keys(translatedObject).sort();
    if (sourceKeys.join("|") !== translatedKeys.join("|")) throw new Error(`Translation changed keys at ${path}.`);
    sourceKeys.forEach((key) => {
      if (["id", "type", "url", "href", "slug"].includes(key) && sourceObject[key] !== translatedObject[key]) throw new Error(`Translation changed protected field ${path}.${key}.`);
      assertTranslationStructure(sourceObject[key], translatedObject[key], `${path}.${key}`);
    });
    return;
  }
  if (typeof source !== typeof translated) throw new Error(`Translation changed value type at ${path}.`);
}
