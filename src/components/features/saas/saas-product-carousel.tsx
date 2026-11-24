"use client";

import Image from "next/image";
import { useId, useRef, useState, type KeyboardEvent, type UIEvent } from "react";
import {
  BarChart3,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  MonitorSmartphone,
} from "lucide-react";
import { SaasScreenshotImage } from "./saas-screenshot-image";

const slides = [
  { label: "Booking site", title: "Booking website", icon: MonitorSmartphone },
  {
    label: "Dashboard",
    title: "Owner dashboard",
    icon: LayoutDashboard,
    src: "/saas/owner-dashboard.webp",
    alt: "TurfOrg owner dashboard with sales, upcoming bookings, and ground availability",
  },
  {
    label: "Calendar",
    title: "Booking calendar",
    icon: CalendarDays,
    src: "/saas/booking-calendar.webp",
    alt: "TurfOrg booking calendar with a month of bookings and available slots",
  },
  {
    label: "Reports",
    title: "Sales reports",
    icon: BarChart3,
    src: "/saas/sales-reports.webp",
    alt: "TurfOrg reports with a sales trend chart, booking totals, and completion rate",
  },
] as const;

const imageSizes =
  "(min-width: 1184px) 1120px, (min-width: 640px) calc(100vw - 4rem), calc(100vw - 2.5rem)";

export function SaasProductCarousel({ bookingSiteUrl }: { bookingSiteUrl: string | null }) {
  const viewportId = useId();
  const viewportRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const active = slides[activeIndex];

  function showSlide(index: number) {
    const viewport = viewportRef.current;
    if (!viewport) return;

    viewport.scrollTo({
      left: index * viewport.clientWidth,
      behavior: Math.abs(index - activeIndex) > 1 ? "instant" : "auto",
    });
  }

  function moveBy(direction: number) {
    showSlide((activeIndex + direction + slides.length) % slides.length);
  }

  function handleScroll(event: UIEvent<HTMLDivElement>) {
    const { scrollLeft, clientWidth } = event.currentTarget;
    if (clientWidth === 0) return;
    const index = Math.round(scrollLeft / clientWidth);
    setActiveIndex(Math.max(0, Math.min(index, slides.length - 1)));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    moveBy(event.key === "ArrowLeft" ? -1 : 1);
  }

  return (
    <section
      className="saas-product-preview"
      aria-label="Product screenshots"
      aria-roledescription="carousel"
      onKeyDown={handleKeyDown}
    >
      <div className="saas-browser">
        <div className="saas-browser-bar">
          <span className="saas-browser-dots" aria-hidden>
            <i />
            <i />
            <i />
          </span>
          <span className="saas-browser-address" aria-hidden>
            {active.title}
          </span>
          <div className="saas-preview-arrows" role="group" aria-label="Browse screenshots">
            <button
              type="button"
              className="no-press"
              aria-label="Previous screenshot"
              aria-controls={viewportId}
              onClick={() => moveBy(-1)}
            >
              <ChevronLeft aria-hidden className="size-5" />
            </button>
            <button
              type="button"
              className="no-press"
              aria-label="Next screenshot"
              aria-controls={viewportId}
              onClick={() => moveBy(1)}
            >
              <ChevronRight aria-hidden className="size-5" />
            </button>
          </div>
        </div>

        <div
          id={viewportId}
          ref={viewportRef}
          className="saas-preview-viewport"
          tabIndex={-1}
          onScroll={handleScroll}
        >
          {slides.map((slide, index) => (
            <div
              key={slide.label}
              className="saas-shot saas-preview-slide"
              aria-hidden={index !== activeIndex}
            >
              {"src" in slide ? (
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  width={1600}
                  height={866}
                  sizes={imageSizes}
                  draggable={false}
                />
              ) : (
                <SaasScreenshotImage
                  slot="desktop"
                  imageUrl={bookingSiteUrl}
                  sizes={imageSizes}
                  priority
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="saas-preview-picker" role="group" aria-label="Choose a screenshot">
        {slides.map(({ icon: Icon, label }, index) => (
          <button
            key={label}
            type="button"
            className="no-press"
            aria-pressed={index === activeIndex}
            aria-controls={viewportId}
            onClick={() => showSlide(index)}
          >
            <Icon aria-hidden className="size-4 shrink-0" />
            {label}
          </button>
        ))}
      </div>
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {active.title}, screenshot {activeIndex + 1} of {slides.length}
      </span>
    </section>
  );
}
