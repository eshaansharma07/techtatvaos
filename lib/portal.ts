import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { ActivityLog } from "@/lib/models";
import { hostOf, isPortalHost, portalUrl } from "@/lib/portal-host";

export const portalRoles = new Set(["super_admin", "president", "vice_president", "secretary", "team_lead"]);
export { hostOf, isPortalHost, portalUrl };

export async function requirePortal(req: NextRequest) {
  if (!isPortalHost(req)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || !role || !portalRoles.has(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return null;
}

export async function audit(req: NextRequest, action: string, metadata: Record<string, unknown> = {}) {
  try {
    const session = await auth();
    await connectDB();
    await ActivityLog.create({
      actor: (session?.user as { id?: string })?.id || undefined,
      action,
      entityType: String(metadata.entityType || ""),
      entityId: metadata.entityId,
      metadata,
      ip: req.headers.get("x-forwarded-for") || "",
      userAgent: req.headers.get("user-agent") || ""
    });
  } catch {
    // Audit logging must not break the primary operation.
  }
}

function base32ToBuffer(secret: string) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const char of secret.replace(/=+$/g, "").toUpperCase()) {
    const value = alphabet.indexOf(char);
    if (value < 0) continue;
    bits += value.toString(2).padStart(5, "0");
  }
  const bytes = bits.match(/.{1,8}/g)?.filter((byte) => byte.length === 8).map((byte) => parseInt(byte, 2)) || [];
  return Buffer.from(bytes);
}

function hotp(secret: string, counter: number) {
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64BE(BigInt(counter));
  const hmac = crypto.createHmac("sha1", base32ToBuffer(secret)).update(buffer).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const code = ((hmac[offset] & 0x7f) << 24) | ((hmac[offset + 1] & 0xff) << 16) | ((hmac[offset + 2] & 0xff) << 8) | (hmac[offset + 3] & 0xff);
  return String(code % 1_000_000).padStart(6, "0");
}

export function verifyTotp(secret: string, code: string) {
  const cleaned = code.replace(/\s/g, "");
  const counter = Math.floor(Date.now() / 30_000);
  return [-1, 0, 1].some((window) => hotp(secret, counter + window) === cleaned);
}

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
