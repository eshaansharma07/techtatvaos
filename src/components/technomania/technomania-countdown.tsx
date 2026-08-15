"use client";

import { useState, useEffect } from "react";

interface TechnomaniaCountdownProps {
  targetDate: string;
}

export function TechnomaniaCountdown({ targetDate }: TechnomaniaCountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isExpired, setIsExpired] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const target = new Date(targetDate).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setIsExpired(true);
        clearInterval(interval);
      } else {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (!mounted) return null;

  if (isExpired) {
    return (
      <div className="tm-card px-8 py-4 inline-flex items-center justify-center border-tm-accent bg-tm-accent/10">
        <span className="font-tm-mono text-tm-accent tracking-[0.2em] font-bold text-sm">
          EVENT STARTED
        </span>
      </div>
    );
  }

  const units = [
    { label: "DAYS", value: timeLeft.days },
    { label: "HRS", value: timeLeft.hours },
    { label: "MIN", value: timeLeft.minutes },
    { label: "SEC", value: timeLeft.seconds },
  ];

  return (
    <div className="flex flex-col items-center gap-3 font-tm-mono mx-auto">
      {/* Top Cyber HUD Header */}
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[10px] text-cyan-300 font-bold tracking-[0.2em] uppercase">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
        <span>T-MINUS // FESTIVAL KICKOFF</span>
      </div>

      {/* Countdown Cards HUD */}
      <div className="inline-flex items-center justify-center gap-2 sm:gap-3.5 mx-auto">
        {units.map((unit, i) => (
          <div key={unit.label} className="flex items-center gap-2 sm:gap-3.5">
            <div className="relative flex flex-col items-center justify-center w-16 h-18 sm:w-22 sm:h-22 rounded-2xl bg-gradient-to-b from-blue-950/30 via-black/80 to-cyan-950/30 border border-cyan-500/30 hover:border-cyan-400/80 backdrop-blur-2xl shadow-[0_0_25px_rgba(74,158,255,0.15)] hover:shadow-[0_0_35px_rgba(56,189,248,0.35)] transition-all duration-300 group overflow-hidden">
              {/* Subtle top scanline */}
              <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />

              {/* Corner Crosshairs */}
              <span className="absolute top-1.5 left-2 text-[8px] text-cyan-400/40 select-none">+</span>
              <span className="absolute top-1.5 right-2 text-[8px] text-cyan-400/40 select-none">+</span>

              {/* Glowing Digit */}
              <span className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-[0_0_15px_rgba(74,158,255,0.7)] group-hover:text-cyan-200 transition-colors">
                {unit.value.toString().padStart(2, "0")}
              </span>

              {/* Monospace Unit Label */}
              <span className="text-[9px] sm:text-[10px] text-cyan-300/80 font-bold tracking-[0.25em] mt-1 group-hover:text-cyan-200 transition-colors">
                {unit.label}
              </span>

              {/* Bottom laser dot */}
              <div className="absolute bottom-1 inset-x-0 flex justify-center">
                <span className="w-1 h-1 rounded-full bg-cyan-400/40 group-hover:bg-cyan-400 transition-colors" />
              </div>
            </div>

            {/* Glowing Laser Delimiter */}
            {i < units.length - 1 && (
              <div className="flex flex-col gap-1.5 select-none py-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
