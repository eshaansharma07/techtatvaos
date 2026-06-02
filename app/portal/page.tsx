import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getAdminDashboardData } from "@/lib/public-data";
import { PortalClient } from "./portal-client";
import { portalRoles } from "@/lib/portal";

export const dynamic = "force-dynamic";

export default async function Portal() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session) redirect("/login?callbackUrl=/portal");
  if (!role || !portalRoles.has(role)) redirect("/login");
  const data = await getAdminDashboardData();
  return <PortalClient initialData={data} userName={session.user?.name || "Operator"} />;
}
