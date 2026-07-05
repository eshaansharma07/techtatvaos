import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, ChevronRight, Orbit, Sparkles, Ticket, Users, Zap } from "lucide-react";
import { EventCard } from "@/components/event-card";
import { PublicShell } from "@/components/public-shell";
import { Reveal } from "@/components/reveal";
import { getPublicHomeData, getMembershipDriveStatus } from "@/lib/public-data";
import { AnimatedCounter } from "@/components/animated-counter";
import { InteractiveHero3D } from "@/components/interactive-hero-3d";
import { CommunityShowcase } from "@/components/community-showcase";
import { InstagramFeed } from "@/components/instagram-feed";
import { InteractiveTerminal } from "@/components/interactive-terminal";

export const revalidate = 60;

const SectionTitle = ({ eyebrow, title, copy }: { eyebrow: string; title: string; copy?: string }) => <div className="mb-10 max-w-2xl"><p className="mb-4 text-[10px] font-semibold tracking-[.3em] text-violet-300">{eyebrow}</p><h2 className="text-3xl font-medium tracking-tight md:text-5xl">{title}</h2>{copy&&<p className="mt-4 text-sm leading-7 text-white/45">{copy}</p>}</div>;
const EmptyState = ({ title, copy, href, action }: { title: string; copy: string; href?: string; action?: string }) => <div className="premium-card rounded-[1.6rem] p-8 text-center"><p className="text-sm text-white/75">{title}</p><p className="mx-auto mt-3 max-w-md text-xs leading-6 text-white/42">{copy}</p>{href&&action?<Link className="ghost-pill mt-5 inline-flex rounded-full px-5 py-2 text-xs text-violet-100" href={href}>{action}</Link>:null}</div>;
const mobileQuickLinks = [
  ["Events", "/events", "Register"],
  ["Teams", "/teams", "Structure"],
  ["Hall of Fame", "/hall-of-fame", "Legacy"],
  ["Gallery", "/gallery", "Albums"],
  ["About", "/about", "Story"],
  ["Contact", "/contact", "Reach out"]
] as const;

