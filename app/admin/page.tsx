import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getAdminDashboardData } from "@/lib/public-data";
import { AdminClient } from "./admin-client";

export const dynamic = "force-dynamic";

const allowedRoles = new Set(["super_admin", "president", "vice_president", "secretary", "team_lead"]);

export default async function Admin() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session) redirect("/login?callbackUrl=/admin");
  if (!role || !allowedRoles.has(role)) redirect("/");
  const data = await getAdminDashboardData();
  return <AdminClient initialData={data} userName={session.user?.name || "Admin"} />;
}
