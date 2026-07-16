import { Crown, Network, ShieldCheck, Users } from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { MobileTeamAccordion } from "@/components/mobile-team-accordion";
import { Reveal } from "@/components/reveal";
import { getClubInfo, getPublicTeams, type PublicTeam } from "@/lib/public-data";

export const dynamic = "force-dynamic";

const creativeWords = ["design", "media", "creative", "content", "marketing", "social", "outreach", "sponsor", "photography", "video"];

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

function PersonNode({ label, name, sub, photo, highlight = false }: { label: string; name?: string; sub?: string; photo?: string; highlight?: boolean }) {
  return (
    <div className={`relative mx-auto w-full max-w-[400px] overflow-hidden rounded-[2rem] border-2 border-black p-5 text-center shadow-[4px_4px_0px_0px_#000] bg-white ${highlight ? "border-[#00FF66] shadow-[4px_4px_0px_0px_#00FF66]" : ""}`}>
      <div className="relative">
        {photo ? (
          <img src={photo} alt="" className="mx-auto mb-3 h-16 w-16 rounded-xl border-2 border-black object-cover shadow-[2px_2px_0px_0px_#000] no-grayscale" />
        ) : (
          <div className="mx-auto mb-3 h-12 w-12 rounded-xl border-2 border-black bg-[#00FF66] grid place-items-center shadow-[2px_2px_0px_0px_#000]">
            <Crown size={18} className="text-black" />
          </div>
        )}
        <p className="text-[9px] font-bold uppercase tracking-[.2em] text-black/40">{label}</p>
        <p className="mt-1.5 text-lg font-extrabold text-black">{name || "Add details in portal"}</p>
        {sub ? <p className="mt-1 text-xs text-black/55">{sub}</p> : null}
      </div>
    </div>
  );
}

