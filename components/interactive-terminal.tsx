"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Terminal, Shield, Sparkles, Wifi, Image as ImageIcon, Calendar, ArrowUpRight, Database } from "lucide-react";
import Link from "next/link";

interface LogLine {
  text: string;
  node?: React.ReactNode;
  type: "system" | "input" | "success" | "info" | "error";
}

interface InteractiveTerminalProps {
  stats?: {
    members: number;
    events: number;
    teams: number;
    community: number;
  };
  instagram?: {
    handle?: string;
    post1_image?: string;
    post1_url?: string;
  };
  event?: {
    title: string;
    description?: string;
    slug: string;
    venue?: string;
  };
}

export function InteractiveTerminal({ stats, instagram, event }: InteractiveTerminalProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [input, setInput] = useState("");
  const [latencyText, setLatencyText] = useState("PING: measuring...");
  const [latencyColor, setLatencyColor] = useState("text-white/30 border-white/10 bg-white/5");
  const [history, setHistory] = useState<LogLine[]>([
    { text: "System Initialized. Connection secure.", type: "system" },
    { text: "Welcome to Tech Tatva OS Explorer.", type: "info" },
    { text: "Query live stats, latest social posts, or physics models below.", type: "info" }
  ]);

  // Ping gateway on mount
  useEffect(() => {
    const measurePing = async () => {
      const startTime = Date.now();
      try {
        const res = await fetch("/ping.txt");
        const latency = Date.now() - startTime;
        if (res.ok) {
          setLatencyText(`PING: ${latency}ms (STABLE)`);
          setLatencyColor("text-emerald-300 border-emerald-500/20 bg-emerald-500/5");
        } else {
          setLatencyText(`PING: ${latency}ms (WARN)`);
          setLatencyColor("text-amber-300 border-amber-500/20 bg-amber-500/5");
        }
      } catch {
        setLatencyText("PING: OFFLINE");
        setLatencyColor("text-rose-400 border-rose-500/20 bg-rose-500/5");
      }
    };
    measurePing();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const executeCommand = async (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    const newHistory = [...history, { text: `❯ ${trimmed}`, type: "input" as const }];
    setHistory(newHistory);

    const primary = trimmed.toLowerCase();

    switch (primary) {
      case "instagram":
        const handle = instagram?.handle || "techtatva";
        
        // Use functional setHistory updates as this is inside an async loop
        setHistory(prev => [
          ...prev,
          { text: `Fetching latest media signal from @${handle}...`, type: "system" }
        ]);

        try {
          const res = await fetch("/api/instagram");
          if (res.ok) {
            const data = await res.json();
            if (data.posts && data.posts.length > 0) {
              const livePost = data.posts[0];
              setHistory(prev => [
                ...prev,
                {
                  text: `@${handle} uploaded a new post:`,
                  type: "success",
                  node: (
                    <div className="mt-2 flex gap-3 items-center rounded-xl border border-white/10 bg-white/5 p-2 max-w-sm">
                      <img 
                        src={livePost.image} 
                        alt="Instagram Latest Preview" 
                        className="w-12 h-12 object-cover rounded-md border border-white/10 bg-black/40"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-white/50 truncate">Live Reels/Post Preview</p>
                        <a 
                          href={livePost.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-pink-300 hover:text-white transition"
                        >
                          Open on Instagram <ArrowUpRight size={10} />
                        </a>
                      </div>
                    </div>
                  )
                }
              ]);
              break;
            }
          }
        } catch (err) {
          console.error("Live Instagram terminal fetch failed:", err);
        }

        // Fallback to manual posts if fetch fails or no auto-feed configured
        const postImg = instagram?.post1_image;
        const postUrl = instagram?.post1_url || "https://instagram.com";

        setHistory(prev => [
          ...prev,
          {
            text: `@${handle} uploaded a new post:`,
            type: "success",
            node: (
              <div className="mt-2 flex gap-3 items-center rounded-xl border border-white/10 bg-white/5 p-2 max-w-sm">
                {postImg ? (
                  <img 
                    src={postImg} 
                    alt="Instagram Latest Preview" 
                    className="w-12 h-12 object-cover rounded-md border border-white/10 bg-black/40"
                  />
                ) : (
                  <div className="w-12 h-12 flex items-center justify-center rounded-md border border-dashed border-white/20 bg-black/45 text-white/30">
                    <ImageIcon size={16} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-white/50 truncate">Instagram Post Preview</p>
                  <a 
                    href={postUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-pink-300 hover:text-white transition"
                  >
                    Open on Instagram <ArrowUpRight size={10} />
                  </a>
                </div>
              </div>
            )
          }
        ]);
        break;

      case "event":
        if (event) {
          setHistory([
            ...newHistory,
            { text: "Locating next active calendar registry item...", type: "system" },
            {
              text: `Active Event: ${event.title}`,
              type: "success",
              node: (
                <div className="mt-2 rounded-xl border border-white/10 bg-white/5 p-3 max-w-md">
                  <h4 className="text-[11px] font-semibold text-white">{event.title}</h4>
                  <p className="text-[10px] text-white/40 mt-1 line-clamp-2 leading-relaxed">
                    {event.description || "Register and join us for our upcoming session."}
                  </p>
                  <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2">
                    <span className="text-[9px] text-violet-300 font-mono">VENUE: {event.venue || "TBA"}</span>
                    <Link 
                      href={`/events/${event.slug}`} 
                      className="inline-flex items-center gap-1 rounded bg-violet-500/20 px-2 py-0.5 text-[9px] font-semibold text-violet-200 hover:bg-violet-500/35 transition"
                    >
                      Register Now
                    </Link>
                  </div>
                </div>
              )
            }
          ]);
        } else {
          setHistory([
            ...newHistory,
            { text: "Query complete. No public registrations active at the moment.", type: "info" }
          ]);
        }
        break;

      case "stats":
        setHistory([
          ...newHistory,
          { text: "Retrieving dynamic metrics from cluster...", type: "system" },
          { text: `  Active Core Members : ${stats?.members ?? 0}`, type: "success" },
          { text: `  Specialized Teams   : ${stats?.teams ?? 0}`, type: "success" },
          { text: `  Published Events    : ${stats?.events ?? 0}`, type: "success" },
          { text: `  Community Members   : ${stats?.community ?? 0}`, type: "success" }
        ]);
        break;

      case "ping":
        setHistory([...newHistory, { text: "Pinging health endpoint...", type: "system" }]);
        const start = Date.now();
        try {
          const res = await fetch("/api/health");
          const latency = Date.now() - start;
          setHistory((prev) => [
            ...prev,
            { text: `Pong! Server response in ${latency}ms. Status: Stable.`, type: "success" }
          ]);
        } catch {
          const latency = Date.now() - start;
          setHistory((prev) => [
            ...prev,
            { text: `Pong! Gateway unreachable. Local delay: ${latency}ms.`, type: "error" }
          ]);
        }
        break;

      case "gravity":
        window.dispatchEvent(new Event("antigravity-toggle"));
        const active = document.body.classList.toggle("zero-gravity");
        setHistory([
          ...newHistory,
          { text: active ? "🛸 [ANTIGRAVITY INITIALIZED]" : "🌍 [GRAVITY RESTORED]", type: "success" },
          { text: active 
            ? "Gravity scalar set to 0. Background orbits and velocity multipliers elevated." 
            : "Gravity values reset. Normal physics active.", 
            type: "info" 
          }
        ]);
        break;

      case "join":
        setHistory([
          ...newHistory,
          { text: "Opening recruitment portal...", type: "system" },
          { text: "Redirecting in 1s...", type: "success" }
        ]);
        setTimeout(() => router.push("/join"), 1000);
        break;

      case "clear":
        setHistory([]);
        break;

      default:
        setHistory([
          ...newHistory,
          { text: `Command not found: '${primary}'. Type 'stats', 'instagram', or 'event' to query.`, type: "error" }
        ]);
        break;
    }
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      executeCommand(input);
    }
  };

  const clickShortcut = (cmd: string) => {
    setInput(cmd);
    setTimeout(() => {
      executeCommand(cmd);
    }, 150);
  };

  return (
    <div 
      className="glass-brutalist relative w-full max-w-2xl rounded-3xl p-5 overflow-hidden text-white/80"
    >
      {/* Console Subheader Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.05] select-none">
        <div className="flex items-center gap-2">
          <Terminal size={12} className="text-emerald-400" />
          <span className="text-[10px] font-bold tracking-[0.2em] text-[#00FF66] uppercase">OS COMMAND CENTER</span>
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-0.5 text-[8px] font-mono transition-colors duration-500 ${latencyColor}`}>
          <Wifi size={8} />
          <span>{latencyText}</span>
        </div>
      </div>
 
      {/* Console Input Bar */}
      <div className="mt-4 flex items-center gap-3 rounded-2xl border-2 border-black bg-black/75 px-4 py-3 focus-within:border-[#00FF66]/50 transition-all duration-300">
        <span className="text-[#00FF66] text-xs font-semibold select-none">❯</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="type instagram, event, stats, gravity or join..."
          className="flex-1 bg-transparent border-none outline-none text-white text-xs font-mono placeholder-white/20 select-all"
          maxLength={100}
        />
        <button 
          onClick={() => executeCommand(input)}
          className="text-white/30 hover:text-[#00FF66] transition-colors"
        >
          <Wifi size={13} className="rotate-95" />
        </button>
      </div>
 
      {/* Terminal Output Log */}
      <div 
        ref={scrollRef}
        className="mt-4 p-4 rounded-2xl bg-black/60 border-2 border-black h-[130px] overflow-y-auto space-y-1.5 font-mono text-[11px] leading-relaxed scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10"
      >
        {history.map((line, idx) => (
          <div key={idx} className="space-y-1">
            <div 
              className={`
                ${line.type === "success" ? "text-[#00FF66]" : ""}
                ${line.type === "info" ? "text-emerald-400" : ""}
                ${line.type === "error" ? "text-rose-400" : ""}
                ${line.type === "input" ? "text-white" : ""}
                ${line.type === "system" ? "text-white/45" : ""}
              `}
            >
              {line.text}
            </div>
            {line.node && <div>{line.node}</div>}
          </div>
        ))}
      </div>
 
      {/* Action shortcuts */}
      <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-white/[0.04]">
        <button
          onClick={() => clickShortcut("instagram")}
          className="flex items-center gap-1.5 rounded-xl glass-brutalist px-3.5 py-1.5 text-[9px] font-bold text-white/80 hover:border-[#f472b6] transition"
        >
          <ImageIcon size={10} className="text-[#f472b6]" />
          <span>LATEST INSTAGRAM POST</span>
        </button>
        <button
          onClick={() => clickShortcut("event")}
          className="flex items-center gap-1.5 rounded-xl glass-brutalist px-3.5 py-1.5 text-[9px] font-bold text-white/80 hover:border-[#a855f7] transition"
        >
          <Calendar size={10} className="text-[#a855f7]" />
          <span>LATEST EVENT INFO</span>
        </button>
        <button
          onClick={() => clickShortcut("stats")}
          className="flex items-center gap-1.5 rounded-xl glass-brutalist px-3.5 py-1.5 text-[9px] font-bold text-white/80 hover:border-[#06b6d4] transition"
        >
          <Database size={10} className="text-[#06b6d4]" />
          <span>DATABASE METRICS</span>
        </button>
        <button
          onClick={() => clickShortcut("gravity")}
          className="flex items-center gap-1.5 rounded-xl glass-brutalist px-3.5 py-1.5 text-[9px] font-bold text-white/80 hover:border-[#f59e0b] transition"
        >
          <Shield size={10} className="text-[#f59e0b]" />
          <span>TOGGLE PHYSICS</span>
        </button>
        <button
          onClick={() => clickShortcut("join")}
          className="flex items-center gap-1.5 rounded-xl glass-brutalist px-3.5 py-1.5 text-[9px] font-bold text-white/80 hover:border-[#00FF66] transition"
        >
          <Sparkles size={10} className="text-[#00FF66]" />
          <span>JOIN COMMUNITY</span>
        </button>
      </div>
    </div>
  );
}
