import "./globals.css";
import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { ServiceWorkerRegister } from "@/components/sw-register";
import { FloatingAIChat } from "@/components/floating-ai-chat";

/* ── Portal host detection (mirrors lib/portal-host.ts logic) ── */
const portalHosts = (
  process.env.PORTAL_HOSTS ||
  `${(process.env.PORTAL_HOST || "techtatvaadmin.techtatva.in").toLowerCase()},techtatvaos-portal.vercel.app,portal.techtatva.in`
)
  .split(",")
  .map((h) => h.trim().toLowerCase())
  .filter(Boolean);

const technomaniaHosts = (process.env.TECHNOMANIA_HOSTS || "technomania.techtatva.in")
  .split(",")
  .map((h) => h.trim().toLowerCase())
  .filter(Boolean);

function isPortal(host: string) {
  const h = host.split(":")[0].toLowerCase();
  if (portalHosts.includes(h)) return true;
  if (process.env.NODE_ENV !== "production" && (h.startsWith("admin") || h.startsWith("portal") || h.includes("admin") || h.includes("portal"))) return true;
  return false;
}

function isTechnomania(host: string) {
  const h = host.split(":")[0].toLowerCase();
  if (technomaniaHosts.includes(h)) return true;
  if (process.env.NODE_ENV !== "production" && (h.startsWith("technomania") || h.includes("technomania"))) return true;
  return false;
}

/* ── Viewport (shared by both apps) ── */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#08040a",
};

/* ── Dynamic metadata — serves the correct manifest per hostname ── */
export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") || headersList.get("host") || "";
  const portal = isPortal(host);
  const technomania = !portal && isTechnomania(host);

  if (technomania) {
    return {
      title: "Technomania 3.0 — Tech Tatva's Flagship Tech Fest",
      description: "The ultimate technical festival by Tech Tatva, Chandigarh University. Hackathon, Esports, Cultural events, and more.",
      manifest: "/manifest-technomania.json",
      appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: "TM3.0",
      },
      icons: {
        icon: [
          { url: "/technomania/logo.png", sizes: "512x512", type: "image/png" },
        ],
      },
      openGraph: {
        title: "Technomania 3.0",
        description: "Tech Tatva's Flagship Technical Festival — Hackathon, Esports, Cultural & more.",
        images: [{ url: "/technomania/logo.png" }],
        siteName: "Technomania 3.0",
      },
      other: {
        "mobile-web-app-capable": "yes",
      },
    };
  }

  return {
    title: portal ? "Tech Tatva Admin" : "Tech Tatva OS",
    description: portal
      ? "Tech Tatva Admin Portal — manage events, teams, and operations."
      : "The operating system for a new generation of builders.",
    manifest: portal ? "/manifest-portal.json" : "/manifest.json",
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: portal ? "TT Admin" : "Tech Tatva",
    },
    icons: {
      icon: [
        { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
        { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    },
    other: {
      "mobile-web-app-capable": "yes",
    },
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") || headersList.get("host") || "";
  const showChat = !isPortal(host) && !isTechnomania(host);

  return (
    <html lang="en">
      <body>
        {children}
        {showChat && <FloatingAIChat />}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}

