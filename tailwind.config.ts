import type { Config } from "tailwindcss";

export default {
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#08040a",
        graphite: "#181018",
        violet: "#8b5cf6",
        magenta: "#ec4899",
        rose: "#e879a6",
        peach: "#fdba74",
        cream: "#fff7ed",
        /* Technomania Blueprint palette */
        "tm-bg": "#0a0a0a",
        "tm-surface": "#141414",
        "tm-border": "#2a2a2a",
        "tm-grid": "#1a1a1a",
        "tm-text": "#ffffff",
        "tm-muted": "#a0a0a0",
        "tm-dim": "#555555",
        "tm-accent": "#4a9eff",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        "tm-heading": ["var(--font-orbitron)", "Orbitron", "sans-serif"],
        "tm-body": ["var(--font-space-grotesk)", "Space Grotesk", "sans-serif"],
        "tm-mono": ["var(--font-jetbrains-mono)", "JetBrains Mono", "monospace"],
      },
      animation: {
        "slow-spin": "spin 24s linear infinite",
        float: "float 7s ease-in-out infinite",
        "tm-scan": "tm-scan 4s ease-in-out infinite",
        "tm-blink": "tm-blink 1.5s step-end infinite",
        "tm-draw": "tm-draw 1.5s ease-out forwards",
        "tm-pulse-glow": "tm-pulse-glow 2s ease-in-out infinite",
        marquee: "marquee 28s linear infinite",
      },
      keyframes: {
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-10px)" } },
        "tm-scan": { "0%,100%": { opacity: "0.3", transform: "translateY(0)" }, "50%": { opacity: "0.8", transform: "translateY(100vh)" } },
        "tm-blink": { "0%,100%": { opacity: "1" }, "50%": { opacity: "0" } },
        "tm-draw": { "0%": { strokeDashoffset: "100%" }, "100%": { strokeDashoffset: "0%" } },
        "tm-pulse-glow": { "0%,100%": { boxShadow: "0 0 0 0 rgba(74,158,255,0)" }, "50%": { boxShadow: "0 0 20px 2px rgba(74,158,255,0.15)" } },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;

