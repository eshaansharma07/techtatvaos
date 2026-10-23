"use client";

import { useEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   WireframeMesh — 3D Perspective Undulating Wave Mesh Terrain
   Inspired by Vanta.js WAVES / MESH / NET.
   Flows forward with organic wave kinematics, subtle mouse parallax,
   triangulated wireframe facets, and glowing crest nodes.
   Tuned to TechTatva's violet / lavender / magenta / ink palette.
   ───────────────────────────────────────────────────────────────────────────── */

interface MeshPoint {
  screenX: number;
  screenY: number;
  depth: number;
  height: number;
  edgeAlpha: number;
}

export function WireframeMesh() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const mouseTargetRef = useRef({ x: 0.5, y: 0.5 });
  const mousePosRef = useRef({ x: 0.5, y: 0.5 });
  const scrollOffsetRef = useRef(0);
  const timeRef = useRef(0);
  const rafRef = useRef<number>(0);

  /* ── Reduced motion check ── */
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  /* ── Mouse move for smooth parallax ── */
  useEffect(() => {
    if (reducedMotion) return;
    const onMove = (e: MouseEvent) => {
      mouseTargetRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [reducedMotion]);

  /* ── Canvas Animation Loop ── */
  useEffect(() => {
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const tick = () => {
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      const isMobile = w < 768;

      if (document.visibilityState === "hidden") {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      ctx.clearRect(0, 0, w, h);

      // Smooth mouse lerp
      mousePosRef.current.x += (mouseTargetRef.current.x - mousePosRef.current.x) * 0.04;
      mousePosRef.current.y += (mouseTargetRef.current.y - mousePosRef.current.y) * 0.04;

      const time = (timeRef.current += 0.012);
      scrollOffsetRef.current += 0.28;
      const scrollZ = scrollOffsetRef.current;

      // Camera parameters
      const cols = isMobile ? 22 : 36;
      const rows = isMobile ? 18 : 28;
      const cellSize = isMobile ? 36 : 30;
      const focalLength = 340;
      const horizonY = h * 0.52;
      const cameraHeight = 155 + (mousePosRef.current.y - 0.5) * 35;
      const cameraSwayX = (mousePosRef.current.x - 0.5) * 70;
      const halfWidth = (cols * cellSize) / 2;

      const nearZ = 120;
      const farZ = nearZ + rows * cellSize;

      // Project 3D point to 2D screen coordinates
      const project = (
        wx: number,
        wy: number,
        wz: number,
        colIdx: number,
        rowIdx: number
      ): MeshPoint | null => {
        const cz = wz;
        if (cz <= 10) return null;

        const scale = focalLength / cz;
        const cx = wx - cameraSwayX;
        const cy = cameraHeight - wy;

        const screenX = w / 2 + cx * scale;
        const screenY = horizonY + cy * scale;

        // Depth fade: fade near horizon (farZ) and fade near bottom camera cutoff (nearZ)
        const depthFraction = (cz - nearZ) / (farZ - nearZ);
        let depthAlpha = 1;
        if (depthFraction < 0.15) {
          depthAlpha = depthFraction / 0.15;
        } else if (depthFraction > 0.6) {
          depthAlpha = Math.max(0, 1 - (depthFraction - 0.6) / 0.4);
        }

        // Horizontal edge fade (vignette so edges dissolve naturally)
        const colFraction = colIdx / cols;
        let edgeAlpha = 1;
        if (colFraction < 0.18) {
          edgeAlpha = colFraction / 0.18;
        } else if (colFraction > 0.82) {
          edgeAlpha = (1 - colFraction) / 0.18;
        }

        const totalAlpha = Math.max(0, Math.min(1, depthAlpha * edgeAlpha));

        return {
          screenX,
          screenY,
          depth: cz,
          height: wy,
          edgeAlpha: totalAlpha,
        };
      };

      // Organic wave height function
      const getWaveHeight = (c: number, r: number) => {
        const worldX = c * 0.14;
        const worldZ = (r * cellSize + scrollZ) * 0.012;
        return (
          Math.sin(worldX + time * 0.8) * 11 +
          Math.cos(worldZ + time * 0.6) * 9 +
          Math.sin((worldX + worldZ) * 0.6 + time * 0.4) * 6
        );
      };

      // Build projected grid
      const grid: (MeshPoint | null)[][] = [];
      for (let r = 0; r <= rows; r++) {
        const row: (MeshPoint | null)[] = [];
        const wz = nearZ + r * cellSize;
        for (let c = 0; c <= cols; c++) {
          const wx = c * cellSize - halfWidth;
          const wy = getWaveHeight(c, r);
          row.push(project(wx, wy, wz, c, r));
        }
        grid.push(row);
      }

      // Draw wireframe grid lines
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const p = grid[r][c];
          const pRight = grid[r][c + 1];
          const pDown = grid[r + 1][c];
          const pDiag = grid[r + 1][c + 1];

          if (!p || p.edgeAlpha <= 0.01) continue;

          // Main horizontal line
          if (pRight && pRight.edgeAlpha > 0.01) {
            const alpha = Math.min(p.edgeAlpha, pRight.edgeAlpha) * 0.12;
            if (alpha > 0.005) {
              ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`; // TechTatva violet
              ctx.lineWidth = Math.max(0.4, 1.2 * (1 - p.depth / farZ));
              ctx.beginPath();
              ctx.moveTo(p.screenX, p.screenY);
              ctx.lineTo(pRight.screenX, pRight.screenY);
              ctx.stroke();
            }
          }

          // Main longitudinal / depth line
          if (pDown && pDown.edgeAlpha > 0.01) {
            const alpha = Math.min(p.edgeAlpha, pDown.edgeAlpha) * 0.14;
            if (alpha > 0.005) {
              // Subtle gradient towards purple at crests
              const isCrest = (p.height + pDown.height) / 2 > 6;
              const rCol = isCrest ? 168 : 139;
              const gCol = isCrest ? 85 : 92;
              const bCol = isCrest ? 247 : 246;

              ctx.strokeStyle = `rgba(${rCol}, ${gCol}, ${bCol}, ${alpha})`;
              ctx.lineWidth = Math.max(0.4, 1.3 * (1 - p.depth / farZ));
              ctx.beginPath();
              ctx.moveTo(p.screenX, p.screenY);
              ctx.lineTo(pDown.screenX, pDown.screenY);
              ctx.stroke();
            }
          }

          // Diagonal wireframe line for triangular facets (fainter)
          if (!isMobile && pDiag && pDiag.edgeAlpha > 0.01) {
            const alpha = Math.min(p.edgeAlpha, pDiag.edgeAlpha) * 0.045;
            if (alpha > 0.003) {
              ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`;
              ctx.lineWidth = 0.4;
              ctx.beginPath();
              ctx.moveTo(p.screenX, p.screenY);
              ctx.lineTo(pDiag.screenX, pDiag.screenY);
              ctx.stroke();
            }
          }

          // Glowing crest nodes on highest points of the mesh
          if (p.height > 8 && p.edgeAlpha > 0.35 && (c % 2 === 0 || isMobile)) {
            const nodeAlpha = (p.edgeAlpha * (p.height - 8)) / 14;
            const radius = Math.max(1, 2.5 * (1 - p.depth / farZ));

            const grad = ctx.createRadialGradient(
              p.screenX,
              p.screenY,
              0,
              p.screenX,
              p.screenY,
              radius * 2.8
            );
            grad.addColorStop(0, `rgba(216, 195, 255, ${nodeAlpha * 0.6})`);
            grad.addColorStop(0.5, `rgba(168, 85, 247, ${nodeAlpha * 0.25})`);
            grad.addColorStop(1, "rgba(139, 92, 246, 0)");

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(p.screenX, p.screenY, radius * 2.8, 0, Math.PI * 2);
            ctx.fill();

            // Core dot
            ctx.fillStyle = `rgba(255, 255, 255, ${nodeAlpha * 0.7})`;
            ctx.beginPath();
            ctx.arc(p.screenX, p.screenY, radius * 0.6, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    // Pause when document is hidden
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
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[-1]"
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        maskImage: "linear-gradient(to bottom, transparent 30%, black 50%, black 85%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to bottom, transparent 30%, black 50%, black 85%, transparent 100%)",
      }}
    />
  );
}
