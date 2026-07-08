import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { getPublicGalleryAlbum } from "@/lib/public-data";
import { GalleryLightbox } from "@/components/gallery-lightbox";

export const revalidate = 60;

export default async function GalleryAlbum({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const album = await getPublicGalleryAlbum(id);
  if (!album) notFound();
  const cover = album.assets?.[0];

  return (
    <PublicShell>
      <section className="mx-auto max-w-7xl xl:max-w-[1380px] 2xl:max-w-[1536px] px-5 pb-20 pt-32 md:px-6 md:pb-28 md:pt-44">
        <Link href="/gallery" className="ghost-pill inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[.18em] text-white/55 transition hover:text-white">
          <ArrowLeft size={14} />
          Back to gallery
        </Link>
        <div className="aurora-shell relative mt-6 overflow-hidden rounded-[2.2rem] p-6 md:rounded-[2.8rem] md:p-10">
          {cover?.url ? cover.kind === "video" ? (
            <video src={cover.url} muted playsInline className="absolute inset-0 h-full w-full object-cover opacity-[.18]" />
          ) : (
            <img src={cover.url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-[.18]" />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-br from-black via-black/76 to-violet-950/45" />
          <div className="pointer-events-none absolute right-[-8%] top-[-15%] h-72 w-72 rounded-full bg-fuchsia-400/14 blur-[110px]" />
          <div className="relative">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-[10px] font-semibold uppercase tracking-[.28em] text-violet-100/80">
              <Sparkles size={12} />
              Album overview
            </p>
            <h1 className="gradient-text mt-6 max-w-4xl text-[3.45rem] font-semibold leading-[.88] tracking-[-.075em] md:text-8xl">{album.title}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/50 md:text-base">
              Tap any published moment below to experience the album as a clean, media-first archive.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-full border border-violet-200/20 bg-violet-500/10 px-4 py-2 text-xs text-violet-100">{album.event || "Club gallery"}</span>
              <span className="rounded-full border border-white/10 bg-white/[.035] px-4 py-2 text-xs text-white/55">{album.assetCount || 0} media items</span>
              {album.eventDate ? <span className="rounded-full border border-white/10 bg-white/[.035] px-4 py-2 text-xs text-white/55">{new Date(album.eventDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span> : null}
            </div>
          </div>
        </div>

        <GalleryLightbox assets={album.assets || []} albumTitle={album.title} />
      </section>
    </PublicShell>
  );
}
