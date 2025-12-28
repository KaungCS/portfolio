"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { TreeNode } from "../data/tree";

type InteractiveTreeProps = Readonly<{
  nodes: TreeNode[];
  width?: number;
  height?: number;
  onNodeClick?: (node: TreeNode) => void;
}>;

const STATUS_COLORS = {
  completed: { bg: "#10b981", stroke: "#059669", text: "#ecfdf5" },
  'in-progress': { bg: "#f59e0b", stroke: "#d97706", text: "#fffbeb" },
  planned: { bg: "#3f3f46", stroke: "#27272a", text: "#f4f4f5" },
};

// --- Horizontal Layout Engine ---
function layoutNodes(nodes: TreeNode[], width: number, height: number) {
  // A. Build Graph
  const byId = new Map(nodes.map((n) => [n.id, { ...n, children: [] as string[] }]));
  const roots: string[] = [];
  
  nodes.forEach(n => {
    // Robust check for singular parent
    if (n.parent && byId.has(n.parent)) {
      (byId.get(n.parent) as any).children.push(n.id);
    } else {
      roots.push(n.id);
    }
  });

  // B. Calculate Depths (This will map to X-AXIS now)
  const depths = new Map<string, number>();
  const maxDepth = { val: 0 };
  const calcDepth = (id: string, d: number) => {
    depths.set(id, d);
    maxDepth.val = Math.max(maxDepth.val, d);
    (byId.get(id) as any).children.forEach((c: string) => calcDepth(c, d + 1));
  };
  roots.forEach(r => calcDepth(r, 0));

  // C. Calculate Breadth Positions (This will map to Y-AXIS now)
  const positions = new Map<string, number>();
  let currentLeafSlot = 0;
  const SLOT_SPACING = 1;

  const assignSlots = (id: string) => {
    const node = byId.get(id) as any;
    if (node.children.length === 0) {
      positions.set(id, currentLeafSlot);
      currentLeafSlot += SLOT_SPACING;
    } else {
      node.children.forEach((c: string) => assignSlots(c));
      // Center parent vertically next to children
      const childSlots = node.children.map((c: string) => positions.get(c)!);
      const avgSlot = childSlots.reduce((a: number, b: number) => a + b, 0) / childSlots.length;
      positions.set(id, avgSlot);
    }
  };
  roots.forEach(r => assignSlots(r));

  // D. Scale to fit (Horizontal Orientation)
  const finalLayout: Record<string, { x: number; y: number; depth: number }> = {};
  
  // Normalize Breadth (Y)
  const allSlots = Array.from(positions.values());
  const minSlot = Math.min(...allSlots);
  const maxSlot = Math.max(...allSlots);
  const totalHeightSlots = Math.max(1, maxSlot - minSlot);
  
  // Padding
  const paddingX = 40;
  const paddingY = 60;
  const usableWidth = width - (paddingX * 2);
  const usableHeight = height - (paddingY * 2);

  nodes.forEach(n => {
    const rawDepth = depths.get(n.id) || 0; // X axis
    const rawSlot = positions.get(n.id) || 0; // Y axis

    // X = Depth (Timeline)
    const x = (rawDepth / Math.max(1, maxDepth.val)) * usableWidth + paddingX;
    
    // Y = Slot (Vertical Stack)
    const y = ((rawSlot - minSlot) / totalHeightSlots) * usableHeight + paddingY;

    finalLayout[n.id] = { x, y, depth: rawDepth };
  });

  return { layout: finalLayout };
}

