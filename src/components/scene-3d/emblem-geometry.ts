import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";

// Authentic TechTatva vector paths from public/logo-colour.svg
const TECHTATVA_PATHS = {
  // Top triangular apex block (Brain sector)
  top: "M571.06,40.52l263.19,443.91c4.48,7.56-.99,17.11-9.77,17.08l-566.35-2.11c-8.66-.03-14.07-9.39-9.78-16.91L497.21,46.12c.33-.57.7-1.13,1.12-1.64,19.61-23.89,47.2-27.63,70.58-6.59.84.76,1.56,1.66,2.14,2.64Z",
  // Bottom-left block (Lotus sector)
  bottomLeft: "M525.76,942.5c0,11.11-9.01,20.12-20.12,20.12H86.19c-45.61,0-83.59-64.35-59.94-105.14l197.58-328.08c3.64-6.05,10.18-9.74,17.24-9.74h264.56c11.11,0,20.12,9.01,20.12,20.12v402.71Z",
  // Bottom-right block (AI Profile sector)
  bottomRight: "M546.1,942.53c0-70.24.02-305.9,0-405.27,0-10.97,8.89-19.86,19.87-19.86h273.85c7.05,0,13.57,3.73,17.14,9.81l184.12,313.54c.22.38.47.75.72,1.12,32.73,46.84.7,120.75-58.39,120.75h-417.21c-11.1,0-20.1-8.99-20.1-20.09Z"
};

export interface EmblemMeshGroup {
  group: THREE.Group;
  update: (time: number, scrollProgress?: number) => void;
  dispose: () => void;
}

/**
 * Creates the monumental 3D TechTatva sculpture matching the architectural reference artwork.
 * Uses genuine vector paths with brushed titanium / steel metallic materials,
 * beveled architectural facets catching daylight, and floating orbital filament rings.
 */
