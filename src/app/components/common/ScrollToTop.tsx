import { useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router";

export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation();
  const handledInitialHash = useRef(false);

  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    if (!handledInitialHash.current && pathname === "/" && hash) {
      handledInitialHash.current = true;
      window.history.replaceState(null, "", `${pathname}${search}`);
    }

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [pathname, search]);

  return null;
}
