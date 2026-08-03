import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Calendar, GraduationCap, Instagram, Github, Linkedin } from "lucide-react";
import { getClubInfo, getPublicEvents, getLatestPublicAnnouncement } from "@/lib/public-data";
import { eventHref } from "@/lib/event-links";
import { MotionLogo, SiteLoader } from "@/components/brand-motion";
import { MobilePublicMenu } from "@/components/mobile-public-menu";
import { PremiumBackground } from "@/components/premium-background";
import { NewsletterForm } from "@/components/newsletter-form";
import { QuoteBlock } from "@/components/quote-block";
import { FloatingAnnouncement } from "@/components/floating-announcement";

const publicLinks = [
  ["HOME", "/"],
  ["ABOUT", "/about"],
  ["RECRUITMENT", "/recruitment"],
  ["JOIN US", "/join"],
  ["EVENTS", "/events"],
  ["TEAMS", "/teams"],
  ["HALL OF FAME", "/hall-of-fame"],
  ["GALLERY", "/gallery"]
] as const;

const DiscordIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 127.14 96.36" fill="currentColor" className="transition group-hover:scale-110">
    <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.5-5c.9-.65,1.76-1.34,2.58-2a75.58,75.58,0,0,0,73.18,0c.81.71,1.68,1.4,2.58,2a68.69,68.69,0,0,1-10.5,5,77.7,77.7,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31.06-18.83C129.9,49.54,123.75,26.74,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.9,53,53.9,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.14,46,96.14,53,91,65.69,84.69,65.69Z" />
  </svg>
);

