import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { getTechnomaniaEvents } from "@/lib/technomania-data";

export const revalidate = 60;

export default async function TechnomaniaRegisterPage() {
  const events = await getTechnomaniaEvents();
  const openEvents = events.filter((e) => e.registrationOpen);
  const closedEvents = events.filter((e) => !e.registrationOpen);

  return (
    <section className="mx-auto max-w-5xl px-5 pb-20 pt-28 md:px-6 md:pb-28 md:pt-36">
      <Link href="/" className="inline-flex items-center gap-2 text-tm-dim hover:text-white transition text-xs font-tm-mono tracking-wider mb-6">
        <ArrowLeft size={14} /> BACK TO HOME
      </Link>

      <div className="flex items-center gap-3 mb-2">
        <div className="tm-hazard-stripe-accent w-8" />
        <span className="tm-label">REGISTRATION</span>
      </div>
      <h1 className="font-tm-heading text-4xl md:text-6xl lg:text-7xl font-black tracking-[-0.04em]">
        REGISTER<br />
        <span className="text-tm-muted">NOW.</span>
      </h1>
      <p className="mt-4 text-tm-muted text-sm md:text-base max-w-2xl leading-7">
        Choose your events and register. You can participate in multiple events — just make sure the schedules don&apos;t overlap.
      </p>

      {/* Open events */}
      {openEvents.length > 0 && (
        <div className="mt-10">
          <h2 className="font-tm-heading text-lg font-bold tracking-wide flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            OPEN FOR REGISTRATION
          </h2>
          <div className="mt-4 space-y-3">
            {openEvents.map((event) => (
              <Link
                key={event.slug}
                href={`/events/${event.slug}`}
                className="tm-card tm-glow flex items-center justify-between p-5 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-tm-surface border border-tm-border flex items-center justify-center">
                    <CheckCircle size={18} className="text-green-500" />
                  </div>
                  <div>
                    <p className="font-tm-heading text-sm md:text-base font-bold tracking-wide">{event.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="font-tm-mono text-[10px] text-tm-dim">
                        {event.category?.toUpperCase() || "EVENT"}
                      </span>
                      <span className="font-tm-mono text-[10px] text-tm-dim">
                        {event.participationMode === "team" ? "TEAM" : event.participationMode === "both" ? "INDIVIDUAL/TEAM" : "INDIVIDUAL"}
                      </span>
                      <span className="font-tm-mono text-[10px] text-tm-accent">
                        {event.registrations} REGISTERED
                      </span>
                    </div>
                  </div>
                </div>
                <ArrowRight size={18} className="text-tm-dim group-hover:text-white transition" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Closed events */}
      {closedEvents.length > 0 && (
        <div className="mt-10">
          <h2 className="font-tm-heading text-lg font-bold tracking-wide flex items-center gap-2 text-tm-dim">
            <span className="w-2 h-2 rounded-full bg-tm-dim" />
            REGISTRATION CLOSED
          </h2>
          <div className="mt-4 space-y-3">
            {closedEvents.map((event) => (
              <Link
                key={event.slug}
                href={`/events/${event.slug}`}
                className="tm-card flex items-center justify-between p-5 opacity-60"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-tm-surface border border-tm-border flex items-center justify-center">
                    <span className="font-tm-mono text-xs text-tm-dim">×</span>
                  </div>
                  <div>
                    <p className="font-tm-heading text-sm md:text-base font-bold tracking-wide">{event.title}</p>
                    <span className="font-tm-mono text-[10px] text-tm-dim">
                      {event.category?.toUpperCase() || "EVENT"} · CLOSED
                    </span>
                  </div>
                </div>
                <ArrowRight size={18} className="text-tm-dim" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* No events */}
      {events.length === 0 && (
        <div className="tm-card p-10 mt-10 text-center">
          <p className="font-tm-heading text-xl font-bold">NO EVENTS AVAILABLE</p>
          <p className="text-tm-dim text-sm mt-3 max-w-md mx-auto">
            Event registrations will open soon. Check back later!
          </p>
          <div className="tm-hazard-stripe w-16 mx-auto mt-6" />
        </div>
      )}

      {/* Info */}
      <div className="mt-10 tm-card p-5">
        <p className="font-tm-mono text-xs text-tm-dim leading-5">
          <span className="text-tm-accent">TIP:</span> Click on any event to view full details and complete your registration. 
          You&apos;ll receive a QR code ticket upon successful registration.
        </p>
      </div>
    </section>
  );
}
