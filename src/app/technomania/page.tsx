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
import { TechnomaniaIntro } from "@/components/technomania/technomania-intro";

/* ── Flagship Events (Pure Monochrome Theme: Black, White & Zinc) ── */
const flagshipEvents = [
  {
    id: "hackathon",
    icon: <Code size={32} className="text-white" />,
    category: "HACKATHON",
    tag: "24 HOURS NON-STOP",
    title: "CODE STORM 24H",
    subtitle: "Flagship 24-Hour Hackathon",
    description:
      "24 hours of non-stop building, mentoring, and shipping solutions. Form squads of up to 4 builders, solve real-world industry problem statements, and pitch live to tech founders.",
    prizes: "₹XX,XXX PRIZES & INTERNSHIPS",
    slug: "hackathon",
    teamSize: "1-4 Members",
    badgeColor: "bg-zinc-900 text-zinc-200 border-zinc-800",
  },
  {
    id: "esports",
    icon: <Gamepad2 size={32} className="text-white" />,
    category: "ESPORTS",
    tag: "COMPETITIVE ARENA",
    title: "CYBER CLASH",
    subtitle: "Multi-Title Gaming Championship",
    description:
      "High-stakes esports showdown across BGMI, Valorant, and EA FC. Experience live casting on stage, tournament-grade setups, and intense bracket battles for ultimate university supremacy.",
    prizes: "TROPHIES & CASH REWARDS",
    slug: "esports",
    teamSize: "Squad & Solo",
    badgeColor: "bg-zinc-900 text-zinc-200 border-zinc-800",
  },
  {
    id: "cultural",
    icon: <Music size={32} className="text-white" />,
    category: "CULTURAL",
    tag: "LIVE PERFORMANCES",
    title: "FESTIVAL NOCTURNE",
    subtitle: "Music, Dance & Celebrity DJ Night",
    description:
      "The pulse of Chandigarh University's artistic spirit. Battle of the bands, western & classical dance showdowns, fashion choreography, and an electrifying celebrity DJ night.",
    prizes: "MEMENTOS & CASH PRIZES",
    slug: "cultural",
    teamSize: "Solo & Crews",
    badgeColor: "bg-zinc-900 text-zinc-200 border-zinc-800",
  },
  {
    id: "sub-events",
    icon: <Sparkles size={32} className="text-white" />,
    category: "SUB-EVENTS",
    tag: "SPEED CHALLENGES",
    title: "CIRCUIT ODYSSEY & BLITZ",
    subtitle: "Tech Quizzes, Debugging & Design Sprints",
    description:
      "Rapid-fire spot events designed for quick thinking and instant glory. UI/UX speed runs, algorithmic debugging races, tech trivia, and mystery box building rounds.",
    prizes: "SPOT GOODIES & CERTIFICATES",
    slug: "sub-events",
    teamSize: "Solo Entry",
    badgeColor: "bg-zinc-900 text-zinc-200 border-zinc-800",
  },
];

