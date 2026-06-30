import { readFileSync } from "fs";
import path from "path";
import { PDFDocument, rgb, StandardFonts, type PDFFont, type PDFPage, type RGB } from "pdf-lib";

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

// A4 landscape
const W = 841.89;
const H = 595.28;
const CX = W / 2;
const CY = H / 2;

// ═══════════════════════════════════════════════════
//  PREMIUM COLOR PALETTE
// ═══════════════════════════════════════════════════
const C = {
  // Outer frame layers
  navy:       rgb(15/255, 20/255, 35/255),
  navyLight:  rgb(25/255, 32/255, 52/255),
  // Gold spectrum
  goldDark:   rgb(160/255, 120/255, 50/255),
  gold:       rgb(195/255, 158/255, 82/255),
  goldMid:    rgb(212/255, 175/255, 100/255),
  goldLight:  rgb(230/255, 205/255, 145/255),
  goldPale:   rgb(248/255, 238/255, 210/255),
  // Canvas
  cream:      rgb(252/255, 250/255, 245/255),
  creamDark:  rgb(245/255, 240/255, 228/255),
  // Text
  ink:        rgb(20/255, 25/255, 40/255),
  inkSoft:    rgb(60/255, 65/255, 80/255),
  inkMuted:   rgb(110/255, 115/255, 130/255),
  white:      rgb(1, 1, 1),
};

// ═══════════════════════════════════════════════════
//  UTILITY HELPERS
// ═══════════════════════════════════════════════════

function slugFile(v: string) {
  return (v || "certificate").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80) || "certificate";
}

export function certificateNumber(eventSlug: string, kind: CertificateKind, recipient: CertificateRecipient, index: number) {
  const ec = (eventSlug || "event").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8) || "EVENT";
  const pc = (recipient.uid || recipient.id || recipient.name || String(index + 1)).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(-8) || String(index + 1).padStart(4, "0");
  const pfx = kind === "winner" ? `WIN${index + 1}` : "PAR";
  return `TT-${ec}-${pfx}-${pc}`;
}

export function certificateFilename(kind: CertificateKind, config: CertificateConfig) {
  const pfx = kind === "winner" ? `winner-${slugFile(config.position || "place")}` : "participation";
  return `${pfx}-${slugFile(config.recipientName)}-${slugFile(config.certNumber)}.pdf`;
}

export function renderCertificateHtml(kind: CertificateKind, config: CertificateConfig) {
  return "";
}

function ctxt(page: PDFPage, text: string, y: number, font: PDFFont, size: number, color: RGB, opacity = 1) {
  const tw = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: Math.max((W - tw) / 2, 10), y, size, font, color, opacity });
}

// ═══════════════════════════════════════════════════
//  DECORATIVE DRAWING PRIMITIVES
// ═══════════════════════════════════════════════════

/** Draw a diamond shape at (cx, cy) with given half-size */
function drawDiamond(page: PDFPage, cx: number, cy: number, halfSize: number, color: RGB, opacity = 1) {
  // Approximate diamond with a rotated square using 4 thin lines
  const s = halfSize;
  const pts = [
    { x: cx, y: cy + s },     // top
    { x: cx + s, y: cy },     // right
    { x: cx, y: cy - s },     // bottom
    { x: cx - s, y: cy },     // left
  ];
  for (let i = 0; i < 4; i++) {
    page.drawLine({
      start: pts[i],
      end: pts[(i + 1) % 4],
      thickness: 0.6,
      color,
      opacity,
    });
  }
}

/** Draw a decorative dot cluster (rosette) at a corner */
function drawCornerRosette(page: PDFPage, cx: number, cy: number, color: RGB) {
  // Central dot
  page.drawCircle({ x: cx, y: cy, size: 3.5, color, opacity: 0.9 });
  // Ring of 8 dots
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI * 2) / 8;
    page.drawCircle({
      x: cx + Math.cos(angle) * 10,
      y: cy + Math.sin(angle) * 10,
      size: 1.8, color, opacity: 0.7,
    });
  }
  // Outer ring of 12 tiny dots
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI * 2) / 12 + Math.PI / 12;
    page.drawCircle({
      x: cx + Math.cos(angle) * 18,
      y: cy + Math.sin(angle) * 18,
      size: 1, color, opacity: 0.45,
    });
  }
  // Outermost ring of 16 micro dots
  for (let i = 0; i < 16; i++) {
    const angle = (i * Math.PI * 2) / 16;
    page.drawCircle({
      x: cx + Math.cos(angle) * 25,
      y: cy + Math.sin(angle) * 25,
      size: 0.6, color, opacity: 0.3,
    });
  }
}

