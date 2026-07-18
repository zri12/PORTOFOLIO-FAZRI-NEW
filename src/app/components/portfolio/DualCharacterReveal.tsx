import { useContext, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { ThemeModeContext } from "../../context/ThemeModeContext";
import professionalCharacter from "../../../imports/character-professional.png";
import spiderCharacter from "../../../imports/character-spider.png";

type Breakpoint = "desktop" | "laptop" | "tablet" | "mobile";

// Per-breakpoint, per-image calibration. The two source photos have slightly
// different canvas dimensions and body proportions, so each image is aligned
// independently (head-top / eye-line / shoulders / torso) via scale + offset on
// an INNER wrapper, with transform-origin at 50% 0% so scaling never shifts the
// top of the head. Values are starting points tuned against the real assets.
const CHARACTER_CALIBRATION: Record<Breakpoint, { professional: Cal; spider: Cal }> = {
  // Scaled up (origin 50% 0%) so the character fills the frame confidently and
  // the empty space beneath the subject is cropped. Spider is scaled slightly
  // less because its source framing is tighter, keeping both heads the same size.
  desktop: { professional: { scaleX: 1.2, scaleY: 1.2, x: 0, y: 0 }, spider: { scaleX: 1.23, scaleY: 1.275, x: 0, y: -1.2 } },
  laptop: { professional: { scaleX: 1.18, scaleY: 1.18, x: 0, y: 0 }, spider: { scaleX: 1.21, scaleY: 1.255, x: 0, y: -1.15 } },
  tablet: { professional: { scaleX: 1.14, scaleY: 1.14, x: 0, y: 0 }, spider: { scaleX: 1.17, scaleY: 1.21, x: 0, y: -1 } },
  mobile: { professional: { scaleX: 1.1, scaleY: 1.1, x: 0, y: 0 }, spider: { scaleX: 1.13, scaleY: 1.17, x: 0, y: -0.9 } },
};

interface Cal {
  scaleX: number;
  scaleY: number;
  x: number; // percentage of container width
  y: number; // percentage of container height
}

// Small "discovery lens" — deliberately far smaller than a body-sized portal.
const HOVER_RADIUS: Record<Breakpoint, number> = { desktop: 76, laptop: 68, tablet: 58, mobile: 0 };
const FEATHER = 12;
const LERP = 0.32; // fast, precise pointer follow

function getBreakpoint(): Breakpoint {
  if (typeof window === "undefined") return "desktop";
  const w = window.innerWidth;
  if (w >= 1440) return "desktop";
  if (w >= 1024) return "laptop";
  if (w >= 640) return "tablet";
  return "mobile";
}

interface Props {
  className?: string;
}

export function DualCharacterReveal({ className = "" }: Props) {
  const { mode, toggleMode } = useContext(ThemeModeContext);
  const reduce = useReducedMotion();
  const spiderActive = mode === "spider";

  const frameRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const [bp, setBp] = useState<Breakpoint>(getBreakpoint);
  const isTouch = bp === "mobile" || bp === "tablet";

  const target = useRef({ x: 0, y: 0, r: 0 });
  const current = useRef({ x: 0, y: 0, r: 0 });

  const [hovering, setHovering] = useState(false);
  const [tapPreview, setTapPreview] = useState(false);

  useEffect(() => {
    const onResize = () => setBp(getBreakpoint());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Sync target radius with active mode.
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    if (spiderActive) {
      target.current.r = Math.hypot(el.clientWidth, el.clientHeight) * 1.15;
      // Keep expansion anchored near the last pointer for a beat, then it fills.
      if (!hovering) {
        target.current.x = el.clientWidth / 2;
        target.current.y = el.clientHeight / 2;
      }
    } else if (!hovering) {
      target.current.r = 0;
    }
  }, [spiderActive, hovering]);

  // rAF loop drives CSS custom properties directly — no React re-render per frame.
  useEffect(() => {
    if (reduce) return;
    const el = frameRef.current;
    if (!el) return;
    const tick = () => {
      const c = current.current;
      const t = target.current;
      const ease = spiderActive ? 0.14 : LERP;
      c.x += (t.x - c.x) * ease;
      c.y += (t.y - c.y) * ease;
      c.r += (t.r - c.r) * ease;
      el.style.setProperty("--reveal-x", `${c.x}px`);
      el.style.setProperty("--reveal-y", `${c.y}px`);
      el.style.setProperty("--reveal-r", `${Math.max(0, c.r)}px`);
      el.style.setProperty("--reveal-feather", `${Math.max(0, c.r) + FEATHER}px`);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [reduce, spiderActive]);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (reduce || isTouch || spiderActive) return;
    const el = frameRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    target.current.x = e.clientX - rect.left;
    target.current.y = e.clientY - rect.top;
    target.current.r = HOVER_RADIUS[bp];
  };

  const handleEnter = () => {
    if (reduce || isTouch || spiderActive) return;
    setHovering(true);
    target.current.r = HOVER_RADIUS[bp];
  };

  const handleLeave = () => {
    if (spiderActive) return;
    setHovering(false);
    target.current.r = 0; // radius shrinks in place; position is not reset, so no jump
  };

  const handleClick = () => {
    if (isTouch && !spiderActive && !tapPreview) {
      setTapPreview(true);
      return;
    }
    setTapPreview(false);
    toggleMode();
  };

  const spiderVisibleCrossfade = spiderActive || tapPreview; // used only for reduce / touch
  const useRadialMask = !reduce && !isTouch;

  // Soft organic radial mask: solid core to --reveal-r, then a short feather.
  const maskValue = useRadialMask
    ? "radial-gradient(circle var(--reveal-feather, 0px) at var(--reveal-x, 50%) var(--reveal-y, 50%), #000 0px, #000 calc(var(--reveal-r, 0px) - 4px), rgba(0,0,0,0.85) calc(var(--reveal-r, 0px) - 2px), transparent var(--reveal-feather, 0px))"
    : "none";

  const cal = CHARACTER_CALIBRATION[bp];
  const proTransform = `translate(${cal.professional.x}%, ${cal.professional.y}%) scale(${cal.professional.scaleX}, ${cal.professional.scaleY})`;
  const spiderTransform = `translate(${cal.spider.x}%, ${cal.spider.y}%) scale(${cal.spider.scaleX}, ${cal.spider.scaleY})`;

  return (
    <div className={`relative h-full w-full ${className}`}>
      {/* PortraitFrame — owns calibration + cursor mask. Kept separate from any
          outer scroll/parallax wrapper so GSAP transforms never shift the
          pointer coordinates measured here. */}
      <div
        ref={frameRef}
        onPointerMove={handlePointerMove}
        onPointerEnter={handleEnter}
        onPointerLeave={handleLeave}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label={spiderActive ? "Character in Spider Mode. Activate to return to Professional Mode." : "Professional character portrait. Activate to reveal Spider Mode."}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleMode();
          }
        }}
        className="group relative h-full w-full cursor-pointer select-none overflow-hidden"
      >
        {/* ProfessionalLayer */}
        <div
          className="absolute inset-0"
          style={{
            transformOrigin: "50% 0%",
            transform: proTransform,
            opacity: spiderActive ? 0 : 1,
            transition: "opacity 260ms ease",
          }}
        >
          <img
            src={professionalCharacter}
            alt="Fazri Lukman Nurrohman in a professional dark suit, arms crossed"
            loading="eager"
            draggable={false}
            className="h-full w-full object-contain object-[50%_0%]"
          />
        </div>

        {/* SpiderLayer — revealed through the pointer mask (desktop/laptop) or a
            crossfade (touch / reduced-motion). */}
        <div
          className="absolute inset-0"
          style={{
            transformOrigin: "50% 0%",
            transform: spiderTransform,
            WebkitMaskImage: maskValue,
            maskImage: maskValue,
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            backgroundColor: "var(--color-surface-elevated)",
            opacity: useRadialMask ? 1 : spiderVisibleCrossfade ? 1 : 0,
            transition: useRadialMask ? "none" : "opacity 320ms ease",
          }}
        >
          <img
            src={spiderCharacter}
            alt="Fazri in an original crimson spider-inspired suit, arms crossed"
            loading="eager"
            draggable={false}
            className="h-full w-full object-contain object-[50%_0%]"
          />
        </div>

        {/* CursorRevealBoundary — a thin (~1.5px), low-opacity crimson line that
            traces the reveal edge. No thick ring, no glowing portal. */}
        {useRadialMask && !spiderActive && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 transition-opacity duration-300"
            style={{
              opacity: hovering ? 1 : 0,
              background:
                "radial-gradient(circle var(--reveal-feather, 0px) at var(--reveal-x, 50%) var(--reveal-y, 50%), transparent 0px, transparent calc(var(--reveal-r, 0px) - 1.5px), rgba(229,34,61,0.42) var(--reveal-r, 0px), transparent calc(var(--reveal-r, 0px) + 1px))",
            }}
          />
        )}

        {/* PortraitLighting — subtle crimson rim only when fully in Spider Mode. */}
        {spiderActive && (
          <div aria-hidden className="pointer-events-none absolute inset-0" style={{ boxShadow: "inset 0 0 55px rgba(229,34,61,0.3)" }} />
        )}

        {/* Bottom fade to blend into the page. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[var(--color-bg-primary)] to-transparent" />

        {/* Touch affordance. */}
        {isTouch && !spiderActive && (
          <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/55 px-3 py-1 font-mono text-[9px] uppercase tracking-[.16em] text-white/80 backdrop-blur">
            {tapPreview ? "Tap again for Spider Mode" : "Tap to reveal"}
          </span>
        )}
      </div>
    </div>
  );
}
