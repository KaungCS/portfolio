"use client";

import React from "react";

type StatItem = {
  label: string;
  value: number;    // Current value (e.g., 64)
  max: number;      // Max value (e.g., 100)
  unit?: string;    // e.g., "%", "lbs", "problems"
  color?: string;   // Tailwind color class for the bar
};

export default function StatsCard({
  degreeProgress = 64,
  onOpenDegree,
}: {
  degreeProgress?: number;
  onOpenDegree?: (e?: React.MouseEvent) => void;
}) {
  // Define your stats here
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
      value: 16, // Rough estimate
      max: 75, 
      unit: "problems", 
      color: "bg-purple-500" 
    },
  ];

  return (
    <div className="col-span-1 flex flex-col gap-4 rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 transition-all duration-300 hover:border-zinc-700 hover:shadow-[0_0_20px_rgba(255,255,255,0.03)] md:p-8">
      
      <div>
        <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-semibold md:text-2xl">My Stats</h3>
            {/* The Degree Button is now iconic/compact in the header */}
            <button
                type="button"
                onClick={(e) => onOpenDegree?.(e)}
                className="text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-md transition-colors border border-zinc-700"
            >
                View Degree Map
            </button>
        </div>
        <p className="text-zinc-400 text-sm mb-6">Tracking growth in all areas.</p>
      </div>

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
    </div>
  );
}