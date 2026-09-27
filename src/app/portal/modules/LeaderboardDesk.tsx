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

export function LeaderboardDesk({ data, setPanel, refresh }: { data: Data; setPanel: (v: string) => void; refresh: () => Promise<void> }) {
  const events = data.events || [];
  const registrations = data.registrations || [];
  const entries: any[] = data.leaderboardEntries || [];
  const [selectedEvent, setSelectedEvent] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Add/Edit form state
  const [editing, setEditing] = useState<any>(null);
  const [teamName, setTeamName] = useState("");
  const [registrationId, setRegistrationId] = useState("");
  const [rank, setRank] = useState(0);
  const [manualTotalScore, setManualTotalScore] = useState<string>("");
  const [scores, setScores] = useState<Array<{ category: string; baseScore: number; timeBonus: number; hintPenalty: number; notes: string }>>([]);

  const eventEntries = useMemo(() => entries.filter((e: any) => {
    const eid = typeof e.event === "string" ? e.event : e.event?._id || e.event?.id || "";
    return String(eid) === selectedEvent;
  }).sort((a: any, b: any) => (a.rank || 999) - (b.rank || 999)), [entries, selectedEvent]);

  const eventRegs = useMemo(() => registrations.filter((r: any) => {
    const eid = typeof r.event === "string" ? r.event : r.event?._id || r.event?.id || "";
    return String(eid) === selectedEvent && r.mode === "team";
  }), [registrations, selectedEvent]);

  const selectedEventData = events.find((e: any) => idOf(e) === selectedEvent);
  const isVisible = selectedEventData?.leaderboardVisible === true;

  const calculatedTotal = scores.reduce((sum, s) => sum + (s.baseScore || 0) + (s.timeBonus || 0) - (s.hintPenalty || 0), 0);
  const effectiveTotal = manualTotalScore !== "" ? Number(manualTotalScore) || 0 : calculatedTotal;

  // Preset templates for 1-click stage adding
  const presets = [
    { label: "Stage 1 (Crossword)", base: 500 },
    { label: "Stage 2 (Scavenger Hunt)", base: 500 },
    { label: "Stage 3 (Cipher Chase)", base: 500 },
    { label: "Stage 4 (Vault Finale)", base: 1000 },
    { label: "Non-Tech Treasure Hunt", base: 300 },
    { label: "Team Task (4 Members)", base: 40 },
    { label: "Tech Treasure Hunt", base: 400 },
    { label: "Activity Task", base: 20 }
  ];

  function addPresetCategory(preset: { label: string; base: number }) {
    setScores(prev => [...prev, { category: preset.label, baseScore: preset.base, timeBonus: 0, hintPenalty: 0, notes: "" }]);
  }

  function addCustomScoreRow() {
    setScores(prev => [...prev, { category: "", baseScore: 0, timeBonus: 0, hintPenalty: 0, notes: "" }]);
  }

  function updateScore(idx: number, field: string, value: any) {
    setScores(prev => prev.map((s, i) => {
      if (i !== idx) return s;
      if (field === "category" || field === "notes") return { ...s, [field]: value };
      if (field === "hintsCount") {
        const hintNum = Number(value) || 0;
        return { ...s, hintPenalty: hintNum * 50 };
      }
      return { ...s, [field]: Number(value) || 0 };
    }));
  }

  function removeScoreRow(idx: number) {
    setScores(prev => prev.filter((_, i) => i !== idx));
  }

  function startEdit(entry: any) {
    setEditing(entry);
    setTeamName(entry.teamName || "");
    setRegistrationId(entry.registration ? idOf(entry.registration) : "");
    setRank(entry.rank || 0);
    setManualTotalScore(entry.totalScore !== undefined ? String(entry.totalScore) : "");
    setScores((entry.scores || []).map((s: any) => ({
      category: s.category || "",
      baseScore: Number(s.baseScore) || 0,
      timeBonus: Number(s.timeBonus) || 0,
      hintPenalty: Number(s.hintPenalty) || 0,
      notes: s.notes || ""
    })));
    setErrorMsg("");
  }

  function resetForm() {
    setEditing(null);
    setTeamName("");
    setRegistrationId("");
    setRank(0);
    setManualTotalScore("");
    setScores([]);
    setErrorMsg("");
  }

  async function handleSave() {
    setErrorMsg("");
    if (!selectedEvent) {
      setErrorMsg("Please select an event from the dropdown above first.");
      return;
    }
    if (!teamName.trim()) {
      setErrorMsg("Please enter or select a team name.");
      return;
    }

    setBusy(true);
    const body = {
      event: selectedEvent,
      teamName: teamName.trim(),
      registration: registrationId || undefined,
      rank,
      totalScore: manualTotalScore !== "" ? Number(manualTotalScore) : undefined,
      scores
    };

    try {
      const isEdit = editing && editing._id;
      const url = isEdit ? `/api/admin/leaderboard/${idOf(editing)}` : "/api/admin/leaderboard";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const responseData = await res.json().catch(() => ({}));
      setBusy(false);

      if (res.ok) {
        setPanel(isEdit ? `Leaderboard updated for ${teamName}.` : `Added ${teamName} to leaderboard.`);
        resetForm();
        await refresh();
      } else {
        const errorText = responseData.error || responseData.message || "Failed to save leaderboard entry.";
        setErrorMsg(errorText);
        setPanel(`Failed: ${errorText}`);
      }
    } catch (err: any) {
      setBusy(false);
      setErrorMsg(err.message || "Network error while saving.");
      setPanel("Failed: Network error.");
    }
  }

  async function handleDelete(entry: any) {
    if (!confirm(`Delete team "${entry.teamName}" from leaderboard?`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/leaderboard/${idOf(entry)}`, { method: "DELETE" });
      setBusy(false);
      if (res.ok) {
        setPanel(`Removed ${entry.teamName} from leaderboard.`);
        await refresh();
      } else {
        setPanel("Delete failed.");
      }
    } catch {
      setBusy(false);
      setPanel("Delete failed due to network error.");
    }
  }

  async function toggleVisibility() {
    if (!selectedEvent) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/events/${selectedEvent}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leaderboardVisible: !isVisible })
      });
      setBusy(false);
      if (res.ok) {
        setPanel(isVisible ? "Leaderboard hidden from public event page." : "Leaderboard is now LIVE on the public website!");
        await refresh();
      } else {
        setPanel("Toggle failed.");
      }
    } catch {
      setBusy(false);
      setPanel("Toggle failed.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Non-Tech Simple Guide Banner */}
      <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-r from-violet-950/40 via-purple-950/20 to-black/40 p-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-8 w-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold">
            💡
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">Non-Tech Leaderboard Manager Guide</h3>
            <p className="text-xs text-white/50">Follow these 4 simple steps to post scores for any event:</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4 text-[11px]">
          <div className="rounded-xl border border-white/10 bg-black/40 p-3">
            <span className="font-bold text-purple-400">Step 1</span>
            <p className="text-white/80 font-semibold mt-0.5">Select Event</p>
            <p className="text-white/40 text-[10px]">Pick your event below</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/40 p-3">
            <span className="font-bold text-purple-400">Step 2</span>
            <p className="text-white/80 font-semibold mt-0.5">Enter Team Name</p>
            <p className="text-white/40 text-[10px]">Type name or pick team</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/40 p-3">
            <span className="font-bold text-purple-400">Step 3</span>
            <p className="text-white/80 font-semibold mt-0.5">Add Points</p>
            <p className="text-white/40 text-[10px]">Use 1-click stage buttons</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/40 p-3">
            <span className="font-bold text-purple-400">Step 4</span>
            <p className="text-white/80 font-semibold mt-0.5">Publish to Web</p>
            <p className="text-white/40 text-[10px]">Click Public button</p>
          </div>
        </div>
      </div>

      {/* Step 1: Select Event */}
      <div className="glass-brutalist rounded-2xl p-5 border-2 border-violet-500/20">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-extrabold uppercase tracking-wider text-violet-300 flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-xs">1</span>
            Select Event to Manage Leaderboard
          </label>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <select
            value={selectedEvent}
            onChange={(e) => { setSelectedEvent(e.target.value); resetForm(); }}
            className="flex-1 min-w-[280px] rounded-xl border border-white/15 bg-black/60 px-4 py-3.5 text-sm font-semibold text-white focus:border-purple-400 focus:outline-none shadow-inner"
          >
            <option value="">-- Click here to select an event --</option>
            {events.map((ev: any) => (
              <option key={idOf(ev)} value={idOf(ev)}>{ev.title} ({ev.category || "Event"})</option>
            ))}
          </select>

          {selectedEvent && (
            <button
              type="button"
              onClick={toggleVisibility}
              disabled={busy}
              className={`flex items-center gap-2.5 rounded-xl px-6 py-3.5 text-xs font-black uppercase tracking-wider transition shadow-lg ${
                isVisible
                  ? "border-2 border-emerald-500 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                  : "border-2 border-orange-500 bg-orange-500/20 text-orange-300 hover:bg-orange-500/30"
              }`}
            >
              <Eye size={16} />
              {isVisible ? "🟢 PUBLISHED ON WEBSITE (CLICK TO HIDE)" : "🔒 HIDDEN FROM WEBSITE (CLICK TO PUBLISH)"}
            </button>
          )}
        </div>
      </div>

      {selectedEvent && (
        <>
          {/* Step 2 & 3: Add / Edit Team Score Form */}
          <div className="glass-brutalist rounded-2xl p-6 border-2 border-white/10 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h4 className="text-base font-black text-white flex items-center gap-2">
                <span className="h-6 w-6 rounded-full bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-xs">2</span>
                {editing ? `Editing Scores for "${teamName}"` : `Add Team to Leaderboard (${selectedEventData?.title || ""})`}
              </h4>
              {editing && (
                <button type="button" onClick={resetForm} className="rounded-xl border border-white/20 px-3 py-1.5 text-xs text-white/70 hover:text-white">
                  Cancel Editing
                </button>
              )}
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="rounded-xl border-2 border-rose-500/50 bg-rose-500/10 p-4 text-xs font-bold text-rose-300 flex items-center gap-3">
                <span className="text-base">⚠️</span>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Team Details Inputs */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold text-white/70 uppercase tracking-wider mb-1 block">
                  Team Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Type team name (e.g. Cyber Ninjas)"
                  className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-sm text-white font-semibold focus:border-purple-400 focus:outline-none"
                />

                {eventRegs.length > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] text-white/40 font-mono">OR SELECT:</span>
                    <select
                      value={registrationId}
                      onChange={(e) => {
                        setRegistrationId(e.target.value);
                        const reg = eventRegs.find((r: any) => idOf(r) === e.target.value);
                        if (reg?.teamName) setTeamName(reg.teamName);
                      }}
                      className="flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-white/70 focus:outline-none"
                    >
                      <option value="">-- Choose from registered teams --</option>
                      {eventRegs.map((r: any) => (
                        <option key={idOf(r)} value={idOf(r)}>{r.teamName || "Unnamed Team"}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="text-[11px] font-bold text-white/70 uppercase tracking-wider mb-1 block">
                  Display Rank (1 = 1st Place)
                </label>
                <input
                  type="number"
                  value={rank}
                  onChange={(e) => setRank(Number(e.target.value) || 0)}
                  min={0}
                  placeholder="0 = Auto rank"
                  className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-sm text-white font-semibold focus:border-purple-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Quick 1-Click Stage Add Buttons */}
            <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-purple-300 mb-2.5">
                ⚡ Quick 1-Click Stage Buttons (Click to add stage points):
              </p>
              <div className="flex flex-wrap gap-2">
                {presets.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => addPresetCategory(p)}
                    className="flex items-center gap-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 px-3 py-2 text-xs font-bold text-purple-200 hover:bg-purple-500/20 hover:scale-[1.02] transition"
                  >
                    <span>+ {p.label}</span>
                    <span className="rounded-md bg-purple-500/30 px-1.5 py-0.5 text-[10px] text-purple-100">+{p.base} pts</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={addCustomScoreRow}
                  className="flex items-center gap-1 rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-xs font-bold text-white/80 hover:bg-white/10 transition"
                >
                  <PlusCircle size={14} /> Custom Category
                </button>
              </div>
            </div>

            {/* Score Categories List */}
            {scores.length > 0 && (
              <div className="space-y-3">
                <p className="text-[11px] font-bold text-white/70 uppercase tracking-wider">Stages Added for this Team:</p>
                {scores.map((score, idx) => (
                  <div key={idx} className="rounded-xl border border-white/10 bg-black/40 p-4">
                    <div className="grid gap-3 sm:grid-cols-5 items-end">
                      <div className="sm:col-span-2">
                        <label className="text-[10px] font-semibold text-white/40 uppercase">Stage / Activity Name</label>
                        <input
                          type="text"
                          value={score.category}
                          onChange={(e) => updateScore(idx, "category", e.target.value)}
                          placeholder="e.g. Stage 1 (Crossword)"
                          className="w-full mt-1 rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-xs font-semibold text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-white/40 uppercase">Base Points</label>
                        <input
                          type="number"
                          value={score.baseScore}
                          onChange={(e) => updateScore(idx, "baseScore", e.target.value)}
                          className="w-full mt-1 rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-xs font-bold text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-emerald-400/80 uppercase">Time Left (sec)</label>
                        <input
                          type="number"
                          value={score.timeBonus}
                          onChange={(e) => updateScore(idx, "timeBonus", e.target.value)}
                          placeholder="+1 pt/sec"
                          className="w-full mt-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-300"
                        />
                      </div>
                      <div className="flex gap-2 items-center">
                        <div className="flex-1">
                          <label className="text-[10px] font-semibold text-rose-400/80 uppercase">Hints Used</label>
                          <input
                            type="number"
                            value={score.hintPenalty ? score.hintPenalty / 50 : 0}
                            onChange={(e) => updateScore(idx, "hintsCount", e.target.value)}
                            placeholder="Hints (-50 ea)"
                            className="w-full mt-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-300"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeScoreRow(idx)}
                          className="mt-5 rounded-lg p-2 text-rose-400 hover:bg-rose-500/10 transition"
                          title="Remove stage"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] border-t border-white/5 pt-2">
                      <input
                        type="text"
                        value={score.notes}
                        onChange={(e) => updateScore(idx, "notes", e.target.value)}
                        placeholder="Optional stage note (e.g. finished with 2 min left)"
                        className="flex-1 bg-transparent text-white/50 outline-none placeholder:text-white/20"
                      />
                      <span className="font-extrabold text-purple-300">
                        Stage Subtotal = {(score.baseScore || 0) + (score.timeBonus || 0) - (score.hintPenalty || 0)} pts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Direct Total Override Option */}
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-white">Or Direct Total Score Override (Optional)</p>
                  <p className="text-[10px] text-white/40">Type a single final number here if you don&apos;t want to use stage buttons:</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={manualTotalScore}
                    onChange={(e) => setManualTotalScore(e.target.value)}
                    placeholder={String(calculatedTotal)}
                    className="w-36 rounded-xl border border-purple-500/40 bg-purple-500/10 px-4 py-2.5 text-base font-extrabold text-purple-200 focus:outline-none"
                  />
                  {manualTotalScore !== "" && (
                    <button
                      type="button"
                      onClick={() => setManualTotalScore("")}
                      className="text-xs text-white/40 hover:text-white underline"
                    >
                      Use Auto Calc
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Final Total Display */}
            <div className="rounded-2xl border-2 border-purple-500/40 bg-purple-500/10 p-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono text-purple-300 uppercase tracking-widest">FINAL SCORE TO SAVE</p>
                <p className="text-3xl font-black text-white mt-1">{effectiveTotal} <span className="text-sm font-normal text-white/60">Points</span></p>
              </div>

              <button
                type="button"
                onClick={handleSave}
                disabled={busy}
                className="brutalist-btn-purple flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-xs font-black uppercase tracking-wider"
              >
                <span>{busy ? "Saving to Database..." : editing ? "Update Team Entry" : "Save Team to Leaderboard"}</span>
              </button>
            </div>
          </div>

          {/* Roster of Leaderboard Teams */}
          <div className="glass-brutalist rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-extrabold text-white">
                Current Leaderboard — {selectedEventData?.title || ""} ({eventEntries.length} teams)
              </h4>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${isVisible ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" : "border-orange-500/40 bg-orange-500/10 text-orange-300"}`}>
                {isVisible ? "🟢 VISIBLE ON WEBSITE" : "🔒 HIDDEN FROM WEBSITE"}
              </span>
            </div>

            {eventEntries.length === 0 ? (
              <div className="text-center py-10 rounded-xl border border-dashed border-white/10 bg-black/20">
                <p className="text-sm text-white/50 font-semibold">No team scores added yet for {selectedEventData?.title}.</p>
                <p className="text-xs text-white/30 mt-1">Use the form above to add your first team score.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-white/40 uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-3">Rank</th>
                      <th className="py-3 px-3">Team Name</th>
                      <th className="py-3 px-3">Stage Breakdown</th>
                      <th className="py-3 px-3 text-right">Total Score</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {eventEntries.map((entry: any, i: number) => (
                      <tr key={idOf(entry)} className={i < 3 ? "bg-purple-500/[0.04]" : ""}>
                        <td className="py-3 px-3">
                          <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black ${
                            i === 0 ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40" :
                            i === 1 ? "bg-gray-400/20 text-gray-300 border border-gray-400/40" :
                            i === 2 ? "bg-amber-700/20 text-amber-400 border border-amber-700/40" :
                            "bg-white/5 text-white/50"
                          }`}>
                            {entry.rank || i + 1}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-bold text-white">{entry.teamName}</td>
                        <td className="py-3 px-3">
                          <div className="flex flex-wrap gap-1">
                            {(entry.scores || []).map((s: any, si: number) => (
                              <span key={si} className="rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] text-white/60">
                                {s.category}: {(s.baseScore || 0) + (s.timeBonus || 0) - (s.hintPenalty || 0)} pts
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-black text-purple-300 text-sm">
                          {entry.totalScore || 0} <span className="text-[10px] text-white/40 font-normal">pts</span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => startEdit(entry)}
                              className="rounded-lg border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-[10px] font-bold text-purple-300 hover:bg-purple-500/20"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(entry)}
                              className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-[10px] font-bold text-rose-300 hover:bg-rose-500/20"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