/** Draw ornamental divider line with center diamond */
function drawOrnamentalDivider(page: PDFPage, y: number, width: number, color: RGB, opacity = 0.6) {
  const left = CX - width / 2;
  const right = CX + width / 2;

  // Main line
  page.drawLine({ start: { x: left, y }, end: { x: CX - 8, y }, thickness: 0.5, color, opacity });
  page.drawLine({ start: { x: CX + 8, y }, end: { x: right, y }, thickness: 0.5, color, opacity });

  // Center diamond
  drawDiamond(page, CX, y, 4, color, opacity);

  // End diamonds
  drawDiamond(page, left + 3, y, 2, color, opacity);
  drawDiamond(page, right - 3, y, 2, color, opacity);

  // Dots near center
  page.drawCircle({ x: CX - 16, y, size: 1, color, opacity: opacity * 0.7 });
  page.drawCircle({ x: CX + 16, y, size: 1, color, opacity: opacity * 0.7 });
}

/** Sunburst radiating lines from a center point */
function drawSunburst(page: PDFPage, cx: number, cy: number, innerR: number, outerR: number, count: number, color: RGB, opacity: number) {
  for (let i = 0; i < count; i++) {
    const angle = (i * Math.PI * 2) / count;
    page.drawLine({
      start: { x: cx + Math.cos(angle) * innerR, y: cy + Math.sin(angle) * innerR },
      end: { x: cx + Math.cos(angle) * outerR, y: cy + Math.sin(angle) * outerR },
      thickness: 0.3,
      color,
      opacity,
    });
  }
}

/** Draw the elaborate multi-ring seal with scalloped edge effect */
function drawElaborateSeal(page: PDFPage, cx: number, cy: number, color: RGB, darkColor: RGB, ttLogo: any) {
  // Scalloped outer edge (bumpy circle made of overlapping circles)
  const scallops = 24;
  const sR = 38;
  for (let i = 0; i < scallops; i++) {
    const angle = (i * Math.PI * 2) / scallops;
    page.drawCircle({
      x: cx + Math.cos(angle) * sR,
      y: cy + Math.sin(angle) * sR,
      size: 8,
      color,
      opacity: 0.85,
    });
  }

  // Solid fill center
  page.drawCircle({ x: cx, y: cy, size: 40, color });

  // Sunburst rays inside seal
  drawSunburst(page, cx, cy, 28, 37, 36, darkColor, 0.15);

  // Inner ring 1
  page.drawCircle({ x: cx, y: cy, size: 34, borderColor: darkColor, borderWidth: 0.8, opacity: 0, borderOpacity: 0.4 });

  // Inner ring 2 (gold)
  page.drawCircle({ x: cx, y: cy, size: 30, borderColor: C.goldLight, borderWidth: 1, opacity: 0, borderOpacity: 0.7 });

  // Dark inner disc
  page.drawCircle({ x: cx, y: cy, size: 27, color: darkColor });

  // Gold ring on dark disc
  page.drawCircle({ x: cx, y: cy, size: 24, borderColor: color, borderWidth: 1.2, opacity: 0, borderOpacity: 0.8 });

  // Innermost gold disc
  page.drawCircle({ x: cx, y: cy, size: 20, color });

  // Dot ring inside seal
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI * 2) / 12;
    page.drawCircle({
      x: cx + Math.cos(angle) * 16,
      y: cy + Math.sin(angle) * 16,
      size: 1,
      color: darkColor,
      opacity: 0.5,
    });
  }

  // Logo in the center of the seal
  if (ttLogo) {
    page.drawImage(ttLogo, {
      x: cx - 14,
      y: cy - 14,
      width: 28,
      height: 28,
    });
  }
}

