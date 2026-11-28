"use client";

import Image from "next/image";
import dashboardPreview from "@/assets/owner-dashboard.webp";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
  type UIEvent,
} from "react";
import {
  BarChart3,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  MonitorSmartphone,
  Pause,
  Play,
} from "lucide-react";
import { SaasScreenshotImage } from "@/components/saas-screenshot-image";
import { PRODUCT_NAME } from "@/lib/product-name";

const slides = [
  { label: "Booking site", title: "Booking website", icon: MonitorSmartphone },
  {
    label: "Dashboard",
    title: "Owner dashboard",
    icon: LayoutDashboard,
    src: dashboardPreview,
    alt: `${PRODUCT_NAME} owner dashboard with sales, upcoming bookings, and ground availability`,
  },
  {
    label: "Calendar",
    title: "Booking calendar",
    icon: CalendarDays,
    src: "/saas/booking-calendar.webp",
    alt: `${PRODUCT_NAME} booking calendar with a month of bookings and available slots`,
  },
  {
    label: "Reports",
    title: "Sales reports",
    icon: BarChart3,
    src: "/saas/sales-reports.webp",
    alt: `${PRODUCT_NAME} reports with a sales trend chart, booking totals, and completion rate`,
  },
] as const;

const imageSizes =
  "(min-width: 1184px) 1120px, (min-width: 640px) calc(100vw - 4rem), calc(100vw - 2.5rem)";
const AUTOPLAY_DELAY = 5000;
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeToMotionPreference(onChange: () => void) {
  const media = window.matchMedia(REDUCED_MOTION);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

export function SaasProductCarousel({ bookingSiteUrl }: { bookingSiteUrl: string | null }) {
  const viewportId = useId();
  const viewportRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [playback, setPlayback] = useState<boolean | null>(null);
  const [inView, setInView] = useState(false);
  const [mouseOver, setMouseOver] = useState(false);
  const reducedMotion = useSyncExternalStore(
    subscribeToMotionPreference,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => true,
  );
  const playing = playback ?? !reducedMotion;
  const rotating = playing && inView && !mouseOver;
  const active = slides[activeIndex];

  const showSlide = useCallback((index: number) => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const left = index * viewport.clientWidth;
    viewport.scrollTo({
      left,
      behavior: Math.abs(left - viewport.scrollLeft) > viewport.clientWidth + 1 ? "instant" : "auto",
    });
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const observer = new IntersectionObserver(([entry]) => setInView(entry.intersectionRatio >= 0.5), {
      threshold: 0.5,
    });
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!rotating) return;

    let timeout: number | undefined;
    function scheduleNext() {
      window.clearTimeout(timeout);
      if (document.hidden) return;
      timeout = window.setTimeout(() => {
        if (!document.hidden) showSlide((activeIndex + 1) % slides.length);
      }, AUTOPLAY_DELAY);
    }

    scheduleNext();
    document.addEventListener("visibilitychange", scheduleNext);
    return () => {
      window.clearTimeout(timeout);
      document.removeEventListener("visibilitychange", scheduleNext);
    };
  }, [activeIndex, rotating, showSlide]);

  function selectSlide(index: number) {
    setPlayback(false);
    showSlide(index);
  }

  function moveBy(direction: number) {
    selectSlide((activeIndex + direction + slides.length) % slides.length);
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
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setMouseOver(true);
      }}
      onPointerLeave={() => setMouseOver(false)}
      onFocus={(event) => {
        if (event.target.matches(":focus-visible")) setPlayback(false);
      }}
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
          <div className="saas-preview-controls" role="group" aria-label="Screenshot controls">
            <button
              type="button"
              className="no-press"
              aria-label={playing ? "Pause slideshow" : "Play slideshow"}
              title={playing ? "Pause slideshow" : "Play slideshow"}
              aria-controls={viewportId}
              onClick={() => {
                setMouseOver(false);
                setPlayback(!playing);
              }}
            >
              {playing ? <Pause aria-hidden className="size-5" /> : <Play aria-hidden className="size-5" />}
            </button>
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
          onPointerDown={() => setPlayback(false)}
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
            onClick={() => selectSlide(index)}
          >
            <Icon aria-hidden className="size-4 shrink-0" />
            {label}
          </button>
        ))}
      </div>
      <span className="sr-only" aria-live={rotating ? "off" : "polite"} aria-atomic="true">
        {active.title}, screenshot {activeIndex + 1} of {slides.length}
      </span>
    </section>
  );
}
