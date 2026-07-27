import type { ReactNode } from "react";
import { Link } from "react-router";
import type { LucideIcon } from "lucide-react";
import { AlertCircle, ArrowRight, FileText } from "lucide-react";
import type { PublishStatus } from "../../types/portfolio";

export type DashboardMetric = {
  label: string;
  value: number;
  detail: string;
  href: string;
  icon: LucideIcon;
};

export function countStatuses(statuses: PublishStatus[]) {
  return {
    published: statuses.filter((status) => status === "published").length,
    draft: statuses.filter((status) => status === "draft").length,
    archived: statuses.filter((status) => status === "archived").length,
  };
}

export function Metric({ metric }: { metric: DashboardMetric }) {
  const Icon = metric.icon;
  return (
    <Link to={metric.href} className="group border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5 transition-colors hover:border-[var(--color-accent-main)]/60">
      <div className="flex items-start justify-between gap-4">
        <Icon size={20} className="text-[var(--color-accent-main)]" />
        <ArrowRight size={15} className="text-[var(--color-text-muted)] transition-transform group-hover:translate-x-1 group-hover:text-[var(--color-accent-main)]" />
      </div>
      <strong className="mt-6 block font-manrope text-3xl text-[var(--color-text-main)]">{metric.value}</strong>
      <p className="mt-1 text-sm font-bold">{metric.label}</p>
      <p className="mt-2 text-xs text-[var(--color-text-muted)]">{metric.detail}</p>
    </Link>
  );
}

export function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="min-w-0 border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5 sm:p-6">
      <h2 className="font-manrope text-lg font-bold sm:text-xl">{title}</h2>
      <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">{description}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function QuickAction({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <Link to={href} className="group flex min-h-32 flex-col justify-between bg-[var(--color-bg-primary)] p-4 hover:bg-white/[.025]">
      <div className="flex items-start justify-between">
        <Icon size={18} className="text-[var(--color-accent-main)]" />
        <ArrowRight size={15} className="text-[var(--color-text-muted)] transition-transform group-hover:translate-x-1" />
      </div>
      <div>
        <p className="text-sm font-bold">{title}</p>
        <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">{description}</p>
      </div>
    </Link>
  );
}

export function AttentionItem({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link to={href} className="group flex items-center justify-between gap-4 border-b border-[var(--color-border)] pb-3 last:border-b-0 last:pb-0">
      <span className="inline-flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
        <AlertCircle size={16} className={value ? "text-amber-300" : "text-emerald-300"} />
        {label}
      </span>
      <span className="inline-flex items-center gap-2 font-mono text-xs font-bold">
        {value} <ArrowRight size={14} className="text-[var(--color-text-muted)] transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

export function DistributionBars({ items, emptyLabel }: { items: Array<{ name: string; value: number }>; emptyLabel: string }) {
  const maximum = Math.max(0, ...items.map((item) => item.value));
  if (!items.length || maximum === 0) return <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">{emptyLabel}</p>;
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.name}>
          <div className="mb-2 flex items-center justify-between gap-4 text-xs">
            <span className="truncate text-[var(--color-text-secondary)]">{item.name}</span>
            <strong className="font-mono">{item.value}</strong>
          </div>
          <div className="h-1.5 bg-[var(--color-bg-primary)]">
            <div className="h-full bg-[var(--color-accent-main)]" style={{ width: `${Math.max(4, (item.value / maximum) * 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatusSummary({ label, statuses }: { label: string; statuses: ReturnType<typeof countStatuses> }) {
  const total = statuses.published + statuses.draft + statuses.archived;
  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold">{label}</h3>
        <span className="font-mono text-xs text-[var(--color-text-muted)]">{total} total</span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <SmallStat label="Published" value={statuses.published} />
        <SmallStat label="Draft" value={statuses.draft} />
        <SmallStat label="Archived" value={statuses.archived} />
      </div>
    </div>
  );
}

export function SmallStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-3">
      <strong className="font-manrope text-xl">{value}</strong>
      <p className="mt-1 text-[10px] leading-4 text-[var(--color-text-muted)]">{label}</p>
    </div>
  );
}

export function EmptyDashboardState() {
  return (
    <div className="border border-dashed border-[var(--color-border)] px-5 py-10 text-center">
      <FileText className="mx-auto text-[var(--color-text-muted)]" size={24} />
      <p className="mt-4 font-bold">No content activity yet</p>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">Create a project or article to populate this dashboard.</p>
    </div>
  );
}
