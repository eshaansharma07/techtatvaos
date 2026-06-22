import { PublicShell } from "@/components/public-shell";
import { getRecruitmentPublicData } from "@/lib/public-data";
import { RecruitmentClient } from "./recruitment-client";

export const dynamic = "force-dynamic";

export default async function RecruitmentPage() {
  const data = await getRecruitmentPublicData();
  return (
    <PublicShell>
      <RecruitmentClient data={data} />
    </PublicShell>
  );
}
