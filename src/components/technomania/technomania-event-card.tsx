import Link from "next/link";
import Image from "next/image";
import { Calendar, Users, Target, ArrowUpRight } from "lucide-react";

interface EventCardProps {
  event?: any;
  slug?: string;
  title?: string;
  description?: string;
  banner?: string;
  category?: string;
  status?: string;
  startAt?: string;
  registrationOpen?: boolean;
  participationMode?: "individual" | "team" | "both";
  registrations?: number;
  capacity?: number;
}

export function TechnomaniaEventCard(props: EventCardProps) {
  const e = props.event || props;
  const slug = e.slug || "";
  const title = e.title || "";
  const description = e.description || "";
  const banner = e.banner;
  const category = e.category || "EVENT";
  const startAt = e.startAt || "";
  const registrationOpen = !!e.registrationOpen;
  const participationMode = e.participationMode || "individual";
  const registrations = e.registrations || 0;
  const capacity = e.capacity;

  const date = startAt ? new Date(startAt) : null;
  const formattedDate = date && !isNaN(date.getTime())
    ? date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Date TBA";
  
  return (
    <Link
      href={`/events/${slug}`}
      className="block tm-card bg-tm-surface flex flex-col group overflow-hidden tm-glow transition-all duration-300 hover:-translate-y-1"
    >
      {/* Banner */}
      <div className="relative h-40 w-full bg-tm-grid border-b border-tm-border overflow-hidden">
        {banner ? (
          <Image
            src={banner}
            alt={title}
            fill
            className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <div className="w-full h-full tm-hazard-stripe" />
          </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3 bg-tm-bg/80 backdrop-blur border border-tm-border px-2.5 py-1 text-[9px] font-tm-mono tracking-widest text-tm-text uppercase rounded">
          {category}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-tm-heading text-lg font-bold text-tm-text mb-2 line-clamp-1 group-hover:text-tm-accent transition-colors">
          {title}
        </h3>
        
        <p className="text-xs text-tm-muted line-clamp-2 mb-4 flex-grow">
          {description}
        </p>
        
        <div className="space-y-2 mb-5">
          <div className="flex items-center gap-2 text-[10px] font-tm-mono text-tm-dim uppercase tracking-wider">
            <Calendar size={12} />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-tm-mono text-tm-dim uppercase tracking-wider">
            <Users size={12} />
            <span>Mode: {participationMode}</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-tm-mono text-tm-dim uppercase tracking-wider">
            <Target size={12} />
            <span>{registrations} Registered {capacity ? `/ ${capacity}` : ""}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-tm-border border-dashed mt-auto">
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${registrationOpen ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
            <span className="text-[10px] font-tm-mono font-bold tracking-widest text-tm-text">
              {registrationOpen ? "OPEN" : "CLOSED"}
            </span>
          </div>
          
          <div className="w-7 h-7 rounded-full border border-tm-border flex items-center justify-center text-tm-muted group-hover:bg-tm-text group-hover:text-tm-bg group-hover:border-tm-text transition-all">
            <ArrowUpRight size={14} />
          </div>
        </div>
      </div>
    </Link>
  );
}
