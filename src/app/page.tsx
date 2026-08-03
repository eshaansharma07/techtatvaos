import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, ChevronRight, Orbit, Sparkles, Ticket, Users, Zap } from "lucide-react";
import { EventCard } from "@/components/event-card";
import { PublicShell } from "@/components/public-shell";
import { Reveal } from "@/components/reveal";
import { getPublicHomeData, getMembershipDriveStatus } from "@/lib/public-data";
import { eventHref } from "@/lib/event-links";
import { AnimatedCounter } from "@/components/animated-counter";
import { InteractiveHero3D } from "@/components/interactive-hero-3d";
import { CommunityShowcase } from "@/components/community-showcase";
import { InstagramFeed } from "@/components/instagram-feed";
import { MobileInteractiveSections } from "@/components/mobile-interactive";

export const revalidate = 10;

const SectionTitle = ({ eyebrow, title, copy }: { eyebrow: string; title: string; copy?: string }) => <div className="mb-10 max-w-2xl"><p className="mb-4 text-[10px] font-semibold tracking-[.3em] text-orange-400">{eyebrow}</p><h2 className="text-3xl font-medium tracking-tight md:text-5xl">{title}</h2>{copy&&<p className="mt-4 text-sm leading-7 text-white/45">{copy}</p>}</div>;
const EmptyState = ({ title, copy, href, action }: { title: string; copy: string; href?: string; action?: string }) => <div className="glass-brutalist rounded-[1.6rem] p-8 text-center"><p className="text-sm text-white/75">{title}</p><p className="mx-auto mt-3 max-w-md text-xs leading-6 text-white/42">{copy}</p>{href&&action?<Link className="brutalist-btn-theme mt-5 rounded-xl px-4 py-2 text-xs" href={href}>{action}</Link>:null}</div>;
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
    [String(stats.community || 0), "Student members"],
    [String(stats.events), "Published events"],
    [String(stats.teams), "Active teams"],
    [String(achievements.length), "Featured achievements"]
  ];
  return <PublicShell>
    {/* ═══════════════════════════════════════════════════════════════════
        MOBILE HERO — Center-aligned, dramatic, minimal (md:hidden)
        Height accounts for the h-20 (5rem) spacer in public-shell.
    ═══════════════════════════════════════════════════════════════════ */}
    <section className="relative flex flex-col items-center justify-center px-6 py-24 sm:py-32 overflow-hidden md:hidden spatial-grid-bg">
      {/* Cinematic background */}
      <Image src="/tech-tatva-hero-v2.png" alt="" fill priority sizes="100vw" className="object-cover object-[center_30%] opacity-40 mix-blend-overlay"/>
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/70 to-black"/>

      {/* 3D Hologram added to mobile! */}
      <div className="absolute inset-0 z-0 opacity-70">
        <InteractiveHero3D />
      </div>

      <div className="relative z-50 flex w-full max-w-sm flex-col items-center text-center mt-8">
        {/* Active Session Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/40 bg-purple-500/20 px-4 py-1.5 text-[11px] font-bold text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.3)] mb-6 backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-400"></span>
          </span>
          ACTIVE SESSION
        </div>

        {/* Main headline - Fixed text disappearing in iOS Safari */}
        <h1 className="text-[3rem] font-extrabold leading-[1.05] tracking-[-0.04em] text-white drop-shadow-md">
          Enter the <br />
          <span className="inline-block mt-1 text-purple-400 shadow-purple-500/20">
            next room.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 max-w-[280px] text-[15px] leading-relaxed text-white/70 backdrop-blur-sm rounded-xl px-2 py-1">
          Where students build, compete, and create what comes next.
        </p>

        {/* Primary CTA Buttons */}
        <div className="mt-12 flex w-full flex-col gap-4 relative z-50">
          {driveStatus && driveStatus.registrationEnabled ? (
            <Link
              href="/join"
              className="brutalist-btn-purple relative flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-[15px] font-extrabold text-black shadow-[0_0_30px_rgba(168,85,247,0.5)] transition active:scale-95 cursor-pointer"
            >
              Join the club <ArrowRight size={18} className="transition group-active:translate-x-1" />
            </Link>
          ) : (
            <Link
              href="/events"
              className="brutalist-btn-cyan relative flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-[15px] font-extrabold text-black shadow-[0_0_30px_rgba(6,182,212,0.5)] transition active:scale-95 cursor-pointer"
            >
              Explore events <ArrowRight size={18} className="transition group-active:translate-x-1" />
            </Link>
          )}
          <Link
            href="/teams"
            className="brutalist-btn-dark relative flex h-14 w-full items-center justify-center gap-2 rounded-2xl transition active:scale-95 cursor-pointer"
          >
            Meet the teams <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </section>

    {/* ═══════════════════════════════════════════════════════════════════
        DESKTOP HERO — hidden on mobile, shown on md+
    ═══════════════════════════════════════════════════════════════════ */}
    <section className="relative hidden min-h-[980px] overflow-hidden pt-24 md:block spatial-grid-bg">
      <div className="mirror-floor" />
      <Image src="/tech-tatva-hero-v2.png" alt="" fill priority sizes="100vw" className="object-cover object-center opacity-20 mix-blend-overlay"/>
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-black"/>
      <div className="absolute inset-0 grid-bg opacity-[.06]"/>

      {/* Interactive Hologram 3D Core */}
      <InteractiveHero3D />

      <div className="relative mx-auto grid min-h-[790px] max-w-7xl xl:max-w-[1380px] 2xl:max-w-[1536px] items-center gap-8 px-6 py-16 lg:grid-cols-[1.05fr_.75fr]">
        <Reveal>
          <div>
            <p className="text-[10px] font-semibold tracking-[.34em] text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-orange-400">TECH TATVA</p>
            <h1 className="mt-6 max-w-5xl text-7xl font-extrabold leading-[1.1] tracking-[-0.04em] text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.06)] lg:text-[104px] lg:leading-[1.05]">
              Enter the nex<span className="slice-t">t</span> <span className="font-extrabold italic text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/30">room.</span>
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-9 text-white/62">
              Discover real club events, register as a candidate, explore teams, and follow the work Tech Tatva publishes for students.
            </p>
 

 
            <div className="mt-10 flex flex-wrap gap-4">
              {driveStatus && driveStatus.registrationEnabled ? (
                <>
                  <Link href="/join" className="brutalist-btn-theme rounded-2xl px-6 py-3.5 text-sm font-semibold">
                    Join Tech Tatva <ArrowRight size={16} className="transition group-hover:translate-x-0.5"/>
                  </Link>
                  <Link href="/events" className="brutalist-btn-theme rounded-2xl px-6 py-3.5 text-sm">
                    Browse registrations <ChevronRight size={16}/>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/events" className="brutalist-btn-theme rounded-2xl px-6 py-3.5 text-sm font-semibold">
                    Browse registrations <ArrowRight size={16} className="transition group-hover:translate-x-0.5"/>
                  </Link>
                </>
              )}
              <Link href="/teams" className="brutalist-btn-theme rounded-2xl px-6 py-3.5 text-sm">
                Explore teams <ChevronRight size={16}/>
              </Link>
            </div>
          </div>
        </Reveal>

        <Reveal delay={.12}>
          <div className="grid gap-4 grid-cols-2">
            {/* Bento Box 1: Next Event Details (Col Span 2) */}
            <div className="col-span-2 glass-brutalist rounded-[2rem] p-6 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_20%,rgba(168,85,247,0.02),transparent_40%)] pointer-events-none" />
              <div>
                <div className="flex items-center justify-between">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/[0.04] border border-white/10 text-white"><Ticket size={16}/></span>
                  <span className={nextEvent?.registrationOpen ? "rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-[9px] font-bold tracking-[.18em] text-blue-400 uppercase" : "rounded-xl border border-white/10 bg-white/[0.05] px-3 py-1 text-[9px] font-bold tracking-[.18em] text-white/45 uppercase"}>
                    {nextEvent ? nextEvent.registrationOpen ? "REGISTRATION OPEN" : "EVENT LIVE" : "NO ACTIVE EVENT"}
                  </span>
                </div>
                <p className="mt-8 text-[9px] font-bold tracking-[.3em] text-white/35">NEXT EVENT SIGNAL</p>
                <h3 className="mt-2 text-2xl font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors">{nextEvent?.title || "Events will appear here"}</h3>
                <p className="mt-3 text-xs leading-6 text-white/40 line-clamp-3">{nextEvent?.description || "When the admin publishes an event, candidates will see it here and can register from the event page."}</p>
              </div>

              <div className="mt-6 border-t border-white/[0.05] pt-5">
                <div className="grid grid-cols-2 gap-4 text-xs font-mono mb-5">
                  <div>
                    <span className="text-[9px] text-white/30 uppercase tracking-wider block">VENUE</span>
                    <span className="text-white/80 block mt-1 truncate">{nextEvent?.venue || "TBA"}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-white/30 uppercase tracking-wider block">PARTICIPATION</span>
                    <span className="text-white/80 block mt-1 capitalize">{nextEvent?.participationMode || "Open"}</span>
                  </div>
                </div>
                <Link href={nextEvent ? eventHref(nextEvent.slug) : "/events"} className="brutalist-btn flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold text-black border-2 border-black w-full">
                  {nextEvent ? "Open event page" : "View events"} <ArrowUpRight size={14}/>
                </Link>
              </div>
            </div>

            {/* Bento Box 2: Core Members (Col Span 1) */}
            <div className="glass-brutalist rounded-[2rem] p-5 flex flex-col justify-between min-h-[140px]">
              <Users size={16} className="text-white/50" />
              <div>
                <p className="text-3xl font-extrabold text-white tracking-tight"><AnimatedCounter value={stats.members} /></p>
                <p className="mt-1 text-[9px] font-bold tracking-[.15em] text-white/30 uppercase">CORE MEMBERS</p>
              </div>
            </div>

            {/* Bento Box 3: Events Count (Col Span 1) */}
            <div className="glass-brutalist rounded-[2rem] p-5 flex flex-col justify-between min-h-[140px]">
              <Sparkles size={16} className="text-white/50" />
              <div>
                <p className="text-3xl font-extrabold text-white tracking-tight"><AnimatedCounter value={stats.events} /></p>
                <p className="mt-1 text-[9px] font-bold tracking-[.15em] text-white/30 uppercase">TOTAL EVENTS</p>
              </div>
            </div>

            {/* Bento Box 4: Student Members (Col Span 1) */}
            <div className="glass-brutalist rounded-[2rem] p-5 flex flex-col justify-between min-h-[140px]">
              <Users size={16} className="text-white/50" />
              <div>
                <p className="text-3xl font-extrabold text-white tracking-tight"><AnimatedCounter value={stats.community || 0} /></p>
                <p className="mt-1 text-[9px] font-bold tracking-[.15em] text-white/30 uppercase">COMMUNITY</p>
              </div>
            </div>

            {/* Bento Box 5: Live Join Club shortcut (Col Span 1) */}
            <Link href="/join" className="glass-brutalist rounded-[2rem] p-5 flex flex-col justify-between min-h-[140px] group transition-all duration-300 hover:border-white border-white/10 bg-white/[0.02] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.01] to-transparent pointer-events-none" />
              <div className="flex items-center justify-between">
                <span className="h-2.5 w-2.5 rounded-full bg-orange-500 animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.6)]" />
                <ArrowUpRight size={18} className="text-white/40 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
              <div>
                <p className="text-xl font-bold tracking-tight text-white group-hover:text-orange-400 transition-colors">JOIN CLUB</p>
              </div>
            </Link>
          </div>
        </Reveal>


      </div>


    </section>

    {/* Mobile interactive sections — swipeable carousels, touch cards */}
    <MobileInteractiveSections
      teams={teams.slice(0, 6).map(t => ({ id: t.id, name: t.name, description: t.description || "", members: t.members }))}
      events={events.map(e => ({ slug: e.slug, title: e.title, description: e.description || "", registrationOpen: !!e.registrationOpen, venue: e.venue }))}
      stats={{ members: stats.members, events: stats.events, community: stats.community || 0 }}
      driveStatus={driveStatus}
      achievements={achievements as any}
    />
    <section className="hidden md:block mx-auto max-w-7xl xl:max-w-[1380px] 2xl:max-w-[1536px] px-5 py-20 md:px-6 md:py-28"><Reveal><SectionTitle eyebrow="LIVE SIGNAL" title="A calendar built for momentum." copy="Public events appear here when registrations are open or event details are published."/></Reveal>{events.length?<><div className="grid gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-4">{events.map((e,i)=><Reveal key={e.slug} delay={i*.08}><EventCard event={e} index={i}/></Reveal>)}</div><Link href="/events" className="brutalist-btn-dark mt-7 inline-flex min-h-12 items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold">View the complete calendar <ArrowUpRight size={15}/></Link></>:<EmptyState title="No public events yet." copy="Check back soon for upcoming sessions, workshops, and registrations."/>}</section>

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
    <section className="hidden md:block border-y border-white/10 bg-black/10"><div className="mx-auto grid max-w-7xl xl:max-w-[1380px] 2xl:max-w-[1536px] gap-10 px-5 py-20 md:px-6 md:py-28 lg:grid-cols-[.9fr_1.1fr] lg:gap-14"><Reveal><SectionTitle eyebrow="ONE SYSTEM / MANY DISCIPLINES" title="Teams building the future." copy="Explore the public team structure and the disciplines behind club work."/><Link className="brutalist-btn-dark inline-flex min-h-12 items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold" href="/teams">Explore the network <ArrowRight size={15}/></Link></Reveal><div className="grid gap-4 sm:grid-cols-2">{teams.length?teams.slice(0,6).map((team,i)=><Reveal key={team.id} delay={i*.04}><div className="glass-brutalist group rounded-[22px] p-5 transition duration-300 hover:-translate-y-1 hover:border-blue-500/50"><div className="flex justify-between"><Orbit size={18} className="text-blue-400"/><span className="brutalist-btn-dark rounded-xl px-3 py-1 text-xs text-white/80 font-bold">{team.members}</span></div><h3 className="mt-7 text-base font-bold text-white">{team.name}</h3><p className="mt-2 text-xs leading-5 text-white/40">{team.description || "Team details coming soon."}</p></div></Reveal>):<EmptyState title="Team information is coming soon." copy="The public team structure has not been published yet."/>}</div></div></section>
    
    {driveStatus && driveStatus.status !== "closed" && (
      <section className="hidden md:block border-b border-white/10 py-20 md:py-28">
        <div className="mx-auto max-w-7xl xl:max-w-[1380px] 2xl:max-w-[1536px] px-5 md:px-6">
          <Reveal>
            <div className="max-w-xl">
              <p className="mb-4 text-[10px] font-bold tracking-[.3em] text-purple-400">MEMBERSHIP DRIVE</p>
              <h2 className="text-4xl font-extrabold tracking-tight md:text-6xl text-white">Join the Tech Tatva Club.</h2>
              <p className="mt-4 text-sm leading-7 text-white/45">
                Take your technical and creative skills to the next level. Connect with peers, participate in exclusive bootcamps, and build project portfolios that matter.
              </p>
            </div>
          </Reveal>
          
          <div className="grid gap-4 md:grid-cols-3 mt-10">
            {/* Box 1 (Col Span 2, Row Span 2) */}
            <Reveal delay={0.05} className="md:col-span-2 md:row-span-2">
              <div className="glass-brutalist rounded-[2.5rem] p-8 flex flex-col justify-between min-h-[300px] relative overflow-hidden group">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_80%,rgba(255,255,255,0.015),transparent_50%)] pointer-events-none" />
                <div>
                  <span className="rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-[9px] font-bold tracking-widest text-white/60 uppercase">01 / COLLABORATION</span>
                  <h3 className="text-2xl font-bold text-white mt-8 tracking-tight">Connect & Collaborate</h3>
                  <p className="mt-3 text-sm leading-6 text-white/40 max-w-xl">
                    Work alongside some of the best minds in programming, UI/UX design, marketing, and systems engineering. Build cross-functional projects together.
                  </p>
                </div>
              </div>
            </Reveal>

            {/* Box 2 (Col Span 1) */}
            <Reveal delay={0.1}>
              <div className="glass-brutalist rounded-[2.5rem] p-8 flex flex-col justify-between min-h-[190px]">
                <div>
                  <span className="rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-[9px] font-bold tracking-widest text-white/60 uppercase">02 / EDUCATION</span>
                  <h3 className="text-xl font-bold text-white mt-6 tracking-tight">Practical Learning</h3>
                  <p className="mt-2 text-xs leading-5 text-white/45">Gain access to internal workshops, hackathons, and technical projects to build out your resume.</p>
                </div>
              </div>
            </Reveal>

            {/* Box 3 (Col Span 1) */}
            <Reveal delay={0.15}>
              <div className="glass-brutalist rounded-[2.5rem] p-8 flex flex-col justify-between min-h-[190px]">
                <div>
                  <span className="rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-[9px] font-bold tracking-widest text-white/60 uppercase">03 / PERKS</span>
                  <h3 className="text-xl font-bold text-white mt-6 tracking-tight">Exclusive Perks</h3>
                  <p className="mt-2 text-xs leading-5 text-white/45">Get early registration benefits for all key club events, speaker sessions, and certificates of contribution.</p>
                </div>
              </div>
            </Reveal>

            {/* Box 4: Active banner (Col Span 3) */}
            {driveStatus.registrationEnabled && (
              <Reveal delay={0.2} className="md:col-span-3 mt-4">
                <div className="flex flex-col items-center justify-between gap-6 rounded-[2.5rem] glass-brutalist p-8 md:flex-row md:p-10 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.015),transparent_45%)] pointer-events-none" />
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold text-white tracking-tight">Registrations are currently active.</h3>
                    <p className="mt-2 text-xs text-white/50">Submit your registration details online and get verified instantly.</p>
                  </div>
                  <Link href="/join" className="brutalist-btn flex min-h-12 items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold border-2 border-black text-black relative z-10">
                    Join Club <ArrowRight size={14} />
                  </Link>
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </section>
    )}

    {achievements.length ? <section className="hidden md:block mx-auto max-w-7xl xl:max-w-[1380px] 2xl:max-w-[1536px] px-6 py-20"><div className="grid gap-4 md:grid-cols-3">{achievements.slice(0,3).map((item:any)=><div className="glass-brutalist rounded-[22px] p-6" key={item._id}><p className="text-[10px] tracking-[.2em] text-orange-400 font-bold">{item.kind || "ACHIEVEMENT"}</p><p className="mt-4 text-lg font-bold text-white">{item.title}</p><p className="mt-2 text-xs leading-5 text-white/40">{item.description}</p></div>)}</div></section> : null}
    
    {/* Real Human Presence: Community Showcase Grid */}
    <CommunityShowcase galleryData={gallery} />
 

  </PublicShell>;
}
