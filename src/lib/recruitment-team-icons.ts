import {
  CalendarDays,
  Clapperboard,
  Code2,
  Handshake,
  Megaphone,
  Palette,
  PenLine,
  Settings2,
  Users,
  type LucideIcon
} from "lucide-react";

export const recruitmentTeamIcons: Record<string, { emoji: string; Icon: LucideIcon; accent: string }> = {
  media: { emoji: "🎥", Icon: Clapperboard, accent: "from-rose-400/25 to-orange-300/10 text-rose-100" },
  operations: { emoji: "⚙️", Icon: Settings2, accent: "from-sky-400/25 to-cyan-300/10 text-sky-100" },
  technical: { emoji: "💻", Icon: Code2, accent: "from-violet-400/25 to-indigo-300/10 text-violet-100" },
  design: { emoji: "🎨", Icon: Palette, accent: "from-fuchsia-400/25 to-pink-300/10 text-fuchsia-100" },
  marketing: { emoji: "📢", Icon: Megaphone, accent: "from-amber-400/25 to-yellow-300/10 text-amber-100" },
  sponsorship: { emoji: "🤝", Icon: Handshake, accent: "from-emerald-400/25 to-teal-300/10 text-emerald-100" },
  content: { emoji: "✍️", Icon: PenLine, accent: "from-lime-400/25 to-green-300/10 text-lime-100" },
  "event-management": { emoji: "🎭", Icon: CalendarDays, accent: "from-orange-400/25 to-amber-300/10 text-orange-100" },
  "human-resources": { emoji: "👥", Icon: Users, accent: "from-blue-400/25 to-indigo-300/10 text-blue-100" }
};

export const recruitmentTeamIconSeed: Record<string, string> = Object.fromEntries(
  Object.entries(recruitmentTeamIcons).map(([slug, meta]) => [slug, meta.emoji])
);

export function getRecruitmentTeamIcon(slug?: string, fallback?: string) {
  if (slug && recruitmentTeamIcons[slug]) return recruitmentTeamIcons[slug];
  return { emoji: fallback || "✨", Icon: Users, accent: "from-white/10 to-white/5 text-white/80" };
}
