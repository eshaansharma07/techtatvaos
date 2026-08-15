import { ArrowLeft, MapPin } from "lucide-react";
import Link from "next/link";
import { TechnomaniaScheduleView } from "@/components/technomania/technomania-schedule";
import { getTechnomaniaSchedule } from "@/lib/technomania-data";

export const revalidate = 60;

export default async function TechnomaniaSchedulePage() {
  const events = await getTechnomaniaSchedule();

  return (
    <section className="mx-auto max-w-5xl px-5 pb-20 pt-28 md:px-6 md:pb-28 md:pt-36">
      <Link href="/" className="inline-flex items-center gap-2 text-tm-dim hover:text-white transition text-xs font-tm-mono tracking-wider mb-6">
        <ArrowLeft size={14} /> BACK TO HOME
      </Link>

      <div className="flex items-center gap-3 mb-2">
        <div className="tm-hazard-stripe-accent w-8" />
        <span className="tm-label">TIMELINE</span>
      </div>
      <h1 className="font-tm-heading text-4xl md:text-6xl lg:text-7xl font-black tracking-[-0.04em]">
        EVENT<br />
        <span className="text-tm-muted">SCHEDULE.</span>
      </h1>
      <p className="mt-4 text-tm-muted text-sm md:text-base max-w-2xl leading-7">
        Plan your Technomania 3.0 experience. View the complete schedule of events across all days.
      </p>

      <div className="mt-10">
        {events.length > 0 ? (
          <TechnomaniaScheduleView events={events} />
        ) : (
          <div className="tm-card p-10 text-center">
            <p className="font-tm-heading text-xl font-bold">SCHEDULE COMING SOON</p>
            <p className="text-tm-dim text-sm mt-3 max-w-md mx-auto">
              The detailed schedule will be published closer to the event date. Check back soon!
            </p>
            <div className="tm-hazard-stripe w-16 mx-auto mt-6" />
          </div>
        )}
      </div>
    </section>
  );
}
