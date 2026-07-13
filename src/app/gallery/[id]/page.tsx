import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { getPublicGalleryAlbum } from "@/lib/public-data";
import { GalleryLightbox } from "@/components/gallery-lightbox";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary-client";

export const revalidate = 60;

export default async function GalleryAlbum({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const album = await getPublicGalleryAlbum(id);
  if (!album) notFound();
  const cover = album.assets?.[0];

  return (
    <PublicShell>
      <section className="mx-auto max-w-7xl xl:max-w-[1380px] 2xl:max-w-[1536px] px-5 pb-20 pt-32 md:px-6 md:pb-28 md:pt-44 spatial-grid-bg">
        <Link href="/gallery" className="brutalist-btn-dark inline-flex min-h-11 items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-[.18em] text-white transition">
          <ArrowLeft size={14} />
          Back to gallery
        </Link>
        <div className="glass-brutalist relative mt-6 overflow-hidden rounded-[2.2rem] p-6 md:rounded-[2.8rem] md:p-10 relative z-10">
          {cover?.url ? cover.kind === "video" ? (
            <video src={cover.url} muted playsInline className="absolute inset-0 h-full w-full object-cover opacity-[.18]" />
          ) : (
            <img src={optimizeCloudinaryUrl(cover.url, 800)} alt="" className="absolute inset-0 h-full w-full object-cover opacity-[.18]" />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-br from-black via-black/76 to-emerald-950/20" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-xl border-2 border-black bg-[#00FF66] px-4 py-1.5 text-[10px] font-bold tracking-[.28em] text-black shadow-[2px_2px_0px_0px_rgba(255,255,255,0.8)]">
              <Sparkles size={12} />
              Album overview
            </span>
            <h1 className="mt-6 max-w-4xl text-[3.45rem] font-extrabold leading-[.88] tracking-[-.075em] text-white md:text-8xl">{album.title}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/50 md:text-base">
              Tap any published moment below to experience the album as a clean, media-first archive.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-xl border-2 border-black bg-[#00FF66] px-4 py-2 text-xs font-bold text-black shadow-[2px_2px_0px_0px_rgba(255,255,255,0.8)]">{album.event || "Club gallery"}</span>
              <span className="glass-brutalist px-4 py-2 text-xs text-white/80 font-bold rounded-xl">{album.assetCount || 0} media items</span>
              {album.eventDate ? <span className="glass-brutalist px-4 py-2 text-xs text-white/80 font-bold rounded-xl">{new Date(album.eventDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span> : null}
            </div>
          </div>
        </div>
 
        <GalleryLightbox assets={album.assets || []} albumTitle={album.title} />
      </section>
    </PublicShell>
  );
}
