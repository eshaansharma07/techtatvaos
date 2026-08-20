import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { TechnomaniaRegisterClient } from "@/components/technomania/technomania-register-client";
import { getTechnomaniaEvents } from "@/lib/technomania-data";

export const dynamic = "force-dynamic";

export default async function TechnomaniaRegisterPage() {
  const events = await getTechnomaniaEvents();

  return (
    <section className="mx-auto max-w-5xl px-5 pb-20 pt-28 md:px-6 md:pb-28 md:pt-36">
      <Link href="/technomania" className="inline-flex items-center gap-2 text-tm-dim hover:text-white transition text-xs font-tm-mono tracking-wider mb-6">
        <ArrowLeft size={14} /> BACK TO TECHNOMANIA HOME
      </Link>

      <div className="flex items-center gap-3 mb-2">
        <div className="tm-hazard-stripe-accent w-8" />
        <span className="tm-label">REGISTRATION</span>
      </div>
      <h1 className="font-tm-heading text-4xl md:text-6xl lg:text-7xl font-black tracking-[-0.04em]">
        REGISTER<br />
        <span className="text-tm-muted">NOW.</span>
      </h1>
      <p className="mt-4 text-tm-muted text-sm md:text-base max-w-2xl leading-7">
        Choose your events and register. You can participate in multiple events — just make sure the schedules don&apos;t overlap.
      </p>

      {/* Registration Form */}
      <div className="mt-12">
        <TechnomaniaRegisterClient events={events} />
      </div>

      {/* Info */}
      <div className="mt-10 tm-card p-5">
        <p className="font-tm-mono text-xs text-tm-dim leading-5">
          <span className="text-tm-accent">TIP:</span> You&apos;ll receive a QR code ticket upon successful registration. Save it for entry.
        </p>
      </div>
    </section>
  );
}
