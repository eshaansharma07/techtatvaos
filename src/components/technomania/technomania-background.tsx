import React from "react";

export function TechnomaniaBackground() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none select-none">
      {/* Dynamic Ambient Gradient Orbs */}
      <div className="absolute top-[-10%] left-[15%] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[130px]" />
      <div className="absolute top-[35%] right-[10%] w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[150px]" />
      <div className="absolute bottom-[10%] left-[20%] w-[550px] h-[550px] rounded-full bg-cyan-500/10 blur-[140px]" />
      
      {/* Precision Grid */}
      <div className="absolute inset-0 tm-grid-bg opacity-30 mix-blend-screen" />
      <div className="absolute inset-0 tm-vignette" />
    </div>
  );
}

