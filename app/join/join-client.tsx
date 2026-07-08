"use client";

import { FormEvent, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2, Sparkles, UserPlus, ShieldAlert, Users, Compass, BookOpen, Award, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { DEPARTMENTS, INTERESTS, YEARS, GENDERS } from "@/lib/validations/student-member";

type StatusData = {
  status: string;
  registrationEnabled: boolean;
  announcementBanner?: string;
  openingDate?: string;
  closingDate?: string;
  whatsappGroupLink?: string;
};

const personalFields = [
  { name: "fullName", label: "Full Name", type: "text", placeholder: "John Doe", required: true },
  { name: "uid", label: "University UID", type: "text", placeholder: "22BCS1001", required: true },
  { name: "email", label: "Email Address", type: "email", placeholder: "john.doe@student.chd.edu.in", required: true },
  { name: "phone", label: "Phone Number", type: "tel", placeholder: "9876543210", required: true },
  { name: "section", label: "Section (Optional)", type: "text", placeholder: "CSE-1", required: false }
];

export function JoinClient({ initialStatus }: { initialStatus: StatusData }) {
  const searchParams = useSearchParams();
  const source = searchParams.get("source") || "online";

  const [form, setForm] = useState<Record<string, any>>({
    fullName: "",
    uid: "",
    email: "",
    phone: "",
    section: "",
    department: "",
    year: "",
    gender: "",
    interests: [] as string[]
  });

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [whatsappLink, setWhatsappLink] = useState("");

  const isOpen = initialStatus.registrationEnabled && ["open", "closing_soon"].includes(initialStatus.status);

  useEffect(() => {
    if (initialStatus.whatsappGroupLink) {
      setWhatsappLink(initialStatus.whatsappGroupLink);
    }
  }, [initialStatus]);

  function update(name: string, value: any) {
    setForm((state) => ({ ...state, [name]: value }));
  }

  function toggleInterest(interest: string) {
    setForm((state) => {
      const interests = [...state.interests];
      const index = interests.indexOf(interest);
      if (index > -1) {
        interests.splice(index, 1);
      } else {
        interests.push(interest);
      }
      return { ...state, interests };
    });
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.fullName || !form.uid || !form.email || !form.phone || !form.department || !form.year || !form.gender) {
      setError("Please fill in all required fields.");
      return;
    }

    if (form.interests.length === 0) {
      setError("Please select at least one interest.");
      return;
    }

    setBusy(true);

    try {
      const response = await fetch("/api/membership/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          source
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Something went wrong.");
      }

      setSuccess(result.message || "Registration Successful!");
      setForm({
        fullName: "",
        uid: "",
        email: "",
        phone: "",
        section: "",
        department: "",
        year: "",
        gender: "",
        interests: []
      });
    } catch (err: any) {
      setError(err.message || "Could not register. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative w-full">
      {initialStatus.announcementBanner && isOpen && (
        <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-center py-2.5 px-4 text-xs font-semibold tracking-wide">
          <span className="inline-flex items-center gap-1.5">
            <Sparkles size={14} className="animate-pulse" />
            {initialStatus.announcementBanner}
          </span>
        </div>
      )}

      <div className="relative min-h-[90vh] py-16 px-5 flex flex-col items-center justify-center">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(139,92,246,0.15),transparent_45%),radial-gradient(circle_at_80%_60%,rgba(232,121,166,0.06),transparent_35%)] pointer-events-none" />
        <div className="absolute inset-0 grid-bg opacity-[0.06] pointer-events-none" />

        <div className="max-w-4xl w-full">
          <Reveal>
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/5 px-4 py-1.5 text-xs font-medium text-violet-200">
                <UserPlus size={14} />
                <span>Tech Tatva Membership</span>
              </span>
              <h1 className="mt-6 text-4xl sm:text-6xl font-bold tracking-tight text-white leading-tight">
                Enter the <span className="gradient-text">Club.</span>
              </h1>
              <p className="mt-4 text-sm sm:text-base text-white/50 max-w-xl mx-auto leading-relaxed">
                Connect with like-minded students, get priority access to club events, build projects, and collaborate with technical and creative teams.
              </p>

              {source === "qr" && (
                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Offline Membership Drive Sign-up</span>
                </div>
              )}
            </div>
          </Reveal>

          {!isOpen && (
            <Reveal delay={0.1}>
              <div className="premium-card rounded-[2rem] p-8 sm:p-12 text-center max-w-xl mx-auto border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl">
                <ShieldAlert size={48} className="mx-auto text-violet-300 animate-pulse" />
                <h2 className="mt-6 text-2xl font-semibold text-white">Drive is Currently Inactive</h2>
                <p className="mt-4 text-sm leading-relaxed text-white/50">
                  The official Tech Tatva membership drive is currently closed. If you believe this is in error, contact the administrators or watch out for announcement banners on our channels.
                </p>
                {initialStatus.openingDate && (
                  <p className="mt-4 text-xs font-medium text-violet-200">
                    Expected to go live: {new Date(initialStatus.openingDate).toLocaleDateString("en-IN", { dateStyle: "long" })}
                  </p>
                )}
                <div className="mt-8">
                  <Link href="/" className="ghost-pill inline-flex rounded-full px-6 py-2.5 text-xs font-semibold">
                    Return Home
                  </Link>
                </div>
              </div>
            </Reveal>
          )}

          {isOpen && (
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-start">
              {/* Form Side */}
              <Reveal delay={0.1}>
                <div className="premium-card rounded-[2rem] p-6 sm:p-8 border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl">
                  <AnimatePresence mode="wait">
                    {success ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="text-center py-12"
                      >
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 mb-6">
                          <CheckCircle2 size={36} />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Registration Successful!</h2>
                        <p className="mt-4 text-sm text-white/60 leading-relaxed max-w-md mx-auto">
                          {success}
                        </p>

                        {whatsappLink && (
                          <div className="mt-8 p-6 rounded-2xl border border-violet-500/20 bg-violet-500/5 max-w-md mx-auto">
                            <p className="text-xs font-medium text-violet-200 uppercase tracking-widest">Next Step</p>
                            <h3 className="mt-2 text-base font-semibold text-white">Join the Club Hub</h3>
                            <p className="mt-2 text-xs text-white/50 leading-relaxed">
                              Join our official student WhatsApp group to stay updated with event announcements, project opportunities, and peer networking.
                            </p>
                            <a
                              href={whatsappLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="action-pill mt-4 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-black"
                            >
                              Join WhatsApp Group <ArrowUpRight size={14} />
                            </a>
                          </div>
                        )}

                        <div className="mt-8">
                          <button
                            onClick={() => setSuccess("")}
                            className="ghost-pill rounded-full px-6 py-2.5 text-xs font-semibold text-violet-100"
                          >
                            Register another member
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      <form onSubmit={submit} className="space-y-6">
                        <h2 className="text-xl font-bold text-white border-b border-white/[0.06] pb-4">Membership Application</h2>

                        {error && (
                          <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 p-4 text-xs font-medium text-rose-300">
                            {error}
                          </div>
                        )}

                        {/* Personal fields */}
                        <div className="grid gap-5 sm:grid-cols-2">
                          {personalFields.map((field) => (
                            <div key={field.name} className={field.name === "fullName" || field.name === "email" ? "sm:col-span-2" : ""}>
                              <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-2">
                                {field.label} {field.required && <span className="text-rose-400">*</span>}
                              </label>
                              <input
                                type={field.type}
                                placeholder={field.placeholder}
                                value={form[field.name]}
                                onChange={(e) => update(field.name, e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/[0.08] focus:border-violet-500/50 rounded-2xl p-4 text-white text-sm outline-none transition"
                                required={field.required}
                                disabled={busy}
                              />
                            </div>
                          ))}

                          {/* Academic Details */}
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-2">
                              Department <span className="text-rose-400">*</span>
                            </label>
                            <select
                              value={form.department}
                              onChange={(e) => update("department", e.target.value)}
                              className="w-full bg-white/[0.03] border border-white/[0.08] focus:border-violet-500/50 rounded-2xl p-4 text-white text-sm outline-none transition appearance-none"
                              required
                              disabled={busy}
                            >
                              <option value="" disabled className="bg-ink text-white/50">Select Department</option>
                              {DEPARTMENTS.map((dept) => (
                                <option key={dept} value={dept} className="bg-ink text-white">
                                  {dept}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-2">
                              Academic Year <span className="text-rose-400">*</span>
                            </label>
                            <select
                              value={form.year}
                              onChange={(e) => update("year", e.target.value)}
                              className="w-full bg-white/[0.03] border border-white/[0.08] focus:border-violet-500/50 rounded-2xl p-4 text-white text-sm outline-none transition appearance-none"
                              required
                              disabled={busy}
                            >
                              <option value="" disabled className="bg-ink text-white/50">Select Year</option>
                              {YEARS.map((y) => (
                                <option key={y} value={y} className="bg-ink text-white">
                                  {y} Year
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-2">
                              Gender <span className="text-rose-400">*</span>
                            </label>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                              {GENDERS.map((g) => (
                                <button
                                  type="button"
                                  key={g}
                                  onClick={() => update("gender", g)}
                                  className={`border rounded-2xl py-3 px-4 text-xs font-semibold uppercase tracking-wider transition ${
                                    form.gender === g
                                      ? "border-violet-500/50 bg-violet-500/10 text-white"
                                      : "border-white/[0.08] bg-white/[0.01] text-white/40 hover:text-white"
                                  }`}
                                  disabled={busy}
                                >
                                  {g === "prefer_not_to_say" ? "Prefer Not to Say" : g}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Interests Checklist */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-2">
                            Your Technical & Creative Interests <span className="text-rose-400">*</span>
                            <span className="text-[10px] lowercase block mt-1 font-normal text-white/40">(select at least one)</span>
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-3">
                            {INTERESTS.map((interest) => {
                              const selected = form.interests.includes(interest);
                              return (
                                <button
                                  type="button"
                                  key={interest}
                                  onClick={() => toggleInterest(interest)}
                                  className={`rounded-2xl border p-3.5 text-left text-xs font-semibold transition ${
                                    selected
                                      ? "border-violet-500/40 bg-violet-500/5 text-white"
                                      : "border-white/[0.06] bg-white/[0.02] text-white/45 hover:border-white/10 hover:text-white"
                                  }`}
                                  disabled={busy}
                                >
                                  {interest}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="border-t border-white/[0.06] pt-6 flex justify-end">
                          <button
                            type="submit"
                            className="action-pill min-h-[3.25rem] px-8 rounded-full flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider text-black w-full sm:w-auto"
                            disabled={busy}
                          >
                            {busy ? (
                              <>
                                <Loader2 size={16} className="animate-spin" />
                                Processing...
                              </>
                            ) : (
                              "Submit Registration"
                            )}
                          </button>
                        </div>
                      </form>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>

              {/* Benefits Side */}
              <Reveal delay={0.2}>
                <div className="space-y-6 lg:pl-6">
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider">Why join Tech Tatva?</h3>
                  <div className="space-y-4">
                    <div className="premium-card rounded-2xl p-5 border border-white/[0.06] bg-white/[0.01] flex gap-4 items-start">
                      <div className="h-10 w-10 shrink-0 rounded-xl bg-violet-400/10 flex items-center justify-center text-violet-300">
                        <Users size={18} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white text-sm">Strong Peer Network</h4>
                        <p className="mt-1 text-xs text-white/40 leading-relaxed">
                          Work with the best developers, designers, and managers inside the university. Engage in hackathons and group builds.
                        </p>
                      </div>
                    </div>

                    <div className="premium-card rounded-2xl p-5 border border-white/[0.06] bg-white/[0.01] flex gap-4 items-start">
                      <div className="h-10 w-10 shrink-0 rounded-xl bg-violet-400/10 flex items-center justify-center text-violet-300">
                        <Compass size={18} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white text-sm">Industry Exposure</h4>
                        <p className="mt-1 text-xs text-white/40 leading-relaxed">
                          Get updates about speaker sessions, tech workshops, coding events, bootcamps, and industrial visits.
                        </p>
                      </div>
                    </div>

                    <div className="premium-card rounded-2xl p-5 border border-white/[0.06] bg-white/[0.01] flex gap-4 items-start">
                      <div className="h-10 w-10 shrink-0 rounded-xl bg-violet-400/10 flex items-center justify-center text-violet-300">
                        <BookOpen size={18} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white text-sm">Skill Building</h4>
                        <p className="mt-1 text-xs text-white/40 leading-relaxed">
                          Access learning tracks, study groups, resources, and mentorship from seniors across multiple disciplines.
                        </p>
                      </div>
                    </div>

                    <div className="premium-card rounded-2xl p-5 border border-white/[0.06] bg-white/[0.01] flex gap-4 items-start">
                      <div className="h-10 w-10 shrink-0 rounded-xl bg-violet-400/10 flex items-center justify-center text-violet-300">
                        <Award size={18} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white text-sm">Priority Certification</h4>
                        <p className="mt-1 text-xs text-white/40 leading-relaxed">
                          Be the first to know when registrations for public hackathons, workshops, and competitive events go live.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
