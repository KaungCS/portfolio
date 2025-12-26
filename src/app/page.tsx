"use client";

import { Github, Linkedin, Mail, Code2, Database, Globe } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import FloatingProfile from "../components/FloatingProfile";
import OutroSequence from "../components/OutroSequence";
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
  // Feature flag: keep refactor changes behind a dev-only flag until tested
  const DEV_REFAC_IN_PROGRESS = true; // set to `false` to use original inline logic

  // Deterministic initial state to prevent server/client hydration mismatch.
  // We decide whether to run the intro inside a client-only effect below.
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);
  const [phase, setPhase] = useState<AnimationPhase>("complete");
  const [currentFrame, setCurrentFrame] = useState(1);
  const [isBlinking, setIsBlinking] = useState(false);
  const [outroPhase, setOutroPhase] = useState<OutroPhase>("idle");
  const [outroFrame, setOutroFrame] = useState(1);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const [pendingLabel, setPendingLabel] = useState<string | null>(null);
  const outroTimers = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const introTimers = useRef<number[]>([]);
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
    // Respect persisted user preference for reduced motion (localStorage), then system preference
    const persisted = typeof window !== "undefined" ? localStorage.getItem("reducedMotion") : null;
    let reduced: boolean;
    if (persisted !== null) {
      reduced = persisted === "1";
    } else {
      const mql = typeof window !== "undefined" && window.matchMedia
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;
      reduced = !!mql && mql.matches;
    }

    setPrefersReducedMotion(reduced);

    // Remove any pre-hydration overlay the inline script may have added
    try { var pre = document.getElementById('intro-fallback'); if (pre) pre.remove(); } catch (e) {}

    if (reduced) {
      // Skip the cutscene entirely
      setPhase("complete");
      return;
    }

    // Start the intro from 'white' now that we're on the client
    setPhase("white");

    // Schedule intro timers and record them so they can be cancelled.
    // Use a conservative start: preload frames with a 500ms timeout fallback, then start after two RAFs.
    const imageSrcs = ['/character-frame1.png','/character-frame2.png','/character-frame3.png','/character-frame4.png','/character-frame5.png'];
    const images = [] as HTMLImageElement[];
    let loadedCount = 0;
    let preloadTimeout: ReturnType<typeof setTimeout> | null = null;
    let rafA: number | null = null;
    let rafB: number | null = null;
    let startScheduled = false;

    const startIntroTimers = () => {
      if (startScheduled) return;
      startScheduled = true;

      const t1 = window.setTimeout(() => {
        setPhase("frame1");
        setCurrentFrame(1);
      }, 500);
      introTimers.current.push(t1);

      const t2 = window.setTimeout(() => {
        setPhase("frame2");
        setCurrentFrame(2);
      }, 800);
      introTimers.current.push(t2);

      const t3 = window.setTimeout(() => {
        setPhase("frame3");
        setCurrentFrame(3);
      }, 1100);
      introTimers.current.push(t3);

      const t4 = window.setTimeout(() => {
        setPhase("frame4");
        setCurrentFrame(4);
      }, 1300);
      introTimers.current.push(t4);

      const t5 = window.setTimeout(() => {
        setPhase("frame5");
        setCurrentFrame(5);
      }, 1400);
      introTimers.current.push(t5);

      const slicingTimer = window.setTimeout(() => {
        setPhase("slicing");
      }, 1800);
      introTimers.current.push(slicingTimer);

      const completeTimer = window.setTimeout(() => {
        setPhase("complete");
      }, 2300);
      introTimers.current.push(completeTimer);
    };

    const finishPreload = () => {
      if (preloadTimeout) {
        clearTimeout(preloadTimeout);
        preloadTimeout = null;
      }
      // schedule start after two RAFs to avoid hydration races
      rafA = requestAnimationFrame(() => {
        rafB = requestAnimationFrame(() => {
          startIntroTimers();
        });
      });
    };

    // start a timeout fallback in case images fail to load
    preloadTimeout = setTimeout(() => {
      finishPreload();
    }, 500);

    imageSrcs.forEach((src) => {
      const img = document.createElement('img') as HTMLImageElement;
      images.push(img);
      img.onload = () => {
        loadedCount += 1;
        if (loadedCount === imageSrcs.length) finishPreload();
      };
      img.onerror = () => {
        // ignore individual load errors
      };
      img.src = src;
    });

    return () => {
      // cleanup all intro timers and preload handlers
      introTimers.current.forEach(clearTimeout);
      introTimers.current = [];
      if (preloadTimeout) clearTimeout(preloadTimeout);
      if (rafA !== null) cancelAnimationFrame(rafA);
      if (rafB !== null) cancelAnimationFrame(rafB);
      try { images.forEach((img) => { img.onload = null; img.onerror = null; }); } catch (e) {}
    };
  }, []);

  // Blinking animation for profile picture
  useEffect(() => {
    // Debug: when the intro completes, log the runtime flag for verification (dev-only)
    if (DEV_REFAC_IN_PROGRESS && phase === "complete") {
      try {
        // eslint-disable-next-line no-console
        console.log('[Home] phase complete, __introPlayed=', (typeof window !== 'undefined') ? (window as any).__introPlayed : undefined);
      } catch (e) {}
    }

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
    // If user prefers reduced motion, open immediately and skip outro animation
    if (prefersReducedMotion) {
      try {
        window.open(url, "_blank", "noopener,noreferrer");
      } catch (e) {
        /* ignore */
      }
      setOutroPhase("done");
      setPendingUrl(null);
      setPendingLabel(null);
      return;
    }

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
    // frame1: 0ms (start), frame2: 800ms, frame3: 1000ms, frame4: 1200ms, frame5: 1400ms
    schedule("frame1", 1, 0);
    schedule("frame2", 2, 800);
    schedule("frame3", 3, 1000);
    schedule("frame4", 4, 1200);
    schedule("frame5", 5, 1400);

    // Open link after 1400ms to allow the send-off cutscene (may be blocked by popup blockers)
    outroTimers.current.push(
      setTimeout(() => {
        window.open(url, "_blank", "noopener,noreferrer");
        setOutroPhase("done");
        setPendingUrl(null);
        setPendingLabel(null);
      }, 1600),
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

  // Persisted reduced-motion setter — only affects intro/outro/blink, not dialogue typing
  const setReducedPreference = (value: boolean) => {
    setPrefersReducedMotion(value);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("reducedMotion", value ? "1" : "0");
      } catch (e) {
        // ignore storage errors
      }
    }

    if (value) {
      // Cancel intro timers and mark complete
      introTimers.current.forEach(clearTimeout);
      introTimers.current = [];
      setPhase("complete");

      // Mark the intro as played for this session so toggling doesn't replay it
      try { if (typeof window !== 'undefined') (window as any).__introPlayed = true; } catch (e) {}

      // Cancel outro timers and pending open
      outroTimers.current.forEach(clearTimeout);
      outroTimers.current = [];
      setOutroPhase("idle");
      setPendingUrl(null);
      setPendingLabel(null);

      // Cancel blinking
      if (blinkTimer.current) clearTimeout(blinkTimer.current);
      if (blinkEndTimer.current) clearTimeout(blinkEndTimer.current);
      blinkTimer.current = null;
      blinkEndTimer.current = null;
    } else {
      // User disabled reduced motion — ensure we don't start the intro right away.
      introTimers.current.forEach(clearTimeout);
      introTimers.current = [];
      setPhase("complete");
      // Blinking will resume automatically because phase === 'complete' and prefersReducedMotion is false.
    }
  };

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Reduced motion toggle (fixed top-right) */}
      <div className="fixed top-4 right-4 z-60">
        <button
          type="button"
          role="switch"
          aria-checked={prefersReducedMotion}
          onClick={() => setReducedPreference(!prefersReducedMotion)}
          className="inline-flex items-center gap-2 p-1 rounded-full bg-zinc-900/60 border border-zinc-800 text-sm"
        >
          <span className="sr-only">Toggle reduced motion</span>
          <div
            aria-hidden
            className={`w-12 h-6 flex items-center p-1 rounded-full transition-colors ${prefersReducedMotion ? "bg-emerald-500" : "bg-zinc-700"}`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform ${prefersReducedMotion ? "translate-x-6" : "translate-x-0"}`}
            />
          </div>
          <span className="hidden md:inline text-zinc-300 text-sm pr-2">Reduced Motion</span>
        </button>
      </div>
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

      {/* Outro Cutscene (refactored component) */}
      <OutroSequence outroPhase={outroPhase} outroFrame={outroFrame} />

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
              
              {/* Profile Picture with Blinking Animation (refactored) */}
              {phase === "complete" && (
                <FloatingProfile
                  visible={true}
                  prefersReducedMotion={prefersReducedMotion}
                  isSpeaking={isSpeaking}
                  visibleDialogue={visibleDialogue}
                  startDialogue={startDialogue}
                />
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
