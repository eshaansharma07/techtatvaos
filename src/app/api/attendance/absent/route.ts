import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { markAttendanceStatus } from "@/lib/services/attendance-mark";
import { audit, requirePortal } from "@/lib/portal";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  const blocked = await requirePortal(req);
  if (blocked) return blocked;

  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const record = await markAttendanceStatus({
      event: String(body.event || ""),
      user: String(body.user || ""),
      registration: body.registration ? String(body.registration) : undefined,
      status: "absent",
      markedBy: (session.user as { id?: string }).id
    });
    await audit(req, "portal.attendance.absent", { entityType: "attendance", entityId: String(record._id), event: body.event, user: body.user });
    const res = NextResponse.json(record);
    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return res;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not mark absent" }, { status: 400 });
  }
}
