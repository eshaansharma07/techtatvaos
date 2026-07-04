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

function isPortal(host: string) {
  return portalHosts.includes(host.split(":")[0].toLowerCase());
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
  const showChat = !isPortal(host);

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
