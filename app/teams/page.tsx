import { Crown, Network, ShieldCheck, Sparkles, Users } from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { MobileTeamAccordion } from "@/components/mobile-team-accordion";
import { getClubInfo, getPublicTeams, type PublicTeam } from "@/lib/public-data";

export const dynamic = "force-dynamic";

const creativeWords = ["design", "media", "creative", "content", "marketing", "social", "outreach", "sponsor", "photography", "video"];
const technicalColors = ["from-sky-500/22 to-cyan-400/10", "from-yellow-400/22 to-amber-500/10", "from-rose-500/22 to-red-500/10"];
const creativeColors = ["from-emerald-400/22 to-teal-400/10", "from-fuchsia-500/22 to-purple-500/10", "from-pink-500/22 to-violet-500/10"];

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

function PersonNode({ label, name, sub, photo, tone = "violet" }: { label: string; name?: string; sub?: string; photo?: string; tone?: "violet" | "cyan" | "fuchsia" | "emerald" | "amber" | "rose" }) {
  const tones = {
    violet: "border-violet-300/35 bg-gradient-to-br from-violet-500/24 via-purple-500/12 to-fuchsia-500/10 text-violet-100 shadow-violet-950/30",
    cyan: "border-cyan-300/35 bg-gradient-to-br from-cyan-400/22 via-sky-500/12 to-violet-500/10 text-cyan-100 shadow-cyan-950/25",
    fuchsia: "border-fuchsia-300/35 bg-gradient-to-br from-fuchsia-500/24 via-purple-500/12 to-pink-500/10 text-fuchsia-100 shadow-fuchsia-950/30",
    emerald: "border-emerald-300/35 bg-gradient-to-br from-emerald-400/22 via-teal-500/12 to-cyan-500/10 text-emerald-100 shadow-emerald-950/25",
    amber: "border-amber-300/35 bg-gradient-to-br from-amber-300/22 via-orange-500/12 to-fuchsia-500/10 text-amber-100 shadow-amber-950/25",
    rose: "border-rose-300/35 bg-gradient-to-br from-rose-400/22 via-pink-500/12 to-violet-500/10 text-rose-100 shadow-rose-950/25"
  };
  const toneClass = tones[tone];
  return (
    <div className={`relative mx-auto w-full max-w-[430px] overflow-hidden rounded-2xl border p-4 text-center shadow-2xl backdrop-blur-xl ${toneClass}`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,.14),transparent_42%)]" />
      <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
      <div className="relative">
      {photo ? <img src={photo} alt="" className="mx-auto mb-3 h-14 w-14 rounded-2xl border border-white/15 object-cover shadow-[0_0_24px_rgba(255,255,255,.1)]" /> : <Crown className="mx-auto mb-3" size={20} />}
      <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-white/52">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{name || "Add details in portal"}</p>
      {sub ? <p className="mt-1 text-xs leading-5 text-white/55">{sub}</p> : null}
      </div>
    </div>
  );
}

