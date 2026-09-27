"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Users,
  Mail,
  Phone,
  Sparkles,
  Loader2,
  Calendar,
  MapPin,
  Send,
  ArrowRight
} from "lucide-react";

interface TeamAvailabilityModalProps {
  eventId: string;
  eventTitle: string;
  eventDate?: string;
  venue?: string;
  postponed?: boolean;
  postponementNotice?: string;
}

export function TeamAvailabilityModal({
  eventId,
  eventTitle,
  eventDate,
  venue,
  postponed,
  postponementNotice
}: TeamAvailabilityModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [leaderUid, setLeaderUid] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Registration data from lookup
  const [regData, setRegData] = useState<any | null>(null);
  
  // Selection state
  const [selectedStatus, setSelectedStatus] = useState<"available" | "not_available" | "tentative">("available");
  const [note, setNote] = useState("");
  const [submittedSuccess, setSubmittedSuccess] = useState<any | null>(null);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    if (!leaderUid.trim()) {
      setError("Please enter your Leader University UID.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/events/${eventId}/availability`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "lookup", leaderUid: leaderUid.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to find registration.");
      }
      setRegData(data.registration);
      // Pre-select existing status if set
      if (data.registration.availabilityStatus && data.registration.availabilityStatus !== "pending") {
        setSelectedStatus(data.registration.availabilityStatus);
      }
      if (data.registration.availabilityNote) {
        setNote(data.registration.availabilityNote);
      }
    } catch (err: any) {
      setError(err.message || "Failed to lookup registration.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitAvailability() {
    if (!regData?.id) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/events/${eventId}/availability`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit",
          registrationId: regData.id,
          leaderUid: leaderUid.trim(),
          availabilityStatus: selectedStatus,
          note: note.trim()
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update availability.");
      }
      setSubmittedSuccess(data);
    } catch (err: any) {
      setError(err.message || "Failed to submit availability.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setRegData(null);
    setSubmittedSuccess(null);
    setError(null);
    setLeaderUid("");
    setNote("");
    setSelectedStatus("available");
  }

  const modalContent = isOpen ? (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/75 backdrop-blur-md"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-[#0d071b] shadow-[0_0_60px_rgba(147,51,234,0.25)] flex flex-col max-h-[90vh]"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.02] px-6 py-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Calendar size={14} />
            </span>
            <div>
              <h3 className="font-bold text-white text-sm tracking-wide">Event Availability Confirmation</h3>
              <p className="text-[10px] text-purple-300/80 font-mono tracking-wider uppercase">{eventTitle}</p>
            </div>
          </div>
          <button
            aria-label="Close modal"
            onClick={() => setIsOpen(false)}
            className="rounded-xl border border-white/10 p-1.5 text-white/50 hover:bg-white/5 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Postponement Notice Callout */}
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.07] p-4 text-xs">
            <div className="flex items-start gap-2.5">
              <AlertCircle size={16} className="text-amber-400 mt-0.5 shrink-0" />
              <div className="space-y-1 text-amber-200/90 leading-relaxed">
                <p className="font-bold uppercase tracking-wider text-amber-300 text-[11px]">
                  Rescheduled Event Confirmation
                </p>
                <p>
                  {postponementNotice ||
                    "This event has been rescheduled. To ensure optimal bracket allocation and scheduling, the organizing committee requires all registered squads to confirm their availability."}
                </p>
                {(eventDate || venue) && (
                  <div className="pt-2 flex flex-wrap gap-3 font-mono text-[11px] text-white/80">
                    {eventDate && (
                      <span className="inline-flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-lg border border-white/10">
                        <Clock size={12} className="text-purple-400" /> {eventDate}
                      </span>
                    )}
                    {venue && (
                      <span className="inline-flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-lg border border-white/10">
                        <MapPin size={12} className="text-pink-400" /> {venue}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* STEP 1: Enter Leader UID */}
          {!regData && !submittedSuccess && (
            <form onSubmit={handleLookup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[.18em] text-purple-300/80 mb-2">
                  Leader University UID
                </label>
                <p className="text-xs text-white/50 mb-3">
                  Enter the University UID of your squad leader (or registration candidate) to load your team.
                </p>
                <div className="relative">
                  <input
                    type="text"
                    value={leaderUid}
                    onChange={(e) => setLeaderUid(e.target.value)}
                    placeholder="e.g. 24BAI70387"
                    className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3.5 text-sm font-mono text-white placeholder-white/25 outline-none transition focus:border-purple-500 focus:bg-white/10 uppercase"
                    autoFocus
                    required
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 bg-white/5 px-2 py-1 rounded-lg border border-white/10">
                      LEADER UID
                    </span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300">
                  <AlertCircle size={15} className="mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !leaderUid.trim()}
                className="w-full rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-3.5 text-xs font-bold uppercase tracking-widest text-white transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                <span>Find My Squad Registration</span>
              </button>
            </form>
          )}

          {/* STEP 2: Squad Found & Confirm Availability */}
          {regData && !submittedSuccess && (
            <div className="space-y-5">
              {/* Squad Details Card */}
              <div className="rounded-2xl border border-purple-500/30 bg-purple-500/[0.04] p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-purple-300/80">
                      REGISTERED SQUAD
                    </span>
                    <h4 className="text-lg font-black text-white">{regData.teamName}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-purple-500/20 border border-purple-500/40 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-purple-300">
                      {regData.mode === "team" ? `${regData.totalMembers} Members` : "Solo Candidate"}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        regData.status === "confirmed"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      }`}
                    >
                      {regData.status}
                    </span>
                  </div>
                </div>

                {/* Leader & Roster Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-white/5 text-xs">
                  <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3 space-y-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-purple-300">👑 Squad Leader</span>
                    <p className="font-bold text-white truncate">{regData.leader.name}</p>
                    <p className="text-white/50 font-mono text-[11px] truncate">UID: {regData.leader.uid}</p>
                    <p className="text-white/40 truncate text-[11px]">{regData.leader.email}</p>
                  </div>

                  {regData.members?.length > 0 ? (
                    <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3 space-y-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-white/50">
                        Teammates ({regData.members.length})
                      </span>
                      <div className="space-y-0.5 text-[11px] text-white/70 max-h-16 overflow-y-auto">
                        {regData.members.map((m: any, i: number) => (
                          <p key={i} className="truncate">
                            • {m.name} ({m.uid})
                          </p>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3 flex items-center justify-center text-white/40 text-xs italic">
                      Individual Slot
                    </div>
                  )}
                </div>
              </div>

              {/* Status Selection Buttons */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold uppercase tracking-[.18em] text-white/70">
                  Select Your Availability Status
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option 1: Available */}
                  <button
                    type="button"
                    onClick={() => setSelectedStatus("available")}
                    className={`flex items-start gap-3 rounded-2xl p-4 text-left border transition ${
                      selectedStatus === "available"
                        ? "bg-emerald-500/15 border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                        : "bg-white/[0.02] border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        selectedStatus === "available"
                          ? "border-emerald-400 bg-emerald-500 text-black"
                          : "border-white/30"
                      }`}
                    >
                      {selectedStatus === "available" && <CheckCircle2 size={13} className="text-black" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">We Are Coming!</p>
                      <p className="text-[11px] text-white/50 leading-relaxed mt-0.5">
                        Squad is available and will attend on the rescheduled date.
                      </p>
                    </div>
                  </button>

                  {/* Option 2: Not Available */}
                  <button
                    type="button"
                    onClick={() => setSelectedStatus("not_available")}
                    className={`flex items-start gap-3 rounded-2xl p-4 text-left border transition ${
                      selectedStatus === "not_available"
                        ? "bg-rose-500/15 border-rose-500/60 shadow-[0_0_20px_rgba(244,63,94,0.2)]"
                        : "bg-white/[0.02] border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        selectedStatus === "not_available"
                          ? "border-rose-400 bg-rose-500 text-white"
                          : "border-white/30"
                      }`}
                    >
                      {selectedStatus === "not_available" && <XCircle size={13} className="text-white" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Cannot Attend</p>
                      <p className="text-[11px] text-white/50 leading-relaxed mt-0.5">
                        Withdraw squad slot so waitlisted teams can take part.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Optional Notes */}
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">
                  Remarks / Notes (Optional)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. All 4 members confirmed, ready for round 1."
                  rows={2}
                  maxLength={300}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-white/30 outline-none focus:border-purple-500"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300">
                  <AlertCircle size={15} className="mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-xl border border-white/10 bg-transparent px-4 py-3 text-xs font-bold text-white/50 hover:bg-white/5 hover:text-white transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmitAvailability}
                  disabled={submitting}
                  className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-3 text-xs font-bold uppercase tracking-widest text-white transition active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25"
                >
                  {submitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                  <span>Submit Status & Send Confirmation Mail</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Submission Success State */}
          {submittedSuccess && (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.06] p-6 text-center space-y-4">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <CheckCircle2 size={30} />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-white">Availability Recorded!</h4>
                <p className="text-xs text-emerald-300/90 font-medium">
                  Status updated to: <span className="font-bold uppercase tracking-wider">{selectedStatus.replace("_", " ")}</span>
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/40 p-4 text-xs text-white/70 space-y-1.5 font-sans">
                <p className="flex items-center justify-center gap-1.5 text-purple-300 font-semibold">
                  <Mail size={14} /> {submittedSuccess?.emailSent ? "Confirmation Email Dispatched" : "Availability Recorded"}
                </p>
                <p className="text-[11px] text-white/50">
                  {submittedSuccess?.emailSent ? (
                    <>A receipt has been sent to <span className="text-white font-mono">{regData?.leader?.email || "your registered email"}</span>.</>
                  ) : (
                    <>Your squad status has been saved in the system. {submittedSuccess?.emailReason === "missing_api_key" ? "(Email service pending setup)" : ""}</>
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  handleReset();
                }}
                className="w-full rounded-xl bg-white text-black hover:bg-gray-100 py-3 text-xs font-bold uppercase tracking-widest transition"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
          handleReset();
        }}
        className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/20 via-purple-600/20 to-amber-500/20 px-5 py-4 text-xs font-bold uppercase tracking-[.18em] text-amber-200 hover:text-white hover:border-amber-400 hover:shadow-[0_0_30px_rgba(245,158,11,0.25)] transition active:scale-[0.98]"
      >
        <Calendar size={15} className="text-amber-400" />
        <span>Postponed: Confirm Team Availability</span>
        <ArrowRight size={14} className="text-amber-400" />
      </button>

      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>{modalContent}</AnimatePresence>,
        document.body
      )}
    </>
  );
}
