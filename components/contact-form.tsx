"use client";

import { useState } from "react";
import { ArrowRight, Send } from "lucide-react";

export function ContactForm() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(formData: FormData) {
    setLoading(true);
    setStatus("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(formData.entries())),
      });
      const data = await res.json();
      setLoading(false);
      setStatus(
        res.ok
          ? "Message sent successfully! Our team will get back to you shortly."
          : data.error || "Something went wrong. Please try again."
      );
    } catch {
      setLoading(false);
      setStatus("Failed to connect to the server.");
    }
  }

  return (
    <form
      action={submit}
      className="contact-card premium-card grid gap-5 rounded-[2.5rem] border border-white/[0.06] bg-white/[0.01] p-6 backdrop-blur-xl md:grid-cols-2 md:p-10"
    >
      {[
        ["name", "Full Name", "text", "Eshaan Sharma"],
        ["email", "Email Address", "email", "eshaan@example.com"],
        ["subject", "Subject", "text", "Partnership Inquiry"],
      ].map(([name, label, type, placeholder]) => (
        <label
          className={`block text-[10px] font-bold uppercase tracking-[.25em] text-white/30 ${
            name === "subject" ? "md:col-span-2" : ""
          }`}
          key={name}
        >
          {label}
          <input
            required
            name={name}
            type={type}
            placeholder={placeholder}
            className="mt-2.5 min-h-[3.75rem] w-full rounded-2xl border border-white/10 bg-white/[0.015] px-5 py-3 text-sm text-white placeholder-white/20 outline-none transition duration-200 focus:border-violet-500/50 focus:bg-violet-500/[0.03] focus:ring-1 focus:ring-violet-500/20"
          />
        </label>
      ))}
      
      <label className="block text-[10px] font-bold uppercase tracking-[.25em] text-white/30 md:col-span-2">
        Your Message
        <textarea
          required
          name="message"
          rows={6}
          placeholder="Write your message details here..."
          className="mt-2.5 w-full rounded-2xl border border-white/10 bg-white/[0.015] px-5 py-4 text-sm text-white placeholder-white/20 outline-none transition duration-200 focus:border-violet-500/50 focus:bg-violet-500/[0.03] focus:ring-1 focus:ring-violet-500/20"
        />
      </label>

      <button
        disabled={loading}
        className="group relative flex min-h-[3.75rem] items-center justify-center gap-2.5 overflow-hidden rounded-2xl border border-violet-500/30 bg-violet-500/10 px-6 text-sm font-semibold text-violet-200 transition duration-300 hover:border-violet-500/50 hover:bg-violet-500/20 active:scale-[0.98] disabled:opacity-60 md:col-span-2"
      >
        {loading ? (
          "Sending message..."
        ) : (
          <>
            Send message <ArrowRight size={14} className="transition group-hover:translate-x-1" />
          </>
        )}
      </button>

      {status && (
        <p className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4 text-center text-xs font-medium text-violet-200 md:col-span-2">
          {status}
        </p>
      )}
    </form>
  );
}
