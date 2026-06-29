import { PDFDocument, rgb, StandardFonts, degrees, type PDFFont, type PDFPage, type RGB } from "pdf-lib";

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
  hod?: string;
  facultyAdvisor?: string;
  coFacultyAdvisor?: string;
};

type CertificatePdfJob = {
  kind: CertificateKind;
  config: CertificateConfig;
};

// A4 landscape dimensions in points (72 points per inch)
const A4_WIDTH = 841.89;
const A4_HEIGHT = 595.28;

// Color palette matching the HTML templates
const COLORS = {
  darkNavy: rgb(13 / 255, 17 / 255, 64 / 255),       // #0d1140
  mediumBlue: rgb(44 / 255, 68 / 255, 208 / 255),     // #2c44d0
  lightBlue: rgb(98 / 255, 120 / 255, 224 / 255),     // #6278e0
  paleBlue: rgb(128 / 255, 144 / 255, 192 / 255),     // #8090c0
  headerBg: rgb(10 / 255, 10 / 255, 24 / 255),        // #0a0a18
  bodyBg: rgb(244 / 255, 246 / 255, 255 / 255),       // #f4f6ff
  footerBg: rgb(232 / 255, 236 / 255, 255 / 255),     // #e8ecff
  white: rgb(1, 1, 1),
  sigName: rgb(26 / 255, 40 / 255, 128 / 255),        // #1a2880
  gold: rgb(160 / 255, 128 / 255, 80 / 255),          // #a08050 (winner accent)
};

function slugFile(value: string) {
  return (value || "certificate").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80) || "certificate";
}

export function certificateNumber(eventSlug: string, kind: CertificateKind, recipient: CertificateRecipient, index: number) {
  const eventCode = (eventSlug || "event").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8) || "EVENT";
  const personCode = (recipient.uid || recipient.id || recipient.name || String(index + 1)).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(-8) || String(index + 1).padStart(4, "0");
  const prefix = kind === "winner" ? `WIN${index + 1}` : "PAR";
  return `TT-${eventCode}-${prefix}-${personCode}`;
}

export function certificateFilename(kind: CertificateKind, config: CertificateConfig) {
  const prefix = kind === "winner" ? `winner-${slugFile(config.position || "place")}` : "participation";
  return `${prefix}-${slugFile(config.recipientName)}-${slugFile(config.certNumber)}.pdf`;
}

// unused but kept for backwards compat
export function renderCertificateHtml(kind: CertificateKind, config: CertificateConfig) {
  return "";
}

// --- Helper drawing functions ---

function drawCenteredText(page: PDFPage, text: string, y: number, font: PDFFont, size: number, color: RGB, maxWidth?: number) {
  const textWidth = font.widthOfTextAtSize(text, size);
  const pageWidth = page.getWidth();
  const x = (pageWidth - textWidth) / 2;
  page.drawText(text, { x: Math.max(x, 20), y, size, font, color, maxWidth });
}

function drawSignatureBlock(page: PDFPage, centerX: number, baseY: number, name: string, role: string, fonts: { italic: PDFFont; sans: PDFFont }) {
  const lineWidth = 100;
  const lineY = baseY + 26;

  // Signature line
  page.drawLine({
    start: { x: centerX - lineWidth / 2, y: lineY },
    end: { x: centerX + lineWidth / 2, y: lineY },
    thickness: 0.8,
    color: COLORS.mediumBlue,
    opacity: 0.5,
  });

  // Signature name (italic serif)
  if (name) {
    const nameWidth = fonts.italic.widthOfTextAtSize(name, 10);
    page.drawText(name, {
      x: centerX - nameWidth / 2,
      y: lineY + 6,
      size: 10,
      font: fonts.italic,
      color: COLORS.sigName,
    });
  }

  // Role label
  const roleWidth = fonts.sans.widthOfTextAtSize(role.toUpperCase(), 6);
  page.drawText(role.toUpperCase(), {
    x: centerX - roleWidth / 2,
    y: baseY + 12,
    size: 6,
    font: fonts.sans,
    color: COLORS.paleBlue,
  });
}

// --- Main PDF generation using pdf-lib ---

