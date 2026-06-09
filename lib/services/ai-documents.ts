import { readFileSync } from "fs";
import path from "path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { zipFiles } from "@/lib/services/certificate-export";

export type GeneratedContent = {
  title: string;
  subtitle?: string;
  fields: [string, string][];
  paragraphs: string[];
  captions?: string[];
  actionItems?: { task: string; assignedTo?: string; deadline?: string; status?: string }[];
};

function templatePath(kind: "event_report" | "mom") {
  return path.join(process.cwd(), "document-templates", kind === "mom" ? "mom-template.pdf" : "post-activity-report-template.pdf");
}

async function templateSource(kind: "event_report" | "mom", templateUrl?: string) {
  if (templateUrl) {
    const response = await fetch(templateUrl, { cache: "no-store" });
    if (response.ok) return Buffer.from(await response.arrayBuffer());
  }
  return readFileSync(templatePath(kind));
}

function wrap(font: any, text: string, size: number, maxWidth: number) {
  const words = String(text || "").replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(test, size) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function xmlEscape(value: string) {
  return String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function templatePdf(kind: "event_report" | "mom", content: GeneratedContent, templateUrl?: string) {
  const source = await templateSource(kind, templateUrl);
  const pdf = await PDFDocument.load(source);
  const page = pdf.getPages()[0];
  const { width, height } = page.getSize();
  const regular = await pdf.embedFont(StandardFonts.TimesRoman);
  const bold = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const plum = rgb(0.15, 0.07, 0.16);

  page.drawText(content.title.slice(0, 90), { x: 68, y: height - 126, size: 13, font: bold, color: plum });
  if (content.subtitle) page.drawText(content.subtitle.slice(0, 110), { x: 68, y: height - 144, size: 9, font: regular, color: rgb(0.25, 0.25, 0.28) });

  let y = height - 174;
  for (const [label, value] of content.fields.slice(0, 10)) {
    page.drawText(`${label}:`, { x: 68, y, size: 9, font: bold, color: plum });
    page.drawText(String(value || "-").slice(0, 88), { x: 166, y, size: 9, font: regular, color: rgb(0, 0, 0) });
    y -= 14;
  }

  y -= 8;
  page.drawText(kind === "mom" ? "Minutes of Meeting" : "Post Activity Summary", { x: 68, y, size: 11, font: bold, color: plum });
  y -= 18;
  for (const paragraph of content.paragraphs) {
    for (const line of wrap(regular, paragraph, 9, width - 136)) {
      if (y < 112) break;
      page.drawText(line, { x: 68, y, size: 9, font: regular, color: rgb(0, 0, 0) });
      y -= 12;
    }
    y -= 6;
    if (y < 112) break;
  }

  if (kind === "mom" && content.actionItems?.length && y > 122) {
    page.drawText("Action Items", { x: 68, y, size: 10, font: bold, color: plum });
    y -= 14;
    for (const item of content.actionItems.slice(0, 6)) {
      const line = `${item.task || "-"} | ${item.assignedTo || "-"} | ${item.deadline || "-"} | ${item.status || "Pending"}`;
      page.drawText(line.slice(0, 115), { x: 78, y, size: 8, font: regular, color: rgb(0, 0, 0) });
      y -= 11;
    }
  }

  if (kind === "event_report" && content.captions?.length && y > 122) {
    page.drawText("Photo Captions", { x: 68, y, size: 10, font: bold, color: plum });
    y -= 14;
    content.captions.slice(0, 5).forEach((caption, index) => {
      page.drawText(`${index + 1}. ${caption}`.slice(0, 120), { x: 78, y, size: 8, font: regular, color: rgb(0, 0, 0) });
      y -= 11;
    });
  }

  return Buffer.from(await pdf.save());
}

export function generatedDocx(content: GeneratedContent) {
  const paragraphs = [
    `<w:p><w:r><w:rPr><w:b/><w:sz w:val="32"/></w:rPr><w:t>${xmlEscape(content.title)}</w:t></w:r></w:p>`,
    content.subtitle ? `<w:p><w:r><w:t>${xmlEscape(content.subtitle)}</w:t></w:r></w:p>` : "",
    ...content.fields.map(([label, value]) => `<w:p><w:r><w:rPr><w:b/></w:rPr><w:t>${xmlEscape(label)}: </w:t></w:r><w:r><w:t>${xmlEscape(value)}</w:t></w:r></w:p>`),
    ...content.paragraphs.map((paragraph) => `<w:p><w:r><w:t>${xmlEscape(paragraph)}</w:t></w:r></w:p>`),
    ...(content.captions || []).map((caption, index) => `<w:p><w:r><w:t>Photo ${index + 1}: ${xmlEscape(caption)}</w:t></w:r></w:p>`),
    ...(content.actionItems || []).map((item) => `<w:p><w:r><w:t>${xmlEscape(`${item.task || "-"} | ${item.assignedTo || "-"} | ${item.deadline || "-"} | ${item.status || "Pending"}`)}</w:t></w:r></w:p>`)
  ].filter(Boolean).join("");

  const files = [
    { name: "[Content_Types].xml", content: `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>` },
    { name: "_rels/.rels", content: `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>` },
    { name: "word/document.xml", content: `<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${paragraphs}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="900" w:right="900" w:bottom="900" w:left="900"/></w:sectPr></w:body></w:document>` }
  ];
  return zipFiles(files);
}