// ═══════════════════════════════════════════════════
//  MAIN PDF BUILDER
// ═══════════════════════════════════════════════════

async function buildCertificatePdf(kind: CertificateKind, config: CertificateConfig): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([W, H]);

  // Fonts
  const helv     = await doc.embedFont(StandardFonts.Helvetica);
  const helvB    = await doc.embedFont(StandardFonts.HelveticaBold);
  const times    = await doc.embedFont(StandardFonts.TimesRoman);
  const timesI   = await doc.embedFont(StandardFonts.TimesRomanItalic);
  const timesB   = await doc.embedFont(StandardFonts.TimesRomanBold);
  const timesBi  = await doc.embedFont(StandardFonts.TimesRomanBoldItalic);

  const isWinner = kind === "winner";

  // ── Load logos ──
  let cuLogo: any = null;
  let ttLogo: any = null;
  try { cuLogo = await doc.embedPng(readFileSync(path.join(process.cwd(), "public/chandigarh-university-logo.png"))); } catch {}
  try { ttLogo = await doc.embedPng(readFileSync(path.join(process.cwd(), "public/logo-colour.png"))); } catch {}

  let eventLogo: any = null;
  if (config.certEventLogo) {
    try {
      const res = await fetch(config.certEventLogo);
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        eventLogo = config.certEventLogo.toLowerCase().includes(".png") ? await doc.embedPng(buf) : await doc.embedJpg(buf);
      }
    } catch {}
  }

  // ╔═══════════════════════════════════════════════╗
  // ║  LAYER 1: OUTER DARK NAVY BACKGROUND         ║
  // ╚═══════════════════════════════════════════════╝
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C.navy });

  // ╔═══════════════════════════════════════════════╗
  // ║  LAYER 2: GOLD OUTER BORDER (thick)           ║
  // ╚═══════════════════════════════════════════════╝
  const ob = 10; // outer border offset
  page.drawRectangle({ x: ob, y: ob, width: W - ob * 2, height: H - ob * 2, borderColor: C.gold, borderWidth: 2.5, opacity: 0, borderOpacity: 0.85 });

  // ╔═══════════════════════════════════════════════╗
  // ║  LAYER 3: THIN GOLD PINSTRIPE                 ║
  // ╚═══════════════════════════════════════════════╝
  const ps = 16;
  page.drawRectangle({ x: ps, y: ps, width: W - ps * 2, height: H - ps * 2, borderColor: C.goldMid, borderWidth: 0.5, opacity: 0, borderOpacity: 0.6 });

  // ╔═══════════════════════════════════════════════╗
  // ║  LAYER 4: CREAM CANVAS FILL                   ║
  // ╚═══════════════════════════════════════════════╝
  const fw = 20;
  page.drawRectangle({ x: fw, y: fw, width: W - fw * 2, height: H - fw * 2, color: C.cream });

  // ╔═══════════════════════════════════════════════╗
  // ║  LAYER 5: INNER DECORATIVE GOLD BORDER        ║
  // ╚═══════════════════════════════════════════════╝
  const ib = 30;
  page.drawRectangle({ x: ib, y: ib, width: W - ib * 2, height: H - ib * 2, borderColor: C.gold, borderWidth: 1.2, opacity: 0, borderOpacity: 0.5 });

  // Thinner inner-inner border
  const iib = 34;
  page.drawRectangle({ x: iib, y: iib, width: W - iib * 2, height: H - iib * 2, borderColor: C.goldMid, borderWidth: 0.3, opacity: 0, borderOpacity: 0.35 });

  // ╔═══════════════════════════════════════════════╗
  // ║  DIAMOND CHAIN BORDER between layers 5 & 6    ║
  // ╚═══════════════════════════════════════════════╝
  const dbOffset = 32;
  const diamondSpacing = 20;
  // Top edge
  for (let x = dbOffset + 20; x < W - dbOffset - 20; x += diamondSpacing) {
    drawDiamond(page, x, H - dbOffset, 2.5, C.gold, 0.3);
  }
  // Bottom edge
  for (let x = dbOffset + 20; x < W - dbOffset - 20; x += diamondSpacing) {
    drawDiamond(page, x, dbOffset, 2.5, C.gold, 0.3);
  }
  // Left edge
  for (let y = dbOffset + 20; y < H - dbOffset - 20; y += diamondSpacing) {
    drawDiamond(page, dbOffset, y, 2.5, C.gold, 0.3);
  }
  // Right edge
  for (let y = dbOffset + 20; y < H - dbOffset - 20; y += diamondSpacing) {
    drawDiamond(page, W - dbOffset, y, 2.5, C.gold, 0.3);
  }

  // ╔═══════════════════════════════════════════════╗
  // ║  CORNER ROSETTES (ornate dot clusters)        ║
  // ╚═══════════════════════════════════════════════╝
  const cr = 56;
  drawCornerRosette(page, cr, cr, C.gold);
  drawCornerRosette(page, W - cr, cr, C.gold);
  drawCornerRosette(page, cr, H - cr, C.gold);
  drawCornerRosette(page, W - cr, H - cr, C.gold);

  // ╔═══════════════════════════════════════════════╗
  // ║  CORNER BRACKET FLOURISHES (L-shaped)         ║
  // ╚═══════════════════════════════════════════════╝
  const drawCornerL = (x: number, y: number, dx: number, dy: number) => {
    const len = 55;
    const t = 1.5;
    page.drawLine({ start: { x, y }, end: { x: x + dx * len, y }, thickness: t, color: C.gold, opacity: 0.55 });
    page.drawLine({ start: { x, y }, end: { x, y: y + dy * len }, thickness: t, color: C.gold, opacity: 0.55 });
    // Small perpendicular end caps
    page.drawLine({ start: { x: x + dx * len, y: y - dy * 4 }, end: { x: x + dx * len, y: y + dy * 4 }, thickness: 0.6, color: C.gold, opacity: 0.4 });
    page.drawLine({ start: { x: x - dx * 4, y: y + dy * len }, end: { x: x + dx * 4, y: y + dy * len }, thickness: 0.6, color: C.gold, opacity: 0.4 });
  };
  const clOff = 38;
  drawCornerL(clOff, clOff, 1, 1);
  drawCornerL(W - clOff, clOff, -1, 1);
  drawCornerL(clOff, H - clOff, 1, -1);
  drawCornerL(W - clOff, H - clOff, -1, -1);

  // ╔═══════════════════════════════════════════════╗
  // ║  BACKGROUND: RADIATING SUNBURST FROM CENTER   ║
  // ╚═══════════════════════════════════════════════╝
  drawSunburst(page, CX, CY, 80, 260, 72, C.goldPale, 0.06);
  drawSunburst(page, CX, CY, 70, 160, 36, C.creamDark, 0.08);

  // ╔═══════════════════════════════════════════════╗
  // ║  BACKGROUND: CONCENTRIC CIRCLES (watermark)   ║
  // ╚═══════════════════════════════════════════════╝
  for (let r = 40; r <= 240; r += 30) {
    page.drawCircle({ x: CX, y: CY, size: r, borderColor: C.goldMid, borderWidth: 0.25, opacity: 0, borderOpacity: 0.035 });
  }

  // ╔═══════════════════════════════════════════════╗
  // ║  BACKGROUND: CENTER WATERMARK LOGO            ║
  // ╚═══════════════════════════════════════════════╝
  if (ttLogo) {
    page.drawImage(ttLogo, { x: CX - 100, y: CY - 100, width: 200, height: 200, opacity: 0.03 });
  }

  // ╔═══════════════════════════════════════════════╗
  // ║  HEADER: LOGOS + BRANDING                     ║
  // ╚═══════════════════════════════════════════════╝
  const headY = H - 72;

  // Left: Tech Tatva logo + text
  if (ttLogo) {
    page.drawImage(ttLogo, { x: 50, y: headY - 2, width: 36, height: 36 });
  }
  page.drawText("TechTatva", { x: 92, y: headY + 20, size: 12, font: helvB, color: C.ink });
  page.drawText("CHANDIGARH UNIVERSITY", { x: 92, y: headY + 7, size: 6.5, font: helv, color: C.inkMuted });

  // Right: CU logo + Event logo
  if (cuLogo) {
    page.drawImage(cuLogo, { x: W - 160, y: headY + 2, width: 90, height: 28 });
  }
  if (eventLogo) {
    page.drawImage(eventLogo, { x: W - 62, y: headY, width: 32, height: 32 });
  }

  // Header divider with ornament
  drawOrnamentalDivider(page, headY - 16, W - 120, C.gold, 0.45);

  // ╔═══════════════════════════════════════════════╗
  // ║  TITLE: "CERTIFICATE"                         ║
  // ╚═══════════════════════════════════════════════╝
  let ty = headY - 52;

  ctxt(page, "CERTIFICATE", ty, timesB, 36, C.ink);
  ty -= 22;

  // Subtitle with spaced letters
  const subText = isWinner ? "O F   A C H I E V E M E N T" : "O F   P A R T I C I P A T I O N";
  ctxt(page, subText, ty, helvB, 9, C.gold);
  ty -= 14;

  // Ornamental divider under title
  drawOrnamentalDivider(page, ty, 320, C.gold, 0.55);
  ty -= 26;

  // ╔═══════════════════════════════════════════════╗
  // ║  "PROUDLY PRESENTED TO"                       ║
  // ╚═══════════════════════════════════════════════╝
  ctxt(page, "PROUDLY PRESENTED TO", ty, helv, 8.5, C.inkMuted);
  ty -= 38;

  // ╔═══════════════════════════════════════════════╗
  // ║  RECIPIENT NAME (large, elegant, gold)        ║
  // ╚═══════════════════════════════════════════════╝
  const rName = config.recipientName || "Recipient Name";
  ctxt(page, rName, ty, timesBi, 32, C.goldDark);

  // Decorative underline with end dots
  const nw = timesBi.widthOfTextAtSize(rName, 32);
  const nx = (W - nw) / 2;
  ty -= 8;
  page.drawLine({ start: { x: nx - 10, y: ty }, end: { x: nx + nw + 10, y: ty }, thickness: 1, color: C.gold, opacity: 0.5 });
  // End dots
  page.drawCircle({ x: nx - 14, y: ty, size: 2, color: C.gold, opacity: 0.5 });
  page.drawCircle({ x: nx + nw + 14, y: ty, size: 2, color: C.gold, opacity: 0.5 });
  ty -= 24;

  // ╔═══════════════════════════════════════════════╗
  // ║  DESCRIPTION TEXT                              ║
  // ╚═══════════════════════════════════════════════╝
  ctxt(page, "for exceptional dedication and outstanding performance in", ty, timesI, 10, C.inkSoft);
  ty -= 22;

  // Event name (bold, larger)
  const evName = (config.eventName || "Event").toUpperCase();
  ctxt(page, evName, ty, helvB, 13, C.ink);
  ty -= 20;

  // Position (for winners)
  if (isWinner && config.position) {
    ctxt(page, `— ${config.position.toUpperCase()} PLACE —`, ty, helvB, 9.5, C.gold);
    ty -= 18;
  }

  // Affiliation
  ctxt(page, `organized by TechTatva, Chandigarh University  ·  ${config.eventDate}`, ty, times, 9, C.inkMuted);
  ty -= 14;
  ctxt(page, "Your enthusiasm and commitment made this event a success.", ty, timesI, 8.5, C.inkMuted, 0.8);

  // ╔═══════════════════════════════════════════════╗
  // ║  ORNAMENTAL DIVIDER ABOVE SIGNATURES          ║
  // ╚═══════════════════════════════════════════════╝
  const sigDivY = 128;
  drawOrnamentalDivider(page, sigDivY, W - 160, C.gold, 0.35);

  // ╔═══════════════════════════════════════════════╗
  // ║  SIGNATURES                                    ║
  // ╚═══════════════════════════════════════════════╝
  const sigBaseY = 60;
  const sigCol1 = W * 0.22;
  const sigCol3 = W * 0.78;

  // Left signature
  const drawSig = (cx: number, name: string, role: string) => {
    const lw = 120;
    const ly = sigBaseY + 30;
    page.drawLine({ start: { x: cx - lw / 2, y: ly }, end: { x: cx + lw / 2, y: ly }, thickness: 0.5, color: C.inkMuted, opacity: 0.5 });
    // End dots on signature line
    page.drawCircle({ x: cx - lw / 2, y: ly, size: 1.2, color: C.gold, opacity: 0.6 });
    page.drawCircle({ x: cx + lw / 2, y: ly, size: 1.2, color: C.gold, opacity: 0.6 });

    if (name) {
      const tw = timesI.widthOfTextAtSize(name, 11);
      page.drawText(name, { x: cx - tw / 2, y: ly + 6, size: 11, font: timesI, color: C.ink });
    }
    const rw = helvB.widthOfTextAtSize(role.toUpperCase(), 6);
    page.drawText(role.toUpperCase(), { x: cx - rw / 2, y: sigBaseY + 14, size: 6, font: helvB, color: C.inkMuted });
  };

  drawSig(sigCol1, config.hod || "", "Faculty Coordinator");
  drawSig(sigCol3, config.facultyAdvisor || "", "Core Team Lead");

  // ╔═══════════════════════════════════════════════╗
  // ║  CENTER SEAL (elaborate multi-ring rosette)   ║
  // ╚═══════════════════════════════════════════════╝
  drawElaborateSeal(page, CX, sigBaseY + 35, C.gold, C.navy, ttLogo);

  // ╔═══════════════════════════════════════════════╗
  // ║  BOTTOM DARK ACCENT BAR                       ║
  // ╚═══════════════════════════════════════════════╝
  const barH = 20;
  page.drawRectangle({ x: fw, y: fw, width: W - fw * 2, height: barH, color: C.navy });

  // Bottom bar text
  const bbY = fw + barH / 2 - 3;
  page.drawText("THANK YOU FOR BEING A PART OF THE JOURNEY.", { x: fw + 16, y: bbY, size: 6, font: helvB, color: C.gold, opacity: 0.85 });

  // Tagline right
  const tag = "POWERING IDEAS. CELEBRATING EXCELLENCE.";
  const tagW = helv.widthOfTextAtSize(tag, 5.5);
  page.drawText(tag, { x: W - fw - 16 - tagW, y: bbY, size: 5.5, font: helv, color: C.goldLight, opacity: 0.6 });

  // Certificate number (top-right corner, subtle)
  if (config.certNumber) {
    const cn = `No. ${config.certNumber}`;
    const cnW = helv.widthOfTextAtSize(cn, 6);
    page.drawText(cn, { x: W - 40 - cnW, y: H - 48, size: 6, font: helv, color: C.inkMuted, opacity: 0.4 });
  }

  return await doc.save();
}

