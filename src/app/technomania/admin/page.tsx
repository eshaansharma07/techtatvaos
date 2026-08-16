"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  LayoutDashboard,
  Sparkles,
  Layers,
  Users,
  Trophy,
  Calendar,
  ShieldAlert,
  Radio,
  FileText,
  Upload,
  Download,
  Plus,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Search,
  Filter,
  RefreshCw,
  Save,
  Check,
  X,
  ChevronRight,
  HelpCircle,
  Zap,
  Image as ImageIcon,
  Sliders,
  Award,
  QrCode,
  Lock,
  ArrowUpRight,
  UserCheck,
  AlertCircle
} from "lucide-react";
import { useTechnomaniaHref } from "@/lib/technomania-links";

// Types
interface SquadRegistration {
  _id: string;
  teamName: string;
  leadName: string;
  leadUid: string;
  leadEmail: string;
  leadPhone: string;
  leadProgram: string;
  leadSemester: number;
  eventId: string;
  eventTitle: string;
  members: { name: string; email: string; uid: string; program: string; semester: number }[];
  status: "confirmed" | "pending" | "cancelled" | "checked_in";
  qrToken: string;
  registeredAt: string;
  adminRemarks?: string;
}

interface ArenaEvent {
  _id: string;
  title: string;
  slug: string;
  subtitle?: string;
  category: "hackathon" | "esports" | "cultural" | "sub-events";
  participationMode: "individual" | "team" | "both";
  maxTeamSize: number;
  capacity: number;
  venue: string;
  status: "draft" | "published" | "active" | "completed";
  registrationOpen: boolean;
  startAt: string;
  endAt?: string;
  description?: string;
  banner?: string;
  certEventLogo?: string;
  prizes?: string;
  rules?: string[];
}

interface LeaderboardItem {
  id: string;
  arena: string;
  teamName: string;
  rank: number;
  points: number;
  badge?: string;
  status: "Qualified" | "Winner" | "Runner-Up" | "In-Progress";
}

interface ScheduleItem {
  id: string;
  day: string;
  time: string;
  title: string;
  venue: string;
  category: string;
  status: "upcoming" | "live" | "completed";
}

interface CommitteeMember {
  id: string;
  name: string;
  role: string;
  domain: string;
  image?: string;
  contact?: string;
}

interface FAQItem {
  q: string;
  a: string;
}

type AdminTab =
  | "overview"
  | "hero_cms"
  | "ticker"
  | "arenas"
  | "squads"
  | "leaderboard"
  | "schedule"
  | "committee"
  | "faqs"
  | "checkin"
  | "media";

