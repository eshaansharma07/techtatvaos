import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { PortalInvite, Role, Team } from "@/lib/models";
import { audit, hashToken, isPortalHost, portalUrl, requirePortal } from "@/lib/portal";

export async function POST(req: NextRequest) {
  const blocked = await requirePortal(req);
  if (blocked) return blocked;
  const body = await req.json();
  const email = String(body.email || "").trim().toLowerCase();
  if (!email || !email.includes("@")) return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  await connectDB();
  const token = crypto.randomBytes(32).toString("base64url");
  const role = body.role ? await Role.findOne({ slug: body.role }) : null;
  const team = body.team ? await Team.findById(body.team) : null;
  const invite = await PortalInvite.create({
    email,
    role: role?._id,
    team: team?._id,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
  });
  await audit(req, "portal.invites.create", { entityType: "portalInvites", entityId: invite._id, email });
  return NextResponse.json({
    id: String(invite._id),
    email,
    inviteUrl: portalUrl(`/invite/accept?token=${token}`)
  }, { status: 201 });
}

export async function GET(req: NextRequest) {
  if (!isPortalHost(req)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const blocked = await requirePortal(req);
  if (blocked) return blocked;
  await connectDB();
  const invites = await PortalInvite.find({ revokedAt: null, acceptedAt: null }).select("email expiresAt createdAt").sort({ createdAt: -1 }).limit(100).lean();
  return NextResponse.json(invites);
}