export async function PublicShell({ children }: { children: React.ReactNode }) {
  const [info, latestAnn] = await Promise.all([
    getClubInfo(),
    getLatestPublicAnnouncement()
  ]);
  
  // Load dynamic events and workshops for rich footer
  const events = await getPublicEvents(10);
  const now = new Date();
  const upcomingEvents = events.filter(e => !e.startAt || new Date(e.startAt) > now);
  const pastEvents = events.filter(e => e.startAt && new Date(e.startAt) <= now);

  const latestEvent = pastEvents[pastEvents.length - 1] || events[0] || null;
  const upcomingWorkshop = upcomingEvents.find(e => {
    const cat = (e.category || "").toLowerCase();
    const title = (e.title || "").toLowerCase();
    return cat.includes("workshop") || cat.includes("bootcamp") || title.includes("workshop") || title.includes("bootcamp");
  }) || null;

  return <main className="site-canvas min-h-screen overflow-hidden bg-ink">
    <SiteLoader logo={info.logo}/>
    
    {/* Premium Animated Parallax Particle Background */}
    <PremiumBackground />


    {/* Subtle Vignette & Depth Bloom Layer */}
    <div className="premium-vignette" aria-hidden="true" />

    <header className="public-header fixed inset-x-0 top-0 z-50">
      <div className="public-header-inner mx-auto flex max-w-7xl xl:max-w-[1380px] 2xl:max-w-[1536px] flex-row items-center justify-between px-5 py-4 md:mt-4 md:h-[4.75rem] md:px-5 md:py-0">
        <MotionLogo logo={info.logo}/>
        <nav className="public-nav hidden w-auto items-center gap-1 text-xs font-medium tracking-[.15em] text-white/50 md:flex">
          {publicLinks.map(([label,href])=><Link className="rounded-xl px-4 py-3 transition hover:bg-white/10 hover:text-white font-bold uppercase" key={href} href={href}>{label}</Link>)}
        </nav>
        <Link href="/contact" className="brutalist-btn-theme hidden min-h-11 items-center gap-2 rounded-xl px-5 text-xs font-bold tracking-[.12em] md:inline-flex shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)]">
          CONNECT <ArrowUpRight size={14}/>
        </Link>
        <MobilePublicMenu logo={info.logo}/>
      </div>
    </header>
    <div className="h-20 md:hidden" />
    {children}
    
    <footer className="public-footer px-5 pt-10 pb-24 md:px-6 md:pt-16 md:pb-20">
      <div className="glass-brutalist mx-auto max-w-7xl xl:max-w-[1380px] 2xl:max-w-[1536px] rounded-[2rem] p-6 md:p-8">
        
        {/* RICH FOOTER INFORMATION CARDS */}
        <div className="grid gap-4 sm:grid-cols-3 pb-8 mb-8 border-b border-white/[.06]">
          
          {/* Block 1: Latest Completed Event */}
          <div className="glass-brutalist rounded-[22px] p-5">
            <div className="flex items-center gap-2 text-purple-400 text-[10px] font-bold uppercase tracking-wider">
              <Calendar size={11} />
              <span>Latest Event</span>
            </div>
            {latestEvent ? (
              <div className="mt-3">
                <h5 className="text-xs font-bold text-white truncate">{latestEvent.title}</h5>
                <p className="mt-1 text-[10px] text-white/40 line-clamp-2 leading-relaxed">
                  {latestEvent.description || "Explore and register for Tech Tatva club events."}
                </p>
                <Link href={eventHref(latestEvent.slug)} className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-blue-400 hover:underline transition">
                  View details <ArrowUpRight size={10} />
                </Link>
              </div>
            ) : (
              <p className="mt-3 text-[10px] text-white/35 leading-relaxed">
                No past event documents active. Keep exploring for newly announced sessions!
              </p>
            )}
          </div>
 
          {/* Block 2: Upcoming Technical Workshop */}
          <div className="glass-brutalist rounded-[22px] p-5">
            <div className="flex items-center gap-2 text-purple-400 text-[10px] font-bold uppercase tracking-wider">
              <GraduationCap size={11} />
              <span>Upcoming Bootcamp</span>
            </div>
            {upcomingWorkshop ? (
              <div className="mt-3">
                <h5 className="text-xs font-bold text-white truncate">{upcomingWorkshop.title}</h5>
                <p className="mt-1 text-[10px] text-white/40 line-clamp-2 leading-relaxed">
                  {upcomingWorkshop.description || "Bootcamps and workshops led by seniors."}
                </p>
                <Link href={eventHref(upcomingWorkshop.slug)} className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-blue-400 hover:underline transition">
                  Register now <ArrowUpRight size={10} />
                </Link>
              </div>
            ) : (
              <p className="mt-3 text-[10px] text-white/35 leading-relaxed">
                No upcoming bootcamps scheduled right now. Check back soon!
              </p>
            )}
          </div>
 
          {/* Block 3: Dynamic Newsletter Subscription Form */}
          <NewsletterForm />
        </div>
 
        <div className="grid gap-8 lg:grid-cols-[1.05fr_.75fr_.5fr] lg:items-start">
          <div className="space-y-6">
            <div>
              <MotionLogo logo={info.logo}/>
              <p className="mt-6 max-w-xl text-sm leading-7 text-white/46">{info.footerCopy || "Ideas, events, teams, and stories from the Tech Tatva community."}</p>
            </div>
            {/* Random Tech Quote Block */}
            <div className="max-w-md">
              <QuoteBlock />
            </div>
          </div>
 
          <div className="grid grid-cols-2 gap-2 text-xs font-bold tracking-[.13em] text-white/52 sm:grid-cols-3">
            {[...publicLinks, ["CONTACT", "/contact"] as const].map(([label, href]) => (
              <Link href={href} key={href} className="glass-brutalist rounded-xl px-4 py-3 transition hover:border-purple-500/50 hover:text-white">
                {label}
              </Link>
            ))}
          </div>
          <Link href="/contact" className="brutalist-btn-theme flex min-h-14 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold border border-white/20 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)] text-white">Start a conversation <ArrowUpRight size={16}/></Link>
        </div>
        
        <div className="mt-10 border-t border-white/[.06] pt-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="text-[9px] font-bold tracking-[.2em] text-white/35 uppercase block mb-3">Affiliation</span>
            <div className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(139,92,246,0.6)] hover:scale-[1.02] transition duration-300">
              <Image
                src="/chandigarh-university-logo.png"
                alt="Chandigarh University"
                className="h-7 w-auto object-contain"
                width={100}
                height={50}
              />
            </div>
          </div>

          {/* Social Media Link Badges */}
          <div className="flex flex-wrap gap-2">
            <a 
              href={info.githubUrl || "https://github.com"} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.025] text-white/45 hover:border-white/15 hover:bg-white/[0.06] hover:text-white transition"
              aria-label="Tech Tatva GitHub Link"
            >
              <Github size={15} className="transition group-hover:scale-110" />
            </a>
            <a 
              href={info.discordUrl || "https://discord.gg"} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.025] text-white/45 hover:border-white/15 hover:bg-white/[0.06] hover:text-white transition"
              aria-label="Tech Tatva Discord Link"
            >
              <DiscordIcon size={15} />
            </a>
            <a 
              href={info.linkedinUrl || "https://linkedin.com"} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.025] text-white/45 hover:border-white/15 hover:bg-white/[0.06] hover:text-white transition"
              aria-label="Tech Tatva LinkedIn Link"
            >
              <Linkedin size={15} className="transition group-hover:scale-110" />
            </a>
          </div>
        </div>
      </div>
    </footer>
    <FloatingAnnouncement data={{
      announcementEnabled: latestAnn ? ((latestAnn as any).status === "published") : !!info.announcementEnabled,
      announcementText: latestAnn ? (latestAnn as any).title : (info.announcementText || ""),
      announcementLink: latestAnn ? "" : (info.announcementLink || ""),
      announcementLinkText: latestAnn ? "" : (info.announcementLinkText || ""),
      announcementType: latestAnn ? "info" : (info.announcementType || "info"),
      announcementDetails: latestAnn ? (latestAnn as any).body : (info.announcementDetails || ""),
    }} />
  </main>;
}

