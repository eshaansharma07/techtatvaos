"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Users, Check, AlertCircle, ArrowRight, Loader2 } from "lucide-react";

type Mode = "individual" | "team" | "both";

interface RegisterFormProps {
  eventId: string;
  participationMode?: Mode;
  maxTeamSize?: number;
}

export function TechnomaniaRegisterForm({
  eventId,
  participationMode = "individual",
  maxTeamSize = 1,
}: RegisterFormProps) {
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<"individual" | "team">(
    participationMode === "team" ? "team" : "individual"
  );
  
  const [teamName, setTeamName] = useState("");
  const [leader, setLeader] = useState({
    name: "", email: "", phone: "", uid: "", program: "", semester: ""
  });
  
  // Track dynamic team members
  const [members, setMembers] = useState(
    Array.from({ length: Math.max(1, maxTeamSize - 1) }).map(() => ({
      name: "", email: "", phone: "", uid: "", program: "", semester: ""
    }))
  );
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const canChooseMode = participationMode === "both";
  const showModeSelection = canChooseMode && step === 1;

  const handleNext = () => {
    if (step === 1 && mode === "team" && !teamName.trim()) {
      setError("Team name is required");
      return;
    }
    setError("");
    setStep(s => s + 1);
  };

  const handleBack = () => {
    setError("");
    setStep(s => s - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    const body: any = {
      ...leader,
      semester: Number(leader.semester),
      mode,
    };

    if (mode === "team") {
      body.teamName = teamName;
      body.members = members.slice(0, maxTeamSize - 1).map(m => ({
        ...m,
        semester: Number(m.semester)
      }));
    }

    try {
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setStep(5);
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success || step === 5) {
    return (
      <div className="tm-card p-8 text-center space-y-4">
        <div className="mx-auto w-16 h-16 rounded-full border border-tm-accent flex items-center justify-center text-tm-accent mb-6">
          <Check size={32} />
        </div>
        <h3 className="font-tm-heading text-2xl font-bold text-tm-text uppercase">Registration Confirmed</h3>
        <p className="font-tm-mono text-sm text-tm-muted">Your participation sequence has been logged successfully.</p>
        <div className="mt-8 pt-6 border-t border-tm-border border-dashed">
          <div className="inline-block px-4 py-2 bg-tm-surface border border-tm-border font-tm-mono text-xs tracking-widest text-tm-dim">
            SYS.STATUS: OK
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tm-card p-6 md:p-8 bg-tm-surface/50 backdrop-blur">
      {/* Progress Indicator */}
      <div className="flex items-center gap-2 mb-8 overflow-hidden">
        {[1, 2, 3, 4].map(s => {
          // hide step 3 (members) if individual mode
          if (mode === "individual" && s === 3) return null;
          const isActive = step === s;
          const isPast = step > s;
          return (
            <div key={s} className="flex items-center gap-2">
              <div className={`text-[10px] font-tm-mono tracking-widest ${
                isActive ? "text-tm-accent font-bold" : 
                isPast ? "text-tm-text" : "text-tm-dim"
              }`}>
                {isActive ? `[□□□■] STEP 0${s}` : `[----] STEP 0${s}`}
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {/* STEP 1: Mode & Team Name */}
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="font-tm-heading text-xl font-bold text-tm-text uppercase">Mode Selection</h3>
              
              {canChooseMode && (
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setMode("individual")}
                    className={`p-4 border ${mode === "individual" ? "border-tm-accent bg-tm-accent/10" : "border-tm-border bg-tm-bg"} hover:border-tm-accent/50 transition-colors text-left flex flex-col gap-2`}
                  >
                    <User size={20} className={mode === "individual" ? "text-tm-accent" : "text-tm-muted"} />
                    <span className="font-tm-mono text-xs font-bold text-tm-text">INDIVIDUAL</span>
                  </button>
                  <button
                    onClick={() => setMode("team")}
                    className={`p-4 border ${mode === "team" ? "border-tm-accent bg-tm-accent/10" : "border-tm-border bg-tm-bg"} hover:border-tm-accent/50 transition-colors text-left flex flex-col gap-2`}
                  >
                    <Users size={20} className={mode === "team" ? "text-tm-accent" : "text-tm-muted"} />
                    <span className="font-tm-mono text-xs font-bold text-tm-text">TEAM SQUAD</span>
                  </button>
                </div>
              )}

              {mode === "team" && (
                <div className="space-y-2 mt-6">
                  <label className="text-[10px] font-tm-mono tracking-widest text-tm-muted uppercase">Team Alias</label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Enter Team Name"
                    className="tm-input w-full"
                  />
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Leader Details */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="font-tm-heading text-xl font-bold text-tm-text uppercase">
                {mode === "team" ? "Leader Coordinates" : "Participant Coordinates"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input placeholder="Full Name" className="tm-input" value={leader.name} onChange={e=>setLeader({...leader, name: e.target.value})} />
                <input placeholder="University Email" type="email" className="tm-input" value={leader.email} onChange={e=>setLeader({...leader, email: e.target.value})} />
                <input placeholder="WhatsApp Number" className="tm-input" value={leader.phone} onChange={e=>setLeader({...leader, phone: e.target.value})} />
                <input placeholder="University UID" className="tm-input" value={leader.uid} onChange={e=>setLeader({...leader, uid: e.target.value})} />
                <input placeholder="Program/Course" className="tm-input" value={leader.program} onChange={e=>setLeader({...leader, program: e.target.value})} />
                <input placeholder="Semester" type="number" className="tm-input" value={leader.semester} onChange={e=>setLeader({...leader, semester: e.target.value})} />
              </div>
            </div>
          )}

          {/* STEP 3: Team Members */}
          {step === 3 && mode === "team" && (
            <div className="space-y-6">
              <h3 className="font-tm-heading text-xl font-bold text-tm-text uppercase">Squad Members</h3>
              <div className="space-y-8">
                {members.slice(0, maxTeamSize - 1).map((m, i) => (
                  <div key={i} className="space-y-4 pt-4 border-t border-tm-border/50">
                    <span className="text-[10px] font-tm-mono tracking-widest text-tm-accent uppercase">Member 0{i+2}</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input placeholder="Full Name" className="tm-input" value={m.name} onChange={e=>{
                        const newM = [...members]; newM[i].name = e.target.value; setMembers(newM);
                      }} />
                      <input placeholder="University Email" className="tm-input" value={m.email} onChange={e=>{
                        const newM = [...members]; newM[i].email = e.target.value; setMembers(newM);
                      }} />
                      <input placeholder="Phone" className="tm-input" value={m.phone} onChange={e=>{
                        const newM = [...members]; newM[i].phone = e.target.value; setMembers(newM);
                      }} />
                      <input placeholder="UID" className="tm-input" value={m.uid} onChange={e=>{
                        const newM = [...members]; newM[i].uid = e.target.value; setMembers(newM);
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Review */}
          {step === 4 && (
            <div className="space-y-6">
              <h3 className="font-tm-heading text-xl font-bold text-tm-text uppercase">Review & Compile</h3>
              
              <div className="p-4 border border-tm-border bg-tm-bg text-sm font-tm-mono text-tm-muted space-y-4">
                {mode === "team" && (
                  <div>
                    <span className="text-tm-dim">TEAM ALIAS:</span> <span className="text-tm-text">{teamName}</span>
                  </div>
                )}
                <div>
                  <span className="text-tm-dim">LEADER:</span> <span className="text-tm-text">{leader.name} ({leader.uid})</span>
                </div>
                {mode === "team" && members.slice(0, maxTeamSize - 1).map((m, i) => (
                  <div key={i}>
                    <span className="text-tm-dim">MEMBER 0{i+2}:</span> <span className="text-tm-text">{m.name || "N/A"} ({m.uid || "N/A"})</span>
                  </div>
                ))}
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-xs font-tm-mono p-3 border border-red-900/50 bg-red-900/20">
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-tm-border">
        {step > 1 ? (
          <button onClick={handleBack} className="text-xs font-tm-mono tracking-widest text-tm-muted hover:text-tm-text uppercase">
            &lt; Back
          </button>
        ) : <div />}

        {step < 4 ? (
          <button onClick={handleNext} className="tm-btn-solid text-xs flex items-center gap-2">
            NEXT <ArrowRight size={14} />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={loading} className="tm-btn-solid text-xs flex items-center gap-2">
            {loading ? <Loader2 size={14} className="animate-spin" /> : "COMPILE"}
          </button>
        )}
      </div>
    </div>
  );
}
