import { NextRequest, NextResponse } from "next/server";
import { adminResources, deleteResource, updateResource, type AdminResource } from "@/lib/admin-api";
import { connectDB } from "@/lib/db";
import { audit, requireRole } from "@/lib/portal";

const LEAD_ALLOWED_RESOURCES = ["events", "tasks", "meetings", "gallery", "attendance", "recruitmentApplications"];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ resource: string; id: string }> }) {
  const { resource, id } = await params;
  
  // Enforce granular RBAC
  const allowedRoles = LEAD_ALLOWED_RESOURCES.includes(resource) ? ["super_admin", "president", "vice_president", "secretary", "team_lead"] : ["super_admin", "president", "vice_president", "secretary"];
  const blocked = await requireRole(req, allowedRoles);
  if (blocked) return blocked;
  
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
  const { resource, id } = await params;

  // Enforce granular RBAC (only core admin can delete resources)
  const blocked = await requireRole(req, ["super_admin", "president", "vice_president", "secretary"]);
  if (blocked) return blocked;

  if (!adminResources.includes(resource as AdminResource)) return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  try {
    await connectDB();
    const result = await deleteResource(resource as AdminResource, id);
    await audit(req, `portal.${resource}.delete`, { entityType: resource, entityId: id });
    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    console.error("Admin DELETE error:", err);
    return NextResponse.json({ error: err?.message || "Failed to delete resource" }, { status: 400 });
  }
}
