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
    }
 
    fetchLiveFeed();
  }, [post1_image, post1_url, post2_image, post2_url, post3_image, post3_url]);
  
  const displayHandle = handle.startsWith("@") ? handle : `@${handle}`;
 
  return (
    <section className="border-t border-white/[0.06] bg-[#050308] py-20 md:py-28 relative overflow-hidden">
      {/* Interactive holographic ambient glows */}
      <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-[#f9ce34]/5 via-[#ee2a7b]/10 to-[#6228d7]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-[#6228d7]/5 via-[#ee2a7b]/10 to-[#f9ce34]/5 blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-7xl xl:max-w-[1380px] 2xl:max-w-[1536px] px-5 md:px-6 relative">
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

        {/* Glassmorphic Cyber-Deck Stats HUD */}
        <Reveal delay={0.04}>
          <div className="mb-14 relative rounded-[2.2rem] border border-white/[0.08] bg-[#0c0814]/75 p-8 md:p-10 backdrop-blur-3xl shadow-[0_0_50px_rgba(238,42,123,0.08)] overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-10">
            
            {/* Technical HUD Crosshairs / Corner Brackets */}
            <div className="absolute top-4 left-4 w-3.5 h-3.5 border-t border-l border-pink-500/40 pointer-events-none" />
            <div className="absolute top-4 right-4 w-3.5 h-3.5 border-t border-r border-pink-500/40 pointer-events-none" />
            <div className="absolute bottom-4 left-4 w-3.5 h-3.5 border-b border-l border-pink-500/40 pointer-events-none" />
            <div className="absolute bottom-4 right-4 w-3.5 h-3.5 border-b border-r border-pink-500/40 pointer-events-none" />

            {/* Glowing background matrix lights */}
            <div className="absolute -left-20 -top-20 w-72 h-72 rounded-full bg-pink-500/10 blur-[80px] pointer-events-none animate-pulse" />
            <div className="absolute -right-20 -bottom-20 w-72 h-72 rounded-full bg-purple-500/10 blur-[80px] pointer-events-none" />

            {/* Left Section: Sleek Club Profile Core */}
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left z-10 select-none">
              <div className="relative shrink-0">
                {/* Spinner dash outer border */}
                <div className="absolute inset-[-6px] rounded-full border border-dashed border-pink-500/30 animate-[spin_20s_linear_infinite]" />
                {/* Glowing reactor avatar circle */}
                <div className="absolute inset-[-3px] rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]" />
                <div className="relative grid h-16 w-16 place-items-center rounded-full bg-[#0c0814] text-white">
                  <Instagram size={28} className="text-pink-300 drop-shadow-[0_0_10px_rgba(238,42,123,0.5)] animate-pulse" />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <h3 className="text-2xl font-black tracking-tight text-white">{displayHandle}</h3>
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-pink-500 text-white shadow-[0_0_10px_rgba(236,72,153,0.3)]">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                  </span>
                </div>
                <span className="self-center sm:self-start inline-flex rounded-full border border-pink-500/20 bg-pink-500/10 px-3 py-0.5 text-[8px] font-black tracking-[0.2em] text-pink-400 uppercase">
                  OFFICIAL CLUB HANDLE
                </span>
              </div>
            </div>

            {/* Glowing Vertical Neon Divider (Hidden on Mobile) */}
            <div className="hidden lg:block h-16 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent z-10" />

            {/* Right Section: Three Holographic Stats Array */}
            <div className="grid grid-cols-3 gap-6 sm:gap-12 w-full lg:w-auto z-10">
              {/* Stat 1: Posts */}
              <div className="flex flex-col items-center lg:items-end text-center lg:text-right group relative">
                <span className="text-[10px] font-black tracking-[0.2em] font-mono text-white/35 group-hover:text-pink-400 transition-colors uppercase">
                  POSTS
                </span>
                <span className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 tracking-tight font-mono mt-2 drop-shadow-[0_0_12px_rgba(238,42,123,0.55)] group-hover:scale-105 transition-transform duration-300">
                  {stats?.postsCount || "40"}
                </span>
                {/* Horizontal Level Indicator Bar */}
                <div className="mt-3.5 flex gap-1 justify-center lg:justify-end">
                  {Array.from({ length: 8 }).map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`h-1.5 w-2.5 rounded-sm transition-all duration-500 ${
                        idx < 3 
                          ? "bg-pink-500 shadow-[0_0_6px_#ee2a7b]" 
                          : "bg-white/[0.04]"
                      }`} 
                    />
                  ))}
                </div>
              </div>

              {/* Stat 2: Followers */}
              <div className="flex flex-col items-center lg:items-end text-center lg:text-right border-l border-white/[0.08] pl-6 sm:pl-12 group relative">
                <span className="text-[10px] font-black tracking-[0.2em] font-mono text-white/35 group-hover:text-violet-400 transition-colors uppercase">
                  FOLLOWERS
                </span>
                <span className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 tracking-tight font-mono mt-2 drop-shadow-[0_0_12px_rgba(98,40,215,0.55)] group-hover:scale-105 transition-transform duration-300">
                  {stats?.followers || "109"}
                </span>
                {/* Horizontal Level Indicator Bar */}
                <div className="mt-3.5 flex gap-1 justify-center lg:justify-end">
                  {Array.from({ length: 8 }).map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`h-1.5 w-2.5 rounded-sm transition-all duration-500 ${
                        idx < 7 
                          ? "bg-violet-500 shadow-[0_0_6px_#6228d7]" 
                          : "bg-white/[0.04]"
                      }`} 
                    />
                  ))}
                </div>
              </div>

              {/* Stat 3: Following */}
              <div className="flex flex-col items-center lg:items-end text-center lg:text-right border-l border-white/[0.08] pl-6 sm:pl-12 group relative">
                <span className="text-[10px] font-black tracking-[0.2em] font-mono text-white/35 group-hover:text-yellow-400 transition-colors uppercase">
                  FOLLOWING
                </span>
                <span className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 tracking-tight font-mono mt-2 drop-shadow-[0_0_12px_rgba(249,206,52,0.55)] group-hover:scale-105 transition-transform duration-300">
                  {stats?.following || "34"}
                </span>
                {/* Horizontal Level Indicator Bar */}
                <div className="mt-3.5 flex gap-1 justify-center lg:justify-end">
                  {Array.from({ length: 8 }).map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`h-1.5 w-2.5 rounded-sm transition-all duration-500 ${
                        idx < 2 
                          ? "bg-[#f9ce34] shadow-[0_0_6px_#f9ce34]" 
                          : "bg-white/[0.04]"
                      }`} 
                    />
                  ))}
                </div>
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
