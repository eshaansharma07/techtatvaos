"use client";

import { useEffect, useMemo, useState } from "react";
import { signOut } from "next-auth/react";
import {
  Activity,
  Bell,
  CalendarDays,
  CheckCircle2,
  Download,
  LayoutDashboard,
  LogOut,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  Users,
  Workflow,
  Hexagon
} from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

type Module = "Overview" | "Members" | "Teams" | "Events" | "Attendance" | "Tasks" | "Announcements" | "Media" | "Settings";
type Resource = "users" | "teams" | "events" | "tasks" | "announcements" | "sponsors" | "achievements" | "gallery" | "contacts" | "settings" | "invites";
type Data = Record<string, any>;
type Field = [string, string, string?];

const nav = [
  [LayoutDashboard, "Overview"],
  [Users, "Members"],
  [Workflow, "Teams"],
  [CalendarDays, "Events"],
  [CheckCircle2, "Attendance"],
  [Workflow, "Tasks"],
  [Bell, "Announcements"],
  [Activity, "Media"],
  [Settings2, "Settings"]
] as const;

const config: Record<Exclude<Module, "Overview" | "Attendance" | "Settings">, { key: string; resource: Resource; fields: Field[] }> = {
  Members: { key: "users", resource: "users", fields: [["name","Name"],["email","Email","email"],["team","Team","team-select"],["image","Profile photo","upload:image"],["uid","UID"],["registrationNumber","Registration number"],["department","Department"],["program","Program"],["semester","Semester","number"],["phone","Phone"]] },
  Teams: { key: "teams", resource: "teams", fields: [["name","Team name"],["slug","Slug"],["description","Description"],["lead","Team lead","member-select"],["coLeads","Co-leads","member-multi-select"],["facultyChampionName","Faculty champion name"],["order","Display order","number"],["active","Active: true/false"]] },
  Events: { key: "events", resource: "events", fields: [["title","Title"],["slug","Slug"],["description","Description"],["venue","Venue"],["capacity","Capacity","number"],["category","Category"],["team","Team","team-select"],["leads","Event leads","member-multi-select"],["status","Public status","status-select"],["registrationOpen","Registration open","boolean-select"],["registrationStart","Registration start","datetime-local"],["registrationEnd","Registration end","datetime-local"],["startAt","Event start date/time","datetime-local"],["endAt","Event end date/time","datetime-local"],["banner","Event banner","upload:image"]] },
  Tasks: { key: "tasks", resource: "tasks", fields: [["title","Title"],["description","Description"],["team","Team","team-select"],["dueAt","Due date","datetime-local"],["status","Status"],["priority","Priority"]] },
  Announcements: { key: "announcements", resource: "announcements", fields: [["title","Title"],["body","Body"],["status","Status"],["audience","Audience"],["publishAt","Publish at","datetime-local"]] },
  Media: { key: "gallery", resource: "gallery", fields: [["title","Album title"],["url","Upload image/video","upload:auto"],["caption","Caption"],["published","Published: true/false"]] }
};

const extraFields: Record<Resource, Field[]> = {
  users: config.Members.fields,
  teams: config.Teams.fields,
  events: config.Events.fields,
  tasks: config.Tasks.fields,
  announcements: config.Announcements.fields,
  gallery: config.Media.fields,
  sponsors: [["name","Sponsor name"],["logo","Sponsor logo","upload:image"],["website","Website"],["level","Sponsorship level"],["active","Active: true/false"]],
  achievements: [["title","Title"],["description","Description"],["kind","Kind"],["awardedAt","Awarded at","date"],["image","Achievement image","upload:image"],["featured","Featured: true/false"]],
  contacts: [["status","Status"]],
  settings: [["logo","Club logo","upload:image"]],
  invites: [["email","Invite email","email"],["role","Role slug"],["team","Team","team-select"]]
};

