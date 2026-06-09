import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, ChevronRight, Image as ImageIcon, Orbit, Sparkles, Ticket, Users, Zap } from "lucide-react";
import { EventCard } from "@/components/event-card";
import { PublicShell } from "@/components/public-shell";
import { Reveal } from "@/components/reveal";
import { getPublicHomeData } from "@/lib/public-data";

export const dynamic = "force-dynamic";

const SectionTitle = ({ eyebrow, title, copy }: { eyebrow: string; title: string; copy?: string }) => <div className="mb-10 max-w-2xl"><p className="mb-4 text-[10px] font-semibold tracking-[.3em] text-rose-500">{eyebrow}</p><h2 className="text-3xl font-semibold tracking-[-.05em] text-stone-950 md:text-6xl">{title}</h2>{copy&&<p className="mt-4 text-sm leading-7 text-stone-500">{copy}</p>}</div>;
const EmptyState = ({ title, copy, href, action }: { title: string; copy: string; href?: string; action?: string }) => <div className="premium-card rounded-[1.6rem] p-8 text-center"><p className="text-sm font-medium text-stone-800">{title}</p><p className="mx-auto mt-3 max-w-md text-xs leading-6 text-stone-500">{copy}</p>{href&&action?<Link className="ghost-pill mt-5 inline-flex rounded-full px-5 py-2 text-xs" href={href}>{action}</Link>:null}</div>;
const mobileQuickLinks = [
  ["Events", "/events", "Register"],
  ["Teams", "/teams", "Structure"],
  ["Hall of Fame", "/hall-of-fame", "Legacy"],
  ["Gallery", "/gallery", "Albums"],
  ["About", "/about", "Story"],
  ["Contact", "/contact", "Reach out"]
] as const;

