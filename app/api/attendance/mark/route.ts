import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { Attendance } from "@/lib/models";
import { audit, requirePortal } from "@/lib/portal";

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
  if (!Types.ObjectId.isValid(event) || !Types.ObjectId.isValid(user)) return NextResponse.json({ error: "Valid event and user ids are required" }, { status: 400 });

  await connectDB();
  const eventId = new Types.ObjectId(event);
  const userId = new Types.ObjectId(user);
  const update: Record<string, any> = {
    event: eventId,
    user: userId,
    status,
    method: "manual",
    markedAt: new Date()
  };
  if (registration && Types.ObjectId.isValid(registration)) update.registration = new Types.ObjectId(registration);
  if ((session.user as any).id && Types.ObjectId.isValid((session.user as any).id)) update.markedBy = new Types.ObjectId((session.user as any).id);

  const record = await Attendance.findOneAndUpdate(
    { event: eventId, user: userId },
    { $set: update },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  ).populate("event", "title").populate("user", "name email uid registrationNumber program semester");

  await audit(req, "portal.attendance.mark", { entityType: "attendance", entityId: String(record._id), event, user, status });
  const res = NextResponse.json(record);
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  return res;
}
