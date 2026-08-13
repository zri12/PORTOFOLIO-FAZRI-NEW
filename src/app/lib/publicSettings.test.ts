import { describe, expect, it } from "vitest";
import { portfolioSeed } from "../data/seed/portfolioSeed";
import { isPublicFeatureEnabled, shouldLoadThree } from "./publicSettings";

describe("public settings behavior", () => {
  it("disables contact and comments when the CMS flags are false", () => {
    const settings = { ...portfolioSeed.settings, contactEnabled: false, commentsEnabled: false };
    expect(isPublicFeatureEnabled(settings, "contact")).toBe(false);
    expect(isPublicFeatureEnabled(settings, "comments")).toBe(false);
  });

  it("never loads Three when disabled, even in a ready Spider scene", () => {
    expect(shouldLoadThree({ ...portfolioSeed.settings, threeEnabled: false }, true, true, false)).toBe(false);
    expect(shouldLoadThree({ ...portfolioSeed.settings, threeEnabled: true }, true, true, false)).toBe(true);
  });
});
