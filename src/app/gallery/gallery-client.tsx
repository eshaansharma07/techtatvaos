"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Search, FolderOpen, Calendar, Image as ImageIcon, Video, Filter, Compass } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary-client";

interface Asset {
  url: string;
  kind: "image" | "video";
  caption?: string;
}

interface Album {
  id: string;
  title: string;
  event?: string | null;
  assets?: Asset[];
  assetCount?: number;
  eventDate?: string;
}

export function GalleryClient({ initialAlbums = [] }: { initialAlbums: Album[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Determine dynamic categories from database event tags
  const categories = useMemo(() => {
    const set = new Set<string>();
    initialAlbums.forEach(album => {
      if (album.event) {
        set.add(album.event.trim());
      }
    });
    return ["all", ...Array.from(set)];
  }, [initialAlbums]);

  // Filter albums based on search and category
  const filteredAlbums = useMemo(() => {
    return initialAlbums.filter(album => {
      const matchesSearch = 
        album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (album.event && album.event.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = 
        selectedCategory === "all" || 
        (album.event && album.event.trim() === selectedCategory);
      
      return matchesSearch && matchesCategory;
    });
  }, [initialAlbums, searchQuery, selectedCategory]);

  return (
    <div className="relative z-10">
      {/* Search & Filter Header Bar */}
      <Reveal delay={0.1}>
        <div className="mt-8 flex flex-col md:flex-row gap-4 items-center justify-between bg-white/[0.02] border border-white/10 rounded-[2rem] p-4 md:p-6 backdrop-blur">
          {/* Search Box */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 h-4 w-4" />
            <input
              type="text"
              placeholder="Search albums or event archives..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/5 focus:border-purple-500/30 text-white rounded-xl pl-11 pr-4 py-3 text-sm outline-none transition"
            />
          </div>

          {/* Filter Categories Pill Scroll */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            <span className="text-[10px] font-bold text-white/30 tracking-widest uppercase flex items-center gap-1.5 shrink-0 pl-1 mr-2">
              <Filter size={10} /> Filter:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition shrink-0 border ${
                  selectedCategory === cat
                    ? "bg-purple-500 border-black text-black shadow-[2px_2px_0px_0px_rgba(255,255,255,0.8)]"
                    : "bg-white/[0.02] border-white/5 text-white/60 hover:border-white/20 hover:text-white"
                }`}
              >
                {cat === "all" ? "SHOW ALL" : cat}
              </button>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Dynamic Results Count */}
      <div className="mt-6 flex items-center justify-between text-xs text-white/40 font-mono px-2">
        <span>ARCHIVE SEARCH RESULTS</span>
        <span>{filteredAlbums.length} ALBUMS FOUND</span>
      </div>

      {/* Albums Grid */}
      {filteredAlbums.length ? (
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAlbums.map((album, index) => {
            const coverAsset = album.assets?.[0];
            const hasVideo = coverAsset?.kind === "video";
            
            return (
              <Reveal key={album.id} delay={index * 0.05}>
                <Link
                  href={`/gallery/${album.id}`}
                  className="glass-brutalist group relative block overflow-hidden rounded-[2.2rem] transition-all duration-500 hover:border-purple-500/40 hover:-translate-y-1.5 min-h-[360px] flex flex-col justify-end"
                >
                  {/* Background Full-bleed Image/Video */}
                  <div className="absolute inset-0 z-0 bg-black overflow-hidden">
                    {coverAsset?.url ? (
                      hasVideo ? (
                        <video
                          src={coverAsset.url}
                          muted
                          playsInline
                          autoPlay
                          loop
                          className="h-full w-full object-cover opacity-45 group-hover:opacity-60 group-hover:scale-105 transition-all duration-[1000ms] ease-out"
                        />
                      ) : (
                        <img
                          src={optimizeCloudinaryUrl(coverAsset.url, 800)}
                          alt=""
                          className="h-full w-full object-cover opacity-45 group-hover:opacity-60 group-hover:scale-105 transition-all duration-[1000ms] ease-out"
                          loading="lazy"
                        />
                      )
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-purple-950/20 to-black flex items-center justify-center">
                        <FolderOpen size={48} className="text-white/10" />
                      </div>
                    )}
                    {/* Shadow Vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  </div>

                  {/* Ambient Glow backing (reveals on hover) */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(168,85,247,0.12),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                  {/* Grid Network Matrix */}
                  <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />

                  {/* Dynamic media indicators */}
                  <div className="absolute top-4 left-4 z-20 flex gap-2">
                    <span className="flex items-center gap-1 rounded-lg border border-white/10 bg-black/60 px-2.5 py-1 text-[8px] font-bold tracking-wider text-white/80 backdrop-blur uppercase">
                      {hasVideo ? <Video size={10} className="text-purple-400" /> : <ImageIcon size={10} className="text-purple-400" />}
                      {hasVideo ? "VIDEO COVER" : "IMAGE COVER"}
                    </span>
                  </div>

                  {/* Bottom details block */}
                  <div className="relative z-10 p-6 md:p-8 flex flex-col justify-end w-full">
                    <div className="flex items-center gap-2">
                      <span className="rounded-lg bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 text-[8px] font-bold tracking-widest text-purple-400 uppercase">
                        {album.event || "CLUB LIFE"}
                      </span>
                    </div>

                    <h2 className="mt-3 text-2xl font-bold leading-tight tracking-tight text-white group-hover:text-purple-400 transition-colors duration-300">
                      {album.title}
                    </h2>

                    {/* Metadata strip */}
                    <div className="mt-4 flex items-center gap-4 text-[10px] font-mono text-white/40 border-t border-white/5 pt-4">
                      <span className="flex items-center gap-1">
                        <ImageIcon size={11} /> {album.assetCount || album.assets?.length || 0} ITEMS
                      </span>
                      {album.eventDate && (
                        <span className="flex items-center gap-1">
                          <Calendar size={11} /> {new Date(album.eventDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" }).toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Action reveal */}
                    <div className="mt-4 overflow-hidden h-0 group-hover:h-8 transition-all duration-300 ease-in-out">
                      <span className="inline-flex items-center gap-1.5 text-[9px] font-bold tracking-wider text-purple-400 uppercase">
                        Explore Album <Compass size={11} className="animate-spin" style={{ animationDuration: "12s" }} />
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      ) : (
        <Reveal>
          <div className="glass-brutalist mt-10 rounded-[2.5rem] p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.02),transparent_50%)] pointer-events-none" />
            <FolderOpen className="mx-auto h-12 w-12 text-white/20 mb-4" />
            <h3 className="text-lg font-bold text-white">No albums match your search.</h3>
            <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-white/40">
              Try adjusting your filters, clearing your query, or searching for other event tags.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="brutalist-btn-purple mt-6 rounded-xl px-5 py-2.5 text-xs font-bold"
            >
              Clear filters
            </button>
          </div>
        </Reveal>
      )}
    </div>
  );
}
