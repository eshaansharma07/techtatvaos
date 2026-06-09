import { Crown, Sparkles, Users } from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { MobileTeamAccordion } from "@/components/mobile-team-accordion";
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

function Portrait({ photo, name }: { photo?: string; name?: string }) {
  return photo ? (
    <img src={photo} alt={name || ""} className="h-20 w-20 rounded-[1.35rem] object-cover shadow-[0_18px_45px_rgba(82,52,30,.12)]" />
  ) : (
    <div className="grid h-20 w-20 place-items-center rounded-[1.35rem] bg-[#f5ebe0] text-stone-400">
      <Crown size={22} />
    </div>
  );
}

function PersonCard({ label, name, sub, photo, accent = "rose" }: { label: string; name?: string; sub?: string; photo?: string; accent?: "rose" | "gold" | "lavender" | "coral" }) {
  const accents = {
    rose: "from-rose-100 to-white border-rose-100",
    gold: "from-amber-100 to-white border-amber-100",
    lavender: "from-violet-100 to-white border-violet-100",
    coral: "from-orange-100 to-white border-orange-100"
  };
  return (
    <article className={`rounded-[2rem] border bg-gradient-to-br ${accents[accent]} p-5 shadow-[0_24px_70px_rgba(82,52,30,.08)]`}>
      <Portrait photo={photo} name={name} />
      <p className="mt-7 text-[11px] font-semibold uppercase tracking-[.18em] text-stone-400">{label}</p>
      <h3 className="mt-2 text-2xl font-semibold tracking-[-.04em] text-stone-950">{name || "Details coming soon"}</h3>
      {sub ? <p className="mt-2 text-sm leading-6 text-stone-500">{sub}</p> : null}
    </article>
  );
}

function AdvisoryShowcase({ info }: { info: Record<string, any> }) {
  const people = [
    { label: "Faculty Champion", name: info.facultyChampionName, sub: info.facultyChampionEmail, photo: info.facultyChampionPhoto, accent: "gold" as const },
    { label: "Co-Faculty Champion", name: info.coFacultyChampionName, sub: info.coFacultyChampionEmail || info.coFacultyChampionPhone, photo: info.coFacultyChampionPhoto, accent: "coral" as const },
    { label: "Student Advisor 1", name: info.studentAdvisorOneName, sub: info.studentAdvisorOneEmail, photo: info.studentAdvisorOnePhoto, accent: "lavender" as const },
    { label: "Student Advisor 2", name: info.studentAdvisorTwoName, sub: info.studentAdvisorTwoEmail, photo: info.studentAdvisorTwoPhoto, accent: "rose" as const }
  ].filter((person) => person.name || person.sub || person.photo || person.label === "Faculty Champion");

  return (
    <section className="mt-14">
      <div className="mb-6 flex items-end justify-between gap-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[.22em] text-rose-400">Advisory Circle</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-.055em] text-stone-950 md:text-5xl">Guidance, without the hierarchy.</h2>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {people.map((person) => <PersonCard key={person.label} {...person} />)}
      </div>
    </section>
  );
}

function TeamCard({ team }: { team: PublicTeam }) {
  return (
    <article className="group overflow-hidden rounded-[2rem] border border-stone-200/80 bg-white p-5 shadow-[0_22px_70px_rgba(82,52,30,.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_90px_rgba(82,52,30,.11)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[.2em] text-rose-400">{team.members} active members</p>
          <h3 className="mt-3 text-3xl font-semibold tracking-[-.055em] text-stone-950">{team.name}</h3>
        </div>
        <span className="rounded-full bg-[#faf1ea] px-3 py-1 text-[10px] font-semibold uppercase tracking-[.14em] text-stone-500">Club Team</span>
      </div>
      {team.description ? <p className="mt-5 line-clamp-3 text-sm leading-7 text-stone-500">{team.description}</p> : null}
      <div className="mt-7 grid gap-3 rounded-[1.4rem] bg-[#faf8f5] p-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-stone-400">Team Lead</p>
          <p className="mt-1 text-sm font-semibold text-stone-900">{team.lead || "Lead to be assigned"}</p>
        </div>
        {team.coLeads.length ? (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-stone-400">Co-Leads</p>
            <p className="mt-1 text-sm leading-6 text-stone-600">{team.coLeads.join(", ")}</p>
          </div>
        ) : null}
      </div>
      <div className="mt-5 max-h-56 space-y-2 overflow-y-auto pr-1">
        {team.memberNames.length ? team.memberNames.map((member) => (
          <p key={member} className="rounded-2xl border border-stone-200/70 bg-white px-4 py-3 text-sm text-stone-600">{member}</p>
        )) : <p className="rounded-2xl border border-stone-200/70 bg-white px-4 py-3 text-sm text-stone-400">Members will appear after assignment.</p>}
      </div>
    </article>
  );
}

