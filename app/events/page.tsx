import { Search, SlidersHorizontal } from "lucide-react";
import { EventCard } from "@/components/event-card";
import { PublicShell } from "@/components/public-shell";
import { getPublicEvents, getPublicTeams } from "@/lib/public-data";

export const dynamic = "force-dynamic";

export default async function EventsPage(){
  const [events, teams] = await Promise.all([getPublicEvents(), getPublicTeams()]);
  return <PublicShell><section className="mx-auto max-w-7xl px-6 pb-24 pt-40"><p className="text-[10px] tracking-[.3em] text-violet-300">CLUB CALENDAR</p><h1 className="mt-5 text-6xl font-medium tracking-[-.07em] md:text-8xl">Enter the room.</h1><p className="mt-6 max-w-xl text-sm leading-7 text-white/45">Only events published by the admin portal are listed here.</p><div className="glass mt-12 flex flex-wrap items-center gap-3 rounded-2xl p-3"><div className="flex min-w-56 flex-1 items-center gap-3 px-3"><Search size={16} className="text-white/35"/><input className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-white/25" placeholder="Search is available from the admin global search"/></div>{[teams.length?`${teams.length} TEAMS`:"NO TEAMS","PUBLISHED ONLY","UPCOMING FIRST"].map(x=><button key={x} className="rounded-xl border border-white/[.08] bg-white/[.04] px-4 py-3 text-[10px] tracking-[.14em] text-white/55">{x}</button>)}<button className="rounded-xl bg-violet-500 p-3" title="Filters use published database records"><SlidersHorizontal size={15}/></button></div>{events.length?<div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{events.map((event,index)=><EventCard event={event} index={index} key={event.slug}/>)}</div>:<div className="edge mt-8 rounded-2xl bg-white/[.025] p-10 text-center"><p className="text-lg">No events have been published yet.</p><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/40">Create an event in the admin portal and set its status to published or active. Nothing fake will be shown here.</p></div>}</section></PublicShell>
}
