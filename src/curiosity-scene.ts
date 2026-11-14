import * as THREE from "three";

/** The caller owns the only animation loop. This module never schedules frames. */
export function createCuriosityScene(
  canvas: HTMLCanvasElement,
  centered = false,
) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.z = 10;
  const field = new THREE.Group();
  scene.add(field);

  // A knotted surface: a continuous path with no obvious beginning or end.
  const geometry = new THREE.TorusKnotGeometry(1.35, 0.38, 220, 24, 2, 3);
  const material = new THREE.MeshPhysicalMaterial({
    color: 0x596d32,
    metalness: 0.78,
    roughness: 0.3,
    clearcoat: 1,
    clearcoatRoughness: 0.22,
  });
  const knot = new THREE.Mesh(geometry, material);
  field.add(knot);
  const wireMaterial = new THREE.MeshBasicMaterial({
    color: 0xd7f5a2,
    wireframe: true,
    transparent: true,
    opacity: 0.14,
  });
  const wire = new THREE.Mesh(geometry, wireMaterial);
  wire.scale.setScalar(1.003);
  field.add(wire);
  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.35, 1),
    new THREE.MeshBasicMaterial({
      color: 0xdfff94,
      wireframe: true,
      transparent: true,
      opacity: 0.7,
    }),
  );
  field.add(core);

  const count = 370;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
    const theta = i * Math.PI * (3 - Math.sqrt(5));
    const radius = 2.25 + 0.2 * Math.sin(i * 13.7);
    positions.set(
      [
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi),
      ],
      i * 3,
    );
  }
  const pointsGeometry = new THREE.BufferGeometry();
  pointsGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3),
  );
  const pointsMaterial = new THREE.PointsMaterial({
    color: 0xd6eba1,
    size: 0.018,
    transparent: true,
    opacity: 0.65,
    sizeAttenuation: true,
  });
  const points = new THREE.Points(pointsGeometry, pointsMaterial);
  field.add(points);

  const linePositions: number[] = [];
  for (let i = 0; i < count; i += 3) {
    for (let j = i + 1; j < count; j += 5) {
      const a = new THREE.Vector3().fromArray(positions, i * 3);
      const b = new THREE.Vector3().fromArray(positions, j * 3);
      if (a.distanceTo(b) < 0.55)
        linePositions.push(...a.toArray(), ...b.toArray());
    }
  }
  const linesGeometry = new THREE.BufferGeometry();
  linesGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(linePositions, 3),
  );
  const linesMaterial = new THREE.LineBasicMaterial({
    color: 0x9dbc6a,
    transparent: true,
    opacity: 0.13,
  });
  field.add(new THREE.LineSegments(linesGeometry, linesMaterial));

  const rings = new THREE.Group();
  const ringMaterial = new THREE.LineBasicMaterial({
    color: 0xa2b789,
    transparent: true,
    opacity: 0.28,
  });
  for (let i = 0; i < 3; i++) {
    const curve = new THREE.EllipseCurve(
      0,
      0,
      2.7 + i * 0.13,
      2.7 + i * 0.13,
      0,
      Math.PI * 2,
      false,
      0,
    );
    const ringGeometry = new THREE.BufferGeometry().setFromPoints(
      curve.getPoints(180),
    );
    const ring = new THREE.LineLoop(ringGeometry, ringMaterial);
    ring.rotation.set(i === 0 ? 0.6 : 1.1, i === 0 ? -0.2 : i * 0.75, i * 0.8);
    rings.add(ring);
  }
  field.add(rings);
  scene.add(new THREE.AmbientLight(0x9ba87e, 1.4));
  const key = new THREE.DirectionalLight(0xe7ffb0, 5);
  key.position.set(2, 4, 4);
  scene.add(key);
  const rim = new THREE.PointLight(0xb3ea63, 45);
  rim.position.set(-3, 1, 2);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0xe1e6dc, 3);
  fill.position.set(0, -2, -3);
  scene.add(fill);
  let width = 1,
    height = 1;
  return {
    resize(w: number, h: number) {
      width = w;
      height = h;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    },
    render(
      progress: number,
      pointerX: number,
      pointerY: number,
      rotationX: number,
      rotationY: number,
      energy: number,
    ) {
      const mobile = width < 760;
      const journey = Math.min(1, Math.max(0, (progress - 0.15) / 0.28));
      field.position.x =
        centered || mobile ? 0 : THREE.MathUtils.lerp(1.9, -2.05, journey);
      field.position.y = centered ? 0 : mobile ? -1.2 : -0.05;
      field.rotation.set(
        0.3 + pointerY * 0.16 + rotationX,
        -0.45 + progress * 4 + pointerX * 0.24 + rotationY,
        -0.25 + progress * 0.65,
      );
      const scale =
        (centered
          ? 0.85
          : mobile
            ? 0.5
            : Math.min(1.05, (width / height) * 0.62)) *
        (1 + energy * 0.07);
      field.scale.setScalar(scale);
      knot.rotation.z = progress * 1.5;
      wire.rotation.z = knot.rotation.z;
      points.rotation.y = -progress * 1.2;
      points.scale.setScalar(1 + energy * 0.2);
      core.rotation.set(progress * 5, rotationY, progress * 3);
      rings.rotation.z = -progress;
      wireMaterial.opacity = 0.12 + journey * 0.15 + energy * 0.12;
      material.emissive.setHex(0x7b9e36);
      material.emissiveIntensity = 0.035 + energy * 0.2;
      renderer.render(scene, camera);
    },
    dispose() {
      const geometries = new Set<THREE.BufferGeometry>();
      const materials = new Set<THREE.Material>();
      scene.traverse((object) => {
        if (
          object instanceof THREE.Mesh ||
          object instanceof THREE.Points ||
          object instanceof THREE.Line
        ) {
          geometries.add(object.geometry);
          const items = Array.isArray(object.material)
            ? object.material
            : [object.material];
          items.forEach((m) => materials.add(m));
        }
      });
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      renderer.dispose();
    },
  };
}
