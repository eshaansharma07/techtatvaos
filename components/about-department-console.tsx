"use client";

import React, { useState } from "react";
import { Terminal, Shield, Cpu, Image, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Dept {
  id: string;
  name: string;
  icon: any;
  title: string;
  desc: string;
  logs: string[];
}

export function AboutDepartmentConsole() {
  const [selectedDept, setSelectedDept] = useState("tech");

  const depts: Dept[] = [
    {
      id: "tech",
      name: "Technology",
      icon: Cpu,
      title: "Technology Division",
      desc: "Architects the core club framework, coordinates API pipelines, resolves model auth states, and deploys high-fidelity public web applications.",
      logs: [
        "Initializing Next.js App Router compilation...",
        "Validating Vercel production server routes...",
        "Model handshake: Gemini 2.5-flash auth... SUCCESS",
        "PWA registration complete for membership system.",
        "Status: Active and compiling stable build targets."
      ]
    },
    {
      id: "ops",
      name: "Operations",
      icon: Shield,
      title: "Operations Division",
      desc: "Coordinates physical event logistics, structures room allocations, tracks member registrations, and operates the automated AI Minutes-of-Meeting compiler.",
      logs: [
        "Retrieving member UID database records...",
        "Compiling Excel export StudentMembers.xlsx...",
        "Binding event schedules to main system calendar...",
        "AI Secretary helper daemon running on port 443.",
        "Status: Operational control active."
      ]
    },
    {
      id: "design",
      name: "Design & UX",
      icon: Image,
      title: "Creative Systems",
      desc: "Curates the club visual language, defines glassmorphism parameters, crafts responsive styling assets, and aligns page transitions for visual impact.",
      logs: [
        "Restoring Figma UI design guidelines...",
        "Linking HSL color tokens to globals.css...",
        "Configuring motion spring physics presets...",
        "Rendering mouse-glow canvas layouts... OK",
        "Status: Visual assets aligned with OS style guide."
      ]
    },
    {
      id: "media",
      name: "Media & Outreach",
      icon: Share2,
      title: "Media Chronicles",
      desc: "Operates public messaging routes, syncs Instagram feed microservices, handles external outreach campaigns, and coordinates visual archives.",
      logs: [
        "Establishing connection to behold.so API...",
        "Syncing remote post metadata to local stream...",
        "Optimizing gallery CDN image caches...",
        "Outreach broadcast pipelines: verified.",
        "Status: Public signal synchronization active."
      ]
    }
  ];

  const currentDept = depts.find((d) => d.id === selectedDept) || depts[0];

  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <p className="text-[10px] font-bold tracking-[0.3em] text-violet-300 uppercase">INTERNAL STRUCTURE</p>
        <h2 className="mt-4 text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Divided by tasks. <br />
          Unified by the code.
        </h2>
        <p className="mt-4 text-sm text-white/45 max-w-xl mx-auto">
          Tech Tatva operates as a decentralized student team. Select an operational layer below to inspect division diagnostics.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[0.4fr_1fr]">
        
        {/* Left selector menu */}
        <div className="flex flex-col gap-2.5">
          {depts.map((d) => {
            const Icon = d.icon;
            const isSelected = d.id === selectedDept;
            return (
              <button
                key={d.id}
                onClick={() => setSelectedDept(d.id)}
                className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-300 ${
                  isSelected
                    ? "border-violet-500/30 bg-[#0d091a] text-white shadow-[0_8px_30px_rgba(139,92,246,0.06)]"
                    : "border-white/[0.06] bg-white/[0.025] text-white/50 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                <span className={`grid h-10 w-10 place-items-center rounded-xl transition ${
                  isSelected ? "bg-violet-500/20 text-violet-300" : "bg-white/[0.04] text-white/40"
                }`}>
                  <Icon size={18} />
                </span>
                <div>
                  <p className="text-[10px] font-bold tracking-wider uppercase text-white/30">DIVISION</p>
                  <p className="text-sm font-bold tracking-tight">{d.name}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right diagnostic terminal console */}
        <div className="rounded-[2.2rem] border border-white/[0.08] bg-[#09060f]/90 p-6 md:p-8 backdrop-blur-2xl shadow-2xl relative min-h-[340px] flex flex-col justify-between overflow-hidden">
          {/* Scanline overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none" />

          <AnimatePresence mode="wait">
            <motion.div
              key={currentDept.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-5 flex-grow"
            >
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                <div className="flex items-center gap-3">
                  <Terminal size={16} className="text-fuchsia-400" />
                  <span className="font-mono text-xs text-white/70">{currentDept.title}</span>
                </div>
                <span className="font-mono text-[9px] text-fuchsia-400 font-bold uppercase tracking-widest animate-pulse">ACTIVE_RUN</span>
              </div>

              <p className="text-sm leading-relaxed text-white/60 font-sans max-w-3xl">
                {currentDept.desc}
              </p>

              {/* Simulated operational prints */}
              <div className="mt-auto bg-black/50 border border-white/[0.05] p-5 rounded-2xl font-mono text-[10px] text-white/40 flex flex-col gap-2">
                {currentDept.logs.map((log, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-violet-400 select-none">&gt;</span>
                    <span className={i === currentDept.logs.length - 1 ? "text-green-300 font-semibold" : ""}>{log}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
