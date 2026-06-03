import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
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
  if (!Types.ObjectId.isValid(event) || !Types.ObjectId.isValid(user)) return NextResponse.json({ error: "Valid event and user ids are required" }, { status: 400 });

  await connectDB();
  const update: Record<string, any> = {
    event,
    user,
    status,
    method: "manual",
    markedAt: new Date()
  };
  if (registration && Types.ObjectId.isValid(registration)) update.registration = registration;
  if ((session.user as any).id && Types.ObjectId.isValid((session.user as any).id)) update.markedBy = (session.user as any).id;

  const record = await Attendance.findOneAndUpdate(
    { event, user },
    { $set: update },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await audit(req, "portal.attendance.mark", { entityType: "attendance", entityId: String(record._id), event, user, status });
  return NextResponse.json(record);
}
