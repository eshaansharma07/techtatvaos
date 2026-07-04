import { PublicShell } from "@/components/public-shell";
import { Reveal } from "@/components/reveal";
import { getClubInfo } from "@/lib/public-data";
import { AboutHudHero } from "@/components/about-hud-hero";
import { AboutDepartmentConsole } from "@/components/about-department-console";
import { AboutSignalCard } from "@/components/about-signal-card";
import { Compass, Target, Layers3, Sparkles, Zap } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

function sentences(value?: string) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function precise(value: string | undefined, fallback: string, count = 1) {
  const parts = sentences(value);
  return (parts.length ? parts.slice(0, count).join(" ") : fallback).trim();
}

export default async function About() {
  const info = await getClubInfo();
  const vision = precise(
    info.vision,
    "A focused student community where ideas move from curiosity to working outcomes."
  );
  const mission = precise(
    info.mission,
    "Create practical learning spaces through events, teams, workshops, and disciplined execution."
  );

  return (
    <PublicShell>
      {/* 1. Futuristic OS Status HUD Hero */}
      <AboutHudHero />

      {/* 2. Core Capabilities Matrix */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <p className="text-[10px] font-bold tracking-[0.3em] text-violet-300 uppercase">PHILOSOPHY</p>
          <h2 className="mt-4 text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Built for execution. <br />
            Styled for precision.
          </h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Reveal>
            <AboutSignalCard
              iconName="compass"
              label="VISION"
              title="Direction before decoration."
              copy={vision}
            />
          </Reveal>
          <Reveal delay={0.08}>
            <AboutSignalCard
              iconName="target"
              label="MISSION"
              title="Operate with clarity."
              copy={mission}
            />
          </Reveal>
        </div>
      </section>

      {/* 3. Department CLI Terminal Simulator Console */}
      <AboutDepartmentConsole />

      {/* 4. Glass Call to Action */}
      <section className="mx-auto max-w-7xl px-6 pb-28">
        <Reveal>
          <div className="aurora-shell rounded-[2.2rem] px-7 py-16 md:px-16 relative overflow-hidden text-center max-w-4xl mx-auto">
            <Sparkles className="absolute right-8 top-8 h-20 w-20 text-white/[0.03] pointer-events-none" />
            <p className="text-[10px] font-bold tracking-[.3em] text-violet-300 uppercase">THE LAYER OF COLLABORATION</p>
            <h2 className="mt-6 text-3xl font-extrabold leading-[1.05] tracking-tight text-white md:text-6xl">
              Systems, events, and records built in one dashboard.
            </h2>
            <p className="mt-6 text-sm text-white/45 max-w-xl mx-auto leading-relaxed">
              Every certificate template, operations log, attendance record, and public event page coordinates directly with our internal core portal.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link href="/events" className="action-pill inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-xs font-bold tracking-wider uppercase text-black hover:-translate-y-0.5 transition">
                Enter events <Zap size={14} />
              </Link>
              <Link href="/contact" className="ghost-pill inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-xs font-bold tracking-wider uppercase text-white hover:-translate-y-0.5 transition">
                Contact the club <Layers3 size={14} />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </PublicShell>
  );
}
