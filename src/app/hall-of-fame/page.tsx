import { Award, Crown, Medal, Users } from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { Reveal } from "@/components/reveal";
import { getHallOfFameData, type HallMember } from "@/lib/public-data";

export const revalidate = 60;

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "TT";
}

function HallAvatar({ person, large = false }: { person: HallMember; large?: boolean }) {
  const size = large ? "h-24 w-24 rounded-2xl text-2xl" : "h-16 w-16 rounded-xl text-base";
  return person.image ? (
    <img src={person.image} alt="" loading="lazy" className={`${size} border-2 border-black object-cover shadow-[2px_2px_0px_0px_#000] no-grayscale`} />
  ) : (
    <div className={`${size} grid place-items-center border-2 border-black bg-[#00FF66] font-bold text-black shadow-[2px_2px_0px_0px_#000]`}>
      {initials(person.name)}
    </div>
  );
}

function HallCard({ person, featured = false }: { person: HallMember; featured?: boolean }) {
  return (
    <article className={`group relative overflow-hidden rounded-[2rem] border-2 border-black p-6 shadow-[3px_3px_0px_0px_#000] bg-white transition hover:-translate-y-0.5 hover:border-[#00FF66] hover:shadow-[3px_3px_0px_0px_#000_#00FF66] ${featured ? "md:p-8" : ""}`}>
      <div className="relative flex flex-col sm:flex-row items-start gap-4">
        <HallAvatar person={person} large={featured} />
        <div className="min-w-0 flex-1">
          <span className="inline-flex rounded-lg border border-black bg-black/5 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[.18em] text-black/60">
            {person.title || person.category.replace("_", " ")}
          </span>
          <h3 className={`${featured ? "text-2xl sm:text-4xl" : "text-lg sm:text-xl"} mt-2 font-extrabold tracking-tight text-black`}>
            {person.name}
          </h3>
          {person.subtitle ? <p className="mt-1 text-xs text-black/50">{person.subtitle}</p> : null}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {person.team ? <span className="rounded-lg border border-black/10 bg-black/[0.03] px-2 py-1 text-[9px] font-bold text-black/50">{person.team.toUpperCase()}</span> : null}
            {person.batch ? <span className="rounded-lg border border-black/10 bg-black/[0.03] px-2 py-1 text-[9px] font-bold text-black/50">BATCH {person.batch}</span> : null}
            {person.year ? <span className="rounded-lg border border-black/10 bg-black/[0.03] px-2 py-1 text-[9px] font-bold text-black/50">{person.year}</span> : null}
          </div>
        </div>
      </div>
    </article>
  );
}

function EmptyLegacy({ label }: { label: string }) {
  return (
    <div className="rounded-[1.5rem] border-2 border-dashed border-black/15 p-8 text-center bg-white/50">
      <p className="text-sm font-bold text-black/40">No {label} recorded yet.</p>
    </div>
  );
}

function LegacySection({ title, eyebrow, icon: Icon, people }: { title: string; eyebrow: string; icon: typeof Crown; people: HallMember[] }) {
  return (
    <section className="mt-10 rounded-[2.2rem] glass-brutalist p-6 md:p-8 relative z-10">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-black pb-5 mb-6">
        <div>
          <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[.26em] text-black/40">
            <Icon size={12} className="text-[#00FF66]" /> {eyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-black md:text-4xl">{title}</h2>
        </div>
        <span className="rounded-xl border-2 border-black bg-white px-4 py-2 text-[10px] font-bold tracking-[.16em] text-black shadow-[2px_2px_0px_0px_#000] uppercase">
          {people.length} Records
        </span>
      </div>
      {people.length ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {people.map((person) => <HallCard person={person} key={person.id} />)}
        </div>
      ) : (
        <EmptyLegacy label={title.toLowerCase()} />
      )}
    </section>
  );
}

