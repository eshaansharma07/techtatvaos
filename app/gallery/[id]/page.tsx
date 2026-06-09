import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicShell } from "@/components/public-shell";
import { getPublicGalleryAlbum } from "@/lib/public-data";

export const dynamic = "force-dynamic";

export default async function GalleryAlbum({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const album = await getPublicGalleryAlbum(id);
  if (!album) notFound();
  const cover = album.assets?.[0];

  return (
    <PublicShell>
      <section className="mx-auto max-w-7xl px-5 pb-20 pt-28 md:px-6 md:pb-28 md:pt-40">
        <Link href="/gallery" className="inline-flex items-center rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[.18em] text-stone-500 transition hover:border-rose-200 hover:text-stone-950">
          Back to gallery
        </Link>
        <div className="relative mt-6 overflow-hidden rounded-[2.5rem] border border-stone-200/80 bg-[#fffdf8] p-6 shadow-[0_30px_110px_rgba(82,52,30,.08)] md:p-10">
          {cover?.url ? cover.kind === "video" ? (
            <video src={cover.url} muted playsInline className="absolute inset-0 h-full w-full object-cover opacity-10" />
          ) : (
            <img src={cover.url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-10" />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-br from-[#fffdf8]/95 via-[#fffdf8]/84 to-[#f8e9de]/88" />
          <div className="relative">
            <p className="text-[10px] font-semibold uppercase tracking-[.3em] text-rose-400">Album overview</p>
            <h1 className="mt-5 max-w-4xl text-[3.4rem] font-semibold leading-[.9] tracking-[-.075em] text-stone-950 md:text-8xl">{album.title}</h1>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-full border border-stone-200 bg-white px-4 py-2 text-xs text-stone-600">{album.event || "Club gallery"}</span>
              <span className="rounded-full border border-stone-200 bg-white px-4 py-2 text-xs text-stone-600">{album.assetCount || 0} media items</span>
              {album.eventDate ? <span className="rounded-full border border-stone-200 bg-white px-4 py-2 text-xs text-stone-600">{new Date(album.eventDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span> : null}
            </div>
          </div>
        </div>

        {album.assets?.length ? (
          <div className="mt-8 columns-1 gap-5 md:mt-10 md:columns-2 xl:columns-3">
            {album.assets.map((asset: any, index: number) => (
              <figure className="mb-5 break-inside-avoid overflow-hidden rounded-[2rem] border border-stone-200/80 bg-white shadow-[0_22px_70px_rgba(82,52,30,.08)]" key={`${asset.url}-${index}`}>
                <div className="relative overflow-hidden bg-[#faf8f5]">
                  {asset.kind === "video" ? (
                    <video src={asset.url} controls playsInline className="w-full object-contain" />
                  ) : (
                    <img src={asset.url} alt={asset.caption || `${album.title} ${index + 1}`} loading="lazy" className="w-full object-contain" />
                  )}
                  <span className="absolute left-4 top-4 rounded-full border border-stone-200 bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[.18em] text-stone-600 backdrop-blur">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <figcaption className="border-t border-stone-200/80 p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[.22em] text-rose-400">Caption</p>
                  <p className="mt-2 text-sm leading-6 text-stone-600">{asset.caption || "A published moment from this album."}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-[1.6rem] border border-stone-200 bg-white p-10 text-center">
            <p className="text-lg text-stone-900">No media inside this album yet.</p>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-stone-500">Add photos or videos from the portal and publish the album again.</p>
          </div>
        )}
      </section>
    </PublicShell>
  );
}
