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
  profileUrl = "https://instagram.com",
  post1_image,
  post1_url = "https://instagram.com",
  post2_image,
  post2_url = "https://instagram.com",
  post3_image,
  post3_url = "https://instagram.com"
}: InstagramFeedProps) {
  
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [stats, setStats] = useState<{ followers: string; following: string; postsCount: string } | null>(null);
 
  useEffect(() => {
    async function fetchLiveFeed() {
      let fetchedStats = null;
      try {
        const res = await fetch("/api/instagram");
        if (res.ok) {
          const data = await res.json();
          if (data.stats) {
            fetchedStats = data.stats;
            setStats(data.stats);
          }
          if (data.posts && data.posts.length > 0) {
            setPosts(data.posts.slice(0, 3));
            return;
          }
        }
      } catch (err) {
        console.error("Live Instagram feed fetch failed, using manual fallback:", err);
      }
      
      // Fallback state for posts
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
      
      // Only set baseline fallback stats if API call returned no statistics
      if (!fetchedStats) {
        setStats({ followers: "109", following: "34", postsCount: "40" });
      }
    }
 
    fetchLiveFeed();
  }, [post1_image, post1_url, post2_image, post2_url, post3_image, post3_url]);
  
  const displayHandle = handle.startsWith("@") ? handle : `@${handle}`;
 
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

        {/* Glassmorphic Instagram Profile Card */}
        <Reveal delay={0.04}>
          <div className="mb-12 rounded-[2.2rem] border border-white/[0.08] bg-[#0c0814]/65 p-6 md:p-8 backdrop-blur-2xl shadow-xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-pink-500/10 blur-[50px] pointer-events-none" />
            
            {/* Left: Instagram Avatar Frame */}
            <div className="relative shrink-0 select-none">
              <div className="absolute inset-[-4px] rounded-full bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600 animate-pulse opacity-75" />
              <div className="relative grid h-20 w-20 place-items-center rounded-full bg-[#0c0814] text-white">
                <Instagram size={36} className="text-pink-300 drop-shadow-[0_0_12px_rgba(244,114,182,0.4)]" />
              </div>
            </div>

            {/* Right: Profile Info and Stats */}
            <div className="flex-grow text-center md:text-left flex flex-col gap-4">
              <div className="flex flex-col md:flex-row md:items-center gap-3 justify-center md:justify-start">
                <h3 className="text-xl font-bold tracking-tight text-white">{displayHandle}</h3>
                <span className="inline-flex self-center items-center gap-1 rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-0.5 text-[9px] font-bold tracking-wider text-violet-300 uppercase">
                  VERIFIED BUILDER
                </span>
              </div>

              {/* Stats Counters */}
              <div className="flex justify-center md:justify-start gap-8 font-mono">
                <div>
                  <span className="text-lg font-bold text-white tracking-tight">{stats?.postsCount || "40"}</span>
                  <span className="text-[10px] text-white/35 uppercase tracking-wider block mt-0.5">Posts</span>
                </div>
                <div className="border-l border-white/[0.06] pl-8">
                  <span className="text-lg font-bold text-white tracking-tight">{stats?.followers || "109"}</span>
                  <span className="text-[10px] text-white/35 uppercase tracking-wider block mt-0.5">Followers</span>
                </div>
                <div className="border-l border-white/[0.06] pl-8">
                  <span className="text-lg font-bold text-white tracking-tight">{stats?.following || "34"}</span>
                  <span className="text-[10px] text-white/35 uppercase tracking-wider block mt-0.5">Following</span>
                </div>
              </div>

              {/* Bio Details */}
              <div className="text-xs text-white/45 leading-relaxed">
                <p className="font-bold text-white/70">Tech Tatva Club</p>
                <p className="mt-0.5">Official Student Technical Hub. Built for execution. Powered by CU.</p>
              </div>
            </div>
          </div>
        </Reveal>
 
        <div className="grid gap-6 sm:grid-cols-3">
          {posts.map((post, i) => (
            <Reveal key={post.id} delay={i * 0.08} className="h-full">
              <a 
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="premium-card group flex flex-col justify-between h-full rounded-[2rem] border border-white/[0.06] bg-white/[0.015] p-3 hover:-translate-y-1 hover:border-pink-500/20 transition-all duration-300"
              >
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-black/40 border border-white/[0.04] flex items-center justify-center">
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
                {post.caption ? (
                  <div className="mt-4 flex flex-col justify-between flex-grow">
                    <div>
                      <div className="flex items-center gap-1.5 text-[9px] font-mono tracking-wider text-violet-300/80 uppercase">
                        <Instagram size={10} className="text-pink-400/90" />
                        <span>{post.isReel ? "Reel" : "Post"}</span>
                      </div>
                      <p className="mt-2.5 pl-3 border-l border-white/10 group-hover:border-pink-500/30 text-[12.5px] font-medium leading-relaxed text-white/70 group-hover:text-white transition-all duration-300 line-clamp-2 min-h-[44px] px-0.5">
                        {formatCaption(post.caption)}
                      </p>
                    </div>
                    <div className="mt-4 pt-2.5 border-t border-white/[.04] flex items-center justify-between text-[8px] font-mono tracking-[0.15em] text-white/25">
                      <span>{displayHandle.toUpperCase()}</span>
                      <span>{formatDate(post.timestamp)}</span>
                    </div>
                  </div>
                ) : post.image ? (
                  <div className="mt-4 flex flex-col justify-between flex-grow">
                    <div>
                      <div className="flex items-center gap-1.5 text-[9px] font-mono tracking-wider text-violet-300/80 uppercase">
                        <Instagram size={10} className="text-pink-400/90" />
                        <span>Featured</span>
                      </div>
                      <p className="mt-2.5 pl-3 border-l border-white/10 group-hover:border-pink-500/30 text-[12.5px] font-medium leading-relaxed text-white/40 line-clamp-2 min-h-[44px] px-0.5 italic">
                        Manual fallback display.
                      </p>
                    </div>
                    <div className="mt-4 pt-2.5 border-t border-white/[.04] flex items-center justify-between text-[8px] font-mono tracking-[0.15em] text-white/25">
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
