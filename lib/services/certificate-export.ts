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
  certEventLogo?: string;
};

type CertificatePdfJob = {
  kind: CertificateKind;
  config: CertificateConfig;
};

// A4 landscape dimensions in points (72 points per inch)
const A4_WIDTH = 841.89;
const A4_HEIGHT = 595.28;

// Inspiration-matching Premium Color Palette
const COLORS = {
  darkFrame: rgb(12 / 255, 17 / 255, 27 / 255),       // Elegant deep dark charcoal/navy for frame
  canvasBg: rgb(250 / 255, 249 / 255, 246 / 255),     // Off-white cream textured canvas background
  slate900: rgb(15 / 255, 23 / 255, 42 / 255),         // Deep slate for primary text
  slate600: rgb(71 / 255, 85 / 255, 105 / 255),        // Muted slate for descriptions
  slate400: rgb(148 / 255, 163 / 255, 184 / 255),      // Light slate
  indigo: rgb(29 / 255, 78 / 255, 216 / 255),          // Accent blue
  gold: rgb(197 / 255, 160 / 255, 89 / 255),           // Bevel gold for details and seals
  goldLight: rgb(253 / 255, 248 / 255, 226 / 255),    // Very light gold tint
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
  const lineWidth = 110;
  const lineY = baseY + 24;

  // Signature line
  page.drawLine({
    start: { x: centerX - lineWidth / 2, y: lineY },
    end: { x: centerX + lineWidth / 2, y: lineY },
    thickness: 0.5,
    color: COLORS.slate400,
    opacity: 0.7,
  });

  // Signature name (Times Italic)
  if (name) {
    const nameWidth = fonts.italic.widthOfTextAtSize(name, 10.5);
    page.drawText(name, {
      x: centerX - nameWidth / 2,
      y: lineY + 5,
      size: 10.5,
      font: fonts.italic,
      color: COLORS.slate900,
    });
  }

  // Role label (Uppercase Sans)
  const roleWidth = fonts.sansBold.widthOfTextAtSize(role.toUpperCase(), 6.5);
  page.drawText(role.toUpperCase(), {
    x: centerX - roleWidth / 2,
    y: baseY + 10,
    size: 6.5,
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

  // Load and embed standard logos from the public folder dynamically
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

  // Load and embed custom Event Logo from remote URL if provided
  let eventLogoImage: any = null;
  if (config.certEventLogo) {
    try {
      const res = await fetch(config.certEventLogo);
      if (res.ok) {
        const arrayBuffer = await res.arrayBuffer();
        const imageBuffer = Buffer.from(arrayBuffer);
        if (config.certEventLogo.toLowerCase().includes(".png")) {
          eventLogoImage = await doc.embedPng(imageBuffer);
        } else {
          eventLogoImage = await doc.embedJpg(imageBuffer);
        }
      }
    } catch (e) {
      console.error("Failed to load custom event logo from URL", e);
    }
  }

  // 1. Draw solid dark background outer frame
  page.drawRectangle({
    x: 0, y: 0, width: A4_WIDTH, height: A4_HEIGHT,
    color: COLORS.darkFrame,
  });

  // 2. Draw inner cream canvas card
  const frameWidth = 24;
  page.drawRectangle({
    x: frameWidth,
    y: frameWidth,
    width: A4_WIDTH - (frameWidth * 2),
    height: A4_HEIGHT - (frameWidth * 2),
    color: COLORS.canvasBg,
  });

  // 3. Draw elegant gold corner brackets over the inner corners
  const drawCornerBracket = (cx: number, cy: number, dx: number, dy: number) => {
    const thickness = 1;
    const len = 16;
    page.drawLine({
      start: { x: cx, y: cy },
      end: { x: cx + dx * len, y: cy },
      thickness,
      color: COLORS.gold,
    });
    page.drawLine({
      start: { x: cx, y: cy },
      end: { x: cx, y: cy + dy * len },
      thickness,
      color: COLORS.gold,
    });
  };

  const cOffset = frameWidth + 6;
  drawCornerBracket(cOffset, cOffset, 1, 1); // Bottom-left
  drawCornerBracket(A4_WIDTH - cOffset, cOffset, -1, 1); // Bottom-right
  drawCornerBracket(cOffset, A4_HEIGHT - cOffset, 1, -1); // Top-left
  drawCornerBracket(A4_WIDTH - cOffset, A4_HEIGHT - cOffset, -1, -1); // Top-right

  // 4. Subtle background constellation decoration (very low opacity)
  const drawConcentricCircles = (cx: number, cy: number, maxRadius: number) => {
    for (let r = 40; r <= maxRadius; r += 40) {
      page.drawCircle({
        x: cx,
        y: cy,
        size: r,
        borderColor: COLORS.gold,
        borderWidth: 0.35,
        opacity: 0,
        borderOpacity: 0.03,
      });
    }
  };
  drawConcentricCircles(cOffset + 10, cOffset + 10, 200); // Bottom-left background details
  drawConcentricCircles(A4_WIDTH - cOffset - 10, A4_HEIGHT - cOffset - 10, 200); // Top-right background details

  // 5. Tech Tatva Center Watermark Logo
  if (ttLogo) {
    page.drawImage(ttLogo, {
      x: (A4_WIDTH - 240) / 2,
      y: (A4_HEIGHT - 240) / 2 - 5,
      width: 240,
      height: 240,
      opacity: 0.035, // extremely faint background watermark
    });
  }

  // 6. Header branding
  const headerY = A4_HEIGHT - 74;
  // Tech Tatva Logo + text (Top Left)
  if (ttLogo) {
    page.drawImage(ttLogo, {
      x: 48,
      y: headerY,
      width: 32,
      height: 32,
    });
    page.drawText("TechTatva", {
      x: 88,
      y: headerY + 18,
      size: 11,
      font: helveticaBold,
      color: COLORS.slate900,
    });
    page.drawText("CHANDIGARH UNIVERSITY", {
      x: 88,
      y: headerY + 6,
      size: 6.5,
      font: helvetica,
      color: COLORS.slate600,
    });
  }

  // Dynamic Event/Custom Logo OR TM 3.0 Label (Top Right)
  if (eventLogoImage) {
    page.drawImage(eventLogoImage, {
      x: A4_WIDTH - 80,
      y: headerY,
      width: 32,
      height: 32,
    });
  } else {
    page.drawText("TM 3.0", {
      x: A4_WIDTH - 86,
      y: headerY + 16,
      size: 12,
      font: helveticaBold,
      color: COLORS.gold,
    });
    page.drawText("TECHNOMANIA", {
      x: A4_WIDTH - 118,
      y: headerY + 6,
      size: 6,
      font: helvetica,
      color: COLORS.slate600,
    });
  }

  // Header Divider
  page.drawLine({
    start: { x: 48, y: headerY - 14 },
    end: { x: A4_WIDTH - 48, y: headerY - 14 },
    thickness: 0.5,
    color: COLORS.slate400,
    opacity: 0.25,
  });

  // ── Content Layout ──
  let currentY = headerY - 52;

  // Title: "CERTIFICATE"
  drawCenteredText(page, "CERTIFICATE", currentY, helveticaBold, 24, COLORS.slate900);
  currentY -= 18;

  // Category: "— OF ACHIEVEMENT —" or "— OF PARTICIPATION —"
  const catText = isWinner ? "—   O F   A C H I E V E M E N T   —" : "—   O F   P A R T I C I P A T I O N   —";
  drawCenteredText(page, catText, currentY, helveticaBold, 7.5, COLORS.gold);
  currentY -= 32;

  // Presented label
  drawCenteredText(page, "PROUDLY PRESENTED TO", currentY, helvetica, 7.5, COLORS.slate600);
  currentY -= 36;

  // Recipient Calligraphy Name (Times Italic for a beautiful handwritten/cursive script feel)
  const recipientName = config.recipientName || "Recipient Name";
  drawCenteredText(page, recipientName, currentY, timesItalic, 28, COLORS.gold);
  
  // Underline for name
  const nameWidth = timesItalic.widthOfTextAtSize(recipientName, 28);
  const nameX = (A4_WIDTH - nameWidth) / 2;
  currentY -= 6;
  page.drawLine({
    start: { x: nameX, y: currentY },
    end: { x: nameX + nameWidth, y: currentY },
    thickness: 0.6,
    color: COLORS.gold,
    opacity: 0.5,
  });
  currentY -= 24;

  // Details
  const descLine1 = "for exceptional dedication and outstanding performance in";
  drawCenteredText(page, descLine1, currentY, helvetica, 9, COLORS.slate600);
  currentY -= 18;

  // Event Name
  const eventName = (config.eventName || "Event Name").toUpperCase();
  drawCenteredText(page, eventName, currentY, helveticaBold, 11.5, COLORS.slate900);
  currentY -= 18;

  // Affiliation details
  const descLine3 = `organized by TechTatva, Chandigarh University held on ${config.eventDate}.`;
  drawCenteredText(page, descLine3, currentY, helvetica, 9, COLORS.slate600);
  currentY -= 16;
  
  const descLine4 = "Your enthusiasm and commitment made this event a success.";
  drawCenteredText(page, descLine4, currentY, helvetica, 9, COLORS.slate600);

  // ── Bottom Signatures and Embossed Seal ──
  const sigY = 62;
  const sigSpacing = A4_WIDTH / 4;

  // Left & Right Signatures (HOD, Faculty Advisor)
  drawSignatureBlock(page, sigSpacing, sigY, config.hod || "", "Head of Department", {
    italic: timesItalic,
    sans: helvetica,
    sansBold: helveticaBold,
  });

  drawSignatureBlock(page, sigSpacing * 3, sigY, config.facultyAdvisor || "", "Faculty Coordinator", {
    italic: timesItalic,
    sans: helvetica,
    sansBold: helveticaBold,
  });

  // 7. Middle 3D Gold Seal Badge (embossed metal seal effect)
  const sealX = A4_WIDTH / 2;
  const sealY = sigY + 28;
  
  // Outer gold rim
  page.drawCircle({
    x: sealX,
    y: sealY,
    size: 26,
    color: COLORS.gold,
    borderColor: rgb(238 / 255, 207 / 255, 142 / 255),
    borderWidth: 1.5,
  });

  // Inner dark center
  page.drawCircle({
    x: sealX,
    y: sealY,
    size: 22,
    color: COLORS.darkFrame,
  });

  // Tech Tatva logo inside seal
  if (ttLogo) {
    page.drawImage(ttLogo, {
      x: sealX - 13,
      y: sealY - 13,
      width: 26,
      height: 26,
    });
  }

  // 8. Dark bottom accent bar
  const bottomBarHeight = 24;
  page.drawRectangle({
    x: frameWidth,
    y: frameWidth,
    width: A4_WIDTH - (frameWidth * 2),
    height: bottomBarHeight,
    color: COLORS.darkFrame,
  });

  // Bottom Accent text
  const barTextY = frameWidth + (bottomBarHeight / 2) - 3.5;
  
  page.drawText("THANK YOU FOR BEING A PART OF THE JOURNEY.", {
    x: frameWidth + 20,
    y: barTextY,
    size: 6.5,
    font: helveticaBold,
    color: COLORS.gold,
    opacity: 0.9,
  });

  if (config.certNumber) {
    const certNoText = `No. ${config.certNumber}`;
    const certNoWidth = helvetica.widthOfTextAtSize(certNoText, 6.5);
    page.drawText(certNoText, {
      x: A4_WIDTH - frameWidth - 20 - certNoWidth,
      y: barTextY,
      size: 6.5,
      font: helvetica,
      color: COLORS.slate400,
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
