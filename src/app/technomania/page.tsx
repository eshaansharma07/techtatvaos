"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useTechnomaniaHref } from "@/lib/technomania-links";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Code,
  Gamepad2,
  Music,
  Zap,
  Sparkles,
  ChevronDown,
  Trophy,
  Users,
  Calendar,
  ExternalLink,
  Flame,
  Award,
  ShieldCheck,
  Cpu,
} from "lucide-react";
import { TechnomaniaCountdown } from "@/components/technomania/technomania-countdown";

/* ── Flagship Events ── */
const flagshipEvents = [
  {
    id: "hackathon",
    icon: <Code size={36} className="text-blue-400" />,
    category: "HACKATHON",
    tag: "24 HOURS NON-STOP",
    title: "CODE STORM 24H",
    subtitle: "Flagship 24-Hour Hackathon",
    description:
      "24 hours of non-stop building, mentoring, and shipping solutions. Form squads of up to 4 builders, solve real-world industry problem statements, and pitch live to tech founders.",
    prizes: "₹XX,XXX PRIZES & INTERNSHIPS",
    slug: "hackathon",
    teamSize: "1-4 Members",
    accentColor: "border-blue-500/40 shadow-blue-500/20",
    gradient: "from-blue-600/15 via-cyan-500/10 to-transparent",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  },
  {
    id: "esports",
    icon: <Gamepad2 size={36} className="text-purple-400" />,
    category: "ESPORTS",
    tag: "COMPETITIVE ARENA",
    title: "CYBER CLASH",
    subtitle: "Multi-Title Gaming Championship",
    description:
      "High-stakes esports showdown across BGMI, Valorant, and EA FC. Experience live casting on stage, tournament-grade setups, and intense bracket battles for ultimate university supremacy.",
    prizes: "TROPHIES & CASH REWARDS",
    slug: "esports",
    teamSize: "Squad & Solo",
    accentColor: "border-purple-500/40 shadow-purple-500/20",
    gradient: "from-purple-600/15 via-pink-500/10 to-transparent",
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  },
  {
    id: "cultural",
    icon: <Music size={36} className="text-rose-400" />,
    category: "CULTURAL",
    tag: "LIVE PERFORMANCES",
    title: "FESTIVAL NOCTURNE",
    subtitle: "Music, Dance & Celebrity DJ Night",
    description:
      "The pulse of Chandigarh University's artistic spirit. Battle of the bands, western & classical dance showdowns, fashion choreography, and an electrifying celebrity DJ night.",
    prizes: "MEMENTOS & CASH PRIZES",
    slug: "cultural",
    teamSize: "Solo & Crews",
    accentColor: "border-rose-500/40 shadow-rose-500/20",
    gradient: "from-rose-600/15 via-amber-500/10 to-transparent",
    badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/30",
  },
  {
    id: "sub-events",
    icon: <Sparkles size={36} className="text-amber-400" />,
    category: "SUB-EVENTS",
    tag: "SPEED CHALLENGES",
    title: "CIRCUIT ODYSSEY & BLITZ",
    subtitle: "Tech Quizzes, Debugging & Design Sprints",
    description:
      "Rapid-fire spot events designed for quick thinking and instant glory. UI/UX speed runs, algorithmic debugging races, tech trivia, and mystery box building rounds.",
    prizes: "SPOT GOODIES & CERTIFICATES",
    slug: "sub-events",
    teamSize: "Solo Entry",
    accentColor: "border-amber-500/40 shadow-amber-500/20",
    gradient: "from-amber-600/15 via-yellow-500/10 to-transparent",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  },
];

/* ── Participation Journey ── */
const journeySteps = [
  {
    step: "01",
    title: "Choose Your Track",
    description: "Browse the hackathon, gaming tournaments, and cultural stages to find where you excel.",
    icon: <Flame size={24} className="text-amber-400" />,
  },
  {
    step: "02",
    title: "Register Your Squad",
    description: "Submit details in seconds, invite your teammates, and get your digital QR ticket pass.",
    icon: <Users size={24} className="text-blue-400" />,
  },
  {
    step: "03",
    title: "Compete on Campus",
    description: "Show up at Chandigarh University, build with hands-on mentors, and battle top talent.",
    icon: <Zap size={24} className="text-purple-400" />,
  },
  {
    step: "04",
    title: "Take The Podium",
    description: "Pitch to esteemed industry judges, top the live leaderboard, and win grand cash prizes.",
    icon: <Award size={24} className="text-emerald-400" />,
  },
];

