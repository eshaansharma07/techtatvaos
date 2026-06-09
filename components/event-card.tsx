import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import type { PublicEvent } from "@/lib/public-data";

const gradients = [
  "from-[#f8ded1] to-[#f4c8b7]",
  "from-[#eee1ff] to-[#f8d5df]",
  "from-[#f6ead2] to-[#f4c083]",
  "from-[#f8d8df] to-[#f7eadb]"
];

const formatDate = (value?: string) =>
  value
    ? new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short" }).format(new Date(value)).toUpperCase()
    : "DATE TBA";

const formatTime = (value?: string) =>
  value ? new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit" }).format(new Date(value)) : "TIME TBA";

export function EventCard({ event, index = 0 }: { event: PublicEvent; index?: number }) {
  const gradient = gradients[index % gradients.length];
  return <Link href={`/events/${event.slug}`} className="group block overflow-hidden rounded-[1.75rem] border border-stone-200/80 bg-white shadow-[0_24px_70px_rgba(88,65,46,.1)] transition duration-500 active:scale-[.99] md:rounded-[2rem] md:hover:-translate-y-1">
    <div className={`relative h-56 overflow-hidden bg-gradient-to-br ${gradient} p-5 md:h-52`}>
      {event.banner ? <div className="absolute inset-0 grid place-items-center overflow-hidden p-5"><img src={event.banner} alt="" className="h-full w-full object-contain opacity-95 drop-shadow-[0_18px_32px_rgba(88,65,46,.16)]" /></div> : null}
      <span className="relative z-10 rounded-full bg-white/72 px-3 py-1 text-[10px] font-bold tracking-[.22em] text-stone-700 backdrop-blur">{(event.category || "EVENT").toUpperCase()}</span>
      <ArrowUpRight className="absolute right-5 top-5 z-10 text-stone-700 opacity-0 transition group-hover:opacity-100"/>
    </div>
    <div className="relative z-10 bg-white p-5"><div className="flex justify-between gap-5"><div><h3 className="text-lg font-semibold tracking-[-.035em] text-stone-950 md:text-xl">{event.title}</h3><p className="mt-2 flex items-center gap-1.5 text-sm text-stone-500 md:text-xs"><MapPin size={13} className="md:h-3 md:w-3"/>{event.venue || "Venue TBA"}</p></div><div className="text-right"><p className="text-sm font-semibold text-rose-600 md:text-xs">{formatDate(event.startAt)}</p><p className="mt-1 text-[11px] text-stone-400 md:text-[10px]">{formatTime(event.startAt)}</p></div></div><div className="mt-5 flex items-center justify-between border-t border-stone-200/80 pt-4 text-[10px] tracking-[.18em] text-stone-400"><span>{(event.team || "CLUB").toUpperCase()}</span><span className={event.registrationOpen ? "rounded-full bg-[#e7f5df] px-3 py-1.5 text-[#5f7e4d] md:px-2.5 md:py-1" : "rounded-full bg-stone-100 px-3 py-1.5 text-stone-500 md:px-2.5 md:py-1"}>{event.registrationOpen ? "OPEN" : event.status.toUpperCase()}</span></div></div>
  </Link>;
}