function idOf(item:any){return String(item._id || item.id)}
function valueOf(item:any, key:string){const value=item[key];if(value && typeof value==="object")return value.name || value.title || value.slug || "";return value ?? ""}
function rawValue(item:any, key:string): string | number | boolean | string[] {const value=item?.[key];if(Array.isArray(value))return value.map((entry)=>String(rawValue({entry},"entry")));if(value && typeof value==="object")return String(value._id || value.id || "");return value ?? ""}
function memberLabel(member:any){return `${member.name || "Unnamed member"}${member.team?.name ? ` / ${member.team.name}` : ""}`}
function PortalLogo(){return <a href="/portal" className="flex items-center gap-3 font-semibold tracking-tight"><span className="grid h-9 w-9 place-items-center rounded-xl border border-violet-400/40 bg-violet-500/10 text-violet-300"><Hexagon size={18}/></span><span>TECH TATVA <i className="font-normal text-white/40">/ PORTAL</i></span></a>}

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
    const body=resource==="events"?{status:"published",registrationOpen:"true"}:{active:"true",published:"true"};
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
    if(module==="Members")return (data.users||[]).map((u:any)=>[u.name,u.email,u.uid||"-",valueOf(u,"team")||"-",u.status||"active",u]);
    if(module==="Teams")return (data.teams||[]).map((t:any)=>[t.name,valueOf(t,"lead") || "No lead",t.facultyChampionName || "No faculty champion",`${t.members?.length||0} members`,t.active===false?"inactive":"active",t]);
    if(module==="Events")return (data.events||[]).map((e:any)=>[e.title,e.status,e.registrationOpen?"open":"closed",e.venue||"-",e.startAt?new Date(e.startAt).toLocaleString():"TBA",e]);
    if(module==="Tasks")return (data.tasks||[]).map((t:any)=>[t.title,t.status,t.priority||"medium",t.dueAt?new Date(t.dueAt).toLocaleString():"No due date",valueOf(t,"team")||"-",t]);
    if(module==="Announcements")return (data.announcements||[]).map((a:any)=>[a.title,a.status||"draft",a.audience||"public",a.publishAt?new Date(a.publishAt).toLocaleString():"Not scheduled",a]);
    if(module==="Media")return [...(data.gallery||[]).map((g:any)=>[g.title,g.published?"published":"hidden",`${g.assets?.length||0} assets`,"gallery",{...g,__resource:"gallery"}]),...(data.sponsors||[]).map((s:any)=>[s.name,s.level||"-",s.active?"active":"inactive","sponsor",{...s,__resource:"sponsors"}]),...(data.achievements||[]).map((a:any)=>[a.title,a.kind||"-",a.featured?"featured":"normal","achievement",{...a,__resource:"achievements"}])];
    return [];
  }

  const filtered=rowsFor(active).filter((row:any[])=>row.join(" ").toLowerCase().includes(search.toLowerCase()));

  return <main className="min-h-screen bg-[#08070b] text-white">
    <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-white/[.06] bg-[#0c0b10] p-5 xl:block"><PortalLogo/><p className="mt-12 px-3 text-[10px] tracking-[.18em] text-white/25">INTERNAL PORTAL</p><nav className="mt-4 space-y-1">{nav.map(([Icon,label])=><button key={label} onClick={()=>{setActive(label);setPanel(`${label} loaded from MongoDB.`)}} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs transition ${active===label?"bg-violet-500/15 text-violet-200":"text-white/40 hover:bg-white/[.04]"}`}><Icon size={15}/>{label}</button>)}</nav><button onClick={()=>setActive("Settings")} className="absolute bottom-16 left-5 flex items-center gap-3 text-xs text-white/35 transition hover:text-white/70"><Settings2 size={15}/> System settings</button><button onClick={()=>signOut({callbackUrl:"/login"})} className="absolute bottom-5 left-5 flex items-center gap-3 text-xs text-white/35 transition hover:text-rose-200"><LogOut size={15}/> Sign out</button></aside>
    <section className="xl:pl-64"><header className="flex min-h-20 flex-wrap items-center justify-between gap-4 border-b border-white/[.06] px-5 py-4 md:px-8"><div><p className="text-xs text-white/35">{new Date().toLocaleString("en-IN",{dateStyle:"full",timeStyle:"short"})}</p><h1 className="mt-1 text-lg">Good day, {userName}.</h1></div><div className="flex flex-1 items-center justify-end gap-3"><label className="hidden min-w-72 items-center gap-3 rounded-lg border border-white/[.07] bg-white/[.035] px-3 py-2.5 text-white/40 md:flex"><Search size={16}/><input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search live admin data..." className="w-full bg-transparent text-xs text-white outline-none placeholder:text-white/25"/></label><button onClick={refresh} className="rounded-lg border border-white/[.07] p-2.5 text-white/40 transition hover:bg-white/[.05]"><RefreshCw size={16} className={busy?"animate-spin":""}/></button><button onClick={()=>setNotifications(!notifications)} className="relative rounded-lg border border-white/[.07] p-2.5 text-white/40 transition hover:bg-white/[.05]"><Bell size={16}/>{counts.contacts?<i className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-pink-400"/>:null}</button><div className="h-9 w-9 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500"/></div></header>
    <div className="p-5 md:p-8"><Header active={active} data={data} open={setDrawer} setPanel={setPanel}/>{active==="Overview"?<Overview counts={counts} chart={chart} setActive={setActive}/>:active==="Attendance"?<Attendance data={data} setPanel={setPanel}/>:active==="Settings"?<Settings info={data.clubInfo||{}} open={setDrawer}/>:<Workspace active={active} rows={filtered} open={setDrawer} remove={remove} restore={restore} patch={patch} duplicateEvent={duplicateEvent}/>}<div className="mt-4 rounded-xl border border-violet-300/15 bg-violet-500/[.07] p-5"><p className="text-[10px] tracking-[.2em] text-violet-300">ACTION PANEL</p><p className="mt-3 text-sm leading-6 text-white/65">{panel}</p></div></div></section>
    {notifications?<div className="fixed right-5 top-24 z-50 w-[min(380px,calc(100vw-40px))] rounded-2xl border border-white/10 bg-[#111016]/95 p-5 shadow-2xl shadow-black/40 backdrop-blur-xl"><p className="text-sm">Open contact messages</p>{(data.contactMessages||[]).filter((m:any)=>m.status!=="resolved").slice(0,6).map((m:any)=><button onClick={()=>setPanel(`${m.name}: ${m.message}`)} className="mt-3 block w-full rounded-xl bg-white/[.04] px-4 py-3 text-left text-xs text-white/55 transition hover:bg-violet-500/[.08]" key={idOf(m)}>{m.subject}</button>)}{!counts.contacts?<p className="mt-4 text-xs text-white/40">No unresolved messages.</p>:null}</div>:null}
    {drawer?<div className="fixed inset-0 z-50 bg-black/70 p-4 backdrop-blur-sm"><div className="ml-auto h-full max-w-xl overflow-y-auto rounded-2xl border border-white/10 bg-[#111016] p-6"><div className="flex items-center justify-between"><h2 className="text-xl">{drawer.title}</h2><button onClick={()=>setDrawer(null)} className="text-sm text-white/45">Close</button></div><form action={submit} className="mt-6 grid gap-4">{drawer.fields.map(([name,label,type])=>{const source={...(drawer.defaults||{}),...(drawer.item||{})};const selected=rawValue(source,name);const formValue=Array.isArray(selected)?selected:String(selected??"");return <label className="text-[10px] tracking-wider text-white/35" key={name}>{label.toUpperCase()}{type==="status-select"?<select name={name} defaultValue={formValue || "published"} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50">{["draft","published","active","completed","archived"].map((status)=><option value={status} key={status}>{status}</option>)}</select>:type==="boolean-select"?<select name={name} defaultValue={String(selected === true || selected === "true")} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50"><option value="true">Yes</option><option value="false">No</option></select>:type==="team-select"?<select name={name} defaultValue={formValue} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50"><option value="">No team</option>{(data.teams||[]).filter((team:any)=>team.active!==false).map((team:any)=><option value={idOf(team)} key={idOf(team)}>{team.name}</option>)}</select>:type==="member-select"?<select name={name} defaultValue={formValue} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50"><option value="">No member selected</option>{(data.users||[]).filter((user:any)=>user.status!=="inactive").map((user:any)=><option value={idOf(user)} key={idOf(user)}>{memberLabel(user)}</option>)}</select>:type==="member-multi-select"?<select name={name} multiple defaultValue={Array.isArray(formValue)?formValue:[]} className="mt-2 min-h-36 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50">{(data.users||[]).filter((user:any)=>user.status!=="inactive").map((user:any)=><option value={idOf(user)} key={idOf(user)}>{memberLabel(user)}</option>)}</select>:type?.startsWith("upload")?<UploadControl name={name} current={Array.isArray(formValue)?"":formValue} upload={uploads[name]} uploading={Boolean(uploading[name])} onUpload={async(file)=>{setUploading((state)=>({...state,[name]:true}));setPanel(`Uploading ${file.name}...`);const form=new FormData();form.append("file",file);form.append("folder",`tech-tatva-os/${drawer.resource}`);const res=await fetch("/api/portal/upload",{method:"POST",body:form});const result=await res.json();setUploading((state)=>({...state,[name]:false}));if(!res.ok){setPanel(result.error || "Upload failed");return}setUploads((state)=>({...state,[name]:result}));setPanel(`Uploaded ${file.name}. Now save the form.`)}}/>:name==="description"||name==="body"||name==="aboutCopy"?<textarea name={name} defaultValue={formValue} rows={5} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50"/>:<input name={name} type={type||"text"} defaultValue={formValue} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50"/>}</label>})}<p className="text-[10px] leading-4 text-white/35">Tip: hold Command/Ctrl to select multiple leads or co-leads.</p><button disabled={busy||Object.values(uploading).some(Boolean)} className="rounded-lg bg-white py-3 text-sm font-semibold text-black disabled:opacity-60">{busy?"Saving...":Object.values(uploading).some(Boolean)?"Uploading...":"Save"}</button></form></div></div>:null}
  </main>
}

