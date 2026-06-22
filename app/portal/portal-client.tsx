"use client";

import { type MouseEvent, useEffect, useMemo, useState } from "react";
import { signOut } from "next-auth/react";
import {
  Activity,
  Award,
  Bell,
  Brain,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Download,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  ArrowUpDown,
  Trash2,
  Users,
  Workflow,
  Hexagon,
  SlidersHorizontal,
  BarChart3,
  PlusCircle,
  Eye,
  Check,
  X,
  ChevronRight,
  ChevronLeft,
  UserX,
  UserPlus,
  ClipboardList,
  Info,
  Filter,
  HelpCircle
} from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

type Module = "Overview" | "Members" | "Teams" | "Events" | "Recruitment" | "Attendance" | "Certificates" | "Meetings" | "AI" | "Tasks" | "Announcements" | "Media" | "Hall of Fame" | "Contact Messages" | "Settings";
type Resource = "users" | "teams" | "events" | "meetings" | "tasks" | "announcements" | "sponsors" | "achievements" | "gallery" | "hallOfFame" | "contacts" | "settings" | "invites" | "recruitmentSettings" | "recruitmentTeams" | "recruitmentRoles" | "recruitmentQuestions" | "recruitmentApplications";
type Data = Record<string, any>;
type Field = [string, string, string?];

const nav = [
  [LayoutDashboard, "Overview"],
  [Users, "Members"],
  [Workflow, "Teams"],
  [CalendarDays, "Events"],
  [BriefcaseBusiness, "Recruitment"],
  [CheckCircle2, "Attendance"],
  [Award, "Certificates"],
  [FileText, "Meetings"],
  [Brain, "AI"],
  [Workflow, "Tasks"],
  [Bell, "Announcements"],
  [Activity, "Media"],
  [Award, "Hall of Fame"],
  [MessageSquare, "Contact Messages"],
  [Settings2, "Settings"]
] as const;

const config: Record<Exclude<Module, "Overview" | "Recruitment" | "Attendance" | "Certificates" | "AI" | "Settings">, { key: string; resource: Resource; fields: Field[] }> = {
  Members: { key: "users", resource: "users", fields: [["name","Name"],["email","Email","email"],["teams","Teams","team-multi-select"],["image","Profile photo","upload:image"],["uid","UID"],["department","Department"],["program","Program"],["semester","Semester","number"],["phone","Phone"]] },
  Teams: { key: "teams", resource: "teams", fields: [["name","Team name"],["slug","Slug"],["description","Description"],["lead","Team lead","member-select"],["coLeads","Co-leads","member-multi-select"],["jointSecretaryLane","Reports under joint secretary","lane-select"],["order","Display order","number"],["active","Active: true/false"]] },
  Events: { key: "events", resource: "events", fields: [["title","Title"],["slug","Slug"],["description","Description"],["venue","Venue"],["capacity","Capacity","number"],["category","Category"],["team","Team","team-select"],["leads","Event leads","member-multi-select"],["participationMode","Participation type","participation-select"],["maxTeamSize","Maximum team size","number"],["winnerFirst","1st place winner","winner-select"],["winnerSecond","2nd place winner","winner-select"],["winnerThird","3rd place winner","winner-select"],["status","Public status","status-select"],["registrationOpen","Registration open","boolean-select"],["registrationStart","Registration start","datetime-local"],["registrationEnd","Registration end","datetime-local"],["startAt","Event start date/time","datetime-local"],["endAt","Event end date/time","datetime-local"],["banner","Event banner","upload:image"]] },
  Meetings: { key: "meetings", resource: "meetings", fields: [["title","Meeting title"],["date","Date","date"],["time","Time"],["venue","Venue"],["meetingType","Meeting type"],["organizer","Organizer","member-select"],["attendees","Attendees","member-multi-select"],["agenda","Agenda"],["discussionPoints","Discussion points"],["decisionsTaken","Decisions taken"],["actionItems","Action items (one per line: Task | Assigned To | Deadline | Status)"],["nextMeeting","Next meeting details"],["status","Status"]] },
  Tasks: { key: "tasks", resource: "tasks", fields: [["title","Title"],["description","Description"],["team","Team","team-select"],["dueAt","Due date","datetime-local"],["status","Status"],["priority","Priority"]] },
  Announcements: { key: "announcements", resource: "announcements", fields: [["title","Title"],["body","Body"],["status","Status"],["audience","Audience"],["publishAt","Publish at","datetime-local"]] },
  Media: { key: "gallery", resource: "gallery", fields: [["title","Album title"],["event","Linked event","event-select"],["assets","Album photos/videos","gallery-assets"],["published","Published: true/false"]] },
  "Hall of Fame": { key: "hallOfFame", resource: "hallOfFame", fields: [["name","Name"],["category","Category","hall-category"],["title","Title"],["subtitle","Subtitle"],["batch","Batch"],["year","Year","number"],["image","Photo","upload:image"],["order","Display order","number"],["active","Active: true/false"]] },
  "Contact Messages": { key: "contactMessages", resource: "contacts", fields: [["name","Name"],["email","Email","email"],["subject","Subject"],["message","Message"],["status","Status","contact-status-select"]] }
};

const extraFields: Record<Resource, Field[]> = {
  users: config.Members.fields,
  teams: config.Teams.fields,
  events: config.Events.fields,
  meetings: config.Meetings.fields,
  tasks: config.Tasks.fields,
  announcements: config.Announcements.fields,
  gallery: config.Media.fields,
  sponsors: [["name","Sponsor name"],["logo","Sponsor logo","upload:image"],["website","Website"],["level","Sponsorship level"],["active","Active: true/false"]],
  achievements: [["title","Title"],["description","Description"],["kind","Kind"],["awardedAt","Awarded at","date"],["image","Achievement image","upload:image"],["featured","Featured: true/false"]],
  hallOfFame: config["Hall of Fame"].fields,
  contacts: config["Contact Messages"].fields,
  settings: [["logo","Club logo","upload:image"]],
  invites: [["email","Invite email","email"],["role","Role slug"],["team","Team","team-select"]],
  recruitmentSettings: [["status","Status","recruitment-status-select"],["registrationEnabled","Registration enabled","boolean-select"],["openingDate","Opening date","datetime-local"],["closingDate","Closing date","datetime-local"],["maximumApplications","Maximum applications","number"],["announcementBanner","Announcement banner"],["customSuccessMessage","Custom success message"],["confirmationEmailEnabled","Email: application received","boolean-select"],["emailOnAccepted","Email: accepted","boolean-select"],["emailOnRejected","Email: rejected","boolean-select"],["emailOnShortlisted","Email: shortlisted","boolean-select"],["emailOnInterview","Email: interview / on hold","boolean-select"],["autoCloseAfterDeadline","Auto close after deadline","boolean-select"],["manualOverride","Manual override","boolean-select"],["whatsappGroupLink","WhatsApp group link"]],
  recruitmentTeams: [["name","Team name"],["slug","Slug"],["description","Description"],["icon","Icon label"],["order","Display order","number"],["applicationLimit","Application limit","number"],["active","Active","boolean-select"]],
  recruitmentRoles: [["team","Recruitment team","recruitment-team-select"],["name","Role name"],["slug","Slug"],["description","Description"],["order","Display order","number"],["active","Active","boolean-select"]],
  recruitmentQuestions: [["team","Recruitment team","recruitment-team-select"],["role","Role-specific question","recruitment-role-select"],["label","Question"],["helpText","Help text"],["type","Question type","question-type-select"],["options","Options, one per line"],["required","Required","boolean-select"],["order","Display order","number"],["active","Active","boolean-select"]],
  recruitmentApplications: [["status","Status","application-status-select"],["adminNotes","Admin notes"]]
};

const settingsFields: Field[] = [
  ["logo","Club logo","upload:image"],
  ["website","Website URL"],
  ["email","Public email"],
  ["location","Location"],
  ["footerCopy","Footer copy"],
  ["aboutTitle","About title"],
  ["aboutCopy","About copy"],
  ["vision","Vision"],
  ["mission","Mission"],
  ["facultyChampionName","Faculty champion name"],
  ["facultyChampionPhoto","Faculty champion photo","upload:image"],
  ["facultyChampionEmail","Faculty champion email","email"],
  ["facultyChampionPhone","Faculty champion phone"],
  ["coFacultyChampionName","Co-faculty champion name"],
  ["coFacultyChampionPhoto","Co-faculty champion photo","upload:image"],
  ["coFacultyChampionEmail","Co-faculty champion email","email"],
  ["coFacultyChampionPhone","Co-faculty champion phone"],
  ["secretaryName","Secretary name"],
  ["secretaryEmail","Secretary email","email"],
  ["secretaryPhoto","Secretary photo","upload:image"],
  ["studentAdvisorOneName","Student advisor 1 name"],
  ["studentAdvisorOneEmail","Student advisor 1 email","email"],
  ["studentAdvisorOnePhoto","Student advisor 1 photo","upload:image"],
  ["studentAdvisorTwoName","Student advisor 2 name"],
  ["studentAdvisorTwoEmail","Student advisor 2 email","email"],
  ["studentAdvisorTwoPhoto","Student advisor 2 photo","upload:image"],
  ["jointSecretaryOneName","Joint secretary 1 name"],
  ["jointSecretaryOneEmail","Joint secretary 1 email","email"],
  ["jointSecretaryOnePhoto","Joint secretary 1 photo","upload:image"],
  ["jointSecretaryTwoName","Joint secretary 2 name"],
  ["jointSecretaryTwoEmail","Joint secretary 2 email","email"],
  ["jointSecretaryTwoPhoto","Joint secretary 2 photo","upload:image"],
  ["postActivityReportTemplate","Post activity report PDF template","upload:pdf"],
  ["momTemplate","MOM PDF template","upload:pdf"]
];

