"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { 
  ArrowRight, 
  ArrowLeft,
  ArrowUpRight, 
  Users, 
  Check, 
  X, 
  User, 
  Mail, 
  FileText, 
  Layers, 
  AlertCircle, 
  Sparkles, 
  QrCode
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Mode = "individual" | "team" | "both";

interface RegisterFormProps {
  eventId: string;
  participationMode?: Mode;
  maxTeamSize?: number;
}

export function RegisterForm({ eventId, participationMode = "individual", maxTeamSize = 1 }: RegisterFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"individual" | "team">(participationMode === "team" ? "team" : "individual");
  const [teamName, setTeamName] = useState("");
  const [teamSize, setTeamSize] = useState(Math.max(2, Math.min(maxTeamSize, 2)));

  // Team Leader or Individual details
  const [leader, setLeader] = useState({
    name: "",
    email: "",
    uid: "",
    program: "",
    semester: ""
  });

  // Team members details
  const [members, setMembers] = useState<Array<{ name: string; email: string; uid: string; program: string; semester: string }>>(() =>
    Array.from({ length: Math.max(1, maxTeamSize - 1) }).map(() => ({
      name: "",
      email: "",
      uid: "",
      program: "",
      semester: ""
    }))
  );

  // Track active member tab (0 = Member 2, 1 = Member 3, etc.)
  const [activeTab, setActiveTab] = useState(0);

  const canChoose = participationMode === "both";

  // Prevent scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.classList.add("force-native-cursor");
    } else {
      document.body.style.overflow = "unset";
      document.body.classList.remove("force-native-cursor");
    }
    return () => {
      document.body.style.overflow = "unset";
      document.body.classList.remove("force-native-cursor");
    };
  }, [isOpen]);

  // Form field specifications
  const fields = [
    { name: "name", label: "Full Name", type: "text", icon: User },
    { name: "email", label: "University Email", type: "email", icon: Mail },
    { name: "uid", label: "University UID", type: "text", icon: FileText },
    { name: "program", label: "Degree Program", type: "text", icon: Layers },
    { name: "semester", label: "Current Semester", type: "number", icon: Sparkles }
  ] as const;

  // Validation functions
  const isEmailValid = (email: string) => email.includes("@") && email.length >= 5;
  const isNameValid = (name: string) => name.trim().length >= 2;
  const isUidValid = (uid: string) => uid.trim().length >= 2;
  const isProgramValid = (prog: string) => prog.trim().length >= 1;
  const isSemesterValid = (sem: string) => {
    const s = Number(sem);
    return Number.isFinite(s) && s > 0 && s <= 12;
  };

  const isLeaderValid = useMemo(() => {
    return (
      isNameValid(leader.name) &&
      isEmailValid(leader.email) &&
      isUidValid(leader.uid) &&
      isProgramValid(leader.program) &&
      isSemesterValid(leader.semester)
    );
  }, [leader]);

  const isMemberValid = (index: number) => {
    const member = members[index];
    if (!member) return false;
    return (
      isNameValid(member.name) &&
      isEmailValid(member.email) &&
      isUidValid(member.uid) &&
      isProgramValid(member.program) &&
      isSemesterValid(member.semester)
    );
  };

  const allMembersValid = useMemo(() => {
    if (mode === "individual") return true;
    const requiredMemberCount = teamSize - 1;
    for (let i = 0; i < requiredMemberCount; i++) {
      if (!isMemberValid(i)) return false;
    }
    return true;
  }, [mode, teamSize, members]);

  const isStep1Valid = useMemo(() => {
    if (mode === "individual") return true;
    return teamName.trim().length >= 2;
  }, [mode, teamName]);

  const isFormValid = useMemo(() => {
    return isStep1Valid && isLeaderValid && allMembersValid;
  }, [isStep1Valid, isLeaderValid, allMembersValid]);

  const activeMemberCount = teamSize - 1;

  async function submitRegistration(e: React.FormEvent) {
    e.preventDefault();
    if (!isFormValid) {
      setStatus("Please fill in all candidate/member details correctly before compiling.");
      return;
    }

    setLoading(true);
    setStatus("");

    const body: Record<string, any> = {
      name: leader.name,
      email: leader.email,
      uid: leader.uid,
      program: leader.program,
      semester: Number(leader.semester),
      mode,
    };

    if (mode === "team") {
      body.teamName = teamName;
      body.members = members.slice(0, activeMemberCount).map(m => ({
        name: m.name,
        email: m.email,
        uid: m.uid,
        program: m.program,
        semester: Number(m.semester)
      }));
    }

    try {
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok) {
        setStep(5);
        setStatus(data.status || "confirmed");
      } else {
        setStatus(data.error || "Registration failed. Please check the inputs.");
      }
    } catch {
      setStatus("Network connection timed out. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (field: keyof typeof leader, value: string) => {
    setLeader(prev => ({ ...prev, [field]: value }));
  };

  const handleMemberChange = (index: number, field: string, value: string) => {
    setMembers(prev => {
      const copy = [...prev];
      if (copy[index]) {
        copy[index] = { ...copy[index], [field]: value };
      }
      return copy;
    });
  };

  const stepsList = [
    { num: 1, label: "Mode Selection" },
    { num: 2, label: mode === "team" ? "Leader Details" : "Your Details" },
    ...(mode === "team" ? [{ num: 3, label: "Team Members" }] : []),
    { num: mode === "team" ? 4 : 3, label: "Review & Compile" }
  ];

  const totalSteps = stepsList.length;

  return (
    <div className="w-full">
      {/* Sidebar Call-to-Action */}
      <button 
        type="button" 
        onClick={() => {
          setIsOpen(true);
          setStep(1);
          setStatus("");
        }}
        className="brutalist-btn-purple w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-xs tracking-wider font-extrabold uppercase mt-6"
      >
        <span>Start Registration</span>
        <ArrowRight size={14} />
      </button>

      {/* Fullscreen Overlay Wizard — portalled to document.body to escape backdrop-filter stacking */}
      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {isOpen && (
            <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/95 backdrop-blur-xl flex items-center justify-center p-3 md:p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-2xl max-h-[90vh] bg-graphite/90 border border-white/10 rounded-[2rem] p-5 md:p-9 shadow-[0_0_80px_rgba(168,85,247,0.06)] relative overflow-y-auto flex flex-col"
            >
              {/* Top corners design brackets */}
              <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-purple-500/30 pointer-events-none" />
              <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-purple-500/30 pointer-events-none" />
              <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-purple-500/30 pointer-events-none" />
              <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-purple-500/30 pointer-events-none" />

              {/* Modal Header */}
              {step < 5 && (
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                  <div>
                    <span className="text-[9px] font-mono tracking-[0.25em] text-purple-400 uppercase font-black">REGISTRATION DESK</span>
                    <h2 className="text-md font-bold text-white mt-0.5">Secure Candidate Onboarding</h2>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setIsOpen(false)}
                    className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:border-white/20 transition active:scale-95"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* Progress Tracker */}
              {step < 5 && (
                <div className="mb-8 bg-black/40 rounded-2xl border border-white/5 p-4 flex items-center justify-between gap-3 overflow-x-auto scrollbar-none select-none">
                  {stepsList.map((s, i) => {
                    const isActive = step === s.num;
                    const isCompleted = step > s.num;
                    return (
                      <div key={s.num} className="flex items-center gap-2 shrink-0">
                        <div className={`h-6 w-6 rounded-lg text-[10px] font-mono font-bold flex items-center justify-center transition ${
                          isActive 
                            ? "bg-purple-500 text-black border border-black shadow-[1px_1px_0px_rgba(255,255,255,0.4)]" 
                            : isCompleted 
                              ? "bg-purple-500/10 border border-purple-500/30 text-purple-400" 
                              : "border border-white/10 text-white/30 bg-white/5"
                        }`}>
                          {isCompleted ? <Check size={11} /> : s.num}
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${
                          isActive ? "text-purple-400" : isCompleted ? "text-white/60" : "text-white/25"
                        }`}>{s.label}</span>
                        {i < totalSteps - 1 && <span className="text-white/10 select-none font-mono text-[9px]">&rarr;</span>}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Steps Layout Content */}
              <div className="flex-grow flex flex-col justify-center">
                {/* STEP 1: MODE & SIZE */}
                {step === 1 && (
                  <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    <div>
                      <h3 className="text-xl font-extrabold tracking-tight text-white">Select Registration Mode</h3>
                      <p className="text-xs text-white/50 mt-1 leading-relaxed">Choose whether you are participating individually or forming a cooperative team squad.</p>
                    </div>

                    {canChoose ? (
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setMode("individual")}
                          className={`glass-brutalist flex flex-col items-center text-center p-6 rounded-2xl border transition-all duration-300 ${
                            mode === "individual" 
                              ? "border-purple-500 bg-purple-500/5 shadow-[0_0_20px_rgba(168,85,247,0.06)]" 
                              : "border-white/10 hover:border-white/25 hover:bg-white/5"
                          }`}
                        >
                          <div className={`h-11 w-11 rounded-xl flex items-center justify-center mb-4 transition ${mode === "individual" ? "bg-purple-500 text-black" : "bg-white/5 text-white/60"}`}>
                            <User size={18} />
                          </div>
                          <span className="text-sm font-bold text-white uppercase tracking-wider">Individual</span>
                          <span className="text-[10px] text-white/40 mt-1 leading-relaxed">Register only yourself for this event.</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setMode("team")}
                          className={`glass-brutalist flex flex-col items-center text-center p-6 rounded-2xl border transition-all duration-300 ${
                            mode === "team" 
                              ? "border-purple-500 bg-purple-500/5 shadow-[0_0_20px_rgba(168,85,247,0.06)]" 
                              : "border-white/10 hover:border-white/25 hover:bg-white/5"
                          }`}
                        >
                          <div className={`h-11 w-11 rounded-xl flex items-center justify-center mb-4 transition ${mode === "team" ? "bg-purple-500 text-black" : "bg-white/5 text-white/60"}`}>
                            <Users size={18} />
                          </div>
                          <span className="text-sm font-bold text-white uppercase tracking-wider">Team Squad</span>
                          <span className="text-[10px] text-white/40 mt-1 leading-relaxed">Form a squad with multi-member support.</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-4 rounded-xl border border-purple-500/20 bg-purple-500/5 text-purple-400">
                        <Users size={16} />
                        <span className="text-xs font-semibold uppercase tracking-wider">LOCKED MODE: {participationMode.toUpperCase()} ONLY</span>
                      </div>
                    )}

                    {mode === "team" && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-4 border-t border-white/5">
                        <label className="block text-[10px] font-black tracking-widest text-white/40 uppercase">
                          TEAM NAME
                          <input 
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            required
                            className="mt-2 w-full rounded-xl border border-white/10 bg-black/45 px-3.5 py-3.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-purple-500/50 transition-all font-mono"
                          />
                        </label>

                        {maxTeamSize > 2 && (
                          <div className="pt-2">
                            <div className="flex items-center justify-between text-[10px] font-black tracking-widest text-white/40 uppercase">
                              <span>TEAM SQUAD SIZE</span>
                              <span className="text-purple-400 font-mono">{teamSize} MEMBERS</span>
                            </div>
                            <div className="mt-3 flex items-center gap-3">
                              <input 
                                type="range" 
                                min={2} 
                                max={maxTeamSize} 
                                value={teamSize}
                                onChange={(e) => {
                                  const size = Number(e.target.value);
                                  setTeamSize(size);
                                }}
                                className="flex-grow accent-[rgba(168, 85, 247, 1)] h-1.5 rounded-lg bg-black cursor-pointer"
                              />
                            </div>
                            <span className="text-[9px] text-white/25 mt-1 block">Includes team leader + {teamSize - 1} secondary members. Limit: {maxTeamSize}.</span>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* STEP 2: LEADER / CANDIDATE DETAILS */}
                {step === 2 && (
                  <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                    <div>
                      <h3 className="text-xl font-extrabold tracking-tight text-white">{mode === "team" ? "Leader Onboarding Details" : "Candidate Details"}</h3>
                      <p className="text-xs text-white/50 mt-1 leading-relaxed">Provide your authentic university academic credentials to compile your ticket.</p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {fields.map(({ name, label, type, icon: Icon }) => {
                        const val = leader[name];
                        let isValid = false;
                        if (name === "name") isValid = isNameValid(val);
                        else if (name === "email") isValid = isEmailValid(val);
                        else if (name === "uid") isValid = isUidValid(val);
                        else if (name === "program") isValid = isProgramValid(val);
                        else if (name === "semester") isValid = isSemesterValid(val);

                        return (
                          <div key={name} className={name === "name" || name === "email" ? "sm:col-span-2" : ""}>
                            <label className="block text-[9px] font-black tracking-widest text-white/40 uppercase mb-2">
                              {label}
                            </label>
                            <div className="relative">
                              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30">
                                <Icon size={14} />
                              </div>
                              <input 
                                type={type} 
                                value={val}
                                onChange={(e) => handleInputChange(name, e.target.value)}
                                required
                                className={`w-full rounded-xl border bg-black/45 pl-10 pr-9 py-3 text-xs text-white placeholder:text-white/20 outline-none transition-all ${
                                  val 
                                    ? isValid 
                                      ? "border-purple-500/30 focus:border-purple-500" 
                                      : "border-red-500/30 focus:border-red-500" 
                                    : "border-white/10 focus:border-purple-500/50"
                                }`}
                              />
                              {val && (
                                <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                                  {isValid ? (
                                    <Check size={13} className="text-purple-400" />
                                  ) : (
                                    <AlertCircle size={13} className="text-rose-400 animate-pulse" />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: TEAM MEMBERS */}
                {step === 3 && mode === "team" && (
                  <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                    <div>
                      <h3 className="text-xl font-extrabold tracking-tight text-white">Assemble Team Squad</h3>
                      <p className="text-xs text-white/50 mt-1 leading-relaxed">Provide details for your {activeMemberCount} squad members. Select tabs to fill them individually.</p>
                    </div>

                    {/* Member Horizontal Tabs */}
                    <div className="flex items-center gap-2 border-b border-white/5 pb-2 overflow-x-auto scrollbar-none">
                      <div className="inline-flex items-center gap-1 rounded-lg border border-purple-500/10 bg-purple-500/5 px-2.5 py-1 text-[9px] font-bold text-purple-400 select-none opacity-60">
                        <Check size={10} /> LEADER
                      </div>
                      {Array.from({ length: activeMemberCount }).map((_, idx) => {
                        const mIndex = idx;
                        const isSelected = activeTab === mIndex;
                        const isValid = isMemberValid(mIndex);
                        const hasContent = members[mIndex] && Object.values(members[mIndex]).some(v => v !== "");
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setActiveTab(mIndex)}
                            className={`rounded-lg px-3 py-1.5 text-[9px] font-mono font-bold tracking-wider uppercase transition flex items-center gap-1.5 shrink-0 ${
                              isSelected 
                                ? "bg-white/10 border border-white/20 text-white" 
                                : "bg-black/30 border border-white/5 text-white/40 hover:text-white/70"
                            }`}
                          >
                            <span>MEMBER {idx + 2}</span>
                            {hasContent ? (
                              isValid ? (
                                <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                              ) : (
                                <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                              )
                            ) : (
                              <span className="h-1.5 w-1.5 rounded-full bg-white/10" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Active Member Panel Inputs */}
                    <div className="glass-brutalist rounded-2xl p-4 md:p-6 border border-white/5 bg-black/20 space-y-4">
                      <div className="flex items-center justify-between text-[10px] font-mono font-bold text-white/40">
                        <span>CONFIGURING MEMBER {activeTab + 2} SQUADSLOT</span>
                        {isMemberValid(activeTab) && (
                          <span className="text-purple-400 flex items-center gap-1"><Check size={11} /> READY</span>
                        )}
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {fields.map(({ name, label, type, icon: Icon }) => {
                          const val = members[activeTab]?.[name] || "";
                          let isValid = false;
                          if (name === "name") isValid = isNameValid(val);
                          else if (name === "email") isValid = isEmailValid(val);
                          else if (name === "uid") isValid = isUidValid(val);
                          else if (name === "program") isValid = isProgramValid(val);
                          else if (name === "semester") isValid = isSemesterValid(val);

                          return (
                            <div key={name} className={name === "name" || name === "email" ? "sm:col-span-2" : ""}>
                              <label className="block text-[9px] font-black tracking-widest text-white/40 uppercase mb-2">
                                {label}
                              </label>
                              <div className="relative">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30">
                                  <Icon size={14} />
                                </div>
                                <input 
                                  type={type} 
                                  value={val}
                                  onChange={(e) => handleMemberChange(activeTab, name, e.target.value)}
                                  required
                                  className={`w-full rounded-xl border bg-black/45 pl-10 pr-9 py-3 text-xs text-white placeholder:text-white/20 outline-none transition-all ${
                                    val 
                                      ? isValid 
                                        ? "border-purple-500/30 focus:border-purple-500" 
                                        : "border-red-500/30 focus:border-red-500" 
                                      : "border-white/10 focus:border-purple-500/50"
                                  }`}
                                />
                                {val && (
                                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                                    {isValid ? (
                                      <Check size={13} className="text-purple-400" />
                                    ) : (
                                      <AlertCircle size={13} className="text-rose-400 animate-pulse" />
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 4: REVIEW DETAILS */}
                {((step === 3 && mode === "individual") || (step === 4 && mode === "team")) && (
                  <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                    <div>
                      <h3 className="text-xl font-extrabold tracking-tight text-white">Review Registration Details</h3>
                      <p className="text-xs text-white/50 mt-1 leading-relaxed">Verify that all registered candidate data matches university record sheets.</p>
                    </div>

                    <div className="glass-brutalist rounded-2xl p-4 md:p-6 border border-white/5 bg-black/20 space-y-4 max-h-[290px] overflow-y-auto scrollbar-thin">
                      {mode === "team" && (
                        <div className="border-b border-white/5 pb-3">
                          <p className="text-[9px] font-mono text-purple-400 uppercase tracking-widest font-black">TEAM ALIAS</p>
                          <p className="text-sm font-bold text-white mt-1 font-mono">{teamName}</p>
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <p className="text-[9px] font-mono text-purple-400 uppercase tracking-widest font-black">
                          {mode === "team" ? "TEAM LEADER" : "CANDIDATE"}
                        </p>
                        <div className="bg-black/35 rounded-xl p-3 text-xs space-y-1">
                          <p className="text-white font-semibold">{leader.name}</p>
                          <p className="text-white/40">{leader.email} · {leader.uid}</p>
                          <p className="text-white/40">{leader.program} · Semester {leader.semester}</p>
                        </div>
                      </div>

                      {mode === "team" && (
                        <div className="space-y-3 pt-3 border-t border-white/5">
                          <p className="text-[9px] font-mono text-purple-400 uppercase tracking-widest font-black">SQUAD MEMBERS</p>
                          {members.slice(0, activeMemberCount).map((member, i) => (
                            <div key={i} className="bg-black/35 rounded-xl p-3 text-xs space-y-1">
                              <p className="text-white font-semibold">Member {i + 2}: {member.name || "N/A"}</p>
                              <p className="text-white/40">{member.email || "N/A"} · {member.uid || "N/A"}</p>
                              <p className="text-white/40">{member.program || "N/A"} · Semester {member.semester || "N/A"}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {!isFormValid && (
                      <div className="flex items-center gap-2 p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-rose-300 text-xs">
                        <AlertCircle size={14} className="shrink-0" />
                        <span>Some details are invalid. Go back to fix incomplete fields.</span>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* STEP 5: SUCCESS STATE OVERLAY */}
                {step === 5 && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center text-center py-6 space-y-6"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-xl animate-pulse" />
                      <div className="h-16 w-16 rounded-full bg-purple-500/10 border-2 border-purple-500 flex items-center justify-center text-purple-400 relative z-10">
                        <Check size={32} className="animate-bounce" />
                      </div>
                    </div>

                    <div>
                      <span className="inline-flex rounded-full border border-purple-500/20 bg-purple-500/5 px-3 py-1 text-[9px] font-black tracking-widest text-purple-400 uppercase">
                        {status === "waitlisted" ? "WAITLISTED REGISTRATION" : "CONFIRMED REGISTRATION"}
                      </span>
                      <h3 className="text-2xl font-black text-white mt-3">Welcome to the Arena.</h3>
                      <p className="text-xs text-white/50 max-w-[420px] mx-auto mt-2 leading-relaxed">
                        {status === "waitlisted" 
                          ? "The event is currently at maximum capacity. You have been placed on the waitlist. We will notify you if slots open up."
                          : "Your tickets have been compiled. Candidate attendance records have been successfully initialized."
                        }
                      </p>
                    </div>

                    {/* Technical Mock Ticket Card */}
                    <div className="w-full max-w-[380px] rounded-2xl border border-white/10 bg-black/60 p-5 text-left relative overflow-hidden select-none">
                      <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-br from-[rgba(168, 85, 247, 1)]/10 to-transparent pointer-events-none" />
                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <div>
                          <p className="text-[7.5px] font-mono text-purple-400 uppercase tracking-widest font-black">MEMBER ALIAS</p>
                          <p className="text-sm font-black text-white mt-1 uppercase truncate max-w-[170px]">{leader.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[7.5px] font-mono text-white/30 uppercase tracking-widest">TICKET</p>
                          <p className="text-xs font-mono font-bold text-white/80 mt-1 uppercase">{status.toUpperCase()}</p>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-3 border-b border-white/5 pb-4">
                        <div>
                          <p className="text-[7px] font-mono text-white/30 uppercase tracking-widest">UNIVERSITY UID</p>
                          <p className="text-xs font-mono font-bold text-white/80 mt-0.5 truncate">{leader.uid}</p>
                        </div>
                        <div>
                          <p className="text-[7px] font-mono text-white/30 uppercase tracking-widest">SQUAD MODE</p>
                          <p className="text-xs font-mono font-bold text-white/80 mt-0.5 uppercase">{mode}</p>
                        </div>
                      </div>

                      {/* Decors Barcode */}
                      <div className="mt-4 flex items-center justify-between gap-6 pt-1">
                        <div className="flex-grow flex gap-0.5 h-7 items-center opacity-40">
                          {Array.from({ length: 28 }).map((_, i) => (
                            <div 
                              key={i} 
                              className="bg-white rounded-sm h-full"
                              style={{ width: `${Math.random() > 0.45 ? 2.5 : 1}px`, opacity: Math.random() > 0.1 ? 0.75 : 0.2 }}
                            />
                          ))}
                        </div>
                        <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                          <QrCode size={18} className="text-white/60" />
                        </div>
                      </div>
                    </div>

                    <button 
                      type="button" 
                      onClick={() => setIsOpen(false)}
                      className="brutalist-btn-purple w-full max-w-[200px] flex items-center justify-center gap-1.5 rounded-xl py-3 text-xs tracking-wider font-extrabold uppercase"
                    >
                      <span>Close Desk</span>
                    </button>
                  </motion.div>
                )}
              </div>

              {/* Modal Footer Controls */}
              {step < 5 && (
                <div className="flex items-center justify-between border-t border-white/5 pt-5 mt-6 gap-3">
                  <div>
                    {step > 1 && (
                      <button
                        type="button"
                        onClick={() => setStep(prev => prev - 1)}
                        className="brutalist-btn-dark flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-xs tracking-wider font-extrabold uppercase transition"
                      >
                        <ArrowLeft size={13} />
                        <span>Back</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Error display */}
                    {status && (
                      <div className="text-rose-400 text-[10px] font-semibold max-w-[220px] leading-relaxed truncate md:max-w-[280px]">
                        {status}
                      </div>
                    )}

                    {/* Continue / Submit triggers */}
                    {((step === 3 && mode === "individual") || (step === 4 && mode === "team")) ? (
                      <button
                        type="button"
                        disabled={loading || !isFormValid}
                        onClick={submitRegistration}
                        className="brutalist-btn-purple flex items-center justify-center gap-1.5 rounded-xl px-6 py-3 text-xs tracking-wider font-extrabold uppercase transition disabled:opacity-40"
                      >
                        {loading ? (
                          <span>Compiling...</span>
                        ) : (
                          <>
                            <span>Compile ticket</span>
                            <ArrowUpRight size={13} />
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={step === 1 ? !isStep1Valid : step === 2 ? !isLeaderValid : step === 3 ? !allMembersValid : false}
                        onClick={() => setStep(prev => prev + 1)}
                        className="brutalist-btn-purple flex items-center justify-center gap-1.5 rounded-xl px-6 py-3 text-xs tracking-wider font-extrabold uppercase transition disabled:opacity-40"
                      >
                        <span>Continue</span>
                        <ArrowRight size={13} />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body
      )}
    </div>
  );
}
