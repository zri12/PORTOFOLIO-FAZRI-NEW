import { BarChart3, Bell, CalendarDays, CheckCircle2, ChevronDown, Circle, FlaskConical, LayoutDashboard, Search, Users } from "lucide-react";
import { usePortfolioData } from "../../hooks/usePortfolioData";

type ProjectPreviewProps = { slug: string; compact?: boolean; className?: string };

const palette = {
  sinden: "from-cyan-400/20 via-slate-950 to-blue-500/10",
  "so-harmony": "from-amber-300/20 via-slate-950 to-orange-500/10",
  "sumut-cluster": "from-emerald-300/20 via-slate-950 to-teal-500/10",
  "sm-v-lab-ipa": "from-violet-300/20 via-slate-950 to-indigo-500/10",
  "marketing-crm": "from-rose-300/20 via-slate-950 to-pink-500/10",
  "sistem-cuti-skm": "from-sky-300/20 via-slate-950 to-cyan-500/10",
};

function Bars({ values = [38, 68, 52, 84, 66, 94] }: { values?: number[] }) {
  return <div className="flex h-16 items-end gap-1.5">{values.map((value, index) => <span key={index} className="project-preview-bar flex-1 rounded-t-sm bg-[var(--color-accent-main)]/75" style={{ height: `${value}%`, animationDelay: `${index * 95}ms` }} />)}</div>;
}

