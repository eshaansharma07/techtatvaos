import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpen, Calendar, Layers3, Users, Zap } from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { Reveal } from "@/components/reveal";
import { getClubInfo, getPublicHomeData } from "@/lib/public-data";

export const revalidate = 60;

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

function SchematicBoard() {
  return (
    <div className="mt-14 w-full border-y-2 border-black bg-white py-12 px-6 overflow-hidden relative min-h-[280px] flex flex-col justify-between">
      {/* Decorative background grid lines */}
      <div className="absolute inset-0 grid grid-cols-6 lg:grid-cols-12 gap-0 pointer-events-none opacity-[0.06]">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-full border-r border-dashed border-black" />
        ))}
      </div>
      <div className="absolute inset-0 grid grid-rows-4 gap-0 pointer-events-none opacity-[0.06]">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="w-full border-b border-dashed border-black" />
        ))}
      </div>

      {/* Top line of logs */}
      <div className="relative flex flex-wrap justify-between items-center text-[10px] font-mono text-black/40 gap-4">
        <span>LOGS // ENGINE_ID: TATVA_V2</span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#00FF66] border border-black" />
          SYSTEM_STATE: ONLINE
        </span>
      </div>

      {/* Center huge design mark */}
      <div className="relative my-8 flex flex-col items-center justify-center text-center">
        <h2 className="text-[clamp(2rem,6vw,4.5rem)] font-black tracking-[-0.07em] text-black leading-none uppercase">
          TECH TATVA <span className="text-[#00FF66] px-2 bg-black border-2 border-black text-stroke shadow-[3px_3px_0px_0px_#000]" style={{ textShadow: 'none' }}>OS</span>
        </h2>
        <p className="mt-3 text-[9px] font-mono tracking-widest text-black/50 uppercase">
          COLLABORATIVE DEVELOPMENT SYSTEM // CU
        </p>
      </div>

      {/* Bottom status array */}
      <div className="relative grid grid-cols-2 md:grid-cols-4 gap-4 text-left border-t border-black/15 pt-8">
        {[
          { label: "PROTOCOL", value: "NEOBRUTALIST_V2" },
          { label: "MEMBERSHIP", value: "JOIN_OPEN" },
          { label: "DB_CONNECTION", value: "MONGODB_ACTIVE" },
          { label: "HOST_SERVER", value: "TECHTATVA_IN" }
        ].map((item) => (
          <div key={item.label} className="font-mono">
            <span className="block text-[8px] text-black/35 font-bold tracking-wider">{item.label}</span>
            <span className="block text-xs text-black font-extrabold mt-1">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function About() {
  const [info, homeData] = await Promise.all([getClubInfo(), getPublicHomeData()]);
  const { stats } = homeData;
  const history = Array.isArray(info.history) ? info.history : [];

  const heroCopy = precise(
    info.aboutCopy,
    "Tech Tatva is the student-run technical engine of Chandigarh University — built for events, teams, workshops, and real outcomes.",
    2
  );
  const vision = precise(
    info.vision,
    "A focused student club where ideas move from curiosity to working outcomes."
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
  const timeline = history.length ? history.slice(0, 5) : [];

  const pillars = [
    {
      num: "01",
      icon: Calendar,
      title: "Events",
      copy: "Hackathons, workshops, talks, and competitions — every semester, every domain."
    },
    {
      num: "02",
      icon: Users,
      title: "Teams",
      copy: "Specialized verticals covering technical, design, media, ops, content and more."
    },
    {
      num: "03",
      icon: BookOpen,
      title: "Learning",
      copy: "Mentorship, skill-building sessions, and peer-to-peer technical growth."
    },
    {
      num: "04",
      icon: Zap,
      title: "Impact",
      copy: "Certified participation, portfolio work, and verified community presence."
    }
  ];

  return (
    <PublicShell>
      {/* ───────────── HERO ───────────── */}
      <section className="relative overflow-hidden pt-36 pb-0 md:pt-44 spatial-grid-bg">
        <div className="relative mx-auto max-w-7xl xl:max-w-[1380px] px-6">
          {/* Top label row */}
          <Reveal>
            <div className="flex items-center gap-3 mb-8">
              <span className="inline-flex rounded-xl border-2 border-black bg-[#00FF66] px-4 py-1.5 text-[10px] font-bold tracking-[.28em] text-black shadow-[2px_2px_0px_0px_#000] uppercase">
                About
              </span>
              <span className="text-[10px] font-medium tracking-[.2em] text-black/40 uppercase">Tech Tatva · Chandigarh University</span>
            </div>
          </Reveal>

          {/* Giant headline + text left / stat panel right */}
          <div className="grid gap-16 lg:grid-cols-[1fr_380px] lg:items-end pb-0">
            <Reveal>
              <h1 className="text-[clamp(3rem,9vw,7.5rem)] font-extrabold leading-[.87] tracking-[-0.05em] text-black">
                Built for<br />
                students who<br />
                <span className="text-black/30">execute.</span>
              </h1>
              <p className="mt-8 max-w-xl text-base leading-8 text-black/55 md:text-lg">
                {heroCopy}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/events" className="brutalist-btn-green inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold">
                  Explore events <ArrowUpRight size={14} />
                </Link>
                <Link href="/teams" className="brutalist-btn-dark inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm">
                  Meet the teams <ArrowRight size={14} />
                </Link>
              </div>
            </Reveal>

            {/* Stats sidebar */}
            <Reveal delay={0.1}>
              <div className="glass-brutalist rounded-[2rem] p-6 grid grid-cols-2 gap-3">
                {[
                  { label: "Core Members", value: stats.members > 0 ? `${stats.members}+` : "Active" },
                  { label: "Events Held", value: stats.events > 0 ? `${stats.events}+` : "Running" },
                  { label: "Active Teams", value: stats.teams > 0 ? String(stats.teams) : "9" },
                  { label: "Community", value: stats.community > 0 ? `${stats.community}+` : "Growing" }
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-[1.4rem] border-2 border-black bg-white p-4 shadow-[2px_2px_0px_0px_#000]">
                    <p className="text-2xl font-extrabold text-black tracking-tight">{value}</p>
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-[.18em] text-black/45">{label}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>

        {/* Code-only Schematic Board instead of empty box image */}
        <Reveal delay={0.15}>
          <div className="mx-auto max-w-7xl xl:max-w-[1380px] px-6">
            <SchematicBoard />
          </div>
        </Reveal>
      </section>

      {/* ───────────── FOUR PILLARS ───────────── */}
      <section className="mx-auto max-w-7xl xl:max-w-[1380px] px-6 py-20">
        <Reveal>
          <p className="text-[10px] font-bold tracking-[.3em] text-black/40 uppercase mb-10">What we do</p>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map(({ num, icon: Icon, title, copy }, i) => (
            <Reveal key={num} delay={i * 0.07}>
              <div className="glass-brutalist rounded-[2rem] p-6 flex flex-col justify-between min-h-[220px] group">
                <div className="flex items-start justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl border-2 border-black bg-[#00FF66] shadow-[2px_2px_0px_0px_#000]">
                    <Icon size={18} className="text-black" />
                  </span>
                  <span className="text-[10px] font-bold text-black/20 tracking-widest">{num}</span>
                </div>
                <div>
                  <h3 className="mt-6 text-xl font-extrabold tracking-tight text-black">{title}</h3>
                  <p className="mt-2 text-xs leading-5 text-black/55">{copy}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ───────────── VISION / MISSION ───────────── */}
      <section className="mx-auto max-w-7xl xl:max-w-[1380px] px-6 py-4 pb-20">
        <div className="grid gap-5 lg:grid-cols-2">
          <Reveal>
            <div className="glass-brutalist rounded-[2rem] p-8 md:p-10 flex flex-col justify-between min-h-[280px] border-t-4 border-black">
              <div>
                <span className="inline-block rounded-lg border-2 border-black bg-[#00FF66] px-3 py-1 text-[9px] font-bold tracking-[.28em] text-black shadow-[2px_2px_0px_0px_#000] uppercase mb-6">
                  Vision
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-black leading-tight">
                  Direction before decoration.
                </h2>
                <p className="mt-4 text-sm leading-7 text-black/55">{vision}</p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="glass-brutalist rounded-[2rem] p-8 md:p-10 flex flex-col justify-between min-h-[280px] border-t-4 border-[#00FF66]">
              <div>
                <span className="inline-block rounded-lg border-2 border-black bg-black px-3 py-1 text-[9px] font-bold tracking-[.28em] text-[#00FF66] shadow-[2px_2px_0px_0px_#00FF66] uppercase mb-6">
                  Mission
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-black leading-tight">
                  Operate with clarity.
                </h2>
                <p className="mt-4 text-sm leading-7 text-black/55">{mission}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───────────── OPERATING PRINCIPLES ───────────── */}
      <section className="mx-auto max-w-7xl xl:max-w-[1380px] px-6 pb-20">
        <Reveal>
          <div className="glass-brutalist rounded-[2.2rem] p-8 md:p-12">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-10 border-b-2 border-black pb-8">
              <div>
                <p className="text-[10px] font-bold tracking-[.3em] text-black/40 uppercase">Operating Principles</p>
                <h2 className="mt-3 text-3xl md:text-5xl font-extrabold tracking-[-0.04em] text-black leading-[.95]">
                  Precise work.<br />Public proof.
                </h2>
              </div>
              <p className="max-w-sm text-sm leading-7 text-black/50 md:text-right">
                Every event, team, and report should reduce confusion and help students move forward.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {operatingPoints.map((point, i) => (
                <div key={point} className="rounded-[1.6rem] border-2 border-black bg-white p-6 shadow-[3px_3px_0px_0px_#000]">
                  <p className="text-xs font-bold text-[#00FF66] bg-black inline-block px-2 py-0.5 rounded-lg mb-4">0{i + 1}</p>
                  <p className="text-sm font-bold text-black">{["Make it real", "Keep it clean", "Scale the system"][i] || "Move with intent"}</p>
                  <p className="mt-2 text-xs leading-5 text-black/55">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ───────────── TIMELINE ───────────── */}
      {timeline.length > 0 && (
        <section className="mx-auto max-w-7xl xl:max-w-[1380px] px-6 pb-24">
          <Reveal>
            <div className="mb-10">
              <p className="text-[10px] font-bold tracking-[.3em] text-black/40 uppercase">Milestones</p>
              <h2 className="mt-3 text-3xl md:text-5xl font-extrabold tracking-tight text-black">
                Our history.
              </h2>
            </div>
          </Reveal>
          <div className="relative pl-14">
            <div className="absolute left-5 top-0 bottom-0 w-px bg-black/10" />
            <div className="grid gap-4">
              {timeline.map((item: any, index: number) => (
                <Reveal key={`${item.year}-${index}`} delay={index * 0.05}>
                  <div className="glass-brutalist relative rounded-[1.6rem] p-6">
                    <span className="absolute -left-14 top-6 grid h-10 w-10 place-items-center rounded-xl border-2 border-black bg-[#00FF66] text-[10px] font-bold text-black shadow-[2px_2px_0px_0px_#000]">
                      {item.year}
                    </span>
                    <p className="text-sm leading-7 text-black/60">{item.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ───────────── BOTTOM CTA ───────────── */}
      <section className="mx-auto max-w-7xl xl:max-w-[1380px] px-6 pb-28">
        <Reveal>
          <div className="glass-brutalist rounded-[2.2rem] overflow-hidden">
            <div className="border-b-2 border-black px-8 py-5 flex items-center justify-between">
              <p className="text-[10px] font-bold tracking-[.25em] text-black/40 uppercase">Ready to join?</p>
              <span className="w-2 h-2 rounded-full bg-[#00FF66]" />
            </div>
            <div className="px-8 py-12 md:px-12 md:py-14 grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <h2 className="text-3xl md:text-5xl font-extrabold tracking-[-0.04em] text-black leading-[.95]">
                  Events, teams, attendance,<br />
                  certificates — all in one system.
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-black/50">
                  Tech Tatva runs on precision. Join us to be part of a club that documents, executes, and scales.
                </p>
              </div>
              <div className="flex flex-col gap-3 md:items-end">
                <Link href="/join" className="brutalist-btn-green inline-flex min-h-12 items-center gap-2 rounded-xl px-8 text-sm font-bold whitespace-nowrap">
                  Join the Club <Zap size={15} />
                </Link>
                <Link href="/contact" className="brutalist-btn-dark inline-flex min-h-12 items-center gap-2 rounded-xl px-8 text-sm whitespace-nowrap">
                  Contact us <Layers3 size={15} />
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </PublicShell>
  );
}
