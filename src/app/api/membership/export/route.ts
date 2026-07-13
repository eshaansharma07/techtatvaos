import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { connectDB } from "@/lib/db";
import { StudentMember } from "@/lib/models";
import { requirePortal } from "@/lib/portal";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const blocked = await requirePortal(req);
  if (blocked) return blocked;
  await connectDB();
  const { searchParams } = new URL(req.url);
  const query: Record<string, any> = {};
  if (searchParams.get("status")) query.status = searchParams.get("status");
  if (searchParams.get("department")) query.department = searchParams.get("department");
  if (searchParams.get("year")) query.year = searchParams.get("year");
  if (searchParams.get("source")) query.source = searchParams.get("source");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  if (from || to) query.registeredAt = { ...(from ? { $gte: new Date(from) } : {}), ...(to ? { $lte: new Date(to) } : {}) };
  const search = searchParams.get("search");
  if (search) {
    const regex = { $regex: search, $options: "i" };
    query.$or = [{ fullName: regex }, { uid: regex }, { email: regex }, { phone: regex }];
  }

  const members = await StudentMember.find(query).sort({ registeredAt: -1 }).lean();
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Student Members");
  sheet.columns = [
    { header: "Full Name", key: "fullName", width: 24 },
    { header: "University UID", key: "uid", width: 18 },
    { header: "Department", key: "department", width: 30 },
    { header: "Year", key: "year", width: 10 },
    { header: "Section", key: "section", width: 10 },
    { header: "Email", key: "email", width: 30 },
    { header: "Phone", key: "phone", width: 18 },
    { header: "Gender", key: "gender", width: 14 },
    { header: "Interests", key: "interests", width: 40 },
    { header: "Registration Date", key: "registeredAt", width: 22 },
    { header: "Status", key: "status", width: 14 },
    { header: "Source", key: "source", width: 12 },
    { header: "Admin Remarks", key: "adminRemarks", width: 36 }
  ];
  sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF5B21B6" } };
  members.forEach((member: any) => {
    sheet.addRow({
      fullName: member.fullName,
      uid: member.uid,
      department: member.department,
      year: member.year,
      section: member.section || "",
      email: member.email,
      phone: member.phone,
      gender: member.gender || "",
      interests: (member.interests || []).join(", "),
      registeredAt: member.registeredAt ? new Date(member.registeredAt).toLocaleString("en-IN") : "",
      status: member.status,
      source: member.source || "online",
      adminRemarks: member.adminRemarks || ""
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
      "Content-Disposition": `attachment; filename="StudentMembers-${new Date().toISOString().slice(0, 10)}.xlsx"`
    }
  });
}
