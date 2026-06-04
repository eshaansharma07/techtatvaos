import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { Attendance, ClubInfo, Event, EventRegistration } from "@/lib/models";
import { audit, requirePortal } from "@/lib/portal";
import { certificatePdf } from "@/lib/services/certificate-export";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type CertificateStudent = { uid?: string; name: string; program?: string; semester?: number };

const objectId = (value: any) => String(value?._id || value?.id || value || "");
const studentFromCandidate = (candidate: any): CertificateStudent | null => {
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
  const type = req.nextUrl.searchParams.get("type") === "winner" ? "winner" : "participation";
  if (!id) return NextResponse.json({ error: "event is required" }, { status: 400 });
  if (!Types.ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid event id" }, { status: 400 });

  await connectDB();
  const eventObjectId = new Types.ObjectId(id);
  const [event, presentRows, registrations, settings] = await Promise.all([
    Event.findById(eventObjectId).lean(),
    Attendance.find({ event: eventObjectId, status: "present" }).select("user").lean(),
    EventRegistration.find({ event: eventObjectId, status: "confirmed" })
      .populate("user", "uid name program semester")
      .populate("teamMembers.user", "uid name program semester")
      .lean(),
    ClubInfo.find({ key: { $in: ["logo", "clubName", "secretaryName", "facultyChampionName"] } }).lean()
  ]);
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
  const eventRecord = event as any;

  const info = Object.fromEntries(settings.map((row: any) => [row.key, row.value])) as Record<string, string>;
  const presentIds = new Set(presentRows.map((row: any) => objectId(row.user)));
  const students: CertificateStudent[] = [];
  const seen = new Set<string>();

  for (const registration of registrations as any[]) {
    const candidates = [registration.user, ...(registration.teamMembers || [])];
    for (const candidate of candidates) {
      const candidateId = objectId(candidate.user || candidate);
      if (!candidateId || seen.has(candidateId) || !presentIds.has(candidateId)) continue;
      const student = studentFromCandidate(candidate);
      if (student?.name) {
        students.push(student);
        seen.add(candidateId);
      }
    }
  }

  const body = await certificatePdf({
    clubName: info.clubName || "Tech Tatva",
    logo: info.logo,
    eventName: eventRecord.title,
    date: eventRecord.startAt ? new Date(eventRecord.startAt).toLocaleDateString("en-IN") : "",
    type,
    students,
    secretaryName: info.secretaryName,
    facultyName: info.facultyChampionName
  });

  await audit(req, "portal.certificates.export", { entityType: "event", entityId: id, type, count: students.length });
  return new NextResponse(body, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=\"${type}-certificates-${eventRecord.slug}.pdf\"`
    }
  });
}
