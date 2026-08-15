import React from "react";

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
  // Group events by day
  const groupedEvents = (events || []).reduce((acc, event) => {
    const startDate = event.startAt ? new Date(event.startAt) : null;
    const date = startDate && !isNaN(startDate.getTime())
      ? startDate.toLocaleDateString("en-US", {
          weekday: "long",
          month: "short",
          day: "numeric",
        })
      : "Upcoming";
    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {} as Record<string, ScheduleEvent[]>);

  // Sort events within each day
  Object.keys(groupedEvents).forEach(date => {
    groupedEvents[date].sort((a, b) => {
      const aTime = a.startAt ? new Date(a.startAt).getTime() : 0;
      const bTime = b.startAt ? new Date(b.startAt).getTime() : 0;
      return aTime - bTime;
    });
  });

  const now = new Date();

  return (
    <div className="space-y-12">
      {Object.entries(groupedEvents).map(([date, dayEvents]) => (
        <div key={date} className="relative">
          {/* Date Header */}
          <div className="sticky top-16 z-20 bg-tm-bg/90 backdrop-blur py-4 mb-6 border-b border-tm-border flex items-center gap-4">
            <h3 className="font-tm-heading text-xl font-bold text-tm-text uppercase tracking-widest">{date}</h3>
            <div className="h-px flex-grow bg-gradient-to-r from-tm-border to-transparent" />
          </div>

          {/* Timeline Wrapper */}
          <div className="relative pl-4 md:pl-8 space-y-8 border-l border-tm-border border-dashed ml-2 md:ml-4">
            {dayEvents.map((event, idx) => {
              const start = event.startAt ? new Date(event.startAt) : null;
              const end = event.endAt ? new Date(event.endAt) : null;
              const hasValidStart = start && !isNaN(start.getTime());
              const hasValidEnd = end && !isNaN(end.getTime());
              const isHappeningNow = hasValidStart && hasValidEnd ? (now >= start && now <= end) : false;
              
              const formatTime = (d: Date | null) => d && !isNaN(d.getTime()) ? d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }) : "TBA";

              return (
                <div key={idx} className="relative group">
                  {/* Timeline Dot */}
                  <div className={`absolute -left-[21px] md:-left-[37px] top-1.5 w-3 h-3 rounded-full border-2 border-tm-bg ${isHappeningNow ? "bg-tm-accent animate-pulse" : "bg-tm-dim"}`} />
                  
                  {/* Construction Line Connector */}
                  <div className="absolute top-3 -left-4 md:-left-8 w-4 md:w-8 h-px bg-tm-border group-hover:bg-tm-dim transition-colors" />

                  <div className={`tm-card p-4 md:p-6 transition-all duration-300 ${isHappeningNow ? "border-tm-accent bg-tm-accent/5 tm-glow" : "hover:border-tm-dim bg-tm-surface/50"}`}>
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      
                      <div className="space-y-2">
                        {isHappeningNow && (
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-tm-accent/20 border border-tm-accent/50 text-tm-accent text-[9px] font-tm-mono uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 rounded-full bg-tm-accent animate-ping" />
                            NOW LIVE
                          </div>
                        )}
                        
                        <h4 className="font-tm-heading text-lg font-bold text-tm-text">{event.title}</h4>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-tm-mono text-tm-accent uppercase border border-tm-accent/30 px-1.5 py-0.5">
                            {event.category}
                          </span>
                          <span className="text-[10px] font-tm-mono text-tm-muted uppercase">
                            LOC: {event.venue}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center md:items-end flex-col">
                        <div className="font-tm-mono text-tm-text font-bold tracking-widest">
                          {formatTime(start)}
                        </div>
                        <div className="font-tm-mono text-tm-dim text-xs tracking-widest">
                          UNTIL {formatTime(end)}
                        </div>
                      </div>
                      
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      
      {Object.keys(groupedEvents).length === 0 && (
        <div className="tm-card p-12 text-center text-tm-muted font-tm-mono text-sm tracking-widest uppercase border-dashed">
          NO EVENTS SCHEDULED
        </div>
      )}
    </div>
  );
}

export const TechnomaniaScheduleView = TechnomaniaSchedule;
export default TechnomaniaSchedule;
