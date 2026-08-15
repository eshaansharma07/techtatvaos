import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, Check, Clock, MapPin, Trophy, Users, Zap } from "lucide-react";
import { getTechnomaniaEvent } from "@/lib/technomania-data";
import { TechnomaniaRegisterForm } from "@/components/technomania/technomania-register-form";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary-client";

export const revalidate = 60;

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
        <Link href="/events" className="inline-flex items-center gap-2 text-tm-dim hover:text-white transition text-xs font-tm-mono tracking-wider">
          <ArrowLeft size={14} /> BACK TO EVENTS
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

  const modeLabel =
    event.participationMode === "both" ? "Individual or Team" :
    event.participationMode === "team" ? "Team Based" : "Individual";

  const description = event.description || "";
  const descBlocks = eventDescriptionBlocks(description);

  return (
    <section className="mx-auto max-w-7xl px-5 pb-20 pt-28 md:px-6 md:pb-28 md:pt-36">
      {/* Back link */}
      <Link href="/events" className="inline-flex items-center gap-2 text-tm-dim hover:text-white transition text-xs font-tm-mono tracking-wider mb-6">
        <ArrowLeft size={14} /> BACK TO EVENTS
      </Link>

      {/* Hero card */}
      <div className="tm-card p-5 md:p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-tm-accent/3 via-transparent to-transparent pointer-events-none" />

        <div className="relative grid items-start gap-8 lg:grid-cols-[1fr_minmax(300px,0.7fr)]">
          <div>
            {/* Event logo */}
            {event.certEventLogo && (
              <div className="mb-4 inline-flex items-center justify-center rounded-lg border border-tm-border bg-black/40 p-2.5 h-12 w-12">
                <Image width={400} height={400} src={optimizeCloudinaryUrl(event.certEventLogo, 120)} alt="" className="h-full w-full object-contain" />
              </div>
            )}

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

          {/* Banner */}
          {event.banner && (
            <div className="tm-card p-3">
              <div className="grid min-h-[220px] place-items-center overflow-hidden rounded-lg bg-black/40 p-4 md:min-h-[360px]">
                <Image
                  width={1200}
                  height={1200}
                  src={optimizeCloudinaryUrl(event.banner, 900)}
                  alt=""
                  className="max-h-[300px] max-w-full object-contain md:max-h-[420px]"
                />
              </div>
            </div>
          )}
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
          {event.schedule && event.schedule.length > 0 && (
            <div className="tm-card p-6 md:p-8">
              <span className="tm-label">TIMELINE</span>
              <h2 className="font-tm-heading text-xl font-bold mt-2 tracking-wide">Event Schedule</h2>
              <div className="mt-5 space-y-0 relative">
                <div className="absolute left-[7px] top-2 bottom-2 w-px bg-tm-border" />
                {event.schedule.map((item: { title: string; at: string }, i: number) => (
                  <div key={i} className="relative pl-8 pb-5">
                    <div className="absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full border-2 border-tm-accent bg-tm-bg" />
                    <p className="font-tm-mono text-xs text-tm-accent">{item.at ? timeText(item.at) : `Phase ${i + 1}`}</p>
                    <p className="text-sm font-semibold mt-1">{item.title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rules */}
          {event.rules && event.rules.length > 0 && (
            <div className="tm-card p-6 md:p-8">
              <span className="tm-label">GUIDELINES</span>
              <h2 className="font-tm-heading text-xl font-bold mt-2 tracking-wide">Rules</h2>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {event.rules.map((rule: string) => (
                  <p key={rule} className="flex items-start gap-3 rounded-lg border border-tm-border bg-tm-bg px-4 py-3 text-sm text-tm-muted">
                    <Check size={14} className="text-tm-accent mt-0.5 shrink-0" />
                    {rule}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* FAQ */}
          {event.faqs && event.faqs.length > 0 && (
            <div className="tm-card p-6 md:p-8">
              <span className="tm-label">FAQ</span>
              <h2 className="font-tm-heading text-xl font-bold mt-2 tracking-wide">Questions</h2>
              <div className="mt-5 space-y-3">
                {event.faqs.map((faq: { question: string; answer: string }) => (
                  <div key={faq.question} className="border border-tm-border rounded-lg p-4 bg-tm-bg">
                    <p className="text-sm font-semibold">{faq.question}</p>
                    <p className="mt-2 text-xs text-tm-dim leading-5">{faq.answer}</p>
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
              {event.venue || "Venue TBA"}
            </p>
            <p className="flex items-center gap-3 rounded-lg border border-tm-border bg-tm-bg px-4 py-3 text-sm text-tm-muted">
              <Users size={15} className="text-tm-accent shrink-0" />
              {event.registrations} / {event.capacity || "unlimited"} registered
            </p>
          </div>

          <p className="mt-4 rounded-lg border border-tm-border bg-tm-bg px-4 py-3 text-xs text-tm-dim font-tm-mono">
            MODE: {modeLabel.toUpperCase()}
            {event.participationMode !== "individual" ? ` · MAX TEAM: ${event.maxTeamSize}` : ""}
          </p>

          {event.registrationOpen ? (
            <TechnomaniaRegisterForm
              eventId={event.id}
              participationMode={event.participationMode}
              maxTeamSize={event.maxTeamSize}
            />
          ) : (
            <p className="mt-5 rounded-lg border border-tm-border bg-tm-bg p-4 text-center text-xs text-tm-dim font-tm-mono">
              REGISTRATION CLOSED
            </p>
          )}
        </aside>
      </div>

      {/* Leaderboard */}
      {event.leaderboardVisible && event.leaderboard && event.leaderboard.length > 0 && (
        <div className="tm-card mt-6 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Trophy size={18} className="text-tm-accent" />
            <div>
              <span className="tm-label">RANKINGS</span>
              <h2 className="font-tm-heading text-xl font-bold tracking-wide">Leaderboard</h2>
            </div>
          </div>

          {/* Podium */}
          {event.leaderboard.length >= 3 && (
            <div className="mb-8 grid grid-cols-3 gap-3 max-w-2xl mx-auto">
              {/* 2nd */}
              <div className="flex flex-col items-center justify-end">
                <div className="mt-4 w-full tm-card border-tm-muted/30 p-4 text-center">
                  <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full border-2 border-tm-muted/50 text-tm-muted font-tm-heading font-black text-lg">2</div>
                  <p className="text-sm font-bold truncate">{event.leaderboard[1].teamName}</p>
                  <p className="mt-1 text-lg font-tm-heading font-black text-tm-muted">{event.leaderboard[1].totalScore}<span className="text-[10px] text-tm-dim ml-0.5">pts</span></p>
                </div>
              </div>
              {/* 1st */}
              <div className="flex flex-col items-center justify-end">
                <div className="w-full tm-card border-tm-accent/30 p-5 text-center shadow-[0_0_30px_rgba(74,158,255,0.08)]">
                  <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full border-2 border-tm-accent/50 text-tm-accent font-tm-heading font-black text-xl">1</div>
                  <p className="text-base font-bold truncate">{event.leaderboard[0].teamName}</p>
                  <p className="mt-1 text-2xl font-tm-heading font-black text-tm-accent">{event.leaderboard[0].totalScore}<span className="text-[10px] text-tm-dim ml-0.5">pts</span></p>
                </div>
              </div>
              {/* 3rd */}
              <div className="flex flex-col items-center justify-end">
                <div className="mt-6 w-full tm-card border-orange-700/20 p-4 text-center">
                  <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full border-2 border-orange-700/40 text-orange-400 font-tm-heading font-black text-lg">3</div>
                  <p className="text-sm font-bold truncate">{event.leaderboard[2].teamName}</p>
                  <p className="mt-1 text-lg font-tm-heading font-black text-orange-400">{event.leaderboard[2].totalScore}<span className="text-[10px] text-tm-dim ml-0.5">pts</span></p>
                </div>
              </div>
            </div>
          )}

          {/* Full table */}
          <div className="overflow-x-auto rounded-lg border border-tm-border">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-tm-border">
                  <th className="py-3 px-4 tm-label text-[9px]">RANK</th>
                  <th className="py-3 px-4 tm-label text-[9px]">TEAM</th>
                  <th className="py-3 px-4 tm-label text-[9px]">SCORES</th>
                  <th className="py-3 px-4 tm-label text-[9px] text-right">TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {event.leaderboard.map((entry: any, i: number) => (
                  <tr key={entry.id || i} className={`border-b border-tm-border/50 ${i < 3 ? "bg-tm-accent/[.03]" : ""}`}>
                    <td className="py-3 px-4">
                      <span className={`inline-flex h-7 w-7 items-center justify-center rounded-md text-xs font-tm-heading font-black ${
                        i === 0 ? "bg-tm-accent/20 text-tm-accent border border-tm-accent/30" :
                        i === 1 ? "bg-tm-muted/20 text-tm-muted border border-tm-muted/30" :
                        i === 2 ? "bg-orange-700/20 text-orange-400 border border-orange-700/30" :
                        "bg-tm-surface text-tm-dim border border-tm-border"
                      }`}>
                        {entry.rank || i + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold">{entry.teamName}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {(entry.scores || []).map((s: any, si: number) => (
                          <span key={si} className="rounded-md bg-tm-surface border border-tm-border px-2 py-0.5 text-[10px] font-tm-mono text-tm-dim">
                            {s.category}: {(s.baseScore || 0) + (s.timeBonus || 0) - (s.hintPenalty || 0)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-sm font-tm-heading font-black text-tm-accent">{entry.totalScore || 0}</span>
                      <span className="text-[10px] text-tm-dim ml-1">pts</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
