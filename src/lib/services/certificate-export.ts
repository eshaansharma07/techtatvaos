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
  navy:       rgb(15/255, 20/255, 35/255),
  navyMid:    rgb(22/255, 28/255, 48/255),
  goldDark:   rgb(155/255, 115/255, 45/255),
  gold:       rgb(195/255, 158/255, 82/255),
  goldMid:    rgb(212/255, 175/255, 100/255),
  goldLight:  rgb(230/255, 205/255, 145/255),
  goldPale:   rgb(248/255, 238/255, 210/255),
  cream:      rgb(253/255, 251/255, 247/255),
  creamWarm:  rgb(248/255, 244/255, 235/255),
  ink:        rgb(20/255, 25/255, 40/255),
  inkSoft:    rgb(55/255, 60/255, 78/255),
  inkMuted:   rgb(105/255, 110/255, 128/255),
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

/** Draw centered text */
function ctxt(page: PDFPage, text: string, y: number, font: PDFFont, size: number, color: RGB, opacity = 1) {
  const tw = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: Math.max((W - tw) / 2, 10), y, size, font, color, opacity });
}

// ═══════════════════════════════════════════════════
//  DECORATIVE DRAWING PRIMITIVES
// ═══════════════════════════════════════════════════

/** Diamond shape */
function drawDiamond(p: PDFPage, cx: number, cy: number, s: number, color: RGB, opacity = 1) {
  const pts = [{ x: cx, y: cy + s }, { x: cx + s, y: cy }, { x: cx, y: cy - s }, { x: cx - s, y: cy }];
  for (let i = 0; i < 4; i++) p.drawLine({ start: pts[i], end: pts[(i + 1) % 4], thickness: 0.6, color, opacity });
}

/** Filled diamond */
function drawFilledDiamond(p: PDFPage, cx: number, cy: number, s: number, color: RGB, opacity = 1) {
  // Fill with a small rotated rectangle approximation
  p.drawRectangle({ x: cx - s * 0.5, y: cy - s * 0.5, width: s, height: s, color, opacity, rotate: { type: 0, angle: 45 } as any });
  drawDiamond(p, cx, cy, s, color, opacity);
}

/** Elaborate corner ornament with arcs, dots, and flourishes */
function drawCornerOrnament(p: PDFPage, cx: number, cy: number, dx: number, dy: number, color: RGB) {
  // Main L-bracket (shortened to avoid overlapping logos)
  const len = 42;
  p.drawLine({ start: { x: cx, y: cy }, end: { x: cx + dx * len, y: cy }, thickness: 2, color, opacity: 0.7 });
  p.drawLine({ start: { x: cx, y: cy }, end: { x: cx, y: cy + dy * len }, thickness: 2, color, opacity: 0.7 });

  // Inner parallel lines
  const inset = 5;
  p.drawLine({ start: { x: cx + dx * inset, y: cy + dy * inset }, end: { x: cx + dx * (len - 6), y: cy + dy * inset }, thickness: 0.5, color, opacity: 0.45 });
  p.drawLine({ start: { x: cx + dx * inset, y: cy + dy * inset }, end: { x: cx + dx * inset, y: cy + dy * (len - 6) }, thickness: 0.5, color, opacity: 0.45 });

  // Corner dot cluster (flower pattern)
  p.drawCircle({ x: cx + dx * 3, y: cy + dy * 3, size: 3.5, color, opacity: 0.8 });
  // Petals
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI * 2) / 6;
    p.drawCircle({ x: cx + dx * 3 + Math.cos(angle) * 8, y: cy + dy * 3 + Math.sin(angle) * 8, size: 1.8, color, opacity: 0.5 });
  }

  // End decorations on the L
  p.drawCircle({ x: cx + dx * len, y: cy, size: 2, color, opacity: 0.6 });
  p.drawCircle({ x: cx, y: cy + dy * len, size: 2, color, opacity: 0.6 });

  // Diagonal flourish from corner
  const diagLen = 25;
  p.drawLine({ start: { x: cx + dx * 7, y: cy + dy * 7 }, end: { x: cx + dx * diagLen, y: cy + dy * diagLen }, thickness: 0.4, color, opacity: 0.3 });
  // Dots along diagonal
  for (let i = 1; i <= 3; i++) {
    const t = i / 4;
    p.drawCircle({ x: cx + dx * (7 + (diagLen - 7) * t), y: cy + dy * (7 + (diagLen - 7) * t), size: 1, color, opacity: 0.35 });
  }

  // Scrollwork arcs (small crescents) using dot chains
  for (let i = 0; i < 6; i++) {
    const angle = (dy > 0 ? 0 : Math.PI) + (dx > 0 ? 0 : Math.PI) + (i * Math.PI / 16);
    p.drawCircle({
      x: cx + dx * 3 + Math.cos(angle) * (14 + i * 1.3),
      y: cy + dy * 3 + Math.sin(angle) * (14 + i * 1.3),
      size: 0.7, color, opacity: 0.3,
    });
  }
}

