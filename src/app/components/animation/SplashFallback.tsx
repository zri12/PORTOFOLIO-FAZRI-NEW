interface SplashFallbackProps {
  mode: "professional" | "spider";
  exiting?: boolean;
}

export function SplashFallback({ mode, exiting = false }: SplashFallbackProps) {
  const spider = mode === "spider";

  return (
    <div
      className={`absolute inset-0 flex items-center justify-center overflow-hidden transition duration-700 ${exiting ? "scale-105 opacity-0" : "scale-100 opacity-100"}`}
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,rgba(255,255,255,.07),transparent_42%)]" />
      <div className="relative h-[340px] w-[560px] max-w-[88vw] [perspective:900px]">
        <div className={`absolute left-[30%] top-[13%] h-44 w-64 border bg-[var(--color-surface-elevated)]/60 shadow-2xl backdrop-blur-md ${spider ? "border-red-500/30 [transform:rotateY(-18deg)_rotateZ(-6deg)]" : "border-cyan-300/20 [transform:rotateY(-16deg)_rotateZ(-4deg)]"}`} />
        <div className={`absolute left-[8%] top-[36%] h-36 w-56 border bg-[var(--color-bg-secondary)]/75 backdrop-blur ${spider ? "border-red-500/35 [transform:translateZ(50px)_rotateY(18deg)_rotateZ(5deg)]" : "border-cyan-300/25 [transform:translateZ(50px)_rotateY(18deg)_rotateZ(4deg)]"}`} />
        <div className={`absolute right-[5%] top-[42%] h-32 w-52 border bg-[var(--color-bg-secondary)]/70 backdrop-blur ${spider ? "border-[#ff4055]/30 [transform:translateZ(90px)_rotateY(-23deg)_rotateZ(-4deg)]" : "border-[#72d4c1]/25 [transform:translateZ(90px)_rotateY(-23deg)_rotateZ(-3deg)]"}`} />
        <div className={`absolute left-[17%] top-[72%] h-20 w-40 border bg-[var(--color-bg-secondary)]/70 ${spider ? "border-[#ff4055]/25 [transform:translateZ(70px)_rotateY(16deg)_rotateZ(-5deg)]" : "border-[#72d4c1]/20 [transform:translateZ(70px)_rotateY(16deg)_rotateZ(-4deg)]"}`}>
          <span className={`absolute left-4 top-4 h-3 w-3 rounded-full ${spider ? "bg-[#ff4055]" : "bg-[#4ebbe8]"}`} />
          <span className={`absolute left-9 top-4 h-3 w-3 rounded-full ${spider ? "bg-[#4cc8f2]" : "bg-[#72d4c1]"}`} />
          <span className="absolute bottom-4 left-4 h-px w-24 bg-white/20" />
        </div>
        <div className={`absolute right-[18%] top-[22%] h-24 w-36 border bg-[var(--color-bg-secondary)]/65 ${spider ? "border-red-500/20 [transform:translateZ(110px)_rotateY(-14deg)_rotateZ(7deg)]" : "border-cyan-300/20 [transform:translateZ(110px)_rotateY(-14deg)_rotateZ(6deg)]"}`}>
          <span className="absolute left-4 top-4 h-px w-20 bg-white/20" />
          <span className="absolute left-4 top-9 h-px w-24 bg-white/15" />
          <span className="absolute bottom-5 left-4 h-4 w-20 bg-white/10" />
        </div>
        <div className={`absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 border ${spider ? "border-[#ff4055]/45 bg-[#12070b]" : "border-[#4ebbe8]/35 bg-[#121c27]"} shadow-[0_0_70px_rgba(78,187,232,.16)]`} />
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 560 340">
          <path d="M280 170 C210 110 135 150 86 230 M280 170 C365 95 435 145 506 216 M280 170 L280 62" fill="none" stroke={spider ? "#ff4055" : "#4ebbe8"} strokeWidth="1" strokeDasharray="6 10" opacity=".7" />
          <path d="M160 118 L420 118 M118 248 L462 248" fill="none" stroke={spider ? "#8d1024" : "#72d4c1"} strokeWidth="1" opacity=".22" />
        </svg>
      </div>
    </div>
  );
}
