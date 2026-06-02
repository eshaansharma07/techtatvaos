"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";

export function RegisterForm({ eventId }: { eventId: string }) {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(formData: FormData) {
    setLoading(true);
    setStatus("");
    const body = Object.fromEntries(formData.entries());
    const res = await fetch(`/api/events/${eventId}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    setLoading(false);
    setStatus(res.ok ? `Registration ${data.status || "confirmed"}. QR token created.` : data.error || "Registration failed.");
  }

  return (
    <form action={submit} className="mt-7 space-y-3">
      {[
        ["name", "Name"],
        ["email", "Email"],
        ["uid", "UID"],
        ["registrationNumber", "Registration number"]
      ].map(([name, label]) => (
        <label className="block text-[10px] tracking-wider text-white/35" key={name}>
          {label.toUpperCase()}
          <input
            name={name}
            required={name !== "registrationNumber"}
            type={name === "email" ? "email" : "text"}
            className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50"
          />
        </label>
      ))}
      <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-sm font-semibold text-black disabled:opacity-60">
        {loading ? "Registering..." : "Register for this event"} <ArrowUpRight size={15}/>
      </button>
      {status ? <p className="rounded-lg bg-violet-500/10 p-3 text-center text-xs text-violet-100">{status}</p> : null}
    </form>
  );
}