/** Ornamental divider with diamond center and dot accents */
function drawDivider(p: PDFPage, y: number, width: number, color: RGB, opacity = 0.6) {
  const left = CX - width / 2;
  const right = CX + width / 2;

  // Main lines
  p.drawLine({ start: { x: left, y }, end: { x: CX - 12, y }, thickness: 0.7, color, opacity });
  p.drawLine({ start: { x: CX + 12, y }, end: { x: right, y }, thickness: 0.7, color, opacity });

  // Center diamond
  drawDiamond(p, CX, y, 5, color, opacity);
  p.drawCircle({ x: CX, y, size: 1.5, color, opacity });

  // End diamonds
  drawDiamond(p, left, y, 3, color, opacity * 0.7);
  drawDiamond(p, right, y, 3, color, opacity * 0.7);

  // Intermediate dots
  const dotPositions = [0.2, 0.4, 0.6, 0.8];
  dotPositions.forEach(t => {
    p.drawCircle({ x: left + (CX - 12 - left) * t, y, size: 0.8, color, opacity: opacity * 0.5 });
    p.drawCircle({ x: CX + 12 + (right - CX - 12) * t, y, size: 0.8, color, opacity: opacity * 0.5 });
  });
}

/** Sunburst rays from center */
function drawSunburst(p: PDFPage, cx: number, cy: number, r1: number, r2: number, count: number, color: RGB, opacity: number) {
  for (let i = 0; i < count; i++) {
    const a = (i * Math.PI * 2) / count;
    p.drawLine({
      start: { x: cx + Math.cos(a) * r1, y: cy + Math.sin(a) * r1 },
      end: { x: cx + Math.cos(a) * r2, y: cy + Math.sin(a) * r2 },
      thickness: 0.3, color, opacity,
    });
  }
}

/** Laurel leaf cluster (arc of small ellipses) */
function drawLaurelArc(p: PDFPage, cx: number, cy: number, radius: number, startAngle: number, endAngle: number, count: number, color: RGB, opacity: number) {
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const angle = startAngle + t * (endAngle - startAngle);
    const lx = cx + Math.cos(angle) * radius;
    const ly = cy + Math.sin(angle) * radius;
    // Small leaf shape using overlapping circles
    p.drawCircle({ x: lx, y: ly, size: 3.5, color, opacity: opacity * 0.6 });
    p.drawCircle({ x: lx + Math.cos(angle) * 2, y: ly + Math.sin(angle) * 2, size: 2, color, opacity: opacity * 0.4 });
  }
}

