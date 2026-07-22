"use client";
import Image from "next/image";

import { FormEvent, useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, 
  Loader2, 
  Sparkles, 
  UserPlus, 
  ShieldAlert, 
  ArrowUpRight, 
  ChevronRight,
  ChevronLeft,
  Download,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { DEPARTMENTS, INTERESTS, YEARS, GENDERS } from "@/lib/validations/student-member";

type StatusData = {
  status: string;
  registrationEnabled: boolean;
  announcementBanner?: string;
  openingDate?: string;
  closingDate?: string;
  whatsappGroupLink?: string;
};

interface JoinClientProps {
  initialStatus: StatusData;
  logoBase64?: string;
  cuLogoBase64?: string;
}

export function JoinClient({ initialStatus, logoBase64 = "", cuLogoBase64 = "" }: JoinClientProps) {
  const searchParams = useSearchParams();
  const source = searchParams.get("source") || "online";

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    fullName: "",
    uid: "",
    email: "",
    phone: "",
    section: "",
    department: "",
    year: "",
    gender: "",
    interests: [] as string[]
  });

  // Card hover state for 3D tilt effect
  const [tiltCoords, setTiltCoords] = useState({ x: 0, y: 0 });
  const [isHoveringCard, setIsHoveringCard] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [whatsappLink, setWhatsappLink] = useState("");

  const isOpen = initialStatus.registrationEnabled && ["open", "closing_soon"].includes(initialStatus.status);

  useEffect(() => {
    if (initialStatus.whatsappGroupLink) {
      setWhatsappLink(initialStatus.whatsappGroupLink);
    }
  }, [initialStatus]);

  function update(name: string, value: any) {
    setForm((state) => ({ ...state, [name]: value }));
  }

  function toggleInterest(interest: string) {
    setForm((state) => {
      const interests = [...state.interests];
      const index = interests.indexOf(interest);
      if (index > -1) {
        interests.splice(index, 1);
      } else {
        if (interests.length < 8) {
          interests.push(interest);
        }
      }
      return { ...state, interests };
    });
  }

  // Handle card tilt calculations
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    // Normalize coordinates to range [-1, 1]
    setTiltCoords({
      x: x / (rect.width / 2),
      y: y / (rect.height / 2)
    });
  };

  const cardTransform = isHoveringCard
    ? `perspective(1000px) rotateY(${tiltCoords.x * 12}deg) rotateX(${-tiltCoords.y * 12}deg) scale3d(1.03, 1.03, 1.03)`
    : "perspective(1000px) rotateY(0deg) rotateX(0deg) scale3d(1, 1, 1)";

  // Check step validation
  const isStepValid = () => {
    if (step === 0) {
      return form.fullName.trim().length >= 2 && form.uid.trim().length >= 3 && form.gender !== "";
    }
    if (step === 1) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(form.email) && form.phone.trim().length >= 7;
    }
    if (step === 2) {
      return form.department !== "" && form.year !== "";
    }
    if (step === 3) {
      return form.interests.length >= 1 && form.interests.length <= 8;
    }
    return true;
  };

  // XML Special characters escaping helper to prevent SVG rendering errors
  const escapeXml = (str: string) => {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  };

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!isStepValid()) {
      setError("Please ensure all fields in the current step are valid.");
      return;
    }

    setBusy(true);

    try {
      const response = await fetch("/api/membership/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          source
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Something went wrong.");
      }

      setSuccess(result.message || "Registration Successful!");
      setStep(5); // Success step
    } catch (err: any) {
      setError(err.message || "Could not register. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const resetForm = () => {
    setForm({
      fullName: "",
      uid: "",
      email: "",
      phone: "",
      section: "",
      department: "",
      year: "",
      gender: "",
      interests: []
    });
    setSuccess("");
    setError("");
    setStep(0);
  };

  // Generate and download the SVG Developer Badge Card
  const downloadBadge = () => {
    const escapedFullName = escapeXml((form.fullName || "GUEST BUILDER").toUpperCase());
    const escapedUid = escapeXml((form.uid || "N/A").toUpperCase());
    const escapedDept = escapeXml((form.department || "TECH COMMUNITY").toUpperCase());
    const escapedYear = escapeXml(form.year ? `${form.year} Year` : "N/A");
    const escapedInterests = escapeXml(form.interests.slice(0, 3).join(" | ").toUpperCase() || "BUILDER");
    
    const barcodeLines = Array.from({ length: 24 })
      .map((_, i) => `<rect x="${24 + i * 4.5}" y="196" width="${Math.random() > 0.4 ? 2.5 : 1}" height="16" fill="white" opacity="0.25"/>`)
      .join("");

    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 270" width="460" height="270">
  <defs>
    <!-- Gradients -->
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a0515"/>
      <stop offset="50%" stop-color="#14072b"/>
      <stop offset="100%" stop-color="#040207"/>
    </linearGradient>
    <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#8b5cf6"/>
      <stop offset="50%" stop-color="#ec4899"/>
      <stop offset="100%" stop-color="#fdba74"/>
    </linearGradient>
    <linearGradient id="chipGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffe2a0"/>
      <stop offset="50%" stop-color="#cca252"/>
      <stop offset="100%" stop-color="#9a7329"/>
    </linearGradient>
    <clipPath id="cardClip">
      <rect width="460" height="270" rx="20"/>
    </clipPath>
  </defs>

  <!-- Background base card -->
  <rect width="460" height="270" rx="20" fill="url(#cardGrad)" stroke="rgba(255,255,255,0.08)" stroke-width="1.5"/>

  <!-- Glowing accent borders -->
  <g clip-path="url(#cardClip)">
    <circle cx="410" cy="60" r="140" fill="#8b5cf6" opacity="0.15" filter="blur(50px)"/>
    <circle cx="50" cy="210" r="110" fill="#ec4899" opacity="0.12" filter="blur(40px)"/>
    
    <!-- Top Running Beam Border -->
    <path d="M 0 0 L 460 0" stroke="url(#glowGrad)" stroke-width="6"/>
    
    <!-- Subtle tech grid -->
    <path d="M0,35 H460 M0,70 H460 M0,105 H460 M0,140 H460 M0,175 H460 M0,210 H460 M0,245 H460" stroke="rgba(255,255,255,0.015)" stroke-width="1"/>
    <path d="M40,0 V270 M80,0 V270 M120,0 V270 M160,0 V270 M200,0 V270 M240,0 V270 M280,0 V270 M320,0 V270 M360,0 V270 M400,0 V270" stroke="rgba(255,255,255,0.015)" stroke-width="1"/>
  </g>

  <!-- Header Section -->
  <!-- Tech Tatva Logo -->
  ${logoBase64 ? `<image x="24" y="20" width="22" height="22" href="${logoBase64}" />` : ""}
  <text x="54" y="36" fill="white" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="900" letter-spacing="2">TECH TATVA</text>

  <!-- CU Logo inside a clean white tag -->
  ${cuLogoBase64 ? `<g transform="translate(320, 18)">
    <rect width="116" height="26" rx="6" fill="white" opacity="0.96" />
    <image x="6" y="3" width="104" height="20" href="${cuLogoBase64}" preserveAspectRatio="xMidYMid meet" />
  </g>` : ""}

  <!-- Chip Representing NFC connection -->
  <rect x="24" y="58" width="34" height="24" rx="5" fill="url(#chipGrad)"/>
  <rect x="29" y="62" width="9" height="16" rx="1.5" fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="1"/>
  <rect x="43" y="62" width="9" height="16" rx="1.5" fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="1"/>
  <path d="M 24 70 H 58 M 41 58 V 82" stroke="rgba(0,0,0,0.15)" stroke-width="1"/>

  <!-- Member pill -->
  <g transform="translate(74, 58)">
    <rect width="68" height="20" rx="10" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.2)" stroke-width="1"/>
    <circle cx="10" cy="10" r="3.5" fill="#22c55e"/>
    <text x="20" y="13" fill="#22c55e" font-family="system-ui, -apple-system, sans-serif" font-size="8" font-weight="900" letter-spacing="1">STUDENT</text>
  </g>

  <!-- Main details -->
  <!-- Name -->
  <text x="24" y="112" fill="rgba(255,255,255,0.3)" font-family="system-ui, -apple-system, sans-serif" font-size="7.5" font-weight="800" letter-spacing="1.5">MEMBER ALIAS</text>
  <text x="24" y="132" fill="white" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="800" letter-spacing="0.5">${escapedFullName}</text>

  <!-- UID / Year -->
  <text x="24" y="165" fill="rgba(255,255,255,0.3)" font-family="system-ui, -apple-system, sans-serif" font-size="7.5" font-weight="800" letter-spacing="1.5">UNIVERSITY UID</text>
  <text x="24" y="181" font-family="monospace" font-size="12" font-weight="700" fill="white">${escapedUid}</text>

  <text x="180" y="165" fill="rgba(255,255,255,0.3)" font-family="system-ui, -apple-system, sans-serif" font-size="7.5" font-weight="800" letter-spacing="1.5">ACADEMIC YEAR</text>
  <text x="180" y="181" fill="white" font-family="system-ui, -apple-system, sans-serif" font-size="11.5" font-weight="700">${escapedYear}</text>

  <!-- Footer block details -->
  <text x="24" y="222" fill="url(#glowGrad)" font-family="monospace" font-size="8.5" font-weight="800" letter-spacing="1">${escapedDept}</text>
  <text x="24" y="238" fill="rgba(255,255,255,0.4)" font-family="system-ui, -apple-system, sans-serif" font-size="8" font-weight="600" letter-spacing="0.5">${escapedInterests}</text>

  <!-- Barcode decoration lines -->
  ${barcodeLines}

  <!-- QR anchor codes mockup -->
  <g transform="translate(325, 120)">
    <rect width="111" height="111" rx="14" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" stroke-width="1.5"/>
    <g transform="translate(4, 4)">
      <!-- QR Anchor top left -->
      <rect x="8" y="8" width="22" height="22" rx="4" fill="none" stroke="#8b5cf6" stroke-width="3"/>
      <rect x="13" y="13" width="12" height="12" rx="1.5" fill="#8b5cf6"/>

      <!-- QR Anchor top right -->
      <rect x="73" y="8" width="22" height="22" rx="4" fill="none" stroke="#ec4899" stroke-width="3"/>
      <rect x="78" y="13" width="12" height="12" rx="1.5" fill="#ec4899"/>

      <!-- QR Anchor bottom left -->
      <rect x="8" y="73" width="22" height="22" rx="4" fill="none" stroke="#fdba74" stroke-width="3"/>
      <rect x="13" y="78" width="12" height="12" rx="1.5" fill="#fdba74"/>

      <!-- QR Bits decoration pattern -->
      <rect x="36" y="10" width="6" height="6" rx="1" fill="white" opacity="0.35"/>
      <rect x="46" y="18" width="6" height="12" rx="1" fill="white" opacity="0.2"/>
      <rect x="36" y="34" width="18" height="6" rx="1" fill="white" opacity="0.3"/>
      
      <rect x="10" y="36" width="6" height="6" rx="1" fill="white" opacity="0.25"/>
      <rect x="20" y="44" width="6" height="12" rx="1" fill="white" opacity="0.35"/>
      <rect x="36" y="48" width="12" height="6" rx="1" fill="white" opacity="0.4"/>
      
      <rect x="73" y="36" width="18" height="6" rx="1" fill="white" opacity="0.25"/>
      <rect x="73" y="48" width="6" height="12" rx="1" fill="white" opacity="0.35"/>
      <rect x="85" y="66" width="8" height="6" rx="1" fill="white" opacity="0.3"/>
      
      <rect x="42" y="66" width="6" height="18" rx="1" fill="white" opacity="0.4"/>
      <rect x="54" y="78" width="12" height="6" rx="1" fill="white" opacity="0.2"/>
    </g>
  </g>
</svg>`;

    const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `techtatva_badge_${form.uid || "member"}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const stepsContent = [
    {
      title: "Profile Details",
      desc: "Provide your basic student profile information.",
      fields: (
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1.5">Full Name</label>
            <input
              type="text"
              placeholder="e.g. Eshaan Sharma"
              value={form.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.08] focus:border-purple-500/50 rounded-xl p-3.5 text-white text-xs outline-none transition"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1.5">University UID</label>
            <input
              type="text"
              placeholder="e.g. 22BCS1001"
              value={form.uid}
              onChange={(e) => update("uid", e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.08] focus:border-purple-500/50 rounded-xl p-3.5 text-white text-xs outline-none transition"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-2">Gender Identification</label>
            <div className="grid grid-cols-2 gap-2">
              {GENDERS.map((g) => (
                <button
                  type="button"
                  key={g}
                  onClick={() => update("gender", g)}
                  className={`border rounded-xl py-2.5 px-3 text-[10px] font-bold uppercase tracking-wider transition ${
                    form.gender === g
                      ? "border-purple-500/50 bg-purple-500/10 text-white"
                      : "border-white/[0.06] bg-white/[0.01] text-white/40 hover:text-white"
                  }`}
                >
                  {g === "prefer_not_to_say" ? "Prefer Not to Say" : g}
                </button>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Contact Information",
      desc: "Provide your verified contact details for notifications.",
      fields: (
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1.5">Email Address</label>
            <input
              type="email"
              placeholder="e.g. john.doe@student.chd.edu.in"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.08] focus:border-purple-500/50 rounded-xl p-3.5 text-white text-xs outline-none transition"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1.5">Phone Number (WhatsApp)</label>
            <input
              type="tel"
              placeholder="e.g. 9876543210"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.08] focus:border-purple-500/50 rounded-xl p-3.5 text-white text-xs outline-none transition"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1.5">Section (Optional)</label>
            <input
              type="text"
              placeholder="e.g. CSE-801-A"
              value={form.section}
              onChange={(e) => update("section", e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.08] focus:border-purple-500/50 rounded-xl p-3.5 text-white text-xs outline-none transition"
            />
          </div>
        </div>
      )
    },
    {
      title: "Academic Credentials",
      desc: "Select your academic department and current year.",
      fields: (
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1.5">Academic Department</label>
            <select
              value={form.department}
              onChange={(e) => update("department", e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.08] focus:border-purple-500/50 rounded-xl p-3.5 text-white text-xs outline-none transition appearance-none cursor-pointer"
              required
            >
              <option value="" disabled className="bg-neutral-950 text-white/40">Select Department</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept} className="bg-neutral-950 text-white">
                  {dept}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1.5">Academic Year</label>
            <select
              value={form.year}
              onChange={(e) => update("year", e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.08] focus:border-purple-500/50 rounded-xl p-3.5 text-white text-xs outline-none transition appearance-none cursor-pointer"
              required
            >
              <option value="" disabled className="bg-neutral-950 text-white/40">Select Year</option>
              {YEARS.map((y) => (
                <option key={y} value={y} className="bg-neutral-950 text-white">
                  {y} Year Student
                </option>
              ))}
            </select>
          </div>
        </div>
      )
    },
    {
      title: "Technical & Creative Interests",
      desc: "Choose the areas you are interested in exploring or building.",
      fields: (
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-3">
            Core Fields (Select 1 to 8 interests)
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
            {INTERESTS.map((interest) => {
              const selected = form.interests.includes(interest);
              return (
                <button
                  type="button"
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`rounded-xl border p-2.5 text-left text-[10px] font-bold transition ${
                    selected
                      ? "border-purple-500/50 bg-purple-500/10 text-white"
                      : "border-white/[0.05] bg-white/[0.015] text-white/40 hover:border-white/10 hover:text-white"
                  }`}
                >
                  {interest}
                </button>
              );
            })}
          </div>
        </div>
      )
    },
    {
      title: "Review Application",
      desc: "Review your details before compiling your membership badge.",
      fields: (
        <div className="space-y-3 font-mono text-[10px] leading-5 text-white/70 bg-black/40 border border-white/[0.05] rounded-xl p-4">
          <div><span className="text-purple-400 font-bold">ALIAS:</span> {form.fullName || "Guest Builder"}</div>
          <div><span className="text-purple-400 font-bold">UID:</span> {form.uid || "N/A"}</div>
          <div><span className="text-purple-400 font-bold">EMAIL:</span> {form.email || "N/A"}</div>
          <div><span className="text-purple-400 font-bold">PHONE:</span> {form.phone || "N/A"}</div>
          <div><span className="text-purple-400 font-bold">DEPT:</span> {form.department || "N/A"}</div>
          <div><span className="text-purple-400 font-bold">YEAR:</span> {form.year ? `${form.year} Year` : "N/A"}</div>
          <div>
            <span className="text-purple-400 font-bold">INTERESTS:</span>{" "}
            {form.interests.length > 0 ? form.interests.join(", ") : "None"}
          </div>
          <div className="border-t border-white/[0.05] pt-2 mt-2 text-[9px] text-white/30">
            Click compile below to finalize registration and issue credentials.
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="relative w-full">
      {initialStatus.announcementBanner && isOpen && (
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white text-center py-2.5 px-4 text-xs font-semibold tracking-wide">
          <span className="inline-flex items-center gap-1.5">
            <Sparkles size={14} className="animate-pulse" />
            {initialStatus.announcementBanner}
          </span>
        </div>
      )}

      <div className="relative min-h-[90vh] py-16 px-5 flex flex-col items-center justify-center spatial-grid-bg">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(168,85,247,0.08),transparent_45%)] pointer-events-none" />
        <div className="absolute inset-0 grid-bg opacity-[0.06] pointer-events-none" />

        <div className="max-w-5xl w-full">
          <Reveal>
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 rounded-xl border-2 border-black bg-purple-500 px-4 py-1.5 text-xs font-bold text-black shadow-[2px_2px_0px_0px_rgba(255,255,255,0.8)]">
                <UserPlus size={14} />
                <span>Tech Tatva Membership</span>
              </span>
              <h1 className="mt-6 text-4xl sm:text-6xl font-bold tracking-tight text-white leading-tight">
                Enter the <span className="text-purple-400">Club.</span>
              </h1>
              <p className="mt-4 text-sm sm:text-base text-white/50 max-w-xl mx-auto leading-relaxed">
                Connect with like-minded builders, get priority access to events, collaborate on technical tasks, and get certified.
              </p>

              {source === "qr" && (
                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-purple-500/25 bg-purple-500/10 px-4 py-1.5 text-xs font-semibold text-purple-300">
                  <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
                  <span>Offline Membership Drive Sign-up</span>
                </div>
              )}
            </div>
          </Reveal>

          {!isOpen && (
            <Reveal delay={0.1}>
              <div className="glass-brutalist rounded-[2rem] p-8 sm:p-12 text-center max-w-xl mx-auto">
                <ShieldAlert size={48} className="mx-auto text-purple-400 animate-pulse" />
                <h2 className="mt-6 text-2xl font-bold text-white">Drive is Currently Inactive</h2>
                <p className="mt-4 text-sm leading-relaxed text-white/50">
                  The official Tech Tatva membership drive is currently closed. If you believe this is in error, contact the administrators.
                </p>
                {initialStatus.openingDate && (
                  <p className="mt-4 text-xs font-semibold text-purple-400">
                    Expected to go live: {new Date(initialStatus.openingDate).toLocaleDateString("en-IN", { dateStyle: "long" })}
                  </p>
                )}
                <div className="mt-8">
                  <Link href="/" className="brutalist-btn-dark inline-flex rounded-xl px-6 py-2.5 text-xs">
                    Return Home
                  </Link>
                </div>
              </div>
            </Reveal>
          )}

          {isOpen && (
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
              
              {/* Form Side */}
              <Reveal delay={0.1}>
                <div className="glass-brutalist rounded-3xl p-6 sm:p-8">
                  
                  <AnimatePresence mode="wait">
                    {step === 5 && success ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="text-center py-8"
                        key="success-card"
                      >
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-purple-500/10 text-purple-400 mb-6">
                          <CheckCircle2 size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Registration Successful!</h2>
                        <p className="mt-3 text-xs text-white/60 leading-relaxed max-w-sm mx-auto">
                          {success}
                        </p>

                        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                          <button
                            onClick={downloadBadge}
                            className="brutalist-btn-purple flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-xs font-bold text-black"
                          >
                            <Download size={14} />
                            Download Developer Badge
                          </button>

                          {whatsappLink && (
                            <a
                              href={whatsappLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="brutalist-btn-dark flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-xs font-bold text-white"
                            >
                              Join WhatsApp Hub
                              <ArrowUpRight size={14} />
                            </a>
                          )}
                        </div>

                        <div className="mt-6 border-t border-white/[0.05] pt-6">
                          <button
                            onClick={resetForm}
                            className="text-white/40 hover:text-white text-xs font-semibold"
                          >
                            Register another member
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      <div key="wizard-steps">
                        {/* Professional Wizard Header */}
                        <div className="flex items-center justify-between border-b border-white/[0.06] pb-4 mb-6">
                          <div className="flex items-center gap-2.5">
                            <span className="font-sans text-xs font-bold text-white uppercase tracking-wider">
                              {stepsContent[step].title}
                            </span>
                            <span className="h-3 w-px bg-white/[0.12]" />
                            <span className="font-sans text-[10px] text-white/40 font-semibold uppercase tracking-wider">
                              Step {step + 1} of 5
                            </span>
                          </div>
                          <span className="font-sans text-[9px] font-bold tracking-wider text-purple-400">
                            {source.toUpperCase()} STATUS
                          </span>
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                          {error && (
                            <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 p-4 text-[10px] font-medium text-rose-300 flex items-start gap-2">
                              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                              <span>{error}</span>
                            </div>
                          )}

                          {/* Step Content */}
                          <div>
                            <p className="text-[10px] text-white/40 mb-6 font-sans">
                              {stepsContent[step].desc}
                            </p>

                            <motion.div
                              key={step}
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              transition={{ duration: 0.15 }}
                            >
                              {stepsContent[step].fields}
                            </motion.div>
                          </div>

                          {/* Navigation buttons */}
                          <div className="border-t border-white/[0.06] pt-6 flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => setStep((prev) => Math.max(0, prev - 1))}
                              className={`ghost-pill rounded-xl px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                                step === 0 ? "opacity-30 pointer-events-none" : ""
                              }`}
                              disabled={busy}
                            >
                              <ChevronLeft size={13} />
                              Back
                            </button>

                            {step < 4 ? (
                              <button
                                type="button"
                                onClick={() => setStep((prev) => Math.min(4, prev + 1))}
                                className={`action-pill rounded-xl px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                                  !isStepValid() ? "opacity-45 pointer-events-none" : ""
                                }`}
                                disabled={!isStepValid() || busy}
                              >
                                Next
                                <ChevronRight size={13} />
                              </button>
                            ) : (
                              <button
                                type="submit"
                                className="action-pill rounded-xl px-6 py-2.5 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-black"
                                disabled={busy}
                              >
                                {busy ? (
                                  <>
                                    <Loader2 size={13} className="animate-spin" />
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    Submit & Compile
                                    <Sparkles size={12} className="animate-pulse" />
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </form>
                      </div>
                    )}
                  </AnimatePresence>

                </div>
              </Reveal>

              {/* Membership Badge Card */}
              <Reveal delay={0.2}>
                <div className="flex flex-col items-center justify-center w-full max-w-full pt-4 sm:pt-0">

                  {/* Floating card wrapper with glow */}
                  <div className="relative origin-top scale-[0.85] sm:scale-100 -mb-10 sm:mb-0" style={{ animation: 'cardFloat 6s ease-in-out infinite' }}>
                    {/* Outer glow ring */}
                    <div 
                      className="absolute -inset-3 rounded-[28px] pointer-events-none"
                      style={{ 
                        background: 'conic-gradient(from 180deg, rgba(139,92,246,0.3), rgba(236,72,153,0.2), rgba(251,146,60,0.15), rgba(139,92,246,0.3))',
                        filter: 'blur(20px)',
                        animation: 'cardGlow 3s ease-in-out infinite'
                      }}
                    />

                    <div 
                      ref={cardRef}
                      onMouseMove={handleMouseMove}
                      onMouseEnter={() => setIsHoveringCard(true)}
                      onMouseLeave={() => {
                        setIsHoveringCard(false);
                        setTiltCoords({ x: 0, y: 0 });
                      }}
                      style={{ transform: cardTransform, transition: "transform 0.15s ease-out" }}
                      className="membership-card-shimmer relative w-[380px] rounded-[18px] overflow-hidden cursor-pointer shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                    >
                      {/* Fixed aspect ratio */}
                      <div className="relative w-full" style={{ paddingBottom: "63%" }}>
                        <div className="absolute inset-0">
                          
                          {/* Rich gradient background - visible and vibrant */}
                          <div className="absolute inset-0 bg-[#0c0c0e] border-[2px] border-purple-500/30" />

                          {/* Colorful gradient orbs */}
                          <div className="absolute inset-0 overflow-hidden">
                            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full" style={{
                              background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 65%)',
                              filter: 'blur(15px)'
                            }} />
                            <div className="absolute -bottom-6 -left-6 w-36 h-36 rounded-full" style={{
                              background: 'radial-gradient(circle, rgba(16,185,129,0.10) 0%, transparent 65%)',
                              filter: 'blur(12px)'
                            }} />
                          </div>

                          {/* Constellation dot pattern */}
                          <svg className="absolute inset-0 w-full h-full opacity-[0.08]" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="15%" cy="25%" r="1" fill="white"/>
                            <circle cx="85%" cy="15%" r="0.8" fill="white"/>
                            <circle cx="70%" cy="45%" r="1.2" fill="white"/>
                            <circle cx="25%" cy="65%" r="0.6" fill="white"/>
                            <circle cx="90%" cy="75%" r="1" fill="white"/>
                            <circle cx="45%" cy="85%" r="0.8" fill="white"/>
                            <circle cx="60%" cy="20%" r="0.5" fill="white"/>
                            <circle cx="35%" cy="40%" r="0.7" fill="white"/>
                            <line x1="15%" y1="25%" x2="35%" y2="40%" stroke="white" strokeWidth="0.3" opacity="0.5"/>
                            <line x1="70%" y1="45%" x2="85%" y2="15%" stroke="white" strokeWidth="0.3" opacity="0.5"/>
                            <line x1="60%" y1="20%" x2="70%" y2="45%" stroke="white" strokeWidth="0.3" opacity="0.5"/>
                          </svg>

                          {/* Cursor-follow spotlight */}
                          <div 
                            className="absolute inset-0 pointer-events-none transition-all duration-150"
                            style={{
                              background: isHoveringCard 
                                ? `radial-gradient(300px circle at ${50 + tiltCoords.x * 40}% ${50 + tiltCoords.y * 40}%, rgba(168,85,247,0.06), transparent 55%)`
                                : 'none',
                            }}
                          />
                          
                          {/* Top accent bar - gradient beam */}
                          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-purple-500 via-purple-500 to-purple-500" />
                          
                          {/* Bottom subtle accent */}
                          <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />

                          {/* Glowing border */}
                          <div className="absolute inset-0 rounded-[18px] border border-white/[0.12]" />

                          {/* ── Card Content ── */}
                          <div className="absolute inset-0 p-[18px] flex flex-col justify-between select-none">
                            
                            {/* Header */}
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2.5">
                                {logoBase64 ? (
                                  <div className="h-[28px] w-[28px] rounded-lg overflow-hidden ring-1 ring-white/10">
                                    <Image width={1200} height={1200} src={logoBase64} alt="" className="h-full w-full object-contain" />
                                  </div>
                                ) : (
                                  <div className="h-[28px] w-[28px] rounded-lg bg-purple-500/20 border border-purple-400/30" />
                                )}
                                <div>
                                  <span className="text-[11px] font-black tracking-[.22em] text-white block leading-none">
                                    TECH TATVA
                                  </span>
                                  <span className="text-[6px] font-bold tracking-[.18em] text-purple-400/50 block mt-[3px] uppercase">
                                    Student Club
                                  </span>
                                </div>
                              </div>

                              {cuLogoBase64 ? (
                                <div className="bg-white px-2 py-[5px] rounded-[7px] shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
                                  <Image width={1200} height={1200} src={cuLogoBase64} alt="" className="h-[13px] w-auto object-contain" />
                                </div>
                              ) : null}
                            </div>

                            {/* Chip + Status */}
                            <div className="flex items-center gap-3">
                              {/* Realistic NFC chip */}
                              <div className="relative h-[22px] w-[30px] rounded-[4px] overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#f5dfa0] via-[#d4aa4f] to-[#8a6914]" />
                                <div className="absolute inset-[2px] rounded-[2px] border border-black/[0.08]">
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-[10px] h-[14px] border border-black/[0.06] rounded-[1px]" />
                                  </div>
                                  <div className="absolute top-1/2 left-0 right-0 h-[0.5px] bg-black/[0.06]" />
                                  <div className="absolute left-1/2 top-0 bottom-0 w-[0.5px] bg-black/[0.06]" />
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20" />
                              </div>
                              
                              <span className="inline-flex items-center gap-[5px] bg-purple-400/[0.08] border border-purple-400/25 rounded-full px-[9px] py-[3px] backdrop-blur-sm">
                                <span className="h-[5px] w-[5px] rounded-full bg-purple-400 shadow-[0_0_6px_rgba(52,211,153,0.6)] animate-pulse" />
                                <span className="text-[6.5px] font-bold text-purple-300 uppercase tracking-[.14em]">Active Member</span>
                              </span>
                            </div>

                            {/* Name + Department */}
                            <div className="min-w-0">
                              <span className="text-[15px] font-extrabold text-white tracking-[.03em] block truncate leading-none drop-shadow-[0_0_12px_rgba(168,85,247,0.3)]">
                                {(form.fullName || "YOUR NAME HERE").toUpperCase()}
                              </span>
                              <span className="text-[7px] font-bold text-white/25 tracking-[.14em] uppercase block mt-[5px] truncate">
                                {form.department || "Department"}
                              </span>
                            </div>

                            {/* Footer */}
                            <div className="flex items-end justify-between">
                              <div className="flex gap-5">
                                <div>
                                  <span className="text-[5.5px] font-bold tracking-[.22em] text-white/20 uppercase block leading-none">UID</span>
                                  <span className="text-[9.5px] font-mono font-bold text-white/65 block mt-[3px] leading-none tracking-wider">
                                    {(form.uid || "— — — —").toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[5.5px] font-bold tracking-[.22em] text-white/20 uppercase block leading-none">Year</span>
                                  <span className="text-[9.5px] font-semibold text-white/65 block mt-[3px] leading-none">
                                    {form.year ? `${form.year} Year` : "— —"}
                                  </span>
                                </div>
                              </div>
                              
                              {/* Stylized barcode */}
                              <div className="flex items-end gap-[1.5px] h-[14px]">
                                {[2,1,3,1,2,1,1,3,1,2,1,3,2,1,1,2,1,3,1,2].map((w, i) => (
                                  <div 
                                    key={i} 
                                    className="rounded-[0.3px]"
                                    style={{ 
                                      width: `${w}px`, 
                                      height: `${5 + (i % 3) * 3 + (i % 5)}px`,
                                      background: `rgba(255,255,255,${0.15 + (i % 4) * 0.05})`
                                    }} 
                                  />
                                ))}
                              </div>
                            </div>

                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Perks Grid */}
                  <div className="mt-12 max-w-[420px] w-full">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { icon: "⚡", title: "Priority Event Access", desc: "First in line for workshops, hackathons & club sessions" },
                        { icon: "🏆", title: "Official Certification", desc: "Earn certificates of achievement and participation" },
                        { icon: "🔗", title: "Club Network", desc: "Connect with talented builders across all departments" },
                        { icon: "💳", title: "Digital Badge", desc: "Get your personalized downloadable membership card" },
                      ].map((perk, i) => (
                        <div 
                          key={i} 
                          className="group rounded-2xl border border-white/[0.06] bg-white/[0.015] p-4 hover:border-violet-500/25 hover:bg-violet-500/[0.04] transition-all duration-300 hover:shadow-[0_4px_20px_-4px_rgba(139,92,246,0.15)]"
                        >
                          <span className="text-xl block mb-2.5 group-hover:scale-110 transition-transform duration-300 inline-block">{perk.icon}</span>
                          <span className="text-[11px] font-bold text-white/85 block leading-tight">{perk.title}</span>
                          <span className="text-[9px] text-white/30 block mt-1.5 leading-relaxed">{perk.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Reveal>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
