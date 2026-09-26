import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell 
} from "recharts";
import { 
  Users, Calendar, FileText, Settings as SettingsIcon, LayoutDashboard, Download, 
  Search, Shield, CheckCircle2, ChevronRight, Edit2, Trash2, ArrowRight, ArrowUpRight, 
  Plus, X, RefreshCw, LogOut, Loader2, Sparkles, User, Copy, Eye, CopyCheck, Image as ImageIcon,
  Check, Lock, Upload, KeyRound, MessageSquare, Briefcase, Zap, Trophy, Medal, Crown, Star, Flame, Mail, Send, Activity, UserPlus, FileUp, Workflow, FileBadge, Bell, Brain, ImagePlus, UserCircle, Key, Cpu, CalendarDays, BriefcaseBusiness, Settings2, Award, PlayCircle, ChevronDown, ChevronUp, Phone, ExternalLink, PlusCircle, BarChart3, ClipboardList, Volume2, VolumeX, ChevronLeft, ArrowUpDown, SlidersHorizontal, Info
} from "lucide-react";
import { Data, Resource, Module, Field } from "../portal-client";
import { splitPortalTeams, PortalAdvisoryRow, PortalOperationsRoot, TeamLaneEditor, GalleryAssetsControl, UploadControl, headersMap, getWorkspaceStats, renderCell, playSuccessSound, playClickSound, nav, config, extraFields, settingsFields, idOf, asArray, valueOf, rawValue, teamNamesOf, memberLabel, leadRolesOf, normalizePortalData } from "../portal-client";

