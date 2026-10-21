"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";

interface HeroPavilionProps {
  scrollProgress?: number;
  onSceneReady?: () => void;
}

export function HeroPavilion({ scrollProgress = 0, onSceneReady }: HeroPavilionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const [webGLSupported, setWebGLSupported] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  // Mouse & parallax tracking
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const scrollRef = useRef(scrollProgress);

  useEffect(() => {
    scrollRef.current = scrollProgress;
  }, [scrollProgress]);

  // Pointer movement listener with smooth dampening
  const handlePointerMove = useCallback((e: MouseEvent | TouchEvent) => {
    let clientX = 0;
    let clientY = 0;

    if ("touches" in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ("clientX" in e) {
      clientX = (e as MouseEvent).clientX;
      clientY = (e as MouseEvent).clientY;
    }

    const x = (clientX / window.innerWidth) * 2 - 1;
    const y = -(clientY / window.innerHeight) * 2 + 1;
    mouseRef.current.targetX = x;
    mouseRef.current.targetY = y;
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handlePointerMove, { passive: true });
    window.addEventListener("touchmove", handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("touchmove", handlePointerMove);
    };
  }, [handlePointerMove]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    try {
      const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
      if (!gl) {
        setWebGLSupported(false);
        return;
      }
    } catch {
      setWebGLSupported(false);
      return;
    }

    // 1. Three.js Scene, Camera, Renderer
    const scene = new THREE.Scene();

    const aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.PerspectiveCamera(36, aspect, 0.1, 100);
    camera.position.set(0, 0, 10.5);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });

    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;

    // 2. Interactive 3D Orbital Light Filaments (wrapping around the monument)
    const orbitGroup = new THREE.Group();
    // Position orbital group right over the central sculpture
    orbitGroup.position.set(1.4, 0.35, 0);

    function createOrbitRing(radiusX: number, radiusY: number, tiltX: number, tiltY: number, colorHex: string, opacity = 0.5) {
      const curve = new THREE.EllipseCurve(0, 0, radiusX, radiusY, 0, 2 * Math.PI, false, 0);
      const points = curve.getPoints(120);
      const geom = new THREE.BufferGeometry().setFromPoints(
        points.map(p => new THREE.Vector3(p.x, p.y, 0))
      );
      const mat = new THREE.LineBasicMaterial({
        color: new THREE.Color(colorHex),
        transparent: true,
        opacity,
        blending: THREE.AdditiveBlending
      });
      const line = new THREE.Line(geom, mat);
      line.rotation.x = tiltX;
      line.rotation.y = tiltY;
      return line;
    }

    // Cyan-white primary orbital ring
    const orbit1 = createOrbitRing(2.8, 1.8, Math.PI / 3.2, Math.PI / 5.5, "#93C5FD", 0.65);
    // Warm golden secondary orbital ring
    const orbit2 = createOrbitRing(2.5, 1.5, -Math.PI / 3.8, -Math.PI / 4.2, "#FDE68A", 0.5);
    // Fine outer cyan ring
    const orbit3 = createOrbitRing(3.1, 2.1, Math.PI / 2.2, -Math.PI / 7, "#67E8F9", 0.35);

    orbitGroup.add(orbit1);
    orbitGroup.add(orbit2);
    orbitGroup.add(orbit3);
    scene.add(orbitGroup);

    // 3. Floating ambient daylight micro-particles in sunbeam
    const particleCount = 45;
    const particleGeom = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const r = 1.2 + Math.random() * 2.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI * 0.9;
      particlePositions[i * 3 + 0] = 1.4 + r * Math.cos(theta) * Math.cos(phi);
      particlePositions[i * 3 + 1] = 0.35 + r * Math.sin(phi);
      particlePositions[i * 3 + 2] = r * Math.sin(theta) * Math.cos(phi);
    }

    particleGeom.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: new THREE.Color("#E0F2FE"),
      size: 0.045,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particleGeom, particleMat);
    scene.add(particles);

    // 4. Resize Handling
    const handleResize = () => {
      if (!container || !renderer) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      if (width < 768) {
        orbitGroup.position.set(0, 0.4, 0);
      } else {
        orbitGroup.position.set(1.4, 0.35, 0);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    setIsLoaded(true);
    onSceneReady?.();

    // 5. Render Loop with Smooth Multi-plane Parallax
    let animId: number;
    let clock = new THREE.Clock();

    const render = () => {
      animId = requestAnimationFrame(render);

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Smooth mouse interpolation
      const m = mouseRef.current;
      m.x += (m.targetX - m.x) * 0.05;
      m.y += (m.targetY - m.y) * 0.05;

      const scroll = scrollRef.current;

      // Multi-plane parallax: shift the background image slightly
      if (bgRef.current) {
        const bgShiftX = -m.x * 12;
        const bgShiftY = m.y * 8;
        bgRef.current.style.transform = `scale(1.04) translate3d(${bgShiftX}px, ${bgShiftY}px, 0)`;
      }

      // 3D Orbital filaments animation & parallax
      orbit1.rotation.z = time * 0.12;
      orbit2.rotation.z = -time * 0.09;
      orbit3.rotation.z = time * 0.06;

      // Subtle parallax on 3D elements
      orbitGroup.rotation.y = m.x * 0.15;
      orbitGroup.rotation.x = -m.y * 0.1;

      // Slowly drift sunbeam particles
      particles.rotation.y = time * 0.03;

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      particleGeom.dispose();
      particleMat.dispose();
    };
  }, [onSceneReady]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0 overflow-hidden select-none bg-black"
    >
      {/* 
        EXPANSIVE ARCHITECTURAL PAVILION ENVIRONMENT
        Master Artwork featuring the sweeping circular skylight, natural daylight,
        sunlit tree canopy, Chandigarh University campus, polished dark obsidian floor
        with circular dais, warm glowing amber LED perimeter strip, seated student silhouette,
        semi-transparent holographic HUD blade, and illuminated 3D TechTatva sculpture.
      */}
      <div
        ref={bgRef}
        className="absolute inset-0 bg-cover bg-center md:bg-[center_right] pointer-events-none will-change-transform transition-transform duration-300 ease-out"
        style={{
          backgroundImage: "url('/cinematic/hero-pavilion-master.jpg')",
          transform: "scale(1.04)"
        }}
      />

      {/* Deep, Soft Architectural Interior Shadow on Left (Editorial Typography Backdrop) */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent pointer-events-none z-[1]" />
      
      {/* Subtle Bottom Vignette for Clean Floor Blend */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#060709] to-transparent pointer-events-none z-[2]" />

      {/* Real Three.js WebGL 3D Canvas Rendering Interactive Orbital Filaments & Micro-Particles */}
      <canvas
        ref={canvasRef}
        className="relative z-[3] w-full h-full pointer-events-none"
      />
    </div>
  );
}
