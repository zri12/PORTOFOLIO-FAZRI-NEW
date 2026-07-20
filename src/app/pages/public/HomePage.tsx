import { motion, useReducedMotion } from "motion/react";
import { Link } from "react-router";
import { ArrowRight, Award, BriefcaseBusiness, Camera, Check, ChevronRight, Code2, Download, Github, Instagram, Linkedin, Mail, MapPin, MessageCircle, Monitor, MousePointer2, Palette, Send, Sparkles, Wrench } from "lucide-react";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { ThemeModeContext } from "../../context/ThemeModeContext";
import { ProjectPreview } from "../../components/portfolio/ProjectPreview";
import { SpiderWebField } from "../../components/portfolio/SpiderWebField";
import { DualCharacterReveal } from "../../components/portfolio/DualCharacterReveal";
import { CardStack } from "../../components/portfolio/CardStack";
import { SpiderWebArchitecture3D } from "../../components/portfolio/SpiderWebArchitecture3D";
import { usePortfolioData } from "../../hooks/usePortfolioData";
import { useDocumentMeta } from "../../hooks/useDocumentMeta";
import portrait from "../../../imports/fazri.png";
import professionalCharacter from "../../../imports/character-professional.png";
import spiderCharacter from "../../../imports/character-spider.png";

const creativeImages = [
  "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?auto=format&fit=crop&w=1300&q=90",
  "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1300&q=90",
  "https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&w=1300&q=90",
  "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1300&q=90",
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1300&q=90",
];

const techGroups = {
  Frontend: ["HTML5", "CSS3", "JavaScript", "TypeScript", "React", "Vite", "Next.js", "Tailwind"],
  Backend: ["Laravel", "PHP", "Node.js", "MySQL", "PostgreSQL", "Supabase", "Firebase"],
  Creative: ["Figma", "Photoshop", "Illustrator", "Premiere", "Blender", "Lightroom"],
};

function Eyebrow({ children }: { children: React.ReactNode }) { return <p className="mb-4 font-mono text-[10px] font-medium uppercase tracking-[.22em] text-[var(--color-accent-main)]">{children}</p>; }
function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) { const reduce = useReducedMotion(); return <motion.div initial={reduce ? false : { opacity: 0, y: 30 }} whileInView={reduce ? {} : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.18 }} transition={{ duration: .7, ease: [0.22, 1, .36, 1] }} className={className}>{children}</motion.div>; }

