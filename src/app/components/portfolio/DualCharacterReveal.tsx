import { useContext, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { ThemeModeContext } from "../../context/ThemeModeContext";
import professionalCharacter from "../../../imports/character-professional.png";
import spiderCharacter from "../../../imports/character-spider.png";

type Breakpoint = "desktop" | "laptop" | "tablet" | "mobile";

// Per-breakpoint, per-image calibration. The two source photos have slightly
// different canvas dimensions and body proportions, so each image is aligned
// independently (head-top / eye-line / shoulders / torso) via scale + offset on
// an INNER wrapper, with transform-origin at 50% 100% so both subjects stay
// anchored to the same baseline while their transparent bounds are normalized.
const CHARACTER_CALIBRATION: Record<Breakpoint, { professional: Cal; spider: Cal }> = {
  // The professional source is 484x515 while the Spider source is 500x500.
  // These values normalize their alpha bounds, not their canvases, so the
  // head, shoulder line, crossed arms, and elbows share the same coordinates.
  desktop: { professional: { scaleX: 1.2, scaleY: 1.2, x: 0, y: 0 }, spider: { scaleX: 1.154, scaleY: 1.213, x: 0, y: 0 } },
  laptop: { professional: { scaleX: 1.18, scaleY: 1.18, x: 0, y: 0 }, spider: { scaleX: 1.135, scaleY: 1.192, x: 0, y: 0 } },
  tablet: { professional: { scaleX: 1.14, scaleY: 1.14, x: 0, y: 0 }, spider: { scaleX: 1.096, scaleY: 1.152, x: 0, y: 0 } },
  mobile: { professional: { scaleX: 1.12, scaleY: 1.12, x: 0, y: 0 }, spider: { scaleX: 1.077, scaleY: 1.132, x: 0, y: 0 } },
};

interface Cal {
  scaleX: number;
  scaleY: number;
  x: number; // percentage of container width
  y: number; // percentage of container height
}

// Small "discovery lens" — deliberately far smaller than a body-sized portal.
const HOVER_RADIUS: Record<Breakpoint, number> = { desktop: 76, laptop: 68, tablet: 64, mobile: 46 };
const FEATHER = 5;
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
  const touchHideTimerRef = useRef<number | null>(null);
  const [bp, setBp] = useState<Breakpoint>(getBreakpoint);
  const [coarsePointer, setCoarsePointer] = useState(() => window.matchMedia("(hover: none), (pointer: coarse)").matches);

  const target = useRef({ x: 0, y: 0, r: 0 });
  const current = useRef({ x: 0, y: 0, r: 0 });

  const [hovering, setHovering] = useState(false);
  const [tapPreview, setTapPreview] = useState(false);

  useEffect(() => {
    const onResize = () => setBp(getBreakpoint());
    const pointerQuery = window.matchMedia("(hover: none), (pointer: coarse)");
    const onPointerChange = () => setCoarsePointer(pointerQuery.matches);
    window.addEventListener("resize", onResize);
    pointerQuery.addEventListener("change", onPointerChange);
    return () => {
      window.removeEventListener("resize", onResize);
      pointerQuery.removeEventListener("change", onPointerChange);
      if (touchHideTimerRef.current) window.clearTimeout(touchHideTimerRef.current);
    };
  }, []);

  // Keep the reveal lens available in both modes. Professional reveals Spider;
  // Spider reveals Professional. The lens starts hidden until pointer/touch enters.
  useEffect(() => {
    if (!hovering) {
      target.current.r = 0;
    }
  }, [spiderActive, hovering]);

  // rAF loop drives CSS custom properties directly — no React re-render per frame.
  useEffect(() => {
    if (reduce || coarsePointer) return;
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
  }, [coarsePointer, reduce, spiderActive]);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (reduce) return;
    const el = frameRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    target.current.x = e.clientX - rect.left;
    target.current.y = e.clientY - rect.top;
    target.current.r = HOVER_RADIUS[bp];
    if (coarsePointer) {
      el.style.setProperty("--reveal-x", `${target.current.x}px`);
      el.style.setProperty("--reveal-y", `${target.current.y}px`);
      el.style.setProperty("--reveal-r", `${target.current.r}px`);
      el.style.setProperty("--reveal-feather", `${target.current.r + FEATHER}px`);
    }
    setHovering(true);
  };

  const handleEnter = () => {
    if (reduce || coarsePointer) return;
    setHovering(true);
    target.current.r = HOVER_RADIUS[bp];
  };

  const handleLeave = () => {
    if (coarsePointer) return;
    setHovering(false);
    target.current.r = 0; // radius shrinks in place; position is not reset, so no jump
  };

  const hideTouchReveal = (immediate = false) => {
    if (!coarsePointer) return;
    const hide = () => {
      setHovering(false);
      setTapPreview(false);
      target.current.r = 0;
      const el = frameRef.current;
      el?.style.setProperty("--reveal-r", "0px");
      el?.style.setProperty("--reveal-feather", `${FEATHER}px`);
      touchHideTimerRef.current = null;
    };
    if (touchHideTimerRef.current) window.clearTimeout(touchHideTimerRef.current);
    if (immediate) hide();
    else touchHideTimerRef.current = window.setTimeout(hide, 850);
  };

  const handlePointerDown = (event: React.PointerEvent) => {
    if (reduce || event.pointerType === "mouse") return;
    if (spiderActive) {
      hideTouchReveal(true);
      return;
    }
    if (touchHideTimerRef.current) window.clearTimeout(touchHideTimerRef.current);
    handlePointerMove(event);
    setTapPreview(true);
  };

  const handleClick = (event: React.MouseEvent) => {
    if (coarsePointer || event.detail === 0) return;
    setTapPreview(false);
    toggleMode();
  };

  const useRadialMask = !reduce;
  const allowRevealMask = useRadialMask && !(coarsePointer && spiderActive);

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
        onPointerDown={handlePointerDown}
        onPointerUp={() => hideTouchReveal(false)}
        onPointerCancel={() => hideTouchReveal(true)}
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
        className="group relative h-full w-full cursor-pointer select-none overflow-hidden touch-pan-y"
      >
        {/* ProfessionalLayer */}
        <div
          className="absolute inset-0"
          style={{
            zIndex: spiderActive ? 3 : 1,
            WebkitMaskImage: spiderActive && allowRevealMask ? maskValue : "none",
            maskImage: spiderActive && allowRevealMask ? maskValue : "none",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            opacity: spiderActive ? (allowRevealMask ? 1 : 0) : 1,
            transition: allowRevealMask ? "none" : "opacity 320ms ease",
          }}
        >
          <div
            className="absolute inset-0"
            style={{ transformOrigin: "50% 100%", transform: proTransform }}
          >
            <img
              src={professionalCharacter}
              alt="Fazri Lukman Nurrohman in a professional dark suit, arms crossed"
              loading="eager"
              draggable={false}
              className="h-full w-full object-contain object-[50%_100%]"
            />
          </div>
        </div>

        {allowRevealMask && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              zIndex: 2,
              WebkitMaskImage: maskValue,
              maskImage: maskValue,
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              background: spiderActive
                ? "radial-gradient(circle at var(--reveal-x, 50%) var(--reveal-y, 50%), color-mix(in srgb, var(--color-bg-primary) 84%, #101820 16%) 0%, color-mix(in srgb, var(--color-bg-secondary) 88%, #111827 12%) 68%, var(--color-bg-primary) 100%)"
                : "radial-gradient(circle at var(--reveal-x, 50%) var(--reveal-y, 50%), color-mix(in srgb, var(--color-bg-primary) 72%, #050608 28%) 0%, color-mix(in srgb, var(--color-bg-secondary) 84%, #070709 16%) 68%, var(--color-bg-primary) 100%)",
            }}
          />
        )}

        {/* SpiderLayer — revealed through the pointer mask (desktop/laptop) or a
            crossfade (touch / reduced-motion). */}
        <div
          className="absolute inset-0"
          style={{
            zIndex: spiderActive ? 1 : 3,
            WebkitMaskImage: spiderActive || allowRevealMask ? (spiderActive ? "none" : maskValue) : "none",
            maskImage: spiderActive || allowRevealMask ? (spiderActive ? "none" : maskValue) : "none",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            backgroundColor: "transparent",
            opacity: !spiderActive && !allowRevealMask ? 0 : 1,
            transition: allowRevealMask ? "none" : "opacity 320ms ease",
          }}
        >
          <div
            className="absolute inset-0"
            style={{ transformOrigin: "50% 100%", transform: spiderTransform }}
          >
            <img
              src={spiderCharacter}
              alt="Fazri in an original crimson spider-inspired suit, arms crossed"
              loading="eager"
              draggable={false}
              className="h-full w-full object-contain object-[50%_100%]"
            />
          </div>
        </div>

        {/* CursorRevealBoundary — a thin (~1.5px), low-opacity crimson line that
            traces the reveal edge. No thick ring, no glowing portal. */}
        {allowRevealMask && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 transition-opacity duration-300"
            style={{
              opacity: hovering ? 1 : 0,
              background:
                `radial-gradient(circle var(--reveal-feather, 0px) at var(--reveal-x, 50%) var(--reveal-y, 50%), transparent 0px, transparent calc(var(--reveal-r, 0px) - 1.5px), ${spiderActive ? "rgba(78,187,232,0.52)" : "rgba(229,34,61,0.42)"} var(--reveal-r, 0px), transparent calc(var(--reveal-r, 0px) + 1px))`,
            }}
          />
        )}

        {/* PortraitLighting — subtle crimson rim only when fully in Spider Mode. */}
        {spiderActive && (
          <div
            aria-hidden
            className="portrait-spider-lighting pointer-events-none absolute inset-0"
            style={{ boxShadow: "inset 0 0 55px rgba(229,34,61,0.22)" }}
          />
        )}

        {/* Touch affordance. */}
        {coarsePointer && !reduce && !spiderActive && (
          <span className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-black/70 px-3 py-1 font-mono text-[8px] uppercase tracking-[.14em] text-white/70 backdrop-blur">
            {tapPreview ? "Drag to explore" : "Tap or drag to reveal"}
          </span>
        )}
      </div>
    </div>
  );
}
