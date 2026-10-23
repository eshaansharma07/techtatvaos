"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/* ─── Palette tuned to TechTatva's violet-purple-magenta identity ─── */
const PARTICLE_COLORS = [
  { r: 139, g: 92, b: 246 },   // violet  (#8b5cf6)
  { r: 168, g: 85, b: 247 },   // purple  (#a855f7)
  { r: 216, g: 195, b: 255 },  // lavender (#d8c3ff)
  { r: 232, g: 121, b: 166 },  // magenta  (#e879a6)
  { r: 124, g: 58, b: 237 },   // deep violet (#7c3aed)
  { r: 99, g: 102, b: 241 },   // indigo   (#6366f1)
];

/* ─── Config ─── */
const CONFIG = {
  /** Base count at 1920×1080; scales with viewport area */
  baseParticleCount: 60,
  /** Mobile cap */
  mobileParticleCount: 18,
  /** Radius range (CSS px) */
  minRadius: 0.8,
  maxRadius: 2.4,
  /** Connection distance threshold (CSS px) */
  connectionDistance: 140,
  /** Max connections per particle to avoid dense webs */
  maxConnectionsPerParticle: 4,
  /** Base connection opacity */
  connectionOpacity: 0.12,
  /** Particle base speed */
  minSpeed: 0.08,
  maxSpeed: 0.18,
  /** Cursor repulsion radius & strength */
  cursorRadius: 160,
  cursorStrength: 0.35,
  /** Glow radius multiplier */
  glowMultiplier: 3.5,
  /** Particle base opacity range */
  minOpacity: 0.15,
  maxOpacity: 0.55,
};

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  color: { r: number; g: number; b: number };
  /** Phase offset for gentle opacity breathing */
  phase: number;
}

function createParticle(width: number, height: number): Particle {
  const color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
  const angle = Math.random() * Math.PI * 2;
  const speed = CONFIG.minSpeed + Math.random() * (CONFIG.maxSpeed - CONFIG.minSpeed);
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    radius: CONFIG.minRadius + Math.random() * (CONFIG.maxRadius - CONFIG.minRadius),
    opacity: CONFIG.minOpacity + Math.random() * (CONFIG.maxOpacity - CONFIG.minOpacity),
    color,
    phase: Math.random() * Math.PI * 2,
  };
}

export function ParticleNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const timeRef = useRef(0);
  const dprRef = useRef(1);

  /* ── Reduced motion ── */
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  /* ── Mouse tracking ── */
  useEffect(() => {
    if (reducedMotion) return;
    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const onLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, [reducedMotion]);

  /* ── Canvas & animation loop ── */
  const initParticles = useCallback((width: number, height: number) => {
    const isMobile = width < 768;
    const area = width * height;
    const baseArea = 1920 * 1080;
    const count = isMobile
      ? CONFIG.mobileParticleCount
      : Math.min(100, Math.max(25, Math.round(CONFIG.baseParticleCount * (area / baseArea))));
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      particles.push(createParticle(width, height));
    }
    return particles;
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    dprRef.current = dpr;

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Re-init particles on major size changes
      particlesRef.current = initParticles(w, h);
    };
    resize();
    window.addEventListener("resize", resize);

    const tick = () => {
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      const particles = particlesRef.current;
      const mouse = mouseRef.current;
      const time = (timeRef.current += 0.008);

      ctx.clearRect(0, 0, w, h);

      /* ── Update particles ── */
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap edges
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        // Cursor repulsion (desktop only)
        if (mouse.x > -999) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONFIG.cursorRadius && dist > 0) {
            const force = ((CONFIG.cursorRadius - dist) / CONFIG.cursorRadius) * CONFIG.cursorStrength;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }

        // Gentle velocity damping to prevent runaway
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > CONFIG.maxSpeed * 2.5) {
          const factor = (CONFIG.maxSpeed * 2.5) / speed;
          p.vx *= factor;
          p.vy *= factor;
        }
        // Gradually return to base speed
        if (speed > CONFIG.maxSpeed * 1.2) {
          p.vx *= 0.998;
          p.vy *= 0.998;
        }
      }

      /* ── Draw connections ── */
      const connDist = CONFIG.connectionDistance;
      const connDistSq = connDist * connDist;

      for (let i = 0; i < particles.length; i++) {
        const pi = particles[i];
        let connections = 0;
        for (let j = i + 1; j < particles.length; j++) {
          if (connections >= CONFIG.maxConnectionsPerParticle) break;
          const pj = particles[j];
          const dx = pi.x - pj.x;
          const dy = pi.y - pj.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < connDistSq) {
            const dist = Math.sqrt(distSq);
            const alpha = (1 - dist / connDist) * CONFIG.connectionOpacity;

            // Blend colors of the two connected particles
            const r = Math.round((pi.color.r + pj.color.r) / 2);
            const g = Math.round((pi.color.g + pj.color.g) / 2);
            const b = Math.round((pi.color.b + pj.color.b) / 2);

            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(pi.x, pi.y);
            ctx.lineTo(pj.x, pj.y);
            ctx.stroke();
            connections++;
          }
        }
      }

      /* ── Draw particles with glow ── */
      for (const p of particles) {
        // Breathing opacity
        const breathe = Math.sin(time * 0.6 + p.phase) * 0.12 + 0.88;
        const alpha = p.opacity * breathe;

        // Glow
        const glowRadius = p.radius * CONFIG.glowMultiplier;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRadius);
        grad.addColorStop(0, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha})`);
        grad.addColorStop(0.4, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha * 0.4})`);
        grad.addColorStop(1, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, 0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Core dot
        ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${Math.min(1, alpha * 1.6)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    /* Pause when tab is hidden */
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        cancelAnimationFrame(rafRef.current);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reducedMotion, initParticles]);

  if (reducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[-1]"
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}
