import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { audit, requirePortal } from "@/lib/portal";
import { markAttendanceStatus } from "@/lib/services/attendance-mark";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  const blocked = await requirePortal(req);
  if (blocked) return blocked;

  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const event = String(body.event || "");
  const user = String(body.user || "");
  const registration = body.registration ? String(body.registration) : undefined;
  const requestedStatus = body.action === "mark_present" ? "present" : body.action === "mark_absent" ? "absent" : body.status;
  const status = requestedStatus === "present" ? "present" : requestedStatus === "absent" ? "absent" : "";

  if (!event || !user || !status) return NextResponse.json({ error: "event, user, and status are required" }, { status: 400 });
  try {
    const record = await markAttendanceStatus({
      event,
      user,
      registration,
      status,
      markedBy: (session.user as { id?: string }).id
    });
    await audit(req, "portal.attendance.mark", { entityType: "attendance", entityId: String(record._id), event, user, status });
    const res = NextResponse.json(record);
    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return res;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not update attendance" }, { status: 400 });
  }
}
