"use client";

import { useMemo, useState } from "react";
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
  Search,
  Settings2,
  Sparkles,
  Users,
  Workflow
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis
} from "recharts";
import { Logo } from "@/components/public-shell";

type Module = "Overview" | "Members" | "Events" | "Attendance" | "Tasks" | "Announcements" | "Analytics";

const nav = [
  [LayoutDashboard, "Overview"],
  [Users, "Members"],
  [CalendarDays, "Events"],
  [CheckCircle2, "Attendance"],
  [Workflow, "Tasks"],
  [Bell, "Announcements"],
  [Activity, "Analytics"]
] as const;

const curve = [
  { m: "Jan", v: 420 },
  { m: "Feb", v: 640 },
  { m: "Mar", v: 570 },
  { m: "Apr", v: 910 },
  { m: "May", v: 1050 },
  { m: "Jun", v: 1280 }
];

const bars = [
  { m: "Tech", v: 92 },
  { m: "Design", v: 84 },
  { m: "Events", v: 96 },
  { m: "Media", v: 78 },
  { m: "Mktg", v: 88 }
];

const members = [
  ["Aarav Mehta", "TT24CS018", "Technical Team", "Team Lead", "Active"],
  ["Nisha Rao", "TT24DE044", "Design Team", "Core Member", "Active"],
  ["Kabir Sethi", "TT23EV102", "Event Management", "Volunteer", "Active"],
  ["Mira Iyer", "TT22MD071", "Media Team", "Core Member", "Alumni"]
];

const events = [
  ["Build Night 06", "Hackathon", "12 Jun", "184 / 240", "Published"],
  ["Signal / Design Systems", "Masterclass", "18 Jun", "91 / 120", "Published"],
  ["Zero to Launch", "Workshop", "24 Jun", "0 / 180", "Draft"],
  ["Aurora Showcase", "Exhibition", "02 Jul", "0 / 300", "Review"]
];

const tasks = [
  ["Finalize QR scanner desk", "Secretary", "Today", "In Progress"],
  ["Sponsor logo approvals", "Sponsorship", "Tomorrow", "Pending"],
  ["Attendance sheet audit", "Technical", "06 Jun", "Completed"],
  ["Instagram launch copy", "Content", "08 Jun", "Pending"]
];

const announcements = [
  ["Build Night registrations are open", "Public", "Published"],
  ["Core member review meeting", "Core Team", "Scheduled"],
  ["Volunteer briefing checklist", "Event Team", "Draft"]
];

const metrics = [
  ["Total members", "2,438", "+12.4%", Users],
  ["Active events", "08", "3 this week", CalendarDays],
  ["Attendance rate", "87.6%", "+4.8%", CheckCircle2],
  ["Open tasks", "34", "12 due soon", Workflow]
] as const;

function ModuleHeader({
  active,
  setPanel
}: {
  active: Module;
  setPanel: (panel: string) => void;
}) {
  const action =
    active === "Overview"
      ? "Export report"
      : active === "Attendance"
        ? "Generate sheet"
        : active === "Analytics"
          ? "Run insight"
          : `Add ${active.slice(0, -1) || active}`;

  return (
    <div className="flex flex-wrap justify-between gap-4">
      <div>
        <p className="text-[10px] tracking-[.22em] text-violet-300">COMMAND CENTER / {active.toUpperCase()}</p>
        <h2 className="mt-3 text-3xl tracking-tight">
          {active === "Overview" ? "Club intelligence" : active}
        </h2>
      </div>
      <button
        onClick={() => setPanel(action)}
        className="flex items-center gap-2 self-end rounded-lg bg-white px-4 py-2.5 text-xs font-semibold text-black transition hover:bg-violet-100"
      >
        {active === "Overview" || active === "Attendance" ? <Download size={14} /> : <Plus size={14} />}
        {action}
      </button>
    </div>
  );
}

