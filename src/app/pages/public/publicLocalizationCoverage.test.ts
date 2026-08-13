import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { translateText } from "../../i18n/translations";

const read = (file: string) => readFileSync(new URL(file, import.meta.url), "utf8");

describe("public localization render coverage", () => {
  it("renders critical Home labels through the Indonesian static dictionary", () => {
    expect(translateText("Frontend Development", "id")).toBe("Pengembangan Frontend");
    expect(translateText("Website & Web Application Development", "id")).toBe("Pengembangan Website & Aplikasi Web");
    expect(translateText("Development systems, with a visual point of view.", "id")).not.toBe("Development systems, with a visual point of view.");
    const home = read("./HomePage.tsx");
    expect(home).toContain("t(String(title))");
    expect(home).toContain("t(String(description))");
  });

  it("keeps representative public pages wired to t() while CMS fields remain direct", () => {
    expect(read("./AboutPage.tsx")).toContain("useLanguage");
    expect(read("./ProjectDetailPage.tsx")).toContain('t("Overview")');
    expect(read("./ProjectDetailPage.tsx")).not.toContain("t(project.fullDescription)");
    expect(read("./ArticleDetailPage.tsx")).toContain('t("Back to blog")');
    expect(read("./ContactPage.tsx")).toContain('t("Send Message")');
    expect(read("../../components/layout/Footer.tsx")).toContain('t("Navigation")');
    expect(read("../../components/layout/Navbar.tsx")).toContain("useLanguage");
  });

  it("opens the admin WhatsApp template without making inbox storage or a visitor number a prerequisite", () => {
    const contact = read("./ContactPage.tsx");
    expect(contact).toContain('const whatsappUrl = `https://wa.me/${ownerWhatsApp}?text=${encodeURIComponent(template)}`');
    expect(contact).toContain('window.open(whatsappUrl, "_blank", "noopener,noreferrer");');
    expect(contact).toContain('Field label={t("WhatsApp (optional)")} name="whatsapp" type="tel"');
    expect(contact.indexOf('window.open(whatsappUrl, "_blank", "noopener,noreferrer");')).toBeLessThan(contact.indexOf("await supabasePortfolioRepository.submitContact(payload);"));
  });
});
