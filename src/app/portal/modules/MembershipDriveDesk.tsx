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

export function MembershipDriveDesk({data,open,patch,remove,refresh,setPanel}:{data:Data;open:(drawer:any)=>void;patch:(resource:Resource,item:any,body:Record<string, any>,message:string)=>void;remove:(resource:Resource,item:any)=>void;refresh:()=>Promise<void>;setPanel:(value:string)=>void}) {
  const today = new Date().toISOString().slice(0, 10);

  // Sound feedback toggle state
  const [soundsEnabled, setSoundsEnabled] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("tt-sounds") !== "false";
    }
    return true;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("tt-sounds", String(soundsEnabled));
    }
  }, [soundsEnabled]);

  // Sync and manage localMembers state for optimistic UI updates
  const [localMembers, setLocalMembers] = useState<any[]>(data.studentMembers || []);
  
  useEffect(() => {
    setLocalMembers(data.studentMembers || []);
  }, [data.studentMembers]);

  const [activeTab, setActiveTab] = useState<"dashboard" | "members">("dashboard");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [detailMember, setDetailMember] = useState<any>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  
  // CLI Excel export terminal modal state
  const [exportState, setExportState] = useState<{
    show: boolean;
    progress: number;
    lines: string[];
  } | null>(null);
  
  const pageSize = 12;

  const counts = {
    total: localMembers.length,
    today: localMembers.filter((item:any)=>String(item.registeredAt || item.createdAt || "").slice(0,10) === today).length,
    pending: localMembers.filter((item:any)=>item.status === "pending").length,
    approved: localMembers.filter((item:any)=>item.status === "approved").length,
    rejected: localMembers.filter((item:any)=>item.status === "rejected").length
  };

  const deptsMap = new Map<string, number>();
  localMembers.forEach((m: any) => {
    const d = m.department || "Other";
    deptsMap.set(d, (deptsMap.get(d) || 0) + 1);
  });
  const deptData = Array.from(deptsMap.entries())
    .map(([name, count]) => ({ name: name.length > 15 ? name.slice(0, 12) + "..." : name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const yearsMap = new Map<string, number>();
  localMembers.forEach((m: any) => {
    const y = m.year || "Unknown";
    yearsMap.set(y, (yearsMap.get(y) || 0) + 1);
  });
  const yearData = Array.from(yearsMap.entries()).map(([name, count]) => ({ name, count }));

  const interestsMap = new Map<string, number>();
  localMembers.forEach((m: any) => {
    const ints = m.interests || [];
    ints.forEach((i: string) => {
      interestsMap.set(i, (interestsMap.get(i) || 0) + 1);
    });
  });
  const interestData = Array.from(interestsMap.entries())
    .map(([name, count]) => ({ name: name.length > 15 ? name.slice(0, 12) + "..." : name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Group registrations by day for the last 14 days
  const dailyRegistrationData = useMemo(() => {
    const result: { date: string; count: number; _rawDate: string }[] = [];
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      result.push({
        date: new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        count: 0,
        _rawDate: dateStr
      });
    }
    localMembers.forEach((m: any) => {
      const regDate = String(m.registeredAt || m.createdAt || "").slice(0, 10);
      const entry = result.find((r) => r._rawDate === regDate);
      if (entry) entry.count += 1;
    });
    return result;
  }, [localMembers]);

  // High-speed Command bar filter query parser
  const searchParsed = useMemo(() => {
    let parsedStatus = statusFilter;
    let parsedDept = deptFilter;
    let parsedYear = yearFilter;
    let plainQuery = query;

    const statusMatch = query.match(/status:(\S+)/i);
    if (statusMatch) {
      parsedStatus = statusMatch[1].toLowerCase();
      plainQuery = plainQuery.replace(/status:\S+/i, "");
    }

    const deptMatch = query.match(/dept:(\S+)/i);
    if (deptMatch) {
      parsedDept = deptMatch[1].toLowerCase();
      plainQuery = plainQuery.replace(/dept:\S+/i, "");
    }

    const yearMatch = query.match(/year:(\S+)/i);
    if (yearMatch) {
      parsedYear = yearMatch[1].toLowerCase();
      if (parsedYear === "1" || parsedYear === "1st") parsedYear = "1st";
      else if (parsedYear === "2" || parsedYear === "2nd") parsedYear = "2nd";
      else if (parsedYear === "3" || parsedYear === "3rd") parsedYear = "3rd";
      else if (parsedYear === "4" || parsedYear === "4th") parsedYear = "4th";
      else if (parsedYear === "5" || parsedYear === "5th") parsedYear = "5th";
      plainQuery = plainQuery.replace(/year:\S+/i, "");
    }

    return {
      status: parsedStatus,
      dept: parsedDept,
      year: parsedYear,
      search: plainQuery.trim()
    };
  }, [query, statusFilter, deptFilter, yearFilter]);

  const filtered = useMemo(() => {
    return localMembers.filter((m: any) => {
      if (searchParsed.status !== "all") {
        if (m.status !== searchParsed.status) return false;
      }
      if (searchParsed.dept !== "all") {
        const deptValue = (m.department || "").toLowerCase();
        if (!deptValue.includes(searchParsed.dept)) return false;
      }
      if (searchParsed.year !== "all") {
        const yearValue = (m.year || "").toLowerCase();
        if (!yearValue.includes(searchParsed.year)) return false;
      }
      if (searchParsed.search) {
        const hay = `${m.fullName} ${m.uid} ${m.email} ${m.phone} ${m.department}`.toLowerCase();
        if (!hay.includes(searchParsed.search.toLowerCase())) return false;
      }
      return true;
    });
  }, [localMembers, searchParsed]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice(page * pageSize, page * pageSize + pageSize);

  const exportUrl = `/api/membership/export?${new URLSearchParams(
    Object.entries({
      status: statusFilter !== "all" ? statusFilter : "",
      department: deptFilter !== "all" ? deptFilter : "",
      year: yearFilter !== "all" ? yearFilter : "",
      search: query
    }).filter(([, v]) => v)
  ).toString()}`;

  // Interactive CLI Excel Export Animation trigger
  function handleExcelExport() {
    if (soundsEnabled) playClickSound();
    
    setExportState({
      show: true,
      progress: 0,
      lines: ["$ export --dataset student_members --format xlsx"]
    });

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      setExportState(prev => {
        if (!prev) return null;
        return {
          ...prev,
          progress: currentProgress
        };
      });

      if (currentProgress >= 100) {
        clearInterval(interval);
        if (soundsEnabled) playSuccessSound();
        setExportState(prev => {
          if (!prev) return null;
          return {
            ...prev,
            lines: [...prev.lines, "Success: StudentMembers.xlsx generated."]
          };
        });

        // Trigger dynamic download
        const a = document.createElement("a");
        a.href = exportUrl;
        a.click();
      }
    }, 120);
  }

  function toggle(id: string) {
    if (soundsEnabled) playClickSound();
    setSelected((state) => (state.includes(id) ? state.filter((x) => x !== id) : [...state, id]));
  }
  
  function toggleAll() {
    if (soundsEnabled) playClickSound();
    setSelected(selected.length === visible.length ? [] : visible.map((x: any) => idOf(x)));
  }

  // Optimistic single member status update
  async function updateMemberStatus(member: any, newStatus: "approved" | "rejected") {
    if (soundsEnabled) playClickSound();
    const oldStatus = member.status;

    // Optimistic UI state update
    setLocalMembers(prev => prev.map(m => idOf(m) === idOf(member) ? { ...m, status: newStatus } : m));

    try {
      const res = await fetch(`/api/admin/studentMembers/${idOf(member)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, approvedAt: newStatus === "approved" ? new Date() : undefined })
      });
      if (!res.ok) throw new Error();
      if (soundsEnabled) playSuccessSound();
      setPanel(`Student ${newStatus} successfully.`);
      void refresh();
    } catch (err) {
      // Revert status
      setLocalMembers(prev => prev.map(m => idOf(m) === idOf(member) ? { ...m, status: oldStatus } : m));
      setPanel("Update failed. Reverted changes.");
    }
  }

  // Optimistic bulk actions
  async function bulkActionOptimistic(action: "approve" | "reject") {
    if (!selected.length) return;
    if (soundsEnabled) playClickSound();
    setBulkBusy(true);

    const status = action === "approve" ? "approved" : "rejected";
    const oldMembers = [...localMembers];

    // Optimistic UI state update
    setLocalMembers(prev => prev.map(m => selected.includes(idOf(m)) ? { ...m, status } : m));

    try {
      const res = await fetch("/api/membership/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ids: selected })
      });
      setBulkBusy(false);
      if (!res.ok) throw new Error();
      if (soundsEnabled) playSuccessSound();
      setSelected([]);
      setPanel(`Bulk ${action} successful.`);
      void refresh();
    } catch (err) {
      setBulkBusy(false);
      setLocalMembers(oldMembers);
      setPanel("Bulk action failed. Reverted changes.");
    }
  }

  const tabClass = (tab: typeof activeTab) =>
    `flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-semibold transition ${
      activeTab === tab
        ? "border-violet-200/35 bg-violet-500/18 text-white shadow-[0_0_20px_rgba(139,92,246,0.15)]"
        : "border-white/[.08] bg-white/[.035] text-white/50 hover:text-white hover:border-white/20"
    }`;

  const deptsList = Array.from(new Set(localMembers.map((m: any) => m.department).filter(Boolean))) as string[];
  const yearsList = ["1st", "2nd", "3rd", "4th", "5th"];

  return (
    <div className="mt-7 flex flex-col min-w-0 overflow-hidden">
      <div className="mb-6 flex flex-wrap gap-4 items-center justify-between border-b border-white/[.06] pb-4">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => { setActiveTab("dashboard"); }} className={tabClass("dashboard")}>
            <BarChart3 size={14} />
            <span>Dashboard</span>
          </button>
          <button onClick={() => { setActiveTab("members"); setPage(0); }} className={tabClass("members")}>
            <ClipboardList size={14} />
            <span>Members List ({filtered.length})</span>
          </button>
        </div>
        
        {/* Tactile Sound Effects Toggle */}
        <button
          onClick={() => {
            const next = !soundsEnabled;
            setSoundsEnabled(next);
            if (next) playClickSound();
          }}
          className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.035] hover:bg-white/[0.08] active:scale-95 px-4 py-2 text-xs font-semibold text-white/50 hover:text-white transition"
        >
          {soundsEnabled ? <Volume2 size={14} className="text-blue-400" /> : <VolumeX size={14} className="text-white/40" />}
          <span>Audio: {soundsEnabled ? "Tactile ON" : "Tactile OFF"}</span>
        </button>
      </div>

      {activeTab === "dashboard" && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-200">
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            {[
              ["Total Registered", counts.total, "border-violet-500/20 text-violet-200 bg-violet-500/[0.02]"],
              ["Today's Sign-ups", counts.today, "border-fuchsia-500/20 text-fuchsia-200 bg-fuchsia-500/[0.02]"],
              ["Pending Approval", counts.pending, "border-white/10 text-white/60 bg-white/[0.01]"],
              ["Approved Members", counts.approved, "border-blue-500/20 text-blue-200 bg-blue-500/[0.02]"],
              ["Rejected Entries", counts.rejected, "border-rose-500/20 text-rose-200 bg-rose-500/[0.02]"]
            ].map(([label, value, styles]: any) => (
              <div className={`portal-card rounded-2xl p-4 border ${styles}`} key={label}>
                <p className="text-[10px] uppercase tracking-[.12em] text-white/35 font-medium">{label}</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            
            {/* Daily Registrations Area Chart */}
            <div className="portal-chart-card rounded-2xl border border-white/[.08] bg-white/[0.02] p-5 md:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Registration Activity (Last 14 Days)</h3>
                <span className="text-[10px] text-white/40 font-semibold uppercase tracking-wider bg-white/[0.03] border border-white/[0.05] rounded-full px-2.5 py-0.5">Live Feed</span>
              </div>
              {dailyRegistrationData.some(d => d.count > 0) ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyRegistrationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={9} tickLine={false} />
                      <YAxis stroke="rgba(255,255,255,0.3)" fontSize={9} tickLine={false} allowDecimals={false} />
                      <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                      <Tooltip contentStyle={{ background: "#0c0617", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, fontSize: 10 }} />
                      <Area type="monotone" dataKey="count" stroke="#a855f7" strokeWidth={2.5} fillOpacity={1} fill="url(#regGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-xs text-white/40 text-center py-10">No recent registration activity recorded.</p>
              )}
            </div>

            <div className="portal-chart-card rounded-2xl border border-white/[.08] bg-white/[0.02] p-5">
              <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">Department-wise Distribution</h3>
              {deptData.length ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={deptData}>
                      <defs>
                        <linearGradient id="deptGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ec4899" stopOpacity={0.9}/>
                          <stop offset="100%" stopColor="#a855f7" stopOpacity={0.3}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} />
                      <Tooltip contentStyle={{ background: "#111016", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }} />
                      <Bar dataKey="count" fill="url(#deptGrad)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-xs text-white/40 text-center py-10">No data available.</p>
              )}
            </div>

            <div className="portal-chart-card rounded-2xl border border-white/[.08] bg-white/[0.02] p-5">
              <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">Top Technical/Creative Interests</h3>
              {interestData.length ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={interestData} layout="vertical">
                      <defs>
                        <linearGradient id="interestGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8}/>
                          <stop offset="100%" stopColor="#ec4899" stopOpacity={0.8}/>
                        </linearGradient>
                      </defs>
                      <XAxis type="number" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} />
                      <Tooltip contentStyle={{ background: "#111016", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }} />
                      <Bar dataKey="count" fill="url(#interestGrad)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-xs text-white/40 text-center py-10">No data available.</p>
              )}
            </div>
          </div>
          
          <div className="portal-card rounded-2xl border border-white/[.08] bg-white/[0.02] p-5">
            <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">Academic Year Breakdowns</h3>
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-5">
              {yearsList.map((y) => {
                const val = yearData.find((x) => x.name === y)?.count || 0;
                return (
                  <div key={y} className="border border-white/[0.05] rounded-xl p-4 bg-white/[0.01]">
                    <p className="text-[10px] text-white/40 uppercase font-semibold">{y} Year</p>
                    <p className="mt-2 text-2xl font-semibold">{val}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === "members" && (
        <div className="flex flex-col gap-4 animate-in fade-in duration-200">
          
          <div className="glass rounded-xl p-5 border border-white/[.06] bg-black/10">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
              <div>
                <p className="text-sm font-semibold">Active Student Roster</p>
                <p className="mt-1 text-xs text-white/38">Apply queries, filter by verification status, target specific academic years or departments, and export reports.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={handleExcelExport} 
                  className="portal-command-button rounded-2xl px-4 py-2.5 text-xs font-semibold hover:scale-[1.02] transition active:scale-95 bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-600/10"
                >
                  Export Excel
                </button>
              </div>
            </div>

            {/* Filter Inputs Grid */}
            <div className="mt-4 grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
              <label className="portal-search flex items-center gap-3 rounded-2xl px-4 py-3 text-white/40 border border-white/[.07] bg-black/30 md:col-span-1">
                <Search size={14}/>
                <input
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setPage(0); }}
                  placeholder="Type queries or year:3 dept:cse status:pending..."
                  className="w-full bg-transparent text-xs text-white outline-none placeholder:text-white/25"
                />
              </label>

              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                className="rounded-2xl border border-white/[.08] bg-black/35 px-4 py-3 text-xs text-white/70 outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={deptFilter}
                onChange={(e) => { setDeptFilter(e.target.value); setPage(0); }}
                className="rounded-2xl border border-white/[.08] bg-black/35 px-4 py-3 text-xs text-white/70 outline-none cursor-pointer"
              >
                <option value="all">All Departments</option>
                {deptsList.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              <select
                value={yearFilter}
                onChange={(e) => { setYearFilter(e.target.value); setPage(0); }}
                className="rounded-2xl border border-white/[.08] bg-black/35 px-4 py-3 text-xs text-white/70 outline-none cursor-pointer"
              >
                <option value="all">All Years</option>
                {yearsList.map((y) => (
                  <option key={y} value={y}>{y} Year</option>
                ))}
              </select>
            </div>
          </div>

          {selected.length > 0 && (
            <div className="flex items-center gap-3 rounded-2xl border border-violet-500/20 bg-violet-500/5 px-5 py-3 text-sm">
              <span className="font-medium text-violet-200">{selected.length} selected</span>
              <div className="h-4 w-px bg-white/10" />
              <button
                type="button"
                onClick={() => bulkActionOptimistic("approve")}
                disabled={bulkBusy}
                className="text-xs font-semibold text-blue-400 hover:underline disabled:opacity-50"
              >
                Approve Selected
              </button>
              <button
                type="button"
                onClick={() => bulkActionOptimistic("reject")}
                disabled={bulkBusy}
                className="text-xs font-semibold text-rose-400 hover:underline disabled:opacity-50"
              >
                Reject Selected
              </button>
            </div>
          )}

          <div className="overflow-x-auto rounded-2xl border border-white/[.08]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/[.08] bg-white/[.015] font-semibold text-white/50">
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      checked={selected.length === visible.length && visible.length > 0}
                      onChange={toggleAll}
                      className="rounded bg-black border-white/20 text-violet-500 focus:ring-violet-500"
                    />
                  </th>
                  <th className="p-4">Name</th>
                  <th className="p-4">UID</th>
                  <th className="p-4">Department / Year</th>
                  <th className="p-4">Email / Phone</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.length ? (
                  visible.map((m: any) => (
                    <tr key={idOf(m)} className="border-b border-white/[.05] hover:bg-white/[0.015] transition">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selected.includes(idOf(m))}
                          onChange={() => toggle(idOf(m))}
                          className="rounded bg-black border-white/20 text-violet-500 focus:ring-violet-500"
                        />
                      </td>
                      <td className="p-4 font-semibold text-white">{m.fullName}</td>
                      <td className="p-4 font-mono text-white/70">{m.uid}</td>
                      <td className="p-4">
                        <div className="text-white/80">{m.department}</div>
                        <div className="text-[10px] text-white/40 mt-0.5">{m.year} Year {m.section ? `/ Sec ${m.section}` : ""}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-white/80">{m.email}</div>
                        <div className="text-[10px] text-white/40 mt-0.5">{m.phone}</div>
                      </td>
                      <td className="p-4">
                        <span className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider transition-all duration-300 ${
                          m.status === "approved"
                            ? "bg-blue-400/10 text-blue-400"
                            : m.status === "rejected"
                            ? "bg-rose-400/10 text-rose-400"
                            : "bg-white/10 text-white/60"
                        }`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2 text-white">
                        <button
                          type="button"
                          onClick={() => {
                            if (soundsEnabled) playClickSound();
                            setDetailMember(m);
                          }}
                          className="text-[10px] font-bold text-violet-300 hover:text-violet-100 uppercase transition"
                        >
                          View
                        </button>
                        {m.status === "pending" && (
                          <>
                            <button
                              type="button"
                              onClick={() => updateMemberStatus(m, "approved")}
                              className="text-[10px] font-bold text-blue-400 hover:text-blue-200 uppercase transition"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => updateMemberStatus(m, "rejected")}
                              className="text-[10px] font-bold text-rose-400 hover:text-rose-200 uppercase transition"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            if (soundsEnabled) playClickSound();
                            remove("studentMembers", m);
                          }}
                          className="text-[10px] font-bold text-white/30 hover:text-rose-400 uppercase transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-white/40">
                      No matching student members found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-white/40 font-semibold uppercase">Page {page + 1} of {pages}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page === 0}
                  onClick={() => {
                    if (soundsEnabled) playClickSound();
                    setPage(page - 1);
                  }}
                  className="portal-mini-button rounded-xl p-2.5 text-white/55 transition hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  type="button"
                  disabled={page === pages - 1}
                  onClick={() => {
                    if (soundsEnabled) playClickSound();
                    setPage(page + 1);
                  }}
                  className="portal-mini-button rounded-xl p-2.5 text-white/55 transition hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {detailMember && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="max-w-lg w-full rounded-3xl border border-white/10 bg-[#111016] p-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/[0.06] pb-4 mb-6">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">Member Details</h3>
              <button
                type="button"
                onClick={() => {
                  if (soundsEnabled) playClickSound();
                  setDetailMember(null);
                }}
                className="text-xs text-white/40 hover:text-white"
              >
                Close
              </button>
            </div>
            
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">Full Name</p>
                  <p className="mt-1 text-sm font-semibold text-white">{detailMember.fullName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">University UID</p>
                  <p className="mt-1 text-sm font-semibold text-white font-mono">{detailMember.uid}</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">Email</p>
                  <p className="mt-1 text-white">{detailMember.email}</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">Phone</p>
                  <p className="mt-1 text-white">{detailMember.phone}</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">Department</p>
                  <p className="mt-1 text-white">{detailMember.department}</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">Year / Section</p>
                  <p className="mt-1 text-white">{detailMember.year} Year {detailMember.section ? `/ Section ${detailMember.section}` : ""}</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">Gender</p>
                  <p className="mt-1 text-white uppercase">{detailMember.gender || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">Registration Source</p>
                  <p className="mt-1 text-white uppercase tracking-wider">{detailMember.source || "online"}</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wider mb-2">Interests</p>
                <div className="flex flex-wrap gap-1.5">
                  {(detailMember.interests || []).map((interest: string) => (
                    <span key={interest} className="rounded-full border border-violet-500/20 bg-violet-500/5 px-2.5 py-1 text-[9px] font-semibold text-violet-200">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-t border-white/[0.06] pt-4 mt-6">
                <label className="block text-[10px] text-white/40 font-semibold uppercase tracking-wider mb-2">Internal Remarks</label>
                <textarea
                  defaultValue={detailMember.adminRemarks || ""}
                  placeholder="Add internal notes about this student member..."
                  onBlur={(e) => {
                    void patch("studentMembers", detailMember, { adminRemarks: e.target.value }, "Remarks updated");
                  }}
                  className="w-full rounded-xl border border-white/[0.08] bg-black/20 p-3 text-white text-xs outline-none focus:border-violet-500/50"
                  rows={4}
                />
                <p className="text-[9px] text-white/30 mt-1">Changes are saved automatically when you click outside the text area.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Terminal style Export animation overlay */}
      {exportState && exportState.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0d071a] p-6 font-mono text-xs text-blue-400 shadow-[0_0_50px_rgba(139,92,246,0.15),inset_0_0_15px_rgba(0,0,0,0.8)] relative overflow-hidden">
            {/* Holographic matrix background drop */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.015)_50%,_rgba(0,0,0,0)_50%)] bg-[length:100%_4px] pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4 text-white/40 text-[10px]">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-ping" />
                <span>SHELL ENGINE v1.0.4</span>
              </span>
              <button 
                onClick={() => setExportState(null)} 
                className="text-white/40 hover:text-white transition"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3 select-none">
              {exportState.lines.map((line, idx) => (
                <p key={idx} className={line.startsWith("$") ? "text-white/80" : "text-blue-400 font-bold"}>
                  {line}
                </p>
              ))}
              
              {exportState.progress < 100 ? (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] text-blue-400/50">
                    <span>compiling roster dataset...</span>
                    <span>{exportState.progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-black/40 border border-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-teal-400 rounded-full transition-all duration-100"
                      style={{ width: `${exportState.progress}%` }}
                    />
                  </div>
                  <p className="text-white/30 text-[9px]">
                    [{ "█".repeat(Math.floor(exportState.progress / 5)) }
                    { " ".repeat(20 - Math.floor(exportState.progress / 5)) }]
                  </p>
                </div>
              ) : (
                <div className="animate-in fade-in duration-300">
                  <div className="h-2 w-full bg-black/40 border border-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full w-full" />
                  </div>
                  <p className="text-blue-500 text-[9px] mt-1.5">[████████████████████]</p>
                  
                  <div className="mt-4 border-t border-blue-500/10 pt-3 flex flex-col gap-2">
                    <p className="text-blue-300 text-[11px] font-bold">
                      ✓ Download compiled successfully.
                    </p>
                    <button 
                      onClick={() => setExportState(null)}
                      className="mt-2 w-full rounded-xl border border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-2 text-center text-xs font-semibold text-blue-300 transition active:scale-[0.98]"
                    >
                      Dismiss Console
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
