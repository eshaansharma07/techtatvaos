import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { connectDB } from "@/lib/db";
import { Event, EventRegistration } from "@/lib/models";
import { requirePortal } from "@/lib/portal";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const blocked = await requirePortal(req);
  if (blocked) return blocked;

  await connectDB();
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("event");

  const query: Record<string, any> = {};
  if (eventId) query.event = eventId;

  const [events, registrations] = await Promise.all([
    Event.find({}).lean(),
    EventRegistration.find(query)
      .populate("event", "title slug")
      .populate("user", "name email phone uid program semester")
      .populate("teamMembers.user", "name email phone uid program semester")
      .sort({ registeredAt: -1 })
      .lean()
  ]);

  const eventMap = new Map((events as any[]).map((e) => [String(e._id), e.title]));

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Event Participants");

  sheet.columns = [
    { header: "Event", key: "event", width: 25 },
    { header: "Mode", key: "mode", width: 14 },
    { header: "Team Name", key: "teamName", width: 24 },
    { header: "Role", key: "role", width: 16 },
    { header: "Participant Name", key: "name", width: 24 },
    { header: "University UID", key: "uid", width: 18 },
    { header: "Email", key: "email", width: 28 },
    { header: "Phone / WhatsApp", key: "phone", width: 20 },
    { header: "Program", key: "program", width: 24 },
    { header: "Semester", key: "semester", width: 12 },
    { header: "Status", key: "status", width: 14 },
    { header: "Registration Date", key: "registeredAt", width: 22 }
  ];

  sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF6D28D9" } };

  (registrations as any[]).forEach((reg) => {
    const eventName = reg.event?.title || eventMap.get(String(reg.event)) || "Unknown Event";
    const mode = reg.mode === "team" ? "Team" : "Individual";
    const teamName = reg.teamName || (reg.mode === "team" ? "Unnamed Team" : "N/A");
    const regDate = reg.registeredAt ? new Date(reg.registeredAt).toLocaleString("en-IN") : "";

    // Leader / Primary candidate
    const leaderUser = reg.user;
    sheet.addRow({
      event: eventName,
      mode,
      teamName,
      role: reg.mode === "team" ? "Team Leader" : "Candidate",
      name: leaderUser?.name || "N/A",
      uid: leaderUser?.uid || "N/A",
      email: leaderUser?.email || "N/A",
      phone: leaderUser?.phone || "N/A",
      program: leaderUser?.program || "N/A",
      semester: leaderUser?.semester ?? "N/A",
      status: reg.status || "confirmed",
      registeredAt: regDate
    });

    // Squad members
    if (reg.mode === "team" && Array.isArray(reg.teamMembers)) {
      reg.teamMembers.forEach((member: any, index: number) => {
        const u = member.user || member;
        sheet.addRow({
          event: eventName,
          mode,
          teamName,
          role: `Squad Member ${index + 2}`,
          name: member.name || u.name || "N/A",
          uid: member.uid || u.uid || "N/A",
          email: member.email || u.email || "N/A",
          phone: member.phone || u.phone || "N/A",
          program: member.program || u.program || "N/A",
          semester: member.semester ?? u.semester ?? "N/A",
          status: reg.status || "confirmed",
          registeredAt: regDate
        });
      });
    }
  });

  sheet.eachRow((row) =>
    row.eachCell((cell) => {
      cell.alignment = { vertical: "middle", wrapText: true };
      cell.border = {
        top: { style: "thin", color: { argb: "FFE5E7EB" } },
        bottom: { style: "thin", color: { argb: "FFE5E7EB" } }
      };
    })
  );

  const buffer = await workbook.xlsx.writeBuffer();
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="EventParticipants-${new Date().toISOString().slice(0, 10)}.xlsx"`
    }
  });
}
