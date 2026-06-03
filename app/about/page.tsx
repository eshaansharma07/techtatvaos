import { PublicShell } from "@/components/public-shell";
import { getClubInfo } from "@/lib/public-data";

export const dynamic = "force-dynamic";

function softText(value?: string) {
  return value?.trim() || "This section will appear once the club admin updates it from the portal.";
}

function StoryCard({ label, text }: { label: string; text?: string }) {
  return (
    <article className="group relative overflow-hidden rounded-[2rem] border border-white/[.08] bg-white/[.035] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl transition duration-500 hover:border-violet-300/25 hover:bg-white/[.055] md:p-8">
      <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-violet-500/10 blur-3xl transition group-hover:bg-fuchsia-500/15" />
      <p className="relative text-[10px] font-semibold tracking-[.28em] text-violet-200/80">{label}</p>
      <p className="relative mt-6 max-w-prose whitespace-pre-line text-[15px] leading-8 text-white/62 md:text-base">
        {softText(text)}
      </p>
    </article>
  );
}

export default async function About() {
  const info = await getClubInfo();
  const history = Array.isArray(info.history) ? info.history : [];

  return (
    <PublicShell>
      <section className="relative mx-auto max-w-7xl px-6 pb-28 pt-36 md:pt-44">
        <div className="pointer-events-none absolute left-1/2 top-20 h-72 w-72 -translate-x-1/2 rounded-full bg-violet-500/15 blur-[120px]" />
        <div className="pointer-events-none absolute right-0 top-80 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-[140px]" />

        <div className="relative mx-auto max-w-4xl text-center">
          <p className="text-[10px] font-semibold tracking-[.34em] text-violet-200/75">OUR STORY</p>
          <h1 className="gradient-text mt-6 text-5xl font-medium leading-[.96] tracking-[-.065em] md:text-7xl lg:text-8xl">
            {info.aboutTitle || "About Tech Tatva"}
          </h1>
          <p className="mx-auto mt-7 max-w-2xl whitespace-pre-line text-sm leading-7 text-white/50 md:text-base md:leading-8">
            {softText(info.aboutCopy)}
          </p>
        </div>

        <div className="relative mt-16 grid gap-5 lg:grid-cols-2">
          <StoryCard label="VISION" text={info.vision} />
          <StoryCard label="MISSION" text={info.mission} />
        </div>

        <div className="relative mt-20 grid gap-8 lg:grid-cols-[.72fr_1fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <p className="text-[10px] font-semibold tracking-[.3em] text-violet-200/70">LEGACY</p>
            <h2 className="mt-4 max-w-sm text-4xl font-medium tracking-[-.045em] text-white/90 md:text-5xl">
              A quieter timeline, built from real updates.
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-7 text-white/42">
              Add milestones from the portal when you want them public. Until then, this page stays clean instead of inventing filler.
            </p>
          </div>

          {history.length ? (
            <div className="rounded-[2rem] border border-white/[.08] bg-white/[.025] p-3 backdrop-blur-xl">
              {history.map((item: any) => (
                <div className="grid gap-4 rounded-[1.4rem] border border-transparent px-5 py-5 transition hover:border-white/[.08] hover:bg-white/[.035] md:grid-cols-[100px_1fr]" key={`${item.year}-${item.text}`}>
                  <p className="text-xs font-semibold tracking-[.18em] text-violet-200/75">{item.year}</p>
                  <p className="text-sm leading-7 text-white/55">{item.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-white/[.08] bg-white/[.025] p-8 text-sm leading-7 text-white/45 backdrop-blur-xl">
              Timeline entries are not added yet.
            </div>
          )}
        </div>
      </section>
    </PublicShell>
  );
}
