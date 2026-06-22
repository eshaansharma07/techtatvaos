import { PublicShell } from "@/components/public-shell";
import { ContactForm } from "@/components/contact-form";
import { getClubInfo } from "@/lib/public-data";

export const dynamic = "force-dynamic";

export default async function Contact() {
  const info = await getClubInfo();

  return (
    <PublicShell>
      <section className="mx-auto grid max-w-7xl gap-5 px-5 pb-20 pt-32 md:gap-8 md:px-6 md:pb-28 md:pt-44 lg:grid-cols-[.85fr_1.15fr]">
        <div className="aurora-shell rounded-[2rem] p-6 md:rounded-[2.6rem] md:p-12">
          <p className="text-[10px] font-semibold tracking-[.34em] text-violet-200">CONNECT</p>
          <h1 className="mt-5 text-3xl xs:text-5xl font-semibold leading-[.86] tracking-[-.08em] md:text-8xl">
            Start the conversation.
          </h1>
          <p className="mt-6 text-[15px] leading-8 text-white/58 md:text-base">
            Have an idea, partnership, question, or event inquiry? Send a message and the club will get back to you.
          </p>
          <div className="mt-9 grid gap-3 text-sm text-white/62">
            <p className="rounded-2xl border border-white/[.08] bg-white/[.045] px-4 py-4">{info.email || "No public email added yet."}</p>
            <p className="rounded-2xl border border-white/[.08] bg-white/[.045] px-4 py-4">{info.location || "No location added yet."}</p>
          </div>
        </div>
        <ContactForm />
      </section>
    </PublicShell>
  );
}
