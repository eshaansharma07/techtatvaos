"use client";

import { FormEvent, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Clock3, FileUp, Github, Linkedin, Link as LinkIcon, Loader2, Lock, Pencil, ShieldCheck, Sparkles, Users } from "lucide-react";
import Link from "next/link";
import { getRecruitmentTeamIcon } from "@/lib/recruitment-team-icons";

type Team = { id: string; name: string; slug: string; description?: string; icon?: string };
type Role = { id: string; team: string; name: string; slug: string; description?: string };
type Question = { id: string; team: string; role?: string; label: string; helpText?: string; type: string; options: string[]; required: boolean };
type RecruitmentData = {
  settings: { status: string; registrationEnabled: boolean; openingDate?: string; closingDate?: string; announcementBanner?: string; customSuccessMessage?: string };
  teams: Team[];
  roles: Role[];
  questions: Question[];
  totalApplications: number;
};
type FileAsset = { label: string; url: string; publicId?: string; resourceType?: string };

const closedCopy: Record<string, { title: string; body: string }> = {
  opening_soon: { title: "Opening soon.", body: "Recruitment has not opened yet. Return when applications go live to submit your application." },
  closed: { title: "Applications closed.", body: "This recruitment cycle has ended. Follow Tech Tatva for future opportunities." },
  full: { title: "Registration full.", body: "We have reached the maximum number of applications for this cycle." }
};

const personalFields = [
  ["fullName", "Full Name", "text"],
  ["uid", "University UID", "text"],
  ["course", "Course", "text"],
  ["branch", "Branch", "text"],
  ["year", "Year", "text"],
  ["email", "Email", "email"],
  ["phone", "Phone Number", "tel"],
  ["linkedin", "LinkedIn", "url"],
  ["github", "GitHub", "url"],
  ["portfolio", "Portfolio", "url"]
] as const;

const statusCopy: Record<string, string> = {
  open: "Applications Open",
  closing_soon: "Applications Closing Soon",
  opening_soon: "Opening Soon",
  closed: "Applications Closed",
  full: "Registration Full"
};

function empty(value: unknown) {
  return value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);
}

