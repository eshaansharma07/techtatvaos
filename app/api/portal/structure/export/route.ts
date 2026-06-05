import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { connectDB } from "@/lib/db";
import { ClubInfo, Team, User } from "@/lib/models";
import { audit, requirePortal } from "@/lib/portal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function idOf(value: any) {
  return String(value?._id || value?.id || value || "");
}

function personRow(team: string, role: string, person: any, notes = "") {
  return [
    team,
    role,
    person?.name || "",
    person?.uid || "",
    person?.email || "",
    person?.phone || "",
    person?.program || "",
    person?.semester || "",
    notes
  ];
}

function fill(row: ExcelJS.Row, color: string, fontColor = "FFFFFF") {
  row.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: color } };
    cell.font = { bold: true, color: { argb: fontColor } };
  });
}

async function clubInfoMap() {
  const records = await ClubInfo.find({}).lean();
  return Object.fromEntries(records.map((record: any) => [record.key, record.value]));
}

export async function GET(req: NextRequest) {
  const blocked = await requirePortal(req);
  if (blocked) return blocked;
  await connectDB();

  const [info, teams, users] = await Promise.all([
    clubInfoMap(),
    Team.find({ active: { $ne: false } })
      .sort({ order: 1, name: 1 })
      .populate("lead", "name uid email phone program semester")
      .populate("coLeads", "name uid email phone program semester")
      .populate("members", "name uid email phone program semester memberType status")
      .lean(),
    User.find({ memberType: "club_member", status: "active" })
      .select("name uid email phone program semester team teams")
      .lean()
  ]);

  const membersByTeam = new Map<string, Map<string, any>>();
  const addMember = (teamId: any, member: any) => {
    const key = idOf(teamId);
    const memberId = idOf(member);
    if (!key || !memberId || !member?.name) return;
    const current = membersByTeam.get(key) || new Map<string, any>();
    current.set(memberId, member);
    membersByTeam.set(key, current);
  };

  for (const team of teams as any[]) {
    for (const member of team.members || []) {
      if (member?.memberType === "club_member" && member?.status === "active") addMember(team._id, member);
    }
  }
  for (const user of users as any[]) {
    const assigned = user.teams?.length ? user.teams : user.team ? [user.team] : [];
    for (const teamId of assigned) addMember(teamId, user);
  }

  const book = new ExcelJS.Workbook();
  book.creator = "Tech Tatva OS";
  book.created = new Date();
  const ws = book.addWorksheet("Club Structure", {
    views: [{ state: "frozen", ySplit: 5 }]
  });

  ws.columns = [
    { header: "Team / Section", key: "team", width: 28 },
    { header: "Role", key: "role", width: 26 },
    { header: "Name", key: "name", width: 28 },
    { header: "UID", key: "uid", width: 18 },
    { header: "Email", key: "email", width: 34 },
    { header: "Phone", key: "phone", width: 18 },
    { header: "Program", key: "program", width: 20 },
    { header: "Semester", key: "semester", width: 12 },
    { header: "Notes", key: "notes", width: 36 }
  ];

  ws.mergeCells("A1:I1");
  ws.getCell("A1").value = "TECH TATVA CLUB STRUCTURE";
  ws.getCell("A1").alignment = { horizontal: "center", vertical: "middle" };
  ws.getCell("A1").font = { bold: true, size: 18, color: { argb: "FFFFFFFF" } };
  ws.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2E1065" } };
  ws.getRow(1).height = 34;

  ws.mergeCells("A2:I2");
  ws.getCell("A2").value = `Generated from live portal data on ${new Date().toLocaleString("en-IN")}`;
  ws.getCell("A2").alignment = { horizontal: "center" };
  ws.getCell("A2").font = { italic: true, color: { argb: "FF6B21A8" } };

  ws.addRow([]);
  const header = ws.addRow(["Team / Section", "Role", "Name", "UID", "Email", "Phone", "Program", "Semester", "Notes"]);
  fill(header, "FF111827");

  const officeHeader = ws.addRow(["Office Bearers", "", "", "", "", "", "", "", ""]);
  ws.mergeCells(`A${officeHeader.number}:I${officeHeader.number}`);
  fill(officeHeader, "FF7C3AED");

  [
    ["Advisory", "Faculty Champion", { name: info.facultyChampionName, email: info.facultyChampionEmail, phone: info.facultyChampionPhone }, "Advisory tree"],
    ["Advisory", "Student Advisor 1", { name: info.studentAdvisorOneName, email: info.studentAdvisorOneEmail }, "Advisory tree"],
    ["Advisory", "Student Advisor 2", { name: info.studentAdvisorTwoName, email: info.studentAdvisorTwoEmail }, "Advisory tree"],
    ["Club Operations", "Secretary", { name: info.secretaryName, email: info.secretaryEmail }, "Operations tree root"],
    ["Club Operations", "Joint Secretary - Technical & Operations", { name: info.jointSecretaryOneName, email: info.jointSecretaryOneEmail }, "Technical/operations lane"],
    ["Club Operations", "Joint Secretary - Media & Creative", { name: info.jointSecretaryTwoName, email: info.jointSecretaryTwoEmail }, "Media/creative lane"]
  ].forEach(([section, role, person, notes]: any) => {
    if (person?.name || person?.email) ws.addRow(personRow(section, role, person, notes));
  });

  ws.addRow([]);
  for (const [index, team] of (teams as any[]).entries()) {
    const color = index % 2 === 0 ? "FF0E7490" : "FF9333EA";
    const teamHeader = ws.addRow([team.name, "TEAM", "", "", "", "", "", "", team.jointSecretaryLane === "creative" ? "Reports under Media & Creative" : "Reports under Technical & Operations"]);
    ws.mergeCells(`A${teamHeader.number}:B${teamHeader.number}`);
    fill(teamHeader, color);

    if (team.lead) ws.addRow(personRow(team.name, "Team Lead", team.lead, "Primary lead"));
    for (const coLead of team.coLeads || []) ws.addRow(personRow(team.name, "Co-Lead", coLead, "Team-specific co-lead"));

    const leadIds = new Set([idOf(team.lead), ...(team.coLeads || []).map(idOf)].filter(Boolean));
    const members = Array.from((membersByTeam.get(idOf(team._id)) || new Map()).values()).filter((member: any) => !leadIds.has(idOf(member)));
    if (members.length) {
      members.forEach((member: any) => ws.addRow(personRow(team.name, "Member", member)));
    } else {
      ws.addRow([team.name, "Member", "No members assigned", "", "", "", "", "", ""]);
    }
    ws.addRow([]);
  }

  ws.eachRow((row) => {
    row.eachCell((cell) => {
      cell.alignment = { vertical: "middle", wrapText: true };
      cell.border = {
        top: { style: "thin", color: { argb: "FFE5E7EB" } },
        left: { style: "thin", color: { argb: "FFE5E7EB" } },
        bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
        right: { style: "thin", color: { argb: "FFE5E7EB" } }
      };
    });
  });

  await audit(req, "portal.structure.export", { entityType: "club_structure", teams: teams.length });
  const body = Buffer.from(await book.xlsx.writeBuffer());
  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="tech-tatva-club-structure.xlsx"`,
      "Cache-Control": "no-store"
    }
  });
}
