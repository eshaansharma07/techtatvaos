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


export function Workspace({active,data,rows,open,remove,restore,patch,duplicateEvent,requireReapprovalWorkspace}:{active:Module;data:Data;rows:any[];open:(drawer:any)=>void;remove:(resource:Resource,item:any)=>void;restore:(resource:Resource,item:any)=>void;patch:(resource:Resource,item:any,body:Record<string, any>,message:string)=>void;duplicateEvent:(item:any)=>void;requireReapprovalWorkspace:(item:any,scope?:"waitlisted"|"all")=>Promise<void>}) {
  const c = config[active as keyof typeof config];
  const defaults = active === "Events" ? { status: "published", registrationOpen: "true" } : active === "Meetings" ? { status: "completed" } : {};
  const helper =
    active === "Teams" ? "Lead and co-leads are saved separately for every team. Use the joint secretary dropdown to place each team in the hierarchy." :
    active === "Events" ? "Published or active events appear publicly. Draft and archived events stay hidden. Reports are generated from real registrations and attendance." :
    active === "Meetings" ? "Create meeting records here, then export official MOM PDFs or DOCX files from the same row." :
    active === "Members" ? "Deleting a member now removes that member permanently and clears their team references." :
    active === "Hall of Fame" ? "Add top contributors and alumni here. Secretary, joint secretaries, and team leads are pulled automatically from Settings and Teams." :
    active === "Contact Messages" ? "Click any message to view the sender details and full message. Mark handled messages as in progress or resolved." :
    "Archive uses safe public removal.";

  const headers = headersMap[active] || [];
  const stats = getWorkspaceStats(active, data);

  return (
    <div className="mt-7 flex flex-col gap-4">
      {/* Workspace Quick Stats */}
      {stats.length ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          {stats.map((stat) => {
            const tones = {
              violet: "border-violet-500/15 bg-violet-500/[0.03] text-violet-200 shadow-[inset_0_1px_rgba(255,255,255,0.01)]",
              blue: "border-blue-500/15 bg-blue-500/[0.03] text-blue-200 shadow-[inset_0_1px_rgba(255,255,255,0.01)]",
              amber: "border-amber-500/15 bg-amber-500/[0.03] text-amber-200 shadow-[inset_0_1px_rgba(255,255,255,0.01)]",
              rose: "border-rose-500/15 bg-rose-500/[0.03] text-rose-200 shadow-[inset_0_1px_rgba(255,255,255,0.01)]"
            };
            return (
              <div key={stat.label} className={`rounded-2xl border p-5 backdrop-blur-xl ${tones[stat.tone as keyof typeof tones] || tones.violet}`}>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold tracking-tight">{stat.value}</p>
              </div>
            );
          })}
        </div>
      ) : null}

        <div className="grid gap-4 lg:grid-cols-[1fr_.32fr]">
        <div className="portal-card portal-glow-card rounded-2xl p-5 md:p-6 overflow-hidden border border-white/5 bg-black/40">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4 mb-4">
            <p className="text-xs font-bold text-white uppercase tracking-wider">{active} Workspace</p>
            <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[9px] font-semibold text-white/50">{rows.length} total records</span>
          </div>
          
          {rows.length ? (
            <div className="mt-4 max-h-[min(650px,calc(100vh-340px))] overflow-auto overscroll-contain rounded-xl border border-white/[.06] mobile-tabs bg-black/25">
              <div className="max-w-full min-w-[750px]">
                {/* Table Header Row */}
                <div className={`hidden md:grid gap-3 bg-white/5 px-4 py-3.5 text-[10px] font-bold uppercase tracking-wider text-white/40 border-b border-white/[0.08] ${
                  headers.length === 5 
                    ? "grid-cols-[1.2fr_1fr_1fr_1.1fr_1fr_1.4fr]" 
                    : "grid-cols-[1.5fr_1.2fr_1.2fr_1.2fr_1.4fr]"
                }`}>
                  {headers.map((header) => (
                    <span key={header}>{header}</span>
                  ))}
                  <span className="text-right pr-4">Actions</span>
                </div>

                {/* Table Body Rows */}
                <div className="divide-y divide-white/[0.04]">
                  {rows.map((row: any[]) => {
                    const item = row[row.length - 1];
                    const resource = (item.__resource || c.resource) as Resource;
                    const fields = extraFields[resource] || c.fields;
                    const inactive = item.active === false || item.published === false || item.status === "archived" || item.status === "inactive";
                    const isEvent = active === "Events";
                    const isMeeting = active === "Meetings";
                    const cellData = row.slice(0, -1);
                    const gridClass = cellData.length === 5 
                      ? "md:grid-cols-[1.2fr_1fr_1fr_1.1fr_1fr_1.4fr]" 
                      : "md:grid-cols-[1.5fr_1.2fr_1.2fr_1.2fr_1.4fr]";

                    return (
                      <div className={`grid grid-cols-1 gap-3 p-4 text-sm hover:bg-white/[0.02] transition md:grid md:text-xs md:items-center ${gridClass}`} key={idOf(item)}>
                        {cellData.map((cell: any, index: number) => (
                          <button 
                            onClick={() => open({ resource, title: `Edit ${active === "Hall of Fame" ? "Hall entry" : active.slice(0, -1)}`, fields, item })} 
                            className={`rounded-xl border border-white/[.06] bg-white/[.025] p-3 text-left md:border-0 md:bg-transparent md:p-0 transition hover:text-white ${index === 0 ? "text-white/80" : "text-white/48"}`} 
                            key={`${idOf(item)}-${index}`}
                          >
                            <span className="mb-1 block text-[9px] uppercase tracking-[.18em] text-white/28 md:hidden">
                              {headers[index] || (index === 0 ? (active === "Hall of Fame" ? "Hall entry" : active.slice(0, -1)) : `Detail ${index}`)}
                            </span>
                            <span>{renderCell(cell, index)}</span>
                          </button>
                        ))}
                        
                        <div className="flex flex-wrap gap-1.5 md:justify-end md:pr-4">
                          {active === "Teams" && item.active !== false ? (
                            <button onClick={() => open({ resource: "users", title: `Add member to ${item.name}`, fields: config.Members.fields, defaults: { teams: [idOf(item)] } })} className="inline-flex items-center gap-1 rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 text-[10px] font-semibold text-violet-200 transition hover:bg-violet-500/20">
                              <Plus size={10} /> Member
                            </button>
                          ) : null}
                          
                          {isEvent ? (
                            <>
                              <button onClick={() => patch(resource, item, { status: "published" }, "Event published. It is visible on the public website.")} className="inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-[10px] font-semibold text-blue-200 transition hover:bg-blue-500/20">
                                <Check size={10} /> Publish
                              </button>
                              <button onClick={() => patch(resource, item, { status: "draft", registrationOpen: "false" }, "Event moved to draft and hidden publicly.")} className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/[0.05] px-2.5 py-1 text-[10px] font-semibold text-white/60 transition hover:bg-white/10">
                                <X size={10} /> Draft
                              </button>
                              <button onClick={() => patch(resource, item, { registrationOpen: String(!item.registrationOpen), status: item.status === "draft" ? "published" : item.status }, "Registration setting updated.")} className="inline-flex items-center gap-1 rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 text-[10px] font-semibold text-violet-200 transition hover:bg-violet-500/20">
                                {item.registrationOpen ? "Close Reg" : "Open Reg"}
                              </button>
                              <a className="inline-flex items-center gap-1 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-2.5 py-1 text-[10px] font-semibold text-fuchsia-200 transition hover:bg-fuchsia-500/20" href={`/api/ai/event-report?event=${idOf(item)}&format=pdf`}>
                                <FileText size={10} /> PDF
                              </a>
                              <a className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold text-amber-200 transition hover:bg-amber-500/20" href={`/api/ai/event-report?event=${idOf(item)}&format=docx`}>
                                <FileText size={10} /> DOCX
                              </a>
                              <button onClick={() => duplicateEvent(item)} className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold text-amber-200 transition hover:bg-amber-500/20">
                                Duplicate
                              </button>
                              <button onClick={() => requireReapprovalWorkspace(item, "all")} className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-200 transition hover:bg-emerald-500/20">
                                Re-approve (All)
                              </button>
                              <button onClick={() => requireReapprovalWorkspace(item, "waitlisted")} className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-200 transition hover:bg-emerald-500/20">
                                Re-approve (Waitlist)
                              </button>
                            </>
                          ) : null}
                          
                          {isMeeting ? (
                            <>
                              <a className="inline-flex items-center gap-1 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-2.5 py-1 text-[10px] font-semibold text-fuchsia-200 transition hover:bg-fuchsia-500/20" href={`/api/ai/mom?meeting=${idOf(item)}&format=pdf`}>
                                <FileText size={10} /> MOM PDF
                              </a>
                              <a className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold text-amber-200 transition hover:bg-amber-500/20" href={`/api/ai/mom?meeting=${idOf(item)}&format=docx`}>
                                <FileText size={10} /> MOM DOCX
                              </a>
                            </>
                          ) : null}
                          
                          {active === "Members" ? (
                            <button onClick={() => remove(resource, item)} className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-[10px] font-semibold text-rose-200 transition hover:bg-rose-500/20">
                              <Trash2 size={10} /> Delete
                            </button>
                          ) : active === "Contact Messages" ? (
                            <button onClick={() => patch(resource, item, { status: item.status === "resolved" ? "new" : "resolved" }, item.status === "resolved" ? "Message reopened." : "Message marked resolved.")} className="inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-[10px] font-semibold text-blue-200 transition hover:bg-blue-500/20">
                              {item.status === "resolved" ? "Reopen" : "Resolve"}
                            </button>
                          ) : inactive ? (
                            <button onClick={() => restore(resource, item)} className="inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-[10px] font-semibold text-blue-200 transition hover:bg-blue-500/20">
                              Restore
                            </button>
                          ) : !isEvent ? (
                            <button onClick={() => remove(resource, item)} className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-[10px] font-semibold text-rose-200 transition hover:bg-rose-500/20">
                              <Trash2 size={10} /> Archive
                            </button>
                          ) : null}
                          
                          {isEvent ? (
                            <button onClick={() => remove(resource, item)} className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-[10px] font-semibold text-rose-200 transition hover:bg-rose-500/20">
                              <Trash2 size={10} /> Delete
                            </button>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-5 rounded-xl border border-white/[.06] bg-white/[.025] p-6 text-sm text-white/45 text-center font-medium">No records yet. Add one from the command center.</p>
          )}
        </div>
        
        <div className="portal-card portal-glow-card rounded-2xl p-5 self-start border border-white/5 bg-black/40">
          <p className="text-xs font-bold text-white uppercase tracking-wider">Module Actions</p>
          {active === "Media" ? (["gallery", "sponsors", "achievements"] as Resource[]).map((resource) => (
            <button onClick={() => open({ resource, title: `Add ${resource}`, fields: extraFields[resource] })} className="portal-mini-button mt-3 block w-full rounded-xl px-4 py-3 text-left text-xs text-white/68 transition hover:text-white" key={resource}>Add {resource}</button>
          )) : (
            <button onClick={() => open({ resource: c.resource, title: `Add ${active === "Hall of Fame" ? "Hall entry" : active.slice(0, -1)}`, fields: c.fields, defaults: active === "Hall of Fame" ? { category: "top_contributor", active: "true" } : defaults })} className="portal-command-button mt-3 block w-full rounded-xl px-4 py-3 text-left text-xs transition">Create record</button>
          )}
          <p className="mt-4 text-[10px] text-white/30 leading-relaxed font-sans">{helper}</p>
        </div>
      </div>
    </div>
  );
}
