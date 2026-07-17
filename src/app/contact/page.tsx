import { PublicShell } from "@/components/public-shell";
import { ContactForm } from "@/components/contact-form";
import { getClubInfo } from "@/lib/public-data";
import { Mail, MapPin, Instagram, Linkedin, Github, MessageSquare } from "lucide-react";

export const revalidate = 60;

export default async function Contact() {
  const info = await getClubInfo();

  return (
    <PublicShell>
      <section className="relative mx-auto grid max-w-7xl xl:max-w-[1380px] 2xl:max-w-[1536px] gap-8 px-5 pb-20 pt-32 md:gap-12 md:px-6 md:pb-28 md:pt-44 lg:grid-cols-[0.9fr_1.1fr] spatial-grid-bg">
        {/* Ambient atmospheric glowing lights behind the contact panel */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_40%,rgba(168,85,247,0.05),transparent_45%)]" />
        
        <div className="glass-brutalist flex flex-col justify-between rounded-[2rem] p-6 md:rounded-[2.6rem] md:p-12">
          <div>
            <span className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-purple-500 px-4 py-1.5 text-xs font-bold text-white shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              REACH OUT
            </span>
            <h1 className="mt-7 max-w-2xl text-6xl font-extrabold leading-[1] tracking-[-0.04em] text-white md:text-8xl">
              Start the <br />
              <span className="text-purple-400">conversation.</span>
            </h1>
            <p className="mt-6 max-w-lg text-[15px] leading-8 text-white/50 md:text-base">
              Have a suggestion, partnership proposal, event idea, or need support? Reach out and we will respond shortly.
            </p>
          </div>

          <div className="mt-12 space-y-6">
            <div className="space-y-3">
              <span className="text-[9px] font-bold uppercase tracking-[.25em] text-white/30">Connect Directly</span>
              <a href="mailto:contact@techtatva.in" className="group block outline-none">
                <div className="flex items-center gap-4 rounded-2xl border border-white/[.06] bg-white/[0.02] px-5 py-4 transition hover:border-purple-500/30">
                  <span className="flex h-10 w-10 shrink-0 place-items-center justify-center rounded-xl bg-purple-500/10 text-purple-300">
                    <Mail size={18} />
                  </span>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-white/30">EMAIL</p>
                    <p className="text-sm font-semibold text-white/80">{info.email || "hello@techtatva.in"}</p>
                  </div>
                </div>
              </a>
                
                <div className="flex items-center gap-4 rounded-2xl border border-white/[.06] bg-white/[0.02] px-5 py-4 transition hover:border-purple-500/30">
                  <span className="flex h-10 w-10 shrink-0 place-items-center justify-center rounded-xl bg-purple-500/10 text-purple-300">
                    <MapPin size={16} />
                  </span>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-white/30">LOCATION</p>
                    <p className="text-sm font-semibold text-white/80">{info.location || "Chandigarh University, Mohali"}</p>
                  </div>
                </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-white/[0.06]">
              <span className="text-[9px] font-bold uppercase tracking-[.25em] text-white/30">Follow the network</span>
              <div className="flex gap-3">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[.06] bg-white/[.02] text-white/50 transition hover:border-purple-500/50 hover:text-white">
                  <Instagram size={18} />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[.06] bg-white/[.02] text-white/50 transition hover:border-purple-500/50 hover:text-white">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </a>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[.06] bg-white/[.02] text-white/50 transition hover:border-purple-500/50 hover:text-white">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
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
