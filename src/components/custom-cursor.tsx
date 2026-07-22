"use client";
import Image from "next/image";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";

interface CustomCursorProps {}

// Glowing triangular pointer based on Tech Tatva rounded triangular logo
const TriangleIcon = ({ showArrow }: { showArrow?: boolean }) => (
  <div className="relative w-full h-full flex items-center justify-center">
    <Image width={1200} height={1200} 
      src="/logo-colour.svg" 
      alt="Tech Tatva Logo Pointer" 
      className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(168,85,247,0.35)]"
      style={{ transform: "translate3d(0, -1px, 0)" }}
    />
    {showArrow && (
      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
      >
        <path 
          d="M9 15h6v-6M15 15l-6 -6" 
          stroke="white" 
          strokeWidth="1.8" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
    )}
  </div>
);

export function CustomCursor({}: CustomCursorProps) {
  const cursorRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const [isTouchDevice, setIsTouchDevice] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [hoverType, setHoverType] = useState<"default" | "button" | "link" | "card" | "image">("default");

  const mouseCoords = useRef({ x: -100, y: -100 });
  const pos = useRef({ x: -100, y: -100 });
  const scale = useRef(1);
  const targetScale = useRef(1);
  const hoverTypeRef = useRef<typeof hoverType>("default");

  useEffect(() => {
    setIsTouchDevice(window.matchMedia("(pointer: coarse)").matches);
    setPrefersReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);

    const touchQuery = window.matchMedia("(pointer: coarse)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const touchListener = (e: MediaQueryListEvent) => setIsTouchDevice(e.matches);
    const motionListener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);

    touchQuery.addEventListener("change", touchListener);
    motionQuery.addEventListener("change", motionListener);

    return () => {
      touchQuery.removeEventListener("change", touchListener);
      motionQuery.removeEventListener("change", motionListener);
    };
  }, []);

  useEffect(() => {
    if (isTouchDevice || prefersReducedMotion) {
      document.body.classList.remove("has-custom-cursor");
      return;
    }

    document.body.classList.add("has-custom-cursor");

    let rafId: number;

    const handleMouseMove = (e: MouseEvent) => {
      mouseCoords.current = { x: e.clientX, y: e.clientY };

      if (document.body.classList.contains("force-native-cursor")) {
        if (cursorRef.current) cursorRef.current.style.opacity = "0";
        if (glowRef.current) glowRef.current.style.opacity = "0";
        document.body.classList.remove("has-custom-cursor");
        return;
      }

      const target = e.target as HTMLElement;
      if (!target) return;

      const isInput = target.closest("input, textarea, select, [contenteditable='true']");
      if (isInput) {
        if (cursorRef.current) cursorRef.current.style.opacity = "0";
        if (glowRef.current) glowRef.current.style.opacity = "0";
        document.body.classList.remove("has-custom-cursor");
        return;
      }

      if (cursorRef.current) cursorRef.current.style.opacity = "1";
      if (glowRef.current) glowRef.current.style.opacity = "1";
      document.body.classList.add("has-custom-cursor");

      const hoverBtn = target.closest("button, a.action-pill, .btn, [role='button']");
      const hoverLnk = target.closest("a, .ghost-pill, summary");
      const hoverCrd = target.closest(".glass, .premium-card, .event-card");
      const hoverImg = target.closest("img, video, [role='img']");

      const nextHoverType = hoverBtn ? "button" : hoverImg ? "image" : hoverCrd ? "card" : hoverLnk ? "link" : "default";
      if (hoverTypeRef.current !== nextHoverType) {
        hoverTypeRef.current = nextHoverType;
        setHoverType(nextHoverType);
      }
      targetScale.current = nextHoverType === "image" ? 1.35 : nextHoverType === "card" ? 1.25 : nextHoverType === "link" ? 1.15 : 1.0;
    };

    const handleMouseLeave = () => {
      if (cursorRef.current) cursorRef.current.style.opacity = "0";
      if (glowRef.current) glowRef.current.style.opacity = "0";
      document.body.classList.remove("has-custom-cursor");
    };

    const handleMouseDown = () => {
      targetScale.current = 0.75;
    };

    const handleMouseUp = () => {
      const currentHoverType = hoverTypeRef.current;
      targetScale.current = currentHoverType === "image" ? 1.35 : (currentHoverType === "card" ? 1.25 : currentHoverType === "link" ? 1.15 : 1.0);
    };

    const updatePhysics = () => {
      const targetX = mouseCoords.current.x;
      const targetY = mouseCoords.current.y;

      // Clean fast linear interpolation
      pos.current.x += (targetX - pos.current.x) * 0.22;
      pos.current.y += (targetY - pos.current.y) * 0.22;
      scale.current += (targetScale.current - scale.current) * 0.18;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) scale(${scale.current})`;
      }

      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${pos.current.x - 100}px, ${pos.current.y - 100}px, 0)`;
      }

      rafId = requestAnimationFrame(updatePhysics);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    rafId = requestAnimationFrame(updatePhysics);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      cancelAnimationFrame(rafId);
    };
  }, [isTouchDevice, prefersReducedMotion]);

  if (isTouchDevice || prefersReducedMotion) return null;

  return (
    <>
      <style>{`
        @media (pointer: fine) {
          body.has-custom-cursor {
            cursor: none !important;
          }
          body.force-native-cursor,
          body.force-native-cursor *,
          body.has-custom-cursor.force-native-cursor,
          body.has-custom-cursor.force-native-cursor * {
            cursor: auto !important;
          }
          body.has-custom-cursor a,
          body.has-custom-cursor button,
          body.has-custom-cursor [role="button"],
          body.has-custom-cursor summary,
          body.has-custom-cursor select,
          body.has-custom-cursor input[type="submit"],
          body.has-custom-cursor input[type="button"] {
            cursor: none !important;
          }
          body.has-custom-cursor input,
          body.has-custom-cursor textarea,
          body.has-custom-cursor [contenteditable="true"] {
            cursor: text !important;
          }
          body.force-native-cursor input,
          body.force-native-cursor textarea,
          body.force-native-cursor [contenteditable="true"] {
            cursor: text !important;
          }
        }
        
        .custom-cursor-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 0;
          height: 0;
          pointer-events: none;
          z-index: 99999;
          will-change: transform;
        }

        body.force-native-cursor .custom-cursor-container,
        body.force-native-cursor .custom-cursor-glow {
          opacity: 0 !important;
        }

        .custom-cursor-glow {
          position: fixed;
          top: 0;
          left: 0;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%);
          pointer-events: none;
          z-index: 99998;
          mix-blend-mode: screen;
          will-change: transform, opacity;
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .custom-cursor-ptr {
          position: absolute;
          width: 22px;
          height: 22px;
          margin-left: -11px;
          margin-top: -11px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: width 0.25s cubic-bezier(0.16, 1, 0.3, 1), 
                      height 0.25s cubic-bezier(0.16, 1, 0.3, 1), 
                      margin-left 0.25s cubic-bezier(0.16, 1, 0.3, 1), 
                      margin-top 0.25s cubic-bezier(0.16, 1, 0.3, 1), 
                      border-radius 0.25s cubic-bezier(0.16, 1, 0.3, 1), 
                      background-color 0.25s;
        }

        .custom-cursor-ptr.is-button {
          width: 58px;
          height: 28px;
          margin-left: -29px;
          margin-top: -14px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.22);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.18);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
      `}</style>

      {/* Main Cursor Pointer */}
      <div 
        ref={cursorRef} 
        className="custom-cursor-container"
        style={{ transform: "translate3d(-100px, -100px, 0)", opacity: 0 }}
      >
        <div className={`custom-cursor-ptr ${hoverType === "button" ? "is-button" : ""}`}>
          <div 
            className="w-full h-full flex items-center justify-center transition-all duration-300"
            style={{ 
              width: hoverType === "button" ? "12px" : "22px", 
              height: hoverType === "button" ? "12px" : "22px"
            }}
          >
            <TriangleIcon showArrow={hoverType === "image"} />
          </div>
        </div>
      </div>

      {/* Ambient Halo Glow */}
      <div 
        ref={glowRef} 
        className="custom-cursor-glow"
        style={{ transform: "translate3d(-1000px, -1000px, 0)" }}
      />
    </>
  );
}
