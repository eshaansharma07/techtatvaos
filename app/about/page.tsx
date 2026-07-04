import Link from "next/link";
import { ArrowUpRight, Compass, Layers3, Radar, Sparkles, Target, Zap } from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { Reveal } from "@/components/reveal";
import { getClubInfo } from "@/lib/public-data";
import { AboutSignalCard } from "@/components/about-signal-card";
import { AboutRadar } from "@/components/about-radar";
import { AboutTimeline } from "@/components/about-timeline";

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

function bullets(value: string | undefined, fallback: string[]) {
  const parts = sentences(value).slice(1, 4);
  return parts.length ? parts : fallback;
}

function Principle({ index, title, copy }: { index: string; title: string; copy: string }) {
  return (
    <div className="about-principle rounded-[1.45rem] p-6 transition-all duration-300 border border-white/[0.06] bg-white/[0.025] hover:border-violet-500/20 hover:bg-violet-500/[0.02] hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(139,92,246,0.05)] cursor-default">
      <p className="text-[10px] font-bold tracking-[.2em] text-fuchsia-300">{index}</p>
      <h3 className="mt-5 text-lg font-bold tracking-[-.03em] text-white">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-white/45">{copy}</p>
    </div>
  );
}

export default async function About() {
  const info = await getClubInfo();
  const history = Array.isArray(info.history) ? info.history : [];
  const heroCopy = precise(
    info.aboutCopy,
    "Tech Tatva is a student-led technical club built for events, projects, collaboration, and real execution.",
    2
  );
  const vision = precise(
    info.vision,
    "A focused student community where ideas move from curiosity to working outcomes."
  );
  const mission = precise(
    info.mission,
    "Create practical learning spaces through events, teams, workshops, and disciplined execution."
  );
  const operatingPoints = bullets(info.mission, [
    "Run clean technical events with measurable participation.",
    "Build team ownership across design, operations, media, and technology.",
    "Turn student energy into documented, repeatable club systems."
  ]);
  const rawTimeline = history.length ? history.slice(0, 4) : [
    { year: "01", text: "Admin-published milestones will appear here when the club is ready to make them public." },
    { year: "02", text: "Until then, the page stays intentional instead of inventing legacy claims." }
  ];
  const timeline = rawTimeline.map((item: any) => ({
    year: String(item.year || ""),
    text: String(item.text || "")
  }));

  return (
    <PublicShell>
      <section className="about-stage relative overflow-hidden px-6 pb-24 pt-40 md:pt-48">
        <div className="absolute inset-0 grid-bg opacity-[.12]" />
        <div className="about-orb about-orb-one" />
        <div className="about-orb about-orb-two" />

        <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_.78fr] lg:items-center">
          <Reveal>
            <div>
              <p className="inline-flex rounded-full border border-violet-200/15 bg-white/[.035] px-4 py-2 text-[10px] font-bold tracking-[.28em] text-violet-200">
                ABOUT TECH TATVA
              </p>
              <h1 className="mt-7 max-w-5xl text-3xl xs:text-5xl font-bold leading-[.88] tracking-[-.085em] text-white md:text-8xl lg:text-[112px]">
                Built for students who execute.
              </h1>
              <p className="mt-8 max-w-2xl text-base leading-8 text-white/52 md:text-lg md:leading-9">
                {heroCopy}
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/events" className="action-pill inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition hover:-translate-y-0.5 text-black">
                  Explore events <ArrowUpRight size={15} />
                </Link>
                <Link href="/teams" className="ghost-pill inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm transition hover:-translate-y-0.5 text-white">
                  See teams <Radar size={15} />
                </Link>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <AboutRadar />
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-5 lg:grid-cols-2">
          <Reveal>
            <AboutSignalCard iconName="compass" label="VISION" title="Direction before decoration." copy={vision} />
          </Reveal>
          <Reveal delay={0.08}>
            <AboutSignalCard iconName="target" label="MISSION" title="Operate with clarity." copy={mission} />
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <Reveal>
          <div className="about-band rounded-[2.2rem] p-7 md:p-10">
            <div className="grid gap-10 lg:grid-cols-[.75fr_1fr] lg:items-end">
              <div>
                <p className="text-[10px] font-bold tracking-[.3em] text-violet-300">OPERATING PRINCIPLES</p>
                <h2 className="mt-5 text-3xl font-bold leading-[.95] tracking-[-.06em] text-white md:text-6xl">
                  Precise work. Public proof.
                </h2>
              </div>
              <p className="max-w-2xl text-sm leading-7 text-white/45 md:text-base md:leading-8">
                The club should feel fast, organized, and useful. Every event, team, and report should reduce confusion and help students move.
              </p>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {operatingPoints.map((point, index) => (
                <Principle key={point} index={`0${index + 1}`} title={["Make it real", "Keep it clean", "Scale the system"][index] || "Move with intent"} copy={point} />
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-32">
        <div className="grid gap-10 lg:grid-cols-[.55fr_1fr]">
          <Reveal>
            <div className="lg:sticky lg:top-32">
              <p className="text-[10px] font-bold tracking-[.3em] text-fuchsia-300">LEGACY SIGNAL</p>
              <h2 className="mt-5 max-w-sm text-4xl font-bold leading-[.98] tracking-[-.055em] text-white md:text-5xl">
                Milestones, without the noise.
              </h2>
              <p className="mt-5 max-w-md text-sm leading-7 text-white/42">
                Public history appears only when the portal has real entries. Clean pages beat fake filler.
              </p>
            </div>
          </Reveal>
          <AboutTimeline timeline={timeline} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-28">
        <Reveal>
          <div className="aurora-shell rounded-[2.2rem] px-7 py-12 md:px-12 relative overflow-hidden">
            <Sparkles className="absolute right-8 top-8 h-20 w-20 text-white/[.04]" />
            <p className="text-[10px] font-bold tracking-[.3em] text-violet-300">THE CLUB LAYER</p>
            <h2 className="mt-5 max-w-3xl text-3xl font-bold leading-[.98] tracking-[-.055em] text-white md:text-6xl">
              Events, teams, attendance, certificates, and reports in one living system.
            </h2>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/events" className="action-pill inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-black">
                Enter events <Zap size={15} />
              </Link>
              <Link href="/contact" className="ghost-pill inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm text-white">
                Contact the club <Layers3 size={15} />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </PublicShell>
  );
}
