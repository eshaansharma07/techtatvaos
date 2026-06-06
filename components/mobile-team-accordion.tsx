"use client";

import { useState } from "react";
import { ChevronDown, Crown, ShieldCheck, Sparkles, Users } from "lucide-react";
import type { PublicTeam } from "@/lib/public-data";

type ClubInfo = Record<string, any>;

function PersonCard({ label, name, sub, photo, tone = "violet" }: { label: string; name?: string; sub?: string; photo?: string; tone?: "violet" | "cyan" | "fuchsia" | "emerald" | "amber" | "rose" }) {
  const tones = {
    violet: "border-violet-300/24 bg-violet-500/12",
    cyan: "border-cyan-300/24 bg-cyan-500/12",
    fuchsia: "border-fuchsia-300/24 bg-fuchsia-500/12",
    emerald: "border-emerald-300/24 bg-emerald-500/12",
    amber: "border-amber-300/24 bg-amber-500/12",
    rose: "border-rose-300/24 bg-rose-500/12"
  };
  return (
    <div className={`relative overflow-hidden rounded-3xl border p-4 text-center ${tones[tone]}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,.11),transparent_48%)]" />
      <div className="relative">
        {photo ? <img src={photo} alt="" className="mx-auto mb-3 h-14 w-14 rounded-2xl border border-white/15 object-cover" /> : <Crown className="mx-auto mb-3 text-white/70" size={19} />}
        <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-white/44">{label}</p>
        <p className="mt-2 text-lg font-semibold tracking-[-.03em] text-white">{name || "Add details in portal"}</p>
        {sub ? <p className="mt-1 text-xs leading-5 text-white/48">{sub}</p> : null}
      </div>
    </div>
  );
}

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

export function MobileTeamAccordion({ technical, creative, info }: { technical: PublicTeam[]; creative: PublicTeam[]; info: ClubInfo }) {
  const groups = [
    ["Joint Secretary (Technical & Operations)", info.jointSecretaryOneName || "Assign Joint Secretary", technical, "cyan"],
    ["Joint Secretary (Media & Creative)", info.jointSecretaryTwoName || "Assign Joint Secretary", creative, "fuchsia"]
  ] as const;
  const advisors = [
    { label: "Faculty Champion", name: info.facultyChampionName, sub: info.facultyChampionEmail, photo: info.facultyChampionPhoto, tone: "emerald" as const },
    { label: "Co-Faculty Champion", name: info.coFacultyChampionName, sub: info.coFacultyChampionEmail || info.coFacultyChampionPhone, photo: info.coFacultyChampionPhoto, tone: "emerald" as const },
    { label: "Student Advisor 1", name: info.studentAdvisorOneName, sub: info.studentAdvisorOneEmail, photo: info.studentAdvisorOnePhoto, tone: "amber" as const },
    { label: "Student Advisor 2", name: info.studentAdvisorTwoName, sub: info.studentAdvisorTwoEmail, photo: info.studentAdvisorTwoPhoto, tone: "rose" as const }
  ].filter((person) => person.name || person.sub || person.photo || person.label === "Faculty Champion");

  return (
    <div className="md:hidden">
      <div className="rounded-[2rem] border border-white/[.09] bg-[#07060d]/88 p-4 shadow-2xl shadow-black/30">
        <p className="flex items-center gap-2 px-2 text-[10px] font-semibold uppercase tracking-[.24em] text-violet-200/65"><Sparkles size={13} /> Club hierarchy</p>
        <div className="mt-4 grid gap-4">
          <section className="rounded-[1.6rem] border border-emerald-200/12 bg-emerald-400/[.035] p-3">
            <p className="mb-3 px-1 text-[10px] font-semibold uppercase tracking-[.22em] text-emerald-100/55">Advisory Tree</p>
            <div className="grid gap-3">
              {advisors.map((person) => <PersonCard key={person.label} {...person} />)}
            </div>
          </section>

          <section className="rounded-[1.6rem] border border-violet-200/12 bg-violet-400/[.035] p-3">
            <p className="mb-3 px-1 text-[10px] font-semibold uppercase tracking-[.22em] text-violet-100/55">Club Operations Tree</p>
            <PersonCard label="1. Secretary" name={info.secretaryName} sub={info.secretaryEmail} photo={info.secretaryPhoto} tone="violet" />
          </section>

          {groups.map(([title, secretary, teams, tone]) => (
            <section key={title} className="rounded-[1.6rem] border border-white/[.08] bg-white/[.025] p-3">
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
