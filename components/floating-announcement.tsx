"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Megaphone, ArrowRight, Sparkles, AlertTriangle, Info } from "lucide-react";

type AnnouncementType = "info" | "event" | "alert" | "promo";

interface AnnouncementData {
  announcementEnabled?: boolean;
  announcementText?: string;
  announcementLink?: string;
  announcementLinkText?: string;
  announcementType?: AnnouncementType;
}

const typeConfig: Record<AnnouncementType, { icon: typeof Info; gradient: string; glow: string; border: string; dot: string }> = {
  info: {
    icon: Info,
    gradient: "from-violet-500/15 via-violet-500/5 to-transparent",
    glow: "bg-violet-500/20",
    border: "border-violet-500/20",
    dot: "bg-violet-400",
  },
  event: {
    icon: Sparkles,
    gradient: "from-fuchsia-500/15 via-fuchsia-500/5 to-transparent",
    glow: "bg-fuchsia-500/20",
    border: "border-fuchsia-500/20",
    dot: "bg-fuchsia-400",
  },
  alert: {
    icon: AlertTriangle,
    gradient: "from-amber-500/15 via-amber-500/5 to-transparent",
    glow: "bg-amber-500/20",
    border: "border-amber-500/20",
    dot: "bg-amber-400",
  },
  promo: {
    icon: Megaphone,
    gradient: "from-emerald-500/15 via-emerald-500/5 to-transparent",
    glow: "bg-emerald-500/20",
    border: "border-emerald-500/20",
    dot: "bg-emerald-400",
  },
};

const getDismissalKey = (text: string) => {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return `announcement-dismissed-${hash}`;
};

export function FloatingAnnouncement({ data }: { data: AnnouncementData }) {
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if user already dismissed this specific announcement
    const key = getDismissalKey(data.announcementText || "");
    if (sessionStorage.getItem(key)) {
      setDismissed(true);
      return;
    }
    // Animate in after a small delay
    const timer = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(timer);
  }, [data.announcementText]);

  if (!data.announcementEnabled || !data.announcementText || dismissed) return null;

  const type = (data.announcementType as AnnouncementType) || "info";
  const cfg = typeConfig[type] || typeConfig.info;
  const Icon = cfg.icon;

  const handleDismiss = () => {
    setVisible(false);
    const key = getDismissalKey(data.announcementText || "");
    sessionStorage.setItem(key, "1");
    setTimeout(() => setDismissed(true), 300);
  };

  return (
    <div
      className={`fixed bottom-6 left-1/2 z-[60] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 transition-all duration-500 ease-out ${
        visible
          ? "translate-y-0 opacity-100 scale-100"
          : "translate-y-8 opacity-0 scale-95"
      }`}
    >
      {/* Ambient glow behind */}
      <div className={`absolute -inset-4 rounded-[2rem] ${cfg.glow} blur-[40px] opacity-40`} />

      <div
        className={`relative overflow-hidden rounded-2xl border ${cfg.border} bg-[#0a0812]/90 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]`}
      >
        {/* Gradient accent */}
        <div className={`absolute inset-0 bg-gradient-to-r ${cfg.gradient} pointer-events-none`} />

        <div className="relative flex items-center gap-3 px-4 py-3 sm:px-5 sm:py-3.5">
          {/* Pulsing dot + icon */}
          <div className="flex shrink-0 items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${cfg.dot} animate-pulse`} />
            <Icon size={15} className="text-white/60" />
          </div>

          {/* Text content */}
          <div className="min-w-0 flex-1">
            <p className="text-[12px] sm:text-[13px] font-medium text-white/80 leading-snug truncate">
              {data.announcementText}
            </p>
          </div>

          {/* Action link */}
          {data.announcementLink && (
            <Link
              href={data.announcementLink}
              className="group flex shrink-0 items-center gap-1 rounded-full bg-white/[0.08] px-3 py-1.5 text-[10px] sm:text-[11px] font-semibold text-white/70 transition hover:bg-white/[0.14] hover:text-white"
            >
              {data.announcementLinkText || "View"}
              <ArrowRight size={11} className="transition group-hover:translate-x-0.5" />
            </Link>
          )}

          {/* Dismiss */}
          <button
            onClick={handleDismiss}
            className="flex shrink-0 items-center justify-center rounded-full p-1.5 text-white/25 transition hover:bg-white/[0.08] hover:text-white/60"
            aria-label="Dismiss announcement"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
