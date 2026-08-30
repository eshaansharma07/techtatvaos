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

  const tmEvents = await Event.find({
    $or: [{ fest: "technomania" }, { category: { $in: ["DeepTech & AI", "Hardware & Speed", "Gaming & Community", "hackathon", "esports", "cultural", "sub-events"] } }]
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
  const regsByEvent: Record<string, any[]> = {};

  (registrations as any[]).forEach(reg => {
    const eTitle = reg.event?.title || "Unknown Event";
    if (!regsByEvent[eTitle]) regsByEvent[eTitle] = [];
    regsByEvent[eTitle].push(reg);
  });

  // Default fallback if empty
  if (Object.keys(regsByEvent).length === 0) {
    const emptySheet = workbook.addWorksheet("No Registrations");
    emptySheet.addRow(["No registrations found."]);
  }

  for (const [eventName, eventRegs] of Object.entries(regsByEvent)) {
    // Collect all unique custom field keys for this event
    const customKeys = new Set<string>();
    eventRegs.forEach(reg => {
      if (reg.customFields) Object.keys(reg.customFields).forEach(k => customKeys.add(k));
      if (Array.isArray(reg.teamMembers)) {
        reg.teamMembers.forEach((m: any) => {
          if (m.customFields) Object.keys(m.customFields).forEach(k => customKeys.add(k));
        });
      }
    });

    const safeSheetName = eventName.replace(/[\[\]*?:\/\\]/g, "").substring(0, 31);
    const sheet = workbook.addWorksheet(safeSheetName);

    const columns: Partial<ExcelJS.Column>[] = [
      { header: "Squad / Team Name", key: "teamName", width: 25 },
      { header: "Member Role", key: "role", width: 18 },
      { header: "Full Name", key: "name", width: 25 },
      { header: "University UID", key: "uid", width: 18 },
      { header: "Email Address", key: "email", width: 30 },
      { header: "Phone Number", key: "phone", width: 18 },
      { header: "Program / Branch", key: "program", width: 22 },
      { header: "Sem", key: "semester", width: 8 }
    ];

    customKeys.forEach(key => {
      columns.push({ header: key.toUpperCase(), key: `cf_${key}`, width: 20 });
    });

    columns.push(
      { header: "Status", key: "status", width: 14 },
      { header: "Registered At", key: "registeredAt", width: 22 }
    );

    sheet.columns = columns;

    sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
    sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0A84FF" } };

    let rowIndex = 2;

    eventRegs.forEach(reg => {
      const mode = reg.mode === "team" ? "Squad / Team" : "Solo / Individual";
      const teamName = reg.teamName || (reg.mode === "team" ? "Unnamed Squad" : "N/A");
      const regDate = reg.registeredAt ? new Date(reg.registeredAt).toLocaleString("en-IN") : "";
      
      const leaderUser = reg.user;
      const leaderRowData: any = {
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
      };

      if (reg.customFields) {
        Object.entries(reg.customFields).forEach(([k, v]) => {
          leaderRowData[`cf_${k}`] = String(v);
        });
      }

      sheet.addRow(leaderRowData);
      
      const startRow = rowIndex;
      rowIndex++;

      if (reg.mode === "team" && Array.isArray(reg.teamMembers)) {
        // Filter out accidental duplicates
        const members = reg.teamMembers.filter((m: any) => {
          const u = m.user || m;
          const uid = u.uid || m.uid;
          const email = u.email || m.email;
          const lUid = leaderUser?.uid;
          const lEmail = leaderUser?.email;
          return (!lUid || uid !== lUid) && (!lEmail || email !== lEmail);
        });

        members.forEach((member: any, index: number) => {
          const u = member.user || member;
          const memberRowData: any = {
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
          };

          if (member.customFields) {
            Object.entries(member.customFields).forEach(([k, v]) => {
              memberRowData[`cf_${k}`] = String(v);
            });
          }

          sheet.addRow(memberRowData);
          rowIndex++;
        });
        
        // Visual separation for teams
        sheet.addRow([]);
        rowIndex++;
      }
    });

    sheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.alignment = { vertical: "middle", wrapText: true };
      });
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="Technomania3.0_Registrations-${new Date().toISOString().slice(0, 10)}.xlsx"`
    }
  });
}
