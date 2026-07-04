"use client";

import React, { useEffect, useState } from "react";
import { Terminal, Activity, Server, Radio, Cpu } from "lucide-react";
import { motion } from "framer-motion";

export function AboutHudHero() {
  const [latency, setLatency] = useState(42);

  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(Math.floor(35 + Math.random() * 12));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden px-6 pt-40 pb-20 md:pt-48 md:pb-28 border-b border-white/[0.06] bg-[#050308]">
      {/* HUD Grid Backing */}
      <div className="absolute inset-0 grid-bg opacity-15 pointer-events-none" />

      {/* Futuristic floating blur filters */}
      <div className="absolute top-1/4 left-1/4 h-80 w-80 rounded-full bg-violet-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-fuchsia-600/10 blur-[120px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[1fr_.85fr] lg:items-center">
          
          {/* Headline and system tags */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Blinking HUD System Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/5 px-4 py-2 text-[10px] font-mono tracking-widest text-violet-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
              </span>
              SYSTEM: ONLINE // VER_2.5.0
            </div>

            <h1 className="mt-7 text-4xl xs:text-5xl font-extrabold leading-[0.9] tracking-tight text-white md:text-8xl lg:text-[98px]">
              An Operating <br className="hidden md:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-500">
                System
              </span> for <br />
              Innovation.
            </h1>

            <p className="mt-8 max-w-2xl text-base leading-8 text-white/50 md:text-lg md:leading-9">
              Tech Tatva coordinates student events, deploys public registration platforms, automates digital credential generation, and structures community recruitment—all built as a modular software layer.
            </p>
          </motion.div>

          {/* HUD Status Graphics Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="rounded-[2.4rem] border border-white/[0.08] bg-[#0c0814]/70 p-6 md:p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden"
          >
            {/* HUD Scan Line */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-violet-400/30 to-transparent animate-pulse pointer-events-none" />

            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
              <div className="flex items-center gap-3">
                <Terminal className="text-fuchsia-400" size={18} />
                <span className="font-mono text-xs text-white/70 tracking-wider">HUD_DIAGNOSTICS_SYS</span>
              </div>
              <span className="font-mono text-[10px] text-white/30">MODULE_01</span>
            </div>

            {/* Diagnostic Parameters Grid */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] text-white/30 uppercase tracking-widest">Core Engine</span>
                  <Activity size={12} className="text-green-400" />
                </div>
                <div className="font-mono text-lg font-bold text-white tracking-wide">ACTIVE_SYS</div>
                <span className="font-mono text-[9px] text-green-400/60 uppercase">9/9 nodes ready</span>
              </div>

              <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] text-white/30 uppercase tracking-widest">Network Speed</span>
                  <Server size={12} className="text-violet-400 animate-pulse" />
                </div>
                <div className="font-mono text-lg font-bold text-white tracking-wide">{latency}ms</div>
                <span className="font-mono text-[9px] text-violet-400/60 uppercase">Vercel Edge Gateway</span>
              </div>

              <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] text-white/30 uppercase tracking-widest">Target Stack</span>
                  <Cpu size={12} className="text-fuchsia-400" />
                </div>
                <div className="font-mono text-lg font-bold text-white tracking-wide">NEXT_15</div>
                <span className="font-mono text-[9px] text-fuchsia-400/60 uppercase">React Server Actions</span>
              </div>

              <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] text-white/30 uppercase tracking-widest">Database Sync</span>
                  <Radio size={12} className="text-pink-400" />
                </div>
                <div className="font-mono text-lg font-bold text-white tracking-wide">MONGO_DB</div>
                <span className="font-mono text-[9px] text-pink-400/60 uppercase">Atlas Shared Cluster</span>
              </div>
            </div>

            {/* Simulated server logs ticker */}
            <div className="mt-6 rounded-xl border border-white/[0.05] bg-black/60 p-4 font-mono text-[9px] text-white/45 flex flex-col gap-1">
              <div className="flex items-center justify-between text-green-400/70 border-b border-white/[0.05] pb-1.5 mb-1">
                <span>SYSTEM LOGS: STABLE</span>
                <span>UTC_TIME</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-violet-400">&gt;</span>
                <span>SEC_BOT_READY: gemini-2.5-flash connection verified</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-violet-400">&gt;</span>
                <span>API_CHAT_INIT: open public interface listening...</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-violet-400">&gt;</span>
                <span>PORTAL_CLIENT: session secure (authenticated)</span>
              </div>
            </div>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}
