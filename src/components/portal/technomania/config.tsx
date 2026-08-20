"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Settings, Save } from "lucide-react";

export function TechnomaniaConfig() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/config").then(res => res.json()).then(data => {
      setConfig(data || { festDays: 3, registrationOpen: true });
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/admin/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ festDays: config.festDays, registrationOpen: config.registrationOpen })
    });
    setSaving(false);
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-zinc-500" size={32} /></div>;
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-3xl font-black text-white uppercase tracking-tight">Settings</h2>
        <p className="text-sm text-zinc-500 font-mono tracking-widest uppercase mt-1">Global Fest Configuration</p>
      </div>

      <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 md:p-8 space-y-6">
        <div className="space-y-6 font-mono text-sm">
          <div>
            <label className="block text-zinc-500 tracking-widest uppercase text-xs mb-2">Fest Days</label>
            <input 
              type="number" 
              className="w-full bg-black border border-zinc-800 rounded p-3 text-white" 
              value={config.festDays} 
              onChange={e => setConfig({...config, festDays: Number(e.target.value)})} 
            />
          </div>
          
          <div className="flex items-center gap-4 pt-4 border-t border-zinc-900">
            <input 
              type="checkbox" 
              className="w-5 h-5 accent-white"
              checked={config.registrationOpen} 
              onChange={e => setConfig({...config, registrationOpen: e.target.checked})} 
            />
            <span className="text-white font-bold tracking-widest uppercase">Global Registrations Open</span>
          </div>
        </div>

        <div className="pt-6 border-t border-zinc-900">
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-white text-black font-bold tracking-widest py-4 uppercase rounded hover:bg-zinc-200 transition-colors"
          >
            {saving ? <Loader2 size={20} className="animate-spin" /> : <><Save size={20} /> Save Configuration</>}
          </button>
        </div>
      </div>
    </div>
  );
}
