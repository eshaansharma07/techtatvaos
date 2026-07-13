import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { PortalInvite, User } from "@/lib/models";
import { audit, hashToken, isPortalHost } from "@/lib/portal";

export async function POST(req: NextRequest) {
  if (!isPortalHost(req)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = await req.json();
  const token = String(body.token || "");
  const name = String(body.name || "").trim();
  const password = String(body.password || "");
  if (!token || name.length < 2 || password.length < 10) {
    return NextResponse.json({ error: "Valid invite token, name, and 10+ character password are required" }, { status: 400 });
  }

  await connectDB();
  const invite = await PortalInvite.findOne({
    tokenHash: hashToken(token),
    acceptedAt: null,
    revokedAt: null,
    expiresAt: { $gt: new Date() }
  }).select("+tokenHash");

  if (!invite) return NextResponse.json({ error: "Invite is invalid or expired" }, { status: 404 });

  const user = await User.findOneAndUpdate(
    { email: invite.email },
    {
      name,
      email: invite.email,
      role: invite.role,
      team: invite.team,
      status: "active",
      portalAccess: true,
      emailVerifiedAt: new Date(),
      inviteAcceptedAt: new Date(),
      passwordHash: await bcrypt.hash(password, 12)
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  invite.acceptedAt = new Date();
  invite.acceptedBy = user._id;
  await invite.save();
  await audit(req, "portal.invites.accept", { entityType: "users", entityId: user._id });

  return NextResponse.json({ ok: true });
}
