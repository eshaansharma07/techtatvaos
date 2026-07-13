import { PublicShell } from "@/components/public-shell";
import { getRecruitmentPublicData } from "@/lib/public-data";
import { RecruitmentClient } from "./recruitment-client";

export const revalidate = 10;

export default async function RecruitmentPage() {
  const data = await getRecruitmentPublicData();
  return (
    <PublicShell>
      <RecruitmentClient data={data} />
    </PublicShell>
  );
}
