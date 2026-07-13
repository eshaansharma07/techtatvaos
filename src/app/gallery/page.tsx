import Link from "next/link";
import { PublicShell } from "@/components/public-shell";
import { getPublicGallery } from "@/lib/public-data";
import { GalleryClient } from "./gallery-client";

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
 
        {/* Interactive Gallery Client */}
        <GalleryClient initialAlbums={albums} />
      </section>
    </PublicShell>
  );
}
