"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Layers,
  Users,
  Trophy,
  Megaphone,
  Download,
  Search,
  Plus,
  Edit2,
  Trash2,
  QrCode,
  Eye,
  Activity,
  MapPin,
  TrendingUp,
  X,
  ExternalLink,
} from "lucide-react";
import { useTechnomaniaHref } from "@/lib/technomania-links";

interface ArenaEvent {
  _id: string;
  title: string;
  slug: string;
  category: string;
  participationMode: "individual" | "team" | "both";
  maxTeamSize: number;
  capacity?: number;
  venue?: string;
  status: string;
  registrationOpen: boolean;
  startAt?: string;
  endAt?: string;
  rules?: string[];
  faqs?: { question: string; answer: string }[];
}

interface Registration {
  _id: string;
  eventTitle: string;
  eventId: string;
  mode: "individual" | "team";
  teamName?: string;
  leadName: string;
  leadEmail: string;
  leadPhone?: string;
  leadUid?: string;
  leadProgram?: string;
  leadSemester?: number;
  members: { name: string; email: string; uid?: string; program?: string; semester?: number }[];
  status: "confirmed" | "cancelled" | "waitlisted";
  registeredAt: string;
  qrToken: string;
}

interface LeaderboardTeam {
  _id: string;
  teamName: string;
  eventTitle: string;
  eventId: string;
  totalScore: number;
  rank: number;
  scores: { category: string; baseScore: number; timeBonus: number; hintPenalty: number }[];
}

