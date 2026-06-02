import { PublicShell } from "@/components/public-shell";
import { getPublicGallery } from "@/lib/public-data";

export const dynamic = "force-dynamic";

export default async function Gallery(){
  const albums=await getPublicGallery();
  return <PublicShell><section className="mx-auto max-w-7xl px-6 pb-28 pt-40"><p className="text-[10px] tracking-[.3em] text-violet-300">THE ARCHIVE</p><h1 className="mt-5 text-6xl font-medium tracking-[-.07em] md:text-8xl">Proof of work.</h1>{albums.length?<div className="mt-12 grid auto-rows-[220px] gap-4 md:grid-cols-3">{albums.map((album:any,i:number)=>{const asset=album.assets?.[0];return <div key={album.id} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${["from-violet-800 to-fuchsia-700","from-zinc-800 to-purple-800","from-rose-800 to-orange-700"][i%3]} ${i===0||i===4?"md:row-span-2":""}`}>{asset?.url?<img src={asset.url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80"/>:null}<div className="absolute inset-0 grid-bg opacity-25"/><p className="absolute bottom-5 left-5 text-sm">{album.title}</p><span className="absolute right-4 top-4 text-[10px] tracking-wider text-white/60">{asset?.kind?.toUpperCase() || "ALBUM"} / {String(i+1).padStart(2,"0")}</span></div>})}</div>:<div className="edge mt-12 rounded-2xl bg-white/[.025] p-10 text-center"><p className="text-lg">No gallery albums yet.</p><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/40">Upload or add Cloudinary media URLs from the admin portal to publish albums.</p></div>}</section></PublicShell>
}
