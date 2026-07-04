"use client";

import { Camera, Code, Cpu, Sparkles, Terminal } from "lucide-react";
import { Reveal } from "./reveal";

interface ShowcaseItem {
  id: string;
  title: string;
  category: string;
  image?: string;
  icon: any;
  date: string;
  description: string;
}

const FALLBACK_ITEMS: ShowcaseItem[] = [
  {
    id: "h-1",
    title: "Vortex Hackathon",
    category: "HACKATHONS",
    icon: Code,
    date: "March 2026",
    description: "36 hours of intense building, design thinking, and product pitches as teams compete to build real-world software solutions.",
  },
  {
    id: "w-1",
    title: "Systems & Web Assembly Bootcamp",
    category: "WORKSHOPS",
    icon: Terminal,
    date: "April 2026",
    description: "Deep dive sessions into memory safety, low-level concurrency, and compiling modern frontend code to WASM.",
  },
  {
    id: "g-1",
    title: "Engineering Scale guest sessions",
    category: "COLLABORATION",
    icon: Cpu,
    date: "May 2026",
    description: "Bringing together industry architects and students to brainstorm, plan, and architect high-throughput applications.",
  }
];

export function CommunityShowcase({ galleryData = [] }: { galleryData?: any[] }) {
  // Try to use real gallery assets if they have images
  const hasRealGallery = galleryData && galleryData.length > 0 && galleryData.some(g => g.assets && g.assets.length > 0);

  const displayItems = hasRealGallery 
    ? galleryData.slice(0, 3).map((item, index) => {
        const firstAsset = item.assets?.[0];
        return {
          id: item.id || `live-${index}`,
          title: item.title,
          category: item.event || "COMMUNITY EVENT",
          image: firstAsset?.url || undefined,
          icon: Camera,
          date: "Recently Published",
          description: firstAsset?.caption || "Tech Tatva community activity captured live.",
        };
      })
    : FALLBACK_ITEMS;

  return (
    <section className="border-t border-white/[.06] bg-white/[0.005] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-6">
        <Reveal>
          <div className="mb-14 max-w-2xl">
            <p className="mb-4 text-[10px] font-semibold tracking-[.3em] text-violet-300">COMMUNITY LIFE</p>
            <h2 className="text-3xl font-medium tracking-tight md:text-5xl text-white">Tech Tatva in action.</h2>
            <p className="mt-4 text-sm leading-7 text-white/45">
              Glimpses of active collaboration, late-night coding sessions, practical workshops, and mentorship inside the university.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-3">
          {displayItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.id} delay={i * 0.08}>
                <div className="premium-card group h-full rounded-[2rem] p-6 border border-white/[0.06] bg-white/[0.015] backdrop-blur-xl flex flex-col justify-between overflow-hidden">
                  
                  {/* Image/Visual Container */}
                  <div className="relative w-full aspect-[1.8/1] rounded-2xl overflow-hidden bg-black/40 border border-white/[0.04] mb-6 flex items-center justify-center">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="object-cover w-full h-full transition duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      // High-end abstract gradient representation if no image is present (with subtle bloom/glow)
                      <div className="absolute inset-0 bg-gradient-to-br from-violet-950/40 via-fuchsia-950/20 to-black flex flex-col items-center justify-center p-4">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(139,92,246,0.12),transparent_60%)]" />
                        <Icon className="h-8 w-8 text-violet-300/40 mb-2 transition duration-500 group-hover:scale-110 group-hover:text-violet-300" />
                        
                        {/* Production TODO Marker - Subtle and fits the developer-centric/Linear design language */}
                        <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-500/5 px-2.5 py-0.5 text-[8px] font-semibold tracking-wider text-violet-200/60 uppercase">
                          <Sparkles size={8} /> TODO: Add asset
                        </div>
                        
                        <span className="text-[9px] font-semibold tracking-widest text-white/20 uppercase">{item.category}</span>
                      </div>
                    )}
                  </div>

                  {/* Text Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[10px] font-semibold tracking-[0.2em] text-violet-300/70 uppercase">
                          {item.category}
                        </span>
                        <span className="text-[10px] text-white/30">
                          {item.date}
                        </span>
                      </div>
                      <h3 className="mt-3 text-lg font-semibold text-white tracking-tight group-hover:text-violet-100 transition-colors">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-xs leading-5 text-white/40">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
