import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { Attendance, ClubInfo, Event, EventRegistration, Gallery, GeneratedDocument } from "@/lib/models";
import { audit, requirePortal } from "@/lib/portal";
import { generateWithGemini, compactJson } from "@/lib/services/gemini";
import { generatedDocx, templatePdf, type GeneratedContent } from "@/lib/services/ai-documents";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 60;

const objectId = (value: any) => String(value?._id || value?.id || value || "");
const fileSlug = (value: string) => (value || "event-report").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "event-report";

function fmt(value: any) {
  return value ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "Not provided";
}

export async function GET(req: NextRequest) {
  try {
    const blocked = await requirePortal(req);
    if (blocked) return blocked;
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const eventId = req.nextUrl.searchParams.get("event") || "";
    const format = req.nextUrl.searchParams.get("format") === "docx" ? "docx" : "pdf";
    if (!Types.ObjectId.isValid(eventId)) return NextResponse.json({ error: "Valid event is required" }, { status: 400 });

    await connectDB();
    const eventObjectId = new Types.ObjectId(eventId);
    const [event, registrationCount, attendanceCount, gallery, templateSetting] = await Promise.all([
      Event.findById(eventObjectId).populate("team", "name").populate("leads", "name email phone").lean(),
      EventRegistration.countDocuments({ event: eventObjectId, status: "confirmed" }),
      Attendance.countDocuments({ event: eventObjectId, status: "present" }),
      Gallery.findOne({ event: eventObjectId }).lean(),
      ClubInfo.findOne({ key: "postActivityReportTemplate" }).lean()
    ]);
    if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
    const record = event as any;
    const galleryRecord = gallery as any;
    const templateRecord = templateSetting as any;
    const lead = record.leads?.[0] || {};
    const payload = {
      eventName: record.title,
      eventCategory: record.category || "Not provided",
      eventDescription: record.description || "",
      eventDate: fmt(record.startAt),
      venue: record.venue || "Not provided",
      mode: record.participationMode || "individual",
      team: record.team?.name || "Club",
      coordinatorName: lead.name || "Not provided",
      coordinatorEmail: lead.email || "Not provided",
      coordinatorContact: lead.phone || "Not provided",
      registrationCount,
      attendanceCount,
      photoCount: galleryRecord?.assets?.length || 0
    };
    const fallback = `${payload.eventName} was conducted by ${payload.team} on ${payload.eventDate} at ${payload.venue}. The activity focused on ${payload.eventDescription || "student learning and engagement"}. A total of ${registrationCount} candidates registered, out of which ${attendanceCount} participants were marked present. The session encouraged technical awareness, peer learning, and practical participation through structured activities. The event contributed to the club's objective of building a stronger student innovation culture and supporting meaningful engagement within the university community.`;
    const writeup = await generateWithGemini({
      system: "You generate university-ready post event reports. Use only supplied data. Do not invent facts. Keep the writeup formal, human, and 100-150 words.",
      prompt: `Generate one post-event writeup and photo captions from this real event data:\n${compactJson(payload)}`,
      fallback
    });
    const captions = (galleryRecord?.assets || []).slice(0, 6).map((asset: any, index: number) => asset.caption || `Event photograph ${index + 1} from ${payload.eventName}.`);
    const content: GeneratedContent = {
      title: `${payload.eventName} Post Activity Report`,
      subtitle: "Generated from Tech Tatva OS event records",
      fields: [
        ["Event Name", payload.eventName],
        ["Category", payload.eventCategory],
        ["Date", payload.eventDate],
        ["Venue", payload.venue],
        ["Mode", payload.mode],
        ["Coordinator", payload.coordinatorName],
        ["Coordinator Email", payload.coordinatorEmail],
        ["Coordinator Contact", payload.coordinatorContact],
        ["Registrations", String(registrationCount)],
        ["Attendance", String(attendanceCount)]
      ],
      paragraphs: [writeup],
      captions
    };

    const body = format === "docx" ? generatedDocx(content) : await templatePdf("event_report", content, String(templateRecord?.value || ""));
    await GeneratedDocument.create({ kind: "event_report", title: content.title, event: eventObjectId, format, content: writeup, metadata: payload, generatedBy: (session.user as any).id });
    await audit(req, "portal.ai.event_report", { entityType: "event", entityId: eventId, format });
    return new NextResponse(new Uint8Array(body), {
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": format === "docx" ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document" : "application/pdf",
        "Content-Disposition": `attachment; filename="${fileSlug(record.slug || record.title)}-post-activity-report.${format}"`
      }
    });
  } catch (error) {
    console.error("AI event report failed", error);
    return NextResponse.json({ error: "AI event report generation failed" }, { status: 500 });
  }
}