export function EventParticipantsDesk({ data, setPanel, refresh }: { data: Data; setPanel: (value: string) => void; refresh: () => Promise<void> }) {
  const events: any[] = data.events || [];
  const registrations: any[] = data.registrations || [];
  const eventMap = useMemo(() => new Map((events || []).map((e: any) => [idOf(e), e.title || "Untitled Event"])), [events]);

  const [query, setQuery] = useState("");
  const [selectedEventId, setSelectedEventId] = useState("all");
  const [modeFilter, setModeFilter] = useState<"all" | "team" | "individual">("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedTeamIds, setExpandedTeamIds] = useState<Record<string, boolean>>({});
  const [reapprovalBusy, setReapprovalBusy] = useState(false);
  const selectedEventObj = selectedEventId !== "all" ? events.find(e => idOf(e) === selectedEventId) : null;

  // Process registrations into structured team & individual cards
  const formattedRegistrations = useMemo(() => {
    return (registrations as any[]).map((reg: any) => {
      const regId = String(idOf(reg));
      const eventId = String(idOf(reg.event));
      const eventObj = events.find((e: any) => idOf(e) === eventId);
      const eventTitle = String(eventObj?.title || eventMap.get(eventId) || "Unknown Event");
      const mode = reg.mode === "team" ? "team" : "individual";
      const teamName = String(reg.teamName || (mode === "team" ? "Unnamed Squad" : "Individual Entry"));
      const status = String(reg.status || "confirmed");
      const registeredAt = reg.registeredAt ? new Date(reg.registeredAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "N/A";
      const leaderUser = reg.user || {};

      const leader = {
        name: String(leaderUser.name || "N/A"),
        email: String(leaderUser.email || "N/A"),
        phone: String(leaderUser.phone || "N/A"),
        uid: String(leaderUser.uid || "N/A"),
        program: String(leaderUser.program || "N/A"),
        semester: String(leaderUser.semester ?? "N/A"),
        role: mode === "team" ? "Team Leader" : "Candidate"
      };

      const members: Array<{
        name: string;
        email: string;
        phone: string;
        uid: string;
        program: string;
        semester: string;
        role: string;
      }> = [];

      if (mode === "team" && Array.isArray(reg.teamMembers)) {
        reg.teamMembers.forEach((m: any, idx: number) => {
          const u = m.user || m;
          members.push({
            name: String(m.name || u.name || "N/A"),
            email: String(m.email || u.email || "N/A"),
            phone: String(m.phone || u.phone || "N/A"),
            uid: String(m.uid || u.uid || "N/A"),
            program: String(m.program || u.program || "N/A"),
            semester: String(m.semester ?? u.semester ?? "N/A"),
            role: `Squad Member ${idx + 2}`
          });
        });
      }

      const totalSize = 1 + members.length;
      return {
        id: regId,
        eventId,
        eventTitle,
        eventObj,
        mode,
        teamName,
        status,
        registeredAt,
        reapproved: reg.reapproved,
        requireReapproval: eventObj?.requireReapproval,
        leader,
        members,
        totalSize
      };
    });
  }, [registrations, events, eventMap]);

  // Compute event stats map for fast pill indicators
  const eventStatsMap = useMemo(() => {
    const map = new Map<string, { teams: number; individuals: number; participants: number }>();
    formattedRegistrations.forEach((reg) => {
      if (!map.has(reg.eventId)) {
        map.set(reg.eventId, { teams: 0, individuals: 0, participants: 0 });
      }
      const entry = map.get(reg.eventId)!;
      if (reg.mode === "team") {
        entry.teams += 1;
        entry.participants += reg.totalSize;
      } else {
        entry.individuals += 1;
        entry.participants += 1;
      }
    });
    return map;
  }, [formattedRegistrations]);

  // Overall metrics
  const totalTeams = useMemo(() => formattedRegistrations.filter(r => r.mode === "team").length, [formattedRegistrations]);
  const totalIndividuals = useMemo(() => formattedRegistrations.filter(r => r.mode === "individual").length, [formattedRegistrations]);
  const totalParticipants = useMemo(() => formattedRegistrations.reduce((acc, r) => acc + r.totalSize, 0), [formattedRegistrations]);

  // Filtered registrations
  const filtered = useMemo(() => {
    return formattedRegistrations.filter((item) => {
      // Event filter
      if (selectedEventId !== "all" && item.eventId !== selectedEventId) return false;
      // Mode filter
      if (modeFilter !== "all" && item.mode !== modeFilter) return false;
      // Status filter
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      // Search query
      if (query.trim()) {
        const q = query.toLowerCase().trim();
        const inTeamName = item.teamName.toLowerCase().includes(q);
        const inEvent = item.eventTitle.toLowerCase().includes(q);
        const inLeader = `${item.leader.name} ${item.leader.email} ${item.leader.uid} ${item.leader.phone}`.toLowerCase().includes(q);
        const inMembers = item.members.some(m => `${m.name} ${m.email} ${m.uid} ${m.phone}`.toLowerCase().includes(q));
        if (!inTeamName && !inEvent && !inLeader && !inMembers) return false;
      }
      return true;
    });
  }, [formattedRegistrations, selectedEventId, modeFilter, statusFilter, query]);

  // Toggle card expansion
  const toggleExpand = (id: string) => {
    setExpandedTeamIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const next: Record<string, boolean> = {};
    filtered.forEach(r => { next[r.id] = true; });
    setExpandedTeamIds(next);
  };

  const collapseAll = () => {
    setExpandedTeamIds({});
  };

  const confirmDelete = async (registrationId: string, teamOrName: string) => {
    if (!window.confirm(`Are you sure you want to remove registration for "${teamOrName}"? This will delete all team members and attendance records for this entry.`)) return;
    setPanel(`Removing ${teamOrName}...`);
    try {
      const res = await fetch(`/api/admin/registrations/${encodeURIComponent(registrationId)}`, { method: "DELETE" });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPanel(result.error || "Failed to remove registration.");
        return;
      }
      await refresh();
      setPanel(`Registration for "${teamOrName}" removed successfully.`);
    } catch {
      setPanel("Network error while removing registration.");
    }
  };

  const toggleReapproval = async (action: "require" | "disable", scope?: "all" | "waitlisted") => {
    if (!selectedEventObj) return;
    if (action === "require" && !window.confirm(`Are you sure you want to require re-approval for ${scope} teams? This will reset their re-approved status to false.`)) return;
    setReapprovalBusy(true);
    setPanel(`Updating re-approval settings...`);
      
    try {
      const res = await fetch("/api/admin/reapproval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: selectedEventId, action, scope })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to update");
      await refresh();
      setPanel(`Success: ${result.message}`);
    } catch(err: any) {
      setPanel(`Error: ${err.message}`);
    } finally {
      setReapprovalBusy(false);
    }
  };

  const handlePromote = async (regId: string) => {
    if (!window.confirm("Promote this waitlisted squad to confirmed?")) return;
    setPanel("Promoting to confirmed...");
    try {
      const res = await fetch("/api/admin/reapproval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "promote", eventId: selectedEventId, registrationId: regId })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to promote");
      await refresh();
      setPanel("Squad successfully promoted to Confirmed!");
    } catch(err: any) {
      setPanel(`Error: ${err.message}`);
    }
  };

  const handleManualReapprove = async (regId: string) => {
    if (!window.confirm("Mark this squad as re-approved?")) return;
    setPanel("Marking as re-approved...");
    try {
      const res = await fetch("/api/admin/reapproval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "manual_reapprove", eventId: selectedEventId, registrationId: regId })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to mark as re-approved");
      await refresh();
      setPanel("Squad successfully marked as Re-approved!");
    } catch(err: any) {
      setPanel(`Error: ${err.message}`);
    }
  };

  const exportExcel = (forEventId?: string) => {
    const targetEvent = forEventId !== undefined ? forEventId : selectedEventId;
    const isSingleEvent = targetEvent && targetEvent !== "all";
    const url = isSingleEvent
      ? `/api/admin/participants/export?event=${encodeURIComponent(targetEvent)}`
      : "/api/admin/participants/export";
    window.open(url, "_blank");
    const eventName = isSingleEvent ? (eventMap.get(targetEvent) || "selected event") : "all events";
    setPanel(`Exporting participants for "${eventName}" to Excel...`);
  };

  // Events that have registrations, plus any other events
  const eventsWithRegistrations = useMemo(() => {
    return events.filter(e => eventStatsMap.has(idOf(e)));
  }, [events, eventStatsMap]);

  return (
    <div className="mt-7 space-y-6 animate-in fade-in duration-200">
      {/* Top Metrics Strip */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[1.7rem] border border-white/[.08] bg-[#05070d]/80 p-5 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
          <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-white/40">Total Participants</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">{totalParticipants}</span>
            <span className="text-[10px] font-mono text-purple-400">candidates</span>
          </div>
        </div>

        <div className="rounded-[1.7rem] border border-violet-500/20 bg-violet-500/[0.04] p-5 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />
          <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-violet-300/70">Teams Registered</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-violet-300 tracking-tight">{totalTeams}</span>
            <span className="text-[10px] font-mono text-violet-400/70">squads</span>
          </div>
        </div>

        <div className="rounded-[1.7rem] border border-blue-500/20 bg-blue-500/[0.04] p-5 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-blue-300/70">Individual Candidates</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-blue-300 tracking-tight">{totalIndividuals}</span>
            <span className="text-[10px] font-mono text-blue-400/70">solo</span>
          </div>
        </div>

        <div className="rounded-[1.7rem] border border-emerald-500/20 bg-emerald-500/[0.04] p-5 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-emerald-300/70">Export Roster</p>
            <p className="mt-1 text-xs text-white/50">
              {selectedEventId !== "all"
                ? `Exporting: ${eventMap.get(selectedEventId) || "Selected Event"}`
                : "Downloads all events, or select an event tab below to isolate."}
            </p>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              onClick={() => exportExcel()}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 px-3.5 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-500/30 transition shadow-sm truncate"
            >
              <Download size={13} />
              <span>{selectedEventId !== "all" ? `Download ${eventMap.get(selectedEventId)?.slice(0, 16)}...` : "Download All Events"}</span>
            </button>
            {selectedEventId !== "all" && (
              <button
                onClick={() => exportExcel("all")}
                className="inline-flex items-center justify-center gap-1 rounded-xl border border-white/10 bg-white/5 px-2.5 py-2 text-[10px] font-bold text-white/50 hover:text-white transition"
                title="Download all events without filter"
              >
                All Events
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Control Panel: Event Switcher & Filters */}
      <div className="rounded-[2rem] border border-white/[.08] bg-[#05070d]/85 p-6 backdrop-blur-xl relative overflow-hidden">
        <div className="flex flex-col gap-5">
          {/* Header & Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/20 bg-purple-500/10 px-2.5 py-1 text-[9px] font-bold text-purple-300 uppercase tracking-widest">
                <Sparkles size={10} /> ROSTER MANAGEMENT
              </span>
              <h2 className="text-xl font-extrabold text-white mt-2 tracking-tight">Event Squads & Participants</h2>
              <p className="text-xs text-white/45 mt-0.5">Click any team card to inspect the complete squad breakdown with contact info.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search Bar */}
              <div className="relative min-w-[260px] flex items-center gap-2 rounded-2xl border border-white/[.08] bg-black/40 px-4 py-2.5 text-white/50 focus-within:border-purple-500/50 transition">
                <Search size={14} className="text-purple-400/80 shrink-0" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search squad, candidate, UID, phone..."
                  className="w-full bg-transparent text-xs text-white outline-none placeholder:text-white/28 font-mono"
                />
                {query && (
                  <button onClick={() => setQuery("")} className="text-white/30 hover:text-white text-xs">
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Event Switcher Tabs */}
          <div>
            <p className="text-[9px] font-bold text-white/35 uppercase tracking-[.22em] mb-3">SELECT EVENT TO ISOLATE ROSTER</p>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => setSelectedEventId("all")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition shrink-0 border ${
                  selectedEventId === "all"
                    ? "bg-purple-500 border-purple-400 text-black shadow-[0_0_20px_rgba(168,85,247,0.25)]"
                    : "bg-black/35 border-white/[.07] text-white/60 hover:text-white hover:border-white/20"
                }`}
              >
                <span>ALL EVENTS</span>
                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-mono ${selectedEventId === "all" ? "bg-black/20 text-black font-black" : "bg-white/5 text-white/50"}`}>
                  {formattedRegistrations.length}
                </span>
              </button>

              {events.map((ev: any) => {
                const eid = idOf(ev);
                const stats = eventStatsMap.get(eid);
                const isSelected = selectedEventId === eid;
                const hasRegistrations = stats && stats.participants > 0;

                return (
                  <button
                    key={eid}
                    onClick={() => setSelectedEventId(eid)}
                    className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs font-bold transition shrink-0 border ${
                      isSelected
                        ? "bg-purple-500 border-purple-400 text-black shadow-[0_0_20px_rgba(168,85,247,0.25)]"
                        : "bg-black/35 border-white/[.07] text-white/60 hover:text-white hover:border-white/20"
                    }`}
                  >
                    <span className="truncate max-w-[180px]">{ev.title}</span>
                    {hasRegistrations ? (
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-mono ${isSelected ? "bg-black/20 text-black font-black" : "bg-purple-500/10 text-purple-300 border border-purple-500/20"}`}>
                        {stats.teams > 0 ? `${stats.teams}T` : ""}{stats.teams > 0 && stats.individuals > 0 ? " · " : ""}{stats.individuals > 0 ? `${stats.individuals}S` : ""} ({stats.participants}p)
                      </span>
                    ) : (
                      <span className={`text-[9px] ${isSelected ? "text-black/60" : "text-white/25"}`}>0</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Re-approval Admin Controls */}
          {selectedEventObj && (
            <div className="mt-1 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
              <div>
                <h3 className="text-sm font-bold text-amber-400">Waitlist & Re-approval Management</h3>
                <p className="text-[10px] text-amber-500/70 mt-0.5 max-w-lg">
                  {selectedEventObj.requireReapproval 
                    ? `Re-approval is currently REQUIRED for ${selectedEventObj.reapprovalScope} teams. Students will see a prompt to confirm attendance on the public website.`
                    : `Trigger a re-approval wave to ask waitlisted (or all) teams to confirm they are still coming.`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {selectedEventObj.requireReapproval ? (
                  <button 
                    onClick={() => toggleReapproval("disable")}
                    disabled={reapprovalBusy}
                    className="rounded-xl bg-amber-500/20 border border-amber-500/30 px-4 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/30 transition disabled:opacity-50"
                  >
                    Disable Re-approval
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={() => toggleReapproval("require", "waitlisted")}
                      disabled={reapprovalBusy}
                      className="rounded-xl bg-amber-500 border border-amber-400 px-4 py-2 text-xs font-bold text-black hover:bg-amber-400 transition shadow-[0_0_15px_rgba(245,158,11,0.2)] disabled:opacity-50"
                    >
                      Require for Waitlisted
                    </button>
                    <button 
                      onClick={() => toggleReapproval("require", "all")}
                      disabled={reapprovalBusy}
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white/70 hover:bg-white/10 hover:text-white transition disabled:opacity-50"
                    >
                      Require for All
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Secondary Filter Bar: Mode, Status, Expand/Collapse */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.05]">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Mode filter */}
              <div className="inline-flex rounded-xl bg-black/40 border border-white/[.07] p-1">
                {(["all", "team", "individual"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setModeFilter(m)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition ${
                      modeFilter === m
                        ? "bg-white/15 text-white shadow-sm"
                        : "text-white/45 hover:text-white"
                    }`}
                  >
                    {m === "all" ? "All Formats" : m === "team" ? "Teams Only" : "Individual Only"}
                  </button>
                ))}
              </div>

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-white/[.07] bg-black/40 px-3 py-2 text-xs text-white outline-none focus:border-purple-500/40 transition"
              >
                <option value="all">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="waitlisted">Waitlisted</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Quick bulk view controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={expandAll}
                className="rounded-xl border border-white/[.06] bg-white/[.02] px-3 py-1.5 text-[10px] font-bold text-white/50 hover:text-white hover:border-white/15 transition uppercase tracking-wider"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="rounded-xl border border-white/[.06] bg-white/[.02] px-3 py-1.5 text-[10px] font-bold text-white/50 hover:text-white hover:border-white/15 transition uppercase tracking-wider"
              >
                Collapse All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Squad / Participant Cards Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2 text-xs text-white/40 font-mono">
          <span>SHOWING {filtered.length} REGISTRATIONS ({filtered.reduce((acc, r) => acc + r.totalSize, 0)} TOTAL PARTICIPANTS)</span>
          {selectedEventId !== "all" && (
            <button onClick={() => setSelectedEventId("all")} className="text-purple-400 hover:underline">
              Clear event filter
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-[2.2rem] border border-white/[.08] bg-[#05070d]/60 p-12 text-center">
            <div className="mx-auto h-16 w-16 rounded-2xl border border-white/[.08] bg-white/[.02] flex items-center justify-center text-white/20 mb-4">
              <Users size={28} />
            </div>
            <h3 className="text-base font-bold text-white">No registrations match current filters</h3>
            <p className="text-xs text-white/40 mt-1 max-w-sm mx-auto leading-relaxed">
              Try choosing a different event, clearing your search query, or selecting "All Formats".
            </p>
            <button
              onClick={() => { setSelectedEventId("all"); setModeFilter("all"); setStatusFilter("all"); setQuery(""); }}
              className="mt-5 rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-xs font-bold text-purple-300 hover:bg-purple-500/20 transition"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((item) => {
              const isExpanded = !!expandedTeamIds[item.id];
              const isTeam = item.mode === "team";
              const needsReapproval = item.requireReapproval && (item.eventObj?.reapprovalScope === "all" || (item.eventObj?.reapprovalScope === "waitlisted" && item.status === "waitlisted"));

              return (
                <div
                  key={item.id}
                  className={`rounded-[2rem] border transition-all duration-300 overflow-hidden ${
                    isExpanded
                      ? "border-purple-500/40 bg-black/70 shadow-[0_10px_35px_rgba(168,85,247,0.12)] md:col-span-2"
                      : "border-white/[.08] bg-[#05070d]/80 hover:border-white/20 hover:bg-black/40"
                  }`}
                >
                  {/* Card Header */}
                  <div className="p-5 md:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                          isTeam
                            ? "border-purple-500/30 bg-purple-500/10 text-purple-300"
                            : "border-blue-500/30 bg-blue-500/10 text-blue-300"
                        }`}>
                          {isTeam ? <Users size={18} /> : <User size={18} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg font-black text-white tracking-tight">{item.teamName}</h3>
                            <span className="rounded-lg border border-purple-500/20 bg-purple-500/10 px-2.5 py-0.5 text-[8px] font-bold tracking-wider text-purple-300 uppercase">
                              {item.eventTitle}
                            </span>
                          </div>
                          <p className="text-xs text-white/50 mt-1 flex items-center gap-2">
                            <span>👑 Leader: <strong className="text-white/80">{item.leader.name}</strong></span>
                            <span className="text-white/20">·</span>
                            <span className="font-mono text-white/40">{item.leader.uid}</span>
                          </p>
                        </div>
                      </div>

                      {/* Top Right Badges & Delete */}
                      <div className="flex items-center gap-2">
                        {item.status === "waitlisted" && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handlePromote(item.id); }}
                            className="h-8 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 text-[10px] font-bold text-emerald-300 hover:bg-emerald-500/20 flex items-center transition"
                            title="Promote to Confirmed"
                          >
                            Promote
                          </button>
                        )}
                        {!item.reapproved && needsReapproval && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleManualReapprove(item.id); }}
                            className="h-8 rounded-xl border border-purple-500/30 bg-purple-500/10 px-3 text-[10px] font-bold text-purple-300 hover:bg-purple-500/20 flex items-center transition"
                            title="Manually Mark as Re-approved"
                          >
                            Mark Re-app
                          </button>
                        )}
                        {item.reapproved && (
                          <span className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[8.5px] font-black uppercase tracking-wider border bg-purple-500/10 border-purple-500/30 text-purple-300" title="User has re-confirmed attendance">
                            <CheckCircle2 size={10} /> Re-approved
                          </span>
                        )}
                        <span className={`rounded-full px-2.5 py-1 text-[8.5px] font-black uppercase tracking-wider border ${
                          item.status === "confirmed"
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                            : item.status === "waitlisted"
                            ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                            : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                        }`}>
                          {item.status}
                        </span>

                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[8.5px] font-bold text-white/70 uppercase">
                          {item.totalSize} {item.totalSize === 1 ? "MEMBER" : "MEMBERS"}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmDelete(item.id, item.teamName);
                          }}
                          className="h-8 w-8 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-300/70 hover:text-rose-200 hover:bg-rose-500/20 flex items-center justify-center transition"
                          title="Remove Registration"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Quick Preview of Squad */}
                    {isTeam && item.members.length > 0 && !isExpanded && (
                      <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-1.5 overflow-hidden text-white/45">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-white/30 shrink-0">Squad:</span>
                          <span className="truncate">
                            {item.members.map(m => m.name).join(", ")}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleExpand(item.id)}
                          className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-purple-400 hover:text-purple-300 uppercase tracking-wider"
                        >
                          <span>View Roster</span>
                          <ChevronDown size={13} />
                        </button>
                      </div>
                    )}

                    {!isTeam && !isExpanded && (
                      <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between gap-3 text-xs text-white/45">
                        <span>{item.leader.program} · Sem {item.leader.semester}</span>
                        <button
                          type="button"
                          onClick={() => toggleExpand(item.id)}
                          className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-purple-400 hover:text-purple-300 uppercase tracking-wider"
                        >
                          <span>View Details</span>
                          <ChevronDown size={13} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Expanded Section: All Team Members Grid */}
                  {isExpanded && (
                    <div className="border-t border-white/[0.08] bg-black/40 p-5 md:p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold text-purple-300 uppercase tracking-[.22em] font-mono flex items-center gap-1.5">
                          <Users size={12} /> SQUAD ROSTER BREAKDOWN ({item.totalSize} REGISTERED)
                        </p>
                        <span className="text-[10px] font-mono text-white/35">Registered: {item.registeredAt}</span>
                      </div>

                      {/* Members Cards Grid */}
                      <div className="grid gap-3.5 sm:grid-cols-2">
                        {/* Member 1: Leader Card */}
                        <div className="rounded-2xl border border-purple-500/30 bg-purple-500/[0.04] p-4 relative overflow-hidden">
                          <div className="flex items-center justify-between mb-2.5">
                            <span className="inline-flex items-center gap-1 rounded-md bg-purple-500/20 border border-purple-500/40 px-2 py-0.5 text-[8.5px] font-black text-purple-300 uppercase tracking-wider">
                              👑 TEAM LEADER
                            </span>
                            <span className="font-mono text-[9px] font-bold text-white/60 bg-black/40 px-2 py-0.5 rounded-md border border-white/10">
                              UID: {item.leader.uid}
                            </span>
                          </div>

                          <h4 className="text-sm font-black text-white">{item.leader.name}</h4>

                          <div className="mt-3 space-y-1.5 text-xs text-white/60">
                            <div className="flex items-center gap-2">
                              <Mail size={12} className="text-purple-400/80 shrink-0" />
                              <a href={`mailto:${item.leader.email}`} className="truncate hover:text-purple-300 underline font-mono text-[11px]">
                                {item.leader.email}
                              </a>
                            </div>

                            <div className="flex items-center gap-2">
                              <Phone size={12} className="text-emerald-400/80 shrink-0" />
                              {item.leader.phone && item.leader.phone !== "N/A" ? (
                                <a
                                  href={`https://wa.me/${item.leader.phone.replace(/[^\d]/g, "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-emerald-300 hover:text-emerald-200 font-mono text-[11px] underline"
                                >
                                  <span>{item.leader.phone}</span>
                                  <ExternalLink size={10} />
                                </a>
                              ) : (
                                <span className="text-white/30 font-mono text-[11px]">No WhatsApp phone</span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-[11px] text-white/40 pt-1 border-t border-white/5">
                              <span>{item.leader.program || "Degree TBA"}</span>
                              <span>·</span>
                              <span>Semester {item.leader.semester || "N/A"}</span>
                            </div>
                          </div>
                        </div>

                        {/* Members 2, 3, 4 Cards */}
                        {item.members.map((member, idx) => (
                          <div key={idx} className="rounded-2xl border border-white/[.08] bg-white/[0.02] p-4 relative overflow-hidden">
                            <div className="flex items-center justify-between mb-2.5">
                              <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.05] border border-white/10 px-2 py-0.5 text-[8.5px] font-black text-white/60 uppercase tracking-wider">
                                {member.role}
                              </span>
                              <span className="font-mono text-[9px] font-bold text-white/60 bg-black/40 px-2 py-0.5 rounded-md border border-white/10">
                                UID: {member.uid}
                              </span>
                            </div>

                            <h4 className="text-sm font-black text-white">{member.name}</h4>

                            <div className="mt-3 space-y-1.5 text-xs text-white/60">
                              <div className="flex items-center gap-2">
                                <Mail size={12} className="text-purple-400/80 shrink-0" />
                                <a href={`mailto:${member.email}`} className="truncate hover:text-purple-300 underline font-mono text-[11px]">
                                  {member.email}
                                </a>
                              </div>

                              <div className="flex items-center gap-2">
                                <Phone size={12} className="text-emerald-400/80 shrink-0" />
                                {member.phone && member.phone !== "N/A" ? (
                                  <a
                                    href={`https://wa.me/${member.phone.replace(/[^\d]/g, "")}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-emerald-300 hover:text-emerald-200 font-mono text-[11px] underline"
                                  >
                                    <span>{member.phone}</span>
                                    <ExternalLink size={10} />
                                  </a>
                                ) : (
                                  <span className="text-white/30 font-mono text-[11px]">No WhatsApp phone</span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 text-[11px] text-white/40 pt-1 border-t border-white/5">
                                <span>{member.program || "Degree TBA"}</span>
                                <span>·</span>
                                <span>Semester {member.semester || "N/A"}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Collapse Button */}
                      <div className="flex justify-end pt-2">
                        <button
                          type="button"
                          onClick={() => toggleExpand(item.id)}
                          className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white/70 hover:text-white hover:border-white/20 transition uppercase"
                        >
                          <span>Collapse Squad</span>
                          <ChevronUp size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
