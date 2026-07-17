import { Crown, Network, ShieldCheck, Sparkles, Users } from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { MobileTeamAccordion } from "@/components/mobile-team-accordion";
import { getClubInfo, getPublicTeams, type PublicTeam } from "@/lib/public-data";

export const revalidate = 60;

const creativeWords = ["design", "media", "creative", "content", "marketing", "social", "outreach", "sponsor", "photography", "video"];
const technicalColors = ["from-amber-500/22 to-emerald-400/10", "from-yellow-400/22 to-amber-500/10", "from-rose-500/22 to-red-500/10"];
const creativeColors = ["from-rose-400/22 to-orange-400/10", "from-fuchsia-500/22 to-purple-500/10", "from-pink-500/22 to-violet-500/10"];

function splitTeams(teams: PublicTeam[]) {
  const creative: PublicTeam[] = [];
  const technical: PublicTeam[] = [];
  teams.forEach((team) => {
    const text = `${team.name} ${team.description || ""}`.toLowerCase();
    if (team.jointSecretaryLane === "creative" || (!team.jointSecretaryLane && creativeWords.some((word) => text.includes(word)))) creative.push(team);
    else technical.push(team);
  });
  return { technical, creative };
}

function PersonNode({ label, name, sub, photo, tone = "violet" }: { label: string; name?: string; sub?: string; photo?: string; tone?: "violet" | "emerald" | "fuchsia" | "amber" | "rose" }) {
  const tones = {
    violet: "border-[#00FF66] bg-black/40 text-white shadow-[#00FF66]/10",
    emerald: "border-[#00FF66]/60 bg-black/40 text-white shadow-emerald-950/25",
    fuchsia: "border-[#00FF66]/55 bg-black/40 text-white shadow-fuchsia-950/30",
    amber: "border-[#00FF66]/40 bg-black/40 text-white shadow-amber-950/25",
    rose: "border-[#00FF66]/20 bg-black/40 text-white shadow-rose-950/25"
  };
  const toneClass = tones[tone];
  return (
    <div className={`relative mx-auto w-full max-w-[430px] overflow-hidden rounded-[2rem] border-2 p-5 text-center shadow-[4px_4px_0px_0px_rgba(0,255,102,0.15)] backdrop-blur-xl ${toneClass}`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,255,102,.03),transparent_42%)]" />
      <div className="relative">
      {photo ? <img src={photo} alt="" className="mx-auto mb-3 h-16 w-16 rounded-xl border-2 border-black object-cover shadow-[2px_2px_0px_0px_rgba(255,255,255,0.8)]" /> : <Crown className="mx-auto mb-3 text-emerald-400" size={20} />}
      <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#00FF66]">{label}</p>
      <p className="mt-2 text-lg font-bold text-white">{name || "Add details in portal"}</p>
      {sub ? <p className="mt-1 text-xs leading-5 text-white/55">{sub}</p> : null}
      </div>
    </div>
  );
}

function AdvisoryRow({ info }: { info: Record<string, any> }) {
  const coFaculty = info.coFacultyChampionName || info.coFacultyChampionPhoto || info.coFacultyChampionEmail;
  const advisors = [
    { name: info.studentAdvisorOneName, photo: info.studentAdvisorOnePhoto, email: info.studentAdvisorOneEmail },
    { name: info.studentAdvisorTwoName, photo: info.studentAdvisorTwoPhoto, email: info.studentAdvisorTwoEmail }
  ].filter((advisor) => advisor.name || advisor.photo || advisor.email);
  return (
    <div className={`mx-auto grid w-full max-w-6xl gap-4 ${advisors.length + (coFaculty ? 2 : 1) >= 4 ? "md:grid-cols-4" : advisors.length + (coFaculty ? 2 : 1) >= 3 ? "md:grid-cols-3" : advisors.length + (coFaculty ? 2 : 1) >= 2 ? "md:grid-cols-2" : "md:grid-cols-1"}`}>
      <PersonNode label="Faculty Champion" name={info.facultyChampionName} sub={info.facultyChampionEmail} photo={info.facultyChampionPhoto} tone="emerald" />
      {coFaculty ? <PersonNode label="Co-Faculty Champion" name={info.coFacultyChampionName} sub={info.coFacultyChampionEmail || info.coFacultyChampionPhone} photo={info.coFacultyChampionPhoto} tone="emerald" /> : null}
      {advisors.map((advisor, index) => (
        <PersonNode
          key={`${advisor.name || "advisor"}-${index}`}
          label={`Student Advisor ${index + 1}`}
          name={advisor.name}
          sub={advisor.email}
          photo={advisor.photo}
          tone={index === 0 ? "amber" : "rose"}
        />
      ))}
    </div>
  );
}

function OperationsRoot({ info }: { info: Record<string, any> }) {
  return <PersonNode label="1. Secretary" name={info.secretaryName} sub={info.secretaryEmail} photo={info.secretaryPhoto} tone="violet" />;
}