function AdvisoryRow({ info }: { info: Record<string, any> }) {
  const advisors = [
    { name: info.studentAdvisorOneName, photo: info.studentAdvisorOnePhoto, email: info.studentAdvisorOneEmail },
    { name: info.studentAdvisorTwoName, photo: info.studentAdvisorTwoPhoto, email: info.studentAdvisorTwoEmail }
  ].filter((advisor) => advisor.name || advisor.photo || advisor.email);
  return (
    <div className={`mx-auto grid w-full max-w-5xl gap-4 ${advisors.length ? "md:grid-cols-3" : "md:grid-cols-1"}`}>
      <PersonNode label="Faculty Champion" name={info.facultyChampionName} sub={info.facultyChampionEmail || "Faculty guidance and club oversight"} photo={info.facultyChampionPhoto} tone="emerald" />
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
  const gradient = palette[index % palette.length];
  return (
    <div className={`relative rounded-[1.4rem] border border-white/[.08] bg-gradient-to-br ${gradient} p-4 backdrop-blur-xl`}>
      <div className="rounded-2xl border border-white/10 bg-black/30 p-3 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-white/48">Team Lead Group</p>
        <p className="mt-2 text-sm font-semibold text-white">{team.lead || "Lead to be assigned"}</p>
      </div>

      <div className="mx-auto h-7 w-px bg-white/20" />

      <div className="rounded-2xl border border-white/10 bg-black/34 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-base font-semibold text-white">{team.name}</p>
            <p className="mt-1 text-[10px] uppercase tracking-[.18em] text-white/38">{team.members} active members</p>
          </div>
          <Network className="text-white/45" size={17} />
        </div>
        {team.description ? <p className="mt-3 line-clamp-3 text-xs leading-5 text-white/50">{team.description}</p> : null}

        <div className="mt-4 grid gap-2">
          {team.coLeads.length ? (
            <div className="rounded-xl border border-white/[.08] bg-white/[.035] px-3 py-2">
              <p className="text-[9px] font-semibold uppercase tracking-[.16em] text-white/36">Co-leads</p>
              <p className="mt-1 text-xs text-white/70">{team.coLeads.join(", ")}</p>
            </div>
          ) : null}
          {team.memberNames.length ? team.memberNames.slice(0, 6).map((member) => (
            <div className="flex items-center gap-2 rounded-xl border border-white/[.08] bg-black/24 px-3 py-2 text-xs text-white/68" key={member}>
              <ShieldCheck size={12} className="text-violet-200" />
              {member}
            </div>
          )) : <p className="rounded-xl border border-white/[.08] bg-black/24 px-3 py-2 text-xs text-white/42">Members will appear after you assign them.</p>}
          {team.memberNames.length > 6 ? <p className="text-[10px] text-white/35">+ {team.memberNames.length - 6} more members</p> : null}
        </div>
      </div>
    </div>
  );
}

function TeamLane({ title, subtitle, teams, palette, tone }: { title: string; subtitle: string; teams: PublicTeam[]; palette: string[]; tone: "cyan" | "fuchsia" }) {
  return (
    <div className="relative">
      <PersonNode label={title} name={subtitle} tone={tone} />
      <div className="mx-auto h-10 w-px bg-gradient-to-b from-white/40 to-white/0" />
      {teams.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {teams.map((team, index) => <TeamBox team={team} index={index} palette={palette} key={team.id} />)}
        </div>
      ) : (
        <div className="rounded-[1.4rem] border border-white/[.08] bg-white/[.025] p-6 text-center text-sm text-white/42">
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
      <section className="relative mx-auto max-w-7xl px-5 pb-20 pt-28 md:px-6 md:pb-28 md:pt-44">
        <div className="pointer-events-none absolute left-10 top-36 h-80 w-80 rounded-full bg-cyan-500/10 blur-[140px]" />
        <div className="pointer-events-none absolute right-0 top-72 h-96 w-96 rounded-full bg-fuchsia-500/10 blur-[150px]" />

        <div className="aurora-shell relative rounded-[2rem] px-5 py-9 text-center md:rounded-[2.3rem] md:px-10 md:py-10">
          <p className="flex items-center justify-center gap-2 text-[10px] font-semibold tracking-[.34em] text-violet-200/75">
            <Sparkles size={13} />
            ORGANIZATIONAL STRUCTURE
          </p>
          <h1 className="gradient-text mt-5 text-[3.25rem] font-semibold leading-[.94] tracking-[-.055em] md:text-6xl">
            Tech Tatva Club Network
          </h1>
        </div>

        <div className="mt-6 md:hidden">
          <MobileTeamAccordion technical={technical} creative={creative} />
        </div>

        <div className="relative mt-10 hidden overflow-hidden rounded-[2rem] border border-white/[.08] bg-[#05070d]/72 p-5 shadow-2xl shadow-black/30 md:block md:p-8">
          <div className="absolute inset-0 grid-bg opacity-20" />
          <div className="pointer-events-none absolute left-8 top-8 h-28 w-40 rounded-full border border-cyan-300/10" />
          <div className="pointer-events-none absolute right-8 top-10 h-24 w-48 rounded-2xl border border-fuchsia-300/10" />

          <div className="relative grid gap-8">
            <div className="rounded-[1.7rem] border border-emerald-300/15 bg-emerald-400/[.035] p-5">
              <p className="mb-5 text-center text-[10px] font-semibold uppercase tracking-[.24em] text-emerald-100/55">Advisory Tree</p>
              <AdvisoryRow info={info} />
            </div>

            <div className="rounded-[1.7rem] border border-violet-300/15 bg-violet-400/[.035] p-5">
              <p className="mb-5 text-center text-[10px] font-semibold uppercase tracking-[.24em] text-violet-100/55">Club Operations Tree</p>
              <OperationsRoot info={info} />
              <div className="mx-auto h-12 w-px bg-gradient-to-b from-violet-200/60 to-violet-200/0" />
              <div className="mx-auto hidden h-px max-w-4xl bg-gradient-to-r from-cyan-300/0 via-cyan-300/50 to-fuchsia-300/50 md:block" />

              <div className="mt-6 grid gap-8 xl:grid-cols-2">
                <TeamLane
                  title="2. Joint Secretary (Technical & Operations)"
                  subtitle={technicalLead}
                  teams={technical}
                  palette={technicalColors}
                  tone="cyan"
                />
                <TeamLane
                  title="3. Joint Secretary (Media & Creative)"
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
          <div className="premium-card mt-8 rounded-[1.6rem] p-8 text-center">
            <Users className="mx-auto text-violet-200" size={24} />
            <p className="mt-4 text-lg text-white/80">No teams are published yet.</p>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-white/42">
              Create teams and assign leads/members from the portal. This page will build the structure automatically from that data.
            </p>
          </div>
        ) : null}
      </section>
    </PublicShell>
  );
}
