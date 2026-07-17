"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Megaphone, ArrowRight, Sparkles, AlertTriangle, Info, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type AnnouncementType = "info" | "event" | "alert" | "promo";

interface AnnouncementData {
  announcementEnabled?: boolean;
  announcementText?: string;
  announcementLink?: string;
  announcementLinkText?: string;
  announcementType?: AnnouncementType;
  announcementDetails?: string;
}

const typeConfig: Record<AnnouncementType, { icon: typeof Info; gradient: string; glow: string; border: string; dot: string }> = {
  info: {
    icon: Info,
    gradient: "from-blue-500/10 to-transparent",
    glow: "bg-blue-500/5",
    border: "border-blue-500",
    dot: "bg-blue-500",
  },
  event: {
    icon: Sparkles,
    gradient: "from-purple-500/10 to-transparent",
    glow: "bg-purple-500/5",
    border: "border-purple-500",
    dot: "bg-purple-500",
  },
  alert: {
    icon: AlertTriangle,
    gradient: "from-orange-500/10 to-transparent",
    glow: "bg-orange-500/5",
    border: "border-orange-500",
    dot: "bg-orange-500",
  },
  promo: {
    icon: Megaphone,
    gradient: "from-fuchsia-500/10 to-transparent",
    glow: "bg-fuchsia-500/5",
    border: "border-fuchsia-500",
    dot: "bg-fuchsia-500",
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
  const [expanded, setExpanded] = useState(false);

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
  const hasDetails = !!data.announcementDetails?.trim();

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
        className={`relative overflow-hidden rounded-2xl border-2 ${cfg.border} bg-[#0a0812]/95 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]`}
      >
        {/* Gradient accent */}
        <div className={`absolute inset-0 bg-gradient-to-r ${cfg.gradient} pointer-events-none`} />

        {/* Content Container (Clickable if details are present) */}
        <div
          onClick={hasDetails ? () => setExpanded(!expanded) : undefined}
          className={`relative flex flex-col transition-colors ${
            hasDetails ? "cursor-pointer select-none hover:bg-white/[0.02]" : ""
          }`}
        >
          <div className="relative flex items-center gap-3 px-4 py-3 sm:px-5 sm:py-3.5">
            {/* Pulsing dot + icon */}
            <div className="flex shrink-0 items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${cfg.dot} animate-pulse`} />
              <Icon size={15} className="text-[#00FF66]" />
            </div>

            {/* Text content */}
            <div className="min-w-0 flex-1">
              <p className="text-[12px] sm:text-[13px] font-bold text-white/80 leading-snug truncate">
                {data.announcementText}
              </p>
            </div>

            {/* Action link */}
            {data.announcementLink && (
              <div onClick={(e) => e.stopPropagation()}>
                <Link
                  href={data.announcementLink}
                  className="brutalist-btn-green flex shrink-0 items-center gap-1 rounded-xl px-3 py-1.5 text-[10px] sm:text-[11px] font-bold text-black border border-black shadow-[1px_1px_0px_0px_rgba(255,255,255,0.8)]"
                >
                  {data.announcementLinkText || "View"}
                  <ArrowRight size={11} className="transition group-hover:translate-x-0.5" />
                </Link>
              </div>
            )}

            {/* Chevron toggle indicator if details present */}
            {hasDetails && (
              <ChevronDown
                size={16}
                className={`text-white/40 transition-transform duration-300 shrink-0 ${
                  expanded ? "rotate-180 text-white/70" : ""
                }`}
              />
            )}

            {/* Dismiss */}
            <div onClick={(e) => e.stopPropagation()}>
              <button
                onClick={handleDismiss}
                className="flex shrink-0 items-center justify-center rounded-full p-1.5 text-white/25 transition hover:bg-white/[0.08] hover:text-white/60"
                aria-label="Dismiss announcement"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Expanded details panel */}
          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{
                  height: "auto",
                  opacity: 1,
                  transition: {
                    height: { duration: 0.3, ease: "easeOut" },
                    opacity: { duration: 0.2, delay: 0.05 }
                  }
                }}
                exit={{
                  height: 0,
                  opacity: 0,
                  transition: {
                    height: { duration: 0.25, ease: "easeIn" },
                    opacity: { duration: 0.15 }
                  }
                }}
                className="overflow-hidden"
              >
                <div
                  className="px-4 pb-4 pt-1 sm:px-5 sm:pb-5 text-[11px] sm:text-[12px] leading-[1.6] text-white/55 border-t-2 border-black bg-black/60 select-text whitespace-pre-wrap cursor-text"
                  onClick={(e) => e.stopPropagation()}
                >
                  {data.announcementDetails}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
