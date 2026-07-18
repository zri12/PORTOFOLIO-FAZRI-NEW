import { Link } from "react-router";
import type React from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Award, Briefcase, Code2, MessageSquare, Mail, PenTool, Plus, Users } from "lucide-react";
import { usePortfolioData } from "../../hooks/usePortfolioData";

export default function AdminDashboardPage() {
  const data = usePortfolioData();
  const categoryData = Object.entries(data.projects.reduce<Record<string, number>>((acc, project) => {
    acc[project.category] = (acc[project.category] || 0) + 1;
    return acc;
  }, {})).map(([name, value]) => ({ name, value }));
  const activityData = [
    { name: "Projects", value: data.projects.length },
    { name: "Creative", value: data.creativeWorks.length },
    { name: "Tech", value: data.techStack.length },
    { name: "Certificates", value: data.certificates.length },
    { name: "Comments", value: data.comments.length },
  ];
  const timeline = activityData.map((item, index) => ({ name: item.name, value: item.value + index + 2 }));

  return (
    <div className="mx-auto max-w-7xl animate-in fade-in duration-500">
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-manrope text-3xl font-bold text-[var(--color-text-main)]">Dashboard</h1>
          <p className="mt-2 text-[var(--color-text-secondary)]">Local CMS prototype overview. Changes persist in browser storage.</p>
        </div>
        <Link to="/admin/projects/new" className="inline-flex items-center gap-2 bg-[var(--color-text-main)] px-4 py-2.5 text-sm font-bold text-[var(--color-bg-primary)]"><Plus size={16} /> New Project</Link>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={<Briefcase />} label="Total Projects" value={data.projects.length} />
        <Metric icon={<PenTool />} label="Creative Works" value={data.creativeWorks.length} />
        <Metric icon={<Code2 />} label="Technologies" value={data.techStack.length} />
        <Metric icon={<Award />} label="Certificates" value={data.certificates.length} />
        <Metric icon={<MessageSquare />} label="Visitor Comments" value={data.comments.length} />
        <Metric icon={<Mail />} label="Unread Messages" value={data.messages.filter((item) => item.status === "New").length} />
        <Metric icon={<Users />} label="Published Projects" value={data.projects.filter((item) => item.status === "published").length} />
        <Metric icon={<Briefcase />} label="Draft Projects" value={data.projects.filter((item) => item.status === "draft").length} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel title="Project Categories" className="xl:col-span-1">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={categoryData} dataKey="value" innerRadius={58} outerRadius={92} paddingAngle={4}>
                {categoryData.map((_, index) => <Cell key={index} fill={["#4EBBE8", "#73D5C2", "#CAD4DD", "#E5223D", "#8D1024"][index % 5]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#121C27", border: "1px solid rgba(170,205,225,.16)", color: "#F5F7FA" }} />
            </PieChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="Content Activity" className="xl:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={timeline}>
              <CartesianGrid stroke="rgba(170,205,225,.12)" />
              <XAxis dataKey="name" stroke="#72808E" />
              <YAxis stroke="#72808E" />
              <Tooltip contentStyle={{ background: "#121C27", border: "1px solid rgba(170,205,225,.16)", color: "#F5F7FA" }} />
              <Area dataKey="value" stroke="#4EBBE8" fill="#4EBBE8" fillOpacity={0.22} />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="Content Distribution" className="xl:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={activityData}>
              <CartesianGrid stroke="rgba(170,205,225,.12)" />
              <XAxis dataKey="name" stroke="#72808E" />
              <YAxis stroke="#72808E" />
              <Tooltip contentStyle={{ background: "#121C27", border: "1px solid rgba(170,205,225,.16)", color: "#F5F7FA" }} />
              <Bar dataKey="value" fill="#73D5C2" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="Recent Activity">
          <div className="space-y-4">
            {data.projects.slice(0, 3).map((project) => <Activity key={project.id} title={`Project: ${project.title}`} meta={`${project.status} / ${project.category}`} />)}
            {data.messages.slice(0, 2).map((message) => <Activity key={message.id} title={`Message: ${message.subject}`} meta={`${message.name} / ${message.status}`} />)}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return <div className="border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5"><span className="text-[var(--color-accent-main)]">{icon}</span><p className="mt-5 text-sm text-[var(--color-text-secondary)]">{label}</p><strong className="mt-1 block font-manrope text-3xl">{value}</strong></div>;
}

function Panel({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return <section className={`border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6 ${className}`}><h2 className="mb-6 font-manrope text-xl font-bold">{title}</h2>{children}</section>;
}

function Activity({ title, meta }: { title: string; meta: string }) {
  return <div className="border-l border-[var(--color-accent-main)] pl-4"><p className="text-sm font-bold">{title}</p><p className="mt-1 text-xs text-[var(--color-text-muted)]">{meta}</p></div>;
}
