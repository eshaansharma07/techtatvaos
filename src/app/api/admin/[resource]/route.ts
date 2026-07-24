import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createResource, adminResources, type AdminResource } from "@/lib/admin-api";
import { connectDB } from "@/lib/db";
import { getAdminDashboardData } from "@/lib/public-data";
import { audit, requirePortal } from "@/lib/portal";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const blocked = await requirePortal(req);
  if (blocked) return blocked;
  const res = NextResponse.json(await getAdminDashboardData());
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  return res;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ resource: string }> }) {
  try {
    const blocked = await requirePortal(req);
    if (blocked) return blocked;
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { resource } = await params;
    if (!adminResources.includes(resource as AdminResource)) return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
    await connectDB();
    const result = await createResource(resource as AdminResource, await req.json(), (session.user as { id?: string }).id);
    await audit(req, `portal.${resource}.create`, { entityType: resource, entityId: (result as any)?._id });
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to create record" }, { status: 400 });
  }
}
