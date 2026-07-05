import { Award, Crown, Medal, Sparkles, Star, Users } from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { getHallOfFameData, type HallMember } from "@/lib/public-data";

export const revalidate = 60;

const tones = {
  violet: "border-violet-300/24 from-violet-500/20 via-purple-500/10 to-fuchsia-500/10 shadow-violet-950/24",
  emerald: "border-emerald-300/24 from-emerald-400/18 via-amber-500/10 to-violet-500/10 shadow-emerald-950/20",
  fuchsia: "border-fuchsia-300/24 from-fuchsia-500/20 via-pink-500/10 to-violet-500/10 shadow-fuchsia-950/24",
  amber: "border-amber-300/24 from-amber-300/18 via-orange-500/10 to-fuchsia-500/10 shadow-amber-950/20"
};

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "TT";
}

function HallAvatar({ person, large = false }: { person: HallMember; large?: boolean }) {
  const size = large ? "h-24 w-24 rounded-[1.6rem] text-2xl" : "h-16 w-16 rounded-2xl text-base";
  return person.image ? (
    <img src={person.image} alt="" loading="lazy" className={`${size} border border-white/12 object-cover shadow-[0_0_34px_rgba(168,85,247,.22)]`} />
  ) : (
    <div className={`${size} grid place-items-center border border-white/12 bg-white/[.07] font-semibold text-white shadow-[0_0_34px_rgba(168,85,247,.18)]`}>
      {initials(person.name)}
    </div>
  );
}

function HallCard({ person, tone = "violet", featured = false }: { person: HallMember; tone?: keyof typeof tones; featured?: boolean }) {
  return (
    <article className={`group relative overflow-hidden rounded-[1.6rem] border bg-gradient-to-br p-5 shadow-2xl backdrop-blur-xl transition duration-300 hover:-translate-y-1 ${tones[tone]} ${featured ? "md:p-7" : ""}`}>
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-[.13]" />
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/10 blur-3xl transition group-hover:bg-white/15" />
      <div className="relative flex items-start gap-4">
        <HallAvatar person={person} large={featured} />
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[.22em] text-white/42">{person.title || person.category.replace("_", " ")}</p>
          <h3 className={`${featured ? "text-3xl" : "text-xl"} mt-2 font-semibold tracking-[-.04em] text-white`}>{person.name}</h3>
          {person.subtitle ? <p className="mt-2 text-sm leading-6 text-white/50">{person.subtitle}</p> : null}
          <div className="mt-4 flex flex-wrap gap-2">
            {person.team ? <span className="rounded-full border border-white/[.08] bg-black/24 px-3 py-1 text-[10px] font-semibold tracking-[.12em] text-white/50">{person.team.toUpperCase()}</span> : null}
            {person.batch ? <span className="rounded-full border border-white/[.08] bg-black/24 px-3 py-1 text-[10px] font-semibold tracking-[.12em] text-white/50">BATCH {person.batch}</span> : null}
            {person.year ? <span className="rounded-full border border-white/[.08] bg-black/24 px-3 py-1 text-[10px] font-semibold tracking-[.12em] text-white/50">{person.year}</span> : null}
          </div>
        </div>
      </div>
    </article>
  );
}

function EmptyLegacy({ label }: { label: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/[.08] bg-white/[.025] p-6 text-center">
      <Star className="mx-auto text-violet-200/70" size={20} />
      <p className="mt-3 text-sm font-medium text-white/62">No {label} added yet.</p>
      <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-white/35">Add real names from the portal when the club is ready to publish this legacy section.</p>
    </div>
  );
}

function LegacySection({ title, eyebrow, icon: Icon, people, tone }: { title: string; eyebrow: string; icon: typeof Crown; people: HallMember[]; tone: keyof typeof tones }) {
  return (
    <section className="mt-6 rounded-[2rem] border border-white/[.08] bg-white/[.02] p-5 md:mt-8 md:p-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.26em] text-violet-200/62"><Icon size={14} />{eyebrow}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-.055em] text-white md:text-5xl">{title}</h2>
        </div>
        <span className="rounded-full border border-white/[.08] bg-black/24 px-4 py-2 text-[10px] font-semibold tracking-[.16em] text-white/42">{people.length} RECORDS</span>
      </div>
      {people.length ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {people.map((person) => <HallCard person={person} tone={tone} key={person.id} />)}
        </div>
      ) : (
        <div className="mt-5"><EmptyLegacy label={title.toLowerCase()} /></div>
      )}
    </section>
  );
}

