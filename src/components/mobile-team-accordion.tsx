"use client";

import { useState } from "react";
import { ChevronDown, Crown, ShieldCheck, Sparkles, Users } from "lucide-react";
import type { PublicTeam } from "@/lib/public-data";

type ClubInfo = Record<string, any>;

function PersonCard({ label, name, sub, photo, tone = "violet" }: { label: string; name?: string; sub?: string; photo?: string; tone?: "violet" | "emerald" | "fuchsia" | "amber" | "rose" }) {
  const tones = {
    violet: "border-[#00FF66] bg-black/40 text-white",
    emerald: "border-[#00FF66]/60 bg-black/40 text-white",
    fuchsia: "border-[#00FF66]/55 bg-black/40 text-white",
    amber: "border-[#00FF66]/40 bg-black/40 text-white",
    rose: "border-[#00FF66]/20 bg-black/40 text-white"
  };
  return (
    <div className={`relative overflow-hidden rounded-3xl border-2 p-4 text-center ${tones[tone]}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,255,102,.03),transparent_48%)]" />
      <div className="relative">
        {photo ? <img src={photo} alt="" className="mx-auto mb-3 h-14 w-14 rounded-xl border border-white/15 object-cover" /> : <Crown className="mx-auto mb-3 text-emerald-400" size={19} />}
        <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#00FF66]">{label}</p>
        <p className="mt-2 text-lg font-bold tracking-[-.03em] text-white">{name || "Add details in portal"}</p>
        {sub ? <p className="mt-1 text-xs leading-5 text-white/48">{sub}</p> : null}
      </div>
    </div>
  );
}

function TeamPanel({ team }: { team: PublicTeam }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass-brutalist overflow-hidden rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,.22)]">
      <button type="button" onClick={() => setOpen(!open)} className="flex min-h-20 w-full items-center justify-between gap-4 px-5 text-left active:bg-white/[.04]">
        <div>
          <p className="text-base font-bold text-white">{team.name}</p>
          <p className="mt-1 text-[11px] uppercase tracking-[.18em] text-emerald-400 font-bold">{team.members} active members</p>
        </div>
        <ChevronDown size={18} className={`shrink-0 text-emerald-400 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? (
        <div className="border-t border-white/[.07] px-5 py-5">
          {team.description ? <p className="text-sm leading-6 text-white/55">{team.description}</p> : null}
          <div className="mt-4 grid gap-3">
            <div className="glass-brutalist rounded-2xl p-4">
              <p className="text-[10px] uppercase tracking-[.18em] text-white/35 font-bold">Team Lead</p>
              <p className="mt-1 text-sm text-white/80">{team.lead || "Lead to be assigned"}</p>
            </div>
            {team.coLeads.length ? (
              <div className="glass-brutalist rounded-2xl p-4">
                <p className="text-[10px] uppercase tracking-[.18em] text-white/35 font-bold">Co-leads</p>
                <p className="mt-1 text-sm leading-6 text-white/70">{team.coLeads.join(", ")}</p>
              </div>
            ) : null}
            <div className="glass-brutalist rounded-2xl p-4">
              <p className="flex items-center gap-2 text-[10px] uppercase tracking-[.18em] text-white/35 font-bold"><Users size={13} /> Members</p>
              <div className="mt-3 grid max-h-56 gap-2 overflow-y-auto pr-1">
                {team.memberNames.length ? team.memberNames.map((member) => (
                  <p key={member} className="flex items-center gap-2 rounded-xl glass-brutalist px-3 py-2.5 text-sm text-white/68">
                    <ShieldCheck size={13} className="text-[#00FF66]" />
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

export function MobileTeamAccordion({ technical, creative, info }: { technical: PublicTeam[]; creative: PublicTeam[]; info: ClubInfo }) {
  const groups = [
    ["Joint Secretary", info.jointSecretaryOneName || "Assign Joint Secretary", technical, "emerald", "technical"],
    ["Joint Secretary", info.jointSecretaryTwoName || "Assign Joint Secretary", creative, "fuchsia", "creative"]
  ] as const;
  const advisors = [
    { label: "Faculty Champion", name: info.facultyChampionName, sub: info.facultyChampionEmail, photo: info.facultyChampionPhoto, tone: "emerald" as const },
    { label: "Co-Faculty Champion", name: info.coFacultyChampionName, sub: info.coFacultyChampionEmail || info.coFacultyChampionPhone, photo: info.coFacultyChampionPhoto, tone: "emerald" as const },
    { label: "Student Advisor 1", name: info.studentAdvisorOneName, sub: info.studentAdvisorOneEmail, photo: info.studentAdvisorOnePhoto, tone: "amber" as const },
    { label: "Student Advisor 2", name: info.studentAdvisorTwoName, sub: info.studentAdvisorTwoEmail, photo: info.studentAdvisorTwoPhoto, tone: "rose" as const }
  ].filter((person) => person.name || person.sub || person.photo || person.label === "Faculty Champion");

  return (
    <div className="md:hidden">
      <div className="rounded-[2rem] glass-brutalist p-4 shadow-2xl">
        <p className="flex items-center gap-2 px-2 text-[10px] font-bold uppercase tracking-[.24em] text-emerald-400"><Sparkles size={13} /> Club hierarchy</p>
        <div className="mt-4 grid gap-4">
          <section className="rounded-[1.6rem] glass-brutalist p-3">
            <p className="mb-3 px-1 text-[10px] font-bold uppercase tracking-[.22em] text-[#00FF66]">Advisory Tree</p>
            <div className="grid gap-3">
              {advisors.map((person) => <PersonCard key={person.label} {...person} />)}
            </div>
          </section>

          <section className="rounded-[1.6rem] glass-brutalist p-3">
            <p className="mb-3 px-1 text-[10px] font-bold uppercase tracking-[.22em] text-[#00FF66]">Club Operations Tree</p>
            <PersonCard label="1. Secretary" name={info.secretaryName} sub={info.secretaryEmail} photo={info.secretaryPhoto} tone="violet" />
          </section>

          {groups.map(([title, secretary, teams, tone, key]) => (
            <section key={key} className="rounded-[1.6rem] glass-brutalist p-3">
              <PersonCard label={title} name={secretary} tone={tone} />
              <div className="mx-auto h-6 w-px bg-white/18" />
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
