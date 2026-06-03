import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import type { PublicEvent } from "@/lib/public-data";

const gradients = [
  "from-violet-700 to-fuchsia-600",
  "from-purple-800 to-pink-600",
  "from-zinc-800 to-violet-700",
  "from-fuchsia-800 to-violet-600"
];

const formatDate = (value?: string) =>
  value
    ? new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short" }).format(new Date(value)).toUpperCase()
    : "DATE TBA";

const formatTime = (value?: string) =>
  value ? new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit" }).format(new Date(value)) : "TIME TBA";

export function EventCard({ event, index = 0 }: { event: PublicEvent; index?: number }) {
  const gradient = gradients[index % gradients.length];
  return <Link href={`/events/${event.slug}`} className="group edge block overflow-hidden rounded-2xl bg-white/[.035] transition duration-500 hover:-translate-y-1 hover:border-violet-400/40">
    <div className={`relative h-40 bg-gradient-to-br ${gradient} p-5`}>
      {event.banner ? <div className="absolute inset-0 grid place-items-center bg-black/20 p-5"><img src={event.banner} alt="" className="max-h-full max-w-full object-contain opacity-95 drop-shadow-[0_18px_42px_rgba(0,0,0,.34)]" /></div> : null}
      <div className="absolute inset-0 grid-bg opacity-30"/>
      <span className="relative rounded-full bg-black/25 px-3 py-1 text-[10px] font-bold tracking-[.22em]">{(event.category || "EVENT").toUpperCase()}</span>
      <ArrowUpRight className="absolute right-5 top-5 opacity-0 transition group-hover:opacity-100"/>
    </div>
    <div className="p-5"><div className="flex justify-between gap-5"><div><h3 className="font-medium">{event.title}</h3><p className="mt-2 flex items-center gap-1.5 text-xs text-white/40"><MapPin size={12}/>{event.venue || "Venue TBA"}</p></div><div className="text-right"><p className="text-xs font-semibold text-violet-300">{formatDate(event.startAt)}</p><p className="mt-1 text-[10px] text-white/30">{formatTime(event.startAt)}</p></div></div><div className="mt-5 flex items-center justify-between border-t border-white/[.06] pt-4 text-[10px] tracking-[.18em] text-white/35"><span>{(event.team || "CLUB").toUpperCase()}</span><span className={event.registrationOpen ? "text-emerald-300" : "text-white/35"}>{event.registrationOpen ? "OPEN" : event.status.toUpperCase()}</span></div></div>
  </Link>;
}
