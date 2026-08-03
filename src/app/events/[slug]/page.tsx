import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Calendar, Check, Clock, MapPin, Sparkles, Users } from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { getPublicEvent } from "@/lib/public-data";
import { RegisterForm } from "@/components/register-form";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary-client";

export const revalidate = 60;

const dateText = (value?: string) =>
  value ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value)) : "Date TBA";

const timeText = (value?: string) =>
  value ? new Intl.DateTimeFormat("en-IN", { timeStyle: "short" }).format(new Date(value)) : "Time TBA";

export default async function EventDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getPublicEvent(slug);

  if (!event) {
    return (
      <PublicShell>
        <section className="mx-auto max-w-4xl px-5 pb-20 pt-28 md:px-6 md:pb-24 md:pt-44 spatial-grid-bg">
          <Link href="/events" className="brutalist-btn-dark inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs">
            <ArrowLeft size={14} /> BACK TO EVENTS
          </Link>
          <div className="glass-brutalist mt-10 rounded-2xl p-10">
            <h1 className="text-4xl font-bold text-white">Event not found.</h1>
            <p className="mt-4 text-sm leading-6 text-white/45">
              This event is not published, active, or does not exist. If you just published it from the admin portal, wait a minute for the cache to refresh, or contact the club tech team.
            </p>
          </div>
        </section>
      </PublicShell>
    );
  }

  const modeLabel =
    event.participationMode === "both"
      ? "Individual or team"
      : event.participationMode === "team"
        ? "Team based"
        : "Individual";

  return (
    <PublicShell>
      <section className="mx-auto max-w-7xl xl:max-w-[1380px] 2xl:max-w-[1536px] px-5 pb-32 pt-32 md:px-6 md:pb-36 md:pt-44 spatial-grid-bg">
        <Link href="/events" className="brutalist-btn-dark inline-flex min-h-11 items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-[.18em] text-white transition">
          <ArrowLeft size={14} /> BACK TO EVENTS
        </Link>

        <div className="glass-brutalist relative mt-5 overflow-hidden rounded-[2.2rem] p-5 md:mt-8 md:rounded-[2.8rem] md:p-9 relative z-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(168,85,247,0.05),transparent_45%)] pointer-events-none" />
          <div className="relative grid items-center gap-8 lg:grid-cols-[.86fr_1.14fr]">
            <div className="max-w-3xl">
              {event.certEventLogo ? (
                <div className="mb-5 inline-flex items-center justify-center rounded-2xl bg-black/40 border border-white/10 p-3 h-14 w-14 backdrop-blur-md">
                  <Image width={1200} height={1200} src={optimizeCloudinaryUrl(event.certEventLogo, 120)} alt="" className="h-full w-full object-contain" />
                </div>
              ) : null}
              <span className="inline-flex items-center gap-2 rounded-xl border-2 border-black bg-purple-500 px-3 py-1 md:px-4 md:py-1.5 text-[9px] md:text-[10px] font-bold tracking-[.24em] text-black shadow-[2px_2px_0px_0px_rgba(255,255,255,0.8)]">
                <Sparkles size={12} />
                {(event.category || "EVENT").toUpperCase()}
              </span>
              <h1 className="mt-5 text-[2.5rem] font-extrabold leading-[1.05] tracking-[-.05em] text-white md:mt-8 md:text-7xl lg:text-8xl">{event.title}</h1>
              <p className="mt-4 max-w-2xl text-[13px] leading-relaxed text-white/60 md:mt-6 md:text-lg md:leading-8">{event.description || "No description has been added yet."}</p>
              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                <div className="glass-brutalist px-4 py-4 rounded-xl">
                  <Calendar className="text-purple-400" size={16} />
                  <p className="mt-3 text-xs uppercase tracking-[.16em] text-white/35 font-bold">Date</p>
                  <p className="mt-1 text-sm font-semibold text-white/80">{dateText(event.startAt)}</p>
                </div>
                <div className="glass-brutalist px-4 py-4 rounded-xl">
                  <Clock className="text-purple-400" size={16} />
                  <p className="mt-3 text-xs uppercase tracking-[.16em] text-white/35 font-bold">Time</p>
                  <p className="mt-1 text-sm font-semibold text-white/80">{timeText(event.startAt)}</p>
                </div>
                <div className="glass-brutalist px-4 py-4 rounded-xl">
                  <Users className="text-purple-400" size={16} />
                  <p className="mt-3 text-xs uppercase tracking-[.16em] text-white/35 font-bold">Mode</p>
                  <p className="mt-1 text-sm font-semibold text-white/80">{modeLabel}</p>
                </div>
              </div>
            </div>
            {event.banner ? (
              <div className="glass-brutalist rounded-[2rem] p-3 shadow-2xl">
                <div className="grid min-h-[260px] place-items-center overflow-hidden rounded-[1.25rem] bg-black/40 p-4 md:min-h-[420px] md:p-6">
                  <Image width={1200} height={1200} src={optimizeCloudinaryUrl(event.banner, 1000)} alt="" className="max-h-[330px] max-w-full object-contain drop-shadow-[0_24px_70px_rgba(0,0,0,.45)] md:max-h-[490px]" />
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:mt-8 lg:grid-cols-[1fr_390px] lg:items-start relative z-10">
          <div className="glass-brutalist rounded-[2rem] p-6 md:p-8">
            <p className="text-[10px] font-bold uppercase tracking-[.24em] text-purple-400">Brief</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-[-.045em] text-white">About the event</h2>
            <p className="mt-5 whitespace-pre-line text-sm leading-7 text-white/50 md:text-base md:leading-8">
              {event.description || "Details will appear once an admin updates this event."}
            </p>

            {event.rules.length ? (
              <>
                <h3 className="mt-10 text-xl font-bold tracking-[-.03em] text-white">Rules</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {event.rules.map((rule: string) => (
                    <p className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/70" key={rule}>
                      <Check size={14} className="text-purple-400" />
                      {rule}
                    </p>
                  ))}
                </div>
              </>
            ) : null}

            {event.faqs.length ? (
              <div className="mt-9 space-y-3">
                {event.faqs.map((faq: any) => (
                  <div className="glass-brutalist rounded-xl p-5" key={faq.question}>
                    <p className="text-sm font-bold text-white">{faq.question}</p>
                    <p className="mt-2 text-xs leading-5 text-white/45">{faq.answer}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <aside className="glass-brutalist rounded-[2rem] p-5 md:p-6 lg:sticky lg:top-28 lg:self-start">
            <h3 className="text-xl font-bold tracking-[-.035em] text-white">Registration</h3>
            <div className="mt-5 space-y-3 text-sm text-white/54">
              <p className="flex gap-3 rounded-xl border border-white/10 bg-black/40 p-4"><MapPin size={16} className="text-purple-400" />{event.venue || "Venue TBA"}</p>
              <p className="flex gap-3 rounded-xl border border-white/10 bg-black/40 p-4"><Users size={16} className="text-purple-400" />{event.registrations} / {event.capacity || "unlimited"} {event.participationMode === "team" ? "participants registered" : "seats claimed"}</p>
            </div>

            <p className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4 text-xs leading-5 text-white/60">
              Participation: {modeLabel}
              {event.participationMode !== "individual" ? ` · Max team size ${event.maxTeamSize}` : ""}
            </p>

            {event.registrationOpen ? (
              <RegisterForm eventId={event.id} participationMode={event.participationMode} maxTeamSize={event.maxTeamSize} />
            ) : (
              <p className="mt-7 rounded-xl border border-white/[.08] bg-white/[.035] p-4 text-center text-xs text-white/45">Registration is currently closed.</p>
            )}
            <p className="mt-3 flex items-center justify-center gap-1 text-center text-[10px] text-white/30">Secure registration <ArrowUpRight size={11} /></p>
          </aside>
        </div>
      </section>
    </PublicShell>
  );
}
