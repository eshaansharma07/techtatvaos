import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { Event, Certificate, ClubInfo } from "@/lib/models";
import { audit, requirePortal } from "@/lib/portal";
import {
  certificateFilename,
  renderCertificatePdf,
  renderCertificatePdfs,
  zipFiles,
  type CertificateConfig,
  type CertificateKind
} from "@/lib/services/certificate-export";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";
export const maxDuration = 60;

const objectId = (value: any) => String(value?._id || value?.id || value || "");

const emojiMap: Record<string, string> = {
  "1st Place": "🥇",
  "2nd Place": "🥈",
  "3rd Place": "🥉"
};

function fileSlug(value: string) {
  return (value || "event").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "event";
}

export async function GET(req: NextRequest) {
  try {
    const blocked = await requirePortal(req);
    if (blocked) return blocked;
    if (!(await auth())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const certificateId = req.nextUrl.searchParams.get("certificateId");
    const eventId = req.nextUrl.searchParams.get("event");
    const candidateId = req.nextUrl.searchParams.get("candidate");
    const format = req.nextUrl.searchParams.get("format") === "pdf" ? "pdf" : "zip";

    await connectDB();

    // 1. Single Certificate Download
    if (certificateId || (eventId && candidateId)) {
      let cert: any = null;

      if (certificateId && Types.ObjectId.isValid(certificateId)) {
        cert = await Certificate.findById(certificateId).populate("event").lean();
      } else if (eventId && candidateId && Types.ObjectId.isValid(eventId) && Types.ObjectId.isValid(candidateId)) {
        cert = await Certificate.findOne({
          event: new Types.ObjectId(eventId),
          user: new Types.ObjectId(candidateId)
        }).populate("event").lean();
      }

      if (!cert) {
        return NextResponse.json({ error: "Certificate record not found. Please save candidate rank and generate a certificate number first." }, { status: 404 });
      }
      if (!cert.certNumber) {
        return NextResponse.json({ error: "Certificate number not generated yet for this candidate." }, { status: 400 });
      }

      const event = cert.event;
      if (!event) {
        return NextResponse.json({ error: "Linked event not found" }, { status: 404 });
      }

      const clubInfoRows = await ClubInfo.find({ key: { $in: ["clubName", "hodName", "facultyAdvisorName", "coFacultyAdvisorName"] } }).lean();
      const branding = Object.fromEntries(clubInfoRows.map((row: any) => [row.key, row.value]));

      const certDateStr = event.certEventDate || (event.startAt ? new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(event.startAt)).replace(/^0/, "") : "");
      
      const config: CertificateConfig = {
        recipientName: cert.recipientName,
        eventName: event.certEventName || event.title,
        eventDate: certDateStr,
        certNumber: cert.certNumber,
        hod: event.certHod || branding.hodName || "",
        facultyAdvisor: event.certFacultyAdvisor || branding.facultyAdvisorName || "",
        coFacultyAdvisor: event.certCoFacultyAdvisor || branding.coFacultyAdvisorName || "",
        certEventLogo: event.certEventLogo || "",
        position: cert.rank !== "Participation" ? cert.rank : undefined,
        positionEmoji: cert.rank !== "Participation" ? (emojiMap[cert.rank] || "") : undefined
      };

      const kind: CertificateKind = cert.rank === "Participation" ? "participation" : "winner";
      const pdf = await renderCertificatePdf(kind, config);

      await audit(req, "portal.certificates.export", { entityType: "certificate", entityId: objectId(cert), format: "pdf", count: 1 });

      const filename = certificateFilename(kind, config);
      return new NextResponse(new Uint8Array(pdf), {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${filename}"`
        }
      });
    }

    // 2. Batch ZIP Download for an Event
    if (eventId) {
      if (!Types.ObjectId.isValid(eventId)) {
        return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
      }

      const eventObjectId = new Types.ObjectId(eventId);
      const [event, certs, clubInfoRows] = await Promise.all([
        Event.findById(eventObjectId).lean(),
        Certificate.find({ event: eventObjectId, certNumber: { $ne: null } }).lean(),
        ClubInfo.find({ key: { $in: ["clubName", "hodName", "facultyAdvisorName", "coFacultyAdvisorName"] } }).lean()
      ]);

      if (!event) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
      }
      if (!certs.length) {
        return NextResponse.json({ error: "No generated certificates found for this event. Please select candidates, click 'Generate' and try again." }, { status: 404 });
      }

      const branding = Object.fromEntries(clubInfoRows.map((row: any) => [row.key, row.value]));
      const certDateStr = (event as any).certEventDate || ((event as any).startAt ? new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "long", year: "numeric" }).format(new Date((event as any).startAt)).replace(/^0/, "") : "");

      const jobs = certs.map((cert: any) => {
        const config: CertificateConfig = {
          recipientName: cert.recipientName,
          eventName: (event as any).certEventName || (event as any).title,
          eventDate: certDateStr,
          certNumber: cert.certNumber,
          hod: (event as any).certHod || branding.hodName || "",
          facultyAdvisor: (event as any).certFacultyAdvisor || branding.facultyAdvisorName || "",
          coFacultyAdvisor: (event as any).certCoFacultyAdvisor || branding.coFacultyAdvisorName || "",
          certEventLogo: (event as any).certEventLogo || "",
          position: cert.rank !== "Participation" ? cert.rank : undefined,
          positionEmoji: cert.rank !== "Participation" ? (emojiMap[cert.rank] || "") : undefined
        };
        const kind: CertificateKind = cert.rank === "Participation" ? "participation" : "winner";
        return { kind, config };
      });

      // Generate all PDFs in parallel batches
      const pdfBuffers = await renderCertificatePdfs(jobs);
      
      const files = jobs.map((job, index) => ({
        name: certificateFilename(job.kind, job.config),
        content: pdfBuffers[index]
      }));

      const body = zipFiles(files);

      await audit(req, "portal.certificates.export", { entityType: "event", entityId: eventId, format: "zip", count: files.length });

      const zipFilename = `certificates-${fileSlug((event as any).slug)}.zip`;
      return new NextResponse(new Uint8Array(body), {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename="${zipFilename}"`
        }
      });
    }

    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  } catch (error: any) {
    console.error("Certificate export failed", error);
    return NextResponse.json({ error: `Certificate export failed: ${error.message || error}` }, { status: 500 });
  }
}
