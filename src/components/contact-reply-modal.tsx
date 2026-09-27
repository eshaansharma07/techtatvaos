"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  Mail,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
  CornerDownRight,
  ShieldCheck
} from "lucide-react";

interface ContactReplyModalProps {
  message: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedRecord: any, message: string) => void;
}

export function ContactReplyModal({
  message,
  isOpen,
  onClose,
  onSuccess
}: ContactReplyModalProps) {
  const [replyText, setReplyText] = useState("");
  const [subject, setSubject] = useState(
    message ? `Re: ${message.subject || "Tech Tatva Inquiry"}` : ""
  );
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !message) return null;

  async function handleSendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyText.trim() || replyText.trim().length < 5) {
      setError("Please write a response of at least 5 characters.");
      return;
    }

    setSending(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/contacts/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId: message._id || message.id,
          replyMessage: replyText.trim(),
          subject: subject.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send email reply.");
      }

      onSuccess(data.record, data.message || "Reply emailed to user and message resolved.");
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to send email reply.");
    } finally {
      setSending(false);
    }
  }

  const existingReplies = Array.isArray(message.replies)
    ? message.replies
    : message.replyMessage
    ? [
        {
          message: message.replyMessage,
          sentAt: message.repliedAt,
          sentBy: message.repliedBy
        }
      ]
    : [];

  const modalContent = (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[#0f0921] shadow-[0_0_60px_rgba(147,51,234,0.3)] flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.02] px-6 py-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Mail size={15} />
            </span>
            <div>
              <h3 className="font-bold text-white text-sm tracking-wide">Reply to Contact Message</h3>
              <p className="text-[10px] text-purple-300/80 font-mono tracking-wider">
                Direct Email Dispatch to Candidate
              </p>
            </div>
          </div>
          <button
            aria-label="Close modal"
            onClick={onClose}
            className="rounded-xl border border-white/10 p-1.5 text-white/50 hover:bg-white/5 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Sender & Question Summary Box */}
          <div className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2.5 text-xs">
              <div className="flex items-center gap-2">
                <User size={14} className="text-purple-400" />
                <span className="font-bold text-white">{message.name || "Anonymous Student"}</span>
                {message.registrationNumber && (
                  <span className="font-mono text-[10px] text-white/40 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                    UID: {message.registrationNumber}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-white/60 font-mono text-[11px]">
                <Mail size={12} className="text-purple-400/70" />
                <span>{message.email}</span>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[11px] font-bold text-purple-300 uppercase tracking-wider">
                Subject: {message.subject || "No Subject"}
              </p>
              <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3 text-xs text-white/70 leading-relaxed font-sans whitespace-pre-wrap">
                {message.message}
              </div>
            </div>
          </div>

          {/* Previous Replies (if any) */}
          {existingReplies.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-white/40 font-mono flex items-center gap-1.5">
                <CornerDownRight size={12} /> Previous Responses Sent ({existingReplies.length})
              </p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {existingReplies.map((r: any, idx: number) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-3 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px] text-emerald-400/80">
                      <span className="font-bold">Sent by: {r.sentBy || "Admin"}</span>
                      <span className="font-mono">
                        {r.sentAt ? new Date(r.sentAt).toLocaleString("en-IN") : "Earlier"}
                      </span>
                    </div>
                    <p className="text-white/80 leading-relaxed whitespace-pre-wrap">{r.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reply Form */}
          <form onSubmit={handleSendReply} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">
                Email Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-white/30 outline-none focus:border-purple-500"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider">
                  Type Official Reply
                </label>
                <span className="text-[10px] text-purple-300 font-mono flex items-center gap-1">
                  <ShieldCheck size={11} /> Sent via Resend to {message.email}
                </span>
              </div>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your response here. It will be professionally styled in a Tech Tatva email and sent to the student automatically..."
                rows={5}
                className="w-full rounded-2xl border border-white/15 bg-white/5 p-4 text-xs text-white placeholder-white/30 outline-none focus:border-purple-500 font-sans leading-relaxed"
                required
                autoFocus
              />
            </div>

            {error && (
              <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-white/10 bg-transparent px-4 py-2.5 text-xs font-bold text-white/50 hover:bg-white/5 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sending || !replyText.trim()}
                className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition active:scale-[0.98] disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-purple-600/30"
              >
                {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                <span>Send Email Reply & Resolve</span>
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(modalContent, document.body) : null;
}
