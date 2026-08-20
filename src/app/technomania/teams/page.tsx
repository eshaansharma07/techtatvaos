import { ArrowLeft, Users, Shield, Zap, Code, Palette, Megaphone, Cog } from "lucide-react";
import Link from "next/link";

export const revalidate = 60;

/* ── Static organizing team data (update with actual team members) ── */
const organizers = [
  {
    team: "CORE COMMITTEE",
    icon: <Shield size={18} />,
    members: [
      { name: "Event Head", role: "OVERALL COORDINATOR" },
      { name: "Co-Coordinator", role: "OPERATIONS" },
    ],
  },
  {
    team: "TECHNICAL",
    icon: <Code size={18} />,
    members: [
      { name: "Tech Lead", role: "HACKATHON & PLATFORM" },
      { name: "Dev Lead", role: "WEBSITE & SYSTEMS" },
    ],
  },
  {
    team: "CREATIVE",
    icon: <Palette size={18} />,
    members: [
      { name: "Design Lead", role: "BRANDING & VISUALS" },
      { name: "Content Lead", role: "SOCIAL & CONTENT" },
    ],
  },
  {
    team: "PR & OUTREACH",
    icon: <Megaphone size={18} />,
    members: [
      { name: "PR Lead", role: "SPONSORSHIPS" },
      { name: "Outreach Lead", role: "PROMOTIONS" },
    ],
  },
  {
    team: "LOGISTICS",
    icon: <Cog size={18} />,
    members: [
      { name: "Logistics Head", role: "VENUE & SETUP" },
      { name: "Volunteer Head", role: "VOLUNTEER MGMT" },
    ],
  },
];

export default function TechnomaniaTeamsPage() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-20 pt-28 md:px-6 md:pb-28 md:pt-36">
      <Link href="/technomania" className="inline-flex items-center gap-2 text-tm-dim hover:text-white transition text-xs font-tm-mono tracking-wider mb-6">
        <ArrowLeft size={14} /> BACK TO TECHNOMANIA HOME
      </Link>

      <div className="flex items-center gap-3 mb-2">
        <div className="tm-hazard-stripe-accent w-8" />
        <span className="tm-label">CREW</span>
      </div>
      <h1 className="font-tm-heading text-4xl md:text-6xl lg:text-7xl font-black tracking-[-0.04em]">
        THE<br />
        <span className="text-tm-muted">TEAM.</span>
      </h1>
      <p className="mt-4 text-tm-muted text-sm md:text-base max-w-2xl leading-7">
        The minds behind Technomania 3.0. Organized by Tech Tatva — Chandigarh University&apos;s premier technical club.
      </p>

      {/* Tech Tatva badge */}
      <div className="tm-card inline-flex items-center gap-3 px-4 py-3 mt-6">
        <Zap size={16} className="text-tm-accent" />
        <div>
          <p className="font-tm-heading text-sm font-bold tracking-wide">TECH TATVA</p>
          <p className="text-tm-dim text-[10px] font-tm-mono">CHANDIGARH UNIVERSITY</p>
        </div>
      </div>

      {/* Teams grid */}
      <div className="mt-10 space-y-6">
        {organizers.map((dept) => (
          <div key={dept.team} className="tm-card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-tm-accent">{dept.icon}</span>
              <h2 className="font-tm-heading text-lg font-bold tracking-wide">{dept.team}</h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {dept.members.map((member) => (
                <div key={member.name} className="border border-tm-border rounded-lg p-4 bg-tm-bg hover:border-tm-dim transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-tm-surface border border-tm-border flex items-center justify-center">
                      <Users size={16} className="text-tm-dim" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{member.name}</p>
                      <p className="font-tm-mono text-[10px] text-tm-dim tracking-wider">{member.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Note */}
      <div className="mt-8 tm-card p-5 flex items-start gap-3">
        <span className="font-tm-mono text-tm-accent text-sm mt-0.5">*</span>
        <p className="text-tm-dim text-xs leading-5 font-tm-mono">
          TEAM DETAILS WILL BE UPDATED CLOSER TO THE EVENT. PLACEHOLDER NAMES ARE SHOWN ABOVE — REPLACE WITH ACTUAL TEAM MEMBER NAMES.
        </p>
      </div>
    </section>
  );
}
