import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#060509",
        graphite: "#111016",
        violet: "#8b5cf6",
        magenta: "#ec4899"
      },
      fontFamily: { sans: ["var(--font-inter)", "Inter", "sans-serif"] },
      animation: { "slow-spin": "spin 24s linear infinite", float: "float 7s ease-in-out infinite" },
      keyframes: { float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-10px)" } } }
    }
  },
  plugins: []
} satisfies Config;
