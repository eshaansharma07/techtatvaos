"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, Plus, Users } from "lucide-react";

type Mode = "individual" | "team" | "both";

export function RegisterForm({ eventId, participationMode = "individual", maxTeamSize = 1 }: { eventId: string; participationMode?: Mode; maxTeamSize?: number }) {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"individual" | "team">(participationMode === "team" ? "team" : "individual");
  const [memberCount, setMemberCount] = useState(Math.max(1, Math.min(maxTeamSize, 2)));

  const canChoose = participationMode === "both";
  const teamSlots = useMemo(() => Array.from({ length: Math.max(1, memberCount) }), [memberCount]);

  async function submit(formData: FormData) {
    setLoading(true);
    setStatus("");
    const body: Record<string, any> = Object.fromEntries(formData.entries());
    body.mode = mode;
    if (mode === "team") {
      body.members = teamSlots.slice(1).map((_, index) => {
        const slot = index + 1;
        return {
          name: formData.get(`member_${slot}_name`),
          email: formData.get(`member_${slot}_email`),
          uid: formData.get(`member_${slot}_uid`),
          program: formData.get(`member_${slot}_program`),
          semester: formData.get(`member_${slot}_semester`)
        };
      });
    }
    try {
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      setStatus(res.ok ? `Registration ${data.status || "confirmed"}. ${mode === "team" ? "Team" : "Candidate"} attendance records created.` : data.error || "Registration failed.");
    } catch {
      setStatus("Registration failed. Please check the details and try again.");
    } finally {
      setLoading(false);
    }
  }

  const fields = [
    ["name", "Name", "text"],
    ["email", "Email", "email"],
    ["uid", "UID", "text"],
    ["program", "Program", "text"],
    ["semester", "Semester", "number"]
  ] as const;

  return (
    <form action={submit} className="mt-7 space-y-3">
      {canChoose ? (
        <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-black/40 p-2">
          {(["individual", "team"] as const).map((option) => (
            <button type="button" onClick={() => setMode(option)} className={`rounded-xl px-4 py-2 text-xs font-bold transition ${mode === option ? "bg-[#00FF66] text-black border border-black shadow-[1px_1px_0px_0px_rgba(255,255,255,0.8)]" : "brutalist-btn-dark hover:border-emerald-500/50"}`} key={option}>
              {option === "team" ? "Team" : "Individual"}
            </button>
          ))}
        </div>
      ) : null}
 
      {mode === "team" ? (
        <label className="block text-[10px] tracking-wider text-white/35 font-bold">
          TEAM NAME
          <input name="teamName" required className="mt-2 w-full rounded-xl border border-white/10 bg-black/45 px-3 py-3 text-sm text-white outline-none focus:border-emerald-500/50" />
        </label>
      ) : null}
 
      <p className="flex items-center gap-2 pt-2 text-xs text-white/45 font-bold"><Users size={14} className="text-emerald-400" /> {mode === "team" ? "Team leader details" : "Candidate details"}</p>
      {fields.map(([name, label, type]) => (
        <label className="block text-[10px] tracking-wider text-white/35 font-bold" key={name}>
          {label.toUpperCase()}
          <input name={name} required type={type} className="mt-2 w-full rounded-xl border border-white/10 bg-black/45 px-3 py-3 text-sm text-white outline-none focus:border-emerald-500/50" />
        </label>
      ))}
 
      {mode === "team" ? (
        <div className="glass-brutalist rounded-xl p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-white/55 font-bold">Team members</p>
            <button type="button" onClick={() => setMemberCount((count) => Math.min(maxTeamSize, count + 1))} disabled={memberCount >= maxTeamSize} className="brutalist-btn-dark flex items-center gap-1 rounded-xl px-3 py-2 text-[10px] disabled:opacity-40">
              <Plus size={12} /> Add member
            </button>
          </div>
          <p className="mt-2 text-[10px] text-white/35">Maximum team size: {maxTeamSize}. This includes the team leader above.</p>
          <div className="mt-4 grid gap-4">
            {teamSlots.slice(1).map((_, index) => {
              const slot = index + 1;
              return (
                <div className="glass-brutalist rounded-xl p-3" key={slot}>
                  <p className="text-[10px] tracking-wider text-white/35 font-bold">MEMBER {slot}</p>
                  <div className="mt-3 grid gap-2">
                    {fields.map(([field, label, type]) => (
                      <input key={field} name={`member_${slot}_` + field} placeholder={label} required type={type} className="rounded-xl border border-white/10 bg-black/45 px-3 py-2.5 text-xs text-white outline-none placeholder:text-white/25 focus:border-emerald-500/50" />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
 
      <button disabled={loading} className="brutalist-btn-green flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold disabled:opacity-60">
        {loading ? "Registering..." : mode === "team" ? "Register team" : "Register for this event"} <ArrowUpRight size={15}/>
      </button>
      {status ? <p className="rounded-xl border-2 border-black bg-emerald-500/10 p-3 text-center text-xs text-emerald-300 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.8)]">{status}</p> : null}
    </form>
  );
}
