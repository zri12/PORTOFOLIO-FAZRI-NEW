export function WebGLFallback({ mode }: { mode: "professional" | "spider" }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden opacity-40 mix-blend-screen" aria-hidden="true">
      <div className={`absolute right-[8%] top-[18%] h-64 w-96 max-w-[60vw] border ${mode === "spider" ? "border-red-500/10 bg-red-500/[.025]" : "border-cyan-300/10 bg-cyan-300/[.025]"}`} />
      <div className={`absolute left-[7%] bottom-[12%] h-40 w-72 max-w-[54vw] border ${mode === "spider" ? "border-[#ff4055]/10" : "border-[#72d4c1]/10"}`} />
    </div>
  );
}