export default async function Home() {
  const { clubInfo, events, teams, achievements, sponsors, gallery, stats } = await getPublicHomeData();
  const nextEvent = events[0];
  const statRows = [
    [String(stats.members), "Active members"],
    [String(stats.events), "Published events"],
    [String(stats.teams), "Active teams"],
    [String(achievements.length), "Featured achievements"]
  ];
  return <PublicShell>
    <section className="relative overflow-hidden pt-24 md:pt-28">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#fffdf8_0%,#faf8f5_70%,#f8f5f0_100%)]"/>
      <div className="absolute right-[-8%] top-24 hidden h-[560px] w-[560px] rounded-full bg-[#f3ded4]/55 md:block" />
      <div className="absolute left-[-12%] top-60 hidden h-[420px] w-[420px] rounded-full bg-[#f8ead2]/70 md:block" />

      <div className="relative mx-auto grid min-h-[760px] max-w-7xl items-center gap-10 px-5 py-14 md:px-6 md:py-20 lg:grid-cols-[1fr_.82fr]">
        <Reveal>
          <div>
            <p className="text-[10px] font-semibold tracking-[.34em] text-rose-500">TECH TATVA</p>
            <h1 className="mt-5 max-w-5xl text-[4.2rem] font-semibold leading-[.86] tracking-[-.085em] text-stone-950 md:mt-6 md:text-8xl lg:text-[124px]">
              A warmer way to build.
            </h1>
            <p className="mt-6 max-w-2xl text-[17px] leading-8 text-stone-500 md:mt-8 md:text-xl md:leading-9">
              Discover real club events, register as a candidate, explore teams, and follow the work Tech Tatva publishes for students.
            </p>
            <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap md:mt-10">
              <Link href="/events" className="action-pill group flex min-h-14 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition hover:-translate-y-0.5">
                Browse registrations <ArrowRight size={16} className="transition group-hover:translate-x-0.5"/>
              </Link>
              <Link href="/teams" className="ghost-pill flex min-h-14 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm transition hover:-translate-y-0.5">
                Explore teams <ChevronRight size={16}/>
              </Link>
            </div>
            <div className="mt-7 grid grid-cols-2 gap-3 md:hidden">
              {mobileQuickLinks.map(([label, href, eyebrow]) => (
                <Link href={href} key={href} className="group rounded-3xl border border-stone-200/80 bg-white/78 p-4 shadow-[0_18px_40px_rgba(88,65,46,.08)] transition active:scale-[.98]">
                  <span className="text-[9px] font-semibold uppercase tracking-[.2em] text-rose-500">{eyebrow}</span>
                  <span className="mt-3 flex items-center justify-between gap-3 text-lg font-semibold tracking-[-.03em] text-stone-950">
                    {label}
                    <ArrowUpRight size={16} className="text-stone-400 transition group-active:translate-x-0.5 group-active:-translate-y-0.5"/>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={.12}>
          <div className="relative hidden lg:block">
            <div className="relative rounded-[2.5rem] border border-stone-200/80 bg-white/70 p-5 shadow-[0_35px_100px_rgba(88,65,46,.12)]">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-[#efe5d8]">
                <Image src="/tech-tatva-hero.png" alt="" fill priority sizes="520px" className="object-cover object-center opacity-90"/>
              </div>
              <div className="mt-4 rounded-[1.5rem] border border-stone-200/80 bg-[#fffdf8] p-5">
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#f5dfd0] text-stone-700"><Ticket size={18}/></span>
                  <span className={nextEvent?.registrationOpen ? "rounded-full bg-[#e7f5df] px-3 py-1 text-[10px] font-semibold tracking-[.18em] text-[#5f7e4d]" : "rounded-full bg-stone-100 px-3 py-1 text-[10px] font-semibold tracking-[.18em] text-stone-500"}>
                    {nextEvent ? nextEvent.registrationOpen ? "REGISTRATION OPEN" : "EVENT LIVE" : "NO EVENT YET"}
                  </span>
                </div>
                <p className="mt-8 text-[10px] font-semibold tracking-[.3em] text-stone-400">NEXT PUBLIC EVENT</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-.05em] text-stone-950">{nextEvent?.title || "Events will appear here"}</h2>
                <p className="mt-4 min-h-14 text-sm leading-7 text-stone-500">{nextEvent?.description || "When the admin publishes an event, candidates will see it here and can register from the event page."}</p>
                <div className="mt-7 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-stone-200/80 bg-[#faf8f5] p-4">
                    <p className="text-[10px] tracking-[.2em] text-stone-400">VENUE</p>
                    <p className="mt-2 text-sm text-stone-700">{nextEvent?.venue || "TBA"}</p>
                  </div>
                  <div className="rounded-2xl border border-stone-200/80 bg-[#faf8f5] p-4">
                    <p className="text-[10px] tracking-[.2em] text-stone-400">MODE</p>
                    <p className="mt-2 text-sm capitalize text-stone-700">{nextEvent?.participationMode || "Open"}</p>
                  </div>
                </div>
                <Link href={nextEvent ? `/events/${nextEvent.slug}` : "/events"} className="action-pill mt-5 flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5">
                  {nextEvent ? "Open event" : "View events"} <ArrowUpRight size={15}/>
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      <div className="relative mx-auto grid max-w-7xl grid-cols-2 gap-3 px-5 pb-12 md:grid-cols-4 md:px-6">{statRows.map(([n,l])=><div key={l} className="rounded-[1.6rem] border border-stone-200/80 bg-white/72 px-5 py-5 shadow-[0_20px_60px_rgba(88,65,46,.08)] transition duration-300 hover:-translate-y-1 md:px-6 md:py-6"><p className="text-2xl font-semibold tracking-[-.04em] text-stone-950 md:text-3xl">{n}</p><p className="mt-2 text-[9px] tracking-[.14em] text-stone-400 md:text-[10px] md:tracking-[.16em]">{l.toUpperCase()}</p></div>)}</div>
    </section>
    <section className="mx-auto max-w-7xl px-5 py-20 md:px-6 md:py-28"><Reveal><SectionTitle eyebrow="LIVE SIGNAL" title="A calendar built for momentum." copy="Public events appear here when registrations are open or event details are published."/></Reveal>{events.length?<><div className="grid gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-4">{events.map((e,i)=><Reveal key={e.slug} delay={i*.08}><EventCard event={e} index={i}/></Reveal>)}</div><Link href="/events" className="ghost-pill mt-7 inline-flex min-h-12 items-center gap-2 rounded-full px-5 py-3 text-sm">View the complete calendar <ArrowUpRight size={15}/></Link></>:<EmptyState title="No public events yet." copy="Check back soon for upcoming sessions, workshops, and registrations."/>}</section>
    <section className="border-y border-stone-200/70 bg-[#fffdf8]"><div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 md:px-6 md:py-28 lg:grid-cols-[.9fr_1.1fr] lg:gap-14"><Reveal><SectionTitle eyebrow="ONE SYSTEM / MANY DISCIPLINES" title="Teams building the future." copy="Explore the public team structure and the disciplines behind club work."/><Link className="ghost-pill inline-flex min-h-12 items-center gap-2 rounded-full px-5 py-3 text-sm" href="/teams">Explore the network <ArrowRight size={15}/></Link></Reveal><div className="grid gap-4 sm:grid-cols-2">{teams.length?teams.slice(0,6).map((team,i)=><Reveal key={team.id} delay={i*.04}><div className="premium-card group rounded-2xl p-5 transition duration-300 hover:-translate-y-1"><div className="flex justify-between"><Orbit size={18} className="text-rose-500"/><span className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-500">{team.members}</span></div><h3 className="mt-7 text-base font-semibold text-stone-950">{team.name}</h3><p className="mt-2 text-xs leading-5 text-stone-500">{team.description || "Team details coming soon."}</p></div></Reveal>):<EmptyState title="Team information is coming soon." copy="The public team structure has not been published yet."/>}</div></div></section>
    {achievements.length || sponsors.length || gallery.length ? <section className="mx-auto max-w-7xl px-6 py-20"><div className="grid gap-4 md:grid-cols-3">{achievements.slice(0,3).map((item:any)=><div className="glass rounded-2xl p-6" key={item._id}><p className="text-[10px] tracking-[.2em] text-rose-500">{item.kind || "ACHIEVEMENT"}</p><p className="mt-4 text-lg font-medium text-stone-950">{item.title}</p><p className="mt-2 text-xs leading-5 text-stone-500">{item.description}</p></div>)}</div></section> : null}
    <section className="mx-auto max-w-7xl px-5 py-20 md:px-6 md:py-28"><div className="relative overflow-hidden rounded-[2.5rem] border border-stone-200/80 bg-[#fffdf8] px-6 py-12 shadow-[0_32px_90px_rgba(88,65,46,.1)] md:px-16 md:py-16"><ImageIcon className="absolute -right-6 -top-8 h-52 w-52 text-stone-100"/><p className="text-[10px] tracking-[.3em] text-rose-500">ACCESS THE NETWORK</p><h2 className="mt-6 max-w-2xl text-4xl font-semibold tracking-[-.055em] text-stone-950 md:text-6xl">The future needs people who show up early.</h2><p className="mt-5 max-w-xl text-sm leading-7 text-stone-500">Find your team, enter the room, and start making something that matters.</p><Link href="/contact" className="action-pill mt-8 inline-flex min-h-12 items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold">Connect with us <ArrowUpRight size={15}/></Link></div></section>
  </PublicShell>;
}