export default function HomePage() {
  const { mode, toggleMode } = useContext(ThemeModeContext);
  const { projects: projectsData, profile, techStack, creativeWorks, certificates, experiences, comments } = usePortfolioData();
  const aboutImage = profile.aboutImageUrl || portrait;
  const [techTab, setTechTab] = useState<keyof typeof techGroups>("Frontend");
  const groupedTech = useMemo(() => ({
    Frontend: techStack.filter((tech) => tech.active && tech.category === "Frontend"),
    Backend: techStack.filter((tech) => tech.active && ["Backend", "Database", "Deployment"].includes(tech.category)),
    Creative: techStack.filter((tech) => tech.active && tech.category === "Creative"),
  }), [techStack]);
  const activeTechItems = groupedTech[techTab].length ? groupedTech[techTab] : techGroups[techTab].map((name, index) => ({
    id: `${techTab}-${name}`,
    name,
    logoUrl: "",
    level: index < 3 ? "Main Stack" : index < 6 ? "Frequently Used" : "Familiar",
  }));
  const [sent, setSent] = useState(false);
  const [heroImageHover, setHeroImageHover] = useState(false);
  const [spiderSceneReady, setSpiderSceneReady] = useState(false);
  const reduce = useReducedMotion();
  useDocumentMeta({ title: `${profile.fullName} - ${profile.title}`, description: profile.headline });
  const heroCharRef = useRef<HTMLDivElement>(null);
  const heroDashRef = useRef<HTMLDivElement>(null);
  const heroModeCardRef = useRef<HTMLDivElement>(null);
  const heroImageRef = useRef<HTMLDivElement>(null);
  const heroBaseImageRef = useRef<HTMLImageElement>(null);
  const heroRevealImageRef = useRef<HTMLImageElement>(null);
  const homeCertificates = certificates
    .filter((certificate) => certificate.published)
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

  const updateHeroReveal = (event: React.PointerEvent<HTMLDivElement>) => {
    const stage = heroImageRef.current;
    const image = heroBaseImageRef.current;
    const revealImage = heroRevealImageRef.current;
    if (!stage || !image) return;
    const stageRect = stage.getBoundingClientRect();
    const imageRect = image.getBoundingClientRect();
    const revealRect = (revealImage ?? image).getBoundingClientRect();
    const visibleLeft = imageRect.left + imageRect.width * 0.16;
    const visibleRight = imageRect.right - imageRect.width * 0.16;
    const visibleTop = imageRect.top + imageRect.height * 0.05;
    const visibleBottom = imageRect.bottom;
    const isInsideImage =
      event.clientX >= visibleLeft &&
      event.clientX <= visibleRight &&
      event.clientY >= visibleTop &&
      event.clientY <= visibleBottom;

    setHeroImageHover(isInsideImage);
    stage.style.setProperty("--hero-reveal-x", `${event.clientX - stageRect.left}px`);
    stage.style.setProperty("--hero-reveal-y", `${event.clientY - stageRect.top}px`);
    stage.style.setProperty("--hero-base-reveal-x", `${event.clientX - imageRect.left}px`);
    stage.style.setProperty("--hero-base-reveal-y", `${event.clientY - imageRect.top}px`);
    stage.style.setProperty("--hero-swap-reveal-x", `${event.clientX - revealRect.left}px`);
    stage.style.setProperty("--hero-swap-reveal-y", `${event.clientY - revealRect.top}px`);
  };
  const isSpiderMode = mode === "spider";
  useEffect(() => {
    if (!isSpiderMode) {
      setSpiderSceneReady(false);
      return;
    }

    const delay = reduce ? 0 : 1400;
    const timer = window.setTimeout(() => setSpiderSceneReady(true), delay);
    return () => window.clearTimeout(timer);
  }, [isSpiderMode, reduce]);

  const heroBaseImage = isSpiderMode ? spiderCharacter : professionalCharacter;
  const heroRevealImage = isSpiderMode ? professionalCharacter : spiderCharacter;
  const heroBaseAlt = isSpiderMode ? "Fazri Lukman Nurrohman in spider mode" : "Fazri Lukman Nurrohman in professional mode";
  const heroRevealAlt = isSpiderMode ? "Professional portrait revealed by cursor" : "Spider portrait revealed by cursor";
  const creativeStackItems = creativeImages.map((image, index) => ({
    id: image,
    imageSrc: image,
    href: "/creative-works",
    tag: ["Interface", "Motion", "Visual", "Studio", "Production"][index] ?? "Creative Work",
    title: ["Elegant Design", "Luxury Performance", "Creative Systems", "Visual Direction", "Editor Workflow"][index] ?? "Creative exploration",
    description: ["Where beauty meets functionality", "Experience the thrill of precision energy", "Designed to move ideas forward", "A refined visual language for every frame", "Creative tools shaped for production"][index] ?? "Creative direction and production",
  }));

  return (
    <main className={`portfolio-canvas overflow-x-clip bg-[var(--color-bg-primary)] text-[var(--color-text-main)] ${mode === "spider" ? "spider-mode-active" : ""}`}>
    <section className="hero-section-shell relative isolate min-h-[100svh] overflow-hidden border-b border-[var(--color-border)] lg:h-[100svh] lg:min-h-[720px]">
      <div className="hero-atmosphere pointer-events-none absolute inset-0" />
      {isSpiderMode && spiderSceneReady && <SpiderWebArchitecture3D className="absolute inset-0 z-[3]" />}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-1/3 bg-gradient-to-t from-[var(--color-bg-primary)] to-transparent" />
      <div className="hero-layout relative z-10 flex min-h-[100svh] items-center overflow-hidden px-5 pb-0 pt-24 sm:px-6 sm:pt-28 lg:h-full lg:min-h-0 lg:pb-12 lg:pt-24">

        {/* Decorative WebGL interface architecture. It stays behind the portrait
            and uses a soft mask so the canvas never reads as a cropped box. */}
        <div className="hero-main-grid relative z-10 mx-auto grid w-full max-w-7xl items-center gap-6 sm:gap-8 lg:grid-cols-[.93fr_1.07fr] lg:gap-12">
          <motion.div initial={reduce ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8 }} className="hero-copy relative z-20 max-w-2xl">
            <div className="mb-7 flex items-center gap-3"><span className="h-2 w-2 rounded-full bg-[var(--color-accent-secondary)] shadow-[0_0_18px_var(--color-accent-secondary)]" /><span className="font-mono text-[10px] uppercase tracking-[.18em] text-[var(--color-text-secondary)]">Hello, I'm Fazri.</span></div>
            <p className="mb-3 font-manrope text-base font-semibold text-[var(--color-text-secondary)]">Fazri Lukman Nurrohman</p>
            <h1 className="max-w-xl font-manrope text-[2.55rem] font-extrabold leading-[.98] tracking-[-.035em] sm:text-5xl md:text-6xl xl:text-7xl">Creative Web <span className="text-[var(--color-accent-main)]">Developer</span></h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-[var(--color-text-secondary)] sm:mt-7 sm:text-lg sm:leading-8">I create modern web applications and interactive experiences that combine reliable functionality with thoughtful visual design.</p>
            <p className="mt-3 max-w-lg text-sm leading-6 text-[var(--color-text-muted)]">Web development is my main focus, supported by UI design, photography, videography, and visual editing.</p>
            <div className="hero-mobile-portrait relative -mx-1 mt-3 h-[320px] overflow-hidden md:hidden">
              <DualCharacterReveal />
            </div>
            <div className="hero-actions mt-7 flex flex-wrap gap-3 sm:mt-8">
              <Link to="/projects" className={`inline-flex items-center gap-2 px-5 py-3 text-sm font-bold transition-transform hover:-translate-y-0.5 ${mode === 'spider' ? 'bg-[var(--color-primary)] text-white hover:shadow-[0_0_15px_rgba(227,33,60,0.4)] border border-red-500/50' : 'rounded-lg bg-[var(--color-text-main)] text-[var(--color-bg-primary)]'}`}>Explore Projects <ArrowRight size={16} /></Link>
              <Link to="/contact" className={`inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold hover:bg-white/5 ${mode === 'spider' ? 'border border-[var(--color-border)] text-white' : 'rounded-lg border border-[var(--color-border)]'}`}>Contact Me</Link>
              <a href="#about" className="inline-flex items-center gap-2 px-3 py-3 text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-accent-main)]"><Download size={15} /> Download CV</a>
            </div>
            <div className="hero-meta mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[var(--color-text-muted)] sm:mt-10"><span className="inline-flex items-center gap-1.5"><MapPin size={13} />Based in Indonesia</span><span className="inline-flex items-center gap-1.5"><Check size={13} />Available for selected projects</span><a href="#github" className="hover:text-[var(--color-text-main)]">GitHub</a><a href="#linkedin" className="hover:text-[var(--color-text-main)]">LinkedIn</a></div>
          </motion.div>
          <motion.div
            initial={reduce ? false : { opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: .14, duration: .8, ease: [0.22, 1, .36, 1] }}
            className="hero-tablet-portrait relative hidden h-[610px] md:block lg:hidden"
          >
            <DualCharacterReveal />
          </motion.div>
          <motion.div initial={false} animate={{ opacity: 0 }} className="hidden" aria-hidden="true">
            {/* The Dashboard Mockup - moved higher and further right, sitting
                partially behind the portrait shoulder so it never covers the face. */}
            <div ref={heroDashRef} className={`hero-dashboard absolute right-0 top-[6%] z-[5] w-[48%] shadow-2xl transition-all duration-700 ${mode === 'spider' ? 'border-red-500/30' : ''}`}><ProjectPreview slug="sinden" /></div>

            {/* HeroCharacterMotionWrapper - outer wrapper carries scroll/parallax
                transforms; PortraitFrame inside owns pointer coordinates. */}
            <div ref={heroCharRef} className="hero-portrait-frame absolute bottom-0 left-[3%] z-10 h-[86%] w-[52%] max-w-[410px] overflow-hidden border border-white/15 bg-[var(--color-surface-elevated)] transition-all duration-700">
              <DualCharacterReveal />
            </div>

            {/* Mode Switch Card */}
            <div ref={heroModeCardRef} className={`hero-mode-card absolute bottom-[3%] right-[3%] border border-white/10 bg-[var(--color-bg-secondary)]/90 px-4 py-3 backdrop-blur z-20 transition-all duration-500 ${mode === 'spider' ? 'mode-switch-spider' : ''}`}>
              <p className="font-mono text-[9px] uppercase tracking-[.16em] text-[var(--color-text-muted)]">Now exploring</p>
              <p className="mt-1 text-sm font-semibold">{mode === "spider" ? "Spider Mode" : "Professional Mode"}</p>
              <button onClick={toggleMode} className="mt-2 inline-flex items-center gap-1 text-xs text-[var(--color-accent-main)]">
                {mode === "professional" ? "Preview Spider layer" : "Return to Professional"} <ChevronRight size={13} />
              </button>
            </div>
          </motion.div>
          <motion.div
            ref={heroImageRef}
            initial={reduce ? false : { opacity: 0, x: 36 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: .18, duration: .85, ease: [0.22, 1, .36, 1] }}
            onPointerMove={updateHeroReveal}
            onPointerEnter={updateHeroReveal}
            onPointerLeave={() => setHeroImageHover(false)}
            className="hero-image-stage relative min-h-[330px] w-full lg:min-h-[560px]"
            aria-label={isSpiderMode ? "Spider mode hero portrait" : "Professional hero portrait"}
          >
            <img
              ref={heroBaseImageRef}
              src={heroBaseImage}
              alt={heroBaseAlt}
              onError={(event) => {
                event.currentTarget.src = professionalCharacter;
              }}
              className={`hero-full-character pointer-events-none absolute bottom-0 w-auto max-w-none object-contain object-bottom transition duration-700 ease-out ${isSpiderMode ? "hero-full-character-spider" : "hero-full-character-pro"}`}
              style={{
                WebkitMaskImage: heroImageHover ? "radial-gradient(circle 91px at var(--hero-base-reveal-x, 50%) var(--hero-base-reveal-y, 50%), transparent 0 82px, rgba(0,0,0,.18) 86px, #000 92px)" : "linear-gradient(to bottom, #000 0%, #000 68%, rgba(0,0,0,.72) 82%, transparent 100%)",
                maskImage: heroImageHover ? "radial-gradient(circle 91px at var(--hero-base-reveal-x, 50%) var(--hero-base-reveal-y, 50%), transparent 0 82px, rgba(0,0,0,.18) 86px, #000 92px)" : "linear-gradient(to bottom, #000 0%, #000 68%, rgba(0,0,0,.72) 82%, transparent 100%)",
              }}
            />
            <div
              aria-hidden
              className={`pointer-events-none absolute inset-0 z-10 transition-opacity duration-150 ease-out ${heroImageHover ? "opacity-100" : "opacity-0"}`}
              style={{
                background: "radial-gradient(circle 91px at var(--hero-reveal-x, 50%) var(--hero-reveal-y, 50%), color-mix(in srgb, var(--color-bg-secondary) 90%, var(--hero-ring-color) 10%) 0 82px, rgba(8,12,18,.72) 86px, transparent 92px)",
              }}
            />
            <img
              ref={heroRevealImageRef}
              src={heroRevealImage}
              alt={heroRevealAlt}
              onError={(event) => {
                event.currentTarget.src = professionalCharacter;
              }}
              className={`hero-full-character hero-full-character-reveal pointer-events-none absolute bottom-0 z-20 w-auto max-w-none object-contain object-bottom transition-opacity duration-200 ease-out ${isSpiderMode ? "hero-full-character-pro" : "hero-full-character-spider"} ${heroImageHover ? "opacity-100" : "opacity-0"}`}
              style={{
                WebkitMaskImage: heroImageHover ? "radial-gradient(circle 88px at var(--hero-swap-reveal-x, 50%) var(--hero-swap-reveal-y, 50%), #000 0 80px, rgba(0,0,0,.82) 84px, transparent 89px)" : "radial-gradient(circle 0px at var(--hero-swap-reveal-x, 50%) var(--hero-swap-reveal-y, 50%), transparent 0, transparent 1px)",
                maskImage: heroImageHover ? "radial-gradient(circle 88px at var(--hero-swap-reveal-x, 50%) var(--hero-swap-reveal-y, 50%), #000 0 80px, rgba(0,0,0,.82) 84px, transparent 89px)" : "radial-gradient(circle 0px at var(--hero-swap-reveal-x, 50%) var(--hero-swap-reveal-y, 50%), transparent 0, transparent 1px)",
              }}
            />
            <div
              aria-hidden
              className={`pointer-events-none absolute inset-0 z-30 transition-opacity duration-200 ${heroImageHover ? "opacity-100" : "opacity-0"}`}
              style={{
                background: "radial-gradient(circle 96px at var(--hero-reveal-x, 50%) var(--hero-reveal-y, 50%), transparent 0 79px, rgba(255,255,255,.24) 80px, var(--hero-ring-color) 82px, rgba(255,255,255,.28) 84px, var(--hero-ring-soft) 88px, transparent 97px)",
              }}
            />
          </motion.div>
        </div>
        <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 items-center gap-3 lg:flex"><span className="h-px w-12 bg-[var(--color-border)]" /><span className="font-mono text-[9px] tracking-[.18em] text-[var(--color-text-muted)]">SCROLL TO EXPLORE</span><MousePointer2 size={13} className="text-[var(--color-accent-main)]" /></div>
      </div>
    </section>

    <section id="about" className="relative bg-[var(--color-bg-secondary)] px-5 py-20 sm:px-6 sm:py-24 lg:py-32"><div className="mx-auto max-w-7xl"><Reveal><Eyebrow>01 / About me</Eyebrow><div className="mb-10 max-w-2xl sm:mb-14"><h2 className="font-manrope text-3xl font-bold tracking-[-.025em] sm:text-4xl md:text-5xl">Transforming ideas into functional and engaging digital experiences.</h2></div></Reveal><div className="grid gap-12 lg:grid-cols-[1fr_.85fr] lg:gap-20"><Reveal><p className="font-mono text-[10px] uppercase tracking-[.16em] text-[var(--color-accent-main)]">Hello, I'm</p><h3 className="mt-3 font-manrope text-2xl font-bold sm:text-3xl">Fazri Lukman Nurrohman</h3><p className="mt-6 max-w-xl leading-7 text-[var(--color-text-secondary)] sm:leading-8">I focus on building modern, responsive, and functional web applications. My experience in interface design, photography, videography, and editing helps me create digital products that are technically clear, visually engaging, and effective in communicating ideas.</p><blockquote className="mt-8 max-w-xl border-l-2 border-[var(--color-accent-main)] bg-white/[.025] px-5 py-4 text-base leading-7 text-[var(--color-accent-silver)] sm:text-lg sm:leading-8">"Technology becomes more meaningful when functionality, design, and visual storytelling work together."</blockquote><div className="mt-8 flex flex-wrap gap-3"><a href="#cv" className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-text-main)] px-4 py-3 text-sm font-bold text-[var(--color-bg-primary)]"><Download size={15} />Download CV</a><Link to="/projects" className="inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold text-[var(--color-text-secondary)] hover:text-white">View Projects <ArrowRight size={15} /></Link></div><div className="mt-9 flex flex-wrap gap-2 text-xs text-[var(--color-text-muted)]"><span className="border border-[var(--color-border)] px-3 py-2">Creative Web Developer</span><span className="border border-[var(--color-border)] px-3 py-2">Indonesia</span><span className="border border-[var(--color-border)] px-3 py-2">Available for selected projects</span></div></Reveal><Reveal className="about-portrait relative min-h-[390px]"><div className="absolute inset-0 overflow-hidden border border-[var(--color-border)] bg-[linear-gradient(135deg,var(--color-surface-elevated),transparent)]"><img src={aboutImage} onError={(event) => { event.currentTarget.src = portrait; }} alt="Professional portrait of Fazri" className="h-full w-full object-contain object-center opacity-85 grayscale transition duration-700 hover:scale-105 hover:grayscale-0" /></div><div className="about-support-card absolute -bottom-5 -left-5 max-w-[210px] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-4"><p className="font-mono text-[9px] uppercase tracking-[.16em] text-[var(--color-accent-main)]">Creative support</p><p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">Design, photography, video and editing enhance every build.</p></div></Reveal></div><div className="mt-20 grid gap-px overflow-hidden border border-[var(--color-border)] bg-[var(--color-border)] md:grid-cols-3">{[["10+", "Total Projects", "Digital systems and web experiences", BriefcaseBusiness], ["8+", "Certificates", "Continuous learning and practical studies", Award], ["2+", "Years of Experience", "From academic work to client delivery", Sparkles]].map(([value, label, desc, Icon]) => <Reveal key={String(label)} className="bg-[var(--color-bg-secondary)] p-6 transition hover:bg-[var(--color-surface-elevated)] sm:p-7"><Icon className="mb-9 text-[var(--color-accent-main)] sm:mb-12" size={21} /><strong className="block font-manrope text-4xl">{String(value)}</strong><p className="mt-2 font-semibold">{String(label)}</p><p className="mt-2 text-sm text-[var(--color-text-muted)]">{String(desc)}</p><div className="mt-6 h-px bg-[var(--color-border)]"><span className="block h-px w-3/4 bg-[var(--color-accent-main)]" /></div></Reveal>)}</div><div className="mt-6 grid gap-4 text-sm text-[var(--color-text-secondary)] md:grid-cols-3"><p><span className="text-[var(--color-text-muted)]">Main Focus:</span> Web Development</p><p><span className="text-[var(--color-text-muted)]">Current Learning:</span> Web Animation & 3D</p><p><span className="text-[var(--color-text-muted)]">Creative Support:</span> Design, Photo, Video</p></div></div></section>

    <section className="relative px-6 py-24"><div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-12"><Reveal className="border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-8 lg:col-span-5"><Eyebrow>02 / Snapshot</Eyebrow><p className="font-manrope text-2xl font-bold">A growing practice, grounded in useful outcomes.</p><strong className="mt-12 block font-manrope text-7xl font-bold text-[var(--color-accent-main)]">16</strong><p className="mt-2 text-sm text-[var(--color-text-secondary)]">Projects completed across web applications and creative production.</p></Reveal><Reveal className="grid gap-6 lg:col-span-7 md:grid-cols-2"><div className="border-b border-[var(--color-border)] pb-6"><span className="font-mono text-[10px] text-[var(--color-text-muted)]">WEB APPLICATIONS</span><strong className="mt-3 block text-4xl">06</strong></div><div className="border-b border-[var(--color-border)] pb-6"><span className="font-mono text-[10px] text-[var(--color-text-muted)]">CREATIVE WORKS</span><strong className="mt-3 block text-4xl">12</strong></div><div><span className="font-mono text-[10px] text-[var(--color-text-muted)]">TECHNOLOGIES USED</span><strong className="mt-3 block text-4xl">20+</strong></div><div><span className="font-mono text-[10px] text-[var(--color-text-muted)]">CURRENT AVAILABILITY</span><strong className="mt-3 block text-xl text-[var(--color-accent-secondary)]">Open for select work</strong></div><div className="col-span-full flex items-center gap-3 border-t border-[var(--color-border)] pt-6"><span className="font-mono text-[9px] text-[var(--color-text-muted)]">2024 ACTIVITY</span><div className="flex flex-1 gap-1">{Array.from({ length: 18 }).map((_, i) => <span key={i} className={`h-2 flex-1 ${i % 5 === 0 ? "bg-[var(--color-accent-secondary)]" : i % 3 === 0 ? "bg-[var(--color-accent-main)]/60" : "bg-white/10"}`} />)}</div></div></Reveal></div></section>

    <section className="bg-[var(--color-bg-secondary)] px-6 py-24"><div className="mx-auto max-w-7xl"><Reveal><Eyebrow>03 / What I build</Eyebrow><div className="flex flex-wrap items-end justify-between gap-6"><h2 className="max-w-xl font-manrope text-4xl font-bold tracking-[-.025em]">Development systems, with a visual point of view.</h2><Link to="/contact" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent-main)]">Discuss a project <ArrowRight size={15} /></Link></div></Reveal><div className="mt-14 grid gap-4 lg:grid-cols-12"><Reveal className={`spider-service-panel relative flex min-h-[340px] flex-col justify-between overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-8 lg:col-span-6 ${mode === 'spider' ? 'border-red-500/30' : ''}`}><Code2 size={30} className="text-[var(--color-accent-main)]" /><div><h3 className="font-manrope text-3xl font-bold">Website & Web Application Development</h3><p className="mt-3 max-w-md leading-7 text-[var(--color-text-secondary)]">Structured, responsive systems from public-facing web experiences to internal operations dashboards.</p><div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[var(--color-text-muted)]"><span>Responsive implementation</span><span>Database integration</span><span>Deployment support</span></div></div></Reveal><div className="grid gap-4 sm:grid-cols-2 lg:col-span-6">{[[Monitor, "Frontend Development", "Interfaces that feel considered at every breakpoint."], [Wrench, "Dashboard Development", "Clarity for complex operations and data."], [Palette, "UI Implementation", "Design language translated faithfully into code."], [Camera, "Creative Production", "Photography, video and edits that complete the story."]].map(([Icon, title, description]) => <Reveal key={String(title)} className={`spider-service-panel relative overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-6 transition hover:border-[var(--color-accent-main)]/50 ${mode === 'spider' ? 'border-red-500/20' : ''}`}><Icon size={20} className="text-[var(--color-accent-main)]" /><h3 className="mt-10 font-manrope text-lg font-bold">{String(title)}</h3><p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">{String(description)}</p><button className="mt-5 text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-accent-main)]">View details <ChevronRight className="inline" size={13} /></button></Reveal>)}</div></div></div></section>

    <section className="px-6 py-24"><div className="mx-auto max-w-7xl"><Reveal><Eyebrow>04 / Selected systems</Eyebrow><h2 className="font-manrope text-4xl font-bold">Featured Web Projects</h2></Reveal><div className="mt-12 space-y-10">{projectsData.slice(0, 4).map((project, index) => <Reveal key={project.slug}><Link to={`/projects/${project.slug}`} className={`group grid items-center gap-8 ${index % 2 ? "lg:grid-cols-[.82fr_1.18fr]" : "lg:grid-cols-[1.18fr_.82fr]"}`}><div className={index % 2 ? "lg:order-2" : ""}><ProjectPreview slug={project.slug} className="aspect-[16/10] transition duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_25px_70px_rgba(0,0,0,.4)]" /></div><div className={index % 2 ? "lg:order-1 lg:pl-10" : "lg:pr-10"}><p className="font-mono text-[10px] uppercase tracking-[.16em] text-[var(--color-accent-main)]">0{index + 1} / {project.category}</p><h3 className="mt-4 font-manrope text-3xl font-bold">{project.title}</h3><p className="mt-3 max-w-md leading-7 text-[var(--color-text-secondary)]">{project.shortDescription}</p><div className="mt-5 flex flex-wrap gap-2">{project.techStack.slice(0, 3).map((tech) => <span key={tech} className="border border-[var(--color-border)] px-2 py-1 font-mono text-[9px] text-[var(--color-text-muted)]">{tech}</span>)}</div><span className="mt-7 inline-flex items-center gap-2 text-sm font-semibold transition group-hover:text-[var(--color-accent-main)]">View case study <ArrowRight size={16} /></span></div></Link></Reveal>)}</div><Link to="/projects" className="mt-14 inline-flex items-center gap-2 border-b border-[var(--color-accent-main)] pb-2 text-sm font-bold">View all projects <ArrowRight size={16} /></Link></div></section>

    <section className="relative border-y border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-6 py-24"><div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.8fr_1.2fr]"><Reveal><Eyebrow>05 / Process</Eyebrow><h2 className="font-manrope text-4xl font-bold">From Idea to Digital Product</h2><p className="mt-5 max-w-sm leading-7 text-[var(--color-text-secondary)]">A collaborative progression that takes uncertainty into a clear, tested product.</p></Reveal><div className="grid gap-px border border-[var(--color-border)] bg-[var(--color-border)] sm:grid-cols-2">{["Discover", "Analyze", "Plan", "Design", "Develop", "Test", "Deploy", "Improve"].map((stage, index) => <Reveal key={stage} className="group bg-[var(--color-surface-elevated)] p-5 transition hover:bg-[var(--color-bg-secondary)]"><span className="font-mono text-[10px] text-[var(--color-accent-main)]">0{index + 1}</span><div className="mt-9 flex items-end justify-between"><h3 className="font-manrope text-xl font-bold">{stage}</h3><span className="h-8 w-8 border border-[var(--color-border)] transition group-hover:border-[var(--color-accent-main)]" /></div></Reveal>)}</div></div></section>

    <section className="px-6 py-24"><div className="mx-auto max-w-7xl"><Reveal><Eyebrow>06 / Toolkit</Eyebrow><div className="flex flex-wrap items-end justify-between gap-6"><h2 className="font-manrope text-4xl font-bold">Technology Stack</h2><div className={`flex border ${mode === 'spider' ? 'border-red-500/30' : 'border-[var(--color-border)]'}`}>{(Object.keys(techGroups) as Array<keyof typeof techGroups>).map((tab) => <button key={tab} onClick={() => setTechTab(tab)} className={`px-4 py-2 text-xs font-semibold transition ${techTab === tab ? "bg-[var(--color-text-main)] text-[var(--color-bg-primary)]" : "text-[var(--color-text-muted)] hover:text-white"}`}>{tab}</button>)}</div></div></Reveal><motion.div layout className={`relative mt-10 grid gap-px border bg-[var(--color-border)] grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 ${mode === 'spider' ? 'border-red-500/30' : 'border-[var(--color-border)]'}`}>
      {mode === "spider" && <SpiderWebField className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" />}
      {activeTechItems.map((tech, index) => <motion.div layout key={tech.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * .035 }} className={`group relative z-10 bg-[var(--color-bg-primary)] p-5 hover:bg-[var(--color-surface-elevated)] ${mode === 'spider' ? 'hover:shadow-[inset_0_0_10px_rgba(255,64,85,0.2)]' : ''}`} title={`${tech.name} - ${tech.level}`}><div className={`flex h-8 w-8 items-center justify-center border font-manrope text-xs font-bold text-[var(--color-accent-main)] ${mode === 'spider' ? 'border-red-500/40 group-hover:border-red-500' : 'border-[var(--color-border)]'}`}>{tech.logoUrl ? <img src={tech.logoUrl} alt="" className="h-5 w-5 object-contain" /> : tech.name.slice(0, 2)}</div><p className="mt-7 text-sm font-semibold">{tech.name}</p><p className="mt-1 font-mono text-[8px] uppercase tracking-wider text-[var(--color-text-muted)]">{tech.level}</p></motion.div>)}</motion.div></div></section>

    <section className="border-y border-white/5 bg-[#050505] px-6 py-24"><div className="mx-auto max-w-7xl"><Reveal><Eyebrow>07 / Beyond the browser</Eyebrow><div className="flex flex-wrap items-end justify-between gap-5"><h2 className="font-manrope text-4xl font-bold">Selected Creative Works</h2><Link to="/creative-works" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent-main)]">Explore creative archive <ArrowRight size={15} /></Link></div></Reveal><Reveal className="mt-10"><CardStack items={creativeStackItems} cardWidth={660} cardHeight={405} maxVisible={5} className={mode === "spider" ? "spider-creative-card" : ""} /></Reveal></div></section>

    <section className="px-6 py-24"><div className="mx-auto max-w-7xl"><Reveal><Eyebrow>08 / Journey</Eyebrow><h2 className="font-manrope text-4xl font-bold">Experience & ongoing practice</h2></Reveal><div className="mt-12 border-l border-[var(--color-border)] pl-6 lg:ml-[22%] lg:pl-12">{[["2024 - Present", "Creative Web Developer", "Independent & client collaborations", "Indonesia", "Building useful platforms, product interfaces, and visual experiences with a strong implementation focus."], ["2023 - 2024", "Web Development Projects", "Academic and client work", "Medan", "Shipped dashboards, operational systems, and data-focused web applications."], ["2022 - 2023", "Exploration & foundation", "Learning and organization activities", "Indonesia", "Strengthened a cross-disciplinary practice across development, UI design and visual production."]].map(([period, role, org, location, description]) => <Reveal key={role} className="relative pb-12 last:pb-0"><span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-[var(--color-bg-primary)] bg-[var(--color-accent-main)] lg:-left-[55px]" /><p className="font-mono text-[10px] text-[var(--color-accent-main)]">{period}</p><div className="mt-3 grid gap-3 lg:grid-cols-[.7fr_1.3fr]"><div><h3 className="font-manrope text-xl font-bold">{role}</h3><p className="mt-1 text-sm text-[var(--color-text-muted)]">{org} - {location}</p></div><div><p className="text-sm leading-6 text-[var(--color-text-secondary)]">{description}</p><div className="mt-3 flex gap-2"><span className="border border-[var(--color-border)] px-2 py-1 font-mono text-[8px] text-[var(--color-text-muted)]">React</span><span className="border border-[var(--color-border)] px-2 py-1 font-mono text-[8px] text-[var(--color-text-muted)]">UI Design</span></div></div></div></Reveal>)}</div></div></section>

    <section className="bg-[var(--color-surface-elevated)] px-6 py-24"><div className="mx-auto max-w-7xl"><Reveal><Eyebrow>09 / Recognition</Eyebrow><div className="flex flex-wrap items-end justify-between gap-5"><h2 className="font-manrope text-4xl font-bold">Certificates & achievements</h2><Link to="/certificates" className="text-sm font-semibold text-[var(--color-accent-main)]">View certificate archive <ArrowRight className="inline" size={15} /></Link></div></Reveal>{homeCertificates.length > 0 && <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{homeCertificates.map((certificate, index) => { const isFeatured = certificate.featured || index === 0; const year = certificate.issueDate ? new Date(certificate.issueDate).getFullYear() : ""; const cardContent = <article className={`group flex h-full flex-col overflow-hidden border border-[var(--color-border)] ${isFeatured ? "bg-[var(--color-bg-secondary)]" : "bg-[var(--color-bg-primary)]"}`}><div className={`flex min-h-[190px] items-center justify-center overflow-hidden ${isFeatured ? "bg-[linear-gradient(135deg,rgba(216,231,232,.18),rgba(78,187,232,.08)),var(--color-bg-primary)]" : "bg-[var(--color-bg-primary)]"} p-3`}><img src={certificate.image} alt="" aria-hidden="true" loading="lazy" className="h-auto max-h-[330px] w-full object-contain transition duration-500 group-hover:scale-[1.02]" onError={(event) => { event.currentTarget.hidden = true; }} /></div><div className="flex flex-1 flex-col p-6"><Award size={22} className="text-[var(--color-accent-main)]" /><p className="mt-8 font-mono text-[9px] uppercase tracking-[.16em] text-[var(--color-text-muted)]">{certificate.category}</p><h3 className="mt-2 font-manrope text-xl font-bold">{certificate.title}</h3><p className="mt-2 text-sm text-[var(--color-text-secondary)]">{certificate.issuer}{year ? ` - ${year}` : ""}</p><span className="mt-6 inline-flex items-center gap-2 text-xs font-bold underline underline-offset-4">View Certificate <ArrowRight size={13} /></span></div></article>; return <Reveal key={certificate.id}>{certificate.credentialUrl ? <a href={certificate.credentialUrl} target="_blank" rel="noreferrer" className="block h-full">{cardContent}</a> : <Link to="/certificates" className="block h-full">{cardContent}</Link>}</Reveal>; })}</div>}</div></section>

    <section className="px-6 py-24"><div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2"><Reveal className="border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-8 relative overflow-hidden">
      {mode === "spider" && <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-red-500/10 to-transparent pointer-events-none" />}
      <Eyebrow>10 / Start a conversation</Eyebrow><h2 className="font-manrope text-3xl font-bold">Have a thoughtful project in mind?</h2><p className="mt-4 max-w-md leading-7 text-[var(--color-text-secondary)]">I'm available for selected web development projects, implementation support, and creative digital collaborations.</p><div className="mt-7 space-y-3 text-sm text-[var(--color-text-secondary)]"><a href={`mailto:${profile.email}`} className="flex items-center gap-3 hover:text-[var(--color-accent-main)]"><Mail size={16} />{profile.email}</a><a href={`https://wa.me/${profile.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-[var(--color-accent-main)]"><MessageCircle size={16} />WhatsApp for a quick introduction</a><div className="flex gap-3 pt-2"><a href={profile.github} target="_blank" rel="noreferrer" aria-label="GitHub"><Github size={17} /></a><a href={profile.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin size={17} /></a><a href={profile.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={17} /></a></div></div><form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="mt-8 grid gap-3"><input required placeholder="Your name" className="border border-[var(--color-border)] bg-transparent px-3 py-3 text-sm outline-none focus:border-[var(--color-accent-main)]" /><input required type="email" placeholder="Email address" className="border border-[var(--color-border)] bg-transparent px-3 py-3 text-sm outline-none focus:border-[var(--color-accent-main)]" /><button className="inline-flex w-max items-center gap-2 bg-[var(--color-text-main)] px-4 py-3 text-sm font-bold text-[var(--color-bg-primary)]">{sent ? "Message queued locally" : "Send inquiry"} <Send size={14} /></button></form></Reveal><Reveal className="border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-8"><div className="flex items-start justify-between"><div><Eyebrow>Guestbook / {comments.length} notes</Eyebrow><h2 className="font-manrope text-3xl font-bold">Recent visitor comments</h2></div><MessageCircle className="text-[var(--color-accent-main)]" /></div><div className="mt-8 space-y-5">{comments.filter((item) => item.status === "approved").slice(0, 3).map((item) => <div key={item.id} className="border-b border-[var(--color-border)] pb-5 last:border-0"><div className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-accent-main)]/15 text-xs font-bold text-[var(--color-accent-main)]">{item.avatar}</span><p className="text-sm font-semibold">{item.name}</p></div><p className="mt-2 pl-9 text-sm leading-6 text-[var(--color-text-secondary)]">"{item.message}"</p></div>)}</div><Link to="/contact" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent-main)]">Visit Contact & Guestbook <ArrowRight size={15} /></Link></Reveal></div></section>

    <section className="final-cta relative overflow-hidden border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-6 py-28">
      <div className="final-ambient absolute inset-0" />
      {mode === "spider" && <SpiderWebField className="absolute inset-0 w-full h-full opacity-60" />}
      <Reveal className="relative mx-auto max-w-3xl text-center"><Eyebrow>11 / Let's make it real</Eyebrow><h2 className="font-manrope text-5xl font-bold tracking-[-.035em] md:text-6xl">Let's Build Something Meaningful.</h2><p className="mx-auto mt-5 max-w-xl leading-7 text-[var(--color-text-secondary)]">A clear idea, a complex challenge, or an early sketch-the right next step can start with a conversation.</p><div className="mt-9 flex flex-wrap justify-center gap-3"><Link to="/contact" className="inline-flex items-center gap-2 bg-[var(--color-text-main)] px-5 py-3 text-sm font-bold text-[var(--color-bg-primary)]">Start a Project <ArrowRight size={16} /></Link><Link to="/projects" className="border border-[var(--color-border)] px-5 py-3 text-sm font-bold hover:bg-white/5">View All Projects</Link></div></Reveal></section>
    </main>
  );
}

