import { describe, expect, it } from "vitest";
import { portfolioSeed } from "../../data/seed/portfolioSeed";
import { mapProject, projectToRow } from "./mappers";

const translation = { title: "SINDEN Indonesia", fullName: "", category: "", type: "", role: "", shortDescription: "", fullDescription: "", overview: "", background: "", objectives: [], targetUsers: [], responsibilities: [], solution: "", features: [], architecture: "", dataStructure: "", process: [], challenges: [], decisions: [], testing: "", deployment: "", result: "" };

describe("project translation mapper", () => {
  it("prioritizes the worker-owned projects.translations column over legacy decisions data", () => {
    const project = mapProject({ id: "project-id", translations: { id: translation }, decisions: { items: [], translations: { id: { ...translation, title: "Legacy title" } } } });
    expect(project.translations?.id?.title).toBe("SINDEN Indonesia");
  });

  it("uses legacy decisions translations only when the top-level column is absent", () => {
    const project = mapProject({ id: "project-id", decisions: { items: [], translations: { id: translation } } });
    expect(project.translations?.id?.title).toBe("SINDEN Indonesia");
  });

  it("maps project translation metadata from the top-level database columns", () => {
    const project = mapProject({ id: "project-id", source_language: "id", translation_status: "ready", translation_source_hash: "hash", translation_version: 3, translation_updated_at: "2026-08-13T00:00:00Z", translation_error: "" });
    expect(project).toMatchObject({ sourceLanguage: "id", translationStatus: "ready", translationSourceHash: "hash", translationVersion: 3, translationUpdatedAt: "2026-08-13T00:00:00Z" });
    expect(project.translationError).toBeUndefined();
  });

  it("writes translations to the worker-owned column while preserving the decisions array constraint", () => {
    const project = { ...portfolioSeed.projects[0], translations: { id: translation } };
    const row = projectToRow(project);
    expect(row.translations).toEqual({ id: translation });
    expect(row.decisions).toEqual(project.decisions);
    expect(Array.isArray(row.decisions)).toBe(true);
  });
});
