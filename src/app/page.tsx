import { PublicShell } from "@/components/public-shell";
import { getPublicHomeData, getMembershipDriveStatus } from "@/lib/public-data";
import { HomeExperience } from "@/components/home-experience";

export const revalidate = 10;

export default async function Home() {
  const [homeData, driveStatus] = await Promise.all([
    getPublicHomeData(),
    getMembershipDriveStatus()
  ]);

  const { clubInfo, events, teams, achievements, gallery, stats } = homeData;
  const nextEvent = events && events.length > 0 ? events[0] : undefined;

  return (
    <PublicShell>
      <HomeExperience
        stats={stats}
        promptWarEvent={nextEvent}
        achievements={achievements}
        driveStatus={driveStatus}
        events={events}
        teams={teams}
        gallery={gallery}
        clubInfo={clubInfo}
      />
    </PublicShell>
  );
}
