"use client";

import React from "react";

type StatItem = {
  label: string;
  value: number;
  max: number;
  unit?: string;
  color?: string;
};

export default function StatsCard({
  degreeProgress = 64,
  onOpenDegree,
}: {
  degreeProgress?: number;
  onOpenDegree?: (e?: React.MouseEvent) => void;
}) {
  const stats: StatItem[] = [
    { 
      label: "Degree Progress", 
      value: degreeProgress, 
      max: 100, 
      unit: "%", 
      color: "bg-emerald-500" 
    },
    { 
      label: "Blind 75 Progress", 
      value: 16, 
      max: 75, 
      unit: "problems", 
      color: "bg-purple-500" 
    },
  ];

  return (
    // 'h-full' ensures the card stretches to fill the grid cell, so 'mt-auto' works
    <div className="col-span-1 h-full flex flex-col gap-4 rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 transition-all duration-300 hover:border-zinc-700 hover:shadow-[0_0_20px_rgba(255,255,255,0.03)] md:p-8">
      
      {/* HEADER: Just the Title now */}
      <div>
        <h3 className="text-xl font-semibold md:text-2xl mb-2">My Stats</h3>
        <p className="text-zinc-400 text-sm">Tracking growth in all areas.</p>
      </div>

      {/* STATS: Middle Section */}
      <div className="space-y-6">
        {stats.map((stat, i) => {
          const pct = Math.min(100, Math.round((stat.value / stat.max) * 100));
          
          return (
            <div key={i} className="group">
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-zinc-300 font-medium">{stat.label}</span>
                <span className="text-zinc-500 tabular-nums">
                  {(stat.unit === "%") ? `${stat.value}%` : `${stat.value}/${stat.max} ${stat.unit}`}
                </span>
              </div>
              
              <div className="w-full bg-zinc-800/50 rounded-full h-2.5 overflow-hidden border border-zinc-800/50">
                <div
                  className={`h-full rounded-full ${stat.color} transition-all duration-1000 ease-out group-hover:brightness-110`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* FOOTER: Button moved here with 'mt-auto' */}
      <div className="mt-auto pt-4 flex justify-center">
        <button
          type="button"
          onClick={(e) => onOpenDegree?.(e)}
          // Increased padding (px-6 py-2.5) and font size (text-sm)
          className="w-full sm:w-auto text-sm font-medium bg-white hover:bg-zinc-200 text-zinc-950 px-6 py-2.5 rounded-lg transition-transform active:scale-95 shadow-lg shadow-zinc-900/20"
        >
          View Degree Map
        </button>
      </div>
    </div>
  );
}