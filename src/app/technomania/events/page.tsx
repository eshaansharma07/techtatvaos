import Link from "next/link";
import { ArrowLeft, Filter } from "lucide-react";
import { TechnomaniaEventCard } from "@/components/technomania/technomania-event-card";
import { getTechnomaniaEvents } from "@/lib/technomania-data";

export const revalidate = 60;

export default async function TechnomaniaEventsPage() {
  const events = await getTechnomaniaEvents();

  return (
    <section className="mx-auto max-w-7xl px-5 pb-20 pt-28 md:px-6 md:pb-28 md:pt-36">
      {/* Header */}
      <div className="mb-10">
        <Link href="/technomania" className="inline-flex items-center gap-2 text-tm-dim hover:text-white transition text-xs font-tm-mono tracking-wider mb-6">
          <ArrowLeft size={14} /> BACK TO TECHNOMANIA HOME
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <div className="tm-hazard-stripe-accent w-8" />
          <span className="tm-label">EVENT CATALOG</span>
        </div>
        <h1 className="font-tm-heading text-4xl md:text-6xl lg:text-7xl font-black tracking-[-0.04em]">
          ALL<br />
          <span className="text-tm-muted">EVENTS.</span>
        </h1>
        <p className="mt-4 text-tm-muted text-sm md:text-base max-w-2xl leading-7">
          Browse all Technomania 3.0 events. From the 24-hour hackathon to esports tournaments and cultural showcases — find your arena.
        </p>
      </div>

      {/* Events grid */}
      {events.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <TechnomaniaEventCard key={event.slug} event={event} />
          ))}
        </div>
      ) : (
        <div className="tm-card p-10 md:p-16 text-center">
          <p className="font-tm-heading text-xl font-bold">NO EVENTS YET</p>
          <p className="text-tm-dim text-sm mt-3 max-w-md mx-auto">
            Events will appear here once they are published by the organizers. Check back soon!
          </p>
          <div className="tm-hazard-stripe w-16 mx-auto mt-6" />
        </div>
      )}

      {/* Info note */}
      <div className="mt-10 flex items-center gap-3 text-tm-dim">
        <Filter size={14} />
        <span className="font-tm-mono text-xs">
          {events.length} EVENT{events.length !== 1 ? "S" : ""} FOUND · SHOWING ALL TECHNOMANIA 3.0 EVENTS
        </span>
      </div>
    </section>
  );
}
