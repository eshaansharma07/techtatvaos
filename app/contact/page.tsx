import { PublicShell } from "@/components/public-shell";
import { ContactForm } from "@/components/contact-form";
import { getClubInfo } from "@/lib/public-data";

export const dynamic = "force-dynamic";

export default async function Contact(){
  const info=await getClubInfo();
  return <PublicShell><section className="mx-auto grid max-w-6xl gap-5 px-5 pb-20 pt-28 md:gap-8 md:px-6 md:pb-28 md:pt-40 lg:grid-cols-[.82fr_1.18fr]"><div className="aurora-shell rounded-[2rem] p-6 md:p-10"><p className="text-[10px] font-semibold tracking-[.3em] text-violet-200">CONNECT</p><h1 className="mt-5 text-[3.8rem] font-medium leading-[.92] tracking-[-.07em] md:text-8xl">Start here.</h1><p className="mt-5 text-[15px] leading-7 text-white/55 md:mt-6 md:text-sm md:text-white/50">Have an idea, partnership, question, or event inquiry? Send a message and the club will get back to you.</p><div className="mt-8 grid gap-3 text-sm text-white/55 md:mt-10 md:text-xs"><p className="rounded-2xl border border-white/[.07] bg-white/[.035] px-4 py-3">{info.email || "No public email added yet."}</p><p className="rounded-2xl border border-white/[.07] bg-white/[.035] px-4 py-3">{info.location || "No location added yet."}</p></div></div><ContactForm/></section></PublicShell>
}
