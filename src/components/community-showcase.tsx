"use client";
import Image from "next/image";

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
          category: item.event || "CLUB EVENT",
          image: firstAsset?.url || undefined,
          icon: Camera,
          date: "Recently Published",
          description: firstAsset?.caption || "Tech Tatva club activity captured live.",
        };
      })
    : FALLBACK_ITEMS;

  return (
    <section className="border-t border-white/10 bg-black/10 py-20 md:py-28 relative z-10">
      <div className="mx-auto max-w-7xl xl:max-w-[1380px] 2xl:max-w-[1536px] px-5 md:px-6">
        <Reveal>
          <div className="mb-14 max-w-2xl">
            <p className="mb-4 text-[10px] font-bold tracking-[.3em] text-blue-400">CLUB LIFE</p>
            <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl text-white">Tech Tatva in action.</h2>
            <p className="mt-4 text-sm leading-7 text-white/45">
              Glimpses of active collaboration, late-night coding sessions, practical workshops, and mentorship inside the university.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-3">
          {displayItems.map((item, i) => {
            const Icon = item.icon;
            const cardStyles = [
              "glass-brutalist",
              "glass-brutalist",
              "glass-brutalist"
            ];
            const activeCardStyle = cardStyles[i % cardStyles.length];

            const textStyles = [
              "text-blue-400",
              "text-purple-400",
              "text-orange-400"
            ];
            const activeTextStyle = textStyles[i % textStyles.length];

            return (
              <Reveal key={item.id} delay={i * 0.08}>
                <div className={`${activeCardStyle} group h-full rounded-[2rem] p-6 flex flex-col justify-between overflow-hidden`}>
                  
                  {/* Image/Visual Container */}
                  <div className="relative w-full aspect-[1.8/1] rounded-xl overflow-hidden bg-black/40 border-2 border-black mb-6 flex items-center justify-center">
                    {item.image ? (
                      <Image width={1200} height={1200} 
                        src={item.image} 
                        alt={item.title} 
                        className="object-cover w-full h-full transition duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      // High-end abstract representation if no image is present
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/20 via-black to-black flex flex-col items-center justify-center p-4">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(59,130,246,0.06),transparent_60%)]" />
                        <Icon className={`h-8 w-8 ${activeTextStyle} opacity-40 mb-2 transition duration-500 group-hover:scale-110 group-hover:opacity-100`} />
                        
                        {/* Production TODO Marker */}
                        <div className={`absolute top-3 right-3 flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2.5 py-0.5 text-[8px] font-bold tracking-wider uppercase ${activeTextStyle}`}>
                          <Sparkles size={8} /> TODO: Add asset
                        </div>
                        
                        <span className="text-[9px] font-bold tracking-widest text-white/20 uppercase">{item.category}</span>
                      </div>
                    )}
                  </div>

                  {/* Text Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-4">
                        <span className={`text-[10px] font-bold tracking-[0.2em] ${activeTextStyle} uppercase`}>
                          {item.category}
                        </span>
                        <span className="text-[10px] text-white/30 font-mono">
                          {item.date}
                        </span>
                      </div>
                      <h3 className={`mt-3 text-lg font-bold text-white tracking-tight group-hover:${activeTextStyle} transition-colors`}>
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
