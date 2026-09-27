"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Calendar, ChevronLeft, ChevronRight, MapPin, Sparkles, Ticket, Users } from "lucide-react";
import type { PublicEvent } from "@/lib/public-data";
import { eventHref } from "@/lib/event-links";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary-client";

const formatDate = (value?: string) =>
  value
    ? new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short" }).format(new Date(value)).toUpperCase()
    : "DATE TBA";

export function HomeEventCarousel({ events }: { events: PublicEvent[] }) {
  // Prioritize events with registration open; fallback to all active events
  const displayEvents = events.filter((e) => e.registrationOpen).length > 0
    ? events.filter((e) => e.registrationOpen)
    : events.slice(0, 3);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const total = displayEvents.length;
  const current = displayEvents[currentIndex] || events[0];

  const nextSlide = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Auto rotate every 5.5 seconds if not hovered and multiple events
  useEffect(() => {
    if (total <= 1 || isPaused) return;
    const interval = setInterval(nextSlide, 5500);
    return () => clearInterval(interval);
  }, [total, isPaused, nextSlide]);

  if (!current) {
    return (
      <div className="col-span-2 glass-brutalist rounded-[2rem] p-6 flex flex-col justify-between relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/[0.04] border border-white/10 text-white">
            <Ticket size={16} />
          </span>
          <span className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-1 text-[9px] font-bold tracking-[.18em] text-white/45 uppercase">
            NO ACTIVE EVENT
          </span>
        </div>
        <p className="mt-8 text-[9px] font-bold tracking-[.3em] text-white/35">NEXT EVENT SIGNAL</p>
        <h3 className="mt-2 text-2xl font-bold tracking-tight text-white">Events will appear here</h3>
        <p className="mt-3 text-xs leading-6 text-white/40">
          When the admin publishes an event, candidates will see it here and can register from the event page.
        </p>
        <div className="mt-6 border-t border-white/[0.05] pt-5">
          <Link href="/events" className="brutalist-btn flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold text-black border-2 border-black w-full">
            View events <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  const modeLabel =
    current.participationMode === "both"
      ? "Individual / Team"
      : current.participationMode === "team"
      ? current.minParticipants && current.maxParticipants && current.minParticipants !== current.maxParticipants
        ? `Team (${current.minParticipants}–${current.maxParticipants})`
        : "Team based"
      : "Individual";

  const bannerSrc = current.banner || current.certEventLogo;

  return (
    <div
      className="col-span-2 glass-brutalist rounded-[2rem] p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden group/card transition-all duration-300"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background radial atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_20%,rgba(168,85,247,0.06),transparent_50%)] pointer-events-none" />

      {/* Header Bar */}
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/[0.06] border border-white/10 text-white">
              <Ticket size={15} />
            </span>
            <span className="text-[10px] font-bold tracking-[.25em] text-white/40 uppercase">
              {current.registrationOpen ? "LIVE REGISTRATION OPEN" : "NEXT EVENT SIGNAL"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {current.registrationOpen ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-extrabold tracking-wider text-emerald-400 uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                OPEN
              </span>
            ) : (
              <span className="rounded-xl border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[9px] font-bold tracking-[.18em] text-white/45 uppercase">
                UPCOMING
              </span>
            )}

            {/* Navigation controls if multiple events */}
            {total > 1 ? (
              <div className="flex items-center gap-1 ml-1">
                <button
                  type="button"
                  onClick={prevSlide}
                  aria-label="Previous event"
                  className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 bg-black/40 text-white/60 hover:text-white hover:border-white/30 transition active:scale-95"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="text-[10px] font-mono text-white/40 px-1">
                  {currentIndex + 1}/{total}
                </span>
                <button
                  type="button"
                  onClick={nextSlide}
                  aria-label="Next event"
                  className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 bg-black/40 text-white/60 hover:text-white hover:border-white/30 transition active:scale-95"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {/* Banner Visual Spotlight */}
        {bannerSrc ? (
          <Link
            href={eventHref(current.slug)}
            className="group/visual relative mt-4 block overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-2xl transition duration-500 hover:border-purple-500/40"
          >
            <div className="relative h-44 sm:h-52 w-full overflow-hidden">
              <Image
                width={1200}
                height={600}
                src={optimizeCloudinaryUrl(bannerSrc, 900)}
                alt={current.title}
                className="h-full w-full object-cover transition duration-700 group-hover/visual:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

              {/* Overlaid Badges */}
              <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                <span className="rounded-lg border border-white/20 bg-black/70 px-2.5 py-1 text-[9px] font-bold tracking-wider text-purple-300 backdrop-blur-md">
                  <Sparkles size={11} className="inline mr-1 text-purple-400" />
                  {(current.category || "EVENT").toUpperCase()}
                </span>
              </div>

              {/* Overlaid Logo Emblem if present and different from banner */}
              {current.certEventLogo && current.certEventLogo !== current.banner ? (
                <div className="absolute bottom-3 left-3 z-10 flex items-center justify-center rounded-xl border border-white/20 bg-black/80 px-3 py-1 backdrop-blur-md shadow-2xl h-8 max-w-[130px]">
                  <Image
                    width={300}
                    height={150}
                    src={optimizeCloudinaryUrl(current.certEventLogo, 300)}
                    alt=""
                    className="h-full w-auto max-h-5 object-contain"
                  />
                </div>
              ) : null}

              <span className="absolute right-3 bottom-3 z-10 grid h-8 w-8 place-items-center rounded-xl border border-white/30 bg-black/70 text-white backdrop-blur-md transition group-hover/visual:scale-110 group-hover/visual:bg-purple-600">
                <ArrowUpRight size={14} />
              </span>
            </div>
          </Link>
        ) : null}

        {/* Title and Summary */}
        <div className="mt-4">
          <Link href={eventHref(current.slug)} className="group/title block">
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white transition-colors group-hover/title:text-purple-400">
              {current.title}
            </h3>
          </Link>
          <p className="mt-2 text-xs leading-5 text-white/50 line-clamp-2">
            {current.description || "Click to view event schedule, rules, and candidate registration."}
          </p>
        </div>
      </div>

      {/* Footer Info & CTA */}
      <div className="mt-5 border-t border-white/[0.07] pt-4">
        <div className="grid grid-cols-3 gap-2 text-xs font-mono mb-4">
          <div className="glass-brutalist rounded-xl p-2.5">
            <span className="text-[9px] text-white/35 uppercase tracking-wider flex items-center gap-1">
              <Calendar size={11} className="text-purple-400" /> Date
            </span>
            <span className="text-white/85 block mt-1 font-semibold truncate text-[11px]">
              {formatDate(current.startAt)}
            </span>
          </div>

          <div className="glass-brutalist rounded-xl p-2.5">
            <span className="text-[9px] text-white/35 uppercase tracking-wider flex items-center gap-1">
              <MapPin size={11} className="text-purple-400" /> Venue
            </span>
            <span className="text-white/85 block mt-1 font-semibold truncate text-[11px]">
              {current.venue || "TBA"}
            </span>
          </div>

          <div className="glass-brutalist rounded-xl p-2.5">
            <span className="text-[9px] text-white/35 uppercase tracking-wider flex items-center gap-1">
              <Users size={11} className="text-purple-400" /> Mode
            </span>
            <span className="text-white/85 block mt-1 font-semibold truncate text-[11px]">
              {modeLabel}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={eventHref(current.slug)}
            className="brutalist-btn flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold text-black border-2 border-black transition hover:bg-purple-400 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.8)]"
          >
            {current.registrationOpen ? "Register for this event" : "Open event page"} <ArrowUpRight size={14} />
          </Link>

          {/* Quick dots navigation if multiple */}
          {total > 1 ? (
            <div className="flex items-center gap-1 px-2">
              {displayEvents.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentIndex
                      ? "w-5 bg-purple-400"
                      : "w-2 bg-white/20 hover:bg-white/40"
                  }`}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
