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
  return <Link href={`/events/${event.slug}`} className="event-card premium-card group block overflow-hidden rounded-[1.75rem] transition duration-500 active:scale-[.99] md:rounded-3xl md:hover:-translate-y-1.5 md:hover:border-violet-300/40">
    <div className={`event-card-media relative h-60 overflow-hidden bg-gradient-to-br ${gradient} p-5 md:h-52`}>
      {event.banner ? <div className="absolute inset-0 grid place-items-center overflow-hidden bg-black/10 p-5"><img src={event.banner} alt="" className="h-full w-full object-contain opacity-95 drop-shadow-[0_22px_46px_rgba(0,0,0,.38)] transition duration-700 group-hover:scale-[1.035]" /></div> : null}
      <div className="absolute inset-0 grid-bg opacity-25"/>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.12),rgba(0,0,0,.02)_45%,rgba(0,0,0,.45))]"/>
      <span className="relative z-10 rounded-full border border-white/15 bg-black/35 px-3 py-1.5 text-[10px] font-bold tracking-[.22em] text-white/82 backdrop-blur">{(event.category || "EVENT").toUpperCase()}</span>
      <span className="absolute right-5 top-5 z-10 grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-black/30 text-white/80 opacity-0 backdrop-blur transition group-hover:opacity-100"><ArrowUpRight size={16}/></span>
    </div>
    <div className="event-card-body relative z-10 p-5 md:p-6">
      <div className="flex justify-between gap-5">
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-xl font-semibold tracking-[-.035em] text-white md:text-lg">{event.title}</h3>
          <p className="mt-3 flex items-center gap-1.5 text-sm text-white/48 md:text-xs"><MapPin size={13} className="shrink-0"/>{event.venue || "Venue TBA"}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-semibold text-violet-100">{formatDate(event.startAt)}</p>
          <p className="mt-1 text-[11px] text-white/38">{formatTime(event.startAt)}</p>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between border-t border-white/[.075] pt-4 text-[10px] tracking-[.18em] text-white/38">
        <span>{(event.team || "CLUB").toUpperCase()}</span>
        <span className={event.registrationOpen ? "rounded-full border border-emerald-300/20 bg-emerald-400/12 px-3 py-1.5 text-emerald-100" : "rounded-full border border-white/[.08] bg-white/[.045] px-3 py-1.5 text-white/48"}>{event.registrationOpen ? "OPEN" : event.status.toUpperCase()}</span>
      </div>
    </div>
  </Link>;
}
