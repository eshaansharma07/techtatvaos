import { PublicShell } from "@/components/public-shell";
import { ContactForm } from "@/components/contact-form";
import { getClubInfo } from "@/lib/public-data";

export const dynamic = "force-dynamic";

export default async function Contact(){
  const info=await getClubInfo();
  return <PublicShell><section className="mx-auto grid max-w-6xl gap-5 px-5 pb-20 pt-28 md:gap-8 md:px-6 md:pb-28 md:pt-40 lg:grid-cols-[.82fr_1.18fr]"><div className="rounded-[2rem] border border-stone-200/80 bg-[#fffdf8] p-6 shadow-[0_24px_80px_rgba(82,52,30,.08)] md:p-10"><p className="text-[11px] font-semibold uppercase tracking-[.28em] text-rose-400">CONNECT</p><h1 className="mt-5 text-[3.8rem] font-semibold leading-[.9] tracking-[-.075em] text-stone-950 md:text-8xl">Start here.</h1><p className="mt-6 text-base leading-8 text-stone-500">Have an idea, partnership, question, or event inquiry? Send a message and the club will get back to you.</p><div className="mt-8 grid gap-3 text-sm text-stone-600 md:mt-10"><p className="rounded-2xl border border-stone-200 bg-white px-4 py-3">{info.email || "No public email added yet."}</p><p className="rounded-2xl border border-stone-200 bg-white px-4 py-3">{info.location || "No location added yet."}</p></div></div><ContactForm/></section></PublicShell>
}
