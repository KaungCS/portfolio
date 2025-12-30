"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import dialoguesList from "../data/dialogues"; // ✅ Moved import here

export default function FloatingProfile({
  visible,
  prefersReducedMotion,
}: Readonly<{
  visible: boolean;
  prefersReducedMotion: boolean;
}>) {
  // --- Blinking State ---
  const [isBlinking, setIsBlinking] = useState(false);
  const blinkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blinkEndTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- Dialogue State (Moved from page.tsx) ---
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [visibleDialogue, setVisibleDialogue] = useState<string>("");
  
  // Refs for logic
  const dialogues = useRef<string[]>(dialoguesList);
  const remainingDialogues = useRef<string[]>([]);
  const typingTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideDialogueTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1. Blinking Logic
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

  // 2. Cleanup Timers on Unmount
  useEffect(() => {
    return () => {
      if (typingTimer.current) clearInterval(typingTimer.current);
      if (hideDialogueTimer.current) clearTimeout(hideDialogueTimer.current);
    };
  }, []);

  // 3. Dialogue Logic (Moved from page.tsx)
  const startDialogue = () => {
    if (isSpeaking) return; // prevent overlapping dialogues

    // Refill and shuffle remainingDialogues if empty
    if (!remainingDialogues.current || remainingDialogues.current.length === 0) {
      const copy = Array.from(dialogues.current || []);
      // Fisher-Yates shuffle
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = copy[i];
        copy[i] = copy[j];
        copy[j] = tmp;
      }
      remainingDialogues.current = copy;
    }

    const choice = remainingDialogues.current.shift() as string;
    if (!choice) return;
    
    setVisibleDialogue("");
    setIsSpeaking(true);

    // Typing effect
    let idx = 0;
    const typingInterval = 40; // ms per character
    typingTimer.current = setInterval(() => {
      idx += 1;
      setVisibleDialogue(choice.slice(0, idx));
      if (idx >= choice.length) {
        if (typingTimer.current) {
          clearInterval(typingTimer.current);
          typingTimer.current = null;
          // start hide timer for 2s after typing finished
          hideDialogueTimer.current = setTimeout(() => {
            setIsSpeaking(false);
            setVisibleDialogue("");
            if (hideDialogueTimer.current) {
              clearTimeout(hideDialogueTimer.current);
              hideDialogueTimer.current = null;
            }
          }, 2000);
        }
      }
    }, typingInterval);
  };

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
            {/* Normal / Talking Face */}
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

            {/* Blink Face */}
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

            {/* Speech Bubble */}
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