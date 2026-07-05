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
    <section className="border-t border-white/[.06] bg-[#07050d] py-20 md:py-28 relative overflow-hidden">
      {/* Visual background ambient blooms */}
      <div className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] rounded-full bg-purple-900/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] rounded-full bg-pink-900/10 blur-[130px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-5 md:px-6 relative">
        <Reveal>
          <div className="mb-16 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="max-w-2xl">
              <p className="mb-4 text-[10px] font-semibold tracking-[.35em] text-pink-400 uppercase">SOCIAL CONNECT</p>
              <h2 className="text-4xl font-bold tracking-tight md:text-6xl text-white">Captured on Instagram.</h2>
              <p className="mt-4 text-sm leading-8 text-white/50">
                Join our active student community of builders. We post live updates, technology news, event announcements, and design highlights.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 shrink-0">
              {/* Sleek Instagram Pill */}
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

        {/* Glassmorphic Instagram Profile Stats HUD */}
        <Reveal delay={0.04}>
          <div className="mb-12 grid gap-6 lg:grid-cols-[1fr_2fr] items-stretch">
            {/* Left Column: Avatar & Profile Metadata HUD */}
            <div className="relative rounded-[2.2rem] border border-white/[0.08] bg-[#0c0814]/75 p-6 md:p-8 backdrop-blur-3xl shadow-2xl flex flex-col items-center md:items-start justify-center gap-6 overflow-hidden group">
              {/* Animated background laser line */}
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-pink-500 to-transparent animate-pulse" />
              <div className="absolute -right-20 -bottom-20 w-52 h-52 rounded-full bg-violet-600/10 blur-[60px] pointer-events-none" />

              <div className="flex flex-col md:flex-row items-center gap-6 w-full">
                {/* Fusion Reactor Core Avatar Ring */}
                <div className="relative shrink-0 select-none">
                  {/* Outer spinning dash border */}
                  <div className="absolute inset-[-6px] rounded-full border border-dashed border-pink-500/40 animate-[spin_20s_linear_infinite]" />
                  {/* Middle gradient ring */}
                  <div className="absolute inset-[-4px] rounded-full bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 animate-pulse opacity-85" />
                  {/* Inner dark circle containing the Instagram logo */}
                  <div className="relative grid h-20 w-20 place-items-center rounded-full bg-[#0c0814] text-white animate-pulse">
                    <Instagram size={36} className="text-pink-300 drop-shadow-[0_0_15px_rgba(244,114,182,0.6)]" />
                  </div>
                </div>

                <div className="text-center md:text-left flex-grow flex flex-col gap-2">
                  <div className="flex flex-col sm:flex-row items-center gap-2.5 justify-center md:justify-start">
                    <h3 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-pink-200">
                      {displayHandle}
                    </h3>
                  </div>
                  <span className="self-center md:self-start inline-flex items-center gap-1 rounded-md border border-pink-500/20 bg-pink-500/10 px-2 py-0.5 text-[8px] font-black tracking-[0.2em] text-pink-300 uppercase">
                    SYS.VERIFIED.BUILDER
                  </span>
                  
                  {/* Tech Coordinates details */}
                  <div className="mt-1 font-mono text-[9px] text-white/30 flex items-center justify-center md:justify-start gap-3">
                    <span>LOC: [30.76, 76.62]</span>
                    <span className="h-1 w-1 rounded-full bg-white/20" />
                    <span>STATUS: ACTIVE</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: 3 Cybernetic Stats Panels */}
            <div className="grid gap-4 sm:grid-cols-3">
              {/* Panel 1: Posts */}
              <div className="relative rounded-[2.2rem] border border-white/[0.06] bg-[#0c0814]/40 p-6 backdrop-blur-2xl transition duration-500 hover:border-pink-500/30 hover:bg-[#0c0814]/70 hover:-translate-y-1 group flex flex-col justify-between overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-pink-500/[0.02] blur-[25px] pointer-events-none group-hover:bg-pink-500/[0.05] transition-all" />
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono tracking-widest text-white/30 uppercase">Posts</span>
                  <div className="h-6 w-6 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
                    <span className="text-[9px] text-pink-400 font-mono">01</span>
                  </div>
                </div>
                <div className="my-6">
                  <h4 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:text-pink-100 transition-colors">
                    {stats?.postsCount || "40"}
                  </h4>
                  {/* Simulated LED progress line */}
                  <div className="mt-3 h-1 w-full bg-white/[0.04] rounded-full overflow-hidden">
                    <div className="h-full w-4/12 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full transition-all group-hover:w-full duration-700" />
                  </div>
                </div>
                <span className="text-[8px] font-mono tracking-widest text-pink-400/60 uppercase">
                  ASSETS.SYNCHRONIZED
                </span>
              </div>

              {/* Panel 2: Followers */}
              <div className="relative rounded-[2.2rem] border border-white/[0.06] bg-[#0c0814]/40 p-6 backdrop-blur-2xl transition duration-500 hover:border-violet-500/30 hover:bg-[#0c0814]/70 hover:-translate-y-1 group flex flex-col justify-between overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-violet-500/[0.02] blur-[25px] pointer-events-none group-hover:bg-violet-500/[0.05] transition-all" />
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono tracking-widest text-white/30 uppercase">Followers</span>
                  <div className="h-6 w-6 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                    <span className="text-[9px] text-violet-400 font-mono">02</span>
                  </div>
                </div>
                <div className="my-6">
                  <h4 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:text-violet-100 transition-colors">
                    {stats?.followers || "109"}
                  </h4>
                  {/* Simulated LED progress line */}
                  <div className="mt-3 h-1 w-full bg-white/[0.04] rounded-full overflow-hidden">
                    <div className="h-full w-6/12 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full transition-all group-hover:w-full duration-700" />
                  </div>
                </div>
                <span className="text-[8px] font-mono tracking-widest text-violet-400/60 uppercase">
                  NETWORK.CONNECTIONS
                </span>
              </div>

              {/* Panel 3: Following */}
              <div className="relative rounded-[2.2rem] border border-white/[0.06] bg-[#0c0814]/40 p-6 backdrop-blur-2xl transition duration-500 hover:border-purple-500/30 hover:bg-[#0c0814]/70 hover:-translate-y-1 group flex flex-col justify-between overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-purple-500/[0.02] blur-[25px] pointer-events-none group-hover:bg-purple-500/[0.05] transition-all" />
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono tracking-widest text-white/30 uppercase">Following</span>
                  <div className="h-6 w-6 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <span className="text-[9px] text-purple-400 font-mono">03</span>
                  </div>
                </div>
                <div className="my-6">
                  <h4 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:text-purple-100 transition-colors">
                    {stats?.following || "34"}
                  </h4>
                  {/* Simulated LED progress line */}
                  <div className="mt-3 h-1 w-full bg-white/[0.04] rounded-full overflow-hidden">
                    <div className="h-full w-2/12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all group-hover:w-full duration-700" />
                  </div>
                </div>
                <span className="text-[8px] font-mono tracking-widest text-purple-400/60 uppercase">
                  OUTBOUND.GATEWAYS
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
