import { readFileSync } from "fs";
import path from "path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export type CertificateKind = "participation" | "winner";

export type CertificateRecipient = {
  id?: string;
  uid?: string;
  name: string;
  program?: string;
  semester?: number;
  position?: string;
  positionEmoji?: string;
};

export type CertificateConfig = {
  recipientName: string;
  eventName: string;
  position?: string;
  positionEmoji?: string;
  eventDate: string;
  certNumber: string;
  facultyChampion: string;
  clubChampion?: string;
  secretary: string;
};

const templateCache = new Map<CertificateKind, string>();

function templateFor(kind: CertificateKind) {
  const cached = templateCache.get(kind);
  if (cached) return cached;
  const filename = kind === "winner" ? "winner.html" : "participation.html";
  const template = readFileSync(path.join(process.cwd(), "certificate-templates", filename), "utf8");
  templateCache.set(kind, template);
  return template;
}

function jsString(value: string) {
  return JSON.stringify(value || "");
}

function htmlEscape(value: string) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function replaceIdText(html: string, id: string, value: string) {
  return html.replace(new RegExp(`(<[^>]+id=["']${id}["'][^>]*>)([\\s\\S]*?)(<\\/[^>]+>)`), `$1${htmlEscape(value)}$3`);
}

export function certificateNumber(eventSlug: string, kind: CertificateKind, recipient: CertificateRecipient, index: number) {
  const eventCode = (eventSlug || "event").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8) || "EVENT";
  const personCode = (recipient.uid || recipient.id || recipient.name || String(index + 1)).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(-8) || String(index + 1).padStart(4, "0");
  const prefix = kind === "winner" ? `WIN${index + 1}` : "PAR";
  return `TT-${eventCode}-${prefix}-${personCode}`;
}

export function renderCertificateHtml(kind: CertificateKind, config: CertificateConfig) {
  const position = config.position || "";
  const positionEmoji = config.positionEmoji || "";
  let html = templateFor(kind);
  const configBlock = kind === "winner"
    ? `const CONFIG = {
  recipientName   : ${jsString(config.recipientName)},
  eventName       : ${jsString(config.eventName)},
  eventDate       : ${jsString(config.eventDate)},
  certNumber      : ${jsString(config.certNumber)},
  facultyChampion : ${jsString(config.facultyChampion)},
  clubChampion    : ${jsString(config.clubChampion || "")},
  secretary       : ${jsString(config.secretary)},
  position        : ${jsString(position)},
  positionEmoji   : ${jsString(positionEmoji)},
};`
    : `const CONFIG = {
  recipientName   : ${jsString(config.recipientName)},
  eventName       : ${jsString(config.eventName)},
  eventDate       : ${jsString(config.eventDate)},
  certNumber      : ${jsString(config.certNumber)},
  facultyChampion : ${jsString(config.facultyChampion)},
  clubChampion    : ${jsString(config.clubChampion || "")},
  secretary       : ${jsString(config.secretary)},
};`;

  html = html.replace(/const CONFIG = \{[\s\S]*?\};/, configBlock);
  html = replaceIdText(html, "cfg-recipient", config.recipientName);
  html = replaceIdText(html, "cfg-event", config.eventName);
  html = replaceIdText(html, "cfg-date", config.eventDate);
  html = replaceIdText(html, "cfg-certno", `No. ${config.certNumber}`);
  html = replaceIdText(html, "cfg-faculty", config.facultyChampion);
  html = replaceIdText(html, "cfg-secretary", config.secretary);
  if (kind === "winner") html = replaceIdText(html, "cfg-position", `${positionEmoji ? `${positionEmoji}  ` : ""}${position}`);
  return html;
}

function slugFile(value: string) {
  return (value || "certificate").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80) || "certificate";
}

function clean(value: string) {
  return String(value || "").replace(/[^\x20-\x7E]/g, "").trim();
}

function textWidth(font: any, value: string, size: number) {
  return font.widthOfTextAtSize(value, size);
}

function centerText(page: any, value: string, y: number, font: any, size: number, color = rgb(1, 1, 1)) {
  const text = clean(value);
  page.drawText(text, { x: (842 - textWidth(font, text, size)) / 2, y, size, font, color });
}

function fitText(font: any, value: string, size: number, maxWidth: number) {
  let text = clean(value);
  while (text.length && textWidth(font, text, size) > maxWidth) text = text.slice(0, -1);
  return text.length < clean(value).length ? `${text.slice(0, -1)}.` : text;
}

function drawLine(page: any, y: number, x1 = 86, x2 = 756, color = rgb(0.42, 0.22, 0.72)) {
  page.drawLine({ start: { x: x1, y }, end: { x: x2, y }, thickness: 1.1, color, opacity: 0.75 });
}

async function embedClubImage(pdf: PDFDocument) {
  try {
    const image = readFileSync(path.join(process.cwd(), "public", "tech-tatva-hero.png"));
    return await pdf.embedPng(image);
  } catch {
    return null;
  }
}