function Header({active,data,open,setPanel}:{active:Module;data:Data;open:(drawer:any)=>void;setPanel:(text:string)=>void}){
  const action=active==="Overview"?"Export summary":active==="Attendance"?"Generate attendance":active==="Settings"?"Update branding":`Add ${active.slice(0,-1)}`;
  return <div className="flex flex-wrap justify-between gap-4"><div><p className="text-[10px] tracking-[.22em] text-violet-300">COMMAND CENTER / {active.toUpperCase()}</p><h2 className="mt-3 text-3xl tracking-tight">{active==="Overview"?"Club intelligence":active}</h2></div><button onClick={()=>{if(active==="Overview")setPanel(JSON.stringify({members:data.users?.length||0,events:data.events?.length||0,teams:data.teams?.length||0},null,2));else if(active==="Attendance")setPanel("Use the PDF/XLSX buttons beside real events below.");else if(active==="Settings")open({resource:"settings",title:"Update club branding and public info",fields:[["logo","Club logo","upload:image"],["website","Website URL"],["email","Public email"],["location","Location"],["footerCopy","Footer copy"],["aboutTitle","About title"],["aboutCopy","About copy"],["vision","Vision"],["mission","Mission"]]});else{const c=config[active as keyof typeof config];open({resource:c.resource,title:`Add ${active.slice(0,-1)}`,fields:c.fields,defaults:active==="Events"?{status:"published",registrationOpen:"true"}:{}})}}} className="flex items-center gap-2 self-end rounded-lg bg-white px-4 py-2.5 text-xs font-semibold text-black transition hover:bg-violet-100">{active==="Overview"||active==="Attendance"?<Download size={14}/>:<Plus size={14}/>} {action}</button></div>
}

