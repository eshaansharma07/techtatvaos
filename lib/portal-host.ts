import { NextRequest } from "next/server";

export const portalHost = (process.env.PORTAL_HOST || "portal.techtatva.in").toLowerCase();

export function hostOf(req: NextRequest) {
  return (req.headers.get("x-forwarded-host") || req.headers.get("host") || "").split(":")[0].toLowerCase();
}

export function isPortalHost(req: NextRequest) {
  const host = hostOf(req);
  if (!host) return false;
  if (host === portalHost) return true;
  if (process.env.NODE_ENV !== "production" && ["localhost", "127.0.0.1"].includes(host)) return true;
  return false;
}

export function portalUrl(path = "/portal") {
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  return `${protocol}://${portalHost}${path}`;
}
