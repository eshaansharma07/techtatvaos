"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Loader2, ShieldCheck } from "lucide-react";

export function InviteAcceptForm() {
  const params = useSearchParams();
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/portal/invites/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: params.get("token"), name, password })
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Invite could not be accepted.");
      return;
    }
    router.replace("/login");
  }

  return (
    <form onSubmit={submit} className="relative w-full overflow-hidden rounded-[2rem] border border-white/10 bg-black/45 p-8 shadow-2xl shadow-violet-950/40 backdrop-blur-2xl">
      <div className="mb-8 grid h-12 w-12 place-items-center rounded-2xl border border-violet-300/30 bg-violet-500/10 text-violet-200">
        <ShieldCheck size={20} />
      </div>
      <p className="text-[10px] font-semibold tracking-[.3em] text-violet-300">PORTAL INVITE</p>
      <h1 className="mt-4 text-4xl font-medium tracking-[-.055em] text-white md:text-5xl">Verify your access.</h1>
      <p className="mt-4 text-sm leading-6 text-white/45">Set your name and password to activate your invite-only portal account.</p>
      <div className="mt-8 space-y-4">
        <label className="block text-[10px] font-semibold tracking-[.18em] text-white/35">NAME<input value={name} onChange={(event)=>setName(event.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[.045] px-4 py-4 text-sm text-white outline-none focus:border-violet-300/60"/></label>
        <label className="block text-[10px] font-semibold tracking-[.18em] text-white/35">PASSWORD<input value={password} onChange={(event)=>setPassword(event.target.value)} type="password" className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[.045] px-4 py-4 text-sm text-white outline-none focus:border-violet-300/60"/></label>
      </div>
      {error ? <div className="mt-4 rounded-2xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-xs leading-5 text-rose-100">{error}</div> : null}
      <button disabled={loading} className="brutalist-btn-purple relative mt-6 flex w-full min-h-[3.75rem] items-center justify-center gap-2 rounded-2xl text-[14px] font-extrabold text-black border-2 border-white/40 shadow-[0_0_30px_rgba(168,85,247,0.5)] transition active:scale-95 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed group">
        {loading ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
        Activate portal account
        <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
      </button>
    </form>
  );
}
