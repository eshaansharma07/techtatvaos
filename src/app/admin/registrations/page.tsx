"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Download, CheckCircle, XCircle } from "lucide-react";
import * as XLSX from "xlsx";

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchRegistrations = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/registrations");
    const data = await res.json();
    setRegistrations(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const toggleStatus = async (id: string, field: "paymentStatus" | "attended", currentValue: any) => {
    let newValue;
    if (field === "paymentStatus") {
      newValue = currentValue === "pending" ? "verified" : "pending";
    } else {
      newValue = !currentValue;
    }

    await fetch(`/api/admin/registrations/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: newValue })
    });
    fetchRegistrations();
  };

  const exportExcel = () => {
    const wsData = registrations.map(reg => ({
      "Registration ID": reg.registrationId,
      "Arena": reg.arenaId?.title || "Unknown",
      "Team Name": reg.teamName || "Individual",
      "Leader Name": reg.leader.name,
      "Leader Email": reg.leader.email,
      "Leader UID": reg.leader.uid,
      "Members Count": reg.members.length,
      "Sub Category": reg.subCategory || "N/A",
      "Payment": reg.paymentStatus,
      "Attended": reg.attended ? "Yes" : "No",
      "Date": new Date(reg.createdAt).toLocaleDateString()
    }));

    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Registrations");
    XLSX.writeFile(wb, "Technomania_Registrations.xlsx");
  };

  const filtered = registrations.filter(r => {
    if (filter === "all") return true;
    if (filter === "pending_payment") return r.paymentStatus === "pending";
    if (filter === "verified_payment") return r.paymentStatus === "verified";
    if (filter === "attended") return r.attended;
    return true;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tight">Squads & Regs</h2>
          <p className="text-sm text-zinc-500 font-mono tracking-widest uppercase mt-1">Manage Participants</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 text-zinc-300 font-mono text-sm px-4 py-2 rounded"
          >
            <option value="all">All Registrations</option>
            <option value="pending_payment">Pending Payment</option>
            <option value="verified_payment">Verified Payment</option>
            <option value="attended">Attended</option>
          </select>
          <button onClick={exportExcel} className="flex items-center gap-2 px-4 py-2 bg-white text-black font-bold tracking-widest text-xs uppercase rounded whitespace-nowrap">
            <Download size={16} /> Export (Excel)
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-zinc-500" size={32} /></div>
      ) : (
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-left text-sm font-mono whitespace-nowrap">
            <thead className="bg-zinc-900 text-zinc-500 tracking-widest uppercase text-xs">
              <tr>
                <th className="px-4 py-4">Reg ID</th>
                <th className="px-4 py-4">Arena</th>
                <th className="px-4 py-4">Team / Leader</th>
                <th className="px-4 py-4">Payment</th>
                <th className="px-4 py-4 text-center">Attended</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {filtered.map(reg => (
                <tr key={reg._id} className="hover:bg-zinc-900/50">
                  <td className="px-4 py-4 text-zinc-400 text-xs">{reg.registrationId}</td>
                  <td className="px-4 py-4 font-bold text-white">{reg.arenaId?.title || "Unknown"}</td>
                  <td className="px-4 py-4">
                    <div className="text-white font-bold">{reg.teamName || "Individual"}</div>
                    <div className="text-zinc-500 text-xs">{reg.leader.name} ({reg.leader.uid})</div>
                  </td>
                  <td className="px-4 py-4">
                    <button 
                      onClick={() => toggleStatus(reg._id, "paymentStatus", reg.paymentStatus)}
                      className={`px-3 py-1 rounded text-xs font-bold uppercase ${reg.paymentStatus === "verified" ? "bg-green-500/20 text-green-500" : "bg-yellow-500/20 text-yellow-500"}`}
                    >
                      {reg.paymentStatus}
                    </button>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button 
                      onClick={() => toggleStatus(reg._id, "attended", reg.attended)}
                      className="text-zinc-500 hover:text-white transition-colors"
                    >
                      {reg.attended ? <CheckCircle size={20} className="text-green-500" /> : <XCircle size={20} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
             <div className="p-8 text-center text-zinc-500 font-mono tracking-widest text-sm uppercase">No registrations found</div>
          )}
        </div>
      )}
    </div>
  );
}
