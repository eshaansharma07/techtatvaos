"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { TechnomaniaOverview } from "./technomania/overview";
import { TechnomaniaArenas } from "./technomania/arenas";
import { TechnomaniaRegistrations } from "./technomania/registrations";
import { TechnomaniaLeaderboard } from "./technomania/leaderboard";
import { TechnomaniaBroadcasts } from "./technomania/broadcasts";
import { TechnomaniaConfig } from "./technomania/config";
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
      {subTab === "overview" && <TechnomaniaOverview />}

      {subTab === "arenas" && <TechnomaniaArenas />}

      {subTab === "squads" && <TechnomaniaRegistrations />}

      {subTab === "leaderboard" && <TechnomaniaLeaderboard />}

      {subTab === "ticker" && <TechnomaniaBroadcasts />}

      {subTab === "settings" && <TechnomaniaConfig />}
    </div>
  );
}
