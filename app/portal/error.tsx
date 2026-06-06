"use client";

import { useEffect } from "react";

export default function PortalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Portal render failure", error);
  }, [error]);

  return (
    <main className="portal-root grid min-h-screen place-items-center px-5">
      <section className="max-w-xl rounded-[2rem] border border-rose-300/20 bg-rose-500/[.06] p-7 text-center shadow-2xl shadow-black/35 backdrop-blur-xl">
        <p className="text-[10px] font-semibold uppercase tracking-[.24em] text-rose-100/70">Portal recovery</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-.05em] text-white">The admin panel hit bad saved data.</h1>
        <p className="mt-4 text-sm leading-6 text-white/55">
          The page is protected from fully blanking now. Refresh the portal data and continue editing.
        </p>
        <button
          type="button"
          onClick={reset}
          className="portal-command-button mt-6 rounded-2xl px-5 py-3 text-sm font-semibold"
        >
          Reload portal
        </button>
      </section>
    </main>
  );
}