/** Multi-ring elaborate seal */
function drawSeal(p: PDFPage, cx: number, cy: number, color: RGB, dark: RGB, ttLogo: any) {
  // Outer scalloped edge
  const scallops = 32;
  for (let i = 0; i < scallops; i++) {
    const a = (i * Math.PI * 2) / scallops;
    p.drawCircle({ x: cx + Math.cos(a) * 44, y: cy + Math.sin(a) * 44, size: 9, color, opacity: 0.75 });
  }
  // Solid background
  p.drawCircle({ x: cx, y: cy, size: 46, color, opacity: 0.9 });

  // Ring decorations
  drawSunburst(p, cx, cy, 32, 42, 48, dark, 0.12);

  p.drawCircle({ x: cx, y: cy, size: 40, borderColor: dark, borderWidth: 1, opacity: 0, borderOpacity: 0.35 });
  p.drawCircle({ x: cx, y: cy, size: 36, borderColor: C.goldLight, borderWidth: 1.5, opacity: 0, borderOpacity: 0.7 });

  // Dark inner
  p.drawCircle({ x: cx, y: cy, size: 32, color: dark });
  p.drawCircle({ x: cx, y: cy, size: 29, borderColor: color, borderWidth: 1.2, opacity: 0, borderOpacity: 0.8 });

  // Gold inner disc
  p.drawCircle({ x: cx, y: cy, size: 25, color });

  // Dot ring
  for (let i = 0; i < 16; i++) {
    const a = (i * Math.PI * 2) / 16;
    p.drawCircle({ x: cx + Math.cos(a) * 21, y: cy + Math.sin(a) * 21, size: 1, color: dark, opacity: 0.4 });
  }

  // Logo
  if (ttLogo) {
    p.drawImage(ttLogo, { x: cx - 16, y: cy - 16, width: 32, height: 32 });
  }

  // Text around seal
  const sealText = "TECH TATVA";
  const charSpread = Math.PI * 0.6;
  const startA = Math.PI / 2 + charSpread / 2;
  for (let i = 0; i < sealText.length; i++) {
    const a = startA - (i / (sealText.length - 1)) * charSpread;
    const tx = cx + Math.cos(a) * 38;
    const ty = cy + Math.sin(a) * 38;
    p.drawCircle({ x: tx, y: ty, size: 0.6, color: dark, opacity: 0.3 });
  }
}

/** Decorative side accent (vertical line pattern) */
function drawSideAccent(p: PDFPage, x: number, yStart: number, yEnd: number, color: RGB) {
  p.drawLine({ start: { x, y: yStart }, end: { x, y: yEnd }, thickness: 0.3, color, opacity: 0.15 });
  // Dots along the line
  const count = Math.floor((yEnd - yStart) / 12);
  for (let i = 0; i <= count; i++) {
    const y = yStart + (i / count) * (yEnd - yStart);
    p.drawCircle({ x, y, size: 1, color, opacity: 0.12 });
  }
}

/** Background geometric lattice pattern */
function drawLatticePattern(p: PDFPage, x1: number, y1: number, x2: number, y2: number, spacing: number, color: RGB, opacity: number) {
  // Diagonal lines going one way
  for (let x = x1; x <= x2 + (y2 - y1); x += spacing) {
    const sx = Math.max(x, x1);
    const sy = y1 + (sx - x);
    const ey = Math.min(y2, y1 + (x2 - x + (y2 - y1)));
    const ex = x - (ey - y1) + (sx - x1 ? sx - x1 : 0);
    if (sy < y2 && ey > y1) {
      p.drawLine({ start: { x: Math.max(x1, x), y: y1 }, end: { x: Math.max(x1, x - (y2 - y1)), y: y2 }, thickness: 0.15, color, opacity });
    }
  }
}

// ═══════════════════════════════════════════════════
//  MAIN PDF BUILDER
// ═══════════════════════════════════════════════════

