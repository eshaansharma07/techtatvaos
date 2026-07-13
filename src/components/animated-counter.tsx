"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

interface AnimatedCounterProps {
  value: number | string;
  duration?: number;
}

export function AnimatedCounter({ value, duration = 1.5 }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    // Check user preference for reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setDisplayValue(String(value));
      return;
    }

    if (!isInView) return;

    // Extract numbers and non-numeric characters (e.g., +, k, etc.)
    const numericStr = String(value).replace(/[^0-9.]/g, "");
    const parsed = parseFloat(numericStr);

    if (isNaN(parsed)) {
      setDisplayValue(String(value));
      return;
    }

    const suffix = String(value).replace(/[0-9.]/g, "");
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);

      // cubic easeOut
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(easeOut * parsed);

      setDisplayValue(current.toLocaleString() + suffix);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(String(value));
      }
    };

    requestAnimationFrame(animate);
  }, [value, isInView, duration]);

  return <span ref={ref} className="tabular-nums">{displayValue}</span>;
}
