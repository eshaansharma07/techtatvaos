/* ── Technomania 3.0 Theme Constants ── */

export const TM_THEME = {
  colors: {
    bg: "#0a0a0a",
    surface: "#141414",
    border: "#2a2a2a",
    grid: "#1a1a1a",
    text: "#ffffff",
    muted: "#a0a0a0",
    dim: "#555555",
    accent: "#4a9eff",
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
