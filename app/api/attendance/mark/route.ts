import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { Attendance } from "@/lib/models";
import { audit, requirePortal } from "@/lib/portal";

export async function POST(req: NextRequest) {
  const blocked = await requirePortal(req);
  if (blocked) return blocked;

  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const event = String(body.event || "");
  const user = String(body.user || "");
  const registration = body.registration ? String(body.registration) : undefined;
  const status = body.status === "present" ? "present" : body.status === "absent" ? "absent" : "";

  if (!event || !user || !status) return NextResponse.json({ error: "event, user, and status are required" }, { status: 400 });

  await connectDB();
  const record = await Attendance.findOneAndUpdate(
    { event, user },
    {
      $set: {
        event,
        user,
        registration,
        status,
        method: "manual",
        markedAt: new Date(),
        markedBy: (session.user as any).id
      }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await audit(req, "portal.attendance.mark", { entityType: "attendance", entityId: String(record._id), event, user, status });
  return NextResponse.json(record);
}
