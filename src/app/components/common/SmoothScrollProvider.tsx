import { useEffect } from "react";
import { useLocation } from "react-router";

/**
 * Uses native scrolling and one lightweight section observer. Page-level
 * Motion components own their detailed reveals, avoiding duplicate animation
 * work on every nested card, image, and grid item.
 */
export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const compactViewport = window.matchMedia("(max-width: 1023px)").matches;
    const sections = Array.from(document.querySelectorAll<HTMLElement>("main > section"));
    const revealTargets = compactViewport || reduceMotion
      ? []
      : sections.filter((section) => !section.matches(".hero-section-shell, [data-no-reveal]"));

    revealTargets.forEach((element) => element.classList.add("scroll-reveal"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("scroll-reveal-visible");
          if (entry.target instanceof HTMLElement && entry.target.matches("main > section")) {
            window.dispatchEvent(new CustomEvent("portfolio-section-active", { detail: { index: sections.indexOf(entry.target), id: entry.target.id || "" } }));
          }
          if (!entry.target.matches("main > section") || entry.intersectionRatio >= 0.05) {
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "0px 0px -4% 0px",
        threshold: [0.01, 0.05],
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
      revealTargets.forEach((element) => {
        element.classList.remove("scroll-reveal", "scroll-reveal-visible");
        element.style.removeProperty("--reveal-delay");
      });
    };
  }, [pathname]);

  return <>{children}</>;
}
