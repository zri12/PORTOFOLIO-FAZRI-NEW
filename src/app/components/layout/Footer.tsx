import { useContext } from "react";
import { Link } from "react-router";
import { ArrowUpCircle, Github, Instagram, Linkedin, Mail, MessageCircle, Youtube } from "lucide-react";
import { ThemeModeContext } from "../../context/ThemeModeContext";
import { useLanguage } from "../../context/LanguageContext";
import { usePortfolioData } from "../../hooks/usePortfolioData";
import { BrandMark } from "../common/BrandMark";

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { profile, projects, creativeWorks } = usePortfolioData();
  const { mode } = useContext(ThemeModeContext);
  const { t } = useLanguage();

  return (
    <footer className="relative overflow-hidden border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)] pb-[calc(3rem+env(safe-area-inset-bottom))] pt-14 sm:pt-20">
      <div className="absolute right-0 top-0 hidden h-96 w-96 -translate-y-1/2 translate-x-1/3 rounded-full bg-[var(--color-accent-main)]/5 blur-[100px] sm:block" />
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-12">
          <div className="sm:col-span-2 lg:col-span-4">
            <Link to="/" className="flex items-center gap-3">
              <BrandMark className="h-12 w-12 [&_span]:text-xl" />
              <div>
                <span className="block font-manrope text-lg font-bold">{profile.fullName}</span>
                <span className="font-mono text-[10px] uppercase tracking-[.16em] text-[var(--color-text-muted)]">{t(profile.title)}</span>
              </div>
            </Link>
            <p className="mt-6 max-w-sm leading-7 text-[var(--color-text-secondary)]">{t(profile.description)}</p>
            <div className="mt-7 flex flex-wrap gap-2 text-xs text-[var(--color-text-secondary)]">
              <span className="border border-[var(--color-border)] px-3 py-2">{t(profile.availability)}</span>
              <span className="border border-[var(--color-border)] px-3 py-2">{profile.location} / GMT+7</span>
              <span className="border border-[var(--color-border)] px-3 py-2 capitalize">{mode === "professional" ? t("Professional Mode") : t("Spider Mode")}</span>
            </div>
          </div>
          <FooterList title={t("Navigation")} items={[["Home", "/"], ["About", "/about"], ["Projects", "/projects"], ["Creative Works", "/creative-works"], ["Certificates", "/certificates"], ["Blog", "/blog"], ["Contact", "/contact"]]} t={t} />
          <FooterList title={t("Featured Projects")} items={projects.slice(0, 5).map((project) => [project.title, `/projects/${project.slug}`])} t={t} />
          <div className="sm:col-span-2 lg:col-span-3">
            <h4 className="mb-5 font-manrope font-bold">{t("Connect")}</h4>
            <div className="mb-6 grid grid-cols-4 gap-3">
              {[
                { icon: Github, href: profile.github, label: "GitHub" },
                { icon: Linkedin, href: profile.linkedin, label: "LinkedIn" },
                { icon: Instagram, href: profile.instagram, label: "Instagram" },
                { icon: Youtube, href: profile.youtube, label: "YouTube" },
              ].map((social) => (
                <a key={social.label} href={social.href} target="_blank" rel="noreferrer" aria-label={social.label} className="flex aspect-square items-center justify-center border border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent-main)] hover:text-[var(--color-accent-main)]">
                  <social.icon size={19} />
                </a>
              ))}
            </div>
            <div className="space-y-3 text-sm text-[var(--color-text-secondary)]">
              <Link to="/contact" className="flex items-center gap-2 hover:text-[var(--color-accent-main)]"><Mail size={15} /> {profile.email}</Link>
              <a href={`https://wa.me/${profile.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[var(--color-accent-main)]"><MessageCircle size={15} /> WhatsApp</a>
            </div>
            <div className="mt-6">
              <h5 className="mb-3 text-sm font-bold">{t("Creative Links")}</h5>
              <div className="space-y-2">
                {creativeWorks.slice(0, 2).map((work) => <Link key={work.id} to={`/creative-works/${work.slug}`} className="block text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent-main)]">{t(work.title)}</Link>)}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 flex items-end justify-between gap-5 border-t border-[var(--color-border)] pt-7 sm:mt-14 md:items-center">
          <p className="max-w-[17rem] text-sm leading-6 text-[var(--color-text-muted)] sm:max-w-none">© {currentYear} {profile.fullName}. {t("All rights reserved.")}</p>
          <div className="flex items-center gap-5">
            <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex h-10 w-10 items-center justify-center border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent-main)] hover:text-[var(--color-text-main)]" aria-label={t("Back to top")}>
              <ArrowUpCircle size={20} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

function FooterList({ title, items, t }: { title: string; items: string[][]; t: (value: string) => string }) {
  return (
    <div className="lg:col-span-2">
      <h4 className="mb-5 font-manrope font-bold">{title}</h4>
      <ul className="space-y-3">
        {items.map(([label, href]) => <li key={href}><Link to={href} className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent-main)]">{t(label)}</Link></li>)}
      </ul>
    </div>
  );
}

