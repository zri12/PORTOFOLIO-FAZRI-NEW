import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { ThemeModeContext } from "../../context/ThemeModeContext";
import { SplashProgress } from "../animation/SplashProgress";
import { SplashWebGLShader } from "../animation/SplashWebGLShader";
import professionalCharacter from "../../../imports/character-professional.png";
import spiderCharacter from "../../../imports/character-spider.png";
import portrait from "../../../imports/fazri.png";

const BOOT_SPLASH_KEY = "__fazri_portfolio_boot_splash_seen__";
const SPLASH_MIN_MS = 2850;
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
    const minDuration = reduced ? 720 : SPLASH_MIN_MS;
    const start = performance.now();
    const criticalAssets = Promise.race([
      Promise.all([
        preloadImage(mode === "spider" ? spiderCharacter : professionalCharacter),
        preloadImage(mode === "spider" ? professionalCharacter : spiderCharacter),
        preloadImage(portrait),
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
  }, [mode, reduced, visible]);

  if (!visible) return null;

  const skipIntro = () => {
    setProgress(100);
    setExiting(true);
    window.setTimeout(() => setVisible(false), SPLASH_EXIT_MS);
    document.body.style.overflow = bodyOverflowRef.current;
  };

  return (
    <div
      className={`fixed inset-0 z-[120] overflow-hidden bg-[#040506] text-white transition-opacity duration-700 ${exiting ? "opacity-0" : "opacity-100"}`}
      data-no-translate
      role="status"
      aria-live="polite"
      aria-label={status}
    >
      <SplashWebGLShader exiting={exiting} reduced={reduced} />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_50%_28%,rgba(255,255,255,.12),transparent_30%),linear-gradient(180deg,rgba(0,0,0,.05),rgba(0,0,0,.52)_58%,rgba(0,0,0,.72))]" />
      <div className="pointer-events-none absolute inset-0 z-[2] bg-[linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[length:84px_84px] opacity-20 [mask-image:radial-gradient(circle_at_50%_38%,#000,transparent_70%)]" />

      <div className="absolute left-6 top-6 z-30 font-mono text-[10px] uppercase tracking-[.28em] text-white/50 md:left-10 md:top-9">
        Fazri Portfolio Studio
      </div>
      <div className="absolute right-6 top-6 z-30 hidden text-right font-mono text-[10px] uppercase tracking-[.22em] text-white/35 md:right-10 md:top-9 md:block">
        Fazri / Portfolio
      </div>

      <div className="absolute inset-0 z-20 flex items-center justify-center px-5 pb-32 pt-16">
        <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center text-center">
          <div className="mb-7 flex flex-wrap items-center justify-center gap-3 font-mono text-[10px] uppercase tracking-[.26em] text-white/45">
            <span>Fazri Lukman Nurrohman</span>
            <span className="h-px w-8 bg-white/20" />
            <span>Creative Web Developer</span>
          </div>

          <h1 className="font-manrope text-5xl font-black leading-[.88] text-white drop-shadow-[0_14px_48px_rgba(0,0,0,.84)] md:text-8xl lg:text-[104px]">
            Fazri Lukman<br />Nurrohman
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-lg font-semibold leading-8 text-white/62 md:text-xl">
            Personal portfolio showcasing web applications, interface design, photography, videography, and visual editing.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-white/55">
            <span className="border border-white/12 bg-white/[.035] px-3 py-2 backdrop-blur">Web Development</span>
            <span className="border border-white/12 bg-white/[.035] px-3 py-2 backdrop-blur">UI Design</span>
            <span className="border border-white/12 bg-white/[.035] px-3 py-2 backdrop-blur">Photography</span>
            <span className="border border-white/12 bg-white/[.035] px-3 py-2 backdrop-blur">Videography</span>
            <span className="border border-white/12 bg-white/[.035] px-3 py-2 backdrop-blur">Visual Editing</span>
          </div>

          <div className="mt-9 inline-flex items-center gap-3 rounded-full border border-emerald-400/20 bg-black/30 px-4 py-2 text-sm font-semibold text-emerald-400 shadow-[0_0_40px_rgba(52,211,153,.15)] backdrop-blur">
            <span className="relative flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 shadow-[0_0_28px_rgba(52,211,153,.35)]">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,.9)]" />
            </span>
            Available for selected projects
          </div>

          <button
            type="button"
            onClick={skipIntro}
            className="mt-10 rounded-full border border-white/35 bg-white/10 px-9 py-4 text-sm font-extrabold text-white shadow-[inset_0_1px_0_rgba(255,255,255,.55),0_18px_52px_rgba(0,0,0,.62),0_0_34px_rgba(255,255,255,.1)] backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-white"
          >
            Skip Intro
          </button>
        </div>
      </div>

      <div className="sr-only">{status}</div>
      <SplashProgress progress={progress} status={status} mode={mode} />
    </div>
  );
}
