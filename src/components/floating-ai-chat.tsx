"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Send, X, Sparkles, RotateCcw, Copy, Check, Bot, CornerDownLeft } from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: Date;
}

const STARTER_PROMPTS = [
  { icon: "🏆", label: "Upcoming Events", query: "What are the upcoming events and competitions in Tech Tatva?" },
  { icon: "🚀", label: "Join Membership", query: "How do I register for the Student Membership Drive?" },
  { icon: "👥", label: "Teams & Recruitment", query: "What domains or teams are open for recruitment?" },
  { icon: "💡", label: "About Tech Tatva", query: "What is Tech Tatva and what does the club do?" }
];

function FormattedContent({ content }: { content: string }) {
  // Simple markdown renderer for bold, lists, and markdown links [label](url)
  const lines = content.split("\n");

  return (
    <div className="space-y-1.5 text-[12px] leading-relaxed">
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={lineIdx} className="h-1" />;

        const isBullet = trimmed.startsWith("* ") || trimmed.startsWith("- ") || trimmed.startsWith("• ");
        const textToFormat = isBullet ? trimmed.replace(/^(\*|-|•)\s+/, "") : line;

        // Parse links and bold
        const parts: React.ReactNode[] = [];
        // Regex to capture markdown links: [text](url) and bold **bold**
        const regex = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(textToFormat)) !== null) {
          if (match.index > lastIndex) {
            parts.push(textToFormat.substring(lastIndex, match.index));
          }

          if (match[1] && match[2]) {
            // Markdown link
            const linkText = match[1];
            const href = match[2];
            const isInternal = href.startsWith("/");
            parts.push(
              isInternal ? (
                <Link
                  key={`${lineIdx}-${match.index}`}
                  href={href}
                  className="font-semibold text-violet-300 underline decoration-violet-500/50 hover:text-white transition inline-flex items-center gap-0.5"
                >
                  {linkText}
                </Link>
              ) : (
                <a
                  key={`${lineIdx}-${match.index}`}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-violet-300 underline decoration-violet-500/50 hover:text-white transition inline-flex items-center gap-0.5"
                >
                  {linkText}
                </a>
              )
            );
          } else if (match[3]) {
            // Bold text
            parts.push(
              <strong key={`${lineIdx}-${match.index}`} className="font-bold text-white">
                {match[3]}
              </strong>
            );
          }

          lastIndex = regex.lastIndex;
        }

        if (lastIndex < textToFormat.length) {
          parts.push(textToFormat.substring(lastIndex));
        }

        if (isBullet) {
          return (
            <div key={lineIdx} className="flex items-start gap-2 pl-1">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-violet-400 shrink-0 shadow-[0_0_6px_rgba(168,85,247,0.8)]" />
              <div className="flex-1">{parts}</div>
            </div>
          );
        }

        return <div key={lineIdx}>{parts}</div>;
      })}
    </div>
  );
}

