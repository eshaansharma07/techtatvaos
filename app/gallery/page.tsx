import Link from "next/link";
import { PublicShell } from "@/components/public-shell";
import { getPublicGallery } from "@/lib/public-data";

export const dynamic = "force-dynamic";

export default async function Gallery() {
  const albums = await getPublicGallery();
  return (
    <PublicShell>
      <section className="mx-auto max-w-7xl px-5 pb-20 pt-28 md:px-6 md:pb-28 md:pt-40">
        <div className="rounded-[2.4rem] border border-stone-200/80 bg-white px-6 py-10 shadow-[0_24px_80px_rgba(88,65,46,.08)] md:px-12 md:py-12">
          <p className="text-[10px] font-semibold tracking-[.3em] text-rose-500">THE ARCHIVE</p>
          <h1 className="mt-5 max-w-3xl text-[3.8rem] font-semibold leading-[.92] tracking-[-.075em] text-stone-950 md:text-8xl">Proof of work.</h1>
          <p className="mt-5 max-w-xl text-[15px] leading-7 text-stone-500 md:text-sm">
            Event albums published by the club. Open an album to view every photo, video, and caption attached to that moment.
          </p>
        </div>

        {albums.length ? (
          <div className="mt-6 columns-1 gap-5 md:mt-10 md:columns-2 xl:columns-3">
            {albums.map((album: any, index: number) => {
              const asset = album.assets?.[0];
              return (
                <Link
                  href={`/gallery/${album.id}`}
                  key={album.id}
                  className="group mb-5 block break-inside-avoid overflow-hidden rounded-[2rem] border border-stone-200/80 bg-white shadow-[0_24px_70px_rgba(88,65,46,.1)] transition duration-500 hover:-translate-y-1"
                >
                  <div className={`relative overflow-hidden bg-gradient-to-br ${["from-[#f6ead2] to-[#f8d8df]", "from-[#eee1ff] to-[#fff4dc]", "from-[#f8ded1] to-[#f6ead2]"][index % 3]}`}>
                    {asset?.url ? asset.kind === "video" ? (
                      <video src={asset.url} muted playsInline className="w-full object-cover transition duration-700 group-hover:scale-105" style={{ aspectRatio: index % 3 === 0 ? "4 / 5" : index % 3 === 1 ? "1 / 1" : "5 / 4" }} />
                    ) : (
                      <img src={asset.url} alt="" loading="lazy" className="w-full object-cover transition duration-700 group-hover:scale-105" style={{ aspectRatio: index % 3 === 0 ? "4 / 5" : index % 3 === 1 ? "1 / 1" : "5 / 4" }} />
                    ) : <div className="aspect-[4/5]" />}
                    <span className="absolute right-4 top-4 rounded-full bg-white/78 px-3 py-1 text-[10px] font-semibold tracking-wider text-stone-700 backdrop-blur">OPEN ALBUM</span>
                  </div>
                  <div className="p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[.24em] text-rose-500">Album title</p>
                    <p className="mt-2 text-2xl font-semibold leading-tight tracking-[-.045em] text-stone-950">{album.title}</p>
                    <p className="mt-2 text-xs font-medium text-stone-500">{album.event || "Club gallery"}</p>
                    <p className="mt-3 text-sm leading-6 text-stone-500">{asset?.caption || "Tap for more details and captions from this album."}</p>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-[10px] uppercase tracking-[.22em] text-stone-400">{album.assetCount || album.assets?.length || 0} media items / Album {String(index + 1).padStart(2, "0")}</p>
                      <span className="rounded-full border border-stone-200 bg-[#faf8f5] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.18em] text-stone-600">Tap for more details</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="premium-card mt-10 rounded-[1.6rem] p-10 text-center">
            <p className="text-lg font-medium text-stone-950">No gallery albums yet.</p>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-stone-500">Photos, videos, and event albums will appear once an admin uploads and publishes them.</p>
          </div>
        )}
      </section>
    </PublicShell>
  );
}
