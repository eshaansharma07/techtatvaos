import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Orbit } from "lucide-react";
import { EventCard } from "@/components/event-card";
import { PublicShell } from "@/components/public-shell";
import { Reveal } from "@/components/reveal";
import { getPublicHomeData, getMembershipDriveStatus } from "@/lib/public-data";
import { InteractiveHero3D } from "@/components/interactive-hero-3d";
import { SocialConnectBanner } from "@/components/social-connect-banner";

export const dynamic = "force-dynamic";

const SectionTitle = ({ eyebrow, title, copy }: { eyebrow: string; title: string; copy?: string }) => (
  <div className="mb-10 max-w-2xl">
    <p className="mb-4 text-[10px] font-semibold tracking-[.3em] text-emerald-600 uppercase">{eyebrow}</p>
    <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl text-black">{title}</h2>
    {copy && <p className="mt-4 text-sm leading-7 text-black/60">{copy}</p>}
  </div>
);

const EmptyState = ({ title, copy, href, action }: { title: string; copy: string; href?: string; action?: string }) => (
  <div className="glass-brutalist rounded-[1.6rem] p-8 text-center bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000000]">
    <p className="text-sm text-black font-bold">{title}</p>
    <p className="mx-auto mt-3 max-w-md text-xs leading-6 text-black/60">{copy}</p>
    {href && action ? (
      <Link className="brutalist-btn-green mt-5 inline-block rounded-xl px-4 py-2 text-xs font-bold border-2 border-black text-black shadow-[2px_2px_0px_0px_#000000]" href={href}>
        {action}
      </Link>
    ) : null}
  </div>
);

