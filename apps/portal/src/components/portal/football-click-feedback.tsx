"use client";

import { useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import styles from "./football-click-feedback.module.css";

interface Kick {
  id: number;
  x: number;
  y: number;
  direction: number;
  lift: number;
}

/** The portal layout keeps the effect visible while a booking link changes pages. */
export function FootballClickFeedback({ children, className }: { children: ReactNode; className?: string }) {
  const [kick, setKick] = useState<Kick | null>(null);

  function onClickCapture(event: MouseEvent<HTMLDivElement>) {
    const target = event.target instanceof Element
      ? event.target.closest("[data-football-kick]")
      : null;
    if (!target || target.matches(":disabled, [aria-disabled='true']")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let { clientX: x, clientY: y } = event;
    if (event.detail === 0) {
      // Keyboard and assistive-technology clicks don't carry pointer coordinates.
      const bounds = target.getBoundingClientRect();
      x = bounds.left + bounds.width / 2;
      y = bounds.top + bounds.height / 2;
    }
    const direction = x < window.innerWidth / 2 ? 1 : -1;
    const lift = y < 76 ? 1 : -1;
    setKick((previous) => ({
      id: (previous?.id ?? 0) + 1,
      x,
      y,
      direction,
      lift,
    }));
  }

  return (
    <div className={className} onClickCapture={onClickCapture}>
      {children}
      {kick && (
        <div className={styles.layer} aria-hidden="true">
          <span
            key={kick.id}
            className={styles.ball}
            style={{
              left: kick.x,
              top: kick.y,
              "--kick-direction": kick.direction,
              "--kick-lift": kick.lift,
            } as CSSProperties}
            onAnimationEnd={() => setKick((current) => current === kick ? null : current)}
          />
        </div>
      )}
    </div>
  );
}
