import { CalendarDays, Sparkles } from "lucide-react";
import { EventCard } from "@/components/event-card";
import { PublicShell } from "@/components/public-shell";
import { getPublicEvents, getPublicTeams } from "@/lib/public-data";

export const dynamic = "force-dynamic";

export default async function EventsPage(){
  const [events, teams] = await Promise.all([getPublicEvents(), getPublicTeams()]);
  return <PublicShell><section className="mx-auto max-w-7xl px-5 pb-20 pt-28 md:px-6 md:pb-24 md:pt-40"><div className="rounded-[2.6rem] border border-stone-200/80 bg-[#fffdf8] p-7 shadow-[0_30px_110px_rgba(82,52,30,.08)] md:p-12"><p className="text-[11px] font-semibold uppercase tracking-[.28em] text-rose-400">CLUB CALENDAR</p><h1 className="mt-5 max-w-4xl text-[4rem] font-semibold leading-[.88] tracking-[-.08em] text-stone-950 md:text-8xl">Events, edited like a magazine.</h1><p className="mt-6 max-w-2xl text-base leading-8 text-stone-500">Browse real workshops, sessions, and registrations published from the portal. No sample data, only what the club adds.</p><div className="mt-8 flex snap-x gap-3 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible">{[teams.length?`${teams.length} active teams`:"No teams yet",`${events.length} public events`,"Upcoming first"].map((x,index)=><span key={x} className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-[10px] font-semibold tracking-[.14em] text-stone-500 shadow-[0_10px_28px_rgba(82,52,30,.05)]">{index===0?<Sparkles size={13}/>:<CalendarDays size={13}/>} {x.toUpperCase()}</span>)}</div></div>{events.length?<div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{events.map((event,index)=><EventCard event={event} index={index} key={event.slug}/>)}</div>:<div className="mt-8 rounded-3xl border border-stone-200 bg-white p-10 text-center"><p className="text-lg text-stone-900">No public events yet.</p><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-stone-500">Check back soon for upcoming sessions, workshops, and registrations.</p></div>}</section></PublicShell>
}
