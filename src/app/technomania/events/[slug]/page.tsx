import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, Check, Clock, MapPin, Trophy, Users, Zap } from "lucide-react";
import { getTechnomaniaEvent } from "@/lib/technomania-data";
import { TechnomaniaRegisterForm } from "@/components/technomania/technomania-register-form";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary-client";

export const dynamic = "force-dynamic";

const dateText = (value?: string) =>
  value ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value)) : "Date TBA";

const timeText = (value?: string) =>
  value ? new Intl.DateTimeFormat("en-IN", { timeStyle: "short" }).format(new Date(value)) : "Time TBA";

const eventDescriptionBlocks = (value: string) =>
  value.replace(/\r\n/g, "\n").trim().split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);

export default async function TechnomaniaEventDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getTechnomaniaEvent(slug);

  if (!event) {
    return (
      <section className="mx-auto max-w-4xl px-5 pb-20 pt-28 md:px-6 md:pt-36">
        <Link href="/technomania/events" className="inline-flex items-center gap-2 text-tm-dim hover:text-white transition text-xs font-tm-mono tracking-wider">
          <ArrowLeft size={14} /> BACK TO ALL ARENAS
        </Link>
        <div className="tm-card mt-8 p-10">
          <h1 className="font-tm-heading text-3xl font-bold">EVENT NOT FOUND</h1>
          <p className="mt-4 text-tm-muted text-sm leading-6">
            This event is not published or does not exist. If it was just published, wait a minute for the cache to refresh.
          </p>
          <div className="tm-hazard-stripe w-16 mt-6" />
        </div>
      </section>
    );
  }

  const modeLabel = event.teamSize?.max > 1 ? "Team Based" : "Individual";

  const description = event.description || "";
  const descBlocks = eventDescriptionBlocks(description);
  const isRegistrationOpen = event.status === "active";

  return (
    <section className="mx-auto max-w-7xl px-5 pb-20 pt-28 md:px-6 md:pb-28 md:pt-36">
      {/* Back link */}
      <Link href="/technomania/events" className="inline-flex items-center gap-2 text-tm-dim hover:text-white transition text-xs font-tm-mono tracking-wider mb-6">
        <ArrowLeft size={14} /> BACK TO ALL ARENAS
      </Link>

      {/* Hero card */}
      <div className="tm-card p-5 md:p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-tm-accent/3 via-transparent to-transparent pointer-events-none" />

        <div className="relative grid items-start gap-8 lg:grid-cols-[1fr_minmax(300px,0.7fr)]">
          <div>
            {/* Category badge */}
            <span className="inline-flex items-center gap-2 rounded-md border border-tm-border bg-tm-surface px-3 py-1.5 text-[10px] font-tm-mono font-bold tracking-[.2em] text-tm-accent">
              <Zap size={11} />
              {(event.category || "EVENT").toUpperCase()}
            </span>

            {/* Title */}
            <h1 className="mt-5 font-tm-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-[-0.04em] leading-[1.05]">
              {event.title}
            </h1>

            {/* Summary */}
            {description && (
              <p className="mt-4 text-tm-muted text-sm md:text-base leading-7 line-clamp-3 max-w-3xl">
                {description.replace(/\s+/g, " ").slice(0, 300)}
              </p>
            )}

            {/* Info cards */}
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="tm-card px-4 py-3">
                <Calendar className="text-tm-accent" size={15} />
                <p className="tm-label mt-2 text-[9px]">DATE</p>
                <p className="mt-1 text-sm font-semibold">{dateText(event.startAt)}</p>
              </div>
              <div className="tm-card px-4 py-3">
                <Clock className="text-tm-accent" size={15} />
                <p className="tm-label mt-2 text-[9px]">TIME</p>
                <p className="mt-1 text-sm font-semibold">{timeText(event.startAt)}</p>
              </div>
              <div className="tm-card px-4 py-3">
                <Users className="text-tm-accent" size={15} />
                <p className="tm-label mt-2 text-[9px]">MODE</p>
                <p className="mt-1 text-sm font-semibold">{modeLabel}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content + Registration sidebar */}
      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_380px] lg:items-start">
        {/* Left: Description, Rules, FAQ */}
        <div className="space-y-5">
          {/* Description */}
          <div className="tm-card p-6 md:p-8">
            <span className="tm-label">BRIEF</span>
            <h2 className="font-tm-heading text-xl md:text-2xl font-bold mt-2 tracking-wide">About the Event</h2>
            <div className="mt-5 space-y-4 text-sm md:text-base leading-7 text-tm-muted max-h-[60vh] overflow-y-auto pr-2">
              {descBlocks.length > 0 ? (
                descBlocks.map((block) => {
                  const isTitle = /^(Event Flow|Phase\s+\d+|Venue:|Organized By:)/i.test(block);
                  return (
                    <p key={block} className={isTitle ? "font-semibold text-white/70" : "whitespace-pre-line"}>
                      {block}
                    </p>
                  );
                })
              ) : (
                <p>Details will appear once the organizers update this event.</p>
              )}
            </div>
          </div>

          {/* Schedule/Phases */}
          {event.rounds && event.rounds.length > 0 && (
            <div className="tm-card p-6 md:p-8">
              <span className="tm-label">TIMELINE</span>
              <h2 className="font-tm-heading text-xl font-bold mt-2 tracking-wide">Event Rounds</h2>
              <div className="mt-5 space-y-0 relative">
                <div className="absolute left-[7px] top-2 bottom-2 w-px bg-tm-border" />
                {event.rounds.map((round: string, i: number) => (
                  <div key={i} className="relative pl-8 pb-5">
                    <div className="absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full border-2 border-tm-accent bg-tm-bg" />
                    <p className="font-tm-mono text-xs text-tm-accent">Round {i + 1}</p>
                    <p className="text-sm font-semibold mt-1">{round}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Registration sidebar */}
        <aside className="tm-card p-5 md:p-6 lg:sticky lg:top-24 lg:self-start">
          <h3 className="font-tm-heading text-lg font-bold tracking-wide">Registration</h3>

          <div className="mt-4 space-y-2">
            <p className="flex items-center gap-3 rounded-lg border border-tm-border bg-tm-bg px-4 py-3 text-sm text-tm-muted">
              <MapPin size={15} className="text-tm-accent shrink-0" />
              Venue TBA
            </p>
            <p className="flex items-center gap-3 rounded-lg border border-tm-border bg-tm-bg px-4 py-3 text-sm text-tm-muted">
              <Users size={15} className="text-tm-accent shrink-0" />
              {event.registeredCount || 0} / {event.capacity || "unlimited"} registered
            </p>
          </div>

          <p className="mt-4 rounded-lg border border-tm-border bg-tm-bg px-4 py-3 text-xs text-tm-dim font-tm-mono">
            MODE: {modeLabel.toUpperCase()}
            {event.teamSize?.max > 1 ? ` · MAX TEAM: ${event.teamSize.max}` : ""}
          </p>

          {isRegistrationOpen ? (
            <TechnomaniaRegisterForm
              eventId={event.id}
              participationMode={event.teamSize?.max > 1 ? "team" : "individual"}
              maxTeamSize={event.teamSize?.max}
            />
          ) : (
            <p className="mt-5 rounded-lg border border-tm-border bg-tm-bg p-4 text-center text-xs text-tm-dim font-tm-mono">
              REGISTRATION CLOSED
            </p>
          )}
        </aside>
      </div>


    </section>
  );
}
