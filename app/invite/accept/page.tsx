import Image from "next/image";
import { Suspense } from "react";
import { InviteAcceptForm } from "@/components/invite-accept-form";

export default function InviteAcceptPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-ink text-white">
      <Image src="/tech-tatva-hero-v2.png" alt="" fill priority className="object-cover opacity-35" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(139,92,246,.32),transparent_35%),linear-gradient(120deg,rgba(0,0,0,.92),rgba(6,5,9,.7)_50%,rgba(0,0,0,.96))]" />
      <section className="relative mx-auto flex min-h-screen max-w-3xl items-center px-6 py-16">
        <Suspense fallback={<div className="glass h-[460px] w-full rounded-[2rem]" />}>
          <InviteAcceptForm />
        </Suspense>
      </section>
    </main>
  );
}
