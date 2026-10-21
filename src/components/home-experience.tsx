"use client";

import { useState } from "react";
import { HeroPavilion } from "@/components/scene-3d/hero-pavilion";
import { HeroOverlay } from "@/components/hero/hero-overlay";
import { PillarsSection } from "@/components/pillars/pillars-section";
import { PromptWarMonolith } from "@/components/featured-event/prompt-war-monolith";
import { EditorialDock } from "@/components/navigation/editorial-dock";
import { CommunityShowcase } from "@/components/community-showcase";
import { InstagramFeed } from "@/components/instagram-feed";
import { EventCard } from "@/components/event-card";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Orbit, Sparkles, Trophy, Users } from "lucide-react";
import type { PublicEvent, PublicTeam } from "@/lib/public-data";

interface HomeExperienceProps {
  stats: {
    members: number;
    events: number;
    teams: number;
    community?: number;
  };
  promptWarEvent?: any;
  achievements?: any[];
  driveStatus?: any;
  events?: PublicEvent[];
  teams?: PublicTeam[];
  gallery?: any[];
  clubInfo?: any;
}

export function HomeExperience({
  stats,
  promptWarEvent,
  achievements = [],
  driveStatus,
  events = [],
  teams = [],
  gallery = [],
  clubInfo
}: HomeExperienceProps) {
  const [scrollProgress, setScrollProgress] = useState(0);

  return (
    <div className="relative w-full overflow-hidden bg-[#060709] text-white">
      
      {/* ═══════════════════════════════════════════════════════════════════
          SCENE 01: THE 3D ARCHITECTURAL HERO PAVILION
          Real Three.js WebGL Canvas with suspended TechTatva Sculpture
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
        {/* Real Three.js 3D WebGL Canvas */}
        <HeroPavilion scrollProgress={scrollProgress} />

        {/* Overlay Typography, Editorial Copy & Narrative */}
        <HeroOverlay stats={stats} />
      </section>

      {/* Floating Bottom Dock (Members, Scroll Cue, Quote) */}
      <EditorialDock />

      {/* ═══════════════════════════════════════════════════════════════════
          SCENE 02: THE PHILOSOPHY — "OUR PILLARS / More than a club."
          4 Horizontal Glass Capsule Cards (Learn, Build, Connect, Impact)
      ═══════════════════════════════════════════════════════════════════ */}
      <PillarsSection />

      {/* ═══════════════════════════════════════════════════════════════════
          SCENE 03: THE CHALLENGE — FEATURED EVENT "PROMPT WAR"
          Brutalist Carved Stone Monoliths & Radiant Golden Portal
      ═══════════════════════════════════════════════════════════════════ */}
      <PromptWarMonolith eventData={promptWarEvent} />

      {/* ═══════════════════════════════════════════════════════════════════
          LIVE EVENTS CALENDAR
          Obsidian glass cards displaying upcoming and published events
      ═══════════════════════════════════════════════════════════════════ */}
      {events.length > 0 && (
        <section className="relative z-20 py-24 px-6 sm:px-10 md:px-16 lg:px-20 max-w-[1720px] mx-auto border-t border-white/[0.06]">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
            <div>
              <p className="text-[10px] font-mono tracking-[0.28em] text-cyan-400 uppercase font-semibold mb-2">
                LIVE DISPATCHES // 01
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
                Upcoming & Active Events
              </h2>
              <p className="mt-3 text-sm text-white/50 max-w-xl">
                Sessions, bootcamps, and hackathons designed to challenge conventions and sharpen technical execution.
              </p>
            </div>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 text-xs font-mono tracking-wider text-white/60 hover:text-white transition group py-2"
            >
              <span>VIEW FULL CALENDAR</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {events.slice(0, 4).map((e, i) => (
              <EventCard key={e.slug || i} event={e} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          DISCIPLINES & TEAMS NETWORK
          Architectural grid of club divisions
      ═══════════════════════════════════════════════════════════════════ */}
      {teams.length > 0 && (
        <section className="relative z-20 py-24 px-6 sm:px-10 md:px-16 lg:px-20 max-w-[1720px] mx-auto border-t border-white/[0.06]">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
            <div>
              <p className="text-[10px] font-mono tracking-[0.28em] text-blue-400 uppercase font-semibold mb-2">
                ONE SYSTEM // MULTIPLE DISCIPLINES
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
                Specialized Teams
              </h2>
              <p className="mt-3 text-sm text-white/50 max-w-xl">
                Specialized engineering squads collaborating to deliver products, host experiences, and run operations.
              </p>
            </div>
            <Link
              href="/teams"
              className="inline-flex items-center gap-2 text-xs font-mono tracking-wider text-white/60 hover:text-white transition group py-2"
            >
              <span>EXPLORE ALL TEAMS</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {teams.slice(0, 6).map((team) => (
              <div
                key={team.id}
                className="group relative rounded-3xl border border-white/10 bg-[#0A0D14]/70 backdrop-blur-xl p-8 hover:border-blue-500/40 transition-all duration-300 flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-10 h-10 rounded-2xl border border-blue-500/20 bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                      <Orbit size={18} />
                    </div>
                    <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase font-bold border border-white/10 bg-white/[0.03] px-3 py-1 rounded-full">
                      {team.members} {team.members === 1 ? "MEMBER" : "MEMBERS"}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
                    {team.name}
                  </h3>
                  <p className="mt-3 text-xs sm:text-sm text-white/55 leading-relaxed line-clamp-3">
                    {team.description || "Active engineering and creative team inside the Tech Tatva ecosystem."}
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-white/40">
                  <span>DISCIPLINE</span>
                  <Link href={`/teams`} className="text-blue-400 hover:text-blue-300 flex items-center gap-1 group/btn">
                    <span>View Structure</span>
                    <ArrowUpRight size={12} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          FEATURED ACHIEVEMENTS & COMMUNITY IMPACT
          Sleek Architectural Cards
      ═══════════════════════════════════════════════════════════════════ */}
      {achievements.length > 0 && (
        <section className="relative z-20 py-24 px-6 sm:px-10 md:px-16 lg:px-20 max-w-[1720px] mx-auto border-t border-white/[0.06]">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
            <div>
              <p className="text-[10px] font-mono tracking-[0.28em] text-amber-400 uppercase font-semibold mb-2">
                HALL OF DISTINCTION // LEGACY
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
                Featured Milestones
              </h2>
              <p className="mt-3 text-sm text-white/50 max-w-xl">
                National hackathon victories, research publications, and standout honors earned by our members.
              </p>
            </div>
            <Link
              href="/hall-of-fame"
              className="inline-flex items-center gap-2 text-xs font-mono tracking-wider text-white/60 hover:text-white transition group py-2"
            >
              <span>EXPLORE ALL LEGACY</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {achievements.slice(0, 3).map((item, idx) => (
              <div
                key={item._id || idx}
                className="group relative rounded-3xl border border-white/10 bg-[#0C0F17]/60 backdrop-blur-xl p-8 hover:border-amber-500/30 transition-all duration-300 flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase font-bold">
                      {item.year || "MILESTONE"}
                    </span>
                    <Trophy size={16} className="text-amber-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-xs sm:text-sm text-white/60 leading-relaxed">
                    {item.description || item.subtitle || "Recognized achievement by Tech Tatva community members."}
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-white/40">
                  <span>{item.recipientName || "Tech Tatva Squad"}</span>
                  <span className="text-white/60">CHANDIGARH UNIVERSITY</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          MEMBERSHIP DRIVE INVITATION (IF ACTIVE)
      ═══════════════════════════════════════════════════════════════════ */}
      {driveStatus?.registrationEnabled && (
        <section className="relative z-20 py-16 px-6 sm:px-10 md:px-16 lg:px-20 max-w-[1720px] mx-auto">
          <div className="relative rounded-[2.5rem] border border-blue-500/30 bg-gradient-to-r from-blue-950/40 via-purple-950/30 to-black/60 backdrop-blur-2xl p-8 sm:p-12 md:p-16 overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-8 shadow-[0_20px_50px_rgba(59,130,246,0.15)]">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-400/30 bg-blue-500/10 text-[10px] font-mono tracking-wider text-blue-300 font-bold uppercase mb-4">
                <Sparkles size={11} /> MEMBERSHIP DRIVE OPEN
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
                Become a Tech Tatva Member
              </h2>
              <p className="mt-4 text-sm sm:text-base text-white/70 leading-relaxed">
                Join hundreds of engineers, designers, developers, and innovators building real impact at Chandigarh University.
              </p>
            </div>
            <Link
              href="/join"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-white text-black font-bold text-sm tracking-wide transition-transform hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.3)] shrink-0"
            >
              <span>Join Tech Tatva</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      )}

      {/* Community in Action Showcase */}
      <CommunityShowcase galleryData={gallery} />

      {/* Community Instagram & Social Grid */}
      <section className="relative z-20 py-20 px-6 sm:px-10 md:px-16 lg:px-20 max-w-[1720px] mx-auto">
        <div className="mb-10 text-center">
          <p className="text-[10px] font-mono tracking-[0.28em] text-white/40 uppercase font-semibold">
            LIVE DISPATCHES
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mt-1">
            Community in Motion
          </h2>
        </div>
        <InstagramFeed
          handle={clubInfo?.instagramHandle}
          profileUrl={clubInfo?.instagramUrl}
          post1_image={clubInfo?.instagramPost1_image}
          post1_url={clubInfo?.instagramPost1_url}
          post2_image={clubInfo?.instagramPost2_image}
          post2_url={clubInfo?.instagramPost2_url}
          post3_image={clubInfo?.instagramPost3_image}
          post3_url={clubInfo?.instagramPost3_url}
        />
      </section>

    </div>
  );
}