export default async function Home() {
  const [homeData, driveStatus] = await Promise.all([
    getPublicHomeData(),
    getMembershipDriveStatus()
  ]);
  const { clubInfo, events, teams, achievements, sponsors, gallery, stats } = homeData;
  const customWords = clubInfo?.rotatingWords ? String(clubInfo.rotatingWords).split(",").map(w => w.trim()).filter(Boolean) : undefined;
  const nextEvent = events[0];
  const statRows = [
    [String(stats.members), "Active members"],
    [String(stats.community || 0), "Community members"],
    [String(stats.events), "Published events"],
    [String(stats.teams), "Active teams"],
    [String(achievements.length), "Featured achievements"]
  ];
  return <PublicShell>
    <section className="relative min-h-[820px] overflow-hidden pt-24 md:min-h-[980px] md:pt-24">
      <Image src="/tech-tatva-hero.png" alt="" fill priority sizes="100vw" className="object-cover object-center opacity-55 md:opacity-60"/>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_18%,rgba(217,70,239,.28),transparent_34%),radial-gradient(circle_at_18%_35%,rgba(124,58,237,.28),transparent_32%),radial-gradient(circle_at_52%_46%,rgba(253,186,116,.12),transparent_36%),linear-gradient(180deg,rgba(5,4,10,.24),#060509_88%)]"/>
      <div className="absolute inset-0 grid-bg opacity-[.16]"/>
      <div className="absolute left-1/2 top-28 h-72 w-72 -translate-x-1/2 rounded-full bg-fuchsia-500/10 blur-[100px]"/>

      {/* Interactive Hologram 3D Core */}
      <InteractiveHero3D />

      <div className="relative mx-auto grid min-h-[700px] max-w-7xl items-center gap-8 px-5 py-10 md:min-h-[790px] md:px-6 md:py-16 lg:grid-cols-[1.05fr_.75fr]">
        <Reveal>
          <div>
            <p className="text-[10px] font-semibold tracking-[.34em] text-violet-200/80">TECH TATVA</p>
            <h1 className="mt-5 max-w-5xl text-3xl xs:text-4xl sm:text-6xl font-semibold leading-[1.1] tracking-[-0.04em] text-white md:mt-6 md:text-7xl lg:text-[104px] lg:leading-[1.05]">
              Enter the next room.
            </h1>
            <p className="mt-6 max-w-2xl text-[15px] leading-8 text-white/66 md:mt-8 md:text-lg md:leading-9 md:text-white/62">
              Discover real club events, register as a candidate, explore teams, and follow the work Tech Tatva publishes for students.
            </p>

            {/* Interactive Developer CLI Terminal Widget */}
            <div className="mt-8 mb-4 hidden lg:block">
              <InteractiveTerminal 
                stats={stats}
                instagram={{
                  handle: clubInfo?.instagramHandle,
                  post1_image: clubInfo?.instagramPost1_image,
                  post1_url: clubInfo?.instagramPost1_url,
                }}
                event={nextEvent ? {
                  title: nextEvent.title,
                  description: nextEvent.description,
                  slug: nextEvent.slug,
                  venue: nextEvent.venue,
                } : undefined}
              />
            </div>

            <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap md:mt-10">
              {driveStatus && driveStatus.registrationEnabled ? (
                <>
                  <Link href="/join" className="action-pill group flex min-h-14 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition hover:-translate-y-0.5 text-black">
                    Join Tech Tatva <ArrowRight size={16} className="transition group-hover:translate-x-0.5"/>
                  </Link>
                  <Link href="/events" className="ghost-pill flex min-h-14 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm transition hover:-translate-y-0.5 hover:border-violet-200/35">
                    Browse registrations <ChevronRight size={16}/>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/events" className="action-pill group flex min-h-14 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition hover:-translate-y-0.5 text-black">
                    Browse registrations <ArrowRight size={16} className="transition group-hover:translate-x-0.5"/>
                  </Link>
                </>
              )}
              <Link href="/teams" className="ghost-pill flex min-h-14 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm transition hover:-translate-y-0.5 hover:border-violet-200/35">
                Explore teams <ChevronRight size={16}/>
              </Link>
            </div>
            <div className="mt-7 grid grid-cols-2 gap-3 md:hidden">
              {mobileQuickLinks.map(([label, href, eyebrow]) => (
                <Link href={href} key={href} className="group rounded-3xl border border-white/[.08] bg-white/[.045] p-4 shadow-[inset_0_1px_rgba(255,255,255,.05)] backdrop-blur-xl transition active:scale-[.98]">
                  <span className="text-[9px] font-semibold uppercase tracking-[.2em] text-violet-200/62">{eyebrow}</span>
                  <span className="mt-3 flex items-center justify-between gap-3 text-lg font-semibold tracking-[-.03em] text-white">
                    {label}
                    <ArrowUpRight size={16} className="text-white/42 transition group-active:translate-x-0.5 group-active:-translate-y-0.5"/>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={.12}>
          <div className="relative mt-10 lg:mt-0 block lg:block">
            <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-violet-500/18 via-fuchsia-500/10 to-transparent blur-2xl"/>
            <div className="aurora-shell relative rounded-[2rem] p-5">
              <div className="rounded-[1.5rem] border border-white/[.08] bg-white/[.035] p-5">
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-400/15 text-violet-100"><Ticket size={18}/></span>
                  <span className={nextEvent?.registrationOpen ? "rounded-full bg-emerald-400/10 px-3 py-1 text-[10px] font-semibold tracking-[.18em] text-emerald-200" : "rounded-full bg-white/[.06] px-3 py-1 text-[10px] font-semibold tracking-[.18em] text-white/45"}>
                    {nextEvent ? nextEvent.registrationOpen ? "REGISTRATION OPEN" : "EVENT LIVE" : "NO EVENT YET"}
                  </span>
                </div>
                <p className="mt-8 text-[10px] font-semibold tracking-[.3em] text-white/34">NEXT PUBLIC EVENT</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-.05em] text-white">{nextEvent?.title || "Events will appear here"}</h2>
                <p className="mt-4 min-h-14 text-sm leading-7 text-white/45">{nextEvent?.description || "When the admin publishes an event, candidates will see it here and can register from the event page."}</p>
                <div className="mt-7 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/[.07] bg-black/25 p-4">
                    <p className="text-[10px] tracking-[.2em] text-white/32">VENUE</p>
                    <p className="mt-2 text-sm text-white/75">{nextEvent?.venue || "TBA"}</p>
                  </div>
                  <div className="rounded-2xl border border-white/[.07] bg-black/25 p-4">
                    <p className="text-[10px] tracking-[.2em] text-white/32">MODE</p>
                    <p className="mt-2 text-sm capitalize text-white/75">{nextEvent?.participationMode || "Open"}</p>
                  </div>
                </div>
                <Link href={nextEvent ? `/events/${nextEvent.slug}` : "/events"} className="action-pill mt-5 flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5 text-black">
                  {nextEvent ? "Open event" : "View events"} <ArrowUpRight size={15}/>
                </Link>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-white/[.07] bg-white/[.03] p-4"><Users size={16} className="text-violet-200"/><p className="mt-5 text-xl font-semibold text-white"><AnimatedCounter value={stats.members} /></p><p className="mt-1 text-[9px] tracking-[.12em] text-white/32">MEMBERS</p></div>
                <div className="rounded-2xl border border-white/[.07] bg-white/[.03] p-4"><Sparkles size={16} className="text-fuchsia-200"/><p className="mt-5 text-xl font-semibold text-white"><AnimatedCounter value={stats.events} /></p><p className="mt-1 text-[9px] tracking-[.12em] text-white/32">EVENTS</p></div>
                <div className="rounded-2xl border border-white/[.07] bg-white/[.03] p-4"><Users size={16} className="text-pink-200"/><p className="mt-5 text-xl font-semibold text-white"><AnimatedCounter value={stats.community || 0} /></p><p className="mt-1 text-[9px] tracking-[.12em] text-white/32">COMMUNITY</p></div>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={.12} className="block lg:hidden mt-8 w-full">
          <InteractiveTerminal 
            stats={stats}
            instagram={{
              handle: clubInfo?.instagramHandle,
              post1_image: clubInfo?.instagramPost1_image,
              post1_url: clubInfo?.instagramPost1_url,
            }}
            event={nextEvent ? {
              title: nextEvent.title,
              description: nextEvent.description,
              slug: nextEvent.slug,
              venue: nextEvent.venue,
            } : undefined}
          />
        </Reveal>
      </div>

      <div className="relative mx-auto grid max-w-7xl grid-cols-2 gap-3 px-5 sm:grid-cols-3 md:grid-cols-5 md:px-6">{statRows.map(([n,l])=><div key={l} className="premium-card rounded-[1.35rem] px-5 py-5 transition duration-300 hover:-translate-y-1 hover:border-violet-200/25 md:rounded-[1.75rem] md:px-7 md:py-7"><p className="text-3xl font-semibold tracking-[-.055em] md:text-4xl text-white"><AnimatedCounter value={n} /></p><p className="mt-2 text-[9px] tracking-[.16em] text-white/38 md:text-[10px] md:tracking-[.18em]">{l.toUpperCase()}</p></div>)}</div>
    </section>
    <section className="mx-auto max-w-7xl px-5 py-20 md:px-6 md:py-28"><Reveal><SectionTitle eyebrow="LIVE SIGNAL" title="A calendar built for momentum." copy="Public events appear here when registrations are open or event details are published."/></Reveal>{events.length?<><div className="grid gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-4">{events.map((e,i)=><Reveal key={e.slug} delay={i*.08}><EventCard event={e} index={i}/></Reveal>)}</div><Link href="/events" className="ghost-pill mt-7 inline-flex min-h-12 items-center gap-2 rounded-full px-5 py-3 text-sm">View the complete calendar <ArrowUpRight size={15}/></Link></>:<EmptyState title="No public events yet." copy="Check back soon for upcoming sessions, workshops, and registrations."/>}</section>
    <section className="border-y border-white/[.06] bg-white/[.018]"><div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 md:px-6 md:py-28 lg:grid-cols-[.9fr_1.1fr] lg:gap-14"><Reveal><SectionTitle eyebrow="ONE SYSTEM / MANY DISCIPLINES" title="Teams building the future." copy="Explore the public team structure and the disciplines behind club work."/><Link className="ghost-pill inline-flex min-h-12 items-center gap-2 rounded-full px-5 py-3 text-sm" href="/teams">Explore the network <ArrowRight size={15}/></Link></Reveal><div className="grid gap-4 sm:grid-cols-2">{teams.length?teams.slice(0,6).map((team,i)=><Reveal key={team.id} delay={i*.04}><div className="premium-card group rounded-2xl p-5 transition duration-300 hover:-translate-y-1 hover:border-violet-300/25"><div className="flex justify-between"><Orbit size={18} className="text-violet-300"/><span className="rounded-full bg-white/[.045] px-3 py-1 text-xs text-white/35">{team.members}</span></div><h3 className="mt-7 text-base font-semibold text-white">{team.name}</h3><p className="mt-2 text-xs leading-5 text-white/40">{team.description || "Team details coming soon."}</p></div></Reveal>):<EmptyState title="Team information is coming soon." copy="The public team structure has not been published yet."/>}</div></div></section>
    
    {driveStatus && driveStatus.status !== "closed" && (
      <section className="border-b border-white/[.06] bg-gradient-to-b from-[#0c0512] to-[#040206] py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-5 md:px-6">
          <Reveal>
            <div className="mb-12 max-w-3xl">
              <p className="mb-4 text-[10px] font-semibold tracking-[.3em] text-violet-300">MEMBERSHIP DRIVE</p>
              <h2 className="text-3xl font-medium tracking-tight md:text-5xl text-white">Join the Tech Tatva Community.</h2>
              <p className="mt-4 text-sm leading-7 text-white/45">
                Take your technical and creative skills to the next level. Connect with peers, participate in exclusive bootcamps, and build project portfolios that matter.
              </p>
            </div>
          </Reveal>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-10">
            <Reveal delay={0.05}>
              <div className="premium-card rounded-2xl p-6 border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl">
                <h3 className="text-lg font-semibold text-white">1. Connect & Collaborate</h3>
                <p className="mt-3 text-xs leading-5 text-white/40">Work alongside some of the best minds in programming, UI/UX design, marketing, and systems engineering.</p>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="premium-card rounded-2xl p-6 border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl">
                <h3 className="text-lg font-semibold text-white">2. Practical Learning</h3>
                <p className="mt-3 text-xs leading-5 text-white/40">Gain access to internal workshops, hackathons, and technical projects to build out your resume.</p>
              </div>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="premium-card rounded-2xl p-6 border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl">
                <h3 className="text-lg font-semibold text-white">3. Exclusive Perks</h3>
                <p className="mt-3 text-xs leading-5 text-white/40">Get early registration benefits for all key club events, speaker sessions, and certificates of contribution.</p>
              </div>
            </Reveal>
          </div>
          
          {driveStatus.registrationEnabled && (
            <Reveal delay={0.2} className="mt-12 flex flex-col items-center justify-between gap-6 rounded-[2rem] border border-violet-500/20 bg-violet-500/5 p-8 md:flex-row md:p-10">
              <div>
                <h3 className="text-xl font-semibold text-white">Registrations are currently active.</h3>
                <p className="mt-2 text-xs text-white/50">Submit your registration details online and get verified instantly.</p>
              </div>
              <Link href="/join" className="action-pill flex min-h-12 items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition hover:-translate-y-0.5 text-black">
                Join Community <ArrowRight size={14} />
              </Link>
            </Reveal>
          )}
        </div>
      </section>
    )}

    {achievements.length ? <section className="mx-auto max-w-7xl px-6 py-20"><div className="grid gap-4 md:grid-cols-3">{achievements.slice(0,3).map((item:any)=><div className="glass rounded-2xl p-6" key={item._id}><p className="text-[10px] tracking-[.2em] text-violet-300">{item.kind || "ACHIEVEMENT"}</p><p className="mt-4 text-lg text-white">{item.title}</p><p className="mt-2 text-xs leading-5 text-white/40">{item.description}</p></div>)}</div></section> : null}
    
    {/* Dedicated Instagram posts feed */}
    <InstagramFeed
      handle={clubInfo?.instagramHandle}
      profileUrl={clubInfo?.instagramUrl}
      post1_image={clubInfo?.instagramPost1_image}
      post1_url={clubInfo?.instagramPost1_url}
      post2_image={clubInfo?.instagramPost2_image}
      post2_url={clubInfo?.instagramPost2_url}
      post3_image={clubInfo?.instagramPost3_image}
      post3_url={clubInfo?.instagramPost3_url}
    />

    {/* Real Human Presence: Community Showcase Grid */}
    <CommunityShowcase galleryData={gallery} />

    <section className="mx-auto max-w-7xl px-5 py-20 md:px-6 md:py-28"><div className="aurora-shell rounded-3xl px-6 py-12 md:px-16 md:py-16"><Zap className="absolute -right-6 -top-8 h-52 w-52 text-white/[.035]"/><p className="text-[10px] tracking-[.3em] text-violet-200">ACCESS THE NETWORK</p><h2 className="mt-6 max-w-2xl text-4xl font-medium tracking-tight md:text-6xl text-white">The future needs people who show up early.</h2><p className="mt-5 max-w-xl text-sm leading-7 text-white/50">Find your team, enter the room, and start making something that matters.</p><Link href="/contact" className="action-pill mt-8 inline-flex min-h-12 items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-black">Connect with us <ArrowUpRight size={15}/></Link></div></section>
  </PublicShell>;
}
