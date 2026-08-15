"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Zap,
  Calendar,
  Users,
  Trophy,
  Download,
  Plus,
  Search,
  ExternalLink,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Gamepad2,
  Code,
  Music,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Sliders,
  ChevronRight,
  Radio,
  Bell,
  Layers,
  ArrowUpRight
} from "lucide-react";

interface TechnomaniaAdminPortalProps {
  data: any;
  openDrawer: (drawer: any) => void;
  setPanel: (msg: string) => void;
  refresh: () => void;
  patch: (resource: any, item: any, body: Record<string, any>, message: string) => Promise<void>;
  remove: (resource: any, id: string) => Promise<void>;
}

export function TechnomaniaAdminPortal({
  data,
  openDrawer,
  setPanel,
  refresh,
  patch,
  remove
}: TechnomaniaAdminPortalProps) {
  const [subTab, setSubTab] = useState<"overview" | "arenas" | "squads" | "leaderboard" | "ticker" | "settings">("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArenaFilter, setSelectedArenaFilter] = useState("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
  const [selectedReg, setSelectedReg] = useState<any | null>(null);

  // All events matching Technomania
  const tmEvents = useMemo(() => {
    return (data.events || []).filter((e: any) => {
      return e.fest === "technomania" || ["hackathon", "esports", "cultural", "sub-events"].includes(e.category?.toLowerCase());
    });
  }, [data.events]);

  const tmEventIds = useMemo(() => new Set(tmEvents.map((e: any) => String(e._id || e.id))), [tmEvents]);

  // All registrations for Technomania events
  const tmRegistrations = useMemo(() => {
    return (data.registrations || data.eventRegistrations || []).filter((r: any) => {
      const eventId = String(r.event?._id || r.event?.id || r.event);
      return tmEventIds.has(eventId) || r.event?.fest === "technomania";
    });
  }, [data.registrations, data.eventRegistrations, tmEventIds]);

  // All leaderboard entries for Technomania events
  const tmLeaderboard = useMemo(() => {
    return (data.leaderboardEntries || []).filter((entry: any) => {
      const eventId = String(entry.event?._id || entry.event?.id || entry.event);
      return tmEventIds.has(eventId) || entry.event?.fest === "technomania";
    });
  }, [data.leaderboardEntries, tmEventIds]);

  // Statistics calculation
  const totalSquads = tmRegistrations.length;
  const totalMembers = useMemo(() => {
    return tmRegistrations.reduce((acc: number, reg: any) => {
      const memberCount = Array.isArray(reg.teamMembers) ? reg.teamMembers.length : 0;
      return acc + 1 + memberCount;
    }, 0);
  }, [tmRegistrations]);

  const liveArenasCount = tmEvents.filter((e: any) => ["published", "active"].includes(e.status)).length;

  // Filtered registrations
  const filteredSquads = useMemo(() => {
    return tmRegistrations.filter((reg: any) => {
      const eventId = String(reg.event?._id || reg.event?.id || reg.event);
      const matchesArena = selectedArenaFilter === "all" || eventId === selectedArenaFilter;
      const matchesStatus = selectedStatusFilter === "all" || reg.status === selectedStatusFilter;

      const q = searchQuery.toLowerCase();
      const squadName = (reg.teamName || "").toLowerCase();
      const leaderName = (reg.user?.name || "").toLowerCase();
      const leaderEmail = (reg.user?.email || "").toLowerCase();
      const leaderUid = (reg.user?.uid || "").toLowerCase();
      const leaderPhone = (reg.user?.phone || "").toLowerCase();

      const memberMatch = Array.isArray(reg.teamMembers) && reg.teamMembers.some((m: any) => {
        const u = m.user || m;
        return (u.name || "").toLowerCase().includes(q) ||
               (u.email || "").toLowerCase().includes(q) ||
               (u.uid || "").toLowerCase().includes(q);
      });

      const matchesSearch = !q || squadName.includes(q) || leaderName.includes(q) || leaderEmail.includes(q) || leaderUid.includes(q) || leaderPhone.includes(q) || memberMatch;

      return matchesArena && matchesStatus && matchesSearch;
    });
  }, [tmRegistrations, selectedArenaFilter, selectedStatusFilter, searchQuery]);

  const handleCreateArena = () => {
    openDrawer({
      title: "Create Technomania 3.0 Arena",
      resource: "events",
      defaults: {
        fest: "technomania",
        status: "published",
        registrationOpen: true,
        category: "hackathon",
        participationMode: "team",
        maxTeamSize: 4
      },
      fields: [
        ["title", "Arena / Event Title"],
        ["slug", "Slug (e.g. code-storm-24h)"],
        ["description", "Description"],
        ["category", "Category (hackathon / esports / cultural / sub-events)"],
        ["venue", "Arena Venue / Stage"],
        ["capacity", "Max Capacity", "number"],
        ["participationMode", "Mode", "participation-select"],
        ["maxTeamSize", "Max Team Size", "number"],
        ["status", "Status", "status-select"],
        ["registrationOpen", "Registration Open", "boolean-select"],
        ["startAt", "Kickoff Date/Time", "datetime-local"],
        ["endAt", "Ending Date/Time", "datetime-local"],
        ["banner", "Event Banner URL", "upload:image"],
        ["certEventLogo", "Emblem Logo", "upload:image"],
        ["whatsappGroupLink", "Squad WhatsApp / Discord Link"],
        ["rules", "Rules & Guidelines (one per line)"]
      ]
    });
  };

  const handleEditArena = (event: any) => {
    openDrawer({
      title: `Edit ${event.title}`,
      resource: "events",
      item: event,
      fields: [
        ["title", "Arena / Event Title"],
        ["slug", "Slug"],
        ["description", "Description"],
        ["category", "Category"],
        ["venue", "Arena Venue"],
        ["capacity", "Capacity", "number"],
        ["participationMode", "Mode", "participation-select"],
        ["maxTeamSize", "Max Team Size", "number"],
        ["status", "Status", "status-select"],
        ["registrationOpen", "Registration Open", "boolean-select"],
        ["startAt", "Kickoff Date/Time", "datetime-local"],
        ["endAt", "Ending Date/Time", "datetime-local"],
        ["banner", "Event Banner URL", "upload:image"],
        ["whatsappGroupLink", "Squad WhatsApp Link"]
      ]
    });
  };

  return (
    <div className="space-y-6">
      {/* ═══════════════════════════════════════════════════════
          TECHNOMANIA 3.0 FESTIVAL COMMAND HEADER
          ═══════════════════════════════════════════════════════ */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0a1224] via-[#0f172a] to-[#1a0f2e] border border-cyan-500/30 backdrop-blur-2xl shadow-[0_0_40px_rgba(74,158,255,0.15)] overflow-hidden">
        {/* Ambient Neon Backlights */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-mono text-[11px] font-bold tracking-wider">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                FESTIVAL COMMAND CENTER
              </span>
              <span className="text-white/30 text-xs font-mono">BUILD V3.0 // 2026</span>
            </div>

            <div className="flex items-center gap-4 pt-1">
              <div className="relative h-10 w-10 shrink-0">
                <Image
                  src="/technomania/techtatva-logo.png"
                  alt="Tech Tatva Logo"
                  fill
                  className="object-contain drop-shadow-[0_0_15px_rgba(139,92,246,0.6)]"
                />
              </div>
              <span className="text-white/30 text-base font-mono">✕</span>
              <div className="relative h-9 w-32 shrink-0">
                <Image
                  src="/technomania/logo-emblem.png"
                  alt="TM 3.0 Logo"
                  fill
                  className="object-contain drop-shadow-[0_0_15px_rgba(74,158,255,0.6)]"
                />
              </div>
              <h1 className="text-xl sm:text-2xl font-black font-tm-heading tracking-wide uppercase text-white hidden sm:inline">
                CONTROL PORTAL
              </h1>
            </div>
            <p className="text-xs text-white/60 font-mono">
              Live registration management, arena configurations, leaderboards, and broadcast controls for Technomania 3.0.
            </p>
          </div>

          {/* Quick Action Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/technomania"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white font-mono text-xs font-bold tracking-wider transition-all hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(74,158,255,0.3)]"
            >
              <ExternalLink size={14} className="text-cyan-400" />
              <span>LIVE SITE</span>
            </a>

            <a
              href="/api/technomania/export"
              download
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-green-500/40 bg-green-500/10 hover:bg-green-500/20 text-green-300 font-mono text-xs font-bold tracking-wider transition-all shadow-[0_0_20px_rgba(34,197,94,0.2)]"
            >
              <Download size={14} />
              <span>EXPORT SQUADS (EXCEL)</span>
            </a>

            <button
              onClick={handleCreateArena}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-mono text-xs font-bold tracking-wider transition-all shadow-[0_0_25px_rgba(74,158,255,0.4)]"
            >
              <Plus size={15} />
              <span>ADD FEST ARENA</span>
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: "overview", label: "OVERVIEW & KPIS", icon: Zap },
            { id: "arenas", label: "ARENAS & EVENTS", icon: Calendar, badge: tmEvents.length },
            { id: "squads", label: "SQUADS & REGISTRATIONS", icon: Users, badge: tmRegistrations.length },
            { id: "leaderboard", label: "LEADERBOARD & ROUNDS", icon: Trophy, badge: tmLeaderboard.length },
            { id: "ticker", label: "BROADCASTS & TICKER", icon: Bell },
            { id: "settings", label: "FEST CONFIGURATION", icon: Sliders },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = subTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSubTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wider uppercase whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600/40 via-cyan-500/30 to-blue-600/40 border border-cyan-400 text-white shadow-[0_0_20px_rgba(56,189,248,0.4)]"
                    : "border border-transparent text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon size={14} className={isActive ? "text-cyan-400" : "text-white/40"} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${isActive ? "bg-cyan-400 text-black font-bold" : "bg-white/10 text-white/60"}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          TAB 1: OVERVIEW & LIVE KPIS
          ═══════════════════════════════════════════════════════ */}
      {subTab === "overview" && (
        <div className="space-y-6">
          {/* 4 Cyber Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "REGISTERED SQUADS", value: totalSquads, sub: "Pan-India Registrations", icon: Users, color: "text-blue-400", border: "border-blue-500/30", bg: "from-blue-600/20 to-blue-900/5" },
              { label: "TOTAL BUILDERS / PLAYERS", value: totalMembers, sub: "Squad Members + Solo", icon: Zap, color: "text-cyan-400", border: "border-cyan-500/30", bg: "from-cyan-600/20 to-cyan-900/5" },
              { label: "ACTIVE FEST ARENAS", value: liveArenasCount, sub: `${tmEvents.length} Total Configured`, icon: Calendar, color: "text-purple-400", border: "border-purple-500/30", bg: "from-purple-600/20 to-purple-900/5" },
              { label: "LIVE LEADERBOARD TEAMS", value: tmLeaderboard.length, sub: "Competitive Standings", icon: Trophy, color: "text-amber-400", border: "border-amber-500/30", bg: "from-amber-600/20 to-amber-900/5" },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className={`p-6 rounded-2xl bg-gradient-to-b ${card.bg} border ${card.border} backdrop-blur-xl shadow-lg relative overflow-hidden group`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-mono text-white/50 tracking-widest uppercase">{card.label}</span>
                    <Icon size={18} className={card.color} />
                  </div>
                  <p className="text-3xl sm:text-4xl font-black font-tm-heading text-white tracking-tight">
                    {card.value}
                  </p>
                  <p className="text-xs text-white/40 mt-1 font-mono">{card.sub}</p>
                </div>
              );
            })}
          </div>

          {/* Arenas Quick Snapshot */}
          <div className="p-6 rounded-3xl bg-black/60 border border-white/10 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-tm-heading text-lg font-bold text-white uppercase tracking-wider">
                  Configured Arenas & Registration Counts
                </h3>
                <p className="text-xs text-white/50 font-mono">Overview of each arena and current squad fill rate</p>
              </div>
              <button
                onClick={() => setSubTab("arenas")}
                className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>MANAGE ALL ARENAS</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {tmEvents.map((evt: any) => {
                const count = tmRegistrations.filter((r: any) => String(r.event?._id || r.event?.id || r.event) === String(evt._id)).length;
                const capacity = evt.capacity || 100;
                const pct = Math.min(100, Math.round((count / capacity) * 100));

                return (
                  <div
                    key={evt._id}
                    className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-cyan-400/50 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-white/10 text-cyan-300 border border-cyan-500/30">
                        {evt.category || "General"}
                      </span>
                      <span className={`text-[10px] font-mono font-bold uppercase ${evt.status === "active" ? "text-green-400" : "text-amber-400"}`}>
                        ● {evt.status}
                      </span>
                    </div>

                    <h4 className="font-tm-heading text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {evt.title}
                    </h4>
                    <p className="text-xs text-white/40 font-mono mt-1">Venue: {evt.venue || "TBA"}</p>

                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-white/40 uppercase">SQUADS: </span>
                        <span className="text-xs font-mono font-bold text-white">{count} / {capacity}</span>
                      </div>
                      <span className="text-[10px] font-mono text-cyan-400 font-bold">{pct}% FULL</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          TAB 2: ARENAS & EVENTS CRUD
          ═══════════════════════════════════════════════════════ */}
      {subTab === "arenas" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-tm-heading text-xl font-bold text-white uppercase tracking-wider">
                Technomania 3.0 Arenas ({tmEvents.length})
              </h3>
              <p className="text-xs text-white/50 font-mono">Create, publish, edit and manage festival arenas and tournaments.</p>
            </div>
            <button
              onClick={handleCreateArena}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono text-xs font-bold tracking-wider transition-all"
            >
              <Plus size={15} />
              <span>ADD NEW ARENA</span>
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tmEvents.map((evt: any) => {
              const regCount = tmRegistrations.filter((r: any) => String(r.event?._id || r.event?.id || r.event) === String(evt._id)).length;

              return (
                <div
                  key={evt._id}
                  className="p-6 rounded-2xl bg-black/60 border border-white/10 hover:border-cyan-400/50 backdrop-blur-xl flex flex-col justify-between group transition-all relative overflow-hidden"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                        {evt.category || "General"}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        evt.status === "active"
                          ? "bg-green-500/20 text-green-300 border border-green-500/40"
                          : evt.status === "published"
                          ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                          : "bg-white/10 text-white/50 border border-white/15"
                      }`}>
                        {evt.status}
                      </span>
                    </div>

                    <h4 className="font-tm-heading text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {evt.title}
                    </h4>

                    <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">
                      {evt.description || "No description provided."}
                    </p>

                    <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] font-mono text-white/50">
                      <div>📍 Venue: <span className="text-white">{evt.venue || "TBA"}</span></div>
                      <div>👥 Mode: <span className="text-white">{evt.participationMode || "team"}</span></div>
                      <div>⚡ Max Team: <span className="text-white">{evt.maxTeamSize || 1}</span></div>
                      <div>🎟️ Registered: <span className="text-cyan-300 font-bold">{regCount}</span></div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditArena(evt)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-colors"
                        title="Edit Arena"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm(`Are you sure you want to delete ${evt.title}?`)) {
                            await remove("events", String(evt._id));
                            setPanel(`Deleted ${evt.title}`);
                            refresh();
                          }
                        }}
                        className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-colors"
                        title="Delete Arena"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedArenaFilter(String(evt._id));
                        setSubTab("squads");
                      }}
                      className="text-xs font-mono font-bold text-cyan-400 hover:text-white flex items-center gap-1"
                    >
                      <span>VIEW SQUADS ({regCount})</span>
                      <ArrowUpRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          TAB 3: SQUADS & REGISTRATIONS
          ═══════════════════════════════════════════════════════ */}
      {subTab === "squads" && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="p-5 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 min-w-64">
                <Search size={15} className="text-white/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search squad, leader, UID, email..."
                  className="bg-transparent text-xs font-mono text-white placeholder:text-white/30 outline-none w-full"
                />
              </label>

              {/* Arena Filter */}
              <select
                value={selectedArenaFilter}
                onChange={(e) => setSelectedArenaFilter(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-black/80 border border-white/10 text-xs font-mono text-white outline-none focus:border-cyan-400"
              >
                <option value="all">All Fest Arenas ({tmRegistrations.length})</option>
                {tmEvents.map((e: any) => (
                  <option key={e._id} value={String(e._id)}>
                    {e.title}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-black/80 border border-white/10 text-xs font-mono text-white outline-none focus:border-cyan-400"
              >
                <option value="all">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="waitlisted">Waitlisted</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-white/50">
                Found {filteredSquads.length} squad{filteredSquads.length !== 1 ? "s" : ""}
              </span>
              <a
                href={selectedArenaFilter !== "all" ? `/api/technomania/export?event=${selectedArenaFilter}` : "/api/technomania/export"}
                download
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-green-500/40 bg-green-500/10 hover:bg-green-500/20 text-green-300 font-mono text-xs font-bold transition-all"
              >
                <Download size={13} />
                <span>EXPORT FILTERED</span>
              </a>
            </div>
          </div>

          {/* Squads Table */}
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-white/5 text-[11px] text-white/50 uppercase tracking-wider border-b border-white/10">
                <tr>
                  <th className="p-4">Squad / Leader</th>
                  <th className="p-4">Arena / Track</th>
                  <th className="p-4">UID / College Info</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Members</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80">
                {filteredSquads.length > 0 ? (
                  filteredSquads.map((reg: any) => {
                    const memberList = Array.isArray(reg.teamMembers) ? reg.teamMembers : [];
                    const isTeam = reg.mode === "team";

                    return (
                      <tr key={reg._id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-white text-sm font-tm-heading">
                            {isTeam ? (reg.teamName || "Unnamed Squad") : (reg.user?.name || "Solo Builder")}
                          </div>
                          {isTeam && (
                            <div className="text-[11px] text-cyan-300 font-mono mt-0.5">
                              Leader: {reg.user?.name || "N/A"}
                            </div>
                          )}
                        </td>

                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-white font-bold">
                            {reg.event?.title || "Technomania Arena"}
                          </span>
                        </td>

                        <td className="p-4">
                          <div className="font-bold text-white">{reg.user?.uid || "N/A"}</div>
                          <div className="text-[11px] text-white/50">{reg.user?.program || "CU"} (Sem {reg.user?.semester || "-"})</div>
                        </td>

                        <td className="p-4">
                          <div className="text-white">{reg.user?.email || "N/A"}</div>
                          <div className="text-[11px] text-white/50">{reg.user?.phone || "N/A"}</div>
                        </td>

                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">
                            {1 + memberList.length} {1 + memberList.length === 1 ? "Person" : "Builders"}
                          </span>
                        </td>

                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            reg.status === "confirmed"
                              ? "bg-green-500/20 text-green-300 border border-green-500/30"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          }`}>
                            {reg.status || "confirmed"}
                          </span>
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedReg(reg)}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-400 border border-white/10"
                              title="View Squad Details"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={async () => {
                                if (confirm(`Remove squad registration?`)) {
                                  await remove("registrations", String(reg._id));
                                  setPanel("Removed squad registration.");
                                  refresh();
                                }
                              }}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-white/40 font-mono">
                      No registrations found matching your query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Squad Member Details Modal */}
          {selectedReg && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="w-full max-w-2xl rounded-3xl bg-[#0d1322] border border-cyan-500/40 p-6 sm:p-8 shadow-2xl relative space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">SQUAD DOSSIER</span>
                    <h3 className="font-tm-heading text-2xl font-bold text-white mt-0.5">
                      {selectedReg.teamName || selectedReg.user?.name}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedReg(null)}
                    className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white"
                  >
                    <XCircle size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-mono p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <div>Arena: <span className="text-white font-bold">{selectedReg.event?.title}</span></div>
                  <div>Status: <span className="text-green-400 font-bold uppercase">{selectedReg.status}</span></div>
                  <div>Registered: <span className="text-white">{new Date(selectedReg.registeredAt).toLocaleString()}</span></div>
                  <div>Mode: <span className="text-white uppercase">{selectedReg.mode}</span></div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-mono text-xs text-white/60 uppercase tracking-wider">Squad Members Roster</h4>
                  
                  {/* Leader */}
                  <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-between">
                    <div>
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-blue-500/30 text-blue-300 uppercase">
                        Squad Leader
                      </span>
                      <div className="font-bold text-white text-sm mt-1">{selectedReg.user?.name}</div>
                      <div className="text-xs text-white/60 font-mono">{selectedReg.user?.email} · {selectedReg.user?.phone}</div>
                    </div>
                    <div className="text-right font-mono text-xs">
                      <div className="text-white font-bold">{selectedReg.user?.uid}</div>
                      <div className="text-white/40">{selectedReg.user?.program}</div>
                    </div>
                  </div>

                  {/* Additional Squad Members */}
                  {Array.isArray(selectedReg.teamMembers) && selectedReg.teamMembers.map((m: any, idx: number) => {
                    const u = m.user || m;
                    return (
                      <div key={idx} className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                        <div>
                          <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-white/10 text-white/60 uppercase">
                            Member #{idx + 2}
                          </span>
                          <div className="font-bold text-white text-sm mt-1">{u.name || m.name}</div>
                          <div className="text-xs text-white/60 font-mono">{u.email || m.email} · {u.phone || m.phone || "N/A"}</div>
                        </div>
                        <div className="text-right font-mono text-xs">
                          <div className="text-white font-bold">{u.uid || m.uid}</div>
                          <div className="text-white/40">{u.program || m.program}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setSelectedReg(null)}
                    className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold"
                  >
                    Close Dossier
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          TAB 4: LEADERBOARD & ROUNDS MANAGER
          ═══════════════════════════════════════════════════════ */}
      {subTab === "leaderboard" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-tm-heading text-xl font-bold text-white uppercase tracking-wider">
                Live Leaderboards & Scoring ({tmLeaderboard.length} Squads Ranked)
              </h3>
              <p className="text-xs text-white/50 font-mono">
                Manage tournament standings, base scores, time bonuses, and hint penalties live on technomania.techtatva.in/leaderboard.
              </p>
            </div>

            <button
              onClick={() => {
                openDrawer({
                  title: "Add Squad to Live Leaderboard",
                  resource: "leaderboard",
                  fields: [
                    ["teamName", "Squad / Team Name"],
                    ["event", "Fest Arena / Event", "event-select"],
                    ["rank", "Rank #", "number"]
                  ]
                });
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-mono text-xs font-bold tracking-wider transition-all"
            >
              <Plus size={15} />
              <span>ADD TO SCOREBOARD</span>
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tmEvents.map((evt: any) => {
              const entries = tmLeaderboard.filter((e: any) => String(e.event?._id || e.event) === String(evt._id));

              return (
                <div
                  key={evt._id}
                  className="p-6 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-xl flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                      {evt.category || "ARENA"}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-white/10 text-white font-bold">
                      {entries.length} RANKED
                    </span>
                  </div>

                  <h4 className="font-tm-heading text-lg font-bold text-white">{evt.title}</h4>

                  <div className="space-y-2 pt-2">
                    {entries.slice(0, 4).map((entry: any, i: number) => (
                      <div
                        key={entry._id || i}
                        className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-xs font-mono"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            i === 0 ? "bg-amber-400 text-black" : i === 1 ? "bg-slate-300 text-black" : i === 2 ? "bg-amber-700 text-white" : "bg-white/10 text-white/60"
                          }`}>
                            {entry.rank || i + 1}
                          </span>
                          <span className="font-bold text-white truncate max-w-[140px]">{entry.teamName}</span>
                        </div>
                        <span className="text-cyan-300 font-bold">{entry.totalScore || 0} PTS</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                    <a
                      href="/technomania/leaderboard"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-mono text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <span>VIEW PUBLIC LEADERBOARD</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          TAB 5: BROADCASTS & TICKER
          ═══════════════════════════════════════════════════════ */}
      {subTab === "ticker" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-black/60 border border-white/10 backdrop-blur-xl space-y-4">
            <h3 className="font-tm-heading text-xl font-bold text-white uppercase tracking-wider">
              Top Infinite Marquee Ticker
            </h3>
            <p className="text-xs text-white/50 font-mono">
              The moving headline banner visible at the top of technomania.techtatva.in.
            </p>

            <div className="p-4 rounded-2xl bg-black border border-cyan-500/40 font-mono text-xs text-cyan-300 overflow-hidden select-none">
              <div className="flex gap-8 whitespace-nowrap animate-marquee">
                <span>/// TECH TATVA PRESENTS ///</span>
                <span>TECHNOMANIA 3.0 ///</span>
                <span>24-HOUR HACKATHON ///</span>
                <span>ESPORTS CHAMPIONSHIP ///</span>
                <span>CULTURAL SHOWCASE ///</span>
                <span>CHANDIGARH UNIVERSITY ///</span>
                <span>TOTAL PRIZE POOL ₹XX,XXX ///</span>
              </div>
            </div>

            <div className="pt-4 grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                <span className="text-[10px] font-mono text-white/40 uppercase">STATUS</span>
                <p className="text-sm font-bold text-green-400 font-mono mt-1">● STREAMING LIVE ON WEBSITE</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                <span className="text-[10px] font-mono text-white/40 uppercase">ANIMATION SPEED</span>
                <p className="text-sm font-bold text-white font-mono mt-1">30s Infinite Looping Keyframe</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          TAB 6: FEST CONFIGURATION
          ═══════════════════════════════════════════════════════ */}
      {subTab === "settings" && (
        <div className="p-8 rounded-3xl bg-black/60 border border-white/10 backdrop-blur-xl space-y-6">
          <div>
            <h3 className="font-tm-heading text-xl font-bold text-white uppercase tracking-wider">
              Technomania 3.0 Settings & Blueprint Specs
            </h3>
            <p className="text-xs text-white/50 font-mono">Festival core parameters and public presentation rules.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 text-xs font-mono">
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
              <span className="text-[10px] text-white/40 uppercase">TARGET KICKOFF DATE & COUNTDOWN</span>
              <p className="text-base font-bold text-white">September 15, 2026 — 09:00 AM IST</p>
              <p className="text-white/50">Target Date String: 2026-09-15T09:00:00+05:30</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
              <span className="text-[10px] text-white/40 uppercase">ORGANIZING ENTITY</span>
              <p className="text-base font-bold text-white">Tech Tatva Student Community</p>
              <p className="text-white/50">Chandigarh University, Mohali</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
              <span className="text-[10px] text-white/40 uppercase">SUBDOMAIN ROUTING</span>
              <p className="text-base font-bold text-cyan-300">technomania.techtatva.in</p>
              <p className="text-white/50">Middleware maps hostname to /technomania routes automatically.</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
              <span className="text-[10px] text-white/40 uppercase">DATA SEPARATION</span>
              <p className="text-base font-bold text-purple-300">Isolated Member & Squads Store</p>
              <p className="text-white/50">Strict separation between core members, student members, and fest squads.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
