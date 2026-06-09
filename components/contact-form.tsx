"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";

export function ContactForm(){
  const [status,setStatus]=useState("");
  const [loading,setLoading]=useState(false);
  async function submit(formData:FormData){
    setLoading(true);
    setStatus("");
    const res=await fetch("/api/contact",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(Object.fromEntries(formData.entries()))});
    const data=await res.json();
    setLoading(false);
    setStatus(res.ok?"Message sent. The club team can now review it.":data.error || "Message could not be saved.");
  }
  return <form action={submit} className="grid gap-4 rounded-[2rem] border border-stone-200/80 bg-white p-5 shadow-[0_24px_70px_rgba(82,52,30,.08)] md:grid-cols-2 md:p-6">{[["name","Name"],["email","Email"],["subject","Subject"]].map(([name,label])=><label className="text-[10px] font-semibold tracking-wider text-stone-400" key={name}>{label.toUpperCase()}<input required name={name} type={name==="email"?"email":"text"} className="mt-2 min-h-12 w-full rounded-2xl border border-stone-200 bg-[#faf8f5] px-4 py-3 text-base text-stone-950 outline-none transition focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100/70 md:text-sm"/></label>)}<label className="text-[10px] font-semibold tracking-wider text-stone-400 md:col-span-2">MESSAGE<textarea required name="message" rows={6} className="mt-2 w-full rounded-2xl border border-stone-200 bg-[#faf8f5] px-4 py-3 text-base text-stone-950 outline-none transition focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100/70 md:text-sm"/></label><button disabled={loading} className="action-pill flex min-h-14 items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold disabled:opacity-60 md:col-span-2">{loading?"Saving...":"Send message"} <ArrowUpRight size={15}/></button>{status?<p className="rounded-2xl border border-rose-100 bg-rose-50 p-3 text-center text-xs text-stone-700 md:col-span-2">{status}</p>:null}</form>
}