function Overview({counts,chart,setActive}:{counts:any;chart:any[];setActive:(m:Module)=>void}){return <><div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[["Total members",counts.members,"Members",Users],["Active teams",counts.teams,"Teams",Workflow],["Published events",counts.events,"Events",CalendarDays],["Open tasks",counts.tasks,"Tasks",CheckCircle2]].map(([label,value,module,Icon]:any)=><button onClick={()=>setActive(module)} className="glass rounded-xl p-5 text-left transition hover:-translate-y-0.5 hover:border-violet-300/35" key={label}><div className="flex justify-between"><p className="text-xs text-white/40">{label}</p><Icon size={15} className="text-violet-300"/></div><p className="mt-5 text-3xl">{value}</p><p className="mt-2 text-[10px] tracking-wider text-white/35">LIVE DATABASE COUNT</p></button>)}</div><div className="glass mt-4 rounded-xl p-5"><p className="text-sm">System data volume</p><div className="mt-5 h-72"><ResponsiveContainer><BarChart data={chart}><XAxis dataKey="m" axisLine={false} tickLine={false} tick={{fill:"#ffffff66",fontSize:10}}/><Tooltip contentStyle={{background:"#111016",border:"1px solid #ffffff16"}}/><Bar dataKey="v" fill="#8b5cf6" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></div></div></>}

