"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function FloatingProfile({
  visible,
  prefersReducedMotion,
  isSpeaking,
  visibleDialogue,
  startDialogue,
}: Readonly<{
  visible: boolean;
  prefersReducedMotion: boolean;
  isSpeaking: boolean;
  visibleDialogue: string;
  startDialogue: () => void;
}>) {
  const [isBlinking, setIsBlinking] = useState(false);
  const blinkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blinkEndTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!visible) return;
    if (prefersReducedMotion) return;

    let cancelled = false;

    const scheduleBlink = () => {
      const delay = 3000 + Math.random() * 2000; // 3-5s
      blinkTimer.current = setTimeout(() => {
        if (cancelled) return;
        setIsBlinking(true);
        blinkEndTimer.current = setTimeout(() => {
          setIsBlinking(false);
          if (!cancelled) scheduleBlink();
        }, 150);
      }, delay);
    };

    scheduleBlink();

    return () => {
      cancelled = true;
      if (blinkTimer.current) clearTimeout(blinkTimer.current);
      if (blinkEndTimer.current) clearTimeout(blinkEndTimer.current);
    };
  }, [visible, prefersReducedMotion]);

  if (!visible) return null;

  return (
    <div className="flex-shrink-0 flex items-center justify-center md:justify-end">
      <div style={{ transform: "translateX(-12px)" }}>
        <div
          className="relative"
          style={{
            animation: prefersReducedMotion ? "none" : "float 3s ease-in-out infinite",
          }}
        >
          <div
            role={isSpeaking ? undefined : "button"}
            tabIndex={isSpeaking ? -1 : 0}
            onKeyDown={(e) => {
              if (isSpeaking) return;
              if (e.key === "Enter" || e.key === " ") startDialogue();
            }}
            onClick={() => {
              if (isSpeaking) return;
              startDialogue();
            }}
            style={{
              position: "relative",
              width: "230px",
              height: "230px",
              borderRadius: "9999px",
              background: "#ffffff",
              padding: "8px",
              boxSizing: "border-box",
              border: "2px solid rgba(0,0,0,0.08)",
              cursor: isSpeaking ? "default" : "pointer",
            }}
          >
            <Image
              src={isSpeaking ? "/profile-talking-normal.png?v=2" : "/profile-normal.png?v=2"}
              alt="Profile"
              width={214}
              height={214}
              className="object-contain rounded-full"
              unoptimized
              style={{
                position: "absolute",
                top: 8,
                left: 8,
                opacity: isBlinking ? 0 : 1,
                transition: "opacity 0.1s ease-in-out",
              }}
            />

            <Image
              src={isSpeaking ? "/profile-talking-blink.png?v=2" : "/profile-blink.png?v=2"}
              alt="Profile Blink"
              width={214}
              height={214}
              className="object-contain rounded-full"
              unoptimized
              style={{
                position: "absolute",
                top: 8,
                left: 8,
                opacity: isBlinking ? 1 : 0,
                transition: "opacity 0.1s ease-in-out",
              }}
            />

            {isSpeaking && (
              <div
                role="status"
                aria-live="polite"
                aria-atomic="true"
                style={{
                  position: "absolute",
                  bottom: "110%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  pointerEvents: "none",
                  width: "min(320px, 70vw)",
                }}
              >
                <div className="bg-white text-black rounded-lg border border-zinc-200 px-3 py-2 shadow-md">
                  <span className="text-sm leading-relaxed">{visibleDialogue}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
