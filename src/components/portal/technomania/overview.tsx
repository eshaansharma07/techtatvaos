"use client";

import React, { useEffect, useState } from "react";
import { Users, LayoutDashboard, Target, Zap, Loader2 } from "lucide-react";

export function TechnomaniaOverview() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const statsRes = await fetch("/api/fest/stats");
        const s = await statsRes.json();
        setStats(s);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-zinc-500" /></div>;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "REGISTERED SQUADS", value: stats?.registeredSquads || 0, icon: Users, color: "text-blue-500" },
          { label: "TOTAL BUILDERS", value: stats?.totalBuilders || 0, icon: Target, color: "text-purple-500" },
          { label: "ACTIVE FEST ARENAS", value: stats?.activeFestArenas || 0, icon: LayoutDashboard, color: "text-amber-500" },
          { label: "LIVE LEADERBOARD TEAMS", value: stats?.liveLeaderboardTeams || 0, icon: Zap, color: "text-green-500" },
        ].map((stat, i) => (
          <div key={i} className="p-6 bg-zinc-950 border border-zinc-900 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
            <stat.icon className={`w-8 h-8 ${stat.color}`} />
            <h4 className="text-3xl font-black text-white font-mono">{stat.value}</h4>
            <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
