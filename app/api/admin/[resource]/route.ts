import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createResource, adminResources, type AdminResource } from "@/lib/admin-api";
import { connectDB } from "@/lib/db";
import { getAdminDashboardData } from "@/lib/public-data";

const allowedRoles = new Set(["super_admin", "president", "vice_president", "secretary", "team_lead"]);

async function guard() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!role || !allowedRoles.has(role)) return null;
  return session;
}

export async function GET(_: NextRequest) {
  if (!(await guard())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return NextResponse.json(await getAdminDashboardData());
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ resource: string }> }) {
  const session = await guard();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { resource } = await params;
  if (!adminResources.includes(resource as AdminResource)) return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  await connectDB();
  const result = await createResource(resource as AdminResource, await req.json(), (session.user as { id?: string }).id);
  return NextResponse.json(result, { status: 201 });
}
