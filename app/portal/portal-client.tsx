"use client";

import { type MouseEvent, useEffect, useMemo, useState } from "react";
import { signOut } from "next-auth/react";
import {
  Activity,
  Award,
  Bell,
  Brain,
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
  Users,
  Workflow,
  Hexagon
} from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

type Module = "Overview" | "Members" | "Teams" | "Events" | "Attendance" | "Certificates" | "Meetings" | "AI" | "Tasks" | "Announcements" | "Media" | "Settings";
type Resource = "users" | "teams" | "events" | "meetings" | "tasks" | "announcements" | "sponsors" | "achievements" | "gallery" | "contacts" | "settings" | "invites";
type Data = Record<string, any>;
type Field = [string, string, string?];

const nav = [
  [LayoutDashboard, "Overview"],
  [Users, "Members"],
  [Workflow, "Teams"],
  [CalendarDays, "Events"],
  [CheckCircle2, "Attendance"],
  [Award, "Certificates"],
  [FileText, "Meetings"],
  [Brain, "AI"],
  [Workflow, "Tasks"],
  [Bell, "Announcements"],
  [Activity, "Media"],
  [Settings2, "Settings"]
] as const;

const config: Record<Exclude<Module, "Overview" | "Attendance" | "Certificates" | "AI" | "Settings">, { key: string; resource: Resource; fields: Field[] }> = {
  Members: { key: "users", resource: "users", fields: [["name","Name"],["email","Email","email"],["team","Team","team-select"],["image","Profile photo","upload:image"],["uid","UID"],["registrationNumber","Registration number"],["department","Department"],["program","Program"],["semester","Semester","number"],["phone","Phone"]] },
  Teams: { key: "teams", resource: "teams", fields: [["name","Team name"],["slug","Slug"],["description","Description"],["lead","Team lead","member-select"],["coLeads","Co-leads","member-multi-select"],["jointSecretaryLane","Reports under joint secretary","lane-select"],["order","Display order","number"],["active","Active: true/false"]] },
  Events: { key: "events", resource: "events", fields: [["title","Title"],["slug","Slug"],["description","Description"],["venue","Venue"],["capacity","Capacity","number"],["category","Category"],["team","Team","team-select"],["leads","Event leads","member-multi-select"],["participationMode","Participation type","participation-select"],["maxTeamSize","Maximum team size","number"],["winnerFirst","1st place winner","winner-select"],["winnerSecond","2nd place winner","winner-select"],["winnerThird","3rd place winner","winner-select"],["status","Public status","status-select"],["registrationOpen","Registration open","boolean-select"],["registrationStart","Registration start","datetime-local"],["registrationEnd","Registration end","datetime-local"],["startAt","Event start date/time","datetime-local"],["endAt","Event end date/time","datetime-local"],["banner","Event banner","upload:image"]] },
  Meetings: { key: "meetings", resource: "meetings", fields: [["title","Meeting title"],["date","Date","date"],["time","Time"],["venue","Venue"],["meetingType","Meeting type"],["organizer","Organizer","member-select"],["attendees","Attendees","member-multi-select"],["agenda","Agenda"],["discussionPoints","Discussion points"],["decisionsTaken","Decisions taken"],["actionItems","Action items (one per line: Task | Assigned To | Deadline | Status)"],["nextMeeting","Next meeting details"],["status","Status"]] },
  Tasks: { key: "tasks", resource: "tasks", fields: [["title","Title"],["description","Description"],["team","Team","team-select"],["dueAt","Due date","datetime-local"],["status","Status"],["priority","Priority"]] },
  Announcements: { key: "announcements", resource: "announcements", fields: [["title","Title"],["body","Body"],["status","Status"],["audience","Audience"],["publishAt","Publish at","datetime-local"]] },
  Media: { key: "gallery", resource: "gallery", fields: [["title","Album title"],["url","Upload image/video","upload:auto"],["caption","Caption"],["published","Published: true/false"]] }
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
  contacts: [["status","Status"]],
  settings: [["logo","Club logo","upload:image"]],
  invites: [["email","Invite email","email"],["role","Role slug"],["team","Team","team-select"]]
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

function idOf(item:any){return typeof item==="string"?item:String(item?._id || item?.id || item)}
function valueOf(item:any, key:string){const value=item[key];if(value && typeof value==="object")return value.name || value.title || value.slug || "";return value ?? ""}
function rawValue(item:any, key:string): string | number | boolean | string[] {const value=item?.[key];if(Array.isArray(value))return value.map((entry)=>String(rawValue({entry},"entry")));if(value && typeof value==="object")return String(value._id || value.id || "");return value ?? ""}
function memberLabel(member:any){return `${member.name || "Unnamed member"}${member.team?.name ? ` / ${member.team.name}` : ""}`}
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
  const [data,setData]=useState(initialData);
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
    contacts:data.contactMessages?.filter((m:any)=>m.status!=="resolved").length || 0
  }),[data]);

  const chart=useMemo(()=>[
    {m:"Members",v:counts.members},
    {m:"Teams",v:counts.teams},
    {m:"Events",v:counts.events},
    {m:"Tasks",v:counts.tasks},
    {m:"Contacts",v:counts.contacts}
  ],[counts]);

  async function refresh(){
    setBusy(true);
    const res=await fetch("/api/admin/events",{cache:"no-store"});
    if(res.ok)setData(await res.json());
    setBusy(false);
    setPanel("Dashboard refreshed from MongoDB.");
  }

  async function submit(formData:FormData){
    if(!drawer)return;
    setBusy(true);
    const body=Object.fromEntries(formData.entries()) as Record<string, any>;
    for (const [name,,type] of drawer.fields) {
      if (type === "member-multi-select") body[name] = formData.getAll(name).filter(Boolean);
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
    setPanel(res.ok?(resource==="events"?"Event deleted permanently.":"Record removed from public/active views."):"Delete/archive failed.");
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
    if(module==="Members")return (data.users||[]).map((u:any)=>[u.name,u.email && u.email !== "undefined" ? u.email : "-",u.uid||"-",valueOf(u,"team")||"-",u.status||"active",u]);
    if(module==="Teams")return (data.teams||[]).map((t:any)=>[t.name,valueOf(t,"lead") || "No lead",(t.coLeads||[]).map((lead:any)=>lead.name).filter(Boolean).join(", ") || "No co-leads",`${t.members?.length||0} members`,t.active===false?"inactive":"active",t]);
    if(module==="Events")return (data.events||[]).map((e:any)=>[e.title,e.status,e.registrationOpen?"open":"closed",e.venue||"-",e.startAt?new Date(e.startAt).toLocaleString():"TBA",e]);
    if(module==="Meetings")return (data.meetings||[]).map((m:any)=>[m.title,m.status||"draft",m.date?new Date(m.date).toLocaleDateString():"No date",m.venue||"-",valueOf(m,"organizer")||"-",m]);
    if(module==="Tasks")return (data.tasks||[]).map((t:any)=>[t.title,t.status,t.priority||"medium",t.dueAt?new Date(t.dueAt).toLocaleString():"No due date",valueOf(t,"team")||"-",t]);
    if(module==="Announcements")return (data.announcements||[]).map((a:any)=>[a.title,a.status||"draft",a.audience||"public",a.publishAt?new Date(a.publishAt).toLocaleString():"Not scheduled",a]);
    if(module==="Media")return [...(data.gallery||[]).map((g:any)=>[g.title,g.published?"published":"hidden",`${g.assets?.length||0} assets`,"gallery",{...g,__resource:"gallery"}]),...(data.sponsors||[]).map((s:any)=>[s.name,s.level||"-",s.active?"active":"inactive","sponsor",{...s,__resource:"sponsors"}]),...(data.achievements||[]).map((a:any)=>[a.title,a.kind||"-",a.featured?"featured":"normal","achievement",{...a,__resource:"achievements"}])];
    return [];
  }

  const filtered=rowsFor(active).filter((row:any[])=>row.join(" ").toLowerCase().includes(search.toLowerCase()));

  return <main className="portal-root pb-24 xl:pb-0">
    <aside className="portal-sidebar fixed inset-y-0 left-0 hidden w-72 overflow-y-auto p-6 xl:flex xl:flex-col"><PortalLogo/><p className="mt-10 px-3 text-[10px] tracking-[.22em] text-white/25">INTERNAL PORTAL</p><nav className="mt-4 flex-1 space-y-1.5 pb-6">{nav.map(([Icon,label])=><button key={label} onClick={()=>{setActive(label);setPanel(`${label} loaded from MongoDB.`)}} className={`portal-nav-item flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm transition ${active===label?"portal-nav-active text-white":"text-white/42 hover:border-white/[.08] hover:bg-white/[.045] hover:text-white/75"}`}><Icon size={16}/>{label}</button>)}</nav><div className="mt-auto border-t border-white/[.06] pt-4"><button onClick={()=>signOut({callbackUrl:"/login"})} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm text-white/35 transition hover:bg-rose-500/10 hover:text-rose-200"><LogOut size={15}/> Sign out</button></div></aside>
    <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 gap-1 rounded-[1.65rem] border border-white/10 bg-[#09070f]/88 p-2 shadow-2xl shadow-black/50 backdrop-blur-2xl xl:hidden">
      {nav.slice(0,5).map(([Icon,label])=><button key={label} onClick={()=>{setActive(label);setPanel(`${label} loaded from MongoDB.`)}} className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-semibold transition active:scale-[.97] ${active===label?"bg-violet-400/18 text-white shadow-[0_0_24px_rgba(168,85,247,.16)]":"text-white/42"}`}><Icon size={17}/><span>{label==="Attendance"?"Attend":label}</span></button>)}
    </nav>
    <section className="xl:pl-72"><header className="portal-topbar flex min-h-24 flex-wrap items-center justify-between gap-4 px-5 py-4 md:px-8"><div className="w-full xl:hidden"><PortalLogo/></div><div><p className="text-xs tracking-wide text-white/35">{new Date().toLocaleString("en-IN",{dateStyle:"full",timeStyle:"short"})}</p><h1 className="mt-1 text-xl font-semibold tracking-tight">Good day, {userName}.</h1></div><div className="flex flex-1 items-center justify-end gap-3"><label className="portal-search hidden min-w-80 items-center gap-3 rounded-2xl px-4 py-3 text-white/40 md:flex"><Search size={16}/><input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search live admin data..." className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/25"/></label><button onClick={refresh} className="portal-mini-button rounded-2xl p-3 text-white/55 transition hover:-translate-y-0.5 hover:text-white"><RefreshCw size={16} className={busy?"animate-spin":""}/></button><button onClick={()=>setNotifications(!notifications)} className="portal-mini-button relative rounded-2xl p-3 text-white/55 transition hover:-translate-y-0.5 hover:text-white"><Bell size={16}/>{counts.contacts?<i className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-pink-400 shadow-[0_0_14px_rgba(244,114,182,.75)]"/>:null}</button><div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 shadow-[0_0_30px_rgba(168,85,247,.28)]"/></div><label className="portal-search flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-white/40 md:hidden"><Search size={16}/><input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search admin data..." className="w-full bg-transparent text-base text-white outline-none placeholder:text-white/25"/></label></header>
    <div className="p-4 md:p-8"><div className="mb-4 flex gap-2 overflow-x-auto pb-1 xl:hidden">{nav.map(([Icon,label])=><button key={label} onClick={()=>{setActive(label);setPanel(`${label} loaded from MongoDB.`)}} className={`flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-xs font-semibold ${active===label?"border-violet-200/35 bg-violet-500/18 text-white":"border-white/[.08] bg-white/[.035] text-white/50"}`}><Icon size={14}/>{label}</button>)}</div><Header active={active} data={data} open={setDrawer} setPanel={setPanel}/>{active==="Overview"?<Overview counts={counts} chart={chart} setActive={setActive}/>:active==="Attendance"?<Attendance data={data} setPanel={setPanel} refresh={refresh}/>:active==="Certificates"?<CertificatesDesk data={data} setPanel={setPanel} open={setDrawer}/>:active==="AI"?<AIDesk data={data} setPanel={setPanel}/>:active==="Settings"?<Settings info={data.clubInfo||{}} open={setDrawer}/>:active==="Teams"?<TeamStructureEditor data={data} open={setDrawer} remove={remove} restore={restore}/>:<Workspace active={active} rows={filtered} open={setDrawer} remove={remove} restore={restore} patch={patch} duplicateEvent={duplicateEvent}/>}<div className="portal-action mt-4 rounded-2xl p-5"><p className="text-[10px] tracking-[.24em] text-violet-200">ACTION PANEL</p><p className="mt-3 text-sm leading-6 text-white/65">{panel}</p></div></div></section>
    {notifications?<div className="fixed right-5 top-24 z-50 w-[min(380px,calc(100vw-40px))] rounded-3xl border border-white/10 bg-[#111016]/95 p-5 shadow-2xl shadow-black/40 backdrop-blur-xl"><p className="text-sm font-semibold">Open contact messages</p>{(data.contactMessages||[]).filter((m:any)=>m.status!=="resolved").slice(0,6).map((m:any)=><button onClick={()=>setPanel(`${m.name}: ${m.message}`)} className="portal-mini-button mt-3 block w-full rounded-2xl px-4 py-3 text-left text-xs text-white/60 transition hover:-translate-y-0.5 hover:text-white" key={idOf(m)}>{m.subject}</button>)}{!counts.contacts?<p className="mt-4 text-xs text-white/40">No unresolved messages.</p>:null}</div>:null}
    {drawer?<div className="fixed inset-0 z-50 bg-black/70 p-4 backdrop-blur-sm"><div className="ml-auto h-full max-w-xl overflow-y-auto rounded-3xl border border-white/10 bg-[#111016] p-6 shadow-2xl shadow-violet-950/25"><div className="flex items-center justify-between"><h2 className="text-xl font-semibold tracking-tight">{drawer.title}</h2><button onClick={()=>setDrawer(null)} className="portal-mini-button rounded-full px-3 py-1.5 text-xs text-white/55">Close</button></div><form action={submit} className="mt-6 grid gap-4">{drawer.fields.map(([name,label,type])=>{const source={...(drawer.defaults||{}),...(drawer.item||{})};const selected=rawValue(source,name);const formValue=Array.isArray(selected)?selected:String(selected??"");return <label className="text-[10px] tracking-wider text-white/35" key={name}>{label.toUpperCase()}{type==="status-select"?<select name={name} defaultValue={formValue || "published"} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50">{["draft","published","active","completed","archived"].map((status)=><option value={status} key={status}>{status}</option>)}</select>:type==="participation-select"?<select name={name} defaultValue={formValue || "individual"} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50"><option value="individual">Individual only</option><option value="team">Team only</option><option value="both">Individual or team</option></select>:type==="boolean-select"?<select name={name} defaultValue={String(selected === true || selected === "true")} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50"><option value="true">Yes</option><option value="false">No</option></select>:type==="lane-select"?<select name={name} defaultValue={formValue || "technical"} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50"><option value="technical">Joint Secretary (Technical & Operations)</option><option value="creative">Joint Secretary (Media & Creative)</option></select>:type==="team-select"?<select name={name} defaultValue={formValue} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50"><option value="">No team</option>{(data.teams||[]).filter((team:any)=>team.active!==false).map((team:any)=><option value={idOf(team)} key={idOf(team)}>{team.name}</option>)}</select>:type==="winner-select"?<select name={name} defaultValue={formValue} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50"><option value="">No winner selected</option>{winnerOptions(data,drawer.item).map((candidate:any)=><option value={candidate.id} key={candidate.id}>{candidate.label}</option>)}</select>:type==="member-select"?<select name={name} defaultValue={formValue} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50"><option value="">No member selected</option>{(data.users||[]).filter((user:any)=>user.status!=="inactive").map((user:any)=><option value={idOf(user)} key={idOf(user)}>{memberLabel(user)}</option>)}</select>:type==="member-multi-select"?<select name={name} multiple defaultValue={Array.isArray(formValue)?formValue:[]} className="mt-2 min-h-36 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50">{(data.users||[]).filter((user:any)=>user.status!=="inactive").map((user:any)=><option value={idOf(user)} key={idOf(user)}>{memberLabel(user)}</option>)}</select>:type?.startsWith("upload")?<UploadControl name={name} current={Array.isArray(formValue)?"":formValue} upload={uploads[name]} uploading={Boolean(uploading[name])} onUpload={async(file)=>{setUploading((state)=>({...state,[name]:true}));setPanel(`Uploading ${file.name}...`);const form=new FormData();form.append("file",file);form.append("folder",`tech-tatva-os/${drawer.resource}`);const res=await fetch("/api/portal/upload",{method:"POST",body:form});const result=await res.json();setUploading((state)=>({...state,[name]:false}));if(!res.ok){setPanel(result.error || "Upload failed");return}setUploads((state)=>({...state,[name]:result}));setPanel(`Uploaded ${file.name}. Now save the form.`)}}/>:["description","body","aboutCopy","agenda","discussionPoints","decisionsTaken","actionItems","nextMeeting"].includes(name)?<textarea name={name} defaultValue={formValue} rows={5} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50"/>:<input name={name} type={type||"text"} defaultValue={formValue} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50"/>}</label>})}<p className="text-[10px] leading-4 text-white/35">Tip: hold Command/Ctrl to select multiple leads or co-leads.</p><button disabled={busy||Object.values(uploading).some(Boolean)} className="portal-command-button rounded-2xl py-3 text-sm font-semibold disabled:opacity-60">{busy?"Saving...":Object.values(uploading).some(Boolean)?"Uploading...":"Save changes"}</button></form></div></div>:null}
  </main>
}

function Header({active,data,open,setPanel}:{active:Module;data:Data;open:(drawer:any)=>void;setPanel:(text:string)=>void}){
  const action=active==="Overview"?"Export summary":active==="Attendance"?"Generate attendance":active==="Certificates"?"Certificate tools":active==="Settings"?"Update branding":active==="AI"?"Ask AI":`Add ${active.slice(0,-1)}`;
  return <div className="portal-hero flex flex-wrap items-center justify-between gap-5 rounded-[1.75rem] p-5 md:p-8"><div><p className="text-[10px] font-semibold tracking-[.28em] text-violet-200/75">COMMAND CENTER / {active.toUpperCase()}</p><h2 className="mt-3 text-[2.65rem] font-semibold leading-[.92] tracking-[-.055em] md:text-5xl">{active==="Overview"?"Club intelligence":active==="AI"?"AI Desk":active}</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-white/48">Live operational controls for members, teams, events, attendance, media, documents, and public club content.</p></div><button type="button" onClick={()=>{if(active==="Overview"){exportDashboardSummary(data);setPanel("Dashboard summary CSV downloaded.");}else if(active==="Attendance"){window.dispatchEvent(new Event("portal-download-attendance"));setPanel("Generating attendance sheet for the selected event...");}else if(active==="Certificates"){setPanel("Choose an event below, select winners from Events if needed, then export PDF certificates as ZIP files.");}else if(active==="AI"){setPanel("Use the AI Desk below to generate reports, MOMs, and secretary answers from real MongoDB data.");}else if(active==="Settings")open({resource:"settings",title:"Update club branding, faculty, and office bearers",fields:settingsFields});else{const c=config[active as keyof typeof config];open({resource:c.resource,title:`Add ${active.slice(0,-1)}`,fields:c.fields,defaults:active==="Events"?{status:"published",registrationOpen:"true"}:active==="Meetings"?{status:"completed"}:{}})}}} className="portal-command-button flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-xs font-semibold transition hover:-translate-y-0.5 sm:w-auto sm:self-end">{active==="Overview"||active==="Attendance"?<Download size={14}/>:active==="Certificates"?<Award size={14}/>:active==="AI"?<Brain size={14}/>:<Plus size={14}/>}<span>{action}</span></button></div>
}

function Overview({counts,chart,setActive}:{counts:any;chart:any[];setActive:(m:Module)=>void}){const cards=[["Total members",counts.members,"Members",Users,"from-violet-400 to-fuchsia-300","Manage roster"],["Active teams",counts.teams,"Teams",Workflow,"from-cyan-300 to-violet-300","Assign leads"],["Published events",counts.events,"Events",CalendarDays,"from-fuchsia-300 to-pink-300","Open events"],["Open tasks",counts.tasks,"Tasks",CheckCircle2,"from-emerald-300 to-violet-300","Track work"]];return <><div className="portal-quick-grid mt-5">{cards.map(([label,value,module,Icon,accent,copy]:any)=><button onClick={()=>setActive(module)} className="portal-quick-card group rounded-[1.6rem] p-5 text-left transition duration-300 hover:-translate-y-1 hover:border-violet-200/25" key={label}><div className="flex items-start justify-between gap-4"><span className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${accent} text-black shadow-[0_0_30px_rgba(168,85,247,.24)]`}><Icon size={18}/></span><span className="rounded-full border border-white/[.08] bg-white/[.035] px-3 py-1 text-[10px] font-semibold tracking-[.14em] text-white/35 transition group-hover:text-white/60">OPEN</span></div><p className="mt-7 text-xs font-medium text-white/42">{label}</p><p className="mt-2 text-5xl font-semibold tracking-[-.07em] text-white">{value}</p><p className="mt-3 text-xs text-white/35">{copy}</p></button>)}</div><div className="mt-5 grid gap-4 xl:grid-cols-[1fr_.44fr]"><div className="portal-chart rounded-[1.75rem] p-6"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-lg font-semibold">System data volume</p><p className="mt-1 text-xs text-white/38">Realtime operational footprint across core modules.</p></div><span className="rounded-full border border-violet-300/20 bg-violet-500/10 px-3 py-1.5 text-[10px] font-semibold tracking-[.18em] text-violet-100">LIVE</span></div><div className="mt-6 h-80"><ResponsiveContainer><BarChart data={chart} barCategoryGap={42}><XAxis dataKey="m" axisLine={false} tickLine={false} tick={{fill:"#ffffff73",fontSize:11}}/><Tooltip cursor={{fill:"rgba(139,92,246,.08)"}} contentStyle={{background:"#111016",border:"1px solid #ffffff16",borderRadius:14,color:"#fff"}}/><Bar dataKey="v" fill="url(#portalBar)" radius={[12,12,4,4]}/><defs><linearGradient id="portalBar" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f0abfc"/><stop offset="45%" stopColor="#8b5cf6"/><stop offset="100%" stopColor="#4c1d95"/></linearGradient></defs></BarChart></ResponsiveContainer></div></div><div className="portal-chart rounded-[1.75rem] p-6"><p className="text-lg font-semibold">Quick access</p><p className="mt-1 text-xs leading-5 text-white/38">Jump into the most used operating modules.</p><div className="mt-5 grid gap-3">{(["Members","Events","Attendance","Settings"] as Module[]).map((module)=><button onClick={()=>setActive(module)} className="portal-mini-button flex items-center justify-between rounded-2xl px-4 py-3 text-left text-sm text-white/70 transition hover:-translate-y-0.5 hover:text-white" key={module}><span>{module}</span><span className="text-[10px] tracking-[.16em] text-violet-200/55">OPEN</span></button>)}</div></div></div></>}

function splitPortalTeams(teams:any[]){const creative:any[]=[];const operations:any[]=[];(teams||[]).filter((team:any)=>team.active!==false).forEach((team:any)=>{(team.jointSecretaryLane==="creative"?creative:operations).push(team)});return {operations,creative}}
function PortalStructureNode({label,name,meta,tone="violet",onEdit}:{label:string;name?:string;meta?:string;tone?:"violet"|"cyan"|"fuchsia"|"emerald";onEdit?:()=>void}){const tones={violet:"border-violet-300/25 bg-violet-500/10 text-violet-100",cyan:"border-cyan-300/25 bg-cyan-500/10 text-cyan-100",fuchsia:"border-fuchsia-300/25 bg-fuchsia-500/10 text-fuchsia-100",emerald:"border-emerald-300/25 bg-emerald-500/10 text-emerald-100"};return <button type="button" onClick={onEdit} className={`mx-auto block w-full max-w-lg rounded-3xl border p-5 text-center transition hover:-translate-y-0.5 ${tones[tone]}`}><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-white/45">{label}</p><p className="mt-2 text-xl font-semibold text-white">{name || "Add details"}</p>{meta?<p className="mt-2 text-xs leading-5 text-white/50">{meta}</p>:null}</button>}
function PortalTeamTreeCard({team,index,open,remove,restore}:{team:any;index:number;open:(drawer:any)=>void;remove:(resource:Resource,item:any)=>void;restore:(resource:Resource,item:any)=>void}){const fields=extraFields.teams;const inactive=team.active===false;const lead=valueOf(team,"lead") || "No lead assigned";const coLeads=(team.coLeads||[]).map((lead:any)=>lead.name).filter(Boolean);return <div className={`rounded-[1.5rem] border p-4 ${inactive?"border-white/[.06] bg-white/[.018] opacity-60":"border-white/[.08] bg-white/[.035]"}`}><div className="rounded-2xl border border-white/[.08] bg-black/25 p-3 text-center"><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-white/35">Team Lead Group</p><p className="mt-2 text-sm font-semibold text-white">{lead}</p></div><div className="mx-auto h-6 w-px bg-white/18"/><div className="rounded-2xl border border-white/[.08] bg-black/25 p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-base font-semibold text-white">{team.name}</p><p className="mt-1 text-[10px] uppercase tracking-[.16em] text-white/35">Order {team.order ?? index + 1} / {team.members?.length || 0} assigned</p></div><Workflow size={17} className="text-violet-200"/></div>{team.description?<p className="mt-3 text-xs leading-5 text-white/45">{team.description}</p>:null}<div className="mt-3 grid gap-2">{coLeads.length?<p className="rounded-xl border border-white/[.07] bg-white/[.035] px-3 py-2 text-xs text-white/65">Co-leads: {coLeads.join(", ")}</p>:<p className="rounded-xl border border-white/[.07] bg-white/[.025] px-3 py-2 text-xs text-white/35">No co-leads assigned</p>}</div><div className="mt-4 flex flex-wrap gap-2"><button onClick={()=>open({resource:"teams",title:`Edit ${team.name}`,fields,item:team})} className="portal-link-action text-violet-200">Edit team</button><button onClick={()=>open({resource:"users",title:`Add member to ${team.name}`,fields:config.Members.fields,defaults:{team:idOf(team)}})} className="portal-link-action text-cyan-200">Add member</button>{inactive?<button onClick={()=>restore("teams",team)} className="portal-link-action text-emerald-200">Restore</button>:<button onClick={()=>remove("teams",team)} className="portal-link-action text-rose-200">Archive</button>}</div></div></div>}
function TeamLaneEditor({title,subtitle,teams,tone,open,remove,restore}:{title:string;subtitle:string;teams:any[];tone:"cyan"|"fuchsia";open:(drawer:any)=>void;remove:(resource:Resource,item:any)=>void;restore:(resource:Resource,item:any)=>void}){return <div><PortalStructureNode label={title} name={subtitle} tone={tone}/><div className="mx-auto h-8 w-px bg-white/20"/><div className="grid gap-4 lg:grid-cols-2">{teams.length?teams.map((team:any,index:number)=><PortalTeamTreeCard key={idOf(team)} team={team} index={index} open={open} remove={remove} restore={restore}/>):<div className="rounded-3xl border border-white/[.08] bg-white/[.025] p-6 text-center text-sm text-white/42 lg:col-span-2">No teams in this lane yet. Create a team and assign its lead/members.</div>}</div></div>}
function PortalAdvisoryRow({info,open}:{info:any;open:(drawer:any)=>void}){const advisors=[info.studentAdvisorOneName,info.studentAdvisorTwoName].filter(Boolean);return <div className={`mx-auto grid w-full max-w-5xl gap-3 ${advisors.length?"md:grid-cols-3":"md:grid-cols-1"}`}><PortalStructureNode label="Faculty Champion" name={info.facultyChampionName} meta={info.facultyChampionEmail || "Update from Settings"} tone="emerald" onEdit={()=>open({resource:"settings",title:"Update faculty champion and student advisors",fields:settingsFields})}/>{advisors.map((name:string,index:number)=><PortalStructureNode key={`${name}-${index}`} label={`Student Advisor ${index+1}`} name={name} meta={index===0?info.studentAdvisorOneEmail:info.studentAdvisorTwoEmail} tone="emerald" onEdit={()=>open({resource:"settings",title:"Update student advisors",fields:settingsFields})}/>)}</div>}
function PortalOperationsRoot({info,open}:{info:any;open:(drawer:any)=>void}){return <PortalStructureNode label="1. Secretary" name={info.secretaryName} meta={info.secretaryEmail || "Update from Settings"} tone="violet" onEdit={()=>open({resource:"settings",title:"Update secretary and joint secretaries",fields:settingsFields})}/>}
function TeamStructureEditor({data,open,remove,restore}:{data:Data;open:(drawer:any)=>void;remove:(resource:Resource,item:any)=>void;restore:(resource:Resource,item:any)=>void}){const info=data.clubInfo||{};const {operations,creative}=splitPortalTeams(data.teams||[]);return <div className="mt-7 grid gap-4 xl:grid-cols-[1fr_.32fr]"><div className="relative overflow-hidden rounded-[2rem] border border-white/[.08] bg-[#05070d]/75 p-5 md:p-7"><div className="absolute inset-0 grid-bg opacity-20"/><div className="relative grid gap-6"><div className="rounded-[1.7rem] border border-emerald-300/15 bg-emerald-400/[.035] p-5"><p className="mb-4 text-center text-[10px] font-semibold uppercase tracking-[.22em] text-emerald-100/55">Advisory Tree</p><PortalAdvisoryRow info={info} open={open}/></div><div className="rounded-[1.7rem] border border-violet-300/15 bg-violet-400/[.035] p-5"><p className="mb-4 text-center text-[10px] font-semibold uppercase tracking-[.22em] text-violet-100/55">Club Operations Tree</p><PortalOperationsRoot info={info} open={open}/><div className="mx-auto h-10 w-px bg-white/25"/><div className="mx-auto hidden h-px max-w-4xl bg-gradient-to-r from-cyan-300/0 via-cyan-300/45 to-fuchsia-300/45 md:block"/><div className="mt-6 grid gap-8 2xl:grid-cols-2"><TeamLaneEditor title="2. Joint Secretary (Technical & Operations)" subtitle={info.jointSecretaryOneName || "Assign in Settings"} teams={operations} tone="cyan" open={open} remove={remove} restore={restore}/><TeamLaneEditor title="3. Joint Secretary (Media & Creative)" subtitle={info.jointSecretaryTwoName || "Assign in Settings"} teams={creative} tone="fuchsia" open={open} remove={remove} restore={restore}/></div></div></div></div><div className="glass rounded-[1.5rem] p-5"><p className="text-sm font-semibold">Structure actions</p><button onClick={()=>open({resource:"teams",title:"Create team",fields:config.Teams.fields,defaults:{active:"true",jointSecretaryLane:"technical"}})} className="portal-command-button mt-4 w-full rounded-2xl px-4 py-3 text-xs font-semibold">Create team</button><button onClick={()=>open({resource:"settings",title:"Update faculty, advisors, secretary, and joint secretaries",fields:settingsFields})} className="portal-mini-button mt-3 w-full rounded-2xl px-4 py-3 text-xs font-semibold text-violet-100">Edit top hierarchy</button><p className="mt-4 text-xs leading-6 text-white/42">Faculty Champion and Student Advisors are now advisory-only. The actual team reporting tree starts from Secretary, then moves to Joint Secretaries, team leads, and teams.</p></div></div>}

function Workspace({active,rows,open,remove,restore,patch,duplicateEvent}:{active:Module;rows:any[];open:(drawer:any)=>void;remove:(resource:Resource,item:any)=>void;restore:(resource:Resource,item:any)=>void;patch:(resource:Resource,item:any,body:Record<string, any>,message:string)=>void;duplicateEvent:(item:any)=>void}) {
  const c = config[active as keyof typeof config];
  const defaults = active === "Events" ? { status: "published", registrationOpen: "true" } : active === "Meetings" ? { status: "completed" } : {};
  const helper =
    active === "Teams" ? "Lead and co-leads are saved separately for every team. Use the joint secretary dropdown to place each team in the hierarchy." :
    active === "Events" ? "Published or active events appear publicly. Draft and archived events stay hidden. Reports are generated from real registrations and attendance." :
    active === "Meetings" ? "Create meeting records here, then export official MOM PDFs or DOCX files from the same row." :
    active === "Members" ? "Removed members are made inactive so their data is preserved and can be restored." :
    "Archive uses safe public removal.";

  return (
    <div className="mt-7 grid gap-4 lg:grid-cols-[1fr_.6fr]">
      <div className="glass rounded-xl p-5">
        <p className="text-sm">{active} workspace</p>
        {rows.length ? (
          <div className="mt-4 max-h-[min(620px,calc(100vh-330px))] overflow-auto overscroll-contain rounded-xl border border-white/[.06]">
            {rows.map((row: any[]) => {
              const item = row[row.length - 1];
              const resource = (item.__resource || c.resource) as Resource;
              const fields = extraFields[resource] || c.fields;
              const inactive = item.active === false || item.published === false || item.status === "archived" || item.status === "inactive";
              const isEvent = active === "Events";
              const isMeeting = active === "Meetings";
              return (
                <div className="grid gap-3 border-b border-white/[.05] bg-black/15 p-4 text-sm last:border-0 md:grid-cols-[1.1fr_.8fr_.8fr_.8fr_auto] md:text-xs" key={idOf(item)}>
                  {row.slice(0, -1).slice(0, 4).map((cell: any, index: number) => (
                    <button onClick={() => open({ resource, title: `Edit ${active.slice(0, -1)}`, fields, item })} className={`rounded-2xl border border-white/[.06] bg-white/[.025] p-3 text-left md:border-0 md:bg-transparent md:p-0 ${index === 0 ? "text-white/80" : "text-white/48"}`} key={`${idOf(item)}-${index}`}>
                      <span className="mb-1 block text-[9px] uppercase tracking-[.18em] text-white/28 md:hidden">{index === 0 ? active.slice(0, -1) : `Detail ${index}`}</span>
                      <span>{String(cell)}</span>
                    </button>
                  ))}
                  <div className="flex flex-wrap gap-2 md:gap-3">
                    {active === "Teams" && item.active !== false ? <button onClick={() => open({ resource: "users", title: `Add member to ${item.name}`, fields: config.Members.fields, defaults: { team: idOf(item) } })} className="portal-link-action text-violet-200">Add member</button> : null}
                    {isEvent ? (
                      <>
                        <button onClick={() => patch(resource, item, { status: "published" }, "Event published. It is visible on the public website.")} className="portal-link-action text-emerald-200">Publish</button>
                        <button onClick={() => patch(resource, item, { status: "draft", registrationOpen: "false" }, "Event moved to draft and hidden publicly.")} className="portal-link-action text-white/55">Draft</button>
                        <button onClick={() => patch(resource, item, { registrationOpen: String(!item.registrationOpen), status: item.status === "draft" ? "published" : item.status }, "Registration setting updated.")} className="portal-link-action text-violet-200">{item.registrationOpen ? "Close reg" : "Open reg"}</button>
                        <a className="portal-link-action text-fuchsia-200" href={`/api/ai/event-report?event=${idOf(item)}&format=pdf`}>Report PDF</a>
                        <a className="portal-link-action text-sky-200" href={`/api/ai/event-report?event=${idOf(item)}&format=docx`}>Report DOCX</a>
                        <button onClick={() => duplicateEvent(item)} className="portal-link-action text-sky-200">Duplicate</button>
                      </>
                    ) : null}
                    {isMeeting ? (
                      <>
                        <a className="portal-link-action text-fuchsia-200" href={`/api/ai/mom?meeting=${idOf(item)}&format=pdf`}>MOM PDF</a>
                        <a className="portal-link-action text-sky-200" href={`/api/ai/mom?meeting=${idOf(item)}&format=docx`}>MOM DOCX</a>
                      </>
                    ) : null}
                    {inactive ? <button onClick={() => restore(resource, item)} className="portal-link-action text-emerald-200">Restore</button> : !isEvent ? <button onClick={() => remove(resource, item)} className="portal-link-action text-rose-200">{active === "Members" ? "Remove" : "Archive"}</button> : null}
                    {isEvent ? <button onClick={() => remove(resource, item)} className="portal-link-action text-rose-200">Delete</button> : null}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-5 rounded-xl border border-white/[.06] bg-white/[.025] p-6 text-sm text-white/45">No records yet. Add one from the button above.</p>
        )}
      </div>
      <div className="glass rounded-xl p-5">
        <p className="text-sm">Module actions</p>
        {active === "Media" ? (["gallery", "sponsors", "achievements"] as Resource[]).map((resource) => (
          <button onClick={() => open({ resource, title: `Add ${resource}`, fields: extraFields[resource] })} className="portal-mini-button mt-3 block w-full rounded-2xl px-4 py-3 text-left text-xs text-white/68 transition hover:-translate-y-0.5 hover:text-white" key={resource}>Add {resource}</button>
        )) : (
          <button onClick={() => open({ resource: c.resource, title: `Add ${active.slice(0, -1)}`, fields: c.fields, defaults })} className="portal-mini-button mt-3 block w-full rounded-2xl px-4 py-3 text-left text-xs text-white/68 transition hover:-translate-y-0.5 hover:text-white">Create record</button>
        )}
        <p className="portal-mini-button mt-3 rounded-2xl px-4 py-3 text-xs leading-5 text-white/60">{helper}</p>
      </div>
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

  return (
    <div className="mt-7 grid gap-4 xl:grid-cols-[1fr_.8fr]">
      <div className="grid gap-4">
        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-3">
            <FileText size={18} className="text-fuchsia-200" />
            <div>
              <p className="text-sm">AI Post Event Report Generator</p>
              <p className="mt-1 text-xs text-white/38">Uses your official post activity report PDF template and real event, registration, attendance, and gallery records.</p>
            </div>
          </div>
          <select value={eventId} onChange={(event) => setEventId(event.target.value)} className="mt-5 w-full rounded-2xl border border-white/[.07] bg-black/35 px-4 py-3 text-sm text-white outline-none">
            <option value="">Select event</option>
            {events.map((event: any) => <option value={idOf(event)} key={idOf(event)}>{event.title}</option>)}
          </select>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <a download aria-disabled={!eventId} onClick={(event) => { if (!eventId) { event.preventDefault(); setPanel("Select an event before downloading a report."); } }} href={eventId ? `/api/ai/event-report?event=${eventId}&format=pdf` : "#"} className="portal-command-button rounded-2xl px-4 py-3 text-center text-xs font-semibold">Download report PDF</a>
            <a download aria-disabled={!eventId} onClick={(event) => { if (!eventId) { event.preventDefault(); setPanel("Select an event before downloading a report."); } }} href={eventId ? `/api/ai/event-report?event=${eventId}&format=docx` : "#"} className="portal-mini-button rounded-2xl px-4 py-3 text-center text-xs text-white/70">Download report DOCX</a>
          </div>
          <p className="mt-3 text-xs text-white/35">{selectedEvent ? `Selected: ${selectedEvent.title}` : "Create an event first if this list is empty."}</p>
        </div>

        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-3">
            <MessageSquare size={18} className="text-cyan-200" />
            <div>
              <p className="text-sm">AI MOM Generator</p>
              <p className="mt-1 text-xs text-white/38">Generate Minutes of Meeting using your official M2M/MOM format and meeting records.</p>
            </div>
          </div>
          <select value={meetingId} onChange={(event) => setMeetingId(event.target.value)} className="mt-5 w-full rounded-2xl border border-white/[.07] bg-black/35 px-4 py-3 text-sm text-white outline-none">
            <option value="">Select meeting</option>
            {meetings.map((meeting: any) => <option value={idOf(meeting)} key={idOf(meeting)}>{meeting.title}</option>)}
          </select>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <a download aria-disabled={!meetingId} onClick={(event) => { if (!meetingId) { event.preventDefault(); setPanel("Select a meeting before downloading MOM."); } }} href={meetingId ? `/api/ai/mom?meeting=${meetingId}&format=pdf` : "#"} className="portal-command-button rounded-2xl px-4 py-3 text-center text-xs font-semibold">Download MOM PDF</a>
            <a download aria-disabled={!meetingId} onClick={(event) => { if (!meetingId) { event.preventDefault(); setPanel("Select a meeting before downloading MOM."); } }} href={meetingId ? `/api/ai/mom?meeting=${meetingId}&format=docx` : "#"} className="portal-mini-button rounded-2xl px-4 py-3 text-center text-xs text-white/70">Download MOM DOCX</a>
          </div>
          <p className="mt-3 text-xs text-white/35">{selectedMeeting ? `Selected: ${selectedMeeting.title}` : "Create a meeting from the Meetings tab first."}</p>
        </div>
      </div>

      <div className="glass rounded-xl p-5">
        <div className="flex items-center gap-3">
          <Brain size={18} className="text-violet-200" />
          <div>
            <p className="text-sm">AI Secretary Assistant</p>
            <p className="mt-1 text-xs text-white/38">Answers only from live database context: members, teams, events, registrations, attendance, tasks, meetings, and documents.</p>
          </div>
        </div>
        <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={6} placeholder="Example: summarize pending event work, registration status, attendance gaps, or upcoming meetings..." className="mt-5 w-full rounded-2xl border border-white/[.07] bg-black/35 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/25" />
        <button disabled={asking} onClick={askSecretary} className="portal-command-button mt-3 w-full rounded-2xl px-4 py-3 text-xs font-semibold disabled:opacity-60">{asking ? "Thinking..." : "Ask Secretary Assistant"}</button>
        {answer ? <div className="mt-4 rounded-2xl border border-white/[.07] bg-white/[.025] p-4 text-sm leading-7 text-white/70 whitespace-pre-wrap">{answer}</div> : null}
        <div className="mt-5 border-t border-white/[.06] pt-4">
          <p className="text-[10px] uppercase tracking-[.2em] text-white/35">Recent generated documents</p>
          {(data.generatedDocuments || []).slice(0, 6).map((doc: any) => (
            <div className="mt-3 rounded-2xl border border-white/[.06] bg-black/20 px-4 py-3 text-xs text-white/55" key={idOf(doc)}>
              <p className="font-semibold text-white/75">{doc.title}</p>
              <p className="mt-1 uppercase tracking-[.14em] text-white/32">{doc.kind} / {doc.format} / {doc.generatedAt ? new Date(doc.generatedAt).toLocaleString("en-IN") : "generated"}</p>
            </div>
          ))}
          {!(data.generatedDocuments || []).length ? <p className="mt-3 text-xs text-white/35">No generated documents yet.</p> : null}
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
    <div className="mt-7 grid gap-4 xl:grid-cols-[1fr_.42fr]">
      <div className="glass rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm">Registered candidates</p>
            <p className="mt-1 text-xs text-white/35">Filter by event, search by name or UID, then mark attendance manually.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="portal-mini-button flex min-w-[240px] items-center gap-2 rounded-2xl px-3 py-2.5 text-white/45">
              <Search size={14} />
              <input value={attendanceSearch} onChange={(event) => setAttendanceSearch(event.target.value)} placeholder="Search name, UID, email..." className="w-full bg-transparent text-xs text-white outline-none placeholder:text-white/28" />
            </label>
            <select value={selected} onChange={(event) => setSelected(event.target.value)} className="rounded-2xl border border-white/[.07] bg-black/40 px-3 py-2.5 text-xs text-white outline-none">
              {events.map((event: any) => <option value={idOf(event)} key={idOf(event)}>{event.title}</option>)}
            </select>
          </div>
        </div>

        {participants.length ? (
          <div className="mt-5 overflow-hidden rounded-xl border border-white/[.06]">
            <div className="hidden grid-cols-[.8fr_.8fr_.7fr_.6fr_auto] gap-3 bg-white/[.035] px-4 py-3 text-[10px] uppercase tracking-wider text-white/35 md:grid">
              <span>Name</span><span>UID</span><span>Program</span><span>Mode</span><span>Attendance</span>
            </div>
            <div className="max-h-[430px] overflow-y-auto overscroll-contain">
              {filteredParticipants.map((row: any) => {
                const status = localStatus[`${selected}:${row.user}`] || attendanceMap.get(`${selected}:${row.user}`)?.status || "absent";
                const isPresent = status === "present";
                const busy = Boolean(marking[`${selected}:${row.user}`]);
                return (
                  <div className="grid gap-3 border-t border-white/[.05] bg-black/15 px-4 py-4 text-sm md:grid-cols-[.8fr_.8fr_.7fr_.6fr_auto] md:items-center md:py-3 md:text-xs" key={`${row.registration}-${row.user}`}>
                    <div>
                      <p className="text-white/75">{row.name}</p>
                      {row.teamName ? <p className="mt-1 text-[10px] text-violet-200/60">{row.teamName}</p> : null}
                    </div>
                    <span className="rounded-2xl border border-white/[.06] bg-white/[.025] px-3 py-2 text-white/48 md:border-0 md:bg-transparent md:px-0 md:py-0">{row.uid || "-"}</span>
                    <span className="rounded-2xl border border-white/[.06] bg-white/[.025] px-3 py-2 text-white/48 md:border-0 md:bg-transparent md:px-0 md:py-0">{row.program || "-"}{row.semester ? ` / Sem ${row.semester}` : ""}</span>
                    <span className="rounded-2xl border border-white/[.06] bg-white/[.025] px-3 py-2 capitalize text-white/48 md:border-0 md:bg-transparent md:px-0 md:py-0">{row.mode}</span>
                    <div className="grid gap-2 sm:flex sm:items-center sm:justify-end sm:gap-3 md:min-w-48">
                      <span className={`rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider ${isPresent ? "bg-emerald-400/10 text-emerald-200" : "bg-rose-400/10 text-rose-200"}`}>
                        {isPresent ? "Marked present" : "Marked absent"}
                      </span>
                      {isPresent ? (
                        <button type="button" disabled={busy} onClick={(event) => { event.preventDefault(); event.stopPropagation(); void mark(row, "absent"); }} className="min-h-11 rounded-xl border border-rose-300/25 px-3 py-2 text-rose-200 hover:bg-rose-400/10 disabled:cursor-wait disabled:opacity-60 md:min-h-0 md:rounded-lg">
                          {busy ? "Saving..." : "Mark absent"}
                        </button>
                      ) : (
                        <button type="button" disabled={busy} onClick={(event) => { event.preventDefault(); event.stopPropagation(); void mark(row, "present"); }} className="min-h-11 rounded-xl border border-emerald-300/25 px-3 py-2 text-emerald-200 hover:bg-emerald-400/10 disabled:cursor-wait disabled:opacity-60 md:min-h-0 md:rounded-lg">
                          {busy ? "Saving..." : "Mark present"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {!filteredParticipants.length ? <p className="border-t border-white/[.05] bg-black/15 px-4 py-6 text-sm text-white/45">No candidates match “{attendanceSearch}”.</p> : null}
            </div>
          </div>
        ) : (
          <p className="mt-5 rounded-xl border border-white/[.06] bg-white/[.025] p-6 text-sm text-white/45">{selectedEvent ? "No registrations for this event yet." : "Create an event before marking attendance."}</p>
        )}
      </div>
      <div className="glass rounded-xl p-5">
        <p className="text-sm">Exports</p>
        <p className="mt-3 text-xs leading-6 text-white/40">{participants.length} registered participant rows. Attendance sheets include only candidates marked present for the selected event.</p>
        {selected ? <div className="mt-4 grid gap-3"><a className="portal-command-button rounded-2xl px-4 py-3 text-center text-xs font-semibold" href={`/api/attendance/export?event=${selected}&format=pdf`}>Download PDF attendance sheet</a><a className="portal-mini-button rounded-2xl px-4 py-3 text-center text-xs text-white/70" href={`/api/attendance/export?event=${selected}&format=xlsx`}>Download Excel attendance sheet</a></div> : null}
        <button onClick={() => setPanel("For team events, the leader and every added member are listed separately so the attendance sheet contains actual present students only.")} className="portal-mini-button mt-4 rounded-2xl px-4 py-3 text-left text-xs text-white/68 transition hover:-translate-y-0.5 hover:text-white">How team attendance works</button>
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
    <div className="mt-7 grid gap-4 xl:grid-cols-[1fr_.42fr]">
      <div className="glass rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm">Certificate generation</p>
            <p className="mt-1 text-xs leading-5 text-white/38">Exports use your exact HTML certificate templates and download one clean PDF per participant or winner.</p>
          </div>
          <select value={selected} onChange={(event) => setSelected(event.target.value)} className="rounded-2xl border border-white/[.07] bg-black/40 px-3 py-2.5 text-xs text-white outline-none">
            <option value="">Select event</option>
            {events.map((event: any) => <option value={idOf(event)} key={idOf(event)}>{event.title}</option>)}
          </select>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-white/[.07] bg-white/[.025] p-4">
            <p className="text-[10px] uppercase tracking-[.18em] text-white/35">Registered</p>
            <p className="mt-2 text-3xl font-semibold tracking-[-.04em]">{participants.length}</p>
          </div>
          <div className="rounded-2xl border border-emerald-300/15 bg-emerald-400/[.04] p-4">
            <p className="text-[10px] uppercase tracking-[.18em] text-emerald-100/50">Present</p>
            <p className="mt-2 text-3xl font-semibold tracking-[-.04em] text-emerald-100">{presentParticipants.length}</p>
          </div>
          <div className="rounded-2xl border border-violet-300/15 bg-violet-400/[.04] p-4">
            <p className="text-[10px] uppercase tracking-[.18em] text-violet-100/50">Winner slots</p>
            <p className="mt-2 text-3xl font-semibold tracking-[-.04em] text-violet-100">{[selectedEvent?.winnerFirst, selectedEvent?.winnerSecond, selectedEvent?.winnerThird].filter(Boolean).length}/3</p>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-white/[.06]">
          <div className="grid grid-cols-[.9fr_.55fr_.7fr_.4fr_auto] gap-3 bg-white/[.035] px-4 py-3 text-[10px] uppercase tracking-wider text-white/35">
            <span>Present candidate</span><span>UID</span><span>Program</span><span>Mode</span><span>PDF</span>
          </div>
          <div className="max-h-[360px] overflow-y-auto">
            {presentParticipants.map((row: any) => (
              <div className="grid grid-cols-[.9fr_.55fr_.7fr_.4fr_auto] items-center gap-3 border-t border-white/[.05] bg-black/15 px-4 py-3 text-xs" key={`${row.registration}-${row.user}`}>
                <div><p className="text-white/75">{row.name || "Unnamed candidate"}</p>{row.teamName ? <p className="mt-1 text-[10px] text-violet-200/60">{row.teamName}</p> : null}</div>
                <span className="text-white/45">{row.uid || "-"}</span>
                <span className="text-white/45">{row.program || "-"}{row.semester ? ` / Sem ${row.semester}` : ""}</span>
                <span className="capitalize text-white/45">{row.mode}</span>
                <a download onClick={() => setPanel(`Downloading participation certificate for ${row.name || "candidate"}...`)} className="portal-command-button rounded-xl px-3 py-2 text-center text-[10px] font-semibold" href={`/api/certificates/export?event=${selected}&type=participation&format=pdf&candidate=${row.user}`}>PDF</a>
              </div>
            ))}
            {!presentParticipants.length ? <p className="border-t border-white/[.05] bg-black/15 px-4 py-6 text-sm text-white/45">No present candidates yet. Mark attendance present before exporting participation certificates.</p> : null}
          </div>
        </div>
      </div>

      <div className="glass rounded-xl p-5">
        <p className="text-sm">Certificate exports</p>
        <p className="mt-3 text-xs leading-6 text-white/40">Download certificates manually as individual PDFs. Mark attendance present first, then use the PDF button beside each candidate.</p>
        <div className="mt-4 rounded-2xl border border-white/[.06] bg-white/[.025] p-4 text-xs leading-6 text-white/48">
          {presentParticipants.length ? `${presentParticipants.length} present candidate PDFs are ready in the list.` : "No participation PDFs yet because no candidate is marked present for this event."}
        </div>

        <div className="mt-5 rounded-2xl border border-white/[.06] bg-black/20 p-4">
          <p className="text-[10px] uppercase tracking-[.18em] text-white/35">Winner selection</p>
          <div className="mt-3 grid gap-2 text-xs text-white/62">
            <p>1st place: <span className="text-white/85">{winnerDisplay(selectedEvent, "winnerFirst")}</span></p>
            <p>2nd place: <span className="text-white/85">{winnerDisplay(selectedEvent, "winnerSecond")}</span></p>
            <p>3rd place: <span className="text-white/85">{winnerDisplay(selectedEvent, "winnerThird")}</span></p>
          </div>
          <button type="button" onClick={() => selectedEvent ? open({ resource: "events", title: `Select winners for ${selectedEvent.title}`, fields: config.Events.fields, item: selectedEvent }) : setPanel("Select an event before choosing winners.")} className="portal-command-button mt-4 w-full rounded-2xl px-4 py-3 text-xs font-semibold">Choose / update winners</button>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <a download onClick={guardedDownload(Boolean(selected && selectedEvent?.winnerFirst), "Select a 1st place winner first.")} className="portal-mini-button rounded-xl px-3 py-2 text-center text-[10px] text-white/60" href={selected ? `/api/certificates/export?event=${selected}&type=winner&format=pdf&place=1` : "#"}>1st PDF</a>
          <a download onClick={guardedDownload(Boolean(selected && selectedEvent?.winnerSecond), "Select a 2nd place winner first.")} className="portal-mini-button rounded-xl px-3 py-2 text-center text-[10px] text-white/60" href={selected ? `/api/certificates/export?event=${selected}&type=winner&format=pdf&place=2` : "#"}>2nd PDF</a>
          <a download onClick={guardedDownload(Boolean(selected && selectedEvent?.winnerThird), "Select a 3rd place winner first.")} className="portal-mini-button rounded-xl px-3 py-2 text-center text-[10px] text-white/60" href={selected ? `/api/certificates/export?event=${selected}&type=winner&format=pdf&place=3` : "#"}>3rd PDF</a>
        </div>
      </div>
    </div>
  );
}

function Settings({info,open}:{info:any;open:(drawer:any)=>void}){return <div className="mt-7 grid gap-4 lg:grid-cols-[1fr_.7fr]"><div className="glass rounded-xl p-5"><p className="text-sm">Club branding, faculty, advisors, office bearers, and document templates</p><div className="mt-3 max-h-[min(680px,calc(100vh-330px))] overflow-y-auto overscroll-contain pr-1">{["logo","website","email","location","aboutTitle","vision","mission","facultyChampionName","facultyChampionPhoto","secretaryName","secretaryPhoto","studentAdvisorOneName","studentAdvisorOnePhoto","studentAdvisorTwoName","studentAdvisorTwoPhoto","jointSecretaryOneName","jointSecretaryTwoName","postActivityReportTemplate","momTemplate"].map((key)=><div className="mt-3 rounded-xl border border-white/[.06] bg-black/15 p-4 text-xs first:mt-0" key={key}><p className="text-white/35">{key}</p><p className="mt-2 break-all text-white/70">{info[key] || "Not set"}</p></div>)}</div></div><div className="glass rounded-xl p-5"><p className="text-sm">Settings actions</p><button onClick={()=>open({resource:"settings",title:"Update club branding, faculty, advisors, office bearers, and document templates",fields:settingsFields})} className="portal-command-button mt-4 w-full rounded-2xl px-4 py-3 text-xs font-semibold">Update public settings</button><button onClick={()=>open({resource:"invites",title:"Invite portal operator",fields:extraFields.invites})} className="portal-mini-button mt-3 w-full rounded-2xl px-4 py-3 text-xs font-semibold text-violet-100 transition hover:-translate-y-0.5">Invite operator</button><p className="mt-4 text-xs leading-6 text-white/40">These values drive About, Contact, logo, faculty champion photo, secretary, student advisors, joint secretaries, public branding, and official AI document templates. Operator accounts are invite-only.</p></div></div>}

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
