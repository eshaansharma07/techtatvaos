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
    {/* ═══════════════════════════════════════════════════════════════════
        MOBILE HERO — Center-aligned, dramatic, minimal (md:hidden)
        Desktop hero follows below and is completely untouched.
        Height accounts for the h-20 (5rem) spacer in public-shell.
    ═══════════════════════════════════════════════════════════════════ */}
    <section className="relative flex min-h-[calc(100dvh-5rem)] flex-col items-center justify-center overflow-hidden md:hidden">
      {/* Cinematic background */}
      <Image src="/tech-tatva-hero.png" alt="" fill priority sizes="100vw" className="object-cover object-[center_25%] opacity-25"/>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_20%,rgba(139,92,246,.18),transparent_70%),radial-gradient(ellipse_50%_40%_at_50%_100%,rgba(236,72,153,.12),transparent_70%),linear-gradient(180deg,rgba(6,5,9,.4)_0%,rgba(6,5,9,.95)_100%)]"/>

      {/* Floating ambient glow */}
      <div className="absolute left-1/2 top-1/3 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/12 blur-[100px]"/>
      <div className="absolute bottom-1/4 right-0 h-36 w-36 rounded-full bg-fuchsia-500/10 blur-[80px]"/>

      {/* Center-aligned content */}
      <div className="relative z-10 flex flex-col items-center px-7 text-center">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/8 px-4 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse"/>
          <span className="text-[10px] font-semibold tracking-[.25em] text-violet-200/90 uppercase">Tech Tatva</span>
        </div>

        {/* Main headline */}
        <h1 className="mt-7 text-[13vw] font-extrabold leading-[1] tracking-[-0.05em] text-white" style={{textShadow: "0 4px 40px rgba(139,92,246,.25), 0 0 80px rgba(236,72,153,.1)"}}>
          Enter the<br/>next room.
        </h1>

        {/* Subtitle */}
        <p className="mt-5 max-w-[280px] text-[14px] leading-[1.65] text-white/45">
          Where students build, compete, and create what comes next.
        </p>

        {/* Primary CTA */}
        <div className="mt-8 flex w-full max-w-[280px] flex-col gap-3">
          {driveStatus && driveStatus.registrationEnabled ? (
            <Link href="/join" className="action-pill group flex h-[52px] items-center justify-center gap-2.5 rounded-full text-[15px] font-bold text-black shadow-[0_4px_24px_rgba(236,72,153,0.3)]">
              Join the community <ArrowRight size={16} className="transition group-active:translate-x-1"/>
            </Link>
          ) : (
            <Link href="/events" className="action-pill group flex h-[52px] items-center justify-center gap-2.5 rounded-full text-[15px] font-bold text-black shadow-[0_4px_24px_rgba(236,72,153,0.3)]">
              Explore events <ArrowRight size={16} className="transition group-active:translate-x-1"/>
            </Link>
          )}
          <Link href="/teams" className="flex h-[44px] items-center justify-center gap-2 rounded-full text-[13px] font-medium text-white/50 transition active:text-white/80">
            Meet the teams <ChevronRight size={14}/>
          </Link>
        </div>
      </div>

      {/* Bottom edge fade-out line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent"/>
    </section>

    {/* ═══════════════════════════════════════════════════════════════════
        DESKTOP HERO — hidden on mobile, shown on md+ (UNTOUCHED)
    ═══════════════════════════════════════════════════════════════════ */}
    <section className="relative hidden min-h-[980px] overflow-hidden pt-24 md:block">
      <Image src="/tech-tatva-hero.png" alt="" fill priority sizes="100vw" className="object-cover object-center opacity-60"/>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_18%,rgba(217,70,239,.28),transparent_34%),radial-gradient(circle_at_18%_35%,rgba(124,58,237,.28),transparent_32%),radial-gradient(circle_at_52%_46%,rgba(253,186,116,.12),transparent_36%),linear-gradient(180deg,rgba(5,4,10,.24),#060509_88%)]"/>
      <div className="absolute inset-0 grid-bg opacity-[.16]"/>
      <div className="absolute left-1/2 top-28 h-72 w-72 -translate-x-1/2 rounded-full bg-fuchsia-500/10 blur-[100px]"/>

      {/* Interactive Hologram 3D Core */}
      <InteractiveHero3D />

      <div className="relative mx-auto grid min-h-[790px] max-w-7xl xl:max-w-[1380px] 2xl:max-w-[1536px] items-center gap-8 px-6 py-16 lg:grid-cols-[1.05fr_.75fr]">
        <Reveal>
          <div>
            <p className="text-[10px] font-semibold tracking-[.34em] text-violet-200/80">TECH TATVA</p>
            <h1 className="mt-6 max-w-5xl text-7xl font-semibold leading-[1.1] tracking-[-0.04em] text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.12)] lg:text-[104px] lg:leading-[1.05]">
              Enter the next room.
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-9 text-white/62">
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
 
            <div className="mt-10 flex flex-wrap gap-3">
              {driveStatus && driveStatus.registrationEnabled ? (
                <>
                  <Link href="/join" className="action-pill group flex min-h-14 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition hover:-translate-y-0.5 text-black shadow-[0_0_20px_rgba(236,72,153,0.22)] hover:shadow-[0_0_30px_rgba(236,72,153,0.35)]">
                    Join Tech Tatva <ArrowRight size={16} className="transition group-hover:translate-x-0.5"/>
                  </Link>
                  <Link href="/events" className="ghost-pill flex min-h-14 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm transition hover:-translate-y-0.5 hover:border-violet-200/35">
                    Browse registrations <ChevronRight size={16}/>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/events" className="action-pill group flex min-h-14 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition hover:-translate-y-0.5 text-black shadow-[0_0_20px_rgba(236,72,153,0.22)] hover:shadow-[0_0_30px_rgba(236,72,153,0.35)]">
                    Browse registrations <ArrowRight size={16} className="transition group-hover:translate-x-0.5"/>
                  </Link>
                </>
              )}
              <Link href="/teams" className="ghost-pill flex min-h-14 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm transition hover:-translate-y-0.5 hover:border-violet-200/35">
                Explore teams <ChevronRight size={16}/>
              </Link>
            </div>
          </div>
        </Reveal>

        <Reveal delay={.12}>
          <div className="relative mt-0 block">
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

      <div className="relative mx-auto grid max-w-7xl xl:max-w-[1380px] 2xl:max-w-[1536px] grid-cols-3 gap-3 px-6 md:grid-cols-5">{statRows.map(([n,l])=><div key={l} className="premium-card rounded-[1.75rem] px-7 py-7 transition duration-300 hover:-translate-y-1 hover:border-violet-200/25"><p className="text-4xl font-semibold tracking-[-.055em] text-white"><AnimatedCounter value={n} /></p><p className="mt-2 text-[10px] tracking-[.18em] text-white/38">{l.toUpperCase()}</p></div>)}</div>
    </section>
    <section className="mx-auto max-w-7xl xl:max-w-[1380px] 2xl:max-w-[1536px] px-5 py-20 md:px-6 md:py-28"><Reveal><SectionTitle eyebrow="LIVE SIGNAL" title="A calendar built for momentum." copy="Public events appear here when registrations are open or event details are published."/></Reveal>{events.length?<><div className="grid gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-4">{events.map((e,i)=><Reveal key={e.slug} delay={i*.08}><EventCard event={e} index={i}/></Reveal>)}</div><Link href="/events" className="ghost-pill mt-7 inline-flex min-h-12 items-center gap-2 rounded-full px-5 py-3 text-sm">View the complete calendar <ArrowUpRight size={15}/></Link></>:<EmptyState title="No public events yet." copy="Check back soon for upcoming sessions, workshops, and registrations."/>}</section>
    <section className="border-y border-white/[.06] bg-white/[.018]"><div className="mx-auto grid max-w-7xl xl:max-w-[1380px] 2xl:max-w-[1536px] gap-10 px-5 py-20 md:px-6 md:py-28 lg:grid-cols-[.9fr_1.1fr] lg:gap-14"><Reveal><SectionTitle eyebrow="ONE SYSTEM / MANY DISCIPLINES" title="Teams building the future." copy="Explore the public team structure and the disciplines behind club work."/><Link className="ghost-pill inline-flex min-h-12 items-center gap-2 rounded-full px-5 py-3 text-sm" href="/teams">Explore the network <ArrowRight size={15}/></Link></Reveal><div className="grid gap-4 sm:grid-cols-2">{teams.length?teams.slice(0,6).map((team,i)=><Reveal key={team.id} delay={i*.04}><div className="premium-card group rounded-2xl p-5 transition duration-300 hover:-translate-y-1 hover:border-violet-300/25"><div className="flex justify-between"><Orbit size={18} className="text-violet-300"/><span className="rounded-full bg-white/[.045] px-3 py-1 text-xs text-white/35">{team.members}</span></div><h3 className="mt-7 text-base font-semibold text-white">{team.name}</h3><p className="mt-2 text-xs leading-5 text-white/40">{team.description || "Team details coming soon."}</p></div></Reveal>):<EmptyState title="Team information is coming soon." copy="The public team structure has not been published yet."/>}</div></div></section>
    
    {driveStatus && driveStatus.status !== "closed" && (
      <section className="border-b border-white/[.06] bg-gradient-to-b from-[#0c0512] to-[#040206] py-20 md:py-28">
        <div className="mx-auto max-w-7xl xl:max-w-[1380px] 2xl:max-w-[1536px] px-5 md:px-6">
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

    {achievements.length ? <section className="mx-auto max-w-7xl xl:max-w-[1380px] 2xl:max-w-[1536px] px-6 py-20"><div className="grid gap-4 md:grid-cols-3">{achievements.slice(0,3).map((item:any)=><div className="glass rounded-2xl p-6" key={item._id}><p className="text-[10px] tracking-[.2em] text-violet-300">{item.kind || "ACHIEVEMENT"}</p><p className="mt-4 text-lg text-white">{item.title}</p><p className="mt-2 text-xs leading-5 text-white/40">{item.description}</p></div>)}</div></section> : null}
    
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

    <section className="mx-auto max-w-7xl xl:max-w-[1380px] 2xl:max-w-[1536px] px-5 py-20 md:px-6 md:py-28"><div className="aurora-shell rounded-3xl px-6 py-12 md:px-16 md:py-16"><Zap className="absolute -right-6 -top-8 h-52 w-52 text-white/[.035]"/><p className="text-[10px] tracking-[.3em] text-violet-200">ACCESS THE NETWORK</p><h2 className="mt-6 max-w-2xl text-4xl font-medium tracking-tight md:text-6xl text-white">The future needs people who show up early.</h2><p className="mt-5 max-w-xl text-sm leading-7 text-white/50">Find your team, enter the room, and start making something that matters.</p><Link href="/contact" className="action-pill mt-8 inline-flex min-h-12 items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-black">Connect with us <ArrowUpRight size={15}/></Link></div></section>
  </PublicShell>;
}
