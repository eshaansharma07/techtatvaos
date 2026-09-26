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

export function Attendance({ data, setPanel, refresh }: { data: Data; setPanel: (value: string) => void; refresh: () => Promise<void> }) {
  const events = data.events || [];
  const [selected, setSelected] = useState(events[0] ? idOf(events[0]) : "");
  const [attendanceSearch, setAttendanceSearch] = useState("");
  const [localStatus, setLocalStatus] = useState<Record<string, "present" | "absent">>({});
  const [marking, setMarking] = useState<Record<string, boolean>>({});
  const selectedEvent = events.find((event: any) => idOf(event) === selected);
  const attendanceMap = useMemo<Map<string, any>>(
    () => new Map((data.attendance || []).map((row: any) => [`${idOf(row.event)}:${idOf(row.user)}`, row])),
    [data.attendance]
  );
  const registrations = (data.registrations || []).filter((registration: any) => idOf(registration.event) === selected);
  const participants = registrations.flatMap((registration: any) => {
    const leader = registration.user
      ? [{
          registration: idOf(registration),
          user: idOf(registration.user),
          name: registration.user.name,
          email: registration.user.email,
          uid: registration.user.uid,
          program: registration.user.program,
          semester: registration.user.semester,
          mode: registration.mode || "individual",
          teamName: registration.teamName || ""
        }]
      : [];
    const members = (registration.teamMembers || []).map((member: any) => ({
      registration: idOf(registration),
      user: idOf(member.user || member),
      name: member.name,
      email: member.email,
      uid: member.uid,
      program: member.program,
      semester: member.semester,
      mode: "team",
      teamName: registration.teamName || ""
    }));
    return [...leader, ...members];
  });
  const filteredParticipants = participants.filter((row: any) => {
    const query = attendanceSearch.trim().toLowerCase();
    if (!query) return true;
    return [row.name, row.uid, row.email, row.program, row.semester, row.teamName, row.mode]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  const presentCount = participants.filter((row: any) => {
    const status = localStatus[`${selected}:${row.user}`] || attendanceMap.get(`${selected}:${row.user}`)?.status || "absent";
    return status === "present";
  }).length;

  const absentCount = participants.length - presentCount;

  useEffect(() => {
    const download = () => {
      if (!selected) {
        setPanel("Select an event before generating attendance.");
        return;
      }
      window.location.href = `/api/attendance/export?event=${selected}&format=pdf`;
    };
    window.addEventListener("portal-download-attendance", download);
    return () => window.removeEventListener("portal-download-attendance", download);
  }, [selected, setPanel]);

  async function mark(row: any, status: "present" | "absent") {
    const key = `${selected}:${row.user}`;
    if (!selected || !row.user) {
      setPanel("Cannot mark attendance because the event or candidate id is missing.");
      return;
    }
    setMarking((state) => ({ ...state, [key]: true }));
    setPanel(`Saving attendance for ${row.name}...`);
    try {
      const endpoint = status === "present" ? "/api/attendance/present" : "/api/attendance/absent";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ event: selected, user: row.user, registration: row.registration })
      });
      const saved = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPanel(saved.error || `Could not update ${row.name}. Server returned ${res.status}.`);
        return;
      }
      const savedStatus = saved.status === "present" ? "present" : "absent";
      if (savedStatus !== status) {
        setPanel(`Attendance was not saved correctly. Press ${status === "present" ? "Mark present" : "Mark absent"} again.`);
        return;
      }
      setLocalStatus((state) => ({ ...state, [key]: savedStatus }));
      setPanel(`${row.name} marked ${savedStatus}. Refreshing attendance...`);
      await refresh();
      setLocalStatus((state) => ({ ...state, [key]: savedStatus }));
      setPanel(`${row.name} marked ${savedStatus} and saved to MongoDB.`);
    } catch (error) {
      setPanel(`Attendance update failed for ${row.name}. Check connection and try again.`);
    } finally {
      setMarking((state) => ({ ...state, [key]: false }));
    }
  }

  return (
    <div className="mt-7 grid gap-5 xl:grid-cols-[1fr_.42fr] animate-in fade-in duration-200">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/[.08] bg-[#05070d]/75 p-6 md:p-7">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.02] via-transparent to-blue-500/[0.02]" />
        
        <div className="relative flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] pb-5 mb-6">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Registered Candidates</h3>
            <p className="mt-1 text-xs text-white/38">Filter by event, search, then mark attendance manually.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex min-w-[200px] items-center gap-2 rounded-2xl border border-white/[.07] bg-black/35 px-4 py-2.5 text-white/45 focus-within:border-violet-400/40 transition">
              <Search size={14} />
              <input value={attendanceSearch} onChange={(event) => setAttendanceSearch(event.target.value)} placeholder="Search name, UID..." className="w-full bg-transparent text-xs text-white outline-none placeholder:text-white/28" />
            </div>
            
            <select value={selected} onChange={(event) => setSelected(event.target.value)} className="rounded-2xl border border-white/[.07] bg-black/35 px-4 py-2.5 text-xs text-white outline-none focus:border-violet-400/40 transition">
              {events.map((event: any) => <option value={idOf(event)} key={idOf(event)}>{event.title}</option>)}
            </select>
          </div>
        </div>

        {participants.length ? (
          <div className="grid gap-3 grid-cols-3 mb-6 relative z-10">
            <div className="rounded-2xl border border-white/[.06] bg-white/[.02] p-4 transition duration-200 hover:-translate-y-0.5">
              <p className="text-[9px] uppercase tracking-[.18em] text-white/35">Total Registered</p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-white">{participants.length}</p>
            </div>
            <div className="rounded-2xl border border-blue-500/15 bg-blue-500/[0.04] p-4 transition duration-200 hover:-translate-y-0.5">
              <p className="text-[9px] uppercase tracking-[.18em] text-blue-300/60">Present</p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-blue-300">{presentCount}</p>
            </div>
            <div className="rounded-2xl border border-rose-500/15 bg-rose-500/[0.04] p-4 transition duration-200 hover:-translate-y-0.5">
              <p className="text-[9px] uppercase tracking-[.18em] text-rose-300/60">Absent</p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-rose-300">{absentCount}</p>
            </div>
          </div>
        ) : null}

        {participants.length ? (
          <div className="relative overflow-hidden rounded-2xl border border-white/[.06]">
            <div className="hidden grid-cols-[1.1fr_1fr_1.1fr_.7fr_1.3fr] gap-3 bg-white/[.04] px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-white/40 border-b border-white/[0.06] md:grid">
              <span>Candidate</span>
              <span>UID</span>
              <span>Program</span>
              <span>Mode</span>
              <span className="text-right pr-4">Attendance Toggle</span>
            </div>
            
            <div className="max-h-[460px] overflow-y-auto overscroll-contain divide-y divide-white/[0.04] mobile-tabs">
              {filteredParticipants.map((row: any) => {
                const status = localStatus[`${selected}:${row.user}`] || attendanceMap.get(`${selected}:${row.user}`)?.status || "absent";
                const isPresent = status === "present";
                const busy = Boolean(marking[`${selected}:${row.user}`]);
                return (
                  <div className="grid gap-4 bg-black/10 px-5 py-5 text-sm hover:bg-white/[0.01] transition md:grid-cols-[1.1fr_1fr_1.1fr_.7fr_1.3fr] md:items-center md:py-4 md:text-xs" key={`${row.registration}-${row.user}`}>
                    <div>
                      <p className="font-bold text-white/80 tracking-tight">{row.name}</p>
                      {row.teamName ? (
                        <p className="mt-1 text-[10px] text-violet-300/65 font-medium">Team: {row.teamName}</p>
                      ) : (
                        <p className="mt-1 text-[9px] text-white/25">Individual</p>
                      )}
                    </div>
                    
                    <span className="rounded-2xl border border-white/[.06] bg-white/[.02] px-3 py-2 text-white/48 md:border-0 md:bg-transparent md:px-0 md:py-0">{row.uid || "-"}</span>
                    <span className="rounded-2xl border border-white/[.06] bg-white/[.02] px-3 py-2 text-white/48 md:border-0 md:bg-transparent md:px-0 md:py-0">{row.program || "-"}{row.semester ? ` / Sem ${row.semester}` : ""}</span>
                    <span className="rounded-2xl border border-white/[.06] bg-white/[.02] px-3 py-2 capitalize text-white/48 md:border-0 md:bg-transparent md:px-0 md:py-0">{row.mode}</span>
                    
                    <div className="flex flex-wrap items-center gap-3 md:justify-end md:pr-4">
                      <span className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider border ${isPresent ? "bg-blue-500/10 border-blue-500/20 text-blue-300" : "bg-white/[0.04] border-white/[0.06] text-white/40"}`}>
                        {isPresent ? "Present" : "Absent"}
                      </span>
                      
                      {isPresent ? (
                        <button type="button" disabled={busy} onClick={(event) => { event.preventDefault(); event.stopPropagation(); void mark(row, "absent"); }} className="min-h-11 md:min-h-0 flex items-center justify-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-3.5 py-1.5 text-[10px] font-bold text-rose-300 hover:bg-rose-500/20 active:scale-95 transition disabled:cursor-wait disabled:opacity-60">
                          {busy ? "Saving..." : "Mark absent"}
                        </button>
                      ) : (
                        <button type="button" disabled={busy} onClick={(event) => { event.preventDefault(); event.stopPropagation(); void mark(row, "present"); }} className="min-h-11 md:min-h-0 flex items-center justify-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1.5 text-[10px] font-bold text-blue-300 hover:bg-blue-500/20 active:scale-95 transition disabled:cursor-wait disabled:opacity-60">
                          {busy ? "Saving..." : "Mark present"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {!filteredParticipants.length ? (
                <p className="bg-black/15 px-5 py-8 text-sm text-white/35 text-center">No candidates match &ldquo;{attendanceSearch}&rdquo;.</p>
              ) : null}
            </div>
          </div>
        ) : (
          <p className="rounded-2xl border border-white/[.06] bg-white/[.02] p-8 text-sm text-white/35 text-center font-medium">
            {selectedEvent ? "No registrations for this event yet." : "Create an event before marking attendance."}
          </p>
        )}
      </div>

      <div className="grid gap-5 self-start">
        <div className="rounded-[2rem] border border-white/[.08] bg-[#05070d]/75 p-6 md:p-7 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.03] via-transparent to-transparent" />
          
          <div className="relative">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/[0.06] pb-4 mb-4">Export Attendance</h3>
            <p className="text-xs leading-relaxed text-white/40 mb-5">
              Attendance sheet exports include only registered candidates marked present for the selected event.
            </p>
            
            {selected ? (
              <div className="grid gap-3 relative z-10">
                <a className="portal-command-button flex items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-center text-xs font-semibold hover:-translate-y-0.5 transition" href={`/api/attendance/export?event=${selected}&format=pdf`}>
                  <Download size={13} /> Export PDF Sheet
                </a>
                <a className="flex items-center justify-center gap-2 rounded-2xl border border-white/[.08] bg-white/[.035] px-4 py-3.5 text-center text-xs font-semibold text-white/70 hover:bg-white/[.06] hover:-translate-y-0.5 hover:text-white transition" href={`/api/attendance/export?event=${selected}&format=xlsx`}>
                  <Download size={13} /> Export Excel Sheet
                </a>
              </div>
            ) : (
              <p className="text-xs text-white/30 text-center italic py-2">Select an event first to enable exports.</p>
            )}
            
            <p className="mt-5 text-[10px] text-white/32 uppercase tracking-wider font-semibold border-t border-white/[0.06] pt-4">Roster Summary</p>
            <div className="mt-3 rounded-2xl bg-black/35 border border-white/[0.05] p-4 text-xs space-y-2 text-white/50">
              <div className="flex justify-between"><span>Registrations count:</span><span className="font-semibold text-white">{participants.length}</span></div>
              <div className="flex justify-between"><span>Marked present:</span><span className="font-semibold text-blue-300">{presentCount}</span></div>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/[.08] bg-[#05070d]/75 p-6 md:p-7 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.03] via-transparent to-transparent" />
          <div className="relative">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/[0.06] pb-4 mb-4">Operations Tip</h3>
            <p className="text-xs leading-relaxed text-white/50 mb-3">
              For team events, the team leader and all added team members are listed as separate rows.
            </p>
            <p className="text-xs leading-relaxed text-white/40">
              This guarantees that the generated sheet only contains the individual members who actually attended the event.
            </p>
            <button onClick={() => setPanel("Each registration is expanded into its components (leader + active team members) so that you can verify ID cards and mark attendance individually.")} className="portal-mini-button mt-5 w-full rounded-xl py-2.5 text-center text-xs text-amber-200/70 border border-amber-500/15 bg-amber-500/[0.02] hover:-translate-y-0.5 hover:bg-amber-500/[0.05] hover:text-amber-200 transition">
              Read Detailed Flow
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
