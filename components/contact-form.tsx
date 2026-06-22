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
  return <form action={submit} className="contact-card premium-card grid gap-4 rounded-[2rem] p-5 md:grid-cols-2 md:p-7">{[["name","Name"],["email","Email"],["subject","Subject"]].map(([name,label])=><label className="block text-[10px] font-semibold tracking-[.2em] text-white/40" key={name}>{label.toUpperCase()}<input required name={name} type={name==="email"?"email":"text"} className="mt-2 min-h-14 w-full rounded-2xl border border-white/[.09] bg-black/25 px-4 py-3 text-base text-white outline-none transition placeholder:text-white/25 focus:border-fuchsia-200/45 focus:bg-white/[.045] md:text-sm"/></label>)}<label className="block text-[10px] font-semibold tracking-[.2em] text-white/40 md:col-span-2">MESSAGE<textarea required name="message" rows={7} className="mt-2 w-full rounded-2xl border border-white/[.09] bg-black/25 px-4 py-3 text-base text-white outline-none transition placeholder:text-white/25 focus:border-fuchsia-200/45 focus:bg-white/[.045] md:text-sm"/></label><button disabled={loading} className="action-pill flex min-h-14 items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold disabled:opacity-60 md:col-span-2">{loading?"Saving...":"Send message"} <ArrowUpRight size={15}/></button>{status?<p className="rounded-2xl border border-violet-300/20 bg-violet-500/10 p-3 text-center text-xs text-violet-100 md:col-span-2">{status}</p>:null}</form>
}