function Workspace({active,rows,open,remove,restore,patch,duplicateEvent}:{active:Module;rows:any[];open:(drawer:any)=>void;remove:(resource:Resource,item:any)=>void;restore:(resource:Resource,item:any)=>void;patch:(resource:Resource,item:any,body:Record<string, any>,message:string)=>void;duplicateEvent:(item:any)=>void}){const c=config[active as keyof typeof config];return <div className="mt-7 grid gap-4 lg:grid-cols-[1fr_.6fr]"><div className="glass rounded-xl p-5"><p className="text-sm">{active} workspace</p>{rows.length?<div className="mt-4 overflow-hidden rounded-xl border border-white/[.06]">{rows.map((row:any[])=>{const item=row[row.length-1];const resource=(item.__resource||c.resource) as Resource;const fields=extraFields[resource] || c.fields;const inactive=item.active===false || item.published===false || item.status==="archived";const isEvent=active==="Events";return <div className="grid gap-3 border-b border-white/[.05] bg-black/15 p-4 text-xs last:border-0 md:grid-cols-[1.1fr_.8fr_.8fr_.8fr_auto]" key={idOf(item)}>{row.slice(0,-1).slice(0,4).map((cell:any,index:number)=><button onClick={()=>open({resource,title:`Edit ${active.slice(0,-1)}`,fields,item})} className={`text-left ${index===0?"text-white/75":"text-white/45"}`} key={`${idOf(item)}-${index}`}>{String(cell)}</button>)}<div className="flex flex-wrap gap-3">{active==="Teams"&&item.active!==false?<button onClick={()=>open({resource:"users",title:`Add member to ${item.name}`,fields:config.Members.fields,defaults:{team:idOf(item)}})} className="text-violet-300">Add member</button>:active==="Teams"?<span className="text-white/25">Inactive</span>:null}{isEvent?<><button onClick={()=>patch(resource,item,{status:"published"},"Event published. It is visible on the public website.")} className="text-emerald-300">Publish</button><button onClick={()=>patch(resource,item,{status:"draft",registrationOpen:"false"},"Event moved to draft and hidden publicly.")} className="text-white/45">Draft</button><button onClick={()=>patch(resource,item,{registrationOpen:String(!item.registrationOpen),status:item.status==="draft"?"published":item.status},"Registration setting updated.")} className="text-violet-300">{item.registrationOpen?"Close reg":"Open reg"}</button><button onClick={()=>duplicateEvent(item)} className="text-sky-300">Duplicate</button></>:null}{inactive?<button onClick={()=>restore(resource,item)} className="text-emerald-300">Restore</button>:!isEvent?<button onClick={()=>remove(resource,item)} className="text-rose-300">Archive</button>:null}{isEvent?<button onClick={()=>remove(resource,item)} className="text-rose-300">Delete</button>:null}</div></div>})}</div>:<p className="mt-5 rounded-xl border border-white/[.06] bg-white/[.025] p-6 text-sm text-white/45">No records yet. Add one from the button above.</p>}</div><div className="glass rounded-xl p-5"><p className="text-sm">Module actions</p>{active==="Media"?(["gallery","sponsors","achievements"] as Resource[]).map((resource)=><button onClick={()=>open({resource,title:`Add ${resource}`,fields:extraFields[resource]})} className="mt-3 block w-full rounded-xl border border-white/[.07] bg-white/[.035] px-4 py-3 text-left text-xs text-white/60 transition hover:bg-violet-500/[.08]" key={resource}>Add {resource}</button>):<button onClick={()=>open({resource:c.resource,title:`Add ${active.slice(0,-1)}`,fields:c.fields,defaults:active==="Events"?{status:"published",registrationOpen:"true"}:{}})} className="mt-3 block w-full rounded-xl border border-white/[.07] bg-white/[.035] px-4 py-3 text-left text-xs text-white/60 transition hover:bg-violet-500/[.08]">Create record</button>}<p className="mt-3 rounded-xl border border-white/[.07] bg-white/[.035] px-4 py-3 text-xs text-white/55">{active==="Teams"?"Active teams appear in member dropdowns. Restore inactive teams before assigning members.":active==="Events"?"Published or active events appear publicly. Draft and archived events stay hidden. Delete removes the event plus its registrations and attendance.":"Archive uses safe public removal."}</p></div></div>}

