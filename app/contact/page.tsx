import { PublicShell } from "@/components/public-shell";
import { ContactForm } from "@/components/contact-form";
import { getClubInfo } from "@/lib/public-data";

export const dynamic = "force-dynamic";

export default async function Contact(){
  const info=await getClubInfo();
  return <PublicShell><section className="mx-auto grid max-w-6xl gap-14 px-6 pb-28 pt-40 lg:grid-cols-[.8fr_1.2fr]"><div><p className="text-[10px] tracking-[.3em] text-violet-300">CONNECT</p><h1 className="mt-5 text-6xl font-medium tracking-[-.07em] md:text-8xl">Start here.</h1><p className="mt-6 text-sm leading-7 text-white/45">Send a message. It will be stored in the admin portal, where admins can track and resolve it.</p><div className="mt-10 space-y-4 text-xs text-white/50"><p>{info.email || "No public email added yet."}</p><p>{info.location || "No location added yet."}</p></div></div><ContactForm/></section></PublicShell>
}
