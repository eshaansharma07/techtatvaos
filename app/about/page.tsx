import Link from "next/link";
import { ArrowUpRight, BookOpen, Compass, Layers3, Sparkles, Target } from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { Reveal } from "@/components/reveal";
import { getClubInfo } from "@/lib/public-data";

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

function EditorialCard({ icon: Icon, label, title, copy }: { icon: any; label: string; title: string; copy: string }) {
  return (
    <article className="rounded-[2rem] border border-stone-200/80 bg-white p-7 shadow-[0_24px_80px_rgba(82,52,30,.07)]">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#faf1ea] text-rose-500">
        <Icon size={18} />
      </div>
      <p className="mt-8 text-[11px] font-semibold uppercase tracking-[.22em] text-rose-400">{label}</p>
      <h2 className="mt-3 text-3xl font-semibold leading-[1] tracking-[-.055em] text-stone-950">{title}</h2>
      <p className="mt-4 text-sm leading-7 text-stone-500">{copy}</p>
    </article>
  );
}

export default async function About() {
  const info = await getClubInfo();
  const history = Array.isArray(info.history) ? info.history : [];
  const heroCopy = precise(info.aboutCopy, "Tech Tatva is a student-led technical club built for events, projects, collaboration, and real execution.", 2);
  const vision = precise(info.vision, "A focused student community where ideas move from curiosity to working outcomes.");
  const mission = precise(info.mission, "Create practical learning spaces through events, teams, workshops, and disciplined execution.");
  const timeline = history.length ? history.slice(0, 4) : [
    { year: "Now", text: "Public milestones will appear here when the club publishes real entries from the portal." }
  ];

  return (
    <PublicShell>
      <section className="mx-auto max-w-7xl px-5 pb-24 pt-28 md:px-6 md:pt-40">
        <Reveal>
          <div className="rounded-[2.8rem] border border-stone-200/80 bg-[#fffdf8] px-6 py-14 shadow-[0_34px_120px_rgba(82,52,30,.08)] md:px-12 md:py-20">
            <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.28em] text-rose-400">
              <Sparkles size={14} />
              About Tech Tatva
            </p>
            <h1 className="mt-6 max-w-5xl text-6xl font-semibold leading-[.88] tracking-[-.085em] text-stone-950 md:text-8xl lg:text-[112px]">
              A club made for thoughtful execution.
            </h1>
            <p className="mt-8 max-w-2xl text-base leading-8 text-stone-500 md:text-lg md:leading-9">{heroCopy}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/events" className="action-pill inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold">
                Explore events <ArrowUpRight size={15} />
              </Link>
              <Link href="/teams" className="ghost-pill inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm">
                Meet the teams <Layers3 size={15} />
              </Link>
            </div>
          </div>
        </Reveal>

        <section className="mt-10 grid gap-5 lg:grid-cols-2">
          <Reveal><EditorialCard icon={Compass} label="Vision" title="Direction before decoration." copy={vision} /></Reveal>
          <Reveal delay={0.08}><EditorialCard icon={Target} label="Mission" title="Clear work, real outcomes." copy={mission} /></Reveal>
        </section>

        <section className="mt-20 grid gap-8 lg:grid-cols-[.75fr_1.25fr]">
          <Reveal>
            <div className="lg:sticky lg:top-32">
              <p className="text-[11px] font-semibold uppercase tracking-[.28em] text-rose-400">Operating Style</p>
              <h2 className="mt-4 text-5xl font-semibold leading-[.95] tracking-[-.07em] text-stone-950 md:text-7xl">
                Less noise. More useful work.
              </h2>
            </div>
          </Reveal>
          <div className="grid gap-4">
            {["Events should be easy to discover, register for, and report on.", "Teams should be visible through real people and real responsibilities.", "Public pages should stay precise until admins publish verified club information."].map((copy, index) => (
              <Reveal delay={index * 0.05} key={copy}>
                <div className="rounded-[2rem] border border-stone-200/80 bg-white p-6 shadow-[0_18px_60px_rgba(82,52,30,.06)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[.18em] text-rose-400">0{index + 1}</p>
                  <p className="mt-3 text-xl font-semibold leading-8 tracking-[-.035em] text-stone-900">{copy}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="mt-20 rounded-[2.5rem] border border-stone-200/80 bg-white p-6 shadow-[0_30px_100px_rgba(82,52,30,.07)] md:p-10">
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.28em] text-rose-400"><BookOpen size={14} /> Legacy Timeline</p>
          <div className="mt-8 grid gap-4">
            {timeline.map((item: any, index: number) => (
              <Reveal key={`${item.year}-${item.text}`} delay={index * 0.05}>
                <div className="grid gap-4 rounded-[1.7rem] bg-[#faf8f5] p-5 md:grid-cols-[120px_1fr]">
                  <p className="text-2xl font-semibold tracking-[-.05em] text-stone-950">{item.year}</p>
                  <p className="text-sm leading-7 text-stone-500">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      </section>
    </PublicShell>
  );
}
