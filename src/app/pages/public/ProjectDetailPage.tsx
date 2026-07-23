import { Link, useParams } from "react-router";
import type React from "react";
import { ArrowLeft, ArrowRight, ExternalLink, Github, Layers, Monitor, ShieldCheck } from "lucide-react";
import { EmptyState } from "../../components/common/EmptyState";
import { SectionHeading } from "../../components/common/SectionHeading";
import { ProjectPreview } from "../../components/portfolio/ProjectPreview";
import { useLanguage } from "../../context/LanguageContext";
import { useDocumentMeta } from "../../hooks/useDocumentMeta";
import { usePortfolioData } from "../../hooks/usePortfolioData";

function DetailBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-[var(--color-border)] py-10">
      <h2 className="font-manrope text-2xl font-bold text-[var(--color-text-main)] md:text-3xl">{title}</h2>
      <div className="mt-5 text-sm leading-7 text-[var(--color-text-secondary)] md:text-base">{children}</div>
    </section>
  );
}

export default function ProjectDetailPage() {
  const { slug = "" } = useParams();
  const { projects, techStack } = usePortfolioData();
  const { t } = useLanguage();
  const project = projects.find((entry) => entry.slug === slug);

  useDocumentMeta({
    title: project ? `${project.title} Case Study - Fazri` : "Project Not Found - Fazri",
    description: project?.shortDescription || "Project detail page for Fazri Lukman Nurrohman's portfolio.",
  });

  if (!project) {
    return (
      <main className="min-h-screen bg-[var(--color-bg-primary)] px-6 pt-32">
        <div className="mx-auto max-w-4xl">
          <EmptyState title={t("Project not found")} description={t("The selected project is unavailable or has been moved.")} />
          <Link to="/projects" className="mt-6 inline-flex items-center gap-2 text-[var(--color-accent-main)]"><ArrowLeft size={16} /> {t("Back to Projects")}</Link>
        </div>
      </main>
    );
  }

  const index = projects.findIndex((entry) => entry.id === project.id);
  const previous = projects[(index - 1 + projects.length) % projects.length];
  const next = projects[(index + 1) % projects.length];
  const related = projects.find((entry) => entry.slug === project.relatedProjectSlug) || projects.find((entry) => entry.category === project.category && entry.id !== project.id) || next;
  const projectTech = techStack.filter((tech) => project.techStack.includes(tech.name));

  return (
    <main className="min-h-screen overflow-x-clip bg-[var(--color-bg-primary)] pt-24 text-[var(--color-text-main)] sm:pt-28 lg:pt-32">
      <section className="px-5 pb-16 sm:px-6 sm:pb-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-wrap items-center gap-3 text-sm text-[var(--color-text-muted)]">
            <Link to="/" className="hover:text-[var(--color-text-main)]">{t("Home")}</Link>
            <span>/</span>
            <Link to="/projects" className="hover:text-[var(--color-text-main)]">{t("Projects")}</Link>
            <span>/</span>
            <span className="text-[var(--color-accent-main)]">{project.title}</span>
          </div>
          <Link to="/projects" className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)]"><ArrowLeft size={16} /> {t("Back to Projects")}</Link>
          <div className="grid gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:gap-14">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[.18em] text-[var(--color-accent-main)]">{t(project.category)} / {project.year}</p>
              <h1 className="mt-5 break-words font-manrope text-4xl font-extrabold tracking-tight sm:text-5xl md:text-7xl">{project.title}</h1>
              <p className="mt-6 text-lg leading-8 text-[var(--color-text-secondary)] sm:text-xl">{t(project.fullDescription)}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href={project.liveUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-[var(--color-text-main)] px-5 py-3 text-sm font-bold text-[var(--color-bg-primary)]"><ExternalLink size={16} /> {t("Live Demo")}</a>
                <a href={project.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border border-[var(--color-border)] px-5 py-3 text-sm font-bold text-[var(--color-text-main)]"><Github size={16} /> {t("Source Code")}</a>
              </div>
              <div className="mt-10 grid grid-cols-2 gap-6 border-t border-[var(--color-border)] pt-8">
                <Meta label={t("Role")} value={t(project.role)} />
                <Meta label={t("Type")} value={t(project.type)} />
                <Meta label={t("Client")} value={t(project.clientType)} />
                <Meta label={t("Status")} value={t(project.status)} />
              </div>
            </div>
            <div className="min-w-0 border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-3 shadow-2xl sm:p-4">
              <div className="mb-4 flex items-center gap-2 border-b border-[var(--color-border)] pb-4">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-yellow-300" />
                <span className="h-3 w-3 rounded-full bg-green-400" />
                <span className="ml-auto font-mono text-[10px] text-[var(--color-text-muted)]">{project.slug}.fazri.dev</span>
              </div>
              <div className="aspect-[16/11]">
                {project.heroImage ? <img src={project.heroImage} alt={`${project.title} interface preview`} className="h-full w-full object-cover" /> : <ProjectPreview slug={project.slug} />}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-x-clip border-y border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto grid w-full max-w-7xl min-w-0 gap-10 xl:grid-cols-[minmax(240px,320px)_minmax(0,1fr)] xl:gap-12">
          <aside className="min-w-0 space-y-8 xl:sticky xl:top-32 xl:max-h-[calc(100svh-9rem)] xl:self-start xl:overflow-y-auto xl:overscroll-contain xl:pr-3">
            <div>
              <h2 className="font-manrope text-xl font-bold">{t("Tech Stack")}</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {projectTech.map((tech) => <span key={tech.id} className="max-w-full break-words border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm">{tech.name}</span>)}
              </div>
            </div>
            <div>
              <h2 className="font-manrope text-xl font-bold">{t("Main Features")}</h2>
              <ul className="mt-4 space-y-3">
                {project.features.map((feature) => <li key={feature} className="flex min-w-0 gap-3 text-sm text-[var(--color-text-secondary)]"><ShieldCheck size={16} className="mt-1 shrink-0 text-[var(--color-accent-main)]" /><span className="min-w-0 break-words">{t(feature)}</span></li>)}
              </ul>
            </div>
          </aside>
          <article className="min-w-0">
            <DetailBlock title={t("Overview")}><p>{t(project.overview)}</p></DetailBlock>
            <DetailBlock title={t("Background and Problem")}><p>{t(project.background)}</p></DetailBlock>
            <DetailBlock title={t("Objectives")}><List items={project.objectives.map(t)} /></DetailBlock>
            <DetailBlock title={t("Target Users")}><List items={project.targetUsers.map(t)} /></DetailBlock>
            <DetailBlock title={t("Role and Responsibilities")}><List items={project.responsibilities.map(t)} /></DetailBlock>
            <DetailBlock title={t("Solution")}><p>{t(project.solution)}</p></DetailBlock>
            <DetailBlock title={t("System Architecture")}><IconBlock icon={<Layers />} text={t(project.architecture)} /></DetailBlock>
            <DetailBlock title={t("Data Structure")}><p>{t(project.dataStructure)}</p></DetailBlock>
            <DetailBlock title={t("Development Process")}><Process items={project.process.map(t)} /></DetailBlock>
            <DetailBlock title={t("Interface Gallery")}>
              <div className="grid gap-5 md:grid-cols-2">
                {project.gallery.map((image, imageIndex) => <img key={image} src={image} alt={`${project.title} interface ${imageIndex + 1}`} className={imageIndex === 0 ? "md:col-span-2" : ""} loading="lazy" />)}
              </div>
            </DetailBlock>
            <DetailBlock title={t("Responsive Screens")}>
              <IconBlock icon={<Monitor />} text={t("Layouts are structured for desktop dashboards, tablet review, and mobile reading flows without relying on horizontal scrolling.")} />
              {project.mobilePreviewImage && <img src={project.mobilePreviewImage} alt={`${project.title} responsive preview`} className="mt-5 max-h-[560px] w-full border border-[var(--color-border)] object-contain" loading="lazy" />}
            </DetailBlock>
            <DetailBlock title={t("Challenges")}><List items={project.challenges.map(t)} /></DetailBlock>
            <DetailBlock title={t("Technical Decisions")}><List items={project.decisions.map(t)} /></DetailBlock>
            <DetailBlock title={t("Testing")}><p>{t(project.testing)}</p></DetailBlock>
            <DetailBlock title={t("Deployment")}><p>{t(project.deployment)}</p></DetailBlock>
            <DetailBlock title={t("Result")}><p>{t(project.result)}</p></DetailBlock>
          </article>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeading eyebrow={t("Related project")} title={related.title} description={t(related.shortDescription)} />
          <Link to={`/projects/${related.slug}`} className="mt-8 inline-flex items-center gap-2 border-b border-[var(--color-accent-main)] pb-2 text-sm font-bold">{t("Read related case study")} <ArrowRight size={16} /></Link>
          <div className="mt-16 grid gap-4 border-t border-[var(--color-border)] pt-10 md:grid-cols-2">
            <ProjectNav label={t("Previous")} project={{ ...previous, shortDescription: t(previous.shortDescription) }} />
            <ProjectNav label={t("Next")} project={{ ...next, shortDescription: t(next.shortDescription) }} align="right" />
          </div>
        </div>
      </section>
    </main>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return <div><span className="font-mono text-[10px] uppercase tracking-[.16em] text-[var(--color-text-muted)]">{label}</span><p className="mt-2 text-sm font-bold capitalize">{value}</p></div>;
}

function List({ items }: { items: string[] }) {
  return <ul className="grid min-w-0 gap-3 md:grid-cols-2">{items.map((item) => <li key={item} className="min-w-0 break-words border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-4">{item}</li>)}</ul>;
}

function Process({ items }: { items: string[] }) {
  return <div className="grid min-w-0 gap-px border border-[var(--color-border)] bg-[var(--color-border)] sm:grid-cols-2 xl:grid-cols-4">{items.map((item, index) => <div key={item} className="min-w-0 bg-[var(--color-bg-primary)] p-5"><span className="font-mono text-[10px] text-[var(--color-accent-main)]">{String(index + 1).padStart(2, "0")}</span><p className="mt-8 break-words font-semibold text-[var(--color-text-main)]">{item}</p></div>)}</div>;
}

function IconBlock({ icon, text }: { icon: React.ReactNode; text: string }) {
  return <div className="flex min-w-0 gap-4 border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-5 text-[var(--color-text-secondary)]"><span className="shrink-0 text-[var(--color-accent-main)]">{icon}</span><p className="min-w-0 break-words">{text}</p></div>;
}

function ProjectNav({ label, project, align = "left" }: { label: string; project: { slug: string; title: string; shortDescription: string }; align?: "left" | "right" }) {
  return (
    <Link to={`/projects/${project.slug}`} className={`block border border-[var(--color-border)] p-6 hover:border-[var(--color-accent-main)] ${align === "right" ? "md:text-right" : ""}`}>
      <span className="font-mono text-[10px] uppercase tracking-[.16em] text-[var(--color-text-muted)]">{label}</span>
      <h3 className="mt-3 font-manrope text-2xl font-bold">{project.title}</h3>
      <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{project.shortDescription}</p>
    </Link>
  );
}
