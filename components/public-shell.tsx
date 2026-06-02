import Link from "next/link";
import { ArrowUpRight, Hexagon, Menu } from "lucide-react";
import { getClubInfo } from "@/lib/public-data";

export function Logo({ logo }: { logo?: string }) {
  return <Link href="/" className="flex items-center gap-3 font-semibold tracking-tight"><span className="grid h-9 w-9 place-items-center overflow-hidden rounded-xl border border-violet-400/40 bg-violet-500/10 text-violet-300">{logo?<img src={logo} alt="" className="h-full w-full object-cover"/>:<Hexagon size={18}/>}</span><span>TECH TATVA <i className="font-normal text-white/40">/ OS</i></span></Link>;
}
export async function PublicShell({ children }: { children: React.ReactNode }) {
  const info = await getClubInfo();
  return <main className="min-h-screen overflow-hidden bg-ink">
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[.06] bg-black/45 backdrop-blur-xl"><div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6"><Logo logo={info.logo}/><nav className="hidden gap-7 text-xs font-medium tracking-[.15em] text-white/50 lg:flex">{["ABOUT","EVENTS","TEAMS","GALLERY"].map(x=><Link className="transition hover:text-white" key={x} href={`/${x.toLowerCase()}`}>{x}</Link>)}</nav><div className="flex items-center gap-3">{info.website?<a href={info.website} target="_blank" rel="noreferrer" className="hidden rounded-full border border-white/10 px-5 py-2 text-xs font-medium tracking-wider text-white/70 transition hover:bg-white/10 md:block">WEBSITE</a>:null}<button className="rounded-full bg-white p-2.5 text-black lg:hidden"><Menu size={16}/></button></div></div></header>
    {children}
    <footer className="border-t border-white/[.06] px-6 py-14"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 md:flex-row"><Logo logo={info.logo}/><div className="max-w-sm text-sm leading-6 text-white/35">{info.footerCopy || "Ideas, events, teams, and stories from the Tech Tatva community."}</div><Link href="/contact" className="flex items-center gap-2 text-sm text-violet-300">Start a conversation <ArrowUpRight size={16}/></Link></div></footer>
  </main>;
}
