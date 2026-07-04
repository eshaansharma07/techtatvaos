import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { StudentMember } from "@/lib/models";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query")?.trim();

    if (!query) {
      return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for") || "local";
    if (!rateLimit(`membership-check:${ip}`, 10, 60_000)) {
      return NextResponse.json({ error: "Too many attempts. Try again in a minute." }, { status: 429 });
    }

    await connectDB();

    // Find member by email (case-insensitive) or UID (uppercase)
    const member = await StudentMember.findOne({
      $or: [
        { email: query.toLowerCase() },
        { uid: query.toUpperCase() }
      ]
    }).lean() as any;

    if (!member) {
      return NextResponse.json({ registered: false });
    }

    return NextResponse.json({
      registered: true,
      name: member.fullName,
      uid: member.uid,
      registeredAt: member.registeredAt
    });
  } catch (error) {
    console.error("Failed to query membership registration:", error);
    return NextResponse.json({ error: "Database query failed" }, { status: 500 });
  }
}
