import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { ClubInfo, GeneratedDocument, Meeting } from "@/lib/models";
import { audit, requirePortal } from "@/lib/portal";
import { generateWithGemini, compactJson } from "@/lib/services/gemini";
import { generatedDocx, templatePdf, type GeneratedContent } from "@/lib/services/ai-documents";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 60;

const fileSlug = (value: string) => (value || "mom").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "mom";

function fmtDate(value: any) {
  return value ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value)) : "Not provided";
}

export async function GET(req: NextRequest) {
  try {
    const blocked = await requirePortal(req);
    if (blocked) return blocked;
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const meetingId = req.nextUrl.searchParams.get("meeting") || "";
    const format = req.nextUrl.searchParams.get("format") === "docx" ? "docx" : "pdf";
    if (!Types.ObjectId.isValid(meetingId)) return NextResponse.json({ error: "Valid meeting is required" }, { status: 400 });

    await connectDB();
    const [meeting, templateSetting] = await Promise.all([
      Meeting.findById(meetingId).populate("organizer", "name email").populate("attendees", "name email").lean(),
      ClubInfo.findOne({ key: "momTemplate" }).lean()
    ]);
    if (!meeting) return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    const record = meeting as any;
    const templateRecord = templateSetting as any;
    const attendees = (record.attendees || []).map((attendee: any) => attendee.name).filter(Boolean);
    const payload = {
      meetingTitle: record.title,
      date: fmtDate(record.date),
      time: record.time || "Not provided",
      venue: record.venue || "Not provided",
      meetingType: record.meetingType || "Not provided",
      organizer: record.organizer?.name || "Not provided",
      attendees,
      agenda: record.agenda || "",
      discussionPoints: record.discussionPoints || "",
      decisionsTaken: record.decisionsTaken || "",
      actionItems: record.actionItems || [],
      nextMeeting: record.nextMeeting || ""
    };
    const fallback = `The meeting titled ${payload.meetingTitle} was held on ${payload.date} at ${payload.venue}. The agenda focused on ${payload.agenda || "club operations and upcoming work"}. Key discussion points included ${payload.discussionPoints || "planning, coordination, and task tracking"}. Decisions taken were recorded as ${payload.decisionsTaken || "pending final confirmation"}. Action items were assigned to responsible members for timely completion, and follow-up will be reviewed in the next meeting.`;
    const summary = await generateWithGemini({
      system: "Generate professional Minutes of Meeting content. Use only supplied meeting data. Do not invent attendees, tasks, or decisions.",
      prompt: `Generate a concise professional MOM summary with key discussion points, decisions, responsibilities, and next meeting note from this data:\n${compactJson(payload)}`,
      fallback
    });
    const content: GeneratedContent = {
      title: `${payload.meetingTitle} - Minutes of Meeting`,
      subtitle: "Generated from Tech Tatva OS meeting records",
      fields: [
        ["Meeting Title", payload.meetingTitle],
        ["Date", payload.date],
        ["Time", payload.time],
        ["Venue", payload.venue],
        ["Meeting Type", payload.meetingType],
        ["Organizer", payload.organizer],
        ["Attendees", attendees.join(", ") || "Not provided"]
      ],
      paragraphs: [summary],
      actionItems: payload.actionItems
    };

    const body = format === "docx" ? generatedDocx(content) : await templatePdf("mom", content, String(templateRecord?.value || ""));
    await GeneratedDocument.create({ kind: "mom", title: content.title, meeting: record._id, format, content: summary, metadata: payload, generatedBy: (session.user as any).id });
    await audit(req, "portal.ai.mom", { entityType: "meeting", entityId: meetingId, format });
    return new NextResponse(new Uint8Array(body), {
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": format === "docx" ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document" : "application/pdf",
        "Content-Disposition": `attachment; filename="${fileSlug(record.title)}-mom.${format}"`
      }
    });
  } catch (error) {
    console.error("AI MOM failed", error);
    return NextResponse.json({ error: "AI MOM generation failed" }, { status: 500 });
  }
}
