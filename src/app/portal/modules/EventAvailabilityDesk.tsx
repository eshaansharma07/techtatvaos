"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Download,
  Phone,
  Mail,
  ExternalLink,
  Users,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Save,
  Loader2,
  Sparkles,
  Filter
} from "lucide-react";
import { idOf } from "../portal-client";

interface SquadMember {
  name: string;
  email: string;
  uid: string;
  phone: string;
  program: string;
  semester: string;
}

export interface SquadRecord {
  id: string;
  teamName: string;
  mode: string;
  status: string;
  availability: "available" | "not_available" | "pending" | "tentative";
  availabilityNote: string;
  availabilityUpdatedAt?: string | Date;
  leader: SquadMember;
  members: SquadMember[];
  totalSize: number;
  raw: any;
}

interface EventAvailabilityDeskProps {
  data: any;
  setPanel: (msg: string) => void;
  refresh: () => Promise<void>;
}

export function EventAvailabilityDesk({ data, setPanel, refresh }: EventAvailabilityDeskProps) {
  const events = data.events || [];
  const [selectedEventId, setSelectedEventId] = useState(events[0] ? idOf(events[0]) : "");
  const [statusFilter, setStatusFilter] = useState<"all" | "available" | "not_available" | "pending">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  const selectedEvent = events.find((e: any) => idOf(e) === selectedEventId);

  // Settings form state for the selected event
  const [postponed, setPostponed] = useState(!!selectedEvent?.postponed);
  const [rescheduledDate, setRescheduledDate] = useState(selectedEvent?.rescheduledDate || "");
  const [postponementNotice, setPostponementNotice] = useState(selectedEvent?.postponementNotice || "");

  // Update local settings state when selected event changes
  const handleSelectEvent = (id: string) => {
    setSelectedEventId(id);
    const ev = events.find((e: any) => idOf(e) === id);
    setPostponed(!!ev?.postponed);
    setRescheduledDate(ev?.rescheduledDate || "");
    setPostponementNotice(ev?.postponementNotice || "");
    setExpandedId(null);
  };

  // Cross-reference phone lookup
  const phoneLookup = useMemo(() => {
    const map = new Map<string, string>();
    (data.studentMembers || []).forEach((m: any) => {
      if (m.phone) {
        if (m.email) map.set(m.email.toLowerCase(), m.phone);
        if (m.uid) map.set(m.uid.toLowerCase(), m.phone);
        if (m._id) map.set(String(m._id), m.phone);
      }
    });
    (data.users || []).forEach((u: any) => {
      if (u.phone) {
        if (u.email) map.set(u.email.toLowerCase(), u.phone);
        if (u.uid) map.set(u.uid.toLowerCase(), u.phone);
        if (u._id) map.set(String(u._id), u.phone);
      }
    });
    (data.recruitmentApplications || []).forEach((r: any) => {
      if (r.phone) {
        if (r.email) map.set(r.email.toLowerCase(), r.phone);
        if (r.uid) map.set(r.uid.toLowerCase(), r.phone);
      }
    });
    (data.contactMessages || []).forEach((c: any) => {
      if (c.phone) {
        if (c.email) map.set(c.email.toLowerCase(), c.phone);
        if (c.registrationNumber) map.set(c.registrationNumber.toLowerCase(), c.phone);
      }
    });
    return map;
  }, [data.users, data.studentMembers, data.recruitmentApplications, data.contactMessages]);

  const resolvePhone = useCallback((person: any, userObj?: any, reg?: any) => {
    if (person?.phone && person.phone !== "N/A") return person.phone;
    if (person?.whatsapp && person.whatsapp !== "N/A") return person.whatsapp;
    if (person?.mobile && person.mobile !== "N/A") return person.mobile;
    if (userObj?.phone && userObj.phone !== "N/A") return userObj.phone;
    if (person?.customFields?.phone) return person.customFields.phone;
    if (reg?.phone) return reg.phone;

    const email = (person?.email || userObj?.email || "").toLowerCase();
    if (email && phoneLookup.has(email)) return phoneLookup.get(email)!;

    const uid = (person?.uid || userObj?.uid || "").toLowerCase();
    if (uid && phoneLookup.has(uid)) return phoneLookup.get(uid)!;

    const userId = person?.user ? String(idOf(person.user)) : userObj?._id ? String(userObj._id) : "";
    if (userId && phoneLookup.has(userId)) return phoneLookup.get(userId)!;

    return "N/A";
  }, [phoneLookup]);

  // Registrations strictly for this event
  const registrations = useMemo(() => {
    return (data.registrations || []).filter((r: any) => idOf(r.event) === selectedEventId);
  }, [data.registrations, selectedEventId]);

  // Normalized squad records with availability fields
  const squads: SquadRecord[] = useMemo(() => {
    return registrations.map((reg: any): SquadRecord => {
      const leaderUser = typeof reg.user === "object" ? reg.user : null;
      const leader: SquadMember = {
        name: leaderUser?.name || "Unknown Leader",
        email: leaderUser?.email || "N/A",
        uid: leaderUser?.uid || "N/A",
        phone: resolvePhone(leaderUser, leaderUser, reg),
        program: leaderUser?.program || "N/A",
        semester: leaderUser?.semester || "N/A"
      };

      const rawMembers = Array.isArray(reg.teamMembers) ? reg.teamMembers : [];
      const members: SquadMember[] = rawMembers.map((m: any, i: number): SquadMember => {
        const memberUser = typeof m.user === "object" ? m.user : null;
        return {
          name: m.name || memberUser?.name || `Member ${i + 2}`,
          email: m.email || memberUser?.email || "N/A",
          uid: m.uid || memberUser?.uid || "N/A",
          phone: resolvePhone(m, memberUser, reg),
          program: m.program || memberUser?.program || "N/A",
          semester: m.semester || memberUser?.semester || "N/A"
        };
      });

      const availability: "available" | "not_available" | "pending" | "tentative" =
        reg.availabilityStatus || (reg.reapproved ? "available" : "pending");

      return {
        id: idOf(reg),
        teamName: reg.teamName || (members.length > 0 ? "Squad" : "Individual Participant"),
        mode: reg.mode || (members.length > 0 ? "team" : "individual"),
        status: reg.status || "confirmed",
        availability,
        availabilityNote: reg.availabilityNote || "",
        availabilityUpdatedAt: reg.availabilityUpdatedAt,
        leader,
        members,
        totalSize: 1 + members.length,
        raw: reg
      };
    });
  }, [registrations, resolvePhone]);

  // Metrics
  const metrics = useMemo(() => {
    const total = squads.length;
    const available = squads.filter((s: SquadRecord) => s.availability === "available").length;
    const notAvailable = squads.filter((s: SquadRecord) => s.availability === "not_available").length;
    const pending = squads.filter((s: SquadRecord) => s.availability === "pending" || s.availability === "tentative").length;
    const rate = total ? Math.round((available / total) * 100) : 0;
    return { total, available, notAvailable, pending, rate };
  }, [squads]);

  // Filtered by status and search query
  const filteredSquads: SquadRecord[] = useMemo(() => {
    return squads.filter((s: SquadRecord) => {
      if (statusFilter === "available" && s.availability !== "available") return false;
      if (statusFilter === "not_available" && s.availability !== "not_available") return false;
      if (statusFilter === "pending" && s.availability !== "pending" && s.availability !== "tentative") return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.trim().toLowerCase();
      const matchTeam = s.teamName.toLowerCase().includes(q);
      const matchLeader = [s.leader.name, s.leader.email, s.leader.uid, s.leader.phone].some((val) =>
        String(val || "").toLowerCase().includes(q)
      );
      const matchMembers = s.members.some((m: SquadMember) =>
        [m.name, m.email, m.uid, m.phone].some((val) => String(val || "").toLowerCase().includes(q))
      );
      return matchTeam || matchLeader || matchMembers;
    });
  }, [squads, statusFilter, searchQuery]);

  // Save Event Postponement Settings
  async function handleSaveEventSettings() {
    if (!selectedEventId) return;
    setSavingSettings(true);
    try {
      const res = await fetch(`/api/admin/events/${selectedEventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postponed,
          rescheduledDate: rescheduledDate.trim(),
          postponementNotice: postponementNotice.trim(),
          requireAvailabilityConfirmation: postponed
        })
      });
      if (!res.ok) {
        throw new Error("Failed to save postponement settings.");
      }
      await refresh();
      setPanel("Postponement notice & settings updated successfully.");
    } catch (err: any) {
      setPanel(err.message || "Failed to save settings.");
    } finally {
      setSavingSettings(false);
    }
  }

  // Quick Admin Override of Team Availability
  async function handleUpdateTeamAvailability(registrationId: string, newStatus: "available" | "not_available" | "pending") {
    setUpdatingStatusId(registrationId);
    try {
      const res = await fetch(`/api/admin/registrations/${registrationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          availabilityStatus: newStatus,
          reapproved: newStatus === "available",
          availabilityUpdatedAt: new Date()
        })
      });
      if (!res.ok) {
        throw new Error("Failed to update status.");
      }
      await refresh();
      setPanel(`Team availability updated to "${newStatus}".`);
    } catch (err: any) {
      setPanel(err.message || "Update failed.");
    } finally {
      setUpdatingStatusId(null);
    }
  }

  // Export to CSV
  function exportAvailabilityCSV() {
    const headers = "Team Name,Mode,Registration Status,Availability Status,Leader Name,Leader UID,Leader Phone,Leader Email,Members Count,Remarks,Updated At\n";
    const rows = squads.map((s: SquadRecord) => {
      const updated = s.availabilityUpdatedAt ? new Date(s.availabilityUpdatedAt).toLocaleString("en-IN") : "Pending";
      return `"${s.teamName}","${s.mode}","${s.status}","${s.availability}","${s.leader.name}","${s.leader.uid}","${s.leader.phone}","${s.leader.email}","${s.totalSize}","${(s.availabilityNote || "").replace(/"/g, '""')}","${updated}"`;
    });

    const blob = new Blob([headers + rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `EventAvailability_${selectedEvent?.slug || "event"}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setPanel("Availability sheet exported as CSV.");
  }

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="portal-card rounded-[2rem] p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[.25em] text-amber-300/80 font-mono flex items-center gap-1.5">
              <Calendar size={13} className="text-amber-400" /> Postponement Management
            </p>
            <h3 className="mt-1 text-2xl font-bold text-white flex items-center gap-2">
              <span>Team Availability & RSVP Tracker</span>
            </h3>
          </div>

          {/* Event Picker & CSV Export */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedEventId}
              onChange={(e) => handleSelectEvent(e.target.value)}
              className="portal-input min-w-[240px] rounded-xl px-4 py-2.5 text-xs bg-black/40 border border-white/10 text-white font-medium focus:border-amber-500/50"
            >
              {events.map((event: any) => (
                <option key={idOf(event)} value={idOf(event)}>
                  {event.title} {event.postponed ? "· (POSTPONED)" : ""}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={exportAvailabilityCSV}
              className="portal-command-button inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 border border-amber-500/30 transition"
            >
              <Download size={14} /> Export Sheet
            </button>
          </div>
        </div>

        {/* Postponement Configuration Drawer / Form */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Event Postponement Notice & Schedule
              </span>
              {selectedEvent?.postponed && (
                <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-300">
                  POSTPONED
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-white/60 cursor-pointer flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={postponed}
                  onChange={(e) => setPostponed(e.target.checked)}
                  className="rounded border-white/20 bg-white/10 text-purple-600 focus:ring-0"
                />
                <span className="font-semibold text-white">Mark Event as Postponed</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-white/50 mb-1 font-semibold uppercase tracking-wider text-[10px]">
                Revised / Rescheduled Date & Time
              </label>
              <input
                type="text"
                value={rescheduledDate}
                onChange={(e) => setRescheduledDate(e.target.value)}
                placeholder="e.g. Saturday, October 18, 2026 · 10:00 AM"
                className="portal-input w-full rounded-xl px-3.5 py-2 text-xs bg-black/30 border border-white/10 text-white"
              />
            </div>

            <div>
              <label className="block text-white/50 mb-1 font-semibold uppercase tracking-wider text-[10px]">
                Public Notice for Participants
              </label>
              <input
                type="text"
                value={postponementNotice}
                onChange={(e) => setPostponementNotice(e.target.value)}
                placeholder="e.g. Prompt War has been postponed to Oct 18 due to university exams. Please confirm team availability below."
                className="portal-input w-full rounded-xl px-3.5 py-2 text-xs bg-black/30 border border-white/10 text-white"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleSaveEventSettings}
              disabled={savingSettings}
              className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-2 text-xs font-bold text-white transition active:scale-[0.98] disabled:opacity-50"
            >
              {savingSettings ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              <span>Save Postponement Notice</span>
            </button>
          </div>
        </div>

        {/* Availability Metric Strips */}
        <div className="mt-6 grid grid-cols-2 gap-3.5 sm:grid-cols-4">
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-center">
            <p className="text-xs text-white/50">Total Registered Teams</p>
            <p className="mt-1 text-2xl font-bold font-mono text-white">{metrics.total}</p>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
            <p className="text-xs text-emerald-400">Available & Attending</p>
            <div className="mt-1 flex items-baseline justify-center gap-2">
              <span className="text-2xl font-bold font-mono text-emerald-400">{metrics.available}</span>
              <span className="text-xs text-emerald-300/70 font-mono">({metrics.rate}%)</span>
            </div>
          </div>
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 text-center">
            <p className="text-xs text-rose-400">Unable / Withdrawn</p>
            <p className="mt-1 text-2xl font-bold font-mono text-rose-400">{metrics.notAvailable}</p>
          </div>
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-center">
            <p className="text-xs text-amber-400">Pending Response</p>
            <p className="mt-1 text-2xl font-bold font-mono text-amber-400">{metrics.pending}</p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-2 bg-black/40 p-1 rounded-xl border border-white/10">
            {(["all", "available", "not_available", "pending"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                  statusFilter === tab
                    ? "bg-purple-600 text-white shadow"
                    : "text-white/50 hover:text-white"
                }`}
              >
                {tab === "all" ? "All Squads" : tab.replace("_", " ")}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[280px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" size={14} />
            <input
              type="text"
              placeholder="Search team, leader name, UID, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="portal-input w-full rounded-xl pl-9 pr-4 py-2 text-xs bg-black/30 border border-white/10 text-white placeholder-white/30"
            />
          </div>
        </div>

        {/* Squad Cards List */}
        {filteredSquads.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-10 text-center text-xs text-white/40">
            No squad records found for this filter.
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {filteredSquads.map((squad: SquadRecord) => {
              const isExpanded = expandedId === squad.id;
              const isAvailable = squad.availability === "available";
              const isNotAvailable = squad.availability === "not_available";
              const isUpdating = updatingStatusId === squad.id;

              return (
                <div
                  key={squad.id}
                  className={`rounded-2xl border transition overflow-hidden ${
                    isAvailable
                      ? "border-emerald-500/30 bg-emerald-500/[0.02]"
                      : isNotAvailable
                      ? "border-rose-500/30 bg-rose-500/[0.02]"
                      : "border-white/10 bg-white/[0.02]"
                  }`}
                >
                  {/* Summary Bar */}
                  <div className="p-4 md:p-5 flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-1 min-w-[240px]">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-white">{squad.teamName}</h4>
                        {/* Availability Badge */}
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider border ${
                            isAvailable
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                              : isNotAvailable
                              ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                              : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                          }`}
                        >
                          {isAvailable ? "✓ Coming" : isNotAvailable ? "✕ Cannot Attend" : "⏳ Pending RSVP"}
                        </span>
                        <span className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[9px] font-bold text-white/50 uppercase">
                          {squad.totalSize} Members
                        </span>
                      </div>

                      {/* Leader Info */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/50">
                        <span className="text-white/80 font-medium">Leader: {squad.leader.name}</span>
                        <span>•</span>
                        <span className="font-mono text-purple-300">UID: {squad.leader.uid}</span>
                        <span>•</span>
                        <span>{squad.leader.program}</span>
                      </div>

                      {/* Team Remarks if any */}
                      {squad.availabilityNote && (
                        <p className="text-xs text-white/70 italic pt-0.5">
                          "{squad.availabilityNote}"
                        </p>
                      )}
                    </div>

                    {/* Right Action Buttons */}
                    <div className="flex items-center gap-2.5">
                      {/* WhatsApp Chat Link */}
                      {squad.leader.phone && squad.leader.phone !== "N/A" ? (
                        <a
                          href={`https://wa.me/${squad.leader.phone.replace(/[^\d]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition"
                          title="Open WhatsApp chat with team leader"
                        >
                          <Phone size={12} className="text-emerald-400" />
                          <span>{squad.leader.phone}</span>
                          <ExternalLink size={10} className="text-emerald-400/70" />
                        </a>
                      ) : (
                        <span className="text-xs text-white/30 font-mono italic">No WhatsApp phone</span>
                      )}

                      {/* Manual Quick Override Dropdown / Buttons */}
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleUpdateTeamAvailability(squad.id, isAvailable ? "not_available" : "available")}
                        className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition disabled:opacity-50 ${
                          isAvailable
                            ? "border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                            : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                        }`}
                      >
                        {isAvailable ? "Set Unavailable" : "Mark Available"}
                      </button>

                      {/* Expand / Collapse Roster */}
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : squad.id)}
                        className="rounded-xl border border-white/10 bg-white/5 p-1.5 text-white/60 hover:text-white transition"
                        title="Toggle team members roster"
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Members Roster */}
                  {isExpanded && (
                    <div className="border-t border-white/10 bg-black/40 p-4 md:p-5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-purple-300 font-mono mb-3">
                        Full Squad Roster Breakdown ({squad.totalSize} Members)
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                        {/* Leader */}
                        <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-3 space-y-1">
                          <span className="text-[9px] font-black uppercase tracking-wider text-purple-300">👑 LEADER</span>
                          <p className="font-bold text-white">{squad.leader.name}</p>
                          <p className="text-white/60 font-mono text-[11px]">UID: {squad.leader.uid}</p>
                          <p className="text-white/50 text-[11px] truncate">{squad.leader.email}</p>
                        </div>

                        {/* Members */}
                        {squad.members.map((m: any, idx: number) => (
                          <div key={idx} className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-1">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-white/50">MEMBER {idx + 2}</span>
                            <p className="font-bold text-white">{m.name}</p>
                            <p className="text-white/60 font-mono text-[11px]">UID: {m.uid}</p>
                            <p className="text-white/50 text-[11px] truncate">{m.email}</p>
                          </div>
                        ))}
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
