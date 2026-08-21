"use client";

import React, { useState, useMemo } from "react";
import { Plus, Users, Search, Activity, Zap, Calendar, Trophy, FileText, CheckCircle, ExternalLink, Settings, Radio, X } from "lucide-react";

export function TechnomaniaAdminPortal({ data, openDrawer, setPanel, refresh, patch, remove }: { data: any, openDrawer: any, setPanel: any, refresh?: any, patch?: any, remove?: any }) {
  const [subTab, setSubTab] = useState<"overview" | "events" | "squads" | "ticker" | "settings">("overview");
  const [selectedReg, setSelectedReg] = useState<any>(null);

  const tmEvents = useMemo(() => {
    return (data.events || []).filter((e: any) => e.fest === "technomania" || e.category === "DeepTech & AI" || e.category === "Hardware & Speed" || e.category === "Gaming & Community");
  }, [data.events]);

  const tmRegistrations = useMemo(() => {
    const tmEventIds = new Set(tmEvents.map((e: any) => e._id || e.id));
    return (data.registrations || []).filter((r: any) => tmEventIds.has(r.event?._id || r.event));
  }, [data.registrations, tmEvents]);

  const totalMembers = useMemo(() => {
    let count = 0;
    tmRegistrations.forEach((r: any) => {
      count += 1;
      if (r.teamMembers && Array.isArray(r.teamMembers)) count += r.teamMembers.length;
    });
    return count;
  }, [tmRegistrations]);

  const totalSquads = tmRegistrations.filter((r: any) => r.teamName).length;
  const liveArenasCount = tmEvents.filter((e: any) => e.status === "active" || e.status === "published").length;

  const handleCreateArena = () => {
    openDrawer({
      resource: "events",
      title: "Add Technomania Event",
      fields: [
        { key: "title", label: "Event Title", type: "text", required: true },
        { key: "slug", label: "URL Slug", type: "text", required: true },
        { key: "category", label: "Category", type: "select", options: ["DeepTech & AI", "Hardware & Speed", "Gaming & Community", "Other"] },
        { key: "description", label: "Description", type: "textarea" },
        { key: "banner", label: "Banner Image URL", type: "text" },
        { key: "fest", label: "Fest Label", type: "text" },
        { key: "capacity", label: "Capacity", type: "number" },
        { key: "participationMode", label: "Mode", type: "select", options: ["individual", "team", "both"] },
        { key: "maxTeamSize", label: "Max Team Size", type: "number" },
        { key: "status", label: "Status", type: "select", options: ["draft", "published", "active", "completed", "archived"] },
        { key: "registrationOpen", label: "Registration Open", type: "select", options: ["true", "false"] }
      ],
      defaults: { status: "published", registrationOpen: "true", fest: "technomania" }
    });
  };

  const tabs = [
    { id: "overview", label: "Command Center", icon: Activity },
    { id: "events", label: "Arenas & Events", icon: Calendar, badge: tmEvents.length },
    { id: "squads", label: "Squads & Regs", icon: Users, badge: tmRegistrations.length },
    { id: "ticker", label: "Broadcasts", icon: Radio },
    { id: "settings", label: "Fest Config", icon: Settings }
  ];

  return (
    <div className="w-full space-y-6">
      {/* Navigation */}
      <div className="p-3 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md overflow-x-auto custom-scrollbar">
        <div className="flex items-center gap-2 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = subTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSubTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wider uppercase whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600/40 via-cyan-500/30 to-blue-600/40 border border-cyan-400 text-white shadow-[0_0_20px_rgba(56,189,248,0.4)]"
                    : "border border-transparent text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon size={14} className={isActive ? "text-cyan-400" : "text-white/40"} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${isActive ? "bg-cyan-400 text-black font-bold" : "bg-white/10 text-white/60"}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      {subTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "REGISTERED SQUADS", value: totalSquads, icon: Users, color: "text-blue-400" },
              { label: "TOTAL BUILDERS / PLAYERS", value: totalMembers, icon: Zap, color: "text-cyan-400" },
              { label: "ACTIVE FEST ARENAS", value: liveArenasCount, icon: Calendar, color: "text-purple-400" },
              { label: "TOTAL REGISTRATIONS", value: tmRegistrations.length, icon: FileText, color: "text-amber-400" },
            ].map((card, i) => (
              <div key={i} className="p-6 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-xl relative overflow-hidden group">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-mono text-white/50 tracking-widest uppercase">{card.label}</span>
                  <card.icon size={18} className={card.color} />
                </div>
                <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">{card.value}</p>
              </div>
            ))}
          </div>
          <div className="p-6 rounded-3xl bg-black/60 border border-white/10 backdrop-blur-xl">
            <h3 className="font-bold text-white uppercase tracking-wider mb-4">Action Panel</h3>
            <p className="text-xs text-white/50">Technomania 3.0 loaded from main MongoDB Event schema. All changes apply globally.</p>
          </div>
        </div>
      )}

      {subTab === "events" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white uppercase tracking-wider">Technomania Arenas</h3>
              <p className="text-xs text-white/50 font-mono">Manage fest events. Uses the standard Event editor for full features.</p>
            </div>
            <button onClick={handleCreateArena} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono text-xs font-bold transition-all">
              <Plus size={15} />
              <span>ADD NEW ARENA</span>
            </button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tmEvents.map((evt: any) => {
              const count = tmRegistrations.filter((r: any) => String(r.event?._id || r.event) === String(evt._id)).length;
              return (
                <div key={evt._id} className="p-6 rounded-2xl bg-black/60 border border-white/10 flex flex-col justify-between space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">{evt.category || "ARENA"}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${evt.status === "active" || evt.status === "published" ? "bg-green-500/20 text-green-400" : "bg-white/10 text-white/40"}`}>{evt.status}</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">{evt.title}</h4>
                    <p className="text-xs text-white/50 mt-1 line-clamp-2">{evt.description}</p>
                  </div>
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                    <span className="text-white/60">Registrations:</span>
                    <span className="text-white font-bold">{count} {evt.capacity ? `/ ${evt.capacity}` : ""}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {subTab === "squads" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white uppercase tracking-wider">Squads & Registrations</h3>
            <p className="text-xs text-white/50 font-mono">{tmRegistrations.length} Total</p>
          </div>
          <div className="bg-black/60 border border-white/10 rounded-2xl overflow-hidden overflow-x-auto">
            <table className="w-full text-left text-sm font-mono whitespace-nowrap">
              <thead className="bg-white/5 text-white/40 text-[10px] uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">Squad / Leader</th>
                  <th className="px-6 py-4">Event</th>
                  <th className="px-6 py-4">Members</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tmRegistrations.slice(0, 50).map((reg: any) => (
                  <tr 
                    key={reg._id} 
                    className="hover:bg-white/[0.05] cursor-pointer transition-colors"
                    onClick={() => setSelectedReg(reg)}
                  >
                    <td className="px-6 py-4">
                      <p className="text-white font-bold">{reg.teamName || reg.user?.name}</p>
                      <p className="text-[10px] text-white/40">{reg.user?.uid} • {reg.user?.email}</p>
                    </td>
                    <td className="px-6 py-4 text-cyan-400 text-xs">{(reg.event?.title || "Unknown Event").replace("[FEST] ", "")}</td>
                    <td className="px-6 py-4 text-white/60 text-xs">{reg.teamMembers?.length ? `${reg.teamMembers.length + 1} Size` : "Solo"}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-[10px] uppercase">{reg.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Squad Dossier Modal */}
          {selectedReg && (
            <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="w-full max-w-2xl rounded-3xl bg-[#0d1322] border border-cyan-500/40 p-6 sm:p-8 shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">SQUAD DOSSIER</span>
                    <h3 className="font-tm-heading text-2xl font-bold text-white mt-0.5">
                      {selectedReg.teamName || selectedReg.user?.name}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedReg(null)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <div>Arena: <span className="text-white font-bold block mt-1">{selectedReg.event?.title}</span></div>
                  <div>Status: <span className="text-green-400 font-bold uppercase block mt-1">{selectedReg.status}</span></div>
                  <div>Registered: <span className="text-white block mt-1">{new Date(selectedReg.registeredAt).toLocaleString()}</span></div>
                  <div>Mode: <span className="text-white uppercase block mt-1">{selectedReg.mode}</span></div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-mono text-xs text-white/60 uppercase tracking-wider">Squad Members Roster</h4>
                  
                  {/* Leader */}
                  <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-blue-500/30 text-blue-300 uppercase">
                          Squad Leader
                        </span>
                        <div className="font-bold text-white text-base mt-2">{selectedReg.user?.name}</div>
                        <div className="text-xs text-white/60 font-mono mt-1">{selectedReg.user?.email} · {selectedReg.user?.phone || "N/A"}</div>
                      </div>
                      <div className="text-right font-mono text-xs">
                        <div className="text-white font-bold">{selectedReg.user?.uid}</div>
                        <div className="text-white/40 mt-1">{selectedReg.user?.program || "N/A"}</div>
                      </div>
                    </div>
                    {selectedReg.customFields && Object.keys(selectedReg.customFields).length > 0 && (
                      <div className="mt-4 pt-3 border-t border-blue-500/20 grid grid-cols-2 gap-3 text-[11px] font-mono">
                        {Object.entries(selectedReg.customFields).map(([k, v]) => (
                          <div key={k}><span className="text-blue-200/50 uppercase">{k}:</span> <span className="text-blue-100">{String(v)}</span></div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Additional Squad Members */}
                  {Array.isArray(selectedReg.teamMembers) && selectedReg.teamMembers.map((m: any, idx: number) => {
                    const u = m.user || m;
                    return (
                      <div key={idx} className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-white/10 text-white/60 uppercase">
                              Member #{idx + 2}
                            </span>
                            <div className="font-bold text-white text-base mt-2">{u.name || m.name}</div>
                            <div className="text-xs text-white/60 font-mono mt-1">{u.email || m.email} · {u.phone || m.phone || "N/A"}</div>
                          </div>
                          <div className="text-right font-mono text-xs">
                            <div className="text-white font-bold">{u.uid || m.uid}</div>
                            <div className="text-white/40 mt-1">{u.program || m.program || "N/A"}</div>
                          </div>
                        </div>
                        {m.customFields && Object.keys(m.customFields).length > 0 && (
                          <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-2 gap-3 text-[11px] font-mono">
                            {Object.entries(m.customFields).map(([k, v]) => (
                              <div key={k}><span className="text-white/30 uppercase">{k}:</span> <span className="text-white/80">{String(v)}</span></div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-4">
                  <button onClick={() => setSelectedReg(null)} className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition">
                    Close Dossier
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {subTab === "ticker" && (
        <div className="p-6 rounded-3xl bg-black/60 border border-white/10 space-y-4">
          <h3 className="text-xl font-bold text-white uppercase tracking-wider">Broadcasts & Ticker</h3>
          <p className="text-xs text-white/50 font-mono">Use the Fest Config to modify the ticker text.</p>
        </div>
      )}

      {subTab === "settings" && (
        <div className="p-8 rounded-3xl bg-black/60 border border-white/10 space-y-6">
          <h3 className="text-xl font-bold text-white uppercase tracking-wider">Fest Configuration</h3>
          <p className="text-xs text-white/50 font-mono">Use the global Settings tab to manage global features, and Events tab for event-level configuration.</p>
        </div>
      )}
    </div>
  );
}
