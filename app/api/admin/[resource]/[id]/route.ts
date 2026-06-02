import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { adminResources, deleteResource, updateResource, type AdminResource } from "@/lib/admin-api";
import { connectDB } from "@/lib/db";

const allowedRoles = new Set(["super_admin", "president", "vice_president", "secretary", "team_lead"]);

async function guard() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  return role && allowedRoles.has(role);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ resource: string; id: string }> }) {
  if (!(await guard())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { resource, id } = await params;
  if (!adminResources.includes(resource as AdminResource)) return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  await connectDB();
  const result = await updateResource(resource as AdminResource, id, await req.json());
  return NextResponse.json(result);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ resource: string; id: string }> }) {
  if (!(await guard())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { resource, id } = await params;
  if (!adminResources.includes(resource as AdminResource)) return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  await connectDB();
  const result = await deleteResource(resource as AdminResource, id);
  return NextResponse.json(result);
}
