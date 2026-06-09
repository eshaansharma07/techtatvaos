import Link from "next/link";
import { ArrowLeft, Calendar, Check, Clock, MapPin, Users } from "lucide-react";
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
      <section className="mx-auto max-w-7xl px-5 pb-20 pt-28 md:px-6 md:pb-24 md:pt-32">
        <Link href="/events" className="flex min-h-11 items-center gap-2 text-xs text-white/45">
          <ArrowLeft size={14} /> BACK TO EVENTS
        </Link>

        <div className="relative mt-5 overflow-hidden rounded-[1.8rem] border border-white/[.08] bg-gradient-to-br from-violet-950/80 via-black/45 to-fuchsia-950/50 p-5 md:mt-8 md:rounded-3xl md:p-10">
          <div className="absolute inset-0 grid-bg opacity-20" />
          <div className="relative grid items-center gap-8 lg:grid-cols-[.9fr_1.1fr]">
            <div className="max-w-3xl">
              <span className="rounded-full bg-black/30 px-3 py-1.5 text-[10px] font-bold tracking-[.2em]">
                {(event.category || "EVENT").toUpperCase()}
              </span>
              <h1 className="mt-6 text-[3.35rem] font-medium leading-[.92] tracking-[-.06em] md:mt-8 md:text-8xl">{event.title}</h1>
              <p className="mt-5 max-w-2xl text-[15px] leading-7 text-white/68 md:mt-6 md:text-sm md:text-white/70">{event.description || "No description has been added yet."}</p>
            </div>
            {event.banner ? (
              <div className="rounded-[1.5rem] border border-white/[.08] bg-black/25 p-3 shadow-2xl shadow-black/30 backdrop-blur-sm md:rounded-[1.75rem] md:p-5">
                <div className="grid min-h-[230px] place-items-center rounded-[1.15rem] bg-white/[.03] p-4 md:min-h-[360px] md:p-6">
                  <img src={event.banner} alt="" className="max-h-[300px] max-w-full object-contain drop-shadow-[0_24px_70px_rgba(0,0,0,.45)] md:max-h-[430px]" />
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:mt-6 md:gap-5 lg:grid-cols-[1fr_360px]">
          <div className="glass rounded-2xl p-5 md:p-7">
            <h2 className="text-xl">About the event</h2>
            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-white/45">
              {event.description || "Details will appear once an admin updates this event."}
            </p>

            {event.rules.length ? (
              <>
                <h3 className="mt-9 text-sm">Rules</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {event.rules.map((rule: string) => (
                    <p className="flex items-center gap-2 text-xs text-white/55" key={rule}>
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
                  <div className="rounded-xl border border-white/[.07] bg-black/20 p-4" key={faq.question}>
                    <p className="text-sm">{faq.question}</p>
                    <p className="mt-2 text-xs leading-5 text-white/45">{faq.answer}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <aside className="glass rounded-2xl p-5 md:p-6">
            <h3 className="text-sm">Event details</h3>
            <div className="mt-5 space-y-4 text-xs text-white/50">
              <p className="flex gap-3"><Calendar size={15} className="text-violet-300" />{dateText(event.startAt)}</p>
              <p className="flex gap-3"><Clock size={15} className="text-violet-300" />{timeText(event.startAt)}</p>
              <p className="flex gap-3"><MapPin size={15} className="text-violet-300" />{event.venue || "Venue TBA"}</p>
              <p className="flex gap-3"><Users size={15} className="text-violet-300" />{event.registrations} / {event.capacity || "unlimited"} seats claimed</p>
            </div>

            <p className="mt-5 rounded-xl border border-white/[.07] bg-white/[.035] p-3 text-xs text-white/45">
              Participation: {modeLabel}
              {event.participationMode !== "individual" ? ` · Max team size ${event.maxTeamSize}` : ""}
            </p>

            {event.registrationOpen ? (
              <RegisterForm eventId={event.id} participationMode={event.participationMode} maxTeamSize={event.maxTeamSize} />
            ) : (
              <p className="mt-7 rounded-xl border border-white/[.08] bg-white/[.035] p-4 text-center text-xs text-white/45">Registration is currently closed.</p>
            )}
            <p className="mt-3 text-center text-[10px] text-white/30">Registrations write directly to MongoDB.</p>
          </aside>
        </div>
      </section>
    </PublicShell>
  );
}
