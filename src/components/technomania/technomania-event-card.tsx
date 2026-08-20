"use client";

import { ArrowUpRight } from "lucide-react";

interface EventCardProps {
  event?: any;
}

export function TechnomaniaEventCard({ event }: EventCardProps) {
  if (!event) return null;
  const { title, category, prizePool } = event;

  return (
    <div className="block tm-card bg-tm-surface flex flex-col group overflow-hidden tm-glow transition-all duration-300 hover:-translate-y-1 p-6 relative">
      <div className="flex items-center justify-between mb-8">
        <div className="bg-tm-bg/80 backdrop-blur border border-tm-border px-3 py-1.5 text-[10px] font-tm-mono font-bold tracking-widest text-tm-text uppercase rounded">
          {category || "EVENT"}
        </div>
        <div className="w-8 h-8 rounded-full border border-tm-border flex items-center justify-center text-tm-muted group-hover:bg-tm-text group-hover:text-tm-bg group-hover:border-tm-text transition-all">
          <ArrowUpRight size={14} />
        </div>
      </div>

      <div className="mt-auto">
        <h3 className="font-tm-heading text-2xl font-black text-tm-text mb-2 line-clamp-1 group-hover:text-tm-accent transition-colors uppercase">
          {title}
        </h3>
        <p className="text-sm font-mono font-bold text-tm-muted uppercase tracking-widest">
          {prizePool || "TBA"}
        </p>
      </div>

      {/* Decorative corner */}
      <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-white/5 to-transparent pointer-events-none" />
    </div>
  );
}
