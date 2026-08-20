"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Save, Trophy } from "lucide-react";

export default function AdminLeaderboardPage() {
  const [arenas, setArenas] = useState<any[]>([]);
  const [selectedArena, setSelectedArena] = useState<string>("");
  const [bracket, setBracket] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/arenas").then(res => res.json()).then(data => {
      setArenas(data.filter((a: any) => a.category !== "DeepTech & AI")); // Tournaments usually
      setLoading(false);
    });
  }, []);

  const loadBracket = (arenaId: string) => {
    setSelectedArena(arenaId);
    const arena = arenas.find(a => a._id === arenaId);
    if (arena && arena.bracketData) {
      setBracket(arena.bracketData);
    } else {
      // Default Bracket Structure for Tournaments
      setBracket([
        {
          title: "Semi Finals",
          matches: [
            { id: "s1", player1: "Team A", player2: "Team B", score1: 0, score2: 0, winner: "" },
            { id: "s2", player1: "Team C", player2: "Team D", score1: 0, score2: 0, winner: "" }
          ]
        },
        {
          title: "Grand Final",
          matches: [
            { id: "f1", player1: "", player2: "", score1: 0, score2: 0, winner: "" }
          ]
        }
      ]);
    }
  };

  const updateMatch = (roundIndex: number, matchIndex: number, field: string, value: any) => {
    const newBracket = [...bracket];
    newBracket[roundIndex].matches[matchIndex][field] = value;
    setBracket(newBracket);
  };

  const handleSave = async () => {
    if (!selectedArena) return;
    setSaving(true);
    await fetch(`/api/admin/arenas/${selectedArena}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bracketData: bracket })
    });
    setSaving(false);
    alert("Bracket broadcasted to live leaderboard!");
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-zinc-500" size={32} /></div>;

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-3xl font-black text-white uppercase tracking-tight">Leaderboard & Rounds</h2>
        <p className="text-sm text-zinc-500 font-mono tracking-widest uppercase mt-1">Tournament Bracket Control</p>
      </div>

      <div className="flex gap-4">
        {arenas.map(arena => (
          <button 
            key={arena._id}
            onClick={() => loadBracket(arena._id)}
            className={`px-4 py-3 rounded-xl border flex items-center gap-2 font-bold uppercase tracking-widest text-xs transition-colors ${
              selectedArena === arena._id ? "bg-white text-black border-white" : "bg-zinc-950 border-zinc-900 text-zinc-400 hover:text-white"
            }`}
          >
            <Trophy size={16} /> {arena.title}
          </button>
        ))}
      </div>

      {selectedArena && (
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 space-y-8">
          <div className="flex flex-col md:flex-row gap-8">
            {bracket.map((round: any, rIdx: number) => (
              <div key={rIdx} className="flex-1 space-y-4">
                <h3 className="text-center text-sm font-mono tracking-widest text-zinc-500 uppercase">{round.title}</h3>
                <div className="space-y-4 flex flex-col justify-center h-full pb-8">
                  {round.matches.map((match: any, mIdx: number) => (
                    <div key={match.id} className="bg-black border border-zinc-800 rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <input type="text" className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-white uppercase" placeholder="Player 1" value={match.player1} onChange={(e) => updateMatch(rIdx, mIdx, "player1", e.target.value)} />
                        <input type="number" className="w-12 bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-white text-center font-black" value={match.score1} onChange={(e) => updateMatch(rIdx, mIdx, "score1", Number(e.target.value))} />
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="text" className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-white uppercase" placeholder="Player 2" value={match.player2} onChange={(e) => updateMatch(rIdx, mIdx, "player2", e.target.value)} />
                        <input type="number" className="w-12 bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-white text-center font-black" value={match.score2} onChange={(e) => updateMatch(rIdx, mIdx, "score2", Number(e.target.value))} />
                      </div>
                      <div>
                        <select className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-400 uppercase" value={match.winner} onChange={(e) => updateMatch(rIdx, mIdx, "winner", e.target.value)}>
                          <option value="">Select Winner</option>
                          <option value={match.player1}>{match.player1 || "Player 1"}</option>
                          <option value={match.player2}>{match.player2 || "Player 2"}</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-zinc-900">
            <button 
              onClick={handleSave} 
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-white text-black font-bold tracking-widest py-4 uppercase rounded hover:bg-zinc-200 transition-colors"
            >
              {saving ? <Loader2 size={20} className="animate-spin" /> : <><Save size={20} /> Broadcast Live</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
