"use client";

import { useState } from "react";
import { ChevronDown, ShieldCheck, Users } from "lucide-react";
import type { PublicTeam } from "@/lib/public-data";

function TeamPanel({ team }: { team: PublicTeam }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-3xl border border-white/[.09] bg-white/[.045] shadow-[0_20px_60px_rgba(0,0,0,.22)]">
      <button type="button" onClick={() => setOpen(!open)} className="flex min-h-20 w-full items-center justify-between gap-4 px-5 text-left active:bg-white/[.04]">
        <div>
          <p className="text-base font-semibold text-white">{team.name}</p>
          <p className="mt-1 text-[11px] uppercase tracking-[.18em] text-white/38">{team.members} active members</p>
        </div>
        <ChevronDown size={18} className={`shrink-0 text-violet-200 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? (
        <div className="border-t border-white/[.07] px-5 py-5">
          {team.description ? <p className="text-sm leading-6 text-white/55">{team.description}</p> : null}
          <div className="mt-4 grid gap-3">
            <div className="rounded-2xl border border-white/[.07] bg-black/24 p-4">
              <p className="text-[10px] uppercase tracking-[.18em] text-white/35">Team Lead</p>
              <p className="mt-1 text-sm text-white/80">{team.lead || "Lead to be assigned"}</p>
            </div>
            {team.coLeads.length ? (
              <div className="rounded-2xl border border-white/[.07] bg-black/24 p-4">
                <p className="text-[10px] uppercase tracking-[.18em] text-white/35">Co-leads</p>
                <p className="mt-1 text-sm leading-6 text-white/70">{team.coLeads.join(", ")}</p>
              </div>
            ) : null}
            <div className="rounded-2xl border border-white/[.07] bg-black/24 p-4">
              <p className="flex items-center gap-2 text-[10px] uppercase tracking-[.18em] text-white/35"><Users size={13} /> Members</p>
              <div className="mt-3 grid max-h-56 gap-2 overflow-y-auto pr-1">
                {team.memberNames.length ? team.memberNames.map((member) => (
                  <p key={member} className="flex items-center gap-2 rounded-xl border border-white/[.07] bg-white/[.035] px-3 py-2.5 text-sm text-white/68">
                    <ShieldCheck size={13} className="text-violet-200" />
                    {member}
                  </p>
                )) : <p className="text-sm text-white/42">Members will appear after they are assigned.</p>}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function MobileTeamAccordion({ technical, creative }: { technical: PublicTeam[]; creative: PublicTeam[] }) {
  const groups = [
    ["Technical & Operations", technical],
    ["Media & Creative", creative]
  ] as const;

  return (
    <div className="md:hidden">
      <div className="rounded-[2rem] border border-white/[.09] bg-white/[.035] p-4">
        <p className="px-2 text-[10px] font-semibold uppercase tracking-[.24em] text-violet-200/65">Mobile Team Directory</p>
        <div className="mt-4 grid gap-5">
          {groups.map(([title, teams]) => (
            <section key={title}>
              <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-[.18em] text-white/45">{title}</p>
              <div className="grid gap-3">
                {teams.length ? teams.map((team) => <TeamPanel key={team.id} team={team} />) : (
                  <div className="rounded-3xl border border-white/[.08] bg-black/20 p-5 text-sm text-white/42">No teams in this lane yet.</div>
                )}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
