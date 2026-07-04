"use client";

import { useEffect, useRef, useState } from "react";

interface Node3D {
  x: number;
  y: number;
  z: number;
  ox: number; // original coordinates
  oy: number;
  oz: number;
}

export function InteractiveHero3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseCoords = useRef({ x: 0, y: 0 });
  const targetCoords = useRef({ x: 0, y: 0 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse to [-1, 1] relative to viewport center
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      targetCoords.current = { x, y };
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [prefersReducedMotion]);

  const speedMultiplier = useRef(1);

  useEffect(() => {
    const handleToggle = () => {
      speedMultiplier.current = speedMultiplier.current === 1 ? 5 : 1;
    };
    window.addEventListener("antigravity-toggle", handleToggle);
    return () => window.removeEventListener("antigravity-toggle", handleToggle);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    const handleResize = () => {
      if (!canvas) return;
      // High-DPI support
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    // Initialize 3D points in a sphere cluster
    const numNodes = 28;
    const radius = 100;
    const nodes: Node3D[] = [];

    // Distribute points evenly on a sphere (Fibonacci lattice)
    for (let i = 0; i < numNodes; i++) {
      const phi = Math.acos(1 - 2 * (i / numNodes));
      const theta = Math.sqrt(numNodes * Math.PI) * phi;
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      nodes.push({ x, y, z, ox: x, oy: y, oz: z });
    }

    let angleX = 0;
    let angleY = 0;
    const focalLength = 300;

    const tick = () => {
      if (!canvas || !ctx) return;
      
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Lerp mouse target for inertia
      mouseCoords.current.x += (targetCoords.current.x - mouseCoords.current.x) * 0.05;
      mouseCoords.current.y += (targetCoords.current.y - mouseCoords.current.y) * 0.05;

      // Base rotation rate + mouse influence
      if (!prefersReducedMotion) {
        angleY += (0.003 + mouseCoords.current.x * 0.008) * speedMultiplier.current;
        angleX += (0.002 + mouseCoords.current.y * 0.008) * speedMultiplier.current;
      }

      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);

      // Project nodes and draw
      const projectedNodes = nodes.map((node) => {
        // Rotate Y
        let x1 = node.ox * cosY - node.oz * sinY;
        let z1 = node.ox * sinY + node.oz * cosY;

        // Rotate X
        let y1 = node.oy * cosX - z1 * sinX;
        let z2 = node.oy * sinX + z1 * cosX;

        // Perspective projection
        const scale = focalLength / (focalLength + z2);
        const projX = centerX + x1 * scale * 1.8;
        const projY = centerY + y1 * scale * 1.8;

        return { x: projX, y: projY, z: z2, scale };
      });

      // Draw connections
      ctx.lineWidth = 0.5;
      for (let i = 0; i < numNodes; i++) {
        for (let j = i + 1; j < numNodes; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];

          // Check distance in 3D
          const dx = n1.ox - n2.ox;
          const dy = n1.oy - n2.oy;
          const dz = n1.oz - n2.oz;
          const dist3D = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist3D < 110) {
            const p1 = projectedNodes[i];
            const p2 = projectedNodes[j];

            // Opacity based on Z-depth (fade distant lines)
            const averageZ = (p1.z + p2.z) / 2;
            const lineOpacity = Math.max(0, 0.15 - (averageZ + radius) / (radius * 4));

            ctx.strokeStyle = `rgba(168, 85, 247, ${lineOpacity})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Draw particle nodes
      projectedNodes.forEach((node) => {
        const nodeSize = Math.max(0.5, (node.scale * 3.5));
        const nodeOpacity = Math.max(0.05, 0.65 - (node.z + radius) / (radius * 3.2));

        // Create glowing gradient for nodes
        const grad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, nodeSize * 2.8);
        grad.addColorStop(0, `rgba(255, 255, 255, ${nodeOpacity})`);
        grad.addColorStop(0.3, `rgba(192, 132, 252, ${nodeOpacity * 0.7})`);
        grad.addColorStop(1, "rgba(139, 92, 246, 0)");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeSize * 2.8, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw a subtle center hologram core
      const coreSize = 35;
      const coreGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreSize * 1.5);
      coreGrad.addColorStop(0, "rgba(232, 121, 166, 0.08)");
      coreGrad.addColorStop(0.5, "rgba(139, 92, 246, 0.03)");
      coreGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, coreSize * 1.5, 0, Math.PI * 2);
      ctx.fill();

      animationId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [prefersReducedMotion]);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
      {/* Blurred background glow */}
      <div className="absolute top-[45%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full bg-violet-600/6 blur-[60px]" />
      <canvas 
        ref={canvasRef} 
        className="w-full h-full max-w-[420px] max-h-[420px] aspect-square object-contain"
        style={{ opacity: 0.85 }} 
      />
    </div>
  );
}
