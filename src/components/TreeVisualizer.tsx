"use client";

import React, { useRef } from "react";
import RadialMaskOverlay, { RadialMaskHandle } from "./RadialMaskOverlay";

export default function TreeVisualizer({
  open,
  onClose,
  origin = { x: "50%", y: "50%" },
}: Readonly<{ open: boolean; onClose: () => void; origin?: { x: string; y: string } }>) {
  const maskRef = useRef<RadialMaskHandle | null>(null);

  const handleClose = async () => {
    // Ask the radial mask to animate close, then inform parent to unmount/hide
    try {
      if (maskRef.current) await maskRef.current.close();
    } catch (e) {
      // ignore
    }
    onClose();
  };

  if (!open) return null;

  return (
    <RadialMaskOverlay ref={maskRef} open={open} origin={origin}>
      <div className="relative z-70 w-full h-full flex items-center justify-center">
        <div className="max-w-4xl w-full p-6 md:p-12 text-white">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Degree Path</h2>
            <button
              onClick={handleClose}
              className="rounded bg-zinc-800/60 px-4 py-2 text-sm hover:bg-zinc-800"
            >
              Close
            </button>
          </div>

          {/* Simple tree visualizer (SVG) */}
          <div className="w-full bg-black rounded-lg border border-zinc-800 p-6">
            <svg viewBox="0 0 800 400" width="100%" height="320">
              <g stroke="#fff" strokeWidth={2} fill="none" strokeLinecap="round">
                {/* Vertical path line */}
                <path d="M400 20 L400 380" stroke="#fff" strokeWidth={2} />
                {/* Nodes */}
                <g fill="#fff">
                  <circle cx="400" cy="60" r="6" />
                  <circle cx="400" cy="140" r="6" />
                  <circle cx="400" cy="220" r="6" />
                  <circle cx="400" cy="300" r="6" />
                </g>
                {/* Branches */}
                <path d="M400 60 L300 100" stroke="#fff" />
                <path d="M400 140 L500 180" stroke="#fff" />
                <path d="M400 220 L320 260" stroke="#fff" />
                <path d="M400 300 L480 340" stroke="#fff" />
              </g>
              {/* Labels */}
              <g fill="#fff" fontSize="12">
                <text x="240" y="98">Intro to CS</text>
                <text x="420" y="178">Data Structures</text>
                <text x="220" y="258">Algorithms</text>
                <text x="500" y="338">Capstone</text>
              </g>
            </svg>
          </div>

          <p className="mt-6 text-zinc-400">This is a simple static tree visualizer. Replace with an interactive visualization as needed.</p>
        </div>
      </div>
    </RadialMaskOverlay>
  );
}
