import { Award, Crown, Medal, Sparkles, Star, Users } from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { getHallOfFameData, type HallMember } from "@/lib/public-data";

export const dynamic = "force-dynamic";

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "TT";
}

function HallAvatar({ person, large = false }: { person: HallMember; large?: boolean }) {
  const size = large ? "h-24 w-24 rounded-[1.7rem] text-2xl" : "h-16 w-16 rounded-2xl text-base";
  return person.image ? (
    <img src={person.image} alt="" loading="lazy" className={`${size} border border-stone-200 object-cover`} />
  ) : (
    <div className={`${size} grid place-items-center border border-stone-200 bg-[#f5ebe0] font-semibold text-stone-500`}>
      {initials(person.name)}
    </div>
  );
}

function HallCard({ person, featured = false }: { person: HallMember; featured?: boolean }) {
  return (
    <article className={`rounded-[2rem] border border-stone-200/80 bg-white p-5 shadow-[0_22px_70px_rgba(82,52,30,.07)] transition duration-300 hover:-translate-y-1 ${featured ? "md:p-7" : ""}`}>
      <div className="flex items-start gap-4">
        <HallAvatar person={person} large={featured} />
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-rose-400">{person.title || person.category.replace("_", " ")}</p>
          <h3 className={`${featured ? "text-3xl" : "text-xl"} mt-2 font-semibold tracking-[-.04em] text-stone-950`}>{person.name}</h3>
          {person.subtitle ? <p className="mt-2 text-sm leading-6 text-stone-500">{person.subtitle}</p> : null}
          <div className="mt-4 flex flex-wrap gap-2">
            {person.team ? <span className="rounded-full bg-[#faf8f5] px-3 py-1 text-[10px] font-semibold tracking-[.12em] text-stone-500">{person.team.toUpperCase()}</span> : null}
            {person.batch ? <span className="rounded-full bg-[#faf8f5] px-3 py-1 text-[10px] font-semibold tracking-[.12em] text-stone-500">BATCH {person.batch}</span> : null}
            {person.year ? <span className="rounded-full bg-[#faf8f5] px-3 py-1 text-[10px] font-semibold tracking-[.12em] text-stone-500">{person.year}</span> : null}
          </div>
        </div>
      </div>
    </article>
  );
}

function EmptyLegacy({ label }: { label: string }) {
  return (
    <div className="rounded-[1.7rem] border border-dashed border-stone-300 bg-[#faf8f5] p-6 text-center">
      <Star className="mx-auto text-rose-300" size={20} />
      <p className="mt-3 text-sm font-medium text-stone-700">No {label} added yet.</p>
      <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-stone-500">Add real names from the portal when the club is ready to publish this legacy section.</p>
    </div>
  );
}

function LegacySection({ title, eyebrow, icon: Icon, people }: { title: string; eyebrow: string; icon: typeof Crown; people: HallMember[] }) {
  return (
    <section className="mt-8 rounded-[2.2rem] border border-stone-200/80 bg-[#fffdf8] p-5 shadow-[0_24px_80px_rgba(82,52,30,.06)] md:p-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.24em] text-rose-400"><Icon size={14} />{eyebrow}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-.055em] text-stone-950 md:text-5xl">{title}</h2>
        </div>
        <span className="rounded-full border border-stone-200 bg-white px-4 py-2 text-[10px] font-semibold tracking-[.16em] text-stone-500">{people.length} RECORDS</span>
      </div>
      {people.length ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {people.map((person) => <HallCard person={person} key={person.id} />)}
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
      <section className="mx-auto max-w-7xl px-5 pb-20 pt-28 md:px-6 md:pb-28 md:pt-40">
        <div className="rounded-[2.7rem] border border-stone-200/80 bg-[#fffdf8] px-5 py-12 text-center shadow-[0_30px_110px_rgba(82,52,30,.08)] md:px-10 md:py-16">
          <p className="flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-[.32em] text-rose-400">
            <Sparkles size={13} />
            Club Legacy
          </p>
          <h1 className="mx-auto mt-5 max-w-4xl text-[3.35rem] font-semibold leading-[.9] tracking-[-.075em] text-stone-950 md:text-7xl">
            Hall of Fame
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-stone-500">
            A living record of the people who shaped Tech Tatva: secretaries, joint secretaries, leads, contributors, and alumni.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-[1.15fr_.85fr]">
          <div className="rounded-[2rem] border border-stone-200/80 bg-white p-5 shadow-[0_22px_70px_rgba(82,52,30,.07)] md:p-7">
            <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.24em] text-rose-400"><Crown size={14} /> Current Secretary</p>
            <div className="mt-5">
              {hall.secretary.length ? <HallCard person={hall.secretary[0]} featured /> : <EmptyLegacy label="secretary details" />}
            </div>
          </div>
          <div className="rounded-[2rem] border border-stone-200/80 bg-[#fffdf8] p-5 shadow-[0_22px_70px_rgba(82,52,30,.06)] md:p-7">
            <p className="text-[10px] font-semibold uppercase tracking-[.24em] text-stone-400">Legacy index</p>
            <p className="mt-4 text-6xl font-semibold tracking-[-.08em] text-stone-950">{total}</p>
            <p className="mt-3 text-sm leading-6 text-stone-500">Published records drawn from the portal, team structure, and club settings.</p>
            <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-stone-600">
              <span className="rounded-2xl border border-stone-200 bg-white p-3">{hall.jointSecretaries.length} Jt. Secretaries</span>
              <span className="rounded-2xl border border-stone-200 bg-white p-3">{hall.teamLeads.length} Leads</span>
              <span className="rounded-2xl border border-stone-200 bg-white p-3">{hall.topContributors.length} Contributors</span>
              <span className="rounded-2xl border border-stone-200 bg-white p-3">{hall.alumni.length} Alumni</span>
            </div>
          </div>
        </div>

        <LegacySection title="Joint Secretaries" eyebrow="Office bearers" icon={Crown} people={hall.jointSecretaries} />
        <LegacySection title="Team Leads" eyebrow="Execution layer" icon={Medal} people={hall.teamLeads} />
        <LegacySection title="Top Contributors" eyebrow="People who moved the club" icon={Award} people={hall.topContributors} />
        <LegacySection title="Alumni" eyebrow="The long memory" icon={Users} people={hall.alumni} />
      </section>
    </PublicShell>
  );
}
