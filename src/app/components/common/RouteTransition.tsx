import { motion, useReducedMotion } from "motion/react";
import { useLocation } from "react-router";
import { useContext } from "react";
import { ThemeModeContext } from "../../context/ThemeModeContext";

export function RouteTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { mode } = useContext(ThemeModeContext);
  const reduce = useReducedMotion();
  const spider = mode === "spider";

  return (
    <div className="relative">
      <div className="sr-only" aria-live="polite">Loaded {location.pathname}</div>
      <motion.div
        key={`wash-${location.pathname}-${mode}`}
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-[45] h-px origin-left"
        initial={reduce ? false : { scaleX: 0, opacity: 0 }}
        animate={reduce ? { opacity: 0 } : { scaleX: [0, 1, 1], opacity: [0, 0.8, 0] }}
        transition={{ duration: spider ? 0.62 : 0.72, ease: [0.22, 1, 0.36, 1] }}
        style={{ background: spider ? "linear-gradient(90deg, transparent, #ff4055, transparent)" : "linear-gradient(90deg, transparent, #4ebbe8, #72d4c1, transparent)" }}
      />
      <motion.div
        key={location.pathname}
        initial={false}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduce ? undefined : { opacity: 0, y: spider ? -6 : -10, scale: 0.997 }}
        transition={{ duration: spider ? 0.42 : 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
}
