"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { createTechTatvaEmblem, EmblemMeshGroup } from "./emblem-geometry";

interface HeroPavilionProps {
  scrollProgress?: number;
  onSceneReady?: () => void;
}

export function HeroPavilion({ scrollProgress = 0, onSceneReady }: HeroPavilionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [webGLSupported, setWebGLSupported] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  // Mouse & parallax tracking
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const scrollRef = useRef(scrollProgress);

  useEffect(() => {
    scrollRef.current = scrollProgress;
  }, [scrollProgress]);

  // Pointer movement listener
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

    // Normalize coordinates [-1, 1]
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

    // Check WebGL support
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

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x07090D, 0.038);

    const aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.PerspectiveCamera(36, aspect, 0.1, 100);
    // Initial camera position framing emblem on center-right
    camera.position.set(0.4, 0.6, 11.2);
    const cameraTarget = new THREE.Vector3(1.1, 0.3, 0);
    camera.lookAt(cameraTarget);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });

    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 2. Architectural Pavilion Elements
    const pavilionGroup = new THREE.Group();
    scene.add(pavilionGroup);

    // Reflective Obsidian Floor
    const floorGeom = new THREE.CircleGeometry(26, 64);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x090B10,
      roughness: 0.28,
      metalness: 0.75,
      envMapIntensity: 1.2
    });
    const floorMesh = new THREE.Mesh(floorGeom, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -2.55;
    floorMesh.receiveShadow = true;
    pavilionGroup.add(floorMesh);

    // Circular Dais / Ledge beneath the floating monument
    const daisGeom = new THREE.CylinderGeometry(5.2, 5.5, 0.38, 64);
    const daisMat = new THREE.MeshStandardMaterial({
      color: 0x0E1117,
      roughness: 0.35,
      metalness: 0.6
    });
    const daisMesh = new THREE.Mesh(daisGeom, daisMat);
    daisMesh.position.set(1.1, -2.36, 0);
    daisMesh.receiveShadow = true;
    pavilionGroup.add(daisMesh);

    // Warm Amber Architectural LED Strip around Dais Perimeter
    const rimGeom = new THREE.TorusGeometry(5.22, 0.035, 16, 64);
    const rimMat = new THREE.MeshBasicMaterial({
      color: 0xF59E0B
    });
    const rimMesh = new THREE.Mesh(rimGeom, rimMat);
    rimMesh.rotation.x = Math.PI / 2;
    rimMesh.position.set(1.1, -2.17, 0);
    pavilionGroup.add(rimMesh);

    // Outer concentric floor light ring
    const outerRingGeom = new THREE.TorusGeometry(8.5, 0.02, 16, 64);
    const outerRingMat = new THREE.MeshBasicMaterial({
      color: 0x60A5FA,
      transparent: true,
      opacity: 0.35
    });
    const outerRingMesh = new THREE.Mesh(outerRingGeom, outerRingMat);
    outerRingMesh.rotation.x = Math.PI / 2;
    outerRingMesh.position.set(1.1, -2.52, 0);
    pavilionGroup.add(outerRingMesh);

    // Overhead Circular Oculus / Architectural Skylight Shell
    const oculusShellGeom = new THREE.CylinderGeometry(14, 18, 4.5, 64, 1, true);
    const oculusMat = new THREE.MeshStandardMaterial({
      color: 0x11151F,
      roughness: 0.65,
      metalness: 0.3,
      side: THREE.BackSide
    });
    const oculusShell = new THREE.Mesh(oculusShellGeom, oculusMat);
    oculusShell.position.set(1.1, 7.8, 0);
    pavilionGroup.add(oculusShell);

    // Inner Skylight Warm Light Ring
    const skylightRingGeom = new THREE.TorusGeometry(6.4, 0.06, 16, 64);
    const skylightRingMat = new THREE.MeshBasicMaterial({
      color: 0xFCD34D,
      transparent: true,
      opacity: 0.8
    });
    const skylightRing = new THREE.Mesh(skylightRingGeom, skylightRingMat);
    skylightRing.rotation.x = Math.PI / 2;
    skylightRing.position.set(1.1, 5.8, 0);
    pavilionGroup.add(skylightRing);

    // Architectural Support Columns in background
    const columnGeom = new THREE.BoxGeometry(0.8, 12, 1.4);
    const columnMat = new THREE.MeshStandardMaterial({
      color: 0x0D1016,
      roughness: 0.45,
      metalness: 0.5
    });

    const colLeft = new THREE.Mesh(columnGeom, columnMat);
    colLeft.position.set(-6.8, 1.5, -4.5);
    colLeft.castShadow = true;
    pavilionGroup.add(colLeft);

    const colRight = new THREE.Mesh(columnGeom, columnMat);
    colRight.position.set(8.5, 1.5, -4.5);
    colRight.castShadow = true;
    pavilionGroup.add(colRight);

    // 3. Floating Holographic HUD Glass Blades
    const hudMat = new THREE.MeshPhysicalMaterial({
      color: 0x38BDF8,
      metalness: 0.1,
      roughness: 0.15,
      transmission: 0.88,
      thickness: 0.12,
      transparent: true,
      opacity: 0.32,
      side: THREE.DoubleSide
    });

    const hudBladeGeom = new THREE.PlaneGeometry(1.9, 3.8);
    const hudBlade = new THREE.Mesh(hudBladeGeom, hudMat);
    hudBlade.position.set(4.6, 0.4, -1.8);
    hudBlade.rotation.y = -Math.PI / 7;
    pavilionGroup.add(hudBlade);

    // Subtle cyan wireframe edge for HUD blade
    const wireGeom = new THREE.EdgesGeometry(hudBladeGeom);
    const wireMat = new THREE.LineBasicMaterial({
      color: 0x38BDF8,
      transparent: true,
      opacity: 0.45
    });
    const wireframe = new THREE.LineSegments(wireGeom, wireMat);
    hudBlade.add(wireframe);

    // 4. Authentic TechTatva 3D Extruded Emblem
    const emblemGroup: EmblemMeshGroup = createTechTatvaEmblem();
    emblemGroup.group.position.set(1.2, 0.3, 0);
    scene.add(emblemGroup.group);

    // 5. Cinematic Lighting Rig
    // Key Light: Natural daylight pouring from the skylight (cool daylight white)
    const keyLight = new THREE.DirectionalLight(0xF0F6FF, 3.4);
    keyLight.position.set(7.5, 14, 5.5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 30;
    keyLight.shadow.bias = -0.0004;
    keyLight.shadow.camera.left = -6;
    keyLight.shadow.camera.right = 6;
    keyLight.shadow.camera.top = 6;
    keyLight.shadow.camera.bottom = -6;
    scene.add(keyLight);

    // Fill Light: Soft atmospheric blue from opposite side
    const fillLight = new THREE.DirectionalLight(0x7EA5D3, 1.2);
    fillLight.position.set(-8, 6, 3);
    scene.add(fillLight);

    // Warm Architectural Ambient Glow beneath dais
    const daisGlow = new THREE.PointLight(0xF59E0B, 2.2, 14, 1.5);
    daisGlow.position.set(1.1, -1.9, 0);
    scene.add(daisGlow);

    // Cyan Specular Edge Catcher on emblem
    const cyanRim = new THREE.PointLight(0x38BDF8, 1.8, 12, 1.8);
    cyanRim.position.set(-2.5, 2.8, -1.5);
    scene.add(cyanRim);

    // Ambient baseline
    const ambientLight = new THREE.AmbientLight(0x0C101A, 1.6);
    scene.add(ambientLight);

    // 6. Resize handling
    const handleResize = () => {
      if (!container || !renderer) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener("resize", handleResize);

    // Notify scene is ready
    setIsLoaded(true);
    onSceneReady?.();

    // 7. Render Loop with Smooth Spring Interpolation
    let animId: number;
    let clock = new THREE.Clock();

    const render = () => {
      animId = requestAnimationFrame(render);

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Smooth pointer interpolation
      const m = mouseRef.current;
      m.x += (m.targetX - m.x) * 0.045;
      m.y += (m.targetY - m.y) * 0.045;

      // Camera parallax response: subtle, cinematic, constrained
      const scroll = scrollRef.current;
      const cameraBaseX = 0.4 + (m.x * 0.5) - (scroll * 0.8);
      const cameraBaseY = 0.6 + (m.y * 0.35) - (scroll * 1.4);
      const cameraBaseZ = 11.2 - (scroll * 2.8);

      camera.position.x += (cameraBaseX - camera.position.x) * 0.06;
      camera.position.y += (cameraBaseY - camera.position.y) * 0.06;
      camera.position.z += (cameraBaseZ - camera.position.z) * 0.06;

      const targetX = 1.1 + (m.x * 0.15);
      const targetY = 0.3 + (m.y * 0.1) - (scroll * 0.5);
      cameraTarget.set(targetX, targetY, 0);
      camera.lookAt(cameraTarget);

      // Update 3D Emblem animation
      emblemGroup.update(time, scroll);

      // Subtle float on HUD blade
      hudBlade.position.y = 0.4 + Math.sin(time * 0.7) * 0.05;

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(render);

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      emblemGroup.dispose();
      renderer.dispose();
      floorGeom.dispose();
      floorMat.dispose();
      daisGeom.dispose();
      daisMat.dispose();
      rimGeom.dispose();
      rimMat.dispose();
      outerRingGeom.dispose();
      outerRingMat.dispose();
      oculusShellGeom.dispose();
      oculusMat.dispose();
      columnGeom.dispose();
      columnMat.dispose();
      hudBladeGeom.dispose();
      hudMat.dispose();
    };
  }, [onSceneReady]);

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
      {/* Three.js Canvas */}
      <canvas
        ref={canvasRef}
        className={`w-full h-full transition-opacity duration-1000 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Fallback if WebGL is disabled */}
      {!webGLSupported && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0D14] via-[#07090D] to-[#040507] flex items-center justify-center">
          <div className="relative w-80 h-80 rounded-full border border-blue-500/20 bg-blue-500/5 backdrop-blur-xl flex items-center justify-center shadow-[0_0_80px_rgba(59,130,246,0.15)]">
            <div className="w-48 h-48 rounded-full border border-amber-500/20 bg-amber-500/5 animate-pulse" />
          </div>
        </div>
      )}
    </div>
  );
}
