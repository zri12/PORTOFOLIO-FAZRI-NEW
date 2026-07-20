import { lazy, Suspense, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { ThemeModeContext } from "../../context/ThemeModeContext";
import { SplashProgress } from "../animation/SplashProgress";
import professionalCharacter from "../../../imports/character-professional.png";
import spiderCharacter from "../../../imports/character-spider.png";

const SplashWebGLShader = lazy(() => import("../animation/SplashWebGLShader").then((module) => ({ default: module.SplashWebGLShader })));

const BOOT_SPLASH_KEY = "__fazri_portfolio_boot_splash_seen__";
const SPLASH_MIN_MS = 1800;
const SPLASH_EXIT_MS = 620;
const SPLASH_ASSET_TIMEOUT_MS = 1900;

function preloadImage(src: string) {
  return new Promise<void>((resolve) => {
    const image = new Image();
    image.onload = () => resolve();
    image.onerror = () => resolve();
    image.src = src;
  });
}

interface LoadingScreenProps {
  onComplete?: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const { mode } = useContext(ThemeModeContext);
  const reduced = !!useReducedMotion();
  const compactViewport = window.matchMedia("(max-width: 767px)").matches;
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const bodyOverflowRef = useRef("");
  const [visible, setVisible] = useState(() => !(window as Window & { [BOOT_SPLASH_KEY]?: boolean })[BOOT_SPLASH_KEY]);
  const [exiting, setExiting] = useState(false);
  const [progress, setProgress] = useState(0);

  const statusSteps = useMemo(
    () => mode === "spider"
      ? ["Preparing Fazri portfolio", "Loading web and creative works", "Opening personal workspace", "Portfolio ready"]
      : ["Preparing Fazri portfolio", "Loading web and creative works", "Opening personal workspace", "Portfolio ready"],
    [mode]
  );
  const status = statusSteps[Math.min(statusSteps.length - 1, Math.floor(progress / 28))];

  useEffect(() => {
    if (!visible) onComplete?.();
  }, [onComplete, visible]);

  useEffect(() => {
    if (!visible) return;
    (window as Window & { [BOOT_SPLASH_KEY]?: boolean })[BOOT_SPLASH_KEY] = true;
    previouslyFocused.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    bodyOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    let done = false;
    const minDuration = reduced || compactViewport ? 620 : SPLASH_MIN_MS;
    const start = performance.now();
    const criticalAssets = Promise.race([
      Promise.all([
        preloadImage(mode === "spider" ? spiderCharacter : professionalCharacter),
        preloadImage(mode === "spider" ? professionalCharacter : spiderCharacter),
      ]),
      new Promise<void>((resolve) => window.setTimeout(resolve, SPLASH_ASSET_TIMEOUT_MS)),
    ]);

    const finish = () => {
      if (done) return;
      done = true;
      setProgress(100);
      setExiting(true);
      window.setTimeout(() => {
        document.body.style.overflow = bodyOverflowRef.current;
        setVisible(false);
        previouslyFocused.current?.focus?.();
      }, SPLASH_EXIT_MS);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") finish();
    };
    window.addEventListener("keydown", onKeyDown);

    const progressTimer = window.setInterval(() => {
      const elapsed = performance.now() - start;
      const assetWeight = Math.min(1, elapsed / minDuration);
      setProgress((current) => Math.min(96, Math.max(current + (reduced ? 18 : 4.5), assetWeight * 92)));
    }, reduced ? 80 : 120);

    Promise.all([
      criticalAssets,
      new Promise<void>((resolve) => window.setTimeout(resolve, minDuration)),
    ]).then(finish);

    return () => {
      window.clearInterval(progressTimer);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = bodyOverflowRef.current;
    };
  }, [compactViewport, mode, reduced, visible]);

  if (!visible) return null;

  const skipIntro = () => {
    setProgress(100);
    setExiting(true);
    window.setTimeout(() => setVisible(false), SPLASH_EXIT_MS);
    document.body.style.overflow = bodyOverflowRef.current;
  };

  return (
    <div
      className={`splash-screen fixed inset-0 z-[120] overflow-hidden bg-[#040506] text-white transition-opacity duration-700 ${exiting ? "opacity-0" : "opacity-100"}`}
      data-no-translate
      role="status"
      aria-live="polite"
      aria-label={status}
    >
      {!reduced && !compactViewport && (
        <Suspense fallback={null}>
          <SplashWebGLShader exiting={exiting} />
        </Suspense>
      )}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_50%_28%,rgba(255,255,255,.12),transparent_30%),linear-gradient(180deg,rgba(0,0,0,.05),rgba(0,0,0,.52)_58%,rgba(0,0,0,.72))]" />
      <div className="pointer-events-none absolute inset-0 z-[2] bg-[linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[length:84px_84px] opacity-20 [mask-image:radial-gradient(circle_at_50%_38%,#000,transparent_70%)]" />

      <div className="splash-layout relative z-20 grid h-[100svh] min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] px-5 py-5 sm:px-8 sm:py-7 lg:px-10 lg:py-8">
        <header className="flex items-center justify-between gap-4 font-mono text-[9px] uppercase tracking-[.24em] text-white/45 sm:text-[10px]">
          <span>Fazri Portfolio Studio</span>
          <span className="hidden text-white/30 sm:block">Fazri / Portfolio</span>
        </header>

        <section className="splash-main flex min-h-0 items-center justify-center py-4">
          <div className="splash-content relative mx-auto flex w-full max-w-5xl flex-col items-center text-center">
          <div className="splash-kicker mb-5 flex flex-wrap items-center justify-center gap-3 font-mono text-[9px] uppercase tracking-[.24em] text-white/45 sm:mb-7 sm:text-[10px]">
            <span>Fazri Lukman Nurrohman</span>
            <span className="h-px w-8 bg-white/20" />
            <span>Creative Web Developer</span>
          </div>

          <h1 className="splash-title font-manrope text-[clamp(2.65rem,12vw,5.5rem)] font-black leading-[.9] text-white drop-shadow-[0_14px_48px_rgba(0,0,0,.84)] lg:text-[104px]">
            Fazri Lukman<br />Nurrohman
          </h1>

          <p className="splash-description mx-auto mt-6 max-w-2xl text-base font-semibold leading-7 text-white/62 sm:mt-8 sm:text-lg sm:leading-8 md:text-xl">
            Personal portfolio showcasing web applications, interface design, photography, videography, and visual editing.
          </p>

          <div className="splash-skills mt-6 flex max-w-2xl flex-wrap items-center justify-center gap-2 text-[11px] font-semibold text-white/55 sm:mt-8 sm:gap-3 sm:text-xs">
            <span className="border border-white/12 bg-white/[.035] px-3 py-2 backdrop-blur">Web Development</span>
            <span className="border border-white/12 bg-white/[.035] px-3 py-2 backdrop-blur">UI Design</span>
            <span className="border border-white/12 bg-white/[.035] px-3 py-2 backdrop-blur">Photography</span>
            <span className="border border-white/12 bg-white/[.035] px-3 py-2 backdrop-blur">Videography</span>
            <span className="border border-white/12 bg-white/[.035] px-3 py-2 backdrop-blur">Visual Editing</span>
          </div>

          <div className="splash-availability mt-7 inline-flex items-center gap-2.5 rounded-full border border-emerald-400/20 bg-black/30 px-4 py-2 text-xs font-semibold text-emerald-400 shadow-[0_0_40px_rgba(52,211,153,.15)] backdrop-blur sm:mt-9 sm:text-sm">
            <span className="relative flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 shadow-[0_0_28px_rgba(52,211,153,.35)]">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,.9)]" />
            </span>
            Available for selected projects
          </div>

          <button
            type="button"
            onClick={skipIntro}
            className="splash-skip mt-7 rounded-full border border-white/35 bg-white/10 px-8 py-3.5 text-sm font-extrabold text-white shadow-[inset_0_1px_0_rgba(255,255,255,.55),0_18px_52px_rgba(0,0,0,.62),0_0_34px_rgba(255,255,255,.1)] backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-white sm:mt-10 sm:px-9 sm:py-4"
          >
            Skip Intro
          </button>
          </div>
        </section>

        <footer className="splash-footer pt-2">
          <SplashProgress progress={progress} status={status} mode={mode} />
        </footer>
        </div>

      <div className="sr-only">{status}</div>
    </div>
  );
}
