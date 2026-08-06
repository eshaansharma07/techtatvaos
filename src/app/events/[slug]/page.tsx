import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Calendar, Check, Clock, MapPin, Sparkles, Trophy, Users } from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { getPublicEvent } from "@/lib/public-data";
import { RegisterForm } from "@/components/register-form";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary-client";

export const revalidate = 60;

const dateText = (value?: string) =>
  value ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value)) : "Date TBA";

const timeText = (value?: string) =>
  value ? new Intl.DateTimeFormat("en-IN", { timeStyle: "short" }).format(new Date(value)) : "Time TBA";

const normalizeDescription = (value?: string) =>
  (value || "")
    .replace(/\r\n/g, "\n")
    .replace(/\s+(?=(?:Event Flow|Phase\s+\d+|Venue:|Organized By:))/gi, "\n\n")
    .trim();

const eventSummary = (value: string, limit = 300) => {
  const compact = value.replace(/\s+/g, " ").trim();
  if (!compact) return "Details will appear once an admin updates this event.";
  if (compact.length <= limit) return compact;
  const clipped = compact.slice(0, limit);
  const sentenceEnd = Math.max(clipped.lastIndexOf("."), clipped.lastIndexOf("!"), clipped.lastIndexOf("?"));
  const wordEnd = clipped.lastIndexOf(" ");
  const end = sentenceEnd > limit * 0.55 ? sentenceEnd + 1 : wordEnd;
  return `${clipped.slice(0, end > 0 ? end : limit).trim()}...`;
};

