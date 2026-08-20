"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Radio, Plus, Trash2, Save } from "lucide-react";

export default function AdminBroadcastsPage() {
  const [tickerMsgs, setTickerMsgs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/config").then(res => res.json()).then(data => {
      setTickerMsgs(data?.marqueeTicker || []);
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/admin/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ marqueeTicker: tickerMsgs.filter(m => m.trim() !== "") })
    });
    setSaving(false);
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-zinc-500" size={32} /></div>;
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-3xl font-black text-white uppercase tracking-tight">Broadcasts</h2>
        <p className="text-sm text-zinc-500 font-mono tracking-widest uppercase mt-1">Live Marquee Ticker Control</p>
      </div>

      <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-4 text-zinc-500 mb-6">
          <Radio size={24} className="text-red-500 animate-pulse" />
          <p className="text-sm font-mono uppercase tracking-widest">Live messages will instantly reflect on the client portal's marquee.</p>
        </div>

        <div className="space-y-4">
          {tickerMsgs.map((msg, idx) => (
            <div key={idx} className="flex gap-3">
              <input 
                type="text" 
                value={msg} 
                onChange={(e) => {
                  const newM = [...tickerMsgs];
                  newM[idx] = e.target.value;
                  setTickerMsgs(newM);
                }} 
                className="flex-1 bg-black border border-zinc-800 rounded p-4 text-white font-mono uppercase"
              />
              <button 
                onClick={() => setTickerMsgs(tickerMsgs.filter((_, i) => i !== idx))} 
                className="px-4 border border-zinc-800 rounded text-zinc-500 hover:text-red-500 transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>

        <button 
          onClick={() => setTickerMsgs([...tickerMsgs, ""])} 
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white font-mono uppercase tracking-widest transition-colors"
        >
          <Plus size={16} /> Add Message
        </button>

        <div className="pt-6 border-t border-zinc-900">
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-white text-black font-bold tracking-widest py-4 uppercase rounded hover:bg-zinc-200 transition-colors"
          >
            {saving ? <Loader2 size={20} className="animate-spin" /> : <><Save size={20} /> Deploy Broadcasts</>}
          </button>
        </div>
      </div>
    </div>
  );
}
