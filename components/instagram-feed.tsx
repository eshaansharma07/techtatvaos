"use client";
 
import { useEffect, useState } from "react";
import { Instagram, ArrowUpRight, Sparkles } from "lucide-react";
import { Reveal } from "./reveal";
 
interface InstagramPost {
  id: string;
  image?: string;
  url: string;
  caption?: string;
  timestamp?: string;
  isReel?: boolean;
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

function formatCaption(text?: string) {
  if (!text) return "";
  const words = text.split(/(\s+)/);
  return words.map((word, i) => {
    if (word.startsWith("#")) {
      return (
        <span key={i} className="text-pink-400 font-mono text-[10px] tracking-wide hover:underline">
          {word}
        </span>
      );
    }
    return word;
  });
}

function formatDate(timestamp?: string) {
  if (!timestamp) return "";
  try {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", { day: "2-digit", month: "short" }).toUpperCase();
  } catch {
    return "";
  }
}
 
export function InstagramFeed({
  handle = "techtatvaclub",
  profileUrl = "https://instagram.com/techtatvaclub",
  post1_image,
  post1_url = "https://instagram.com/techtatvaclub",
  post2_image,
  post2_url = "https://instagram.com/techtatvaclub",
  post3_image,
  post3_url = "https://instagram.com/techtatvaclub"
}: InstagramFeedProps) {
  
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [stats, setStats] = useState<{ followers: string; following: string; postsCount: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
 
  useEffect(() => {
    async function fetchLiveFeed() {
      let fetchedStats = null;
      try {
        const res = await fetch(`/api/instagram?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          if (data.stats) {
            fetchedStats = data.stats;
            setStats(data.stats);
          }
          if (data.posts && data.posts.length > 0) {
            setPosts(data.posts.slice(0, 3));
            setLoading(false);
            setMounted(true);
            return;
          }
        }
      } catch (err) {
        console.error("Live Instagram feed fetch failed, using manual fallback:", err);
      }
      
      // Fallback state
      setPosts([
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
      ]);
      
      // Fallback stats to correct baseline if API fetch didn't return them
      if (!fetchedStats) {
        setStats({ followers: "109", following: "34", postsCount: "40" });
      }
      setLoading(false);
      setMounted(true);
    }
 
    fetchLiveFeed();
  }, [post1_image, post1_url, post2_image, post2_url, post3_image, post3_url]);
  
  const displayHandle = handle.startsWith("@") ? handle : `@${handle}`;
 
  return (
    <section className="border-t border-white/[0.06] bg-[#050308] py-20 md:py-28 relative overflow-hidden">
      {/* Interactive holographic ambient glows */}
      <div className="absolute top-1/3 -left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-[#f9ce34]/5 via-[#ee2a7b]/10 to-[#6228d7]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 -right-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-[#6228d7]/5 via-[#ee2a7b]/10 to-[#f9ce34]/5 blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-5 md:px-6 relative">
        <Reveal>
          <div className="mb-16 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="max-w-2xl">
              <p className="mb-4 text-[10px] font-semibold tracking-[0.4em] text-pink-400 uppercase">SOCIAL CONNECT</p>
              <h2 className="text-4xl font-extrabold tracking-tight md:text-6xl text-white">Captured on Instagram.</h2>
              <p className="mt-4 text-sm leading-8 text-white/50">
                Join our active student club of builders. We post live updates, technology news, event announcements, and design highlights.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 shrink-0">
              <div className="inline-flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 backdrop-blur-xl">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
                </span>
                <Instagram size={14} className="text-pink-400" />
                <span className="text-xs font-semibold tracking-tight text-white">{displayHandle}</span>
                <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[8px] font-bold text-violet-300 uppercase tracking-wider">
                  OFFICIAL
                </span>
              </div>

              <a 
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="action-pill flex items-center justify-center gap-2 rounded-full px-6 py-3 text-xs tracking-wider transition hover:-translate-y-0.5 text-black font-semibold"
              >
                <span>VISIT PROFILE</span>
                <ArrowUpRight size={13} />
              </a>
            </div>
          </div>
        </Reveal>

        {/* Glassmorphic Cyber-Gauge Instagram Stats HUD */}
        <Reveal delay={0.04}>
          <div className="mb-14 grid gap-6 lg:grid-cols-[1.1fr_2fr] items-stretch">
            {/* Left Box: Futuristic Profile Core */}
            <div className="relative rounded-[2.5rem] border border-white/[0.08] bg-[#0c0814]/80 p-8 backdrop-blur-3xl shadow-2xl flex flex-col items-center justify-center overflow-hidden group">
              {/* Corner crosshairs for technical drafting aesthetic */}
              <div className="absolute top-3 left-3 text-white/10 font-mono text-[9px] select-none">+</div>
              <div className="absolute top-3 right-3 text-white/10 font-mono text-[9px] select-none">+</div>
              <div className="absolute bottom-3 left-3 text-white/10 font-mono text-[9px] select-none">+</div>
              <div className="absolute bottom-3 right-3 text-white/10 font-mono text-[9px] select-none">+</div>
              
              {/* Tech grid pattern */}
              <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.005)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.005)_50%,rgba(255,255,255,0.005)_75%,transparent_75%,transparent)] bg-[length:12px_12px] opacity-40 pointer-events-none" />

              <div className="flex flex-col sm:flex-row items-center gap-6 z-10 w-full justify-center">
                {/* Glowing reactor core avatar frame */}
                <div className="relative shrink-0 select-none">
                  {/* Rotating dashed outer circle */}
                  <div className="absolute inset-[-8px] rounded-full border border-dashed border-pink-500/30 animate-[spin_25s_linear_infinite]" />
                  {/* Glowing color gradient background */}
                  <div className="absolute inset-[-4px] rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] animate-pulse" />
                  <div className="relative grid h-20 w-20 place-items-center rounded-full bg-[#0c0814] text-white">
                    <Instagram size={36} className="text-pink-300 drop-shadow-[0_0_15px_rgba(238,42,123,0.55)] animate-pulse" />
                  </div>
                </div>

                <div className="text-center sm:text-left flex flex-col gap-1.5">
                  <div className="flex items-center gap-2.5 justify-center sm:justify-start">
                    <h3 className="text-2xl font-black tracking-tight text-white">
                      {displayHandle}
                    </h3>
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-pink-500 text-white shadow-lg shadow-pink-500/30">
                      <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </div>
                  <p className="text-[10px] font-black tracking-[0.25em] text-pink-400 uppercase">OFFICIAL CLUB HANDLE</p>
                </div>
              </div>
            </div>

            {/* Right Box: 3 Circular Cyber-Gauges */}
            <div className="grid gap-4 sm:grid-cols-3">
              {/* Gauge 1: Posts */}
              <div className="relative rounded-[2.5rem] border border-white/[0.06] bg-[#0c0814]/40 p-6 backdrop-blur-2xl transition duration-500 hover:border-pink-500/20 hover:bg-[#0c0814]/70 hover:-translate-y-1.5 group flex flex-col items-center justify-between overflow-hidden">
                <div className="absolute top-2 left-2 text-white/5 font-mono text-[8px] select-none">+</div>
                <div className="absolute top-2 right-2 text-white/5 font-mono text-[8px] select-none">+</div>
                
                {/* SVG Radial Gauge */}
                <div className="relative my-4 flex items-center justify-center">
                  <svg className="w-32 h-32 transform -rotate-90">
                    {/* Background track circle */}
                    <circle cx="64" cy="64" r="45" className="stroke-white/[0.03] stroke-[4] fill-none" />
                    {/* Animated gradient progress ring */}
                    <circle 
                      cx="64" 
                      cy="64" 
                      r="45" 
                      className="stroke-[#ee2a7b] stroke-[5] fill-none transition-all duration-[1200ms] ease-out drop-shadow-[0_0_8px_rgba(238,42,123,0.3)]" 
                      strokeDasharray="283" 
                      strokeDashoffset={mounted ? 283 - (283 * 0.4) : 283} 
                    />
                  </svg>
                  {/* Number inside circle */}
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-3xl font-black text-white tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                      {stats?.postsCount || "40"}
                    </span>
                  </div>
                </div>
                
                <span className="text-[10px] font-black tracking-[0.25em] text-white/35 group-hover:text-pink-400 transition-colors uppercase mt-2">
                  POSTS
                </span>
              </div>

              {/* Gauge 2: Followers */}
              <div className="relative rounded-[2.5rem] border border-white/[0.06] bg-[#0c0814]/40 p-6 backdrop-blur-2xl transition duration-500 hover:border-violet-500/20 hover:bg-[#0c0814]/70 hover:-translate-y-1.5 group flex flex-col items-center justify-between overflow-hidden">
                <div className="absolute top-2 left-2 text-white/5 font-mono text-[8px] select-none">+</div>
                <div className="absolute top-2 right-2 text-white/5 font-mono text-[8px] select-none">+</div>
                
                {/* SVG Radial Gauge */}
                <div className="relative my-4 flex items-center justify-center">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle cx="64" cy="64" r="45" className="stroke-white/[0.03] stroke-[4] fill-none" />
                    <circle 
                      cx="64" 
                      cy="64" 
                      r="45" 
                      className="stroke-[#6228d7] stroke-[5] fill-none transition-all duration-[1200ms] ease-out drop-shadow-[0_0_8px_rgba(98,40,215,0.3)]" 
                      strokeDasharray="283" 
                      strokeDashoffset={mounted ? 283 - (283 * 0.75) : 283} 
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-3xl font-black text-white tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                      {stats?.followers || "109"}
                    </span>
                  </div>
                </div>
                
                <span className="text-[10px] font-black tracking-[0.25em] text-white/35 group-hover:text-pink-400 transition-colors uppercase mt-2">
                  FOLLOWERS
                </span>
              </div>

              {/* Gauge 3: Following */}
              <div className="relative rounded-[2.5rem] border border-white/[0.06] bg-[#0c0814]/40 p-6 backdrop-blur-2xl transition duration-500 hover:border-[#f9ce34]/20 hover:bg-[#0c0814]/70 hover:-translate-y-1.5 group flex flex-col items-center justify-between overflow-hidden">
                <div className="absolute top-2 left-2 text-white/5 font-mono text-[8px] select-none">+</div>
                <div className="absolute top-2 right-2 text-white/5 font-mono text-[8px] select-none">+</div>
                
                {/* SVG Radial Gauge */}
                <div className="relative my-4 flex items-center justify-center">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle cx="64" cy="64" r="45" className="stroke-white/[0.03] stroke-[4] fill-none" />
                    <circle 
                      cx="64" 
                      cy="64" 
                      r="45" 
                      className="stroke-[#f9ce34] stroke-[5] fill-none transition-all duration-[1200ms] ease-out drop-shadow-[0_0_8px_rgba(249,206,52,0.3)]" 
                      strokeDasharray="283" 
                      strokeDashoffset={mounted ? 283 - (283 * 0.35) : 283} 
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-3xl font-black text-white tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                      {stats?.following || "34"}
                    </span>
                  </div>
                </div>
                
                <span className="text-[10px] font-black tracking-[0.25em] text-white/35 group-hover:text-pink-400 transition-colors uppercase mt-2">
                  FOLLOWING
                </span>
              </div>
            </div>
          </div>
        </Reveal>
 
        <div className="grid gap-6 md:grid-cols-3">
          {posts.map((post, i) => (
            <Reveal key={post.id} delay={i * 0.1} className="h-full">
              <a 
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="premium-card group flex flex-col justify-between h-full rounded-[2.2rem] border border-white/[0.06] bg-white/[0.015] p-3 hover:-translate-y-1.5 hover:border-pink-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-pink-500/5"
              >
                {/* Visual Container */}
                <div className="relative aspect-square w-full rounded-[1.6rem] overflow-hidden bg-black/40 border border-white/[0.04] flex items-center justify-center">
                  {post.image ? (
                    <>
                      <img 
                        src={post.image} 
                        alt="Instagram content" 
                        className="object-cover w-full h-full transition duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                      {/* Gradient overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Hover action overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-3 group-hover:translate-y-0">
                        <span className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md">
                          <Instagram size={14} /> Open Post <ArrowUpRight size={12} />
                        </span>
                      </div>
                    </>
                  ) : (
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

                {/* Text details for live posts */}
                {post.caption ? (
                  <div className="mt-5 flex flex-col justify-between flex-grow px-2">
                    <div>
                      <div className="flex items-center gap-1.5 text-[9px] font-mono tracking-wider text-violet-300/80 uppercase">
                        <Instagram size={10} className="text-pink-400/90" />
                        <span>{post.isReel ? "Reel" : "Post"}</span>
                      </div>
                      <p className="mt-3 pl-3 border-l border-white/10 group-hover:border-pink-500/30 text-[13px] font-medium leading-relaxed text-white/70 group-hover:text-white transition-all duration-300 line-clamp-2 min-h-[44px] px-0.5">
                        {formatCaption(post.caption)}
                      </p>
                    </div>
                    <div className="mt-5 pt-3 border-t border-white/[.04] flex items-center justify-between text-[8px] font-mono tracking-[0.15em] text-white/25">
                      <span>{displayHandle.toUpperCase()}</span>
                      <span>{formatDate(post.timestamp)}</span>
                    </div>
                  </div>
                ) : post.image ? (
                  <div className="mt-5 flex flex-col justify-between flex-grow px-2">
                    <div>
                      <div className="flex items-center gap-1.5 text-[9px] font-mono tracking-wider text-violet-300/80 uppercase">
                        <Instagram size={10} className="text-pink-400/90" />
                        <span>Featured</span>
                      </div>
                      <p className="mt-3 pl-3 border-l border-white/10 group-hover:border-pink-500/30 text-[13px] font-medium leading-relaxed text-white/40 line-clamp-2 min-h-[44px] px-0.5 italic">
                        Manual fallback display.
                      </p>
                    </div>
                    <div className="mt-5 pt-3 border-t border-white/[.04] flex items-center justify-between text-[8px] font-mono tracking-[0.15em] text-white/25">
                      <span>{displayHandle.toUpperCase()}</span>
                      <span>ACTIVE</span>
                    </div>
                  </div>
                ) : null}
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
