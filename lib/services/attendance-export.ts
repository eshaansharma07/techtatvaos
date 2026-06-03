import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import ExcelJS from "exceljs";

type Student = { uid?: string; name: string; program?: string; semester?: number };
type Sheet = { eventName: string; date: string; students: Student[] };

const pageSize: [number, number] = [595.28, 841.89];
const marginX = 58;
const tableX = 58;
const tableTop = 548;
const rowHeight = 24;
const headerHeight = 32;
const columns = [
  { label: "Sr. No.", width: 52 },
  { label: "UID", width: 92 },
  { label: "Name", width: 145 },
  { label: "Program", width: 140 },
  { label: "Semester", width: 70 }
];

function drawText(page: any, text: string, x: number, y: number, font: any, size = 11) {
  page.drawText(String(text || ""), { x, y, size, font, color: rgb(0, 0, 0) });
}

function drawCentered(page: any, text: string, y: number, font: any, size = 14) {
  const width = font.widthOfTextAtSize(text, size);
  drawText(page, text, (pageSize[0] - width) / 2, y, font, size);
  page.drawLine({ start: { x: (pageSize[0] - width) / 2, y: y - 3 }, end: { x: (pageSize[0] + width) / 2, y: y - 3 }, thickness: 0.7, color: rgb(0, 0, 0) });
}

function truncate(font: any, value: string, size: number, maxWidth: number) {
  let text = value || "";
  while (text.length && font.widthOfTextAtSize(text, size) > maxWidth) text = text.slice(0, -1);
  return text.length < value.length ? `${text.slice(0, -1)}.` : text;
}

function drawTable(page: any, fonts: { regular: any; bold: any }, students: Student[], pageNumber: number) {
  drawCentered(page, "SAMPLE ATTENDANCE", 764, fonts.bold, 14);
  drawText(page, "Attendance List", marginX, 704, fonts.regular, 12);
  drawText(page, "EVENT NAME: " + page.__eventName, marginX, 672, fonts.regular, 12);
  drawText(page, "DATE: " + page.__date, marginX, 642, fonts.regular, 12);
  drawText(page, "LIST OF STUDENTS PARTICIPATED IN THE EVENT:", marginX, 610, fonts.bold, 12);

  let x = tableX;
  const tableWidth = columns.reduce((sum, col) => sum + col.width, 0);
  page.drawRectangle({ x: tableX, y: tableTop - headerHeight, width: tableWidth, height: headerHeight, borderWidth: 0.8, borderColor: rgb(0, 0, 0), color: rgb(1, 1, 1) });
  columns.forEach((column) => {
    page.drawLine({ start: { x, y: tableTop - headerHeight }, end: { x, y: tableTop }, thickness: 0.8, color: rgb(0, 0, 0) });
    drawText(page, column.label, x + 6, tableTop - 20, fonts.bold, 10);
    x += column.width;
  });
  page.drawLine({ start: { x, y: tableTop - headerHeight }, end: { x, y: tableTop }, thickness: 0.8, color: rgb(0, 0, 0) });

  students.forEach((student, index) => {
    const yTop = tableTop - headerHeight - index * rowHeight;
    page.drawRectangle({ x: tableX, y: yTop - rowHeight, width: tableWidth, height: rowHeight, borderWidth: 0.8, borderColor: rgb(0, 0, 0), color: rgb(1, 1, 1) });
    let cellX = tableX;
    const values = [String(page.__offset + index + 1), student.uid || "", student.name, student.program || "", String(student.semester || "")];
    columns.forEach((column, columnIndex) => {
      page.drawLine({ start: { x: cellX, y: yTop - rowHeight }, end: { x: cellX, y: yTop }, thickness: 0.8, color: rgb(0, 0, 0) });
      drawText(page, truncate(fonts.regular, values[columnIndex], 10, column.width - 12), cellX + 6, yTop - 16, fonts.regular, 10);
      cellX += column.width;
    });
    page.drawLine({ start: { x: cellX, y: yTop - rowHeight }, end: { x: cellX, y: yTop }, thickness: 0.8, color: rgb(0, 0, 0) });
  });

  drawText(page, "Sign with date & Stamp of HoD", 382, 86, fonts.regular, 11);
  drawText(page, String(pageNumber), 294, 34, fonts.regular, 10);
}

export async function attendancePdf(sheet: Sheet) {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.TimesRoman);
  const bold = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const rowsPerPage = 20;
  const chunks = sheet.students.length ? Array.from({ length: Math.ceil(sheet.students.length / rowsPerPage) }, (_, index) => sheet.students.slice(index * rowsPerPage, index * rowsPerPage + rowsPerPage)) : [[]];

  chunks.forEach((students, index) => {
    const page = pdf.addPage(pageSize) as any;
    page.__eventName = sheet.eventName || "";
    page.__date = sheet.date || "";
    page.__offset = index * rowsPerPage;
    drawTable(page, { regular, bold }, students, index + 1);
  });

  return Buffer.from(await pdf.save());
}

export async function attendanceXlsx(sheet: Sheet) {
  const book = new ExcelJS.Workbook();
  const ws = book.addWorksheet("Attendance");
  ws.addRow(["SAMPLE ATTENDANCE"]);
  ws.mergeCells("A1:E1");
  ws.addRow([]);
  ws.addRow(["Attendance List"]);
  ws.addRow([`EVENT NAME: ${sheet.eventName}`]);
  ws.addRow([`DATE: ${sheet.date}`]);
  ws.addRow(["LIST OF STUDENTS PARTICIPATED IN THE EVENT:"]);
  ws.addRow(["Sr. No.", "UID", "Name", "Program", "Semester"]);
  sheet.students.forEach((student, index) => ws.addRow([index + 1, student.uid || "", student.name, student.program || "", student.semester || ""]));
  ws.addRow([]);
  ws.addRow(["", "", "", "Sign with date & Stamp of HoD"]);
  ws.columns = [{ width: 10 }, { width: 18 }, { width: 32 }, { width: 24 }, { width: 12 }];
  ws.getRow(1).font = { bold: true, size: 14, name: "Times New Roman", underline: true };
  ws.getRow(1).alignment = { horizontal: "center" };
  ws.getRow(7).font = { bold: true, name: "Times New Roman" };
  ws.eachRow((row) => {
    row.font = { ...(row.font || {}), name: "Times New Roman" };
  });
  return Buffer.from(await book.xlsx.writeBuffer());
}
