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
        <div className="mt-10 border-t border-white/[.06] pt-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="text-[9px] font-semibold tracking-[.2em] text-white/35 uppercase block mb-3">Affiliation</span>
            <div className="inline-flex items-center justify-center rounded-xl bg-white/[0.97] px-4 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.2)] hover:bg-white hover:scale-[1.02] transition duration-300">
              <img
                src="/chandigarh-university-logo.png"
                alt="Chandigarh University"
                className="h-7 w-auto object-contain"
                loading="lazy"
              />
            </div>
          </div>
          <div>
            <span className="text-[9px] font-semibold tracking-[.2em] text-white/35 uppercase block mb-3 md:text-right">Sponsors &amp; Partners</span>
            <div className="flex flex-wrap items-center gap-3 md:justify-end">
              <div className="flex h-11 items-center justify-center rounded-xl border border-white/[.06] bg-white/[.025] px-4 text-xs font-semibold tracking-wider text-white/35 select-none hover:bg-white/[.05] transition duration-300">
                IBM
              </div>
              <div className="flex h-11 items-center justify-center rounded-xl border border-dashed border-white/[.08] bg-transparent px-4 text-[10px] font-semibold tracking-wider text-white/20 select-none">
                + Partner
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  </main>;
}
