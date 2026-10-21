"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, MapPin, Users, Sparkles, AlertCircle } from "lucide-react";

interface PromptWarEventProps {
  eventData?: {
    title?: string;
    description?: string;
    venue?: string;
    startAt?: string | Date;
    capacity?: number;
    registrationOpen?: boolean;
    postponed?: boolean;
    postponementNotice?: string;
    rescheduledDate?: string;
  };
}

export function PromptWarMonolith({ eventData }: PromptWarEventProps) {
  const isPostponed = eventData?.postponed ?? false;
  const venue = eventData?.venue || "D3 Open Area";
  const dateStr = eventData?.rescheduledDate || "23 SEP 2025";
  const registrationOpen = eventData?.registrationOpen ?? false;

  return (
    <section className="relative z-20 py-24 px-6 sm:px-10 md:px-16 lg:px-20 max-w-[1720px] mx-auto">
      
      {/* Outer Monolith Frame */}
      <div className="relative rounded-[3rem] border border-white/10 bg-[#090B10] shadow-[0_30px_90px_rgba(0,0,0,0.8)] overflow-hidden">
        
        {/* Background Portal Artwork (The Monumental Carved Stone & Radiant Gateway) */}
        <div className="relative aspect-[16/9] min-h-[580px] sm:min-h-[640px] md:min-h-[720px] w-full">
          <Image
            src="/cinematic/prompt-war-portal.jpg"
            alt="Prompt War Architectural Monolith"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center scale-105"
          />

          {/* Cinematic Vignette & Atmospheric Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#06080C] via-transparent to-[#06080C]/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#06080C]/90 via-[#06080C]/30 to-[#06080C]/85" />
          
          {/* Subtle Ambient Golden Bloom around portal */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 blur-[100px] pointer-events-none" />

          {/* Content Composition Overlaid */}
          <div className="absolute inset-0 p-8 sm:p-12 md:p-16 lg:p-20 flex flex-col justify-between">
            
            {/* Top Bar inside Event Environment */}
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 backdrop-blur-md">
                <Sparkles size={12} className="text-amber-400" />
                <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-amber-300 font-bold">
                  FLAGSHIP CHALLENGE // 02
                </span>
              </div>

              {isPostponed && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/40 bg-amber-500/20 text-amber-200 text-xs font-mono font-semibold">
                  <AlertCircle size={13} />
                  <span>RESCHEDULED // AVAILABILITY ACTIVE</span>
                </div>
              )}
            </div>

            {/* Bottom Row: Left Editorial Info & Right Metadata Glass Card */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mt-auto">
              
              {/* Left Info */}
              <div className="max-w-xl">
                <p className="text-[10px] font-mono tracking-[0.28em] text-amber-400/90 uppercase font-semibold mb-2">
                  FEATURED EVENT
                </p>
                <div className="flex items-baseline gap-4">
                  <h3 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-[-0.03em] text-white">
                    PROMPT WAR
                  </h3>
                  <span className="text-sm font-mono text-white/40 tracking-wider">02</span>
                </div>
                
                <p className="mt-4 text-sm sm:text-base text-white/75 leading-relaxed font-normal">
                  An AI Prompting Competition presented by Tech Tatva Club, Chandigarh University. Battle ideas, spark creativity, and showcase your prompt engineering skills.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link
                    href="/events/prompt-war"
                    className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-white text-black font-semibold text-xs sm:text-sm tracking-wide transition-all duration-300 hover:bg-neutral-200 active:scale-95 shadow-[0_0_25px_rgba(255,255,255,0.2)]"
                  >
                    <span>Explore Event</span>
                    <ArrowRight size={14} />
                  </Link>

                  <Link
                    href="/events"
                    className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full border border-white/15 bg-black/40 backdrop-blur-md text-white/80 hover:text-white hover:border-white/30 text-xs font-mono tracking-wider transition"
                  >
                    <span>ALL EVENTS</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>

              {/* Right Translucent Metadata Glass Card (as in Reference Screenshot) */}
              <div className="w-full sm:w-auto min-w-[280px] md:min-w-[320px] rounded-3xl border border-white/15 bg-black/55 backdrop-blur-2xl p-6 shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
                <div className="space-y-4 text-xs font-mono">
                  <div className="flex items-center gap-3 text-white/90 pb-3 border-b border-white/10">
                    <Calendar size={15} className="text-amber-400" />
                    <div>
                      <p className="text-[10px] text-white/40 uppercase tracking-wider">Scheduled Date</p>
                      <p className="text-sm font-bold text-white">{dateStr}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-white/90 pb-3 border-b border-white/10">
                    <MapPin size={15} className="text-blue-400" />
                    <div>
                      <p className="text-[10px] text-white/40 uppercase tracking-wider">Venue Location</p>
                      <p className="text-sm font-bold text-white">{venue}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-white/90 pb-3 border-b border-white/10">
                    <Users size={15} className="text-purple-400" />
                    <div>
                      <p className="text-[10px] text-white/40 uppercase tracking-wider">Format</p>
                      <p className="text-sm font-bold text-white">Team (2–4 Members)</p>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-[11px] text-white/50">Status:</span>
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${
                      registrationOpen ? "text-emerald-400" : "text-amber-400"
                    }`}>
                      {registrationOpen ? "Registration Open" : "Registration Closed"}
                    </span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}
