import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { connectDB } from "@/lib/db";
import { RecruitmentApplication } from "@/lib/models";
import { requirePortal } from "@/lib/portal";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const blocked = await requirePortal(req);
  if (blocked) return blocked;
  await connectDB();
  const { searchParams } = new URL(req.url);
  const query: Record<string, any> = {};
  if (searchParams.get("team")) query.team = searchParams.get("team");
  if (searchParams.get("role")) query.role = searchParams.get("role");
  if (searchParams.get("status")) query.status = searchParams.get("status");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  if (from || to) query.submittedAt = { ...(from ? { $gte: new Date(from) } : {}), ...(to ? { $lte: new Date(to) } : {}) };

  const search = searchParams.get("search");
  if (search) {
    const regex = { $regex: search, $options: "i" };
    query.$or = [{ fullName: regex }, { uid: regex }, { email: regex }];
  }

  const sortKey = searchParams.get("sortKey") || "submittedAt";
  const sortDir = searchParams.get("sortDir") === "asc" ? 1 : -1;
  const sortQuery: Record<string, 1 | -1> = { [sortKey]: sortDir };

  const applications = await RecruitmentApplication.find(query).sort(sortQuery).populate("team", "name").populate("role", "name").lean();
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Applications");
  sheet.columns = [
    { header: "Submitted At", key: "submittedAt", width: 22 },
    { header: "Status", key: "status", width: 14 },
    { header: "Full Name", key: "fullName", width: 24 },
    { header: "UID", key: "uid", width: 18 },
    { header: "Course", key: "course", width: 16 },
    { header: "Branch", key: "branch", width: 18 },
    { header: "Year", key: "year", width: 10 },
    { header: "Email", key: "email", width: 30 },
    { header: "Phone", key: "phone", width: 18 },
    { header: "Team", key: "team", width: 22 },
    { header: "Role", key: "role", width: 22 },
    { header: "LinkedIn", key: "linkedin", width: 28 },
    { header: "GitHub", key: "github", width: 28 },
    { header: "Portfolio", key: "portfolio", width: 28 },
    { header: "Answers", key: "answers", width: 80 },
    { header: "Files", key: "files", width: 60 },
    { header: "Admin Notes", key: "adminNotes", width: 36 }
  ];
  sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF5B21B6" } };
  applications.forEach((application: any) => {
    sheet.addRow({
      submittedAt: application.submittedAt ? new Date(application.submittedAt).toLocaleString("en-IN") : "",
      status: application.status,
      fullName: application.fullName,
      uid: application.uid,
      course: application.course,
      branch: application.branch,
      year: application.year,
      email: application.email,
      phone: application.phone,
      team: application.team?.name || "",
      role: application.role?.name || "",
      linkedin: application.linkedin || "",
      github: application.github || "",
      portfolio: application.portfolio || "",
      answers: (application.answers || []).map((answer: any) => `${answer.label}: ${Array.isArray(answer.value) ? answer.value.join(", ") : answer.value || ""}`).join("\n"),
      files: (application.files || []).map((file: any) => `${file.label}: ${file.url}`).join("\n"),
      adminNotes: application.adminNotes || ""
    });
  });
  sheet.eachRow((row) => row.eachCell((cell) => {
    cell.alignment = { vertical: "top", wrapText: true };
    cell.border = { top: { style: "thin", color: { argb: "FFE7E5E4" } }, bottom: { style: "thin", color: { argb: "FFE7E5E4" } } };
  }));
  const buffer = await workbook.xlsx.writeBuffer();
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="tech-tatva-recruitment-${new Date().toISOString().slice(0, 10)}.xlsx"`
    }
  });
}
