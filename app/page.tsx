import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, ChevronRight, Orbit, Sparkles, Ticket, Users, Zap } from "lucide-react";
import { EventCard } from "@/components/event-card";
import { PublicShell } from "@/components/public-shell";
import { Reveal } from "@/components/reveal";
import { getPublicHomeData } from "@/lib/public-data";

export const dynamic = "force-dynamic";

const SectionTitle = ({ eyebrow, title, copy }: { eyebrow: string; title: string; copy?: string }) => <div className="mb-10 max-w-2xl"><p className="mb-4 text-[10px] font-semibold tracking-[.3em] text-violet-300">{eyebrow}</p><h2 className="text-3xl font-medium tracking-tight md:text-5xl">{title}</h2>{copy&&<p className="mt-4 text-sm leading-7 text-white/45">{copy}</p>}</div>;
const EmptyState = ({ title, copy, href, action }: { title: string; copy: string; href?: string; action?: string }) => <div className="premium-card rounded-[1.6rem] p-8 text-center"><p className="text-sm text-white/75">{title}</p><p className="mx-auto mt-3 max-w-md text-xs leading-6 text-white/42">{copy}</p>{href&&action?<Link className="ghost-pill mt-5 inline-flex rounded-full px-5 py-2 text-xs text-violet-100" href={href}>{action}</Link>:null}</div>;

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
    <section className="relative min-h-[820px] overflow-hidden pt-20 md:min-h-[940px] md:pt-20">
      <Image src="/tech-tatva-hero.png" alt="" fill priority sizes="100vw" className="object-cover object-center opacity-55 md:opacity-60"/>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_18%,rgba(217,70,239,.22),transparent_34%),radial-gradient(circle_at_18%_35%,rgba(124,58,237,.26),transparent_32%),linear-gradient(180deg,rgba(5,4,10,.32),#060509_88%)]"/>
      <div className="absolute inset-0 grid-bg opacity-[.16]"/>
      <div className="absolute left-1/2 top-28 h-72 w-72 -translate-x-1/2 rounded-full bg-fuchsia-500/10 blur-[100px]"/>

      <div className="relative mx-auto grid min-h-[700px] max-w-7xl items-center gap-8 px-5 py-10 md:min-h-[790px] md:px-6 md:py-16 lg:grid-cols-[1.05fr_.75fr]">
        <Reveal>
          <div>
            <p className="text-[10px] font-semibold tracking-[.34em] text-violet-200/80">TECH TATVA</p>
            <h1 className="mt-5 max-w-5xl text-[4.05rem] font-semibold leading-[.88] tracking-[-.08em] text-white md:mt-6 md:text-8xl lg:text-[118px]">
              Enter the next room.
            </h1>
            <p className="mt-6 max-w-2xl text-[15px] leading-7 text-white/62 md:mt-8 md:text-base md:leading-8 md:text-white/58">
              Discover real club events, register as a candidate, explore teams, and follow the work Tech Tatva publishes for students.
            </p>
            <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap md:mt-10">
              <Link href="/events" className="action-pill group flex min-h-14 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition hover:-translate-y-0.5">
                Browse registrations <ArrowRight size={16} className="transition group-hover:translate-x-0.5"/>
              </Link>
              <Link href="/teams" className="ghost-pill flex min-h-14 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm transition hover:-translate-y-0.5 hover:border-violet-200/35">
                Explore teams <ChevronRight size={16}/>
              </Link>
            </div>
          </div>
        </Reveal>

        <Reveal delay={.12}>
          <div className="relative hidden lg:block">
            <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-violet-500/18 via-fuchsia-500/10 to-transparent blur-2xl"/>
            <div className="aurora-shell relative rounded-[2rem] p-5">
              <div className="rounded-[1.5rem] border border-white/[.08] bg-white/[.035] p-5">
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-400/15 text-violet-100"><Ticket size={18}/></span>
                  <span className={nextEvent?.registrationOpen ? "rounded-full bg-emerald-400/10 px-3 py-1 text-[10px] font-semibold tracking-[.18em] text-emerald-200" : "rounded-full bg-white/[.06] px-3 py-1 text-[10px] font-semibold tracking-[.18em] text-white/45"}>
                    {nextEvent ? nextEvent.registrationOpen ? "REGISTRATION OPEN" : "EVENT LIVE" : "NO EVENT YET"}
                  </span>
                </div>
                <p className="mt-8 text-[10px] font-semibold tracking-[.3em] text-white/34">NEXT PUBLIC EVENT</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-.05em]">{nextEvent?.title || "Events will appear here"}</h2>
                <p className="mt-4 min-h-14 text-sm leading-7 text-white/45">{nextEvent?.description || "When the admin publishes an event, candidates will see it here and can register from the event page."}</p>
                <div className="mt-7 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/[.07] bg-black/25 p-4">
                    <p className="text-[10px] tracking-[.2em] text-white/32">VENUE</p>
                    <p className="mt-2 text-sm text-white/75">{nextEvent?.venue || "TBA"}</p>
                  </div>
                  <div className="rounded-2xl border border-white/[.07] bg-black/25 p-4">
                    <p className="text-[10px] tracking-[.2em] text-white/32">MODE</p>
                    <p className="mt-2 text-sm capitalize text-white/75">{nextEvent?.participationMode || "Open"}</p>
                  </div>
                </div>
                <Link href={nextEvent ? `/events/${nextEvent.slug}` : "/events"} className="action-pill mt-5 flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5">
                  {nextEvent ? "Open event" : "View events"} <ArrowUpRight size={15}/>
                </Link>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/[.07] bg-white/[.03] p-4"><Users size={16} className="text-violet-200"/><p className="mt-5 text-2xl font-semibold">{stats.members}</p><p className="mt-1 text-[10px] tracking-[.16em] text-white/32">MEMBERS</p></div>
                <div className="rounded-2xl border border-white/[.07] bg-white/[.03] p-4"><Sparkles size={16} className="text-fuchsia-200"/><p className="mt-5 text-2xl font-semibold">{stats.events}</p><p className="mt-1 text-[10px] tracking-[.16em] text-white/32">EVENTS</p></div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      <div className="relative mx-auto grid max-w-7xl grid-cols-2 gap-3 px-5 md:grid-cols-4 md:px-6">{statRows.map(([n,l])=><div key={l} className="premium-card rounded-2xl px-5 py-5 transition duration-300 hover:-translate-y-1 hover:border-violet-200/25 md:px-6 md:py-6"><p className="text-2xl font-semibold tracking-[-.04em] md:text-3xl">{n}</p><p className="mt-2 text-[9px] tracking-[.14em] text-white/35 md:text-[10px] md:tracking-[.16em]">{l.toUpperCase()}</p></div>)}</div>
    </section>
    <section className="mx-auto max-w-7xl px-5 py-20 md:px-6 md:py-28"><Reveal><SectionTitle eyebrow="LIVE SIGNAL" title="A calendar built for momentum." copy="Public events appear here when registrations are open or event details are published."/></Reveal>{events.length?<><div className="grid gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-4">{events.map((e,i)=><Reveal key={e.slug} delay={i*.08}><EventCard event={e} index={i}/></Reveal>)}</div><Link href="/events" className="ghost-pill mt-7 inline-flex min-h-12 items-center gap-2 rounded-full px-5 py-3 text-sm">View the complete calendar <ArrowUpRight size={15}/></Link></>:<EmptyState title="No public events yet." copy="Check back soon for upcoming sessions, workshops, and registrations."/>}</section>
    <section className="border-y border-white/[.06] bg-white/[.018]"><div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 md:px-6 md:py-28 lg:grid-cols-[.9fr_1.1fr] lg:gap-14"><Reveal><SectionTitle eyebrow="ONE SYSTEM / MANY DISCIPLINES" title="Teams building the future." copy="Explore the public team structure and the disciplines behind club work."/><Link className="ghost-pill inline-flex min-h-12 items-center gap-2 rounded-full px-5 py-3 text-sm" href="/teams">Explore the network <ArrowRight size={15}/></Link></Reveal><div className="grid gap-4 sm:grid-cols-2">{teams.length?teams.slice(0,6).map((team,i)=><Reveal key={team.id} delay={i*.04}><div className="premium-card group rounded-2xl p-5 transition duration-300 hover:-translate-y-1 hover:border-violet-300/25"><div className="flex justify-between"><Orbit size={18} className="text-violet-300"/><span className="rounded-full bg-white/[.045] px-3 py-1 text-xs text-white/35">{team.members}</span></div><h3 className="mt-7 text-base font-semibold">{team.name}</h3><p className="mt-2 text-xs leading-5 text-white/40">{team.description || "Team details coming soon."}</p></div></Reveal>):<EmptyState title="Team information is coming soon." copy="The public team structure has not been published yet."/>}</div></div></section>
    {achievements.length || sponsors.length || gallery.length ? <section className="mx-auto max-w-7xl px-6 py-20"><div className="grid gap-4 md:grid-cols-3">{achievements.slice(0,3).map((item:any)=><div className="glass rounded-2xl p-6" key={item._id}><p className="text-[10px] tracking-[.2em] text-violet-300">{item.kind || "ACHIEVEMENT"}</p><p className="mt-4 text-lg">{item.title}</p><p className="mt-2 text-xs leading-5 text-white/40">{item.description}</p></div>)}</div></section> : null}
    <section className="mx-auto max-w-7xl px-5 py-20 md:px-6 md:py-28"><div className="aurora-shell rounded-3xl px-6 py-12 md:px-16 md:py-16"><Zap className="absolute -right-6 -top-8 h-52 w-52 text-white/[.035]"/><p className="text-[10px] tracking-[.3em] text-violet-200">ACCESS THE NETWORK</p><h2 className="mt-6 max-w-2xl text-4xl font-medium tracking-tight md:text-6xl">The future needs people who show up early.</h2><p className="mt-5 max-w-xl text-sm leading-7 text-white/50">Find your team, enter the room, and start making something that matters.</p><Link href="/contact" className="action-pill mt-8 inline-flex min-h-12 items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold">Connect with us <ArrowUpRight size={15}/></Link></div></section>
  </PublicShell>;
}
