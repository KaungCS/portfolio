"use client";

import { Github, Linkedin, Mail, Code2, Database, Globe } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

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
  const outroTimers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => {
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

    // Blink every 3-5 seconds (randomized for natural feel)
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      // Blink duration: 150ms
      setTimeout(() => {
        setIsBlinking(false);
      }, 150);
    }, 3000 + Math.random() * 2000); // Random interval between 3-5 seconds

    return () => clearInterval(blinkInterval);
  }, [phase]);

  // Cleanup outro timers on unmount
  useEffect(() => {
    return () => {
      outroTimers.current.forEach(clearTimeout);
    };
  }, []);

  const startOutro = (url: string) => {
    // Prevent overlapping runs
    outroTimers.current.forEach(clearTimeout);
    outroTimers.current = [];
    setPendingUrl(url);
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

    schedule("frame1", 1, 0);
    schedule("frame2", 2, 400);
    schedule("frame3", 3, 800);
    schedule("frame4", 4, 1200);
    schedule("frame5", 5, 1600);

    // Open link after 2s to allow the send-off cutscene
    outroTimers.current.push(
      setTimeout(() => {
        window.open(url, "_blank", "noopener,noreferrer");
        setOutroPhase("done");
        setPendingUrl(null);
      }, 2000),
    );
  };


  const handleContact = (type: "github" | "linkedin" | "email") => {
    if (outroPhase !== "idle" && outroPhase !== "done") return;
    const urls = {
      github: "https://github.com/KaungCS",
      linkedin: "https://linkedin.com/in/kaunglin",
      email: "mailto:kaunglin445@gmail.com",
    };
    startOutro(urls[type]);
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
          {/* Dark Background */}
          <div className="absolute inset-0 bg-zinc-950" />

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
                }}
              >
                <Image
                  src="/outro-frame1.png"
                  alt="Outro Frame 1"
                  width={1920}
                  height={1080}
                  className="object-cover w-screen h-screen"
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
                }}
              >
                <Image
                  src="/outro-frame2.png"
                  alt="Outro Frame 2"
                  width={1920}
                  height={1080}
                  className="object-cover w-screen h-screen"
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
                }}
              >
                <Image
                  src="/outro-frame3.png"
                  alt="Outro Frame 3"
                  width={1920}
                  height={1080}
                  className="object-cover w-screen h-screen"
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
                }}
              >
                <Image
                  src="/outro-frame4.png"
                  alt="Outro Frame 4"
                  width={1920}
                  height={1080}
                  className="object-cover w-screen h-screen"
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
                }}
              >
                <Image
                  src="/outro-frame5.png"
                  alt="Outro Frame 5"
                  width={1920}
                  height={1080}
                  className="object-cover w-screen h-screen"
                  priority
                  unoptimized
                />
              </div>
            </div>
          )}
        </div>
      )}

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
                  <div
                    className="relative"
                    style={{
                      animation: "float 3s ease-in-out infinite",
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        width: "200px",
                        height: "200px",
                      }}
                    >
                      {/* Normal frame */}
                      <Image
                        src="/profile-normal.png?v=2"
                        alt="Profile"
                        width={200}
                        height={200}
                        className="object-contain rounded-full"
                        unoptimized
                        style={{
                          position: "absolute",
                          opacity: isBlinking ? 0 : 1,
                          transition: "opacity 0.1s ease-in-out",
                        }}
                      />
                      {/* Blinking frame */}
                      <Image
                        src="/profile-blink.png?v=2"
                        alt="Profile Blink"
                        width={200}
                        height={200}
                        className="object-contain rounded-full"
                        unoptimized
                        style={{
                          position: "absolute",
                          opacity: isBlinking ? 1 : 0,
                          transition: "opacity 0.1s ease-in-out",
                        }}
                      />
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
              interaction.
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
