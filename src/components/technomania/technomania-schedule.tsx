"use client";

import React from "react";
import { motion } from "framer-motion";

interface ScheduleEvent {
  title: string;
  category: string;
  startAt: string;
  endAt: string;
  venue: string;
  slug: string;
}

interface TechnomaniaScheduleProps {
  events: ScheduleEvent[];
}

export function TechnomaniaSchedule({ events }: TechnomaniaScheduleProps) {
  // Sort events globally first
  const sortedEvents = [...(events || [])].sort((a, b) => {
    const aTime = a.startAt ? new Date(a.startAt).getTime() : 0;
    const bTime = b.startAt ? new Date(b.startAt).getTime() : 0;
    return aTime - bTime;
  });

  // Identify unique days
  const uniqueDates = Array.from(new Set(sortedEvents.map(e => {
    const d = e.startAt ? new Date(e.startAt) : null;
    return d && !isNaN(d.getTime()) ? d.toDateString() : "Upcoming";
  })));

  // Map each event to a "DAY N"
  const groupedEvents = sortedEvents.reduce((acc, event) => {
    const d = event.startAt ? new Date(event.startAt) : null;
    const dateStr = d && !isNaN(d.getTime()) ? d.toDateString() : "Upcoming";
    
    let dayLabel = "Upcoming";
    if (dateStr !== "Upcoming") {
      const dayIndex = uniqueDates.indexOf(dateStr) + 1;
      dayLabel = `DAY ${dayIndex}`;
    }

    if (!acc[dayLabel]) acc[dayLabel] = [];
    acc[dayLabel].push(event);
    return acc;
  }, {} as Record<string, ScheduleEvent[]>);

  const now = new Date();

  return (
    <div className="space-y-16">
      {Object.entries(groupedEvents).map(([date, dayEvents], index) => (
        <motion.div 
          key={date} 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
          className="relative"
        >
          {/* Date Header */}
          <div className="sticky top-16 z-20 bg-black/90 backdrop-blur py-6 mb-8 border-b border-zinc-900 flex items-center gap-4">
            <h3 className="text-3xl font-black text-white uppercase tracking-tight">{date}</h3>
            <div className="h-px flex-grow bg-gradient-to-r from-zinc-800 to-transparent" />
          </div>

          {/* Timeline Wrapper */}
          <div className="relative pl-4 md:pl-10 space-y-8 border-l border-zinc-800 border-dashed ml-2 md:ml-4">
            {dayEvents.map((event, idx) => {
              const start = event.startAt ? new Date(event.startAt) : null;
              const end = event.endAt ? new Date(event.endAt) : null;
              const hasValidStart = start && !isNaN(start.getTime());
              const hasValidEnd = end && !isNaN(end.getTime());
              const isHappeningNow = hasValidStart && hasValidEnd ? (now >= start && now <= end) : false;
              
              const formatTime = (d: Date | null) => d && !isNaN(d.getTime()) ? d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }) : "TBA";

              return (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="relative group"
                >
                  {/* Timeline Dot */}
                  <div className={`absolute -left-[21px] md:-left-[45px] top-1.5 w-3 h-3 rounded-full border-2 border-black ${isHappeningNow ? "bg-white animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.8)]" : "bg-zinc-600"}`} />
                  
                  {/* Construction Line Connector */}
                  <div className="absolute top-3 -left-4 md:-left-10 w-4 md:w-10 h-px bg-zinc-800 group-hover:bg-zinc-600 transition-colors" />

                  <div className={`tm-card p-6 md:p-8 transition-all duration-300 ${isHappeningNow ? "border-white bg-white/5 shadow-[0_0_20px_rgba(255,255,255,0.1)]" : "hover:border-zinc-600 bg-zinc-950"}`}>
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      
                      <div className="space-y-3">
                        {isHappeningNow && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 border border-white text-white text-[10px] font-mono uppercase tracking-widest rounded">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                            NOW LIVE
                          </div>
                        )}
                        
                        <h4 className="text-2xl font-black text-white uppercase">{event.title}</h4>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-mono font-bold text-black bg-white px-2 py-1 uppercase rounded-sm">
                            {event.category}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest border border-zinc-800 px-2 py-1 rounded-sm">
                            LOC: {event.venue || "TBA"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center md:items-end flex-col bg-black border border-zinc-900 p-3 rounded-xl min-w-[120px]">
                        <div className="font-mono text-white font-bold tracking-widest text-lg">
                          {formatTime(start)}
                        </div>
                        <div className="font-mono text-zinc-500 text-xs tracking-widest uppercase">
                          UNTIL {formatTime(end)}
                        </div>
                      </div>
                      
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      ))}
      
      {Object.keys(groupedEvents).length === 0 && (
        <div className="tm-card p-12 text-center text-zinc-500 font-mono text-sm tracking-widest uppercase border-dashed">
          NO EVENTS SCHEDULED
        </div>
      )}
    </div>
  );
}

export const TechnomaniaScheduleView = TechnomaniaSchedule;
export default TechnomaniaSchedule;