/* ── Participation Journey ── */
const journeySteps = [
  {
    step: "01",
    title: "Choose Your Track",
    description: "Browse the hackathon, gaming tournaments, and cultural stages to find where you excel.",
    icon: <Flame size={22} className="text-white" />,
  },
  {
    step: "02",
    title: "Register Your Squad",
    description: "Submit details in seconds, invite your teammates, and get your digital QR ticket pass.",
    icon: <Users size={22} className="text-white" />,
  },
  {
    step: "03",
    title: "Compete on Campus",
    description: "Show up at Chandigarh University, build with hands-on mentors, and battle top talent.",
    icon: <Zap size={22} className="text-white" />,
  },
  {
    step: "04",
    title: "Take The Podium",
    description: "Pitch to esteemed industry judges, top the live leaderboard, and win grand cash prizes.",
    icon: <Award size={22} className="text-white" />,
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
    <div className="relative overflow-hidden bg-black text-white selection:bg-white selection:text-black">
      {/* ── Cinematic Opening Entrance Animation ── */}
      <TechnomaniaIntro />

      {/* ═══════════════════════════════════════════════════════
          HERO SECTION — Spacious Monochrome Centerpiece
          ═══════════════════════════════════════════════════════ */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center px-4 pt-12 pb-16 md:pt-16 md:pb-20">
        {/* Subtle Ambient Radial Highlight */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] md:w-[1100px] h-[500px] bg-white/[0.025] blur-[160px] rounded-full pointer-events-none -z-10" />

        <div className="w-full max-w-6xl mx-auto relative z-10">
          {/* Header Badge */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-zinc-950 border border-zinc-800 text-xs font-mono font-medium text-zinc-300"
            >
              <div className="relative h-5 w-5">
                <Image
                  src="/technomania/techtatva-logo.png"
                  alt="Tech Tatva"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="tracking-[0.2em] uppercase">TECH TATVA PRESENTS</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            </motion.div>
          </div>

          {/* ── MASSIVE TM 3.0 WHITE EMBLEM LOGO (HERO CENTERPIECE) ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative w-full max-w-4xl mx-auto my-4"
          >
            <div className="relative rounded-3xl p-4 sm:p-6 backdrop-blur-sm transition-transform duration-500 hover:scale-[1.01]">
              <div className="relative w-full aspect-[2.4/1]">
                <Image
                  src="/technomania/logo-white.png"
                  alt="Technomania 3.0"
                  fill
                  className="object-contain drop-shadow-[0_0_40px_rgba(255,255,255,0.4)]"
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
            className="text-center mt-6 max-w-3xl mx-auto space-y-6"
          >
            {/* Campus Info & Headline */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono font-bold text-zinc-300 tracking-[0.2em] uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span>CHANDIGARH UNIVERSITY · GHARUAN, MOHALI</span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight uppercase">
                Flagship Technical & Cultural Festival
              </h2>
              <p className="text-xs sm:text-sm font-mono text-zinc-400 tracking-wider max-w-2xl mx-auto leading-relaxed">
                24H Hackathon Sprint · Multi-Title Esports Championship · Star Cultural Stage
              </p>
            </div>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href={getHref("/register")}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-sm tracking-wide flex items-center justify-center gap-2.5 transition-all group"
              >
                <span>REGISTER SQUAD NOW</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href={getHref("/events")}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-medium text-sm tracking-wide flex items-center justify-center gap-2.5 transition-all"
              >
                <span>EXPLORE ALL EVENTS</span>
                <ExternalLink size={15} className="text-zinc-400" />
              </Link>
            </div>

            {/* Live Countdown Chronometer */}
            <div className="pt-4 pb-2 flex justify-center items-center w-full">
              <TechnomaniaCountdown targetDate="2026-09-15T09:00:00+05:30" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          LIVELY METRICS — Clean Monochrome Cards
          ═══════════════════════════════════════════════════════ */}
      <section className="relative px-4 py-8">
        <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { tag: "01_SPRINT", value: "24 HOURS", label: "NON-STOP HACKATHON", desc: "Build, Ship & Pitch Live" },
            { tag: "02_ARENA", value: "3+ ARENAS", label: "GAMING & ESPORTS", desc: "BGMI · Valorant · EA FC" },
            { tag: "03_SQUADS", value: "500+", label: "STUDENT BUILDERS", desc: "Pan-India Participants" },
            { tag: "04_GRANTS", value: "₹XX,XXX", label: "CASH PRIZE POOL", desc: "Cash, Internships & Goodies" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="relative p-6 rounded-2xl bg-zinc-950 border border-zinc-900 hover:border-zinc-700 transition-all duration-300 group overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between relative z-10 mb-3">
                <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-zinc-500 group-hover:text-zinc-300 transition-colors">
                  // {stat.tag}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-800 group-hover:bg-white transition-colors" />
              </div>

              {/* Value & Labels */}
              <div className="relative z-10 space-y-1">
                <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {stat.value}
                </p>
                <p className="font-mono text-xs font-bold text-zinc-300 tracking-wider pt-1 uppercase">
                  {stat.label}
                </p>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  {stat.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FLAGSHIP ARENAS — Monochrome Showcase Cards
          ═══════════════════════════════════════════════════════ */}
      <section className="relative px-4 py-20 md:py-28">
        <div className="max-w-6xl mx-auto">
          {/* Header & Category Tabs */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 text-zinc-400 text-xs font-mono font-bold tracking-widest uppercase mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span>FESTIVAL TRACKS & ARENAS</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
                Major Arenas of TECHNOMANIA 3.0
              </h2>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1.5 bg-zinc-950 border border-zinc-900 rounded-xl overflow-x-auto no-scrollbar self-start lg:self-auto">
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
                  className={`px-4 py-2 rounded-lg text-xs font-mono font-bold tracking-wider uppercase transition-all ${
                    activeCategory === tab.id
                      ? "bg-white text-black font-extrabold"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {filteredEvents.map((evt, idx) => (
              <motion.div
                key={evt.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
                className="group relative p-8 rounded-3xl bg-zinc-950 border border-zinc-900 hover:border-zinc-700 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 rounded-md text-[10px] font-mono font-bold tracking-widest uppercase bg-zinc-900 text-zinc-300 border border-zinc-800">
                      {evt.tag}
                    </span>
                    <span className="text-xs font-mono text-zinc-500">
                      {evt.teamSize}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-white">
                      {evt.icon}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white group-hover:text-zinc-200 transition-colors">
                        {evt.title}
                      </h3>
                      <p className="text-xs font-mono text-zinc-400">{evt.subtitle}</p>
                    </div>
                  </div>

                  <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                    {evt.description}
                  </p>
                </div>

                <div className="pt-6 border-t border-zinc-900 flex items-center justify-between">
                  <div className="text-xs font-mono font-semibold text-zinc-300">
                    {evt.prizes}
                  </div>

                  <Link
                    href={getHref(`/events/${evt.slug}`)}
                    className="inline-flex items-center gap-2 text-xs font-mono font-bold text-white hover:text-zinc-300 transition"
                  >
                    <span>EXPLORE ARENA</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          PARTICIPATION JOURNEY — Clean Timeline
          ═══════════════════════════════════════════════════════ */}
      <section className="relative px-4 py-20 border-t border-zinc-900">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono text-zinc-400 font-bold uppercase tracking-widest">
              STEP-BY-STEP PROCESS
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">How To Participate</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {journeySteps.map((step, i) => (
              <div
                key={step.step}
                className="p-6 rounded-2xl bg-zinc-950 border border-zinc-900 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold font-mono text-zinc-600">{step.step}</span>
                  <div className="p-2.5 rounded-xl bg-zinc-900 text-white">
                    {step.icon}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white">{step.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FAQ SECTION — Clean Accordion
          ═══════════════════════════════════════════════════════ */}
      <section className="relative px-4 py-20 border-t border-zinc-900">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono text-zinc-400 font-bold uppercase tracking-widest">
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 className="text-3xl font-bold text-white">Everything You Need To Know</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-zinc-950 border border-zinc-900 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between text-sm font-semibold text-white hover:text-zinc-300 transition"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={`text-zinc-500 transition-transform ${
                      openFaq === idx ? "rotate-180 text-white" : ""
                    }`}
                  />
                </button>

                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs text-zinc-400 leading-relaxed border-t border-zinc-900/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          BOTTOM CTA BANNER
          ═══════════════════════════════════════════════════════ */}
      <section className="relative px-4 py-20 border-t border-zinc-900">
        <div className="max-w-4xl mx-auto text-center p-10 sm:p-14 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Ready to Compete in Technomania 3.0?
          </h2>
          <p className="text-sm text-zinc-400 max-w-xl mx-auto">
            Free registration for all college students across India. Assemble your squad today.
          </p>
          <div className="flex justify-center pt-2">
            <Link
              href={getHref("/register")}
              className="px-8 py-3.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-sm tracking-wide flex items-center gap-2.5 transition"
            >
              <span>REGISTER SQUAD NOW</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
