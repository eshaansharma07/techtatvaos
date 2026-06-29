import { readFileSync } from "fs";
import path from "path";
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

// Modern warm light color palette
const COLORS = {
  bg: rgb(253 / 255, 253 / 255, 254 / 255),           // Clean off-white background
  slate900: rgb(15 / 255, 23 / 255, 42 / 255),         // Slate-900 for title & primary labels
  slate600: rgb(71 / 255, 85 / 255, 105 / 255),        // Slate-600 for body/description text
  slate400: rgb(148 / 255, 163 / 255, 184 / 255),      // Slate-400 for dividers
  indigo: rgb(67 / 255, 56 / 255, 202 / 255),          // Indigo brand color for name/accent
  gold: rgb(197 / 255, 160 / 255, 89 / 255),           // Gold for winner badge and borders
  goldBg: rgb(254 / 255, 249 / 255, 195 / 255),        // Light yellow-gold badge background
  white: rgb(1, 1, 1),
  sigName: rgb(30 / 255, 41 / 255, 59 / 255),          // Dark slate for signature names
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

function drawSignatureBlock(page: PDFPage, centerX: number, baseY: number, name: string, role: string, fonts: { italic: PDFFont; sans: PDFFont; sansBold: PDFFont }) {
  const lineWidth = 120;
  const lineY = baseY + 26;

  // Signature line
  page.drawLine({
    start: { x: centerX - lineWidth / 2, y: lineY },
    end: { x: centerX + lineWidth / 2, y: lineY },
    thickness: 0.5,
    color: COLORS.slate400,
    opacity: 0.6,
  });

  // Signature name (Times Italic)
  if (name) {
    const nameWidth = fonts.italic.widthOfTextAtSize(name, 11);
    page.drawText(name, {
      x: centerX - nameWidth / 2,
      y: lineY + 6,
      size: 11,
      font: fonts.italic,
      color: COLORS.sigName,
    });
  }

  // Role label (Sleek uppercase Sans)
  const roleWidth = fonts.sansBold.widthOfTextAtSize(role.toUpperCase(), 7);
  page.drawText(role.toUpperCase(), {
    x: centerX - roleWidth / 2,
    y: baseY + 12,
    size: 7,
    font: fonts.sansBold,
    color: COLORS.slate600,
  });
}

// --- Main PDF generation ---

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
  const accentColor = isWinner ? COLORS.gold : COLORS.indigo;

  // Load and embed logos from the public folder dynamically
  let cuLogo: any = null;
  let ttLogo: any = null;
  try {
    const cuLogoBytes = readFileSync(path.join(process.cwd(), "public/chandigarh-university-logo.png"));
    cuLogo = await doc.embedPng(cuLogoBytes);
  } catch (e) {
    console.error("Failed to load CU logo", e);
  }

  try {
    const ttLogoBytes = readFileSync(path.join(process.cwd(), "public/logo-colour.png"));
    ttLogo = await doc.embedPng(ttLogoBytes);
  } catch (e) {
    console.error("Failed to load Tech Tatva logo", e);
  }

  // ── Background ──
  page.drawRectangle({
    x: 0, y: 0, width: A4_WIDTH, height: A4_HEIGHT,
    color: COLORS.bg,
  });

  // ── Modern Double Border Insets ──
  page.drawRectangle({
    x: 20,
    y: 20,
    width: A4_WIDTH - 40,
    height: A4_HEIGHT - 40,
    borderColor: COLORS.slate400,
    borderWidth: 1,
    opacity: 0,
    borderOpacity: 0.3,
  });

  page.drawRectangle({
    x: 25,
    y: 25,
    width: A4_WIDTH - 50,
    height: A4_HEIGHT - 50,
    borderColor: COLORS.gold,
    borderWidth: 0.5,
    opacity: 0,
    borderOpacity: 0.4,
  });

  // Corner grid design details (modern design accent)
  const drawCornerAccent = (cx: number, cy: number, dx: number, dy: number) => {
    page.drawLine({
      start: { x: cx, y: cy },
      end: { x: cx + dx, y: cy },
      thickness: 1,
      color: COLORS.gold,
    });
    page.drawLine({
      start: { x: cx, y: cy },
      end: { x: cx, y: cy + dy },
      thickness: 1,
      color: COLORS.gold,
    });
  };
  
  const accentOffset = 32;
  const accentLen = 15;
  drawCornerAccent(accentOffset, accentOffset, accentLen, accentLen); // Bottom-left
  drawCornerAccent(A4_WIDTH - accentOffset, accentOffset, -accentLen, accentLen); // Bottom-right
  drawCornerAccent(accentOffset, A4_HEIGHT - accentOffset, accentLen, -accentLen); // Top-left
  drawCornerAccent(A4_WIDTH - accentOffset, A4_HEIGHT - accentOffset, -accentLen, -accentLen); // Top-right

  // ── Header Section ──
  // Chandigarh University Logo (Left)
  if (cuLogo) {
    page.drawImage(cuLogo, {
      x: 48,
      y: A4_HEIGHT - 82,
      width: 120,
      height: 40,
    });
  }

  // Tech Tatva Club Logo (Right)
  if (ttLogo) {
    page.drawImage(ttLogo, {
      x: A4_WIDTH - 96,
      y: A4_HEIGHT - 85,
      width: 45,
      height: 45,
    });
  }

  // Sleek Divider line under header
  page.drawLine({
    start: { x: 48, y: A4_HEIGHT - 98 },
    end: { x: A4_WIDTH - 48, y: A4_HEIGHT - 98 },
    thickness: 0.5,
    color: COLORS.slate400,
    opacity: 0.3,
  });

  // ── Content Layout ──
  let currentY = A4_HEIGHT - 145;

  // Title
  const titleText = isWinner ? "CERTIFICATE OF EXCELLENCE" : "CERTIFICATE OF PARTICIPATION";
  drawCenteredText(page, titleText, currentY, timesBold, 22, COLORS.slate900);
  currentY -= 20;

  // Subtitle / presented label
  drawCenteredText(page, "THIS CERTIFICATE IS PROUDLY PRESENTED TO", currentY, helvetica, 7.5, COLORS.slate600);
  currentY -= 36;

  // Recipient Name
  const recipientName = config.recipientName || "Recipient Name";
  drawCenteredText(page, recipientName, currentY, timesBold, 28, COLORS.indigo);

  // Decorative name underline
  const nameWidth = timesBold.widthOfTextAtSize(recipientName, 28);
  const nameX = (A4_WIDTH - nameWidth) / 2;
  currentY -= 6;
  page.drawLine({
    start: { x: nameX, y: currentY },
    end: { x: nameX + nameWidth, y: currentY },
    thickness: 1.2,
    color: COLORS.gold,
    opacity: 0.7,
  });
  currentY -= 24;

  // Winner Category Badge (if winner)
  if (isWinner && config.position) {
    const posText = config.position.toUpperCase();
    const badgeWidth = helveticaBold.widthOfTextAtSize(posText, 9) + 20;
    const badgeX = (A4_WIDTH - badgeWidth) / 2;
    
    // Draw pill badge
    page.drawRectangle({
      x: badgeX,
      y: currentY - 5,
      width: badgeWidth,
      height: 18,
      color: COLORS.goldBg,
      borderColor: COLORS.gold,
      borderWidth: 0.5,
    });
    
    page.drawText(posText, {
      x: badgeX + 10,
      y: currentY + 1,
      size: 9,
      font: helveticaBold,
      color: COLORS.gold,
    });
    currentY -= 28;
  }

  // Description text paragraph
  const descLine1 = isWinner 
    ? "for outstanding performance and securing rank in the event" 
    : "for successfully participating in the event";
  
  drawCenteredText(page, descLine1, currentY, helvetica, 9.5, COLORS.slate600);
  currentY -= 18;
  
  drawCenteredText(page, config.eventName.toUpperCase(), currentY, helveticaBold, 11, accentColor);
  currentY -= 18;
  
  const descLine3 = `held on ${config.eventDate} organized by Tech Tatva Club, Chandigarh University.`;
  drawCenteredText(page, descLine3, currentY, helvetica, 9.5, COLORS.slate600);

  // ── Signature Blocks ──
  const sigY = 65;
  const sigSpacing = A4_WIDTH / 4;

  const sigs = [
    { name: config.hod || "", role: "Head of Department" },
    { name: config.facultyAdvisor || "", role: "Faculty Advisor" },
    { name: config.coFacultyAdvisor || "", role: "Co-Faculty Advisor" },
  ];

  sigs.forEach((sig, i) => {
    drawSignatureBlock(page, sigSpacing * (i + 1), sigY, sig.name, sig.role, {
      italic: timesItalic,
      sans: helvetica,
      sansBold: helveticaBold,
    });
  });

  // ── Footer minimal details ──
  const footerY = 32;
  page.drawText("TECH TATVA CLUB  |  CHANDIGARH UNIVERSITY", {
    x: 48,
    y: footerY,
    size: 7,
    font: helvetica,
    color: COLORS.slate600,
    opacity: 0.6,
  });

  if (config.certNumber) {
    const certNoText = `No. ${config.certNumber}`;
    const certNoWidth = helvetica.widthOfTextAtSize(certNoText, 7);
    page.drawText(certNoText, {
      x: A4_WIDTH - 48 - certNoWidth,
      y: footerY,
      size: 7,
      font: helvetica,
      color: COLORS.slate600,
      opacity: 0.6,
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
