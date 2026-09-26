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

export function RecruitmentDesk({data,open,patch,remove,refresh,setPanel}:{data:Data;open:(drawer:any)=>void;patch:(resource:Resource,item:any,body:Record<string, any>,message:string)=>void;remove:(resource:Resource,item:any)=>void;refresh:()=>Promise<void>;setPanel:(value:string)=>void}) {
  const applications = data.recruitmentApplications || [];
  const teams = data.recruitmentTeams || [];
  const roles = data.recruitmentRoles || [];
  const questions = data.recruitmentQuestions || [];
  const settings = data.recruitmentSettings?.[0];
  const today = new Date().toISOString().slice(0, 10);
  
  const [activeTab, setActiveTab] = useState<"applications" | "structure" | "analytics">("applications");
  const [query,setQuery]=useState("");
  const [statusFilter,setStatusFilter]=useState("all");
  const [teamFilter,setTeamFilter]=useState("all");
  const [roleFilter,setRoleFilter]=useState("all");
  const [dateFrom,setDateFrom]=useState("");
  const [dateTo,setDateTo]=useState("");
  const [sortKey,setSortKey]=useState<"submittedAt"|"fullName"|"uid"|"team"|"role"|"email"|"phone"|"status">("submittedAt");
  const [sortDir,setSortDir]=useState<"asc"|"desc">("desc");
  const [page,setPage]=useState(0);
  const [selected,setSelected]=useState<string[]>([]);
  const [profile,setProfile]=useState<any>(null);
  const [bulkBusy,setBulkBusy]=useState(false);
  const pageSize = 12;
  
  const counts = {
    total: applications.length,
    today: applications.filter((item:any)=>String(item.submittedAt || item.createdAt || "").slice(0,10) === today).length,
    pending: applications.filter((item:any)=>item.status === "pending").length,
    shortlisted: applications.filter((item:any)=>item.status === "shortlisted").length,
    accepted: applications.filter((item:any)=>item.status === "accepted").length,
    rejected: applications.filter((item:any)=>item.status === "rejected").length,
    onHold: applications.filter((item:any)=>item.status === "on_hold").length
  };
  
  const byTeam = teams.map((team:any)=>({name:team.name,count:applications.filter((item:any)=>idOf(item.team)===idOf(team)).length}));
  const byRole = roles.map((role:any)=>({name:role.name,count:applications.filter((item:any)=>idOf(item.role)===idOf(role)).length})).sort((a:any,b:any)=>b.count-a.count).slice(0,8);
  
  const daily = useMemo(()=>{
    const map = new Map<string, number>();
    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      map.set(day.toISOString().slice(0, 10), 0);
    }
    applications.forEach((item:any)=>{
      const key = String(item.submittedAt || item.createdAt || "").slice(0,10);
      if (map.has(key)) map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map.entries()).map(([day,count])=>({day:day.slice(5),count}));
  },[applications]);
  
  function submittedDate(item:any) {
    return String(item.submittedAt || item.createdAt || "");
  }
  
  function sortValue(item:any) {
    if (sortKey === "team" || sortKey === "role") return valueOf(item, sortKey).toLowerCase();
    return String(sortKey === "submittedAt" ? submittedDate(item) : item[sortKey] || "").toLowerCase();
  }
  
  const filtered = useMemo(()=>applications.filter((item:any)=>{
    const hay = `${item.fullName} ${item.email} ${item.uid} ${valueOf(item,"team")} ${valueOf(item,"role")}`.toLowerCase();
    if (query && !hay.includes(query.toLowerCase())) return false;
    if (statusFilter !== "all" && item.status !== statusFilter) return false;
    if (teamFilter !== "all" && idOf(item.team) !== teamFilter) return false;
    if (roleFilter !== "all" && idOf(item.role) !== roleFilter) return false;
    const submitted = submittedDate(item).slice(0,10);
    if (dateFrom && submitted < dateFrom) return false;
    if (dateTo && submitted > dateTo) return false;
    return true;
  }).sort((a:any,b:any)=>{
    const direction = sortDir === "asc" ? 1 : -1;
    return sortValue(a).localeCompare(sortValue(b), undefined, { numeric: true, sensitivity: "base" }) * direction;
  }),[applications,query,statusFilter,teamFilter,roleFilter,dateFrom,dateTo,sortKey,sortDir]);
  
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice(page * pageSize, page * pageSize + pageSize);
  const exportHref = `/api/recruitment/export?${new URLSearchParams(Object.entries({team:teamFilter!=="all"?teamFilter:"",role:roleFilter!=="all"?roleFilter:"",status:statusFilter!=="all"?statusFilter:"",from:dateFrom,to:dateTo,search:query,sortKey:sortKey,sortDir:sortDir}).filter(([,v])=>v)).toString()}`;
  
  function toggle(id:string){setSelected((state)=>state.includes(id)?state.filter((item)=>item!==id):[...state,id]);}
  function toggleAll(){setSelected(selected.length===visible.length?[]:visible.map((item:any)=>idOf(item)));}
  
  function sortBy(key: typeof sortKey) {
    if (sortKey === key) {
      setSortDir((value)=>value === "asc" ? "desc" : "asc");
      return;
    }
    setSortKey(key);
    setSortDir(key === "submittedAt" ? "desc" : "asc");
  }
  
  function statusBadge(status: string) {
    return `h-fit rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.14em] ${status==="accepted"?"bg-blue-400/10 text-blue-200":status==="rejected"?"bg-rose-400/10 text-rose-200":status==="shortlisted"?"bg-violet-400/10 text-violet-100":status==="on_hold"?"bg-amber-400/10 text-amber-100":"bg-white/[.06] text-white/45"}`;
  }
  
  function SortButton({column,label}:{column:typeof sortKey;label:string}) {
    return <button type="button" onClick={()=>sortBy(column)} className="inline-flex items-center gap-1 text-left uppercase tracking-wider text-white/35 hover:text-white/70">{label}<ArrowUpDown size={11} className={sortKey===column?"text-violet-200":"text-white/25"}/></button>;
  }
  
  async function bulk(action:"accept"|"reject"|"shortlist"|"hold"|"delete"){
    if (!selected.length) return;
    const count = selected.length;
    if (action === "delete" && !window.confirm(`Are you sure you want to permanently delete ${count} application(s)? This cannot be undone.`)) return;
    setBulkBusy(true);
    const res = await fetch("/api/recruitment/bulk",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action,ids:selected})});
    setBulkBusy(false);
    if (!res.ok){setPanel("Bulk action failed.");return;}
    setSelected([]);
    await refresh();
    setPanel(action === "delete" ? `Permanently deleted ${count} application(s).` : `Bulk ${action} completed for ${count} applications.`);
  }

  const tabClass = (tab: typeof activeTab) =>
    `flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-semibold transition ${
      activeTab === tab
        ? "border-violet-200/35 bg-violet-500/18 text-white shadow-[0_0_20px_rgba(139,92,246,0.15)]"
        : "border-white/[.08] bg-white/[.035] text-white/50 hover:text-white hover:border-white/20"
    }`;

  return (
    <div className="mt-7 flex flex-col min-w-0 overflow-hidden">
      
      {/* Sub-tab Navigation */}
      <div className="mb-6 flex flex-wrap gap-2 border-b border-white/[.06] pb-4">
        <button onClick={() => { setActiveTab("applications"); setPage(0); }} className={tabClass("applications")}>
          <ClipboardList size={14} />
          <span>Applications Desk ({filtered.length})</span>
        </button>
        <button onClick={() => setActiveTab("structure")} className={tabClass("structure")}>
          <SlidersHorizontal size={14} />
          <span>Structure & Setup</span>
        </button>
        <button onClick={() => setActiveTab("analytics")} className={tabClass("analytics")}>
          <BarChart3 size={14} />
          <span>Analytics & Demand</span>
        </button>
      </div>

      {/* Main Tab Panels */}
      {activeTab === "applications" && (
        <div className="flex flex-col gap-4 animate-in fade-in duration-200">
          {/* Metrics summary */}
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
            {[
              ["Total", counts.total, "border-violet-500/20 text-violet-200 bg-violet-500/[0.02]"],
              ["Today", counts.today, "border-fuchsia-500/20 text-fuchsia-200 bg-fuchsia-500/[0.02]"],
              ["Pending", counts.pending, "border-white/10 text-white/60 bg-white/[0.01]"],
              ["Shortlisted", counts.shortlisted, "border-violet-400/20 text-violet-100 bg-violet-400/[0.02]"],
              ["Accepted", counts.accepted, "border-blue-500/20 text-blue-200 bg-blue-500/[0.02]"],
              ["Rejected", counts.rejected, "border-rose-500/20 text-rose-200 bg-rose-500/[0.02]"],
              ["On hold", counts.onHold, "border-amber-500/20 text-amber-200 bg-amber-500/[0.02]"]
            ].map(([label, value, styles]: any) => (
              <div className={`portal-card rounded-2xl p-4 border ${styles} transition duration-200 hover:-translate-y-0.5`} key={label}>
                <p className="text-[10px] uppercase tracking-[.12em] text-white/35 font-medium">{label}</p>
                <p className="mt-2 text-3xl font-bold tracking-[-.05em]">{value}</p>
              </div>
            ))}
          </div>

          {/* Roster & Filters panel */}
          <div className="glass rounded-xl p-5 border border-white/[.06] bg-black/10">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
              <div>
                <p className="text-sm font-semibold">Active Roster</p>
                <p className="mt-1 text-xs text-white/38">Apply queries, filter status, target specific teams or roles, and run batch status transitions.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <a href={exportHref} className="portal-command-button rounded-2xl px-4 py-2.5 text-xs font-semibold hover:scale-[1.02] transition active:scale-95">
                  Export Excel
                </a>
              </div>
            </div>

            {/* Filter Inputs Grid */}
            <div className="mt-4 grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
              <label className="portal-search flex items-center gap-3 rounded-2xl px-4 py-3 text-white/40 border border-white/[.07] bg-black/30">
                <Search size={14}/>
                <input value={query} onChange={(e)=>{setQuery(e.target.value);setPage(0);}} placeholder="Search name, email, UID..." className="w-full bg-transparent text-xs text-white outline-none placeholder:text-white/25"/>
              </label>

              <select value={statusFilter} onChange={(e)=>{setStatusFilter(e.target.value);setPage(0);}} className="rounded-2xl border border-white/[.08] bg-black/35 px-4 py-3 text-xs text-white/70 outline-none cursor-pointer">
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="on_hold">On hold</option>
              </select>

              <select value={teamFilter} onChange={(e)=>{setTeamFilter(e.target.value);setPage(0);}} className="rounded-2xl border border-white/[.08] bg-black/35 px-4 py-3 text-xs text-white/70 outline-none cursor-pointer">
                <option value="all">All teams</option>
                {teams.map((team:any)=><option key={idOf(team)} value={idOf(team)}>{team.name}</option>)}
              </select>

              <select value={roleFilter} onChange={(e)=>{setRoleFilter(e.target.value);setPage(0);}} className="rounded-2xl border border-white/[.08] bg-black/35 px-4 py-3 text-xs text-white/70 outline-none cursor-pointer">
                <option value="all">All roles</option>
                {roles.map((role:any)=><option key={idOf(role)} value={idOf(role)}>{role.name}</option>)}
              </select>

              <div className="flex flex-col">
                <input value={dateFrom} onChange={(e)=>{setDateFrom(e.target.value);setPage(0);}} type="date" className="rounded-2xl border border-white/[.08] bg-black/35 px-4 py-2.5 text-xs text-white/70 outline-none w-full cursor-pointer"/>
              </div>

              <div className="flex flex-col">
                <input value={dateTo} onChange={(e)=>{setDateTo(e.target.value);setPage(0);}} type="date" className="rounded-2xl border border-white/[.08] bg-black/35 px-4 py-2.5 text-xs text-white/70 outline-none w-full cursor-pointer"/>
              </div>
            </div>

            {/* Bulk Actions row */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/[.04] pt-4 text-xs text-white/45">
              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none text-white/60 hover:text-white transition">
                  <input type="checkbox" checked={visible.length>0 && selected.length===visible.length} onChange={toggleAll} className="rounded border-white/20 bg-black/40 text-violet-500 focus:ring-violet-500/50 cursor-pointer"/>
                  Select page
                </label>
                <div className="h-4 w-[1px] bg-white/[.08] hidden sm:block"></div>
                <button disabled={!selected.length||bulkBusy} onClick={()=>bulk("shortlist")} className="portal-link-action text-violet-200 border-violet-500/20 disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:bg-transparent">
                  Bulk shortlist
                </button>
                <button disabled={!selected.length||bulkBusy} onClick={()=>bulk("accept")} className="portal-link-action text-blue-200 border-blue-500/20 disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:bg-transparent">
                  Bulk accept
                </button>
                <button disabled={!selected.length||bulkBusy} onClick={()=>bulk("reject")} className="portal-link-action text-rose-200 border-rose-500/20 disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:bg-transparent">
                  Bulk reject
                </button>
                <button disabled={!selected.length||bulkBusy} onClick={()=>bulk("delete")} className="portal-link-action text-red-300 border-red-500/20 disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:bg-transparent">
                  <Trash2 size={12} className="mr-1"/> Bulk delete
                </button>
              </div>
              <span className="font-medium text-white/50">{filtered.length} candidates match filters</span>
            </div>

            {/* Roster Grid Table */}
            <div className="mt-4 max-h-[560px] overflow-auto rounded-xl border border-white/[.06] bg-[#0b050d]">
              <div className="hidden min-w-[1280px] grid-cols-[40px_1.5fr_1fr_1.2fr_1.2fr_1.5fr_1.1fr_1fr_1.1fr_auto] gap-3 bg-white/[.03] px-4 py-3.5 text-[10px] md:grid border-b border-white/[.05] items-center">
                <span></span>
                <SortButton column="fullName" label="Name"/>
                <SortButton column="uid" label="UID"/>
                <SortButton column="team" label="Team"/>
                <SortButton column="role" label="Role"/>
                <SortButton column="email" label="Email"/>
                <SortButton column="phone" label="Phone"/>
                <SortButton column="submittedAt" label="Applied"/>
                <SortButton column="status" label="Status"/>
                <span className="uppercase tracking-wider text-white/35 text-right pr-4">Actions</span>
              </div>

              {visible.map((item:any)=>(
                <div className="grid min-w-[1280px] gap-3 border-b border-white/[.04] bg-black/15 p-4 text-sm last:border-0 md:grid-cols-[40px_1.5fr_1fr_1.2fr_1.2fr_1.5fr_1.1fr_1fr_1.1fr_auto] md:items-center hover:bg-white/[.02] transition duration-150" key={idOf(item)}>
                  <input type="checkbox" checked={selected.includes(idOf(item))} onChange={()=>toggle(idOf(item))} className="rounded border-white/20 bg-black/40 text-violet-500 focus:ring-violet-500/50 cursor-pointer"/>
                  
                  <button onClick={()=>setProfile(item)} className="text-left group/name">
                    <p className="font-semibold text-white/80 group-hover/name:text-violet-200 transition">{item.fullName}</p>
                    <p className="mt-1 text-xs text-white/35">{item.course || "-"} / {item.branch || "-"}</p>
                  </button>

                  <span className="text-xs text-white/52 font-mono">{item.uid || "-"}</span>
                  <span className="text-xs text-white/52">{valueOf(item,"team") || "-"}</span>
                  <span className="text-xs text-white/52">{valueOf(item,"role") || "-"}</span>
                  <span className="break-all text-xs text-white/52 font-mono">{item.email || "-"}</span>
                  <span className="text-xs text-white/52 font-mono">{item.phone || "-"}</span>
                  <span className="text-xs text-white/52">{submittedDate(item) ? new Date(submittedDate(item)).toLocaleDateString("en-IN") : "-"}</span>
                  
                  <div>
                    <span className={statusBadge(item.status || "pending")}>
                      {String(item.status || "pending").replace("_"," ")}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 justify-end pr-1">
                    <button onClick={()=>setProfile(item)} className="portal-link-action text-sky-200 border-sky-500/20 hover:bg-sky-500/10">
                      <Eye size={12} className="mr-1"/> Details
                    </button>
                    <button onClick={()=>patch("recruitmentApplications",item,{status:"shortlisted"},"Application shortlisted.")} className="portal-link-action text-violet-200 border-violet-500/20 hover:bg-violet-500/10">
                      Shortlist
                    </button>
                    <button onClick={()=>patch("recruitmentApplications",item,{status:"accepted"},"Application accepted.")} className="portal-link-action text-blue-200 border-blue-500/20 hover:bg-blue-500/10">
                      <Check size={12} className="mr-1"/> Accept
                    </button>
                    <button onClick={()=>patch("recruitmentApplications",item,{status:"on_hold"},"Application moved on hold.")} className="portal-link-action text-amber-200 border-amber-500/20 hover:bg-amber-500/10">
                      Hold
                    </button>
                    <button onClick={()=>patch("recruitmentApplications",item,{status:"rejected"},"Application rejected.")} className="portal-link-action text-rose-200 border-rose-500/20 hover:bg-rose-500/10">
                      <X size={12} className="mr-1"/> Reject
                    </button>
                    <button onClick={()=>{if(window.confirm(`Delete ${item.fullName}'s application permanently?`))remove("recruitmentApplications",item)}} className="portal-link-action text-red-300 border-red-500/20 hover:bg-red-500/10">
                      <Trash2 size={12} className="mr-1"/> Delete
                    </button>
                  </div>
                </div>
              ))}
              {!filtered.length && (
                <div className="p-8 text-center text-sm text-white/45 bg-black/5 flex flex-col items-center justify-center gap-2">
                  <Info size={20} className="text-white/20" />
                  <p>No candidate records match your query.</p>
                </div>
              )}
            </div>

            {/* Pagination panel */}
            <div className="mt-4 flex items-center justify-between gap-3 text-xs text-white/45 bg-black/20 p-3 rounded-xl border border-white/[.04]">
              <button disabled={page<=0} onClick={()=>setPage((value)=>Math.max(value-1,0))} className="portal-mini-button rounded-full px-4 py-2 disabled:opacity-40 hover:bg-white/[.08] transition flex items-center gap-1">
                <ChevronLeft size={14}/> Previous
              </button>
              <span className="font-semibold text-white/60">Page {page+1} / {pages}</span>
              <button disabled={page>=pages-1} onClick={()=>setPage((value)=>Math.min(value+1,pages-1))} className="portal-mini-button rounded-full px-4 py-2 disabled:opacity-40 hover:bg-white/[.08] transition flex items-center gap-1">
                Next <ChevronRight size={14}/>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "structure" && (
        <div className="grid gap-6 xl:grid-cols-[280px_1fr] animate-in fade-in duration-200">
          
          {/* Left Column: Settings card & setup triggers */}
          <div className="flex flex-col gap-4">
            
            {/* Global configurations */}
            <div className="glass rounded-xl p-5 border border-white/[.06] bg-black/10">
              <div className="flex items-center gap-2 border-b border-white/[.06] pb-3 mb-4">
                <Settings2 className="text-violet-200" size={16}/>
                <p className="text-sm font-semibold">Global Settings</p>
              </div>
              
              <div className="flex flex-col gap-3 text-xs">
                <div className="flex justify-between items-center bg-black/20 p-2.5 rounded-lg border border-white/[0.02]">
                  <span className="text-white/45">Portal Status</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider ${settings?.status === "open" ? "bg-blue-500/10 text-blue-300 border border-blue-500/25" : "bg-rose-500/10 text-rose-300 border border-rose-500/25"}`}>
                    {settings?.status || "open"}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-black/20 p-2.5 rounded-lg border border-white/[0.02]">
                  <span className="text-white/45">Applications Limit</span>
                  <span className="text-white/70 font-semibold">{settings?.maximumApplications || "Unlimited"}</span>
                </div>
                <div className="flex justify-between items-center bg-black/20 p-2.5 rounded-lg border border-white/[0.02]">
                  <span className="text-white/45">Email Confirmations</span>
                  <span className="text-white/70 font-semibold">{settings?.confirmationEmailEnabled === "true" || settings?.confirmationEmailEnabled === true ? "Enabled" : "Disabled"}</span>
                </div>
                {settings?.whatsappGroupLink && (
                  <div className="flex flex-col bg-black/20 p-2.5 rounded-lg border border-white/[0.02] gap-1">
                    <span className="text-white/45">WhatsApp Group Link</span>
                    <span className="text-violet-300/80 truncate font-mono text-[10px] select-all cursor-pointer">{settings.whatsappGroupLink}</span>
                  </div>
                )}
              </div>
              
              <button onClick={()=>open({resource:"recruitmentSettings",title:"Recruitment settings",fields:extraFields.recruitmentSettings,item:settings,defaults:{status:"open",registrationEnabled:"true",autoCloseAfterDeadline:"true"}})} className="portal-command-button mt-4 w-full rounded-2xl py-3 text-xs font-semibold hover:scale-[1.02] active:scale-95 transition">
                Configure Settings
              </button>
            </div>

            {/* Quick adding triggers */}
            <div className="glass rounded-xl p-5 border border-white/[.06] bg-black/10">
              <div className="flex items-center gap-2 border-b border-white/[.06] pb-3 mb-4">
                <PlusCircle className="text-violet-200" size={16}/>
                <p className="text-sm font-semibold">New Entry</p>
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={()=>open({resource:"recruitmentTeams",title:"Add recruitment team",fields:extraFields.recruitmentTeams,defaults:{active:"true"}})} className="portal-mini-button rounded-xl py-2.5 px-3.5 text-left text-xs text-white/70 hover:text-white transition flex items-center justify-between hover:bg-white/[0.05]">
                  <span>Add Team</span>
                  <Plus size={14} className="text-white/35"/>
                </button>
                <button onClick={()=>open({resource:"recruitmentRoles",title:"Add recruitment role",fields:extraFields.recruitmentRoles,defaults:{active:"true"}})} className="portal-mini-button rounded-xl py-2.5 px-3.5 text-left text-xs text-white/70 hover:text-white transition flex items-center justify-between hover:bg-white/[0.05]">
                  <span>Add Role</span>
                  <Plus size={14} className="text-white/35"/>
                </button>
                <button onClick={()=>open({resource:"recruitmentQuestions",title:"Add team question",fields:extraFields.recruitmentQuestions,defaults:{type:"long_text",required:"true",active:"true"}})} className="portal-mini-button rounded-xl py-2.5 px-3.5 text-left text-xs text-white/70 hover:text-white transition flex items-center justify-between hover:bg-white/[0.05]">
                  <span>Add Form Question</span>
                  <Plus size={14} className="text-white/35"/>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: 3 sub-lists for Teams, Roles, Questions */}
          <div className="grid gap-4 md:grid-cols-3">
            
            {/* Teams */}
            <div className="glass rounded-xl p-5 border border-white/[.06] bg-black/10 flex flex-col h-[560px]">
              <div className="flex items-center justify-between border-b border-white/[.06] pb-3 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/50">Teams ({teams.length})</span>
                <button onClick={()=>open({resource:"recruitmentTeams",title:"Add recruitment team",fields:extraFields.recruitmentTeams,defaults:{active:"true"}})} className="text-[10px] text-violet-300 font-semibold hover:underline">
                  + Add New
                </button>
              </div>
              <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2">
                {teams.map((row:any)=>(
                  <div className="flex flex-col gap-2 rounded-xl border border-white/[.05] bg-black/30 p-3 text-xs" key={idOf(row)}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-white/80 truncate" title={row.name}>{row.name}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${row.active === "false" || row.active === false ? "bg-rose-500/10 text-rose-300 border border-rose-500/20" : "bg-blue-500/10 text-blue-300 border border-blue-500/20"}`}>
                        {row.active === "false" || row.active === false ? "Inactive" : "Active"}
                      </span>
                    </div>
                    {row.description && <p className="text-[10px] text-white/40 line-clamp-2 leading-relaxed">{row.description}</p>}
                    <div className="flex items-center justify-between border-t border-white/[.04] pt-2 mt-1">
                      <button onClick={()=>open({resource:"recruitmentTeams",title:"Edit Team",fields:extraFields.recruitmentTeams,item:row})} className="text-[10px] font-semibold text-violet-200/60 hover:text-violet-200 transition">
                        Edit Settings
                      </button>
                      <button onClick={()=>{if(window.confirm(`Are you sure you want to disable ${row.name}?`)) remove("recruitmentTeams",row)}} className="text-[10px] font-semibold text-rose-300/60 hover:text-rose-300 transition">
                        Disable
                      </button>
                    </div>
                  </div>
                ))}
                {!teams.length && <p className="text-xs text-white/35 py-6 text-center italic">No teams configured.</p>}
              </div>
            </div>

            {/* Roles */}
            <div className="glass rounded-xl p-5 border border-white/[.06] bg-black/10 flex flex-col h-[560px]">
              <div className="flex items-center justify-between border-b border-white/[.06] pb-3 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/50">Roles ({roles.length})</span>
                <button onClick={()=>open({resource:"recruitmentRoles",title:"Add recruitment role",fields:extraFields.recruitmentRoles,defaults:{active:"true"}})} className="text-[10px] text-violet-300 font-semibold hover:underline">
                  + Add New
                </button>
              </div>
              <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2">
                {roles.map((row:any)=>(
                  <div className="flex flex-col gap-2 rounded-xl border border-white/[.05] bg-black/30 p-3 text-xs" key={idOf(row)}>
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-white/80 line-clamp-1" title={row.name}>{row.name}</span>
                      <span className="text-[8px] px-1.5 py-0.5 rounded bg-white/[.04] text-white/40 uppercase font-mono max-w-[80px] truncate" title={valueOf(row,"team")}>
                        {valueOf(row,"team")}
                      </span>
                    </div>
                    {row.description && <p className="text-[10px] text-white/40 line-clamp-2 leading-relaxed">{row.description}</p>}
                    <div className="flex items-center justify-between border-t border-white/[.04] pt-2 mt-1">
                      <button onClick={()=>open({resource:"recruitmentRoles",title:"Edit Role",fields:extraFields.recruitmentRoles,item:row})} className="text-[10px] font-semibold text-violet-200/60 hover:text-violet-200 transition">
                        Edit Settings
                      </button>
                      <button onClick={()=>{if(window.confirm(`Are you sure you want to disable ${row.name}?`)) remove("recruitmentRoles",row)}} className="text-[10px] font-semibold text-rose-300/60 hover:text-rose-300 transition">
                        Disable
                      </button>
                    </div>
                  </div>
                ))}
                {!roles.length && <p className="text-xs text-white/35 py-6 text-center italic">No roles configured.</p>}
              </div>
            </div>

            {/* Questions */}
            <div className="glass rounded-xl p-5 border border-white/[.06] bg-black/10 flex flex-col h-[560px]">
              <div className="flex items-center justify-between border-b border-white/[.06] pb-3 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/50">Questions ({questions.length})</span>
                <button onClick={()=>open({resource:"recruitmentQuestions",title:"Add team question",fields:extraFields.recruitmentQuestions,defaults:{type:"long_text",required:"true",active:"true"}})} className="text-[10px] text-violet-300 font-semibold hover:underline">
                  + Add New
                </button>
              </div>
              <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2">
                {questions.map((row:any)=>(
                  <div className="flex flex-col gap-2 rounded-xl border border-white/[.05] bg-black/30 p-3 text-xs" key={idOf(row)}>
                    <span className="font-semibold text-white/80 line-clamp-2 leading-relaxed" title={row.label}>{row.label}</span>
                    
                    <div className="flex flex-wrap gap-1 items-center mt-1">
                      <span className="text-[8px] px-1.5 py-0.5 rounded bg-white/[0.04] text-white/40 uppercase font-mono max-w-[80px] truncate" title={valueOf(row,"team")}>
                        {valueOf(row,"team") || "Global"}
                      </span>
                      {row.role && (
                        <span className="text-[8px] px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-300 uppercase font-mono max-w-[80px] truncate" title={valueOf(row,"role")}>
                          {valueOf(row,"role")}
                        </span>
                      )}
                      <span className="text-[8px] px-1.5 py-0.5 rounded bg-blue-500/5 text-blue-300 font-mono">
                        {row.type}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/[.04] pt-2 mt-1">
                      <button onClick={()=>open({resource:"recruitmentQuestions",title:"Edit Question",fields:extraFields.recruitmentQuestions,item:row})} className="text-[10px] font-semibold text-violet-200/60 hover:text-violet-200 transition">
                        Edit Question
                      </button>
                      <button onClick={()=>{if(window.confirm(`Are you sure you want to disable this question?`)) remove("recruitmentQuestions",row)}} className="text-[10px] font-semibold text-rose-300/60 hover:text-rose-300 transition">
                        Disable
                      </button>
                    </div>
                  </div>
                ))}
                {!questions.length && <p className="text-xs text-white/35 py-6 text-center italic">No custom questions configured.</p>}
              </div>
            </div>

          </div>
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr] animate-in fade-in duration-200">
          
          {/* Left Side: Graphs */}
          <div className="flex flex-col gap-6">
            <div className="glass rounded-xl p-5 border border-white/[.06] bg-black/10">
              <div className="flex items-center justify-between border-b border-white/[.06] pb-4 mb-4">
                <div>
                  <p className="text-sm font-semibold">Daily Application Volume</p>
                  <p className="text-xs text-white/35 mt-0.5">Quantity of registration packets submitted over the trailing 7 days.</p>
                </div>
                <span className="rounded-full border border-violet-300/20 bg-violet-500/10 px-3 py-1 text-[9px] font-semibold tracking-[.18em] text-violet-200">
                  REALTIME
                </span>
              </div>
              <div className="h-64 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={daily}>
                    <XAxis dataKey="day" stroke="#ffffff44" fontSize={11} axisLine={false} tickLine={false}/>
                    <Tooltip contentStyle={{background:"#111016",border:"1px solid rgba(255,255,255,.08)",borderRadius:16}} cursor={{fill:"rgba(139,92,246,.04)"}}/>
                    <Bar dataKey="count" fill="url(#recruitmentBar)" radius={[8,8,0,0]}/>
                    <defs>
                      <linearGradient id="recruitmentBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f0abfc"/>
                        <stop offset="60%" stopColor="#8b5cf6"/>
                        <stop offset="100%" stopColor="#4c1d95"/>
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right Side: demand breakdown metrics */}
          <div className="grid gap-6 md:grid-cols-2">
            
            {/* Team demand shares */}
            <div className="glass rounded-xl p-5 border border-white/[.06] bg-black/10 flex flex-col max-h-[420px]">
              <div className="border-b border-white/[.06] pb-3 mb-4">
                <p className="text-sm font-semibold">Demand by Team</p>
                <p className="text-xs text-white/35 mt-0.5">Aggregate applicants target distribution across teams.</p>
              </div>
              <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3">
                {byTeam.map((row:any)=>{
                  const pct = counts.total > 0 ? Math.round((row.count / counts.total) * 100) : 0;
                  return (
                    <div className="flex flex-col gap-1.5" key={row.name}>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-medium text-white/80">{row.name}</span>
                        <span className="font-semibold text-violet-200">{row.count} ({pct}%)</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/[.04] overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-violet-400 to-fuchsia-400 rounded-full" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
                {!byTeam.length && <p className="text-xs text-white/35 py-4 text-center">No team demand logs available.</p>}
              </div>
            </div>

            {/* Role demand shares */}
            <div className="glass rounded-xl p-5 border border-white/[.06] bg-black/10 flex flex-col max-h-[420px]">
              <div className="border-b border-white/[.06] pb-3 mb-4">
                <p className="text-sm font-semibold">Top Positions (by Role)</p>
                <p className="text-xs text-white/35 mt-0.5">Individual candidate count per role description.</p>
              </div>
              <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3">
                {byRole.map((row:any)=>{
                  const maxVal = byRole[0]?.count || 1;
                  const pct = Math.round((row.count / maxVal) * 100);
                  return (
                    <div className="flex flex-col gap-1.5" key={row.name}>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-medium text-white/80 truncate max-w-[140px]" title={row.name}>{row.name}</span>
                        <span className="font-semibold text-fuchsia-300">{row.count}</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/[.04] overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-fuchsia-400 to-rose-400 rounded-full" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
                {!byRole.length && <p className="text-xs text-white/35 py-4 text-center">No role demand logs available.</p>}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Redesigned Candidate Detail Modal Overlay */}
      {profile ? (
        <div className="fixed inset-0 z-50 bg-black/80 p-4 backdrop-blur-md flex items-center justify-center">
          <div className="w-full max-w-5xl h-[85vh] rounded-3xl border border-white/10 bg-[#0c0611] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[.08] bg-white/[0.015] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500 flex items-center justify-center text-black font-bold text-lg shadow-lg">
                  {profile.fullName?.charAt(0).toUpperCase() || "?"}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">{profile.fullName}</h2>
                  <p className="text-xs text-white/35">{profile.email} · UID: {profile.uid || "-"}</p>
                </div>
              </div>
              <button onClick={() => setProfile(null)} className="portal-mini-button rounded-full p-2 text-white/55 hover:text-white hover:bg-white/[.08] transition">
                <X size={16} />
              </button>
            </div>

            {/* Split Pane Container */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-[1.1fr_2fr] overflow-hidden">
              
              {/* Left Pane: metadata timeline & stats */}
              <div className="border-r border-white/[.08] bg-black/20 p-6 overflow-y-auto flex flex-col gap-4">
                
                {/* Academic information */}
                <div className="rounded-2xl border border-white/[.05] bg-white/[.015] p-4 text-xs flex flex-col gap-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-white/35 border-b border-white/[.05] pb-2 mb-1">
                    Academic details
                  </p>
                  <div>
                    <span className="text-white/40 block mb-0.5">Course / Branch / Year</span>
                    <span className="font-semibold text-white/80">{profile.course || "-"} / {profile.branch || "-"} / Year {profile.year || "-"}</span>
                  </div>
                  <div>
                    <span className="text-white/40 block mb-0.5">Phone Number</span>
                    <span className="font-mono font-medium text-white/80">{profile.phone || "-"}</span>
                  </div>
                </div>

                {/* External links */}
                <div className="rounded-2xl border border-white/[.05] bg-white/[.015] p-4 text-xs flex flex-col gap-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-white/35 border-b border-white/[.05] pb-2 mb-1">
                    External Portfolio Links
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[["Portfolio", profile.portfolio], ["GitHub", profile.github], ["LinkedIn", profile.linkedin]]
                      .filter(([, href]) => href)
                      .map(([label, href]) => (
                        <a key={label} href={href as string} target="_blank" rel="noreferrer" className="portal-link-action text-sky-200 border-sky-400/20 hover:bg-sky-400/10 py-1.5 px-3 transition">
                          {label}
                        </a>
                      ))}
                    {![profile.portfolio, profile.github, profile.linkedin].some(Boolean) && (
                      <span className="text-white/35 italic">No external links shared.</span>
                    )}
                  </div>
                </div>

                {/* Status breakdown */}
                <div className="rounded-2xl border border-white/[.05] bg-white/[.015] p-4 text-xs flex flex-col gap-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-white/35 border-b border-white/[.05] pb-2 mb-1">
                    Status & Choice
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-white/45">Target Team</span>
                    <span className="font-semibold text-white/85">{valueOf(profile, "team") || "-"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/45">Target Role</span>
                    <span className="font-semibold text-white/85">{valueOf(profile, "role") || "-"}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1 border-t border-white/[.04] pt-2">
                    <span className="text-white/45">Current Status</span>
                    <span className={statusBadge(profile.status || "pending")}>
                      {String(profile.status || "pending").replace("_", " ")}
                    </span>
                  </div>
                </div>

                {/* Timeline info */}
                <div className="rounded-2xl border border-white/[.05] bg-white/[.015] p-4 text-xs flex flex-col gap-3 flex-1 min-h-[160px]">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-white/35 border-b border-white/[.05] pb-2 mb-1">
                    Timeline History
                  </p>
                  <div className="overflow-y-auto flex-1 flex flex-col gap-3 pr-1">
                    {(profile.timeline || []).slice().reverse().map((entry: any, index: number) => (
                      <div key={index} className="relative pl-4 border-l border-white/[0.08] last:border-l-transparent pb-1">
                        <div className="absolute left-[-4.5px] top-1.5 w-2 h-2 rounded-full bg-violet-400 border border-[#0c0611]"></div>
                        <p className="font-semibold text-white/70">{entry.action}</p>
                        <p className="text-[9px] text-white/35 mt-0.5">{entry.at ? new Date(entry.at).toLocaleString("en-IN") : ""}</p>
                        {entry.note && <p className="text-[10px] text-white/45 italic mt-1 bg-black/20 p-2 rounded-lg border border-white/[0.03]">{entry.note}</p>}
                      </div>
                    ))}
                    {!(profile.timeline || []).length && (
                      <p className="text-white/35 italic">No timeline changes recorded.</p>
                    )}
                  </div>
                </div>

              </div>

              {/* Right Pane: Question answers, notes, files */}
              <div className="p-6 overflow-y-auto flex flex-col gap-5 bg-[#0f0a14]/20">
                
                {/* Answers block */}
                <div className="rounded-2xl border border-white/[.05] bg-white/[.01] p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-violet-300 border-b border-white/[.05] pb-3 mb-4">
                    Form Questions & Answers
                  </p>
                  <div className="grid gap-5">
                    {(profile.answers || []).map((answer: any) => (
                      <div key={answer.label} className="border-b border-white/[.03] last:border-0 pb-4 last:pb-0">
                        <p className="text-xs font-semibold text-white/80">{answer.label}</p>
                        <p className="mt-2 whitespace-pre-wrap text-xs text-white/50 leading-relaxed bg-black/25 p-3 rounded-xl border border-white/[.03]">
                          {Array.isArray(answer.value) ? answer.value.join(", ") : String(answer.value || "-")}
                        </p>
                      </div>
                    ))}
                    {!(profile.answers || []).length && (
                      <p className="text-xs text-white/35 italic text-center py-4">No answers recorded on this application form.</p>
                    )}
                  </div>
                </div>

                {/* Uploaded documents */}
                {(profile.files || []).length > 0 && (
                  <div className="rounded-2xl border border-white/[.05] bg-white/[.01] p-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-fuchsia-300 border-b border-white/[.05] pb-3 mb-4">
                      Uploaded Documents
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {profile.files.map((file: any) => (
                        <a className="portal-link-action text-fuchsia-200 border-fuchsia-400/20 hover:bg-fuchsia-400/10 py-1.5 px-3 transition" href={file.url} target="_blank" rel="noreferrer" key={file.url}>
                          <FileText size={12} className="mr-1.5"/> {file.label || "Document Link"}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Admin comments */}
                <div className="rounded-2xl border border-white/[.05] bg-white/[.01] p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-amber-300 border-b border-white/[.05] pb-3 mb-3">
                    Internal Admin Comments
                  </p>
                  <p className="whitespace-pre-wrap text-xs text-white/60 leading-relaxed bg-black/25 p-3.5 rounded-xl border border-white/[.03]">
                    {profile.adminNotes || "No admin comments added yet. Click 'Edit notes/status' below to insert notes."}
                  </p>
                </div>

              </div>

            </div>

            {/* Footer Buttons */}
            <div className="border-t border-white/[.08] bg-white/[0.015] px-6 py-4 flex flex-wrap gap-2 justify-between items-center">
              <div className="flex flex-wrap gap-2">
                <button onClick={() => { patch("recruitmentApplications", profile, { status: "accepted" }, "Application accepted."); setProfile((p: any) => ({ ...p, status: "accepted" })); }} className="portal-command-button rounded-2xl px-5 py-3 text-xs font-semibold hover:scale-[1.02] active:scale-95 transition">
                  Accept Applicant
                </button>
                <button onClick={() => { patch("recruitmentApplications", profile, { status: "shortlisted" }, "Application shortlisted."); setProfile((p: any) => ({ ...p, status: "shortlisted" })); }} className="portal-mini-button rounded-2xl px-5 py-3 text-xs text-violet-200 hover:text-white border-violet-400/20 hover:bg-violet-400/10 transition">
                  Shortlist
                </button>
                <button onClick={() => { patch("recruitmentApplications", profile, { status: "on_hold" }, "Application moved on hold."); setProfile((p: any) => ({ ...p, status: "on_hold" })); }} className="portal-mini-button rounded-2xl px-5 py-3 text-xs text-amber-200 hover:text-white border-amber-400/20 hover:bg-amber-400/10 transition">
                  Interview / On Hold
                </button>
                <button onClick={() => { patch("recruitmentApplications", profile, { status: "rejected" }, "Application rejected."); setProfile((p: any) => ({ ...p, status: "rejected" })); }} className="portal-mini-button rounded-2xl px-5 py-3 text-xs text-rose-300 hover:text-white border-rose-400/20 hover:bg-rose-400/10 transition">
                  Reject
                </button>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { open({ resource: "recruitmentApplications", title: `Review ${profile.fullName}`, fields: extraFields.recruitmentApplications, item: profile }); setProfile(null); }} className="portal-mini-button rounded-2xl px-4 py-3 text-xs text-white/70 hover:text-white transition">
                  Edit Notes / Status
                </button>
                <button onClick={() => { if (window.confirm("Are you sure you want to delete this application permanently?")) { remove("recruitmentApplications", profile); setProfile(null); } }} className="portal-mini-button inline-flex items-center gap-1.5 rounded-2xl px-4 py-3 text-xs text-rose-300 hover:bg-rose-500/10 border-rose-500/20 transition">
                  <Trash2 size={13} /> Delete Record
                </button>
              </div>
            </div>

          </div>
        </div>
      ) : null}

    </div>
  );
}
