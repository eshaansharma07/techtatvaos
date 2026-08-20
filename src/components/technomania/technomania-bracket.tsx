"use client";

import React from "react";
import { motion } from "framer-motion";

export interface Match {
  id: string;
  nextMatchId?: string;
  player1?: string;
  player2?: string;
  score1?: number;
  score2?: number;
  winner?: string;
}

export interface Round {
  title: string;
  matches: Match[];
}

interface TechnomaniaBracketProps {
  title?: string;
  rounds: Round[];
}

export function TechnomaniaBracket({ title = "ROBOWAR 1V1 BRACKET", rounds }: TechnomaniaBracketProps) {
  return (
    <div className="tm-card p-6 md:p-8 bg-black border border-zinc-900 overflow-x-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        <h3 className="text-xl font-black text-white uppercase tracking-widest">{title}</h3>
      </div>
      
      <div className="flex gap-12 min-w-max">
        {rounds.map((round, rIdx) => (
          <div key={rIdx} className="flex flex-col gap-8 justify-around">
            <h4 className="text-xs font-mono font-bold tracking-widest text-zinc-500 uppercase text-center mb-4">
              {round.title}
            </h4>
            
            {round.matches.map((match, mIdx) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: (rIdx * 0.1) + (mIdx * 0.05) }}
                className="relative"
              >
                <div className="w-48 bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden flex flex-col shadow-lg">
                  {/* Player 1 */}
                  <div className={`p-3 border-b border-zinc-800 flex justify-between items-center ${match.winner === match.player1 ? 'bg-white/5 border-l-2 border-l-white' : ''}`}>
                    <span className={`font-mono text-xs font-bold ${match.winner === match.player1 ? 'text-white' : 'text-zinc-400'}`}>
                      {match.player1 || "TBA"}
                    </span>
                    <span className="font-mono text-xs font-bold text-zinc-500">
                      {match.score1 ?? "-"}
                    </span>
                  </div>
                  
                  {/* Player 2 */}
                  <div className={`p-3 flex justify-between items-center ${match.winner === match.player2 ? 'bg-white/5 border-l-2 border-l-white' : ''}`}>
                    <span className={`font-mono text-xs font-bold ${match.winner === match.player2 ? 'text-white' : 'text-zinc-400'}`}>
                      {match.player2 || "TBA"}
                    </span>
                    <span className="font-mono text-xs font-bold text-zinc-500">
                      {match.score2 ?? "-"}
                    </span>
                  </div>
                </div>

                {/* Connectors */}
                {rIdx < rounds.length - 1 && (
                  <>
                    <div className="absolute top-1/2 -right-6 w-6 h-px bg-zinc-800" />
                    {/* The vertical line would connect matches, simplified for dynamic flexibility */}
                  </>
                )}
                {rIdx > 0 && (
                  <div className="absolute top-1/2 -left-6 w-6 h-px bg-zinc-800" />
                )}
              </motion.div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
