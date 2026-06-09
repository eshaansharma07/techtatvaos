"use client";

import { useState } from "react";
import { ChevronDown, Crown, ShieldCheck, Sparkles, Users } from "lucide-react";
import type { PublicTeam } from "@/lib/public-data";

type ClubInfo = Record<string, any>;

function PersonCard({ label, name, sub, photo }: { label: string; name?: string; sub?: string; photo?: string }) {
  return (
    <article className="rounded-[1.7rem] border border-stone-200/80 bg-white p-4 shadow-[0_18px_50px_rgba(82,52,30,.08)]">
      <div className="flex items-center gap-4">
        {photo ? (
          <img src={photo} alt={name || ""} className="h-16 w-16 rounded-2xl object-cover" />
        ) : (
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#f5ebe0] text-stone-400">
            <Crown size={18} />
          </div>
        )}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[.17em] text-rose-400">{label}</p>
          <p className="mt-1 text-lg font-semibold tracking-[-.04em] text-stone-950">{name || "Details coming soon"}</p>
          {sub ? <p className="mt-1 text-xs leading-5 text-stone-500">{sub}</p> : null}
        </div>
      </div>
    </article>
  );
}

function TeamPanel({ team }: { team: PublicTeam }) {
  const [open, setOpen] = useState(false);
  return (
    <article className="overflow-hidden rounded-[1.8rem] border border-stone-200/80 bg-white shadow-[0_18px_55px_rgba(82,52,30,.08)]">
      <button type="button" onClick={() => setOpen(!open)} className="flex min-h-20 w-full items-center justify-between gap-4 px-5 text-left active:bg-[#faf8f5]">
        <div>
          <p className="text-base font-semibold tracking-[-.03em] text-stone-950">{team.name}</p>
          <p className="mt-1 text-[11px] uppercase tracking-[.16em] text-stone-400">{team.members} active members</p>
        </div>
        <ChevronDown size={18} className={`shrink-0 text-stone-500 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? (
        <div className="border-t border-stone-200/80 px-5 py-5">
          {team.description ? <p className="text-sm leading-6 text-stone-500">{team.description}</p> : null}
          <div className="mt-4 grid gap-3">
            <div className="rounded-2xl bg-[#faf8f5] p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-stone-400">Team Lead</p>
              <p className="mt-1 text-sm font-semibold text-stone-900">{team.lead || "Lead to be assigned"}</p>
            </div>
            {team.coLeads.length ? (
              <div className="rounded-2xl bg-[#faf8f5] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-stone-400">Co-Leads</p>
                <p className="mt-1 text-sm leading-6 text-stone-600">{team.coLeads.join(", ")}</p>
              </div>
            ) : null}
            <div className="rounded-2xl bg-[#faf8f5] p-4">
              <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.16em] text-stone-400"><Users size={13} /> Members</p>
              <div className="mt-3 grid max-h-56 gap-2 overflow-y-auto pr-1">
                {team.memberNames.length ? team.memberNames.map((member) => (
                  <p key={member} className="flex items-center gap-2 rounded-xl border border-stone-200/80 bg-white px-3 py-2.5 text-sm text-stone-600">
                    <ShieldCheck size={13} className="text-rose-300" />
                    {member}
                  </p>
                )) : <p className="text-sm text-stone-400">Members will appear after they are assigned.</p>}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}

export function MobileTeamAccordion({ technical, creative, info }: { technical: PublicTeam[]; creative: PublicTeam[]; info: ClubInfo }) {
  const advisors = [
    { label: "Faculty Champion", name: info.facultyChampionName, sub: info.facultyChampionEmail, photo: info.facultyChampionPhoto },
    { label: "Co-Faculty Champion", name: info.coFacultyChampionName, sub: info.coFacultyChampionEmail || info.coFacultyChampionPhone, photo: info.coFacultyChampionPhoto },
    { label: "Student Advisor 1", name: info.studentAdvisorOneName, sub: info.studentAdvisorOneEmail, photo: info.studentAdvisorOnePhoto },
    { label: "Student Advisor 2", name: info.studentAdvisorTwoName, sub: info.studentAdvisorTwoEmail, photo: info.studentAdvisorTwoPhoto }
  ].filter((person) => person.name || person.sub || person.photo || person.label === "Faculty Champion");
  const groups = [
    ["Technical & Operations", info.jointSecretaryOneName || "Assign Joint Secretary", technical],
    ["Media & Creative", info.jointSecretaryTwoName || "Assign Joint Secretary", creative]
  ] as const;

  return (
    <div className="md:hidden">
      <div className="rounded-[2rem] border border-stone-200/80 bg-[#fffdf8] p-4 shadow-[0_22px_70px_rgba(82,52,30,.08)]">
        <p className="flex items-center gap-2 px-1 text-[10px] font-semibold uppercase tracking-[.22em] text-rose-400"><Sparkles size={13} /> Team showcase</p>
        <div className="mt-4 grid gap-4">
          <section className="grid gap-3">
            {advisors.map((person) => <PersonCard key={person.label} {...person} />)}
          </section>
          <section className="grid gap-3">
            <PersonCard label="Secretary" name={info.secretaryName} sub={info.secretaryEmail} photo={info.secretaryPhoto} />
            {groups.map(([title, secretary, teams]) => (
              <div key={title} className="rounded-[1.9rem] bg-[#faf8f5] p-3">
                <PersonCard label={`Joint Secretary (${title})`} name={secretary} />
                <div className="mt-3 grid gap-3">
                  {teams.length ? teams.map((team) => <TeamPanel key={team.id} team={team} />) : (
                    <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-5 text-sm text-stone-500">No teams in this section yet.</div>
                  )}
                </div>
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}