function Overview({ setActive, setPanel }: { setActive: (module: Module) => void; setPanel: (panel: string) => void }) {
  return (
    <>
      <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map(([label, value, detail, Icon]) => (
          <button
            onClick={() => setActive(label.includes("event") ? "Events" : label.includes("task") ? "Tasks" : "Members")}
            className="glass rounded-xl p-5 text-left transition hover:-translate-y-0.5 hover:border-violet-300/35"
            key={label}
          >
            <div className="flex justify-between">
              <p className="text-xs text-white/40">{label}</p>
              <Icon size={15} className="text-violet-300" />
            </div>
            <p className="mt-5 text-3xl">{value}</p>
            <p className="mt-2 text-[10px] tracking-wider text-emerald-300">{detail}</p>
          </button>
        ))}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.45fr_.75fr]">
        <ChartCard title="Participation growth" subtitle="REGISTRATIONS / LAST 6 MONTHS">
          <ResponsiveContainer>
            <AreaChart data={curve}>
              <defs>
                <linearGradient id="a" x1="0" x2="0" y1="0" y2="1">
                  <stop stopColor="#a78bfa" stopOpacity=".5" />
                  <stop offset="1" stopColor="#a78bfa" stopOpacity="0" />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#ffffff09" vertical={false} />
              <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fill: "#ffffff55", fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "#111016", border: "1px solid #ffffff16" }} />
              <Area dataKey="v" stroke="#a78bfa" fill="url(#a)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Team attendance" subtitle="AVERAGE / THIS TERM">
          <ResponsiveContainer>
            <BarChart data={bars}>
              <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fill: "#ffffff55", fontSize: 9 }} />
              <Tooltip contentStyle={{ background: "#111016", border: "1px solid #ffffff16" }} />
              <Bar dataKey="v" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_.65fr]">
        <TableCard title="Live operations" rows={events.slice(0, 3)} action={(name) => setPanel(`Review ${name}`)} />
        <button onClick={() => setPanel("AI insights")} className="rounded-xl border border-violet-400/15 bg-violet-500/[.07] p-5 text-left transition hover:bg-violet-500/[.11]">
          <Sparkles size={17} className="text-violet-300" />
          <p className="mt-5 text-sm">AI signal</p>
          <p className="mt-3 text-xs leading-5 text-white/40">
            Technical workshops are trending 24% above last term. Click to open recommended actions.
          </p>
          <span className="mt-4 inline-block text-[10px] tracking-wider text-violet-300">VIEW INSIGHTS</span>
        </button>
      </div>
    </>
  );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-xl p-5">
      <p className="text-sm">{title}</p>
      <p className="mt-1 text-[10px] tracking-wider text-white/30">{subtitle}</p>
      <div className="mt-5 h-56">{children}</div>
    </div>
  );
}

function TableCard({
  title,
  rows,
  action
}: {
  title: string;
  rows: string[][];
  action: (name: string) => void;
}) {
  return (
    <div className="glass rounded-xl p-5">
      <p className="text-sm">{title}</p>
      <div className="mt-4 overflow-hidden rounded-xl border border-white/[.06]">
        {rows.map((row) => (
          <button
            onClick={() => action(row[0])}
            className="grid w-full gap-3 border-b border-white/[.05] bg-black/15 p-4 text-left text-xs transition last:border-0 hover:bg-violet-500/[.08] md:grid-cols-[1.2fr_.8fr_.6fr_.7fr]"
            key={row[0]}
          >
            {row.map((cell, index) => (
              <span className={index === row.length - 1 ? "text-violet-300" : "text-white/55"} key={cell}>
                {cell}
              </span>
            ))}
          </button>
        ))}
      </div>
    </div>
  );
}