export default function TechnomaniaAdminPage() {
  const getHref = useTechnomaniaHref();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Toast trigger
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. FESTIVAL CMS SETTINGS STATE
  const [cmsConfig, setCmsConfig] = useState({
    festivalName: "TECHNOMANIA 3.0",
    edition: "3.0",
    campusLocation: "CHANDIGARH UNIVERSITY · GHARUAN, MOHALI",
    headline: "Flagship Technical & Cultural Festival",
    tagline: "24H Hackathon Sprint · Multi-Title Esports Championship · Star Cultural Stage",
    announcementStatus: "REGISTRATIONS LIVE FOR UNIVERSITY STUDENTS · FREE PASSES",
    targetDate: "2026-09-15T09:00:00+05:30",
    prizePoolText: "₹XX,XXX CASH & INTERNSHIPS",
    registrationStatus: "open",
    ctaPrimaryText: "REGISTER SQUAD NOW",
    ctaPrimaryLink: "/register",
    ctaSecondaryText: "EXPLORE ALL EVENTS",
    ctaSecondaryLink: "/events",
    logoUrl: "/technomania/logo-white.png",
    emblemUrl: "/technomania/logo-emblem.png",
    clubLogoUrl: "/technomania/techtatva-logo.png",
  });

  // 2. MARQUEE TICKER STATE
  const [tickerLines, setTickerLines] = useState<string[]>([
    "REGISTRATIONS NOW OPEN FOR TECHNOMANIA 3.0",
    "24-HOUR NON-STOP HACKATHON ARENA",
    "BGMI, VALORANT & EA FC ESPORTS CHAMPIONSHIPS",
    "CULTURAL SHOWCASE & CELEBRITY DJ NIGHT",
    "TOTAL PRIZE POOL ₹XX,XXX",
    "LIVE LEADERBOARDS & SPOT REWARDS"
  ]);
  const [newTickerInput, setNewTickerInput] = useState("");

  // 3. ARENAS & EVENTS STATE
  const [arenas, setArenas] = useState<ArenaEvent[]>([
    {
      _id: "arena-1",
      title: "Code Storm 24H",
      slug: "hackathon",
      subtitle: "Flagship 24-Hour Non-Stop Hackathon",
      category: "hackathon",
      participationMode: "team",
      maxTeamSize: 4,
      capacity: 60,
      venue: "Block D — Central Tech Labs",
      status: "published",
      registrationOpen: true,
      startAt: "2026-09-15T09:00:00",
      description: "24 hours of non-stop building, mentoring, and shipping solutions. Solve industry statements and pitch live to tech founders.",
      prizes: "₹XX,XXX PRIZES & INTERNSHIPS",
      banner: "/technomania/logo-glow.png",
      rules: ["Teams of 1-4 members", "Original code only; pre-built projects disqualified", "24-hour development clock"]
    },
    {
      _id: "arena-2",
      title: "Cyber Clash Arena",
      slug: "esports",
      subtitle: "Multi-Title Esports Championship",
      category: "esports",
      participationMode: "team",
      maxTeamSize: 5,
      capacity: 100,
      venue: "E-Sports Theater, Auditorium 2",
      status: "published",
      registrationOpen: true,
      startAt: "2026-09-15T11:00:00",
      description: "High-stakes tournament across BGMI, Valorant, and EA FC with live stage casting and bracket showdowns.",
      prizes: "TROPHIES & CASH REWARDS",
      banner: "/technomania/logo-white.png",
      rules: ["Valid student ID required", "Default tournament rule sets apply", "Bring your own gaming peripherals"]
    },
    {
      _id: "arena-3",
      title: "Festival Nocturne",
      slug: "cultural",
      subtitle: "Music, Dance & Celebrity DJ Night",
      category: "cultural",
      participationMode: "both",
      maxTeamSize: 12,
      capacity: 500,
      venue: "CU Main Amphitheatre",
      status: "published",
      registrationOpen: true,
      startAt: "2026-09-16T18:00:00",
      description: "Battle of the bands, western & classical dance showdowns, fashion choreography, and an electrifying celebrity DJ night.",
      prizes: "MEMENTOS & CASH PRIZES",
      banner: "/technomania/logo-emblem.png",
      rules: ["Max 10 minutes per stage performance", "Track audio must be submitted 2h prior"]
    },
    {
      _id: "arena-4",
      title: "Circuit Odyssey & Blitz",
      slug: "sub-events",
      subtitle: "Speed Debugging, Tech Trivia & UI/UX Sprints",
      category: "sub-events",
      participationMode: "individual",
      maxTeamSize: 1,
      capacity: 150,
      venue: "Academic Block 3, Seminar Hall",
      status: "published",
      registrationOpen: true,
      startAt: "2026-09-15T14:00:00",
      description: "Rapid-fire spot events designed for quick thinking and instant glory. Speed runs, algorithmic challenges, and mystery boxes.",
      prizes: "SPOT GOODIES & CERTIFICATES",
      banner: "/technomania/logo-glow.png",
      rules: ["Individual participation", "Single-elimination format"]
    }
  ]);
  const [editingArena, setEditingArena] = useState<Partial<ArenaEvent> | null>(null);
  const [isArenaModalOpen, setIsArenaModalOpen] = useState(false);

  // 4. SQUADS & REGISTRATIONS STATE
  const [squads, setSquads] = useState<SquadRegistration[]>([
    {
      _id: "squad-101",
      teamName: "CyberPulse Labs",
      leadName: "Aarav Sharma",
      leadUid: "22BCS10192",
      leadEmail: "aarav.sharma@cumail.in",
      leadPhone: "+91 98765 43210",
      leadProgram: "B.Tech Computer Science & Engineering",
      leadSemester: 5,
      eventId: "arena-1",
      eventTitle: "Code Storm 24H",
      members: [
        { name: "Devansh Patel", email: "devansh@cumail.in", uid: "22BCS10244", program: "B.Tech CSE", semester: 5 },
        { name: "Riya Kapoor", email: "riya.k@cumail.in", uid: "22BCS10881", program: "B.Tech IT", semester: 5 },
        { name: "Tanmay Singhal", email: "tanmay.s@cumail.in", uid: "22BCS10912", program: "B.Tech CSE", semester: 5 }
      ],
      status: "confirmed",
      qrToken: "TM3-CS24-9981A",
      registeredAt: "2026-08-15T14:22:00Z",
      adminRemarks: "Verified GitHub portfolio. Approved for Lab 4 setup."
    },
    {
      _id: "squad-102",
      teamName: "Alpha Strikers",
      leadName: "Vikram Malhotra",
      leadUid: "23BCS14022",
      leadEmail: "vikram.m@cumail.in",
      leadPhone: "+91 98123 45678",
      leadProgram: "B.Tech Artificial Intelligence",
      leadSemester: 3,
      eventId: "arena-2",
      eventTitle: "Valorant Tactical Masters",
      members: [
        { name: "Kabir Singh", email: "kabir.s@cumail.in", uid: "23BCS14088", program: "B.Tech AI", semester: 3 },
        { name: "Sahil Verma", email: "sahil.v@cumail.in", uid: "23BCS14112", program: "B.Tech CSE", semester: 3 },
        { name: "Rohan Gupta", email: "rohan.g@cumail.in", uid: "23BCS14199", program: "B.Tech AI", semester: 3 },
        { name: "Aman Deep", email: "aman.d@cumail.in", uid: "23BCS14205", program: "B.Tech IT", semester: 3 }
      ],
      status: "confirmed",
      qrToken: "TM3-VAL-4412B",
      registeredAt: "2026-08-15T16:45:00Z",
      adminRemarks: "Roster verified."
    },
    {
      _id: "squad-103",
      teamName: "Phantom Elites",
      leadName: "Simran Kaur",
      leadUid: "21BCA10045",
      leadEmail: "simran.k@cumail.in",
      leadPhone: "+91 97765 11223",
      leadProgram: "BCA Cloud Computing",
      leadSemester: 5,
      eventId: "arena-2",
      eventTitle: "BGMI Mobile Battleground",
      members: [
        { name: "Harpreet Singh", email: "harpreet@cumail.in", uid: "21BCA10099", program: "BCA", semester: 5 },
        { name: "Manjot Kaur", email: "manjot@cumail.in", uid: "21BCA10123", program: "BCA", semester: 5 },
        { name: "Karan Johal", email: "karan.j@cumail.in", uid: "21BCA10188", program: "BCA", semester: 5 }
      ],
      status: "confirmed",
      qrToken: "TM3-BGMI-8812C",
      registeredAt: "2026-08-15T19:10:00Z",
      adminRemarks: "Slot confirmed in Pool A."
    }
  ]);
  const [selectedSquad, setSelectedSquad] = useState<SquadRegistration | null>(null);
  const [squadSearch, setSquadSearch] = useState("");
  const [squadArenaFilter, setSquadArenaFilter] = useState("all");
  const [squadStatusFilter, setSquadStatusFilter] = useState("all");

  // 5. LEADERBOARD STATE
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([
    { id: "lb-1", arena: "Code Storm 24H", teamName: "CyberPulse Labs", rank: 1, points: 960, badge: "Grand Finalist", status: "Winner" },
    { id: "lb-2", arena: "Code Storm 24H", teamName: "Matrix Reloaded", rank: 2, points: 915, badge: "Best Architecture", status: "Runner-Up" },
    { id: "lb-3", arena: "Valorant Tactical Masters", teamName: "Alpha Strikers", rank: 1, points: 1450, badge: "Clean Sweep", status: "Winner" },
    { id: "lb-4", arena: "BGMI Mobile Battleground", teamName: "Phantom Elites", rank: 1, points: 820, badge: "Most Frags", status: "Winner" }
  ]);
  const [editingLb, setEditingLb] = useState<Partial<LeaderboardItem> | null>(null);

  // 6. SCHEDULE TIMELINE STATE
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([
    { id: "sc-1", day: "Day 1 — Sep 15", time: "09:00 AM", title: "Festival Kickoff & Opening Ceremony", venue: "Auditorium 1", category: "General", status: "upcoming" },
    { id: "sc-2", day: "Day 1 — Sep 15", time: "10:30 AM", title: "Code Storm 24H Hackathon Begins", venue: "Block D Labs", category: "Hackathon", status: "upcoming" },
    { id: "sc-3", day: "Day 1 — Sep 15", time: "01:00 PM", title: "Esports Arena Prelims (Valorant & BGMI)", venue: "E-Sports Theater", category: "Esports", status: "upcoming" },
    { id: "sc-4", day: "Day 2 — Sep 16", time: "11:00 AM", title: "Hackathon Final Pitches to Founders", venue: "Seminar Hall 4", category: "Hackathon", status: "upcoming" },
    { id: "sc-5", day: "Day 2 — Sep 16", time: "06:00 PM", title: "Star Cultural Night & Celebrity DJ", venue: "CU Amphitheatre", category: "Cultural", status: "upcoming" }
  ]);
  const [editingSchedule, setEditingSchedule] = useState<Partial<ScheduleItem> | null>(null);

  // 7. COMMITTEE STATE
  const [committee, setCommittee] = useState<CommitteeMember[]>([
    { id: "cm-1", name: "Festival Convener Team", role: "Overall Festival Leads", domain: "Operations & Governance", contact: "lead@techtatva.in" },
    { id: "cm-2", name: "Hackathon Tech Council", role: "Code Storm Lead Mentors", domain: "Judging & Problem Statements", contact: "hackathon@techtatva.in" },
    { id: "cm-3", name: "Esports Tournament Desk", role: "Referees & Broadcasters", domain: "Gaming & Live Stream", contact: "esports@techtatva.in" },
    { id: "cm-4", name: "Stage & Cultural Board", role: "Artist & Stage Management", domain: "Sound, Light & Artist Hospitality", contact: "cultural@techtatva.in" }
  ]);
  const [editingMember, setEditingMember] = useState<Partial<CommitteeMember> | null>(null);

  // 8. FAQS STATE
  const [faqs, setFaqs] = useState<FAQItem[]>([
    {
      q: "Who is eligible to participate in Technomania 3.0?",
      a: "All currently enrolled students from Chandigarh University and registered participants across Indian colleges with a valid college ID are welcome to compete."
    },
    {
      q: "Is there any registration fee?",
      a: "No, participation passes for Technomania 3.0 flagship tracks and hackathons are 100% free for registered squads."
    },
    {
      q: "Can I participate in multiple events simultaneously?",
      a: "Yes, you can register for both esports and sub-events as long as their individual on-ground time slots do not overlap."
    },
    {
      q: "What should I bring to the 24H Hackathon?",
      a: "Bring your laptop, charger, student UID card, extensions, and hardware kits if working on IoT or robotics projects."
    }
  ]);
  const [editingFaq, setEditingFaq] = useState<Partial<FAQItem> | null>(null);

  // 9. ON-GROUND QR CHECK-IN STATE
  const [checkInInput, setCheckInInput] = useState("");
  const [checkInResult, setCheckInResult] = useState<{ status: "success" | "error"; text: string; squad?: SquadRegistration } | null>(null);

  // 10. MEDIA UPLOAD STATE
  const [uploadedMedia, setUploadedMedia] = useState<{ name: string; url: string; date: string }[]>([
    { name: "logo-white.png", url: "/technomania/logo-white.png", date: "System Asset" },
    { name: "logo-emblem.png", url: "/technomania/logo-emblem.png", date: "System Asset" },
    { name: "logo-glow.png", url: "/technomania/logo-glow.png", date: "System Asset" },
    { name: "techtatva-logo.png", url: "/technomania/techtatva-logo.png", date: "System Asset" }
  ]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load from API on mount
  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch("/api/technomania/config");
        if (res.ok) {
          const json = await res.json();
          if (json.config) {
            setCmsConfig((prev) => ({ ...prev, ...json.config }));
            if (json.config.marqueeLines) setTickerLines(json.config.marqueeLines);
            if (json.config.faqs) setFaqs(json.config.faqs);
          }
        }
      } catch (err) {
        console.warn("Could not load /api/technomania/config:", err);
      }
    }
    loadConfig();
  }, []);

  // Save full CMS config to database
  const saveCmsConfig = async (override?: any) => {
    setIsLoading(true);
    try {
      const payload = override || {
        ...cmsConfig,
        marqueeLines: tickerLines,
        faqs
      };
      const res = await fetch("/api/technomania/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast("✓ Festival CMS & Settings successfully saved to Database!");
      } else {
        showToast("✓ Changes saved locally in memory.");
      }
    } catch (err) {
      showToast("✓ Local state updated successfully.");
    } finally {
      setIsLoading(false);
    }
  };

  // Upload Media Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "technomania-3.0");

    try {
      const res = await fetch("/api/technomania/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setUploadedMedia((prev) => [{ name: file.name, url: data.url, date: new Date().toLocaleTimeString() }, ...prev]);
        showToast(`✓ Image "${file.name}" uploaded successfully!`);
      } else {
        showToast(data.error || "Upload failed");
      }
    } catch (err) {
      showToast("Upload failed");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Squad Filter
  const filteredSquads = useMemo(() => {
    return squads.filter((s) => {
      const matchesSearch =
        squadSearch === "" ||
        s.teamName.toLowerCase().includes(squadSearch.toLowerCase()) ||
        s.leadName.toLowerCase().includes(squadSearch.toLowerCase()) ||
        s.leadUid.toLowerCase().includes(squadSearch.toLowerCase()) ||
        s.leadEmail.toLowerCase().includes(squadSearch.toLowerCase());

      const matchesArena = squadArenaFilter === "all" || s.eventId === squadArenaFilter;
      const matchesStatus = squadStatusFilter === "all" || s.status === squadStatusFilter;

      return matchesSearch && matchesArena && matchesStatus;
    });
  }, [squads, squadSearch, squadArenaFilter, squadStatusFilter]);

  // Squad status changer
  const updateSquadStatus = (squadId: string, newStatus: SquadRegistration["status"]) => {
    setSquads((prev) =>
      prev.map((s) => (s._id === squadId ? { ...s, status: newStatus } : s))
    );
    if (selectedSquad?._id === squadId) {
      setSelectedSquad((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
    showToast(`✓ Squad status updated to "${newStatus.toUpperCase()}"`);
  };

  // QR Check-in Handler
  const handleCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const token = checkInInput.trim().toUpperCase();
    if (!token) return;

    const found = squads.find(
      (s) => s.qrToken.toUpperCase() === token || s.leadUid.toUpperCase() === token
    );

    if (found) {
      updateSquadStatus(found._id, "checked_in");
      setCheckInResult({
        status: "success",
        text: `VERIFIED & CHECKED-IN: "${found.teamName || found.leadName}" (${found.eventTitle})`,
        squad: found
      });
    } else {
      setCheckInResult({
        status: "error",
        text: `NO TICKET MATCH: No squad or token matching "${token}" found.`
      });
    }
    setCheckInInput("");
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-white font-tm-body flex flex-col antialiased selection:bg-cyan-500 selection:text-black">
      {/* ── STICKY TOP HUD BAR ── */}
      <header className="sticky top-0 z-40 bg-[#0c1017]/95 backdrop-blur-xl border-b border-cyan-500/20 px-4 md:px-8 py-3 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
        <div className="flex items-center gap-4">
          <Link href={getHref("/")} className="group flex items-center gap-3">
            <div className="relative h-7 w-7">
              <Image
                src="/technomania/techtatva-logo.png"
                alt="Tech Tatva"
                fill
                className="object-contain drop-shadow-[0_0_10px_rgba(74,158,255,0.8)]"
              />
            </div>
            <span className="text-white/30 text-xs font-light select-none">✕</span>
            <div className="relative h-6 w-20">
              <Image
                src="/technomania/logo-emblem.png"
                alt="TM 3.0"
                fill
                className="object-contain drop-shadow-[0_0_10px_rgba(74,158,255,0.8)]"
              />
            </div>
          </Link>

          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-cyan-950/60 border border-cyan-500/30 text-[10px] font-tm-mono text-cyan-300">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-bold tracking-wider">COMMAND DESK v3.0</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.open("/api/technomania/export", "_blank")}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-tm-mono text-cyan-200 transition"
          >
            <Download size={13} className="text-cyan-400" />
            <span>EXPORT EXCEL</span>
          </button>

          <Link
            href={getHref("/")}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-xs font-tm-mono text-cyan-300 transition"
          >
            <ExternalLink size={13} />
            <span>VIEW LIVE FEST</span>
          </Link>
        </div>
      </header>

      {/* ── TOAST NOTIFICATION ── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-black/90 border border-cyan-400/80 text-cyan-200 text-xs font-tm-mono shadow-[0_0_30px_rgba(74,158,255,0.4)] flex items-center gap-2 animate-bounce">
          <CheckCircle2 size={16} className="text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex-grow flex flex-col md:flex-row">
        {/* ── SIDEBAR NAVIGATION (TM 3.0 LOGO THEME) ── */}
        <aside className="w-full md:w-64 bg-[#0a0e16] border-r border-white/5 p-4 flex flex-col justify-between shrink-0">
          <div className="space-y-1">
            <div className="px-3 py-2 text-[10px] font-tm-mono font-bold tracking-[0.2em] text-white/40 uppercase">
              // FESTIVAL CMS & CONTROL //
            </div>

            {[
              { id: "overview", label: "Overview & Pulse", icon: LayoutDashboard },
              { id: "hero_cms", label: "Hero & Text CMS", icon: Sliders },
              { id: "ticker", label: "Broadcast Ticker", icon: Radio },
              { id: "arenas", label: "Arenas & Events", icon: Layers },
              { id: "squads", label: "Squads & Rosters", icon: Users },
              { id: "leaderboard", label: "Live Scoring Desk", icon: Trophy },
              { id: "schedule", label: "Timeline & Agenda", icon: Calendar },
              { id: "committee", label: "Committee & Leads", icon: Award },
              { id: "faqs", label: "Festival FAQs", icon: HelpCircle },
              { id: "checkin", label: "QR Gate Check-In", icon: QrCode },
              { id: "media", label: "Media & Assets", icon: ImageIcon }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as AdminTab)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-tm-mono transition-all ${
                    isActive
                      ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(74,158,255,0.2)] font-bold"
                      : "text-white/60 hover:text-white hover:bg-white/[0.03]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} className={isActive ? "text-cyan-400" : "text-white/40"} />
                    <span>{tab.label}</span>
                  </div>
                  {isActive && <ChevronRight size={14} className="text-cyan-400" />}
                </button>
              );
            })}
          </div>

          {/* Bottom System Info */}
          <div className="mt-8 pt-4 border-t border-white/5 px-2">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-tm-mono text-white/50">
                <span>DATABASE SYNC</span>
                <span className="text-cyan-400">ACTIVE</span>
              </div>
              <p className="text-[10px] font-tm-mono text-white/30 truncate">
                CU Campus · Mohali
              </p>
            </div>
          </div>
        </aside>

        {/* ── MAIN CONTENT AREA ── */}
        <main className="flex-grow p-4 md:p-8 max-w-6xl mx-auto w-full">
          {/* ═══════════════════════════════════════════════════════
              TAB 1: OVERVIEW & PULSE
              ═══════════════════════════════════════════════════════ */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-tm-heading font-black tracking-wide uppercase text-white flex items-center gap-3">
                  <span>Festival Command Center</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                </h1>
                <p className="text-xs sm:text-sm font-tm-mono text-cyan-200/60 mt-1">
                  Live operations, registrations, CMS control, and leaderboard desk
                </p>
              </div>

              {/* KPI Cards — Exact TM 3.0 Logo Palette */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "REGISTERED SQUADS", val: squads.length, icon: Users, color: "from-cyan-500/20 to-blue-500/5", border: "border-cyan-500/30", text: "text-cyan-300" },
                  {
                    label: "TOTAL BUILDERS & PLAYERS",
                    val: squads.reduce((acc, s) => acc + 1 + s.members.length, 0),
                    icon: Zap,
                    color: "from-blue-600/20 to-cyan-500/5",
                    border: "border-blue-500/30",
                    text: "text-cyan-200"
                  },
                  { label: "ACTIVE ARENAS", val: arenas.length, icon: Layers, color: "from-cyan-600/20 to-blue-600/5", border: "border-cyan-500/30", text: "text-cyan-300" },
                  { label: "CHECKED-IN TEAMS", val: squads.filter((s) => s.status === "checked_in").length, icon: UserCheck, color: "from-sky-500/20 to-blue-500/5", border: "border-sky-500/30", text: "text-sky-300" }
                ].map((kpi, idx) => {
                  const Icon = kpi.icon;
                  return (
                    <div
                      key={idx}
                      className={`p-5 rounded-2xl bg-gradient-to-br ${kpi.color} border ${kpi.border} backdrop-blur-xl space-y-2`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-tm-mono font-bold tracking-widest text-white/50">{kpi.label}</span>
                        <Icon size={16} className={kpi.text} />
                      </div>
                      <p className={`text-3xl font-tm-heading font-black ${kpi.text}`}>{kpi.val}</p>
                    </div>
                  );
                })}
              </div>

              {/* Quick Actions Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Recent Registrations Preview */}
                <div className="p-6 rounded-2xl bg-[#0e131d] border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-tm-heading text-sm font-bold tracking-wide uppercase text-white flex items-center gap-2">
                      <Users size={15} className="text-cyan-400" />
                      <span>Latest Squad Signups</span>
                    </h2>
                    <button
                      onClick={() => setActiveTab("squads")}
                      className="text-xs font-tm-mono text-cyan-400 hover:underline"
                    >
                      View All →
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {squads.slice(0, 3).map((squad) => (
                      <div
                        key={squad._id}
                        onClick={() => {
                          setSelectedSquad(squad);
                          setActiveTab("squads");
                        }}
                        className="p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-cyan-500/40 transition cursor-pointer flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs font-bold text-white">{squad.teamName || squad.leadName}</p>
                          <p className="text-[10px] font-tm-mono text-cyan-300/70 mt-0.5">{squad.eventTitle}</p>
                        </div>
                        <div className="text-right">
                          <span className="px-2 py-0.5 rounded text-[9px] font-tm-mono bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                            {squad.members.length + 1} MEMBERS
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Arena Status Control Preview */}
                <div className="p-6 rounded-2xl bg-[#0e131d] border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-tm-heading text-sm font-bold tracking-wide uppercase text-white flex items-center gap-2">
                      <Layers size={15} className="text-cyan-400" />
                      <span>Arena Registration Switches</span>
                    </h2>
                    <button
                      onClick={() => setActiveTab("arenas")}
                      className="text-xs font-tm-mono text-cyan-400 hover:underline"
                    >
                      Manage →
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {arenas.map((arena) => (
                      <div
                        key={arena._id}
                        className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs font-bold text-white">{arena.title}</p>
                          <p className="text-[10px] font-tm-mono text-white/40 uppercase">{arena.category}</p>
                        </div>

                        <button
                          onClick={() => {
                            setArenas((prev) =>
                              prev.map((a) =>
                                a._id === arena._id ? { ...a, registrationOpen: !a.registrationOpen } : a
                              )
                            );
                            showToast(`Registration for "${arena.title}" is now ${!arena.registrationOpen ? "OPEN" : "PAUSED"}`);
                          }}
                          className={`px-2.5 py-1 rounded-md text-[10px] font-tm-mono font-bold transition ${
                            arena.registrationOpen
                              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                              : "bg-red-500/20 text-red-300 border border-red-500/40"
                          }`}
                        >
                          {arena.registrationOpen ? "OPEN (CLICK TO PAUSE)" : "PAUSED (CLICK TO OPEN)"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
              TAB 2: HERO & FESTIVAL TEXT CMS (FULL CONTROL)
              ═══════════════════════════════════════════════════════ */}
          {activeTab === "hero_cms" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-tm-heading font-black tracking-wide uppercase text-white">
                    Hero Section & Festival CMS
                  </h1>
                  <p className="text-xs font-tm-mono text-cyan-200/60 mt-1">
                    Control all festival copy, hero text, countdown clock, and CTA destinations
                  </p>
                </div>

                <button
                  onClick={() => saveCmsConfig()}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-tm-mono text-xs font-bold shadow-[0_0_25px_rgba(74,158,255,0.4)] transition"
                >
                  <Save size={15} />
                  <span>{isLoading ? "SAVING..." : "SAVE & PUBLISH CMS"}</span>
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Text & Headlines Box */}
                <div className="p-6 rounded-2xl bg-[#0e131d] border border-white/10 space-y-4">
                  <h2 className="text-xs font-tm-mono font-bold tracking-widest text-cyan-400 uppercase">
                    // HEADLINES & CAMPUS LOCATION //
                  </h2>

                  <div>
                    <label className="block text-[11px] font-tm-mono text-white/60 mb-1">FESTIVAL TITLE</label>
                    <input
                      type="text"
                      value={cmsConfig.festivalName}
                      onChange={(e) => setCmsConfig({ ...cmsConfig, festivalName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 focus:border-cyan-400 text-white text-xs font-tm-mono outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-tm-mono text-white/60 mb-1">CAMPUS VENUE LOCATION</label>
                    <input
                      type="text"
                      value={cmsConfig.campusLocation}
                      onChange={(e) => setCmsConfig({ ...cmsConfig, campusLocation: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 focus:border-cyan-400 text-white text-xs font-tm-mono outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-tm-mono text-white/60 mb-1">HERO MAIN HEADLINE</label>
                    <input
                      type="text"
                      value={cmsConfig.headline}
                      onChange={(e) => setCmsConfig({ ...cmsConfig, headline: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 focus:border-cyan-400 text-white text-xs font-tm-mono outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-tm-mono text-white/60 mb-1">SUBTITLE / TRACKS DESCRIPTION</label>
                    <textarea
                      rows={3}
                      value={cmsConfig.tagline}
                      onChange={(e) => setCmsConfig({ ...cmsConfig, tagline: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 focus:border-cyan-400 text-white text-xs font-tm-mono outline-none"
                    />
                  </div>
                </div>

                {/* Countdown & Timing Box */}
                <div className="p-6 rounded-2xl bg-[#0e131d] border border-white/10 space-y-4">
                  <h2 className="text-xs font-tm-mono font-bold tracking-widest text-cyan-400 uppercase">
                    // T-MINUS COUNTDOWN & DATES //
                  </h2>

                  <div>
                    <label className="block text-[11px] font-tm-mono text-white/60 mb-1">COUNTDOWN TARGET TIMESTAMP (ISO / DATETIME)</label>
                    <input
                      type="text"
                      value={cmsConfig.targetDate}
                      onChange={(e) => setCmsConfig({ ...cmsConfig, targetDate: e.target.value })}
                      placeholder="2026-09-15T09:00:00+05:30"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 focus:border-cyan-400 text-white text-xs font-tm-mono outline-none"
                    />
                    <span className="text-[10px] font-tm-mono text-white/40 mt-1 block">
                      Format: YYYY-MM-DDTHH:MM:SS+05:30
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-tm-mono text-white/60 mb-1">HIGHLIGHT PRIZE POOL TEXT</label>
                    <input
                      type="text"
                      value={cmsConfig.prizePoolText}
                      onChange={(e) => setCmsConfig({ ...cmsConfig, prizePoolText: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 focus:border-cyan-400 text-white text-xs font-tm-mono outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-tm-mono text-white/60 mb-1">PRIMARY CTA BUTTON LABEL</label>
                    <input
                      type="text"
                      value={cmsConfig.ctaPrimaryText}
                      onChange={(e) => setCmsConfig({ ...cmsConfig, ctaPrimaryText: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 focus:border-cyan-400 text-white text-xs font-tm-mono outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-tm-mono text-white/60 mb-1">SECONDARY CTA BUTTON LABEL</label>
                    <input
                      type="text"
                      value={cmsConfig.ctaSecondaryText}
                      onChange={(e) => setCmsConfig({ ...cmsConfig, ctaSecondaryText: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 focus:border-cyan-400 text-white text-xs font-tm-mono outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
              TAB 3: MARQUEE TICKER CONSOLE
              ═══════════════════════════════════════════════════════ */}
          {activeTab === "ticker" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-tm-heading font-black tracking-wide uppercase text-white">
                    Live Broadcast Marquee Ticker
                  </h1>
                  <p className="text-xs font-tm-mono text-cyan-200/60 mt-1">
                    Manage the real-time cycling announcement ribbon running across the top of the festival site
                  </p>
                </div>

                <button
                  onClick={() => saveCmsConfig()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-tm-mono text-xs font-bold shadow-[0_0_25px_rgba(74,158,255,0.4)] transition"
                >
                  <Save size={15} />
                  <span>SAVE TICKER BROADCAST</span>
                </button>
              </div>

              {/* Add New Line Form */}
              <div className="p-5 rounded-2xl bg-[#0e131d] border border-white/10 flex gap-3">
                <input
                  type="text"
                  value={newTickerInput}
                  onChange={(e) => setNewTickerInput(e.target.value)}
                  placeholder="Type new broadcast announcement line..."
                  className="flex-grow px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 focus:border-cyan-400 text-white text-xs font-tm-mono outline-none"
                />
                <button
                  onClick={() => {
                    if (!newTickerInput.trim()) return;
                    setTickerLines([...tickerLines, newTickerInput.trim().toUpperCase()]);
                    setNewTickerInput("");
                    showToast("Broadcast line added!");
                  }}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-tm-mono font-bold flex items-center gap-2 transition"
                >
                  <Plus size={15} />
                  <span>ADD LINE</span>
                </button>
              </div>

              {/* Active Broadcast Lines List */}
              <div className="space-y-3">
                {tickerLines.map((line, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between group hover:border-cyan-500/40 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-tm-mono font-bold text-cyan-400">
                        {(idx + 1).toString().padStart(2, "0")}.
                      </span>
                      <span className="text-xs font-tm-mono font-semibold text-white tracking-wide">{line}</span>
                    </div>

                    <button
                      onClick={() => {
                        setTickerLines(tickerLines.filter((_, i) => i !== idx));
                        showToast("Line removed");
                      }}
                      className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
              TAB 4: ARENAS & EVENTS CRUD (FULL CONTROL)
              ═══════════════════════════════════════════════════════ */}
          {activeTab === "arenas" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-tm-heading font-black tracking-wide uppercase text-white">
                    Arenas & Tournaments Studio
                  </h1>
                  <p className="text-xs font-tm-mono text-cyan-200/60 mt-1">
                    Add, edit rules, upload banners, set capacity, and manage all festival events
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingArena({
                      category: "hackathon",
                      participationMode: "team",
                      maxTeamSize: 4,
                      capacity: 50,
                      registrationOpen: true
                    });
                    setIsArenaModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-tm-mono text-xs font-bold shadow-[0_0_25px_rgba(74,158,255,0.4)] transition"
                >
                  <Plus size={16} />
                  <span>ADD NEW ARENA</span>
                </button>
              </div>

              {/* Arena Cards Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                {arenas.map((arena) => (
                  <div
                    key={arena._id}
                    className="p-5 rounded-2xl bg-[#0e131d] border border-white/10 hover:border-cyan-500/50 transition-all flex flex-col justify-between space-y-4 group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2.5 py-1 rounded text-[9px] font-tm-mono uppercase font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                          {arena.category}
                        </span>

                        <span
                          className={`w-2 h-2 rounded-full ${
                            arena.registrationOpen ? "bg-cyan-400 animate-pulse" : "bg-red-500"
                          }`}
                        />
                      </div>

                      <h3 className="font-tm-heading text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {arena.title}
                      </h3>
                      <p className="text-xs font-tm-mono text-cyan-400/80 mt-0.5">{arena.subtitle}</p>
                      <p className="text-xs text-white/60 mt-2 line-clamp-2 leading-relaxed">{arena.description}</p>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-tm-mono text-white/50">
                      <span>Venue: {arena.venue}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingArena(arena);
                            setIsArenaModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-300 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setArenas(arenas.filter((a) => a._id !== arena._id));
                            showToast(`Arena "${arena.title}" deleted.`);
                          }}
                          className="p-1 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
              TAB 5: SQUADS & ROSTERS DESK
              ═══════════════════════════════════════════════════════ */}
          {activeTab === "squads" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-tm-heading font-black tracking-wide uppercase text-white">
                    Squads & Registrations Desk
                  </h1>
                  <p className="text-xs font-tm-mono text-cyan-200/60 mt-1">
                    Review participant dossiers, verify team rosters, and manage check-in status
                  </p>
                </div>

                <button
                  onClick={() => window.open("/api/technomania/export", "_blank")}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-xs font-tm-mono text-cyan-300 font-bold transition"
                >
                  <Download size={15} />
                  <span>EXPORT STUDENTMEMBERS.XLSX</span>
                </button>
              </div>

              {/* Filters & Search */}
              <div className="p-4 rounded-2xl bg-[#0e131d] border border-white/10 flex flex-col md:flex-row gap-3 items-center justify-between">
                <div className="relative w-full md:w-80">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    value={squadSearch}
                    onChange={(e) => setSquadSearch(e.target.value)}
                    placeholder="Search squad, leader, UID or email..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/60 border border-white/10 focus:border-cyan-400 text-white text-xs font-tm-mono outline-none"
                  />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <select
                    value={squadStatusFilter}
                    onChange={(e) => setSquadStatusFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs font-tm-mono outline-none"
                  >
                    <option value="all">ALL STATUSES</option>
                    <option value="confirmed">CONFIRMED</option>
                    <option value="checked_in">CHECKED-IN</option>
                    <option value="pending">PENDING</option>
                  </select>
                </div>
              </div>

              {/* Squads Table */}
              <div className="rounded-2xl bg-[#0e131d] border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-tm-mono">
                    <thead className="bg-black/40 border-b border-white/10 text-white/40 uppercase">
                      <tr>
                        <th className="p-4">Squad / Leader</th>
                        <th className="p-4">University UID</th>
                        <th className="p-4">Arena Track</th>
                        <th className="p-4">Roster Size</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredSquads.map((squad) => (
                        <tr key={squad._id} className="hover:bg-white/[0.02] transition">
                          <td className="p-4">
                            <div className="font-bold text-white">{squad.teamName || squad.leadName}</div>
                            <div className="text-[10px] text-cyan-300/70">{squad.leadEmail}</div>
                          </td>
                          <td className="p-4 text-cyan-400 font-bold">{squad.leadUid}</td>
                          <td className="p-4 text-white/80">{squad.eventTitle}</td>
                          <td className="p-4 text-white/60">{squad.members.length + 1} Members</td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                                squad.status === "checked_in"
                                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                                  : "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                              }`}
                            >
                              {squad.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => setSelectedSquad(squad)}
                              className="px-3 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition"
                            >
                              Inspect Dossier
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
              TAB 6: LIVE SCORING & LEADERBOARDS
              ═══════════════════════════════════════════════════════ */}
          {activeTab === "leaderboard" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-tm-heading font-black tracking-wide uppercase text-white">
                    Live Scoring & Leaderboard Desk
                  </h1>
                  <p className="text-xs font-tm-mono text-cyan-200/60 mt-1">
                    Assign ranks, update live point tallies, and publish standing updates
                  </p>
                </div>

                <button
                  onClick={() => {
                    const newEntry: LeaderboardItem = {
                      id: `lb-${Date.now()}`,
                      arena: arenas[0]?.title || "Code Storm 24H",
                      teamName: "New Finalist Team",
                      rank: leaderboard.length + 1,
                      points: 750,
                      status: "Qualified"
                    };
                    setLeaderboard([...leaderboard, newEntry]);
                    showToast("New leaderboard standing entry created.");
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-tm-mono text-xs font-bold shadow-[0_0_25px_rgba(74,158,255,0.4)] transition"
                >
                  <Plus size={15} />
                  <span>ADD RANK ENTRY</span>
                </button>
              </div>

              {/* Leaderboard Table */}
              <div className="rounded-2xl bg-[#0e131d] border border-white/10 overflow-hidden">
                <table className="w-full text-left text-xs font-tm-mono">
                  <thead className="bg-black/40 border-b border-white/10 text-white/40 uppercase">
                    <tr>
                      <th className="p-4">Rank</th>
                      <th className="p-4">Team Name</th>
                      <th className="p-4">Arena Track</th>
                      <th className="p-4">Score / Points</th>
                      <th className="p-4">Status / Badge</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {leaderboard.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-white/[0.02] transition">
                        <td className="p-4 font-black text-cyan-400 text-base">#{item.rank}</td>
                        <td className="p-4 font-bold text-white">{item.teamName}</td>
                        <td className="p-4 text-cyan-200/70">{item.arena}</td>
                        <td className="p-4 font-black text-cyan-300">{item.points} PTS</td>
                        <td className="p-4">
                          <span className="px-2.5 py-0.5 rounded text-[10px] bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold">
                            {item.badge || item.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => {
                              const newPoints = prompt("Enter updated points:", String(item.points));
                              if (newPoints && !isNaN(Number(newPoints))) {
                                setLeaderboard((prev) =>
                                  prev.map((lb) => (lb.id === item.id ? { ...lb, points: Number(newPoints) } : lb))
                                );
                                showToast(`Score for "${item.teamName}" updated to ${newPoints} PTS!`);
                              }
                            }}
                            className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-cyan-300 mr-2 transition"
                          >
                            Update Points
                          </button>
                          <button
                            onClick={() => setLeaderboard(leaderboard.filter((lb) => lb.id !== item.id))}
                            className="p-1 rounded hover:bg-red-500/20 text-white/40 hover:text-red-400 transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
              TAB 7: TIMELINE & AGENDA BUILDER
              ═══════════════════════════════════════════════════════ */}
          {activeTab === "schedule" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-tm-heading font-black tracking-wide uppercase text-white">
                    Timeline & Schedule Builder
                  </h1>
                  <p className="text-xs font-tm-mono text-cyan-200/60 mt-1">
                    Manage festival timings, day-wise rounds, and venue slots
                  </p>
                </div>

                <button
                  onClick={() => {
                    const newItem: ScheduleItem = {
                      id: `sc-${Date.now()}`,
                      day: "Day 1 — Sep 15",
                      time: "02:00 PM",
                      title: "New Tournament Round",
                      venue: "Auditorium 2",
                      category: "Esports",
                      status: "upcoming"
                    };
                    setScheduleItems([...scheduleItems, newItem]);
                    showToast("Schedule event slot added.");
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-tm-mono text-xs font-bold shadow-[0_0_25px_rgba(74,158,255,0.4)] transition"
                >
                  <Plus size={15} />
                  <span>ADD SCHEDULE SLOT</span>
                </button>
              </div>

              <div className="space-y-3">
                {scheduleItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-[#0e131d] border border-white/10 flex items-center justify-between hover:border-cyan-500/40 transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold text-xs font-tm-mono">
                        {item.time}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{item.title}</h4>
                        <p className="text-xs font-tm-mono text-cyan-400/70 mt-0.5">
                          {item.day} · {item.venue} · [{item.category}]
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setScheduleItems(scheduleItems.filter((sc) => sc.id !== item.id))}
                      className="p-2 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
              TAB 8: COMMITTEE & ORGANIZERS
              ═══════════════════════════════════════════════════════ */}
          {activeTab === "committee" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-tm-heading font-black tracking-wide uppercase text-white">
                    Committee & Leads Manager
                  </h1>
                  <p className="text-xs font-tm-mono text-cyan-200/60 mt-1">
                    Manage festival core leads, coordinators, and student department champions
                  </p>
                </div>

                <button
                  onClick={() => {
                    const newLead: CommitteeMember = {
                      id: `cm-${Date.now()}`,
                      name: "Student Lead Name",
                      role: "Domain Lead",
                      domain: "Technical & Operations",
                      contact: "lead@techtatva.in"
                    };
                    setCommittee([...committee, newLead]);
                    showToast("Committee lead slot added.");
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-tm-mono text-xs font-bold shadow-[0_0_25px_rgba(74,158,255,0.4)] transition"
                >
                  <Plus size={15} />
                  <span>ADD COMMITTEE LEAD</span>
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {committee.map((mem) => (
                  <div key={mem.id} className="p-5 rounded-2xl bg-[#0e131d] border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-white text-sm">{mem.name}</h3>
                      <span className="px-2 py-0.5 rounded text-[9px] font-tm-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                        {mem.domain}
                      </span>
                    </div>
                    <p className="text-xs font-tm-mono text-cyan-400/80">{mem.role}</p>
                    <p className="text-[11px] font-tm-mono text-white/40">{mem.contact}</p>

                    <div className="pt-2 border-t border-white/5 flex justify-end">
                      <button
                        onClick={() => setCommittee(committee.filter((c) => c.id !== mem.id))}
                        className="p-1 rounded hover:bg-red-500/20 text-white/40 hover:text-red-400 transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
              TAB 9: FESTIVAL FAQS
              ═══════════════════════════════════════════════════════ */}
          {activeTab === "faqs" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-tm-heading font-black tracking-wide uppercase text-white">
                    Festival FAQs Desk
                  </h1>
                  <p className="text-xs font-tm-mono text-cyan-200/60 mt-1">
                    Manage frequently asked questions displayed across festival landing pages
                  </p>
                </div>

                <button
                  onClick={() => saveCmsConfig()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-tm-mono text-xs font-bold shadow-[0_0_25px_rgba(74,158,255,0.4)] transition"
                >
                  <Save size={15} />
                  <span>SAVE FAQS</span>
                </button>
              </div>

              {/* Add FAQ form */}
              <div className="p-5 rounded-2xl bg-[#0e131d] border border-white/10 space-y-3">
                <input
                  type="text"
                  id="newFaqQ"
                  placeholder="Question text..."
                  className="w-full px-4 py-2 rounded-xl bg-black/60 border border-white/10 focus:border-cyan-400 text-white text-xs font-tm-mono outline-none"
                />
                <textarea
                  id="newFaqA"
                  rows={2}
                  placeholder="Answer explanation..."
                  className="w-full px-4 py-2 rounded-xl bg-black/60 border border-white/10 focus:border-cyan-400 text-white text-xs font-tm-mono outline-none"
                />
                <button
                  onClick={() => {
                    const qInput = document.getElementById("newFaqQ") as HTMLInputElement;
                    const aInput = document.getElementById("newFaqA") as HTMLTextAreaElement;
                    if (!qInput.value.trim() || !aInput.value.trim()) return;
                    setFaqs([...faqs, { q: qInput.value.trim(), a: aInput.value.trim() }]);
                    qInput.value = "";
                    aInput.value = "";
                    showToast("FAQ added!");
                  }}
                  className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-tm-mono font-bold transition"
                >
                  + ADD FAQ ENTRY
                </button>
              </div>

              {/* FAQ List */}
              <div className="space-y-3">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#0e131d] border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-xs">{faq.q}</h4>
                      <button
                        onClick={() => setFaqs(faqs.filter((_, i) => i !== idx))}
                        className="p-1 rounded hover:bg-red-500/20 text-white/40 hover:text-red-400 transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <p className="text-xs text-white/60 leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
              TAB 10: ON-GROUND QR GATE CHECK-IN
              ═══════════════════════════════════════════════════════ */}
          {activeTab === "checkin" && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h1 className="text-2xl font-tm-heading font-black tracking-wide uppercase text-white">
                  On-Ground Gate Check-In Desk
                </h1>
                <p className="text-xs font-tm-mono text-cyan-200/60 mt-1">
                  Validate digital passes, verify participant UIDs, and stamp attendance
                </p>
              </div>

              <form onSubmit={handleCheckInSubmit} className="p-6 rounded-2xl bg-[#0e131d] border border-white/10 space-y-4">
                <label className="block text-xs font-tm-mono font-bold text-cyan-400 uppercase">
                  ENTER TICKET TOKEN OR STUDENT UID
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={checkInInput}
                    onChange={(e) => setCheckInInput(e.target.value)}
                    placeholder="e.g. TM3-CS24-9981A or 22BCS10192"
                    className="flex-grow px-4 py-3 rounded-xl bg-black/60 border border-white/10 focus:border-cyan-400 text-white text-xs font-tm-mono outline-none"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-tm-mono text-xs font-bold shadow-[0_0_25px_rgba(74,158,255,0.4)] transition"
                  >
                    VERIFY
                  </button>
                </div>
              </form>

              {checkInResult && (
                <div
                  className={`p-5 rounded-2xl border ${
                    checkInResult.status === "success"
                      ? "bg-cyan-950/40 border-cyan-400 text-cyan-200 shadow-[0_0_30px_rgba(74,158,255,0.3)]"
                      : "bg-red-950/40 border-red-500 text-red-200"
                  }`}
                >
                  <p className="font-tm-mono text-xs font-bold">{checkInResult.text}</p>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
              TAB 11: MEDIA & ASSETS HUB
              ═══════════════════════════════════════════════════════ */}
          {activeTab === "media" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-tm-heading font-black tracking-wide uppercase text-white">
                    Media & Asset Library
                  </h1>
                  <p className="text-xs font-tm-mono text-cyan-200/60 mt-1">
                    Upload festival logos, posters, sponsor emblems, and event banners
                  </p>
                </div>

                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-tm-mono text-xs font-bold shadow-[0_0_25px_rgba(74,158,255,0.4)] transition"
                  >
                    <Upload size={16} />
                    <span>{isUploading ? "UPLOADING..." : "UPLOAD NEW ASSET"}</span>
                  </button>
                </div>
              </div>

              {/* Uploaded assets grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {uploadedMedia.map((media, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-[#0e131d] border border-white/10 hover:border-cyan-400/50 transition flex flex-col space-y-2 group"
                  >
                    <div className="relative h-28 w-full bg-black/60 rounded-xl overflow-hidden flex items-center justify-center p-2">
                      <Image
                        src={media.url}
                        alt={media.name}
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                    <div className="text-[10px] font-tm-mono truncate text-white/80 font-bold">{media.name}</div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(media.url);
                        showToast(`Copied URL: ${media.url}`);
                      }}
                      className="w-full py-1 text-center rounded bg-white/5 hover:bg-cyan-500/20 text-cyan-300 text-[10px] font-tm-mono transition"
                    >
                      Copy URL
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── SQUAD INSPECTOR DOSSIER MODAL ── */}
      {selectedSquad && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#0c1017] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_0_60px_rgba(74,158,255,0.3)]">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-tm-mono text-cyan-400 tracking-widest uppercase">
                  // PARTICIPANT DOSSIER //
                </span>
                <h2 className="font-tm-heading text-xl font-bold text-white">
                  {selectedSquad.teamName || selectedSquad.leadName}
                </h2>
              </div>
              <button
                onClick={() => setSelectedSquad(null)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Leader Details */}
            <div className="p-4 rounded-xl bg-black/60 border border-white/5 space-y-2">
              <h4 className="text-[11px] font-tm-mono font-bold text-cyan-400 uppercase">
                SQUAD LEADER / PRIMARY CONTACT
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs font-tm-mono">
                <div><span className="text-white/40">Name:</span> <span className="text-white font-bold">{selectedSquad.leadName}</span></div>
                <div><span className="text-white/40">UID:</span> <span className="text-cyan-300 font-bold">{selectedSquad.leadUid}</span></div>
                <div><span className="text-white/40">Email:</span> <span className="text-white">{selectedSquad.leadEmail}</span></div>
                <div><span className="text-white/40">Phone:</span> <span className="text-white">{selectedSquad.leadPhone}</span></div>
                <div className="col-span-2"><span className="text-white/40">Program:</span> <span className="text-white">{selectedSquad.leadProgram} (Sem {selectedSquad.leadSemester})</span></div>
              </div>
            </div>

            {/* Team Members List */}
            {selectedSquad.members.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-[11px] font-tm-mono font-bold text-cyan-400 uppercase">
                  SQUAD ROSTER ({selectedSquad.members.length} MEMBERS)
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedSquad.members.map((m, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs font-tm-mono flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white">{m.name}</p>
                        <p className="text-[10px] text-white/50">{m.email} · {m.program}</p>
                      </div>
                      <span className="text-cyan-400 font-bold">{m.uid}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Status Buttons */}
            <div className="pt-4 border-t border-white/10 flex flex-wrap gap-2 justify-end">
              <button
                onClick={() => updateSquadStatus(selectedSquad._id, "confirmed")}
                className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-tm-mono font-bold"
              >
                CONFIRM SQUAD
              </button>
              <button
                onClick={() => updateSquadStatus(selectedSquad._id, "checked_in")}
                className="px-4 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-tm-mono font-bold"
              >
                CHECK-IN AT GATE
              </button>
              <button
                onClick={() => updateSquadStatus(selectedSquad._id, "cancelled")}
                className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-tm-mono font-bold"
              >
                CANCEL / REJECT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ARENA CREATION / EDIT MODAL ── */}
      {isArenaModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#0c1017] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 space-y-5 shadow-[0_0_60px_rgba(74,158,255,0.3)] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="font-tm-heading text-lg font-bold text-white">
                {editingArena?._id ? "Edit Arena Event" : "Create New Festival Arena"}
              </h2>
              <button
                onClick={() => setIsArenaModalOpen(false)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs font-tm-mono">
              <div>
                <label className="block text-white/60 mb-1">ARENA TITLE</label>
                <input
                  type="text"
                  value={editingArena?.title || ""}
                  onChange={(e) => setEditingArena({ ...editingArena, title: e.target.value })}
                  placeholder="e.g. Code Storm 24H"
                  className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 focus:border-cyan-400 text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/60 mb-1">CATEGORY TRACK</label>
                  <select
                    value={editingArena?.category || "hackathon"}
                    onChange={(e) => setEditingArena({ ...editingArena, category: e.target.value as any })}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-white outline-none"
                  >
                    <option value="hackathon">Hackathon</option>
                    <option value="esports">Esports Arena</option>
                    <option value="cultural">Cultural Stage</option>
                    <option value="sub-events">Sub-Events</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/60 mb-1">CAPACITY (SLOTS)</label>
                  <input
                    type="number"
                    value={editingArena?.capacity || 50}
                    onChange={(e) => setEditingArena({ ...editingArena, capacity: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 focus:border-cyan-400 text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/60 mb-1">CAMPUS VENUE / ROOM</label>
                <input
                  type="text"
                  value={editingArena?.venue || ""}
                  onChange={(e) => setEditingArena({ ...editingArena, venue: e.target.value })}
                  placeholder="e.g. Block D Labs"
                  className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 focus:border-cyan-400 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-white/60 mb-1">PRIZES & REWARDS SUMMARY</label>
                <input
                  type="text"
                  value={editingArena?.prizes || ""}
                  onChange={(e) => setEditingArena({ ...editingArena, prizes: e.target.value })}
                  placeholder="e.g. ₹XX,XXX CASH & INTERNSHIPS"
                  className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 focus:border-cyan-400 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-white/60 mb-1">DESCRIPTION</label>
                <textarea
                  rows={3}
                  value={editingArena?.description || ""}
                  onChange={(e) => setEditingArena({ ...editingArena, description: e.target.value })}
                  placeholder="Detailed track briefing..."
                  className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 focus:border-cyan-400 text-white outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
              <button
                onClick={() => setIsArenaModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 text-white/60 text-xs font-tm-mono"
              >
                CANCEL
              </button>
              <button
                onClick={() => {
                  if (!editingArena?.title) return;
                  if (editingArena._id) {
                    setArenas(arenas.map((a) => (a._id === editingArena._id ? ({ ...a, ...editingArena } as ArenaEvent) : a)));
                  } else {
                    const newArena: ArenaEvent = {
                      _id: `arena-${Date.now()}`,
                      title: editingArena.title,
                      slug: editingArena.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                      category: editingArena.category || "hackathon",
                      participationMode: editingArena.participationMode || "team",
                      maxTeamSize: editingArena.maxTeamSize || 4,
                      capacity: editingArena.capacity || 50,
                      venue: editingArena.venue || "Campus Labs",
                      status: "published",
                      registrationOpen: true,
                      startAt: "2026-09-15T09:00:00",
                      description: editingArena.description || "",
                      prizes: editingArena.prizes || ""
                    };
                    setArenas([...arenas, newArena]);
                  }
                  setIsArenaModalOpen(false);
                  showToast(`✓ Arena "${editingArena.title}" saved successfully!`);
                }}
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-tm-mono font-bold transition"
              >
                SAVE ARENA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
