"use client";

import React from "react";

export default function AcademicProgress({
  progress = 90,
  onOpen,
}: Readonly<{ progress?: number; onOpen?: (e?: React.MouseEvent) => void }>) {
  const pct = Math.max(0, Math.min(100, Math.round(progress)));

  return (
    <div className="col-span-1 rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 transition-all duration-300 hover:border-zinc-700 hover:shadow-[0_0_20px_rgba(255,255,255,0.03)] md:p-8">
      <h3 className="mb-3 text-xl font-semibold md:text-2xl">Academic Progress</h3>
      <p className="text-zinc-400 md:text-lg mb-4">Track degree progress and course path at UW.</p>

      <div className="w-full bg-zinc-800 rounded-full h-4 overflow-hidden mb-4">
        <div
          className="h-full bg-emerald-500 transition-width duration-500"
          style={{ width: `${pct}%` }}
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          role="progressbar"
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-zinc-300 text-sm">{pct}% completed</span>
        <button
          type="button"
          onClick={(e) => onOpen?.(e)}
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200"
        >
          View Degree Path
        </button>
      </div>
    </div>
  );
}
