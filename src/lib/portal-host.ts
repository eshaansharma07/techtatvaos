import { NextRequest } from "next/server";

export const portalHost = (process.env.PORTAL_HOST || "techtatvaadmin.techtatva.in").toLowerCase();
const portalHosts = (process.env.PORTAL_HOSTS || `${portalHost},techtatvaos-portal.vercel.app,portal.techtatva.in`)
  .split(",")
  .map((host) => host.trim().toLowerCase())
  .filter(Boolean);

const technomaniaHosts = (process.env.TECHNOMANIA_HOSTS || "technomania.techtatva.in")
  .split(",")
  .map((host) => host.trim().toLowerCase())
  .filter(Boolean);

export function hostOf(req: NextRequest) {
  return (req.headers.get("x-forwarded-host") || req.headers.get("host") || "").split(":")[0].toLowerCase();
}

export function hostOfHeaders(headersList: { get(name: string): string | null }) {
  return (headersList.get("x-forwarded-host") || headersList.get("host") || "").split(":")[0].toLowerCase();
}

export function isPortalHost(req: NextRequest) {
  const host = hostOf(req);
  if (!host) return false;
  if (portalHosts.includes(host)) return true;
  if (process.env.NODE_ENV !== "production" && (host.startsWith("admin") || host.startsWith("portal") || host.includes("admin") || host.includes("portal"))) return true;
  return false;
}

export function isTechnomaniaHost(req: NextRequest) {
  const host = hostOf(req);
  if (!host) return false;
  if (technomaniaHosts.includes(host)) return true;
  if (process.env.NODE_ENV !== "production" && (host.startsWith("technomania") || host.includes("technomania"))) return true;
  return false;
}

export function isTechnomaniaHostByName(host: string) {
  const h = host.split(":")[0].toLowerCase();
  if (!h) return false;
  if (technomaniaHosts.includes(h)) return true;
  if (process.env.NODE_ENV !== "production" && (h.startsWith("technomania") || h.includes("technomania"))) return true;
  return false;
}

export function portalUrl(path = "/portal") {
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  return `${protocol}://${portalHost}${path}`;
}
