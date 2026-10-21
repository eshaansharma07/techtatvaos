import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";

// Exact vector paths from authentic TechTatva logo (public/logo-colour.svg)
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
  topMesh: THREE.Mesh;
  leftMesh: THREE.Mesh;
  rightMesh: THREE.Mesh;
  orbitGroup: THREE.Group;
  update: (time: number, scrollProgress?: number) => void;
  dispose: () => void;
}

/**
 * Creates the monumental 3D TechTatva sculpture with authentic geometry,
 * brushed titanium/graphite PBR materials, beveled architectural edges,
 * and delicate floating orbital filaments.
 */
export function createTechTatvaEmblem(): EmblemMeshGroup {
  const group = new THREE.Group();
  const loader = new SVGLoader();

  // Common extrusion settings for architectural monument look
  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: 0.52,
    bevelEnabled: true,
    bevelSegments: 6,
    steps: 1,
    bevelSize: 0.06,
    bevelThickness: 0.06,
    curveSegments: 32
  };

  // SVG coordinate center is at (540, 540) in a 1080x1080 canvas
  const SVG_CENTER_X = 540;
  const SVG_CENTER_Y = 540;
  const TARGET_SCALE = 0.0052; // Scales ~1000px SVG to ~5.2 world units

  function parsePathToGeometry(pathStr: string): THREE.ExtrudeGeometry {
    const svgNode = `<svg xmlns="http://www.w3.org/2000/svg"><path d="${pathStr}"/></svg>`;
    const parsed = loader.parse(svgNode);
    const shapes: THREE.Shape[] = [];

    for (const p of parsed.paths) {
      shapes.push(...p.toShapes());
    }

    if (shapes.length === 0) {
      // Fallback simple triangle shape if parser returns empty
      const fallbackShape = new THREE.Shape();
      fallbackShape.moveTo(0, 200);
      fallbackShape.lineTo(200, -200);
      fallbackShape.lineTo(-200, -200);
      fallbackShape.closePath();
      shapes.push(fallbackShape);
    }

    // Transform shapes: center around (540, 540) and invert Y (SVG down is +Y, 3D up is +Y)
    for (const shape of shapes) {
      const points = shape.getPoints();
      for (const pt of points) {
        pt.x = (pt.x - SVG_CENTER_X) * TARGET_SCALE;
        pt.y = -(pt.y - SVG_CENTER_Y) * TARGET_SCALE;
      }
      // Rebuild shape from transformed points
      shape.curves = [];
      shape.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        shape.lineTo(points[i].x, points[i].y);
      }
      shape.closePath();
    }

    const geom = new THREE.ExtrudeGeometry(shapes, extrudeSettings);
    geom.computeVertexNormals();
    geom.center(); // Center the pivot exactly inside the extruded mesh
    return geom;
  }

  // 1. Materials: Museum-grade brushed graphite titanium
  // With subtle color grading per sector reflecting the authentic TechTatva blue, violet, and amber hues
  const topMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#1A1F2B"), // Deep titanium blue-slate
    metalness: 0.92,
    roughness: 0.24,
    clearcoat: 0.35,
    clearcoatRoughness: 0.18,
    reflectivity: 0.85,
    envMapIntensity: 1.4,
    emissive: new THREE.Color("#0D1A30"),
    emissiveIntensity: 0.25
  });

  const leftMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#211929"), // Deep titanium obsidian-violet
    metalness: 0.90,
    roughness: 0.26,
    clearcoat: 0.35,
    clearcoatRoughness: 0.2,
    reflectivity: 0.8,
    envMapIntensity: 1.3,
    emissive: new THREE.Color("#1F0A2B"),
    emissiveIntensity: 0.25
  });

  const rightMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#261E17"), // Deep titanium obsidian-amber
    metalness: 0.93,
    roughness: 0.23,
    clearcoat: 0.4,
    clearcoatRoughness: 0.16,
    reflectivity: 0.85,
    envMapIntensity: 1.5,
    emissive: new THREE.Color("#291305"),
    emissiveIntensity: 0.3
  });

  // Build the 3 extruded meshes
  const topGeom = parsePathToGeometry(TECHTATVA_PATHS.top);
  const leftGeom = parsePathToGeometry(TECHTATVA_PATHS.bottomLeft);
  const rightGeom = parsePathToGeometry(TECHTATVA_PATHS.bottomRight);

  const topMesh = new THREE.Mesh(topGeom, topMaterial);
  const leftMesh = new THREE.Mesh(leftGeom, leftMaterial);
  const rightMesh = new THREE.Mesh(rightGeom, rightMaterial);

  // Position offsets relative to monument center
  topMesh.position.set(0, 1.15, 0);
  leftMesh.position.set(-1.08, -0.95, 0);
  rightMesh.position.set(1.08, -0.95, 0);

  // Shadow casting
  topMesh.castShadow = true;
  topMesh.receiveShadow = true;
  leftMesh.castShadow = true;
  leftMesh.receiveShadow = true;
  rightMesh.castShadow = true;
  rightMesh.receiveShadow = true;

  const emblemCore = new THREE.Group();
  emblemCore.add(topMesh);
  emblemCore.add(leftMesh);
  emblemCore.add(rightMesh);
  group.add(emblemCore);

  // 2. Orbital Glowing Filament Rings (as seen in the reference screenshot)
  const orbitGroup = new THREE.Group();

  function createOrbitRing(radiusX: number, radiusY: number, tiltX: number, tiltY: number, colorHex: string) {
    const curve = new THREE.EllipseCurve(0, 0, radiusX, radiusY, 0, 2 * Math.PI, false, 0);
    const points = curve.getPoints(90);
    const geom = new THREE.BufferGeometry().setFromPoints(
      points.map(p => new THREE.Vector3(p.x, p.y, 0))
    );
    const mat = new THREE.LineBasicMaterial({
      color: new THREE.Color(colorHex),
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending
    });
    const line = new THREE.Line(geom, mat);
    line.rotation.x = tiltX;
    line.rotation.y = tiltY;
    return line;
  }

  // Cyan-blue main orbital ring
  const orbit1 = createOrbitRing(3.2, 2.0, Math.PI / 3, Math.PI / 6, "#60A5FA");
  // Amber warm complementary ring
  const orbit2 = createOrbitRing(2.9, 1.7, -Math.PI / 4, -Math.PI / 5, "#F59E0B");
  // Ultra-fine outer ring
  const orbit3 = createOrbitRing(3.6, 2.4, Math.PI / 2.5, -Math.PI / 8, "#A78BFA");

  orbitGroup.add(orbit1);
  orbitGroup.add(orbit2);
  orbitGroup.add(orbit3);
  group.add(orbitGroup);

  // 3. Floating luminous energy dust particles
  const particleCount = 45;
  const particleGeom = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  const particleScales = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    const r = 1.2 + Math.random() * 2.8;
    const theta = Math.random() * Math.PI * 2;
    const phi = (Math.random() - 0.5) * Math.PI * 0.9;
    particlePositions[i * 3 + 0] = r * Math.cos(theta) * Math.cos(phi);
    particlePositions[i * 3 + 1] = r * Math.sin(phi);
    particlePositions[i * 3 + 2] = r * Math.sin(theta) * Math.cos(phi);
    particleScales[i] = Math.random();
  }

  particleGeom.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: new THREE.Color("#93C5FD"),
    size: 0.05,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending
  });
  const particles = new THREE.Points(particleGeom, particleMat);
  group.add(particles);

  // Continuous subtle animation update
  function update(time: number, scrollProgress = 0) {
    // Gentle breathing levitation
    const levitate = Math.sin(time * 0.9) * 0.08;
    emblemCore.position.y = levitate;

    // Subtle isometric oscillation that catches highlights
    const baseRotY = Math.sin(time * 0.35) * 0.08 + (scrollProgress * 0.4);
    const baseRotX = Math.cos(time * 0.45) * 0.05 - (scrollProgress * 0.15);
    emblemCore.rotation.y = baseRotY;
    emblemCore.rotation.x = baseRotX;

    // Slowly rotate orbital filaments
    orbit1.rotation.z = time * 0.12;
    orbit2.rotation.z = -time * 0.09;
    orbit3.rotation.z = time * 0.06;

    // Slowly drift particles
    particles.rotation.y = time * 0.04;
    particles.rotation.x = Math.sin(time * 0.02) * 0.05;
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
    topMesh,
    leftMesh,
    rightMesh,
    orbitGroup,
    update,
    dispose
  };
}
