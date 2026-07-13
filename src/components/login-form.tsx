"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Loader2, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";

function safeCallback(value: string | null) {
  if (!value) return "/portal";
  try {
    const url = new URL(value, window.location.origin);
    if (url.origin !== window.location.origin) return "/portal";
    return `${url.pathname}${url.search}${url.hash}` || "/portal";
  } catch {
    return "/portal";
  }
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const callbackUrl = safeCallback(params.get("callbackUrl"));
    const result = await signIn("credentials", {
      email,
      password,
      otp,
      redirect: false,
      callbackUrl
    });

    setLoading(false);

    if (!result || result.error) {
      setError("Invalid portal credentials, unverified invite, or missing 2FA code.");
      return;
    }

    router.replace(result.url ? safeCallback(result.url) : callbackUrl);
    router.refresh();
  }

  return (
    <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-black/45 p-6 shadow-2xl shadow-violet-950/40 backdrop-blur-2xl md:p-8">
      <div className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-violet-500/20 blur-3xl" />
      <div className="absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-fuchsia-500/15 blur-3xl" />
      <div className="relative">
        <div className="mb-8 flex items-center justify-between">
          <div className="grid h-12 w-12 place-items-center rounded-2xl border border-violet-300/30 bg-violet-500/10 text-violet-200">
            <LockKeyhole size={20} />
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.04] px-3 py-1.5 text-[10px] font-semibold tracking-[.18em] text-white/45">
            <Sparkles size={12} className="text-violet-300" />
            INTERNAL ACCESS
          </span>
        </div>

        <p className="text-[10px] font-semibold tracking-[.3em] text-violet-300">TECH TATVA OS</p>
        <h1 className="mt-4 text-4xl font-medium tracking-[-.055em] text-white md:text-5xl">
          Command center login.
        </h1>
        <p className="mt-4 text-sm leading-6 text-white/45">
          Invite-only access for verified club operators.
        </p>

        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          <label className="block text-[10px] font-semibold tracking-[.18em] text-white/35">
            EMAIL
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[.045] px-4 py-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-violet-300/60 focus:bg-white/[.07]"
              autoComplete="email"
              inputMode="email"
            />
          </label>
          <label className="block text-[10px] font-semibold tracking-[.18em] text-white/35">
            PASSWORD
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[.045] px-4 py-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-violet-300/60 focus:bg-white/[.07]"
              type="password"
              autoComplete="current-password"
              autoFocus
            />
          </label>
          <label className="block text-[10px] font-semibold tracking-[.18em] text-white/35">
            2FA CODE <span className="text-white/20">(IF ENABLED)</span>
            <input
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[.045] px-4 py-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-violet-300/60 focus:bg-white/[.07]"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
            />
          </label>

          {error ? (
            <div className="rounded-2xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-xs leading-5 text-rose-100">
              {error}
            </div>
          ) : null}

          <button
            disabled={loading}
            className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 text-sm font-semibold text-black transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
            Enter internal portal
            <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
