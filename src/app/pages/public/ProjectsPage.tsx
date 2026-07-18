import { useMemo, useState } from "react";
import { Link } from "react-router";
import { ArrowRight, Filter, Search, X } from "lucide-react";
import { EmptyState } from "../../components/common/EmptyState";
import { SectionHeading } from "../../components/common/SectionHeading";
import { ProjectPreview } from "../../components/portfolio/ProjectPreview";
import { useDocumentMeta } from "../../hooks/useDocumentMeta";
import { usePortfolioData } from "../../hooks/usePortfolioData";

const categories = ["All Work", "Web Application", "Education", "Dashboard", "Data Mining", "CRM", "Company Profile", "Client Work", "Personal Project", "Academic Project"];

export default function ProjectsPage() {
  const { projects, techStack } = usePortfolioData();
  const [activeCategory, setActiveCategory] = useState("All Work");
  const [query, setQuery] = useState("");
  const [tech, setTech] = useState("All Tech");

  useDocumentMeta({
    title: "Projects - Fazri Lukman Nurrohman",
    description: "Explore web application, dashboard, data mining, CRM, and education projects by Fazri Lukman Nurrohman.",
  });

  const techOptions = useMemo(() => ["All Tech", ...Array.from(new Set(projects.flatMap((project) => project.techStack)))], [projects]);

  const filteredProjects = projects.filter((project) => {
    const categoryMatch = activeCategory === "All Work" || project.category.includes(activeCategory) || project.type.includes(activeCategory) || project.clientType === activeCategory;
    const techMatch = tech === "All Tech" || project.techStack.includes(tech);
    const text = `${project.title} ${project.fullName} ${project.shortDescription} ${project.techStack.join(" ")}`.toLowerCase();
    return categoryMatch && techMatch && text.includes(query.toLowerCase());
  });

  return (
    <main className="min-h-screen bg-[var(--color-bg-primary)] pt-32 text-[var(--color-text-main)]">
      <section className="px-6 pb-12">
        <div className="mx-auto max-w-7xl">
          <SectionHeading eyebrow="Project archive" title="Web systems, dashboards, and product interfaces." description="Filter by category or technology to inspect the work from several angles. Each project opens into a dedicated case study page." />
        </div>
      </section>

      <section className="sticky top-20 z-30 border-y border-[var(--color-border)] bg-[var(--color-bg-primary)]/92 px-6 py-4 backdrop-blur">
        <div className="mx-auto grid max-w-7xl gap-4 xl:grid-cols-[minmax(0,1fr)_520px] xl:items-start">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button key={category} onClick={() => setActiveCategory(category)} className={`min-h-11 border px-4 py-2 text-sm font-semibold transition ${activeCategory === category ? "border-[var(--color-text-main)] bg-[var(--color-text-main)] text-[var(--color-bg-primary)]" : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent-main)]/50 hover:text-[var(--color-text-main)]"}`}>
                {category}
              </button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-[minmax(180px,1fr)_180px_auto] xl:w-full">
            <label className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={17} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects..." className="min-h-11 w-full border border-[var(--color-border)] bg-[var(--color-surface-elevated)] py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[var(--color-accent-main)]" />
            </label>
            <select value={tech} onChange={(event) => setTech(event.target.value)} className="min-h-11 border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-accent-main)]">
              {techOptions.map((option) => <option key={option}>{option}</option>)}
            </select>
            <button onClick={() => { setActiveCategory("All Work"); setQuery(""); setTech("All Tech"); }} className="inline-flex min-h-11 items-center justify-center gap-2 border border-[var(--color-border)] px-3 py-2.5 text-sm font-semibold text-[var(--color-text-secondary)] hover:border-[var(--color-accent-main)]/50 hover:text-[var(--color-text-main)]">
              {query || activeCategory !== "All Work" || tech !== "All Tech" ? <X size={16} /> : <Filter size={16} />} Clear
            </button>
          </div>
        </div>
      </section>

      <section className="px-6 py-14">
        <div className="mx-auto max-w-7xl">
          {filteredProjects.length === 0 ? (
            <EmptyState title="No projects match the current filters" description="Try clearing the filters or searching by project title, category, or technology." />
          ) : (
            <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
              {filteredProjects.map((project) => (
                <Link key={project.id} to={`/projects/${project.slug}`} className="group flex min-h-[540px] flex-col overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface-elevated)] transition hover:-translate-y-1 hover:border-[var(--color-accent-main)]/60">
                  <div className="relative aspect-[4/3] border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-3">
                    <ProjectPreview slug={project.slug} compact />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <p className="font-mono text-[10px] uppercase tracking-[.16em] text-[var(--color-accent-main)]">{project.category} / {project.clientType}</p>
                    <h3 className="mt-4 font-manrope text-2xl font-bold">{project.title}</h3>
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--color-text-secondary)]">{project.shortDescription}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {project.techStack.slice(0, 4).map((item) => <span key={item} className="border border-[var(--color-border)] px-2 py-1 font-mono text-[9px] text-[var(--color-text-muted)]">{item}</span>)}
                    </div>
                    <span className="mt-auto inline-flex items-center gap-2 pt-8 text-sm font-bold text-[var(--color-text-main)] group-hover:text-[var(--color-accent-main)]">Open case study <ArrowRight size={16} /></span>
                  </div>
                </Link>
              ))}
            </div>
          )}
          <div className="mt-16 border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-8">
            <h2 className="font-manrope text-2xl font-bold">Need a similar web system?</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">The project data is managed from the local admin prototype, so this archive is ready to connect to a real backend later.</p>
            <Link to="/contact" className="mt-6 inline-flex items-center gap-2 bg-[var(--color-text-main)] px-5 py-3 text-sm font-bold text-[var(--color-bg-primary)]">Discuss a project <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
