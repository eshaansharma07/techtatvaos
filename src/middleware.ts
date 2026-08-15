import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { isPortalHost, isTechnomaniaHost } from "@/lib/portal-host";

const internalApiPrefixes = ["/api/admin", "/api/attendance", "/api/certificates", "/api/ai/event-report", "/api/ai/mom", "/api/ai/secretary", "/api/search", "/api/recruitment/export", "/api/recruitment/bulk", "/api/membership/export", "/api/membership/bulk"];
const portalOnlyPrefixes = ["/portal", "/login", "/invite", "/api/auth", "/api/portal", ...internalApiPrefixes];

/* ── Technomania public routes that get rewritten ── */
const technomaniaRewrites: [string, string][] = [
  ["/events/", "/technomania/events/"],
  ["/events", "/technomania/events"],
  ["/schedule", "/technomania/schedule"],
  ["/teams", "/technomania/teams"],
  ["/register", "/technomania/register"],
  ["/leaderboard", "/technomania/leaderboard"],
];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const portal = isPortalHost(req);
  const technomania = !portal && isTechnomaniaHost(req);

  /* ── Technomania subdomain routing ── */
  if (technomania) {
    // Block admin/portal routes on Technomania host
    if (portalOnlyPrefixes.some((prefix) => path.startsWith(prefix))) {
      return new NextResponse("Not found", { status: 404 });
    }

    // Allow API routes through (events registration, technomania APIs, etc.)
    if (path.startsWith("/api/")) {
      return NextResponse.next();
    }

    // Allow /technomania/* routes through directly (already correct path)
    if (path.startsWith("/technomania")) {
      return NextResponse.next();
    }

    // Allow static assets through
    if (path.startsWith("/_next") || path.startsWith("/icons")) {
      return NextResponse.next();
    }

    // Rewrite root to Technomania landing page
    if (path === "/" || path === "") {
      const url = req.nextUrl.clone();
      url.pathname = "/technomania";
      return NextResponse.rewrite(url);
    }

    // Rewrite known routes to /technomania/* equivalents
    for (const [from, to] of technomaniaRewrites) {
      if (path === from || path.startsWith(from)) {
        const url = req.nextUrl.clone();
        url.pathname = path.replace(from, to);
        return NextResponse.rewrite(url);
      }
    }

    // Any other route on Technomania host → try rewriting to /technomania/[path]
    const url = req.nextUrl.clone();
    url.pathname = `/technomania${path}`;
    return NextResponse.rewrite(url);
  }

  /* ── Existing portal/public routing ── */
  const internalPath = path.startsWith("/admin") || portalOnlyPrefixes.some((prefix) => path.startsWith(prefix));

  if (!portal && internalPath) {
    return new NextResponse("Not found", { status: 404 });
  }

  if (portal && path === "/") {
    return NextResponse.redirect(new URL("/portal", req.url));
  }

  if (portal && !portalOnlyPrefixes.some((prefix) => path.startsWith(prefix))) {
    return NextResponse.redirect(new URL("/portal", req.url));
  }

  if (portal && path.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/portal", req.url));
  }

  if (portal && (path.startsWith("/portal") || internalApiPrefixes.some((prefix) => path.startsWith(prefix)))) {
    const secret =
      process.env.AUTH_SECRET ||
      (process.env.NODE_ENV === "development" ? "tech-tatva-local-development-only" : undefined);
    const token = await getToken({
      req,
      secret,
      secureCookie: req.nextUrl.protocol === "https:"
    });

    if (!token) {
      const signInUrl = new URL("/login", req.nextUrl.origin);
      signInUrl.searchParams.set("callbackUrl", req.nextUrl.href);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|icons/|manifest.*\\.json|sw\\.js).*)"]
};

