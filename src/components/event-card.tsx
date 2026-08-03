import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import type { PublicEvent } from "@/lib/public-data";
import { eventHref } from "@/lib/event-links";

const gradients = [
  "from-[#0b0c0e] to-[#121316]",
  "from-[#111215] to-[#0d0e11]",
  "from-[#0e0f12] to-[#16171c]"
];

const formatDate = (value?: string) =>
  value
    ? new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short" }).format(new Date(value)).toUpperCase()
    : "DATE TBA";

const formatTime = (value?: string) =>
  value ? new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit" }).format(new Date(value)) : "TIME TBA";

export function EventCard({ event, index = 0 }: { event: PublicEvent; index?: number }) {
  const gradient = gradients[index % gradients.length];
  return <Link href={eventHref(event.slug)} className="event-card glass-brutalist group block overflow-hidden rounded-[1.75rem] transition duration-500 active:scale-[.99] md:rounded-3xl md:hover:-translate-y-1.5 md:hover:border-purple-500/50">
    <div className={`event-card-media relative h-60 overflow-hidden bg-gradient-to-br ${gradient} p-5 md:h-52`}>
      {event.banner ? <div className="absolute inset-0 grid place-items-center overflow-hidden bg-black/10 p-5"><Image width={1200} height={1200} src={event.banner} alt="" className="h-full w-full object-contain opacity-95 drop-shadow-[0_22px_46px_rgba(0,0,0,.38)] transition duration-700 group-hover:scale-[1.035]" /></div> : null}
      <div className="absolute inset-0 grid-bg opacity-25"/>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.12),rgba(0,0,0,.02)_45%,rgba(0,0,0,.45))]"/>
      <span className="relative z-10 rounded-xl border border-white/20 bg-black/50 px-3 py-1.5 text-[10px] font-bold tracking-[.22em] text-blue-300 backdrop-blur">{(event.category || "EVENT").toUpperCase()}</span>
      <span className="absolute right-5 top-5 z-10 grid h-10 w-10 place-items-center rounded-xl border border-white/25 bg-black/50 text-blue-300 opacity-0 backdrop-blur transition group-hover:opacity-100"><ArrowUpRight size={16}/></span>
    </div>
    <div className="event-card-body relative z-10 p-5 md:p-6">
      <div className="flex justify-between gap-5">
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-xl font-bold tracking-[-.035em] text-white md:text-lg">{event.title}</h3>
          <p className="mt-3 flex items-center gap-1.5 text-sm text-white/48 md:text-xs"><MapPin size={13} className="shrink-0"/>{event.venue || "Venue TBA"}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-bold text-blue-400">{formatDate(event.startAt)}</p>
          <p className="mt-1 text-[11px] text-white/38">{formatTime(event.startAt)}</p>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between border-t border-white/[.075] pt-4 text-[10px] tracking-[.18em] text-white/38">
        <span>{(event.team || "CLUB").toUpperCase()}</span>
        <span className={event.registrationOpen ? "rounded-xl border border-black bg-blue-500 px-3 py-1 font-bold text-white shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)]" : "rounded-xl border border-white/20 bg-white/5 px-3 py-1.5 text-white/48"}>{event.registrationOpen ? "OPEN" : event.status.toUpperCase()}</span>
      </div>
    </div>
  </Link>;
}
