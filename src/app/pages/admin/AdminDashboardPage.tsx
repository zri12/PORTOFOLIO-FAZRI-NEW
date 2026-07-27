import { useMemo, useState } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  Award,
  Briefcase,
  Code2,
  ExternalLink,
  FileText,
  Image,
  Mail,
  MessageSquare,
  PenTool,
  Plus,
  RefreshCw,
} from "lucide-react";
import {
  AttentionItem,
  countStatuses,
  DistributionBars,
  EmptyDashboardState,
  Metric,
  Panel,
  QuickAction,
  SmallStat,
  StatusSummary,
  type DashboardMetric,
} from "../../components/admin/AdminDashboardWidgets";
import { usePortfolioData } from "../../hooks/usePortfolioData";
import { formatAdminSaveError } from "../../lib/supabase/errorMessages";
import { portfolioRepository } from "../../repositories/portfolioRepository";

type RecentContentItem = {
  id: string;
  type: "Project" | "Article" | "Message";
  title: string;
  meta: string;
  href: string;
  status: string;
  sortValue: string;
};

export default function AdminDashboardPage() {
  const data = usePortfolioData();
  const [refreshing, setRefreshing] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const projectStatus = countStatuses(data.projects.map((project) => project.status));
  const articleStatus = countStatuses(data.articles.map((article) => article.status));
  const publishedCreative = data.creativeWorks.filter((work) => work.status === "published").length;
  const publishedCertificates = data.certificates.filter((certificate) => certificate.published).length;
  const pendingComments = data.comments.filter((comment) => comment.status === "pending").length;
  const unreadMessages = data.messages.filter((message) => message.status === "New").length;
  const articleBlocks = data.articles.reduce((total, article) => total + article.blocks.length, 0);

  const metrics: DashboardMetric[] = [
    {
      label: "Web Projects",
      value: data.projects.length,
      detail: `${projectStatus.published} published · ${projectStatus.draft} draft`,
      href: "/admin/projects",
      icon: Briefcase,
    },
    {
      label: "Articles",
      value: data.articles.length,
      detail: `${articleStatus.published} published · ${articleBlocks} blocks`,
      href: "/admin/articles",
      icon: FileText,
    },
    {
      label: "Creative Works",
      value: data.creativeWorks.length,
      detail: `${publishedCreative} published`,
      href: "/admin/creative-works",
      icon: PenTool,
    },
    {
      label: "Technologies",
      value: data.techStack.length,
      detail: `${data.techStack.filter((technology) => technology.active).length} active`,
      href: "/admin/tech-stack",
      icon: Code2,
    },
    {
      label: "Certificates",
      value: data.certificates.length,
      detail: `${publishedCertificates} visible`,
      href: "/admin/certificates",
      icon: Award,
    },
    {
      label: "Comments",
      value: data.comments.length,
      detail: pendingComments ? `${pendingComments} waiting for review` : "Nothing pending",
      href: "/admin/comments",
      icon: MessageSquare,
    },
    {
      label: "Messages",
      value: data.messages.length,
      detail: unreadMessages ? `${unreadMessages} unread` : "Inbox is clear",
      href: "/admin/messages",
      icon: Mail,
    },
    {
      label: "Media Assets",
      value: data.media.length,
      detail: data.media.length ? "Available in library" : "Library is empty",
      href: "/admin/media",
      icon: Image,
    },
  ];

  const categoryData = useMemo(() => {
    const counts = data.projects.reduce<Record<string, number>>((result, project) => {
      const category = project.category.trim() || "Uncategorized";
      result[category] = (result[category] || 0) + 1;
      return result;
    }, {});
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name));
  }, [data.projects]);

  const contentDistribution = [
    { name: "Projects", value: data.projects.length },
    { name: "Articles", value: data.articles.length },
    { name: "Creative", value: data.creativeWorks.length },
    { name: "Tech", value: data.techStack.length },
    { name: "Certificates", value: data.certificates.length },
  ];

  const recentItems = useMemo<RecentContentItem[]>(() => {
    const projects: RecentContentItem[] = data.projects.map((project) => ({
      id: project.id,
      type: "Project",
      title: project.title || "Untitled project",
      meta: project.category || "Uncategorized",
      href: `/admin/projects/${project.id}/edit`,
      status: project.status,
      sortValue: String(10_000 - project.displayOrder).padStart(5, "0"),
    }));
    const articles: RecentContentItem[] = data.articles.map((article) => ({
      id: article.id,
      type: "Article",
      title: article.title || "Untitled article",
      meta: article.category || "Uncategorized",
      href: `/admin/articles/${article.id}/edit`,
      status: article.status,
      sortValue: article.updatedAt || article.publishedAt || "",
    }));
    const messages: RecentContentItem[] = data.messages.map((message) => ({
      id: message.id,
      type: "Message",
      title: message.subject || "Message without subject",
      meta: message.name,
      href: "/admin/messages",
      status: message.status,
      sortValue: message.date,
    }));
    return [...projects, ...articles, ...messages]
      .sort((a, b) => b.sortValue.localeCompare(a.sortValue))
      .slice(0, 7);
  }, [data.articles, data.messages, data.projects]);

  const refresh = async () => {
    setRefreshing(true);
    setFeedback("");
    setError("");
    try {
      await portfolioRepository.refresh();
      setFeedback(`Dashboard updated at ${new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit" }).format(new Date())}.`);
    } catch (refreshError) {
      setError(formatAdminSaveError(refreshError, "Dashboard data could not be refreshed."));
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl animate-in fade-in duration-500">
      <header className="mb-8 border-b border-[var(--color-border)] pb-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[.18em] text-[var(--color-accent-main)]">CMS overview</p>
            <h1 className="mt-3 font-manrope text-3xl font-bold tracking-[-.02em] text-[var(--color-text-main)] sm:text-4xl">Content operations</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
              Live totals, publication status, moderation queues, and direct shortcuts from the shared portfolio repository.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void refresh()}
              disabled={refreshing}
              className="inline-flex min-h-11 items-center gap-2 border border-[var(--color-border)] px-4 py-2.5 text-sm font-bold disabled:opacity-50"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Refreshing..." : "Refresh data"}
            </button>
            <Link to="/admin/projects/new" className="inline-flex min-h-11 items-center gap-2 bg-[var(--color-text-main)] px-4 py-2.5 text-sm font-bold text-[var(--color-bg-primary)]">
              <Plus size={16} /> New Project
            </Link>
          </div>
        </div>
        {feedback && <p className="mt-4 text-xs text-emerald-300" role="status">{feedback}</p>}
        {error && <p className="mt-4 border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-300" role="alert">{error}</p>}
      </header>

      <section aria-labelledby="dashboard-metrics">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 id="dashboard-metrics" className="font-manrope text-xl font-bold">Portfolio totals</h2>
          <span className="font-mono text-[10px] uppercase tracking-[.14em] text-[var(--color-text-muted)]">Live repository data</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => <Metric key={metric.label} metric={metric} />)}
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <Panel title="Quick actions" description="Open the most common CMS workflows.">
          <div className="grid gap-px border border-[var(--color-border)] bg-[var(--color-border)] sm:grid-cols-2">
            <QuickAction href="/admin/projects/new" icon={Briefcase} title="Add web project" description="Create a localized project case study." />
            <QuickAction href="/admin/articles/new" icon={FileText} title="Write article" description="Create Markdown content with images." />
            <QuickAction href="/admin/creative-works/new" icon={PenTool} title="Add creative work" description="Publish design, photo, or video work." />
            <QuickAction href="/admin/media" icon={Image} title="Open media library" description="Review uploaded portfolio assets." />
          </div>
        </Panel>

        <Panel title="Needs attention" description="Items that may require an admin decision.">
          <div className="space-y-3">
            <AttentionItem label="Draft projects" value={projectStatus.draft} href="/admin/projects" />
            <AttentionItem label="Draft articles" value={articleStatus.draft} href="/admin/articles" />
            <AttentionItem label="Pending comments" value={pendingComments} href="/admin/comments" />
            <AttentionItem label="Unread messages" value={unreadMessages} href="/admin/messages" />
          </div>
        </Panel>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-3">
        <Panel title="Project categories" description="Actual project distribution by category.">
          <DistributionBars items={categoryData} emptyLabel="No project categories yet." />
        </Panel>
        <Panel title="Content distribution" description="Relative size of each content collection.">
          <DistributionBars items={contentDistribution} emptyLabel="No content records yet." />
        </Panel>
        <Panel title="Publication summary" description="Published, draft, and archived records.">
          <div className="space-y-5">
            <StatusSummary label="Projects" statuses={projectStatus} />
            <StatusSummary label="Articles" statuses={articleStatus} />
            <div className="grid grid-cols-2 gap-3 border-t border-[var(--color-border)] pt-5">
              <SmallStat label="Creative published" value={publishedCreative} />
              <SmallStat label="Certificates visible" value={publishedCertificates} />
            </div>
          </div>
        </Panel>
      </section>

      <section className="mt-6">
        <Panel title="Recent content" description="Open a record directly to continue editing or moderation.">
          {recentItems.length ? (
            <div className="divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
              {recentItems.map((item) => (
                <Link
                  key={`${item.type}-${item.id}`}
                  to={item.href}
                  className="group grid gap-3 py-4 sm:grid-cols-[7rem_minmax(0,1fr)_auto] sm:items-center"
                >
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[.14em] text-[var(--color-accent-main)]">{item.type}</span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[var(--color-text-main)]">{item.title}</p>
                    <p className="mt-1 truncate text-xs text-[var(--color-text-muted)]">{item.meta}</p>
                  </div>
                  <span className="inline-flex items-center gap-3 text-xs font-semibold capitalize text-[var(--color-text-secondary)]">
                    {item.status} <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyDashboardState />
          )}
        </Panel>
      </section>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4 text-sm">
        <div>
          <p className="font-bold">Public portfolio preview</p>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">Open the public site in a new tab without leaving the CMS.</p>
        </div>
        <a href="/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border-b border-[var(--color-accent-main)] pb-1 font-bold">
          Preview site <ExternalLink size={15} />
        </a>
      </div>
    </div>
  );
}
