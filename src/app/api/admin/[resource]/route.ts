import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createResource, adminResources, type AdminResource } from "@/lib/admin-api";
import { connectDB } from "@/lib/db";
import { getAdminDashboardData } from "@/lib/public-data";
import { audit, requirePortal, requireRole } from "@/lib/portal";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const LEAD_ALLOWED_RESOURCES = ["events", "tasks", "meetings", "gallery", "attendance"];

export async function GET(req: NextRequest) {
  const blocked = await requirePortal(req);
  if (blocked) return blocked;
  const res = NextResponse.json(await getAdminDashboardData());
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  return res;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params;
  
  // Enforce granular RBAC
  const allowedRoles = LEAD_ALLOWED_RESOURCES.includes(resource) ? ["super_admin", "president", "vice_president", "secretary", "team_lead"] : ["super_admin", "president", "vice_president", "secretary"];
  const blocked = await requireRole(req, allowedRoles);
  if (blocked) return blocked;
  
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  
  if (!adminResources.includes(resource as AdminResource)) return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  try {
    await connectDB();
    const result = await createResource(resource as AdminResource, await req.json(), (session.user as { id?: string }).id);
    await audit(req, `portal.${resource}.create`, { entityType: resource, entityId: (result as any)?._id });
    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    console.error("Admin POST error:", err);
    return NextResponse.json({ error: err?.message || "Failed to create resource" }, { status: 400 });
  }
}
