import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const SPONSOR_TIERS = [
  {
    tier: "ELITE SPONSORS",
    sponsors: [
      { name: "Intel", logo: "https://upload.wikimedia.org/wikipedia/commons/7/7d/Intel_logo_%282006-2020%29.svg" },
      { name: "Google Cloud", logo: "https://upload.wikimedia.org/wikipedia/commons/5/51/Google_Cloud_logo.svg" },
    ]
  },
  {
    tier: "PRIME SPONSORS",
    sponsors: [
      { name: "Github", logo: "https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg" },
      { name: "Vercel", logo: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Vercel_logo_black.svg" },
      { name: "MongoDB", logo: "https://upload.wikimedia.org/wikipedia/commons/9/93/MongoDB_Logo.svg" },
    ]
  },
  {
    tier: "STARTER SPONSORS",
    sponsors: [
      { name: "Notion", logo: "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png" },
      { name: "Figma", logo: "https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg" },
    ]
  }
];

export function TechnomaniaSponsors() {
  return (
    <section className="relative py-24 bg-black border-t border-zinc-900 overflow-hidden">
      {/* Ambient gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-white/[0.02] blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16 space-y-3">
          <span className="text-xs font-mono font-bold tracking-[0.2em] text-zinc-500 uppercase">
            POWERED BY
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase">
            OUR SPONSORS
          </h2>
          <div className="w-16 h-1 bg-white mx-auto mt-6" />
        </div>

        <div className="space-y-20">
          {SPONSOR_TIERS.map((tierData, idx) => (
            <motion.div
              key={tierData.tier}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center"
            >
              <h3 className="text-sm font-mono tracking-[0.3em] text-zinc-400 mb-8 border-b border-zinc-800 pb-2 px-8 text-center uppercase">
                {tierData.tier}
              </h3>
              
              <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20">
                {tierData.sponsors.map((sponsor) => (
                  <div key={sponsor.name} className="relative group grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-pointer">
                    <div className="relative w-28 h-12 md:w-40 md:h-16">
                      <Image
                        src={sponsor.logo}
                        alt={sponsor.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