export function RecruitmentClient({ data }: { data: RecruitmentData }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Record<string, any>>({});
  const [team, setTeam] = useState("");
  const [role, setRole] = useState("");
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [files, setFiles] = useState<FileAsset[]>([]);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const selectedTeam = data.teams.find((item) => item.id === team);
  const selectedRole = data.roles.find((item) => item.id === role);
  const teamRoles = data.roles.filter((item) => item.team === team);
  const visibleQuestions = data.questions.filter((question) => question.team === team && (!question.role || question.role === role));
  const open = data.settings.registrationEnabled && ["open", "closing_soon"].includes(data.settings.status);
  const steps = ["Signal", "Identity", "Team", "Role", "Questions", "Review"];
  const progress = ((step + 1) / steps.length) * 100;

  if (!open && step < steps.length) {
    return <ClosedRecruitmentView data={data} />;
  }

  function update(name: string, value: any) {
    setForm((state) => ({ ...state, [name]: value }));
  }

  function canContinue() {
    if (step === 0) return open;
    if (step === 1) return personalFields.filter(([name]) => !["linkedin", "github", "portfolio"].includes(name)).every(([name]) => !empty(form[name]));
    if (step === 2) return Boolean(team);
    if (step === 3) return Boolean(role);
    if (step === 4) return visibleQuestions.every((question) => !question.required || !empty(answers[question.id]));
    return true;
  }

  function next() {
    setError("");
    if (!canContinue()) {
      setError("Complete the required fields before moving forward.");
      return;
    }
    setStep((value) => Math.min(value + 1, steps.length - 1));
  }

  async function uploadFile(label: string, file?: File) {
    if (!file) return;
    setUploading(label);
    setError("");
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/recruitment/upload", { method: "POST", body });
    const result = await res.json();
    setUploading("");
    if (!res.ok) {
      setError(result.error || "Upload failed.");
      return;
    }
    setFiles((state) => [...state.filter((asset) => asset.label !== label), { label, ...result }]);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!canContinue()) return;
    setBusy(true);
    setError("");
    const res = await fetch("/api/recruitment/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, team, role, answers, files })
    });
    const result = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(result.error || (res.status === 404 ? "Application service is unavailable. Please try again shortly." : "Application could not be submitted."));
      return;
    }
    setSuccess(result.message || "Application received.");
    setStep(steps.length);
  }

  return (
    <section className="relative mx-auto max-w-7xl px-5 pb-20 pt-32 md:px-6 md:pb-28 md:pt-44">
      <div className="absolute inset-x-0 top-24 h-80 bg-[radial-gradient(circle_at_50%_0%,rgba(253,186,116,.18),transparent_36%),radial-gradient(circle_at_70%_20%,rgba(232,121,166,.16),transparent_30%)]" aria-hidden />
      <div className="relative grid gap-8 lg:grid-cols-[.72fr_1fr] lg:items-start">
        <aside className="lg:sticky lg:top-28">
          <div className="aurora-shell rounded-[2rem] p-6 md:p-8">
            <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[.18em] ${open ? "bg-emerald-400/10 text-emerald-200" : "bg-white/[.07] text-white/50"}`}>
              {statusCopy[data.settings.status] || "Recruitment"}
            </span>
            <h1 className="mt-6 text-[3.8rem] font-semibold leading-[.88] tracking-[-.075em] md:text-7xl">Build what people remember.</h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-white/58">Choose one team, pick a role, and show us how you think. The application is short, focused, and designed around the work you want to do.</p>
            {data.settings.announcementBanner ? <p className="mt-5 rounded-2xl border border-amber-200/20 bg-amber-300/[.06] p-4 text-xs leading-6 text-amber-50/75">{data.settings.announcementBanner}</p> : null}
            <div className="mt-7 grid grid-cols-3 gap-3">
              {["Teams", "Roles", "Questions"].map((label, index) => <div className="rounded-2xl border border-white/[.07] bg-black/20 p-4" key={label}><p className="text-2xl font-semibold tracking-[-.04em]">{[data.teams.length, data.roles.length, data.questions.length][index]}</p><p className="mt-1 text-[10px] uppercase tracking-[.16em] text-white/35">{label}</p></div>)}
            </div>
          </div>
        </aside>

        <form onSubmit={submit} className="premium-card min-h-[680px] rounded-[2rem] p-4 md:p-6">
          <div className="rounded-[1.5rem] border border-white/[.07] bg-black/20 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">{steps.map((label, index) => <button type="button" onClick={() => index <= step ? setStep(index) : null} className={`rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.14em] ${index === step ? "bg-white text-black" : index < step ? "bg-emerald-400/10 text-emerald-200" : "bg-white/[.05] text-white/32"}`} key={label}>{label}</button>)}</div>
              <span className="text-[10px] uppercase tracking-[.18em] text-white/35">{Math.min(step + 1, steps.length)} / {steps.length}</span>
            </div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[.06]"><div className="h-full rounded-full bg-gradient-to-r from-amber-200 via-pink-300 to-violet-300 transition-all" style={{ width: `${success ? 100 : progress}%` }} /></div>
          </div>

          {error ? <p className="mt-4 rounded-2xl border border-rose-300/20 bg-rose-400/[.08] p-4 text-sm text-rose-100">{error}</p> : null}

          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: .24 }} className="mt-6">
              {step === 0 ? <LandingPanel open={open} status={data.settings.status} closingDate={data.settings.closingDate} /> : null}
              {step === 1 ? <PersonalPanel form={form} update={update} /> : null}
              {step === 2 ? <TeamPanel teams={data.teams} selected={team} onSelect={(id) => { setTeam(id); setRole(""); setAnswers({}); }} /> : null}
              {step === 3 ? <RolePanel roles={teamRoles} selected={role} onSelect={setRole} team={selectedTeam} /> : null}
              {step === 4 ? <QuestionPanel questions={visibleQuestions} answers={answers} setAnswers={setAnswers} uploadFile={uploadFile} files={files} uploading={uploading} /> : null}
              {step === 5 ? <ReviewPanel form={form} team={selectedTeam} role={selectedRole} questions={visibleQuestions} answers={answers} files={files} onEdit={setStep} /> : null}
              {step >= steps.length ? <SuccessPanel message={success} /> : null}
            </motion.div>
          </AnimatePresence>

          {step < steps.length ? <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/[.07] pt-5">
            <button type="button" onClick={() => setStep((value) => Math.max(value - 1, 0))} className="ghost-pill inline-flex min-h-12 items-center gap-2 rounded-full px-5 text-sm disabled:opacity-40" disabled={step === 0}><ArrowLeft size={16} /> Back</button>
            {step === steps.length - 1 ? <button disabled={busy || !canContinue()} className="action-pill inline-flex min-h-12 items-center gap-2 rounded-full px-6 text-sm font-semibold disabled:opacity-60">{busy ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />} Submit application</button> : <button type="button" onClick={next} disabled={!canContinue()} className="action-pill inline-flex min-h-12 items-center gap-2 rounded-full px-6 text-sm font-semibold disabled:opacity-60">Continue <ArrowRight size={16} /></button>}
          </div> : null}
        </form>
      </div>
    </section>
  );
}

function LandingPanel({ open, status, closingDate }: { open: boolean; status: string; closingDate?: string }) {
  return <div className="grid gap-4 md:grid-cols-2"><div className="rounded-[1.5rem] border border-white/[.08] bg-white/[.035] p-6"><Sparkles className="text-amber-200" /><h2 className="mt-6 text-3xl font-semibold tracking-[-.04em]">A sharper way to join.</h2><p className="mt-3 text-sm leading-7 text-white/50">No endless form. Each step asks for what helps teams understand your fit, craft, and intent.</p></div><div className="rounded-[1.5rem] border border-white/[.08] bg-black/20 p-6"><Users className="text-violet-200" /><h3 className="mt-6 text-2xl font-semibold tracking-[-.04em]">{open ? "Start when ready." : statusCopy[status]}</h3><p className="mt-3 text-sm leading-7 text-white/48">{open ? `Applications are live${closingDate ? ` until ${new Date(closingDate).toLocaleDateString("en-IN")}` : ""}.` : "The form is currently unavailable. You can still explore the teams and return when recruitment opens."}</p></div></div>;
}

function PersonalPanel({ form, update }: { form: Record<string, any>; update: (name: string, value: any) => void }) {
  return <div><h2 className="text-3xl font-semibold tracking-[-.04em]">Your signal.</h2><div className="mt-5 grid gap-4 md:grid-cols-2">{personalFields.map(([name, label, type]) => <label className="text-[10px] font-semibold uppercase tracking-[.18em] text-white/35" key={name}>{label}{["linkedin", "github", "portfolio"].includes(name) ? <span className="ml-1 text-white/25">(Optional)</span> : null}<input value={form[name] || ""} onChange={(event) => update(name, event.target.value)} type={type} required={!["linkedin", "github", "portfolio"].includes(name)} className="mt-2 w-full rounded-2xl border border-white/[.08] bg-black/25 px-4 py-3 text-sm normal-case tracking-normal text-white outline-none focus:border-violet-300/45" /></label>)}</div></div>;
}

function UploadBox({ label, uploadFile, file, uploading }: { label: string; uploadFile: (label: string, file?: File) => void; file?: FileAsset; uploading: boolean }) {
  return <label className="rounded-2xl border border-white/[.08] bg-white/[.03] p-4 text-xs text-white/45 transition hover:border-violet-200/25"><span className="flex items-center gap-2 text-white/70">{uploading ? <Loader2 size={15} className="animate-spin" /> : <FileUp size={15} />} {label}</span><input type="file" accept="application/pdf,image/*,video/mp4,video/webm" className="mt-3 block w-full text-[10px] file:mr-2 file:rounded-full file:border-0 file:bg-white file:px-3 file:py-2 file:text-[10px] file:font-semibold file:text-black" onChange={(event) => uploadFile(label, event.target.files?.[0])} />{file ? <span className="mt-2 block truncate text-emerald-200">Uploaded</span> : null}</label>;
}

function TeamPanel({ teams, selected, onSelect }: { teams: Team[]; selected: string; onSelect: (id: string) => void }) {
  return <div><h2 className="text-3xl font-semibold tracking-[-.04em]">Choose one team.</h2><div className="mt-5 grid gap-4 md:grid-cols-2">{teams.map((team) => {
    const visual = getRecruitmentTeamIcon(team.slug, team.icon);
    const Icon = visual.Icon;
    return <button type="button" onClick={() => onSelect(team.id)} className={`group rounded-[1.4rem] border p-5 text-left transition hover:-translate-y-1 ${selected === team.id ? "border-amber-200/55 bg-amber-200/[.08] shadow-[0_18px_60px_rgba(251,191,36,.12)]" : "border-white/[.08] bg-white/[.03] hover:border-violet-200/30"}`} key={team.id}><span className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${visual.accent} ring-1 ring-white/10 transition group-hover:scale-105`}><Icon size={22} strokeWidth={1.8} /><span className="sr-only">{visual.emoji}</span></span><div className="mt-5 flex items-center gap-2"><span className="text-lg">{visual.emoji}</span><h3 className="text-xl font-semibold">{team.name}</h3></div><p className="mt-2 text-sm leading-6 text-white/45">{team.description || "Create meaningful work with this team."}</p></button>;
  })}</div>{!teams.length ? <p className="rounded-2xl border border-white/[.08] bg-white/[.03] p-6 text-white/45">No recruitment teams are active yet.</p> : null}</div>;
}

