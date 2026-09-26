"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { X, Search, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function CheckStatusModal({ eventId, requireReapproval }: { eventId: string, requireReapproval?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [uid, setUid] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ status: string, teamName?: string, requiresReapproval: boolean, hasReapproved: boolean } | null>(null);

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !uid) {
      setError("Email and UID are required.");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`/api/events/${eventId}/check-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "check", email, uid })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to check status.");
      
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/check-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "confirm", email, uid })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to confirm attendance.");
      
      setResult(prev => prev ? { ...prev, hasReapproved: true } : null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const modalContent = isOpen ? (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#090314] shadow-[0_0_50px_rgba(139,92,246,0.15)]"
      >
        <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.02] px-6 py-4">
          <h3 className="font-bold text-white tracking-wide">Check Registration Status</h3>
          <button aria-label="Close modal" onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white transition"><X size={20}/></button>
        </div>

        <div className="p-6">
          {!result ? (
            <form onSubmit={handleCheck} className="space-y-4">
              <p className="text-sm text-white/60 mb-6">Enter the Email and University UID you used during registration (as a leader or teammate) to check your status.</p>
              
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Email Address</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-purple-500/50 focus:bg-white/10"
                  placeholder="john.doe@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">University UID</label>
                <input 
                  type="text" 
                  value={uid} 
                  onChange={e => setUid(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-purple-500/50 focus:bg-white/10 uppercase"
                  placeholder="e.g. 21BCS10293"
                  required
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-lg bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full mt-2 rounded-xl bg-purple-600 hover:bg-purple-500 py-3.5 text-sm font-bold tracking-wide text-white transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                Find Registration
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 mb-3">
                  <CheckCircle size={24} className="text-emerald-400" />
                </div>
                <h4 className="text-lg font-bold text-white mb-1">Registration Found</h4>
                {result.teamName && <p className="text-sm font-medium text-purple-300 mb-4">Team: {result.teamName}</p>}
                
                <div className="flex flex-col gap-2 items-center justify-center">
                  <span className="text-xs text-white/50 uppercase tracking-widest">Current Status</span>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    result.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 
                    result.status === 'waitlisted' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 
                    'bg-red-500/20 text-red-300 border border-red-500/30'
                  }`}>
                    {result.status}
                  </span>
                </div>
              </div>

              {result.requiresReapproval && (
                <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-5 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.15),transparent_70%)]" />
                  
                  {result.hasReapproved ? (
                    <div className="relative">
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 mb-2">
                        <CheckCircle size={20} className="text-emerald-400" />
                      </div>
                      <p className="text-sm font-bold text-emerald-300">Attendance Confirmed!</p>
                      <p className="text-xs text-emerald-400/70 mt-1">Thank you. Your team is securely marked as attending.</p>
                    </div>
                  ) : (
                    <div className="relative">
                      <h4 className="font-bold text-white mb-2">Action Required</h4>
                      <p className="text-xs text-white/70 mb-4">The organizers require all {result.status} teams to re-confirm their attendance. Click below to verify you are still coming.</p>
                      
                      {error && <p className="text-xs text-red-400 mb-3">{error}</p>}
                      
                      <button 
                        onClick={handleConfirm}
                        disabled={loading}
                        className="w-full rounded-lg bg-white hover:bg-gray-100 text-black py-3 text-sm font-bold tracking-wide transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                      >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                        Confirm Attendance
                      </button>
                    </div>
                  )}
                </div>
              )}

              <button 
                onClick={() => { setResult(null); setEmail(""); setUid(""); }}
                className="w-full rounded-xl border border-white/10 bg-transparent py-3 text-sm font-bold tracking-wide text-white/60 hover:bg-white/5 hover:text-white transition"
              >
                Check Another
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
        onClick={() => setIsOpen(true)}
        className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 py-3.5 text-[11px] font-bold uppercase tracking-widest text-white transition active:scale-[0.98]"
      >
        {requireReapproval ? (
          <span className="flex items-center justify-center gap-1.5 text-purple-300">
            <AlertCircle size={14} /> Action Required: Check Status
          </span>
        ) : (
          "Already Registered? Check Status"
        )}
      </button>

      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>{modalContent}</AnimatePresence>,
        document.body
      )}
    </>
  );
}
