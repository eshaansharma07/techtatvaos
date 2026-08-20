# 🚀 TECHNOMANIA 3.0 — Sub-Project Documentation

Welcome to the **Technomania 3.0** festival portal! This documentation is designed for teammates collaborating on the Technomania project to ensure a completely smooth development workflow without disturbing the main **Tech Tatva OS** website.

---

## 🏛️ Architectural Isolation & Entity Separation

Technomania 3.0 is built as an **autonomous festival entity** inside the shared repository, designed to run both as a subpath (`/technomania`) and on its own dedicated subdomain (`technomania.techtatva.in`).

### 📂 Directory Structure (Technomania Scope)

All Technomania code is strictly scoped within isolated folders. **Do not modify files outside these directories unless coordinating main site changes:**

| Directory / File | Purpose |
|---|---|
| `src/app/technomania/` | Public pages (`/`, `/events`, `/events/[slug]`, `/schedule`, `/teams`, `/leaderboard`, `/register`) |
| `src/app/technomania/admin/` | Dedicated TM 3.0 Admin Command Portal (Overview, Arenas, Registrations, Schedule, Leaderboard, Content, Sponsors, FAQs, Notifications, Logs, Settings) |
| `src/components/technomania/` | Modular UI components (Hero, Reticle, Cards, Countdown, Forms, Sci-Fi Intro) |
| `src/lib/technomania-*.ts` | Data layers, theme tokens, persistence, links (`technomania-theme.ts`, `technomania-data.ts`, `technomania-store.ts`, `technomania-links.ts`) |
| `src/app/api/technomania/` | Dedicated APIs (`/events`, `/stats`, `/register`, `/admin/content`, `/admin/upload`) |
| `public/technomania/` | Static festival assets (TM 3.0 emblem logos, banners, icons) |

---

## 💻 Local Development Guide

### 1. Install & Run
```bash
# Install dependencies
npm install

# Start Next.js development server
npm run dev
```

### 2. Access URLs
- **Technomania 3.0 Public Website**: [http://localhost:3000/technomania](http://localhost:3000/technomania)
- **Technomania 3.0 Admin Portal**: [http://localhost:3000/technomania/admin](http://localhost:3000/technomania/admin)
- **Main Tech Tatva Website (Reference)**: [http://localhost:3000/](http://localhost:3000/)
- **Main Tech Tatva Admin Portal (Reference)**: [http://localhost:3000/portal](http://localhost:3000/portal)

---

## 🎨 Design System & Theme Rules

The Technomania 3.0 visual design strictly follows the **monochrome white emblem logo aesthetic**:

- **Palette**: Pure Black (`#000000`), Obsidian Surfaces (`#09090b` / `#18181b`), Zinc Borders (`#27272a` / `#3f3f46`), Titanium White Text/Accents (`#ffffff`), and Zinc Secondary (`#a1a1aa` / `#71717a`).
- **Typography**: Inter (Body), Space Grotesk / Syncopate (Headings), JetBrains Mono (Telemetry & Badges).
- **Styling Helpers**: Use `.tm-grid-bg`, `.tm-card`, `.tm-btn`, `.tm-btn-solid`, `.tm-glow`, `.tm-input` in `src/app/globals.css`.

---

## 🗄️ Database & Data Flow

1. **Shared Database Models**:
   - Technomania uses the unified `Event` and `EventRegistration` collections in MongoDB with `fest: "technomania"`.
2. **Synchronized Registration Flow**:
   - Registrations submitted on `/technomania/register` save to `EventRegistration`.
   - Data appears in real-time in both the **Technomania Admin Portal (`/technomania/admin`)** and the **Main Website Admin Portal (`/portal/attendance`)** for QR attendance check-ins.

---

## 🌿 Git & Collaboration Workflow

### Working on Technomania Features:
1. Always branch off `technomania` (or `feature/technomania-fest`):
   ```bash
   git checkout technomania
   git pull origin technomania
   git checkout -b feature/your-feature-name
   ```
2. Only make changes within `src/app/technomania/`, `src/components/technomania/`, `src/app/api/technomania/`, and `public/technomania/`.
3. Commit and open a Pull Request targeting the `technomania` branch:
   ```bash
   git push origin feature/your-feature-name
   ```
