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
  return <form action={submit} className="glass grid gap-4 rounded-2xl p-6 md:grid-cols-2">{[["name","Name"],["email","Email"],["registrationNumber","Registration number"],["subject","Subject"]].map(([name,label])=><label className="text-[10px] tracking-wider text-white/35" key={name}>{label.toUpperCase()}<input required={name!=="registrationNumber"} name={name} type={name==="email"?"email":"text"} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50"/></label>)}<label className="text-[10px] tracking-wider text-white/35 md:col-span-2">MESSAGE<textarea required name="message" rows={6} className="mt-2 w-full rounded-lg border border-white/[.07] bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-violet-400/50"/></label><button disabled={loading} className="flex items-center justify-center gap-2 rounded-lg bg-white py-3 text-sm font-semibold text-black disabled:opacity-60 md:col-span-2">{loading?"Saving...":"Send message"} <ArrowUpRight size={15}/></button>{status?<p className="rounded-lg bg-violet-500/10 p-3 text-center text-xs text-violet-100 md:col-span-2">{status}</p>:null}</form>
}
