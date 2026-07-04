"use client";

import { useState } from "react";
import { Send, CheckCircle2, ArrowRight } from "lucide-react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    // Simple validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus("error");
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setStatus("success");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 backdrop-blur-xl">
      <h4 className="text-xs font-semibold tracking-[0.15em] text-violet-200 uppercase">
        Stay updated
      </h4>
      <p className="mt-2 text-[11px] leading-5 text-white/45">
        Subscribe to get notified about upcoming hackathons, recruitment drives, and project updates.
      </p>

      {status === "success" ? (
        <div className="mt-4 flex items-center gap-2 text-emerald-300 text-xs py-2 animate-pulse">
          <CheckCircle2 size={14} className="flex-shrink-0" />
          <span>Subscription successful. Welcome to the network!</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 relative flex items-center">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === "error") setStatus("idle");
            }}
            placeholder="Enter your email"
            disabled={status === "loading"}
            className="w-full h-10 rounded-xl border border-white/[0.08] bg-black/35 px-4 pr-11 text-xs text-white placeholder-white/25 outline-none transition focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 disabled:opacity-50"
            required
          />
          <button
            type="submit"
            disabled={status === "loading" || !email}
            className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20 text-violet-200 transition hover:bg-violet-500/35 hover:text-white disabled:opacity-30 disabled:hover:bg-violet-500/20 disabled:hover:text-violet-200"
            aria-label="Submit newsletter form"
          >
            {status === "loading" ? (
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-violet-200 border-t-transparent" />
            ) : (
              <ArrowRight size={13} />
            )}
          </button>
        </form>
      )}
      {status === "error" && (
        <p className="mt-2 text-[10px] text-rose-300">{errorMessage}</p>
      )}
    </div>
  );
}
