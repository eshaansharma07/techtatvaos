import Link from "next/link";
import { TechnomaniaCountdown } from "./technomania-countdown";
import { ArrowRight, ChevronRight } from "lucide-react";

interface TechnomaniaHeroProps {
  title: string;
  subtitle: string;
  ctaPrimary: { label: string; href: string };
  ctaSecondary: { label: string; href: string };
  targetDate: string;
}

export function TechnomaniaHero({
  title,
  subtitle,
  ctaPrimary,
  ctaSecondary,
  targetDate,
}: TechnomaniaHeroProps) {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Decorative corners */}
      <div className="absolute top-10 left-10 w-8 h-8 border-t-2 border-l-2 border-tm-border hidden md:block" />
      <div className="absolute top-10 right-10 w-8 h-8 border-t-2 border-r-2 border-tm-border hidden md:block" />
      <div className="absolute bottom-10 left-10 w-8 h-8 border-b-2 border-l-2 border-tm-border hidden md:block" />
      <div className="absolute bottom-10 right-10 w-8 h-8 border-b-2 border-r-2 border-tm-border hidden md:block" />
      
      <div className="absolute top-6 left-6 tm-coordinate text-[10px] font-tm-mono text-tm-dim hidden md:block">SYS.INIT.001</div>
      <div className="absolute bottom-6 right-6 tm-coordinate text-[10px] font-tm-mono text-tm-dim hidden md:block">SYS.RDY.999</div>

      <div className="max-w-5xl w-full mx-auto flex flex-col items-center text-center z-10 space-y-8">
        
        {/* Status Indicator */}
        <div className="inline-flex items-center gap-2 tm-card px-4 py-1.5 rounded-full bg-tm-surface/50 border-tm-border">
          <span className="w-2 h-2 rounded-full bg-tm-accent animate-pulse" />
          <span className="text-[10px] font-tm-mono tracking-[0.2em] text-tm-muted uppercase">System Online</span>
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-4">
          <h1 className="font-tm-heading text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 drop-shadow-sm uppercase">
            {title}
          </h1>
          <p className="font-tm-mono text-sm md:text-base text-tm-muted tracking-[0.1em] max-w-2xl mx-auto uppercase">
            {subtitle}
          </p>
        </div>

        {/* Countdown */}
        <div className="py-6">
          <TechnomaniaCountdown targetDate={targetDate} />
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 w-full sm:w-auto">
          <Link
            href={ctaPrimary.href}
            className="w-full sm:w-auto tm-btn-solid flex items-center justify-center gap-2 px-8 py-4 text-xs tracking-[0.15em]"
          >
            {ctaPrimary.label} <ArrowRight size={16} />
          </Link>
          <Link
            href={ctaSecondary.href}
            className="w-full sm:w-auto tm-card flex items-center justify-center gap-2 px-8 py-4 text-xs font-tm-mono font-bold tracking-[0.15em] text-tm-text hover:bg-tm-surface transition-colors tm-glow"
          >
            {ctaSecondary.label} <ChevronRight size={16} />
          </Link>
        </div>
      </div>

      {/* Hazard stripe accent at bottom */}
      <div className="absolute bottom-0 inset-x-0 h-1.5 tm-hazard-stripe opacity-60" />
    </section>
  );
}