function TeamBox({ team, index, palette }: { team: PublicTeam; index: number; palette: string[] }) {
  return (
    <div className="relative rounded-[2rem] glass-brutalist p-4 backdrop-blur-xl">
      <div className="rounded-xl border border-white/10 bg-black/40 p-4 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#00FF66]">Team Lead Group</p>
        <p className="mt-2 text-sm font-semibold text-white">{team.lead || "Lead to be assigned"}</p>
      </div>

      <div className="mx-auto h-7 w-px bg-white/20" />

      <div className="rounded-[1.5rem] border border-white/10 bg-black/40 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-lg font-bold tracking-[-.035em] text-white">{team.name}</p>
            <p className="mt-1 text-[10px] uppercase tracking-[.18em] text-emerald-400 font-bold">{team.members} active members</p>
          </div>
          <Network className="text-white/45" size={17} />
        </div>
        {team.description ? <p className="mt-3 line-clamp-3 text-xs leading-5 text-white/50">{team.description}</p> : null}

        <div className="mt-4 grid gap-2">
          {team.coLeads.length ? (
            <div className="rounded-xl border border-white/10 bg-black/40 px-3 py-2">
              <p className="text-[9px] font-bold uppercase tracking-[.16em] text-white/36">Co-leads</p>
              <p className="mt-1 text-xs text-white/70">{team.coLeads.join(", ")}</p>
            </div>
          ) : null}
          {team.memberNames.length ? team.memberNames.slice(0, 6).map((member) => (
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white/68" key={member}>
              <ShieldCheck size={12} className="text-[#00FF66]" />
              {member}
            </div>
          )) : <p className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white/42">Members will appear after you assign them.</p>}
          {team.memberNames.length > 6 ? <p className="text-[10px] text-white/35 font-bold">+ {team.memberNames.length - 6} more members</p> : null}
        </div>
      </div>
    </div>
  );
}

function TeamLane({ title, subtitle, teams, palette, tone }: { title: string; subtitle: string; teams: PublicTeam[]; palette: string[]; tone: "emerald" | "fuchsia" }) {
  return (
    <div className="relative">
      <PersonNode label={title} name={subtitle} tone={tone} />
      <div className="mx-auto h-10 w-px bg-gradient-to-b from-white/40 to-white/0" />
      {teams.length ? (
      <div className="grid gap-5 lg:grid-cols-2">
          {teams.map((team, index) => <TeamBox team={team} index={index} palette={palette} key={team.id} />)}
        </div>
      ) : (
        <div className="glass-brutalist rounded-[1.4rem] p-6 text-center text-sm text-white/42">
          Add teams in the portal to populate this lane.
        </div>
      )}
    </div>
  );
}

export default async function TeamsPage() {
  const [teams, info] = await Promise.all([getPublicTeams(), getClubInfo()]);
  const { technical, creative } = splitTeams(teams);
  const technicalLead = info.jointSecretaryOneName || "Joint Secretary";
  const creativeLead = info.jointSecretaryTwoName || "Joint Secretary";

  return (
    <PublicShell>
      <section className="relative mx-auto max-w-7xl xl:max-w-[1380px] 2xl:max-w-[1536px] px-5 pb-20 pt-32 md:px-6 md:pb-28 md:pt-44 spatial-grid-bg">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(0,255,102,0.05),transparent_45%)] pointer-events-none" />

        <div className="team-hero-compact glass-brutalist relative overflow-hidden rounded-[2rem] px-5 py-9 text-center md:rounded-[2.2rem] md:px-10 md:py-10">
          <p className="flex items-center justify-center gap-2 text-[10px] font-bold tracking-[.34em] text-emerald-400">
            <Sparkles size={13} />
            ORGANIZATIONAL STRUCTURE
          </p>
          <h1 className="relative mt-4 text-[2.8rem] font-extrabold leading-[.94] tracking-[-.065em] text-white md:text-5xl lg:text-6xl">
            Tech Tatva Club Network
          </h1>
        </div>

        <div className="mt-6 md:hidden">
          <MobileTeamAccordion technical={technical} creative={creative} info={info} />
        </div>

        <div className="relative mt-10 hidden overflow-hidden rounded-[2.4rem] glass-brutalist p-5 shadow-2xl md:block md:p-8">
          <div className="relative grid gap-8">
            <div className="glass-brutalist rounded-[2rem] p-6">
              <p className="mb-5 text-center text-[10px] font-bold uppercase tracking-[.24em] text-emerald-400">Advisory Tree</p>
              <AdvisoryRow info={info} />
            </div>

            <div className="glass-brutalist rounded-[2rem] p-6">
              <p className="mb-5 text-center text-[10px] font-bold uppercase tracking-[.24em] text-emerald-400">Club Operations Tree</p>
              <OperationsRoot info={info} />
              <div className="mx-auto h-12 w-px bg-gradient-to-b from-[#00FF66]/60 to-white/0" />
              <div className="mx-auto hidden h-px max-w-4xl bg-gradient-to-r from-emerald-300/0 via-[#00FF66]/50 to-fuchsia-300/0 md:block" />

              <div className="mt-6 grid gap-8 xl:grid-cols-2">
                <TeamLane
                  title="2. Joint Secretary"
                  subtitle={technicalLead}
                  teams={technical}
                  palette={technicalColors}
                  tone="emerald"
                />
                <TeamLane
                  title="3. Joint Secretary"
                  subtitle={creativeLead}
                  teams={creative}
                  palette={creativeColors}
                  tone="fuchsia"
                />
              </div>
            </div>
          </div>
        </div>

        {!teams.length ? (
          <div className="glass-brutalist mt-8 rounded-[1.6rem] p-8 text-center">
            <Users className="mx-auto text-emerald-400" size={24} />
            <p className="mt-4 text-lg font-bold text-white">No teams are published yet.</p>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-white/42">
              Create teams and assign leads/members from the portal. This page will build the structure automatically from that data.
            </p>
          </div>
        ) : null}
      </section>
    </PublicShell>
  );
}
