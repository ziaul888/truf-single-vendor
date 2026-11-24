"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./home-motion.module.css";

export function HomeSectionReveal({ children }: { children: ReactNode }) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver((entries) => {
      for (const { target, isIntersecting } of entries) {
        if (!isIntersecting) continue;
        // Only fade the section, so the slot picker's fixed mobile bar stays anchored to the viewport.
        target.classList.add(styles.sectionEnter);
        observer.unobserve(target);
      }
    }, { rootMargin: "0px 0px -24px 0px" });

    // Content already on screen needs only the portal's normal page transition.
    for (const section of container.current.children) {
      if (section.getBoundingClientRect().top >= window.innerHeight) observer.observe(section);
    }
    return () => observer.disconnect();
  }, []);

  return <div ref={container}>{children}</div>;
}
