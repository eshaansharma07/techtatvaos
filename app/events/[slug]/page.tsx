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
          <Link href="/events" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.14em] text-stone-500">
            <ArrowLeft size={14} /> BACK TO EVENTS
          </Link>
          <div className="mt-10 rounded-[2rem] border border-stone-200 bg-white p-10">
            <h1 className="text-4xl text-stone-950">Event not found.</h1>
            <p className="mt-4 text-sm leading-6 text-stone-500">This event is not published, active, or does not exist.</p>
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
        <Link href="/events" className="flex min-h-11 items-center gap-2 text-xs font-semibold uppercase tracking-[.14em] text-stone-500">
          <ArrowLeft size={14} /> BACK TO EVENTS
        </Link>

        <div className="relative mt-5 overflow-hidden rounded-[2.4rem] border border-stone-200/80 bg-[#fffdf8] p-5 shadow-[0_30px_110px_rgba(82,52,30,.08)] md:mt-8 md:p-10">
          <div className="relative grid items-center gap-8 lg:grid-cols-[.9fr_1.1fr]">
            <div className="max-w-3xl">
              <span className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-[10px] font-bold tracking-[.2em] text-rose-500">
                {(event.category || "EVENT").toUpperCase()}
              </span>
              <h1 className="mt-6 text-[3.35rem] font-semibold leading-[.9] tracking-[-.075em] text-stone-950 md:mt-8 md:text-8xl">{event.title}</h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-stone-500">{event.description || "No description has been added yet."}</p>
            </div>
            {event.banner ? (
              <div className="rounded-[2rem] border border-stone-200 bg-white p-3 shadow-[0_26px_80px_rgba(82,52,30,.1)] md:p-5">
                <div className="grid min-h-[230px] place-items-center rounded-[1.5rem] bg-[#faf8f5] p-4 md:min-h-[360px] md:p-6">
                  <img src={event.banner} alt="" className="max-h-[300px] max-w-full object-contain md:max-h-[430px]" />
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:mt-6 md:gap-5 lg:grid-cols-[1fr_360px]">
          <div className="rounded-[2rem] border border-stone-200/80 bg-white p-5 shadow-[0_22px_70px_rgba(82,52,30,.07)] md:p-7">
            <h2 className="text-2xl font-semibold tracking-[-.04em] text-stone-950">About the event</h2>
            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-stone-500">
              {event.description || "Details will appear once an admin updates this event."}
            </p>

            {event.rules.length ? (
              <>
                <h3 className="mt-9 text-sm font-semibold text-stone-950">Rules</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {event.rules.map((rule: string) => (
                    <p className="flex items-center gap-2 text-xs text-stone-500" key={rule}>
                      <Check size={14} className="text-rose-400" />
                      {rule}
                    </p>
                  ))}
                </div>
              </>
            ) : null}

            {event.faqs.length ? (
              <div className="mt-9 space-y-3">
                {event.faqs.map((faq: any) => (
                  <div className="rounded-2xl border border-stone-200 bg-[#faf8f5] p-4" key={faq.question}>
                    <p className="text-sm font-semibold text-stone-950">{faq.question}</p>
                    <p className="mt-2 text-xs leading-5 text-stone-500">{faq.answer}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <aside className="rounded-[2rem] border border-stone-200/80 bg-white p-5 shadow-[0_22px_70px_rgba(82,52,30,.07)] md:p-6">
            <h3 className="text-sm font-semibold uppercase tracking-[.16em] text-stone-500">Event details</h3>
            <div className="mt-5 space-y-4 text-xs text-stone-500">
              <p className="flex gap-3"><Calendar size={15} className="text-rose-400" />{dateText(event.startAt)}</p>
              <p className="flex gap-3"><Clock size={15} className="text-rose-400" />{timeText(event.startAt)}</p>
              <p className="flex gap-3"><MapPin size={15} className="text-rose-400" />{event.venue || "Venue TBA"}</p>
              <p className="flex gap-3"><Users size={15} className="text-rose-400" />{event.registrations} / {event.capacity || "unlimited"} seats claimed</p>
            </div>

            <p className="mt-5 rounded-2xl border border-stone-200 bg-[#faf8f5] p-3 text-xs text-stone-500">
              Participation: {modeLabel}
              {event.participationMode !== "individual" ? ` · Max team size ${event.maxTeamSize}` : ""}
            </p>

            {event.registrationOpen ? (
              <RegisterForm eventId={event.id} participationMode={event.participationMode} maxTeamSize={event.maxTeamSize} />
            ) : (
              <p className="mt-7 rounded-2xl border border-stone-200 bg-[#faf8f5] p-4 text-center text-xs text-stone-500">Registration is currently closed.</p>
            )}
            <p className="mt-3 text-center text-[10px] text-stone-400">Registrations write directly to MongoDB.</p>
          </aside>
        </div>
      </section>
    </PublicShell>
  );
}
