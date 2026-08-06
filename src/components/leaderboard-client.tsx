"use client";

import { useState } from "react";
import Link from "next/link";
import { Trophy, Search, ArrowUpRight, Award, Sparkles, MapPin } from "lucide-react";
import { eventHref } from "@/lib/event-links";

interface LeaderboardEvent {
  id: string;
  slug: string;
  title: string;
  category?: string;
  banner?: string;
  venue?: string;
  leaderboard: Array<{
    id: string;
    teamName: string;
    scores: Array<{
      category: string;
      baseScore: number;
      timeBonus: number;
      hintPenalty: number;
      notes?: string;
    }>;
    totalScore: number;
    rank: number;
  }>;
}

export function LeaderboardClient({ events }: { events: LeaderboardEvent[] }) {
  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || "");
  const [search, setSearch] = useState("");

  if (!events || events.length === 0) {
    return (
      <div className="glass-brutalist rounded-[2.2rem] p-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
          <Trophy size={32} />
        </div>
        <h3 className="text-2xl font-extrabold text-white">No Public Leaderboards Active</h3>
        <p className="mt-3 max-w-md mx-auto text-sm text-white/50 leading-relaxed">
          Event scores are currently under live compilation by club admins. Check back during or after active competitions!
        </p>
        <Link href="/events" className="brutalist-btn-purple mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-xs font-bold uppercase tracking-wider">
          <span>Explore All Events</span>
          <ArrowUpRight size={14} />
        </Link>
      </div>
    );
  }

  const selectedEvent = events.find((e) => e.id === selectedEventId) || events[0];
  const entries = selectedEvent?.leaderboard || [];

  const filteredEntries = entries.filter((entry) => {
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    return (
      entry.teamName.toLowerCase().includes(query) ||
      entry.scores.some((s) => s.category.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-8">
      {/* Event Selection Bar */}
      <div className="glass-brutalist rounded-[2rem] p-4 md:p-6">
        <p className="text-[10px] font-extrabold uppercase tracking-[.24em] text-purple-400 mb-3">
          Select Event Leaderboard
        </p>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10">
          {events.map((ev) => {
            const isActive = ev.id === selectedEvent.id;
            return (
              <button
                key={ev.id}
                type="button"
                onClick={() => {
                  setSelectedEventId(ev.id);
                  setSearch("");
                }}
                className={`flex shrink-0 items-center gap-2.5 rounded-xl border-2 px-5 py-3 text-xs font-extrabold uppercase tracking-wider transition ${
                  isActive
                    ? "border-purple-500 bg-purple-500/20 text-white shadow-[0_0_25px_rgba(168,85,247,0.3)]"
                    : "border-white/10 bg-black/40 text-white/60 hover:border-white/20 hover:text-white"
                }`}
              >
                <Trophy size={14} className={isActive ? "text-purple-400" : "text-white/40"} />
                <span>{ev.title}</span>
                <span className="rounded-md bg-white/10 px-2 py-0.5 text-[9px] font-mono text-purple-200">
                  {ev.leaderboard.length} teams
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Event Details & Search */}
      <div className="glass-brutalist rounded-[2.2rem] p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-400">
                {selectedEvent.category || "COMPETITION"}
              </span>
              {selectedEvent.venue && (
                <span className="flex items-center gap-1 text-[10px] text-white/40 font-mono">
                  <MapPin size={10} /> {selectedEvent.venue}
                </span>
              )}
            </div>
            <h2 className="mt-1 text-3xl font-extrabold text-white">{selectedEvent.title}</h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-64">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search team or stage..."
                className="w-full rounded-xl border border-white/15 bg-black/50 pl-9 pr-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:border-purple-500/60 focus:outline-none"
              />
            </div>

            <Link
              href={eventHref(selectedEvent.slug)}
              className="brutalist-btn-purple shrink-0 flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider"
            >
              <span>Event Brief</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>

        {/* Podium Highlight for Top 3 */}
        {filteredEntries.length >= 3 && !search && (
          <div className="my-8">
            <p className="text-[10px] font-extrabold uppercase tracking-[.24em] text-purple-400 text-center mb-4">
              🏆 Podium Finishers
            </p>
            <div className="grid grid-cols-3 gap-3 max-w-2xl mx-auto items-end">
              {/* 2nd Place */}
              <div className="flex flex-col items-center">
                <div className="w-full rounded-2xl border border-gray-400/30 bg-gradient-to-b from-gray-400/15 via-black/40 to-black/60 p-4 text-center">
                  <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-gray-400/20 border-2 border-gray-400/40 text-gray-300 font-black text-lg shadow-lg">
                    2
                  </div>
                  <p className="text-sm font-extrabold text-white truncate">{filteredEntries[1].teamName}</p>
                  <p className="mt-1 text-xl font-black text-gray-300">
                    {filteredEntries[1].totalScore}<span className="text-[10px] text-white/40 ml-0.5">pts</span>
                  </p>
                </div>
              </div>

              {/* 1st Place */}
              <div className="flex flex-col items-center">
                <div className="w-full rounded-2xl border-2 border-yellow-500/40 bg-gradient-to-b from-yellow-500/20 via-purple-950/30 to-black/80 p-5 text-center shadow-[0_0_40px_rgba(234,179,8,0.12)]">
                  <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-yellow-500/25 border-2 border-yellow-500/50 text-yellow-300 font-black text-2xl shadow-xl">
                    👑 1
                  </div>
                  <p className="text-base font-extrabold text-white truncate">{filteredEntries[0].teamName}</p>
                  <p className="mt-1 text-2xl font-black text-yellow-300">
                    {filteredEntries[0].totalScore}<span className="text-[10px] text-white/40 ml-0.5">pts</span>
                  </p>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="flex flex-col items-center">
                <div className="w-full rounded-2xl border border-amber-700/30 bg-gradient-to-b from-amber-700/15 via-black/40 to-black/60 p-4 text-center">
                  <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-amber-700/20 border-2 border-amber-700/40 text-amber-400 font-black text-lg shadow-lg">
                    3
                  </div>
                  <p className="text-sm font-extrabold text-white truncate">{filteredEntries[2].teamName}</p>
                  <p className="mt-1 text-xl font-black text-amber-400">
                    {filteredEntries[2].totalScore}<span className="text-[10px] text-white/40 ml-0.5">pts</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full Team Roster Table */}
        {filteredEntries.length === 0 ? (
          <div className="text-center py-12 text-white/40 text-sm">
            No teams found matching &quot;{search}&quot;.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/40 mt-6">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-white/40 uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Rank</th>
                  <th className="py-3.5 px-4">Team Name</th>
                  <th className="py-3.5 px-4">Stage Score Breakdown</th>
                  <th className="py-3.5 px-4 text-right">Total Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredEntries.map((entry, i) => (
                  <tr
                    key={entry.id || i}
                    className={`transition hover:bg-white/[.02] ${
                      i < 3 ? "bg-gradient-to-r from-purple-500/[.05] via-transparent to-transparent" : ""
                    }`}
                  >
                    <td className="py-4 px-4 font-extrabold">
                      <span
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-xl text-xs font-black ${
                          i === 0
                            ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40"
                            : i === 1
                            ? "bg-gray-400/20 text-gray-300 border border-gray-400/40"
                            : i === 2
                            ? "bg-amber-700/20 text-amber-400 border border-amber-700/40"
                            : "bg-white/5 text-white/40 border border-white/10"
                        }`}
                      >
                        {entry.rank || i + 1}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-bold text-sm text-white">{entry.teamName}</td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1.5">
                        {(entry.scores || []).map((s, si) => (
                          <span
                            key={si}
                            className="rounded-lg bg-white/5 border border-white/10 px-2.5 py-1 text-[10px] text-white/60"
                          >
                            <span className="font-semibold text-white/80">{s.category}:</span>{" "}
                            <span className="font-mono text-purple-300">
                              {(s.baseScore || 0) + (s.timeBonus || 0) - (s.hintPenalty || 0)} pts
                            </span>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="text-base font-black text-purple-300">{entry.totalScore || 0}</span>
                      <span className="text-[10px] text-white/40 ml-1">pts</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
