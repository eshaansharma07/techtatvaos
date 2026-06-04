import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { isPortalHost } from "@/lib/portal-host";

const internalApiPrefixes = ["/api/admin", "/api/attendance", "/api/certificates", "/api/ai", "/api/search"];
const portalOnlyPrefixes = ["/portal", "/login", "/invite", "/api/auth", "/api/portal", ...internalApiPrefixes];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const portal = isPortalHost(req);
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
  matcher: ["/((?!_next/static|_next/image|favicon.ico|tech-tatva-hero.png).*)"]
};
