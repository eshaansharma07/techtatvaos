import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { AIConversation, Announcement, Attendance, Event, EventRegistration, GeneratedDocument, Meeting, Task, Team, User } from "@/lib/models";
import { audit, requirePortal } from "@/lib/portal";
import { rateLimit } from "@/lib/rate-limit";
import { compactJson, generateWithGemini } from "@/lib/services/gemini";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const allowedRoles = new Set(["super_admin", "president", "vice_president", "secretary"]);

async function context() {
  const [members, teams, events, registrations, attendance, tasks, announcements, meetings, documents] = await Promise.all([
    User.find({ memberType: "club_member", status: "active" }).select("name team role").populate("team", "name").limit(300).lean(),
    Team.find({ active: true }).select("name lead coLeads members").populate("lead", "name").populate("coLeads", "name").limit(100).lean(),
    Event.find({}).select("title status category startAt venue team").populate("team", "name").sort({ startAt: -1 }).limit(120).lean(),
    EventRegistration.find({ status: "confirmed" }).select("event user mode teamName").populate("event", "title").limit(500).lean(),
    Attendance.find({}).select("event user status").populate("event", "title").limit(1000).lean(),
    Task.find({ status: { $ne: "completed" } }).select("title status priority dueAt assignees team").populate("team", "name").limit(150).lean(),
    Announcement.find({}).select("title status publishAt audience").sort({ publishAt: -1 }).limit(100).lean(),
    Meeting.find({ status: { $ne: "archived" } }).select("title date venue actionItems status").sort({ date: -1 }).limit(100).lean(),
    GeneratedDocument.find({}).select("kind title format generatedAt").sort({ generatedAt: -1 }).limit(80).lean()
  ]);
  return {
    stats: {
      activeMembers: members.length,
      activeTeams: teams.length,
      totalEvents: events.length,
      confirmedRegistrations: registrations.length,
      presentAttendance: attendance.filter((row: any) => row.status === "present").length,
      pendingTasks: tasks.length,
      meetings: meetings.length,
      generatedDocuments: documents.length
    },
    members,
    teams,
    events,
    registrations,
    attendance,
    tasks,
    announcements,
    meetings,
    documents
  };
}

export async function POST(req: NextRequest) {
  try {
    const blocked = await requirePortal(req);
    if (blocked) return blocked;
    const session = await auth();
    const user = session?.user as { id?: string; role?: string } | undefined;
    if (!user?.id || !allowedRoles.has(user.role || "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (!rateLimit(`ai:${user.id}`, 12, 60_000)) return NextResponse.json({ error: "Too many AI requests. Try again in a minute." }, { status: 429 });

    const bodyJson = await req.json();
    const prompt = String(bodyJson.prompt || "").trim();
    if (prompt.length < 3) return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    const history = Array.isArray(bodyJson.history) ? bodyJson.history : [];
 
    await connectDB();
    const rag = await context();

    const contents: any[] = [];
    for (const turn of history) {
      if (turn.role === "user" || turn.role === "model") {
        contents.push({
          role: turn.role,
          parts: [{ text: turn.text }]
        });
      }
    }
    
    // Gemini requires conversation turns to strictly start with a 'user' turn.
    // Filter out leading 'model' turns (like local system greetings) to avoid HTTP 400.
    while (contents.length > 0 && contents[0].role === "model") {
      contents.shift();
    }

    contents.push({
      role: "user",
      parts: [{ text: `User prompt:\n${prompt}\n\nRetrieved live MongoDB context:\n${compactJson(rag)}` }]
    });

    const fallback = `I checked the current club database. Active members: ${rag.stats.activeMembers}. Active teams: ${rag.stats.activeTeams}. Total events: ${rag.stats.totalEvents}. Confirmed registrations: ${rag.stats.confirmedRegistrations}. Pending tasks: ${rag.stats.pendingTasks}. Ask me for a specific event, team, task, meeting, or trend and I will summarize only the stored records.`;
    const response = await generateWithGemini({
      system: "You are the internal Tech Tatva Secretary Assistant. Always answer using only the retrieved MongoDB context. If the data is not present, say it is not available in the system. Never invent names, counts, events, or decisions.",
      contents,
      fallback
    });
    await AIConversation.create({ user: user.id, prompt, response, context: rag.stats, kind: "secretary_assistant" });
    await audit(req, "portal.ai.secretary", { entityType: "ai", promptLength: prompt.length });
    return NextResponse.json({ response, stats: rag.stats });
  } catch (error) {
    console.error("Secretary assistant failed", error);
    return NextResponse.json({ error: "Secretary assistant failed" }, { status: 500 });
  }
}