export default async function Home() {
  const [homeData, driveStatus] = await Promise.all([
    getPublicHomeData(),
    getMembershipDriveStatus()
  ]);
  
  const { events, teams, stats } = homeData;

  return (
    <PublicShell>
      {/* ═══════════════════════════════════════════════════════════════════
          CONSOLIDATED HERO SECTION (Responsive md+)
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center overflow-hidden spatial-grid-bg py-20">
        {/* Cinematic background */}
        <Image 
          src="/tech-tatva-hero-v2.png" 
          alt="" 
          fill 
          priority 
          sizes="100vw" 
          className="object-cover object-center opacity-[0.08] mix-blend-multiply"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#fafafa]/50 to-[#fafafa]"/>
        <div className="absolute inset-0 grid-bg opacity-[.06]"/>

        {/* Interactive Hologram 3D Core - only on md+ */}
        <div className="hidden md:block absolute inset-0 pointer-events-none">
          <InteractiveHero3D />
        </div>

        {/* Center-aligned content */}
        <div className="relative z-10 flex flex-col items-center px-6 text-center max-w-4xl">


          {/* Headline */}
          <Reveal delay={0.1}>
            <h1 className="mt-8 text-[11vw] md:text-7xl lg:text-[90px] font-extrabold leading-[1.05] tracking-[-0.04em] text-black">
              Enter the nex<span className="slice-t">t</span> <span className="font-extrabold italic text-transparent bg-clip-text bg-gradient-to-r from-black to-zinc-600">room.</span>
            </h1>
          </Reveal>

          {/* Subheading */}
          <Reveal delay={0.15}>
            <p className="mt-8 max-w-xl text-base md:text-lg leading-relaxed text-black/60">
              Chandigarh University's premier software developer and designer collective. Explore active registrations, structured departments, and legacy records.
            </p>
          </Reveal>

          {/* Hero Action CTA Button */}
          <Reveal delay={0.2}>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link 
                href="/join" 
                className="brutalist-btn-green flex min-h-12 items-center gap-2 rounded-2xl px-8 py-4 text-xs font-bold uppercase tracking-wider text-black border-2 border-black shadow-[3px_3px_0px_0px_#000000] transition active:scale-95 duration-300"
              >
                <span>Join the Club</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          STATS BAR SECTION (Responsive Row)
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-12 bg-transparent">
        <div className="mx-auto max-w-7xl xl:max-w-[1380px] 2xl:max-w-[1536px] px-5 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <Reveal>
              <div className="glass-brutalist rounded-[2rem] py-10 px-6">
                <p className="text-4xl font-extrabold text-black tracking-tight">{stats.members}+</p>
                <p className="mt-2 text-xs font-bold uppercase tracking-widest text-black/40">Core Members</p>
              </div>
            </Reveal>
            <Reveal delay={0.05}>
              <div className="glass-brutalist rounded-[2rem] py-10 px-6">
                <p className="text-4xl font-extrabold text-black tracking-tight">{stats.teams}+</p>
                <p className="mt-2 text-xs font-bold uppercase tracking-widest text-black/40">Specialized Teams</p>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="glass-brutalist rounded-[2rem] py-10 px-6">
                <p className="text-4xl font-extrabold text-black tracking-tight">{stats.events}+</p>
                <p className="mt-2 text-xs font-bold uppercase tracking-widest text-black/40">Annual Events</p>
              </div>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="glass-brutalist rounded-[2rem] py-10 px-6">
                <p className="text-4xl font-extrabold text-black tracking-tight">{stats.community || 0}+</p>
                <p className="mt-2 text-xs font-bold uppercase tracking-widest text-black/40">Community Members</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          EVENTS CALENDAR GRID SECTION
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl xl:max-w-[1380px] 2xl:max-w-[1536px] px-5 md:px-6">
          <Reveal>
            <div className="mb-12">
              <SectionTitle 
                eyebrow="EVENTS CALENDAR" 
                title="Active registrations & briefings." 
                copy="Check active schedules, timelines, venues, and briefs of upcoming hackathons."
              />
            </div>
          </Reveal>

          {events.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {events.slice(0, 6).map((event, i) => (
                <Reveal key={event.id} delay={i * 0.04}>
                  <EventCard event={event} index={i} />
                </Reveal>
              ))}
            </div>
          ) : (
            <EmptyState 
              title="No public events yet." 
              copy="Check back soon for upcoming sessions, workshops, and registrations."
            />
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          TEAMS STRUCTURE GRID SECTION
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="border-t-2 border-black bg-[#fafafa]">
        <div className="mx-auto max-w-7xl xl:max-w-[1380px] 2xl:max-w-[1536px] px-5 py-20 md:px-6 md:py-28">
          <Reveal>
            <div className="mb-12">
              <SectionTitle 
                eyebrow="ONE SYSTEM / MANY DISCIPLINES" 
                title="Teams building the future." 
                copy="Explore the public team structure and the disciplines behind club work."
              />
            </div>
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {teams.length ? (
              teams.slice(0, 6).map((team, i) => (
                <Reveal key={team.id} delay={i * 0.04}>
                  <div className="glass-brutalist group rounded-[22px] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#00FF66] flex flex-col justify-between min-h-[180px]">
                    <div className="flex justify-between items-start">
                      <Orbit size={20} className="text-black/60" />
                      <span className="brutalist-btn-dark rounded-xl px-3 py-1 text-xs text-white font-bold border border-black shadow-[1px_1px_0px_0px_#000000]">
                        {team.members} members
                      </span>
                    </div>
                    <div>
                      <h3 className="mt-6 text-base font-bold text-black group-hover:text-emerald-600 transition-colors">{team.name}</h3>
                      <p className="mt-2 text-xs leading-5 text-black/60">{team.description || "Team details coming soon."}</p>
                    </div>
                  </div>
                </Reveal>
              ))
            ) : (
              <div className="col-span-full">
                <EmptyState title="Team information is coming soon." copy="The public team structure has not been published yet." />
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* ═══════════════════════════════════════════════════════════════════
          SOCIAL CONNECT BANNER SECTION (Instagram Popup)
          ═══════════════════════════════════════════════════════════════════ */}
      <SocialConnectBanner />
      
      {/* ═══════════════════════════════════════════════════════════════════
          MEMBERSHIP DRIVE JOIN CTA BANNER SECTION
          ═══════════════════════════════════════════════════════════════════ */}
      {driveStatus && driveStatus.status !== "closed" && (
        <section className="border-b border-black/10 py-20 md:py-28 bg-black/[0.02]">
          <div className="mx-auto max-w-7xl xl:max-w-[1380px] 2xl:max-w-[1536px] px-5 md:px-6">
            <Reveal>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 rounded-[2.5rem] glass-brutalist p-8 md:p-12 relative overflow-hidden group bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000000]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(0,255,102,0.015),transparent_45%)] pointer-events-none" />
                <div className="relative z-10 max-w-2xl">
                  <p className="mb-3 text-[10px] font-bold tracking-[.3em] text-emerald-600 uppercase">MEMBERSHIP DRIVE</p>
                  <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl text-black">Ready to build what's next?</h2>
                  <p className="mt-4 text-sm leading-6 text-black/60">
                    Join Chandigarh University's premier software developer and designer collective. Collaborate on real-world projects and participate in hands-on bootcamps.
                  </p>
                </div>
                {driveStatus.registrationEnabled ? (
                  <Link href="/join" className="brutalist-btn-green flex min-h-12 items-center gap-2 rounded-2xl px-8 py-4 text-sm font-bold border-2 border-black text-black relative z-10 w-full lg:w-auto justify-center">
                    Join the Club <ArrowRight size={16} />
                  </Link>
                ) : (
                  <div className="rounded-xl border-2 border-black bg-white px-4 py-2.5 text-xs text-black font-bold shadow-[2px_2px_0px_0px_#000000]">
                    Registrations Opening Soon
                  </div>
                )}
              </div>
            </Reveal>
          </div>
        </section>
      )}
    </PublicShell>
  );
}
