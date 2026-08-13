import { ArrowRight, Camera, Code2, Download, Palette, Sparkles } from "lucide-react";
import { Link } from "react-router";
import { motion, useReducedMotion } from "motion/react";
import portrait from "../../../imports/fazri.webp";
import { usePortfolioData } from "../../hooks/usePortfolioData";
import { useLanguage } from "../../context/LanguageContext";
import { localizeProfile } from "../../lib/localizedContent";
import { useDocumentMeta } from "../../hooks/useDocumentMeta";

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return <motion.div initial={reduce ? false : { opacity: 0, y: 22 }} whileInView={reduce ? {} : { opacity: 1, y: 0 }} viewport={{ once: true, amount: .12 }} transition={{ duration: .52 }} className={className}>{children}</motion.div>;
}

function cvLinkProps(value: string) {
  const href = value.trim();
  return href ? { href, target: /^https?:\/\//i.test(href) ? "_blank" : undefined, rel: "noreferrer" } : { href: undefined, hidden: true };
}

export default function AboutPage() {
  const data = usePortfolioData();
  const { language, t } = useLanguage();
  const profile = localizeProfile(data.profile, language);
  const aboutImage = profile.aboutImageUrl || portrait;
  const cvLink = cvLinkProps(profile.cvUrl);
  const projectCount = data.projects.filter((project) => project.status === "published").length;
  const certificateCount = data.certificates.filter((certificate) => certificate.published).length;
  useDocumentMeta({ title: `${t("About")} | ${profile.fullName}`, description: profile.description, language });

  return (
    <main className="overflow-x-clip bg-[var(--color-bg-primary)] pt-24 text-[var(--color-text-main)] sm:pt-28">
      <section className="relative border-b border-[var(--color-border)] px-5 pb-20 pt-10 sm:px-6 sm:pb-24 sm:pt-14 lg:pb-32">
        <div className="relative mx-auto max-w-7xl">
          <Reveal><p className="mb-4 font-mono text-[10px] uppercase tracking-[.2em] text-[var(--color-accent-main)]">{t("About")} / {profile.fullName}</p><h1 className="max-w-3xl font-manrope text-4xl font-bold leading-[1.02] tracking-[-.035em] sm:text-5xl md:text-7xl">{t("Building useful digital experiences with a creative point of view.")}</h1></Reveal>
          <div className="mt-10 grid items-center gap-12 sm:mt-14 lg:grid-cols-[.95fr_1.05fr] lg:gap-20">
            <Reveal className="relative min-h-[440px] sm:min-h-[530px]"><div className="absolute inset-0 border border-[var(--color-border)] bg-[var(--color-surface-elevated)]"><img src={aboutImage} onError={(event) => { event.currentTarget.src = portrait; }} alt={profile.fullName} className="h-full w-full object-contain object-center grayscale transition duration-700 hover:grayscale-0" /></div><span className="absolute bottom-3 right-3 border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-4 py-3 font-mono text-[9px] tracking-widest text-[var(--color-accent-main)]">{profile.location} / GMT+7</span></Reveal>
            <Reveal><p className="mb-4 font-mono text-[10px] uppercase tracking-[.2em] text-[var(--color-accent-main)]">{profile.greeting}</p><h2 className="font-manrope text-2xl font-bold sm:text-3xl">{profile.fullName}</h2><p className="mt-6 max-w-xl text-base leading-7 text-[var(--color-text-secondary)] sm:text-lg sm:leading-8">{profile.biography}</p><p className="mt-5 max-w-xl leading-7 text-[var(--color-text-muted)]">{profile.aboutContent || profile.description}</p><blockquote className="mt-8 border-l-2 border-[var(--color-accent-main)] bg-[var(--color-surface-elevated)] px-5 py-5 text-lg leading-8 text-[var(--color-accent-silver)]">“{profile.description}”</blockquote><div className="mt-8 flex flex-wrap gap-3"><a {...cvLink} className="inline-flex items-center gap-2 bg-[var(--color-text-main)] px-5 py-3 text-sm font-bold text-[var(--color-bg-primary)]"><Download size={15} />{t("Download CV")}</a><Link to="/projects" className="inline-flex items-center gap-2 border border-[var(--color-border)] px-5 py-3 text-sm font-bold">{t("View Projects")} <ArrowRight size={15} /></Link></div></Reveal>
          </div>
        </div>
      </section>
      <section className="bg-[var(--color-bg-secondary)] px-5 py-20 sm:px-6 sm:py-24"><div className="mx-auto max-w-7xl"><Reveal><p className="mb-4 font-mono text-[10px] uppercase tracking-[.2em] text-[var(--color-accent-main)]">{t("My practice")}</p><div className="grid gap-8 lg:grid-cols-[.85fr_1.15fr]"><h2 className="font-manrope text-3xl font-bold sm:text-4xl">{profile.title}</h2><p className="max-w-xl leading-7 text-[var(--color-text-secondary)]">{profile.aboutContent || profile.description}</p></div></Reveal><div className="mt-12 grid gap-px border border-[var(--color-border)] bg-[var(--color-border)] md:grid-cols-3">{[[Code2, "Web Development"], [Palette, "UI Design"], [Camera, "Visual Production"]].map(([Icon, title]) => <Reveal key={String(title)} className="bg-[var(--color-bg-secondary)] p-6 sm:p-7"><Icon className="text-[var(--color-accent-main)]" size={23} /><h3 className="mt-9 font-manrope text-xl font-bold">{t(String(title))}</h3></Reveal>)}</div></div></section>
      <section className="px-6 py-24"><div className="mx-auto max-w-7xl"><div className="grid gap-px border border-[var(--color-border)] bg-[var(--color-border)] md:grid-cols-3">{[[String(projectCount), "Projects delivered"], [String(certificateCount), "Certificates earned"], [profile.availability, "Availability"]].map(([stat, label]) => <Reveal key={String(label)} className="bg-[var(--color-bg-primary)] p-7"><strong className="font-manrope text-5xl text-[var(--color-accent-main)]">{stat}</strong><p className="mt-2 text-sm text-[var(--color-text-secondary)]">{t(String(label))}</p></Reveal>)}</div></div></section>
      <section className="bg-[var(--color-bg-secondary)] px-5 py-20 sm:px-6 sm:py-24"><Reveal className="mx-auto max-w-3xl text-center"><Sparkles className="mx-auto text-[var(--color-accent-main)]" /><h2 className="mt-6 font-manrope text-4xl font-bold">{t("Let's create a clear next step.")}</h2><p className="mt-5 text-[var(--color-text-secondary)]">{t("Whether you are planning a system, shaping a product, or refining an experience, I'd love to hear the context.")}</p><div className="mt-8 flex flex-wrap justify-center gap-3"><Link to="/contact" className="bg-[var(--color-text-main)] px-5 py-3 text-sm font-bold text-[var(--color-bg-primary)]">{t("Contact Me")}</Link><Link to="/projects" className="border border-[var(--color-border)] px-5 py-3 text-sm font-bold">{t("View Projects")}</Link></div></Reveal></section>
    </main>
  );
}
