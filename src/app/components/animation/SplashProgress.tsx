interface SplashProgressProps {
  progress: number;
  status: string;
  mode: "professional" | "spider";
}

export function SplashProgress({ progress, status, mode }: SplashProgressProps) {
  const bounded = Math.max(0, Math.min(100, progress));

  return (
    <div className="splash-progress pointer-events-none z-20 mx-auto w-full max-w-xl text-center">
      <p className="font-mono text-[10px] uppercase tracking-[.2em] text-[var(--color-accent-main)]" aria-live="polite">
        {status}
      </p>
      <div className="mx-auto mt-4 h-px max-w-sm overflow-hidden bg-white/10">
        <div
          className={`h-full transition-[width] duration-300 ease-out ${mode === "spider" ? "bg-[#ff4055]" : "bg-[#72d4c1]"}`}
          style={{ width: `${bounded}%` }}
        />
      </div>
      <p className="mt-3 font-mono text-[9px] uppercase tracking-[.18em] text-[var(--color-text-muted)]">
        FAZRI / DEV
      </p>
    </div>
  );
}
