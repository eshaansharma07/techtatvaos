import React from "react";

export function TechnomaniaBackground() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none select-none">
      {/* Subtle Monochrome Ambient Vignette */}
      <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-white/[0.02] blur-[150px]" />
      <div className="absolute bottom-[10%] right-[15%] w-[600px] h-[600px] rounded-full bg-white/[0.015] blur-[160px]" />
      
      {/* Precision Monochrome Grid */}
      <div className="absolute inset-0 tm-grid-bg opacity-40 mix-blend-screen" />
      <div className="absolute inset-0 tm-vignette" />
    </div>
  );
}
