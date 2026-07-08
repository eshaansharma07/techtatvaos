import Link from "next/link";
import { ArrowUpRight, CircuitBoard, Compass, Layers3, Radar, Sparkles, Target, Zap } from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { Reveal } from "@/components/reveal";
import { getClubInfo } from "@/lib/public-data";

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

function SignalCard({ icon: Icon, label, title, copy }: { icon: any; label: string; title: string; copy: string }) {
  return (
    <article className="about-signal-card group rounded-[2rem] p-6 md:p-7">
      <div className="flex items-center justify-between">
        <span className="grid h-12 w-12 place-items-center rounded-2xl border border-violet-200/15 bg-violet-400/10 text-violet-100">
          <Icon size={18} />
        </span>
        <span className="text-[10px] font-semibold tracking-[.22em] text-white/28">LIVE</span>
      </div>
      <p className="mt-8 text-[10px] font-semibold tracking-[.28em] text-violet-200/75">{label}</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-[-.045em] text-white md:text-3xl">{title}</h2>
      <p className="mt-4 text-sm leading-7 text-white/48">{copy}</p>
    </article>
  );
}

function Principle({ index, title, copy }: { index: string; title: string; copy: string }) {
  return (
    <div className="about-principle rounded-[1.45rem] p-5">
      <p className="text-[10px] font-semibold tracking-[.2em] text-fuchsia-200/70">{index}</p>
      <h3 className="mt-5 text-lg font-semibold tracking-[-.03em] text-white">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-white/42">{copy}</p>
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
  const timeline = history.length ? history.slice(0, 4) : [
    { year: "01", text: "Admin-published milestones will appear here when the club is ready to make them public." },
    { year: "02", text: "Until then, the page stays intentional instead of inventing legacy claims." }
  ];

  return (
    <PublicShell>
      <section className="about-stage relative overflow-hidden px-6 pb-24 pt-40 md:pt-48">
        <div className="absolute inset-0 grid-bg opacity-[.12]" />
        <div className="about-orb about-orb-one" />
        <div className="about-orb about-orb-two" />

        <div className="relative mx-auto grid max-w-7xl xl:max-w-[1380px] 2xl:max-w-[1536px] gap-12 lg:grid-cols-[1fr_.78fr] lg:items-center">
          <Reveal>
            <div>
              <p className="inline-flex rounded-full border border-violet-200/15 bg-white/[.035] px-4 py-2 text-[10px] font-semibold tracking-[.28em] text-violet-100/80">
                ABOUT TECH TATVA
              </p>
              <h1 className="mt-7 max-w-5xl text-3xl xs:text-5xl font-semibold leading-[.88] tracking-[-.085em] text-white md:text-8xl lg:text-[112px]">
                Built for students who execute.
              </h1>
              <p className="mt-8 max-w-2xl text-base leading-8 text-white/52 md:text-lg md:leading-9">
                {heroCopy}
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/events" className="action-pill inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition hover:-translate-y-0.5">
                  Explore events <ArrowUpRight size={15} />
                </Link>
                <Link href="/teams" className="ghost-pill inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm transition hover:-translate-y-0.5">
                  See teams <Radar size={15} />
                </Link>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="about-console rounded-[2.4rem] p-5">
              <div className="about-radar mx-auto grid h-72 w-72 place-items-center rounded-full md:h-96 md:w-96">
                <div className="about-radar-line" />
                <div className="grid h-28 w-28 place-items-center rounded-[2rem] border border-white/10 bg-black/35 text-violet-100 shadow-[0_0_70px_rgba(168,85,247,.22)]">
                  <CircuitBoard size={42} />
                </div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3">
                {["LEARN", "BUILD", "LEAD"].map((item) => (
                  <div className="rounded-2xl border border-white/[.07] bg-white/[.035] px-4 py-4 text-center" key={item}>
                    <p className="text-[10px] font-semibold tracking-[.18em] text-white/46">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl xl:max-w-[1380px] 2xl:max-w-[1536px] px-6 py-10">
        <div className="grid gap-5 lg:grid-cols-2">
          <Reveal>
            <SignalCard icon={Compass} label="VISION" title="Direction before decoration." copy={vision} />
          </Reveal>
          <Reveal delay={0.08}>
            <SignalCard icon={Target} label="MISSION" title="Operate with clarity." copy={mission} />
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl xl:max-w-[1380px] 2xl:max-w-[1536px] px-6 py-24">
        <Reveal>
          <div className="about-band rounded-[2.2rem] p-7 md:p-10">
            <div className="grid gap-10 lg:grid-cols-[.75fr_1fr] lg:items-end">
              <div>
                <p className="text-[10px] font-semibold tracking-[.3em] text-violet-200/75">OPERATING PRINCIPLES</p>
                <h2 className="mt-5 text-3xl font-semibold leading-[.95] tracking-[-.06em] text-white md:text-6xl">
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

      <section className="mx-auto max-w-7xl xl:max-w-[1380px] 2xl:max-w-[1536px] px-6 pb-32">
        <div className="grid gap-10 lg:grid-cols-[.55fr_1fr]">
          <Reveal>
            <div className="lg:sticky lg:top-32">
              <p className="text-[10px] font-semibold tracking-[.3em] text-fuchsia-200/75">LEGACY SIGNAL</p>
              <h2 className="mt-5 max-w-sm text-4xl font-semibold leading-[.98] tracking-[-.055em] text-white md:text-5xl">
                Milestones, without the noise.
              </h2>
              <p className="mt-5 max-w-md text-sm leading-7 text-white/42">
                Public history appears only when the portal has real entries. Clean pages beat fake filler.
              </p>
            </div>
          </Reveal>
          <div className="relative">
            <div className="absolute left-5 top-4 h-[calc(100%-2rem)] w-px bg-gradient-to-b from-violet-300/70 via-fuchsia-300/25 to-transparent" />
            <div className="grid gap-4">
              {timeline.map((item: any, index: number) => (
                <Reveal key={`${item.year}-${item.text}`} delay={index * 0.05}>
                  <div className="about-timeline-card relative ml-12 rounded-[1.6rem] p-5">
                    <span className="absolute -left-12 top-6 grid h-10 w-10 place-items-center rounded-full border border-violet-200/30 bg-[#090711] text-[10px] font-semibold text-violet-100 shadow-[0_0_28px_rgba(168,85,247,.22)]">
                      {item.year}
                    </span>
                    <p className="text-sm leading-7 text-white/58">{item.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl xl:max-w-[1380px] 2xl:max-w-[1536px] px-6 pb-28">
        <Reveal>
          <div className="aurora-shell rounded-[2.2rem] px-7 py-12 md:px-12">
            <Sparkles className="absolute right-8 top-8 h-20 w-20 text-white/[.04]" />
            <p className="text-[10px] font-semibold tracking-[.3em] text-violet-200/70">THE CLUB LAYER</p>
            <h2 className="mt-5 max-w-3xl text-3xl font-semibold leading-[.98] tracking-[-.055em] text-white md:text-6xl">
              Events, teams, attendance, certificates, and reports in one living system.
            </h2>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/events" className="action-pill inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold">
                Enter events <Zap size={15} />
              </Link>
              <Link href="/contact" className="ghost-pill inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm">
                Contact the club <Layers3 size={15} />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </PublicShell>
  );
}