export function FloatingAIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "model",
      text: "👋 Hi! I am **Tech Tatva AI**, the official virtual assistant for Tech Tatva at Chandigarh University.\n\nAsk me anything about our upcoming hackathons, event registrations, membership drive, or student technical teams!",
      timestamp: new Date()
    }
  ]);
  const [asking, setAsking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, asking]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  async function handleSend(textToSend?: string) {
    const query = (textToSend || prompt).trim();
    if (!query || asking) return;
    setPrompt("");

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: query,
      timestamp: new Date()
    };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setAsking(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: query,
          history: updated.map(m => ({ role: m.role, text: m.text })).slice(0, -1)
        })
      });

      const data = await res.json();
      setAsking(false);

      if (!res.ok) {
        setMessages(prev => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: "model",
            text: data.error || "Sorry, I encountered a temporary connection issue. Please try again in a moment.",
            timestamp: new Date()
          }
        ]);
        return;
      }

      setMessages(prev => [
        ...prev,
        {
          id: `model-${Date.now()}`,
          role: "model",
          text: data.response || "I couldn't locate specific details for that request. Feel free to explore our [Events](/events) or [Join Us](/join)!",
          timestamp: new Date()
        }
      ]);
    } catch {
      setAsking(false);
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "model",
          text: "Network connection error. Please check your internet connection and try again.",
          timestamp: new Date()
        }
      ]);
    }
  }

  function handleCopy(id: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleReset() {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: "model",
        text: "Conversation refreshed. Ask me anything about Tech Tatva events, team recruitment, or the membership drive at Chandigarh University!",
        timestamp: new Date()
      }
    ]);
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <>
      {/* Mobile backdrop dismiss */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[85] sm:hidden"
        />
      )}

      {/* ── Floating Launcher Pill (Unopened state) ── */}
      {/* Clean, high-tech cyber pill that tells visitors who it is without covering screen content */}
      <div className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[80] transition-all duration-300 ${isOpen ? "opacity-0 pointer-events-none scale-90 translate-y-4" : "opacity-100 pointer-events-auto scale-100 translate-y-0"}`}>
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-3 rounded-full border border-violet-500/40 bg-[#0c0517]/90 px-3 py-2 sm:px-4 sm:py-2.5 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.7),0_0_24px_rgba(139,92,246,0.3)] hover:border-violet-400 hover:shadow-[0_12px_45px_rgba(0,0,0,0.8),0_0_35px_rgba(168,85,247,0.45)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-300"
          aria-label="Open Tech Tatva AI Assistant"
        >
          {/* Animated gradient ring on hover */}
          <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-400 opacity-0 blur-sm group-hover:opacity-60 transition duration-500" />
          
          {/* AI Avatar Icon with live pulse indicator */}
          <div className="relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-gradient-to-tr from-violet-600 via-fuchsia-500 to-cyan-400 p-[1.5px] shadow-[0_0_15px_rgba(168,85,247,0.5)] shrink-0">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-[#0a0514]">
              <Sparkles size={16} className="text-violet-300 group-hover:rotate-12 transition-transform duration-300" />
            </div>
            {/* Live Online Pip */}
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-black" />
            </span>
          </div>

          {/* Descriptive labels — Clearly identifies AI without being obstructive */}
          <div className="flex flex-col text-left pr-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] sm:text-xs font-black tracking-tight text-white group-hover:text-violet-200 transition">
                Tech Tatva AI
              </span>
              <span className="text-[8px] font-mono font-black uppercase px-1.5 py-0.2 rounded-full bg-violet-500/25 text-violet-300 border border-violet-500/40">
                Online
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-medium text-white/60 group-hover:text-white/80 transition truncate max-w-[135px] sm:max-w-[180px]">
              Ask events, teams & joining
            </span>
          </div>

          {/* Quick interactive hint badge */}
          <div className="hidden sm:flex items-center gap-1 rounded-full bg-white/5 border border-white/10 px-2 py-1 text-[10px] font-mono text-violet-300 group-hover:bg-violet-500/20 group-hover:border-violet-500/40 transition">
            <Bot size={11} />
            <span>Chat</span>
          </div>
        </button>
      </div>

      {/* ── Pop-Up Chat Window ── */}
      <div
        className={`fixed inset-x-3 bottom-3 sm:inset-auto sm:right-6 sm:bottom-6 z-[90] w-auto sm:w-[410px] h-[580px] max-h-[88vh] flex flex-col justify-between overflow-hidden rounded-[26px] border border-violet-500/35 bg-[#090314]/98 backdrop-blur-2xl shadow-[0_25px_80px_rgba(0,0,0,0.85),0_0_50px_rgba(139,92,246,0.22)] transition-all duration-300 ease-out transform origin-bottom-right ${
          isOpen
            ? "scale-100 opacity-100 translate-y-0 pointer-events-auto"
            : "scale-95 opacity-0 translate-y-8 pointer-events-none"
        }`}
      >
        {/* Glowing Top Ambient Edge */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-violet-500 to-transparent shadow-[0_0_12px_rgba(168,85,247,0.9)]" />
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/[0.04] via-transparent to-fuchsia-600/[0.04] pointer-events-none" />

        {/* Header */}
        <div className="relative flex items-center justify-between border-b border-white/[0.08] bg-white/[0.02] px-5 py-3.5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-tr from-violet-600 via-fuchsia-500 to-cyan-400 p-[1.5px] shadow-[0_0_15px_rgba(139,92,246,0.3)]">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#0a0514]">
                <Sparkles size={16} className="text-violet-300" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 border border-black animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-black text-white tracking-tight">Tech Tatva AI</p>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold">
                  LIVE
                </span>
              </div>
              <p className="text-[10px] text-white/50 tracking-tight">Official Interactive Club Assistant</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleReset}
              title="Reset conversation"
              className="rounded-lg p-2 text-white/40 hover:bg-white/[0.06] hover:text-white transition active:scale-95"
              aria-label="Restart chat"
            >
              <RotateCcw size={14} />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-2 text-white/40 hover:bg-white/[0.06] hover:text-white transition active:scale-95"
              aria-label="Close chat"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Message Log */}
        <div
          ref={scrollRef}
          className="relative flex-grow overflow-y-auto px-4 sm:px-5 py-4 flex flex-col gap-3.5 overscroll-contain"
        >
          {messages.map((m) => (
            <div key={m.id} className={`flex flex-col gap-1 ${m.role === "user" ? "items-end" : "items-start"}`}>
              <div
                className={`relative px-4 py-3 rounded-2xl text-[12px] leading-relaxed max-w-[90%] break-words shadow-sm group ${
                  m.role === "user"
                    ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-tr-none shadow-[0_4px_16px_rgba(139,92,246,0.3)] font-medium"
                    : "bg-white/[0.035] border border-white/[0.09] text-white/90 rounded-tl-none font-sans shadow-[0_2px_12px_rgba(0,0,0,0.4)]"
                }`}
              >
                {m.role === "model" ? (
                  <>
                    <FormattedContent content={m.text} />
                    {/* Copy Response Action */}
                    <button
                      onClick={() => handleCopy(m.id, m.text)}
                      title="Copy response"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md bg-white/10 hover:bg-white/20 text-white/60 hover:text-white"
                    >
                      {copiedId === m.id ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                    </button>
                  </>
                ) : (
                  <span>{m.text}</span>
                )}
              </div>
              <span className="text-[9px] text-white/30 px-1 font-mono">
                {m.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          ))}

          {/* Animated Thinking State */}
          {asking && (
            <div className="flex flex-col items-start gap-1">
              <div className="px-4 py-3 rounded-2xl rounded-tl-none bg-white/[0.035] border border-white/[0.09] text-[12px] text-white/60 font-sans shadow-sm flex items-center gap-2.5">
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span className="text-[11px] font-mono text-white/50">Consulting club records...</span>
              </div>
            </div>
          )}

          {/* Quick Suggestion Chips (Shown on fresh conversation) */}
          {messages.length <= 2 && !asking && (
            <div className="mt-2 pt-2 border-t border-white/[0.06]">
              <p className="text-[10px] font-mono text-white/40 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles size={11} className="text-violet-400" /> Quick questions:
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {STARTER_PROMPTS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(p.query)}
                    className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] hover:bg-violet-500/10 hover:border-violet-500/35 px-2.5 py-2 text-left text-[11px] text-white/70 hover:text-white transition active:scale-[0.98]"
                  >
                    <span>{p.icon}</span>
                    <span className="truncate font-medium">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="relative border-t border-white/[0.08] bg-[#0c0517]/80 p-3.5 sm:p-4 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="relative flex items-center"
          >
            <input
              ref={inputRef}
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={asking}
              placeholder={asking ? "Processing query..." : "Ask about events, teams, registrations..."}
              className="w-full rounded-2xl border border-white/[0.1] bg-black/50 py-3 pl-4 pr-12 text-[12px] text-white outline-none placeholder:text-white/30 focus:border-violet-400/50 disabled:opacity-60 transition shadow-inner"
            />
            <button
              type="submit"
              disabled={asking || !prompt.trim()}
              className="absolute right-2 h-8 w-8 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-white flex items-center justify-center transition active:scale-90 disabled:opacity-30 disabled:pointer-events-none shadow-[0_0_12px_rgba(139,92,246,0.4)]"
              aria-label="Send message"
            >
              <Send size={13} />
            </button>
          </form>

          {/* Footer branding */}
          <div className="mt-2 flex items-center justify-between text-[9px] font-mono text-white/30 px-1">
            <span className="flex items-center gap-1">
              <CornerDownLeft size={9} /> Enter to send
            </span>
            <span>Tech Tatva OS • Gemini Intelligence</span>
          </div>
        </div>
      </div>
    </>
  );
}

