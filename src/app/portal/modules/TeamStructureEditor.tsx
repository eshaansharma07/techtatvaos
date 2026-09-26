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

export function TeamStructureEditor({data,open,remove,restore}:{data:Data;open:(drawer:any)=>void;remove:(resource:Resource,item:any)=>void;restore:(resource:Resource,item:any)=>void}){
  const info=data.clubInfo||{};
  const {operations,creative}=splitPortalTeams(data.teams||[]);
  return (
    <div className="mt-7 grid gap-4 xl:grid-cols-[1fr_.32fr]">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/[.08] bg-[#05070d]/75 p-5 md:p-7">
        <div className="absolute inset-0 grid-bg opacity-20"/>
        <div className="relative grid gap-6">
          <div className="rounded-[1.7rem] border border-blue-300/15 bg-blue-400/[.035] p-5 shadow-[inset_0_1px_rgba(255,255,255,0.02)]">
            <p className="mb-4 text-center text-[10px] font-bold uppercase tracking-[.22em] text-blue-100/55">Advisory Tree</p>
            <PortalAdvisoryRow info={info} open={open}/>
          </div>
          <div className="rounded-[1.7rem] border border-violet-300/15 bg-violet-400/[.035] p-5 shadow-[inset_0_1px_rgba(255,255,255,0.02)]">
            <p className="mb-4 text-center text-[10px] font-bold uppercase tracking-[.22em] text-violet-100/55">Club Operations Tree</p>
            <PortalOperationsRoot info={info} open={open}/>
            <div className="mx-auto h-10 w-px bg-white/25"/>
            <div className="mx-auto hidden h-px max-w-4xl bg-gradient-to-r from-blue-300/0 via-blue-300/45 to-fuchsia-300/45 md:block"/>
            <div className="mt-6 grid gap-8 2xl:grid-cols-2">
              <TeamLaneEditor title="2. Joint Secretary (Technical & Operations)" subtitle={info.jointSecretaryOneName || "Assign in Settings"} teams={operations} tone="blue" open={open} remove={remove} restore={restore}/>
              <TeamLaneEditor title="3. Joint Secretary (Media & Creative)" subtitle={info.jointSecretaryTwoName || "Assign in Settings"} teams={creative} tone="fuchsia" open={open} remove={remove} restore={restore}/>
            </div>
          </div>
        </div>
      </div>
      <div className="glass rounded-[1.5rem] p-5 self-start">
        <p className="text-sm font-semibold text-white">Structure Actions</p>
        <button onClick={()=>open({resource:"teams",title:"Create team",fields:config.Teams.fields,defaults:{active:"true",jointSecretaryLane:"technical"}})} className="portal-command-button mt-4 w-full rounded-2xl px-4 py-3 text-xs font-semibold animate-pulse hover:animate-none">Create team</button>
        <a href="/api/portal/structure/export" className="portal-command-button mt-3 block w-full rounded-2xl px-4 py-3 text-center text-xs font-semibold">Export structure Excel</a>
        <button onClick={()=>open({resource:"settings",title:"Update faculty, advisors, secretary, and joint secretaries",fields:settingsFields,item:info})} className="portal-mini-button mt-3 w-full rounded-2xl px-4 py-3 text-xs font-semibold text-violet-100">Edit top hierarchy</button>
        <p className="mt-4 text-xs leading-6 text-white/42 border-t border-white/[0.04] pt-4">Faculty Champion and Student Advisors are now advisory-only. The actual team reporting tree starts from Secretary, then moves to Joint Secretaries, team leads, and teams.</p>
      </div>
    </div>
  );
}
