"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, X, Brain, Sparkles } from "lucide-react";

interface ChatMessage {
  role: "user" | "model";
  text: string;
  timestamp: Date;
}

export function FloatingAIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "model",
      text: "Hi! I am the Tech Tatva Assistant. Ask me anything about our club events, active teams, recruitment drives, or how to register and join our community!",
      timestamp: new Date()
    }
  ]);
  const [asking, setAsking] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, asking]);

  async function sendMessage() {
    const text = prompt.trim();
    if (!text) return;
    setPrompt("");

    // Append user message
    const userMsg: ChatMessage = { role: "user", text, timestamp: new Date() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setAsking(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: text,
          history: updatedMessages.map(m => ({ role: m.role, text: m.text })).slice(0, -1)
        })
      });

      const data = await res.json();
      setAsking(false);

      if (!res.ok) {
        setMessages(prev => [
          ...prev,
          {
            role: "model",
            text: data.error || "Sorry, I encountered a temporary connection issue. Please try again.",
            timestamp: new Date()
          }
        ]);
        return;
      }

      setMessages(prev => [
        ...prev,
        {
          role: "model",
          text: data.response || "I couldn't locate details for this request. Feel free to browse our recruitment page or active events!",
          timestamp: new Date()
        }
      ]);
    } catch {
      setAsking(false);
      setMessages(prev => [
        ...prev,
        {
          role: "model",
          text: "Network error. Please make sure you are online and try again.",
          timestamp: new Date()
        }
      ]);
    }
  }

  return (
    <>
      {/* Floating Chat Bubble Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 text-white shadow-[0_0_30px_rgba(139,92,246,0.45)] hover:scale-110 active:scale-95 transition-all duration-300 group"
      >
        <span className="absolute -inset-1 rounded-full bg-violet-400/20 blur opacity-40 group-hover:opacity-75 transition-opacity" />
        <span className="absolute -inset-0.5 rounded-full border border-white/20 animate-pulse" />
        {isOpen ? <X size={20} className="relative transition duration-300 rotate-90" /> : <MessageSquare size={20} className="relative transition duration-300" />}
      </button>

      {/* Interactive Chat Window */}
      <div
        className={`fixed bottom-24 right-6 z-50 flex w-[335px] h-[480px] xs:w-[360px] sm:w-[380px] flex-col justify-between overflow-hidden rounded-[2rem] border border-white/[.08] bg-[#0c0512]/92 backdrop-blur-2xl shadow-[0_30px_80px_rgba(20,8,26,0.65)] transition-all duration-300 transform origin-bottom-right ${
          isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-75 opacity-0 translate-y-10 pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.03] via-transparent to-pink-500/[0.03]" />
        
        {/* Header */}
        <div className="relative flex items-center justify-between border-b border-white/[0.06] bg-white/[0.015] px-5 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-400 to-fuchsia-300 text-black shadow-[0_0_20px_rgba(139,92,246,0.22)]">
              <Brain size={15} />
            </span>
            <div>
              <p className="text-xs font-bold text-white tracking-tight">Tech Tatva AI Assistant</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[9px] text-white/40 tracking-wider">ONLINE</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-1.5 text-white/30 hover:bg-white/[0.05] hover:text-white transition"
          >
            <X size={15} />
          </button>
        </div>

        {/* Message Log */}
        <div
          ref={scrollRef}
          className="relative flex-grow overflow-y-auto px-5 py-4 flex flex-col gap-3.5 overscroll-contain mobile-tabs"
        >
          {messages.map((m, idx) => (
            <div key={idx} className={`flex flex-col gap-1 ${m.role === "user" ? "items-end" : "items-start"}`}>
              <div
                className={`px-3.5 py-2.5 rounded-2xl text-[12px] leading-relaxed max-w-[88%] break-words shadow-sm ${
                  m.role === "user"
                    ? "bg-violet-500/15 border border-violet-500/25 text-white rounded-tr-none"
                    : "bg-white/[0.03] border border-white/[0.06] text-white/80 rounded-tl-none font-sans"
                }`}
              >
                {m.text}
              </div>
              <span className="text-[8px] text-white/20 px-1 font-mono">
                {m.timestamp.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}
              </span>
            </div>
          ))}

          {asking && (
            <div className="flex flex-col items-start gap-1">
              <div className="px-3.5 py-2.5 rounded-2xl rounded-tl-none bg-white/[0.03] border border-white/[0.06] text-[11px] text-white/40 font-mono italic animate-pulse">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-ping" />
                  Thinking...
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Input Box */}
        <div className="relative border-t border-white/[0.05] bg-[#0c0512]/60 p-4 shrink-0">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            disabled={asking}
            placeholder={asking ? "Assistant is compiling records..." : "Ask about events, teams, registrations..."}
            className="w-full rounded-2xl border border-white/[.07] bg-black/45 py-3.5 pl-4 pr-12 text-[12px] text-white outline-none placeholder:text-white/22 focus:border-violet-400/40 disabled:opacity-60 transition"
          />
          <button
            onClick={sendMessage}
            disabled={asking || !prompt.trim()}
            className="absolute right-6 top-5.5 h-8 w-8 rounded-xl bg-violet-500/20 hover:bg-violet-500/40 text-violet-200 hover:text-white flex items-center justify-center transition active:scale-95 disabled:opacity-40"
          >
            <Send size={12} />
          </button>
        </div>
      </div>
    </>
  );
}
