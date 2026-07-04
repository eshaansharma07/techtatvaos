"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";

interface CustomCursorProps {}

// Glowing triangular pointer based on Tech Tatva rounded triangular logo
const TriangleIcon = ({ showArrow }: { showArrow?: boolean }) => (
  <div className="relative w-full h-full flex items-center justify-center">
    <img 
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
  const trailRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [isTouchDevice, setIsTouchDevice] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [hoverType, setHoverType] = useState<"default" | "button" | "link" | "card" | "image">("default");
  const [inHero, setInHero] = useState(false);

  // Keep track of cursor coordinates & state values in mutable refs for 60fps raf loop
  const mouseCoords = useRef({ x: -100, y: -100 });
  const pos = useRef({ x: -100, y: -100 });
  const velocity = useRef({ x: 0, y: 0 });
  
  // Spring settings
  const stiffness = 0.12;
  const damping = 0.65;
  const idleTime = useRef(0);
  const scale = useRef(1);
  const targetScale = useRef(1);
  const scaleVel = useRef(0);
  
  const rotation = useRef(0);
  const targetRotation = useRef(0);
  const rotationVel = useRef(0);

  const trailCoords = useRef([
    { x: -100, y: -100 },
    { x: -100, y: -100 },
    { x: -100, y: -100 },
    { x: -100, y: -100 }
  ]);

  // Bounding rect for magnetic snapping
  const magneticElement = useRef<HTMLElement | null>(null);

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

      const target = e.target as HTMLElement;
      if (!target) return;

      // Hide custom cursor and restore standard text pointer on inputs, forms, and select panels
      const isInput = target.closest("input, textarea, select, [contenteditable='true']");
      if (isInput) {
        if (cursorRef.current) cursorRef.current.style.opacity = "0";
        if (glowRef.current) glowRef.current.style.opacity = "0";
        trailRefs.current.forEach((el) => {
          if (el) el.style.opacity = "0";
        });
        document.body.classList.remove("has-custom-cursor");
        return;
      }

      // Restore custom cursor
      if (cursorRef.current) cursorRef.current.style.opacity = "1";
      if (glowRef.current) glowRef.current.style.opacity = "1";
      trailRefs.current.forEach((el) => {
        if (el) el.style.opacity = "1";
      });
      document.body.classList.add("has-custom-cursor");

      // Check current hover interactions
      const hoverBtn = target.closest("button, a.action-pill, .btn, [role='button']");
      const hoverLnk = target.closest("a, .ghost-pill, summary");
      const hoverCrd = target.closest(".glass, .premium-card, .event-card");
      const hoverImg = target.closest("img, video, [role='img']");

      // Track magnetic parent target for snap animations
      magneticElement.current = hoverBtn as HTMLElement;

      if (hoverBtn) {
        setHoverType("button");
        targetScale.current = 1.0;
      } else if (hoverImg) {
        setHoverType("image");
        targetScale.current = 1.35;
      } else if (hoverCrd) {
        setHoverType("card");
        targetScale.current = 1.25;
      } else if (hoverLnk) {
        setHoverType("link");
        targetScale.current = 1.15;
      } else {
        setHoverType("default");
        targetScale.current = 1.0;
      }

      // Detect if we are inside the landing page hero section
      const isHero = target.closest("section")?.classList.contains("hero") || 
                    target.closest("section") === document.querySelector("main > section:first-of-type");
      setInHero(!!isHero);
    };

    const handleMouseLeave = () => {
      if (cursorRef.current) cursorRef.current.style.opacity = "0";
      if (glowRef.current) glowRef.current.style.opacity = "0";
      trailRefs.current.forEach((el) => {
        if (el) el.style.opacity = "0";
      });
      document.body.classList.remove("has-custom-cursor");
    };

    const handleMouseDown = () => {
      targetScale.current = 0.72; // Compress shape on click
    };

    const handleMouseUp = () => {
      // Return scale depending on current hover target
      if (magneticElement.current) {
        targetScale.current = 1.0;
      } else {
        targetScale.current = hoverType === "image" ? 1.35 : (hoverType === "card" ? 1.25 : 1.0);
      }
    };

    const updatePhysics = () => {
      let targetX = mouseCoords.current.x;
      let targetY = mouseCoords.current.y;

      // Apply subtle magnetic snapping attraction pull (max 10px snap bounds)
      if (magneticElement.current) {
        const rect = magneticElement.current.getBoundingClientRect();
        const elementCenterX = rect.left + rect.width / 2;
        const elementCenterY = rect.top + rect.height / 2;

        const distanceX = elementCenterX - mouseCoords.current.x;
        const distanceY = elementCenterY - mouseCoords.current.y;
        const dist = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

        if (dist > 0) {
          const pull = Math.min(10, dist * 0.16);
          targetX = mouseCoords.current.x + (distanceX / dist) * pull;
          targetY = mouseCoords.current.y + (distanceY / dist) * pull;
        }
      }

      // spring mechanics
      const dx = targetX - pos.current.x;
      const dy = targetY - pos.current.y;

      const ax = dx * stiffness;
      const ay = dy * stiffness;

      velocity.current.x += ax;
      velocity.current.y += ay;
      velocity.current.x *= damping;
      velocity.current.y *= damping;

      pos.current.x += velocity.current.x;
      pos.current.y += velocity.current.y;

      const velMag = Math.sqrt(velocity.current.x * velocity.current.x + velocity.current.y * velocity.current.y);

      // Check if mouse is idle
      if (velMag < 0.1) {
        idleTime.current += 0.02;
        // Idle animation: breathing scales, floaty offsets, pulsing glows
        const floatY = Math.sin(idleTime.current) * 2;
        const floatX = Math.cos(idleTime.current * 0.8) * 1;
        
        pos.current.x += floatX * 0.05;
        pos.current.y += floatY * 0.05;

        // Apply scale pulse
        const pulseScale = 1 + Math.sin(idleTime.current * 1.5) * 0.025;
        targetScale.current = pulseScale;
        targetRotation.current = 0;
      } else {
        idleTime.current = 0;
        
        // Dynamic angle rotations: pointing towards movement for links, simple tilts for cards/default
        if (hoverType === "link") {
          const targetAngle = Math.atan2(velocity.current.y, velocity.current.x) * (180 / Math.PI) + 90;
          let diff = targetAngle - targetRotation.current;
          diff = Math.atan2(Math.sin(diff * Math.PI / 180), Math.cos(diff * Math.PI / 180)) * (180 / Math.PI);
          targetRotation.current += diff;
        } else {
          // Default simple tilt: max 10 degrees based on velocity vx
          const maxTilt = hoverType === "card" ? 5 : 10;
          targetRotation.current = Math.max(-maxTilt, Math.min(maxTilt, velocity.current.x * 0.5));
        }
      }

      // Rotate Spring
      const rDiff = targetRotation.current - rotation.current;
      const rAcc = rDiff * 0.08;
      rotationVel.current += rAcc;
      rotationVel.current *= 0.7;
      rotation.current += rotationVel.current;

      // Scale Spring
      const sDiff = targetScale.current - scale.current;
      const sAcc = sDiff * 0.12;
      scaleVel.current += sAcc;
      scaleVel.current *= 0.65;
      scale.current += scaleVel.current;

      // Update Trail Positions (Tapered Delay Ribbon)
      trailCoords.current[0].x += (pos.current.x - trailCoords.current[0].x) * 0.42;
      trailCoords.current[0].y += (pos.current.y - trailCoords.current[0].y) * 0.42;
      for (let i = 1; i < trailCoords.current.length; i++) {
        trailCoords.current[i].x += (trailCoords.current[i - 1].x - trailCoords.current[i].x) * 0.42;
        trailCoords.current[i].y += (trailCoords.current[i - 1].y - trailCoords.current[i].y) * 0.42;
      }

      // Apply transformations to DOM directly (60fps GPU pipeline)
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) scale(${scale.current}) rotate(${rotation.current}deg)`;
      }

      if (glowRef.current) {
        const glowOffset = inHero ? -180 : -100;
        glowRef.current.style.transform = `translate3d(${pos.current.x + glowOffset}px, ${pos.current.y + glowOffset}px, 0)`;
      }

      for (let i = 0; i < trailCoords.current.length; i++) {
        const el = trailRefs.current[i];
        if (el) {
          el.style.transform = `translate3d(${trailCoords.current[i].x}px, ${trailCoords.current[i].y}px, 0)`;
        }
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
  }, [isTouchDevice, prefersReducedMotion, hoverType, inHero]);

  // Disable custom cursor entirely on mobile/touch interfaces or under low-motion specifications
  if (isTouchDevice || prefersReducedMotion) return null;

  return (
    <>
      <style>{`
        /* Hide browser default cursor when custom cursor is active on desktop fine pointers */
        @media (pointer: fine) {
          body.has-custom-cursor {
            cursor: none !important;
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

        .custom-cursor-glow {
          position: fixed;
          top: 0;
          left: 0;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(168,85,247,0.06) 0%, rgba(236,72,153,0.015) 45%, transparent 70%);
          pointer-events: none;
          z-index: 99998;
          mix-blend-mode: screen;
          will-change: transform, opacity;
          opacity: 0;
          transition: opacity 0.4s ease, width 0.4s ease, height 0.4s ease;
        }

        .custom-cursor-glow.in-hero {
          width: 360px;
          height: 360px;
          background: radial-gradient(circle, rgba(168,85,247,0.11) 0%, rgba(236,72,153,0.02) 50%, transparent 70%);
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
          transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1), 
                      height 0.3s cubic-bezier(0.16, 1, 0.3, 1), 
                      margin-left 0.3s cubic-bezier(0.16, 1, 0.3, 1), 
                      margin-top 0.3s cubic-bezier(0.16, 1, 0.3, 1), 
                      border-radius 0.3s cubic-bezier(0.16, 1, 0.3, 1), 
                      background-color 0.3s;
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

        .custom-cursor-dot {
          position: fixed;
          top: 0;
          left: 0;
          border-radius: 50%;
          pointer-events: none;
          z-index: 99997;
          will-change: transform;
          opacity: 0;
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
        className={`custom-cursor-glow ${inHero ? "in-hero" : ""}`}
        style={{ transform: "translate3d(-1000px, -1000px, 0)" }}
      />

      {/* Ribbon Trail Particles */}
      <div 
        ref={(el) => { if (el) trailRefs.current[0] = el; }} 
        className="custom-cursor-dot w-1 h-1 bg-purple-400 opacity-[0.7] ml-[-2px] mt-[-2px]" 
      />
      <div 
        ref={(el) => { if (el) trailRefs.current[1] = el; }} 
        className="custom-cursor-dot w-[3px] h-[3px] bg-fuchsia-400 opacity-[0.55] ml-[-1.5px] mt-[-1.5px]" 
      />
      <div 
        ref={(el) => { if (el) trailRefs.current[2] = el; }} 
        className="custom-cursor-dot w-[2px] h-[2px] bg-pink-400 opacity-[0.4] ml-[-1px] mt-[-1px]" 
      />
      <div 
        ref={(el) => { if (el) trailRefs.current[3] = el; }} 
        className="custom-cursor-dot w-[1.5px] h-[1.5px] bg-amber-400 opacity-[0.25] ml-[-0.75px] mt-[-0.75px]" 
      />
    </>
  );
}
