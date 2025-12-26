"use client";

import Image from "next/image";

type OutroPhase = "idle" | "frame1" | "frame2" | "frame3" | "frame4" | "frame5" | "done";

export default function OutroSequence({
  outroPhase,
  outroFrame,
}: Readonly<{
  outroPhase: OutroPhase;
  outroFrame: number;
}>) {
  if (outroPhase === "idle" || outroPhase === "done") return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none" style={{ overflow: "hidden" }}>
      {/* White Background for line-art visibility */}
      <div className="absolute inset-0 bg-white" />

      {/* Outro Frames - cycle through frame1..frame5 */}
      {(outroPhase === "frame1" ||
        outroPhase === "frame2" ||
        outroPhase === "frame3" ||
        outroPhase === "frame4" ||
        outroPhase === "frame5") && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ opacity: 1 }}>
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
            <Image src="/outro-frame1.png" alt="Outro Frame 1" width={800} height={800} className="object-contain" priority unoptimized />
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
            <Image src="/outro-frame2.png" alt="Outro Frame 2" width={800} height={800} className="object-contain" priority unoptimized />
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
            <Image src="/outro-frame3.png" alt="Outro Frame 3" width={800} height={800} className="object-contain" priority unoptimized />
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
            <Image src="/outro-frame4.png" alt="Outro Frame 4" width={800} height={800} className="object-contain" priority unoptimized />
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
            <Image src="/outro-frame5.png" alt="Outro Frame 5" width={800} height={800} className="object-contain" priority unoptimized />
          </div>
        </div>
      )}
    </div>
  );
}
