import Link from "next/link";
import { ArrowLeft, Filter } from "lucide-react";
import { TechnomaniaEventCard } from "@/components/technomania/technomania-event-card";
import { TechnomaniaEventsClient } from "@/components/technomania/technomania-events-client";
import { getTechnomaniaEvents } from "@/lib/technomania-data";

export const dynamic = "force-dynamic";

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

      {/* Events Client with Tabs & Modals */}
      <TechnomaniaEventsClient events={events} />

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