export default async function HallOfFamePage() {
  const hall = await getHallOfFameData();
  const total = hall.secretary.length + hall.jointSecretaries.length + hall.teamLeads.length + hall.topContributors.length + hall.alumni.length;

  return (
    <PublicShell>
      <section className="relative mx-auto max-w-7xl px-5 pb-20 pt-28 md:px-6 md:pb-28 md:pt-44">
        <div className="pointer-events-none absolute left-0 top-32 h-80 w-80 rounded-full bg-violet-500/10 blur-[140px]" />
        <div className="pointer-events-none absolute right-0 top-80 h-96 w-96 rounded-full bg-fuchsia-500/10 blur-[150px]" />

        <div className="aurora-shell relative overflow-hidden rounded-[2rem] px-5 py-10 text-center md:rounded-[2.3rem] md:px-10 md:py-14">
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-20" />
          <p className="relative flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-[.34em] text-violet-200/75">
            <Sparkles size={13} />
            CLUB LEGACY
          </p>
          <h1 className="gradient-text relative mx-auto mt-5 max-w-4xl text-3xl xs:text-5xl font-semibold leading-[.92] tracking-[-.065em] md:text-7xl">
            Hall of Fame
          </h1>
          <p className="relative mx-auto mt-5 max-w-2xl text-[15px] leading-7 text-white/52 md:text-sm">
            A living record of the people who shaped Tech Tatva: office bearers, leads, contributors, and alumni.
          </p>
          <div className="relative mt-7 flex flex-wrap justify-center gap-3">
            {["Secretary", "Joint Secretaries", "Team Leads", "Top Contributors", "Alumni"].map((item) => (
              <span className="ghost-pill rounded-full px-4 py-2 text-[10px] font-semibold tracking-[.14em] text-white/58" key={item}>{item.toUpperCase()}</span>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-[1.15fr_.85fr]">
          <div className="rounded-[2rem] border border-violet-300/16 bg-violet-500/[.045] p-5 md:p-7">
            <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.26em] text-violet-200/68"><Crown size={14} /> Current Secretary</p>
            <div className="mt-5">
              {hall.secretary.length ? <HallCard person={hall.secretary[0]} tone="violet" featured /> : <EmptyLegacy label="secretary details" />}
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/[.08] bg-white/[.025] p-5 md:p-7">
            <p className="text-[10px] font-semibold uppercase tracking-[.26em] text-white/38">Legacy index</p>
            <p className="mt-4 text-6xl font-semibold tracking-[-.08em] text-white">{total}</p>
            <p className="mt-3 text-sm leading-6 text-white/45">Published records drawn from the portal, team structure, and club settings.</p>
            <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-white/48">
              <span className="rounded-2xl border border-white/[.07] bg-black/20 p-3">{hall.jointSecretaries.length} Jt. Secretaries</span>
              <span className="rounded-2xl border border-white/[.07] bg-black/20 p-3">{hall.teamLeads.length} Leads</span>
              <span className="rounded-2xl border border-white/[.07] bg-black/20 p-3">{hall.topContributors.length} Contributors</span>
              <span className="rounded-2xl border border-white/[.07] bg-black/20 p-3">{hall.alumni.length} Alumni</span>
            </div>
          </div>
        </div>

        <LegacySection title="Joint Secretaries" eyebrow="Office bearers" icon={Crown} people={hall.jointSecretaries} tone="amber" />
        <LegacySection title="Team Leads" eyebrow="Execution layer" icon={Medal} people={hall.teamLeads} tone="emerald" />
        <LegacySection title="Top Contributors" eyebrow="People who moved the club" icon={Award} people={hall.topContributors} tone="fuchsia" />
        <LegacySection title="Alumni" eyebrow="The long memory" icon={Users} people={hall.alumni} tone="emerald" />
      </section>
    </PublicShell>
  );
}
