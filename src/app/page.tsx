"use client";

import { Github, Linkedin, Mail, Code2, Database, Globe, Map } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import Image from "next/image";
import FloatingProfile from "../components/FloatingProfile";
import OutroSequence from "../components/OutroSequence";
import AcademicProgress from "../components/AcademicProgress";
import TreeVisualizer from "../components/TreeVisualizer";
import treeData from "../data/tree";
import ScrambleText from "../components/ScrambleText";
import Bookshelf from "../components/Bookshelf";
import StatsCard from "../components/StatsCard";

// ... (Keep existing types AnimationPhase, OutroPhase) ...
type AnimationPhase = "white" | "frame1" | "frame2" | "frame3" | "frame4" | "frame5" | "slicing" | "complete";
type OutroPhase = "idle" | "frame1" | "frame2" | "frame3" | "frame4" | "frame5" | "done";

export default function Home() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);
  const [phase, setPhase] = useState<AnimationPhase>("complete");
  const [currentFrame, setCurrentFrame] = useState(1);
  
  const [outroPhase, setOutroPhase] = useState<OutroPhase>("idle");
  const [outroFrame, setOutroFrame] = useState(1);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const [pendingLabel, setPendingLabel] = useState<string | null>(null);
  const outroTimers = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const introTimers = useRef<number[]>([]);
  
  const [showTree, setShowTree] = useState<{ open: boolean; origin?: { x: string; y: string } }>({ open: false });

  // Dynamic calculation of academic progress
  const completedNodes = treeData.filter((n) => n.status === "completed").length;
  const totalNodes = treeData.length;
  const progressPercentage = Math.floor((completedNodes / totalNodes) * 100);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: "smooth" });
  };

  const openTreeFromEvent = (e?: MouseEvent) => {
    let origin = { x: "50%", y: "50%" };
    try {
      if (e && typeof window !== "undefined") {
        const x = Math.round((e.clientX / window.innerWidth) * 100);
        const y = Math.round((e.clientY / window.innerHeight) * 100);
        origin = { x: `${x}%`, y: `${y}%` };
      }
    } catch (err) {}
    setShowTree({ open: true, origin });
  };

  useEffect(() => {
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

    try { var pre = document.getElementById('intro-fallback'); if (pre) pre.remove(); } catch (e) {}

    if (reduced) {
      setPhase("complete");
      return;
    }

    setPhase("white");

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
      // ... (Keep existing intro timer logic) ...
      const t1 = window.setTimeout(() => { setPhase("frame1"); setCurrentFrame(1); }, 500);
      introTimers.current.push(t1);
      const t2 = window.setTimeout(() => { setPhase("frame2"); setCurrentFrame(2); }, 800);
      introTimers.current.push(t2);
      const t3 = window.setTimeout(() => { setPhase("frame3"); setCurrentFrame(3); }, 1100);
      introTimers.current.push(t3);
      const t4 = window.setTimeout(() => { setPhase("frame4"); setCurrentFrame(4); }, 1300);
      introTimers.current.push(t4);
      const t5 = window.setTimeout(() => { setPhase("frame5"); setCurrentFrame(5); }, 1400);
      introTimers.current.push(t5);
      const slicingTimer = window.setTimeout(() => { setPhase("slicing"); }, 1800);
      introTimers.current.push(slicingTimer);
      const completeTimer = window.setTimeout(() => { setPhase("complete"); }, 2300);
      introTimers.current.push(completeTimer);
    };

    const finishPreload = () => {
      if (preloadTimeout) { clearTimeout(preloadTimeout); preloadTimeout = null; }
      rafA = requestAnimationFrame(() => {
        rafB = requestAnimationFrame(() => {
          startIntroTimers();
        });
      });
    };

    preloadTimeout = setTimeout(() => { finishPreload(); }, 500);

    imageSrcs.forEach((src) => {
      const img = document.createElement('img') as HTMLImageElement;
      images.push(img);
      img.onload = () => { loadedCount += 1; if (loadedCount === imageSrcs.length) finishPreload(); };
      img.onerror = () => {};
      img.src = src;
    });

    return () => {
      introTimers.current.forEach(clearTimeout);
      introTimers.current = [];
      if (preloadTimeout) clearTimeout(preloadTimeout);
      if (rafA !== null) cancelAnimationFrame(rafA);
      if (rafB !== null) cancelAnimationFrame(rafB);
    };
  }, []);

  useEffect(() => {
    return () => { outroTimers.current.forEach(clearTimeout); };
  }, []);

  const startOutro = (url: string, label: string) => {
    // ... (Keep existing startOutro logic) ...
    if (prefersReducedMotion) {
      try { window.open(url, "_blank", "noopener,noreferrer"); } catch (e) {}
      setOutroPhase("done"); setPendingUrl(null); setPendingLabel(null);
      return;
    }
    outroTimers.current.forEach(clearTimeout);
    outroTimers.current = [];
    setPendingUrl(url); setPendingLabel(label);
    setOutroFrame(1); setOutroPhase("frame1");

    const schedule = (phase: Exclude<OutroPhase, "idle" | "done">, frame: number, delay: number) => {
      outroTimers.current.push(setTimeout(() => { setOutroPhase(phase); setOutroFrame(frame); }, delay));
    };
    schedule("frame1", 1, 0);
    schedule("frame2", 2, 800);
    schedule("frame3", 3, 1000);
    schedule("frame4", 4, 1200);
    schedule("frame5", 5, 1400);

    outroTimers.current.push(setTimeout(() => {
      window.open(url, "_blank", "noopener,noreferrer");
      setOutroPhase("done"); setPendingUrl(null); setPendingLabel(null);
    }, 1600));
  };

  const handleContact = (type: "github" | "linkedin" | "email") => {
    if (outroPhase !== "idle" && outroPhase !== "done") return;
    const urls: Record<string, string> = {
      github: "https://github.com/KaungCS",
      linkedin: "https://linkedin.com/in/kaunglin",
      email: "mailto:kaunglin445@gmail.com",
    };
    const labels: Record<string, string> = {
      github: "GitHub", linkedin: "LinkedIn", email: "Email",
    };
    startOutro(urls[type], labels[type]);
  };

  const setReducedPreference = (value: boolean) => {
    setPrefersReducedMotion(value);
    if (typeof window !== "undefined") {
      try { localStorage.setItem("reducedMotion", value ? "1" : "0"); } catch (e) {}
    }
    if (value) {
      introTimers.current.forEach(clearTimeout); introTimers.current = []; setPhase("complete");
      try { if (typeof window !== 'undefined') (window as any).__introPlayed = true; } catch (e) {}
      outroTimers.current.forEach(clearTimeout); outroTimers.current = []; setOutroPhase("idle"); setPendingUrl(null); setPendingLabel(null);
      // Blink timers removed from here
    } else {
      introTimers.current.forEach(clearTimeout); introTimers.current = []; setPhase("complete");
    }
  };

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Reduced motion toggle */}
      <div className="fixed top-4 right-4 z-60">
        <button
          type="button"
          role="switch"
          aria-checked={prefersReducedMotion}
          onClick={() => setReducedPreference(!prefersReducedMotion)}
          className="inline-flex items-center gap-2 p-1 rounded-full bg-zinc-900/60 border border-zinc-800 text-sm"
        >
          <span className="sr-only">Toggle reduced motion</span>
          <div aria-hidden className={`w-12 h-6 flex items-center p-1 rounded-full transition-colors ${prefersReducedMotion ? "bg-emerald-500" : "bg-zinc-700"}`}>
            <div className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform ${prefersReducedMotion ? "translate-x-6" : "translate-x-0"}`} />
          </div>
          <span className="inline text-zinc-300 text-sm pr-2">Reduced Motion</span>
        </button>
      </div>

      {/* Intro Cutscene */}
      {phase !== "complete" && (
         <div className="fixed inset-0 z-50 pointer-events-none" style={{ overflow: "hidden" }}>
           {/* ... (Keep existing intro JSX) ... */}
           <div className="absolute inset-0 bg-white" style={{ opacity: phase === "white" || phase === "frame1" || phase === "frame2" || phase === "frame3" || phase === "frame4" || phase === "frame5" ? 1 : 0, transition: "opacity 0.3s ease-in-out" }} />
           {(phase === "frame1" || phase === "frame2" || phase === "frame3" || phase === "frame4" || phase === "frame5") && (
             <div className="absolute inset-0 flex items-center justify-center" style={{ opacity: 1 }}>
               {[1, 2, 3, 4, 5].map((frameNum) => (
                 <div key={frameNum} style={{ position: "absolute", opacity: currentFrame === frameNum ? 1 : 0, transition: "opacity 0.2s ease-in-out", mixBlendMode: "multiply", filter: "contrast(1.05)" }}>
                    <Image src={`/character-frame${frameNum}.png`} alt={`Character Frame ${frameNum}`} width={400} height={400} className="object-contain" priority />
                 </div>
               ))}
             </div>
           )}
           {phase === "slicing" && (
             <>
               <div className="absolute inset-0 bg-white" style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)", animation: "slideUpRight 0.8s ease-out forwards" }} />
               <div className="absolute inset-0 bg-white" style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%)", animation: "slideDownLeft 0.8s ease-out forwards" }} />
             </>
           )}
         </div>
      )}

      <OutroSequence outroPhase={outroPhase} outroFrame={outroFrame} />

      <TreeVisualizer open={showTree.open} origin={showTree.origin} onClose={() => setShowTree({ open: false })} prefersReducedMotion={prefersReducedMotion} />

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {pendingLabel && outroPhase !== "idle" ? `Opening ${pendingLabel} in a new tab.` : ""}
      </div>

      <div className={phase === "complete" ? "opacity-100 transition-opacity duration-500" : "opacity-0"}>
      <main className="container mx-auto px-4 py-12 md:py-20">
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          
          {/* Hero Card */}
          <div className="col-span-1 rounded-lg border border-zinc-800 bg-zinc-900/50 p-8 md:col-span-3 md:p-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
              <div className="flex-1">
                <h1 className="text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">Hello, I'm Kaung</h1>
                <p className="mt-4 text-xl text-zinc-400 md:text-2xl">CS Student with an Artist Background</p>
                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <button onClick={() => scrollToSection("projects")} className="cursor-pointer rounded-lg bg-white px-6 py-3 text-base font-medium text-black transition-colors hover:bg-zinc-200 md:px-8 md:py-4 md:text-lg">
                    View Work
                  </button>
                  <button onClick={() => scrollToSection("contact")} className="cursor-pointer rounded-lg border border-zinc-800 px-6 py-3 text-base font-medium transition-colors hover:border-zinc-700 hover:bg-zinc-900/50 md:px-8 md:py-4 md:text-lg">
                    Contact
                  </button>
                </div>
              </div>
              
              {phase === "complete" && (
                <FloatingProfile 
                  visible={true} 
                  prefersReducedMotion={prefersReducedMotion} 
                />
              )}
            </div>
          </div>

          {/* ... (Rest of the components: About, Tech Stack, Projects, etc.) ... */}
          {/* About Card */}
          <div className="group relative col-span-1 rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 md:col-span-2 md:p-8">
            <h2 className="mb-4 text-2xl font-semibold md:text-3xl">About</h2>
            <p className="text-lg leading-relaxed text-zinc-300 md:text-xl">
              Passionate about building accessible software and human-computer interaction. <br/><br/>
              Currently pursuing Computer Science and minoring in Education at the University of Washington. 
              Contributing to a research project focused on safekeeping memories made online for long distance and virtual connections.<br/><br/>
              When not coding, you can find me sketching, taking pictures of scenery, or exploring cafes and restaurants.

            </p>
          </div>

          {/* Tech Stack Card */}
          <div className="group relative col-span-1 rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 md:p-8">
            <ScrambleText 
              as="h2" 
              text="Tech Stack" 
              className="mb-6 text-2xl font-semibold md:text-3xl cursor-default"
              prefersReducedMotion={prefersReducedMotion}
            />
            {/*<h2 className="mb-6 text-2xl font-semibold md:text-3xl">Tech Stack</h2>*/}
            <div className="grid grid-cols-3 gap-6 md:grid-cols-2">
              {[
                { name: "React", icon: Code2 },
                { name: "Next.js", icon: Globe },
                { name: "TypeScript", icon: Code2 },
                { name: "Python", icon: Code2 },
                { name: "Java", icon: Code2 },
                { name: "Tailwind", icon: Database },
              ].map((tech, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="rounded-lg bg-zinc-800/50 p-3"><tech.icon className="h-6 w-6 text-zinc-300 md:h-8 md:w-8" /></div>
                  <span className="text-xs text-zinc-400 md:text-sm">{tech.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 1. SEATTLE MAP (Featured Project) */}
          <div 
            id="projects"
            className="group relative col-span-1 md:col-span-2 rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 transition-all duration-300 hover:border-zinc-600 hover:shadow-[0_0_30px_rgba(16,185,129,0.05)] overflow-hidden flex flex-col justify-between"
          >
            {/* Hover Effect: Subtle Flashlight Glow (Kept for visuals) */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                {/* CUSTOM FAVICON CONTAINER */}
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-zinc-700 bg-black shadow-inner overflow-hidden">
                  <Image 
                    src="/map-icon.png" 
                    alt="Map Icon" 
                    width={100} 
                    height={100} 
                    className={`object-contain ${(prefersReducedMotion?'md:opacity-100':'md:opacity-10')} group-hover:opacity-100 transition-opacity duration-300`}
                  />
                </div>

                <h3 className="text-xl font-semibold md:text-2xl text-zinc-100 group-hover:text-white transition-colors">
                  Kaung's UW | An Interactive Map [WIP]
                </h3>
              </div>
              
              <p className="text-zinc-400 md:text-lg leading-relaxed mb-6">
                A spatial exploration of personal landmarks using a custom flashlight rendering engine. 
                Built with React, Framer Motion, and physics-based interactions to simulate tactile navigation in the dark.
              </p>
            </div>

            {/* BOTTOM ROW: Tags + Button */}
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-auto">
              
              {/* Tech Tags */}
              <div className="flex flex-wrap gap-2">
                <span className="text-xs font-mono bg-zinc-800/80 border border-zinc-700/50 px-2 py-1 rounded text-zinc-300">TypeScript</span>
                <span className="text-xs font-mono bg-zinc-800/80 border border-zinc-700/50 px-2 py-1 rounded text-zinc-300">Framer Motion</span>
                <span className="text-xs font-mono bg-zinc-800/80 border border-zinc-700/50 px-2 py-1 rounded text-zinc-300">Interactive UI</span>
              </div>

              {/* NEW: Dedicated Action Button */}
              <button 
                onClick={(e) => {
                  e.stopPropagation(); // Prevents bubbling if you ever add click logic to the parent later
                  startOutro("https://kaungs-seattle-map.vercel.app/", "UW Map");
                }}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-100 text-zinc-900 rounded-lg font-medium text-sm transition-transform hover:bg-white hover:scale-105 active:scale-95 shadow-lg shadow-emerald-900/10 group/btn"
              >
                View Project
                <Globe className="h-4 w-4 transition-transform group-hover/btn:rotate-12" />
              </button>
            </div>
          </div>

          <div className="group relative col-span-1 rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 transition-all duration-300 hover:border-zinc-700 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] flex flex-col justify-between overflow-hidden">
            {/* HOVER BACKGROUND */}
            <div className="absolute inset-0 z-0 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
              {/* 1. 'object-contain' ensures the tree fits in the card without zooming in too much. 
                2. 'p-4' adds a little padding so the tree doesn't touch the very edges.
              */}
              <Image 
                src="/tree-bg.png" 
                alt="Tree Background"
                fill
                className={`object-contain p-4 ${(prefersReducedMotion?'opacity-0':'opacity-35')}`}
                priority
              />
            </div>

            {/* Card Content - Z-index 10 is crucial so text sits ON TOP of the image */}
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-zinc-700 bg-black shadow-inner overflow-hidden">
                  <Image 
                    src="/tree-icon.png" 
                    alt="Decision Tree Icon" 
                    width={100} 
                    height={100} 
                    className="object-contain"
                  />
                </div>
                <h3 className="text-xl font-semibold md:text-2xl text-zinc-100 group-hover:text-white transition-colors">
                  The Decision Tree
                </h3>
              </div>
              <p className="text-zinc-400 md:text-lg mb-6">An interactive personality quiz with a unique tree result. App only works on PC currently.</p>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-4">
              <div className="flex flex-wrap gap-2">
                <span className="text-xs font-mono bg-zinc-800/80 border border-zinc-700/50 px-2 py-1 rounded text-zinc-300 whitespace-nowrap">JavaScript</span>
                <span className="text-xs font-mono bg-zinc-800/80 border border-zinc-700/50 px-2 py-1 rounded text-zinc-300 whitespace-nowrap">Phaser</span>
                <span className="text-xs font-mono bg-zinc-800/80 border border-zinc-700/50 px-2 py-1 rounded text-zinc-300 whitespace-nowrap">Interactive UI</span>
              </div>

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  startOutro("https://devpost.com/software/the-decision-tree/", "The Decision Tree");
                }}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-zinc-100 text-zinc-900 rounded-lg font-medium text-sm transition-transform hover:bg-white hover:scale-105 active:scale-95 shadow-lg shadow-emerald-900/10 group/btn whitespace-nowrap w-full sm:w-auto"
              >
                View Project
                <Globe className="h-4 w-4 transition-transform group-hover/btn:rotate-12" />
              </button>
            </div>
          </div>

          <div className="col-span-1 rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 transition-all duration-300 hover:border-zinc-700 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] md:p-8">
            <h3 className="mb-3 text-xl font-semibold md:text-2xl">Project Three</h3>
            <p className="text-zinc-400 md:text-lg">Placeholder Description</p>
          </div>

          <div className="col-span-1 md:col-span-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 transition-all duration-300 hover:border-zinc-700 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] md:p-8">
          <Bookshelf />
          </div>

          <StatsCard degreeProgress={progressPercentage} onOpenDegree={(e) => openTreeFromEvent(e)} />

          <div className="col-span-1 rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 overflow-hidden md:col-span-1 flex flex-col md:p-8" style={{ height: "530px" }}>
            <div>
              <h3 className="mb-3 text-xl font-semibold md:text-2xl">On Repeat</h3>
              <p className="text-zinc-400 md:text-lg">My Soundtrack</p>
            </div>
            <div className="flex-1 min-h-0 w-full mt-4">
              <iframe data-testid="embed-iframe" 
                      className="w-full h-full" 
                      style={{ borderRadius: 12, border: "none" }} 
                      src="https://open.spotify.com/embed/playlist/1mBCSmworkxQ2Xm3RBL7FM?utm_source=generator&theme=0" 
                      allowFullScreen 
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                      loading="lazy" 
                      title="On Repeat - Soundtrack" />
            </div>
          </div>
        </div>

        <footer id="contact" className="mt-12 border-t border-zinc-800 pt-8 md:mt-20">
          <div className="flex flex-col items-center justify-center gap-6 md:flex-row md:justify-between">
            <p className="text-zinc-400">© 2025 Kaung Lin. All rights reserved.</p>
              <div className="flex gap-6">
                <button type="button" onClick={() => handleContact("github")} className="rounded-lg border border-zinc-800 p-3 text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-100" aria-label="GitHub">
                  <Github className="h-5 w-5" />
                </button>
                <button type="button" onClick={() => handleContact("linkedin")} className="rounded-lg border border-zinc-800 p-3 text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-100" aria-label="LinkedIn">
                  <Linkedin className="h-5 w-5" />
                </button>
                <button type="button" onClick={() => handleContact("email")} className="rounded-lg border border-zinc-800 p-3 text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-100" aria-label="Email">
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