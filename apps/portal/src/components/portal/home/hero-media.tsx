"use client";

import { useEffect, useRef, useState } from "react";

/** Chrome's Network Information API isn't in the DOM typings. */
type NavigatorWithConnection = Navigator & { connection?: { saveData?: boolean } };

/**
 * An optional looping video over the hero photo. The photo stays underneath, so the video
 * only fades in once it is really playing. Skipped for visitors who asked for less motion or
 * less data. Decided in an effect, so the server HTML and first client render match (nothing).
 */
export function HeroMedia({ videoUrl, posterUrl }: { videoUrl?: string; posterUrl: string }) {
  const [allowed, setAllowed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoUrl) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const saveData = (navigator as NavigatorWithConnection).connection?.saveData === true;
    const update = () => setAllowed(!reduceMotion.matches && !saveData);
    update();
    reduceMotion.addEventListener("change", update);
    return () => reduceMotion.removeEventListener("change", update);
  }, [videoUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!allowed || !video) return;
    return () => {
      video.pause();
      video.removeAttribute("src");
      video.load(); // releases the download
    };
  }, [allowed, videoUrl]);

  if (!videoUrl || !allowed) return null;

  return (
    <video
      key={videoUrl}
      ref={videoRef}
      src={videoUrl}
      poster={posterUrl}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden
      tabIndex={-1}
      disablePictureInPicture
      disableRemotePlayback
      onPlaying={() => setPlaying(true)}
      onError={() => setPlaying(false)}
      className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 ${
        playing ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}
