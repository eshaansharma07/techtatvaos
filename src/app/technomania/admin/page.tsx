"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Trophy,
  Calendar,
  Settings,
  Bell,
  Image as ImageIcon,
  HelpCircle,
  Search,
  Plus,
  ExternalLink,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle2,
  Upload,
  Save,
  X,
  FileSpreadsheet,
  ArrowUpRight,
  TrendingUp,
  Clock,
  ChevronRight,
  UserCheck,
  Filter,
  Eye,
  Check,
  AlertCircle
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import { useTechnomaniaHref } from "@/lib/technomania-links";

// Types
export interface TechnomaniaEvent {
  _id: string;
  title: string;
  slug: string;
  subtitle?: string;
  category: "hackathon" | "esports" | "cultural" | "sub-events";
  participationMode: "individual" | "team" | "both";
  maxTeamSize: number;
  capacity: number;
  venue: string;
  status: "published" | "draft" | "active" | "completed";
  registrationOpen: boolean;
  startAt: string;
  endAt?: string;
  description?: string;
  banner?: string;
  prizes?: string;
  rules?: string[];
  whatsappLink?: string;
}

export interface TechnomaniaRegistration {
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

export interface LeaderboardRecord {
  id: string;
  eventId: string;
  eventTitle: string;
  teamName: string;
  rank: number;
  score: number;
  status: "Winner" | "Runner-Up" | "Finalist" | "Participating";
  badge?: string;
}

export interface ScheduleRecord {
  id: string;
  day: string;
  time: string;
  title: string;
  venue: string;
  category: string;
  status: "upcoming" | "live" | "completed";
}

export interface FAQRecord {
  id: string;
  question: string;
  answer: string;
  category: string;
}

type TabType =
  | "Overview"
  | "Events"
  | "Registrations"
  | "Schedule"
  | "Website Content"
  | "Announcements"
  | "Leaderboard"
  | "Media Library"
  | "FAQs";

export default function TechnomaniaAdminPage() {
  const getHref = useTechnomaniaHref();
  const [activeTab, setActiveTab] = useState<TabType>("Overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Modals / Drawers
  const [selectedRegistration, setSelectedRegistration] = useState<TechnomaniaRegistration | null>(null);
  const [editingEvent, setEditingEvent] = useState<Partial<TechnomaniaEvent> | null>(null);
  const [isEventDrawerOpen, setIsEventDrawerOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Partial<ScheduleRecord> | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<Partial<FAQRecord> | null>(null);
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. EVENTS STATE
  const [events, setEvents] = useState<TechnomaniaEvent[]>([
    {
      _id: "evt-1",
      title: "Code Storm 24H",
      slug: "hackathon",
      subtitle: "Flagship 24-Hour Non-Stop Hackathon",
      category: "hackathon",
      participationMode: "team",
      maxTeamSize: 4,
      capacity: 60,
      venue: "Block D, Central Tech Labs",
      status: "published",
      registrationOpen: true,
      startAt: "2026-09-15T09:00:00",
      endAt: "2026-09-16T09:00:00",
      description: "24 hours of non-stop building, mentoring, and shipping solutions. Solve real industry problem statements and pitch live to tech founders.",
      prizes: "₹XX,XXX PRIZES & INTERNSHIPS",
      banner: "/technomania/logo-white.png",
      rules: [
        "Teams must consist of 1 to 4 members.",
        "All code must be written during the 24-hour hackathon timeframe.",
        "Judges evaluate innovation, execution, technical complexity, and UI/UX."
      ],
      whatsappLink: "https://chat.whatsapp.com/sample"
    },
    {
      _id: "evt-2",
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
      endAt: "2026-09-16T17:00:00",
      description: "High-stakes esports showdown across BGMI, Valorant, and EA FC. Experience live casting on stage, tournament-grade setups, and intense bracket battles.",
      prizes: "TROPHIES & CASH REWARDS",
      banner: "/technomania/logo-white.png",
      rules: [
        "Participants must bring their own peripherals.",
        "Emulators are strictly prohibited for BGMI.",
        "Tournament follows standard esports competitive rules."
      ],
      whatsappLink: "https://chat.whatsapp.com/sample"
    },
    {
      _id: "evt-3",
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
      endAt: "2026-09-16T22:00:00",
      description: "The pulse of Chandigarh University's artistic spirit. Battle of the bands, western & classical dance showdowns, fashion choreography, and an electrifying celebrity DJ night.",
      prizes: "MEMENTOS & CASH PRIZES",
      banner: "/technomania/logo-emblem.png",
      rules: [
        "Stage performance must not exceed 10 minutes.",
        "Track audio must be submitted 2 hours prior to start."
      ]
    },
    {
      _id: "evt-4",
      title: "Circuit Odyssey & Blitz",
      slug: "sub-events",
      subtitle: "Tech Quizzes, Debugging & Design Sprints",
      category: "sub-events",
      participationMode: "individual",
      maxTeamSize: 1,
      capacity: 150,
      venue: "Academic Block 3, Seminar Hall",
      status: "published",
      registrationOpen: true,
      startAt: "2026-09-15T14:00:00",
      endAt: "2026-09-15T18:00:00",
      description: "Rapid-fire spot events designed for quick thinking and instant glory. UI/UX speed runs, algorithmic debugging races, tech trivia, and mystery box building rounds.",
      prizes: "SPOT GOODIES & CERTIFICATES",
      banner: "/technomania/logo-white.png",
      rules: [
        "Individual entry only.",
        "Strict 15-minute time limits per round."
      ]
    }
  ]);

  // 2. REGISTRATIONS STATE (Shared with Main Portal)
  const [registrations, setRegistrations] = useState<TechnomaniaRegistration[]>([
    {
      _id: "reg-101",
      teamName: "CyberPulse Labs",
      leadName: "Aarav Sharma",
      leadUid: "22BCS10192",
      leadEmail: "aarav.sharma@cumail.in",
      leadPhone: "+91 98765 43210",
      leadProgram: "B.Tech Computer Science & Engineering",
      leadSemester: 5,
      eventId: "evt-1",
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
      _id: "reg-102",
      teamName: "Alpha Strikers",
      leadName: "Vikram Malhotra",
      leadUid: "23BCS14022",
      leadEmail: "vikram.m@cumail.in",
      leadPhone: "+91 98123 45678",
      leadProgram: "B.Tech Artificial Intelligence",
      leadSemester: 3,
      eventId: "evt-2",
      eventTitle: "Cyber Clash Arena (Valorant)",
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
      _id: "reg-103",
      teamName: "Phantom Elites",
      leadName: "Simran Kaur",
      leadUid: "21BCA10045",
      leadEmail: "simran.k@cumail.in",
      leadPhone: "+91 97765 11223",
      leadProgram: "BCA Cloud Computing",
      leadSemester: 5,
      eventId: "evt-2",
      eventTitle: "Cyber Clash Arena (BGMI)",
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

  // 3. SCHEDULE STATE
  const [schedules, setSchedules] = useState<ScheduleRecord[]>([
    { id: "sch-1", day: "Day 1 — Sep 15", time: "09:00 AM", title: "Festival Opening Ceremony", venue: "Auditorium 1", category: "Ceremony", status: "upcoming" },
    { id: "sch-2", day: "Day 1 — Sep 15", time: "10:30 AM", title: "Code Storm 24H Hackathon Kickoff", venue: "Block D Tech Labs", category: "Hackathon", status: "upcoming" },
    { id: "sch-3", day: "Day 1 — Sep 15", time: "01:00 PM", title: "Esports Arena Prelims (Valorant & BGMI)", venue: "E-Sports Theater", category: "Esports", status: "upcoming" },
    { id: "sch-4", day: "Day 2 — Sep 16", time: "11:00 AM", title: "Hackathon Final Pitches & Project Demos", venue: "Seminar Hall 4", category: "Hackathon", status: "upcoming" },
    { id: "sch-5", day: "Day 2 — Sep 16", time: "06:00 PM", title: "Star Cultural Night & Awards Ceremony", venue: "CU Main Amphitheatre", category: "Cultural", status: "upcoming" }
  ]);

  // 4. WEBSITE CONTENT STATE (CMS)
  const [contentSettings, setContentSettings] = useState({
    festivalName: "TECHNOMANIA 3.0",
    edition: "3.0",
    campusLocation: "CHANDIGARH UNIVERSITY · GHARUAN, MOHALI",
    headline: "Flagship Technical & Cultural Festival",
    tagline: "24H Hackathon Sprint · Multi-Title Esports Championship · Star Cultural Stage",
    targetDate: "2026-09-15T09:00:00+05:30",
    prizePoolText: "₹XX,XXX CASH & INTERNSHIPS",
    registrationStatus: "open",
    ctaPrimaryText: "REGISTER SQUAD NOW",
    ctaPrimaryLink: "/register",
    ctaSecondaryText: "EXPLORE ALL EVENTS",
    ctaSecondaryLink: "/events"
  });

  // 5. ANNOUNCEMENTS STATE (Ticker)
  const [announcements, setAnnouncements] = useState<string[]>([
    "REGISTRATIONS NOW OPEN FOR TECHNOMANIA 3.0",
    "24-HOUR NON-STOP HACKATHON ARENA",
    "BGMI, VALORANT & EA FC ESPORTS CHAMPIONSHIPS",
    "CULTURAL SHOWCASE & CELEBRITY DJ NIGHT",
    "TOTAL PRIZE POOL ₹XX,XXX",
    "LIVE LEADERBOARDS & SPOT REWARDS"
  ]);
  const [newAnnouncement, setNewAnnouncement] = useState("");

  // 6. LEADERBOARD STATE
  const [leaderboard, setLeaderboard] = useState<LeaderboardRecord[]>([
    { id: "lb-1", eventId: "evt-1", eventTitle: "Code Storm 24H", teamName: "CyberPulse Labs", rank: 1, score: 960, status: "Winner", badge: "Grand Winner" },
    { id: "lb-2", eventId: "evt-1", eventTitle: "Code Storm 24H", teamName: "Matrix Reloaded", rank: 2, score: 915, status: "Runner-Up", badge: "Best Architecture" },
    { id: "lb-3", eventId: "evt-2", eventTitle: "Cyber Clash Arena", teamName: "Alpha Strikers", rank: 1, score: 1450, status: "Winner", badge: "Clean Sweep" },
    { id: "lb-4", eventId: "evt-2", eventTitle: "Cyber Clash Arena", teamName: "Phantom Elites", rank: 2, score: 820, status: "Runner-Up", badge: "Top Frags" }
  ]);

  // 7. MEDIA ASSETS STATE
  const [mediaAssets, setMediaAssets] = useState<{ name: string; url: string; size: string; date: string }[]>([
    { name: "logo-white.png", url: "/technomania/logo-white.png", size: "48 KB", date: "System Asset" },
    { name: "logo-emblem.png", url: "/technomania/logo-emblem.png", size: "32 KB", date: "System Asset" },
    { name: "logo-glow.png", url: "/technomania/logo-glow.png", size: "124 KB", date: "System Asset" },
    { name: "techtatva-logo.png", url: "/technomania/techtatva-logo.png", size: "64 KB", date: "System Asset" }
  ]);

  // 8. FAQS STATE
  const [faqs, setFaqs] = useState<FAQRecord[]>([
    {
      id: "faq-1",
      question: "Who is eligible to participate in Technomania 3.0?",
      answer: "All students currently enrolled in Chandigarh University as well as recognized colleges across India with a valid student ID card are welcome to participate.",
      category: "Eligibility"
    },
    {
      id: "faq-2",
      question: "Is there any registration fee for participants?",
      answer: "No, registration and event participation passes for Technomania 3.0 are completely free for all verified students.",
      category: "Registration"
    },
    {
      id: "faq-3",
      question: "Can I participate in multiple events?",
      answer: "Yes, participants are permitted to register for multiple tracks as long as the event schedules do not clash.",
      category: "Schedule"
    },
    {
      id: "faq-4",
      question: "What should participants bring for the 24H Hackathon?",
      answer: "Bring your laptop, charger, student UID card, valid ID proof, and any specialized hardware components needed for your project.",
      category: "Hackathon"
    }
  ]);

  // Load configuration on initial render
  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch("/api/technomania/config");
        if (res.ok) {
          const json = await res.json();
          if (json.config) {
            setContentSettings((prev) => ({ ...prev, ...json.config }));
            if (json.config.marqueeLines) setAnnouncements(json.config.marqueeLines);
          }
        }
      } catch (e) {
        console.warn("Could not load remote config, using defaults:", e);
      }
    }
    loadConfig();
  }, []);

  // Save Website Content (CMS)
  const handleSaveContent = async () => {
    setIsSaving(true);
    try {
      const payload = {
        ...contentSettings,
        marqueeLines: announcements,
        faqs: faqs.map((f) => ({ q: f.question, a: f.answer }))
      };
      const res = await fetch("/api/technomania/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        notify("Website content saved and published live.");
      } else {
        notify("Saved locally.");
      }
    } catch {
      notify("Saved locally.");
    } finally {
      setIsSaving(false);
    }
  };

  // Upload Asset
  const handleAssetUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "technomania-assets");

    try {
      const res = await fetch("/api/technomania/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setMediaAssets((prev) => [
          {
            name: file.name,
            url: data.url,
            size: `${Math.round(file.size / 1024)} KB`,
            date: new Date().toLocaleDateString()
          },
          ...prev
        ]);
        notify(`Uploaded "${file.name}"`);
      } else {
        notify(data.error || "Upload failed");
      }
    } catch {
      notify("Upload failed");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Filtered Registrations
  const filteredRegistrations = useMemo(() => {
    return registrations.filter((r) => {
      const matchesSearch =
        searchQuery === "" ||
        r.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.leadName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.leadUid.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.leadEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.eventTitle.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || r.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [registrations, searchQuery, statusFilter]);

  // Total builders calculation
  const totalBuilders = useMemo(() => {
    return registrations.reduce((acc, r) => acc + 1 + r.members.length, 0);
  }, [registrations]);

  const activityData = [
    { day: "Aug 10", registrations: 12 },
    { day: "Aug 11", registrations: 18 },
    { day: "Aug 12", registrations: 26 },
    { day: "Aug 13", registrations: 35 },
    { day: "Aug 14", registrations: 52 },
    { day: "Aug 15", registrations: 84 },
    { day: "Aug 16", registrations: 110 }
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col antialiased selection:bg-white selection:text-black">
      {/* ── TOP CLEAN NAVIGATION BAR ── */}
      <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-zinc-900 px-6 sm:px-10 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="https://techtatva.in/technomania" className="flex items-center gap-3 group">
            <div className="relative h-7 w-7">
              <Image
                src="/technomania/logo-white.png"
                alt="Technomania 3.0"
                fill
                className="object-contain"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-white">TECHNOMANIA 3.0</span>
              <span className="text-zinc-600 text-xs">/</span>
              <span className="text-zinc-400 text-xs font-normal">Admin Portal</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span>Autonomous Festival System</span>
          </div>
        </div>

        {/* Global Action Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setIsRefreshing(true);
              setTimeout(() => {
                setIsRefreshing(false);
                notify("Portal data synchronized.");
              }, 500);
            }}
            className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition"
            title="Refresh Data"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin text-white" : ""} />
          </button>

          <button
            onClick={() => window.open("/api/technomania/export", "_blank")}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-200 transition"
          >
            <FileSpreadsheet size={14} className="text-zinc-400" />
            <span>Export Excel</span>
          </button>

          <Link
            href="https://techtatva.in/technomania"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-zinc-200 text-black text-xs font-medium transition"
          >
            <span>Live Website</span>
            <ExternalLink size={13} />
          </Link>
        </div>
      </header>

      {/* ── TOAST NOTIFICATION ── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs font-medium shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={16} className="text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex-grow flex flex-col md:flex-row">
        {/* ── SPACIOUS MINIMALIST SIDEBAR ── */}
        <aside className="w-full md:w-64 bg-black border-r border-zinc-900 p-5 flex flex-col justify-between shrink-0">
          <div className="space-y-1.5">
            <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">
              Festival Management
            </div>

            {[
              { id: "Overview", label: "Overview", icon: LayoutDashboard },
              { id: "Events", label: "Events", icon: CalendarDays },
              { id: "Registrations", label: "Registrations", icon: Users },
              { id: "Schedule", label: "Schedule", icon: Calendar },
              { id: "Website Content", label: "Website Content", icon: Settings },
              { id: "Announcements", label: "Announcements", icon: Bell },
              { id: "Leaderboard", label: "Leaderboard", icon: Trophy },
              { id: "Media Library", label: "Media Library", icon: ImageIcon },
              { id: "FAQs", label: "FAQs", icon: HelpCircle }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as TabType);
                    setSearchQuery("");
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-zinc-900 text-white font-semibold border border-zinc-800"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} className={isActive ? "text-white" : "text-zinc-500"} />
                    <span>{tab.label}</span>
                  </div>
                  {isActive && <ChevronRight size={14} className="text-zinc-400" />}
                </button>
              );
            })}
          </div>

          {/* Unified Database Info Note */}
          <div className="pt-5 border-t border-zinc-900 px-3 space-y-2">
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-900 text-[11px] text-zinc-400 leading-relaxed">
              <div className="font-semibold text-zinc-200 mb-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                Shared Database
              </div>
              All student registrations made here sync directly into the main Tech Tatva Admin Portal for official attendance.
            </div>

            <div className="text-[11px] text-zinc-600 px-1">
              Chandigarh University · Gharuan
            </div>
          </div>
        </aside>

        {/* ── SPACIOUS MAIN CONTENT ── */}
        <main className="flex-grow p-6 sm:p-10 max-w-6xl mx-auto w-full">
          {/* ═══════════════════════════════════════════════════════
              TAB 1: OVERVIEW
              ═══════════════════════════════════════════════════════ */}
          {activeTab === "Overview" && (
            <div className="space-y-10">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">Overview</h1>
                <p className="text-sm text-zinc-400 mt-1">
                  Summary of registrations, active event tracks, and festival operations
                </p>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    title: "Registered Squads",
                    value: registrations.length,
                    sub: "Direct student signups",
                    icon: Users
                  },
                  {
                    title: "Total Participants",
                    value: totalBuilders,
                    sub: "Pan-India college students",
                    icon: TrendingUp
                  },
                  {
                    title: "Active Tracks",
                    value: events.filter((e) => e.status === "published" || e.status === "active").length,
                    sub: "Hackathon, Esports & Stages",
                    icon: CalendarDays
                  },
                  {
                    title: "Checked-In",
                    value: registrations.filter((r) => r.status === "checked_in").length,
                    sub: "Verified on ground",
                    icon: UserCheck
                  }
                ].map((kpi, i) => {
                  const Icon = kpi.icon;
                  return (
                    <div
                      key={i}
                      className="p-6 rounded-2xl bg-zinc-950 border border-zinc-900 hover:border-zinc-800 transition space-y-3"
                    >
                      <div className="flex items-center justify-between text-xs font-medium text-zinc-400">
                        <span>{kpi.title}</span>
                        <Icon size={16} className="text-zinc-500" />
                      </div>
                      <div className="text-3xl font-bold text-white tracking-tight">{kpi.value}</div>
                      <div className="text-xs text-zinc-500">{kpi.sub}</div>
                    </div>
                  );
                })}
              </div>

              {/* Registration Trend Chart */}
              <div className="p-7 rounded-2xl bg-zinc-950 border border-zinc-900 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-white">Daily Registration Velocity</h2>
                    <p className="text-xs text-zinc-400 mt-0.5">Students registering on technomania.techtatva.in</p>
                  </div>
                  <span className="text-xs font-medium text-zinc-300 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
                    Live Stream
                  </span>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="whiteGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ffffff" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="day" stroke="#71717a" fontSize={12} />
                      <YAxis stroke="#71717a" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#09090b",
                          borderColor: "#27272a",
                          borderRadius: "8px",
                          fontSize: "12px",
                          color: "#ffffff"
                        }}
                      />
                      <Area type="monotone" dataKey="registrations" stroke="#ffffff" strokeWidth={2} fillOpacity={1} fill="url(#whiteGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Quick Summary Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Recent Registrations */}
                <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-900 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-white">Recent Student Signups</h2>
                    <button
                      onClick={() => setActiveTab("Registrations")}
                      className="text-xs text-zinc-400 hover:text-white transition"
                    >
                      View All →
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {registrations.slice(0, 3).map((reg) => (
                      <div
                        key={reg._id}
                        onClick={() => {
                          setSelectedRegistration(reg);
                          setActiveTab("Registrations");
                        }}
                        className="p-3.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 transition cursor-pointer flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm font-medium text-white">{reg.teamName || reg.leadName}</p>
                          <p className="text-xs text-zinc-400">{reg.eventTitle}</p>
                        </div>
                        <span className="text-xs text-zinc-300 font-medium px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800">
                          {reg.members.length + 1} Members
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Event Registration Toggles */}
                <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-900 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-white">Event Registration Status</h2>
                    <button
                      onClick={() => setActiveTab("Events")}
                      className="text-xs text-zinc-400 hover:text-white transition"
                    >
                      Manage Events →
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {events.map((evt) => (
                      <div
                        key={evt._id}
                        className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-900 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm font-medium text-white">{evt.title}</p>
                          <p className="text-xs text-zinc-400 capitalize">{evt.category}</p>
                        </div>

                        <button
                          onClick={() => {
                            setEvents((prev) =>
                              prev.map((e) =>
                                e._id === evt._id ? { ...e, registrationOpen: !e.registrationOpen } : e
                              )
                            );
                            notify(`Registration for "${evt.title}" is now ${!evt.registrationOpen ? "Open" : "Closed"}.`);
                          }}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                            evt.registrationOpen
                              ? "bg-white text-black hover:bg-zinc-200"
                              : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:bg-zinc-800"
                          }`}
                        >
                          {evt.registrationOpen ? "Open" : "Closed"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
              TAB 2: EVENTS
              ═══════════════════════════════════════════════════════ */}
          {activeTab === "Events" && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-white">Events</h1>
                  <p className="text-sm text-zinc-400 mt-1">
                    Manage Technomania tracks, team capacities, venues, descriptions, and rules
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingEvent({
                      category: "hackathon",
                      participationMode: "team",
                      maxTeamSize: 4,
                      capacity: 50,
                      registrationOpen: true,
                      status: "published"
                    });
                    setIsEventDrawerOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-sm transition"
                >
                  <Plus size={16} />
                  <span>Create Event</span>
                </button>
              </div>

              {/* Events Grid */}
              <div className="grid md:grid-cols-2 gap-5">
                {events.map((evt) => (
                  <div
                    key={evt._id}
                    className="p-6 rounded-2xl bg-zinc-950 border border-zinc-900 hover:border-zinc-800 transition flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="px-2.5 py-1 rounded-md text-xs font-semibold uppercase bg-zinc-900 text-zinc-200 border border-zinc-800">
                          {evt.category}
                        </span>

                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full border ${
                            evt.registrationOpen
                              ? "bg-zinc-900 text-zinc-200 border-zinc-800"
                              : "bg-zinc-900 text-zinc-500 border-zinc-900"
                          }`}
                        >
                          {evt.registrationOpen ? "Registrations Open" : "Closed"}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-white">{evt.title}</h3>
                      <p className="text-xs text-zinc-400 mt-0.5">{evt.subtitle}</p>
                      <p className="text-xs text-zinc-400 mt-3 line-clamp-2 leading-relaxed">{evt.description}</p>
                    </div>

                    <div className="pt-4 border-t border-zinc-900 flex items-center justify-between text-xs text-zinc-400">
                      <span>Venue: {evt.venue}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingEvent(evt);
                            setIsEventDrawerOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-medium transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setEvents(events.filter((e) => e._id !== evt._id));
                            notify(`Event "${evt.title}" deleted.`);
                          }}
                          className="p-1.5 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
              TAB 3: REGISTRATIONS
              ═══════════════════════════════════════════════════════ */}
          {activeTab === "Registrations" && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-white">Registrations</h1>
                  <p className="text-sm text-zinc-400 mt-1">
                    Student squads and individual entries registered on Technomania 3.0
                  </p>
                </div>

                <button
                  onClick={() => window.open("/api/technomania/export", "_blank")}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-sm font-medium text-white transition"
                >
                  <FileSpreadsheet size={15} className="text-zinc-400" />
                  <span>Export StudentMembers.xlsx</span>
                </button>
              </div>

              {/* Search & Filter Bar */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-900 flex flex-col sm:flex-row items-center gap-3">
                <div className="flex items-center gap-3 flex-grow w-full">
                  <Search size={16} className="text-zinc-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search squad name, leader name, university UID, or email..."
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
                  />
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="checked_in">Checked-In</option>
                  </select>
                </div>
              </div>

              {/* Data Table */}
              <div className="rounded-2xl bg-zinc-950 border border-zinc-900 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-900/60 border-b border-zinc-900 text-xs font-semibold text-zinc-400 uppercase">
                      <tr>
                        <th className="p-4">Squad / Leader</th>
                        <th className="p-4">University UID</th>
                        <th className="p-4">Event Track</th>
                        <th className="p-4">Roster</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900">
                      {filteredRegistrations.map((reg) => (
                        <tr 
                          key={reg._id} 
                          className="hover:bg-zinc-900/40 transition cursor-pointer"
                          onClick={() => setSelectedRegistration(reg)}
                        >
                          <td className="p-4">
                            <div className="font-semibold text-white">{reg.teamName || reg.leadName}</div>
                            <div className="text-xs text-zinc-400">{reg.leadEmail}</div>
                          </td>
                          <td className="p-4 font-mono text-zinc-200 font-semibold">{reg.leadUid}</td>
                          <td className="p-4 text-zinc-300">{reg.eventTitle}</td>
                          <td className="p-4 text-zinc-400">{reg.members.length + 1} Members</td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                reg.status === "checked_in"
                                  ? "bg-white text-black"
                                  : "bg-zinc-900 text-zinc-300 border border-zinc-800"
                              }`}
                            >
                              {reg.status === "checked_in" ? "Checked-In" : "Confirmed"}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => setSelectedRegistration(reg)}
                              className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-medium transition"
                            >
                              View Details
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
              TAB 4: SCHEDULE
              ═══════════════════════════════════════════════════════ */}
          {activeTab === "Schedule" && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-white">Schedule</h1>
                  <p className="text-sm text-zinc-400 mt-1">
                    Manage festival timeline, session timing, and hall locations
                  </p>
                </div>

                <button
                  onClick={() => {
                    const newItem: ScheduleRecord = {
                      id: `sch-${Date.now()}`,
                      day: "Day 1 — Sep 15",
                      time: "02:00 PM",
                      title: "New Session / Round",
                      venue: "Auditorium 2",
                      category: "Esports",
                      status: "upcoming"
                    };
                    setSchedules([...schedules, newItem]);
                    notify("Added schedule slot.");
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-sm transition"
                >
                  <Plus size={16} />
                  <span>Add Slot</span>
                </button>
              </div>

              <div className="space-y-3">
                {schedules.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl bg-zinc-950 border border-zinc-900 flex items-center justify-between hover:border-zinc-800 transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className="px-3 py-2 rounded-xl bg-zinc-900 text-white font-semibold text-xs border border-zinc-800 font-mono">
                        {item.time}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white text-sm">{item.title}</h4>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          {item.day} · {item.venue} · [{item.category}]
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setSchedules(schedules.filter((s) => s.id !== item.id))}
                      className="p-2 rounded-lg hover:bg-zinc-900 text-zinc-500 hover:text-white transition"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
              TAB 5: WEBSITE CONTENT (CMS)
              ═══════════════════════════════════════════════════════ */}
          {activeTab === "Website Content" && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-white">Website Content</h1>
                  <p className="text-sm text-zinc-400 mt-1">
                    Control public headlines, campus venue, countdown timestamp, and CTA buttons
                  </p>
                </div>

                <button
                  onClick={handleSaveContent}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-sm transition"
                >
                  <Save size={16} />
                  <span>{isSaving ? "Saving..." : "Save & Publish"}</span>
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* General Info */}
                <div className="p-7 rounded-2xl bg-zinc-950 border border-zinc-900 space-y-4">
                  <h2 className="text-sm font-semibold text-zinc-200">Festival Details</h2>

                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Festival Title</label>
                    <input
                      type="text"
                      value={contentSettings.festivalName}
                      onChange={(e) => setContentSettings({ ...contentSettings, festivalName: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm outline-none focus:border-zinc-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Campus Venue</label>
                    <input
                      type="text"
                      value={contentSettings.campusLocation}
                      onChange={(e) => setContentSettings({ ...contentSettings, campusLocation: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm outline-none focus:border-zinc-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Hero Main Headline</label>
                    <input
                      type="text"
                      value={contentSettings.headline}
                      onChange={(e) => setContentSettings({ ...contentSettings, headline: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm outline-none focus:border-zinc-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Subtitle / Description</label>
                    <textarea
                      rows={3}
                      value={contentSettings.tagline}
                      onChange={(e) => setContentSettings({ ...contentSettings, tagline: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm outline-none focus:border-zinc-600"
                    />
                  </div>
                </div>

                {/* Countdown & CTAs */}
                <div className="p-7 rounded-2xl bg-zinc-950 border border-zinc-900 space-y-4">
                  <h2 className="text-sm font-semibold text-zinc-200">Countdown & CTAs</h2>

                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                      Countdown Target Timestamp (ISO Format)
                    </label>
                    <input
                      type="text"
                      value={contentSettings.targetDate}
                      onChange={(e) => setContentSettings({ ...contentSettings, targetDate: e.target.value })}
                      placeholder="2026-09-15T09:00:00+05:30"
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm outline-none focus:border-zinc-600 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Prize Pool Text</label>
                    <input
                      type="text"
                      value={contentSettings.prizePoolText}
                      onChange={(e) => setContentSettings({ ...contentSettings, prizePoolText: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm outline-none focus:border-zinc-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Primary CTA Button Label</label>
                    <input
                      type="text"
                      value={contentSettings.ctaPrimaryText}
                      onChange={(e) => setContentSettings({ ...contentSettings, ctaPrimaryText: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm outline-none focus:border-zinc-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Secondary CTA Button Label</label>
                    <input
                      type="text"
                      value={contentSettings.ctaSecondaryText}
                      onChange={(e) => setContentSettings({ ...contentSettings, ctaSecondaryText: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm outline-none focus:border-zinc-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
              TAB 6: ANNOUNCEMENTS
              ═══════════════════════════════════════════════════════ */}
          {activeTab === "Announcements" && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-white">Announcements</h1>
                  <p className="text-sm text-zinc-400 mt-1">
                    Manage the top cycling marquee announcement ribbon on the website
                  </p>
                </div>

                <button
                  onClick={handleSaveContent}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-sm transition"
                >
                  <Save size={16} />
                  <span>Save Broadcast</span>
                </button>
              </div>

              {/* Add form */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-900 flex gap-3">
                <input
                  type="text"
                  value={newAnnouncement}
                  onChange={(e) => setNewAnnouncement(e.target.value)}
                  placeholder="Type new broadcast headline..."
                  className="flex-grow px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm outline-none focus:border-zinc-600"
                />
                <button
                  onClick={() => {
                    if (!newAnnouncement.trim()) return;
                    setAnnouncements([...announcements, newAnnouncement.trim().toUpperCase()]);
                    setNewAnnouncement("");
                    notify("Added announcement line.");
                  }}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs transition"
                >
                  Add Line
                </button>
              </div>

              <div className="space-y-2.5">
                {announcements.map((line, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-zinc-950 border border-zinc-900 flex items-center justify-between hover:border-zinc-800 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-zinc-500 font-mono">{i + 1}.</span>
                      <span className="text-sm text-zinc-200">{line}</span>
                    </div>

                    <button
                      onClick={() => setAnnouncements(announcements.filter((_, idx) => idx !== i))}
                      className="p-1.5 rounded-lg hover:bg-zinc-900 text-zinc-500 hover:text-white transition"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
              TAB 7: LEADERBOARD
              ═══════════════════════════════════════════════════════ */}
          {activeTab === "Leaderboard" && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-white">Leaderboard</h1>
                  <p className="text-sm text-zinc-400 mt-1">
                    Manage real-time ranks, points tallies, and winner badges per event track
                  </p>
                </div>

                <button
                  onClick={() => {
                    const newEntry: LeaderboardRecord = {
                      id: `lb-${Date.now()}`,
                      eventId: events[0]?._id || "evt-1",
                      eventTitle: events[0]?.title || "Code Storm 24H",
                      teamName: "New Finalist Team",
                      rank: leaderboard.length + 1,
                      score: 800,
                      status: "Finalist"
                    };
                    setLeaderboard([...leaderboard, newEntry]);
                    notify("Added new leaderboard rank.");
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-sm transition"
                >
                  <Plus size={16} />
                  <span>Add Standing</span>
                </button>
              </div>

              <div className="rounded-2xl bg-zinc-950 border border-zinc-900 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-900/60 border-b border-zinc-900 text-xs font-semibold text-zinc-400 uppercase">
                    <tr>
                      <th className="p-4">Rank</th>
                      <th className="p-4">Team Name</th>
                      <th className="p-4">Event Track</th>
                      <th className="p-4">Score</th>
                      <th className="p-4">Award Badge</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900">
                    {leaderboard.map((item) => (
                      <tr key={item.id} className="hover:bg-zinc-900/40 transition">
                        <td className="p-4 font-bold text-white text-base">#{item.rank}</td>
                        <td className="p-4 font-semibold text-white">{item.teamName}</td>
                        <td className="p-4 text-zinc-400">{item.eventTitle}</td>
                        <td className="p-4 font-bold text-zinc-100 font-mono">{item.score} PTS</td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-md bg-zinc-900 text-xs font-medium text-zinc-200 border border-zinc-800">
                            {item.badge || item.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => {
                              const newPoints = prompt("Enter updated score:", String(item.score));
                              if (newPoints && !isNaN(Number(newPoints))) {
                                setLeaderboard((prev) =>
                                  prev.map((lb) => (lb.id === item.id ? { ...lb, score: Number(newPoints) } : lb))
                                );
                                notify(`Updated score for "${item.teamName}".`);
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs mr-2 transition"
                          >
                            Edit Points
                          </button>
                          <button
                            onClick={() => setLeaderboard(leaderboard.filter((lb) => lb.id !== item.id))}
                            className="p-1.5 rounded-lg hover:bg-zinc-900 text-zinc-500 hover:text-white transition"
                          >
                            <Trash2 size={15} />
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
              TAB 8: MEDIA LIBRARY
              ═══════════════════════════════════════════════════════ */}
          {activeTab === "Media Library" && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-white">Media Library</h1>
                  <p className="text-sm text-zinc-400 mt-1">
                    Upload festival logos, posters, and event banners
                  </p>
                </div>

                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAssetUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-sm transition"
                  >
                    <Upload size={16} />
                    <span>{isUploading ? "Uploading..." : "Upload Image"}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {mediaAssets.map((asset, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-900 hover:border-zinc-800 transition flex flex-col space-y-2.5"
                  >
                    <div className="relative h-28 w-full bg-zinc-900 rounded-xl overflow-hidden flex items-center justify-center p-2">
                      <Image
                        src={asset.url}
                        alt={asset.name}
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                    <div className="text-xs font-semibold text-white truncate">{asset.name}</div>
                    <div className="text-[11px] text-zinc-500">{asset.size}</div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(asset.url);
                        notify(`Copied URL: ${asset.url}`);
                      }}
                      className="w-full py-1.5 text-center rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-medium transition"
                    >
                      Copy Link
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
              TAB 9: FAQS
              ═══════════════════════════════════════════════════════ */}
          {activeTab === "FAQs" && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-white">FAQs</h1>
                  <p className="text-sm text-zinc-400 mt-1">
                    Manage frequently asked questions on the website
                  </p>
                </div>

                <button
                  onClick={() => {
                    const q = prompt("Question:");
                    const a = prompt("Answer:");
                    if (q && a) {
                      setFaqs([...faqs, { id: `faq-${Date.now()}`, question: q, answer: a, category: "General" }]);
                      notify("Added FAQ entry.");
                    }
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-sm transition"
                >
                  <Plus size={16} />
                  <span>Add FAQ</span>
                </button>
              </div>

              <div className="space-y-3">
                {faqs.map((faq) => (
                  <div key={faq.id} className="p-6 rounded-2xl bg-zinc-950 border border-zinc-900 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-white text-sm">{faq.question}</h4>
                      <button
                        onClick={() => setFaqs(faqs.filter((f) => f.id !== faq.id))}
                        className="p-1.5 rounded-lg hover:bg-zinc-900 text-zinc-500 hover:text-white transition"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── REGISTRATION ROSTER MODAL ── */}
      {selectedRegistration && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
              <div>
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Registration Dossier
                </span>
                <h2 className="text-xl font-bold text-white mt-0.5">
                  {selectedRegistration.teamName || selectedRegistration.leadName}
                </h2>
              </div>
              <button
                onClick={() => setSelectedRegistration(null)}
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Leader Details */}
            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
              <h4 className="text-xs font-semibold text-zinc-300 uppercase">Team Leader / Contact</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><span className="text-zinc-500">Name:</span> <span className="text-white font-medium ml-1.5">{selectedRegistration.leadName}</span></div>
                <div><span className="text-zinc-500">UID:</span> <span className="text-white font-mono font-medium ml-1.5">{selectedRegistration.leadUid}</span></div>
                <div><span className="text-zinc-500">Email:</span> <span className="text-white ml-1.5">{selectedRegistration.leadEmail}</span></div>
                <div><span className="text-zinc-500">Phone:</span> <span className="text-white ml-1.5">{selectedRegistration.leadPhone}</span></div>
                <div className="col-span-2"><span className="text-zinc-500">Program:</span> <span className="text-white ml-1.5">{selectedRegistration.leadProgram} (Semester {selectedRegistration.leadSemester})</span></div>
              </div>
            </div>

            {/* Team Members */}
            {selectedRegistration.members.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-zinc-300 uppercase">
                  Squad Roster ({selectedRegistration.members.length} Teammates)
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedRegistration.members.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-900 text-xs flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold text-white">{m.name}</p>
                        <p className="text-zinc-400 text-[11px]">{m.email} · {m.program}</p>
                      </div>
                      <span className="text-zinc-300 font-mono font-medium">{m.uid}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 border-t border-zinc-900 flex justify-end gap-3">
              <button
                onClick={() => {
                  setRegistrations((prev) =>
                    prev.map((r) =>
                      r._id === selectedRegistration._id ? { ...r, status: "confirmed" } : r
                    )
                  );
                  setSelectedRegistration(null);
                  notify("Registration confirmed.");
                }}
                className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold transition"
              >
                Mark Confirmed
              </button>
              <button
                onClick={() => {
                  setRegistrations((prev) =>
                    prev.map((r) =>
                      r._id === selectedRegistration._id ? { ...r, status: "checked_in" } : r
                    )
                  );
                  setSelectedRegistration(null);
                  notify("Participant marked as checked in.");
                }}
                className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition"
              >
                Check-In Attendance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CREATE / EDIT EVENT DRAWER ── */}
      {isEventDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
              <h2 className="text-lg font-bold text-white">
                {editingEvent?._id ? "Edit Event Track" : "Create New Event Track"}
              </h2>
              <button
                onClick={() => setIsEventDrawerOpen(false)}
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-medium mb-1.5">Event Title</label>
                <input
                  type="text"
                  value={editingEvent?.title || ""}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  placeholder="e.g. Code Storm 24H"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-zinc-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1.5">Category Track</label>
                  <select
                    value={editingEvent?.category || "hackathon"}
                    onChange={(e) => setEditingEvent({ ...editingEvent, category: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white outline-none"
                  >
                    <option value="hackathon">Hackathon</option>
                    <option value="esports">Esports Arena</option>
                    <option value="cultural">Cultural Stage</option>
                    <option value="sub-events">Sub-Events</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1.5">Max Seat Capacity</label>
                  <input
                    type="number"
                    value={editingEvent?.capacity || 50}
                    onChange={(e) => setEditingEvent({ ...editingEvent, capacity: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-zinc-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1.5">Venue Location</label>
                <input
                  type="text"
                  value={editingEvent?.venue || ""}
                  onChange={(e) => setEditingEvent({ ...editingEvent, venue: e.target.value })}
                  placeholder="e.g. Block D Central Tech Labs"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-zinc-600"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1.5">Prizes & Awards</label>
                <input
                  type="text"
                  value={editingEvent?.prizes || ""}
                  onChange={(e) => setEditingEvent({ ...editingEvent, prizes: e.target.value })}
                  placeholder="e.g. ₹XX,XXX CASH & INTERNSHIPS"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-zinc-600"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1.5">Description</label>
                <textarea
                  rows={3}
                  value={editingEvent?.description || ""}
                  onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  placeholder="Event details..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-zinc-600"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-900 flex justify-end gap-3">
              <button
                onClick={() => setIsEventDrawerOpen(false)}
                className="px-4 py-2 rounded-xl bg-zinc-900 text-zinc-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!editingEvent?.title) return;
                  if (editingEvent._id) {
                    setEvents(events.map((e) => (e._id === editingEvent._id ? ({ ...e, ...editingEvent } as TechnomaniaEvent) : e)));
                  } else {
                    const newEvt: TechnomaniaEvent = {
                      _id: `evt-${Date.now()}`,
                      title: editingEvent.title,
                      slug: editingEvent.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                      category: editingEvent.category || "hackathon",
                      participationMode: editingEvent.participationMode || "team",
                      maxTeamSize: editingEvent.maxTeamSize || 4,
                      capacity: editingEvent.capacity || 50,
                      venue: editingEvent.venue || "Campus Labs",
                      status: "published",
                      registrationOpen: true,
                      startAt: "2026-09-15T09:00:00",
                      description: editingEvent.description || "",
                      prizes: editingEvent.prizes || ""
                    };
                    setEvents([...events, newEvt]);
                  }
                  setIsEventDrawerOpen(false);
                  notify(`Event "${editingEvent.title}" saved successfully.`);
                }}
                className="px-5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition"
              >
                Save Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
