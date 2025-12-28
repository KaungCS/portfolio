"use client";

import React, { useEffect, useImperativeHandle, useRef, useState } from "react";

export type Origin = { x: string; y: string };

export type RadialMaskHandle = {
  // triggers the close animation and resolves when complete
  close: () => Promise<void>;
};

export default React.forwardRef(function RadialMaskOverlay(
  {
    open,
    origin = { x: "50%", y: "50%" },
    duration = 700,
    children,
    onOpened,
    onRequestClose,
    prefersReducedMotion = false,
  }: Readonly<{
    open: boolean;
    origin?: Origin;
    duration?: number;
    children?: React.ReactNode;
    onOpened?: () => void;
    onRequestClose?: () => void;
    prefersReducedMotion?: boolean;
  }>,
  ref: React.Ref<RadialMaskHandle | null>,
) {
  const [radiusPx, setRadiusPx] = useState<number>(0);
  const [contentVisible, setContentVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const rafRef = useRef<number | null>(null);
  const fallbackRef = useRef<number | null>(null);

  const center = `${origin.x} ${origin.y}`;

  // animate opening (shrink hole)
  const animateOpen = (): Promise<void> => {
    return new Promise((resolve) => {
      setAnimating(true);
      setContentVisible(false);

      if (prefersReducedMotion) {
        setRadiusPx(0);
        setAnimating(false);
        setContentVisible(true);
        onOpened?.();
        resolve();
        return;
      }

      const vmax = Math.max(window.innerWidth, window.innerHeight);
      const startRadius = Math.ceil(vmax * 1.5);
      let start: number | null = null;

      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      // fallback
      if (fallbackRef.current) clearTimeout(fallbackRef.current);
      fallbackRef.current = window.setTimeout(() => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        setRadiusPx(0);
        setAnimating(false);
        setContentVisible(true);
        onOpened?.();
        resolve();
      }, duration + 200);

      const step = (ts: number) => {
        if (!start) start = ts;
        const t = Math.min(1, (ts - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3); // ease-out
        const current = Math.max(0, Math.round(startRadius * (1 - eased)));
        setRadiusPx(current);
        if (t < 1) {
          rafRef.current = requestAnimationFrame(step);
        } else {
          if (fallbackRef.current) clearTimeout(fallbackRef.current);
          rafRef.current = null;
          setRadiusPx(0);
          setAnimating(false);
          setContentVisible(true);
          onOpened?.();
          resolve();
        }
      };

      setRadiusPx(startRadius);
      rafRef.current = requestAnimationFrame(step);
    });
  };

  // animate close (grow hole back out)
  const animateClose = (): Promise<void> => {
    return new Promise((resolve) => {
      setAnimating(true);
      setContentVisible(false);

      const vmax = Math.max(window.innerWidth, window.innerHeight);
      const endRadius = Math.ceil(vmax * 1.5);

      if (prefersReducedMotion) {
        setRadiusPx(endRadius);
        setAnimating(false);
        resolve();
        return;
      }
      
      let start: number | null = null;

      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      // fallback
      if (fallbackRef.current) clearTimeout(fallbackRef.current);
      fallbackRef.current = window.setTimeout(() => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        setAnimating(false);
        resolve();
      }, duration + 200);

      const step = (ts: number) => {
        if (!start) start = ts;
        const t = Math.min(1, (ts - start) / duration);
        const eased = Math.pow(t, 3); // ease-in
        const current = Math.max(0, Math.round(endRadius * eased));
        setRadiusPx(current);
        if (t < 1) {
          rafRef.current = requestAnimationFrame(step);
        } else {
          if (fallbackRef.current) clearTimeout(fallbackRef.current);
          rafRef.current = null;
          setAnimating(false);
          resolve();
        }
      };

      setRadiusPx(0);
      rafRef.current = requestAnimationFrame(step);
    });
  };

  // respond to controlled `open` prop
  useEffect(() => {
    if (open) {
      // begin open animation
      animateOpen().catch(() => {});
    }
    // if parent closes by setting open=false we trigger close animation
    // and do not unmount until finished. Parent is expected to unmount
    // this component after they receive any callback they need.
    if (!open) {
      // when open becomes false we will grow the hole then let parent hide
      animateClose()
        .then(() => {
          // notify parent that we finished closing
          onRequestClose?.();
        })
        .catch(() => {});
    }
    // cleanup on unmount
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (fallbackRef.current) clearTimeout(fallbackRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, origin.x, origin.y]);

  // imperative close: triggers close animation and resolves when finished
  useImperativeHandle(ref, () => ({
    close: async () => {
      await animateClose();
      // if parent provided a request close handler, notify it after animation
      onRequestClose?.();
    },
  }));

  // close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") {
        // trigger close animation and notify parent
        animateClose().then(() => onRequestClose?.()).catch(() => {});
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onRequestClose]);

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center"
      style={{ pointerEvents: animating || contentVisible ? "auto" : "none" }}
      role="dialog"
      aria-modal={true}
      tabIndex={-1}
      aria-hidden={!contentVisible}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "black",
          WebkitMaskImage: `radial-gradient(circle at ${center}, transparent ${radiusPx}px, black calc(${radiusPx}px + 1px))`,
          maskImage: `radial-gradient(circle at ${center}, transparent ${radiusPx}px, black calc(${radiusPx}px + 1px))`,
        }}
      />

      {contentVisible && <div className="relative z-70 w-full h-full">{children}</div>}
    </div>
  );
});
