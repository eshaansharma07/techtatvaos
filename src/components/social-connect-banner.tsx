"use client";

import { useState } from "react";
import { Instagram, ArrowUpRight, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SocialConnectBannerProps {
  handle?: string;
  profileUrl?: string;
}

export function SocialConnectBanner({
  handle = "techtatvaclub",
  profileUrl = "https://www.instagram.com/techtatvaclub/",
}: SocialConnectBannerProps) {
  const [showModal, setShowModal] = useState(false);

  const displayHandle = handle.startsWith("@") ? handle : `@${handle}`;

  const handleActionClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowModal(true);
  };

  const handleRegister = () => {
    window.location.href = "/join";
  };

  const handleGoToInstagram = () => {
    window.open(profileUrl, "_blank", "noopener,noreferrer");
    setShowModal(false);
  };

  return (
    <section className="border-b border-black/10 bg-black/[0.01] py-16 relative overflow-hidden">
      <div className="mx-auto max-w-7xl xl:max-w-[1380px] 2xl:max-w-[1536px] px-5 md:px-6 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="max-w-2xl">
            <p className="mb-3 text-[10px] font-bold tracking-[0.3em] text-emerald-600 uppercase">SOCIAL CONNECT</p>
            <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl text-black">Captured on Instagram.</h2>
            <p className="mt-4 text-sm leading-6 text-black/60 flex flex-wrap items-center gap-1.5">
              Join our active student club of builders. We post live updates, technology news, event announcements, and design highlights.
              <span className="inline-flex animate-pulse">
                <Sparkles size={14} className="text-emerald-500 fill-emerald-500" />
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 shrink-0">
            {/* Instagram Badge */}
            <button
              onClick={handleActionClick}
              className="inline-flex items-center gap-2.5 rounded-xl border-2 border-black bg-[#00FF66] px-4 py-2.5 shadow-[2px_2px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#000000] transition-all cursor-pointer active:scale-95"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-black"></span>
              </span>
              <Instagram size={14} className="text-black" />
              <span className="text-xs font-bold tracking-tight text-black">{displayHandle}</span>
            </button>

            {/* Visit Profile Button */}
            <button
              onClick={handleActionClick}
              className="brutalist-btn-dark flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-xs font-bold tracking-wider text-white bg-black border-2 border-black shadow-[3px_3px_0px_0px_#000000] transition hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#000000] active:scale-95"
            >
              <span>VISIT PROFILE</span>
              <ArrowUpRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Popup */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="relative w-full max-w-md rounded-3xl border-2 border-black bg-white p-6 md:p-8 shadow-[6px_6px_0px_0px_#000000] z-10"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-xl border border-black/10 bg-black/[0.02] text-black/50 hover:text-black hover:border-black/30 transition"
              >
                <X size={16} />
              </button>

              <div className="flex flex-col items-center text-center">
                {/* Logo Icon */}
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-black bg-[#00FF66] shadow-[2px_2px_0px_0px_#000000] mb-6">
                  <Instagram size={24} className="text-black" />
                </div>

                <h3 className="text-xl font-bold tracking-tight text-black">Join Tech Tatva Club</h3>
                <p className="mt-3 text-xs leading-5 text-black/50">
                  Register as a student member to access internal workshops, bootcamps, and developer project groups before visiting our profile.
                </p>

                <div className="mt-6 flex flex-col gap-3 w-full">
                  <button
                    onClick={handleRegister}
                    className="brutalist-btn-green w-full flex min-h-12 items-center justify-center gap-2 rounded-xl text-xs font-bold uppercase tracking-wider text-black border-2 border-black shadow-[3px_3px_0px_0px_#000000]"
                  >
                    <span>Register for Club</span>
                    <ArrowUpRight size={14} />
                  </button>

                  <button
                    onClick={handleGoToInstagram}
                    className="w-full flex min-h-12 items-center justify-center gap-2 rounded-xl text-xs font-bold uppercase tracking-wider text-black bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000000]"
                  >
                    <span>Proceed to Instagram</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
