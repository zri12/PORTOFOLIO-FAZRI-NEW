import { useEffect } from "react";
import { useLocation } from "react-router";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Keeps ScrollTrigger measurements fresh while preserving native scrolling.
 * A previous Lenis wrapper smoothed every wheel event and made all public
 * pages feel delayed or held back during normal scrolling.
 */
export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();

  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    const refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
    window.addEventListener("resize", refresh);

    return () => {
      cancelAnimationFrame(refreshFrame);
      window.removeEventListener("resize", refresh);
    };
  }, []);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const compactViewport = window.matchMedia("(max-width: 1023px)").matches;
    const revealTargets = Array.from(
      document.querySelectorAll<HTMLElement>([
        "main > section",
        "main article",
        "main aside",
        "main form",
        "main .grid > a",
        "main .grid > button",
        "main .grid > div",
        "main img",
        "footer > div",
      ].join(", "))
    ).filter(
      (element) =>
        !element.closest(
          "[data-no-reveal], .fixed, [role='dialog'], .hero-section-shell",
        ) && !element.matches(".hero-section-shell"),
    );

    if (reduceMotion) {
      revealTargets.forEach((element) => element.classList.add("scroll-reveal-visible"));
      return;
    }

    revealTargets.forEach((element, index) => {
      element.classList.add("scroll-reveal");
      const delayStep = compactViewport ? 30 : 45;
      const delayIndex = compactViewport ? Math.min(index % 4, 3) : Math.min(index % 8, 7);
      element.style.setProperty("--reveal-delay", `${delayIndex * delayStep}ms`);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("scroll-reveal-visible");
          if (entry.target instanceof HTMLElement && entry.target.matches("main > section")) {
            const sections = Array.from(document.querySelectorAll("main > section"));
            window.dispatchEvent(new CustomEvent("portfolio-section-active", { detail: { index: sections.indexOf(entry.target), id: entry.target.id || "" } }));
          }
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: compactViewport ? "0px 0px -2% 0px" : "0px 0px -8% 0px",
        threshold: compactViewport ? 0.03 : 0.08,
      }
    );

    revealTargets.forEach((element) => observer.observe(element));
    const refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      cancelAnimationFrame(refreshFrame);
      observer.disconnect();
    };
  }, [pathname]);

  return <>{children}</>;
}
