import { useContext, useEffect, useRef, useState } from "react";
import { ThemeModeContext } from "../../context/ThemeModeContext";

const webRings = [18, 30, 44, 60, 78];
const spokes = Array.from({ length: 13 }, (_, index) => (index / 12) * Math.PI * 2);

function CornerWeb({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      className={`spider-corner-web absolute h-[24rem] w-[24rem] max-w-[62vw] text-[var(--color-accent-main)] ${flip ? "-bottom-20 -left-14 rotate-180" : "-right-12 -top-12"}`}
      viewBox="0 0 100 100"
      aria-hidden="true"
    >
      <g fill="none" stroke="currentColor" strokeLinecap="round">
        {spokes.map((angle, index) => (
          <line
            key={`spoke-${index}`}
            x1="100"
            y1="0"
            x2={100 - Math.cos(angle) * 104}
            y2={Math.sin(angle) * 104}
            strokeWidth="0.12"
            opacity={index % 2 ? 0.34 : 0.52}
          />
        ))}
        {webRings.map((ring, ringIndex) => {
          const points = spokes
            .slice(1, 7)
            .map((angle, pointIndex) => {
              const sag = Math.sin(pointIndex * 1.25 + ringIndex) * 1.5;
              return `${100 - Math.cos(angle) * ring},${Math.sin(angle) * ring + sag}`;
            })
            .join(" ");
          return <polyline key={ring} points={points} strokeWidth="0.14" opacity={0.42 - ringIndex * 0.035} />;
        })}
      </g>
    </svg>
  );
}

export function SpiderModeEffects() {
  const { mode } = useContext(ThemeModeContext);
  const previousMode = useRef(mode);
  const burstTimer = useRef<number | null>(null);
  const [burstId, setBurstId] = useState(0);
  const [burstActive, setBurstActive] = useState(false);

  useEffect(() => {
    if (previousMode.current !== "spider" && mode === "spider") {
      setBurstId((current) => current + 1);
      setBurstActive(true);
      if (burstTimer.current) window.clearTimeout(burstTimer.current);
      burstTimer.current = window.setTimeout(() => setBurstActive(false), 1180);
    }
    previousMode.current = mode;
  }, [mode]);

  useEffect(() => {
    return () => {
      if (burstTimer.current) window.clearTimeout(burstTimer.current);
    };
  }, []);

  useEffect(() => {
    if (mode !== "spider" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let activeSurface: HTMLElement | null = null;
    const resetSurface = (surface: HTMLElement | null) => {
      if (!surface) return;
      surface.style.removeProperty("--spider-tilt-x");
      surface.style.removeProperty("--spider-tilt-y");
      surface.style.removeProperty("--spider-light-x");
      surface.style.removeProperty("--spider-light-y");
      surface.classList.remove("spider-surface-active");
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!(event.target instanceof Element)) return;
      const surface = event.target.closest<HTMLElement>(
        ".spider-service-panel, .project-preview, .spider-creative-card",
      );

      if (surface !== activeSurface) {
        resetSurface(activeSurface);
        activeSurface = surface;
      }
      if (!surface) return;

      const rect = surface.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
      const y = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));

      surface.style.setProperty("--spider-tilt-x", `${(0.5 - y) * 5.5}deg`);
      surface.style.setProperty("--spider-tilt-y", `${(x - 0.5) * 6.5}deg`);
      surface.style.setProperty("--spider-light-x", `${x * 100}%`);
      surface.style.setProperty("--spider-light-y", `${y * 100}%`);
      surface.classList.add("spider-surface-active");
    };

    const onPointerLeave = () => {
      resetSurface(activeSurface);
      activeSurface = null;
    };

    document.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);

    return () => {
      resetSurface(activeSurface);
      document.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [mode]);

  if (mode !== "spider" && !burstActive) return null;

  return (
    <div className={`spider-mode-effects ${mode === "spider" ? "is-active" : ""} ${burstActive ? "is-bursting" : ""}`} aria-hidden="true">
      {mode === "spider" && (
        <>
          <div className="spider-red-veil" />
          <CornerWeb />
          <CornerWeb flip />
          <svg className="spider-strands" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M6 -4 C18 18 24 36 18 104" />
            <path d="M50 -5 C47 22 55 54 48 106" />
            <path d="M94 -3 C76 20 72 54 82 106" />
            <path d="M-2 77 C25 67 48 71 102 57" />
          </svg>
          <div className="spider-corner-pulse spider-corner-pulse-a" />
          <div className="spider-corner-pulse spider-corner-pulse-b" />
        </>
      )}

      {burstActive && (
        <div key={burstId} className="spider-impact-layer">
          <div className="spider-transition-wash" />
          <svg className="spider-transition-web" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path className="spider-transition-web-primary" d="M94 8 C76 18 65 27 51 39 C36 51 24 66 5 92" />
            <path d="M94 8 C79 28 69 42 58 57 C46 73 34 83 20 98" />
            <path d="M94 8 C72 20 54 25 34 28 C22 30 12 34 1 40" />
            <path d="M73 22 L76 39 M57 34 L63 52 M42 47 L51 65 M28 63 L39 79" />
          </svg>
          <div className="spider-transition-label"><span />SPIDER MODE</div>
        </div>
      )}
    </div>
  );
}