function Attendance({data,setPanel}:{data:Data;setPanel:(value:string)=>void}){const events=data.events||[];return <div className="mt-7 grid gap-4 lg:grid-cols-[1fr_.7fr]"><div className="glass rounded-xl p-5"><p className="text-sm">Attendance exports</p>{events.length?<div className="mt-4 overflow-hidden rounded-xl border border-white/[.06]">{events.map((event:any)=><div className="grid gap-3 border-b border-white/[.05] bg-black/15 p-4 text-xs last:border-0 md:grid-cols-[1fr_auto_auto]" key={idOf(event)}><span>{event.title}</span><a className="text-violet-300" href={`/api/attendance/export?event=${idOf(event)}&format=pdf`}>PDF</a><a className="text-violet-300" href={`/api/attendance/export?event=${idOf(event)}&format=xlsx`}>XLSX</a></div>)}</div>:<p className="mt-5 rounded-xl border border-white/[.06] bg-white/[.025] p-6 text-sm text-white/45">Create an event before exporting attendance.</p>}</div><div className="glass rounded-xl p-5"><p className="text-sm">Attendance status</p><p className="mt-3 text-xs leading-6 text-white/40">{data.attendance?.length||0} attendance records and {data.registrations?.length||0} registrations stored.</p><button onClick={()=>setPanel("Manual, QR, and bulk import endpoints can be extended from these saved registration records. Exports are live now.")} className="mt-4 rounded-xl border border-white/[.07] bg-white/[.035] px-4 py-3 text-left text-xs text-white/60">How this works</button></div></div>}

function Settings({info,open}:{info:any;open:(drawer:any)=>void}){const fields:Field[]=[["logo","Club logo","upload:image"],["website","Website URL"],["email","Public email"],["location","Location"],["footerCopy","Footer copy"],["aboutTitle","About title"],["aboutCopy","About copy"],["vision","Vision"],["mission","Mission"]];return <div className="mt-7 grid gap-4 lg:grid-cols-[1fr_.7fr]"><div className="glass rounded-xl p-5"><p className="text-sm">Club branding and public information</p>{["logo","website","email","location","aboutTitle","vision","mission"].map((key)=><div className="mt-3 rounded-xl border border-white/[.06] bg-black/15 p-4 text-xs" key={key}><p className="text-white/35">{key}</p><p className="mt-2 break-all text-white/70">{info[key] || "Not set"}</p></div>)}</div><div className="glass rounded-xl p-5"><p className="text-sm">Settings actions</p><button onClick={()=>open({resource:"settings",title:"Update club branding and public info",fields})} className="mt-4 w-full rounded-xl bg-white px-4 py-3 text-xs font-semibold text-black">Update public settings</button><button onClick={()=>open({resource:"invites",title:"Invite portal operator",fields:extraFields.invites})} className="mt-3 w-full rounded-xl border border-violet-300/20 bg-violet-500/10 px-4 py-3 text-xs font-semibold text-violet-100">Invite operator</button><p className="mt-4 text-xs leading-6 text-white/40">These values drive About, Contact, logo, website link, and future branding surfaces. Operator accounts are invite-only.</p></div></div>}

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
        accept="image/*,video/mp4,video/webm"
        disabled={uploading}
        onChange={(event)=>{const file=event.target.files?.[0]; if(file) void onUpload(file)}}
        className="block w-full text-xs text-white/55 file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-2 file:text-xs file:font-semibold file:text-black disabled:opacity-60"
      />
      <p className="mt-2 text-[10px] leading-4 text-white/35">{uploading ? "Uploading to Cloudinary..." : "Choose a file from your computer. Images and MP4/WebM up to 10MB are supported."}</p>
    </div>
  );
}