function TeamBox({ team }: { team: PublicTeam }) {
  return (
    <div className="glass-brutalist rounded-[2rem] p-5">
      {/* Team Lead chip */}
      <div className="rounded-xl border-2 border-black bg-[#00FF66] px-3 py-2 text-center shadow-[2px_2px_0px_0px_#000] mb-4">
        <p className="text-[9px] font-bold uppercase tracking-[.16em] text-black/60">Team Lead</p>
        <p className="mt-0.5 text-sm font-bold text-black">{team.lead || "Lead to be assigned"}</p>
      </div>

      {/* Team info */}
      <div className="rounded-xl border-2 border-black bg-white p-4 shadow-[2px_2px_0px_0px_#000]">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-base font-extrabold tracking-tight text-black">{team.name}</p>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[.14em] text-black/40">{team.members} members</p>
          </div>
          <Network className="text-black/20 shrink-0" size={16} />
        </div>
        {team.description ? <p className="mt-2 line-clamp-2 text-xs leading-5 text-black/55">{team.description}</p> : null}

        <div className="mt-3 grid gap-1.5">
          {team.coLeads.length ? (
            <div className="rounded-lg border border-black/10 bg-black/[0.03] px-3 py-2">
              <p className="text-[9px] font-bold uppercase tracking-[.14em] text-black/35">Co-leads</p>
              <p className="mt-0.5 text-xs font-medium text-black/70">{team.coLeads.join(", ")}</p>
            </div>
          ) : null}
          {team.memberNames.length ? (
            <div className="mt-1 flex flex-wrap gap-1.5">
              {team.memberNames.slice(0, 5).map((member) => (
                <span className="inline-flex items-center gap-1 rounded-lg border border-black/10 bg-white px-2 py-1 text-[10px] font-medium text-black/70" key={member}>
                  <ShieldCheck size={10} className="text-[#00FF66]" />
                  {member}
                </span>
              ))}
              {team.memberNames.length > 5 ? (
                <span className="inline-flex items-center rounded-lg border border-black/10 bg-black/5 px-2 py-1 text-[10px] font-bold text-black/40">+{team.memberNames.length - 5}</span>
              ) : null}
            </div>
          ) : (
            <p className="rounded-lg border border-black/10 bg-black/[0.03] px-3 py-2 text-xs text-black/35">Members appear after assignment.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function TeamLane({ title, name, sub, photo, teams, highlight = false }: { title: string; name?: string; sub?: string; photo?: string; teams: PublicTeam[]; highlight?: boolean }) {
  return (
    <div>
      {/* Lane header card */}
      <PersonNode label={title} name={name} sub={sub} photo={photo} highlight={highlight} />
      
      <div className="mx-auto h-8 w-px bg-black/15" />

      {/* Teams below */}
      {teams.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {teams.map((team) => <TeamBox team={team} key={team.id} />)}
        </div>
      ) : (
        <div className="glass-brutalist rounded-[1.5rem] p-6 text-center">
          <p className="text-sm text-black/40">No teams in this lane yet.</p>
        </div>
      )}
    </div>
  );
}

export default async function TeamsPage() {
  const [teams, info] = await Promise.all([getPublicTeams(), getClubInfo()]);
  const { technical, creative } = splitTeams(teams);

  return (
    <PublicShell>
      <section className="relative mx-auto max-w-7xl xl:max-w-[1380px] 2xl:max-w-[1536px] px-5 pb-24 pt-32 md:px-6 md:pt-44 spatial-grid-bg">

        {/* ── HERO ── */}
        <Reveal>
          <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b-2 border-black pb-10">
            <div>
              <span className="inline-flex rounded-xl border-2 border-black bg-[#00FF66] px-4 py-1.5 text-[10px] font-bold tracking-[.28em] text-black shadow-[2px_2px_0px_0px_#000] uppercase">
                Org Structure
              </span>
              <h1 className="mt-5 text-[clamp(2.8rem,7vw,6rem)] font-extrabold leading-[.88] tracking-[-0.06em] text-black">
                The Tech Tatva<br />
                <span className="text-black/25">Club Network.</span>
              </h1>
            </div>
            <div className="flex flex-wrap gap-2">
              {[`${teams.length} Teams`, `${teams.reduce((acc, t) => acc + t.members, 0)} Members`].map((chip) => (
                <span key={chip} className="rounded-xl border-2 border-black bg-white px-4 py-2 text-[10px] font-bold tracking-[.16em] text-black shadow-[2px_2px_0px_0px_#000] uppercase">
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </Reveal>

        {/* ── MOBILE ACCORDION ── */}
        <div className="md:hidden mb-8">
          <MobileTeamAccordion technical={technical} creative={creative} info={info} />
        </div>

        {/* ── DESKTOP TREE ── */}
        <div className="hidden md:block">
          {/* Advisory row */}
          <Reveal>
            <div className="glass-brutalist rounded-[2rem] p-6 mb-6">
              <p className="mb-5 text-center text-[9px] font-bold uppercase tracking-[.26em] text-black/35">Advisory Council</p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-4xl mx-auto">
                <PersonNode label="Faculty Champion" name={info.facultyChampionName} sub={info.facultyChampionEmail} photo={info.facultyChampionPhoto} highlight />
                {(info.coFacultyChampionName || info.coFacultyChampionPhoto) && (
                  <PersonNode label="Co-Faculty Champion" name={info.coFacultyChampionName} sub={info.coFacultyChampionEmail} photo={info.coFacultyChampionPhoto} />
                )}
                {info.studentAdvisorOneName && <PersonNode label="Student Advisor 1" name={info.studentAdvisorOneName} sub={info.studentAdvisorOneEmail} photo={info.studentAdvisorOnePhoto} />}
                {info.studentAdvisorTwoName && <PersonNode label="Student Advisor 2" name={info.studentAdvisorTwoName} sub={info.studentAdvisorTwoEmail} photo={info.studentAdvisorTwoPhoto} />}
              </div>
            </div>
          </Reveal>

          {/* Secretary */}
          <Reveal delay={0.05}>
            <div className="flex justify-center mb-0">
              <div className="w-px h-8 bg-black/15" />
            </div>
            <div className="flex justify-center mb-0">
              <div className="max-w-sm w-full">
                <PersonNode label="1. Secretary" name={info.secretaryName} sub={info.secretaryEmail} photo={info.secretaryPhoto} highlight />
              </div>
            </div>
            <div className="flex justify-center">
              <div className="w-px h-8 bg-black/15" />
            </div>
          </Reveal>

          {/* Two lanes */}
          <Reveal delay={0.1}>
            <div className="glass-brutalist rounded-[2rem] p-6 md:p-8">
              <p className="mb-8 text-center text-[9px] font-bold uppercase tracking-[.26em] text-black/35">Club Operations</p>
              <div className="grid gap-8 xl:grid-cols-2">
                <TeamLane 
                  title="2. Joint Secretary" 
                  name={info.jointSecretaryOneName} 
                  sub={info.jointSecretaryOneEmail} 
                  photo={info.jointSecretaryOnePhoto} 
                  teams={technical} 
                  highlight 
                />
                <TeamLane 
                  title="3. Joint Secretary" 
                  name={info.jointSecretaryTwoName} 
                  sub={info.jointSecretaryTwoEmail} 
                  photo={info.jointSecretaryTwoPhoto} 
                  teams={creative} 
                />
              </div>
            </div>
          </Reveal>
        </div>

        {/* Empty state */}
        {!teams.length && (
          <Reveal>
            <div className="glass-brutalist rounded-[1.6rem] p-10 text-center mt-8">
              <Users className="mx-auto text-black/20 mb-4" size={28} />
              <p className="text-lg font-bold text-black">No teams published yet.</p>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-black/40">
                Create teams and assign leads/members from the admin portal. This page will build the structure automatically.
              </p>
            </div>
          </Reveal>
        )}
      </section>
    </PublicShell>
  );
}