function idOf(item:any){return typeof item==="string"?item:String(item?._id || item?.id || item || "")}
function asArray<T=any>(value:any):T[]{return Array.isArray(value)?value:value?[value]:[]}
function valueOf(item:any, key:string){const value=item?.[key];if(Array.isArray(value))return value.map((entry)=>typeof entry==="object"?(entry.name || entry.title || entry.slug || idOf(entry)):String(entry)).filter(Boolean).join(", ");if(value && typeof value==="object")return value.name || value.title || value.slug || idOf(value);return value ?? ""}
function rawValue(item:any, key:string): string | number | boolean | string[] {const value=item?.[key];if(Array.isArray(value))return value.map((entry)=>String(rawValue({entry},"entry"))).filter(Boolean);if(value && typeof value==="object")return String(value._id || value.id || "");return value ?? ""}
function teamNamesOf(member:any){const teams=asArray(member?.teams);const names=teams.map((team:any)=>team?.name || (typeof team==="string"?team:"")).filter(Boolean);const legacy=member?.team;return names.length?names.join(", "):(legacy?.name || (typeof legacy==="string"?legacy:""))}
function memberLabel(member:any){const teams=teamNamesOf(member);return `${member.name || "Unnamed member"}${teams ? ` / ${teams}` : ""}`}
function leadRolesOf(member:any,teams:any[]){const userId=idOf(member);return (teams||[]).filter((team:any)=>idOf(team.lead)===userId || asArray(team.coLeads).some((lead:any)=>idOf(lead)===userId)).map((team:any)=>`${idOf(team.lead)===userId?"Lead":"Co-lead"}: ${team.name}`).join(", ")}
function normalizePortalData(input:Data):Data{
  const data=input || {};
  return {
    ...data,
    users:asArray(data.users).map((user:any)=>({...user,teams:asArray(user?.teams).filter(Boolean),team:user?.team || null})),
    teams:asArray(data.teams).map((team:any)=>({...team,coLeads:asArray(team?.coLeads).filter(Boolean),members:asArray(team?.members).filter(Boolean)})),
    events:asArray(data.events),
    tasks:asArray(data.tasks),
    announcements:asArray(data.announcements),
    attendance:asArray(data.attendance),
    registrations:asArray(data.registrations),
    sponsors:asArray(data.sponsors),
    achievements:asArray(data.achievements),
    gallery:asArray(data.gallery).map((album:any)=>({...album,assets:asArray(album?.assets)})),
    hallOfFame:asArray(data.hallOfFame),
    contactMessages:asArray(data.contactMessages),
    meetings:asArray(data.meetings),
    generatedDocuments:asArray(data.generatedDocuments),
    aiConversations:asArray(data.aiConversations),
    recruitmentSettings:asArray(data.recruitmentSettings),
    recruitmentTeams:asArray(data.recruitmentTeams),
    recruitmentRoles:asArray(data.recruitmentRoles),
    recruitmentQuestions:asArray(data.recruitmentQuestions),
    recruitmentApplications:asArray(data.recruitmentApplications),
    clubInfo:data.clubInfo || {}
  };
}
function winnerOptions(data:Data,event:any){const eventId=event?idOf(event):"";const options=new Map<string,string>();(data.registrations||[]).filter((registration:any)=>!eventId||idOf(registration.event)===eventId).forEach((registration:any)=>{if(registration.user)options.set(idOf(registration.user),`${registration.user.name || "Unnamed"}${registration.user.uid?` / ${registration.user.uid}`:""}`);(registration.teamMembers||[]).forEach((member:any)=>{const userId=idOf(member.user||member);if(userId)options.set(userId,`${member.name || member.user?.name || "Unnamed"}${member.uid || member.user?.uid?` / ${member.uid || member.user?.uid}`:""}`)})});return Array.from(options.entries()).map(([id,label])=>({id,label}))}
function downloadTextFile(filename:string, contents:string, type="text/csv;charset=utf-8"){
  const blob=new Blob([contents],{type});
  const url=URL.createObjectURL(blob);
  const link=document.createElement("a");
  link.href=url;
  link.download=filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
function csvCell(value:any){return `"${String(value ?? "").replace(/"/g,'""')}"`}
function exportDashboardSummary(data:Data){
  const rows=[
    ["Metric","Value"],
    ["Total members",data.users?.filter((user:any)=>user.status==="active").length || 0],
    ["Total teams",data.teams?.filter((team:any)=>team.active!==false).length || 0],
    ["Published events",data.events?.filter((event:any)=>["published","active"].includes(event.status)).length || 0],
    ["Total registrations",data.registrations?.length || 0],
    ["Present attendance records",data.attendance?.filter((row:any)=>row.status==="present").length || 0],
    ["Absent attendance records",data.attendance?.filter((row:any)=>row.status==="absent").length || 0],
    ["Open tasks",data.tasks?.filter((task:any)=>task.status!=="completed").length || 0],
    ["Open contact messages",data.contactMessages?.filter((message:any)=>message.status!=="resolved").length || 0],
    ["Generated at",new Date().toLocaleString("en-IN")]
  ];
  downloadTextFile(`tech-tatva-summary-${new Date().toISOString().slice(0,10)}.csv`,rows.map((row)=>row.map(csvCell).join(",")).join("\n"));
}
function PortalLogo(){return <a href="/portal" className="group flex items-center gap-3 font-semibold tracking-tight"><span className="portal-logo-mark grid h-11 w-11 place-items-center rounded-2xl border border-violet-300/30 bg-violet-500/10 text-violet-200"><Hexagon size={20}/></span><span className="leading-tight"><span className="block text-sm tracking-[.08em] text-white">TECH TATVA</span><i className="block text-xs font-normal tracking-[.18em] text-violet-200/45">PORTAL OS</i></span></a>}

export function PortalClient({ initialData, userName }: { initialData: Data; userName: string }) {
  const [data,setData]=useState(()=>normalizePortalData(initialData));
  const [active,setActive]=useState<Module>("Overview");
  const [search,setSearch]=useState("");
  const [panel,setPanel]=useState("Welcome. Add real club data from the modules; empty public pages stay empty until you publish.");
  const [drawer,setDrawer]=useState<{resource:Resource; title:string; fields:Field[]; item?:any; defaults?:Record<string, any>}|null>(null);
  const [busy,setBusy]=useState(false);
  const [notifications,setNotifications]=useState(false);
  const [uploads,setUploads]=useState<Record<string,{url:string;publicId:string;resourceType:string}>>({});
  const [uploading,setUploading]=useState<Record<string,boolean>>({});

  useEffect(()=>setUploads({}),[drawer?.resource,drawer?.title,drawer?.item?._id]);

  const counts=useMemo(()=>({
    members:data.users?.filter((u:any)=>u.status==="active").length || 0,
    teams:data.teams?.filter((t:any)=>t.active!==false).length || 0,
    events:data.events?.filter((e:any)=>["published","active"].includes(e.status)).length || 0,
    tasks:data.tasks?.filter((t:any)=>t.status!=="completed").length || 0,
    attendance:data.attendance?.length || 0,
    contacts:data.contactMessages?.filter((m:any)=>m.status!=="resolved").length || 0,
    recruitment:data.recruitmentApplications?.length || 0
  }),[data]);

  const chart=useMemo(()=>[
    {m:"Members",v:counts.members},
    {m:"Teams",v:counts.teams},
    {m:"Events",v:counts.events},
    {m:"Recruit",v:counts.recruitment},
    {m:"Tasks",v:counts.tasks},
    {m:"Contacts",v:counts.contacts}
  ],[counts]);

  async function refresh(){
    setBusy(true);
    const res=await fetch("/api/admin/events",{cache:"no-store"});
    if(res.ok)setData(normalizePortalData(await res.json()));
    setBusy(false);
    setPanel("Dashboard refreshed from MongoDB.");
  }

  async function submit(formData:FormData){
    if(!drawer)return;
    setBusy(true);
    const body=Object.fromEntries(formData.entries()) as Record<string, any>;
    for (const [name,,type] of drawer.fields) {
      if (type === "member-multi-select" || type === "team-multi-select") body[name] = formData.getAll(name).filter(Boolean);
    }
    const url=drawer.resource==="invites"?"/api/portal/invites":drawer.item?`/api/admin/${drawer.resource}/${idOf(drawer.item)}`:`/api/admin/${drawer.resource}`;
    const res=await fetch(url,{method:drawer.item?"PATCH":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
    setBusy(false);
    if(!res.ok){setPanel(`Action failed: ${(await res.json()).error || res.statusText}`);return}
    const data=await res.json();
    setDrawer(null);
    setPanel(drawer.resource==="invites"?`Invite created: ${data.inviteUrl}`:`${drawer.title} saved.`);
    await refresh();
  }

  async function remove(resource:Resource,item:any){
    setBusy(true);
    const res=await fetch(`/api/admin/${resource}/${idOf(item)}`,{method:"DELETE"});
    setBusy(false);
    setPanel(res.ok?(resource==="events"?"Event deleted permanently.":resource==="users"?"Member deleted permanently.":"Record removed from public/active views."):"Delete/archive failed.");
    await refresh();
  }

  async function restore(resource:Resource,item:any){
    setBusy(true);
    const body=resource==="events"?{status:"published",registrationOpen:"true"}:resource==="users"?{status:"active"}:{active:"true",published:"true"};
    const res=await fetch(`/api/admin/${resource}/${idOf(item)}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
    setBusy(false);
    setPanel(res.ok?"Record restored to active views.":"Restore failed.");
    await refresh();
  }

  async function patch(resource:Resource,item:any,body:Record<string, any>,message:string){
    setBusy(true);
    const res=await fetch(`/api/admin/${resource}/${idOf(item)}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
    setBusy(false);
    setPanel(res.ok?message:"Update failed.");
    await refresh();
  }

  async function duplicateEvent(item:any){
    const copy={...item,title:`${item.title} Copy`,slug:`${item.slug || idOf(item)}-copy-${Date.now().toString().slice(-4)}`,status:"draft",registrationOpen:"false"};
    delete copy._id; delete copy.id; delete copy.createdAt; delete copy.updatedAt; delete copy.registrations;
    setBusy(true);
    const res=await fetch("/api/admin/events",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(copy)});
    setBusy(false);
    setPanel(res.ok?"Event duplicated as draft.":"Duplicate failed.");
    await refresh();
  }

  function rowsFor(module:Module){
    if(module==="Members")return (data.users||[]).map((u:any)=>[u.name,u.email && u.email !== "undefined" ? u.email : "-",u.uid||"-",teamNamesOf(u)||"-",leadRolesOf(u,data.teams)||u.status||"active",u]);
    if(module==="Teams")return (data.teams||[]).map((t:any)=>[t.name,valueOf(t,"lead") || "No lead",asArray(t.coLeads).map((lead:any)=>lead?.name || (typeof lead==="string"?lead:"")).filter(Boolean).join(", ") || "No co-leads",`${asArray(t.members).length} members`,t.active===false?"inactive":"active",t]);
    if(module==="Events")return (data.events||[]).map((e:any)=>[e.title,e.status,e.registrationOpen?"open":"closed",e.venue||"-",e.startAt?new Date(e.startAt).toLocaleString():"TBA",e]);
    if(module==="Meetings")return (data.meetings||[]).map((m:any)=>[m.title,m.status||"draft",m.date?new Date(m.date).toLocaleDateString():"No date",m.venue||"-",valueOf(m,"organizer")||"-",m]);
    if(module==="Tasks")return (data.tasks||[]).map((t:any)=>[t.title,t.status,t.priority||"medium",t.dueAt?new Date(t.dueAt).toLocaleString():"No due date",valueOf(t,"team")||"-",t]);
    if(module==="Announcements")return (data.announcements||[]).map((a:any)=>[a.title,a.status||"draft",a.audience||"public",a.publishAt?new Date(a.publishAt).toLocaleString():"Not scheduled",a]);
    if(module==="Media")return [...(data.gallery||[]).map((g:any)=>[g.title,valueOf(g,"event")||"No event linked",g.published?"published":"hidden",`${g.assets?.length||0} assets`,{...g,__resource:"gallery"}]),...(data.sponsors||[]).map((s:any)=>[s.name,s.level||"-",s.active?"active":"inactive","sponsor",{...s,__resource:"sponsors"}]),...(data.achievements||[]).map((a:any)=>[a.title,a.kind||"-",a.featured?"featured":"normal","achievement",{...a,__resource:"achievements"}])];
    if(module==="Hall of Fame")return (data.hallOfFame||[]).map((h:any)=>[h.name,h.category,h.title||"-",h.year||h.batch||"-",h.active===false?"inactive":"active",h]);
    if(module==="Contact Messages")return (data.contactMessages||[]).map((m:any)=>[m.name,m.email,m.subject||"-",m.status||"new",m.createdAt?new Date(m.createdAt).toLocaleString():"-",m]);
    return [];
  }

  const filtered=rowsFor(active).filter((row:any[])=>row.join(" ").toLowerCase().includes(search.toLowerCase()));

  return <main className="portal-root pb-24 xl:pb-0">
    <aside className="portal-sidebar fixed inset-y-0 left-0 hidden w-72 overflow-y-auto p-6 xl:flex xl:flex-col"><PortalLogo/><p className="mt-10 px-3 text-[10px] tracking-[.22em] text-white/25">INTERNAL PORTAL</p><nav className="mt-4 flex-1 space-y-1.5 pb-6">{nav.map(([Icon,label])=><button key={label} onClick={()=>{setActive(label);setPanel(`${label} loaded from MongoDB.`)}} className={`portal-nav-item flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm transition ${active===label?"portal-nav-active text-white":"text-white/42 hover:border-white/[.08] hover:bg-white/[.045] hover:text-white/75"}`}><Icon size={16}/>{label}</button>)}</nav><div className="mt-auto border-t border-white/[.06] pt-4"><button onClick={()=>signOut({callbackUrl:"/login"})} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm text-white/35 transition hover:bg-rose-500/10 hover:text-rose-200"><LogOut size={15}/> Sign out</button></div></aside>
    <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 gap-1 rounded-[1.65rem] border border-white/10 bg-[#09070f]/88 p-2 shadow-2xl shadow-black/50 backdrop-blur-2xl xl:hidden">
      {nav.slice(0,5).map(([Icon,label])=><button key={label} onClick={()=>{setActive(label);setPanel(`${label} loaded from MongoDB.`)}} className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-semibold transition active:scale-[.97] ${active===label?"bg-violet-400/18 text-white shadow-[0_0_24px_rgba(168,85,247,.16)]":"text-white/42"}`}><Icon size={17}/><span>{label==="Attendance"?"Attend":label}</span></button>)}
    </nav>
    <section className="xl:pl-72"><header className="portal-topbar flex min-h-24 flex-wrap items-center justify-between gap-4 px-5 py-4 md:px-8"><div className="w-full xl:hidden"><PortalLogo/></div><div><p className="text-xs tracking-wide text-white/35">{new Date().toLocaleString("en-IN",{dateStyle:"full",timeStyle:"short"})}</p><h1 className="mt-1 text-xl font-semibold tracking-tight">Good day, {userName}.</h1></div><div className="flex flex-1 items-center justify-end gap-3"><label className="portal-search hidden min-w-80 items-center gap-3 rounded-2xl px-4 py-3 text-white/40 md:flex"><Search size={16}/><input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search live admin data..." className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/25"/></label><button onClick={refresh} className="portal-mini-button rounded-2xl p-3 text-white/55 transition hover:-translate-y-0.5 hover:text-white"><RefreshCw size={16} className={busy?"animate-spin":""}/></button><button onClick={()=>setNotifications(!notifications)} className="portal-mini-button relative rounded-2xl p-3 text-white/55 transition hover:-translate-y-0.5 hover:text-white"><Bell size={16}/>{counts.contacts?<i className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-pink-400 shadow-[0_0_14px_rgba(244,114,182,.75)]"/>:null}</button><div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 shadow-[0_0_30px_rgba(168,85,247,.28)]"/></div><label className="portal-search flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-white/40 md:hidden"><Search size={16}/><input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search admin data..." className="w-full bg-transparent text-base text-white outline-none placeholder:text-white/25"/></label></header>
    <div className="p-4 md:p-8"><div className="mb-4 flex gap-2 overflow-x-auto pb-1 xl:hidden mobile-tabs">{nav.map(([Icon,label])=><button key={label} onClick={()=>{setActive(label);setPanel(`${label} loaded from MongoDB.`)}} className={`flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-xs font-semibold ${active===label?"border-violet-200/35 bg-violet-500/18 text-white":"border-white/[.08] bg-white/[.035] text-white/50"}`}><Icon size={14}/>{label}</button>)}</div><Header active={active} data={data} open={setDrawer} setPanel={setPanel}/>{active==="Overview"?<Overview counts={counts} chart={chart} setActive={setActive}/>:active==="Recruitment"?<RecruitmentDesk data={data} open={setDrawer} patch={patch} remove={remove} refresh={refresh} setPanel={setPanel}/>:active==="Attendance"?<Attendance data={data} setPanel={setPanel} refresh={refresh}/>:active==="Certificates"?<CertificatesDesk data={data} setPanel={setPanel} open={setDrawer}/>:active==="AI"?<AIDesk data={data} setPanel={setPanel}/>:active==="Settings"?<Settings info={data.clubInfo||{}} open={setDrawer}/>:active==="Teams"?<TeamStructureEditor data={data} open={setDrawer} remove={remove} restore={restore}/>:<Workspace active={active} data={data} rows={filtered} open={setDrawer} remove={remove} restore={restore} patch={patch} duplicateEvent={duplicateEvent}/>}<div className="portal-action mt-4 rounded-2xl p-5"><p className="text-[10px] tracking-[.24em] text-violet-200">ACTION PANEL</p><p className="mt-3 text-sm leading-6 text-white/65">{panel}</p></div></div></section>
    {notifications?<div className="fixed right-5 top-24 z-50 w-[min(380px,calc(100vw-40px))] rounded-3xl border border-white/10 bg-[#111016]/95 p-5 shadow-2xl shadow-black/40 backdrop-blur-xl"><p className="text-sm font-semibold">Open contact messages</p>{(data.contactMessages||[]).filter((m:any)=>m.status!=="resolved").slice(0,6).map((m:any)=><button onClick={()=>setPanel(`${m.name}: ${m.message}`)} className="portal-mini-button mt-3 block w-full rounded-2xl px-4 py-3 text-left text-xs text-white/60 transition hover:-translate-y-0.5 hover:text-white" key={idOf(m)}>{m.subject}</button>)}{!counts.contacts?<p className="mt-4 text-xs text-white/40">No unresolved messages.</p>:null}</div>:null}
    {drawer?<div className="fixed inset-0 z-50 bg-black/70 p-4 backdrop-blur-sm"><div className="ml-auto h-full max-w-xl overflow-y-auto rounded-3xl border border-white/10 bg-[#111016] p-6 shadow-2xl shadow-violet-950/25"><div className="flex items-center justify-between"><h2 className="text-xl font-semibold tracking-tight">{drawer.title}</h2><button onClick={()=>setDrawer(null)} className="portal-mini-button rounded-full px-3 py-1.5 text-xs text-white/55">Close</button></div><form action={submit} className="mt-6 grid gap-4">{drawer.fields.map(([name,label,type])=>{const source={...(drawer.defaults||{}),...(drawer.item||{})};const selected=rawValue(source,name);const formValue=Array.isArray(selected)?selected:String(selected??"");const multiTeamValue=Array.isArray(selected)&&selected.length?selected:(rawValue(source,"team")?[String(rawValue(source,"team"))]:[]);return <label className="text-[10px] tracking-wider text-white/35" key={name}>{label.toUpperCase()}{type==="status-select"?<select name={name} defaultValue={formValue || "published"} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50">{["draft","published","active","completed","archived"].map((status)=><option value={status} key={status}>{status}</option>)}</select>:type==="recruitment-status-select"?<select name={name} defaultValue={formValue || "open"} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50"><option value="opening_soon">Opening soon</option><option value="open">Applications open</option><option value="closing_soon">Closing soon</option><option value="closed">Closed</option><option value="full">Registration full</option></select>:type==="application-status-select"?<select name={name} defaultValue={formValue || "pending"} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50"><option value="pending">Pending</option><option value="shortlisted">Shortlisted</option><option value="accepted">Accepted</option><option value="rejected">Rejected</option><option value="on_hold">On hold</option></select>:type==="question-type-select"?<select name={name} defaultValue={formValue || "long_text"} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50">{["short_text","long_text","number","multiple_choice","checkbox","dropdown","rating","url","file_upload"].map((kind)=><option value={kind} key={kind}>{kind.replace(/_/g," ")}</option>)}</select>:type==="contact-status-select"?<select name={name} defaultValue={formValue || "new"} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50"><option value="new">New</option><option value="in_progress">In progress</option><option value="resolved">Resolved</option></select>:type==="hall-category"?<select name={name} defaultValue={formValue || "top_contributor"} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50"><option value="top_contributor">Top Contributor</option><option value="alumni">Alumni</option></select>:type==="participation-select"?<select name={name} defaultValue={formValue || "individual"} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50"><option value="individual">Individual only</option><option value="team">Team only</option><option value="both">Individual or team</option></select>:type==="boolean-select"?<select name={name} defaultValue={String(selected === true || selected === "true")} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50"><option value="true">Yes</option><option value="false">No</option></select>:type==="lane-select"?<select name={name} defaultValue={formValue || "technical"} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50"><option value="technical">Joint Secretary (Technical & Operations)</option><option value="creative">Joint Secretary (Media & Creative)</option></select>:type==="event-select"?<select name={name} defaultValue={formValue} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50"><option value="">No linked event</option>{(data.events||[]).map((event:any)=><option value={idOf(event)} key={idOf(event)}>{event.title}</option>)}</select>:type==="recruitment-team-select"?<select name={name} defaultValue={formValue} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50"><option value="">Choose recruitment team</option>{(data.recruitmentTeams||[]).filter((team:any)=>team.active!==false).map((team:any)=><option value={idOf(team)} key={idOf(team)}>{team.name}</option>)}</select>:type==="recruitment-role-select"?<select name={name} defaultValue={formValue} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50"><option value="">All roles in selected team</option>{(data.recruitmentRoles||[]).filter((role:any)=>role.active!==false).map((role:any)=><option value={idOf(role)} key={idOf(role)}>{valueOf(role,"team") ? `${valueOf(role,"team")} / ` : ""}{role.name}</option>)}</select>:type==="team-select"?<select name={name} defaultValue={formValue} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50"><option value="">No team</option>{(data.teams||[]).filter((team:any)=>team.active!==false).map((team:any)=><option value={idOf(team)} key={idOf(team)}>{team.name}</option>)}</select>:type==="team-multi-select"?<select name={name} multiple defaultValue={multiTeamValue} className="mt-2 min-h-36 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50">{(data.teams||[]).filter((team:any)=>team.active!==false).map((team:any)=><option value={idOf(team)} key={idOf(team)}>{team.name}</option>)}</select>:type==="winner-select"?<select name={name} defaultValue={formValue} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50"><option value="">No winner selected</option>{winnerOptions(data,drawer.item).map((candidate:any)=><option value={candidate.id} key={candidate.id}>{candidate.label}</option>)}</select>:type==="member-select"?<select name={name} defaultValue={formValue} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50"><option value="">No member selected</option>{(data.users||[]).filter((user:any)=>user.status!=="inactive").map((user:any)=><option value={idOf(user)} key={idOf(user)}>{memberLabel(user)}</option>)}</select>:type==="member-multi-select"?<select name={name} multiple defaultValue={Array.isArray(formValue)?formValue:[]} className="mt-2 min-h-36 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50">{(data.users||[]).filter((user:any)=>user.status!=="inactive").map((user:any)=><option value={idOf(user)} key={idOf(user)}>{memberLabel(user)}</option>)}</select>:type==="gallery-assets"?<GalleryAssetsControl name={name} current={drawer.item?.assets || []} resource={drawer.resource} setPanel={setPanel}/>:type?.startsWith("upload")?<UploadControl name={name} current={Array.isArray(formValue)?"":formValue} upload={uploads[name]} uploading={Boolean(uploading[name])} onUpload={async(file)=>{setUploading((state)=>({...state,[name]:true}));setPanel(`Uploading ${file.name}...`);const form=new FormData();form.append("file",file);form.append("folder",`tech-tatva-os/${drawer.resource}`);const res=await fetch("/api/portal/upload",{method:"POST",body:form});const result=await res.json();setUploading((state)=>({...state,[name]:false}));if(!res.ok){setPanel(result.error || "Upload failed");return}setUploads((state)=>({...state,[name]:result}));setPanel(`Uploaded ${file.name}. Now save the form.`)}}/>:["description","body","message","aboutCopy","agenda","discussionPoints","decisionsTaken","actionItems","nextMeeting","announcementBanner","customSuccessMessage","adminNotes","helpText","options"].includes(name)?<textarea name={name} defaultValue={formValue} rows={5} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50"/>:<input name={name} type={type||"text"} defaultValue={formValue} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50"/>}</label>})}<p className="text-[10px] leading-4 text-white/35">Tip: hold Command/Ctrl to select multiple leads or co-leads.</p><button disabled={busy||Object.values(uploading).some(Boolean)} className="portal-command-button rounded-2xl py-3 text-sm font-semibold disabled:opacity-60">{busy?"Saving...":Object.values(uploading).some(Boolean)?"Uploading...":"Save changes"}</button></form></div></div>:null}
  </main>
}

function Header({active,data,open,setPanel}:{active:Module;data:Data;open:(drawer:any)=>void;setPanel:(text:string)=>void}){
  const singular=active==="Hall of Fame"?"Hall entry":active.slice(0,-1);
  const action=active==="Overview"?"Export summary":active==="Recruitment"?"Recruitment settings":active==="Attendance"?"Generate attendance":active==="Certificates"?"Certificate tools":active==="Settings"?"Update branding":active==="AI"?"Ask AI":active==="Contact Messages"?"Open messages":`Add ${singular}`;
  return <div className="portal-hero flex flex-wrap items-center justify-between gap-5 rounded-[1.75rem] p-5 md:p-8"><div><p className="text-[10px] font-semibold tracking-[.28em] text-violet-200/75">COMMAND CENTER / {active.toUpperCase()}</p><h2 className="mt-3 text-[2.65rem] font-semibold leading-[.92] tracking-[-.055em] md:text-5xl">{active==="Overview"?"Club intelligence":active==="AI"?"AI Desk":active}</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-white/48">Live operational controls for members, teams, events, attendance, recruitment, media, documents, and public club content.</p></div><button type="button" onClick={()=>{if(active==="Overview"){exportDashboardSummary(data);setPanel("Dashboard summary CSV downloaded.");}else if(active==="Recruitment"){open({resource:"recruitmentSettings",title:"Recruitment settings",fields:extraFields.recruitmentSettings,item:data.recruitmentSettings?.[0],defaults:{status:"open",registrationEnabled:"true",autoCloseAfterDeadline:"true"}})}else if(active==="Attendance"){window.dispatchEvent(new Event("portal-download-attendance"));setPanel("Generating attendance sheet for the selected event...");}else if(active==="Certificates"){setPanel("Choose an event below, select winners from Events if needed, then export PDF certificates as ZIP files.");}else if(active==="AI"){setPanel("Use the AI Desk below to generate reports, MOMs, and secretary answers from real MongoDB data.");}else if(active==="Contact Messages"){setPanel("Open a message row to read all sender details and update its status.");}else if(active==="Settings")open({resource:"settings",title:"Update club branding, faculty, and office bearers",fields:settingsFields});else{const c=config[active as keyof typeof config];open({resource:c.resource,title:`Add ${singular}`,fields:c.fields,defaults:active==="Events"?{status:"published",registrationOpen:"true"}:active==="Meetings"?{status:"completed"}:active==="Hall of Fame"?{category:"top_contributor",active:"true"}:{}})}}} className="portal-command-button flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-xs font-semibold transition hover:-translate-y-0.5 sm:w-auto sm:self-end">{active==="Overview"||active==="Attendance"?<Download size={14}/>:active==="Certificates"?<Award size={14}/>:active==="AI"?<Brain size={14}/>:active==="Contact Messages"?<MessageSquare size={14}/>:<Plus size={14}/>}<span>{action}</span></button></div>
}


const headersMap: Record<string, string[]> = {
  Members: ["Name", "Email", "UID", "Teams", "Role / Status"],
  Teams: ["Team Name", "Lead", "Co-Leads", "Members Count", "Status"],
  Events: ["Title", "Status", "Registration", "Venue", "Start Date/Time"],
  Meetings: ["Title", "Status", "Date", "Venue", "Organizer"],
  Tasks: ["Title", "Status", "Priority", "Due Date", "Team"],
  Announcements: ["Title", "Status", "Audience", "Publish Date"],
  Media: ["Title / Name", "Details", "Status", "Type / Assets"],
  "Hall of Fame": ["Name", "Category", "Title", "Year / Batch", "Status"],
  "Contact Messages": ["Name", "Email", "Subject", "Status", "Created At"]
};

function getWorkspaceStats(active: Module, data: Data) {
  if (active === "Members") {
    const total = data.users?.length || 0;
    const activeCount = data.users?.filter((u: any) => u.status === "active").length || 0;
    const inactiveCount = total - activeCount;
    return [
      { label: "Total Members", value: total, tone: "violet" },
      { label: "Active Roster", value: activeCount, tone: "emerald" },
      { label: "Inactive/Archived", value: inactiveCount, tone: "rose" }
    ];
  }
  if (active === "Teams") {
    const total = data.teams?.length || 0;
    const activeCount = data.teams?.filter((t: any) => t.active !== false).length || 0;
    const inactiveCount = total - activeCount;
    return [
      { label: "Total Teams", value: total, tone: "violet" },
      { label: "Active Lanes", value: activeCount, tone: "emerald" },
      { label: "Archived Lanes", value: inactiveCount, tone: "rose" }
    ];
  }
  if (active === "Events") {
    const total = data.events?.length || 0;
    const published = data.events?.filter((e: any) => e.status === "published" || e.status === "active").length || 0;
    const drafts = total - published;
    return [
      { label: "Total Events", value: total, tone: "violet" },
      { label: "Published & Active", value: published, tone: "emerald" },
      { label: "Drafts / Hidden", value: drafts, tone: "amber" }
    ];
  }
  if (active === "Meetings") {
    const total = data.meetings?.length || 0;
    const completed = data.meetings?.filter((m: any) => m.status === "completed").length || 0;
    const drafts = total - completed;
    return [
      { label: "Total Meetings", value: total, tone: "violet" },
      { label: "Completed Meetings", value: completed, tone: "emerald" },
      { label: "Draft / Pending", value: drafts, tone: "amber" }
    ];
  }
  if (active === "Tasks") {
    const total = data.tasks?.length || 0;
    const completed = data.tasks?.filter((t: any) => t.status === "completed").length || 0;
    const pending = total - completed;
    return [
      { label: "Total Tasks", value: total, tone: "violet" },
      { label: "Pending Tasks", value: pending, tone: "amber" },
      { label: "Completed", value: completed, tone: "emerald" }
    ];
  }
  if (active === "Announcements") {
    const total = data.announcements?.length || 0;
    const published = data.announcements?.filter((a: any) => a.status === "published").length || 0;
    const drafts = total - published;
    return [
      { label: "Total Announcements", value: total, tone: "violet" },
      { label: "Published", value: published, tone: "emerald" },
      { label: "Drafts", value: drafts, tone: "amber" }
    ];
  }
  if (active === "Media") {
    return [
      { label: "Gallery Albums", value: data.gallery?.length || 0, tone: "violet" },
      { label: "Club Sponsors", value: data.sponsors?.length || 0, tone: "amber" },
      { label: "Achievements", value: data.achievements?.length || 0, tone: "emerald" }
    ];
  }
  if (active === "Hall of Fame") {
    const total = data.hallOfFame?.length || 0;
    const activeCount = data.hallOfFame?.filter((h: any) => h.active !== false).length || 0;
    return [
      { label: "Total Hall Entries", value: total, tone: "violet" },
      { label: "Active Public", value: activeCount, tone: "emerald" },
      { label: "Archived", value: total - activeCount, tone: "rose" }
    ];
  }
  if (active === "Contact Messages") {
    const total = data.contactMessages?.length || 0;
    const unresolved = data.contactMessages?.filter((m: any) => m.status !== "resolved").length || 0;
    return [
      { label: "Total Messages", value: total, tone: "violet" },
      { label: "Unresolved", value: unresolved, tone: "rose" },
      { label: "Resolved", value: total - unresolved, tone: "emerald" }
    ];
  }
  return [];
}

function renderCell(cell: any, index: number) {
  const text = String(cell);
  const lower = text.toLowerCase();
  
  if (lower === "active" || lower === "published" || lower === "open" || lower === "resolved" || lower === "present") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300 border border-emerald-500/15">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        {text}
      </span>
    );
  }
  if (lower === "draft" || lower === "pending" || lower === "new" || lower === "medium") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300 border border-amber-500/15">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
        {text}
      </span>
    );
  }
  if (lower === "inactive" || lower === "archived" || lower === "closed" || lower === "absent" || lower === "high") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-400/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-rose-300 border border-rose-500/15">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
        {text}
      </span>
    );
  }
  if (lower === "in_progress" || lower === "low") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-400/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-300 border border-blue-500/15">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
        {text}
      </span>
    );
  }
  
  return <span className={index === 0 ? "font-semibold text-white/90" : "text-white/55"}>{text}</span>;
}

function Overview({counts,chart,setActive}:{counts:any;chart:any[];setActive:(m:Module)=>void}){
  const cards=[
    ["Total members",counts.members,"Members",Users,"from-violet-400 to-fuchsia-300","Manage roster"],
    ["Active teams",counts.teams,"Teams",Workflow,"from-emerald-300 to-violet-300","Assign leads"],
    ["Published events",counts.events,"Events",CalendarDays,"from-fuchsia-300 to-pink-300","Open events"],
    ["Open tasks",counts.tasks,"Tasks",CheckCircle2,"from-emerald-300 to-violet-300","Track work"]
  ];
  return (
    <>
      <div className="portal-quick-grid mt-5">
        {cards.map(([label,value,module,Icon,accent,copy]:any)=>(
          <button onClick={()=>setActive(module)} className="portal-quick-card group rounded-[1.6rem] p-5 text-left transition duration-300 hover:-translate-y-1 hover:border-violet-200/25" key={label}>
            <div className="flex items-start justify-between gap-4">
              <span className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${accent} text-black shadow-[0_0_30px_rgba(168,85,247,.24)]`}>
                <Icon size={18}/>
              </span>
              <span className="rounded-full border border-white/[.08] bg-white/[.035] px-3 py-1 text-[10px] font-semibold tracking-[.14em] text-white/35 transition group-hover:text-white/60">OPEN</span>
            </div>
            <p className="mt-7 text-xs font-medium text-white/42">{label}</p>
            <p className="mt-2 text-5xl font-semibold tracking-[-.07em] text-white">{value}</p>
            <p className="mt-3 text-xs text-white/35">{copy}</p>
          </button>
        ))}
      </div>
      <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_.44fr]">
        <div className="portal-chart rounded-[1.75rem] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-lg font-semibold text-white">System data volume</p>
              <p className="mt-1 text-xs text-white/38">Realtime operational footprint across core modules.</p>
            </div>
            <span className="rounded-full border border-violet-300/20 bg-violet-500/10 px-3 py-1.5 text-[10px] font-semibold tracking-[.18em] text-violet-100">LIVE</span>
          </div>
          <div className="mt-6 h-80">
            <ResponsiveContainer>
              <BarChart data={chart} barCategoryGap={42}>
                <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{fill:"#ffffff73",fontSize:11}}/>
                <Tooltip cursor={{fill:"rgba(139,92,246,.08)"}} contentStyle={{background:"#111016",border:"1px solid #ffffff16",borderRadius:14,color:"#fff"}}/>
                <Bar dataKey="v" fill="url(#portalBar)" radius={[12,12,4,4]}/>
                <defs>
                  <linearGradient id="portalBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f0abfc"/>
                    <stop offset="45%" stopColor="#8b5cf6"/>
                    <stop offset="100%" stopColor="#4c1d95"/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="portal-chart rounded-[1.75rem] p-6">
          <p className="text-lg font-semibold text-white">Quick access</p>
          <p className="mt-1 text-xs leading-5 text-white/38">Jump into the most used operating modules.</p>
          <div className="mt-5 grid gap-3">
            {(["Members","Events","Attendance","Hall of Fame","Settings"] as Module[]).map((module)=>(
              <button onClick={()=>setActive(module)} className="portal-mini-button flex items-center justify-between rounded-2xl px-4 py-3 text-left text-sm text-white/70 transition hover:-translate-y-0.5 hover:text-white" key={module}>
                <span>{module}</span>
                <span className="text-[10px] tracking-[.16em] text-violet-200/55">OPEN</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function splitPortalTeams(teams:any[]){
  const creative:any[]=[];
  const operations:any[]=[];
  (teams||[]).filter((team:any)=>team.active!==false).forEach((team:any)=>{
    (team.jointSecretaryLane==="creative"?creative:operations).push(team)
  });
  return {operations,creative}
}

function PortalStructureNode({label,name,meta,tone="violet",onEdit}:{label:string;name?:string;meta?:string;tone?:"violet"|"emerald"|"fuchsia";onEdit?:()=>void}){
  const tones={
    violet:"border-violet-300/25 bg-violet-500/10 text-violet-100 shadow-[0_0_20px_rgba(139,92,246,0.15)]",
    emerald:"border-emerald-300/25 bg-emerald-500/10 text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.15)]",
    fuchsia:"border-fuchsia-300/25 bg-fuchsia-500/10 text-fuchsia-100 shadow-[0_0_20px_rgba(217,70,239,0.15)]"
  };
  return (
    <button type="button" onClick={onEdit} className={`mx-auto block w-full max-w-lg rounded-3xl border p-5 text-center transition hover:-translate-y-0.5 ${tones[tone]}`}>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">{label}</p>
      <p className="mt-2 text-xl font-bold text-white tracking-tight">{name || "Add details"}</p>
      {meta?<p className="mt-2 text-xs leading-5 text-white/50">{meta}</p>:null}
    </button>
  );
}

function PortalTeamTreeCard({team,index,open,remove,restore}:{team:any;index:number;open:(drawer:any)=>void;remove:(resource:Resource,item:any)=>void;restore:(resource:Resource,item:any)=>void}){
  const fields=extraFields.teams;
  const inactive=team.active===false;
  const lead=valueOf(team,"lead") || "No lead assigned";
  const coLeads=asArray(team.coLeads).map((lead:any)=>lead?.name || (typeof lead==="string"?lead:"")).filter(Boolean);
  return (
    <div className={`rounded-[1.5rem] border p-4 transition duration-300 hover:border-violet-300/20 ${inactive?"border-white/[.06] bg-white/[.018] opacity-60":"border-white/[.08] bg-white/[.035]"}`}>
      <div className="rounded-2xl border border-white/[.08] bg-black/25 p-3 text-center">
        <p className="text-[9px] font-bold uppercase tracking-[.18em] text-white/35">Team Lead Group</p>
        <p className="mt-2 text-sm font-semibold text-white">{lead}</p>
      </div>
      <div className="mx-auto h-6 w-px bg-white/18"/>
      <div className="rounded-2xl border border-white/[.08] bg-black/25 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-base font-bold text-white tracking-tight">{team.name}</p>
            <p className="mt-1 text-[10px] uppercase tracking-[.16em] text-white/35">Order {team.order ?? index + 1} / {asArray(team.members).length} assigned</p>
          </div>
          <Workflow size={17} className="text-violet-200"/>
        </div>
        {team.description?<p className="mt-3 text-xs leading-5 text-white/45">{team.description}</p>:null}
        <div className="mt-3 grid gap-2">
          {coLeads.length?(
            <p className="rounded-xl border border-white/[.07] bg-white/[.035] px-3 py-2 text-xs text-white/65">Co-leads: {coLeads.join(", ")}</p>
          ):(
            <p className="rounded-xl border border-white/[.07] bg-white/[.025] px-3 py-2 text-xs text-white/35">No co-leads assigned</p>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-white/[0.04]">
          <button onClick={()=>open({resource:"teams",title:`Edit ${team.name}`,fields,item:team})} className="inline-flex items-center gap-1 rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 text-[10px] font-semibold text-violet-200 transition hover:bg-violet-500/20">Edit team</button>
          <button onClick={()=>open({resource:"users",title:`Add member to ${team.name}`,fields:config.Members.fields,defaults:{teams:[idOf(team)]}})} className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-200 transition hover:bg-emerald-500/20">Add member</button>
          {inactive?(
            <button onClick={()=>restore("teams",team)} className="inline-flex items-center gap-1 rounded-full border border-teal-500/30 bg-teal-500/10 px-2.5 py-1 text-[10px] font-semibold text-teal-200 transition hover:bg-teal-500/20">Restore</button>
          ):(
            <button onClick={()=>remove("teams",team)} className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-[10px] font-semibold text-rose-200 transition hover:bg-rose-500/20">Archive</button>
          )}
        </div>
      </div>
    </div>
  );
}

function TeamLaneEditor({title,subtitle,teams,tone,open,remove,restore}:{title:string;subtitle:string;teams:any[];tone:"emerald"|"fuchsia";open:(drawer:any)=>void;remove:(resource:Resource,item:any)=>void;restore:(resource:Resource,item:any)=>void}){
  return (
    <div>
      <PortalStructureNode label={title} name={subtitle} tone={tone}/>
      <div className="mx-auto h-8 w-px bg-white/20"/>
      <div className="grid gap-4 lg:grid-cols-2">
        {teams.length?teams.map((team:any,index:number)=>(
          <PortalTeamTreeCard key={idOf(team)} team={team} index={index} open={open} remove={remove} restore={restore}/>
        )):(
          <div className="rounded-3xl border border-white/[.08] bg-white/[.025] p-6 text-center text-sm text-white/42 lg:col-span-2">No teams in this lane yet. Create a team and assign its lead/members.</div>
        )}
      </div>
    </div>
  );
}

function PortalAdvisoryRow({info,open}:{info:any;open:(drawer:any)=>void}){
  const advisors=[info.studentAdvisorOneName,info.studentAdvisorTwoName].filter(Boolean);
  const coFaculty=info.coFacultyChampionName || info.coFacultyChampionPhoto || info.coFacultyChampionEmail;
  const columns=advisors.length + 1 + (coFaculty?1:0);
  return (
    <div className={`mx-auto grid w-full max-w-6xl gap-3 ${columns>=4?"md:grid-cols-4":columns>=3?"md:grid-cols-3":columns>=2?"md:grid-cols-2":"md:grid-cols-1"}`}>
      <PortalStructureNode label="Faculty Champion" name={info.facultyChampionName} meta={info.facultyChampionEmail || "Update from Settings"} tone="emerald" onEdit={()=>open({resource:"settings",title:"Update faculty champion and student advisors",fields:settingsFields})}/>
      {coFaculty?<PortalStructureNode label="Co-Faculty Champion" name={info.coFacultyChampionName} meta={info.coFacultyChampionEmail || info.coFacultyChampionPhone || "Update from Settings"} tone="emerald" onEdit={()=>open({resource:"settings",title:"Update co-faculty champion",fields:settingsFields})}/>:null}
      {advisors.map((name:string,index:number)=>(
        <PortalStructureNode key={`${name}-${index}`} label={`Student Advisor ${index+1}`} name={name} meta={index===0?info.studentAdvisorOneEmail:info.studentAdvisorTwoEmail} tone="emerald" onEdit={()=>open({resource:"settings",title:"Update student advisors",fields:settingsFields})}/>
      ))}
    </div>
  );
}

function PortalOperationsRoot({info,open}:{info:any;open:(drawer:any)=>void}){
  return <PortalStructureNode label="1. Secretary" name={info.secretaryName} meta={info.secretaryEmail || "Update from Settings"} tone="violet" onEdit={()=>open({resource:"settings",title:"Update secretary and joint secretaries",fields:settingsFields})}/>;
}

function TeamStructureEditor({data,open,remove,restore}:{data:Data;open:(drawer:any)=>void;remove:(resource:Resource,item:any)=>void;restore:(resource:Resource,item:any)=>void}){
  const info=data.clubInfo||{};
  const {operations,creative}=splitPortalTeams(data.teams||[]);
  return (
    <div className="mt-7 grid gap-4 xl:grid-cols-[1fr_.32fr]">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/[.08] bg-[#05070d]/75 p-5 md:p-7">
        <div className="absolute inset-0 grid-bg opacity-20"/>
        <div className="relative grid gap-6">
          <div className="rounded-[1.7rem] border border-emerald-300/15 bg-emerald-400/[.035] p-5 shadow-[inset_0_1px_rgba(255,255,255,0.02)]">
            <p className="mb-4 text-center text-[10px] font-bold uppercase tracking-[.22em] text-emerald-100/55">Advisory Tree</p>
            <PortalAdvisoryRow info={info} open={open}/>
          </div>
          <div className="rounded-[1.7rem] border border-violet-300/15 bg-violet-400/[.035] p-5 shadow-[inset_0_1px_rgba(255,255,255,0.02)]">
            <p className="mb-4 text-center text-[10px] font-bold uppercase tracking-[.22em] text-violet-100/55">Club Operations Tree</p>
            <PortalOperationsRoot info={info} open={open}/>
            <div className="mx-auto h-10 w-px bg-white/25"/>
            <div className="mx-auto hidden h-px max-w-4xl bg-gradient-to-r from-emerald-300/0 via-emerald-300/45 to-fuchsia-300/45 md:block"/>
            <div className="mt-6 grid gap-8 2xl:grid-cols-2">
              <TeamLaneEditor title="2. Joint Secretary (Technical & Operations)" subtitle={info.jointSecretaryOneName || "Assign in Settings"} teams={operations} tone="emerald" open={open} remove={remove} restore={restore}/>
              <TeamLaneEditor title="3. Joint Secretary (Media & Creative)" subtitle={info.jointSecretaryTwoName || "Assign in Settings"} teams={creative} tone="fuchsia" open={open} remove={remove} restore={restore}/>
            </div>
          </div>
        </div>
      </div>
      <div className="glass rounded-[1.5rem] p-5 self-start">
        <p className="text-sm font-semibold text-white">Structure Actions</p>
        <button onClick={()=>open({resource:"teams",title:"Create team",fields:config.Teams.fields,defaults:{active:"true",jointSecretaryLane:"technical"}})} className="portal-command-button mt-4 w-full rounded-2xl px-4 py-3 text-xs font-semibold animate-pulse hover:animate-none">Create team</button>
        <a href="/api/portal/structure/export" className="portal-command-button mt-3 block w-full rounded-2xl px-4 py-3 text-center text-xs font-semibold">Export structure Excel</a>
        <button onClick={()=>open({resource:"settings",title:"Update faculty, advisors, secretary, and joint secretaries",fields:settingsFields})} className="portal-mini-button mt-3 w-full rounded-2xl px-4 py-3 text-xs font-semibold text-violet-100">Edit top hierarchy</button>
        <p className="mt-4 text-xs leading-6 text-white/42 border-t border-white/[0.04] pt-4">Faculty Champion and Student Advisors are now advisory-only. The actual team reporting tree starts from Secretary, then moves to Joint Secretaries, team leads, and teams.</p>
      </div>
    </div>
  );
}

function Workspace({active,data,rows,open,remove,restore,patch,duplicateEvent}:{active:Module;data:Data;rows:any[];open:(drawer:any)=>void;remove:(resource:Resource,item:any)=>void;restore:(resource:Resource,item:any)=>void;patch:(resource:Resource,item:any,body:Record<string, any>,message:string)=>void;duplicateEvent:(item:any)=>void}) {
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
              emerald: "border-emerald-500/15 bg-emerald-500/[0.03] text-emerald-200 shadow-[inset_0_1px_rgba(255,255,255,0.01)]",
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
        <div className="glass rounded-[2rem] p-5 md:p-6 overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4 mb-4">
            <p className="text-sm font-semibold text-white uppercase tracking-wider">{active} Workspace</p>
            <span className="rounded-full bg-white/[0.045] px-3 py-1 text-[10px] font-semibold text-white/50">{rows.length} total records</span>
          </div>
          
          {rows.length ? (
            <div className="mt-4 max-h-[min(650px,calc(100vh-340px))] overflow-auto overscroll-contain rounded-2xl border border-white/[.06] mobile-tabs">
              <div className="max-w-full min-w-[750px]">
                {/* Table Header Row */}
                <div className={`hidden md:grid gap-3 bg-white/[.045] px-4 py-3.5 text-[10px] font-bold uppercase tracking-wider text-white/40 border-b border-white/[0.08] ${
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
                      ? "grid-cols-[1.2fr_1fr_1fr_1.1fr_1fr_1.4fr]" 
                      : "grid-cols-[1.5fr_1.2fr_1.2fr_1.2fr_1.4fr]";

                    return (
                      <div className={`grid gap-3 p-4 text-sm hover:bg-white/[0.02] transition md:grid-cols-none md:text-xs md:items-center ${gridClass}`} key={idOf(item)}>
                        {cellData.map((cell: any, index: number) => (
                          <button 
                            onClick={() => open({ resource, title: `Edit ${active === "Hall of Fame" ? "Hall entry" : active.slice(0, -1)}`, fields, item })} 
                            className={`rounded-2xl border border-white/[.06] bg-white/[.025] p-3 text-left md:border-0 md:bg-transparent md:p-0 transition hover:text-white ${index === 0 ? "text-white/80" : "text-white/48"}`} 
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
                              <button onClick={() => patch(resource, item, { status: "published" }, "Event published. It is visible on the public website.")} className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-200 transition hover:bg-emerald-500/20">
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
                            <button onClick={() => patch(resource, item, { status: item.status === "resolved" ? "new" : "resolved" }, item.status === "resolved" ? "Message reopened." : "Message marked resolved.")} className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-200 transition hover:bg-emerald-500/20">
                              {item.status === "resolved" ? "Reopen" : "Resolve"}
                            </button>
                          ) : inactive ? (
                            <button onClick={() => restore(resource, item)} className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-200 transition hover:bg-emerald-500/20">
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
        
        <div className="glass rounded-[1.5rem] p-5 self-start">
          <p className="text-sm font-semibold text-white">Module Actions</p>
          {active === "Media" ? (["gallery", "sponsors", "achievements"] as Resource[]).map((resource) => (
            <button onClick={() => open({ resource, title: `Add ${resource}`, fields: extraFields[resource] })} className="portal-mini-button mt-3 block w-full rounded-2xl px-4 py-3 text-left text-xs text-white/68 transition hover:-translate-y-0.5 hover:text-white" key={resource}>Add {resource}</button>
          )) : (
            <button onClick={() => open({ resource: c.resource, title: `Add ${active === "Hall of Fame" ? "Hall entry" : active.slice(0, -1)}`, fields: c.fields, defaults: active === "Hall of Fame" ? { category: "top_contributor", active: "true" } : defaults })} className="portal-command-button mt-3 block w-full rounded-2xl px-4 py-3 text-left text-xs text-white/68 transition hover:-translate-y-0.5 hover:text-white">Create record</button>
          )}
          <p className="portal-mini-button mt-3 rounded-2xl px-4 py-3 text-xs leading-5 text-white/60 border-t border-white/[0.04] pt-3">{helper}</p>
        </div>
      </div>
    </div>
  );
}

function RecruitmentDesk({data,open,patch,remove,refresh,setPanel}:{data:Data;open:(drawer:any)=>void;patch:(resource:Resource,item:any,body:Record<string, any>,message:string)=>void;remove:(resource:Resource,item:any)=>void;refresh:()=>Promise<void>;setPanel:(value:string)=>void}) {
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
  const exportHref = `/api/recruitment/export?${new URLSearchParams(Object.entries({team:teamFilter!=="all"?teamFilter:"",role:roleFilter!=="all"?roleFilter:"",status:statusFilter!=="all"?statusFilter:"",from:dateFrom,to:dateTo}).filter(([,v])=>v)).toString()}`;
  
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
    return `h-fit rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.14em] ${status==="accepted"?"bg-emerald-400/10 text-emerald-200":status==="rejected"?"bg-rose-400/10 text-rose-200":status==="shortlisted"?"bg-violet-400/10 text-violet-100":status==="on_hold"?"bg-amber-400/10 text-amber-100":"bg-white/[.06] text-white/45"}`;
  }
  
  function SortButton({column,label}:{column:typeof sortKey;label:string}) {
    return <button type="button" onClick={()=>sortBy(column)} className="inline-flex items-center gap-1 text-left uppercase tracking-wider text-white/35 hover:text-white/70">{label}<ArrowUpDown size={11} className={sortKey===column?"text-violet-200":"text-white/25"}/></button>;
  }
  
  async function bulk(action:"accept"|"reject"|"shortlist"|"hold"){
    if (!selected.length) return;
    const count = selected.length;
    setBulkBusy(true);
    const res = await fetch("/api/recruitment/bulk",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action,ids:selected})});
    setBulkBusy(false);
    if (!res.ok){setPanel("Bulk action failed.");return;}
    setSelected([]);
    await refresh();
    setPanel(`Bulk ${action} completed for ${count} applications.`);
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
              ["Accepted", counts.accepted, "border-emerald-500/20 text-emerald-200 bg-emerald-500/[0.02]"],
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
                <button disabled={!selected.length||bulkBusy} onClick={()=>bulk("accept")} className="portal-link-action text-emerald-200 border-emerald-500/20 disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:bg-transparent">
                  Bulk accept
                </button>
                <button disabled={!selected.length||bulkBusy} onClick={()=>bulk("reject")} className="portal-link-action text-rose-200 border-rose-500/20 disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:bg-transparent">
                  Bulk reject
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
                    <button onClick={()=>patch("recruitmentApplications",item,{status:"accepted"},"Application accepted.")} className="portal-link-action text-emerald-200 border-emerald-500/20 hover:bg-emerald-500/10">
                      <Check size={12} className="mr-1"/> Accept
                    </button>
                    <button onClick={()=>patch("recruitmentApplications",item,{status:"on_hold"},"Application moved on hold.")} className="portal-link-action text-amber-200 border-amber-500/20 hover:bg-amber-500/10">
                      Hold
                    </button>
                    <button onClick={()=>patch("recruitmentApplications",item,{status:"rejected"},"Application rejected.")} className="portal-link-action text-rose-200 border-rose-500/20 hover:bg-rose-500/10">
                      <X size={12} className="mr-1"/> Reject
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
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider ${settings?.status === "open" ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/25" : "bg-rose-500/10 text-rose-300 border border-rose-500/25"}`}>
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
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${row.active === "false" || row.active === false ? "bg-rose-500/10 text-rose-300 border border-rose-500/20" : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"}`}>
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
                      <span className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-500/5 text-emerald-300 font-mono">
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

function AIDesk({ data, setPanel }: { data: Data; setPanel: (value: string) => void }) {
  const events = data.events || [];
  const meetings = data.meetings || [];
  const [eventId, setEventId] = useState(events[0] ? idOf(events[0]) : "");
  const [meetingId, setMeetingId] = useState(meetings[0] ? idOf(meetings[0]) : "");
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");
  const [asking, setAsking] = useState(false);
  const selectedEvent = events.find((event: any) => idOf(event) === eventId);
  const selectedMeeting = meetings.find((meeting: any) => idOf(meeting) === meetingId);

  async function askSecretary() {
    const text = prompt.trim();
    if (!text) {
      setPanel("Write a question for the Secretary Assistant first.");
      return;
    }
    setAsking(true);
    setPanel("Secretary Assistant is reading live MongoDB context...");
    const res = await fetch("/api/ai/secretary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: text })
    });
    const raw = await res.text();
    let result: any = {};
    try {
      result = raw ? JSON.parse(raw) : {};
    } catch {
      result = { error: raw.slice(0, 220) };
    }
    setAsking(false);
    if (!res.ok) {
      setPanel(result.error || "Secretary Assistant failed.");
      return;
    }
    const response = String(result.response || "").trim();
    if (!response) {
      setPanel(result.error || "AI returned an empty response. Try again.");
      return;
    }
    setAnswer(response);
    setPanel("Secretary Assistant response generated and logged.");
  }

  const docs = (data.generatedDocuments || []).slice(0, 8);

  return (
    <div className="mt-7 grid gap-5 xl:grid-cols-[1fr_.42fr]">
      {/* Left Column - Generators */}
      <div className="grid gap-5">
        {/* Report Generator Card */}
        <div className="relative overflow-hidden rounded-[2rem] border border-white/[.08] bg-[#05070d]/75 p-6 md:p-7">
          <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/[0.04] via-transparent to-violet-500/[0.04]" />
          <div className="relative">
            <div className="flex items-center gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-fuchsia-400 to-pink-300 text-black shadow-[0_0_30px_rgba(217,70,239,.24)]">
                <FileText size={18} />
              </span>
              <div>
                <p className="text-base font-bold text-white tracking-tight">Post Event Report Generator</p>
                <p className="mt-1 text-xs text-white/38">Uses your official PDF template with real event, registration, attendance \u0026 gallery data.</p>
              </div>
            </div>
            <select value={eventId} onChange={(event) => setEventId(event.target.value)} className="mt-5 w-full rounded-2xl border border-white/[.07] bg-black/35 px-4 py-3.5 text-sm text-white outline-none focus:border-fuchsia-400/40 transition">
              <option value="">Select event</option>
              {events.map((event: any) => <option value={idOf(event)} key={idOf(event)}>{event.title}</option>)}
            </select>
            {selectedEvent ? (
              <div className="mt-3 rounded-xl border border-fuchsia-500/15 bg-fuchsia-500/[0.04] px-4 py-2.5 text-xs text-fuchsia-200/70">
                <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400 animate-pulse" /> Selected: {selectedEvent.title}</span>
              </div>
            ) : (
              <p className="mt-3 text-xs text-white/30">Create an event first if this list is empty.</p>
            )}
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <a download aria-disabled={!eventId} onClick={(event) => { if (!eventId) { event.preventDefault(); setPanel("Select an event before downloading a report."); } }} href={eventId ? `/api/ai/event-report?event=${eventId}&format=pdf` : "#"} className="portal-command-button flex items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-center text-xs font-semibold transition hover:-translate-y-0.5">
                <Download size={13} /> Download PDF
              </a>
              <a download aria-disabled={!eventId} onClick={(event) => { if (!eventId) { event.preventDefault(); setPanel("Select an event before downloading a report."); } }} href={eventId ? `/api/ai/event-report?event=${eventId}&format=docx` : "#"} className="flex items-center justify-center gap-2 rounded-2xl border border-white/[.08] bg-white/[.035] px-4 py-3.5 text-center text-xs font-semibold text-white/70 transition hover:-translate-y-0.5 hover:bg-white/[.06] hover:text-white">
                <Download size={13} /> Download DOCX
              </a>
            </div>
          </div>
        </div>

        {/* MOM Generator Card */}
        <div className="relative overflow-hidden rounded-[2rem] border border-white/[.08] bg-[#05070d]/75 p-6 md:p-7">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.04] via-transparent to-violet-500/[0.04]" />
          <div className="relative">
            <div className="flex items-center gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-emerald-300 to-teal-300 text-black shadow-[0_0_30px_rgba(16,185,129,.24)]">
                <MessageSquare size={18} />
              </span>
              <div>
                <p className="text-base font-bold text-white tracking-tight">Minutes of Meeting Generator</p>
                <p className="mt-1 text-xs text-white/38">Generate official M2M/MOM documents using your format template and meeting records.</p>
              </div>
            </div>
            <select value={meetingId} onChange={(event) => setMeetingId(event.target.value)} className="mt-5 w-full rounded-2xl border border-white/[.07] bg-black/35 px-4 py-3.5 text-sm text-white outline-none focus:border-emerald-400/40 transition">
              <option value="">Select meeting</option>
              {meetings.map((meeting: any) => <option value={idOf(meeting)} key={idOf(meeting)}>{meeting.title}</option>)}
            </select>
            {selectedMeeting ? (
              <div className="mt-3 rounded-xl border border-emerald-500/15 bg-emerald-500/[0.04] px-4 py-2.5 text-xs text-emerald-200/70">
                <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Selected: {selectedMeeting.title}</span>
              </div>
            ) : (
              <p className="mt-3 text-xs text-white/30">Create a meeting from the Meetings tab first.</p>
            )}
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <a download aria-disabled={!meetingId} onClick={(event) => { if (!meetingId) { event.preventDefault(); setPanel("Select a meeting before downloading MOM."); } }} href={meetingId ? `/api/ai/mom?meeting=${meetingId}&format=pdf` : "#"} className="portal-command-button flex items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-center text-xs font-semibold transition hover:-translate-y-0.5">
                <Download size={13} /> Download MOM PDF
              </a>
              <a download aria-disabled={!meetingId} onClick={(event) => { if (!meetingId) { event.preventDefault(); setPanel("Select a meeting before downloading MOM."); } }} href={meetingId ? `/api/ai/mom?meeting=${meetingId}&format=docx` : "#"} className="flex items-center justify-center gap-2 rounded-2xl border border-white/[.08] bg-white/[.035] px-4 py-3.5 text-center text-xs font-semibold text-white/70 transition hover:-translate-y-0.5 hover:bg-white/[.06] hover:text-white">
                <Download size={13} /> Download MOM DOCX
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Secretary Assistant & Document Timeline */}
      <div className="grid gap-5 self-start">
        {/* Secretary Assistant Console */}
        <div className="relative overflow-hidden rounded-[2rem] border border-white/[.08] bg-[#05070d]/75 p-6 md:p-7">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.04] via-transparent to-fuchsia-500/[0.04]" />
          <div className="relative">
            <div className="flex items-center gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-violet-400 to-fuchsia-300 text-black shadow-[0_0_30px_rgba(139,92,246,.24)]">
                <Brain size={18} />
              </span>
              <div>
                <p className="text-base font-bold text-white tracking-tight">Secretary Assistant</p>
                <p className="mt-1 text-xs text-white/38">Answers from live database context only.</p>
              </div>
            </div>
            <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={5} placeholder="Ask about pending tasks, registration status, attendance gaps, upcoming meetings..." className="mt-5 w-full rounded-2xl border border-white/[.07] bg-black/35 px-4 py-3.5 text-sm leading-6 text-white outline-none placeholder:text-white/25 focus:border-violet-400/40 transition" />
            <button disabled={asking} onClick={askSecretary} className="portal-command-button mt-3 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-xs font-semibold disabled:opacity-60 transition hover:-translate-y-0.5">
              <Brain size={13} className={asking ? "animate-spin" : ""} />
              {asking ? "Thinking..." : "Ask Secretary Assistant"}
            </button>
            {answer ? (
              <div className="mt-4 rounded-2xl border border-violet-500/15 bg-violet-500/[0.03] p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-200/45 mb-2">AI RESPONSE</p>
                <div className="text-sm leading-7 text-white/70 whitespace-pre-wrap font-mono">{answer}</div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Document Timeline */}
        <div className="rounded-[2rem] border border-white/[.08] bg-[#05070d]/75 p-6 md:p-7">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4 mb-5">
            <div>
              <p className="text-sm font-semibold text-white uppercase tracking-wider">Document Timeline</p>
              <p className="mt-1 text-xs text-white/35">Recently generated reports \u0026 documents</p>
            </div>
            <span className="rounded-full bg-white/[0.045] px-3 py-1 text-[10px] font-semibold text-white/50">{docs.length}</span>
          </div>
          {docs.length ? (
            <div className="relative pl-5">
              <div className="absolute left-1.5 top-1 bottom-1 w-px bg-gradient-to-b from-violet-500/30 via-fuchsia-500/20 to-transparent" />
              <div className="grid gap-3 max-h-[420px] overflow-y-auto overscroll-contain pr-1 mobile-tabs">
                {docs.map((doc: any) => (
                  <div className="relative rounded-xl border border-white/[.06] bg-white/[.02] p-4 transition hover:border-violet-300/15 hover:bg-white/[.03]" key={idOf(doc)}>
                    <div className="absolute -left-[18px] top-5 h-2.5 w-2.5 rounded-full border-2 border-violet-400/50 bg-[#0c0512]" />
                    <p className="text-xs font-semibold text-white/80 tracking-tight">{doc.title}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="rounded-full bg-violet-500/10 border border-violet-500/15 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-violet-200/70">{doc.kind}</span>
                      <span className="rounded-full bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white/40">{doc.format}</span>
                    </div>
                    <p className="mt-2 text-[10px] text-white/30">{doc.generatedAt ? new Date(doc.generatedAt).toLocaleString("en-IN") : "generated"}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="rounded-xl border border-white/[.06] bg-white/[.025] p-5 text-sm text-white/40 text-center">No generated documents yet. Use the generators on the left to create reports.</p>
          )}
        </div>
      </div>
    </div>
  );
}


function Attendance({ data, setPanel, refresh }: { data: Data; setPanel: (value: string) => void; refresh: () => Promise<void> }) {
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
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.02] via-transparent to-emerald-500/[0.02]" />
        
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
            <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.04] p-4 transition duration-200 hover:-translate-y-0.5">
              <p className="text-[9px] uppercase tracking-[.18em] text-emerald-300/60">Present</p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-emerald-300">{presentCount}</p>
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
                      <span className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider border ${isPresent ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300" : "bg-white/[0.04] border-white/[0.06] text-white/40"}`}>
                        {isPresent ? "Present" : "Absent"}
                      </span>
                      
                      {isPresent ? (
                        <button type="button" disabled={busy} onClick={(event) => { event.preventDefault(); event.stopPropagation(); void mark(row, "absent"); }} className="min-h-11 md:min-h-0 flex items-center justify-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-3.5 py-1.5 text-[10px] font-bold text-rose-300 hover:bg-rose-500/20 active:scale-95 transition disabled:cursor-wait disabled:opacity-60">
                          {busy ? "Saving..." : "Mark absent"}
                        </button>
                      ) : (
                        <button type="button" disabled={busy} onClick={(event) => { event.preventDefault(); event.stopPropagation(); void mark(row, "present"); }} className="min-h-11 md:min-h-0 flex items-center justify-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-[10px] font-bold text-emerald-300 hover:bg-emerald-500/20 active:scale-95 transition disabled:cursor-wait disabled:opacity-60">
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
              <div className="flex justify-between"><span>Marked present:</span><span className="font-semibold text-emerald-300">{presentCount}</span></div>
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

function winnerDisplay(event: any, key: "winnerFirst" | "winnerSecond" | "winnerThird") {
  const winner = event?.[key];
  if (!winner) return "Not selected";
  if (typeof winner === "object") return `${winner.name || "Selected candidate"}${winner.uid ? ` / ${winner.uid}` : ""}`;
  return "Selected candidate";
}

function CertificatesDesk({ data, setPanel, open }: { data: Data; setPanel: (value: string) => void; open: (drawer: any) => void }) {
  const events = data.events || [];
  const [selected, setSelected] = useState(events[0] ? idOf(events[0]) : "");
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
      name: member.name || member.user?.name,
      uid: member.uid || member.user?.uid,
      program: member.program || member.user?.program,
      semester: member.semester || member.user?.semester,
      mode: "team",
      teamName: registration.teamName || ""
    }));
    return [...leader, ...members];
  });
  const presentParticipants = participants.filter((row: any) => attendanceMap.get(`${selected}:${row.user}`)?.status === "present");
  const guardedDownload = (valid: boolean, message: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (!valid) {
      event.preventDefault();
      setPanel(message);
    }
  };

  return (
    <div className="mt-7 grid gap-5 xl:grid-cols-[1fr_.42fr] animate-in fade-in duration-200">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/[.08] bg-[#05070d]/75 p-6 md:p-7">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.02] via-transparent to-fuchsia-500/[0.02]" />
        
        <div className="relative flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] pb-5 mb-6">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Certificate Generation</h3>
            <p className="mt-1 text-xs text-white/38">Exports use your HTML certificate templates to generate high-fidelity PDFs.</p>
          </div>
          
          <select value={selected} onChange={(event) => setSelected(event.target.value)} className="rounded-2xl border border-white/[.07] bg-black/35 px-4 py-2.5 text-xs text-white outline-none focus:border-violet-400/40 transition">
            <option value="">Select event</option>
            {events.map((event: any) => <option value={idOf(event)} key={idOf(event)}>{event.title}</option>)}
          </select>
        </div>

        <div className="grid gap-3 grid-cols-3 mb-6 relative z-10">
          <div className="rounded-2xl border border-white/[.06] bg-white/[.02] p-4 transition duration-200 hover:-translate-y-0.5">
            <p className="text-[9px] uppercase tracking-[.18em] text-white/35">Registered</p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-white">{participants.length}</p>
          </div>
          <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.04] p-4 transition duration-200 hover:-translate-y-0.5">
            <p className="text-[9px] uppercase tracking-[.18em] text-emerald-300/60">Present</p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-emerald-300">{presentParticipants.length}</p>
          </div>
          <div className="rounded-2xl border border-violet-500/15 bg-violet-500/[0.04] p-4 transition duration-200 hover:-translate-y-0.5">
            <p className="text-[9px] uppercase tracking-[.18em] text-violet-300/60">Winner Slots</p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-violet-300">
              {[selectedEvent?.winnerFirst, selectedEvent?.winnerSecond, selectedEvent?.winnerThird].filter(Boolean).length}/3
            </p>
          </div>
        </div>

        {presentParticipants.length ? (
          <div className="relative overflow-hidden rounded-2xl border border-white/[.06]">
            <div className="hidden grid-cols-[1.1fr_1fr_1.1fr_.7fr_auto] gap-3 bg-white/[.04] px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-white/40 border-b border-white/[0.06] md:grid">
              <span>Present Candidate</span>
              <span>UID</span>
              <span>Program</span>
              <span>Mode</span>
              <span className="text-right pr-4">Action</span>
            </div>
            
            <div className="max-h-[380px] overflow-y-auto overscroll-contain divide-y divide-white/[0.04] mobile-tabs">
              {presentParticipants.map((row: any) => (
                <div className="grid gap-3 bg-black/10 px-5 py-4 text-xs hover:bg-white/[0.01] transition md:grid-cols-[1.1fr_1fr_1.1fr_.7fr_auto] md:items-center" key={`${row.registration}-${row.user}`}>
                  <div>
                    <p className="font-bold text-white/80 tracking-tight">{row.name || "Unnamed candidate"}</p>
                    {row.teamName ? <p className="mt-1 text-[10px] text-violet-300/65 font-medium">Team: {row.teamName}</p> : null}
                  </div>
                  
                  <span className="rounded-2xl border border-white/[.06] bg-white/[.02] px-3 py-2 text-white/48 md:border-0 md:bg-transparent md:px-0 md:py-0">{row.uid || "-"}</span>
                  <span className="rounded-2xl border border-white/[.06] bg-white/[.02] px-3 py-2 text-white/48 md:border-0 md:bg-transparent md:px-0 md:py-0">{row.program || "-"}{row.semester ? ` / Sem ${row.semester}` : ""}</span>
                  <span className="rounded-2xl border border-white/[.06] bg-white/[.02] px-3 py-2 capitalize text-white/48 md:border-0 md:bg-transparent md:px-0 md:py-0">{row.mode}</span>
                  
                  <div className="flex justify-end pr-4">
                    <a download onClick={() => setPanel(`Downloading participation certificate for ${row.name || "candidate"}...`)} className="portal-command-button flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-center text-[10px] font-bold hover:scale-[1.02] active:scale-95 transition" href={`/api/certificates/export?event=${selected}&type=participation&format=pdf&candidate=${row.user}`}>
                      <Download size={11} /> Participation PDF
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="rounded-2xl border border-white/[.06] bg-white/[.02] p-8 text-sm text-white/35 text-center font-medium">
            No present candidates yet. Mark attendance present before exporting participation certificates.
          </p>
        )}
      </div>

      <div className="grid gap-5 self-start">
        <div className="rounded-[2rem] border border-white/[.08] bg-[#05070d]/75 p-6 md:p-7 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.04] via-transparent to-fuchsia-500/[0.04]" />
          
          <div className="relative">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/[0.06] pb-4 mb-4">Winner Selection</h3>
            
            <div className="grid gap-4 mt-4 mb-6">
              {[
                { label: "1st Place", key: "winnerFirst", color: "from-amber-400 to-yellow-300 text-amber-200" },
                { label: "2nd Place", key: "winnerSecond", color: "from-slate-300 to-zinc-200 text-slate-200" },
                { label: "3rd Place", key: "winnerThird", color: "from-amber-700 to-amber-600 text-amber-600/90" }
              ].map(({ label, key, color }) => (
                <div className="relative flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.015] p-3.5 transition hover:border-white/10" key={key}>
                  <span className={`grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br ${color} text-black text-xs font-black shadow-lg`}>
                    {label[0]}
                  </span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[.15em] text-white/30">{label}</p>
                    <p className="mt-1 text-xs font-semibold text-white/85 truncate max-w-[200px]">
                      {winnerDisplay(selectedEvent, key as any)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button type="button" onClick={() => selectedEvent ? open({ resource: "events", title: `Select winners for ${selectedEvent.title}`, fields: config.Events.fields, item: selectedEvent }) : setPanel("Select an event before choosing winners.")} className="portal-command-button w-full flex items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-xs font-semibold hover:-translate-y-0.5 transition">
              <Award size={14} /> Choose / Update Winners
            </button>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/[.08] bg-[#05070d]/75 p-6 md:p-7 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/[0.03] via-transparent to-transparent" />
          
          <div className="relative">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/[0.06] pb-4 mb-4">Winner Certificate PDFs</h3>
            <p className="text-xs leading-relaxed text-white/40 mb-5">
              Generate and download winner certificates for the selected positions.
            </p>
            
            <div className="grid gap-3 sm:grid-cols-3 relative z-10">
              <a download onClick={guardedDownload(Boolean(selected && selectedEvent?.winnerFirst), "Select a 1st place winner first.")} className="portal-mini-button flex items-center justify-center gap-1.5 rounded-xl px-3 py-3 text-center text-[10px] font-bold text-white/70 hover:bg-white/[0.06] hover:-translate-y-0.5 hover:text-white transition" href={selected ? `/api/certificates/export?event=${selected}&type=winner&format=pdf&place=1` : "#"}>
                <Download size={11} /> 1st Place
              </a>
              <a download onClick={guardedDownload(Boolean(selected && selectedEvent?.winnerSecond), "Select a 2nd place winner first.")} className="portal-mini-button flex items-center justify-center gap-1.5 rounded-xl px-3 py-3 text-center text-[10px] font-bold text-white/70 hover:bg-white/[0.06] hover:-translate-y-0.5 hover:text-white transition" href={selected ? `/api/certificates/export?event=${selected}&type=winner&format=pdf&place=2` : "#"}>
                <Download size={11} /> 2nd Place
              </a>
              <a download onClick={guardedDownload(Boolean(selected && selectedEvent?.winnerThird), "Select a 3rd place winner first.")} className="portal-mini-button flex items-center justify-center gap-1.5 rounded-xl px-3 py-3 text-center text-[10px] font-bold text-white/70 hover:bg-white/[0.06] hover:-translate-y-0.5 hover:text-white transition" href={selected ? `/api/certificates/export?event=${selected}&type=winner&format=pdf&place=3` : "#"}>
                <Download size={11} /> 3rd Place
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Settings({ info, open }: { info: any; open: (drawer: any) => void }) {
  const brandingKeys = ["logo", "website", "email", "location", "footerCopy", "aboutTitle", "aboutCopy", "vision", "mission"];
  const advisorsKeys = ["facultyChampionName", "facultyChampionPhoto", "facultyChampionEmail", "facultyChampionPhone", "coFacultyChampionName", "coFacultyChampionPhoto", "coFacultyChampionEmail", "coFacultyChampionPhone"];
  const bearersKeys = ["secretaryName", "secretaryEmail", "secretaryPhoto", "studentAdvisorOneName", "studentAdvisorOnePhoto", "studentAdvisorTwoName", "studentAdvisorTwoPhoto", "jointSecretaryOneName", "jointSecretaryTwoName"];
  const docKeys = ["postActivityReportTemplate", "momTemplate"];

  function formatKeyLabel(key: string) {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .replace("Name", "")
      .replace("Photo", " Photo")
      .replace("Email", " Email")
      .replace("Phone", " Phone")
      .replace("Template", " Template")
      .trim();
  }

  function renderSettingValue(key: string) {
    const val = info[key];
    if (!val) return <span className="text-white/25 italic">Not set</span>;

    if (key.toLowerCase().includes("photo") || key === "logo") {
      return (
        <div className="flex items-center gap-3">
          <img src={val} alt={key} className="h-12 w-12 rounded-xl object-cover border border-white/10 bg-black/20" />
          <span className="text-xs text-white/50 truncate max-w-[200px] font-mono">{val.split("/").pop()}</span>
        </div>
      );
    }

    if (key.toLowerCase().includes("template")) {
      return (
        <a href={val} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-300 hover:bg-emerald-500/20 transition">
          <FileText size={11} /> View Template PDF
        </a>
      );
    }

    return <span className="text-white/80 break-all leading-relaxed font-sans">{val}</span>;
  }

  return (
    <div className="mt-7 grid gap-5 lg:grid-cols-[1fr_.42fr] animate-in fade-in duration-200">
      <div className="space-y-5">
        {[
          { title: "Club Branding & Vision", keys: brandingKeys, color: "text-violet-200" },
          { title: "Faculty Champions", keys: advisorsKeys, color: "text-emerald-200" },
          { title: "Office Bearers & Advisors", keys: bearersKeys, color: "text-fuchsia-200" },
          { title: "AI Document Templates", keys: docKeys, color: "text-amber-200" }
        ].map((section) => (
          <div className="relative overflow-hidden rounded-[2rem] border border-white/[.08] bg-[#05070d]/75 p-6 md:p-7" key={section.title}>
            <h3 className={`text-sm font-bold uppercase tracking-wider border-b border-white/[0.06] pb-4 mb-4 ${section.color}`}>{section.title}</h3>
            
            <div className="grid gap-3.5 max-h-[500px] overflow-y-auto pr-1">
              {section.keys.map((key) => (
                <div className="rounded-2xl border border-white/[0.04] bg-white/[0.01] p-4 text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:border-white/[0.08] hover:bg-white/[0.02] transition" key={key}>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[.15em] text-white/35 sm:w-1/3 text-left">{formatKeyLabel(key)}</span>
                  <div className="flex-1 text-left sm:text-right flex sm:justify-end">
                    {renderSettingValue(key)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-5 self-start">
        <div className="rounded-[2rem] border border-white/[.08] bg-[#05070d]/75 p-6 md:p-7 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.03] via-transparent to-transparent" />
          
          <div className="relative">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/[0.06] pb-4 mb-4 font-sans">Settings Panel</h3>
            <p className="text-xs leading-relaxed text-white/40 mb-5">
              These configurations manage the public club branding, student office bearers, advisors, faculty champions, and report templates.
            </p>
            
            <div className="grid gap-3 relative z-10">
              <button onClick={() => open({ resource: "settings", title: "Update club branding, faculty, advisors, office bearers, and document templates", fields: settingsFields })} className="portal-command-button w-full flex items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-xs font-semibold hover:-translate-y-0.5 transition">
                <SlidersHorizontal size={14} /> Update Public Settings
              </button>
              
              <button onClick={() => open({ resource: "invites", title: "Invite portal operator", fields: extraFields.invites })} className="w-full flex items-center justify-center gap-2 rounded-2xl border border-white/[.08] bg-white/[.035] px-4 py-3.5 text-xs font-semibold text-violet-100 hover:bg-white/[.06] hover:-translate-y-0.5 hover:text-white transition">
                <UserPlus size={14} /> Invite Operator
              </button>
            </div>
            
            <div className="mt-6 border-t border-white/[0.06] pt-4">
              <p className="text-[10px] text-white/32 uppercase tracking-wider font-semibold">Operator Accounts</p>
              <p className="mt-2 text-xs leading-relaxed text-white/40">
                Operator accounts are invite-only. Invited users can access this admin panel using their email accounts once invited by a current operator.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type GalleryAsset = { url: string; publicId?: string; kind?: "image" | "video"; resourceType?: string; caption?: string };

function GalleryAssetsControl({
  name,
  current,
  resource,
  setPanel
}: {
  name: string;
  current: GalleryAsset[];
  resource: Resource;
  setPanel: (value: string) => void;
}) {
  const [assets, setAssets] = useState<GalleryAsset[]>((current || []).filter((asset) => asset?.url));
  const [uploading, setUploading] = useState(false);

  async function uploadFiles(files: FileList | null) {
    const list = Array.from(files || []);
    if (!list.length) return;
    setUploading(true);
    setPanel(`Uploading ${list.length} album asset${list.length > 1 ? "s" : ""}...`);
    const next: GalleryAsset[] = [];
    for (const file of list) {
      const form = new FormData();
      form.append("file", file);
      form.append("folder", `tech-tatva-os/${resource}`);
      const res = await fetch("/api/portal/upload", { method: "POST", body: form });
      const result = await res.json();
      if (!res.ok) {
        setPanel(result.error || `Upload failed for ${file.name}`);
        continue;
      }
      next.push({
        url: result.url,
        publicId: result.publicId,
        kind: result.resourceType === "video" ? "video" : "image",
        caption: ""
      });
    }
    setAssets((state) => [...state, ...next]);
    setUploading(false);
    setPanel(next.length ? `Uploaded ${next.length} asset${next.length > 1 ? "s" : ""}. Add captions, then save the album.` : "No album assets were uploaded.");
  }

  function updateCaption(index: number, caption: string) {
    setAssets((state) => state.map((asset, assetIndex) => assetIndex === index ? { ...asset, caption } : asset));
  }

  function removeAsset(index: number) {
    setAssets((state) => state.filter((_, assetIndex) => assetIndex !== index));
  }

  return (
    <div className="mt-2 rounded-xl border border-white/[.07] bg-black/25 p-3">
      <input type="hidden" name={name} value={JSON.stringify(assets)} />
      <input
        type="file"
        multiple
        accept="image/*,video/mp4,video/webm"
        disabled={uploading}
        onChange={(event) => void uploadFiles(event.target.files)}
        className="block w-full text-xs text-white/55 file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-2 file:text-xs file:font-semibold file:text-black disabled:opacity-60"
      />
      <p className="mt-2 text-[10px] leading-4 text-white/35">{uploading ? "Uploading to Cloudinary..." : "Choose multiple photos or videos from your computer. Captions are saved per asset."}</p>
      {assets.length ? (
        <div className="mt-4 grid max-h-96 gap-3 overflow-y-auto pr-1">
          {assets.map((asset, index) => (
            <div className="rounded-2xl border border-white/[.07] bg-white/[.025] p-3" key={`${asset.url}-${index}`}>
              <div className="flex gap-3">
                {asset.kind === "video" ? (
                  <video src={asset.url} className="h-20 w-24 rounded-xl object-cover" muted playsInline />
                ) : (
                  <img src={asset.url} alt="" className="h-20 w-24 rounded-xl object-cover" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] uppercase tracking-[.18em] text-white/35">Asset {index + 1}</p>
                    <button type="button" onClick={() => removeAsset(index)} className="rounded-full border border-rose-200/20 px-2 py-1 text-[10px] text-rose-200">Remove</button>
                  </div>
                  <input
                    value={asset.caption || ""}
                    onChange={(event) => updateCaption(index, event.target.value)}
                    placeholder="Write a caption for this moment..."
                    className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-2 text-xs text-white outline-none placeholder:text-white/25 focus:border-violet-400/50"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : <p className="mt-4 rounded-xl border border-white/[.06] bg-white/[.025] p-4 text-xs text-white/40">No assets in this album yet. Upload photos or videos, add captions, then save.</p>}
    </div>
  );
}

function UploadControl({
  name,
  current,
  upload,
  uploading,
  onUpload
}: {
  name: string;
  current: string;
  upload?: { url: string; publicId: string; resourceType: string };
  uploading: boolean;
  onUpload: (file: File) => Promise<void>;
}) {
  const value = upload?.url || current;
  const preview = value && /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(value);
  return (
    <div className="mt-2 rounded-xl border border-white/[.07] bg-black/25 p-3">
      <input type="hidden" name={name} value={value} />
      {upload?.publicId ? <input type="hidden" name={name === "url" ? "publicId" : `${name}PublicId`} value={upload.publicId} /> : null}
      {name === "url" ? <input type="hidden" name="kind" value={upload?.resourceType || "image"} /> : null}
      {preview ? <img src={value} alt="" className="mb-3 h-28 w-full rounded-lg object-cover" /> : value ? <p className="mb-3 break-all text-xs text-white/45">{value}</p> : null}
      <input
        type="file"
        accept="image/*,video/mp4,video/webm,application/pdf"
        disabled={uploading}
        onChange={(event)=>{const file=event.target.files?.[0]; if(file) void onUpload(file)}}
        className="block w-full text-xs text-white/55 file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-2 file:text-xs file:font-semibold file:text-black disabled:opacity-60"
      />
      <p className="mt-2 text-[10px] leading-4 text-white/35">{uploading ? "Uploading to Cloudinary..." : "Choose a file from your computer. Images, MP4/WebM, and PDFs up to 20MB are supported."}</p>
    </div>
  );
}
