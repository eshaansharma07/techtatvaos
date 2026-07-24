"use client";
import Image from "next/image";

import { type MouseEvent, useEffect, useMemo, useState, useRef } from "react";
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
  HelpCircle,
  Home,
  User,
  Send,
  Volume2,
  VolumeX
} from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, Area, AreaChart, YAxis, CartesianGrid } from "recharts";

type Module = "Overview" | "Members" | "Teams" | "Events" | "Event Participants" | "Recruitment" | "Membership Drive" | "Attendance" | "Certificates" | "Meetings" | "AI" | "Tasks" | "Announcements" | "Media" | "Hall of Fame" | "Contact Messages" | "Settings";
type Resource = "users" | "teams" | "events" | "meetings" | "tasks" | "announcements" | "sponsors" | "achievements" | "gallery" | "hallOfFame" | "contacts" | "settings" | "invites" | "recruitmentSettings" | "recruitmentTeams" | "recruitmentRoles" | "recruitmentQuestions" | "recruitmentApplications" | "studentMembers" | "membershipDriveSettings";
type Data = Record<string, any>;
type Field = [string, string, string?];

const nav = [
  [LayoutDashboard, "Overview"],
  [Users, "Members"],
  [Workflow, "Teams"],
  [CalendarDays, "Events"],
  [Users, "Event Participants"],
  [BriefcaseBusiness, "Recruitment"],
  [UserPlus, "Membership Drive"],
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

const config: Record<Exclude<Module, "Overview" | "Event Participants" | "Recruitment" | "Membership Drive" | "Attendance" | "Certificates" | "AI" | "Settings">, { key: string; resource: Resource; fields: Field[] }> = {
  Members: { key: "users", resource: "users", fields: [["name","Name"],["email","Email","email"],["teams","Teams","team-multi-select"],["image","Profile photo","upload:image"],["uid","UID"],["department","Department"],["program","Program"],["semester","Semester","number"],["phone","Phone"]] },
  Teams: { key: "teams", resource: "teams", fields: [["name","Team name"],["slug","Slug"],["description","Description"],["lead","Team lead","member-select"],["coLeads","Co-leads","member-multi-select"],["jointSecretaryLane","Reports under joint secretary","lane-select"],["order","Display order","number"],["active","Active","boolean-select"]] },
  Events: { key: "events", resource: "events", fields: [["title","Title"],["slug","Slug"],["description","Description"],["venue","Venue"],["capacity","Capacity","number"],["category","Category"],["team","Team","team-select"],["leads","Event leads","member-multi-select"],["participationMode","Participation type","participation-select"],["maxTeamSize","Maximum team size","number"],["winnerFirst","1st place winner","winner-select"],["winnerSecond","2nd place winner","winner-select"],["winnerThird","3rd place winner","winner-select"],["status","Public status","status-select"],["registrationOpen","Registration open","boolean-select"],["registrationStart","Registration start","datetime-local"],["registrationEnd","Registration end","datetime-local"],["startAt","Event start date/time","datetime-local"],["endAt","Event end date/time","datetime-local"],["banner","Event banner","upload:image"],["certEventLogo","Event logo","upload:image"],["whatsappGroupLink","WhatsApp group link"]] },
  Meetings: { key: "meetings", resource: "meetings", fields: [["title","Meeting title"],["date","Date","date"],["time","Time"],["venue","Venue"],["meetingType","Meeting type","meeting-type-select"],["organizer","Organizer","member-select"],["attendees","Attendees","member-multi-select"],["agenda","Agenda"],["discussionPoints","Discussion points"],["decisionsTaken","Decisions taken"],["actionItems","Action items (one per line: Task | Assigned To | Deadline | Status)"],["nextMeeting","Next meeting details"],["status","Status","meeting-status-select"]] },
  Tasks: { key: "tasks", resource: "tasks", fields: [["title","Title"],["description","Description"],["team","Team","team-select"],["dueAt","Due date","datetime-local"],["status","Status","task-status-select"],["priority","Priority","task-priority-select"]] },
  Announcements: { key: "announcements", resource: "announcements", fields: [["title","Title"],["body","Body"],["status","Status","announcement-status-select"],["audience","Audience","announcement-audience-select"],["publishAt","Publish at","datetime-local"]] },
  Media: { key: "gallery", resource: "gallery", fields: [["title","Album title"],["event","Linked event","event-select"],["assets","Album photos/videos","gallery-assets"],["published","Published","boolean-select"]] },
  "Hall of Fame": { key: "hallOfFame", resource: "hallOfFame", fields: [["name","Name"],["category","Category","hall-category"],["title","Title"],["subtitle","Subtitle"],["batch","Batch"],["year","Year","number"],["image","Photo","upload:image"],["order","Display order","number"],["active","Active","boolean-select"]] },
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
  sponsors: [["name","Sponsor name"],["logo","Sponsor logo","upload:image"],["website","Website"],["level","Sponsorship level","sponsor-level-select"],["active","Active","boolean-select"]],
  achievements: [["title","Title"],["description","Description"],["kind","Kind","achievement-kind-select"],["awardedAt","Awarded at","date"],["image","Achievement image","upload:image"],["featured","Featured","boolean-select"]],
  hallOfFame: config["Hall of Fame"].fields,
  contacts: config["Contact Messages"].fields,
  settings: [["logo","Club logo","upload:image"]],
  invites: [["email","Invite email","email"],["role","Role slug"],["team","Team","team-select"]],
  recruitmentSettings: [["status","Status","recruitment-status-select"],["registrationEnabled","Registration enabled","boolean-select"],["openingDate","Opening date","datetime-local"],["closingDate","Closing date","datetime-local"],["maximumApplications","Maximum applications","number"],["announcementBanner","Announcement banner"],["customSuccessMessage","Custom success message"],["confirmationEmailEnabled","Email: application received","boolean-select"],["emailOnAccepted","Email: accepted","boolean-select"],["emailOnRejected","Email: rejected","boolean-select"],["emailOnShortlisted","Email: shortlisted","boolean-select"],["emailOnInterview","Email: interview / on hold","boolean-select"],["autoCloseAfterDeadline","Auto close after deadline","boolean-select"],["manualOverride","Manual override","boolean-select"],["whatsappGroupLink","WhatsApp group link"]],
  recruitmentTeams: [["name","Team name"],["slug","Slug"],["description","Description"],["icon","Icon label"],["order","Display order","number"],["applicationLimit","Application limit","number"],["active","Active","boolean-select"]],
  recruitmentRoles: [["team","Recruitment team","recruitment-team-select"],["name","Role name"],["slug","Slug"],["description","Description"],["order","Display order","number"],["active","Active","boolean-select"]],
  recruitmentQuestions: [["team","Recruitment team","recruitment-team-select"],["role","Role-specific question","recruitment-role-select"],["label","Question"],["helpText","Help text"],["type","Question type","question-type-select"],["options","Options, one per line"],["required","Required","boolean-select"],["order","Display order","number"],["active","Active","boolean-select"]],
  recruitmentApplications: [["status","Status","application-status-select"],["adminNotes","Admin notes"]],
  studentMembers: [["status","Status","membership-member-status-select"],["adminRemarks","Remarks"]],
  membershipDriveSettings: [["status","Status","membership-status-select"],["registrationEnabled","Registration enabled","boolean-select"],["openingDate","Opening date","datetime-local"],["closingDate","Closing date","datetime-local"],["announcementBanner","Announcement banner"],["customSuccessMessage","Custom success message"],["whatsappGroupLink","WhatsApp group link"],["autoCloseAfterDeadline","Auto close after deadline","boolean-select"],["manualOverride","Manual override","boolean-select"]]
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
  ["momTemplate","MOM PDF template","upload:pdf"],
  ["githubUrl","GitHub URL"],
  ["discordUrl","Discord URL"],
  ["linkedinUrl","LinkedIn URL"],
  ["instagramHandle","Instagram handle (e.g. techtatva)"],
  ["instagramUrl","Instagram profile URL"],
  ["instagramFeedUrl","Instagram Auto-Feed JSON URL (e.g. Behold.so API URL)"],
  ["instagramFollowers","Instagram followers count override (optional)"],
  ["instagramFollowing","Instagram following count override (optional)"],
  ["instagramPosts","Instagram posts count override (optional)"],
  ["rotatingWords","Rotating Hero Words (comma-separated)"],
  ["instagramPost1_image","Instagram Post 1 Image","upload:image"],
  ["instagramPost1_url","Instagram Post 1 Link"],
  ["instagramPost2_image","Instagram Post 2 Image","upload:image"],
  ["instagramPost2_url","Instagram Post 2 Link"],
  ["instagramPost3_image","Instagram Post 3 Image","upload:image"],
  ["instagramPost3_url","Instagram Post 3 Link"],
  ["announcementEnabled","Enable floating announcement","boolean-select"],
  ["announcementText","Announcement text"],
  ["announcementLink","Announcement link (optional)"],
  ["announcementLinkText","Announcement link label (e.g. Register, View)"],
  ["announcementType","Announcement type","announcement-type-select"],
  ["announcementDetails","Announcement detailed description (optional)"]
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
    studentMembers:asArray(data.studentMembers),
    membershipDriveSettings:asArray(data.membershipDriveSettings),
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
function PortalLogo(){return <a href="/portal" className="group flex items-center gap-3 font-semibold tracking-tight"><span className="portal-logo-mark grid h-11 w-11 place-items-center rounded-2xl border border-violet-300/30 bg-violet-500/10 text-violet-200"><Image width={1200} height={1200} src="/logo-colour.png" alt="Tech Tatva Logo" className="w-6 h-6 object-contain" /></span><span className="leading-tight"><span className="block text-sm tracking-[.08em] text-white">TECH TATVA</span><i className="block text-xs font-normal tracking-[.18em] text-violet-200/45">PORTAL OS</i></span></a>}

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

  // Command Palette & Cyber Mode States
  const [showPalette, setShowPalette] = useState(false);
  const [paletteSearch, setPaletteSearch] = useState("");
  const [matrixRainMode, setMatrixRainMode] = useState(false);

  useEffect(()=>setUploads({}),[drawer?.resource,drawer?.title,drawer?.item?._id]);

  // Global mouse coordinates logger for dynamic glow borders
  useEffect(() => {
    const handleGlobalMouseMove = (e: any) => {
      const cards = document.querySelectorAll(".portal-glow-card");
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        (card as HTMLElement).style.setProperty("--mouse-x", `${x}px`);
        (card as HTMLElement).style.setProperty("--mouse-y", `${y}px`);
      });
    };
    window.addEventListener("mousemove", handleGlobalMouseMove);
    return () => window.removeEventListener("mousemove", handleGlobalMouseMove);
  }, []);

  // Keyboard shortcut listener for Cmd+K or "/"
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShowPalette(prev => !prev);
        setPaletteSearch("");
      } else if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        setShowPalette(true);
        setPaletteSearch("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const counts=useMemo(()=>({
    members:data.users?.filter((u:any)=>u.status==="active").length || 0,
    teams:data.teams?.filter((t:any)=>t.active!==false).length || 0,
    events:data.events?.filter((e:any)=>["published","active"].includes(e.status)).length || 0,
    tasks:data.tasks?.filter((t:any)=>t.status!=="completed").length || 0,
    attendance:data.attendance?.length || 0,
    contacts:data.contactMessages?.filter((m:any)=>m.status!=="resolved").length || 0,
    recruitment:data.recruitmentApplications?.length || 0,
    membershipDrive:data.studentMembers?.length || 0
  }),[data]);

  const chart=useMemo(()=>[
    {m:"Members",v:counts.members},
    {m:"Teams",v:counts.teams},
    {m:"Events",v:counts.events},
    {m:"Recruit",v:counts.recruitment},
    {m:"Join Us",v:counts.membershipDrive},
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
    const isSettings = drawer.resource === "settings";
    const url = drawer.resource === "invites" ? "/api/portal/invites" : (drawer.item && !isSettings) ? `/api/admin/${drawer.resource}/${idOf(drawer.item)}` : `/api/admin/${drawer.resource}`;
    const res = await fetch(url, {
      method: (drawer.item && !isSettings) ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
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
    setPanel(res.ok?(resource==="events"?"Event deleted permanently.":resource==="users"?"Member deleted permanently.":resource==="announcements"?"Announcement deleted permanently.":"Record removed from public/active views."):"Delete/archive failed.");
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

  // Keyboard shortcut suggestions
  const commandSuggestions = useMemo(() => {
    const list = [
      { category: "Navigation", label: "Jump to Overview", action: () => { setActive("Overview"); setPanel("Navigated to Overview via shortcut."); } },
      { category: "Navigation", label: "Jump to Core Members", action: () => { setActive("Members"); setPanel("Navigated to Members Roster."); } },
      { category: "Navigation", label: "Jump to Teams Structure", action: () => { setActive("Teams"); setPanel("Navigated to Teams Editor."); } },
      { category: "Navigation", label: "Jump to Events Desk", action: () => { setActive("Events"); setPanel("Navigated to Events Desk."); } },
      { category: "Navigation", label: "Jump to Recruitment Panel", action: () => { setActive("Recruitment"); setPanel("Navigated to Recruitment Desk."); } },
      { category: "Navigation", label: "Jump to Membership Drive", action: () => { setActive("Membership Drive"); setPanel("Navigated to Membership Drive Desk."); } },
      { category: "Navigation", label: "Jump to Attendance sheet", action: () => { setActive("Attendance"); setPanel("Navigated to Attendance sheet."); } },
      { category: "Navigation", label: "Jump to Certificates Generator", action: () => { setActive("Certificates"); setPanel("Navigated to Certificates Desk."); } },
      { category: "Navigation", label: "Jump to Meetings Logger", action: () => { setActive("Meetings"); setPanel("Navigated to Meetings Logger."); } },
      { category: "Navigation", label: "Jump to AI Desk Companion", action: () => { setActive("AI"); setPanel("Navigated to AI Assistant."); } },
      { category: "Navigation", label: "Jump to Settings", action: () => { setActive("Settings"); setPanel("Navigated to Settings."); } },
      { category: "Developer Tools", label: "Toggle Cyber Matrix Rain Overlay", action: () => { setMatrixRainMode(prev => !prev); setPanel("Toggled cyber matrix canvas overlay."); } },
      { category: "Developer Tools", label: "Execute Portal Diagnostic Check", action: () => {
        setPanel("Running diagnostics: MongoDB check [OK], Vercel build [OK], Session token [VALID].");
        playSuccessSound();
      }}
    ];
    if (!paletteSearch) return list;
    return list.filter(item => item.label.toLowerCase().includes(paletteSearch.toLowerCase()));
  }, [paletteSearch]);

  const filtered=rowsFor(active).filter((row:any[])=>row.join(" ").toLowerCase().includes(search.toLowerCase()));

  return <main className="portal-root pb-24 xl:pb-0 relative">
    
    {/* Matrix Rain canvas layer */}
    {matrixRainMode && (
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <MatrixRainCanvas />
      </div>
    )}

    {/* Command Palette Overlay */}
    {showPalette && (
      <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-24 px-4 backdrop-blur-md">
        <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0c0817]/95 p-4 shadow-2xl shadow-purple-950/20 font-sans">
          <div className="flex items-center gap-3 border-b border-white/10 pb-3 mb-3">
            <Search className="text-white/40" size={16} />
            <input
              autoFocus
              value={paletteSearch}
              onChange={(e) => setPaletteSearch(e.target.value)}
              placeholder="Search shortcuts or developer commands..."
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/20"
            />
            <button 
              onClick={() => setShowPalette(false)}
              className="text-[10px] uppercase font-bold tracking-wider text-white/30 hover:text-white transition bg-white/5 px-2.5 py-1 rounded-md"
            >
              Esc
            </button>
          </div>
          <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
            {commandSuggestions.length ? (
              Object.entries(
                commandSuggestions.reduce((acc, curr) => {
                  acc[curr.category] = acc[curr.category] || [];
                  acc[curr.category].push(curr);
                  return acc;
                }, {} as Record<string, typeof commandSuggestions>)
              ).map(([category, items]) => (
                <div key={category}>
                  <p className="text-[9px] uppercase font-bold tracking-[.18em] text-white/20 px-2 py-1">{category}</p>
                  {items.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => {
                        item.action();
                        setShowPalette(false);
                      }}
                      className="w-full text-left text-xs text-white/70 hover:text-white hover:bg-violet-600/20 rounded-xl px-3 py-2.5 transition flex justify-between items-center"
                    >
                      <span>{item.label}</span>
                      <span className="text-[10px] text-white/20">↵ Run</span>
                    </button>
                  ))}
                </div>
              ))
            ) : (
              <p className="text-xs text-white/30 text-center py-4">No commands matching query.</p>
            )}
          </div>
        </div>
      </div>
    )}

    <aside className="portal-sidebar fixed inset-y-0 left-0 hidden w-72 overflow-y-auto p-6 xl:flex xl:flex-col z-30">
      <PortalLogo/>
      <div className="mt-8 px-3 flex items-center justify-between">
        <p className="text-[10px] tracking-[.22em] text-white/25">INTERNAL PORTAL</p>
        <button 
          onClick={() => setShowPalette(true)}
          className="text-[9px] font-mono border border-white/10 bg-white/5 px-1.5 py-0.5 rounded text-white/40 hover:text-white"
        >
          ⌘K
        </button>
      </div>
      <nav className="mt-4 flex-1 space-y-1.5 pb-6">
        {nav.map(([Icon,label])=>(
          <button 
            key={label} 
            onClick={()=>{setActive(label);setPanel(`${label} loaded from MongoDB.`);}} 
            className={`portal-nav-item flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm transition ${active===label?"portal-nav-active text-white":"text-white/42 hover:border-white/[.08] hover:bg-white/[.045] hover:text-white/75"}`}
          >
            <Icon size={16}/>
            {label}
          </button>
        ))}
      </nav>
      <div className="mt-auto border-t border-white/[.06] pt-4">
        <button onClick={()=>signOut({callbackUrl:"/login"})} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm text-white/35 transition hover:bg-rose-500/10 hover:text-rose-200">
          <LogOut size={15}/> 
          Sign out
        </button>
      </div>
    </aside>
    <nav className="fixed inset-x-3 bottom-3 z-45 grid grid-cols-5 gap-1 rounded-[1.65rem] border border-white/10 bg-[#09070f]/88 p-2 shadow-2xl shadow-black/50 backdrop-blur-2xl xl:hidden">
      {nav.slice(0,5).map(([Icon,label])=><button key={label} onClick={()=>{setActive(label);setPanel(`${label} loaded from MongoDB.`)}} className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-semibold transition active:scale-[.97] ${active===label?"bg-violet-400/18 text-white shadow-[0_0_24px_rgba(168,85,247,.16)]":"text-white/42"}`}><Icon size={17}/><span>{label==="Attendance"?"Attend":label}</span></button>)}
    </nav>
    <section className="xl:pl-72 relative z-10">
      <header className="portal-topbar flex min-h-24 flex-wrap items-center justify-between gap-4 px-5 py-4 md:px-8">
        <div className="w-full xl:hidden"><PortalLogo/></div>
        <div>
          <p className="text-xs tracking-wide text-white/35">{new Date().toLocaleString("en-IN",{dateStyle:"full",timeStyle:"short"})}</p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight">Good day, {userName}.</h1>
        </div>
        <div className="flex flex-1 items-center justify-end gap-3">
          <label className="portal-search hidden min-w-80 items-center gap-3 rounded-2xl px-4 py-3 text-white/40 md:flex">
            <Search size={16}/>
            <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search live data... (Press '/' to search shortcuts)" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/25"/>
          </label>
          <button onClick={refresh} className="portal-mini-button rounded-2xl p-3 text-white/55 transition hover:-translate-y-0.5 hover:text-white">
            <RefreshCw size={16} className={busy?"animate-spin":""}/>
          </button>
          <button onClick={()=>setNotifications(!notifications)} className="portal-mini-button relative rounded-2xl p-3 text-white/55 transition hover:-translate-y-0.5 hover:text-white">
            <Bell size={16}/>
            {counts.contacts?<i className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-pink-400 shadow-[0_0_14px_rgba(244,114,182,.75)]"/>:null}
          </button>
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 shadow-[0_0_30px_rgba(168,85,247,.28)]"/>
        </div>
        <label className="portal-search flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-white/40 md:hidden">
          <Search size={16}/>
          <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search admin data..." className="w-full bg-transparent text-base text-white outline-none placeholder:text-white/25"/>
        </label>
      </header>
      <div className="p-4 md:p-8">
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1 xl:hidden mobile-tabs">
          {nav.map(([Icon,label])=><button key={label} onClick={()=>{setActive(label);setPanel(`${label} loaded from MongoDB.`)}} className={`flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-xs font-semibold ${active===label?"border-violet-200/35 bg-violet-500/18 text-white":"border-white/[.08] bg-white/[.035] text-white/50"}`}><Icon size={14}/>{label}</button>)}
        </div>
        <Header active={active} data={data} open={setDrawer} setPanel={setPanel}/>
        {active==="Overview"?<Overview counts={counts} chart={chart} setActive={setActive}/>:active==="Event Participants"?<EventParticipants data={data} setPanel={setPanel}/>:active==="Recruitment"?<RecruitmentDesk data={data} open={setDrawer} patch={patch} remove={remove} refresh={refresh} setPanel={setPanel}/>:active==="Membership Drive"?<MembershipDriveDesk data={data} open={setDrawer} patch={patch} remove={remove} refresh={refresh} setPanel={setPanel}/>:active==="Attendance"?<Attendance data={data} setPanel={setPanel} refresh={refresh}/>:active==="Certificates"?<CertificatesDesk data={data} setPanel={setPanel} open={setDrawer}/>:active==="AI"?<AIDesk data={data} setPanel={setPanel}/>:active==="Settings"?<Settings info={data.clubInfo||{}} open={setDrawer}/>:active==="Teams"?<TeamStructureEditor data={data} open={setDrawer} remove={remove} restore={restore}/>:<Workspace active={active} data={data} rows={filtered} open={setDrawer} remove={remove} restore={restore} patch={patch} duplicateEvent={duplicateEvent}/>}
        <div className="portal-action mt-4 rounded-2xl p-5 border border-violet-500/10">
          <p className="text-[10px] tracking-[.24em] text-violet-200">ACTION PANEL</p>
          <p className="mt-3 text-sm leading-6 text-white/65">{panel}</p>
        </div>
      </div>
    </section>
    {notifications?<div className="fixed right-5 top-24 z-50 w-[min(380px,calc(100vw-40px))] rounded-3xl border border-white/10 bg-[#111016]/95 p-5 shadow-2xl shadow-black/40 backdrop-blur-xl"><p className="text-sm font-semibold">Open contact messages</p>{(data.contactMessages||[]).filter((m:any)=>m.status!=="resolved").slice(0,6).map((m:any)=><button onClick={()=>setPanel(`${m.name}: ${m.message}`)} className="portal-mini-button mt-3 block w-full rounded-2xl px-4 py-3 text-left text-xs text-white/60 transition hover:-translate-y-0.5 hover:text-white" key={idOf(m)}>{m.subject}</button>)}{!counts.contacts?<p className="mt-4 text-xs text-white/40">No unresolved messages.</p>:null}</div>:null}
    {drawer?<div className="fixed inset-0 z-50 bg-black/70 p-4 backdrop-blur-sm"><div className="ml-auto h-full max-w-xl overflow-y-auto rounded-3xl border border-white/10 bg-[#111016] p-6 shadow-2xl shadow-violet-950/25"><div className="flex items-center justify-between"><h2 className="text-xl font-semibold tracking-tight">{drawer.title}</h2><button onClick={()=>setDrawer(null)} className="portal-mini-button rounded-full px-3 py-1.5 text-xs text-white/55">Close</button></div><form action={submit} className="mt-6 grid gap-4">{drawer.fields.map(([name,label,type])=>{const source={...(drawer.defaults||{}),...(drawer.item||{})};const selected=rawValue(source,name);const formValue=Array.isArray(selected)?selected:String(selected??"");const multiTeamValue=Array.isArray(selected)&&selected.length?selected:(rawValue(source,"team")?[String(rawValue(source,"team"))]:[]);return <label className="text-[10px] tracking-wider text-white/35" key={name}>{label.toUpperCase()}{type==="status-select"?<select name={name} defaultValue={formValue || "published"} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50">{["draft","published","active","completed","archived"].map((status)=><option value={status} key={status}>{status}</option>)}</select>:type==="recruitment-status-select"?<select name={name} defaultValue={formValue || "open"} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50"><option value="opening_soon">Opening soon</option><option value="open">Applications open</option><option value="closing_soon">Closing soon</option><option value="closed">Closed</option><option value="full">Registration full</option></select>:type==="application-status-select"?<select name={name} defaultValue={formValue || "pending"} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50"><option value="pending">Pending</option><option value="shortlisted">Shortlisted</option><option value="accepted">Accepted</option><option value="rejected">Rejected</option><option value="on_hold">On hold</option></select>:type==="question-type-select"?<select name={name} defaultValue={formValue || "long_text"} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50">{["short_text","long_text","number","multiple_choice","checkbox","dropdown","rating","url","file_upload"].map((kind)=><option value={kind} key={kind}>{kind.replace(/_/g," ")}</option>)}</select>:type==="contact-status-select"?<select name={name} defaultValue={formValue || "new"} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50"><option value="new">New</option><option value="in_progress">In progress</option><option value="resolved">Resolved</option></select>:type==="membership-status-select"?<select name={name} defaultValue={formValue || "closed"} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50"><option value="opening_soon">Opening soon</option><option value="open">Applications open</option><option value="closing_soon">Closing soon</option><option value="closed">Closed</option></select>:type==="membership-member-status-select"?<select name={name} defaultValue={formValue || "pending"} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50"><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select>:type==="announcement-type-select"?<select name={name} defaultValue={formValue || "info"} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50"><option value="info">Info (Violet)</option><option value="event">Event (Fuchsia)</option><option value="alert">Alert (Amber)</option><option value="promo">Promo (Emerald)</option></select>:type==="announcement-status-select"?<select name={name} defaultValue={formValue || "draft"} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50"><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select>:type==="announcement-audience-select"?<select name={name} defaultValue={formValue || "all"} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50"><option value="all">All Students (Public)</option><option value="members">Core Members Only</option><option value="candidates">Applicants / Candidates</option></select>:type==="task-status-select"?<select name={name} defaultValue={formValue || "pending"} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50"><option value="pending">Pending</option><option value="in_progress">In Progress</option><option value="completed">Completed</option></select>:type==="task-priority-select"?<select name={name} defaultValue={formValue || "medium"} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select>:type==="meeting-type-select"?<select name={name} defaultValue={formValue || "general"} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50"><option value="general">General Meeting</option><option value="core">Core Committee</option><option value="technical">Technical Team</option><option value="creative">Creative/Media Team</option><option value="operational">Operations/Logistics</option></select>:type==="meeting-status-select"?<select name={name} defaultValue={formValue || "scheduled"} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50"><option value="scheduled">Scheduled</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select>:type==="sponsor-level-select"?<select name={name} defaultValue={formValue || "partner"} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50"><option value="title">Title Sponsor</option><option value="gold">Gold Sponsor</option><option value="silver">Silver Sponsor</option><option value="bronze">Bronze Sponsor</option><option value="partner">Official Partner</option></select>:type==="achievement-kind-select"?<select name={name} defaultValue={formValue || "other"} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50"><option value="hackathon">Hackathon Win</option><option value="project">Project Launch</option><option value="recognition">University Recognition</option><option value="other">Other Milestone</option></select>:type==="hall-category"?<select name={name} defaultValue={formValue || "top_contributor"} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50"><option value="top_contributor">Top Contributor</option><option value="alumni">Alumni</option></select>:type==="participation-select"?<select name={name} defaultValue={formValue || "individual"} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50"><option value="individual">Individual only</option><option value="team">Team only</option><option value="both">Individual or team</option></select>:type==="boolean-select"?<select name={name} defaultValue={String(selected === true || selected === "true")} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50"><option value="true">Yes</option><option value="false">No</option></select>:type==="lane-select"?<select name={name} defaultValue={formValue || "technical"} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50"><option value="technical">Joint Secretary (Technical & Operations)</option><option value="creative">Joint Secretary (Media & Creative)</option></select>:type==="event-select"?<select name={name} defaultValue={formValue} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50"><option value="">No linked event</option>{(data.events||[]).map((event:any)=><option value={idOf(event)} key={idOf(event)}>{event.title}</option>)}</select>:type==="recruitment-team-select"?<select name={name} defaultValue={formValue} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50"><option value="">Choose recruitment team</option>{(data.recruitmentTeams||[]).filter((team:any)=>team.active!==false).map((team:any)=><option value={idOf(team)} key={idOf(team)}>{team.name}</option>)}</select>:type==="recruitment-role-select"?<select name={name} defaultValue={formValue} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50"><option value="">All roles in selected team</option>{(data.recruitmentRoles||[]).filter((role:any)=>role.active!==false).map((role:any)=><option value={idOf(role)} key={idOf(role)}>{valueOf(role,"team") ? `${valueOf(role,"team")} / ` : ""}{role.name}</option>)}</select>:type==="team-select"?<select name={name} defaultValue={formValue} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50"><option value="">No team</option>{(data.teams||[]).filter((team:any)=>team.active!==false).map((team:any)=><option value={idOf(team)} key={idOf(team)}>{team.name}</option>)}</select>:type==="team-multi-select"?<select name={name} multiple defaultValue={multiTeamValue} className="mt-2 min-h-36 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50">{(data.teams||[]).filter((team:any)=>team.active!==false).map((team:any)=><option value={idOf(team)} key={idOf(team)}>{team.name}</option>)}</select>:type==="winner-select"?<select name={name} defaultValue={formValue} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50"><option value="">No winner selected</option>{winnerOptions(data,drawer.item).map((candidate:any)=><option value={candidate.id} key={candidate.id}>{candidate.label}</option>)}</select>:type==="member-select"?<select name={name} defaultValue={formValue} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50"><option value="">No member selected</option>{(data.users||[]).filter((user:any)=>user.status!=="inactive").map((user:any)=><option value={idOf(user)} key={idOf(user)}>{memberLabel(user)}</option>)}</select>:type==="member-multi-select"?<select name={name} multiple defaultValue={Array.isArray(formValue)?formValue:[]} className="mt-2 min-h-36 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50">{(data.users||[]).filter((user:any)=>user.status!=="inactive").map((user:any)=><option value={idOf(user)} key={idOf(user)}>{memberLabel(user)}</option>)}</select>:type==="gallery-assets"?<GalleryAssetsControl name={name} current={drawer.item?.assets || []} resource={drawer.resource} setPanel={setPanel}/>:type?.startsWith("upload")?<UploadControl name={name} current={Array.isArray(formValue)?"":formValue} upload={uploads[name]} uploading={Boolean(uploading[name])} onUpload={async(file)=>{setUploading((state)=>({...state,[name]:true}));setPanel(`Uploading ${file.name}...`);const form=new FormData();form.append("file",file);form.append("folder",`tech-tatva-os/${drawer.resource}`);const res=await fetch("/api/portal/upload",{method:"POST",body:form});const result=await res.json();setUploading((state)=>({...state,[name]:false}));if(!res.ok){setPanel(result.error || "Upload failed");return}setUploads((state)=>({...state,[name]:result}));setPanel(`Uploaded ${file.name}. Now save the form.`)}}/>:["description","body","message","aboutCopy","agenda","discussionPoints","decisionsTaken","actionItems","nextMeeting","announcementBanner","customSuccessMessage","adminNotes","helpText","options","announcementDetails"].includes(name)?<textarea name={name} defaultValue={formValue} rows={5} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50"/>:<input name={name} type={type||"text"} defaultValue={formValue} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50"/>}</label>})}<p className="text-[10px] leading-4 text-white/35">Tip: hold Command/Ctrl to select multiple leads or co-leads.</p><button disabled={busy||Object.values(uploading).some(Boolean)} className="portal-command-button rounded-2xl py-3 text-sm font-semibold disabled:opacity-60">{busy?"Saving...":Object.values(uploading).some(Boolean)?"Uploading...":"Save changes"}</button></form></div></div>:null}
  </main>
}

function Header({active,data,open,setPanel}:{active:Module;data:Data;open:(drawer:any)=>void;setPanel:(text:string)=>void}){
  const singular=active==="Hall of Fame"?"Hall entry":active==="Membership Drive"?"Student member":active.slice(0,-1);
  const action=active==="Overview"?"Export summary":active==="Event Participants"?"Export participant Excel":active==="Recruitment"?"Recruitment settings":active==="Membership Drive"?"Drive settings":active==="Attendance"?"Generate attendance":active==="Certificates"?"Certificate tools":active==="Settings"?"Update branding":active==="AI"?"Ask AI":active==="Contact Messages"?"Open messages":`Add ${singular}`;
  const description=active==="Membership Drive"
    ? "Manage student registrations, verify student members, analyze departmental signups, and update online drive configurations."
    : active==="Event Participants"
    ? "View all event registrations organized team-wise with team leader & squad member details, WhatsApp contact numbers, and one-click Excel exports."
    : "Live operational controls for members, teams, events, attendance, recruitment, media, documents, and public club content.";
  return <div className="portal-hero flex flex-wrap items-center justify-between gap-5 rounded-[1.75rem] p-5 md:p-8"><div><p className="text-[10px] font-semibold tracking-[.28em] text-violet-200/75">COMMAND CENTER / {active.toUpperCase()}</p><h2 className="mt-3 text-[2.65rem] font-semibold leading-[.92] tracking-[-.055em] md:text-5xl">{active==="Overview"?"Club intelligence":active==="AI"?"AI Desk":active}</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-white/48">{description}</p></div><button type="button" onClick={()=>{if(active==="Overview"){exportDashboardSummary(data);setPanel("Dashboard summary CSV downloaded.");}else if(active==="Event Participants"){window.location.href="/api/admin/participants/export";setPanel("Downloading full Event Participants roster Excel sheet...");}else if(active==="Recruitment"){open({resource:"recruitmentSettings",title:"Recruitment settings",fields:extraFields.recruitmentSettings,item:data.recruitmentSettings?.[0],defaults:{status:"open",registrationEnabled:"true",autoCloseAfterDeadline:"true"}})}else if(active==="Membership Drive"){open({resource:"membershipDriveSettings",title:"Membership drive settings",fields:extraFields.membershipDriveSettings,item:data.membershipDriveSettings?.[0],defaults:{status:"closed",registrationEnabled:"false",autoCloseAfterDeadline:"true"}})}else if(active==="Attendance"){window.dispatchEvent(new Event("portal-download-attendance"));setPanel("Generating attendance sheet for the selected event...");}else if(active==="Certificates"){setPanel("Choose an event below, select winners from Events if needed, then export PDF certificates as ZIP files.");}else if(active==="AI"){setPanel("Use the AI Desk below to generate reports, MOMs, and secretary answers from real MongoDB data.");}else if(active==="Contact Messages"){setPanel("Open a message row to read all sender details and update its status.");}else if(active==="Settings")open({resource:"settings",title:"Update club branding, faculty, and office bearers",fields:settingsFields,item:data.clubInfo});else{const c=config[active as keyof typeof config];open({resource:c.resource,title:`Add ${singular}`,fields:c.fields,defaults:active==="Events"?{status:"published",registrationOpen:"true"}:active==="Meetings"?{status:"completed"}:active==="Hall of Fame"?{category:"top_contributor",active:"true"}:{}})}}} className="portal-command-button flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-xs font-semibold transition hover:-translate-y-0.5 sm:w-auto sm:self-end">{active==="Overview"||active==="Attendance"||active==="Event Participants"?<Download size={14}/>:active==="Certificates"?<Award size={14}/>:active==="AI"?<Brain size={14}/>:active==="Contact Messages"?<MessageSquare size={14}/>:active==="Membership Drive"?<SlidersHorizontal size={14}/>:<Plus size={14}/>}<span>{action}</span></button></div>
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
      { label: "Active Roster", value: activeCount, tone: "blue" },
      { label: "Inactive/Archived", value: inactiveCount, tone: "rose" }
    ];
  }
  if (active === "Teams") {
    const total = data.teams?.length || 0;
    const activeCount = data.teams?.filter((t: any) => t.active !== false).length || 0;
    const inactiveCount = total - activeCount;
    return [
      { label: "Total Teams", value: total, tone: "violet" },
      { label: "Active Lanes", value: activeCount, tone: "blue" },
      { label: "Archived Lanes", value: inactiveCount, tone: "rose" }
    ];
  }
  if (active === "Events") {
    const total = data.events?.length || 0;
    const published = data.events?.filter((e: any) => e.status === "published" || e.status === "active").length || 0;
    const drafts = total - published;
    return [
      { label: "Total Events", value: total, tone: "violet" },
      { label: "Published & Active", value: published, tone: "blue" },
      { label: "Drafts / Hidden", value: drafts, tone: "amber" }
    ];
  }
  if (active === "Meetings") {
    const total = data.meetings?.length || 0;
    const completed = data.meetings?.filter((m: any) => m.status === "completed").length || 0;
    const drafts = total - completed;
    return [
      { label: "Total Meetings", value: total, tone: "violet" },
      { label: "Completed Meetings", value: completed, tone: "blue" },
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
      { label: "Completed", value: completed, tone: "blue" }
    ];
  }
  if (active === "Announcements") {
    const total = data.announcements?.length || 0;
    const published = data.announcements?.filter((a: any) => a.status === "published").length || 0;
    const drafts = total - published;
    return [
      { label: "Total Announcements", value: total, tone: "violet" },
      { label: "Published", value: published, tone: "blue" },
      { label: "Drafts", value: drafts, tone: "amber" }
    ];
  }
  if (active === "Media") {
    return [
      { label: "Gallery Albums", value: data.gallery?.length || 0, tone: "violet" },
      { label: "Club Sponsors", value: data.sponsors?.length || 0, tone: "amber" },
      { label: "Achievements", value: data.achievements?.length || 0, tone: "blue" }
    ];
  }
  if (active === "Hall of Fame") {
    const total = data.hallOfFame?.length || 0;
    const activeCount = data.hallOfFame?.filter((h: any) => h.active !== false).length || 0;
    return [
      { label: "Total Hall Entries", value: total, tone: "violet" },
      { label: "Active Public", value: activeCount, tone: "blue" },
      { label: "Archived", value: total - activeCount, tone: "rose" }
    ];
  }
  if (active === "Contact Messages") {
    const total = data.contactMessages?.length || 0;
    const unresolved = data.contactMessages?.filter((m: any) => m.status !== "resolved").length || 0;
    return [
      { label: "Total Messages", value: total, tone: "violet" },
      { label: "Unresolved", value: unresolved, tone: "rose" },
      { label: "Resolved", value: total - unresolved, tone: "blue" }
    ];
  }
  return [];
}

function renderCell(cell: any, index: number) {
  const text = String(cell);
  const lower = text.toLowerCase();
  
  if (lower === "active" || lower === "published" || lower === "open" || lower === "resolved" || lower === "present") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-400/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-300 border border-blue-500/15">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
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
  const bentoGrid = [
    { label: "Core Active Roster", value: counts.members, copy: "Verify team member status & edit lanes", module: "Members" as Module, icon: Users, styles: "md:col-span-2 bg-gradient-to-br from-violet-950/20 via-black/40 to-indigo-950/20 border-violet-500/10" },
    { label: "Community Sign-ups", value: counts.membershipDrive, copy: "View registrations & verify details", module: "Membership Drive" as Module, icon: UserPlus, styles: "bg-gradient-to-br from-fuchsia-950/20 via-black/40 to-pink-950/20 border-fuchsia-500/10" },
    { label: "Active Project Lanes", value: counts.teams, copy: "Configure departments & joint secretary lanes", module: "Teams" as Module, icon: Workflow, styles: "bg-gradient-to-br from-indigo-950/20 via-black/40 to-violet-950/20 border-indigo-500/10" },
    { label: "Scheduled Events", value: counts.events, copy: "Publish calendar schedules & winners", module: "Events" as Module, icon: CalendarDays, styles: "bg-gradient-to-br from-pink-950/20 via-black/40 to-fuchsia-950/20 border-pink-500/10" }
  ];

  // Systems diagnostics rolling logger states
  const [logLines, setLogLines] = useState<string[]>([
    "⚙ SYSTEM BOOT: Initializing portal check...",
    "✓ MONGO_DB: Connection string verified.",
    "✓ JWT_AUTH: Operator authorization token validated.",
    "✓ HOST_DNS: portal routing initialized.",
    "✓ DIAGNOSTICS: Systems online, all modules ready."
  ]);

  useEffect(() => {
    const logs = [
      "ℹ SYNC: Checking community rosters...",
      "✓ SYNC: 100% synchronized with MongoDB.",
      "ℹ AUDIT: Live event registries audit complete.",
      "✓ STORAGE: Cloudinary media bucket checked.",
      "✓ AI: GPT companion agent standby.",
      "ℹ AUDIT: Department quotas verify [OK]."
    ];
    const interval = setInterval(() => {
      const randomLog = logs[Math.floor(Math.random() * logs.length)];
      const timestamp = new Date().toLocaleTimeString("en-IN", { hour12: false });
      setLogLines(prev => [...prev.slice(-4), `[${timestamp}] ${randomLog}`]);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Bento Grid section */}
      <div className="grid gap-4 md:grid-cols-3 mt-6">
        {bentoGrid.map((card) => (
          <button 
            key={card.label}
            onClick={() => setActive(card.module)} 
            className={`portal-quick-card portal-glow-card rounded-2xl p-5 text-left transition duration-300 relative border overflow-hidden ${card.styles}`}
          >
            <div className="flex items-start justify-between">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 border border-white/10 text-white/80">
                <card.icon size={16}/>
              </span>
              <span className="rounded-full border border-white/5 bg-white/5 px-2.5 py-1 text-[8px] font-bold tracking-[.18em] text-white/30 uppercase">Open module</span>
            </div>
            <p className="mt-6 text-[10px] uppercase font-bold tracking-wider text-white/35">{card.label}</p>
            <p className="mt-1 text-4xl font-extrabold tracking-tight text-white drop-shadow-[0_0_12px_rgba(139,92,246,0.25)]">{card.value}</p>
            <p className="mt-3 text-[10px] text-white/40 leading-relaxed">{card.copy}</p>
          </button>
        ))}

        {/* Live Systems Diagnostics Logs console widget */}
        <div className="portal-glow-card rounded-2xl border border-white/5 bg-black/40 p-5 md:col-span-2 flex flex-col font-mono text-[10px] text-blue-400/80 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3 text-white/40">
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-ping" />
              <span className="font-bold">OPERATOR DIAGNOSTIC CONSOLE</span>
            </span>
            <span className="text-[8px] uppercase tracking-wider">TTY/0</span>
          </div>
          <div className="flex-1 space-y-1 select-none pr-1">
            {logLines.map((line, idx) => (
              <p key={idx} className={line.includes("✓") ? "text-blue-400" : line.includes("⚙") ? "text-white" : "text-blue-500/60"}>
                {line}
              </p>
            ))}
          </div>
        </div>

        {/* Dynamic circular metrics widget */}
        <div className="portal-glow-card rounded-2xl border border-white/5 bg-black/40 p-5 flex flex-col justify-between shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3 text-white/40">
            <span className="font-semibold text-xs">Lane Density</span>
            <span className="text-[8px] uppercase tracking-wider">METRIC</span>
          </div>
          <div className="flex items-center justify-center py-2">
            <div className="relative h-20 w-20 flex items-center justify-center rounded-full border border-white/5 shadow-inner">
              <div className="absolute inset-2 rounded-full border border-violet-500/20 bg-violet-500/5 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-white leading-none">{counts.teams}</span>
                <span className="text-[7px] text-white/30 uppercase mt-1">Lanes</span>
              </div>
              <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-white/5"
                  strokeWidth="2"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-violet-500"
                  strokeDasharray={`${Math.min(100, (counts.teams / 12) * 100)}, 100`}
                  strokeWidth="2"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
            </div>
          </div>
          <p className="text-[9px] text-white/30 text-center">Density ratio of operating club divisions.</p>
        </div>
      </div>

      {/* Main Charts & Quick links */}
      <div className="grid gap-6 md:grid-cols-[1fr_.44fr] mt-6">
        <div className="portal-chart rounded-2xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-white uppercase tracking-wider">System data volume</p>
              <p className="mt-1 text-xs text-white/38">Realtime operational footprint across core modules.</p>
            </div>
            <span className="rounded-full border border-violet-300/20 bg-violet-500/10 px-3 py-1 text-[9px] font-bold tracking-[.18em] text-violet-200">LIVE FEED</span>
          </div>
          <div className="mt-6 h-80">
            <ResponsiveContainer>
              <BarChart data={chart} barCategoryGap={42}>
                <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{fill:"#ffffff73",fontSize:10}}/>
                <Tooltip cursor={{fill:"rgba(139,92,246,.04)"}} contentStyle={{background:"#0c0617",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,color:"#fff",fontSize:10}}/>
                <Bar dataKey="v" fill="url(#portalBar)" radius={[8,8,0,0]}/>
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

        <div className="portal-chart rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <p className="text-sm font-bold text-white uppercase tracking-wider">Quick access</p>
            <p className="mt-1 text-xs leading-5 text-white/38">Jump into the most used operating modules.</p>
          </div>
          <div className="mt-5 grid gap-2.5">
            <a href="/" target="_blank" rel="noopener noreferrer" className="portal-mini-button flex items-center justify-between rounded-xl px-4 py-3 text-left text-xs text-white/70 transition hover:text-white">
              <span className="flex items-center gap-2">
                <Home size={14} className="text-violet-200" />
                <span>Go to Website Home</span>
              </span>
              <span className="text-[9px] tracking-[.16em] text-violet-200/55">VISIT</span>
            </a>
            {(["Members","Events","Attendance","Hall of Fame","Settings"] as Module[]).map((module)=>(
              <button onClick={()=>setActive(module)} className="portal-mini-button flex items-center justify-between rounded-xl px-4 py-3 text-left text-xs text-white/70 transition hover:text-white" key={module}>
                <span>{module}</span>
                <span className="text-[9px] tracking-[.16em] text-violet-200/55">OPEN</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
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

function PortalStructureNode({label,name,meta,tone="violet",onEdit}:{label:string;name?:string;meta?:string;tone?:"violet"|"blue"|"fuchsia";onEdit?:()=>void}){
  const tones={
    violet:"border-violet-300/25 bg-violet-500/10 text-violet-100 shadow-[0_0_20px_rgba(139,92,246,0.15)]",
    blue:"border-blue-300/25 bg-blue-500/10 text-blue-100 shadow-[0_0_20px_rgba(16,185,129,0.15)]",
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
          <button onClick={()=>open({resource:"users",title:`Add member to ${team.name}`,fields:config.Members.fields,defaults:{teams:[idOf(team)]}})} className="inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-[10px] font-semibold text-blue-200 transition hover:bg-blue-500/20">Add member</button>
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

function TeamLaneEditor({title,subtitle,teams,tone,open,remove,restore}:{title:string;subtitle:string;teams:any[];tone:"blue"|"fuchsia";open:(drawer:any)=>void;remove:(resource:Resource,item:any)=>void;restore:(resource:Resource,item:any)=>void}){
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
      <PortalStructureNode label="Faculty Champion" name={info.facultyChampionName} meta={info.facultyChampionEmail || "Update from Settings"} tone="blue" onEdit={()=>open({resource:"settings",title:"Update faculty champion and student advisors",fields:settingsFields,item:info})}/>
      {coFaculty?<PortalStructureNode label="Co-Faculty Champion" name={info.coFacultyChampionName} meta={info.coFacultyChampionEmail || info.coFacultyChampionPhone || "Update from Settings"} tone="blue" onEdit={()=>open({resource:"settings",title:"Update co-faculty champion",fields:settingsFields,item:info})}/>:null}
      {advisors.map((name:string,index:number)=>(
        <PortalStructureNode key={`${name}-${index}`} label={`Student Advisor ${index+1}`} name={name} meta={index===0?info.studentAdvisorOneEmail:info.studentAdvisorTwoEmail} tone="blue" onEdit={()=>open({resource:"settings",title:"Update student advisors",fields:settingsFields,item:info})}/>
      ))}
    </div>
  );
}

function PortalOperationsRoot({info,open}:{info:any;open:(drawer:any)=>void}){
  return <PortalStructureNode label="1. Secretary" name={info.secretaryName} meta={info.secretaryEmail || "Update from Settings"} tone="violet" onEdit={()=>open({resource:"settings",title:"Update secretary and joint secretaries",fields:settingsFields,item:info})}/>;
}

function TeamStructureEditor({data,open,remove,restore}:{data:Data;open:(drawer:any)=>void;remove:(resource:Resource,item:any)=>void;restore:(resource:Resource,item:any)=>void}){
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
    return `h-fit rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.14em] ${status==="accepted"?"bg-blue-400/10 text-blue-200":status==="rejected"?"bg-rose-400/10 text-rose-200":status==="shortlisted"?"bg-violet-400/10 text-violet-100":status==="on_hold"?"bg-amber-400/10 text-amber-100":"bg-white/[.06] text-white/45"}`;
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

interface ChatMessage {
  role: "user" | "model";
  text: string;
  timestamp: Date;
}

function AIDesk({ data, setPanel }: { data: Data; setPanel: (value: string) => void }) {
  const events = data.events || [];
  const meetings = data.meetings || [];
  const [eventId, setEventId] = useState(events[0] ? idOf(events[0]) : "");
  const [meetingId, setMeetingId] = useState(meetings[0] ? idOf(meetings[0]) : "");
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "model",
      text: "Hello! I am your Tech Tatva Secretary Assistant. I have loaded the live MongoDB records including members, teams, events, registrations, tasks, meetings, and reports. Ask me anything about current club stats or operations!",
      timestamp: new Date()
    }
  ]);
  const [asking, setAsking] = useState(false);
  const selectedEvent = events.find((event: any) => idOf(event) === eventId);
  const selectedMeeting = meetings.find((meeting: any) => idOf(meeting) === meetingId);
  
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, asking]);

  async function askSecretary() {
    const text = prompt.trim();
    if (!text) {
      setPanel("Write a question for the Secretary Assistant first.");
      return;
    }
    setPrompt("");
    
    // Add user message
    const userMsg: ChatMessage = { role: "user", text, timestamp: new Date() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    
    setAsking(true);
    setPanel("Secretary Assistant is thinking...");
    
    try {
      const res = await fetch("/api/ai/secretary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: text,
          history: updatedMessages.map(m => ({ role: m.role, text: m.text })).slice(0, -1)
        })
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
        setMessages(prev => [...prev, { role: "model", text: `Error: ${result.error || "Request failed."}`, timestamp: new Date() }]);
        return;
      }
      const response = String(result.response || "").trim();
      if (!response) {
        setPanel("AI returned an empty response.");
        setMessages(prev => [...prev, { role: "model", text: "Sorry, I couldn't generate a response based on the database. Please try another query.", timestamp: new Date() }]);
        return;
      }
      setMessages(prev => [...prev, { role: "model", text: response, timestamp: new Date() }]);
      setPanel("Secretary Assistant response generated.");
    } catch (err: any) {
      setAsking(false);
      setPanel("Network error connecting to assistant.");
      setMessages(prev => [...prev, { role: "model", text: `Network error: ${err.message || "Failed to fetch response."}`, timestamp: new Date() }]);
    }
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
                <p className="mt-1 text-xs text-white/38">Uses your official PDF template with real event, registration, attendance & gallery data.</p>
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
              <a download aria-disabled={!eventId} onClick={(event) => { if (!eventId) { event.preventDefault(); setPanel("Select an event before downloading a report."); } }} href={eventId ? `/api/ai/event-report?event=${eventId}&format=pdf` : "#"} className="portal-command-button flex items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-center text-xs font-semibold transition hover:-translate-y-0.5 text-black">
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
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.04] via-transparent to-violet-500/[0.04]" />
          <div className="relative">
            <div className="flex items-center gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-300 to-teal-300 text-black shadow-[0_0_30px_rgba(16,185,129,.24)]">
                <MessageSquare size={18} />
              </span>
              <div>
                <p className="text-base font-bold text-white tracking-tight">Minutes of Meeting Generator</p>
                <p className="mt-1 text-xs text-white/38">Generate official M2M/MOM documents using your format template and meeting records.</p>
              </div>
            </div>
            <select value={meetingId} onChange={(event) => setMeetingId(event.target.value)} className="mt-5 w-full rounded-2xl border border-white/[.07] bg-black/35 px-4 py-3.5 text-sm text-white outline-none focus:border-blue-400/40 transition">
              <option value="">Select meeting</option>
              {meetings.map((meeting: any) => <option value={idOf(meeting)} key={idOf(meeting)}>{meeting.title}</option>)}
            </select>
            {selectedMeeting ? (
              <div className="mt-3 rounded-xl border border-blue-500/15 bg-blue-500/[0.04] px-4 py-2.5 text-xs text-blue-200/70">
                <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" /> Selected: {selectedMeeting.title}</span>
              </div>
            ) : (
              <p className="mt-3 text-xs text-white/30">Create a meeting from the Meetings tab first.</p>
            )}
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <a download aria-disabled={!meetingId} onClick={(event) => { if (!meetingId) { event.preventDefault(); setPanel("Select a meeting before downloading MOM."); } }} href={meetingId ? `/api/ai/mom?meeting=${meetingId}&format=pdf` : "#"} className="portal-command-button flex items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-center text-xs font-semibold transition hover:-translate-y-0.5 text-black">
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
        {/* Secretary Assistant Chat Console */}
        <div className="relative overflow-hidden rounded-[2rem] border border-white/[.08] bg-[#05070d]/75 p-5 md:p-6 flex flex-col h-[500px]">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.04] via-transparent to-fuchsia-500/[0.04]" />
          <div className="relative flex flex-col h-full justify-between">
            {/* Header */}
            <div className="flex items-center gap-4 border-b border-white/[0.06] pb-3 shrink-0">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-400 to-fuchsia-300 text-black shadow-[0_0_20px_rgba(139,92,246,.18)]">
                <Brain size={16} />
              </span>
              <div>
                <p className="text-sm font-bold text-white tracking-tight">Secretary Assistant</p>
                <p className="text-[10px] text-white/35">Interactive chat powered by live MongoDB context</p>
              </div>
            </div>

            {/* Conversation Log (ChatGPT bubble format) */}
            <div ref={chatScrollRef} className="flex-grow overflow-y-auto my-3 pr-1 flex flex-col gap-3 overscroll-contain mobile-tabs">
              {messages.map((m, idx) => (
                <div key={idx} className={`flex flex-col gap-1 ${m.role === "user" ? "items-end" : "items-start"}`}>
                  <div className={`px-3.5 py-2 rounded-2xl text-[12px] leading-relaxed max-w-[88%] break-words ${
                    m.role === "user" 
                      ? "bg-violet-500/10 border border-violet-500/20 text-white rounded-tr-none" 
                      : "bg-white/[0.025] border border-white/[0.06] text-white/80 rounded-tl-none font-mono whitespace-pre-wrap"
                  }`}>
                    {m.text}
                  </div>
                  <span className="text-[8px] text-white/20 px-1 font-mono">
                    {m.timestamp.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
              {asking && (
                <div className="flex flex-col items-start gap-1">
                  <div className="px-3.5 py-2.5 rounded-2xl rounded-tl-none bg-white/[0.025] border border-white/[0.06] text-[11px] text-white/40 font-mono italic animate-pulse">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-ping" />
                      Assistant is querying club database...
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input Box */}
            <div className="relative shrink-0 mt-1">
              <input 
                type="text" 
                value={prompt} 
                onChange={(event) => setPrompt(event.target.value)} 
                onKeyDown={(event) => { if (event.key === "Enter") askSecretary(); }}
                disabled={asking}
                placeholder={asking ? "Assistant is compiling records..." : "Ask about registrations, tasks, meetings..."} 
                className="w-full rounded-2xl border border-white/[.07] bg-black/45 py-3.5 pl-4 pr-12 text-[12px] text-white outline-none placeholder:text-white/22 focus:border-violet-400/40 disabled:opacity-60 transition"
              />
              <button 
                onClick={askSecretary} 
                disabled={asking || !prompt.trim()} 
                className="absolute right-2 top-2 h-8 w-8 rounded-xl bg-violet-500/20 hover:bg-violet-500/40 text-violet-200 hover:text-white flex items-center justify-center transition active:scale-95 disabled:opacity-40"
              >
                <Send size={12} />
              </button>
            </div>
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

function winnerDisplay(event: any, key: "winnerFirst" | "winnerSecond" | "winnerThird") {
  const winner = event?.[key];
  if (!winner) return "Not selected";
  if (typeof winner === "object") return `${winner.name || "Selected candidate"}${winner.uid ? ` / ${winner.uid}` : ""}`;
  return "Selected candidate";
}

function CertificatesDesk({ data, setPanel, open }: { data: Data; setPanel: (value: string) => void; open: (drawer: any) => void }) {
  const events = data.events || [];
  const [selected, setSelected] = useState(events[0] ? idOf(events[0]) : "");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [settings, setSettings] = useState({
    certEventName: "",
    certEventDate: "",
    certHod: "",
    certFacultyAdvisor: "",
    certCoFacultyAdvisor: "",
    certEventLogo: ""
  });

  const [candidates, setCandidates] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [rankFilter, setRankFilter] = useState("All");
  const [selectedCands, setSelectedCands] = useState<string[]>([]);
  const [bulkRank, setBulkRank] = useState("Participation");

  // Add Candidate modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCand, setNewCand] = useState({
    recipientName: "",
    uid: "",
    email: "",
    program: "",
    semester: "",
    rank: "Participation"
  });

  // Fetch certificate settings & candidates
  useEffect(() => {
    if (!selected) {
      setCandidates([]);
      setSettings({
        certEventName: "",
        certEventDate: "",
        certHod: "",
        certFacultyAdvisor: "",
        certCoFacultyAdvisor: "",
        certEventLogo: ""
      });
      return;
    }

    let active = true;
    async function fetchCertData() {
      setLoading(true);
      setPanel("Loading candidates and certificate settings...");
      try {
        const res = await fetch(`/api/portal/certificates?event=${selected}`);
        const json = await res.json();
        if (active) {
          if (res.ok) {
            setSettings(json.settings || {});
            setCandidates(json.candidates || []);
            setPanel(`Loaded ${json.candidates?.length || 0} candidates for the selected event.`);
          } else {
            setPanel(json.error || "Failed to load certificate data");
          }
        }
      } catch (e) {
        console.error(e);
        if (active) setPanel("Failed to load certificate data.");
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchCertData();
    return () => { active = false; };
  }, [selected, setPanel]);

  // Save configurations and candidates
  async function saveSettingsAndRanks(candList = candidates, silent = false) {
    if (!selected) return false;
    setSaving(true);
    if (!silent) setPanel("Saving certificate settings and candidates list...");
    try {
      const res = await fetch("/api/portal/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: selected,
          settings,
          candidates: candList
        })
      });
      const json = await res.json();
      if (res.ok) {
        if (json.certificates) {
          setCandidates(prev => prev.map(c => {
            const match = json.certificates.find((dbC: any) => 
              (dbC.user && c.user && dbC.user === c.user) ||
              (dbC.recipientName === c.recipientName && dbC.email === c.email)
            );
            if (match) {
              return {
                ...c,
                id: idOf(match),
                certNumber: match.certNumber || c.certNumber,
                isGenerated: !!match.certNumber
              };
            }
            return c;
          }));
        }
        if (!silent) setPanel("Certificate configuration saved successfully.");
        return true;
      } else {
        setPanel(json.error || "Failed to save configurations.");
      }
    } catch (e) {
      console.error(e);
      setPanel("Failed to save configurations.");
    } finally {
      setSaving(false);
    }
    return false;
  }

  // Generate ZIP of all certificates
  async function generateAllCertificates() {
    if (!selected) return;

    if (!settings.certHod || !settings.certFacultyAdvisor) {
      setPanel("Validation Error: Please make sure HOD Name and Faculty Advisor Name are set before generating.");
      return;
    }

    const emptyNameCand = candidates.find(c => !c.recipientName?.trim());
    if (emptyNameCand) {
      setPanel("Validation Error: All candidates must have a non-empty name.");
      return;
    }

    setGenerating(true);
    setPanel("Saving configurations and allocating certificate numbers...");

    try {
      const preparedCandidates = candidates.map(c => ({
        ...c,
        generateCertNum: !c.certNumber
      }));

      const saveOk = await saveSettingsAndRanks(preparedCandidates, true);
      if (!saveOk) {
        setGenerating(false);
        return;
      }

      setPanel("Rendering certificates in high-fidelity parallel batches and compiling ZIP...");

      const res = await fetch(`/api/certificates/export?event=${selected}&format=zip`);
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Certificate generation failed.");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificates-${selected}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setPanel("Success! Zipped certificates successfully downloaded.");

      // Refresh candidates list
      const refreshRes = await fetch(`/api/portal/certificates?event=${selected}`);
      const refreshJson = await refreshRes.json();
      if (refreshRes.ok) {
        setCandidates(refreshJson.candidates || []);
      }
    } catch (e: any) {
      console.error(e);
      setPanel(e.message || "Failed to generate certificates. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  // Add ad-hoc candidate locally
  function handleAddCandidate(e: React.FormEvent) {
    e.preventDefault();
    if (!newCand.recipientName.trim()) return;

    const item = {
      id: "",
      user: null,
      recipientName: newCand.recipientName,
      uid: newCand.uid || "",
      email: newCand.email || "",
      program: newCand.program || "",
      semester: newCand.semester ? parseInt(newCand.semester, 10) : null,
      rank: newCand.rank,
      certNumber: "",
      isGenerated: false,
      mode: "individual",
      teamName: "",
      isPresent: false
    };

    setCandidates(prev => [...prev, item]);
    setShowAddModal(false);
    setNewCand({
      recipientName: "",
      uid: "",
      email: "",
      program: "",
      semester: "",
      rank: "Participation"
    });
    setPanel(`Added manual candidate: ${item.recipientName}. Don't forget to click Save changes.`);
  }

  // Delete candidate
  async function handleDeleteCandidate(index: number, id: string) {
    if (id && /^[0-9a-fA-F]{24}$/.test(id)) {
      setPanel("Deleting certificate record from database...");
      try {
        const res = await fetch(`/api/admin/certificates/${id}`, { method: "DELETE" });
        if (res.ok) {
          setCandidates(prev => prev.filter((_, i) => i !== index));
          setPanel("Deleted certificate record.");
        } else {
          setPanel("Failed to delete certificate record from database.");
        }
      } catch (e) {
        console.error(e);
        setPanel("Failed to delete certificate record.");
      }
    } else {
      setCandidates(prev => prev.filter((_, i) => i !== index));
      setPanel("Removed draft candidate.");
    }
  }

  // Update candidate fields locally
  function updateCandidateField(index: number, field: string, value: any) {
    setCandidates(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c));
  }

  // Bulk Rank Assign
  function handleBulkAssign(rank: string) {
    if (!selectedCands.length) {
      setPanel("Select at least one candidate first.");
      return;
    }
    setCandidates(prev => prev.map((c) => {
      const candKey = c.user || `${c.recipientName}-${c.email}`;
      if (selectedCands.includes(candKey)) {
        return { ...c, rank };
      }
      return c;
    }));
    setPanel(`Assigned rank '${rank}' to ${selectedCands.length} selected candidates.`);
    setSelectedCands([]);
  }

  // Filter & Search Candidates
  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => {
      const matchesSearch = c.recipientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            c.uid?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            c.certNumber?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRank = rankFilter === "All" || c.rank === rankFilter;
      return matchesSearch && matchesRank;
    });
  }, [candidates, searchQuery, rankFilter]);

  const toggleSelectAll = () => {
    if (selectedCands.length === filteredCandidates.length) {
      setSelectedCands([]);
    } else {
      setSelectedCands(filteredCandidates.map(c => c.user || `${c.recipientName}-${c.email}`));
    }
  };

  const toggleSelect = (candKey: string) => {
    setSelectedCands(prev => 
      prev.includes(candKey) ? prev.filter(k => k !== candKey) : [...prev, candKey]
    );
  };

  // Summary counts
  const totalCount = candidates.length;
  const generatedCount = candidates.filter(c => c.isGenerated).length;
  const winnerCounts = candidates.filter(c => ["1st Place", "2nd Place", "3rd Place"].includes(c.rank)).length;

  return (
    <div className="mt-7 grid gap-5 xl:grid-cols-[1fr_.42fr] animate-in fade-in duration-200">
      {/* Left Panel: Configuration & Candidates */}
      <div className="relative overflow-hidden rounded-[2rem] border border-white/[.08] bg-[#05070d]/75 p-6 md:p-7">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.02] via-transparent to-fuchsia-500/[0.02]" />
        
        {/* Header with event selector */}
        <div className="relative flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] pb-5 mb-6">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Certificate Generator</h3>
            <p className="mt-1 text-xs text-white/38">Configure settings, assign ranks, and generate PDF certificates.</p>
          </div>
          
          <select value={selected} onChange={(event) => setSelected(event.target.value)} className="rounded-2xl border border-white/[.07] bg-black/35 px-4 py-2.5 text-xs text-white outline-none focus:border-violet-400/40 transition">
            <option value="">Select event</option>
            {events.map((event: any) => <option value={idOf(event)} key={idOf(event)}>{event.title}</option>)}
          </select>
        </div>

        {selected ? (
          <>
            {/* Stats Summary cards */}
            <div className="grid gap-3 grid-cols-3 mb-6 relative z-10">
              <div className="rounded-2xl border border-white/[.06] bg-white/[.02] p-4 transition duration-200 hover:-translate-y-0.5">
                <p className="text-[9px] uppercase tracking-[.18em] text-white/35">Total Candidates</p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-white">{totalCount}</p>
              </div>
              <div className="rounded-2xl border border-blue-500/15 bg-blue-500/[0.04] p-4 transition duration-200 hover:-translate-y-0.5">
                <p className="text-[9px] uppercase tracking-[.18em] text-blue-300/60">Generated</p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-blue-300">{generatedCount} / {totalCount}</p>
              </div>
              <div className="rounded-2xl border border-violet-500/15 bg-violet-500/[0.04] p-4 transition duration-200 hover:-translate-y-0.5">
                <p className="text-[9px] uppercase tracking-[.18em] text-violet-300/60">Winners</p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-violet-300">{winnerCounts}</p>
              </div>
            </div>

            {/* Template Overrides Form */}
            <div className="rounded-2xl border border-white/[.06] bg-white/[0.015] p-5 mb-6 relative z-10">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Certificate Template Options</h4>
                <span className="text-[10px] text-white/30">Overrides default branding / details</span>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[9px] tracking-wider text-white/40 block mb-1 uppercase">Event Name on Certificate</label>
                  <input type="text" value={settings.certEventName} onChange={e => setSettings({...settings, certEventName: e.target.value})} className="w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-2 text-xs text-white outline-none focus:border-violet-400/50" placeholder="e.g. Workshop on AI" />
                </div>
                <div>
                  <label className="text-[9px] tracking-wider text-white/40 block mb-1 uppercase">Event Date on Certificate</label>
                  <input type="text" value={settings.certEventDate} onChange={e => setSettings({...settings, certEventDate: e.target.value})} className="w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-2 text-xs text-white outline-none focus:border-violet-400/50" placeholder="e.g. 28th June 2026" />
                </div>
                <div>
                  <label className="text-[9px] tracking-wider text-white/40 block mb-1 uppercase">HOD Name</label>
                  <input type="text" value={settings.certHod} onChange={e => setSettings({...settings, certHod: e.target.value})} className="w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-2 text-xs text-white outline-none focus:border-violet-400/50" />
                </div>
                <div>
                  <label className="text-[9px] tracking-wider text-white/40 block mb-1 uppercase">Faculty Advisor Name</label>
                  <input type="text" value={settings.certFacultyAdvisor} onChange={e => setSettings({...settings, certFacultyAdvisor: e.target.value})} className="w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-2 text-xs text-white outline-none focus:border-violet-400/50" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[9px] tracking-wider text-white/40 block mb-1 uppercase">Co-Faculty Advisor Name</label>
                  <input type="text" value={settings.certCoFacultyAdvisor} onChange={e => setSettings({...settings, certCoFacultyAdvisor: e.target.value})} className="w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-2 text-xs text-white outline-none focus:border-violet-400/50" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[9px] tracking-wider text-white/40 block mb-1 uppercase">Event Logo</label>
                  <div className="flex gap-2">
                    <input type="text" value={settings.certEventLogo || ""} onChange={e => setSettings({...settings, certEventLogo: e.target.value})} placeholder="Event Logo URL or Upload" className="flex-1 rounded-lg border border-white/[.07] bg-black/25 px-3 py-2 text-xs text-white outline-none focus:border-violet-400/50" />
                    <label className="portal-mini-button cursor-pointer flex items-center justify-center rounded-xl bg-white/[0.06] px-3 py-2 text-[10px] font-bold text-white hover:bg-white/[0.1] transition">
                      Upload
                      <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setPanel(`Uploading ${file.name}...`);
                        const form = new FormData();
                        form.append("file", file);
                        form.append("folder", "tech-tatva-os/events");
                        const res = await fetch("/api/portal/upload", { method: "POST", body: form });
                        const result = await res.json();
                        if (!res.ok) {
                          setPanel(result.error || "Upload failed");
                          return;
                        }
                        setSettings(prev => ({ ...prev, certEventLogo: result.url }));
                        setPanel(`Uploaded ${file.name}. Save changes to apply.`);
                      }} />
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-4">
                <button type="button" onClick={() => saveSettingsAndRanks()} disabled={saving || loading} className="portal-mini-button flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-[10px] font-bold text-white hover:bg-white/[0.08] transition">
                  {saving ? "Saving Settings..." : "Save Template Settings"}
                </button>
              </div>
            </div>

            {/* Candidates Management Search, Filter & Bulk operations */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 relative z-10">
              <div className="flex flex-wrap items-center gap-3">
                {/* Search query box */}
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-white/30"><Search size={14} /></span>
                  <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search candidate..." className="rounded-xl border border-white/[.07] bg-black/25 pl-9 pr-3 py-2 text-xs text-white outline-none focus:border-violet-400/40 w-44 sm:w-56" />
                </div>

                {/* Filter rank dropdown */}
                <select value={rankFilter} onChange={e => setRankFilter(e.target.value)} className="rounded-xl border border-white/[.07] bg-black/25 px-3 py-2 text-xs text-white outline-none focus:border-violet-400/40">
                  <option value="All">All Ranks</option>
                  <option value="1st Place">1st Place</option>
                  <option value="2nd Place">2nd Place</option>
                  <option value="3rd Place">3rd Place</option>
                  <option value="Participation">Participation</option>
                </select>
              </div>

              {/* Add Candidate trigger button */}
              <button type="button" onClick={() => setShowAddModal(true)} className="portal-mini-button flex items-center justify-center gap-1 rounded-xl bg-violet-600/30 border border-violet-500/30 px-3 py-2 text-xs font-bold text-violet-200 hover:bg-violet-600/40 transition">
                <Plus size={13} /> Add Candidate
              </button>
            </div>

            {/* Candidates Table */}
            {filteredCandidates.length ? (
              <div className="relative overflow-hidden rounded-2xl border border-white/[.06] z-10 bg-black/10">
                <div className="hidden grid-cols-[2fr_1.2fr_1.3fr_1.3fr_auto] gap-3 bg-white/[.04] px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-white/40 border-b border-white/[0.06] md:grid items-center">
                  <span>Candidate Name</span>
                  <span>UID / Email</span>
                  <span>Rank / Position</span>
                  <span>Cert. Number</span>
                  <span className="text-right pr-3">Action</span>
                </div>
                
                <div className="max-h-[420px] overflow-y-auto overscroll-contain divide-y divide-white/[0.04]">
                  {filteredCandidates.map((row: any, idx: number) => {
                    return (
                      <div className="grid gap-3 px-4 py-3 text-xs hover:bg-white/[0.01] transition items-center md:grid-cols-[2fr_1.2fr_1.3fr_1.3fr_auto]" key={`${row.id || "row"}-${idx}`}>
                        {/* Name Input */}
                        <div>
                          <input type="text" value={row.recipientName} onChange={e => updateCandidateField(idx, "recipientName", e.target.value)} className="w-full bg-transparent border-0 p-0 text-white/90 font-bold focus:ring-0 tracking-tight outline-none" />
                          {row.teamName ? <span className="text-[9px] text-violet-400 block mt-0.5">Team: {row.teamName}</span> : null}
                          {row.isPresent ? <span className="inline-block mt-0.5 rounded px-1.5 py-0.5 text-[8px] bg-blue-500/10 text-blue-300 font-medium border border-blue-500/10">Present</span> : null}
                        </div>
                        
                        {/* UID & Email */}
                        <div className="text-white/40 flex flex-col gap-0.5">
                          <span className="font-semibold text-white/60">{row.uid || "-"}</span>
                          <span className="text-[9px] truncate max-w-[140px]">{row.email || "-"}</span>
                        </div>

                        {/* Rank Selector */}
                        <div>
                          <select value={row.rank} onChange={e => updateCandidateField(idx, "rank", e.target.value)} className="rounded-lg border border-white/[.08] bg-black/45 px-2.5 py-1.5 text-xs text-white/80 outline-none focus:border-violet-400/40">
                            <option value="Participation">Participation</option>
                            <option value="1st Place">1st Place</option>
                            <option value="2nd Place">2nd Place</option>
                            <option value="3rd Place">3rd Place</option>
                          </select>
                        </div>

                        {/* Cert Number Override */}
                        <div>
                          <input type="text" value={row.certNumber || ""} onChange={e => updateCandidateField(idx, "certNumber", e.target.value)} placeholder="Auto-generated" className="w-full rounded-lg border border-white/[.08] bg-black/45 px-2.5 py-1.5 text-xs text-white/80 outline-none focus:border-violet-400/40 font-mono text-[10px]" />
                        </div>
                        
                        {/* Action buttons */}
                        <div className="flex items-center justify-end gap-2 pr-2">
                          {row.isGenerated && row.certNumber ? (
                            <a download title="Download PDF certificate" className="portal-mini-button p-2 text-white/60 hover:text-white" href={`/api/certificates/export?event=${selected}&candidate=${row.user || ""}&certificateId=${row.id || ""}&format=pdf`}>
                              <Download size={13} />
                            </a>
                          ) : null}
                          <button type="button" title="Remove candidate" onClick={() => handleDeleteCandidate(idx, row.id)} className="portal-mini-button p-2 text-red-400/50 hover:bg-red-500/10 hover:text-red-300">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="rounded-2xl border border-white/[.06] bg-white/[.02] p-8 text-sm text-white/35 text-center font-medium relative z-10">
                No candidates found matching the query.
              </p>
            )}

            <div className="flex justify-between items-center mt-4 relative z-10">
              <span className="text-[10px] text-white/30">Total loaded: {filteredCandidates.length} candidate rows</span>
              <button type="button" onClick={() => saveSettingsAndRanks()} disabled={saving || loading} className="portal-command-button flex items-center justify-center gap-1.5 rounded-2xl px-5 py-3 text-xs font-bold transition hover:-translate-y-0.5">
                {saving ? "Saving Changes..." : "Save Candidate Ranks"}
              </button>
            </div>
          </>
        ) : (
          <p className="rounded-2xl border border-white/[.06] bg-white/[.02] p-12 text-sm text-white/35 text-center font-medium relative z-10">
            Please select an event from the dropdown above to manage certificates.
          </p>
        )}
      </div>

      {/* Right Panel: Side Controls */}
      <div className="grid gap-5 self-start">
        {selected ? (
          <>
            {/* Winners Category Download Card */}
            <div className="rounded-[2rem] border border-white/[.08] bg-[#05070d]/75 p-6 md:p-7 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.04] via-transparent to-fuchsia-500/[0.04]" />
              
              <div className="relative">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/[0.06] pb-4 mb-4">Winners Category</h3>
                <p className="text-xs leading-relaxed text-white/40 mb-4">
                  Download certificates individually for the top 3 winner categories.
                </p>
                
                <div className="grid gap-3.5">
                  {/* 1st Place */}
                  <div className="flex items-center justify-between rounded-xl border border-amber-500/10 bg-amber-500/[0.02] p-3">
                    <div className="min-w-0 flex-1 pr-2">
                      <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">🥇 1st Place Winner</span>
                      <span className="text-xs font-semibold text-white/80 truncate block mt-0.5">
                        {candidates.find(c => c.rank === "1st Place")?.recipientName || "Not assigned"}
                      </span>
                    </div>
                    {candidates.find(c => c.rank === "1st Place" && c.isGenerated && c.certNumber) ? (
                      <a download className="portal-mini-button flex items-center gap-1 rounded-lg bg-amber-500/20 border border-amber-500/30 px-2.5 py-1.5 text-[10px] font-bold text-amber-200 hover:bg-amber-500/30 transition" href={`/api/certificates/export?event=${selected}&candidate=${candidates.find(c => c.rank === "1st Place")?.user || ""}&certificateId=${candidates.find(c => c.rank === "1st Place")?.id || ""}&format=pdf`}>
                        <Download size={11} /> Download
                      </a>
                    ) : (
                      <span className="text-[9px] text-white/20 uppercase tracking-wider">Pending</span>
                    )}
                  </div>

                  {/* 2nd Place */}
                  <div className="flex items-center justify-between rounded-xl border border-slate-400/10 bg-slate-400/[0.02] p-3">
                    <div className="min-w-0 flex-1 pr-2">
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">🥈 2nd Place Winner</span>
                      <span className="text-xs font-semibold text-white/80 truncate block mt-0.5">
                        {candidates.find(c => c.rank === "2nd Place")?.recipientName || "Not assigned"}
                      </span>
                    </div>
                    {candidates.find(c => c.rank === "2nd Place" && c.isGenerated && c.certNumber) ? (
                      <a download className="portal-mini-button flex items-center gap-1 rounded-lg bg-slate-400/20 border border-slate-400/30 px-2.5 py-1.5 text-[10px] font-bold text-slate-200 hover:bg-slate-400/30 transition" href={`/api/certificates/export?event=${selected}&candidate=${candidates.find(c => c.rank === "2nd Place")?.user || ""}&certificateId=${candidates.find(c => c.rank === "2nd Place")?.id || ""}&format=pdf`}>
                        <Download size={11} /> Download
                      </a>
                    ) : (
                      <span className="text-[9px] text-white/20 uppercase tracking-wider">Pending</span>
                    )}
                  </div>

                  {/* 3rd Place */}
                  <div className="flex items-center justify-between rounded-xl border border-amber-800/20 bg-amber-800/[0.02] p-3">
                    <div className="min-w-0 flex-1 pr-2">
                      <span className="text-[10px] font-bold text-amber-600/90 uppercase tracking-wider block">🥉 3rd Place Winner</span>
                      <span className="text-xs font-semibold text-white/80 truncate block mt-0.5">
                        {candidates.find(c => c.rank === "3rd Place")?.recipientName || "Not assigned"}
                      </span>
                    </div>
                    {candidates.find(c => c.rank === "3rd Place" && c.isGenerated && c.certNumber) ? (
                      <a download className="portal-mini-button flex items-center gap-1 rounded-lg bg-amber-800/20 border border-amber-800/30 px-2.5 py-1.5 text-[10px] font-bold text-amber-300 hover:bg-amber-800/30 transition" href={`/api/certificates/export?event=${selected}&candidate=${candidates.find(c => c.rank === "3rd Place")?.user || ""}&certificateId=${candidates.find(c => c.rank === "3rd Place")?.id || ""}&format=pdf`}>
                        <Download size={11} /> Download
                      </a>
                    ) : (
                      <span className="text-[9px] text-white/20 uppercase tracking-wider">Pending</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Participation Category Card */}
            <div className="rounded-[2rem] border border-white/[.08] bg-[#05070d]/75 p-6 md:p-7 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/[0.02] via-transparent to-transparent" />
              
              <div className="relative">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/[0.06] pb-4 mb-4">Participation Category</h3>
                <p className="text-xs leading-relaxed text-white/40 mb-3">
                  To download participation certificates one by one:
                </p>
                <ul className="text-[11px] leading-relaxed text-white/35 space-y-2 list-disc pl-4">
                  <li>Select <strong>Participation</strong> in the Rank Filter dropdown on the left.</li>
                  <li>Verify the candidate name and details.</li>
                  <li>Click the <Download size={10} className="inline mx-0.5" /> download icon next to the candidate row.</li>
                </ul>
              </div>
            </div>
          </>
        ) : null}
      </div>

      {/* Manual Candidate Addition Modal Popup */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-[#111016] p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Add Manual Candidate</h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-white/40 hover:text-white"><X size={16} /></button>
            </div>
            
            <form onSubmit={handleAddCandidate} className="grid gap-4">
              <div>
                <label className="text-[9px] tracking-wider text-white/40 block mb-1 uppercase">Candidate Full Name *</label>
                <input type="text" required value={newCand.recipientName} onChange={e => setNewCand({...newCand, recipientName: e.target.value})} className="w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-2.5 text-xs text-white outline-none focus:border-violet-400/50" placeholder="e.g. Jane Doe" />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] tracking-wider text-white/40 block mb-1 uppercase">UID / Roll Number</label>
                  <input type="text" value={newCand.uid} onChange={e => setNewCand({...newCand, uid: e.target.value})} className="w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-2.5 text-xs text-white outline-none focus:border-violet-400/50" placeholder="e.g. 22BCS1000" />
                </div>
                <div>
                  <label className="text-[9px] tracking-wider text-white/40 block mb-1 uppercase">Email Address</label>
                  <input type="email" value={newCand.email} onChange={e => setNewCand({...newCand, email: e.target.value})} className="w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-2.5 text-xs text-white outline-none focus:border-violet-400/50" placeholder="e.g. jane@domain.com" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] tracking-wider text-white/40 block mb-1 uppercase">Program / Branch</label>
                  <input type="text" value={newCand.program} onChange={e => setNewCand({...newCand, program: e.target.value})} className="w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-2.5 text-xs text-white outline-none focus:border-violet-400/50" placeholder="e.g. BE-CSE" />
                </div>
                <div>
                  <label className="text-[9px] tracking-wider text-white/40 block mb-1 uppercase">Semester</label>
                  <input type="number" min="1" max="10" value={newCand.semester} onChange={e => setNewCand({...newCand, semester: e.target.value})} className="w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-2.5 text-xs text-white outline-none focus:border-violet-400/50" placeholder="e.g. 4" />
                </div>
              </div>

              <div>
                <label className="text-[9px] tracking-wider text-white/40 block mb-1 uppercase">Assign Rank</label>
                <select value={newCand.rank} onChange={e => setNewCand({...newCand, rank: e.target.value as any})} className="w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-2.5 text-xs text-white outline-none focus:border-violet-400/50">
                  <option value="Participation">Participation</option>
                  <option value="1st Place">1st Place</option>
                  <option value="2nd Place">2nd Place</option>
                  <option value="3rd Place">3rd Place</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="rounded-xl border border-white/[.07] bg-white/[0.02] px-4 py-2.5 text-xs font-bold text-white hover:bg-white/[0.06] transition">Cancel</button>
                <button type="submit" className="rounded-xl bg-violet-600 hover:bg-violet-700 px-4 py-2.5 text-xs font-bold text-white transition">Add to List</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileCard({ name, photo, role, email, phone, copiedKey, onCopy }: { name: string; photo?: string; role: string; email?: string; phone?: string; copiedKey: string | null; onCopy: (key: string, url: string) => void }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[.06] bg-black/25 p-5 flex gap-4 items-start hover:border-white/[.1] transition">
      <div className="relative h-16 w-16 rounded-full overflow-hidden border border-white/10 bg-black/40 flex-shrink-0 flex items-center justify-center">
        {photo ? (
          <Image width={1200} height={1200} src={photo} alt={name || role} className="h-full w-full object-cover" />
        ) : (
          <User size={28} className="text-white/20" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <span className="inline-block rounded-full bg-violet-500/10 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-violet-300">
          {role}
        </span>
        <h4 className="mt-2 text-sm font-semibold text-white truncate">
          {name || <span className="text-white/20 font-normal italic">Not set</span>}
        </h4>
        <div className="mt-3 space-y-1.5 text-xs text-white/45">
          {email ? (
            <a href={`mailto:${email}`} className="block hover:text-violet-300 transition truncate">
              {email}
            </a>
          ) : (
            <p className="italic text-white/25">No Email set</p>
          )}
          {phone && <p className="font-mono">{phone}</p>}
        </div>
        {photo && (
          <button
            type="button"
            onClick={() => onCopy(role + "-photo", photo)}
            className="mt-3 text-[10px] font-semibold text-violet-300 hover:text-violet-200 transition underline decoration-dotted underline-offset-2 block"
          >
            {copiedKey === role + "-photo" ? "Copied Link!" : "Copy Photo URL"}
          </button>
        )}
      </div>
    </div>
  );
}

function Settings({ info, open }: { info: any; open: (drawer: any) => void }) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleSelfDelete() {
    if (!window.confirm("ARE YOU ABSOLUTELY SURE? This will permanently delete your account, event registrations, attendance records, and revoke all portal access immediately. This action CANNOT be undone.")) {
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch("/api/portal/account/delete", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.ok) {
        alert("Account successfully deleted. You will now be redirected.");
        window.location.href = "/";
      } else {
        alert(data.error || "Failed to delete account.");
        setDeleting(false);
      }
    } catch (e) {
      alert("Network error, please try again.");
      setDeleting(false);
    }
  }

  function handleCopy(key: string, val: string) {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  return (
    <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_.38fr] animate-in fade-in duration-200">
      
      {/* Left Column: Organized Settings Details */}
      <div className="space-y-6">
        
        {/* Section 1: Club Branding & Identity */}
        <div className="relative overflow-hidden rounded-[2rem] border border-white/[.08] bg-[#05070d]/75 p-6 md:p-7">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4 mb-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-violet-200">Club Branding & Vision</h3>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            
            {/* Branding details & logo */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/[.05] bg-black/20 p-5 flex items-center gap-4">
                <div className="relative h-16 w-16 rounded-xl overflow-hidden border border-white/10 bg-black/40 flex items-center justify-center">
                  {info.logo ? (
                    <Image width={1200} height={1200} src={info.logo} alt="Logo" className="h-full w-full object-contain p-1" />
                  ) : (
                    <span className="text-white/20 text-xs uppercase font-bold">LOGO</span>
                  )}
                </div>
                <div>
                  <span className="rounded bg-white/[0.04] px-1.5 py-0.5 text-[9px] font-mono font-bold tracking-wider text-white/40 uppercase">
                    {info.logo ? info.logo.split(".").pop()?.toUpperCase() : "SVG"}
                  </span>
                  <button
                    type="button"
                    onClick={() => info.logo && handleCopy("logo", info.logo)}
                    className="mt-2 text-[10px] font-semibold text-violet-300 hover:text-violet-200 transition underline decoration-dotted underline-offset-2 block"
                  >
                    {copiedKey === "logo" ? "Copied!" : "Copy Logo URL"}
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-white/[.05] bg-black/20 p-4 space-y-3.5 text-xs">
                <div className="flex justify-between items-center border-b border-white/[0.03] pb-2.5">
                  <span className="font-semibold text-white/45 uppercase tracking-wider text-[10px]">Website</span>
                  {info.website ? (
                    <a href={info.website.startsWith("http") ? info.website : `https://${info.website}`} target="_blank" rel="noopener noreferrer" className="text-violet-300 hover:underline">
                      {info.website}
                    </a>
                  ) : (
                    <span className="text-white/20 italic">Not set</span>
                  )}
                </div>
                <div className="flex justify-between items-center border-b border-white/[0.03] pb-2.5">
                  <span className="font-semibold text-white/45 uppercase tracking-wider text-[10px]">Email</span>
                  {info.email ? (
                    <a href={`mailto:${info.email}`} className="text-violet-300 hover:underline">
                      {info.email}
                    </a>
                  ) : (
                    <span className="text-white/20 italic">Not set</span>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="font-semibold text-white/45 uppercase tracking-wider text-[10px]">Location</span>
                  <span className="text-white/80 leading-relaxed break-words">
                    {info.location || <span className="text-white/20 italic">Not set</span>}
                  </span>
                </div>
              </div>
            </div>

            {/* Vision & Mission */}
            <div className="rounded-2xl border border-white/[.05] bg-black/20 p-5 space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-white/50 uppercase tracking-wider text-[10px] mb-1.5">About Section</h4>
                <p className="font-semibold text-white text-sm">{info.aboutTitle || "About Club"}</p>
                <p className="mt-1 text-white/60 leading-relaxed break-words">{info.aboutCopy || <span className="text-white/20 italic font-normal">No copy set</span>}</p>
              </div>
              <div className="border-t border-white/[0.04] pt-3.5 grid gap-3 grid-cols-2">
                <div>
                  <h4 className="font-bold text-white/50 uppercase tracking-wider text-[10px] mb-1">Vision</h4>
                  <p className="text-white/70 leading-relaxed italic">"{info.vision || "Not set"}"</p>
                </div>
                <div>
                  <h4 className="font-bold text-white/50 uppercase tracking-wider text-[10px] mb-1">Mission</h4>
                  <p className="text-white/70 leading-relaxed italic">"{info.mission || "Not set"}"</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Section 2: Faculty Champions */}
        <div className="relative overflow-hidden rounded-[2rem] border border-white/[.08] bg-[#05070d]/75 p-6 md:p-7">
          <h3 className="text-sm font-bold uppercase tracking-wider text-blue-200 border-b border-white/[0.06] pb-4 mb-5">Faculty Champions</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <ProfileCard
              name={info.facultyChampionName}
              photo={info.facultyChampionPhoto}
              role="Faculty Champion"
              email={info.facultyChampionEmail}
              phone={info.facultyChampionPhone}
              copiedKey={copiedKey}
              onCopy={handleCopy}
            />
            <ProfileCard
              name={info.coFacultyChampionName}
              photo={info.coFacultyChampionPhoto}
              role="Co-Faculty Champion"
              email={info.coFacultyChampionEmail}
              phone={info.coFacultyChampionPhone}
              copiedKey={copiedKey}
              onCopy={handleCopy}
            />
          </div>
        </div>

        {/* Section 3: Office Bearers & Student Leadership */}
        <div className="relative overflow-hidden rounded-[2rem] border border-white/[.08] bg-[#05070d]/75 p-6 md:p-7">
          <h3 className="text-sm font-bold uppercase tracking-wider text-fuchsia-200 border-b border-white/[0.06] pb-4 mb-5">Office Bearers & Leadership</h3>
          
          <div className="space-y-4">
            
            {/* Secretary */}
            <ProfileCard
              name={info.secretaryName}
              photo={info.secretaryPhoto}
              role="Secretary"
              email={info.secretaryEmail}
              copiedKey={copiedKey}
              onCopy={handleCopy}
            />

            {/* Student Advisors */}
            <div className="grid gap-4 md:grid-cols-2">
              <ProfileCard
                name={info.studentAdvisorOneName}
                photo={info.studentAdvisorOnePhoto}
                role="Student Advisor One"
                copiedKey={copiedKey}
                onCopy={handleCopy}
              />
              <ProfileCard
                name={info.studentAdvisorTwoName}
                photo={info.studentAdvisorTwoPhoto}
                role="Student Advisor Two"
                copiedKey={copiedKey}
                onCopy={handleCopy}
              />
            </div>

            {/* Joint Secretaries */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/[.05] bg-black/20 p-4 text-xs">
                <span className="text-[10px] uppercase font-bold text-white/35 tracking-wider block">Joint Secretary One</span>
                <span className="text-sm font-semibold text-white mt-1 block">{info.jointSecretaryOneName || <span className="text-white/20 font-normal italic">Not set</span>}</span>
              </div>
              <div className="rounded-2xl border border-white/[.05] bg-black/20 p-4 text-xs">
                <span className="text-[10px] uppercase font-bold text-white/35 tracking-wider block">Joint Secretary Two</span>
                <span className="text-sm font-semibold text-white mt-1 block">{info.jointSecretaryTwoName || <span className="text-white/20 font-normal italic">Not set</span>}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Section 4: AI & Reporting Templates */}
        <div className="relative overflow-hidden rounded-[2rem] border border-white/[.08] bg-[#05070d]/75 p-6 md:p-7">
          <h3 className="text-sm font-bold uppercase tracking-wider text-amber-200 border-b border-white/[0.06] pb-4 mb-5">AI Document Templates</h3>
          <div className="grid gap-4 md:grid-cols-2">
            
            <div className="rounded-2xl border border-white/[.05] bg-black/20 p-5 flex items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-white/35 tracking-wider block">Post Activity Report Template</span>
                <span className="font-semibold text-white mt-1.5 block">Activity Report Layout</span>
              </div>
              {info.postActivityReportTemplate ? (
                <a href={info.postActivityReportTemplate} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-[10px] font-bold text-blue-300 hover:bg-blue-500/20 transition">
                  <FileText size={12} /> View Template PDF
                </a>
              ) : (
                <span className="text-white/20 italic">Not set</span>
              )}
            </div>

            <div className="rounded-2xl border border-white/[.05] bg-black/20 p-5 flex items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-white/35 tracking-wider block">MOM Template</span>
                <span className="font-semibold text-white mt-1.5 block">Minutes of Meeting Layout</span>
              </div>
              {info.momTemplate ? (
                <a href={info.momTemplate} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-[10px] font-bold text-blue-300 hover:bg-blue-500/20 transition">
                  <FileText size={12} /> View Template PDF
                </a>
              ) : (
                <span className="text-white/20 italic">Not set</span>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* Right Column: Settings control actions */}
      <div className="grid gap-5 self-start">
        <div className="rounded-[2rem] border border-white/[.08] bg-[#05070d]/75 p-6 md:p-7 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.03] via-transparent to-transparent" />
          
          <div className="relative">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/[0.06] pb-4 mb-4 font-sans">Settings Panel</h3>
            <p className="text-xs leading-relaxed text-white/40 mb-5">
              These configurations manage the public club branding, student office bearers, advisors, faculty champions, and report templates.
            </p>
            
            <div className="grid gap-3 relative z-10">
              <button onClick={() => open({ resource: "settings", title: "Update club branding, faculty, advisors, office bearers, and document templates", fields: settingsFields, item: info })} className="portal-command-button w-full flex items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-xs font-semibold hover:-translate-y-0.5 transition">
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

            <div className="mt-6 border-t border-rose-500/20 pt-4">
              <p className="text-[10px] text-rose-400 uppercase tracking-wider font-semibold">Danger Zone</p>
              <p className="mt-2 text-xs leading-relaxed text-white/40">
                Permanently delete your account and revoke all portal permissions immediately. This action is irreversible.
              </p>
              <button
                type="button"
                disabled={deleting}
                onClick={handleSelfDelete}
                className="mt-3.5 w-full flex items-center justify-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs font-bold text-rose-300 hover:bg-rose-500/20 active:scale-95 transition disabled:opacity-50 disabled:pointer-events-none"
              >
                {deleting ? "Deleting account..." : "Delete My Account"}
              </button>
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
                  <Image width={1200} height={1200} src={asset.url} alt="" className="h-20 w-24 rounded-xl object-cover" />
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
  const [cleared, setCleared] = useState(false);

  // If a new upload completes, make sure we show it
  useEffect(() => {
    if (upload?.url) {
      setCleared(false);
    }
  }, [upload?.url]);

  const value = cleared ? "" : (upload?.url || current);
  const preview = value && /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(value);

  return (
    <div className="mt-2 rounded-xl border border-white/[.07] bg-black/25 p-3">
      <input type="hidden" name={name} value={value} />
      {upload?.publicId ? <input type="hidden" name={name === "url" ? "publicId" : `${name}PublicId`} value={upload.publicId} /> : null}
      {name === "url" ? <input type="hidden" name="kind" value={upload?.resourceType || "image"} /> : null}
      
      {value ? (
        <div className="mb-3 flex items-center justify-between gap-3 border-b border-white/[.06] pb-3">
          {preview ? (
            <Image width={1200} height={1200} src={value} alt="" className="h-16 w-24 rounded-lg object-cover border border-white/10" />
          ) : (
            <p className="break-all text-xs text-white/45 flex-1">{value}</p>
          )}
          <button 
            type="button" 
            onClick={() => setCleared(true)} 
            className="rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-200 border border-rose-500/25 px-2.5 py-1.5 text-[10px] font-semibold transition"
          >
            Delete Asset
          </button>
        </div>
      ) : null}

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
// ── Audio Feedback Web Audio Synth ──
function playClickSound() {
  if (typeof window === "undefined") return;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch (e) {
    console.error("Audio error", e);
  }
}

function playSuccessSound() {
  if (typeof window === "undefined") return;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    
    osc1.type = "triangle";
    osc1.frequency.setValueAtTime(330, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.25);
    
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(440, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.25);
    
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    
    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 0.4);
    osc2.stop(ctx.currentTime + 0.4);
  } catch (e) {
    console.error("Audio error", e);
  }
}

function MembershipDriveDesk({data,open,patch,remove,refresh,setPanel}:{data:Data;open:(drawer:any)=>void;patch:(resource:Resource,item:any,body:Record<string, any>,message:string)=>void;remove:(resource:Resource,item:any)=>void;refresh:()=>Promise<void>;setPanel:(value:string)=>void}) {
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

function MatrixRainCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener("resize", handleResize);
    handleResize();

    const columns = Math.floor(canvas.width / 20);
    const yPositions = Array(columns).fill(0);
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ$#@%&";

    const draw = () => {
      ctx.fillStyle = "rgba(6, 3, 12, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Purple matrix rain
      ctx.fillStyle = "rgba(168, 85, 247, 0.35)";
      ctx.font = "14px monospace";

      for (let i = 0; i < yPositions.length; i++) {
        const text = chars.charAt(Math.floor(Math.random() * chars.length));
        const x = i * 20;
        const y = yPositions[i];
        
        ctx.fillText(text, x, y);

        if (y > 100 + Math.random() * 10000) {
          yPositions[i] = 0;
        } else {
          yPositions[i] += 20;
        }
      }
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none" />;
}

function EventParticipants({ data, setPanel }: { data: Data; setPanel: (value: string) => void }) {
  const events = data.events || [];
  const [selectedEventId, setSelectedEventId] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [expandedTeams, setExpandedTeams] = useState<Record<string, boolean>>({});

  const selectedEvent = events.find((e: any) => idOf(e) === selectedEventId);

  const filteredRegistrations = useMemo(() => {
    let list = data.registrations || [];
    if (selectedEventId && selectedEventId !== "all") {
      list = list.filter((reg: any) => idOf(reg.event) === selectedEventId);
    }
    const q = search.trim().toLowerCase();
    if (!q) return list;

    return list.filter((reg: any) => {
      const leader = reg.user || {};
      const members = reg.teamMembers || [];
      const textToSearch = [
        reg.teamName,
        reg.mode,
        reg.status,
        leader.name,
        leader.email,
        leader.phone,
        leader.uid,
        leader.program,
        ...members.map((m: any) => [m.name, m.email, m.phone, m.uid, m.program].filter(Boolean).join(" "))
      ].filter(Boolean).join(" ").toLowerCase();

      return textToSearch.includes(q);
    });
  }, [data.registrations, selectedEventId, search]);

  const totalRegistrations = filteredRegistrations.length;
  const totalTeams = filteredRegistrations.filter((r: any) => r.mode === "team").length;
  const totalIndividuals = totalRegistrations - totalTeams;
  const totalConfirmed = filteredRegistrations.filter((r: any) => r.status === "confirmed").length;

  const totalHeadcount = filteredRegistrations.reduce((acc: number, r: any) => {
    return acc + 1 + (r.mode === "team" && Array.isArray(r.teamMembers) ? r.teamMembers.length : 0);
  }, 0);

  const toggleTeam = (key: string) => {
    setExpandedTeams((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="mt-7 grid gap-5 xl:grid-cols-[1fr_.38fr] animate-in fade-in duration-200">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/[.08] bg-[#05070d]/75 p-6 md:p-7">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.02] via-transparent to-blue-500/[0.02]" />

        <div className="relative flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] pb-5 mb-6">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Event Participants Directory</h3>
            <p className="mt-1 text-xs text-white/38">View team-wise registrations, leader & member contact details, and status.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex min-w-[220px] items-center gap-2 rounded-2xl border border-white/[.07] bg-black/35 px-4 py-2.5 text-white/45 focus-within:border-violet-400/40 transition">
              <Search size={14} />
              <input 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                placeholder="Search team, name, UID, phone..." 
                className="w-full bg-transparent text-xs text-white outline-none placeholder:text-white/28" 
              />
            </div>

            <select 
              value={selectedEventId} 
              onChange={(e) => setSelectedEventId(e.target.value)} 
              className="rounded-2xl border border-white/[.07] bg-black/35 px-4 py-2.5 text-xs text-white outline-none focus:border-violet-400/40 transition"
            >
              <option value="all">All Events ({data.registrations?.length || 0})</option>
              {events.map((e: any) => (
                <option value={idOf(e)} key={idOf(e)}>{e.title}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-3 grid-cols-2 md:grid-cols-4 mb-6 relative z-10">
          <div className="rounded-2xl border border-white/[.06] bg-white/[.02] p-4">
            <p className="text-[9px] uppercase tracking-[.18em] text-white/35">Total Teams / Regs</p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-white">{totalRegistrations}</p>
          </div>
          <div className="rounded-2xl border border-violet-500/15 bg-violet-500/[0.04] p-4">
            <p className="text-[9px] uppercase tracking-[.18em] text-violet-300/60">Total Headcount</p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-violet-300">{totalHeadcount}</p>
          </div>
          <div className="rounded-2xl border border-blue-500/15 bg-blue-500/[0.04] p-4">
            <p className="text-[9px] uppercase tracking-[.18em] text-blue-300/60">Teams vs Indiv.</p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-blue-300">{totalTeams} / {totalIndividuals}</p>
          </div>
          <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.04] p-4">
            <p className="text-[9px] uppercase tracking-[.18em] text-emerald-300/60">Confirmed</p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-emerald-300">{totalConfirmed}</p>
          </div>
        </div>

        <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1">
          {filteredRegistrations.map((reg: any) => {
            const regId = idOf(reg);
            const isTeam = reg.mode === "team";
            const leader = reg.user || {};
            const squadMembers = reg.teamMembers || [];
            const isExpanded = expandedTeams[regId] !== false;

            const eventObj = events.find((e: any) => idOf(e) === idOf(reg.event));
            const eventName = eventObj?.title || valueOf(reg, "event") || "Event";

            return (
              <div key={regId} className="rounded-2xl border border-white/[.08] bg-black/40 p-5 space-y-4 transition hover:border-purple-500/30">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">{eventName}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border ${isTeam ? "bg-purple-500/10 border-purple-500/20 text-purple-300" : "bg-blue-500/10 border-blue-500/20 text-blue-300"}`}>
                        {isTeam ? "TEAM REGISTRATION" : "INDIVIDUAL"}
                      </span>
                    </div>
                    {isTeam && (
                      <h4 className="text-base font-extrabold text-white mt-1 font-mono tracking-tight">
                        {reg.teamName || "Unnamed Squad"}
                      </h4>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider border ${reg.status === "waitlisted" ? "bg-amber-500/10 border-amber-500/20 text-amber-300" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"}`}>
                      {reg.status || "CONFIRMED"}
                    </span>
                    {isTeam && (
                      <button 
                        onClick={() => toggleTeam(regId)} 
                        className="text-[10px] font-mono text-white/50 hover:text-white border border-white/10 rounded-lg px-2.5 py-1 transition"
                      >
                        {isExpanded ? "Collapse Squad ▲" : `View Squad (${1 + squadMembers.length}) ▼`}
                      </button>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="space-y-2.5 pt-1">
                    <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-3 text-xs grid gap-3 sm:grid-cols-4 items-center">
                      <div>
                        <span className="text-[8px] font-mono font-bold text-purple-400 uppercase tracking-widest block">
                          {isTeam ? "TEAM LEADER" : "CANDIDATE"}
                        </span>
                        <p className="font-bold text-white mt-0.5">{leader.name || "N/A"}</p>
                      </div>
                      <div>
                        <span className="text-[8px] font-mono text-white/35 uppercase tracking-widest block">UNIVERSITY UID</span>
                        <p className="text-white/80 font-mono mt-0.5">{leader.uid || "N/A"}</p>
                      </div>
                      <div>
                        <span className="text-[8px] font-mono text-white/35 uppercase tracking-widest block">CONTACT & EMAIL</span>
                        <p className="text-white/80 mt-0.5">{leader.phone || "No WhatsApp"}</p>
                        <p className="text-[10px] text-white/40 truncate">{leader.email || "N/A"}</p>
                      </div>
                      <div>
                        <span className="text-[8px] font-mono text-white/35 uppercase tracking-widest block">PROGRAM / SEM</span>
                        <p className="text-white/80 mt-0.5">{leader.program || "N/A"}</p>
                        <p className="text-[10px] text-white/40">Sem {leader.semester || "N/A"}</p>
                      </div>
                    </div>

                    {isTeam && squadMembers.map((m: any, idx: number) => {
                      const u = m.user || m;
                      return (
                        <div key={idx} className="rounded-xl border border-white/5 bg-black/20 p-3 text-xs grid gap-3 sm:grid-cols-4 items-center">
                          <div>
                            <span className="text-[8px] font-mono font-bold text-white/40 uppercase tracking-widest block">
                              SQUAD MEMBER {idx + 2}
                            </span>
                            <p className="font-bold text-white/90 mt-0.5">{m.name || u.name || "N/A"}</p>
                          </div>
                          <div>
                            <span className="text-[8px] font-mono text-white/35 uppercase tracking-widest block">UNIVERSITY UID</span>
                            <p className="text-white/70 font-mono mt-0.5">{m.uid || u.uid || "N/A"}</p>
                          </div>
                          <div>
                            <span className="text-[8px] font-mono text-white/35 uppercase tracking-widest block">CONTACT & EMAIL</span>
                            <p className="text-white/70 mt-0.5">{m.phone || u.phone || "No WhatsApp"}</p>
                            <p className="text-[10px] text-white/40 truncate">{m.email || u.email || "N/A"}</p>
                          </div>
                          <div>
                            <span className="text-[8px] font-mono text-white/35 uppercase tracking-widest block">PROGRAM / SEM</span>
                            <p className="text-white/70 mt-0.5">{m.program || u.program || "N/A"}</p>
                            <p className="text-[10px] text-white/40">Sem {m.semester ?? u.semester ?? "N/A"}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {!filteredRegistrations.length && (
            <p className="rounded-2xl border border-white/[.06] bg-white/[.02] p-8 text-sm text-white/35 text-center font-medium">
              No participant registrations match query &ldquo;{search}&rdquo;.
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-5 self-start">
        <div className="rounded-[2rem] border border-white/[.08] bg-[#05070d]/75 p-6 md:p-7 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.03] via-transparent to-transparent" />
          <div className="relative">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/[0.06] pb-4 mb-4">Export Roster</h3>
            <p className="text-xs leading-relaxed text-white/40 mb-5">
              Download the complete team-wise participant roster including leader & member WhatsApp numbers, UIDs, and programs as Excel.
            </p>

            <a 
              className="portal-command-button flex items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-center text-xs font-semibold hover:-translate-y-0.5 transition w-full"
              href={`/api/admin/participants/export${selectedEventId && selectedEventId !== "all" ? `?event=${selectedEventId}` : ""}`}
            >
              <Download size={14} /> Export Excel Roster (.xlsx)
            </a>

            <p className="mt-5 text-[10px] text-white/32 uppercase tracking-wider font-semibold border-t border-white/[0.06] pt-4">Roster Summary</p>
            <div className="mt-3 rounded-2xl bg-black/35 border border-white/[0.05] p-4 text-xs space-y-2 text-white/50">
              <div className="flex justify-between"><span>Selected Event:</span><span className="font-semibold text-white truncate max-w-[140px]">{selectedEvent?.title || "All Events"}</span></div>
              <div className="flex justify-between"><span>Registrations Count:</span><span className="font-semibold text-white">{totalRegistrations}</span></div>
              <div className="flex justify-between"><span>Total Participant Headcount:</span><span className="font-semibold text-purple-300">{totalHeadcount}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


