"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TechnomaniaEventCard } from "./technomania-event-card";
import { X } from "lucide-react";

export function TechnomaniaEventsClient({ events }: { events: any[] }) {
  const [activeTab, setActiveTab] = useState("ALL");
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

  const tabs = ["ALL", "DeepTech & AI", "Hardware & Speed", "Gaming & Community"];
  const filteredEvents = activeTab === "ALL" 
    ? events 
    : events.filter(e => e.category === activeTab);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 mb-10">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all ${
              activeTab === tab
                ? "bg-white text-black"
                : "bg-zinc-950 border border-zinc-900 text-zinc-400 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {filteredEvents.length > 0 ? (
        <motion.div layout className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filteredEvents.map((event) => (
              <motion.div
                key={event.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSelectedEvent(event)}
                className="cursor-pointer"
              >
                <TechnomaniaEventCard event={event} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="tm-card p-10 md:p-16 text-center">
          <p className="font-tm-heading text-xl font-bold">NO EVENTS YET</p>
          <div className="tm-hazard-stripe w-16 mx-auto mt-6" />
        </div>
      )}

      {/* Slide-Out Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEvent(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-zinc-950 border-l border-zinc-900 z-[101] shadow-2xl p-6 md:p-8 overflow-y-auto"
            >
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-6 right-6 p-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white transition-colors"
              >
                <X size={20} />
              </button>

              <div className="mt-8 space-y-6">
                <div>
                  <span className="text-xs font-mono font-bold tracking-widest text-zinc-500 uppercase">{selectedEvent.category}</span>
                  <h2 className="text-3xl font-black text-white uppercase mt-1">{selectedEvent.title}</h2>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                  <p className="text-sm font-mono text-zinc-400 mb-1 uppercase">PRIZE POOL</p>
                  <p className="text-xl font-bold text-white">{selectedEvent.prizePool || "TBA"}</p>
                </div>

                <div>
                  <h3 className="text-sm font-mono font-bold tracking-widest text-white uppercase mb-3 border-b border-zinc-900 pb-2">Description</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {selectedEvent.description}
                  </p>
                </div>

                {selectedEvent.rounds && selectedEvent.rounds.length > 0 && (
                  <div>
                    <h3 className="text-sm font-mono font-bold tracking-widest text-white uppercase mb-3 border-b border-zinc-900 pb-2">Rounds & Schedule</h3>
                    <ul className="space-y-3">
                      {selectedEvent.rounds.map((round: string, i: number) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                          <span className="w-5 h-5 rounded flex items-center justify-center bg-white text-black font-mono text-[10px] shrink-0 mt-0.5 font-bold">
                            {i + 1}
                          </span>
                          <span>{round}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="pt-4 border-t border-zinc-900">
                  {selectedEvent.unstopLink ? (
                    <a
                      href={selectedEvent.unstopLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-4 rounded-xl text-center font-tm-mono font-bold text-sm tracking-widest uppercase transition-all bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                    >
                      REGISTER ON UNSTOP
                    </a>
                  ) : (
                    <a
                      href={`/technomania/register?event=${selectedEvent.slug || selectedEvent.id}`}
                      className="block w-full py-4 rounded-xl text-center font-tm-mono font-bold text-sm tracking-widest uppercase transition-all bg-white hover:bg-zinc-200 text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                    >
                      REGISTER NOW
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