export function createTechTatvaEmblem(): EmblemMeshGroup {
  const group = new THREE.Group();
  const loader = new SVGLoader();

  // Architectural sculpture extrusion parameters: thick slab with crisp beveled edges
  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: 0.65,
    bevelEnabled: true,
    bevelSegments: 5,
    steps: 1,
    bevelSize: 0.06,
    bevelThickness: 0.06,
    curveSegments: 36
  };

  // Center of mass for the combined logo in SVG coordinates (1080x1080 viewBox)
  const SVG_CENTER_X = 540;
  const SVG_CENTER_Y = 510;
  const TARGET_SCALE = 0.0048; // Scales ~1000px logo to ~4.8 world units

  function parsePath(pathStr: string): THREE.ExtrudeGeometry {
    const svgNode = `<svg xmlns="http://www.w3.org/2000/svg"><path d="${pathStr}"/></svg>`;
    const parsed = loader.parse(svgNode);
    const shapes: THREE.Shape[] = [];

    for (const p of parsed.paths) {
      shapes.push(...p.toShapes());
    }

    if (shapes.length === 0) {
      const fallbackShape = new THREE.Shape();
      fallbackShape.moveTo(0, 1.5);
      fallbackShape.lineTo(1.5, -1.5);
      fallbackShape.lineTo(-1.5, -1.5);
      fallbackShape.closePath();
      shapes.push(fallbackShape);
    }

    const geom = new THREE.ExtrudeGeometry(shapes, extrudeSettings);
    geom.computeVertexNormals();

    // Scale and center around the emblem's true center of mass
    // Invert Y because SVG +Y is downwards while WebGL +Y is upwards
    geom.scale(TARGET_SCALE, -TARGET_SCALE, TARGET_SCALE);
    geom.translate(-SVG_CENTER_X * TARGET_SCALE, SVG_CENTER_Y * TARGET_SCALE, -0.32);

    return geom;
  }

  // Museum-grade brushed titanium and metallic steel materials
  // High metalness and controlled roughness so daylight from above creates brilliant silvery specular highlights
  const topMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#CBD5E1"), // Bright titanium steel
    metalness: 0.92,
    roughness: 0.18,
    clearcoat: 0.65,
    clearcoatRoughness: 0.12,
    reflectivity: 0.95,
    envMapIntensity: 2.4
  });

  const leftMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#C0C8D8"), // Cool steel titanium
    metalness: 0.90,
    roughness: 0.20,
    clearcoat: 0.60,
    clearcoatRoughness: 0.15,
    reflectivity: 0.90,
    envMapIntensity: 2.2
  });

  const rightMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#D4D4D8"), // Silver gunmetal
    metalness: 0.94,
    roughness: 0.17,
    clearcoat: 0.70,
    clearcoatRoughness: 0.12,
    reflectivity: 0.95,
    envMapIntensity: 2.5
  });

  const topGeom = parsePath(TECHTATVA_PATHS.top);
  const leftGeom = parsePath(TECHTATVA_PATHS.bottomLeft);
  const rightGeom = parsePath(TECHTATVA_PATHS.bottomRight);

  const topMesh = new THREE.Mesh(topGeom, topMaterial);
  const leftMesh = new THREE.Mesh(leftGeom, leftMaterial);
  const rightMesh = new THREE.Mesh(rightGeom, rightMaterial);

  topMesh.castShadow = true;
  topMesh.receiveShadow = true;
  leftMesh.castShadow = true;
  leftMesh.receiveShadow = true;
  rightMesh.castShadow = true;
  rightMesh.receiveShadow = true;

  const monument = new THREE.Group();
  monument.add(topMesh);
  monument.add(leftMesh);
  monument.add(rightMesh);
  group.add(monument);

  // 2. Orbital Glowing Filament Rings (matching reference image)
  const orbitGroup = new THREE.Group();

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

  // Cyan-white primary orbital filament
  const orbit1 = createOrbitRing(2.8, 1.8, Math.PI / 3.2, Math.PI / 5.5, "#93C5FD", 0.65);
  // Warm golden secondary filament
  const orbit2 = createOrbitRing(2.5, 1.5, -Math.PI / 3.8, -Math.PI / 4.2, "#FDE68A", 0.45);
  // Fine outer atmospheric ring
  const orbit3 = createOrbitRing(3.1, 2.1, Math.PI / 2.2, -Math.PI / 7, "#67E8F9", 0.35);

  orbitGroup.add(orbit1);
  orbitGroup.add(orbit2);
  orbitGroup.add(orbit3);
  group.add(orbitGroup);

  // 3. Floating ambient daylight micro-particles
  const particleCount = 35;
  const particleGeom = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    const r = 1.0 + Math.random() * 2.2;
    const theta = Math.random() * Math.PI * 2;
    const phi = (Math.random() - 0.5) * Math.PI;
    particlePositions[i * 3 + 0] = r * Math.cos(theta) * Math.cos(phi);
    particlePositions[i * 3 + 1] = r * Math.sin(phi);
    particlePositions[i * 3 + 2] = r * Math.sin(theta) * Math.cos(phi);
  }

  particleGeom.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: new THREE.Color("#E0F2FE"),
    size: 0.04,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
  });
  const particles = new THREE.Points(particleGeom, particleMat);
  group.add(particles);

  // Animation update: restrained, majestic, cinematic
  function update(time: number, scrollProgress = 0) {
    // Subtle breathing float
    const floatY = Math.sin(time * 0.8) * 0.06;
    monument.position.y = floatY;

    // Gentle rotation that sweeps daylight across the facets
    const rotY = Math.sin(time * 0.25) * 0.07 + (scrollProgress * 0.35);
    const rotX = Math.cos(time * 0.3) * 0.04 - (scrollProgress * 0.12);
    monument.rotation.y = rotY;
    monument.rotation.x = rotX;

    // Slowly rotate filaments
    orbit1.rotation.z = time * 0.1;
    orbit2.rotation.z = -time * 0.08;
    orbit3.rotation.z = time * 0.05;

    // Slowly drift particles
    particles.rotation.y = time * 0.03;
  }

  function dispose() {
    topGeom.dispose();
    leftGeom.dispose();
    rightGeom.dispose();
    topMaterial.dispose();
    leftMaterial.dispose();
    rightMaterial.dispose();
    particleGeom.dispose();
    particleMat.dispose();
  }

  return {
    group,
    update,
    dispose
  };
}
