"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Asset {
  url: string;
  kind: "image" | "video";
  caption?: string;
}

export function GalleryLightbox({ assets, albumTitle }: { assets: Asset[]; albumTitle: string }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const nextAsset = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % assets.length);
  };

  const prevAsset = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex - 1 + assets.length) % assets.length);
  };

  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextAsset();
      if (e.key === "ArrowLeft") prevAsset();
      if (e.key === "Escape") setSelectedIndex(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    // Disable body scroll when lightbox is open
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [selectedIndex]);

  const activeAsset = selectedIndex !== null ? assets[selectedIndex] : null;

  return (
    <>
      {/* Grid Layout (Masonry Columns) */}
      {assets.length ? (
        <div className="mt-8 columns-1 gap-5 space-y-5 md:mt-10 md:columns-2">
          {assets.map((asset, index) => (
            <figure
              onClick={() => setSelectedIndex(index)}
              className="premium-card group mb-5 break-inside-avoid overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/[.035] cursor-pointer hover:border-violet-500/30 hover:shadow-[0_20px_45px_rgba(139,92,246,0.06)] transition-all duration-500"
              key={`${asset.url}-${index}`}
            >
              <div className="relative overflow-hidden bg-black">
                {asset.kind === "video" ? (
                  <video src={asset.url} muted playsInline className="max-h-[620px] w-full object-contain opacity-90 group-hover:opacity-100 group-hover:scale-[1.015] transition-all duration-700" />
                ) : (
                  <img src={asset.url} alt={asset.caption || `${albumTitle} ${index + 1}`} loading="lazy" className="max-h-[680px] w-full object-contain opacity-90 group-hover:opacity-100 group-hover:scale-[1.015] transition-all duration-700" />
                )}
                {/* Image number label */}
                <span className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/45 px-3 py-1 text-[10px] font-semibold uppercase tracking-[.18em] text-white/70 backdrop-blur">
                  {String(index + 1).padStart(2, "0")}
                </span>
                
                {/* Floating click indicator */}
                <span className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 rounded-full border border-violet-400/30 bg-violet-500/20 px-3 py-1 text-[9px] font-bold tracking-wider text-violet-200 backdrop-blur transition-opacity duration-300">
                  TAP TO EXPAND
                </span>
              </div>
              <figcaption className="border-t border-white/[.06] bg-gradient-to-br from-white/[.045] to-violet-500/[.045] p-5">
                <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.22em] text-violet-200/60">
                  <ImageIcon size={12} />
                  Caption
                </p>
                <p className="mt-2 text-sm leading-6 text-white/60 group-hover:text-white/80 transition duration-300">
                  {asset.caption || "A published moment from this album."}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <div className="premium-card mt-10 rounded-[1.6rem] p-10 text-center">
          <p className="text-lg">No media inside this album yet.</p>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/40">Add photos or videos from the portal and publish the album again.</p>
        </div>
      )}

      {/* Lightbox Immersive Overlay */}
      <AnimatePresence>
        {selectedIndex !== null && activeAsset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/96 backdrop-blur-2xl flex flex-col justify-between select-none"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-black/40 shrink-0">
              <div>
                <p className="text-[10px] font-bold text-fuchsia-300 tracking-[0.2em] uppercase">{albumTitle}</p>
                <p className="text-xs text-white/40 mt-0.5">
                  Item {selectedIndex + 1} of {assets.length}
                </p>
              </div>
              <button
                onClick={() => setSelectedIndex(null)}
                className="rounded-full p-2.5 text-white/40 hover:bg-white/[0.06] hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Centered Media Core */}
            <div className="flex-grow flex items-center justify-between px-4 sm:px-8">
              {/* Prev Button */}
              <button
                onClick={prevAsset}
                className="h-12 w-12 rounded-full bg-white/[0.02] border border-white/[0.06] text-white/40 hover:bg-white/[0.08] hover:text-white flex items-center justify-center transition active:scale-90"
              >
                <ChevronLeft size={20} />
              </button>

              {/* Central Box */}
              <div className="relative max-h-[72vh] max-w-[72vw] md:max-w-[76vw] flex items-center justify-center overflow-hidden">
                {activeAsset.kind === "video" ? (
                  <video src={activeAsset.url} controls autoPlay className="max-h-[72vh] max-w-full rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] object-contain" key={activeAsset.url} />
                ) : (
                  <img src={activeAsset.url} alt="" className="max-h-[72vh] max-w-full rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] object-contain" />
                )}
              </div>

              {/* Next Button */}
              <button
                onClick={nextAsset}
                className="h-12 w-12 rounded-full bg-white/[0.02] border border-white/[0.06] text-white/40 hover:bg-white/[0.08] hover:text-white flex items-center justify-center transition active:scale-90"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Caption Footer */}
            {activeAsset.caption && (
              <div className="border-t border-white/[0.05] bg-black/40 px-6 py-5 text-center shrink-0">
                <p className="max-w-2xl mx-auto text-sm leading-relaxed text-white/80 font-sans">
                  {activeAsset.caption}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
