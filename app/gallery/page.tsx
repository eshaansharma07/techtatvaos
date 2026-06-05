import Link from "next/link";
import { PublicShell } from "@/components/public-shell";
import { getPublicGallery } from "@/lib/public-data";

export const dynamic = "force-dynamic";

export default async function Gallery() {
  const albums = await getPublicGallery();
  return (
    <PublicShell>
      <section className="mx-auto max-w-7xl px-5 pb-20 pt-28 md:px-6 md:pb-28 md:pt-40">
        <div className="aurora-shell rounded-[2rem] px-6 py-10 md:px-12 md:py-12">
          <p className="text-[10px] font-semibold tracking-[.3em] text-violet-200">THE ARCHIVE</p>
          <h1 className="mt-5 max-w-3xl text-[3.8rem] font-medium leading-[.92] tracking-[-.07em] md:text-8xl">Proof of work.</h1>
          <p className="mt-5 max-w-xl text-[15px] leading-7 text-white/52 md:text-sm md:text-white/48">
            Event albums published by the club. Open an album to view every photo, video, and caption attached to that moment.
          </p>
        </div>

        {albums.length ? (
          <div className="mt-6 grid auto-rows-[300px] gap-4 md:mt-10 md:auto-rows-[240px] md:grid-cols-3">
            {albums.map((album: any, index: number) => {
              const asset = album.assets?.[0];
              return (
                <Link
                  href={`/gallery/${album.id}`}
                  key={album.id}
                  className={`premium-card group relative overflow-hidden rounded-[1.6rem] bg-gradient-to-br ${["from-violet-800 to-fuchsia-700", "from-zinc-800 to-purple-800", "from-rose-800 to-orange-700"][index % 3]} ${index === 0 || index === 4 ? "md:row-span-2" : ""}`}
                >
                  {asset?.url ? asset.kind === "video" ? (
                    <video src={asset.url} muted playsInline className="absolute inset-0 h-full w-full object-cover opacity-75 transition duration-700 group-hover:scale-105 group-hover:opacity-95" />
                  ) : (
                    <img src={asset.url} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-75 transition duration-700 group-hover:scale-105 group-hover:opacity-95" />
                  ) : null}
                  <div className="absolute inset-0 grid-bg opacity-25" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent p-5">
                    <p className="text-lg font-semibold">{album.title}</p>
                    <p className="mt-1 text-xs text-violet-100/70">{album.event || "Club gallery"}</p>
                    <p className="mt-3 text-[10px] uppercase tracking-[.22em] text-white/42">{album.assetCount || album.assets?.length || 0} media items / Album {String(index + 1).padStart(2, "0")}</p>
                  </div>
                  <span className="absolute right-4 top-4 rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[10px] tracking-wider text-white/70 backdrop-blur">OPEN ALBUM</span>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="premium-card mt-10 rounded-[1.6rem] p-10 text-center">
            <p className="text-lg">No gallery albums yet.</p>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/40">Photos, videos, and event albums will appear once an admin uploads and publishes them.</p>
          </div>
        )}
      </section>
    </PublicShell>
  );
}
