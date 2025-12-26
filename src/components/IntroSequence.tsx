"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Phase = "white" | "frame1" | "frame2" | "frame3" | "frame4" | "frame5" | "slicing" | "complete";

export default function IntroSequence({
  prefersReducedMotion,
  onComplete,
}: Readonly<{
  prefersReducedMotion: boolean;
  onComplete: () => void;
}>) {
  const [phase, setPhase] = useState<Phase>("white");
  const [currentFrame, setCurrentFrame] = useState(1);
  const timers = useRef<number[]>([]);
  const startedRef = useRef(false);
  const initialPrefersReduced = useRef(prefersReducedMotion);

  useEffect(() => {
    // Only run on initial mount and decide based on persisted system/user pref or a runtime flag.
    if (startedRef.current) return;
    startedRef.current = true;

    const mountTime = Date.now();
    const finishedRef = { current: false } as { current: boolean };

    // If we already ran this session, skip
    try {
      const introFlag = typeof window !== 'undefined' ? (window as any).__introPlayed : undefined;
      console.log('[IntroSequence] mount, initialPrefersReduced=', initialPrefersReduced.current, 'introPlayed=', introFlag);
      if (introFlag) {
        console.log('[IntroSequence] skipping because __introPlayed is set');
        finishedRef.current = true;
        onComplete();
        return;
      }
    } catch (e) {
      console.log('[IntroSequence] error reading __introPlayed', e);
    }

    // Recompute reduced-motion preference directly to avoid prop-timing races
    let reduced = false;
    try {
      const persisted = typeof window !== 'undefined' ? localStorage.getItem('reducedMotion') : null;
      if (persisted !== null) {
        reduced = persisted === '1';
      } else {
        const mql = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
        reduced = !!mql && mql.matches;
      }
      console.log('[IntroSequence] computed reduced=', reduced, 'persisted=', typeof persisted !== 'undefined' ? persisted : null);
    } catch (e) {
      reduced = Boolean(initialPrefersReduced.current);
      console.log('[IntroSequence] fallback reduced=', reduced);
    }

    if (reduced) {
      console.log('[IntroSequence] skipping due to reduced motion');
      finishedRef.current = true;
      onComplete();
      return;
    }

    // Preload character frames and delay start until after a couple of animation frames
    let rafId1: number | null = null;
    let rafId2: number | null = null;
    let startTimeout: number | null = null;
    let preloadTimeout: number | null = null;
    let cancelled = false;

    const scheduleRafStart = () => {
      rafId1 = requestAnimationFrame(() => {
        rafId2 = requestAnimationFrame(() => {
          startTimeout = window.setTimeout(startAnimation, 0);
        });
      });
    };

    const startAnimation = () => {
      if (cancelled) return;
      console.log('[IntroSequence] starting animation (white -> frames)');
      setPhase('white');

    // Kick off a preload for the frames; if they load within 500ms we'll start immediately, otherwise start anyway after the timeout.

      const t1 = window.setTimeout(() => {
        console.log('[IntroSequence] -> frame1');
        setPhase('frame1');
        setCurrentFrame(1);
      }, 500);
      timers.current.push(t1);

      const t2 = window.setTimeout(() => {
        console.log('[IntroSequence] -> frame2');
        setPhase('frame2');
        setCurrentFrame(2);
      }, 800);
      timers.current.push(t2);

      const t3 = window.setTimeout(() => {
        console.log('[IntroSequence] -> frame3');
        setPhase('frame3');
        setCurrentFrame(3);
      }, 1100);
      timers.current.push(t3);

      const t4 = window.setTimeout(() => {
        console.log('[IntroSequence] -> frame4');
        setPhase('frame4');
        setCurrentFrame(4);
      }, 1300);
      timers.current.push(t4);

      const t5 = window.setTimeout(() => {
        console.log('[IntroSequence] -> frame5');
        setPhase('frame5');
        setCurrentFrame(5);
      }, 1400);
      timers.current.push(t5);

      const slicingTimer = window.setTimeout(() => {
        console.log('[IntroSequence] -> slicing');
        setPhase('slicing');
      }, 1800);
      timers.current.push(slicingTimer);

      const completeTimer = window.setTimeout(() => {
        console.log('[IntroSequence] -> complete');
        setPhase('complete');
        try {
          if (typeof window !== 'undefined') (window as any).__introPlayed = true;
        } catch (e) {}
        finishedRef.current = true;
        onComplete();
      }, 2300);
      timers.current.push(completeTimer);
    };

    // Preload frames then schedule start (max wait 500ms)
    const imageSrcs = ['/character-frame1.png','/character-frame2.png','/character-frame3.png','/character-frame4.png','/character-frame5.png'];
    const images: HTMLImageElement[] = [];
    let loadedCount = 0;

    const finishPreloadAndStart = () => {
      if (preloadTimeout !== null) {
        clearTimeout(preloadTimeout);
        preloadTimeout = null;
      }
      scheduleRafStart();
    };

    preloadTimeout = window.setTimeout(() => {
      console.log('[IntroSequence] preload timeout reached, starting animation');
      finishPreloadAndStart();
    }, 500);

    imageSrcs.forEach((src) => {
      const img = document.createElement('img') as HTMLImageElement;
      images.push(img);
      img.onload = () => {
        loadedCount += 1;
        if (loadedCount === imageSrcs.length) {
          console.log('[IntroSequence] all frames preloaded');
          finishPreloadAndStart();
        }
      };
      img.onerror = () => {
        // ignore individual load errors; rely on timeout fallback
      };
      img.src = src;
    });


    return () => {
      cancelled = true;
      if (rafId1 !== null) cancelAnimationFrame(rafId1);
      if (rafId2 !== null) cancelAnimationFrame(rafId2);
      if (startTimeout !== null) clearTimeout(startTimeout);
      if (preloadTimeout !== null) clearTimeout(preloadTimeout);
      // clear any image handlers
      try {
        images.forEach((img) => { img.onload = null; img.onerror = null; });
      } catch (e) {}
      console.log('[IntroSequence] cleaning up timers');
      timers.current.forEach(clearTimeout);
      timers.current = [];
      const elapsed = Date.now() - mountTime;
      // Only mark complete on premature unmount if we've been mounted for >300ms. This avoids marking complete during hydration re-renders.
      if (!finishedRef.current && elapsed >= 300) {
        console.log('[IntroSequence] unmounted after', elapsed, 'ms — calling onComplete');
        finishedRef.current = true;
        onComplete();
      } else {
        console.log('[IntroSequence] unmounted after', elapsed, 'ms — skipping onComplete to allow remount');
      }
    };
    // Intentionally run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (phase === "complete") return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none" style={{ overflow: "hidden" }}>
      {/* White Canvas Background */}
      <div
        className="absolute inset-0 bg-white"
        style={{
          opacity:
            phase === "white" ||
            phase === "frame1" ||
            phase === "frame2" ||
            phase === "frame3" ||
            phase === "frame4" ||
            phase === "frame5"
              ? 1
              : 0,
          transition: "opacity 0.3s ease-in-out",
        }}
      />

      {/* Character Frames - cycle through frame1..frame5 */}
      {(phase === "frame1" ||
        phase === "frame2" ||
        phase === "frame3" ||
        phase === "frame4" ||
        phase === "frame5") && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            opacity: 1,
          }}
        >
          {/* Frame 1 */}
          <div
            style={{
              position: "absolute",
              opacity: currentFrame === 1 ? 1 : 0,
              transition: "opacity 0.2s ease-in-out",
              mixBlendMode: "multiply",
              filter: "contrast(1.05)",
            }}
          >
            <Image
              src="/character-frame1.png"
              alt="Character Frame 1"
              width={400}
              height={400}
              className="object-contain"
              priority
            />
          </div>

          {/* Frame 2 */}
          <div
            style={{
              position: "absolute",
              opacity: currentFrame === 2 ? 1 : 0,
              transition: "opacity 0.2s ease-in-out",
              mixBlendMode: "multiply",
              filter: "contrast(1.05)",
            }}
          >
            <Image
              src="/character-frame2.png"
              alt="Character Frame 2"
              width={400}
              height={400}
              className="object-contain"
              priority
            />
          </div>

          {/* Frame 3 */}
          <div
            style={{
              position: "absolute",
              opacity: currentFrame === 3 ? 1 : 0,
              transition: "opacity 0.2s ease-in-out",
              mixBlendMode: "multiply",
              filter: "contrast(1.05)",
            }}
          >
            <Image
              src="/character-frame3.png"
              alt="Character Frame 3"
              width={400}
              height={400}
              className="object-contain"
              priority
            />
          </div>

          {/* Frame 4 */}
          <div
            style={{
              position: "absolute",
              opacity: currentFrame === 4 ? 1 : 0,
              transition: "opacity 0.2s ease-in-out",
              mixBlendMode: "multiply",
              filter: "contrast(1.05)",
            }}
          >
            <Image
              src="/character-frame4.png"
              alt="Character Frame 4"
              width={400}
              height={400}
              className="object-contain"
              priority
            />
          </div>

          {/* Frame 5 */}
          <div
            style={{
              position: "absolute",
              opacity: currentFrame === 5 ? 1 : 0,
              transition: "opacity 0.2s ease-in-out",
              mixBlendMode: "multiply",
              filter: "contrast(1.05)",
            }}
          >
            <Image
              src="/character-frame5.png"
              alt="Character Frame 5"
              width={400}
              height={400}
              className="object-contain"
              priority
            />
          </div>
        </div>
      )}

      {/* Slicing Animation */}
      {phase === "slicing" && (
        <>
          <div
            className="absolute inset-0 bg-white"
            style={{
              clipPath: "polygon(0 0, 100% 0, 0 100%)",
              animation: "slideUpRight 0.8s ease-out forwards",
            }}
          />
          <div
            className="absolute inset-0 bg-white"
            style={{
              clipPath: "polygon(100% 0, 100% 100%, 0 100%)",
              animation: "slideDownLeft 0.8s ease-out forwards",
            }}
          />
        </>
      )}

      {/* Debug overlay (show when ?debugIntro) */}
      {typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('debugIntro') && (
        <div aria-hidden className="fixed left-2 top-2 z-60 rounded bg-black/70 text-white text-xs p-2">
          <div>Intro debug</div>
          <div>phase: {phase}</div>
          <div>frame: {currentFrame}</div>
        </div>
      )}
    </div>
  );
}
