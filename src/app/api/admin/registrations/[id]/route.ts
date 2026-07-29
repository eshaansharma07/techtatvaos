import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { EventRegistration, Attendance } from "@/lib/models";
import { audit, requirePortal } from "@/lib/portal";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = await requirePortal(req);
  if (blocked) return blocked;

  await connectDB();
  const { id } = await params;

  const registration = await EventRegistration.findById(id);
  if (!registration) {
    return NextResponse.json({ error: "Registration not found" }, { status: 404 });
  }

  const eventId = registration.event;
  const userId = registration.user;

  await Attendance.deleteMany({ event: eventId, user: userId });
  await EventRegistration.findByIdAndDelete(id);

  await audit(req, "portal.registrations.delete", { entityType: "registrations", entityId: id });
  return NextResponse.json({ success: true });
}
