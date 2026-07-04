"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export function AboutTimeline({ timeline }: { timeline: any[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="relative">
      {/* Glowing vertical trace track line */}
      <div className="absolute left-5 top-4 h-[calc(100%-2rem)] w-px bg-gradient-to-b from-violet-500 via-fuchsia-500/40 to-transparent shadow-[0_0_8px_rgba(139,92,246,0.3)]" />
      
      <div className="grid gap-5">
        {timeline.map((item: any, index: number) => (
          <motion.div
            key={`${item.year}-${item.text}`}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: index * 0.08 }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            className={`about-timeline-card relative ml-12 rounded-[1.6rem] p-6 border transition-all duration-500 cursor-pointer ${
              hoveredIndex === index
                ? "border-violet-500/30 bg-[#0d091a]/85 -translate-y-0.5 shadow-[0_15px_35px_rgba(139,92,246,0.06)]"
                : "border-white/[0.06] bg-white/[0.025]"
            }`}
          >
            {/* Sync-animated milestone dot */}
            <span
              className={`absolute -left-12 top-6 grid h-10 w-10 place-items-center rounded-full border transition-all duration-300 font-mono text-[10px] font-bold ${
                hoveredIndex === index
                  ? "border-fuchsia-400 bg-fuchsia-500/20 text-white scale-110 shadow-[0_0_20px_rgba(236,72,153,0.5)]"
                  : "border-violet-500/20 bg-[#090711] text-violet-300/80 shadow-[0_0_15px_rgba(168,85,247,0.1)]"
              }`}
            >
              {item.year}
            </span>
            <p className={`text-sm leading-7 transition duration-300 ${
              hoveredIndex === index ? "text-white/80" : "text-white/50"
            }`}>
              {item.text}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