export function ProjectPreview({ slug, compact = false, className = "" }: ProjectPreviewProps) {
  const { projects } = usePortfolioData();
  const project = projects.find((entry) => entry.slug === slug) ?? projects[0];
  const pad = compact ? "p-3" : "p-4 sm:p-5";
  const text = compact ? "text-[7px]" : "text-[9px]";

  if (!project) return null;

  if (project.coverImage) {
    return (
      <div className={`project-preview relative h-full overflow-hidden rounded-[1.25rem] border border-white/10 bg-slate-950 shadow-2xl ${className}`}>
        <img src={project.coverImage} alt={`${project.title} preview`} className="h-full w-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_0%,rgba(255,255,255,.08)_48%,transparent_50%)]" />
      </div>
    );
  }

  return (
    <div className={`project-preview relative h-full overflow-hidden rounded-[1.25rem] border border-white/10 bg-gradient-to-br ${palette[project.slug as keyof typeof palette] ?? "from-cyan-400/20 via-slate-950 to-slate-500/10"} shadow-2xl ${className}`}>
      <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_0%,rgba(255,255,255,.05)_48%,transparent_50%)]" />
      <div className={`relative flex h-full min-h-[210px] flex-col ${pad}`}>
        <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-rose-400" /><span className="h-1.5 w-1.5 rounded-full bg-amber-300" /><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /></div>
          <span className={`${text} font-mono tracking-wide text-white/45`}>{project.title.toLowerCase()}.app</span>
          <Bell size={compact ? 9 : 12} className="text-white/45" />
        </div>
        {slug === "sinden" && <div className="grid flex-1 grid-cols-[22%_1fr] gap-2.5"><aside className="rounded-lg bg-white/[.06] p-2"><LayoutDashboard size={compact ? 11 : 14} className="mb-3 text-cyan-200" />{[1, 2, 3, 4].map((item) => <span key={item} className="mb-2 block h-1.5 rounded-full bg-white/10" />)}</aside><div className="space-y-2.5"><div className="grid grid-cols-3 gap-2">{["Students", "Tasks", "Attendance"].map((label, index) => <div key={label} className="rounded-md bg-white/[.08] p-2"><span className={`${text} text-white/45`}>{label}</span><strong className="block text-sm text-white">{[248, 43, 96][index]}<small className="text-[7px] font-normal text-emerald-300"> +8%</small></strong></div>)}</div><div className="grid grid-cols-[1.4fr_.9fr] gap-2"><div className="rounded-md bg-white/[.07] p-2"><span className={`${text} text-white/45`}>Grade performance</span><Bars /></div><div className="rounded-md bg-white/[.07] p-2"><span className={`${text} text-white/45`}>Progress</span>{[70, 45, 85].map((width, index) => <div key={index} className="mt-2 h-1.5 rounded-full bg-white/10"><span className="block h-full rounded-full bg-cyan-300" style={{ width: `${width}%` }} /></div>)}</div></div></div></div>}
        {slug === "so-harmony" && <div className="grid flex-1 grid-cols-[1.2fr_.8fr] gap-2.5"><div className="space-y-2.5"><div className="grid grid-cols-3 gap-2">{["A-02", "B-11", "C-03"].map((room, index) => <div key={room} className="rounded-md border border-white/10 bg-white/[.07] p-2"><span className="block text-[7px] text-white/45">ROOM</span><b className="text-xs text-white">{room}</b><span className={`mt-1 block h-1 rounded-full ${index === 1 ? "bg-amber-300" : "bg-emerald-300"}`} /></div>)}</div><div className="rounded-md bg-white/[.07] p-2"><span className={`${text} text-white/45`}>Occupancy overview</span><Bars values={[45, 62, 82, 56, 92, 74]} /></div></div><div className="rounded-md bg-white/[.07] p-2"><span className={`${text} text-white/45`}>Today</span>{["Inspection", "Complaint", "Checkout"].map((label, index) => <div key={label} className="mt-2 flex items-center gap-1.5 text-[8px] text-white/70"><CheckCircle2 size={9} className={index === 1 ? "text-amber-300" : "text-emerald-300"} />{label}</div>)}</div></div>}
        {slug === "sumut-cluster" && <div className="grid flex-1 grid-cols-[1fr_.75fr] gap-2.5"><div className="relative overflow-hidden rounded-md bg-emerald-300/[.08] p-2"><div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(116,255,211,.35)_1px,transparent_1px),linear-gradient(90deg,rgba(116,255,211,.35)_1px,transparent_1px)] [background-size:18px_18px]" />{[[22, 26], [55, 34], [68, 65], [36, 72], [72, 18]].map(([left, top], index) => <span key={index} className="absolute h-2.5 w-2.5 rounded-full border border-emerald-100 bg-emerald-300 shadow-[0_0_15px_rgba(110,255,205,.8)]" style={{ left: `${left}%`, top: `${top}%` }} />)}<span className="absolute bottom-2 left-2 text-[7px] text-emerald-100/70">North Sumatra · 21 destinations</span></div><div className="space-y-2"><div className="rounded-md bg-white/[.08] p-2"><Search size={10} className="inline text-emerald-200" /><span className="ml-1 text-[7px] text-white/45">Find a destination</span></div><div className="rounded-md bg-white/[.08] p-2"><span className={`${text} text-white/45`}>Top recommendation</span><b className="mt-1 block text-[10px] text-white">Lake Toba</b><span className="text-[7px] text-emerald-200">High potential</span></div><div className="rounded-md bg-white/[.08] p-2"><Bars values={[26, 59, 83, 47]} /></div></div></div>}
        {slug === "sm-v-lab-ipa" && <div className="grid flex-1 grid-cols-[24%_1fr] gap-2.5"><aside className="rounded-md bg-white/[.07] p-2"><FlaskConical size={compact ? 10 : 14} className="mb-3 text-violet-200" />{["Atoms", "Motion", "Energy", "Quiz"].map((item, index) => <span className={`mb-2 block text-[7px] ${index === 1 ? "text-violet-200" : "text-white/40"}`} key={item}>{item}</span>)}</aside><div className="space-y-2"><div className="relative h-[58%] overflow-hidden rounded-md bg-violet-300/[.08] p-3"><div className="absolute left-[44%] top-[15%] h-8 w-8 rounded-full border-2 border-violet-200/80" /><div className="absolute left-[33%] top-[35%] h-14 w-14 rounded-full border border-violet-200/40" /><div className="absolute left-[52%] top-[42%] h-2 w-2 rounded-full bg-violet-200 shadow-[0_0_12px_#d8b4fe]" /><span className="absolute bottom-2 left-2 text-[8px] text-violet-100">Interactive module · Matter</span></div><div className="grid grid-cols-2 gap-2"><div className="rounded-md bg-white/[.08] p-2 text-[7px] text-white/50">Lesson progress <b className="float-right text-violet-200">68%</b></div><div className="rounded-md bg-white/[.08] p-2 text-[7px] text-white/50">Quiz score <b className="float-right text-violet-200">9.2</b></div></div></div></div>}
        {slug === "marketing-crm" && <div className="grid flex-1 grid-cols-[1.1fr_.9fr] gap-2.5"><div className="space-y-2"><div className="rounded-md bg-white/[.07] p-2"><span className={`${text} text-white/45`}>Revenue pipeline</span><Bars values={[36, 42, 68, 57, 92, 76]} /></div><div className="grid grid-cols-3 gap-1.5">{["New", "Warm", "Won"].map((label, index) => <div key={label} className="rounded bg-white/[.08] p-1.5 text-center"><span className="text-[7px] text-white/45">{label}</span><b className="block text-[10px] text-white">{[28, 14, 8][index]}</b></div>)}</div></div><div className="rounded-md bg-white/[.07] p-2"><span className={`${text} text-white/45`}>Follow ups</span>{["Dewi — proposal", "Bima — call", "Nadia — demo"].map((item) => <div key={item} className="mt-2 border-b border-white/10 pb-1.5 text-[7px] text-white/65">{item}<Circle size={5} className="float-right mt-0.5 fill-rose-300 text-rose-300" /></div>)}</div></div>}
        {slug === "sistem-cuti-skm" && <div className="grid flex-1 grid-cols-[1.1fr_.9fr] gap-2.5"><div className="rounded-md bg-white/[.07] p-2"><div className="mb-2 flex items-center justify-between"><span className={`${text} text-white/45`}>June 2024</span><CalendarDays size={10} className="text-sky-200" /></div><div className="grid grid-cols-7 gap-1">{Array.from({ length: 28 }).map((_, index) => <span key={index} className={`aspect-square rounded-sm ${[4, 10, 11, 17, 23].includes(index) ? "bg-sky-300" : index % 7 === 0 ? "bg-white/15" : "bg-white/[.06]"}`} />)}</div></div><div className="space-y-2"><div className="rounded-md bg-white/[.07] p-2"><span className={`${text} text-white/45`}>Leave balance</span><b className="block text-lg text-white">8 <small className="text-[7px] font-normal text-white/45">days left</small></b></div><div className="rounded-md bg-white/[.07] p-2"><span className={`${text} text-white/45`}>Request status</span><div className="mt-2 h-1.5 rounded-full bg-white/10"><span className="block h-full w-3/4 rounded-full bg-sky-300" /></div></div></div></div>}
      </div>
    </div>
  );
}
