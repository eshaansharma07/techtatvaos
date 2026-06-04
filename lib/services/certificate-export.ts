import { readFileSync } from "fs";
import path from "path";
import chromiumPackage from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

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

type CertificatePdfJob = {
  kind: CertificateKind;
  config: CertificateConfig;
};

const templateCache = new Map<CertificateKind, string>();
const chromium = ((chromiumPackage as any).default || chromiumPackage) as typeof chromiumPackage;

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

export async function renderCertificatePdf(kind: CertificateKind, config: CertificateConfig) {
  const [pdf] = await renderCertificatePdfs([{ kind, config }]);
  return pdf;
}

function printableCertificateHtml(kind: CertificateKind, config: CertificateConfig) {
  return renderCertificateHtml(kind, config).replace(
    "</style>",
    `@page { size: A4 landscape; margin: 0; }
@media print {
  html, body { width: 297mm; height: 210mm; margin: 0 !important; padding: 0 !important; background: #d0d4e0 !important; }
  body { display: flex !important; align-items: center !important; justify-content: center !important; }
  .cert { width: 297mm !important; height: 210mm !important; max-width: none !important; box-shadow: none !important; }
}
</style>`
  );
}

export async function renderCertificatePdfs(jobs: CertificatePdfJob[]) {
  if (!jobs.length) return [];
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: { width: 1600, height: 1131, deviceScaleFactor: 1 },
    executablePath: await chromium.executablePath(),
    headless: true
  });
  try {
    const pdfs: Buffer[] = [];
    for (const job of jobs) {
      const page = await browser.newPage();
      try {
        await page.setContent(printableCertificateHtml(job.kind, job.config), { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.emulateMediaType("print");
        const pdf = await page.pdf({
          format: "A4",
          landscape: true,
          printBackground: true,
          margin: { top: 0, right: 0, bottom: 0, left: 0 },
          preferCSSPageSize: true
        });
        pdfs.push(Buffer.from(pdf));
      } finally {
        await page.close().catch(() => undefined);
      }
    }
    return pdfs;
  } finally {
    await browser.close();
  }
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
