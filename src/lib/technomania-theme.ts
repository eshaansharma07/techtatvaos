/* ── Technomania 3.0 Theme Constants ── */

export const TM_THEME = {
  colors: {
    bg: "#000000",
    surface: "#09090b",
    border: "#27272a",
    grid: "#18181b",
    text: "#ffffff",
    muted: "#a1a1aa",
    dim: "#71717a",
    accent: "#ffffff",
  },
  fonts: {
    heading: "Orbitron",
    body: "Space Grotesk",
    mono: "JetBrains Mono",
  },
} as const;

/* ── Fest Configuration ── */
export const TM_CONFIG = {
  name: "Technomania 3.0",
  shortName: "TM3.0",
  tagline: "Tech Tatva's Flagship Technical Festival",
  organizer: "Tech Tatva — Chandigarh University",
  festTag: "technomania", // Used to filter events from DB
  domain: "technomania.techtatva.in",
  socialLinks: {
    instagram: "https://instagram.com/techtatva.cu",
    linkedin: "https://linkedin.com/company/techtatva",
    github: "https://github.com/techtatva",
  },
} as const;

/* ── Event Categories ── */
export const TM_CATEGORIES = [
  { slug: "hackathon", label: "HACKATHON", icon: "💻" },
  { slug: "esports", label: "ESPORTS", icon: "🎮" },
  { slug: "cultural", label: "CULTURAL", icon: "🎭" },
  { slug: "sub-event", label: "SUB-EVENT", icon: "⚡" },
] as const;

export type TMCategory = (typeof TM_CATEGORIES)[number]["slug"];
