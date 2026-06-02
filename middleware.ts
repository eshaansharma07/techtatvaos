import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export default async function middleware(req: NextRequest) {
  const secret =
    process.env.AUTH_SECRET ||
    (process.env.NODE_ENV === "development" ? "tech-tatva-local-development-only" : undefined);
  const token = await getToken({ req, secret });

  if (req.nextUrl.pathname.startsWith("/admin") && !token) {
    const signInUrl = new URL("/login", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.href);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
