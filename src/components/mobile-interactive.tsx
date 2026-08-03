"use client";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { eventHref } from "@/lib/event-links";
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, Orbit, Sparkles, Users, Zap } from "lucide-react";

/* ─── Horizontal Swipe Carousel ─── */
function SwipeCarousel({ children, label }: { children: React.ReactNode[]; label?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const total = children.length;

  // For loop effect, duplicate children if more than 1
  const displayChildren = total > 1 ? [...children, ...children] : children;

  useEffect(() => {
    const el = ref.current;
    if (!el || total <= 1) return;
    
    let isInteracting = false;
    let animationId: number;

    const setInteracting = () => { isInteracting = true; };
    const clearInteracting = () => { isInteracting = false; };

    el.addEventListener('touchstart', setInteracting, { passive: true });
    el.addEventListener('touchend', clearInteracting, { passive: true });
    el.addEventListener('mousedown', setInteracting);
    el.addEventListener('mouseup', clearInteracting);
    el.addEventListener('mouseleave', clearInteracting);

    const step = () => {
      if (!isInteracting) {
        el.scrollLeft += 0.75; // speed of the loop
        
        const halfWidth = el.scrollWidth / 2;
        if (el.scrollLeft >= halfWidth) {
           el.scrollLeft -= halfWidth;
        }
      }
      animationId = requestAnimationFrame(step);
    };
    
    animationId = requestAnimationFrame(step);
    
    return () => {
      cancelAnimationFrame(animationId);
      el.removeEventListener('touchstart', setInteracting);
      el.removeEventListener('touchend', clearInteracting);
      el.removeEventListener('mousedown', setInteracting);
      el.removeEventListener('mouseup', clearInteracting);
      el.removeEventListener('mouseleave', clearInteracting);
    };
  }, [total]);

  const containerClass = total === 1 
    ? "flex gap-4 overflow-x-auto px-5 pb-2 scrollbar-hide justify-center"
    : "flex gap-4 overflow-x-auto px-5 pb-2 scrollbar-hide";

  return (
    <div className="relative">
      {label && (
        <div className="flex items-center justify-between px-5 mb-4">
          <span className="text-[9px] font-bold tracking-[.3em] text-purple-400 uppercase">{label}</span>
        </div>
      )}
      <div
        ref={ref}
        className={containerClass}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
      >
        {displayChildren.map((child, i) => (
          <div key={i} className={total === 1 ? "w-full max-w-[320px] flex-shrink-0" : "w-[78%] flex-shrink-0"}>
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Touch-Responsive Team Card ─── */
function TeamCard({ name, description, members, color }: { name: string; description: string; members: number; color: string }) {
  const [pressed, setPressed] = useState(false);

  return (
    <div
      className={`relative rounded-2xl glass-brutalist p-5 backdrop-blur-md transition-all duration-200 overflow-hidden ${
        pressed ? "scale-[0.97] border-purple-500/50" : ""
      }`}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      onTouchCancel={() => setPressed(false)}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <Orbit size={16} className="text-purple-400" />
          <span className="flex items-center gap-1 brutalist-btn-dark rounded-xl px-2.5 py-1 text-[10px] font-bold text-white/80">
            <Users size={10} /> {members}
          </span>
        </div>
        <h3 className="mt-4 text-[15px] font-bold text-white">{name}</h3>
        <p className="mt-2 text-[11px] leading-[1.6] text-white/35">{description || "Team details coming soon."}</p>
      </div>
    </div>
  );
}

/* ─── Animated Stats Counter with Intersection Observer ─── */
function ScrollCounter({ value, label, icon }: { value: number; label: string; icon: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || value === 0) return;
    const duration = 1200;
    const steps = 30;
    const stepTime = duration / steps;
    let current = 0;
    const increment = value / steps;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [visible, value]);

  if (value === 0) return null;

  return (
    <div ref={ref} className="flex flex-col items-center gap-2 py-4">
      <div className="grid h-10 w-10 place-items-center rounded-xl border-2 border-black bg-purple-500 text-black shadow-[2px_2px_0px_0px_rgba(255,255,255,0.8)]">
        {icon}
      </div>
      <p className="text-2xl font-extrabold tracking-tight text-white">{visible ? count : 0}</p>
      <p className="text-[8px] font-bold tracking-[.2em] text-white/30 uppercase">{label}</p>
    </div>
  );
}

/* ─── Membership Perks Swipeable ─── */
const perks = [
  { emoji: "🤝", title: "Connect & Collaborate", desc: "Work with top minds in programming, design, marketing, and engineering." },
  { emoji: "🛠️", title: "Practical Learning", desc: "Access workshops, hackathons, and real projects for your resume." },
  { emoji: "🎯", title: "Exclusive Perks", desc: "Early event registration, speaker sessions, and contribution certificates." },
];

function PerkCard({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  const [pressed, setPressed] = useState(false);
  return (
    <div
      className={`rounded-2xl glass-brutalist p-6 transition-all duration-200 ${
        pressed ? "scale-[0.97] border-purple-500/50 bg-black/50" : ""
      }`}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      onTouchCancel={() => setPressed(false)}
    >
      <span className="text-2xl">{emoji}</span>
      <h3 className="mt-3 text-[15px] font-bold text-white">{title}</h3>
      <p className="mt-2 text-[11px] leading-[1.7] text-white/40">{desc}</p>
    </div>
  );
}

/* ─── Main Export: Mobile Interactive Sections ─── */
export function MobileInteractiveSections({
  teams,
  events,
  stats,
  driveStatus,
  achievements,
}: {
  teams: { id: string; name: string; description: string; members: number }[];
  events: { slug: string; title: string; description: string; registrationOpen: boolean; venue?: string }[];
  stats: { members: number; events: number; community: number };
  driveStatus: { status: string; registrationEnabled: boolean } | null;
  achievements: { _id: string; kind?: string; title: string; description: string }[];
}) {
  const teamColors = ["#8b5cf6", "#ec4899", "#f59e0b", "#06b6d4", "#10b981", "#6366f1"];

  return (
    <div className="md:hidden">
      {/* ─── Animated Stats Bar ─── */}
      <section className="py-10 border-b border-white/[0.04]">
        <div className="flex justify-center gap-8">
          <ScrollCounter value={stats.members} label="Core Members" icon={<Users size={16} />} />
          <ScrollCounter value={stats.events} label="Events" icon={<Sparkles size={16} />} />
          <ScrollCounter value={stats.community} label="Student Members" icon={<Zap size={16} />} />
        </div>
      </section>

      {/* ─── Events — Horizontal Swipe Carousel ─── */}
      <section className="py-10">
        {events.length > 0 ? (
          <SwipeCarousel label="Upcoming Events">
            {events.map((e) => (
              <Link
                href={eventHref(e.slug)}
                key={e.slug}
                className="block rounded-2xl glass-brutalist p-5 backdrop-blur-md active:scale-[0.97] transition-transform"
              >
                <div className="flex items-center justify-between">
                  <span className={`rounded-xl px-2.5 py-1 text-[9px] font-bold tracking-wider uppercase border border-black ${
                    e.registrationOpen
                      ? "bg-purple-500 text-black shadow-[1px_1px_0px_0px_rgba(255,255,255,0.8)]"
                      : "brutalist-btn-dark text-white"
                  }`}>
                    {e.registrationOpen ? "Open" : "Live"}
                  </span>
                  <ArrowUpRight size={14} className="text-white/20" />
                </div>
                <h3 className="mt-4 text-[16px] font-bold text-white leading-tight">{e.title}</h3>
                <p className="mt-2 text-[11px] leading-[1.6] text-white/35 line-clamp-2">{e.description}</p>
                {e.venue && (
                  <p className="mt-3 text-[10px] font-bold text-purple-400 uppercase tracking-wider">📍 {e.venue}</p>
                )}
              </Link>
            ))}
          </SwipeCarousel>
        ) : (
          <div className="px-5">
            <p className="text-[9px] font-bold tracking-[.3em] text-purple-400 uppercase mb-4">Events</p>
            <div className="relative rounded-2xl glass-brutalist p-8 text-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent" />
              <div className="relative z-10">
                <div className="mx-auto h-12 w-12 rounded-full bg-purple-500/10 grid place-items-center mb-4">
                  <Sparkles size={20} className="text-purple-400 animate-pulse" />
                </div>
                <p className="text-sm font-bold text-white/80">Events launching soon</p>
                <p className="mt-2 text-[11px] text-white/30">Stay tuned for workshops, hackathons & more</p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ─── Teams — Horizontal Swipe Carousel ─── */}
      {teams.length > 0 && (
        <section className="py-10 border-t border-white/[0.04]">
          <SwipeCarousel label="Our Teams">
            {teams.slice(0, 6).map((team, i) => (
              <TeamCard
                key={team.id}
                name={team.name}
                description={team.description}
                members={team.members}
                color={teamColors[i % teamColors.length]}
              />
            ))}
          </SwipeCarousel>
          <div className="px-5 mt-5">
            <Link
              href="/teams"
              className="flex h-11 w-full items-center justify-center gap-2 brutalist-btn-dark rounded-xl text-[12px] font-bold text-white transition active:scale-[0.97]"
            >
              View all teams <ArrowRight size={13} />
            </Link>
          </div>
        </section>
      )}

      {/* ─── Membership Drive — Swipeable Perks ─── */}
      {driveStatus && driveStatus.status !== "closed" && (
        <section className="py-10 border-t border-white/[0.04]">
          <div className="px-5 mb-6">
            <p className="text-[9px] font-bold tracking-[.3em] text-purple-400 uppercase mb-3">Membership Drive</p>
            <h2 className="text-[22px] font-extrabold tracking-tight text-white leading-[1.2]">Join the club.</h2>
          </div>
          <SwipeCarousel>
            {perks.map((p) => (
              <PerkCard key={p.title} {...p} />
            ))}
          </SwipeCarousel>
          {driveStatus.registrationEnabled && (
            <div className="px-5 mt-6">
              <Link
                href="/join"
                className="brutalist-btn-purple flex h-[50px] items-center justify-center gap-2 rounded-xl text-[14px] font-bold text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(255,255,255,0.8)]"
              >
                Register now <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </section>
      )}

      {/* ─── Achievements — Horizontal Swipe ─── */}
      {achievements.length > 0 && (
        <section className="py-10 border-t border-white/[0.04]">
          <SwipeCarousel label="Achievements">
            {achievements.slice(0, 5).map((item: any) => (
              <div
                key={item._id}
                className="rounded-2xl glass-brutalist p-5"
              >
                <p className="text-[9px] font-bold tracking-[.2em] text-purple-400 uppercase">{item.kind || "Achievement"}</p>
                <h3 className="mt-3 text-[15px] font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-[11px] leading-[1.6] text-white/35">{item.description}</p>
              </div>
            ))}
          </SwipeCarousel>
        </section>
      )}
    </div>
  );
}
