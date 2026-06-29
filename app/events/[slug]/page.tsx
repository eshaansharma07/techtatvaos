import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Calendar, Check, Clock, MapPin, Sparkles, Users } from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { getPublicEvent } from "@/lib/public-data";
import { RegisterForm } from "@/components/register-form";

export const dynamic = "force-dynamic";

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
        <section className="mx-auto max-w-4xl px-5 pb-20 pt-28 md:px-6 md:pb-24 md:pt-40">
          <Link href="/events" className="flex items-center gap-2 text-xs text-white/45">
            <ArrowLeft size={14} /> BACK TO EVENTS
          </Link>
          <div className="edge mt-10 rounded-2xl bg-white/[.025] p-10">
            <h1 className="text-4xl">Event not found.</h1>
            <p className="mt-4 text-sm leading-6 text-white/45">This event is not published, active, or does not exist.</p>
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
      <section className="mx-auto max-w-7xl px-5 pb-20 pt-32 md:px-6 md:pb-28 md:pt-44">
        <Link href="/events" className="ghost-pill inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[.18em] text-white/52 transition hover:text-white">
          <ArrowLeft size={14} /> BACK TO EVENTS
        </Link>

        <div className="aurora-shell relative mt-5 overflow-hidden rounded-[2.2rem] p-5 md:mt-8 md:rounded-[2.8rem] md:p-9">
          <div className="absolute inset-0 grid-bg opacity-20" />
          <div className="pointer-events-none absolute right-[-12%] top-[-20%] h-96 w-96 rounded-full bg-fuchsia-400/16 blur-[120px]" />
          <div className="relative grid items-center gap-8 lg:grid-cols-[.86fr_1.14fr]">
            <div className="max-w-3xl">
              {event.certEventLogo ? (
                <div className="mb-5 inline-flex items-center justify-center rounded-2xl bg-white/[0.04] border border-white/10 p-3 h-14 w-14 backdrop-blur-md">
                  <img src={event.certEventLogo} alt="" className="h-full w-full object-contain" />
                </div>
              ) : null}
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-[10px] font-bold tracking-[.24em] text-violet-100/80">
                <Sparkles size={12} />
                {(event.category || "EVENT").toUpperCase()}
              </span>
              <h1 className="gradient-text mt-6 text-[3.45rem] font-semibold leading-[.88] tracking-[-.075em] md:mt-8 md:text-8xl">{event.title}</h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-white/58 md:mt-6 md:text-lg md:leading-8">{event.description || "No description has been added yet."}</p>
              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/[.08] bg-black/20 p-4">
                  <Calendar className="text-violet-200" size={16} />
                  <p className="mt-3 text-xs uppercase tracking-[.16em] text-white/35">Date</p>
                  <p className="mt-1 text-sm font-semibold text-white/78">{dateText(event.startAt)}</p>
                </div>
                <div className="rounded-2xl border border-white/[.08] bg-black/20 p-4">
                  <Clock className="text-violet-200" size={16} />
                  <p className="mt-3 text-xs uppercase tracking-[.16em] text-white/35">Time</p>
                  <p className="mt-1 text-sm font-semibold text-white/78">{timeText(event.startAt)}</p>
                </div>
                <div className="rounded-2xl border border-white/[.08] bg-black/20 p-4">
                  <Users className="text-violet-200" size={16} />
                  <p className="mt-3 text-xs uppercase tracking-[.16em] text-white/35">Mode</p>
                  <p className="mt-1 text-sm font-semibold text-white/78">{modeLabel}</p>
                </div>
              </div>
            </div>
            {event.banner ? (
              <div className="rounded-[1.7rem] border border-white/[.08] bg-black/24 p-3 shadow-2xl shadow-black/30 backdrop-blur-sm md:rounded-[2rem] md:p-5">
                <div className="grid min-h-[260px] place-items-center overflow-hidden rounded-[1.25rem] bg-gradient-to-br from-white/[.055] to-violet-400/[.035] p-4 md:min-h-[420px] md:p-6">
                  <img src={event.banner} alt="" className="max-h-[330px] max-w-full object-contain drop-shadow-[0_24px_70px_rgba(0,0,0,.45)] md:max-h-[490px]" />
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:mt-8 lg:grid-cols-[1fr_390px]">
          <div className="premium-card rounded-[2rem] p-6 md:p-8">
            <p className="text-[10px] font-semibold uppercase tracking-[.24em] text-violet-100/55">Brief</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-.045em]">About the event</h2>
            <p className="mt-5 whitespace-pre-line text-sm leading-7 text-white/50 md:text-base md:leading-8">
              {event.description || "Details will appear once an admin updates this event."}
            </p>

            {event.rules.length ? (
              <>
                <h3 className="mt-10 text-xl font-semibold tracking-[-.03em]">Rules</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {event.rules.map((rule: string) => (
                    <p className="flex items-center gap-3 rounded-2xl border border-white/[.07] bg-white/[.025] px-4 py-3 text-sm text-white/58" key={rule}>
                      <Check size={14} className="text-violet-300" />
                      {rule}
                    </p>
                  ))}
                </div>
              </>
            ) : null}

            {event.faqs.length ? (
              <div className="mt-9 space-y-3">
                {event.faqs.map((faq: any) => (
                  <div className="rounded-2xl border border-white/[.07] bg-black/20 p-5" key={faq.question}>
                    <p className="text-sm">{faq.question}</p>
                    <p className="mt-2 text-xs leading-5 text-white/45">{faq.answer}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <aside className="premium-card rounded-[2rem] p-5 md:p-6 lg:sticky lg:top-28 lg:self-start">
            <h3 className="text-xl font-semibold tracking-[-.035em]">Registration</h3>
            <div className="mt-5 space-y-3 text-sm text-white/54">
              <p className="flex gap-3 rounded-2xl border border-white/[.07] bg-black/[.18] p-4"><MapPin size={16} className="text-violet-300" />{event.venue || "Venue TBA"}</p>
              <p className="flex gap-3 rounded-2xl border border-white/[.07] bg-black/[.18] p-4"><Users size={16} className="text-violet-300" />{event.registrations} / {event.capacity || "unlimited"} seats claimed</p>
            </div>

            <p className="mt-5 rounded-2xl border border-white/[.07] bg-white/[.035] p-4 text-xs leading-5 text-white/48">
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
