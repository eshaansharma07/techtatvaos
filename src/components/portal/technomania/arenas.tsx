"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Plus, Edit2, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function TechnomaniaArenas() {
  const [arenas, setArenas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "", slug: "", category: "DeepTech & AI", description: "", capacity: 0,
    teamSize: { min: 1, max: 1 }, prizePool: "", rounds: "", status: "upcoming", isPublished: true
  });

  const fetchArenas = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/arenas");
    const data = await res.json();
    setArenas(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchArenas();
  }, []);

  const handleOpenNew = () => {
    setFormData({
      title: "", slug: "", category: "DeepTech & AI", description: "", capacity: 0,
      teamSize: { min: 1, max: 1 }, prizePool: "", rounds: "", status: "upcoming", isPublished: true
    });
    setEditingId(null);
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (arena: any) => {
    setFormData({
      title: arena.title, slug: arena.slug, category: arena.category, description: arena.description,
      capacity: arena.capacity, teamSize: arena.teamSize, prizePool: arena.prizePool,
      rounds: arena.rounds.join(", "), status: arena.status, isPublished: arena.isPublished
    });
    setEditingId(arena._id);
    setIsDrawerOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this arena?")) return;
    await fetch(`/api/admin/arenas/${id}`, { method: "DELETE" });
    fetchArenas();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      rounds: formData.rounds.split(",").map(r => r.trim()).filter(Boolean)
    };
    
    if (editingId) {
      await fetch(`/api/admin/arenas/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } else {
      await fetch("/api/admin/arenas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    }
    
    setIsDrawerOpen(false);
    fetchArenas();
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tight">Arenas</h2>
          <p className="text-sm text-zinc-500 font-mono tracking-widest uppercase mt-1">Manage Fest Competitions</p>
        </div>
        <button onClick={handleOpenNew} className="flex items-center gap-2 px-4 py-2 bg-white text-black font-bold tracking-widest text-xs uppercase rounded">
          <Plus size={16} /> Add Arena
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-zinc-500" size={32} /></div>
      ) : (
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm font-mono">
            <thead className="bg-zinc-900 text-zinc-500 tracking-widest uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Reg/Cap</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {arenas.map(arena => (
                <tr key={arena._id} className="hover:bg-zinc-900/50">
                  <td className="px-6 py-4 text-white font-bold">{arena.title}</td>
                  <td className="px-6 py-4 text-zinc-400">{arena.category}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-[10px] rounded uppercase ${
                      arena.status === "active" ? "bg-green-500/20 text-green-500" :
                      arena.status === "closed" ? "bg-red-500/20 text-red-500" : "bg-zinc-800 text-zinc-400"
                    }`}>
                      {arena.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-400">{arena.registeredCount} / {arena.capacity || "∞"}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-3">
                    <button onClick={() => handleOpenEdit(arena)} className="text-zinc-500 hover:text-white"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(arena._id)} className="text-zinc-500 hover:text-red-500"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDrawerOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed top-0 right-0 bottom-0 w-full max-w-lg bg-zinc-950 border-l border-zinc-900 z-50 p-6 md:p-8 overflow-y-auto">
              <button onClick={() => setIsDrawerOpen(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-white"><X size={24} /></button>
              
              <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-8">
                {editingId ? "Edit Arena" : "Add Arena"}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-5 font-mono text-sm">
                <div>
                  <label className="block text-zinc-500 tracking-widest uppercase text-xs mb-2">Title</label>
                  <input required type="text" className="w-full bg-black border border-zinc-800 rounded p-3 text-white" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
                <div>
                  <label className="block text-zinc-500 tracking-widest uppercase text-xs mb-2">Slug</label>
                  <input required type="text" className="w-full bg-black border border-zinc-800 rounded p-3 text-white" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} />
                </div>
                <div>
                  <label className="block text-zinc-500 tracking-widest uppercase text-xs mb-2">Category</label>
                  <select className="w-full bg-black border border-zinc-800 rounded p-3 text-white" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option>DeepTech & AI</option>
                    <option>Hardware & Speed</option>
                    <option>Gaming & Community</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-500 tracking-widest uppercase text-xs mb-2">Description</label>
                  <textarea className="w-full bg-black border border-zinc-800 rounded p-3 text-white h-24" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-500 tracking-widest uppercase text-xs mb-2">Capacity</label>
                    <input type="number" className="w-full bg-black border border-zinc-800 rounded p-3 text-white" value={formData.capacity} onChange={e => setFormData({...formData, capacity: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-zinc-500 tracking-widest uppercase text-xs mb-2">Prize Pool</label>
                    <input type="text" className="w-full bg-black border border-zinc-800 rounded p-3 text-white" value={formData.prizePool} onChange={e => setFormData({...formData, prizePool: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-500 tracking-widest uppercase text-xs mb-2">Min Team</label>
                    <input type="number" className="w-full bg-black border border-zinc-800 rounded p-3 text-white" value={formData.teamSize.min} onChange={e => setFormData({...formData, teamSize: { ...formData.teamSize, min: Number(e.target.value) }})} />
                  </div>
                  <div>
                    <label className="block text-zinc-500 tracking-widest uppercase text-xs mb-2">Max Team</label>
                    <input type="number" className="w-full bg-black border border-zinc-800 rounded p-3 text-white" value={formData.teamSize.max} onChange={e => setFormData({...formData, teamSize: { ...formData.teamSize, max: Number(e.target.value) }})} />
                  </div>
                </div>
                <div>
                  <label className="block text-zinc-500 tracking-widest uppercase text-xs mb-2">Rounds (Comma separated)</label>
                  <input type="text" className="w-full bg-black border border-zinc-800 rounded p-3 text-white" value={formData.rounds} onChange={e => setFormData({...formData, rounds: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-500 tracking-widest uppercase text-xs mb-2">Status</label>
                    <select className="w-full bg-black border border-zinc-800 rounded p-3 text-white" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                      <option value="upcoming">Upcoming</option>
                      <option value="active">Active</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <input type="checkbox" checked={formData.isPublished} onChange={e => setFormData({...formData, isPublished: e.target.checked})} />
                    <span className="text-zinc-400">Published</span>
                  </div>
                </div>
                
                <div className="pt-6">
                  <button type="submit" className="w-full bg-white text-black font-bold tracking-widest py-4 uppercase rounded hover:bg-zinc-200 transition-colors">
                    Save Arena
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
