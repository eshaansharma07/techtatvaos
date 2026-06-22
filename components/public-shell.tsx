import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getClubInfo } from "@/lib/public-data";
import { MotionLogo, SiteLoader } from "@/components/brand-motion";
import { MobilePublicMenu } from "@/components/mobile-public-menu";

const publicLinks = [
  ["ABOUT", "/about"],
  ["RECRUITMENT", "/recruitment"],
  ["EVENTS", "/events"],
  ["TEAMS", "/teams"],
  ["HALL OF FAME", "/hall-of-fame"],
  ["GALLERY", "/gallery"]
] as const;

export async function PublicShell({ children }: { children: React.ReactNode }) {
  const info = await getClubInfo();
  return <main className="site-canvas min-h-screen overflow-hidden bg-ink">
    <SiteLoader logo={info.logo}/>
    <div className="site-backdrop" aria-hidden="true" />
    <header className="public-header fixed inset-x-0 top-0 z-50">
      <div className="public-header-inner mx-auto flex max-w-7xl flex-col gap-3 px-5 py-3 md:mt-4 md:h-[4.75rem] md:flex-row md:items-center md:justify-between md:px-5 md:py-0">
        <MotionLogo logo={info.logo}/>
        <nav className="public-nav hidden w-auto items-center gap-1 text-xs font-medium tracking-[.15em] text-white/50 md:flex">
          {publicLinks.map(([label,href])=><Link className="rounded-full px-4 py-3 transition hover:bg-white/[.07] hover:text-white" key={href} href={href}>{label}</Link>)}
        </nav>
        <Link href="/contact" className="public-header-cta hidden min-h-11 items-center gap-2 rounded-full px-5 text-xs font-semibold tracking-[.12em] md:inline-flex">
          CONNECT <ArrowUpRight size={14}/>
        </Link>
        <MobilePublicMenu/>
      </div>
    </header>
    <div className="h-9 md:hidden" />
    {children}
    <footer className="public-footer px-5 py-10 md:px-6 md:py-16">
      <div className="public-footer-card mx-auto max-w-7xl rounded-[2rem] p-6 md:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_.75fr_.5fr] lg:items-start">
          <div>
            <MotionLogo logo={info.logo}/>
            <p className="mt-6 max-w-xl text-sm leading-7 text-white/46">{info.footerCopy || "Ideas, events, teams, and stories from the Tech Tatva community."}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold tracking-[.13em] text-white/52 sm:grid-cols-3">
            {[...publicLinks, ["CONTACT", "/contact"] as const].map(([label, href]) => (
              <Link href={href} key={href} className="rounded-2xl border border-white/[.065] bg-white/[.035] px-4 py-3 transition hover:border-white/15 hover:bg-white/[.065] hover:text-white">
                {label}
              </Link>
            ))}
          </div>
          <Link href="/contact" className="action-pill flex min-h-14 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5">Start a conversation <ArrowUpRight size={16}/></Link>
        </div>
        <div className="university-affiliation">
          <span className="university-affiliation-label">A student club of</span>
          <img
            src="/chandigarh-university-logo.png"
            alt="Chandigarh University"
            className="university-affiliation-logo"
            loading="lazy"
          />
        </div>
      </div>
    </footer>
  </main>;
}
