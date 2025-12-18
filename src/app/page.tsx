"use client";

import { Github, Linkedin, Mail, Code2, Database, Globe } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import dialoguesList from "../data/dialogues";

type AnimationPhase =
  | "white"
  | "frame1"
  | "frame2"
  | "frame3"
  | "frame4"
  | "frame5"
  | "slicing"
  | "complete";

type OutroPhase =
  | "idle"
  | "frame1"
  | "frame2"
  | "frame3"
  | "frame4"
  | "frame5"
  | "done";

export default function Home() {
  const [phase, setPhase] = useState<AnimationPhase>("white");
  const [currentFrame, setCurrentFrame] = useState(1);
  const [isBlinking, setIsBlinking] = useState(false);
  const [outroPhase, setOutroPhase] = useState<OutroPhase>("idle");
  const [outroFrame, setOutroFrame] = useState(1);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const [pendingLabel, setPendingLabel] = useState<string | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const outroTimers = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const blinkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blinkEndTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Speaking / dialogue state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentDialogue, setCurrentDialogue] = useState<string | null>(null);
  const [visibleDialogue, setVisibleDialogue] = useState<string>("");
  const dialogues = useRef<string[]>(dialoguesList);
  // Queue of remaining dialogues (shuffled). Each entry will be shown once
  // before we reshuffle and repeat.
  const remainingDialogues = useRef<string[]>([]);
  const typingTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideDialogueTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Respect user preference for reduced motion
    const mql = typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(prefers-reduced-motion: reduce)")
      : null;
    const reduced = !!mql && mql.matches;
    setPrefersReducedMotion(reduced);

    if (reduced) {
      // Skip the cutscene for users who prefer reduced motion
      setPhase("complete");
      return;
    }

    // Phase 1: White screen (0ms)
    // Phase 2: Frame 1 appears (500ms delay for smooth transition)
    const frame1Timer = setTimeout(() => {
      setPhase("frame1");
      setCurrentFrame(1);
    }, 500);

    // Phase 3: Frame 2 appears (500ms + 300ms = 800ms)
    const frame2Timer = setTimeout(() => {
      setPhase("frame2");
      setCurrentFrame(2);
    }, 800);

    // Phase 4: Frame 3 appears (800ms + 300ms = 1100ms)
    const frame3Timer = setTimeout(() => {
      setPhase("frame3");
      setCurrentFrame(3);
    }, 1100);

    // Phase 5: Frame 4 appears (1300ms)
    const frame4Timer = setTimeout(() => {
      setPhase("frame4");
      setCurrentFrame(4);
    }, 1300);

    // Phase 6: Frame 5 appears (1400ms)
    const frame5Timer = setTimeout(() => {
      setPhase("frame5");
      setCurrentFrame(5);
    }, 1400);

    // Phase 7: Slicing animation starts (1800ms)
    const slicingTimer = setTimeout(() => {
      setPhase("slicing");
    }, 1800);

    // Phase 8: Complete (2300ms - ends animation earlier)
    const completeTimer = setTimeout(() => {
      setPhase("complete");
    }, 2300);

    return () => {
      clearTimeout(frame1Timer);
      clearTimeout(frame2Timer);
      clearTimeout(frame3Timer);
      clearTimeout(frame4Timer);
      clearTimeout(frame5Timer);
      clearTimeout(slicingTimer);
      clearTimeout(completeTimer);
    };
  }, []);

  // Blinking animation for profile picture
  useEffect(() => {
    if (phase !== "complete") return;
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
  }, [phase, prefersReducedMotion]);

  // Cleanup outro timers on unmount
  useEffect(() => {
    return () => {
      outroTimers.current.forEach(clearTimeout);
    };
  }, []);

  // Cleanup speaking timers on unmount
  useEffect(() => {
    return () => {
      if (typingTimer.current) clearInterval(typingTimer.current);
      if (hideDialogueTimer.current) clearTimeout(hideDialogueTimer.current);
    };
  }, []);

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
    setCurrentDialogue(choice);
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
            setCurrentDialogue(null);
            setVisibleDialogue("");
            if (hideDialogueTimer.current) {
              clearTimeout(hideDialogueTimer.current);
              hideDialogueTimer.current = null;
            }
          }, 2000);
        }
      }
    }, typingInterval);

    // After typing finishes, keep the dialogue visible for 2s then hide.
    // We'll schedule this when typing completes below.
  };

  const startOutro = (url: string, label: string) => {
    // Prevent overlapping runs
    outroTimers.current.forEach(clearTimeout);
    outroTimers.current = [];
    setPendingUrl(url);
    setPendingLabel(label);
    setOutroFrame(1);
    setOutroPhase("frame1");

    const schedule = (
      phase: Exclude<OutroPhase, "idle" | "done">,
      frame: number,
      delay: number,
    ) => {
      outroTimers.current.push(
        setTimeout(() => {
          setOutroPhase(phase);
          setOutroFrame(frame);
        }, delay),
      );
    };

    // Custom outro timing:
    // frame1: 0ms (start), frame2: 800ms, frame3: 1000ms, frame4: 1100ms, frame5: 1200ms
    schedule("frame1", 1, 0);
    schedule("frame2", 2, 800);
    schedule("frame3", 3, 1000);
    schedule("frame4", 4, 1100);
    schedule("frame5", 5, 1200);

    // Open link after 1300ms to allow the send-off cutscene (may be blocked by popup blockers)
    outroTimers.current.push(
      setTimeout(() => {
        window.open(url, "_blank", "noopener,noreferrer");
        setOutroPhase("done");
        setPendingUrl(null);
        setPendingLabel(null);
      }, 1400),
    );
  };


  const handleContact = (type: "github" | "linkedin" | "email") => {
    if (outroPhase !== "idle" && outroPhase !== "done") return;
    const urls: Record<string, string> = {
      github: "https://github.com/KaungCS",
      linkedin: "https://linkedin.com/in/kaunglin",
      email: "mailto:kaunglin445@gmail.com",
    };
    const labels: Record<string, string> = {
      github: "GitHub",
      linkedin: "LinkedIn",
      email: "Email",
    };

    startOutro(urls[type], labels[type]);
  };

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Cutscene Overlay */}
      {phase !== "complete" && (
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

          {/* Character Frames - cycle through frame1, frame2, frame3, frame4, frame5 */}
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

          {/* Slicing Animation - starts 1 second after character appears */}
          {phase === "slicing" && (
            <>
              {/* Top-left triangle (moves up-right) */}
              <div
                className="absolute inset-0 bg-white"
                style={{
                  clipPath: "polygon(0 0, 100% 0, 0 100%)",
                  animation: "slideUpRight 0.8s ease-out forwards",
                }}
              />
              {/* Bottom-right triangle (moves down-left) */}
              <div
                className="absolute inset-0 bg-white"
                style={{
                  clipPath: "polygon(100% 0, 100% 100%, 0 100%)",
                  animation: "slideDownLeft 0.8s ease-out forwards",
                }}
              />
            </>
          )}
        </div>
      )}

      {/* Outro Cutscene Overlay */}
      {outroPhase !== "idle" && outroPhase !== "done" && (
        <div className="fixed inset-0 z-50 pointer-events-none" style={{ overflow: "hidden" }}>
          {/* White Background for line-art visibility */}
          <div className="absolute inset-0 bg-white" />

          {/* Outro Frames - cycle through frame1, frame2, frame3, frame4, frame5 */}
          {(outroPhase === "frame1" ||
            outroPhase === "frame2" ||
            outroPhase === "frame3" ||
            outroPhase === "frame4" ||
            outroPhase === "frame5") && (
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
                  opacity: outroFrame === 1 ? 1 : 0,
                  transition: "opacity 0.2s ease-in-out",
                  mixBlendMode: "multiply",
                  filter: "contrast(1.05)",
                }}
              >
                <Image
                  src="/outro-frame1.png"
                  alt="Outro Frame 1"
                  width={800}
                  height={800}
                  className="object-contain"
                  priority
                  unoptimized
                />
              </div>

              {/* Frame 2 */}
              <div
                style={{
                  position: "absolute",
                  opacity: outroFrame === 2 ? 1 : 0,
                  transition: "opacity 0.2s ease-in-out",
                  mixBlendMode: "multiply",
                  filter: "contrast(1.05)",
                }}
              >
                <Image
                  src="/outro-frame2.png"
                  alt="Outro Frame 2"
                  width={800}
                  height={800}
                  className="object-contain"
                  priority
                  unoptimized
                />
              </div>

              {/* Frame 3 */}
              <div
                style={{
                  position: "absolute",
                  opacity: outroFrame === 3 ? 1 : 0,
                  transition: "opacity 0.2s ease-in-out",
                  mixBlendMode: "multiply",
                  filter: "contrast(1.05)",
                }}
              >
                <Image
                  src="/outro-frame3.png"
                  alt="Outro Frame 3"
                  width={800}
                  height={800}
                  className="object-contain"
                  priority
                  unoptimized
                />
              </div>

              {/* Frame 4 */}
              <div
                style={{
                  position: "absolute",
                  opacity: outroFrame === 4 ? 1 : 0,
                  transition: "opacity 0.2s ease-in-out",
                  mixBlendMode: "multiply",
                  filter: "contrast(1.05)",
                }}
              >
                <Image
                  src="/outro-frame4.png"
                  alt="Outro Frame 4"
                  width={800}
                  height={800}
                  className="object-contain"
                  priority
                  unoptimized
                />
              </div>

              {/* Frame 5 */}
              <div
                style={{
                  position: "absolute",
                  opacity: outroFrame === 5 ? 1 : 0,
                  transition: "opacity 0.2s ease-in-out",
                  mixBlendMode: "multiply",
                  filter: "contrast(1.05)",
                }}
              >
                <Image
                  src="/outro-frame5.png"
                  alt="Outro Frame 5"
                  width={800}
                  height={800}
                  className="object-contain"
                  priority
                  unoptimized
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Screen reader announcement for outgoing links */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {pendingLabel && outroPhase !== "idle" ? `Opening ${pendingLabel} in a new tab.` : ""}
      </div>

      {/* Main Content */}
      <div
        className={
          phase === "complete"
            ? "opacity-100 transition-opacity duration-500"
            : "opacity-0"
        }
      >
      <main className="container mx-auto px-4 py-12 md:py-20">
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          {/* Hero Card - Full Width */}
          <div className="col-span-1 rounded-lg border border-zinc-800 bg-zinc-900/50 p-8 md:col-span-3 md:p-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
              <div className="flex-1">
                <h1 className="text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
                  Hello, I'm Kaung
                </h1>
                <p className="mt-4 text-xl text-zinc-400 md:text-2xl">
                  CS Student with an Artist Background
                </p>
                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <button className="rounded-lg bg-white px-6 py-3 text-base font-medium text-black transition-colors hover:bg-zinc-200 md:px-8 md:py-4 md:text-lg">
                    View Work
                  </button>
                  <button className="rounded-lg border border-zinc-800 px-6 py-3 text-base font-medium transition-colors hover:border-zinc-700 hover:bg-zinc-900/50 md:px-8 md:py-4 md:text-lg">
                    Contact
                  </button>
                </div>
              </div>
              
              {/* Profile Picture with Blinking Animation */}
              {phase === "complete" && (
                <div className="flex-shrink-0 flex items-center justify-center md:justify-end">
                  {/* wrapper to nudge the floating avatar slightly left without affecting its float animation */}
                  <div style={{ transform: "translateX(-12px)" }}>
                    <div
                      className="relative"
                      style={{
                        animation: "float 3s ease-in-out infinite",
                      }}
                    >
                      <div
                        // make the avatar clickable; disable when speaking
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
                        {/* Normal/Talking frames */}
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
                        {/* Blinking frame (or talking-blink when speaking) */}
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

                        {/* Speech textbox (positioned above the avatar) */}
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
              )}
            </div>
          </div>

          {/* About Card */}
          <div className="col-span-1 rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 md:col-span-2 md:p-8">
            <h2 className="mb-4 text-2xl font-semibold md:text-3xl">About</h2>
            <p className="text-lg leading-relaxed text-zinc-300 md:text-xl">
              Passionate about building accessible software and human-computer
              interaction. <br/><br/>
              Currently pursuing Computer Science and minoring in Education at the University of Washington.

            </p>
          </div>

          {/* Tech Stack Card */}
          <div className="col-span-1 rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 md:p-8">
            <h2 className="mb-6 text-2xl font-semibold md:text-3xl">
              Tech Stack
            </h2>
            <div className="grid grid-cols-3 gap-6 md:grid-cols-2">
              <div className="flex flex-col items-center gap-2">
                <div className="rounded-lg bg-zinc-800/50 p-3">
                  <Code2 className="h-6 w-6 text-zinc-300 md:h-8 md:w-8" />
                </div>
                <span className="text-xs text-zinc-400 md:text-sm">React</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="rounded-lg bg-zinc-800/50 p-3">
                  <Globe className="h-6 w-6 text-zinc-300 md:h-8 md:w-8" />
                </div>
                <span className="text-xs text-zinc-400 md:text-sm">
                  Next.js
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="rounded-lg bg-zinc-800/50 p-3">
                  <Code2 className="h-6 w-6 text-zinc-300 md:h-8 md:w-8" />
                </div>
                <span className="text-xs text-zinc-400 md:text-sm">
                  TypeScript
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="rounded-lg bg-zinc-800/50 p-3">
                  <Code2 className="h-6 w-6 text-zinc-300 md:h-8 md:w-8" />
                </div>
                <span className="text-xs text-zinc-400 md:text-sm">Python</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="rounded-lg bg-zinc-800/50 p-3">
                  <Code2 className="h-6 w-6 text-zinc-300 md:h-8 md:w-8" />
                </div>
                <span className="text-xs text-zinc-400 md:text-sm">Java</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="rounded-lg bg-zinc-800/50 p-3">
                  <Database className="h-6 w-6 text-zinc-300 md:h-8 md:w-8" />
                </div>
                <span className="text-xs text-zinc-400 md:text-sm">
                  Tailwind
                </span>
              </div>
            </div>
          </div>

          {/* Project Cards */}
          <div className="col-span-1 rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 transition-all duration-300 hover:border-zinc-700 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] md:p-8">
            <h3 className="mb-3 text-xl font-semibold md:text-2xl">
              Project One
            </h3>
            <p className="text-zinc-400 md:text-lg">
              A modern web application built with React and Next.js, featuring
              real-time updates and a beautiful UI.
            </p>
          </div>

          <div className="col-span-1 rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 transition-all duration-300 hover:border-zinc-700 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] md:p-8">
            <h3 className="mb-3 text-xl font-semibold md:text-2xl">
              Project Two
            </h3>
            <p className="text-zinc-400 md:text-lg">
              An innovative mobile-first design system with accessibility at its
              core, built for scale.
            </p>
          </div>

          <div className="col-span-1 rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 transition-all duration-300 hover:border-zinc-700 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] md:p-8">
            <h3 className="mb-3 text-xl font-semibold md:text-2xl">
              Project Three
            </h3>
            <p className="text-zinc-400 md:text-lg">
              A full-stack application leveraging TypeScript and modern
              architecture patterns for optimal performance.
            </p>
          </div>

          {/* On Repeat / Soundtrack Card */}
          <div
            className="col-span-1 rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 overflow-hidden md:col-span-1 flex flex-col md:p-8"
            style={{ height: "530px" }}
          >
            <div>
              <h3 className="mb-3 text-xl font-semibold md:text-2xl">On Repeat</h3>
              <p className="text-zinc-400 md:text-lg">My Soundtrack</p>
            </div>
            <div className="flex-1 min-h-0 w-full mt-4">
              <iframe
                data-testid="embed-iframe"
                className="w-full h-full"
                style={{ borderRadius: 12 }}
                src="https://open.spotify.com/embed/playlist/1mBCSmworkxQ2Xm3RBL7FM?utm_source=generator&theme=0"
                frameBorder={0}
                allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                title="On Repeat - Soundtrack"
              />
            </div>
          </div>
        </div>

        {/* Contact Footer */}
        <footer className="mt-12 border-t border-zinc-800 pt-8 md:mt-20">
          <div className="flex flex-col items-center justify-center gap-6 md:flex-row md:justify-between">
            <p className="text-zinc-400">© 2025 Kaung Lin. All rights reserved.</p>
              <div className="flex gap-6">
                <button
                  type="button"
                  onClick={() => handleContact("github")}
                  className="rounded-lg border border-zinc-800 p-3 text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-100"
                  aria-label="GitHub"
                >
                  <Github className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleContact("linkedin")}
                  className="rounded-lg border border-zinc-800 p-3 text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-100"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleContact("email")}
                  className="rounded-lg border border-zinc-800 p-3 text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-100"
                  aria-label="Email"
                >
                  <Mail className="h-5 w-5" />
                </button>
              </div>
          </div>
        </footer>
      </main>
      </div>
    </div>
  );
}
