import { CalendarDays, Sparkles } from "lucide-react";
import Link from "next/link";
import { EventCard } from "@/components/event-card";
import { PublicShell } from "@/components/public-shell";
import { Reveal } from "@/components/reveal";
import { getPublicEvents, getPublicTeams } from "@/lib/public-data";

export const revalidate = 60;

export default async function EventsPage() {
  const [events, teams] = await Promise.all([getPublicEvents(), getPublicTeams()]);

  return (
    <PublicShell>
      <section className="mx-auto max-w-7xl xl:max-w-[1380px] 2xl:max-w-[1536px] px-5 pb-24 pt-32 md:px-6 md:pt-44 spatial-grid-bg">

        {/* ── HERO ── */}
        <Reveal>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b-2 border-black pb-10 mb-10">
            <div>
              <span className="inline-flex rounded-xl border-2 border-black bg-[#00FF66] px-4 py-1.5 text-[10px] font-bold tracking-[.28em] text-black shadow-[2px_2px_0px_0px_#000] uppercase">
                Club Calendar
              </span>
              <h1 className="mt-5 text-[clamp(2.8rem,7vw,6.5rem)] font-extrabold leading-[.88] tracking-[-0.06em] text-black">
                Events worth<br />
                <span className="text-black/25">showing up for.</span>
              </h1>
              <p className="mt-6 max-w-xl text-sm leading-7 text-black/55">
                Workshops, hackathons, and guest speaker sessions organized by Tech Tatva. Dynamic listings straight from the administration database.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
              <div className="flex flex-wrap gap-2">
                {[`${events.length} Events`, `${teams.length} Teams`].map((chip) => (
                  <span key={chip} className="rounded-xl border-2 border-black bg-white px-4 py-2.5 text-[10px] font-bold tracking-[.14em] text-black shadow-[2px_2px_0px_0px_#000] uppercase">
                    {chip}
                  </span>
                ))}
              </div>
              <Link href="/join" className="brutalist-btn-green inline-flex min-h-11 items-center gap-1.5 rounded-xl px-5 text-[10px] font-bold tracking-[.14em] uppercase text-black whitespace-nowrap">
                Register Now →
              </Link>
            </div>
          </div>
        </Reveal>

        {/* ── EVENTS GRID ── */}
        {events.length ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {events.map((event, index) => (
              <Reveal key={event.slug} delay={index * 0.05}>
                <EventCard event={event} index={index} />
              </Reveal>
            ))}
          </div>
        ) : (
          <Reveal>
            <div className="glass-brutalist rounded-[2rem] p-12 text-center">
              <CalendarDays className="mx-auto text-black/20 mb-4" size={32} />
              <h3 className="text-lg font-bold text-black">No public events scheduled</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-black/40">
                The events board is currently empty. Check back soon for upcoming hackathons, tech talks, and registrations.
              </p>
            </div>
          </Reveal>
        )}
      </section>
    </PublicShell>
  );
}
