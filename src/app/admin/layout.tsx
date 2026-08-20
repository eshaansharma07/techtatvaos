import React from "react";
import Link from "next/link";
import { LayoutDashboard, Users, Trophy, Radio, Settings, ShieldAlert } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const navItems = [
    { label: "Overview", icon: <LayoutDashboard size={18} />, href: "/admin" },
    { label: "Arenas", icon: <ShieldAlert size={18} />, href: "/admin/arenas" },
    { label: "Registrations", icon: <Users size={18} />, href: "/admin/registrations" },
    { label: "Leaderboard", icon: <Trophy size={18} />, href: "/admin/leaderboard" },
    { label: "Broadcasts", icon: <Radio size={18} />, href: "/admin/broadcasts" },
    { label: "Settings", icon: <Settings size={18} />, href: "/admin/config" },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row font-mono">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-zinc-950 border-r border-zinc-900 flex flex-col">
        <div className="p-6 border-b border-zinc-900">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center font-black">
              TM
            </div>
            <div>
              <h1 className="font-bold tracking-widest text-sm uppercase">Command Center</h1>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Admin Portal</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 text-sm text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-all"
            >
              {item.icon}
              <span className="tracking-widest uppercase">{item.label}</span>
            </Link>
          ))}
        </nav>
        
        <div className="p-4 border-t border-zinc-900">
          <Link href="/technomania" className="block w-full py-2 text-center text-xs text-zinc-500 hover:text-white border border-zinc-800 hover:bg-zinc-900 transition-all rounded uppercase tracking-widest">
            Exit to Fest
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
