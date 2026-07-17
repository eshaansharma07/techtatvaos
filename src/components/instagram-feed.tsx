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
      let apiPosts: InstagramPost[] = [];
      try {
        const res = await fetch("/api/instagram");
        if (res.ok) {
          const data = await res.json();
          if (data.stats) {
            fetchedStats = data.stats;
            setStats(data.stats);
          }
          if (data.posts && data.posts.length > 0) {
            apiPosts = data.posts;
          }
        }
      } catch (err) {
        console.error("Live Instagram feed fetch failed, using manual fallback:", err);
      }

      // Merge manual posts with API posts
      const manualPosts: InstagramPost[] = [];
      if (post1_image) manualPosts.push({ id: "manual-1", image: post1_image, url: post1_url || "https://instagram.com/techtatvaclub", caption: "Latest update from Tech Tatva Club." });
      if (post2_image) manualPosts.push({ id: "manual-2", image: post2_image, url: post2_url || "https://instagram.com/techtatvaclub", caption: "Featured update." });
      if (post3_image) manualPosts.push({ id: "manual-3", image: post3_image, url: post3_url || "https://instagram.com/techtatvaclub", caption: "Tech Tatva news." });

      const combined = [...manualPosts, ...apiPosts.filter(p => !manualPosts.some(m => m.url === p.url))].slice(0, 3);

      if (combined.length === 0) {
        setPosts([
          { id: "ig-1", image: "/chandigarh-university-logo.png", url: "https://instagram.com/techtatvaclub", caption: "Welcome to Tech Tatva" },
          { id: "ig-2", image: "/chandigarh-university-logo.png", url: "https://instagram.com/techtatvaclub", caption: "Innovation & Excellence" },
          { id: "ig-3", image: "/chandigarh-university-logo.png", url: "https://instagram.com/techtatvaclub", caption: "Connect with us" }
        ]);
      } else {
        setPosts(combined);
      }

      if (!fetchedStats) {
        setStats({ followers: "109", following: "35", postsCount: "40" });
      }
      setLoading(false);
    }

    fetchLiveFeed();
  }, [post1_image, post1_url, post2_image, post2_url, post3_image, post3_url]);
  
  const displayHandle = handle.startsWith("@") ? handle : `@${handle}`;
 
  return (
    <section className="border-t border-white/[0.06] bg-black py-20 md:py-28 relative overflow-hidden">
      {/* Subtle 3D Grid in background */}
      <div className="absolute inset-0 grid-bg opacity-[0.03] pointer-events-none" />

      <div className="mx-auto max-w-7xl xl:max-w-[1380px] 2xl:max-w-[1536px] px-5 md:px-6 relative">
        <Reveal>
          <div className="mb-16 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="max-w-2xl">
              <p className="mb-4 text-[10px] font-semibold tracking-[0.4em] text-purple-400 uppercase">SOCIAL CONNECT</p>
              <h2 className="text-4xl font-extrabold tracking-tight md:text-6xl text-white">Captured on Instagram.</h2>
              <p className="mt-4 text-sm leading-8 text-white/50">
                Join our active student club of builders. We post live updates, technology news, event announcements, and design highlights.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 shrink-0">
              <div className="inline-flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] text-white">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                <Instagram size={14} className="text-white" />
                <span className="text-xs font-bold tracking-tight text-white">{displayHandle}</span>
              </div>
 
              <a 
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="brutalist-btn-theme flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-xs tracking-wider transition hover:-translate-y-0.5 text-white font-semibold"
              >
                <span>VISIT PROFILE</span>
                <ArrowUpRight size={13} />
              </a>
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
                className="glass-brutalist group flex flex-col justify-between h-full rounded-[2.2rem] p-3 hover:-translate-y-1.5 hover:border-purple-500 transition-all duration-500"
              >
                {/* Visual Container */}
                <div className="relative aspect-square w-full rounded-[1.6rem] overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center">
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
                        <span className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-blue-500 px-4 py-2 text-xs font-bold text-white shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)]">
                          <Instagram size={14} /> Open Post <ArrowUpRight size={12} />
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0c0c0e] to-black flex flex-col items-center justify-center p-6 text-center">
                      <Instagram className="h-8 w-8 text-blue-400/30 mb-2 transition duration-500 group-hover:scale-110 group-hover:text-blue-400" />
                      
                      <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/5 px-2.5 py-0.5 text-[8px] font-semibold tracking-wider text-blue-300/60 uppercase">
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
                {post.image ? (
                  <div className="mt-5 flex flex-col justify-between flex-grow px-2">
                    <div>
                      <div className="flex items-center gap-1.5 text-[9px] font-mono tracking-wider text-purple-400 uppercase">
                        <Instagram size={10} className="text-purple-400" />
                        <span>{post.isReel ? "Reel" : "Post"}</span>
                      </div>
                      <p className="mt-3 pl-3 border-l border-white/10 group-hover:border-purple-500/30 text-[13px] font-medium leading-relaxed text-white/70 group-hover:text-white transition-all duration-300 line-clamp-2 min-h-[44px] px-0.5">
                        {formatCaption(post.caption || "View this post on Instagram.")}
                      </p>
                    </div>
                    <div className="mt-5 pt-3 border-t border-white/[.04] flex items-center justify-between text-[8px] font-mono tracking-[0.15em] text-white/25">
                      <span>{displayHandle.toUpperCase()}</span>
                      <span>{post.timestamp ? formatDate(post.timestamp) : "ACTIVE"}</span>
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