// ═══════════════════════════════════════════════════
//  PUBLIC API
// ═══════════════════════════════════════════════════

export async function renderCertificatePdf(kind: CertificateKind, config: CertificateConfig): Promise<Uint8Array> {
  return buildCertificatePdf(kind, config);
}

export async function renderCertificatePdfs(jobs: CertificatePdfJob[]): Promise<Buffer[]> {
  if (!jobs.length) return [];
  const results: Buffer[] = [];
  const batchSize = 8;
  for (let i = 0; i < jobs.length; i += batchSize) {
    const batch = jobs.slice(i, i + batchSize);
    const br = await Promise.all(batch.map(async (j) => Buffer.from(await buildCertificatePdf(j.kind, j.config))));
    results.push(...br);
  }
  return results;
}

// ═══════════════════════════════════════════════════
//  ZIP UTILITY
// ═══════════════════════════════════════════════════

const crcTable = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buffer: Buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime(date = new Date()) {
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const d = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { time, date: d };
}

const u16 = (v: number) => { const b = Buffer.alloc(2); b.writeUInt16LE(v); return b; };
const u32 = (v: number) => { const b = Buffer.alloc(4); b.writeUInt32LE(v >>> 0); return b; };

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

  const cd = Buffer.concat(centrals);
  const end = Buffer.concat([
    u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length), u32(cd.length), u32(offset), u16(0)
  ]);
  return Buffer.concat([...locals, cd, end]);
}