function Attendance({ setPanel }: { setPanel: (panel: string) => void }) {
  const rows = [
    ["Build Night 06", "184", "161", "87.5%"],
    ["Signal / Design Systems", "91", "82", "90.1%"],
    ["Prototype Week", "310", "287", "92.5%"]
  ];
  return (
    <div className="mt-7 grid gap-4 lg:grid-cols-[1fr_.7fr]">
      <TableCard title="Attendance history" rows={rows} action={(name) => setPanel(`Download attendance for ${name}`)} />
      <div className="glass rounded-xl p-5">
        <p className="text-sm">QR attendance station</p>
        <p className="mt-3 text-xs leading-6 text-white/40">
          Select an event, scan participant QR passes, and write attendance timestamps directly to MongoDB.
        </p>
        {["Manual mark", "Bulk CSV upload", "Export PDF", "Export XLSX"].map((item) => (
          <button
            onClick={() => setPanel(item)}
            className="mt-3 block w-full rounded-xl border border-white/[.07] bg-white/[.035] px-4 py-3 text-left text-xs text-white/60 transition hover:border-violet-300/35 hover:bg-violet-500/[.08]"
            key={item}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

function GenericModule({ active, search, setPanel }: { active: Module; search: string; setPanel: (panel: string) => void }) {
  const source =
    active === "Members"
      ? members
      : active === "Events"
        ? events
        : active === "Tasks"
          ? tasks
          : active === "Announcements"
            ? announcements
            : events.map((event) => [event[0], "Registrations", event[3], event[4]]);
  const rows = source.filter((row) => row.join(" ").toLowerCase().includes(search.toLowerCase()));

  if (active === "Attendance") return <Attendance setPanel={setPanel} />;

  return (
    <div className="mt-7 grid gap-4 lg:grid-cols-[1fr_.7fr]">
      <TableCard title={`${active} workspace`} rows={rows} action={(name) => setPanel(`Open ${name}`)} />
      <div className="glass rounded-xl p-5">
        <p className="text-sm">{active} actions</p>
        <div className="mt-4 space-y-3">
          {["Create", "Import", "Export", "Archive"].map((verb) => (
            <button
              onClick={() => setPanel(`${verb} ${active.toLowerCase()}`)}
              className="flex w-full items-center justify-between rounded-xl border border-white/[.07] bg-white/[.035] px-4 py-3 text-xs text-white/60 transition hover:bg-violet-500/[.08]"
              key={verb}
            >
              {verb} {active.toLowerCase()}
              <Plus size={13} className="text-violet-300" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Admin() {
  const [active, setActive] = useState<Module>("Overview");
  const [search, setSearch] = useState("");
  const [panel, setPanel] = useState("Welcome back. Select any module or row to open its action panel.");
  const [notifications, setNotifications] = useState(false);

  const visiblePanel = useMemo(
    () =>
      panel.includes("AI")
        ? "Recommended: add one advanced technical workshop in July, assign sponsorship follow-up, and export the latest attendance report."
        : panel,
    [panel]
  );

  return (
    <main className="min-h-screen bg-[#08070b] text-white">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-white/[.06] bg-[#0c0b10] p-5 xl:block">
        <Logo />
        <p className="mt-12 px-3 text-[10px] tracking-[.18em] text-white/25">COMMAND CENTER</p>
        <nav className="mt-4 space-y-1">
          {nav.map(([Icon, label]) => (
            <button
              key={label}
              onClick={() => {
                setActive(label);
                setPanel(`${label} module loaded.`);
              }}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs transition ${
                active === label ? "bg-violet-500/15 text-violet-200" : "text-white/40 hover:bg-white/[.04]"
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </nav>
        <button
          onClick={() => setPanel("System settings opened. Configure roles, branding, and integrations here.")}
          className="absolute bottom-16 left-5 flex items-center gap-3 text-xs text-white/35 transition hover:text-white/70"
        >
          <Settings2 size={15} /> System settings
        </button>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="absolute bottom-5 left-5 flex items-center gap-3 text-xs text-white/35 transition hover:text-rose-200"
        >
          <LogOut size={15} /> Sign out
        </button>
      </aside>

      <section className="xl:pl-64">
        <header className="flex min-h-20 flex-wrap items-center justify-between gap-4 border-b border-white/[.06] px-5 py-4 md:px-8">
          <div>
            <p className="text-xs text-white/35">Tuesday, 02 June 2026</p>
            <h1 className="mt-1 text-lg">Good afternoon, Eshaan.</h1>
          </div>
          <div className="flex flex-1 items-center justify-end gap-3">
            <label className="hidden min-w-72 items-center gap-3 rounded-lg border border-white/[.07] bg-white/[.035] px-3 py-2.5 text-white/40 md:flex">
              <Search size={16} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search members, events, tasks..."
                className="w-full bg-transparent text-xs text-white outline-none placeholder:text-white/25"
              />
            </label>
            <button
              onClick={() => setNotifications((value) => !value)}
              className="relative rounded-lg border border-white/[.07] p-2.5 text-white/40 transition hover:bg-white/[.05]"
            >
              <Bell size={16} />
              <i className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-pink-400" />
            </button>
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500" />
          </div>
        </header>

        <div className="p-5 md:p-8">
          <ModuleHeader active={active} setPanel={setPanel} />
          {active === "Overview" ? (
            <Overview setActive={setActive} setPanel={setPanel} />
          ) : (
            <GenericModule active={active} search={search} setPanel={setPanel} />
          )}

          <div className="mt-4 rounded-xl border border-violet-300/15 bg-violet-500/[.07] p-5">
            <p className="text-[10px] tracking-[.2em] text-violet-300">ACTION PANEL</p>
            <p className="mt-3 text-sm leading-6 text-white/65">{visiblePanel}</p>
          </div>
        </div>
      </section>

      {notifications ? (
        <div className="fixed right-5 top-24 z-50 w-[min(360px,calc(100vw-40px))] rounded-2xl border border-white/10 bg-[#111016]/95 p-5 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <p className="text-sm">Notifications</p>
          {["Build Night reached 75% capacity", "3 tasks are due today", "Attendance export is ready"].map((item) => (
            <button
              onClick={() => setPanel(item)}
              className="mt-3 block w-full rounded-xl bg-white/[.04] px-4 py-3 text-left text-xs text-white/55 transition hover:bg-violet-500/[.08]"
              key={item}
            >
              {item}
            </button>
          ))}
        </div>
      ) : null}
    </main>
  );
}
