import Link from "next/link";
import { ArrowUpRight, Github, Linkedin } from "lucide-react";
import { getClubInfo, getLatestPublicAnnouncement } from "@/lib/public-data";
import { MotionLogo, SiteLoader } from "@/components/brand-motion";
import { MobilePublicMenu } from "@/components/mobile-public-menu";
import { PremiumBackground } from "@/components/premium-background";
import { NewsletterForm } from "@/components/newsletter-form";
import { QuoteBlock } from "@/components/quote-block";
import { FloatingAnnouncement } from "@/components/floating-announcement";

import { ThemeToggle, HeaderThemeToggle } from "@/components/theme-toggle";

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

  return <main className="site-canvas min-h-screen overflow-hidden public-theme bg-zinc-50 text-black">
    <SiteLoader logo={info.logo}/>
    
    {/* Premium Animated Parallax Particle Background */}
    <PremiumBackground />

    <header className="public-header fixed inset-x-0 top-0 z-50">
      <div className="public-header-inner mx-auto flex max-w-7xl xl:max-w-[1380px] 2xl:max-w-[1536px] flex-row items-center justify-between px-5 py-4 md:mt-4 md:h-[4.75rem] md:px-5 md:py-0">
        <MotionLogo logo={info.logo}/>
        <nav className="public-nav hidden w-auto items-center gap-1 text-xs font-medium tracking-[.15em] text-white/50 md:flex">
          {publicLinks.map(([label,href])=><Link className="rounded-xl px-4 py-3 transition hover:bg-[#00FF66] hover:text-black font-bold uppercase" key={href} href={href}>{label}</Link>)}
        </nav>
        <div className="hidden md:flex items-center">
          <HeaderThemeToggle />
          <Link href="/contact" className="brutalist-btn-purple min-h-11 inline-flex items-center gap-2 rounded-xl px-5 text-xs font-bold tracking-[.12em] shadow-[2px_2px_0px_0px_rgba(255,255,255,0.8)]">
            CONNECT <ArrowUpRight size={14}/>
          </Link>
        </div>
        <MobilePublicMenu logo={info.logo}/>
      </div>
    </header>
    <div className="h-20 md:hidden" />
    {children}
    
    <footer className="public-footer px-5 py-10 md:px-6 md:py-16">
      <div className="glass-brutalist mx-auto max-w-7xl xl:max-w-[1380px] 2xl:max-w-[1536px] rounded-[2rem] p-6 md:p-8">
        
        {/* 2-Column Footer Layout */}
        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-start pb-8 border-b border-black/10">
          {/* Column 1: Brand Info & Socials */}
          <div className="space-y-6">
            <div>
              <MotionLogo logo={info.logo}/>
              <p className="mt-4 max-w-sm text-xs leading-6 text-black/60">{info.footerCopy || "Ideas, events, teams, and stories from the Tech Tatva community."}</p>
            </div>
            <div className="max-w-md">
              <QuoteBlock />
            </div>
          </div>

          {/* Column 2: Newsletter Form */}
          <NewsletterForm />
        </div>
        
        {/* Bottom copyright row with affiliation */}
        <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between text-[11px] text-black/40 font-medium">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="inline-flex items-center justify-center rounded-xl bg-white px-3 py-1.5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)]">
              <img
                src="/chandigarh-university-logo.png"
                alt="Chandigarh University"
                className="h-6 w-auto object-contain"
                loading="lazy"
              />
            </div>
            <span>© {new Date().getFullYear()} Tech Tatva Chandigarh University. All rights reserved.</span>
          </div>

          {/* Social Media Link Badges */}
          <div className="flex flex-wrap gap-2">
            <a 
              href={info.githubUrl || "https://github.com"} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black bg-white text-black hover:bg-[#00FF66] transition shadow-[2px_2px_0px_0px_#000000]"
              aria-label="Tech Tatva GitHub Link"
            >
              <Github size={15} className="transition group-hover:scale-110" />
            </a>
            <a 
              href={info.discordUrl || "https://discord.gg"} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black bg-white text-black hover:bg-[#00FF66] transition shadow-[2px_2px_0px_0px_#000000]"
              aria-label="Tech Tatva Discord Link"
            >
              <DiscordIcon size={15} />
            </a>
            <a 
              href={info.linkedinUrl || "https://linkedin.com"} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black bg-white text-black hover:bg-[#00FF66] transition shadow-[2px_2px_0px_0px_#000000]"
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
    <ThemeToggle />
  </main>;
}