export default function TechnomaniaStandaloneAdmin() {
  const getHref = useTechnomaniaHref();
  const [activeTab, setActiveTab] = useState<
    "overview" | "arenas" | "squads" | "leaderboard" | "ticker" | "checkin"
  >("overview");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArenaFilter, setSelectedArenaFilter] = useState("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");

  // Selected registration for dossier modal
  const [selectedSquad, setSelectedSquad] = useState<Registration | null>(null);

  // Arenas Modal State
  const [isArenaModalOpen, setIsArenaModalOpen] = useState(false);
  const [editingArena, setEditingArena] = useState<Partial<ArenaEvent> | null>(null);

  // Score Modal State
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [editingScore, setEditingScore] = useState<Partial<LeaderboardTeam> | null>(null);

  // Stats State
  const stats = {
    totalSquads: 142,
    totalBuilders: 428,
    activeArenas: 4,
    rankedTeams: 18,
  };

  // Sample or Real Data
  const [arenas, setArenas] = useState<ArenaEvent[]>([
    {
      _id: "arena-1",
      title: "24-Hour Hackathon Sprint",
      slug: "hackathon-sprint",
      category: "hackathon",
      participationMode: "team",
      maxTeamSize: 4,
      capacity: 60,
      venue: "Main Auditorium & Lab Complex",
      status: "published",
      registrationOpen: true,
      startAt: "2026-09-15T09:00:00",
      rules: ["24 hours uninterrupted build time", "Original code only", "Git commits tracked"],
    },
    {
      _id: "arena-2",
      title: "Valorant Tactical Masters",
      slug: "valorant-tactical",
      category: "esports",
      participationMode: "team",
      maxTeamSize: 5,
      capacity: 32,
      venue: "Esports Arena 1",
      status: "published",
      registrationOpen: true,
      startAt: "2026-09-15T13:00:00",
    },
    {
      _id: "arena-3",
      title: "BGMI Mobile Battleground",
      slug: "bgmi-championship",
      category: "esports",
      participationMode: "team",
      maxTeamSize: 4,
      capacity: 50,
      venue: "Esports Arena 2",
      status: "published",
      registrationOpen: true,
      startAt: "2026-09-15T15:00:00",
    },
    {
      _id: "arena-4",
      title: "Star Cultural DJ Showcase",
      slug: "cultural-dj-night",
      category: "cultural",
      participationMode: "individual",
      maxTeamSize: 1,
      capacity: 2500,
      venue: "University Open Amphitheatre",
      status: "published",
      registrationOpen: true,
      startAt: "2026-09-16T18:00:00",
    },
  ]);

  const [squads, setSquads] = useState<Registration[]>([
    {
      _id: "reg-1",
      eventTitle: "24-Hour Hackathon Sprint",
      eventId: "arena-1",
      mode: "team",
      teamName: "CyberPulse Labs",
      leadName: "Aman Verma",
      leadEmail: "aman.v@cumail.in",
      leadPhone: "+91 98765 43210",
      leadUid: "22BCS10145",
      leadProgram: "B.Tech CSE (AI/ML)",
      leadSemester: 6,
      members: [
        { name: "Rohit Sharma", email: "rohit.s@cumail.in", uid: "22BCS10146", program: "B.Tech CSE", semester: 6 },
        { name: "Sneha Patel", email: "sneha.p@cumail.in", uid: "22BCS10147", program: "B.Tech IT", semester: 6 },
        { name: "Devansh Roy", email: "devansh.r@cumail.in", uid: "22BCS10148", program: "B.Tech CSE", semester: 6 },
      ],
      status: "confirmed",
      registeredAt: "2026-08-15T14:30:00Z",
      qrToken: "TM3-HK-99214",
    },
    {
      _id: "reg-2",
      eventTitle: "Valorant Tactical Masters",
      eventId: "arena-2",
      mode: "team",
      teamName: "Alpha Strikers",
      leadName: "Kabir Singh",
      leadEmail: "kabir.s@cumail.in",
      leadPhone: "+91 98112 33445",
      leadUid: "23BCS11022",
      leadProgram: "B.Tech CSE",
      leadSemester: 4,
      members: [
        { name: "Arjun Mehta", email: "arjun.m@cumail.in", uid: "23BCS11023", program: "B.Tech CSE", semester: 4 },
        { name: "Vikram Rathore", email: "vikram.r@cumail.in", uid: "23BCS11024", program: "BCA", semester: 4 },
        { name: "Tanmay Bhatia", email: "tanmay.b@cumail.in", uid: "23BCS11025", program: "B.Tech IT", semester: 4 },
        { name: "Siddharth Rao", email: "sid.r@cumail.in", uid: "23BCS11026", program: "B.Tech CSE", semester: 4 },
      ],
      status: "confirmed",
      registeredAt: "2026-08-15T16:10:00Z",
      qrToken: "TM3-VAL-48190",
    },
    {
      _id: "reg-3",
      eventTitle: "BGMI Mobile Battleground",
      eventId: "arena-3",
      mode: "team",
      teamName: "Phantom Elites",
      leadName: "Rohan Gupta",
      leadEmail: "rohan.g@cumail.in",
      leadPhone: "+91 97765 11223",
      leadUid: "24BCS12091",
      leadProgram: "B.Tech AI/ML",
      leadSemester: 2,
      members: [
        { name: "Sahil Khan", email: "sahil.k@cumail.in", uid: "24BCS12092", program: "B.Tech CSE", semester: 2 },
        { name: "Priya Das", email: "priya.d@cumail.in", uid: "24BCS12093", program: "B.Tech CSE", semester: 2 },
        { name: "Manav Joshi", email: "manav.j@cumail.in", uid: "24BCS12094", program: "BCA", semester: 2 },
      ],
      status: "confirmed",
      registeredAt: "2026-08-15T18:45:00Z",
      qrToken: "TM3-BGM-10294",
    },
  ]);

  const [leaderboard, setLeaderboard] = useState<LeaderboardTeam[]>([
    {
      _id: "lead-1",
      teamName: "CyberPulse Labs",
      eventTitle: "24-Hour Hackathon Sprint",
      eventId: "arena-1",
      totalScore: 945,
      rank: 1,
      scores: [
        { category: "Innovation & Architecture", baseScore: 480, timeBonus: 50, hintPenalty: 0 },
        { category: "Execution & UI Polish", baseScore: 415, timeBonus: 0, hintPenalty: 0 },
      ],
    },
    {
      _id: "lead-2",
      teamName: "Neural Forge",
      eventTitle: "24-Hour Hackathon Sprint",
      eventId: "arena-1",
      totalScore: 910,
      rank: 2,
      scores: [
        { category: "Innovation & Architecture", baseScore: 460, timeBonus: 30, hintPenalty: 0 },
        { category: "Execution & UI Polish", baseScore: 420, timeBonus: 0, hintPenalty: 0 },
      ],
    },
    {
      _id: "lead-3",
      teamName: "GlitchHunters",
      eventTitle: "24-Hour Hackathon Sprint",
      eventId: "arena-1",
      totalScore: 865,
      rank: 3,
      scores: [
        { category: "Innovation & Architecture", baseScore: 430, timeBonus: 20, hintPenalty: 15 },
        { category: "Execution & UI Polish", baseScore: 430, timeBonus: 0, hintPenalty: 0 },
      ],
    },
  ]);

  const [tickerLines, setTickerLines] = useState([
    "TECH TATVA PRESENTS",
    "TECHNOMANIA 3.0",
    "24-HOUR HACKATHON",
    "ESPORTS CHAMPIONSHIP",
    "CULTURAL SHOWCASE",
    "CHANDIGARH UNIVERSITY",
    "TOTAL PRIZE POOL ₹XX,XXX",
    "LIVE LEADERBOARDS",
  ]);
  const [newTickerLine, setNewTickerLine] = useState("");

  const [checkInInput, setCheckInInput] = useState("");
  const [checkInResult, setCheckInResult] = useState<string | null>(null);

  // Filter squads
  const filteredSquads = squads.filter((s) => {
    const matchesSearch =
      searchQuery === "" ||
      (s.teamName && s.teamName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      s.leadName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.leadUid && s.leadUid.toLowerCase().includes(searchQuery.toLowerCase())) ||
      s.leadEmail.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesArena = selectedArenaFilter === "all" || s.eventId === selectedArenaFilter;
    const matchesStatus = selectedStatusFilter === "all" || s.status === selectedStatusFilter;

    return matchesSearch && matchesArena && matchesStatus;
  });

  const handleExportExcel = () => {
    window.open("/api/technomania/export", "_blank");
  };

  const handleToggleRegistration = (arenaId: string) => {
    setArenas((prev) =>
      prev.map((a) => (a._id === arenaId ? { ...a, registrationOpen: !a.registrationOpen } : a))
    );
  };

  const handleSaveArena = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArena?.title) return;

    if (editingArena._id) {
      setArenas((prev) => prev.map((a) => (a._id === editingArena._id ? ({ ...a, ...editingArena } as ArenaEvent) : a)));
    } else {
      const newArena: ArenaEvent = {
        _id: `arena-${Date.now()}`,
        title: editingArena.title,
        slug: editingArena.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        category: editingArena.category || "hackathon",
        participationMode: editingArena.participationMode || "team",
        maxTeamSize: editingArena.maxTeamSize || 4,
        capacity: editingArena.capacity || 50,
        venue: editingArena.venue || "Campus Main Stage",
        status: editingArena.status || "published",
        registrationOpen: true,
        startAt: editingArena.startAt || "2026-09-15T09:00:00",
      };
      setArenas((prev) => [...prev, newArena]);
    }
    setIsArenaModalOpen(false);
    setEditingArena(null);
  };

  const handleCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    const token = checkInInput.trim().toUpperCase();
    if (!token) return;

    const found = squads.find((s) => s.qrToken.toUpperCase() === token || (s.leadUid && s.leadUid.toUpperCase() === token));
    if (found) {
      setCheckInResult(`SUCCESS: Verified Squad "${found.teamName || found.leadName}" for ${found.eventTitle}`);
    } else {
      setCheckInResult(`ERROR: No squad or ticket matching "${token}" was found.`);
    }
    setCheckInInput("");
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-white font-tm-body flex flex-col antialiased selection:bg-cyan-500 selection:text-black">
      {/* Top Cyber Command Bar */}
      <header className="sticky top-0 z-40 bg-[#0c1017]/95 backdrop-blur-xl border-b border-cyan-500/20 px-4 md:px-8 py-3.5 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
        <div className="flex items-center gap-4">
          <Link href={getHref("/")} className="group flex items-center gap-3">
            <div className="relative h-7 w-7">
              <Image
                src="/technomania/techtatva-logo.png"
                alt="Tech Tatva"
                fill
                className="object-contain drop-shadow-[0_0_10px_rgba(139,92,246,0.8)]"
              />
            </div>
            <span className="text-white/30 text-xs font-light select-none">✕</span>
            <div className="relative h-6 w-20">
              <Image
                src="/technomania/logo-emblem.png"
                alt="TM 3.0"
                fill
                className="object-contain drop-shadow-[0_0_10px_rgba(74,158,255,0.8)]"
              />
            </div>
          </Link>

          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-cyan-950/60 border border-cyan-500/30 text-[10px] font-tm-mono text-cyan-300">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-bold tracking-wider">COMMAND DESK v3.0</span>
          </div>
        </div>

        {/* Quick Nav / Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25 text-xs font-tm-mono transition-all"
          >
            <Download size={13} />
            <span className="hidden sm:inline">EXPORT EXCEL</span>
          </button>

          <Link
            href={getHref("/")}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-400 text-white/70 hover:text-white text-xs font-tm-mono transition-all"
          >
            <Eye size={13} />
            <span className="hidden sm:inline">VIEW FEST SITE</span>
            <ExternalLink size={11} />
          </Link>
        </div>
      </header>

      {/* Main Command Console Layout */}
      <div className="flex-grow flex flex-col md:flex-row">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 bg-[#0a0d14] border-r border-white/5 p-4 flex md:flex-col gap-2 overflow-x-auto shrink-0">
          {[
            { id: "overview", label: "Overview & Pulse", icon: Activity },
            { id: "arenas", label: "Arenas & Events", icon: Layers },
            { id: "squads", label: "Squads & Rosters", icon: Users },
            { id: "leaderboard", label: "Live Scoring Desk", icon: Trophy },
            { id: "ticker", label: "Marquee Broadcast", icon: Megaphone },
            { id: "checkin", label: "On-Ground Gate Check-In", icon: QrCode },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-tm-mono tracking-wide transition-all whitespace-nowrap text-left ${
                  isActive
                    ? "bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.2)] font-bold"
                    : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <Icon size={16} className={isActive ? "text-cyan-400" : "text-white/40"} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="hidden md:block mt-auto pt-6 border-t border-white/10">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] font-tm-mono text-white/40 space-y-1">
              <p className="text-white/70 font-semibold">TECHNOMANIA 3.0</p>
              <p>Chandigarh University</p>
              <p className="text-[10px] text-cyan-400">Autonomous Fest Portal</p>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full">
          {/* ═══════════════════════════════════════════════════════
              TAB: OVERVIEW
              ═══════════════════════════════════════════════════════ */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-tm-heading font-black tracking-wide uppercase text-white flex items-center gap-3">
                  <span>Festival Command Center</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                </h1>
                <p className="text-sm font-tm-mono text-cyan-200/60 mt-1">
                  Live operations, registrations, and leaderboard control suite
                </p>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "REGISTERED SQUADS", val: squads.length, icon: Users, color: "from-cyan-500/20 to-blue-500/5", border: "border-cyan-500/30", text: "text-cyan-300" },
                  { label: "TOTAL BUILDERS & PLAYERS", val: stats.totalBuilders, icon: TrendingUp, color: "from-purple-500/20 to-pink-500/5", border: "border-purple-500/30", text: "text-purple-300" },
                  { label: "ACTIVE ARENAS", val: arenas.length, icon: Layers, color: "from-amber-500/20 to-orange-500/5", border: "border-amber-500/30", text: "text-amber-300" },
                  { label: "RANKED TEAMS", val: leaderboard.length, icon: Trophy, color: "from-emerald-500/20 to-teal-500/5", border: "border-emerald-500/30", text: "text-emerald-300" },
                ].map((kpi, idx) => {
                  const Icon = kpi.icon;
                  return (
                    <div
                      key={idx}
                      className={`p-5 rounded-2xl bg-gradient-to-br ${kpi.color} border ${kpi.border} backdrop-blur-xl space-y-2`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-tm-mono font-bold tracking-widest text-white/50">{kpi.label}</span>
                        <Icon size={16} className={kpi.text} />
                      </div>
                      <p className={`text-3xl font-tm-heading font-black ${kpi.text}`}>{kpi.val}</p>
                    </div>
                  );
                })}
              </div>

              {/* Quick Actions Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Recent Registrations Preview */}
                <div className="p-6 rounded-2xl bg-[#0e131d] border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-tm-heading text-sm font-bold tracking-wide uppercase text-white flex items-center gap-2">
                      <Users size={15} className="text-cyan-400" />
                      <span>Latest Squad Signups</span>
                    </h2>
                    <button
                      onClick={() => setActiveTab("squads")}
                      className="text-xs font-tm-mono text-cyan-400 hover:underline"
                    >
                      View All →
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {squads.slice(0, 3).map((squad) => (
                      <div
                        key={squad._id}
                        onClick={() => setSelectedSquad(squad)}
                        className="p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-cyan-500/40 transition cursor-pointer flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs font-bold text-white">{squad.teamName || squad.leadName}</p>
                          <p className="text-[10px] font-tm-mono text-cyan-300/70 mt-0.5">{squad.eventTitle}</p>
                        </div>
                        <div className="text-right">
                          <span className="px-2 py-0.5 rounded text-[9px] font-tm-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {squad.members.length + 1} MEMBERS
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Arena Status Control Preview */}
                <div className="p-6 rounded-2xl bg-[#0e131d] border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-tm-heading text-sm font-bold tracking-wide uppercase text-white flex items-center gap-2">
                      <Layers size={15} className="text-purple-400" />
                      <span>Arena Registration Switches</span>
                    </h2>
                    <button
                      onClick={() => setActiveTab("arenas")}
                      className="text-xs font-tm-mono text-purple-400 hover:underline"
                    >
                      Manage →
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {arenas.map((arena) => (
                      <div
                        key={arena._id}
                        className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs font-bold text-white">{arena.title}</p>
                          <p className="text-[10px] font-tm-mono text-white/40 mt-0.5">{arena.category.toUpperCase()} · {arena.participationMode.toUpperCase()}</p>
                        </div>
                        <button
                          onClick={() => handleToggleRegistration(arena._id)}
                          className={`px-3 py-1 rounded-lg text-[10px] font-tm-mono font-bold tracking-wider transition ${
                            arena.registrationOpen
                              ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/40"
                              : "bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-emerald-500/20 hover:text-emerald-300 hover:border-emerald-500/40"
                          }`}
                        >
                          {arena.registrationOpen ? "OPEN (CLICK TO CLOSE)" : "CLOSED (CLICK TO OPEN)"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
              TAB: ARENAS & EVENTS
              ═══════════════════════════════════════════════════════ */}
          {activeTab === "arenas" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-tm-heading font-black tracking-wide uppercase text-white">
                    Arenas & Tournaments
                  </h1>
                  <p className="text-xs font-tm-mono text-white/50 mt-1">
                    Manage 24H Hackathon, Esports matches, and cultural stage specifications
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingArena({
                      category: "hackathon",
                      participationMode: "team",
                      maxTeamSize: 4,
                      status: "published",
                      registrationOpen: true,
                    });
                    setIsArenaModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-tm-mono font-bold text-xs shadow-[0_0_20px_rgba(6,182,212,0.4)] transition"
                >
                  <Plus size={15} />
                  <span>NEW ARENA / EVENT</span>
                </button>
              </div>

              {/* Arenas Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                {arenas.map((arena) => (
                  <div
                    key={arena._id}
                    className="p-6 rounded-2xl bg-[#0e131d] border border-white/10 hover:border-cyan-500/30 transition space-y-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="px-2 py-0.5 rounded text-[9px] font-tm-mono bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 uppercase">
                          {arena.category}
                        </span>
                        <h3 className="font-tm-heading text-lg font-bold text-white mt-2">{arena.title}</h3>
                        <p className="text-xs font-tm-mono text-white/40 mt-1 flex items-center gap-2">
                          <MapPin size={13} className="text-cyan-400" />
                          <span>{arena.venue || "Main Campus Complex"}</span>
                        </p>
                      </div>

                      <button
                        onClick={() => handleToggleRegistration(arena._id)}
                        className={`shrink-0 px-2.5 py-1 rounded text-[10px] font-tm-mono font-bold ${
                          arena.registrationOpen
                            ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300"
                            : "bg-red-500/20 border border-red-500/40 text-red-300"
                        }`}
                      >
                        {arena.registrationOpen ? "OPEN" : "CLOSED"}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/5 text-[11px] font-tm-mono text-white/60">
                      <div>
                        <span className="text-white/30 block text-[9px]">MODE:</span>
                        <span>{arena.participationMode.toUpperCase()} (Max: {arena.maxTeamSize})</span>
                      </div>
                      <div>
                        <span className="text-white/30 block text-[9px]">CAPACITY:</span>
                        <span>{arena.capacity || "Unlimited"}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        onClick={() => {
                          setEditingArena(arena);
                          setIsArenaModalOpen(true);
                        }}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => setArenas((prev) => prev.filter((a) => a._id !== arena._id))}
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
              TAB: SQUADS & REGISTRATIONS
              ═══════════════════════════════════════════════════════ */}
          {activeTab === "squads" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-tm-heading font-black tracking-wide uppercase text-white">
                    Squad Roster & Dossiers
                  </h1>
                  <p className="text-xs font-tm-mono text-white/50 mt-1">
                    Search and inspect registered squads, leader university UIDs, and contact info
                  </p>
                </div>

                <button
                  onClick={handleExportExcel}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-tm-mono font-bold text-xs shadow-[0_0_20px_rgba(16,185,129,0.4)] transition"
                >
                  <Download size={15} />
                  <span>EXPORT STUDENTMEMBERS.XLSX</span>
                </button>
              </div>

              {/* Filters & Search */}
              <div className="grid sm:grid-cols-[1fr_200px_160px] gap-3">
                <div className="relative">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search squad name, leader, UID, email..."
                    className="w-full bg-[#0e131d] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs font-tm-mono text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <select
                  value={selectedArenaFilter}
                  onChange={(e) => setSelectedArenaFilter(e.target.value)}
                  className="bg-[#0e131d] border border-white/10 rounded-xl px-3 py-2.5 text-xs font-tm-mono text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="all">All Arenas</option>
                  {arenas.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.title}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="bg-[#0e131d] border border-white/10 rounded-xl px-3 py-2.5 text-xs font-tm-mono text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="all">All Status</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="waitlisted">Waitlisted</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Squads Table */}
              <div className="bg-[#0e131d] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-tm-mono">
                    <thead className="bg-white/[0.02] border-b border-white/10 text-white/50 text-[10px] uppercase tracking-wider">
                      <tr>
                        <th className="py-3.5 px-4">SQUAD / PARTICIPANT</th>
                        <th className="py-3.5 px-4">ARENA</th>
                        <th className="py-3.5 px-4">LEADER UID & PHONE</th>
                        <th className="py-3.5 px-4">ROSTER SIZE</th>
                        <th className="py-3.5 px-4">STATUS</th>
                        <th className="py-3.5 px-4 text-right">DOSSIER</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredSquads.map((squad) => (
                        <tr
                          key={squad._id}
                          className="hover:bg-white/[0.02] transition"
                        >
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-white">{squad.teamName || squad.leadName}</p>
                            <p className="text-[10px] text-white/40">{squad.leadEmail}</p>
                          </td>
                          <td className="py-3.5 px-4 text-cyan-300 font-medium">
                            {squad.eventTitle}
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="text-white/80">{squad.leadUid || "N/A"}</p>
                            <p className="text-[10px] text-white/40">{squad.leadPhone || "N/A"}</p>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/70 text-[10px]">
                              {squad.members.length + 1} Members
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold uppercase">
                              {squad.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setSelectedSquad(squad)}
                              className="px-3 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:text-white transition text-[11px]"
                            >
                              Inspect Dossier →
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
              TAB: LIVE SCORING DESK
              ═══════════════════════════════════════════════════════ */}
          {activeTab === "leaderboard" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-tm-heading font-black tracking-wide uppercase text-white">
                    Live Scoring Desk
                  </h1>
                  <p className="text-xs font-tm-mono text-white/50 mt-1">
                    Manage real-time points, bonuses, and rankings on public fest leaderboards
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingScore({
                      totalScore: 0,
                      scores: [{ category: "Phase 1 Sprint", baseScore: 100, timeBonus: 0, hintPenalty: 0 }],
                    });
                    setIsScoreModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-tm-mono font-bold text-xs shadow-[0_0_20px_rgba(245,158,11,0.4)] transition"
                >
                  <Plus size={15} />
                  <span>ADD SQUAD SCORE</span>
                </button>
              </div>

              {/* Leaderboard Table */}
              <div className="bg-[#0e131d] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                <table className="w-full text-left text-xs font-tm-mono">
                  <thead className="bg-white/[0.02] border-b border-white/10 text-white/50 text-[10px] uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">RANK</th>
                      <th className="py-3.5 px-4">TEAM / SQUAD</th>
                      <th className="py-3.5 px-4">ARENA</th>
                      <th className="py-3.5 px-4">ROUNDS & BONUSES</th>
                      <th className="py-3.5 px-4 text-right">TOTAL SCORE</th>
                      <th className="py-3.5 px-4 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {leaderboard.map((team, idx) => (
                      <tr key={team._id} className="hover:bg-white/[0.02] transition">
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md font-tm-heading font-black text-xs ${
                            idx === 0 ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" :
                            idx === 1 ? "bg-slate-400/20 text-slate-300 border border-slate-400/40" :
                            idx === 2 ? "bg-amber-800/20 text-amber-500 border border-amber-800/40" :
                            "bg-white/5 text-white/60"
                          }`}>
                            {idx + 1}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-white">{team.teamName}</td>
                        <td className="py-3.5 px-4 text-cyan-300">{team.eventTitle}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1">
                            {team.scores.map((s, si) => (
                              <span key={si} className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-white/70">
                                {s.category}: {s.baseScore + s.timeBonus - s.hintPenalty}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right font-tm-heading font-black text-amber-400 text-sm">
                          {team.totalScore} pts
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              setEditingScore(team);
                              setIsScoreModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition"
                          >
                            Update
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
              TAB: MARQUEE BROADCAST
              ═══════════════════════════════════════════════════════ */}
          {activeTab === "ticker" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-tm-heading font-black tracking-wide uppercase text-white">
                  Live Marquee Broadcast Ticker
                </h1>
                <p className="text-xs font-tm-mono text-white/50 mt-1">
                  Control the infinite scrolling announcements visible at the top of the entire festival website
                </p>
              </div>

              {/* Add New Line */}
              <div className="p-6 rounded-2xl bg-[#0e131d] border border-white/10 space-y-4">
                <h3 className="font-tm-heading text-xs font-bold text-cyan-300 uppercase tracking-wider">
                  Push New Announcement to Banner
                </h3>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newTickerLine}
                    onChange={(e) => setNewTickerLine(e.target.value)}
                    placeholder="e.g. HACKATHON ROUND 1 SUBMISSIONS CLOSE IN 30 MINUTES · CHECK ARENA DESK"
                    className="flex-grow bg-[#07090e] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-tm-mono text-white focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    onClick={() => {
                      if (!newTickerLine.trim()) return;
                      setTickerLines((prev) => [...prev, newTickerLine.trim()]);
                      setNewTickerLine("");
                    }}
                    className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-tm-mono font-bold text-xs transition shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                  >
                    ADD BROADCAST
                  </button>
                </div>
              </div>

              {/* Active Ticker List */}
              <div className="space-y-2">
                <h3 className="font-tm-mono text-xs text-white/40 uppercase tracking-wider">
                  Active Scrolling Phrases ({tickerLines.length})
                </h3>
                {tickerLines.map((line, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#0e131d] border border-white/5 flex items-center justify-between text-xs font-tm-mono"
                  >
                    <span className="text-white/80">{line}</span>
                    <button
                      onClick={() => setTickerLines((prev) => prev.filter((_, i) => i !== idx))}
                      className="p-1.5 rounded-md hover:bg-red-500/20 text-red-400 transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
              TAB: ON-GROUND GATE CHECK-IN
              ═══════════════════════════════════════════════════════ */}
          {activeTab === "checkin" && (
            <div className="space-y-6 max-w-xl mx-auto">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 mx-auto flex items-center justify-center text-cyan-300">
                  <QrCode size={24} />
                </div>
                <h1 className="text-2xl font-tm-heading font-black tracking-wide uppercase text-white">
                  Gate & Arena Verification
                </h1>
                <p className="text-xs font-tm-mono text-white/50">
                  Scan QR token or type Student UID to verify entry pass
                </p>
              </div>

              <form onSubmit={handleCheckIn} className="p-6 rounded-2xl bg-[#0e131d] border border-white/10 space-y-4">
                <div>
                  <label className="block text-[10px] font-tm-mono text-white/50 mb-1">
                    ENTER QR TOKEN CODE OR UNIVERSITY UID
                  </label>
                  <input
                    type="text"
                    value={checkInInput}
                    onChange={(e) => setCheckInInput(e.target.value)}
                    placeholder="e.g. TM3-HK-99214 or 22BCS10145"
                    className="w-full bg-[#07090e] border border-white/10 rounded-xl px-4 py-3 text-sm font-tm-mono text-white uppercase focus:outline-none focus:border-cyan-400"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-tm-mono font-bold text-xs transition shadow-[0_0_25px_rgba(6,182,212,0.4)]"
                >
                  VERIFY PASS & MARK ENTRY
                </button>
              </form>

              {checkInResult && (
                <div
                  className={`p-4 rounded-xl text-xs font-tm-mono ${
                    checkInResult.startsWith("SUCCESS")
                      ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
                      : "bg-red-500/15 border border-red-500/30 text-red-300"
                  }`}
                >
                  {checkInResult}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ═══════════════════════════════════════════════════════
          MODAL: SQUAD DOSSIER
          ═══════════════════════════════════════════════════════ */}
      {selectedSquad && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#0c1017] border border-cyan-500/40 rounded-2xl p-6 md:p-8 space-y-6 shadow-[0_0_50px_rgba(0,0,0,0.9)] max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-tm-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {selectedSquad.eventTitle}
                </span>
                <h2 className="text-xl font-tm-heading font-bold text-white mt-2">
                  {selectedSquad.teamName || selectedSquad.leadName}
                </h2>
                <p className="text-xs font-tm-mono text-white/50">Ticket Token: {selectedSquad.qrToken}</p>
              </div>
              <button
                onClick={() => setSelectedSquad(null)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70"
              >
                <X size={18} />
              </button>
            </div>

            {/* Leader Info */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
              <span className="text-[10px] font-tm-mono font-bold text-cyan-400 uppercase tracking-wider">
                SQUAD LEADER / MAIN PARTICIPANT
              </span>
              <div className="grid sm:grid-cols-2 gap-3 text-xs font-tm-mono">
                <div>
                  <span className="text-white/40 block text-[10px]">NAME:</span>
                  <span className="text-white font-bold">{selectedSquad.leadName}</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px]">UNIVERSITY UID:</span>
                  <span className="text-white">{selectedSquad.leadUid || "N/A"}</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px]">EMAIL:</span>
                  <span className="text-white">{selectedSquad.leadEmail}</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px]">PHONE:</span>
                  <span className="text-white">{selectedSquad.leadPhone || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Team Members List */}
            {selectedSquad.members.length > 0 && (
              <div className="space-y-3">
                <span className="text-[10px] font-tm-mono font-bold text-white/50 uppercase tracking-wider">
                  TEAM ROSTER ({selectedSquad.members.length} MEMBERS)
                </span>
                <div className="space-y-2">
                  {selectedSquad.members.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs font-tm-mono"
                    >
                      <div>
                        <p className="font-bold text-white">{m.name}</p>
                        <p className="text-[10px] text-white/40">{m.email}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-cyan-300 font-bold">{m.uid || "N/A"}</span>
                        <p className="text-[10px] text-white/40">{m.program || "Student"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => setSelectedSquad(null)}
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-tm-mono font-bold text-xs transition"
              >
                CLOSE DOSSIER
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          MODAL: EDIT / CREATE ARENA
          ═══════════════════════════════════════════════════════ */}
      {isArenaModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveArena}
            className="w-full max-w-lg bg-[#0c1017] border border-cyan-500/40 rounded-2xl p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-tm-heading font-bold text-white">
                {editingArena?._id ? "Edit Arena Details" : "Create New Festival Arena"}
              </h2>
              <button
                type="button"
                onClick={() => setIsArenaModalOpen(false)}
                className="p-1 text-white/50 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="block text-[10px] font-tm-mono text-white/50 mb-1">ARENA / EVENT TITLE</label>
              <input
                type="text"
                value={editingArena?.title || ""}
                onChange={(e) => setEditingArena((p) => ({ ...p, title: e.target.value }))}
                required
                className="w-full bg-[#07090e] border border-white/10 rounded-xl px-3 py-2 text-xs font-tm-mono text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-tm-mono text-white/50 mb-1">CATEGORY</label>
                <select
                  value={editingArena?.category || "hackathon"}
                  onChange={(e) => setEditingArena((p) => ({ ...p, category: e.target.value }))}
                  className="w-full bg-[#07090e] border border-white/10 rounded-xl px-3 py-2 text-xs font-tm-mono text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="hackathon">Hackathon</option>
                  <option value="esports">Esports</option>
                  <option value="cultural">Cultural</option>
                  <option value="sub-event">Sub-Event</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-tm-mono text-white/50 mb-1">MODE</label>
                <select
                  value={editingArena?.participationMode || "team"}
                  onChange={(e) => setEditingArena((p) => ({ ...p, participationMode: e.target.value as any }))}
                  className="w-full bg-[#07090e] border border-white/10 rounded-xl px-3 py-2 text-xs font-tm-mono text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="team">Team Based</option>
                  <option value="individual">Individual Solo</option>
                  <option value="both">Both</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-tm-mono text-white/50 mb-1">MAX TEAM SIZE</label>
                <input
                  type="number"
                  value={editingArena?.maxTeamSize || 4}
                  onChange={(e) => setEditingArena((p) => ({ ...p, maxTeamSize: Number(e.target.value) }))}
                  className="w-full bg-[#07090e] border border-white/10 rounded-xl px-3 py-2 text-xs font-tm-mono text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-tm-mono text-white/50 mb-1">CAPACITY</label>
                <input
                  type="number"
                  value={editingArena?.capacity || 60}
                  onChange={(e) => setEditingArena((p) => ({ ...p, capacity: Number(e.target.value) }))}
                  className="w-full bg-[#07090e] border border-white/10 rounded-xl px-3 py-2 text-xs font-tm-mono text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-tm-mono text-white/50 mb-1">VENUE / COMPLEX</label>
              <input
                type="text"
                value={editingArena?.venue || ""}
                onChange={(e) => setEditingArena((p) => ({ ...p, venue: e.target.value }))}
                placeholder="e.g. Auditorium / Lab 3"
                className="w-full bg-[#07090e] border border-white/10 rounded-xl px-3 py-2 text-xs font-tm-mono text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsArenaModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-tm-mono text-white/60 hover:text-white"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-tm-mono font-bold text-xs transition"
              >
                SAVE ARENA
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