function TeamSection({ title, lead, teams }: { title: string; lead: string; teams: PublicTeam[] }) {
  return (
    <section className="mt-14 rounded-[2.4rem] border border-stone-200/80 bg-[#fffdf8] p-5 shadow-[0_30px_90px_rgba(82,52,30,.07)] md:p-8">
      <div className="grid gap-5 md:grid-cols-[.8fr_1.2fr] md:items-end">
        <PersonCard label={title} name={lead} accent={title.includes("Creative") ? "rose" : "lavender"} />
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[.22em] text-stone-400">Team Portfolio</p>
          <h2 className="mt-3 max-w-xl text-4xl font-semibold leading-[.95] tracking-[-.06em] text-stone-950 md:text-6xl">
            Work grouped around people, not boxes.
          </h2>
        </div>
      </div>
      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {teams.length ? teams.map((team) => <TeamCard team={team} key={team.id} />) : (
          <div className="rounded-[2rem] border border-dashed border-stone-300 bg-[#faf8f5] p-8 text-center text-sm text-stone-500">
            Add teams in the portal to populate this section.
          </div>
        )}
      </div>
    </section>
  );
}

export default async function TeamsPage() {
  const [teams, info] = await Promise.all([getPublicTeams(), getClubInfo()]);
  const { technical, creative } = splitTeams(teams);

  return (
    <PublicShell>
      <section className="mx-auto max-w-7xl px-5 pb-20 pt-28 md:px-6 md:pb-28 md:pt-40">
        <div className="rounded-[2.6rem] border border-stone-200/80 bg-[#fffdf8] px-5 py-12 text-center shadow-[0_30px_110px_rgba(82,52,30,.08)] md:px-12 md:py-18">
          <p className="flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[.28em] text-rose-400">
            <Sparkles size={14} />
            People of Tech Tatva
          </p>
          <h1 className="mx-auto mt-5 max-w-4xl text-6xl font-semibold leading-[.9] tracking-[-.075em] text-stone-950 md:text-8xl">
            The club, shown through its people.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-stone-500">
            A clean public showcase of the secretary, advisors, leads, co-leads, and members maintained from the portal.
          </p>
        </div>

        <div className="mt-6 md:hidden">
          <MobileTeamAccordion technical={technical} creative={creative} info={info} />
        </div>

        <div className="hidden md:block">
          <AdvisoryShowcase info={info} />

          <section className="mt-14">
            <div className="mb-6 flex items-end justify-between gap-6">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[.22em] text-rose-400">Core Leadership</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-[-.055em] text-stone-950 md:text-5xl">The operating desk.</h2>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <PersonCard label="Secretary" name={info.secretaryName} sub={info.secretaryEmail} photo={info.secretaryPhoto} accent="rose" />
              <PersonCard label="Joint Secretary (Technical & Operations)" name={info.jointSecretaryOneName} sub={info.jointSecretaryOneEmail} photo={info.jointSecretaryOnePhoto} accent="lavender" />
              <PersonCard label="Joint Secretary (Media & Creative)" name={info.jointSecretaryTwoName} sub={info.jointSecretaryTwoEmail} photo={info.jointSecretaryTwoPhoto} accent="coral" />
            </div>
          </section>

          <TeamSection title="Joint Secretary (Technical & Operations)" lead={info.jointSecretaryOneName || "Assign Joint Secretary"} teams={technical} />
          <TeamSection title="Joint Secretary (Media & Creative)" lead={info.jointSecretaryTwoName || "Assign Joint Secretary"} teams={creative} />
        </div>

        {!teams.length ? (
          <div className="mt-8 rounded-[2rem] border border-stone-200/80 bg-white p-8 text-center">
            <Users className="mx-auto text-rose-300" size={24} />
            <p className="mt-4 text-lg text-stone-900">No teams are published yet.</p>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-stone-500">
              Create teams and assign leads/members from the portal. This page will update automatically from real data.
            </p>
          </div>
        ) : null}
      </section>
    </PublicShell>
  );
}
