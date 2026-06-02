import { PublicShell } from "@/components/public-shell";
import { getClubInfo } from "@/lib/public-data";

export const dynamic = "force-dynamic";

export default async function About(){
  const info=await getClubInfo();
  const history=Array.isArray(info.history)?info.history:[];
  return <PublicShell><section className="mx-auto max-w-6xl px-6 pb-28 pt-40"><p className="text-[10px] tracking-[.3em] text-violet-300">OUR STORY</p><h1 className="mt-5 max-w-4xl text-6xl font-medium tracking-[-.07em] md:text-8xl">{info.aboutTitle || "About Tech Tatva"}</h1><p className="mt-7 max-w-2xl whitespace-pre-line text-base leading-8 text-white/45">{info.aboutCopy || "Club information has not been added yet. Admins can update this page from System Settings."}</p><div className="mt-20 grid gap-4 md:grid-cols-2">{[["VISION",info.vision],["MISSION",info.mission]].map(([a,b])=><div className="glass rounded-2xl p-7" key={a}><p className="text-[10px] tracking-[.2em] text-violet-300">{a}</p><p className="mt-6 text-xl leading-8 text-white/75">{b || "Not added yet."}</p></div>)}</div><h2 className="mt-24 text-3xl tracking-tight">Legacy timeline</h2>{history.length?<div className="mt-8 border-l border-violet-300/25">{history.map((item:any)=><div className="relative ml-6 border-b border-white/[.06] py-6" key={`${item.year}-${item.text}`}><i className="absolute -left-[29px] top-8 h-2 w-2 rounded-full bg-violet-400"/><p className="text-xs text-violet-300">{item.year}</p><p className="mt-2 text-sm text-white/50">{item.text}</p></div>)}</div>:<div className="edge mt-8 rounded-2xl bg-white/[.025] p-8 text-sm text-white/45">No timeline entries have been added yet.</div>}</section></PublicShell>
}
