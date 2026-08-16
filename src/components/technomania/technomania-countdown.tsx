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
      <div className="px-8 py-4 inline-flex items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950 text-white font-mono text-sm tracking-widest">
        <span>EVENT STARTED</span>
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
    <div className="flex flex-col items-center gap-3 font-mono mx-auto">
      {/* Top Header */}
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 font-bold tracking-[0.2em] uppercase">
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        <span>T-MINUS // FESTIVAL COUNTDOWN</span>
      </div>

      {/* Countdown Cards */}
      <div className="inline-flex items-center justify-center gap-2 sm:gap-3.5 mx-auto">
        {units.map((unit, i) => (
          <div key={unit.label} className="flex items-center gap-2 sm:gap-3.5">
            <div className="relative flex flex-col items-center justify-center w-16 h-18 sm:w-20 sm:h-20 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 backdrop-blur-2xl transition-all duration-300 group overflow-hidden">
              {/* Digit */}
              <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {unit.value.toString().padStart(2, "0")}
              </span>

              {/* Label */}
              <span className="text-[9px] sm:text-[10px] text-zinc-500 font-semibold tracking-[0.2em] mt-0.5">
                {unit.label}
              </span>
            </div>

            {/* Delimiter */}
            {i < units.length - 1 && (
              <div className="flex flex-col gap-1.5 select-none py-2">
                <span className="w-1 h-1 rounded-full bg-zinc-600" />
                <span className="w-1 h-1 rounded-full bg-zinc-600" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
