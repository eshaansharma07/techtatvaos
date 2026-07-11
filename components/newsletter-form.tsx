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
    <div className="glass-brutalist rounded-[22px] p-5">
      <h4 className="text-xs font-bold tracking-[0.15em] text-[#00FF66] uppercase">
        Stay updated
      </h4>
      <p className="mt-2 text-[11px] leading-5 text-white/45">
        Subscribe to get notified about upcoming hackathons, recruitment drives, and project updates.
      </p>

      {status === "success" ? (
        <div className="mt-4 flex items-center gap-2 text-[#00FF66] text-xs py-2 animate-pulse">
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
            className="w-full h-10 rounded-xl border border-white/[0.08] bg-black/35 px-4 pr-11 text-xs text-white placeholder-white/25 outline-none transition focus:border-[#00FF66]/50 disabled:opacity-50"
            required
          />
          <button
            type="submit"
            disabled={status === "loading" || !email}
            className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-lg bg-[#00FF66] text-black transition hover:bg-[#00FF66]/80 disabled:opacity-30"
            aria-label="Submit newsletter form"
          >
            {status === "loading" ? (
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-black border-t-transparent" />
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