async function buildCertificatePdf(kind: CertificateKind, config: CertificateConfig): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([W, H]);

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

  // ╔═══════════════════════════════════════════════════════╗
  // ║  LAYER 1: DARK NAVY BACKGROUND                       ║
  // ╚═══════════════════════════════════════════════════════╝
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C.navy });

  // ╔═══════════════════════════════════════════════════════╗
  // ║  LAYER 2: THICK GOLD OUTER BORDER                     ║
  // ╚═══════════════════════════════════════════════════════╝
  page.drawRectangle({ x: 8, y: 8, width: W - 16, height: H - 16, borderColor: C.gold, borderWidth: 3, opacity: 0, borderOpacity: 0.9 });

  // ╔═══════════════════════════════════════════════════════╗
  // ║  LAYER 3: THIN GOLD PINSTRIPE                         ║
  // ╚═══════════════════════════════════════════════════════╝
  page.drawRectangle({ x: 14, y: 14, width: W - 28, height: H - 28, borderColor: C.goldMid, borderWidth: 0.6, opacity: 0, borderOpacity: 0.7 });

  // ╔═══════════════════════════════════════════════════════╗
  // ║  LAYER 4: CREAM CANVAS                                ║
  // ╚═══════════════════════════════════════════════════════╝
  const fw = 18;
  page.drawRectangle({ x: fw, y: fw, width: W - fw * 2, height: H - fw * 2, color: C.cream });

  // ╔═══════════════════════════════════════════════════════╗
  // ║  LAYER 5: INNER DOUBLE GOLD BORDER                    ║
  // ╚═══════════════════════════════════════════════════════╝
  const ib = 28;
  page.drawRectangle({ x: ib, y: ib, width: W - ib * 2, height: H - ib * 2, borderColor: C.gold, borderWidth: 1.5, opacity: 0, borderOpacity: 0.55 });
  page.drawRectangle({ x: ib + 5, y: ib + 5, width: W - (ib + 5) * 2, height: H - (ib + 5) * 2, borderColor: C.goldMid, borderWidth: 0.4, opacity: 0, borderOpacity: 0.35 });

  // ╔═══════════════════════════════════════════════════════╗
  // ║  DIAMOND CHAIN BORDERS (all 4 edges)                  ║
  // ╚═══════════════════════════════════════════════════════╝
  const dOff = 31;
  const dSpacing = 16;
  for (let x = dOff + 16; x < W - dOff - 16; x += dSpacing) {
    drawDiamond(page, x, H - dOff, 2.8, C.gold, 0.4);
    drawDiamond(page, x, dOff, 2.8, C.gold, 0.4);
  }
  for (let y = dOff + 16; y < H - dOff - 16; y += dSpacing) {
    drawDiamond(page, dOff, y, 2.8, C.gold, 0.4);
    drawDiamond(page, W - dOff, y, 2.8, C.gold, 0.4);
  }

  // ╔═══════════════════════════════════════════════════════╗
  // ║  CORNER ORNAMENTS (elaborate flourishes)              ║
  // ╚═══════════════════════════════════════════════════════╝
  const co = 36;
  drawCornerOrnament(page, co, co, 1, 1, C.gold);
  drawCornerOrnament(page, W - co, co, -1, 1, C.gold);
  drawCornerOrnament(page, co, H - co, 1, -1, C.gold);
  drawCornerOrnament(page, W - co, H - co, -1, -1, C.gold);

  // ╔═══════════════════════════════════════════════════════╗
  // ║  SIDE ACCENT LINES                                    ║
  // ╚═══════════════════════════════════════════════════════╝
  drawSideAccent(page, 50, 120, H - 120, C.goldMid);
  drawSideAccent(page, W - 50, 120, H - 120, C.goldMid);

  // ╔═══════════════════════════════════════════════════════╗
  // ║  BACKGROUND: SUNBURST RAYS (3 layers)                 ║
  // ╚═══════════════════════════════════════════════════════╝
  drawSunburst(page, CX, CY, 60, 280, 96, C.goldPale, 0.07);
  drawSunburst(page, CX, CY, 50, 180, 48, C.creamWarm, 0.09);
  drawSunburst(page, CX, CY, 40, 120, 24, C.goldLight, 0.05);

  // ╔═══════════════════════════════════════════════════════╗
  // ║  BACKGROUND: CONCENTRIC WATERMARK RINGS               ║
  // ╚═══════════════════════════════════════════════════════╝
  for (let r = 35; r <= 260; r += 25) {
    page.drawCircle({ x: CX, y: CY, size: r, borderColor: C.goldMid, borderWidth: 0.2, opacity: 0, borderOpacity: 0.04 });
  }

  // ╔═══════════════════════════════════════════════════════╗
  // ║  BACKGROUND: LATTICE PATTERN                          ║
  // ╚═══════════════════════════════════════════════════════╝
  // Subtle diagonal lattice across the entire canvas
  for (let x = fw; x < W - fw; x += 40) {
    page.drawLine({ start: { x, y: fw }, end: { x: x + H, y: H - fw }, thickness: 0.1, color: C.goldPale, opacity: 0.04 });
    page.drawLine({ start: { x, y: H - fw }, end: { x: x + H, y: fw }, thickness: 0.1, color: C.goldPale, opacity: 0.04 });
  }

  // ╔═══════════════════════════════════════════════════════╗
  // ║  BACKGROUND: WATERMARK LOGO                           ║
  // ╚═══════════════════════════════════════════════════════╝
  if (ttLogo) {
    page.drawImage(ttLogo, { x: CX - 110, y: CY - 110, width: 220, height: 220, opacity: 0.035 });
  }

  // ╔═══════════════════════════════════════════════════════╗
  // ║  HEADER SECTION (positioned to avoid corner ornaments)║
  // ╚═══════════════════════════════════════════════════════╝
  const headY = H - 70;

  // Tech Tatva Logo + name (top left, pushed inward to clear corner ornaments)
  if (ttLogo) page.drawImage(ttLogo, { x: 90, y: headY + 2, width: 30, height: 30 });
  page.drawText("TechTatva", { x: 126, y: headY + 20, size: 11, font: helvB, color: C.ink });
  page.drawText("CHANDIGARH UNIVERSITY", { x: 126, y: headY + 8, size: 6.5, font: helv, color: C.inkMuted });

  // CU Logo (top right, scaled down to avoid overlapping)
  if (cuLogo) page.drawImage(cuLogo, { x: W - 150, y: headY + 6, width: 70, height: 22 });

  // Event Logo (far right, smaller)
  if (eventLogo) page.drawImage(eventLogo, { x: W - 72, y: headY + 2, width: 28, height: 28 });

  // Header divider
  drawDivider(page, headY - 14, W - 180, C.gold, 0.5);

  // ╔═══════════════════════════════════════════════════════╗
  // ║  TITLE: "CERTIFICATE"  (large, spaced out)            ║
  // ╚═══════════════════════════════════════════════════════╝
  let ty = headY - 62;
  ctxt(page, "CERTIFICATE", ty, timesB, 42, C.ink);
  ty -= 26;

  // Category subtitle
  const subText = isWinner ? "O F    A C H I E V E M E N T" : "O F    P A R T I C I P A T I O N";
  ctxt(page, subText, ty, helvB, 10, C.gold);
  ty -= 16;

  // Divider under title
  drawDivider(page, ty, 350, C.gold, 0.5);
  ty -= 36;

  // ╔═══════════════════════════════════════════════════════╗
  // ║  "THIS IS PROUDLY PRESENTED TO"                       ║
  // ╚═══════════════════════════════════════════════════════╝
  ctxt(page, "THIS IS PROUDLY PRESENTED TO", ty, helv, 9, C.inkMuted);
  ty -= 48;

  // ╔═══════════════════════════════════════════════════════╗
  // ║  RECIPIENT NAME (large, elegant, gold italic)         ║
  // ╚═══════════════════════════════════════════════════════╝
  const rName = config.recipientName || "Recipient Name";
  ctxt(page, rName, ty, timesBi, 38, C.goldDark);

  // Decorative underline with end ornaments
  const nw = timesBi.widthOfTextAtSize(rName, 38);
  const nx = (W - nw) / 2;
  ty -= 10;

  // Main underline
  page.drawLine({ start: { x: nx - 20, y: ty }, end: { x: nx + nw + 20, y: ty }, thickness: 1.2, color: C.gold, opacity: 0.55 });
  // Thin parallel line
  page.drawLine({ start: { x: nx - 10, y: ty - 4 }, end: { x: nx + nw + 10, y: ty - 4 }, thickness: 0.3, color: C.goldMid, opacity: 0.35 });

  // End ornament dots
  page.drawCircle({ x: nx - 24, y: ty, size: 3, color: C.gold, opacity: 0.55 });
  page.drawCircle({ x: nx + nw + 24, y: ty, size: 3, color: C.gold, opacity: 0.55 });
  page.drawCircle({ x: nx - 30, y: ty, size: 1.5, color: C.gold, opacity: 0.35 });
  page.drawCircle({ x: nx + nw + 30, y: ty, size: 1.5, color: C.gold, opacity: 0.35 });

  ty -= 32;

  // ╔═══════════════════════════════════════════════════════╗
  // ║  DESCRIPTION TEXT                                      ║
  // ╚═══════════════════════════════════════════════════════╝
  ctxt(page, "for exceptional dedication and outstanding performance in", ty, timesI, 11, C.inkSoft);
  ty -= 28;

  // Event name
  const evName = (config.eventName || "Event").toUpperCase();
  ctxt(page, evName, ty, helvB, 15, C.ink);
  ty -= 24;

  // Position for winners (FIXED: no duplicate "PLACE")
  if (isWinner && config.position) {
    const posText = config.position.toUpperCase();
    ctxt(page, `—  ${posText}  —`, ty, helvB, 10, C.gold);
    ty -= 20;
  }

  // Affiliation
  ctxt(page, `Organized by TechTatva, Chandigarh University`, ty, times, 10, C.inkMuted);
  ty -= 16;
  ctxt(page, config.eventDate || "", ty, times, 9, C.inkMuted, 0.8);
  ty -= 22;

  // Divider before signatures
  drawDivider(page, ty, W - 180, C.gold, 0.35);

  // ╔═══════════════════════════════════════════════════════╗
  // ║  LAUREL ARCS (flanking the seal area)                 ║
  // ╚═══════════════════════════════════════════════════════╝
  const sealCY = 88;
  drawLaurelArc(page, CX, sealCY, 65, Math.PI * 0.6, Math.PI * 0.9, 6, C.gold, 0.35);
  drawLaurelArc(page, CX, sealCY, 65, Math.PI * 0.1, Math.PI * 0.4, 6, C.gold, 0.35);

  // ╔═══════════════════════════════════════════════════════╗
  // ║  SIGNATURES                                            ║
  // ╚═══════════════════════════════════════════════════════╝
  const sigY = 52;
  const sCol1 = W * 0.22;
  const sCol3 = W * 0.78;

  const drawSig = (cx: number, name: string, roleLines: string[]) => {
    const lw = 130;
    const ly = sigY + 38;
    page.drawLine({ start: { x: cx - lw / 2, y: ly }, end: { x: cx + lw / 2, y: ly }, thickness: 0.6, color: C.inkMuted, opacity: 0.4 });
    page.drawCircle({ x: cx - lw / 2, y: ly, size: 1.5, color: C.gold, opacity: 0.5 });
    page.drawCircle({ x: cx + lw / 2, y: ly, size: 1.5, color: C.gold, opacity: 0.5 });

    if (name) {
      const tw = timesI.widthOfTextAtSize(name, 11);
      page.drawText(name, { x: cx - tw / 2, y: ly + 7, size: 11, font: timesI, color: C.ink });
    }
    // Multi-line role labels
    roleLines.forEach((line, idx) => {
      const rw = helvB.widthOfTextAtSize(line.toUpperCase(), 5.5);
      page.drawText(line.toUpperCase(), { x: cx - rw / 2, y: sigY + 24 - idx * 8, size: 5.5, font: helvB, color: C.inkMuted });
    });
  };

  drawSig(sCol1, config.hod || "", ["Faculty Coordinator"]);
  drawSig(sCol3, config.facultyAdvisor || "", ["Head of Department", "AIT-CSE, Chandigarh University"]);

  // ╔═══════════════════════════════════════════════════════╗
  // ║  CENTER SEAL (elaborate multi-ring with scallops)      ║
  // ╚═══════════════════════════════════════════════════════╝
  drawSeal(page, CX, sealCY, C.gold, C.navy, ttLogo);

  // ╔═══════════════════════════════════════════════════════╗
  // ║  BOTTOM DARK ACCENT BAR                               ║
  // ╚═══════════════════════════════════════════════════════╝
  const barH = 18;
  page.drawRectangle({ x: fw, y: fw, width: W - fw * 2, height: barH, color: C.navy });

  const bbY = fw + barH / 2 - 3;
  page.drawText("THANK YOU FOR BEING A PART OF THE JOURNEY.", { x: fw + 14, y: bbY, size: 5.5, font: helvB, color: C.gold, opacity: 0.85 });
  const tag = "POWERING IDEAS  ·  CELEBRATING EXCELLENCE";
  const tagW = helv.widthOfTextAtSize(tag, 5);
  page.drawText(tag, { x: W - fw - 14 - tagW, y: bbY, size: 5, font: helv, color: C.goldLight, opacity: 0.6 });

  // Certificate number (subtle, moved below header to avoid logo overlap)
  if (config.certNumber) {
    const cn = `No. ${config.certNumber}`;
    const cnW = helv.widthOfTextAtSize(cn, 5.5);
    page.drawText(cn, { x: W - 50 - cnW, y: headY - 10, size: 5.5, font: helv, color: C.inkMuted, opacity: 0.3 });
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
