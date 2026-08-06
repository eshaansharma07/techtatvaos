import { NextRequest, NextResponse } from "next/server";
import { adminResources, deleteResource, updateResource, type AdminResource } from "@/lib/admin-api";
import { connectDB } from "@/lib/db";
import { audit, requirePortal } from "@/lib/portal";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ resource: string; id: string }> }) {
  const blocked = await requirePortal(req);
  if (blocked) return blocked;
  const { resource, id } = await params;
  if (!adminResources.includes(resource as AdminResource)) return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  try {
    await connectDB();
    const result = await updateResource(resource as AdminResource, id, await req.json());
    await audit(req, `portal.${resource}.update`, { entityType: resource, entityId: id });
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Admin PATCH error:", err);
    return NextResponse.json({ error: err?.message || "Failed to update resource" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ resource: string; id: string }> }) {
  const blocked = await requirePortal(req);
  if (blocked) return blocked;
  const { resource, id } = await params;
  if (!adminResources.includes(resource as AdminResource)) return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  try {
    await connectDB();
    const result = await deleteResource(resource as AdminResource, id);
    await audit(req, `portal.${resource}.delete`, { entityType: resource, entityId: id });
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Admin DELETE error:", err);
    return NextResponse.json({ error: err?.message || "Failed to delete resource" }, { status: 400 });
  }
}
