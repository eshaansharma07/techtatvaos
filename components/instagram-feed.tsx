"use client";

import { Instagram, ArrowUpRight, Sparkles } from "lucide-react";
import { Reveal } from "./reveal";

interface InstagramPost {
  id: string;
  image?: string;
  url: string;
}

interface InstagramFeedProps {
  handle?: string;
  profileUrl?: string;
  post1_image?: string;
  post1_url?: string;
  post2_image?: string;
  post2_url?: string;
  post3_image?: string;
  post3_url?: string;
}

export function InstagramFeed({
  handle = "techtatva",
  profileUrl = "https://instagram.com",
  post1_image,
  post1_url = "https://instagram.com",
  post2_image,
  post2_url = "https://instagram.com",
  post3_image,
  post3_url = "https://instagram.com"
}: InstagramFeedProps) {
  
  // Format handle with @
  const displayHandle = handle.startsWith("@") ? handle : `@${handle}`;

  // Fallback cards if no custom posts are uploaded in settings
  const posts: InstagramPost[] = [
    {
      id: "ig-1",
      image: post1_image || undefined,
      url: post1_url
    },
    {
      id: "ig-2",
      image: post2_image || undefined,
      url: post2_url
    },
    {
      id: "ig-3",
      image: post3_image || undefined,
      url: post3_url
    }
  ];

  return (
    <section className="border-t border-white/[.06] bg-white/[0.002] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-6">
        <Reveal>
          <div className="mb-14 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p className="mb-4 text-[10px] font-semibold tracking-[.3em] text-violet-300">SOCIAL SIGNAL</p>
              <h2 className="text-3xl font-medium tracking-tight md:text-5xl text-white">Captured on Instagram.</h2>
              <p className="mt-4 text-sm leading-7 text-white/45">
                Join our community of builders online. We share design concepts, tech releases, and event recaps.
              </p>
            </div>
            <a 
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ghost-pill flex items-center justify-center gap-2 rounded-full px-5 py-3 text-xs tracking-wider transition hover:border-pink-500/35 hover:-translate-y-0.5 hover:text-white group max-w-fit"
            >
              <Instagram size={14} className="text-pink-300" />
              <span>FOLLOW {displayHandle.toUpperCase()}</span>
              <ArrowUpRight size={13} className="text-white/40 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-3">
          {posts.map((post, i) => (
            <Reveal key={post.id} delay={i * 0.08}>
              <a 
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="premium-card group block rounded-[2rem] border border-white/[0.06] bg-white/[0.015] p-3 aspect-square overflow-hidden hover:-translate-y-1 hover:border-pink-500/20 transition-all duration-300"
              >
                <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black/40 border border-white/[0.04] flex items-center justify-center">
                  {post.image ? (
                    <>
                      <img 
                        src={post.image} 
                        alt="Instagram Post Content" 
                        className="object-cover w-full h-full transition duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white">
                          <Instagram size={14} /> Open Post <ArrowUpRight size={12} />
                        </span>
                      </div>
                    </>
                  ) : (
                    // Aesthetic Abstract Gradient Placeholder with Admin Upload TODO
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-950/20 via-violet-950/10 to-black flex flex-col items-center justify-center p-6 text-center">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(236,72,153,0.08),transparent_60%)]" />
                      <Instagram className="h-8 w-8 text-pink-300/30 mb-2 transition duration-500 group-hover:scale-110 group-hover:text-pink-300" />
                      
                      <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full border border-pink-500/20 bg-pink-500/5 px-2.5 py-0.5 text-[8px] font-semibold tracking-wider text-pink-200/60 uppercase">
                        <Sparkles size={8} /> TODO: Add post
                      </div>
                      
                      <p className="text-[10px] font-semibold tracking-wider text-white/50 uppercase mt-2">Instagram Post {i + 1}</p>
                      <p className="text-[9px] text-white/30 leading-relaxed max-w-[160px] mt-1">
                        Go to Portal &rarr; Settings to upload an image and link.
                      </p>
                    </div>
                  )}
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
