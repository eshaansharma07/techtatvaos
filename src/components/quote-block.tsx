"use client";

import { useEffect, useState } from "react";
import { Terminal } from "lucide-react";

const QUOTES = [
  { text: "The best way to predict the future is to invent it.", author: "Alan Kay" },
  { text: "Simplicity is the soul of efficiency.", author: "Austin Freeman" },
  { text: "Make it work, make it right, make it fast.", author: "Kent Beck" },
  { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds" },
  { text: "Software is a great combination of artistry and engineering.", author: "Bill Gates" },
  { text: "Before software can be reusable it first has to be usable.", author: "Ralph Johnson" },
  { text: "The details are not the details. They make the design.", author: "Charles Eames" }
];

export function QuoteBlock() {
  const [quote, setQuote] = useState<{ text: string; author: string } | null>(null);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * QUOTES.length);
    setQuote(QUOTES[randomIndex]);
  }, []);

  if (!quote) return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 backdrop-blur-xl min-h-[110px]" />
  );

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 backdrop-blur-xl flex flex-col justify-between min-h-[110px]">
      <div className="flex gap-2 items-start">
        <Terminal size={12} className="text-violet-300/40 mt-1 flex-shrink-0" />
        <p className="text-[11px] leading-5 text-white/60 italic font-mono">
          &ldquo;{quote.text}&rdquo;
        </p>
      </div>
      <p className="mt-3 text-[9px] font-semibold tracking-wider text-violet-300/50 text-right uppercase">
        &mdash; {quote.author}
      </p>
    </div>
  );
}