export async function renderCertificatePdf(kind: CertificateKind, config: CertificateConfig) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([842, 595]);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const serif = await pdf.embedFont(StandardFonts.TimesRomanBoldItalic);
  const italic = await pdf.embedFont(StandardFonts.HelveticaOblique);
  const image = await embedClubImage(pdf);

  page.drawRectangle({ x: 0, y: 0, width: 842, height: 595, color: rgb(0.018, 0.014, 0.033) });
  page.drawRectangle({ x: 20, y: 20, width: 802, height: 555, borderWidth: 2.2, borderColor: rgb(0.84, 0.73, 1), opacity: 0.9 });
  page.drawRectangle({ x: 34, y: 34, width: 774, height: 527, borderWidth: 0.7, borderColor: rgb(0.46, 0.25, 0.76), opacity: 0.75 });
  page.drawCircle({ x: 128, y: 464, size: 110, color: rgb(0.22, 0.06, 0.42), opacity: 0.32 });
  page.drawCircle({ x: 704, y: 158, size: 130, color: rgb(0.42, 0.08, 0.28), opacity: 0.28 });
  page.drawRectangle({ x: 70, y: 78, width: 702, height: 440, borderWidth: 0.8, borderColor: rgb(0.24, 0.17, 0.34), color: rgb(0.05, 0.04, 0.075), opacity: 0.92 });

  if (image) {
    page.drawImage(image, { x: 94, y: 420, width: 110, height: 55, opacity: 0.9 });
    page.drawImage(image, { x: 260, y: 110, width: 322, height: 161, opacity: 0.055 });
  }

  centerText(page, "TECH TATVA", 474, serif, 31, rgb(1, 1, 1));
  centerText(page, kind === "winner" ? "CERTIFICATE OF ACHIEVEMENT" : "CERTIFICATE OF PARTICIPATION", 440, bold, 18, rgb(0.87, 0.73, 1));
  drawLine(page, 424, 250, 592, rgb(0.92, 0.34, 0.9));

  centerText(page, "This certificate is proudly presented to", 384, italic, 14, rgb(0.73, 0.7, 0.78));
  centerText(page, fitText(serif, config.recipientName, 44, 650), 326, serif, 44, rgb(1, 1, 1));
  drawLine(page, 309, 176, 666, rgb(0.84, 0.73, 1));

  const body = kind === "winner"
    ? `for securing ${clean(config.position || "a winning position")} in`
    : "for active participation in";
  centerText(page, body, 276, regular, 14, rgb(0.76, 0.73, 0.82));
  centerText(page, fitText(bold, config.eventName, 26, 620), 237, bold, 26, rgb(0.96, 0.9, 1));
  centerText(page, config.eventDate ? `held on ${config.eventDate}` : "organized by Tech Tatva", 208, regular, 13, rgb(0.7, 0.68, 0.77));

  page.drawText(`Certificate ID: ${clean(config.certNumber)}`, { x: 94, y: 104, size: 10.5, font: regular, color: rgb(0.72, 0.68, 0.78) });
  page.drawText("Faculty Champion", { x: 94, y: 158, size: 9, font: regular, color: rgb(0.62, 0.58, 0.68) });
  page.drawText(fitText(bold, config.facultyChampion, 12, 190), { x: 94, y: 140, size: 12, font: bold, color: rgb(1, 1, 1) });
  page.drawLine({ start: { x: 94, y: 133 }, end: { x: 270, y: 133 }, thickness: 0.7, color: rgb(0.7, 0.62, 0.86) });

  page.drawText("Club Champion", { x: 334, y: 158, size: 9, font: regular, color: rgb(0.62, 0.58, 0.68) });
  page.drawText(fitText(bold, config.clubChampion || "Tech Tatva", 12, 190), { x: 334, y: 140, size: 12, font: bold, color: rgb(1, 1, 1) });
  page.drawLine({ start: { x: 334, y: 133 }, end: { x: 510, y: 133 }, thickness: 0.7, color: rgb(0.7, 0.62, 0.86) });

  page.drawText("Secretary", { x: 574, y: 158, size: 9, font: regular, color: rgb(0.62, 0.58, 0.68) });
  page.drawText(fitText(bold, config.secretary, 12, 190), { x: 574, y: 140, size: 12, font: bold, color: rgb(1, 1, 1) });
  page.drawLine({ start: { x: 574, y: 133 }, end: { x: 750, y: 133 }, thickness: 0.7, color: rgb(0.7, 0.62, 0.86) });

  page.drawText("Generated by Tech Tatva OS", { x: 612, y: 104, size: 10, font: regular, color: rgb(0.58, 0.54, 0.66) });

  return Buffer.from(await pdf.save());
}

const crcTable = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buffer: Buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime(date = new Date()) {
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const dosDate = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { time, date: dosDate };
}

function u16(value: number) {
  const buffer = Buffer.alloc(2);
  buffer.writeUInt16LE(value);
  return buffer;
}

function u32(value: number) {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32LE(value >>> 0);
  return buffer;
}

export function zipFiles(files: { name: string; content: string | Buffer }[]) {
  const locals: Buffer[] = [];
  const centrals: Buffer[] = [];
  let offset = 0;
  const stamp = dosDateTime();

  files.forEach((file) => {
    const name = Buffer.from(file.name, "utf8");
    const content = Buffer.isBuffer(file.content) ? file.content : Buffer.from(file.content, "utf8");
    const crc = crc32(content);
    const local = Buffer.concat([
      u32(0x04034b50), u16(20), u16(0), u16(0), u16(stamp.time), u16(stamp.date),
      u32(crc), u32(content.length), u32(content.length), u16(name.length), u16(0), name, content
    ]);
    const central = Buffer.concat([
      u32(0x02014b50), u16(20), u16(20), u16(0), u16(0), u16(stamp.time), u16(stamp.date),
      u32(crc), u32(content.length), u32(content.length), u16(name.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset), name
    ]);
    locals.push(local);
    centrals.push(central);
    offset += local.length;
  });

  const centralDirectory = Buffer.concat(centrals);
  const end = Buffer.concat([
    u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length), u32(centralDirectory.length), u32(offset), u16(0)
  ]);
  return Buffer.concat([...locals, centralDirectory, end]);
}

export function certificateFilename(kind: CertificateKind, config: CertificateConfig) {
  const prefix = kind === "winner" ? `winner-${slugFile(config.position || "place")}` : "participation";
  return `${prefix}-${slugFile(config.recipientName)}-${slugFile(config.certNumber)}.pdf`;
}
