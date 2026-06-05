import { CalendarDays, Sparkles } from "lucide-react";
import { EventCard } from "@/components/event-card";
import { PublicShell } from "@/components/public-shell";
import { getPublicEvents, getPublicTeams } from "@/lib/public-data";

export const dynamic = "force-dynamic";

export default async function EventsPage(){
  const [events, teams] = await Promise.all([getPublicEvents(), getPublicTeams()]);
  return <PublicShell><section className="mx-auto max-w-7xl px-5 pb-20 pt-28 md:px-6 md:pb-24 md:pt-40"><div className="aurora-shell rounded-[2rem] p-6 md:rounded-[2.25rem] md:p-12"><p className="text-[10px] font-semibold tracking-[.3em] text-violet-200">CLUB CALENDAR</p><h1 className="gradient-text mt-5 text-[3.8rem] font-medium leading-[.9] tracking-[-.07em] md:text-8xl">Enter the room.</h1><p className="mt-5 max-w-xl text-[15px] leading-7 text-white/55 md:mt-6 md:text-sm md:text-white/50">Public events, workshops, and registrations are listed here. Every visible card is powered by real admin-published data.</p><div className="mt-7 flex snap-x gap-3 overflow-x-auto pb-1 md:mt-9 md:flex-wrap md:overflow-visible">{[teams.length?`${teams.length} active teams`:"No teams yet",`${events.length} public events`,"Upcoming first"].map((x,index)=><span key={x} className="ghost-pill inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 py-2 text-[10px] font-semibold tracking-[.14em] text-white/62">{index===0?<Sparkles size={13}/>:<CalendarDays size={13}/>} {x.toUpperCase()}</span>)}</div></div>{events.length?<div className="mt-6 grid gap-4 md:mt-8 md:grid-cols-2 md:gap-5 lg:grid-cols-4">{events.map((event,index)=><EventCard event={event} index={index} key={event.slug}/>)}</div>:<div className="premium-card mt-8 rounded-3xl p-10 text-center"><p className="text-lg">No public events yet.</p><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/40">Check back soon for upcoming sessions, workshops, and registrations.</p></div>}</section></PublicShell>
}
