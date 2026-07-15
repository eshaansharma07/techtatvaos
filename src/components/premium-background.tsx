"use client";

export function PremiumBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[-2] overflow-hidden bg-zinc-50">
      {/* Moving grid background */}
      <div className="absolute inset-0 grid-bg opacity-[0.04]" />
    </div>
  );
}