/* ── FAQ ── */
const faqs = [
  {
    q: "Who can participate in Technomania 3.0?",
    a: "Technomania 3.0 is open to all university students across India! Whether you are studying engineering, design, arts, or commerce, you are warmly invited to register and compete.",
  },
  {
    q: "Is there any registration fee to participate?",
    a: "Registration for Technomania 3.0 events is completely free! All verified students can register their squads and attend.",
  },
  {
    q: "Can I participate in multiple events?",
    a: "Yes! You can register for the 24-Hour Hackathon, Esports tournaments, and cultural events simultaneously as long as their stage schedules do not directly overlap.",
  },
  {
    q: "How does team registration work for Hackathon and Esports?",
    a: "The team lead fills out the registration form, adds team members by university UID and email, and submits. Once registered, every teammate receives a confirmed pass.",
  },
  {
    q: "Will food and stay be provided for the 24-Hour Hackathon?",
    a: "Yes! For the 24-hour non-stop hackathon, participants are provided meals, midnight refreshments, continuous energy drinks, and designated hacking/rest spaces on campus.",
  },
];

export default function TechnomaniaPage() {
  const getHref = useTechnomaniaHref();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const filteredEvents =
    activeCategory === "all"
      ? flagshipEvents
      : flagshipEvents.filter(
          (e) => e.category.toLowerCase() === activeCategory.toLowerCase()
        );

  return (
    <div className="relative overflow-hidden">
      {/* ═══════════════════════════════════════════════════════
          HERO SECTION — Grand Blueprint Centerpiece
          ═══════════════════════════════════════════════════════ */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center px-4 pt-10 pb-12 md:pt-14 md:pb-16">
        {/* Dynamic Multi-Color Ambient Glows */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] md:w-[1200px] h-[600px] bg-gradient-to-tr from-blue-600/20 via-purple-600/15 to-cyan-400/20 blur-[170px] rounded-full pointer-events-none -z-10" />

        <div className="w-full max-w-7xl mx-auto relative z-10">
          {/* Header Badge */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/5 border border-white/15 backdrop-blur-md shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:border-white/30 transition-all"
            >
              <div className="relative h-6 w-6">
                <Image
                  src="/technomania/techtatva-logo.png"
                  alt="Tech Tatva"
                  fill
                  className="object-contain drop-shadow-[0_0_10px_rgba(139,92,246,0.9)]"
                />
              </div>
              <span className="font-tm-mono text-xs font-bold tracking-[0.25em] text-white uppercase">
                TECH TATVA PRESENTS
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </motion.div>
          </div>

          {/* ── MASSIVE TM 3.0 BLUEPRINT LOGO (HERO CENTERPIECE) ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative w-full max-w-4xl lg:max-w-5xl mx-auto my-4"
          >
            {/* Multi-layer Ambient Backlight Aura */}
            <div className="absolute -inset-12 bg-gradient-to-r from-blue-600/30 via-cyan-400/30 to-purple-600/30 rounded-[40px] blur-3xl opacity-90 animate-pulse pointer-events-none" />

            {/* Glowing Logo Frame */}
            <div className="relative rounded-3xl p-4 sm:p-8 backdrop-blur-sm transition-transform duration-500 hover:scale-[1.01]">
              <div className="relative w-full aspect-[2.4/1]">
                <Image
                  src="/technomania/logo-white.png"
                  alt="Technomania 3.0"
                  fill
                  className="object-contain drop-shadow-[0_0_50px_rgba(255,255,255,0.85)]"
                  priority
                />
              </div>
            </div>
          </motion.div>

          {/* ── Subtitle & Festival Info ── */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-center mt-6 max-w-4xl mx-auto space-y-6"
          >
            {/* Holographic Headline Banner */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-[10px] sm:text-[11px] font-tm-mono font-bold text-cyan-300 tracking-[0.2em] uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                <span>CHANDIGARH UNIVERSITY · GHARUAN, MOHALI</span>
              </div>
              <h2 className="text-lg sm:text-2xl md:text-3xl font-tm-heading font-extrabold text-white tracking-wide uppercase">
                Flagship Technical & Cultural Festival
              </h2>
              <p className="text-xs sm:text-sm font-tm-mono text-cyan-200/70 tracking-wider">
                24H Hackathon Sprint · Multi-Title Esports Championship · Star Cultural Stage
              </p>
            </div>

            {/* Interactive Holographic Arena Capsules */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5 pt-2 max-w-4xl mx-auto">
              <div className="group relative flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-b from-blue-600/15 to-transparent border border-blue-500/30 hover:border-cyan-400/80 backdrop-blur-xl transition-all duration-300 hover:scale-105 shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:shadow-[0_0_30px_rgba(56,189,248,0.4)]">
                <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-xs font-tm-mono">
                  <Code size={15} className="text-cyan-400 group-hover:rotate-6 transition-transform" />
                  <span>24H HACKATHON</span>
                </div>
                <span className="text-[9px] font-tm-mono text-white/50 tracking-widest mt-0.5">BUILD & SHIP LIVE</span>
              </div>

              <div className="group relative flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-b from-purple-600/15 to-transparent border border-purple-500/30 hover:border-purple-400/80 backdrop-blur-xl transition-all duration-300 hover:scale-105 shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:shadow-[0_0_30px_rgba(192,132,252,0.4)]">
                <div className="flex items-center gap-1.5 text-purple-300 font-bold text-xs font-tm-mono">
                  <Gamepad2 size={15} className="text-purple-400 group-hover:rotate-6 transition-transform" />
                  <span>ESPORTS ARENA</span>
                </div>
                <span className="text-[9px] font-tm-mono text-white/50 tracking-widest mt-0.5">VALO · BGMI · EA FC</span>
              </div>

              <div className="group relative flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-b from-rose-600/15 to-transparent border border-rose-500/30 hover:border-rose-400/80 backdrop-blur-xl transition-all duration-300 hover:scale-105 shadow-[0_0_20px_rgba(244,63,94,0.2)] hover:shadow-[0_0_30px_rgba(251,113,133,0.4)]">
                <div className="flex items-center gap-1.5 text-rose-300 font-bold text-xs font-tm-mono">
                  <Music size={15} className="text-rose-400 group-hover:rotate-6 transition-transform" />
                  <span>CULTURAL STAGE</span>
                </div>
                <span className="text-[9px] font-tm-mono text-white/50 tracking-widest mt-0.5">CELEB DJ NIGHT</span>
              </div>

              <div className="group relative flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-b from-amber-600/15 to-transparent border border-amber-500/30 hover:border-amber-400/80 backdrop-blur-xl transition-all duration-300 hover:scale-105 shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(251,191,36,0.4)]">
                <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs font-tm-mono">
                  <Trophy size={15} className="text-amber-400 group-hover:rotate-6 transition-transform" />
                  <span>₹XX,XXX POOL</span>
                </div>
                <span className="text-[9px] font-tm-mono text-white/50 tracking-widest mt-0.5">CASH & INTERNSHIPS</span>
              </div>
            </div>

            {/* Realtime Live Countdown Chronometer HUD */}
            <div className="pt-2 flex justify-center items-center w-full">
              <TechnomaniaCountdown targetDate="2026-09-15T09:00:00+05:30" />
            </div>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href={getHref("/register")}
                className="w-full sm:w-auto tm-btn-solid text-sm py-4 px-10 flex items-center justify-center gap-3 shadow-[0_0_35px_rgba(74,158,255,0.5)] hover:shadow-[0_0_55px_rgba(74,158,255,0.8)] group"
              >
                <Zap size={17} className="text-cyan-300 group-hover:rotate-12 transition-transform" />
                <span className="font-bold tracking-wider text-sm">REGISTER SQUAD NOW</span>
                <ArrowRight size={17} className="group-hover:translate-x-1.5 transition-transform" />
              </Link>

              <Link
                href={getHref("/events")}
                className="w-full sm:w-auto tm-btn text-sm py-4 px-10 flex items-center justify-center gap-2.5 hover:border-cyan-400 hover:text-white"
              >
                <span>EXPLORE ALL EVENTS</span>
                <ExternalLink size={15} />
              </Link>
            </div>

            {/* Micro Live Status Ribbon */}
            <div className="flex items-center justify-center gap-2 pt-1 font-tm-mono text-[11px] text-white/50">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>REGISTRATIONS LIVE FOR UNIVERSITY STUDENTS · FREE PASSES</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          LIVELY METRICS — TM 3.0 Blueprint HUD Cards
          ═══════════════════════════════════════════════════════ */}
      <section className="relative px-4 py-8">
        <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { tag: "// 01_SPRINT", value: "24 HOURS", label: "NON-STOP HACKATHON", desc: "Build, Ship & Pitch Live", accent: "from-blue-500/20 to-cyan-500/5", glow: "hover:border-cyan-400/60 hover:shadow-[0_0_25px_rgba(74,158,255,0.25)]" },
            { tag: "// 02_ARENA", value: "3+ ARENAS", label: "GAMING & ESPORTS", desc: "BGMI · Valorant · EA FC", accent: "from-purple-500/20 to-indigo-500/5", glow: "hover:border-purple-400/60 hover:shadow-[0_0_25px_rgba(168,85,247,0.25)]" },
            { tag: "// 03_SQUADS", value: "500+", label: "STUDENT BUILDERS", desc: "Pan-India Participants", accent: "from-cyan-500/20 to-blue-500/5", glow: "hover:border-cyan-400/60 hover:shadow-[0_0_25px_rgba(6,182,212,0.25)]" },
            { tag: "// 04_GRANTS", value: "₹XX,XXX", label: "CASH PRIZE POOL", desc: "Cash, Internships & Goodies", accent: "from-amber-500/20 to-yellow-500/5", glow: "hover:border-amber-400/60 hover:shadow-[0_0_25px_rgba(245,158,11,0.25)]" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className={`relative p-5 sm:p-6 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-xl ${stat.glow} transition-all duration-300 group overflow-hidden`}
            >
              {/* Subtle Blueprint Ambient Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-b ${stat.accent} opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none`} />

              {/* Technical Corner Brackets */}
              <span className="absolute top-2 left-2 text-[9px] font-tm-mono text-white/20 select-none">┌</span>
              <span className="absolute top-2 right-2 text-[9px] font-tm-mono text-white/20 select-none">┐</span>
              <span className="absolute bottom-2 left-2 text-[9px] font-tm-mono text-white/20 select-none">└</span>
              <span className="absolute bottom-2 right-2 text-[9px] font-tm-mono text-white/20 select-none">┘</span>

              {/* Monospace Tag Header */}
              <div className="flex items-center justify-between relative z-10 mb-3">
                <span className="text-[10px] font-tm-mono font-bold tracking-[0.2em] text-tm-dim group-hover:text-tm-accent transition-colors">
                  {stat.tag}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-tm-accent transition-colors" />
              </div>

              {/* Value & Labels */}
              <div className="relative z-10">
                <p className="font-tm-heading text-2xl sm:text-3xl font-black text-white tracking-tight group-hover:text-tm-accent transition-colors">
                  {stat.value}
                </p>
                <p className="font-tm-mono text-xs font-bold text-white/90 tracking-wider mt-2 uppercase">
                  {stat.label}
                </p>
                <p className="text-xs text-tm-muted mt-1 leading-relaxed">
                  {stat.desc}
                </p>
              </div>

              {/* Bottom Technical Accent Bar */}
              <div className="absolute bottom-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-tm-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FLAGSHIP ARENAS — TM 3.0 Blueprint HUD Cards
          ═══════════════════════════════════════════════════════ */}
      <section className="relative px-4 py-20 md:py-28">
        <div className="max-w-6xl mx-auto">
          {/* Header & Category Tabs — Perfectly Aligned */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 text-tm-accent text-xs font-tm-mono font-bold tracking-widest uppercase mb-2">
                <span className="w-2 h-2 rounded-full bg-tm-accent animate-pulse" />
                <span>// FESTIVAL TRACKS & ARENAS //</span>
              </div>
              <h2 className="font-tm-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
                Major Arenas of{" "}
                <span className="font-black tracking-wider uppercase bg-gradient-to-r from-white via-cyan-200 to-tm-accent bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(74,158,255,0.4)]">
                  TECHNOMANIA 3.0
                </span>
              </h2>
            </div>

            {/* Filter Navigation Tabs — Cyber Blueprint Segment Bar */}
            <div className="flex items-center gap-1.5 p-1.5 bg-black/80 border border-white/15 rounded-xl backdrop-blur-xl overflow-x-auto no-scrollbar max-w-full self-start lg:self-auto shadow-[0_0_25px_rgba(0,0,0,0.6)]">
              {[
                { id: "all", label: "ALL" },
                { id: "hackathon", label: "HACKATHON" },
                { id: "esports", label: "ESPORTS" },
                { id: "cultural", label: "CULTURAL" },
                { id: "sub-events", label: "SUB-EVENTS" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`px-4 py-2 rounded-lg text-xs font-tm-mono font-bold tracking-[0.16em] uppercase whitespace-nowrap transition-all duration-200 ${
                    activeCategory === tab.id
                      ? "bg-gradient-to-r from-blue-600/40 via-cyan-500/30 to-blue-600/40 border border-cyan-400 text-white shadow-[0_0_20px_rgba(56,189,248,0.4)]"
                      : "border border-transparent text-tm-muted hover:text-white hover:bg-white/5 hover:border-white/10"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredEvents.map((event, idx) => (
                <motion.div
                  key={event.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 25 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, delay: idx * 0.08 }}
                  whileHover={{ y: -6 }}
                  className="relative p-6 sm:p-8 rounded-2xl bg-black/70 border border-white/10 hover:border-tm-accent/60 backdrop-blur-xl flex flex-col justify-between group transition-all duration-300 overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]"
                >
                  {/* Subtle Blueprint Background Ambient */}
                  <div className={`absolute inset-0 bg-gradient-to-b ${event.gradient} opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none`} />

                  {/* Corner Blueprint Markers */}
                  <span className="absolute top-2 left-3 text-[10px] font-tm-mono text-white/20 select-none">┌</span>
                  <span className="absolute top-2 right-3 text-[10px] font-tm-mono text-white/20 select-none">┐</span>
                  <span className="absolute bottom-2 left-3 text-[10px] font-tm-mono text-white/20 select-none">└</span>
                  <span className="absolute bottom-2 right-3 text-[10px] font-tm-mono text-white/20 select-none">┘</span>

                  <div className="relative z-10">
                    {/* Top Tag & Icon */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10 group-hover:border-tm-accent group-hover:scale-105 transition-all">
                        {event.icon}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-tm-mono font-bold tracking-wider uppercase border ${event.badgeColor}`}>
                        {event.tag}
                      </span>
                    </div>

                    {/* Title & Info */}
                    <h3 className="font-tm-heading text-2xl font-bold text-white group-hover:text-tm-accent transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-xs font-tm-mono font-semibold text-tm-accent mt-1">
                      {event.subtitle}
                    </p>
                    <p className="text-sm text-tm-muted leading-relaxed mt-4">
                      {event.description}
                    </p>
                  </div>

                  {/* Bottom Meta */}
                  <div className="relative z-10 mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <span className="block text-[10px] font-tm-mono text-tm-dim uppercase tracking-wider">REWARDS</span>
                      <span className="text-xs font-tm-heading font-black text-white">{event.prizes}</span>
                    </div>

                    <Link
                      href={getHref("/events")}
                      className="inline-flex items-center gap-1.5 text-xs font-tm-mono font-bold text-tm-accent hover:text-white transition-colors"
                    >
                      <span>VIEW RULES</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>

                  {/* Bottom Cyan Hover Line */}
                  <div className="absolute bottom-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-tm-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          PARTICIPATION JOURNEY — TM 3.0 Blueprint Roadmap
          ═══════════════════════════════════════════════════════ */}
      <section className="relative px-4 py-20 bg-white/[0.01] border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-tm-accent text-xs font-tm-mono font-bold tracking-widest uppercase">
              // PARTICIPATION PIPELINE //
            </span>
            <h2 className="font-tm-heading text-3xl sm:text-4xl md:text-5xl font-bold text-white mt-2">
              Four Steps to Victory
            </h2>
            <p className="text-tm-muted text-sm sm:text-base mt-3">
              Follow the simple flow from registration to stepping onto the grand winner podium.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {journeySteps.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                whileHover={{ y: -6 }}
                className="relative p-6 sm:p-8 rounded-2xl bg-black/60 border border-white/10 hover:border-tm-accent/60 backdrop-blur-xl transition-all duration-300 group overflow-hidden"
              >
                {/* Corner Markers */}
                <span className="absolute top-2 left-2 text-[9px] font-tm-mono text-white/20 select-none">┌</span>
                <span className="absolute top-2 right-2 text-[9px] font-tm-mono text-white/20 select-none">┐</span>
                <span className="absolute bottom-2 left-2 text-[9px] font-tm-mono text-white/20 select-none">└</span>
                <span className="absolute bottom-2 right-2 text-[9px] font-tm-mono text-white/20 select-none">┘</span>

                <div className="flex items-center justify-between mb-6 relative z-10">
                  <span className="font-tm-heading text-3xl font-black text-white/20 group-hover:text-tm-accent transition-colors">
                    {item.step}
                  </span>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 group-hover:border-tm-accent transition-colors">
                    {item.icon}
                  </div>
                </div>

                <h3 className="font-tm-heading text-lg font-bold text-white relative z-10">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-tm-muted leading-relaxed mt-2 relative z-10">
                  {item.description}
                </p>

                {/* Bottom Neon Line */}
                <div className="absolute bottom-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-tm-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FAQS ACCORDION
          ═══════════════════════════════════════════════════════ */}
      <section className="relative px-4 py-20 md:py-28">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-tm-accent text-xs font-mono font-bold tracking-widest uppercase">
              GOT QUESTIONS?
            </span>
            <h2 className="font-tm-heading text-3xl sm:text-4xl md:text-5xl font-bold text-white mt-2">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={faq.q}
                  className="rounded-xl border border-white/10 bg-tm-surface/70 backdrop-blur overflow-hidden transition-colors hover:border-white/20"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 select-none"
                  >
                    <span className="font-tm-heading text-sm sm:text-base font-bold text-white">
                      {faq.q}
                    </span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-tm-muted shrink-0"
                    >
                      <ChevronDown size={18} />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-6 sm:px-6 text-sm text-tm-muted leading-relaxed border-t border-white/5 pt-4">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FINAL CALL TO ACTION
          ═══════════════════════════════════════════════════════ */}
      <section className="relative px-4 py-16 pb-28">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-8 sm:p-14 rounded-3xl bg-gradient-to-b from-blue-600/20 via-purple-600/10 to-tm-surface border border-white/15 backdrop-blur-xl shadow-[0_0_60px_rgba(74,158,255,0.2)]"
          >
            {/* Dual mini logo badge */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="relative h-8 w-8">
                <Image
                  src="/technomania/techtatva-logo.png"
                  alt="Tech Tatva"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-white/30 text-xs font-mono">✕</span>
              <div className="relative h-7 w-20">
                <Image
                  src="/technomania/logo-emblem.png"
                  alt="TM3.0"
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            <h2 className="font-tm-heading text-3xl sm:text-4xl md:text-5xl font-black text-white">
              Ready to Make History at<br />
              <span className="font-black tracking-wider uppercase bg-gradient-to-r from-white via-cyan-200 to-tm-accent bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(74,158,255,0.5)]">
                TECHNOMANIA 3.0?
              </span>
            </h2>

            <p className="text-tm-muted text-sm sm:text-base mt-4 max-w-lg mx-auto leading-relaxed">
              Registrations are active now. Secure your squad&apos;s spot before seats fill up.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={getHref("/register")}
                className="w-full sm:w-auto tm-btn-solid text-sm py-3.5 px-8 shadow-[0_0_30px_rgba(74,158,255,0.4)]"
              >
                REGISTER YOUR SQUAD NOW
              </Link>
              <Link
                href={getHref("/schedule")}
                className="w-full sm:w-auto tm-btn text-sm py-3.5 px-8"
              >
                VIEW EVENT SCHEDULE
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
