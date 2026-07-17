import { CalendarDays, Sparkles } from "lucide-react";
import { EventCard } from "@/components/event-card";
import { PublicShell } from "@/components/public-shell";
import { getPublicEvents, getPublicTeams } from "@/lib/public-data";

export const revalidate = 60;

export default async function EventsPage() {
  const [events, teams] = await Promise.all([getPublicEvents(), getPublicTeams()]);
  const chips = [teams.length ? `${teams.length} active teams` : "No teams yet", `${events.length} public events`, "Upcoming first"];

  return (
    <PublicShell>
      <section className="mx-auto max-w-7xl xl:max-w-[1380px] 2xl:max-w-[1536px] px-5 pb-20 pt-32 md:px-6 md:pb-28 md:pt-44 spatial-grid-bg">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(168,85,247,0.05),transparent_45%)] pointer-events-none" />
        <div className="glass-brutalist rounded-[2rem] p-6 md:rounded-[2.6rem] md:p-14 relative z-10">
          <div className="grid gap-10 lg:grid-cols-[1fr_.7fr] lg:items-end">
            <div>
              <p className="text-[10px] font-bold tracking-[.34em] text-purple-400 uppercase">CLUB CALENDAR</p>
              <h1 className="mt-5 text-3xl xs:text-5xl font-extrabold leading-[.86] tracking-[-.08em] text-white md:text-8xl">
                Events worth <br className="hidden md:inline" />
                <span className="text-purple-400">showing up for.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-[15px] leading-8 text-white/58 md:text-base">
                Public events, workshops, and registrations are listed here. Every visible card is powered by real admin-published data.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {chips.map((x, index) => (
                <span key={x} className="brutalist-btn-dark inline-flex min-h-12 items-center gap-2 rounded-xl px-4 py-3 text-[10px] font-bold tracking-[.14em] text-white/80">
                  {index === 0 ? <Sparkles size={13} className="text-purple-400" /> : <CalendarDays size={13} className="text-purple-400" />} {x.toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        </div>
 
        {events.length ? (
          <div className="relative z-10 mt-8 grid gap-5 md:mt-10 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {events.map((event, index) => <EventCard event={event} index={index} key={event.slug} />)}
          </div>
        ) : (
          <div className="glass-brutalist mt-8 rounded-3xl p-10 text-center relative z-10">
            <p className="text-lg font-bold text-white">No public events yet.</p>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/40">Check back soon for upcoming sessions, workshops, and registrations.</p>
          </div>
        )}
      </section>
    </PublicShell>
  );
}
