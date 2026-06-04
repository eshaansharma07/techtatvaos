import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { Attendance, ClubInfo, Event, EventRegistration } from "@/lib/models";
import { audit, requirePortal } from "@/lib/portal";
import {
  certificateFilename,
  certificateNumber,
  renderCertificatePdf,
  renderCertificatePdfs,
  zipFiles,
  type CertificateRecipient
} from "@/lib/services/certificate-export";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";
export const maxDuration = 60;

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

const positionMeta = [
  { key: "winnerFirst", position: "1st Place", positionEmoji: "🥇" },
  { key: "winnerSecond", position: "2nd Place", positionEmoji: "🥈" },
  { key: "winnerThird", position: "3rd Place", positionEmoji: "🥉" }
];

function eventDate(value: any) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value)).replace(/^0/, "");
}

function fileSlug(value: string) {
  return (value || "event").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "event";
}

function studentFromUser(user: any): CertificateRecipient | null {
  if (!user) return null;
  return {
    id: objectId(user),
    uid: user.uid || "",
    name: user.name || "",
    program: user.program || "",
    semester: user.semester
  };
}

export async function GET(req: NextRequest) {
  try {
    const blocked = await requirePortal(req);
    if (blocked) return blocked;
    if (!await auth()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("event");
  const type = req.nextUrl.searchParams.get("type") === "winner" ? "winner" : "participation";
  const format = req.nextUrl.searchParams.get("format") === "pdf" ? "pdf" : "zip";
  const requestedCandidate = req.nextUrl.searchParams.get("candidate");
  if (!id) return NextResponse.json({ error: "event is required" }, { status: 400 });
  if (!Types.ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid event id" }, { status: 400 });

  await connectDB();
  const eventObjectId = new Types.ObjectId(id);
  const [event, presentRows, registrations, settings] = await Promise.all([
    Event.findById(eventObjectId)
      .populate("winnerFirst", "uid name program semester")
      .populate("winnerSecond", "uid name program semester")
      .populate("winnerThird", "uid name program semester")
      .lean(),
    Attendance.find({ event: eventObjectId, status: "present" }).select("user").lean(),
    EventRegistration.find({ event: eventObjectId, status: "confirmed" })
      .populate("user", "uid name program semester")
      .populate("teamMembers.user", "uid name program semester")
      .lean(),
    ClubInfo.find({ key: { $in: ["clubName", "secretaryName", "facultyChampionName", "clubChampionName"] } }).lean()
  ]);
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
  const eventRecord = event as any;

  const info = Object.fromEntries(settings.map((row: any) => [row.key, row.value])) as Record<string, string>;
  const base = {
    eventName: eventRecord.title,
    eventDate: eventDate(eventRecord.startAt),
    facultyChampion: info.facultyChampionName || "Faculty Champion",
    clubChampion: info.clubChampionName || info.secretaryName || "Club Champion",
    secretary: info.secretaryName || "Secretary"
  };

  if (type === "winner") {
    const requestedPlace = req.nextUrl.searchParams.get("place");
    const winnerEntries = positionMeta
      .map((meta, index) => ({ ...meta, index, user: studentFromUser(eventRecord[meta.key]) }))
      .filter((entry) => entry.user?.name && (!requestedPlace || String(entry.index + 1) === requestedPlace));

    const winnerConfigs = winnerEntries.map((entry) => {
      const recipient = entry.user as CertificateRecipient;
      const config = {
        ...base,
        recipientName: recipient.name,
        position: entry.position,
        positionEmoji: entry.positionEmoji,
        certNumber: certificateNumber(eventRecord.slug, "winner", recipient, entry.index)
      };
      return {
        name: certificateFilename("winner", config),
        config
      };
    });

    if (!winnerConfigs.length) {
      return NextResponse.json({ error: "No winners selected for this event yet. Edit the event and choose 1st, 2nd, and/or 3rd place winners." }, { status: 404 });
    }

    if (format === "pdf") {
      if (winnerConfigs.length !== 1) {
        return NextResponse.json({ error: "Choose a single winner place before downloading a PDF certificate." }, { status: 400 });
      }
      const pdf = await renderCertificatePdf("winner", winnerConfigs[0].config);
      await audit(req, "portal.certificates.export", { entityType: "event", entityId: id, type, format, count: 1 });
      return new NextResponse(new Uint8Array(pdf), {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${winnerConfigs[0].name}"`
        }
      });
    }

    const winnerPdfs = await renderCertificatePdfs(winnerConfigs.map((entry) => ({ kind: "winner", config: entry.config })));
    const winnerFiles = winnerConfigs.map((entry, index) => ({ name: entry.name, content: winnerPdfs[index] }));
    const body = zipFiles(winnerFiles);
    await audit(req, "portal.certificates.export", { entityType: "event", entityId: id, type, count: winnerFiles.length });
    return new NextResponse(new Uint8Array(body), {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="winner-certificates-${fileSlug(eventRecord.slug)}.zip"`
      }
    });
  }

  const presentIds = new Set(presentRows.map((row: any) => objectId(row.user)));
  const students: CertificateRecipient[] = [];
  const seen = new Set<string>();

  for (const registration of registrations as any[]) {
    const candidates = [registration.user, ...(registration.teamMembers || [])];
    for (const candidate of candidates) {
      const candidateId = objectId(candidate.user || candidate);
      if (!candidateId || seen.has(candidateId) || !presentIds.has(candidateId)) continue;
      if (requestedCandidate && candidateId !== requestedCandidate) continue;
      const student = studentFromCandidate(candidate);
      if (student?.name) {
        students.push({ ...student, id: candidateId });
        seen.add(candidateId);
      }
    }
  }

  const participationConfigs = students.map((student, index) => {
    const config = {
      ...base,
      recipientName: student.name,
      certNumber: certificateNumber(eventRecord.slug, "participation", student, index)
    };
    return {
      name: certificateFilename("participation", config),
      config
    };
  });
  if (!participationConfigs.length) {
    return NextResponse.json({ error: requestedCandidate ? "This candidate is not marked present for this event." : "No present candidates were found for this event. Mark candidates present before exporting participation certificates." }, { status: 404 });
  }
  if (format === "pdf") {
    if (participationConfigs.length !== 1) {
      return NextResponse.json({ error: "Choose a single present candidate before downloading a PDF certificate." }, { status: 400 });
    }
    const pdf = await renderCertificatePdf("participation", participationConfigs[0].config);
    await audit(req, "portal.certificates.export", { entityType: "event", entityId: id, type, format, count: 1 });
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${participationConfigs[0].name}"`
      }
    });
  }
  const participationPdfs = await renderCertificatePdfs(participationConfigs.map((entry) => ({ kind: "participation", config: entry.config })));
  const files = participationConfigs.map((entry, index) => ({ name: entry.name, content: participationPdfs[index] }));
  const body = zipFiles(files);

  await audit(req, "portal.certificates.export", { entityType: "event", entityId: id, type, count: students.length });
    return new NextResponse(new Uint8Array(body), {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="participation-certificates-${fileSlug(eventRecord.slug)}.zip"`
      }
    });
  } catch (error) {
    console.error("Certificate export failed", error);
    return NextResponse.json({ error: "Certificate export failed. Please try again after a moment." }, { status: 500 });
  }
}
