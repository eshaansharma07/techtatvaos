import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import type { events } from "@/lib/data";
export function EventCard({ event }: { event: (typeof events)[number] }) {
  return <Link href={`/events/${event.slug}`} className="group edge block overflow-hidden rounded-2xl bg-white/[.035] transition duration-500 hover:-translate-y-1 hover:border-violet-400/40">
    <div className={`relative h-40 bg-gradient-to-br ${event.accent} p-5`}><div className="absolute inset-0 grid-bg opacity-30"/><span className="relative rounded-full bg-black/25 px-3 py-1 text-[10px] font-bold tracking-[.22em]">{event.type.toUpperCase()}</span><ArrowUpRight className="absolute right-5 top-5 opacity-0 transition group-hover:opacity-100"/></div>
    <div className="p-5"><div className="flex justify-between gap-5"><div><h3 className="font-medium">{event.title}</h3><p className="mt-2 flex items-center gap-1.5 text-xs text-white/40"><MapPin size={12}/>{event.venue}</p></div><div className="text-right"><p className="text-xs font-semibold text-violet-300">{event.date}</p><p className="mt-1 text-[10px] text-white/30">{event.time}</p></div></div><div className="mt-5 flex items-center justify-between border-t border-white/[.06] pt-4 text-[10px] tracking-[.18em] text-white/35"><span>{event.team.toUpperCase()}</span><span className="text-emerald-300">{event.status}</span></div></div>
  </Link>;
}
