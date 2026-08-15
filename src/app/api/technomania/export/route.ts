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

  // Find all Technomania events
  const tmEvents = await Event.find({
    $or: [{ fest: "technomania" }, { category: { $in: ["hackathon", "esports", "cultural", "sub-events"] } }]
  }).lean();

  const tmEventIds = tmEvents.map((e) => e._id);

  const query: Record<string, any> = {};
  if (eventId) {
    query.event = eventId;
  } else if (tmEventIds.length > 0) {
    query.event = { $in: tmEventIds };
  }

  const registrations = await EventRegistration.find(query)
    .populate("event", "title slug category fest")
    .populate("user", "name email phone uid program semester")
    .populate("teamMembers.user", "name email phone uid program semester")
    .sort({ registeredAt: -1 })
    .lean();

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Technomania 3.0 Squads");

  sheet.columns = [
    { header: "Arena / Event", key: "event", width: 28 },
    { header: "Category", key: "category", width: 16 },
    { header: "Mode", key: "mode", width: 14 },
    { header: "Squad Name", key: "teamName", width: 24 },
    { header: "Member Role", key: "role", width: 18 },
    { header: "Full Name", key: "name", width: 24 },
    { header: "University UID", key: "uid", width: 18 },
    { header: "Email Address", key: "email", width: 28 },
    { header: "Phone / WhatsApp", key: "phone", width: 20 },
    { header: "Program / Branch", key: "program", width: 24 },
    { header: "Semester", key: "semester", width: 12 },
    { header: "Status", key: "status", width: 14 },
    { header: "Registered At", key: "registeredAt", width: 22 }
  ];

  // Cyber Blueprint Styling for Header
  sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
  sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0A84FF" } };

  (registrations as any[]).forEach((reg) => {
    const eventName = reg.event?.title || "Technomania Arena";
    const category = (reg.event?.category || "General").toUpperCase();
    const mode = reg.mode === "team" ? "Squad / Team" : "Solo / Individual";
    const teamName = reg.teamName || (reg.mode === "team" ? "Unnamed Squad" : "N/A");
    const regDate = reg.registeredAt ? new Date(reg.registeredAt).toLocaleString("en-IN") : "";

    // Leader / Primary candidate
    const leaderUser = reg.user;
    sheet.addRow({
      event: eventName,
      category,
      mode,
      teamName,
      role: reg.mode === "team" ? "Squad Leader" : "Individual",
      name: leaderUser?.name || "N/A",
      uid: leaderUser?.uid || "N/A",
      email: leaderUser?.email || "N/A",
      phone: leaderUser?.phone || "N/A",
      program: leaderUser?.program || "N/A",
      semester: leaderUser?.semester ?? "N/A",
      status: (reg.status || "confirmed").toUpperCase(),
      registeredAt: regDate
    });

    // Squad members
    if (reg.mode === "team" && Array.isArray(reg.teamMembers)) {
      reg.teamMembers.forEach((member: any, index: number) => {
        const u = member.user || member;
        sheet.addRow({
          event: eventName,
          category,
          mode,
          teamName,
          role: `Member #${index + 2}`,
          name: member.name || u.name || "N/A",
          uid: member.uid || u.uid || "N/A",
          email: member.email || u.email || "N/A",
          phone: member.phone || u.phone || "N/A",
          program: member.program || u.program || "N/A",
          semester: member.semester ?? u.semester ?? "N/A",
          status: (reg.status || "confirmed").toUpperCase(),
          registeredAt: regDate
        });
      });
    }
  });

  sheet.eachRow((row) =>
    row.eachCell((cell) => {
      cell.alignment = { vertical: "middle", wrapText: true };
      cell.border = {
        top: { style: "thin", color: { argb: "FFE2E8F0" } },
        bottom: { style: "thin", color: { argb: "FFE2E8F0" } }
      };
    })
  );

  const buffer = await workbook.xlsx.writeBuffer();
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="Technomania3.0_SquadRegistrations-${new Date().toISOString().slice(0, 10)}.xlsx"`
    }
  });
}