const eventDescriptionBlocks = (value: string) =>
  value
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

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
  const description = normalizeDescription(event.description);
  const summary = eventSummary(description);
  const descriptionBlocks = eventDescriptionBlocks(description);

  return (
    <PublicShell>
      <section className="mx-auto max-w-7xl xl:max-w-[1380px] 2xl:max-w-[1536px] px-5 pb-36 pt-32 md:px-6 md:pb-40 md:pt-44 spatial-grid-bg">
        <Link href="/events" className="brutalist-btn-dark inline-flex min-h-11 items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-[.18em] text-white transition">
          <ArrowLeft size={14} /> BACK TO EVENTS
        </Link>

        <div className="glass-brutalist relative mt-5 overflow-hidden rounded-[2.2rem] p-5 md:mt-8 md:rounded-[2.8rem] md:p-9 relative z-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(168,85,247,0.05),transparent_45%)] pointer-events-none" />
          <div className="relative grid items-start gap-8 lg:grid-cols-[minmax(0,.92fr)_minmax(340px,.78fr)]">
            <div className="max-w-4xl">
              {event.certEventLogo ? (
                <div className="mb-5 inline-flex items-center justify-center rounded-2xl bg-black/40 border border-white/10 p-3 h-14 w-14 backdrop-blur-md">
                  <Image width={1200} height={1200} src={optimizeCloudinaryUrl(event.certEventLogo, 120)} alt="" className="h-full w-full object-contain" />
                </div>
              ) : null}
              <span className="inline-flex items-center gap-2 rounded-xl border-2 border-black bg-purple-500 px-3 py-1 md:px-4 md:py-1.5 text-[9px] md:text-[10px] font-bold tracking-[.24em] text-black shadow-[2px_2px_0px_0px_rgba(255,255,255,0.8)]">
                <Sparkles size={12} />
                {(event.category || "EVENT").toUpperCase()}
              </span>
              <h1 className="mt-5 max-w-4xl text-[2.5rem] font-extrabold leading-[1.05] tracking-[-.05em] text-white md:mt-7 md:text-6xl lg:text-7xl xl:text-8xl">{event.title}</h1>
              <p className="mt-4 line-clamp-4 max-w-3xl text-[13px] leading-relaxed text-white/62 md:mt-6 md:text-lg md:leading-8">{summary}</p>
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
            <div className="mt-5 max-h-[58vh] space-y-5 overflow-y-auto pr-2 text-sm leading-7 text-white/54 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/15 md:text-base md:leading-8">
              {descriptionBlocks.length ? (
                descriptionBlocks.map((block) => {
                  const isSectionTitle = /^(Event Flow|Phase\s+\d+|Venue:|Organized By:)/i.test(block);
                  return (
                    <p
                      className={isSectionTitle ? "font-semibold text-white/70" : "whitespace-pre-line"}
                      key={block}
                    >
                      {block}
                    </p>
                  );
                })
              ) : (
                <p>Details will appear once an admin updates this event.</p>
              )}
            </div>

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

        {/* Leaderboard Section */}
        {event.leaderboardVisible && event.leaderboard && event.leaderboard.length > 0 && (
          <div className="glass-brutalist relative mt-6 overflow-hidden rounded-[2.2rem] p-6 md:mt-8 md:p-9 relative z-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(168,85,247,0.06),transparent_50%)] pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <Trophy size={18} className="text-purple-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[.24em] text-purple-400">Rankings</p>
                  <h2 className="text-2xl font-extrabold tracking-[-.045em] text-white">Leaderboard</h2>
                </div>
              </div>

              {/* Podium Top 3 */}
              {event.leaderboard.length >= 3 && (
                <div className="mb-8 grid grid-cols-3 gap-3 max-w-2xl mx-auto">
                  {/* 2nd Place */}
                  <div className="flex flex-col items-center justify-end">
                    <div className="mt-4 w-full rounded-2xl border border-gray-400/20 bg-gradient-to-b from-gray-400/10 to-transparent p-4 text-center">
                      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-gray-400/20 border-2 border-gray-400/40 text-gray-300 font-black text-lg">2</div>
                      <p className="text-sm font-bold text-white/90 truncate">{event.leaderboard[1].teamName}</p>
                      <p className="mt-1 text-lg font-black text-gray-300">{event.leaderboard[1].totalScore}<span className="text-[10px] text-white/30 ml-0.5">pts</span></p>
                    </div>
                  </div>
                  {/* 1st Place */}
                  <div className="flex flex-col items-center justify-end">
                    <div className="w-full rounded-2xl border-2 border-yellow-500/30 bg-gradient-to-b from-yellow-500/15 to-transparent p-5 text-center shadow-[0_0_40px_rgba(234,179,8,0.08)]">
                      <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/20 border-2 border-yellow-500/40 text-yellow-300 font-black text-xl">1</div>
                      <p className="text-base font-bold text-white truncate">{event.leaderboard[0].teamName}</p>
                      <p className="mt-1 text-2xl font-black text-yellow-300">{event.leaderboard[0].totalScore}<span className="text-[10px] text-white/30 ml-0.5">pts</span></p>
                    </div>
                  </div>
                  {/* 3rd Place */}
                  <div className="flex flex-col items-center justify-end">
                    <div className="mt-6 w-full rounded-2xl border border-amber-700/20 bg-gradient-to-b from-amber-700/10 to-transparent p-4 text-center">
                      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-amber-700/20 border-2 border-amber-700/40 text-amber-400 font-black text-lg">3</div>
                      <p className="text-sm font-bold text-white/90 truncate">{event.leaderboard[2].teamName}</p>
                      <p className="mt-1 text-lg font-black text-amber-400">{event.leaderboard[2].totalScore}<span className="text-[10px] text-white/30 ml-0.5">pts</span></p>
                    </div>
                  </div>
                </div>
              )}

              {/* Full Table */}
              <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/30">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="py-3 px-4 text-[10px] font-mono text-white/40 uppercase tracking-wider">Rank</th>
                      <th className="py-3 px-4 text-[10px] font-mono text-white/40 uppercase tracking-wider">Team</th>
                      <th className="py-3 px-4 text-[10px] font-mono text-white/40 uppercase tracking-wider">Score Breakdown</th>
                      <th className="py-3 px-4 text-[10px] font-mono text-white/40 uppercase tracking-wider text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {event.leaderboard.map((entry: any, i: number) => (
                      <tr key={entry.id || i} className={`border-b border-white/5 ${i < 3 ? "bg-gradient-to-r from-purple-500/[.04] to-transparent" : ""}`}>
                        <td className="py-3 px-4">
                          <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black ${
                            i === 0 ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30" :
                            i === 1 ? "bg-gray-400/20 text-gray-300 border border-gray-400/30" :
                            i === 2 ? "bg-amber-700/20 text-amber-400 border border-amber-700/30" :
                            "bg-white/5 text-white/40 border border-white/10"
                          }`}>
                            {entry.rank || i + 1}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm font-semibold text-white/90">{entry.teamName}</td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {(entry.scores || []).map((s: any, si: number) => (
                              <span key={si} className="rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] text-white/50">
                                {s.category}: {(s.baseScore || 0) + (s.timeBonus || 0) - (s.hintPenalty || 0)}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-sm font-black text-purple-300">{entry.totalScore || 0}</span>
                          <span className="text-[10px] text-white/30 ml-1">pts</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </section>
    </PublicShell>
  );
}