export default function InteractiveTree({ nodes, width = 800, height = 320, onNodeClick }: InteractiveTreeProps) {
  const rootId = nodes.find(n => !n.parent)?.id || nodes[0]?.id;
  const [focusedId, setFocusedId] = useState<string>(rootId);
  const [hovered, setHovered] = useState<string | null>(null);
  
  // Camera State
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);

  // Recalculate layout
  const { layout } = useMemo(() => layoutNodes(nodes, width, height), [nodes, width, height]);

  useEffect(() => setIsLoaded(true), []);

  // --- Auto-Pan Logic ---
  useEffect(() => {
    if (!focusedId || !layout[focusedId]) return;

    const target = layout[focusedId];
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Center the target
    const newX = centerX - (target.x * scale);
    const newY = centerY - (target.y * scale);
    
    setOffset({ x: newX, y: newY });
    
  }, [focusedId, layout, width, height, scale]);

  // Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) return; 
    const delta = -e.deltaY / 1000;
    setScale((s) => Math.max(0.5, Math.min(2.5, s + delta)));
  };

  const handleNodeClick = (n: TreeNode) => {
    setFocusedId(n.id);
    onNodeClick?.(n);
  };

  return (
    <div 
        className="relative w-full h-full overflow-hidden select-none touch-none bg-black/20"
        onWheel={handleWheel}
    >
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} role="tree">
        <g 
          style={{ 
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transition: "transform 1s cubic-bezier(0.2, 0.8, 0.2, 1)" 
          }}
        >
          
          {/* 1. LINKS */}
          {nodes.map((n) => {
            if (!n.parent) return null;
            const a = layout[n.id]; // Child
            const b = layout[n.parent]; // Parent
            if (!a || !b) return null;

            const isUnlocked = n.status === 'completed';
            const length = Math.hypot(a.x - b.x, a.y - b.y); 

            return (
              <line
                key={`link-${n.id}`}
                x1={b.x} y1={b.y} x2={a.x} y2={a.y}
                stroke={isUnlocked ? "#10b981" : "#3f3f46"}
                strokeWidth={isUnlocked ? 2.5 : 1.5}
                strokeDasharray={length}
                strokeDashoffset={isLoaded ? 0 : length}
                style={{ transition: "stroke-dashoffset 0.6s ease-out", transitionDelay: `${b.depth * 0.15}s` }}
                className="pointer-events-none"
              />
            );
          })}

          {/* 2. NODES */}
          {nodes.map((n) => {
            const p = layout[n.id];
            if (!p) return null;
            const isHovered = hovered === n.id;
            const isFocused = focusedId === n.id;
            const colors = STATUS_COLORS[n.status] || STATUS_COLORS.planned;

            return (
              <g
                key={n.id}
                transform={`translate(${p.x}, ${p.y})`}
                onMouseEnter={() => setHovered(n.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={(e) => {
                    e.stopPropagation(); 
                    handleNodeClick(n);
                }}
                className="transition-transform duration-200 cursor-pointer"
              >
                {/* Focus Ring */}
                {isFocused && (
                   <circle 
                    r={28} 
                    fill="none" 
                    stroke="#fff" 
                    strokeWidth={1.5} 
                    strokeDasharray="6 4" 
                    className="animate-spin-slow opacity-60" 
                    style={{ animationDuration: '8s' }} 
                   />
                )}

                {/* Node Circle */}
                <circle
                  r={isFocused ? 16 : isHovered ? 13 : 10}
                  fill={isFocused ? "#fff" : colors.bg}
                  stroke={isFocused ? colors.bg : colors.stroke}
                  strokeWidth={isFocused || isHovered ? 3 : 2}
                  className="transition-all duration-200"
                />

                {/* LABEL: Positioned BELOW the node for horizontal tree */}
                <text
                  x={0} 
                  y={28} // Push down below circle
                  fontSize={13}
                  fontWeight={isFocused ? "bold" : "600"}
                  fill={isFocused ? "#fff" : colors.text}
                  textAnchor="middle" // Center text
                  className="pointer-events-none select-none"
                  style={{ 
                    textShadow: '0px 2px 4px rgba(0,0,0,0.9)', // Lighter shadow for readability
                    paintOrder: "stroke",
                    stroke: "#09090b",
                    strokeWidth: "4px",
                    strokeLinecap: "round",
                    strokeLinejoin: "round"
                  }}
                >
                  {n.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
      
      {/* Helper text */}
      <div className="absolute bottom-4 left-0 w-full text-center pointer-events-none">
        <p className="text-zinc-500 text-xs opacity-60">Tap any node to center</p>
      </div>
    </div>
  );
}