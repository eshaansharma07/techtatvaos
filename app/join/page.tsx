import { getMembershipDriveStatus } from "@/lib/public-data";
import { PublicShell } from "@/components/public-shell";
import { JoinClient } from "./join-client";

export const dynamic = "force-dynamic";

export default async function JoinPage() {
  const status = await getMembershipDriveStatus();
  return (
    <PublicShell>
      <JoinClient initialStatus={status} />
    </PublicShell>
  );
}
