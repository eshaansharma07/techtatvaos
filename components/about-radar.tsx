"use client";

import React, { useState } from "react";
import { CircuitBoard } from "lucide-react";

interface Blip {
  id: string;
  top: string;
  left: string;
  title: string;
  subtitle: string;
  stat: string;
}

export function AboutRadar() {
  const [activeBlip, setActiveBlip] = useState<string | null>(null);

  const blips: Blip[] = [
    {
      id: "tech",
      top: "28%",
      left: "32%",
      title: "Tech Division",
      subtitle: "Active Development",
      stat: "Admin Portal & Public PWA"
    },
    {
      id: "events",
      top: "62%",
      left: "72%",
      title: "Event Radar",
      subtitle: "Recruitment Live",
      stat: "140+ Applications"
    },
    {
      id: "ops",
      top: "42%",
      left: "64%",
      title: "Operations Hub",
      subtitle: "MOM Generator Core",
      stat: "8 Active Departments"
    }
  ];

  return (
    <div className="about-console rounded-[2.4rem] p-5 relative">
      <div className="about-radar mx-auto grid h-72 w-72 place-items-center rounded-full md:h-96 md:w-96 relative">
        {/* Rotating sweep line */}
        <div className="about-radar-line" />

        {/* Center core */}
        <div className="grid h-24 w-24 place-items-center rounded-[2rem] border border-white/10 bg-black/35 text-violet-100 shadow-[0_0_60px_rgba(168,85,247,.22)] z-10">
          <CircuitBoard size={38} className="animate-pulse" />
        </div>

        {/* Pulsing Blips */}
        {blips.map((blip) => (
          <div
            key={blip.id}
            style={{ top: blip.top, left: blip.left }}
            className="absolute z-20 group cursor-pointer"
            onMouseEnter={() => setActiveBlip(blip.id)}
            onMouseLeave={() => setActiveBlip(null)}
          >
            {/* Pulsing ring */}
            <span className="absolute -inset-2.5 rounded-full bg-fuchsia-500/35 blur-sm animate-ping duration-1000" />
            {/* Static core dot */}
            <span className="relative block h-3.5 w-3.5 rounded-full border border-white/40 bg-gradient-to-r from-fuchsia-400 to-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.7)] group-hover:scale-125 transition-transform duration-300" />

            {/* Hover Tooltip */}
            <div
              className={`absolute bottom-6 left-1/2 -translate-x-1/2 w-48 p-3.5 rounded-2xl border border-white/[0.08] bg-[#0d0714]/94 backdrop-blur-xl shadow-[0_15px_40px_rgba(0,0,0,0.5)] transition-all duration-300 flex flex-col gap-1 pointer-events-none ${
                activeBlip === blip.id
                  ? "opacity-100 translate-y-0 scale-100"
                  : "opacity-0 translate-y-3 scale-90"
              }`}
            >
              <p className="text-[10px] font-bold text-fuchsia-300 tracking-wider uppercase">{blip.title}</p>
              <p className="text-[11px] font-semibold text-white tracking-tight">{blip.subtitle}</p>
              <div className="mt-1 border-t border-white/[0.05] pt-1 text-[9px] text-white/40 font-mono">
                {blip.stat}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 relative z-10">
        {["LEARN", "BUILD", "LEAD"].map((item) => (
          <div className="rounded-2xl border border-white/[.07] bg-white/[.035] px-4 py-4 text-center hover:border-violet-500/20 hover:bg-violet-500/[0.03] transition duration-300" key={item}>
            <p className="text-[10px] font-bold tracking-[.18em] text-white/50">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
