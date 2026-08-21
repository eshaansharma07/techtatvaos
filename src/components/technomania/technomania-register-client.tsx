"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, User, Users, AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export function TechnomaniaRegisterClient({ events }: { events: any[] }) {
  const [selectedEventId, setSelectedEventId] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [teamName, setTeamName] = useState("");
  const [leader, setLeader] = useState({ name: "", email: "", uid: "", gameId: "", inGameName: "" });
  const [members, setMembers] = useState([{ name: "", email: "", uid: "", gameId: "", inGameName: "" }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ticketId, setTicketId] = useState("");
  const [whatsappLink, setWhatsappLink] = useState("");

  const selectedEvent = events.find(e => e.id === selectedEventId || e.slug === selectedEventId);

  // If no teamSize object is provided, assume min:1, max:1
  const minSize = selectedEvent?.teamSize?.min || 1;
  const maxSize = selectedEvent?.teamSize?.max || 1;
  const requiresTeam = maxSize > 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) {
      setError("Please select an event.");
      return;
    }
    if (requiresTeam && members.length < minSize - 1) {
      setError(`This event requires a minimum of ${minSize} team members (Leader + ${minSize - 1} members).`);
      return;
    }
    if (requiresTeam && !teamName) {
      setError("Team name is required.");
      return;
    }
    if (!leader.name || !leader.email || !leader.uid) {
      setError("Leader details are required.");
      return;
    }

    setLoading(true);
    setError("");

    const payload = {
      mode: requiresTeam ? "team" : "individual",
      teamName: requiresTeam ? teamName : undefined,
      name: leader.name,
      email: leader.email,
      uid: leader.uid,
      program: "N/A",
      semester: 1,
      customFields: leader.gameId || subCategory ? { gameId: leader.gameId, inGameName: leader.inGameName, subCategory } : undefined,
      members: requiresTeam ? members.map(m => ({
        name: m.name,
        email: m.email,
        uid: m.uid,
        program: "N/A",
        semester: 1,
        customFields: m.gameId ? { gameId: m.gameId, inGameName: m.inGameName } : undefined
      })) : [],
    };

    try {
      const res = await fetch(`/api/events/${selectedEvent.id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to register");
      }
      
      setTicketId(data.id || data.registrationId);
      if (data.whatsappGroupLink) setWhatsappLink(data.whatsappGroupLink);
    } catch (err: any) {
      setError(err.message || "An error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  const addMember = () => {
    if (members.length < maxSize - 1) {
      setMembers([...members, { name: "", email: "", uid: "", gameId: "", inGameName: "" }]);
    }
  };

  const removeMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  if (ticketId) {
    return (
      <div className="tm-card p-10 md:p-14 text-center max-w-2xl mx-auto space-y-8 relative overflow-hidden tm-glow">
        <div className="absolute top-0 inset-x-0 h-2 tm-hazard-stripe opacity-50" />
        <div className="mx-auto w-20 h-20 rounded-full border border-green-500 bg-green-500/10 flex items-center justify-center text-green-500 mb-6">
          <Check size={40} />
        </div>
        <h3 className="font-tm-heading text-4xl font-black text-white uppercase tracking-tight">Registration Confirmed</h3>
        
        <div className="p-8 bg-black border border-tm-border rounded-2xl inline-block mx-auto">
          <QRCodeSVG value={ticketId} size={180} fgColor="#ffffff" bgColor="#000000" />
        </div>
        
        <div>
          <p className="font-tm-mono text-sm text-tm-muted uppercase tracking-widest mb-1">TICKET ID</p>
          <p className="font-tm-mono text-2xl font-bold text-white">{ticketId}</p>
        </div>
        
        <div className="pt-6 border-t border-tm-border/50 text-sm font-tm-mono text-tm-muted text-left space-y-2">
          <p><span className="text-white">EVENT:</span> {selectedEvent?.title}</p>
          {subCategory && <p><span className="text-white">CATEGORY:</span> {subCategory}</p>}
          {requiresTeam && <p><span className="text-white">TEAM:</span> {teamName}</p>}
          <p><span className="text-white">LEADER:</span> {leader.name} ({leader.uid})</p>
        </div>
        
        {whatsappLink && (
          <div className="pt-6 border-t border-tm-border/50 flex flex-col items-center gap-4">
            <p className="text-xs font-tm-mono text-tm-muted uppercase">Join the official WhatsApp group for updates</p>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="bg-[#25D366] hover:bg-[#20bd5a] text-black font-bold tracking-widest text-sm py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all w-full max-w-sm">
              JOIN WHATSAPP GROUP
            </a>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto tm-card p-8 bg-tm-surface/30 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Event Selection */}
        <div className="space-y-3">
          <label className="text-xs font-tm-mono tracking-widest text-tm-dim uppercase">Select Arena / Event</label>
          <select 
            className="w-full bg-black border border-tm-border rounded-xl p-4 text-white font-tm-heading font-bold outline-none focus:border-white transition-colors appearance-none"
            value={selectedEventId}
            onChange={(e) => {
              setSelectedEventId(e.target.value);
              setMembers([{ name: "", email: "", uid: "", gameId: "", inGameName: "" }]);
              setSubCategory("");
            }}
          >
            <option value="">-- CHOOSE EVENT --</option>
            {events.map(e => (
              <option key={e.slug || e.id} value={e.slug || e.id}>{e.title}</option>
            ))}
          </select>
        </div>

        {selectedEvent && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="space-y-8"
          >
            {/* BattleGrid Subcategory */}
            {selectedEvent.slug === "battlegrid" && (
              <div className="space-y-3">
                <label className="text-xs font-tm-mono tracking-widest text-tm-dim uppercase">Select Title</label>
                <select 
                  className="w-full bg-black border border-tm-border rounded-xl p-4 text-white font-tm-mono outline-none focus:border-white transition-colors appearance-none"
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  required
                >
                  <option value="">-- CHOOSE TITLE --</option>
                  <option value="BGMI">BGMI</option>
                  <option value="VALORANT">VALORANT</option>
                  <option value="CLASH ROYALE">CLASH ROYALE</option>
                </select>
              </div>
            )}

            {/* Team Details */}
            {requiresTeam && (
              <div className="space-y-3">
                <label className="text-xs font-tm-mono tracking-widest text-tm-dim uppercase">Team Name</label>
                <input 
                  type="text"
                  placeholder="Enter Squad Name"
                  required
                  className="w-full bg-black border border-tm-border rounded-xl p-4 text-white font-tm-mono outline-none focus:border-white transition-colors"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                />
              </div>
            )}

            {/* Leader Details */}
            <div className="space-y-4">
              <h4 className="text-sm font-tm-mono tracking-widest text-white uppercase border-b border-tm-border pb-2">
                {requiresTeam ? "Leader Details" : "Participant Details"}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input type="text" placeholder="Full Name" required className="bg-black border border-tm-border rounded-xl p-3 text-sm text-white font-tm-mono outline-none focus:border-white" value={leader.name} onChange={e => setLeader({...leader, name: e.target.value})} />
                <input type="email" placeholder="Email Address" required className="bg-black border border-tm-border rounded-xl p-3 text-sm text-white font-tm-mono outline-none focus:border-white" value={leader.email} onChange={e => setLeader({...leader, email: e.target.value})} />
                <input type="text" placeholder="University UID" required className="bg-black border border-tm-border rounded-xl p-3 text-sm text-white font-tm-mono outline-none focus:border-white" value={leader.uid} onChange={e => setLeader({...leader, uid: e.target.value})} />
              </div>
              {selectedEvent.slug === "battlegrid" && subCategory && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <input type="text" placeholder={subCategory === "VALORANT" ? "Riot ID" : subCategory === "CLASH ROYALE" ? "Player Tag" : "Player ID"} required className="bg-black border border-tm-border rounded-xl p-3 text-sm text-white font-tm-mono outline-none focus:border-white" value={(leader as any).gameId || ""} onChange={e => setLeader({...leader, gameId: e.target.value} as any)} />
                  <input type="text" placeholder="In-Game Name (IGN)" required className="bg-black border border-tm-border rounded-xl p-3 text-sm text-white font-tm-mono outline-none focus:border-white" value={(leader as any).inGameName || ""} onChange={e => setLeader({...leader, inGameName: e.target.value} as any)} />
                </div>
              )}
            </div>

            {/* Additional Members */}
            {requiresTeam && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-tm-border pb-2">
                  <h4 className="text-sm font-tm-mono tracking-widest text-white uppercase">
                    Squad Members ({members.length + 1}/{maxSize})
                  </h4>
                  {members.length < maxSize - 1 && (
                    <button type="button" onClick={addMember} className="text-xs font-tm-mono text-tm-dim hover:text-white transition-colors">+ ADD MEMBER</button>
                  )}
                </div>
                
                <AnimatePresence>
                  {members.map((m, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="grid grid-cols-1 md:grid-cols-4 gap-4 relative"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full md:col-span-4">
<input type="text" placeholder="Full Name" required className="bg-black border border-tm-border rounded-xl p-3 text-sm text-white font-tm-mono outline-none focus:border-white" value={m.name} onChange={e => { const newM = [...members]; newM[i].name = e.target.value; setMembers(newM); }} />
                      <input type="email" placeholder="Email Address" required className="col-span-1 md:col-span-2 bg-black border border-tm-border rounded-xl p-3 text-sm text-white font-tm-mono outline-none focus:border-white" value={m.email} onChange={e => { const newM = [...members]; newM[i].email = e.target.value; setMembers(newM); }} />
                      <div className="flex gap-2">
                        <input type="text" placeholder="UID" required className="flex-1 bg-black border border-tm-border rounded-xl p-3 text-sm text-white font-tm-mono outline-none focus:border-white" value={m.uid} onChange={e => { const newM = [...members]; newM[i].uid = e.target.value; setMembers(newM); }} />
                        {true && (
                          <button type="button" onClick={() => removeMember(i)} className="w-12 flex items-center justify-center text-tm-dim hover:text-red-500 transition-colors bg-black border border-tm-border rounded-xl">
                            <AlertCircle size={16} />
                          </button>
                        )}
                      </div>
</div>
                      {selectedEvent.slug === "battlegrid" && subCategory && (
                        <div className="col-span-1 md:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input type="text" placeholder={subCategory === "VALORANT" ? "Riot ID" : subCategory === "CLASH ROYALE" ? "Player Tag" : "Player ID"} required className="bg-black border border-tm-border rounded-xl p-3 text-sm text-white font-tm-mono outline-none focus:border-white" value={(m as any).gameId || ""} onChange={e => { const newM: any = [...members]; newM[i].gameId = e.target.value; setMembers(newM); }} />
                          <input type="text" placeholder="In-Game Name (IGN)" required className="bg-black border border-tm-border rounded-xl p-3 text-sm text-white font-tm-mono outline-none focus:border-white" value={(m as any).inGameName || ""} onChange={e => { const newM: any = [...members]; newM[i].inGameName = e.target.value; setMembers(newM); }} />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-500 text-sm font-tm-mono rounded-xl flex items-center gap-2">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full bg-white hover:bg-zinc-200 text-black font-bold tracking-widest text-sm p-4 rounded-xl flex items-center justify-center gap-2 transition-all">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <>COMPILE REGISTRATION <ArrowRight size={18} /></>}
            </button>

          </motion.div>
        )}
      </form>
    </div>
  );
}