export default async function HallOfFamePage() {
  const hall = await getHallOfFameData();
  const total = hall.secretary.length + hall.jointSecretaries.length + hall.teamLeads.length + hall.topContributors.length + hall.alumni.length;

  return (
    <PublicShell>
      <section className="relative mx-auto max-w-7xl xl:max-w-[1380px] 2xl:max-w-[1536px] px-5 pb-24 pt-32 md:px-6 md:pt-44 spatial-grid-bg">

        {/* ── HERO ── */}
        <Reveal>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b-2 border-black pb-10 mb-10">
            <div>
              <span className="inline-flex rounded-xl border-2 border-black bg-[#00FF66] px-4 py-1.5 text-[10px] font-bold tracking-[.28em] text-black shadow-[2px_2px_0px_0px_#000] uppercase">
                Club Legacy
              </span>
              <h1 className="mt-5 text-[clamp(2.8rem,7vw,6.5rem)] font-extrabold leading-[.88] tracking-[-0.06em] text-black">
                Hall of Fame.
              </h1>
              <p className="mt-6 max-w-xl text-sm leading-7 text-black/55">
                A living archive documenting the leaders, coordinators, and exceptional contributors who built Tech Tatva over the years.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {[`${total} Records`, "Alumni Connected"].map((chip) => (
                <span key={chip} className="rounded-xl border-2 border-black bg-white px-4 py-2.5 text-[10px] font-bold tracking-[.14em] text-black shadow-[2px_2px_0px_0px_#000] uppercase">
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </Reveal>

        {/* ── SECRETARY & STATS ROW ── */}
        <div className="grid gap-6 md:grid-cols-[1.2fr_.8fr] mb-6">
          <Reveal>
            <div className="glass-brutalist rounded-[2.2rem] p-6 md:p-8 h-full flex flex-col justify-between">
              <div>
                <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[.26em] text-black/40 mb-4">
                  <Crown size={12} className="text-[#00FF66]" /> Current Secretary
                </p>
                {hall.secretary.length ? (
                  <HallCard person={hall.secretary[0]} featured />
                ) : (
                  <EmptyLegacy label="secretary details" />
                )}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="glass-brutalist rounded-[2.2rem] p-6 md:p-8 h-full flex flex-col justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[.26em] text-black/40">Legacy Indexes</p>
                <p className="mt-4 text-7xl font-extrabold tracking-tighter text-black leading-none">{total}</p>
                <p className="mt-3 text-xs leading-5 text-black/50">Verified active logs retrieved from historical data registers.</p>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-2 text-[10px] font-bold text-black/60">
                <span className="rounded-lg border border-black/10 bg-black/[0.03] p-2.5 text-center">{hall.jointSecretaries.length} Joint Secs</span>
                <span className="rounded-lg border border-black/10 bg-black/[0.03] p-2.5 text-center">{hall.teamLeads.length} Leads</span>
                <span className="rounded-lg border border-black/10 bg-black/[0.03] p-2.5 text-center">{hall.topContributors.length} Contributors</span>
                <span className="rounded-lg border border-black/10 bg-black/[0.03] p-2.5 text-center">{hall.alumni.length} Alumni</span>
              </div>
            </div>
          </Reveal>
        </div>

        {/* ── LEGACY CATEGORIES ── */}
        <Reveal delay={0.12}>
          <LegacySection title="Joint Secretaries" eyebrow="Operational officers" icon={Crown} people={hall.jointSecretaries} />
        </Reveal>
        <Reveal delay={0.15}>
          <LegacySection title="Team Leads" eyebrow="Execution leads" icon={Award} people={hall.teamLeads} />
        </Reveal>
        <Reveal delay={0.18}>
          <LegacySection title="Top Contributors" eyebrow="Active builders" icon={Medal} people={hall.topContributors} />
        </Reveal>
        <Reveal delay={0.21}>
          <LegacySection title="Alumni Network" eyebrow="Legacy memory" icon={Users} people={hall.alumni} />
        </Reveal>
      </section>
    </PublicShell>
  );
}
