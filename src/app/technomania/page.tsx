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
  Users,
  ExternalLink,
  Flame,
  Award,
} from "lucide-react";
import { TechnomaniaCountdown } from "@/components/technomania/technomania-countdown";
import { TechnomaniaSciFiIntro } from "@/components/technomania/technomania-scifi-intro";
import { TechnomaniaInteractiveCard } from "@/components/technomania/technomania-interactive-card";

/* ── Flagship Events (Pure Monochrome Theme: Black, White & Zinc with 3D Mascots) ── */
const flagshipEvents = [
  {
    id: "hackathon",
    icon: <Code size={24} className="text-white" />,
    category: "HACKATHON",
    tag: "24 HOURS NON-STOP",
    title: "CODE STORM 24H",
    subtitle: "Flagship 24-Hour Hackathon",
    description:
      "24 hours of non-stop building, mentoring, and shipping solutions. Form squads of up to 4 builders, solve real-world industry problem statements, and pitch live to tech founders.",
    prizes: "₹XX,XXX PRIZES & INTERNSHIPS",
    slug: "hackathon",
    teamSize: "1-4 Members",
    mascotImage: "/technomania/mascots/mascot-hackathon.jpg",
    mascotAlt: "3D Cyber Coder Mascot",
  },
  {
    id: "esports",
    icon: <Gamepad2 size={24} className="text-white" />,
    category: "ESPORTS",
    tag: "COMPETITIVE ARENA",
    title: "CYBER CLASH",
    subtitle: "Multi-Title Gaming Championship",
    description:
      "High-stakes esports showdown across BGMI, Valorant, and EA FC. Experience live casting on stage, tournament-grade setups, and intense bracket battles for ultimate university supremacy.",
    prizes: "TROPHIES & CASH REWARDS",
    slug: "esports",
    teamSize: "Squad & Solo",
    mascotImage: "/technomania/mascots/mascot-esports.jpg",
    mascotAlt: "3D Esports Gamer Mascot",
  },
  {
    id: "cultural",
    icon: <Music size={24} className="text-white" />,
    category: "CULTURAL",
    tag: "LIVE PERFORMANCES",
    title: "FESTIVAL NOCTURNE",
    subtitle: "Music, Dance & Celebrity DJ Night",
    description:
      "The pulse of Chandigarh University's artistic spirit. Battle of the bands, western & classical dance showdowns, fashion choreography, and an electrifying celebrity DJ night.",
    prizes: "MEMENTOS & CASH PRIZES",
    slug: "cultural",
    teamSize: "Solo & Crews",
    mascotImage: "/technomania/mascots/mascot-cultural.jpg",
    mascotAlt: "3D Cultural DJ Mascot",
  },
  {
    id: "sub-events",
    icon: <Sparkles size={24} className="text-white" />,
    category: "SUB-EVENTS",
    tag: "SPEED CHALLENGES",
    title: "CIRCUIT ODYSSEY & BLITZ",
    subtitle: "Tech Quizzes, Debugging & Design Sprints",
    description:
      "Rapid-fire spot events designed for quick thinking and instant glory. UI/UX speed runs, algorithmic debugging races, tech trivia, and mystery box building rounds.",
    prizes: "SPOT GOODIES & CERTIFICATES",
    slug: "sub-events",
    teamSize: "Solo Entry",
    mascotImage: "/technomania/mascots/mascot-subevents.jpg",
    mascotAlt: "3D Speed Runner Mascot",
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
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [stats, setStats] = useState({ totalEvents: 6, totalRegistrations: 0 });

  React.useEffect(() => {
    fetch("/api/fest/stats").then(res => res.json()).then(data => {
      setStats({
        totalEvents: data.activeFestArenas || 6,
        totalRegistrations: data.totalBuilders || 0
      });
    }).catch(() => {});
  }, []);

  const filteredEvents =
    activeCategory === "all"
      ? flagshipEvents
      : flagshipEvents.filter(
          (e) => e.category.toLowerCase() === activeCategory.toLowerCase()
        );

  return (
    <div className="relative overflow-hidden bg-black text-white selection:bg-white selection:text-black">
      {/* ── Sci-Fi HUD Reticle & Shockwave Lock Entrance ── */}
      <TechnomaniaSciFiIntro />

      {/* ═══════════════════════════════════════════════════════
          HERO SECTION — Ultra Smooth Logo Expansion & Lodging
          ═══════════════════════════════════════════════════════ */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center px-4 pt-12 pb-16 md:pt-16 md:pb-20">
        {/* Soft Ambient Radial Highlight */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] md:w-[1100px] h-[500px] bg-white/[0.03] blur-[160px] rounded-full pointer-events-none -z-10"
        />

        <div className="w-full max-w-6xl mx-auto relative z-10">
          {/* Header Badge (Graceful Fade-In) */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ opacity: 0, y: -20, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1.0, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
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

          {/* ── BUTTERY SMOOTH TM 3.0 LOGO EXPANSION & LODGING ── */}
          <motion.div
            initial={{
              scale: 0.38,
              opacity: 0,
              y: 40,
              filter: "blur(16px)",
            }}
            animate={{
              scale: 1,
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
            }}
            transition={{
              duration: 1.5,
              ease: [0.16, 1, 0.3, 1], // Apple fluid momentum curve
            }}
            className="relative w-full max-w-4xl mx-auto my-4 will-change-transform transform-gpu"
          >
            {/* Ambient Pulse Aura behind Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0, 0.5, 0.25], scale: [0.8, 1.1, 1] }}
              transition={{ duration: 2.0, ease: "easeOut" }}
              className="absolute -inset-10 bg-white/[0.04] rounded-[50px] blur-3xl pointer-events-none"
            />

            <div className="relative rounded-3xl p-4 sm:p-6 backdrop-blur-sm transition-transform duration-500 hover:scale-[1.01]">
              <div className="relative w-full aspect-[2.4/1]">
                <Image
                  src="/technomania/logo-white.png"
                  alt="Technomania 3.0"
                  fill
                  className="object-contain drop-shadow-[0_0_50px_rgba(255,255,255,0.45)]"
                  priority
                />
              </div>
            </div>
          </motion.div>

          {/* ── Subtitle & Action Elements (Staggered Spring Entry) ── */}
          <motion.div
            initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.1, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
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
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
            >
              <Link
                href={getHref("/register")}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-sm tracking-wide flex items-center justify-center gap-2.5 transition-all group shadow-[0_0_25px_rgba(255,255,255,0.15)] hover:shadow-[0_0_35px_rgba(255,255,255,0.3)]"
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
            </motion.div>

            {/* Live Countdown Chronometer */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 1.05, ease: [0.16, 1, 0.3, 1] }}
              className="pt-4 pb-2 flex justify-center items-center w-full"
            >
              <TechnomaniaCountdown targetDate="2026-09-15T09:00:00+05:30" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          LIVELY METRICS — Clean Monochrome Cards
          ═══════════════════════════════════════════════════════ */}
      <section className="relative px-4 py-8">
        <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { tag: "01_DAYS", value: "3 DAYS", label: "NON-STOP FESTIVAL", desc: "Events, Competitions & Nights" },
            { tag: "02_PARTICIPANTS", value: `${stats.totalRegistrations}+`, label: "PARTICIPANTS", desc: "Live Registrations" },
            { tag: "03_ARENAS", value: `${stats.totalEvents} ARENAS`, label: "FLAGSHIP EVENTS", desc: "Hackathon, Esports & Tech" },
            { tag: "04_PRIZES", value: "₹1L+", label: "COMBINED PRIZE POOL", desc: "Cash, Internships & Goodies" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4 }}
              className="relative p-6 rounded-2xl bg-zinc-950 border border-zinc-900 hover:border-zinc-700 transition-all duration-300 group overflow-hidden"
            >
              <div className="flex items-center justify-between relative z-10 mb-3">
                <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-zinc-500 group-hover:text-zinc-300 transition-colors">
                  // {stat.tag}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-800 group-hover:bg-white transition-colors" />
              </div>

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
          FLAGSHIP ARENAS — Fully Animated 3D Interactive Cards
          ═══════════════════════════════════════════════════════ */}
      <section className="relative px-4 py-20 md:py-28">
        {/* Subtle Ambient Radial Highlight behind Arenas */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-white/[0.02] blur-[150px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto">
          {/* Header & Animated Category Tabs */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 text-zinc-400 text-xs font-mono font-bold tracking-widest uppercase mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span>FESTIVAL TRACKS & ARENAS</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
                Major Arenas of TECHNOMANIA 3.0
              </h2>
            </div>

            {/* Filter Tabs with Fluid Animated Background Slider */}
            <div className="flex items-center gap-1.5 p-1.5 bg-zinc-950/90 border border-zinc-900 rounded-2xl overflow-x-auto no-scrollbar self-start lg:self-auto backdrop-blur-md">
              {[
                { id: "all", label: "ALL ARENAS" },
                { id: "hackathon", label: "HACKATHON" },
                { id: "esports", label: "ESPORTS" },
                { id: "cultural", label: "CULTURAL" },
                { id: "sub-events", label: "SUB-EVENTS" },
              ].map((tab) => {
                const isActive = activeCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveCategory(tab.id)}
                    className={`relative px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-colors z-10 ${
                      isActive
                        ? "text-black"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeArenaTab"
                        className="absolute inset-0 bg-white rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.3)] -z-10"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fully Animated 3D Interactive Cards Grid */}
          <motion.div layout className="grid md:grid-cols-2 gap-6 items-stretch">
            <AnimatePresence mode="popLayout">
              {filteredEvents.map((evt, idx) => (
                <TechnomaniaInteractiveCard
                  key={evt.id}
                  event={evt}
                  index={idx}
                  getHref={getHref}
                />
              ))}
            </AnimatePresence>
          </motion.div>
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
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
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
              </motion.div>
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
                    className={`text-zinc-500 transition-transform duration-300 ${
                      openFaq === idx ? "rotate-180 text-white" : ""
                    }`}
                  />
                </button>

                {openFaq === idx && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="px-5 pb-5 text-xs text-zinc-400 leading-relaxed border-t border-zinc-900/60 pt-3"
                  >
                    {faq.a}
                  </motion.div>
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
              className="px-8 py-3.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-sm tracking-wide flex items-center gap-2.5 transition shadow-[0_0_25px_rgba(255,255,255,0.15)]"
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
