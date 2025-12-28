"use client";

import React, { useRef } from "react";
import RadialMaskOverlay, { RadialMaskHandle } from "./RadialMaskOverlay";
import InteractiveTree from "./InteractiveTree";
// ✅ Fix 1: Modern Import
import treeData from "../data/tree";
import type { TreeNode } from "../data/tree";
// ✅ Fix 2: Import our new hook
import useWindowSize from "../hooks/useWindowSize";

export default function TreeVisualizer({
  open,
  onClose,
  origin = { x: "50%", y: "50%" },
  prefersReducedMotion = false,
}: Readonly<{ open: boolean; onClose: () => void; origin?: { x: string; y: string }; prefersReducedMotion?: boolean; }>) {
  const maskRef = useRef<RadialMaskHandle | null>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement | null>(null);
  const [selectedNode, setSelectedNode] = React.useState<null | TreeNode>(null);
  
  // ✅ Fix 3: Get window size to make tree responsive
  const { width } = useWindowSize();
  
  // Logic: On mobile (<768px), make it narrow but TALL so nodes stack nicely.
  // On desktop, use the wide landscape view.
  const isMobile = width ? width < 768 : false;
  const treeWidth = isMobile ? (width ? width - 40 : 350) : 1000;
  const treeHeight = 600; // fixed height for simplicity

  const handleClose = async () => {
    try {
      if (maskRef.current) await maskRef.current.close();
    } catch (e) { /* ignore */ }
    onClose();
  };

  const handleOpened = () => {
    try { closeButtonRef.current?.focus(); } catch (e) {}
  };

  if (!open) return null;

  return (
    <RadialMaskOverlay ref={maskRef} open={open} origin={origin} onOpened={handleOpened} onRequestClose={() => onClose()} prefersReducedMotion={prefersReducedMotion}>
      <div className="relative z-70 w-full h-full flex items-center justify-center pointer-events-none">
        {/* pointer-events-auto added to children so you can click the tree but clicks outside pass through if needed */}
        <div className="max-w-4xl w-full p-6 md:p-12 text-white pointer-events-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Degree Path</h2>
            <button
              ref={closeButtonRef}
              onClick={handleClose}
              className="rounded bg-zinc-800/60 px-4 py-2 text-sm hover:bg-zinc-800 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-emerald-500 cursor-pointer"
            >
              Close
            </button>
          </div>

          {/* Interactive tree visualizer */}
          <div className="w-full bg-black rounded-lg border border-zinc-800 p-2 md:p-6 overflow-hidden">
            <InteractiveTree 
              nodes={treeData} 
              width={treeWidth} 
              height={treeHeight} 
              onNodeClick={(n) => setSelectedNode(n)} 
            />
          </div>

          <div className="mt-6 text-zinc-400 min-h-[80px]">
            <div className="sr-only" aria-live="polite">
              {selectedNode ? `${selectedNode.label} selected. ${selectedNode.description ?? ""}` : ""}
            </div>

            {selectedNode ? (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h3 className="text-white text-lg font-semibold flex items-center gap-2">
                  {/* USE THIS LINE: If fullTitle exists, use it. Otherwise fallback to label. */}
                  {selectedNode.fullTitle || selectedNode.label}

                  {selectedNode.status === 'completed' && <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">Completed</span>}
                  {selectedNode.status === 'in-progress' && <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">In Progress</span>}
                </h3>
                <p className="mt-2 text-sm md:text-base leading-relaxed">{selectedNode.description}</p>
              </div>
            ) : (
              <p className="opacity-50 text-sm md:text-base">
                {isMobile ? "Tap nodes to see details. Drag to pan." : "Hover nodes to highlight, click to open details. Wheel to zoom."}
              </p>
            )}
          </div>
        </div>
      </div>
    </RadialMaskOverlay>
  );
}