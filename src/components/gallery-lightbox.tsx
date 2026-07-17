"use client";
import Image from "next/image";

import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X, Image as ImageIcon, Video, LayoutGrid, MonitorPlay, Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary-client";

interface Asset {
  url: string;
  kind: "image" | "video";
  caption?: string;
}

// Stateful Premium Image Component to handle loading/errors gracefully
function GalleryImage({ src, alt, className = "", width = 800 }: { src: string; alt: string; className?: string; width?: number }) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");
  const [retryKey, setRetryKey] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setStatus("loading");
    if (imgRef.current && imgRef.current.complete) {
      setStatus("loaded");
    }
  }, [src, retryKey]);

  const optimizedSrc = optimizeCloudinaryUrl(src, width);

  return (
    <div className="relative w-full h-full min-h-[220px] bg-black/40 flex items-center justify-center overflow-hidden">
      {/* Animated Skeleton Loader */}
      {status === "loading" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
          {/* Pulsing visual core */}
          <div className="relative flex items-center justify-center">
            <div className="absolute h-12 w-12 rounded-full border-2 border-purple-500/20 animate-ping" />
            <div className="relative h-8 w-8 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
              <ImageIcon size={14} className="text-purple-400 animate-pulse" />
            </div>
          </div>
          <span className="mt-4 text-[9px] font-bold tracking-[0.2em] text-white/30 uppercase animate-pulse">
            LOADING ASSET
          </span>
        </div>
      )}

      {/* Error state with retry option */}
      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-red-950/10 backdrop-blur-sm border border-red-500/10 rounded-2xl">
          <AlertCircle size={24} className="text-rose-400/80 mb-2" />
          <p className="text-[10px] font-bold tracking-wider text-rose-300 uppercase">LOAD FAILED</p>
          <p className="mt-1 text-[9px] text-white/30 max-w-[180px] leading-relaxed">
            Connection timed out or resource is temporarily unavailable.
          </p>
          <button
            onClick={() => setRetryKey((k) => k + 1)}
            className="mt-3 flex items-center gap-1 bg-white/5 border border-white/10 hover:border-white/20 text-white/80 hover:text-white rounded-lg px-2.5 py-1 text-[9px] font-bold uppercase transition"
          >
            <RefreshCw size={8} /> Retry
          </button>
        </div>
      )}

      {/* Main Image tag */}
      <Image width={1200} height={1200}         ref={imgRef}
        key={`${src}-${retryKey}`}
        src={optimizedSrc}
        alt={alt}
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("error")}
        className={`${className} w-full h-full object-contain transition-all duration-700 ${
          status === "loaded" ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      />
    </div>
  );
}

export function GalleryLightbox({ assets, albumTitle }: { assets: Asset[]; albumTitle: string }) {
  const [viewMode, setViewMode] = useState<"cinema" | "grid">("cinema");
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const thumbnailScrollRef = useRef<HTMLDivElement>(null);

  const nextAsset = () => {
    if (!assets.length) return;
    setActiveIndex((prev) => (prev + 1) % assets.length);
  };

  const prevAsset = () => {
    if (!assets.length) return;
    setActiveIndex((prev) => (prev - 1 + assets.length) % assets.length);
  };

  // Keyboard navigation listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        if (lightboxIndex !== null) {
          setLightboxIndex((prev) => (prev !== null ? (prev + 1) % assets.length : null));
        } else if (viewMode === "cinema") {
          nextAsset();
        }
      }
      if (e.key === "ArrowLeft") {
        if (lightboxIndex !== null) {
          setLightboxIndex((prev) => (prev !== null ? (prev - 1 + assets.length) % assets.length : null));
        } else if (viewMode === "cinema") {
          prevAsset();
        }
      }
      if (e.key === "Escape") {
        setLightboxIndex(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewMode, lightboxIndex, assets.length]);

  // Sync scroll on thumbnail list selection
  useEffect(() => {
    if (thumbnailScrollRef.current && viewMode === "cinema") {
      const activeElement = thumbnailScrollRef.current.children[activeIndex] as HTMLElement;
      if (activeElement) {
        const container = thumbnailScrollRef.current;
        const scrollLeft = activeElement.offsetLeft - container.offsetWidth / 2 + activeElement.offsetWidth / 2;
        container.scrollTo({ left: scrollLeft, behavior: "smooth" });
      }
    }
  }, [activeIndex, viewMode]);

  const activeAsset = assets[activeIndex];
  const activeLightboxAsset = lightboxIndex !== null ? assets[lightboxIndex] : null;

  return (
    <div className="relative mt-10">
      {/* Switch Layout & Global Controls */}
      <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-8">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
          <span className="text-[10px] font-bold tracking-[0.25em] text-white/40 uppercase font-mono">
            {assets.length} ARCHIVED MOMENTS
          </span>
        </div>

        {/* Dynamic Mode Switch Pill */}
        <div className="inline-flex rounded-xl bg-white/[0.02] border border-white/5 p-1 select-none">
          <button
            onClick={() => setViewMode("cinema")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-bold tracking-wider uppercase transition ${
              viewMode === "cinema"
                ? "bg-purple-500 border border-black text-black shadow-[1px_1px_0px_0px_rgba(255,255,255,0.4)]"
                : "text-white/60 hover:text-white"
            }`}
          >
            <MonitorPlay size={12} /> Cinema View
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-bold tracking-wider uppercase transition ${
              viewMode === "grid"
                ? "bg-purple-500 border border-black text-black shadow-[1px_1px_0px_0px_rgba(255,255,255,0.4)]"
                : "text-white/60 hover:text-white"
            }`}
          >
            <LayoutGrid size={12} /> Grid View
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* CINEMA MODE EXHIBITION DECK */}
        {viewMode === "cinema" && activeAsset && (
          <motion.div
            key="cinema-deck"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]"
          >
            {/* Left Col: Cinematic Visual Canvas */}
            <div className="relative aspect-video rounded-[2rem] border border-white/10 overflow-hidden bg-black flex items-center justify-center group shadow-2xl">
              
              {/* Dynamic Widescreen Blurred Aura Backdrop */}
              {activeAsset.kind === "image" && (
                <div 
                  className="absolute inset-0 z-0 bg-cover bg-center filter blur-3xl opacity-20 scale-110 pointer-events-none transition-all duration-1000"
                  style={{ backgroundImage: `url(${optimizeCloudinaryUrl(activeAsset.url, 200)})` }}
                />
              )}

              {/* Ambient overlay shadows */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 z-10 pointer-events-none" />

              {/* Central Asset Frame */}
              <div className="relative z-10 w-full h-full p-4 flex items-center justify-center">
                {activeAsset.kind === "video" ? (
                  <video
                    src={activeAsset.url}
                    controls
                    autoPlay
                    muted
                    playsInline
                    className="max-h-full max-w-full rounded-xl object-contain shadow-2xl"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center cursor-zoom-in" onClick={() => setLightboxIndex(activeIndex)}>
                    <GalleryImage src={activeAsset.url} alt={activeAsset.caption || albumTitle} width={1200} className="rounded-xl shadow-2xl max-h-full max-w-full" />
                  </div>
                )}
              </div>

              {/* Left/Right floating slides button controls */}
              <button
                onClick={prevAsset}
                className="absolute left-6 top-1/2 -translate-y-1/2 z-20 h-11 w-11 rounded-full bg-black/60 border border-white/10 hover:border-purple-500/30 text-white hover:text-purple-400 flex items-center justify-center transition active:scale-95 shadow-lg backdrop-blur"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={nextAsset}
                className="absolute right-6 top-1/2 -translate-y-1/2 z-20 h-11 w-11 rounded-full bg-black/60 border border-white/10 hover:border-purple-500/30 text-white hover:text-purple-400 flex items-center justify-center transition active:scale-95 shadow-lg backdrop-blur"
              >
                <ChevronRight size={18} />
              </button>

              {/* Floating index tag */}
              <span className="absolute bottom-4 left-6 z-20 rounded-lg border border-white/10 bg-black/85 px-3 py-1.5 text-[9px] font-mono tracking-widest text-white/60 uppercase select-none">
                SLIDE {String(activeIndex + 1).padStart(2, "0")} / {String(assets.length).padStart(2, "0")}
              </span>
            </div>

            {/* Right Col: Details Panel & Dynamic Content */}
            <div className="glass-brutalist rounded-[2rem] p-6 md:p-8 flex flex-col justify-between min-h-[360px] relative overflow-hidden group">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_20%,rgba(168,85,247,0.02),transparent_40%)] pointer-events-none" />
              
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-[9px] font-bold tracking-widest text-white/50 uppercase">
                    <Sparkles size={8} className="text-purple-400" /> EXHIBITION LOG
                  </span>
                  <span className="text-[9px] font-mono tracking-widest text-white/30 uppercase">
                    {activeAsset.kind === "video" ? "MPEG-4 ARCHIVE" : "JPEG FORMAT"}
                  </span>
                </div>

                <p className="mt-8 text-[9px] font-bold tracking-[.3em] text-purple-400 uppercase">ACTIVE CAPTION</p>
                <h3 className="mt-3 text-lg leading-7 text-white/80 select-all font-sans font-medium">
                  {activeAsset.caption || "Tech Tatva club activity captured live."}
                </h3>
              </div>

              {/* Interactive bottom thumbnails list strip */}
              <div className="mt-8 pt-6 border-t border-white/5">
                <span className="text-[8px] font-mono tracking-[0.2em] text-white/30 uppercase block mb-3">
                  QUICK PREVIEW STRIP
                </span>
                <div 
                  ref={thumbnailScrollRef}
                  className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none snap-x"
                >
                  {assets.map((asset, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveIndex(i)}
                      className={`relative h-14 w-20 rounded-xl border overflow-hidden shrink-0 transition-all snap-center ${
                        i === activeIndex 
                          ? "border-purple-500 scale-102 ring-1 ring-[rgba(168, 85, 247, 1)]/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]" 
                          : "border-white/10 hover:border-white/30 opacity-40 hover:opacity-80"
                      }`}
                    >
                      {asset.kind === "video" ? (
                        <div className="h-full w-full bg-black/60 flex items-center justify-center">
                          <Video size={14} className="text-white/60" />
                        </div>
                      ) : (
                        <Image width={1200} height={1200} src={optimizeCloudinaryUrl(asset.url, 150)} alt="" className="h-full w-full object-cover" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* MODERN GRID GALLERY LAYOUT */}
        {viewMode === "grid" && (
          <motion.div
            key="grid-layout"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {assets.map((asset, index) => (
              <figure
                key={index}
                onClick={() => setLightboxIndex(index)}
                className="glass-brutalist group relative overflow-hidden rounded-[2rem] border border-white/10 hover:border-purple-500/30 hover:-translate-y-1.5 cursor-pointer shadow-lg transition-all duration-500 flex flex-col"
              >
                {/* Media frame */}
                <div className="relative aspect-[1.5/1] w-full overflow-hidden bg-black select-none border-b border-white/5">
                  {asset.kind === "video" ? (
                    <div className="h-full w-full flex items-center justify-center bg-black/80">
                      <Video size={36} className="text-purple-400 opacity-80 group-hover:scale-110 transition duration-500" />
                      <span className="absolute bottom-4 left-4 rounded-lg bg-black/60 border border-white/10 px-2 py-0.5 text-[8px] font-mono text-white/80">
                        VIDEO
                      </span>
                    </div>
                  ) : (
                    <GalleryImage src={asset.url} alt="" className="object-cover w-full h-full transition duration-700 group-hover:scale-103" />
                  )}
                  
                  {/* Image count index */}
                  <span className="absolute right-4 top-4 rounded-lg border border-white/10 bg-black/60 px-2.5 py-1 text-[8px] font-bold text-white/80 font-mono select-none">
                    MOMENT {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                {/* Caption slot */}
                <figcaption className="p-5 flex-grow flex flex-col justify-between bg-white/[0.01]">
                  <div>
                    <span className="text-[8px] font-bold tracking-[0.18em] text-purple-400 uppercase block font-mono">
                      {asset.kind === "video" ? "VIDEO ARCHIVE" : "IMAGE CAPTION"}
                    </span>
                    <p className="mt-2 text-xs leading-5 text-white/50 group-hover:text-white/80 line-clamp-2 transition duration-300 font-sans">
                      {asset.caption || "Tech Tatva club activity captured live."}
                    </p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* FULLSCREEN LIGHTBOX OVERLAY */}
      <AnimatePresence>
        {lightboxIndex !== null && activeLightboxAsset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/98 backdrop-blur-2xl flex flex-col justify-between select-none"
          >
            {/* Lightbox Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-black/40">
              <div>
                <p className="text-[10px] font-bold text-purple-400 tracking-[0.25em] uppercase font-mono">{albumTitle}</p>
                <p className="text-xs text-white/40 mt-0.5 font-mono">
                  MOMENT {lightboxIndex + 1} OF {assets.length}
                </p>
              </div>
              <button
                onClick={() => setLightboxIndex(null)}
                className="rounded-full p-2.5 border border-white/5 text-white/50 hover:bg-white/5 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Centered Media Core */}
            <div className="flex-grow flex items-center justify-between px-4 sm:px-8 relative">
              {/* Prev Button */}
              <button
                onClick={() => setLightboxIndex((prev) => (prev !== null ? (prev - 1 + assets.length) % assets.length : null))}
                className="h-12 w-12 rounded-full bg-white/[0.02] border border-white/10 text-white/40 hover:bg-white/5 hover:text-white flex items-center justify-center transition active:scale-90"
              >
                <ChevronLeft size={20} />
              </button>

              {/* Widescreen focal image container */}
              <div className="relative max-h-[74vh] max-w-[76vw] flex items-center justify-center overflow-hidden">
                {activeLightboxAsset.kind === "video" ? (
                  <video
                    src={activeLightboxAsset.url}
                    controls
                    autoPlay
                    className="max-h-[74vh] max-w-full rounded-xl shadow-2xl object-contain border border-white/5"
                    key={activeLightboxAsset.url}
                  />
                ) : (
                  <Image width={1200} height={1200}                     src={optimizeCloudinaryUrl(activeLightboxAsset.url, 1600)}
                    alt=""
                    className="max-h-[74vh] max-w-full rounded-xl shadow-2xl object-contain border border-white/5 transition-transform"
                  />
                )}
              </div>

              {/* Next Button */}
              <button
                onClick={() => setLightboxIndex((prev) => (prev !== null ? (prev + 1) % assets.length : null))}
                className="h-12 w-12 rounded-full bg-white/[0.02] border border-white/10 text-white/40 hover:bg-white/5 hover:text-white flex items-center justify-center transition active:scale-90"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Immersive Caption Footer */}
            <div className="border-t border-white/5 bg-black/40 px-6 py-6 text-center select-all">
              <p className="max-w-2xl mx-auto text-sm leading-relaxed text-white/80 font-sans">
                {activeLightboxAsset.caption || "Tech Tatva club activity captured live."}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
