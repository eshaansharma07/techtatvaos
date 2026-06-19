import { CalendarDays, Sparkles } from "lucide-react";
import { EventCard } from "@/components/event-card";
import { PublicShell } from "@/components/public-shell";
import { getPublicEvents, getPublicTeams } from "@/lib/public-data";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const [events, teams] = await Promise.all([getPublicEvents(), getPublicTeams()]);
  const chips = [teams.length ? `${teams.length} active teams` : "No teams yet", `${events.length} public events`, "Upcoming first"];

  return (
    <PublicShell>
      <section className="mx-auto max-w-7xl px-5 pb-20 pt-32 md:px-6 md:pb-28 md:pt-44">
        <div className="aurora-shell rounded-[2rem] p-6 md:rounded-[2.6rem] md:p-14">
          <div className="grid gap-10 lg:grid-cols-[1fr_.7fr] lg:items-end">
            <div>
              <p className="text-[10px] font-semibold tracking-[.34em] text-violet-200">CLUB CALENDAR</p>
              <h1 className="gradient-text mt-5 text-[4.35rem] font-semibold leading-[.86] tracking-[-.08em] md:text-8xl">
                Events worth showing up for.
              </h1>
              <p className="mt-6 max-w-2xl text-[15px] leading-8 text-white/58 md:text-base">
                Public events, workshops, and registrations are listed here. Every visible card is powered by real admin-published data.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {chips.map((x, index) => (
                <span key={x} className="ghost-pill inline-flex min-h-12 items-center gap-2 rounded-2xl px-4 py-3 text-[10px] font-semibold tracking-[.14em] text-white/66">
                  {index === 0 ? <Sparkles size={13} /> : <CalendarDays size={13} />} {x.toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        </div>

        {events.length ? (
          <div className="mt-8 grid gap-5 md:mt-10 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {events.map((event, index) => <EventCard event={event} index={index} key={event.slug} />)}
          </div>
        ) : (
          <div className="premium-card mt-8 rounded-3xl p-10 text-center">
            <p className="text-lg">No public events yet.</p>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/40">Check back soon for upcoming sessions, workshops, and registrations.</p>
          </div>
        )}
      </section>
    </PublicShell>
  );
}
