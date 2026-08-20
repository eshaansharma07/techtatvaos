import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { Attendance, Event, EventRegistration } from "@/lib/models";
import { audit, requirePortal } from "@/lib/portal";
import { attendancePdf, attendanceXlsx } from "@/lib/services/attendance-export";
import { Types } from "mongoose";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ExportStudent = { uid?: string; name: string; program?: string; semester?: number };

const objectId = (value: any) => String(value?._id || value?.id || value || "");
const studentFromCandidate = (candidate: any): ExportStudent | null => {
  const user = candidate?.user && typeof candidate.user === "object" ? candidate.user : candidate;
  if (!candidate && !user) return null;
  return {
    uid: candidate?.uid || user?.uid || "",
    name: candidate?.name || user?.name || "",
    program: candidate?.program || user?.program || "",
    semester: candidate?.semester || user?.semester
  };
};

export async function GET(req: NextRequest) {
  const blocked = await requirePortal(req);
  if (blocked) return blocked;
  if (!await auth()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("event");
  const format = req.nextUrl.searchParams.get("format") || "pdf";
  if (!id) return NextResponse.json({ error: "event is required" }, { status: 400 });
  if (!Types.ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid event id" }, { status: 400 });

  await connectDB();
  const eventObjectId = new Types.ObjectId(id);
  const event = await Event.findById(eventObjectId);
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  const [presentRows, registrations] = await Promise.all([
    Attendance.find({ event: eventObjectId, status: "present" }).populate("user", "uid name program semester").sort({ markedAt: 1 }).lean(),
    EventRegistration.find({ event: eventObjectId, status: "confirmed" })
      .populate("user", "uid name program semester")
      .populate("teamMembers.user", "uid name program semester")
      .lean()
  ]);

  const presentIds = new Set(presentRows.map((row: any) => objectId(row.user)));
  const students: ExportStudent[] = [];
  const seen = new Set<string>();

  for (const registration of registrations as any[]) {
    const candidates = [registration.user, ...(registration.teamMembers || [])];
    for (const candidate of candidates) {
      const id = objectId(candidate.user || candidate);
      if (!id || seen.has(id) || !presentIds.has(id)) continue;
      const student = studentFromCandidate(candidate);
      if (student?.name) {
        students.push(student);
        seen.add(id);
      }
    }
  }

  const sheet = { eventName: event.title, date: event.startAt ? new Date(event.startAt).toLocaleDateString("en-IN") : "", students };
  const excel = format === "xlsx";
  const body = excel ? await attendanceXlsx(sheet) : await attendancePdf(sheet);
  await audit(req, "portal.attendance.export", { entityType: "event", entityId: id, format, present: students.length });
  return new NextResponse(body, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Content-Type": excel ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : "application/pdf",
      "Content-Disposition": `attachment; filename=\"attendance-${event.slug}.${excel ? "xlsx" : "pdf"}\"`
    }
  });
}
