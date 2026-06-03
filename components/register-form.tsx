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
          registrationNumber: formData.get(`member_${slot}_registrationNumber`),
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
    ["registrationNumber", "Registration number", "text"],
    ["program", "Program", "text"],
    ["semester", "Semester", "number"]
  ] as const;

  return (
    <form action={submit} className="mt-7 space-y-3">
      {canChoose ? (
        <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/[.07] bg-black/25 p-2">
          {(["individual", "team"] as const).map((option) => (
            <button type="button" onClick={() => setMode(option)} className={`rounded-full px-4 py-2 text-xs font-semibold transition ${mode === option ? "bg-white text-black shadow-[0_0_24px_rgba(255,255,255,.18)]" : "border border-white/[.08] bg-white/[.025] text-white/55 hover:border-violet-300/25 hover:bg-violet-500/[.08] hover:text-white"}`} key={option}>
              {option === "team" ? "Team" : "Individual"}
            </button>
          ))}
        </div>
      ) : null}

      {mode === "team" ? (
        <label className="block text-[10px] tracking-wider text-white/35">
          TEAM NAME
          <input name="teamName" required className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50" />
        </label>
      ) : null}

      <p className="flex items-center gap-2 pt-2 text-xs text-white/45"><Users size={14} className="text-violet-300" /> {mode === "team" ? "Team leader details" : "Candidate details"}</p>
      {fields.map(([name, label, type]) => (
        <label className="block text-[10px] tracking-wider text-white/35" key={name}>
          {label.toUpperCase()}
          <input name={name} required={name !== "registrationNumber"} type={type} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50" />
        </label>
      ))}

      {mode === "team" ? (
        <div className="rounded-xl border border-white/[.07] bg-white/[.025] p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-white/55">Team members</p>
            <button type="button" onClick={() => setMemberCount((count) => Math.min(maxTeamSize, count + 1))} disabled={memberCount >= maxTeamSize} className="ghost-pill flex items-center gap-1 rounded-full px-3 py-2 text-[10px] text-violet-100 disabled:opacity-40">
              <Plus size={12} /> Add member
            </button>
          </div>
          <p className="mt-2 text-[10px] text-white/35">Maximum team size: {maxTeamSize}. This includes the team leader above.</p>
          <div className="mt-4 grid gap-4">
            {teamSlots.slice(1).map((_, index) => {
              const slot = index + 1;
              return (
                <div className="rounded-xl border border-white/[.06] bg-black/20 p-3" key={slot}>
                  <p className="text-[10px] tracking-wider text-white/35">MEMBER {slot}</p>
                  <div className="mt-3 grid gap-2">
                    {fields.map(([field, label, type]) => (
                      <input key={field} name={`member_${slot}_` + field} placeholder={label} required={field !== "registrationNumber"} type={type} className="rounded-lg border border-white/[.07] bg-black/25 px-3 py-2.5 text-xs text-white outline-none placeholder:text-white/25 focus:border-violet-400/50" />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      <button disabled={loading} className="action-pill flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold disabled:opacity-60">
        {loading ? "Registering..." : mode === "team" ? "Register team" : "Register for this event"} <ArrowUpRight size={15}/>
      </button>
      {status ? <p className="rounded-lg bg-violet-500/10 p-3 text-center text-xs text-violet-100">{status}</p> : null}
    </form>
  );
}