async function buildCertificatePdf(kind: CertificateKind, config: CertificateConfig): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([A4_WIDTH, A4_HEIGHT]);

  // Embed standard fonts
  const helvetica = await doc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const timesRoman = await doc.embedFont(StandardFonts.TimesRoman);
  const timesItalic = await doc.embedFont(StandardFonts.TimesRomanItalic);
  const timesBold = await doc.embedFont(StandardFonts.TimesRomanBold);

  const isWinner = kind === "winner";
  const accentColor = isWinner ? COLORS.gold : COLORS.mediumBlue;
  const lightAccent = isWinner ? rgb(160 / 255, 128 / 255, 80 / 255) : COLORS.lightBlue;

  // ── Background ──
  page.drawRectangle({
    x: 0, y: 0, width: A4_WIDTH, height: A4_HEIGHT,
    color: COLORS.bodyBg,
  });

  // ── Header strip (dark band) ──
  const headerHeight = A4_HEIGHT * 0.14;
  const headerY = A4_HEIGHT - headerHeight;
  page.drawRectangle({
    x: 0, y: headerY, width: A4_WIDTH, height: headerHeight,
    color: COLORS.headerBg,
  });

  // Gradient line under header
  page.drawLine({
    start: { x: 0, y: headerY },
    end: { x: A4_WIDTH, y: headerY },
    thickness: 2.5,
    color: accentColor,
    opacity: 0.7,
  });

  // Header text — university name on left, club name on right
  const headerTextY = headerY + headerHeight / 2 - 6;
  page.drawText("CHANDIGARH UNIVERSITY", {
    x: 40,
    y: headerTextY + 4,
    size: 13,
    font: helveticaBold,
    color: COLORS.white,
  });

  page.drawText("TECH TATVA", {
    x: A4_WIDTH - 40 - helveticaBold.widthOfTextAtSize("TECH TATVA", 13),
    y: headerTextY + 8,
    size: 13,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  });
  page.drawText("TECHNICAL SOCIETY", {
    x: A4_WIDTH - 40 - helvetica.widthOfTextAtSize("TECHNICAL SOCIETY", 7),
    y: headerTextY - 4,
    size: 7,
    font: helvetica,
    color: rgb(1, 1, 1),
    opacity: 0.5,
  });

  // ── Inner border ──
  const borderInset = 18;
  const borderTop = headerY - 8;
  const borderBottom = A4_HEIGHT * 0.06 + 8;
  page.drawRectangle({
    x: borderInset + 10,
    y: borderBottom,
    width: A4_WIDTH - 2 * (borderInset + 10),
    height: borderTop - borderBottom,
    borderColor: accentColor,
    borderWidth: 0.6,
    opacity: 0,
    borderOpacity: 0.2,
  });

  // ── Grid watermark pattern ──
  const gridSpacing = 22;
  for (let gx = borderInset + 10; gx < A4_WIDTH - borderInset; gx += gridSpacing) {
    page.drawLine({
      start: { x: gx, y: borderBottom },
      end: { x: gx, y: borderTop },
      thickness: 0.3,
      color: accentColor,
      opacity: 0.03,
    });
  }
  for (let gy = borderBottom; gy < borderTop; gy += gridSpacing) {
    page.drawLine({
      start: { x: borderInset + 10, y: gy },
      end: { x: A4_WIDTH - borderInset - 10, y: gy },
      thickness: 0.3,
      color: accentColor,
      opacity: 0.03,
    });
  }

  // ── Certificate body content ──
  const centerY = (headerY + borderBottom) / 2;
  let currentY = centerY + 120;

  // Sub-heading
  const subText = isWinner ? "CERTIFICATE OF ACHIEVEMENT" : "CERTIFICATE";
  drawCenteredText(page, subText, currentY, helvetica, 7, lightAccent);
  currentY -= 6;

  // Main title
  const titleLine1 = isWinner ? "Certificate of" : "Certificate of";
  const titleLine2 = isWinner ? "Achievement" : "Participation";
  drawCenteredText(page, titleLine1, currentY, timesRoman, 32, COLORS.darkNavy);
  currentY -= 36;
  drawCenteredText(page, titleLine2, currentY, timesItalic, 32, lightAccent);
  currentY -= 20;

  // Ornamental divider
  const dividerWidth = 200;
  const divCenterX = A4_WIDTH / 2;
  page.drawLine({
    start: { x: divCenterX - dividerWidth / 2, y: currentY },
    end: { x: divCenterX - 5, y: currentY },
    thickness: 0.8,
    color: accentColor,
    opacity: 0.4,
  });
  // Diamond
  const diamondSize = 3;
  page.drawRectangle({
    x: divCenterX - diamondSize,
    y: currentY - diamondSize,
    width: diamondSize * 2,
    height: diamondSize * 2,
    color: accentColor,
    rotate: degrees(45),
  });
  page.drawLine({
    start: { x: divCenterX + 5, y: currentY },
    end: { x: divCenterX + dividerWidth / 2, y: currentY },
    thickness: 0.8,
    color: accentColor,
    opacity: 0.4,
  });
  currentY -= 18;

  // "PROUDLY PRESENTED TO"
  drawCenteredText(page, "PROUDLY PRESENTED TO", currentY, helvetica, 7, COLORS.paleBlue);
  currentY -= 22;

  // Recipient name
  const recipientName = config.recipientName || "Recipient Name";
  drawCenteredText(page, recipientName, currentY, timesBold, 28, COLORS.darkNavy);

  // Underline for name
  const nameWidth = timesBold.widthOfTextAtSize(recipientName, 28);
  const nameX = (A4_WIDTH - nameWidth) / 2;
  currentY -= 6;
  page.drawLine({
    start: { x: nameX, y: currentY },
    end: { x: nameX + nameWidth, y: currentY },
    thickness: 1.2,
    color: accentColor,
    opacity: 0.6,
  });
  currentY -= 12;

  // Position badge (winner only)
  if (isWinner && config.position) {
    const posText = config.position.trim();
    const badgeWidth = helveticaBold.widthOfTextAtSize(posText, 9) + 36;
    const badgeX = (A4_WIDTH - badgeWidth) / 2;
    page.drawRectangle({
      x: badgeX,
      y: currentY - 6,
      width: badgeWidth,
      height: 20,
      borderColor: accentColor,
      borderWidth: 0.8,
      color: COLORS.footerBg,
    });
    const posTextX = badgeX + (badgeWidth - helveticaBold.widthOfTextAtSize(posText, 9)) / 2;
    page.drawText(posText, {
      x: posTextX,
      y: currentY,
      size: 9,
      font: helveticaBold,
      color: accentColor,
    });
    currentY -= 22;
  }

  // Event description
  currentY -= 6;
  const eventLine1 = `for ${isWinner ? "outstanding performance" : "active participation"} in the event`;
  drawCenteredText(page, eventLine1, currentY, helvetica, 8, COLORS.paleBlue);
  currentY -= 16;
  drawCenteredText(page, config.eventName.toUpperCase(), currentY, helveticaBold, 10, accentColor);
  currentY -= 14;

  const orgLine = `organized by Tech Tatva, Chandigarh University`;
  drawCenteredText(page, orgLine, currentY, helvetica, 8, COLORS.paleBlue);
  currentY -= 14;

  if (config.eventDate) {
    drawCenteredText(page, `on ${config.eventDate}`, currentY, helvetica, 8, COLORS.paleBlue);
  }

  // ── Signatures ──
  const sigY = borderBottom + 30;
  const sigSpacing = A4_WIDTH / 4;

  const sigData = [
    { name: config.hod || "", role: "Head of Department" },
    { name: config.facultyAdvisor || "", role: "Faculty Advisor" },
    { name: config.coFacultyAdvisor || "", role: "Co-Faculty Advisor" },
  ];

  sigData.forEach((sig, i) => {
    drawSignatureBlock(page, sigSpacing * (i + 1), sigY, sig.name, sig.role, {
      italic: timesItalic,
      sans: helvetica,
    });
  });

  // ── Footer bar ──
  const footerHeight = A4_HEIGHT * 0.055;
  page.drawRectangle({
    x: 0, y: 0, width: A4_WIDTH, height: footerHeight,
    color: COLORS.footerBg,
  });

  // Gradient line above footer
  page.drawLine({
    start: { x: 0, y: footerHeight },
    end: { x: A4_WIDTH, y: footerHeight },
    thickness: 1.5,
    color: accentColor,
    opacity: 0.5,
  });

  // Footer text
  const footerTextY = footerHeight / 2 - 3;
  page.drawText("CHANDIGARH UNIVERSITY  |  TECH TATVA TECHNICAL SOCIETY", {
    x: 32,
    y: footerTextY,
    size: 6,
    font: helvetica,
    color: COLORS.paleBlue,
  });

  if (config.certNumber) {
    const certNoText = `No. ${config.certNumber}`;
    const certNoWidth = helvetica.widthOfTextAtSize(certNoText, 6);
    page.drawText(certNoText, {
      x: A4_WIDTH - 32 - certNoWidth,
      y: footerTextY,
      size: 6,
      font: helvetica,
      color: COLORS.paleBlue,
    });
  }

  return await doc.save();
}

export async function renderCertificatePdf(kind: CertificateKind, config: CertificateConfig): Promise<Uint8Array> {
  return buildCertificatePdf(kind, config);
}

export async function renderCertificatePdfs(jobs: CertificatePdfJob[]): Promise<Buffer[]> {
  if (!jobs.length) return [];
  
  const results: Buffer[] = [];
  // Process in batches of 8 for efficiency
  const batchSize = 8;
  for (let i = 0; i < jobs.length; i += batchSize) {
    const batch = jobs.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async (job) => {
        const pdfBytes = await buildCertificatePdf(job.kind, job.config);
        return Buffer.from(pdfBytes);
      })
    );
    results.push(...batchResults);
  }
  return results;
}

// ── ZIP utility ──

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
