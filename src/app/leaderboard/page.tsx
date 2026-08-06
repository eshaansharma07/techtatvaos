import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Trophy, Sparkles, Calendar, MapPin, Award } from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { getPublicLeaderboards } from "@/lib/public-data";
import { LeaderboardClient } from "@/components/leaderboard-client";

export const revalidate = 30;

export const metadata = {
  title: "Event Leaderboard | Tech Tatva",
  description: "Official real-time event rankings, stage score breakdowns, and team standings for Tech Tatva competitions."
};

export default async function LeaderboardPage() {
  const events = await getPublicLeaderboards();

  return (
    <PublicShell>
      <section className="mx-auto max-w-7xl xl:max-w-[1380px] 2xl:max-w-[1536px] px-5 pb-36 pt-32 md:px-6 md:pb-40 md:pt-44 spatial-grid-bg">
        {/* Header Hero */}
        <div className="glass-brutalist relative overflow-hidden rounded-[2.2rem] p-6 md:rounded-[2.8rem] md:p-10 relative z-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(168,85,247,0.08),transparent_50%)] pointer-events-none" />
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-2 rounded-xl border-2 border-black bg-purple-500 px-4 py-1.5 text-[10px] font-extrabold tracking-[.24em] text-black uppercase shadow-[2px_2px_0px_0px_rgba(255,255,255,0.8)]">
                <Trophy size={14} />
                LIVE COMPETING STANDINGS
              </span>
              <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-[-.05em] text-white md:text-6xl lg:text-7xl">
                Event Leaderboard
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/60 md:text-base md:leading-8">
                Official real-time rankings, stage breakdown scores, and team totals for Tech Tatva competitive events.
              </p>
            </div>
            
            <div className="glass-brutalist shrink-0 rounded-2xl p-5 border border-purple-500/20 text-center max-w-[240px]">
              <p className="text-[10px] font-bold text-purple-300 uppercase tracking-widest">SCORING ENGINE</p>
              <p className="mt-2 text-xs text-white/70 font-semibold">Final Score = Base Score + Time Bonus − Hint Penalties</p>
              <div className="mt-3 inline-flex items-center gap-1.5 text-[10px] text-white/40">
                <Sparkles size={12} className="text-purple-400" /> Managed live by club admins
              </div>
            </div>
          </div>
        </div>

        {/* Client Component for Dynamic Tabs & Interactive Roster */}
        <div className="mt-8 relative z-10">
          <LeaderboardClient events={events} />
        </div>
      </section>
    </PublicShell>
  );
}
