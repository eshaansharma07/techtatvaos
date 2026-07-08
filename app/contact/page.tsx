import { PublicShell } from "@/components/public-shell";
import { ContactForm } from "@/components/contact-form";
import { getClubInfo } from "@/lib/public-data";
import { Mail, MapPin, Instagram, Linkedin, Github, MessageSquare } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Contact() {
  const info = await getClubInfo();

  return (
    <PublicShell>
      <section className="relative mx-auto grid max-w-7xl xl:max-w-[1380px] 2xl:max-w-[1536px] gap-8 px-5 pb-20 pt-32 md:gap-12 md:px-6 md:pb-28 md:pt-44 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Ambient atmospheric glowing lights behind the contact panel */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_40%,rgba(168,85,247,0.15),transparent_45%),radial-gradient(circle_at_80%_60%,rgba(236,72,153,0.08),transparent_45%)]" />
        
        <div className="aurora-shell flex flex-col justify-between rounded-[2rem] p-6 border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl md:rounded-[2.6rem] md:p-12">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[.25em] text-violet-200">
              <MessageSquare size={10} /> Get in touch
            </span>
            <h1 className="mt-8 text-4xl xs:text-5xl font-semibold leading-[0.95] tracking-[-.05em] text-white md:text-7xl lg:text-8xl">
              Start the <br/>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/40">conversation.</span>
            </h1>
            <p className="mt-6 max-w-lg text-[15px] leading-8 text-white/50 md:text-base">
              Have a suggestion, partnership proposal, event idea, or need support? Reach out and we will respond shortly.
            </p>
          </div>

          <div className="mt-12 space-y-6">
            <div className="space-y-3">
              <span className="text-[9px] font-bold uppercase tracking-[.25em] text-white/30">Connect Directly</span>
              <div className="grid gap-3">
                <div className="flex items-center gap-4 rounded-2xl border border-white/[.06] bg-white/[.02] px-5 py-4 transition hover:border-white/[.12] hover:bg-white/[.04]">
                  <span className="flex h-10 w-10 shrink-0 place-items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                    <Mail size={16} />
                  </span>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-white/30">EMAIL</p>
                    <p className="text-sm font-medium text-white/80">{info.email || "hello@techtatva.in"}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 rounded-2xl border border-white/[.06] bg-white/[.02] px-5 py-4 transition hover:border-white/[.12] hover:bg-white/[.04]">
                  <span className="flex h-10 w-10 shrink-0 place-items-center justify-center rounded-xl bg-fuchsia-500/10 text-fuchsia-300">
                    <MapPin size={16} />
                  </span>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-white/30">LOCATION</p>
                    <p className="text-sm font-medium text-white/80">{info.location || "Chandigarh University, Mohali"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-white/[0.06]">
              <span className="text-[9px] font-bold uppercase tracking-[.25em] text-white/30">Follow the network</span>
              <div className="flex gap-2">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[.06] bg-white/[.02] text-white/50 transition hover:border-white/20 hover:bg-white/[.06] hover:text-white">
                  <Instagram size={18} />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[.06] bg-white/[.02] text-white/50 transition hover:border-white/20 hover:bg-white/[.06] hover:text-white">
                  <Linkedin size={18} />
                </a>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[.06] bg-white/[.02] text-white/50 transition hover:border-white/20 hover:bg-white/[.06] hover:text-white">
                  <Github size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <ContactForm />
      </section>
    </PublicShell>
  );
}
