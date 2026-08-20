"use client";

import React, { useEffect, useState } from "react";
import { Users, LayoutDashboard, Target, Zap, Loader2 } from "lucide-react";

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<any>(null);
  const [arenas, setArenas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, arenasRes] = await Promise.all([
          fetch("/api/fest/stats"),
          fetch("/api/admin/arenas")
        ]);
        const s = await statsRes.json();
        const a = await arenasRes.json();
        setStats(s);
        setArenas(a);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-zinc-500" size={32} /></div>;
  }

  const kpis = [
    { label: "Registered Squads", value: stats?.registeredSquads || 0, icon: <Target size={20} /> },
    { label: "Total Builders", value: stats?.totalBuilders || 0, icon: <Users size={20} /> },
    { label: "Active Fest Arenas", value: stats?.activeFestArenas || 0, icon: <Zap size={20} /> },
    { label: "Live Leaderboard Teams", value: stats?.liveLeaderboardTeams || 0, icon: <LayoutDashboard size={20} /> },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-3xl font-black text-white uppercase tracking-tight">Overview</h2>
        <p className="text-sm text-zinc-500 font-mono tracking-widest uppercase mt-2">Real-time Fest Metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="p-6 bg-zinc-950 border border-zinc-900 rounded-xl relative overflow-hidden group hover:border-zinc-700 transition-colors">
            <div className="absolute top-0 right-0 p-6 text-zinc-800 group-hover:text-zinc-700 transition-colors">
              {kpi.icon}
            </div>
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">{kpi.label}</p>
            <p className="text-4xl font-black text-white">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-bold text-white uppercase tracking-widest border-b border-zinc-900 pb-4">Arena Fill Rates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {arenas.map(arena => {
            const pct = arena.capacity > 0 ? Math.min(100, Math.round((arena.registeredCount / arena.capacity) * 100)) : 0;
            return (
              <div key={arena._id} className="p-6 bg-zinc-950 border border-zinc-900 rounded-xl">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <h4 className="text-white font-bold uppercase">{arena.title}</h4>
                    <p className="text-xs text-zinc-500 font-mono tracking-widest uppercase">{arena.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-white">{pct}%</p>
                    <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">{arena.registeredCount} / {arena.capacity || "∞"}</p>
                  </div>
                </div>
                <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                  <div className={`h-full ${pct >= 100 ? 'bg-red-500' : 'bg-white'}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