function RolePanel({ roles, selected, onSelect, team }: { roles: Role[]; selected: string; onSelect: (id: string) => void; team?: Team }) {
  return <div><h2 className="text-3xl font-semibold tracking-[-.04em]">{team ? `Pick a ${team.name} role.` : "Pick a role."}</h2><div className="mt-5 grid gap-3 md:grid-cols-2">{roles.map((role) => <button type="button" onClick={() => onSelect(role.id)} className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 ${selected === role.id ? "border-violet-200/55 bg-violet-300/[.08]" : "border-white/[.08] bg-white/[.03]"}`} key={role.id}><p className="font-semibold text-white/82">{role.name}</p><p className="mt-2 text-xs leading-5 text-white/42">{role.description || "Tell us why this path fits you."}</p></button>)}</div>{!roles.length ? <p className="rounded-2xl border border-white/[.08] bg-white/[.03] p-6 text-white/45">No active roles are configured for this team yet.</p> : null}</div>;
}

function QuestionPanel({ questions, answers, setAnswers, uploadFile, files, uploading }: any) {
  return <div><h2 className="text-3xl font-semibold tracking-[-.04em]">Team questions.</h2><div className="mt-5 grid gap-4">{questions.map((question: Question) => <label className="rounded-2xl border border-white/[.08] bg-white/[.03] p-4 text-sm text-white/70" key={question.id}><span className="font-semibold">{question.label}{question.required ? <span className="text-rose-200"> *</span> : null}</span>{question.helpText ? <span className="mt-1 block text-xs leading-5 text-white/38">{question.helpText}</span> : null}<QuestionInput question={question} value={answers[question.id]} onChange={(value: any) => setAnswers((state: any) => ({ ...state, [question.id]: value }))} uploadFile={uploadFile} files={files} uploading={uploading} /></label>)}</div>{!questions.length ? <p className="rounded-2xl border border-white/[.08] bg-white/[.03] p-6 text-white/45">No extra questions for this role. Continue to review.</p> : null}</div>;
}

function QuestionInput({ question, value, onChange, uploadFile, files, uploading }: any) {
  const inputClass = "mt-3 w-full rounded-2xl border border-white/[.08] bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-violet-300/45";
  if (question.type === "long_text") return <textarea value={value || ""} onChange={(event) => onChange(event.target.value)} rows={5} className={inputClass} />;
  if (question.type === "dropdown") return <select value={value || ""} onChange={(event) => onChange(event.target.value)} className={inputClass}><option value="">Choose one</option>{question.options.map((option: string) => <option key={option} value={option}>{option}</option>)}</select>;
  if (question.type === "multiple_choice") return <div className="mt-3 grid gap-2 md:grid-cols-2">{question.options.map((option: string) => <button type="button" onClick={() => onChange(option)} className={`rounded-xl border px-4 py-3 text-left text-xs ${value === option ? "border-amber-200/50 bg-amber-200/[.08]" : "border-white/[.08] bg-black/20"}`} key={option}>{option}</button>)}</div>;
  if (question.type === "checkbox") return <div className="mt-3 grid gap-2 md:grid-cols-2">{question.options.map((option: string) => { const list = Array.isArray(value) ? value : []; return <button type="button" onClick={() => onChange(list.includes(option) ? list.filter((item: string) => item !== option) : [...list, option])} className={`rounded-xl border px-4 py-3 text-left text-xs ${list.includes(option) ? "border-emerald-200/50 bg-emerald-200/[.08]" : "border-white/[.08] bg-black/20"}`} key={option}>{option}</button>; })}</div>;
  if (question.type === "rating") return <input type="range" min="1" max="10" value={value || 5} onChange={(event) => onChange(event.target.value)} className="mt-4 w-full" />;
  if (question.type === "file_upload") return <UploadBox label={question.label} uploadFile={uploadFile} file={files.find((item: FileAsset) => item.label === question.label)} uploading={uploading === question.label} />;
  return <input value={value || ""} onChange={(event) => onChange(event.target.value)} type={question.type === "number" ? "number" : question.type === "url" ? "url" : "text"} className={inputClass} />;
}

function ClosedRecruitmentView({ data }: { data: RecruitmentData }) {
  const copy = closedCopy[data.settings.status] || closedCopy.closed;
  return (
    <section className="relative mx-auto max-w-5xl px-5 pb-20 pt-32 md:px-6 md:pb-28 md:pt-44">
      <div className="absolute inset-x-0 top-24 h-80 bg-[radial-gradient(circle_at_50%_0%,rgba(253,186,116,.18),transparent_36%),radial-gradient(circle_at_70%_20%,rgba(232,121,166,.16),transparent_30%)]" aria-hidden />
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="relative premium-card rounded-[2rem] p-8 text-center md:p-14">
        <span className="mx-auto grid h-24 w-24 place-items-center rounded-full border border-white/[.08] bg-white/[.04] text-white/70">
          {data.settings.status === "opening_soon" ? <Clock3 size={40} /> : <Lock size={40} />}
        </span>
        <p className="mt-8 text-[10px] font-semibold uppercase tracking-[.22em] text-white/35">{statusCopy[data.settings.status] || "Recruitment"}</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-.05em] md:text-6xl">{copy.title}</h1>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-white/52">{copy.body}</p>
        {data.settings.openingDate && data.settings.status === "opening_soon" ? (
          <p className="mt-4 text-sm text-violet-200">Opens {new Date(data.settings.openingDate).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p>
        ) : null}
        {data.settings.announcementBanner ? <p className="mx-auto mt-6 max-w-xl rounded-2xl border border-amber-200/20 bg-amber-300/[.06] p-4 text-xs leading-6 text-amber-50/75">{data.settings.announcementBanner}</p> : null}
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href="/" className="ghost-pill inline-flex min-h-12 items-center rounded-full px-6 text-sm">Return home</Link>
          <Link href="/teams" className="action-pill inline-flex min-h-12 items-center rounded-full px-6 text-sm font-semibold">Explore teams</Link>
        </div>
      </motion.div>
    </section>
  );
}

function ReviewPanel({ form, team, role, questions, answers, files, onEdit }: any) {
  const links = [["LinkedIn", form.linkedin, Linkedin], ["GitHub", form.github, Github], ["Portfolio", form.portfolio, LinkIcon]].filter(([, value]) => value);
  return <div><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-3xl font-semibold tracking-[-.04em]">Review everything.</h2><button type="button" onClick={() => onEdit(1)} className="ghost-pill inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs"><Pencil size={13} /> Edit details</button></div><div className="mt-5 grid gap-4"><div className="rounded-2xl border border-white/[.08] bg-white/[.03] p-5"><p className="text-xl font-semibold">{form.fullName}</p><p className="mt-2 text-sm text-white/45">{form.uid} / {form.course} / {form.branch} / {form.year}</p><p className="mt-2 text-sm text-white/45">{form.email} / {form.phone}</p><div className="mt-3 flex flex-wrap gap-2">{links.map(([label, href, Icon]: any) => <a href={href} className="ghost-pill inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs" key={label}><Icon size={13} /> {label}</a>)}</div></div><div className="rounded-2xl border border-white/[.08] bg-white/[.03] p-5"><div className="flex items-center justify-between gap-3"><div><p className="text-sm text-white/40">Selected path</p><p className="mt-2 text-xl font-semibold">{team?.name || "-"} / {role?.name || "-"}</p></div><button type="button" onClick={() => onEdit(2)} className="ghost-pill rounded-full px-3 py-2 text-xs">Edit team</button></div></div>{questions.map((question: Question) => <div className="rounded-2xl border border-white/[.08] bg-white/[.03] p-5" key={question.id}><p className="text-sm font-semibold text-white/72">{question.label}</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white/45">{Array.isArray(answers[question.id]) ? answers[question.id].join(", ") : answers[question.id] || "-"}</p></div>)}{files.length ? <div className="rounded-2xl border border-white/[.08] bg-white/[.03] p-5"><p className="text-sm font-semibold text-white/72">Uploads</p><div className="mt-3 flex flex-wrap gap-2">{files.map((file: FileAsset) => <a className="ghost-pill rounded-full px-3 py-2 text-xs" href={file.url} key={file.url}>{file.label}</a>)}</div></div> : null}</div></div>;
}

function SuccessPanel({ message }: { message: string }) {
  return <div className="grid min-h-[520px] place-items-center text-center"><div><motion.span initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 180, damping: 16 }} className="mx-auto grid h-24 w-24 place-items-center rounded-full border border-emerald-200/25 bg-emerald-300/[.08] text-emerald-100"><CheckCircle2 size={42} /></motion.span><motion.h2 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="mt-8 text-4xl font-semibold tracking-[-.05em]">Application received.</motion.h2><motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mx-auto mt-4 max-w-md text-sm leading-7 text-white/52">{message || "We will review your application and reach out with the next steps."}</motion.p><motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}><Link href="/" className="action-pill mt-8 inline-flex min-h-12 items-center gap-2 rounded-full px-6 text-sm font-semibold"><Check size={16} /> Return home</Link></motion.div></div></div>;
}
