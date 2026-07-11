import Link from "next/link";
import { PublicShell } from "@/components/public-shell";
import { getPublicGallery } from "@/lib/public-data";

export const revalidate = 60;

export default async function Gallery() {
  const albums = await getPublicGallery();
  return (
    <PublicShell>
      <section className="mx-auto max-w-7xl xl:max-w-[1380px] 2xl:max-w-[1536px] px-5 pb-20 pt-32 md:px-6 md:pb-28 md:pt-44 spatial-grid-bg">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(0,255,102,0.05),transparent_45%)] pointer-events-none" />
        {/* Header Block */}
        <div className="glass-brutalist rounded-[2rem] px-6 py-10 md:rounded-[2.6rem] md:px-14 md:py-14 relative z-10">
          <p className="text-[10px] font-bold tracking-[.34em] text-emerald-400 uppercase">THE ARCHIVE</p>
          <h1 className="mt-5 max-w-4xl text-3xl xs:text-5xl font-extrabold leading-[.86] tracking-[-.08em] text-white md:text-8xl">
            The Visual <span className="text-[#00FF66]">Archive.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-[15px] leading-8 text-white/56 md:text-base">
            Event albums published by the club. Open an album to view every photo, video, and caption attached to that moment.
          </p>
        </div>
 
        {/* Albums Grid */}
        {albums.length ? (
          <div className="relative z-10 mt-8 grid auto-rows-[420px] gap-5 md:mt-10 md:auto-rows-[340px] md:grid-cols-3">
            {albums.map((album: any, index: number) => {
              const asset = album.assets?.[0];
              return (
                <Link
                  href={`/gallery/${album.id}`}
                  key={album.id}
                  className={`glass-brutalist group relative overflow-hidden rounded-[2.2rem] transition-all duration-500 hover:border-emerald-500/50 hover:-translate-y-1 ${
                    index === 0 || index === 4 ? "md:row-span-2" : ""
                  }`}
                >
                  {/* Full-bleed media backing */}
                  {asset?.url ? asset.kind === "video" ? (
                    <video src={asset.url} muted playsInline autoPlay loop className="absolute inset-0 h-full w-full object-cover opacity-60 group-hover:opacity-75 group-hover:scale-105 transition-all duration-[800ms] ease-out" />
                  ) : (
                    <img src={asset.url} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-60 group-hover:opacity-75 group-hover:scale-105 transition-all duration-[800ms] ease-out" />
                  ) : null}
 
                  {/* Dark Vignette Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent z-10" />
 
                  {/* Watermark grid network pattern */}
                  <div className="absolute inset-0 grid-bg opacity-15 pointer-events-none" />
 
                  {/* Content Overlays */}
                  <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 z-20 flex flex-col justify-end min-h-[45%]">
                    <p className="text-[10px] font-bold uppercase tracking-[.25em] text-[#00FF66]">
                      ALBUM {String(index + 1).padStart(2, "0")}
                    </p>
                    <h2 className="mt-2 text-2xl font-bold leading-tight tracking-[-.04em] text-white group-hover:text-[#00FF66] transition duration-300">
                      {album.title}
                    </h2>
                    <p className="mt-1 text-xs text-white/50 font-mono">
                      {album.event || "Club Gallery Album"}
                    </p>
                    
                    {/* Hover slider info bar */}
                    <div className="overflow-hidden">
                      <div className="mt-4 flex items-center justify-between gap-3 transform translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out">
                        <span className="text-[9px] uppercase tracking-[.2em] text-white/35 font-mono">
                          {album.assetCount || album.assets?.length || 0} media items
                        </span>
                        <span className="brutalist-btn-green rounded-xl px-3.5 py-1.5 text-[9px] font-bold uppercase tracking-[.2em] text-black">
                          OPEN ALBUM
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="glass-brutalist mt-10 rounded-[1.6rem] p-10 text-center relative z-10">
            <p className="text-lg font-bold text-white">No gallery albums yet.</p>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/44">Photos, videos, and event albums will appear once an admin uploads and publishes them.</p>
          </div>
        )}
      </section>
    </PublicShell>
  );
}
