import { ChevronRight, Crown, Network, ShieldCheck, Users } from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { getPublicTeams } from "@/lib/public-data";

export const dynamic = "force-dynamic";

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/[.06] bg-white/[.035] p-4">
      <p className="text-[10px] font-semibold tracking-[.18em] text-white/32">{label}</p>
      <p className="mt-3 flex items-center gap-2 text-sm text-white/72">
        <Users size={14} className="text-violet-300" />
        {value}
      </p>
    </div>
  );
}

export default async function TeamsPage() {
  const teams = await getPublicTeams();

  return (
    <PublicShell>
      <section className="relative mx-auto max-w-7xl px-6 pb-28 pt-36 md:pt-44">
        <div className="pointer-events-none absolute left-10 top-36 h-80 w-80 rounded-full bg-violet-500/10 blur-[140px]" />
        <div className="pointer-events-none absolute right-0 top-72 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-[140px]" />

        <div className="relative max-w-4xl">
          <p className="text-[10px] font-semibold tracking-[.34em] text-violet-200/75">THE NETWORK</p>
          <h1 className="gradient-text mt-6 text-5xl font-medium leading-[.96] tracking-[-.065em] md:text-7xl lg:text-8xl">
            Built to connect.
          </h1>
          <p className="mt-7 max-w-2xl text-sm leading-7 text-white/50 md:text-base md:leading-8">
            Explore the public team structure, leadership assignments, faculty champions, and active members behind Tech Tatva.
          </p>
        </div>

        <div className="relative mt-14 rounded-[2rem] border border-white/[.08] bg-white/[.025] p-4 backdrop-blur-xl md:p-6">
          <div className="flex items-center gap-4 rounded-2xl border border-violet-300/20 bg-violet-500/10 p-5">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-black/20 text-violet-200">
              <Network size={20} />
            </span>
            <div>
              <p className="text-base text-white/88">Tech Tatva</p>
              <p className="mt-1 text-[10px] font-semibold tracking-[.18em] text-white/35">CLUB NETWORK</p>
            </div>
          </div>

          <div className="mt-5 grid gap-4">
            {teams.length ? (
              teams.map((team, index) => (
                <details className="group rounded-[1.5rem] border border-white/[.07] bg-black/18 p-4 transition hover:border-violet-300/20 hover:bg-white/[.035]" open={index === 0} key={team.id}>
                  <summary className="flex cursor-pointer list-none items-center gap-4">
                    <ChevronRight size={17} className="text-violet-200 transition group-open:rotate-90" />
                    <div className="min-w-0 flex-1">
                      <p className="text-lg font-medium text-white/88">{team.name}</p>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/38">{team.description || "Team details coming soon."}</p>
                    </div>
                    <span className="rounded-full border border-white/[.08] bg-white/[.035] px-3 py-1 text-xs text-violet-200">
                      {team.members} members
                    </span>
                  </summary>

                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    <DetailCard label="TEAM LEAD" value={team.lead || "To be announced"} />
                    <DetailCard label="CO-LEADS" value={team.coLeads.length ? team.coLeads.join(", ") : "To be announced"} />
                    <DetailCard label="FACULTY CHAMPION" value={team.facultyChampionName || "To be announced"} />
                  </div>

                  <div className="mt-4 rounded-2xl border border-white/[.06] bg-white/[.025] p-4">
                    <div className="flex items-center gap-2 text-[10px] font-semibold tracking-[.18em] text-white/35">
                      <ShieldCheck size={13} className="text-violet-300" />
                      ACTIVE MEMBERS
                    </div>
                    {team.memberNames.length ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {team.memberNames.map((member) => (
                          <span className="inline-flex items-center gap-2 rounded-full border border-white/[.08] bg-black/25 px-3 py-2 text-xs text-white/65" key={member}>
                            <Crown size={12} className="text-violet-300" />
                            {member}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-4 text-sm text-white/38">No active members assigned yet.</p>
                    )}
                  </div>
                </details>
              ))
            ) : (
              <div className="rounded-2xl border border-white/[.08] bg-white/[.025] p-8 text-sm text-white/45">
                Team information is coming soon.
              </div>
            )}
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
