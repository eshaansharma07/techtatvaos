import Image from "next/image";
import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-ink text-white">
      <Image src="/tech-tatva-hero.png" alt="" fill priority className="object-cover opacity-45" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(139,92,246,.32),transparent_35%),linear-gradient(120deg,rgba(0,0,0,.92),rgba(6,5,9,.7)_50%,rgba(0,0,0,.96))]" />
      <div className="absolute inset-0 grid-bg opacity-20" />
      <section className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-[1.05fr_.95fr]">
        <div className="hidden max-w-2xl lg:block">
          <p className="text-[10px] font-semibold tracking-[.32em] text-violet-300">
            INVITE-ONLY OPERATIONS LAYER
          </p>
          <h2 className="gradient-text mt-6 text-7xl font-medium leading-[.92] tracking-[-.075em]">
            Control the signal.
          </h2>
          <p className="mt-7 max-w-lg text-sm leading-7 text-white/45">
            Verified club operators can manage members, events, attendance, announcements, and reports from one protected surface.
          </p>
        </div>
        <div className="flex justify-center lg:justify-end">
          <Suspense fallback={<div className="glass h-[540px] w-full max-w-md rounded-[2rem]" />}>
            <LoginForm />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
