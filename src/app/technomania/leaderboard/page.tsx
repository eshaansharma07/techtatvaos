import Link from "next/link";
import { ArrowLeft, Trophy } from "lucide-react";
import { getTechnomaniaEvents } from "@/lib/technomania-data";
import { TechnomaniaBracket } from "@/components/technomania/technomania-bracket";

export const dynamic = "force-dynamic";

export default async function TechnomaniaLeaderboardPage() {
  const events = await getTechnomaniaEvents();
  const eventsWithLeaderboard = events.filter((e: any) => e.leaderboardVisible);

  return (
    <section className="mx-auto max-w-5xl px-5 pb-20 pt-28 md:px-6 md:pb-28 md:pt-36">
      <Link href="/technomania" className="inline-flex items-center gap-2 text-tm-dim hover:text-white transition text-xs font-tm-mono tracking-wider mb-6">
        <ArrowLeft size={14} /> BACK TO TECHNOMANIA HOME
      </Link>

      <div className="flex items-center gap-3 mb-2">
        <div className="tm-hazard-stripe-accent w-8" />
        <span className="tm-label">RANKINGS</span>
      </div>
      <h1 className="font-tm-heading text-4xl md:text-6xl lg:text-7xl font-black tracking-[-0.04em]">
        LEADER<br />
        <span className="text-tm-muted">BOARD.</span>
      </h1>
      <p className="mt-4 text-tm-muted text-sm md:text-base max-w-2xl leading-7">
        Live rankings and results from Technomania 3.0 events. Leaderboards become visible once events are completed or organizers publish them.
      </p>

      <div className="mt-10 space-y-16">
        {events.filter((e: any) => e.bracketData && Array.isArray(e.bracketData) && e.bracketData.length > 0).map((event: any) => (
          <div key={event.slug} className="space-y-6">
            <div className="flex items-center gap-4 border-b border-tm-border pb-4">
              <div className="w-12 h-12 rounded-lg bg-tm-accent/10 border border-tm-accent/20 flex items-center justify-center">
                <Trophy size={20} className="text-tm-accent" />
              </div>
              <div>
                <h2 className="font-tm-heading text-2xl font-bold tracking-wide uppercase">{event.title}</h2>
                <span className="font-tm-mono text-xs text-tm-dim tracking-widest uppercase">
                  {event.category} · LIVE BRACKET
                </span>
              </div>
            </div>
            
            <TechnomaniaBracket rounds={event.bracketData} />
          </div>
        ))}

        {events.filter((e: any) => e.bracketData && Array.isArray(e.bracketData) && e.bracketData.length > 0).length === 0 && (
          <div className="tm-card p-10 text-center">
            <Trophy size={32} className="text-tm-dim mx-auto mb-4" />
            <p className="font-tm-heading text-xl font-bold">NO LEADERBOARDS YET</p>
            <p className="text-tm-dim text-sm mt-3 max-w-md mx-auto">
              Brackets and Leaderboards will appear here once events begin and results are updated by admins.
            </p>
            <div className="tm-hazard-stripe w-16 mx-auto mt-6" />
          </div>
        )}
      </div>
    </section>
  );
}
