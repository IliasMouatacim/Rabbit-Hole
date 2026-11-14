import { useEffect, useRef } from "react";
import * as THREE from "three";
export default function City({
  district,
  powered,
  reduced,
  departed,
}: {
  district: string;
  powered: string[];
  reduced: boolean;
  departed: boolean;
}) {
  const moving = useRef(departed);
  useEffect(() => {
    moving.current = departed;
  }, [departed]);
  const host = useRef<HTMLDivElement>(null);
  const focus = useRef(district);
  const lights = useRef(powered);
  useEffect(() => {
    focus.current = district;
    lights.current = powered;
  }, [district, powered]);
  useEffect(() => {
    if (!host.current) return;
    const el = host.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#091416");
    scene.fog = new THREE.FogExp2("#091416", 0.018);
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 200);
    camera.position.set(31, 30, 36);
    camera.lookAt(0, 0, 0);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    el.appendChild(renderer.domElement);
    renderer.shadowMap.enabled = true;
    scene.add(new THREE.AmbientLight(0x668b8c, 1.5));
    const moon = new THREE.DirectionalLight(0xa5c9c7, 2);
    moon.position.set(-12, 30, -8);
    scene.add(moon);
    const mat = (c: string) =>
      new THREE.MeshStandardMaterial({
        color: c,
        roughness: 0.7,
        metalness: 0.35,
      });
    const ground = mat("#172729"),
      building = mat("#23383a"),
      roof = mat("#304144");
    const water = new THREE.Mesh(
      new THREE.PlaneGeometry(75, 12),
      new THREE.MeshStandardMaterial({
        color: "#0c3238",
        metalness: 0.85,
        roughness: 0.23,
      }),
    );
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, -0.12, 3);
    scene.add(water);
    function box(
      x: number,
      y: number,
      z: number,
      w: number,
      h: number,
      d: number,
      m: THREE.Material,
    ) {
      const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
      o.position.set(x, y + h / 2, z);
      scene.add(o);
      return o;
    }
    box(0, -0.5, -13, 44, 0.5, 19, ground);
    box(0, -0.5, 16, 44, 0.5, 14, ground);
    const windows: { mesh: THREE.Mesh; area: string }[] = [];
    let seed = 12;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    for (let row = 0; row < 5; row++)
      for (let col = 0; col < 9; col++) {
        const x = (col - 4) * 4.7,
          z = row < 3 ? -20 + row * 5 : 11 + (row - 3) * 6;
        if (col === 4 || (row === 1 && col === 6)) continue;
        const h = 2 + rand() * 7,
          w = 2.4 + rand();
        box(x, 0, z, w, h, 3.1, building);
        box(x, h, z, w + 0.15, 0.18, 3.25, roof);
        if (rand() > 0.65) box(x, h + 0.18, z, 0.5, 1.2, 0.6, roof);
        const area = x < -6 ? "hospital" : x > 7 ? "station" : "oldtown";
        for (let floor = 0; floor < Math.floor(h / 0.8); floor++)
          for (let k = 0; k < 3; k++) {
            if (rand() > 0.64) continue;
            const wm = new THREE.MeshBasicMaterial({
              color: rand() > 0.22 ? "#d7a65c" : "#638e8a",
            });
            const a = box(
              x - w / 2 + 0.4 + k * 0.7,
              0.4 + floor * 0.8,
              z + 1.56,
              0.25,
              0.35,
              0.02,
              wm,
            );
            windows.push({ mesh: a, area });
          }
        for (let k = 0; k < 3; k++) {
          const a = box(
            x + w / 2 + 0.01,
            0.6 + k * 1.4,
            z + 0.4,
            0.02,
            0.32,
            0.4,
            new THREE.MeshBasicMaterial({ color: "#b68b4b" }),
          );
          windows.push({ mesh: a, area });
        }
      }
    // Elevated railway and flood crossings.
    box(3, 0.05, 3, 3, 0.45, 14, roof);
    for (const x of [2.1, 3.9]) box(x, 0.52, 3, 0.08, 0.08, 17, mat("#8e8b73"));
    for (const z of [-2, 4, 9]) box(3, -0.1, z, 2.7, 0.5, 0.4, ground);
    const train = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const car = new THREE.Mesh(
        new THREE.BoxGeometry(1.65, 0.85, 2.3),
        mat("#9a7450"),
      );
      car.position.set(3, 1, 8 + i * 2.7);
      train.add(car);
      const win = new THREE.Mesh(
        new THREE.BoxGeometry(1.7, 0.25, 1.8),
        new THREE.MeshBasicMaterial({ color: "#f1c47a" }),
      );
      win.position.set(3, 1.12, 8 + i * 2.7);
      train.add(win);
    }
    scene.add(train);
    // Hospital, radio mast, and small pools of street light.
    const crossmat = new THREE.MeshBasicMaterial({ color: "#a9e3ce" });
    box(-14, 6.5, -8, 0.3, 1.6, 0.16, crossmat);
    box(-14, 7.1, -8, 1.3, 0.3, 0.16, crossmat);
    box(-2, 0, -10, 0.22, 16, 0.22, roof);
    for (let i = 0; i < 4; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.5 + i * 0.4, 0.025, 5, 30),
        new THREE.MeshBasicMaterial({ color: "#8baba5" }),
      );
      ring.position.set(-2, 12 + i * 0.7, -10);
      ring.rotation.x = Math.PI / 2;
      scene.add(ring);
    }
    const beacon = box(
      -2,
      16,
      -10,
      0.25,
      0.25,
      0.25,
      new THREE.MeshBasicMaterial({ color: "#ef623e" }),
    );
    for (let i = 0; i < 20; i++) {
      const x = -20 + i * 2.1;
      box(
        x,
        0.01,
        -4,
        0.5,
        0.025,
        1.5,
        new THREE.MeshBasicMaterial({ color: "#49615e" }),
      );
      const p = new THREE.PointLight(0xe7a656, 3, 5, 2);
      p.position.set(x, 1, -5);
      scene.add(p);
    }
    const geo = new THREE.BufferGeometry();
    const pts = new Float32Array(1500);
    for (let i = 0; i < 1500; i += 3) {
      pts[i] = (rand() - 0.5) * 65;
      pts[i + 1] = rand() * 30;
      pts[i + 2] = (rand() - 0.5) * 55;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(pts, 3));
    const rain = new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        color: "#8db7b9",
        size: 0.035,
        transparent: true,
        opacity: 0.4,
      }),
    );
    scene.add(rain);
    const resize = () => {
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(el);
    resize();
    let frame = 0;
    let travel = 0;
    let id = 0;
    const animate = () => {
      id = requestAnimationFrame(animate);
      if (!reduced) frame++;
      windows.forEach(({ mesh, area }) => {
        mesh.visible =
          lights.current.includes(area) ||
          (area === "oldtown" && frame % 240 < 215);
      });
      beacon.visible = frame % 90 < 50;
      if (!reduced) {
        for (let i = 1; i < 1500; i += 3) {
          pts[i] -= 0.16;
          if (pts[i] < 0) pts[i] = 30;
        }
        geo.attributes.position.needsUpdate = true;
        if (moving.current) travel = Math.min(travel + 0.035, 45);
        train.position.z = -travel;
        const target =
          focus.current === "hospital"
            ? -4
            : focus.current === "station"
              ? 4
              : 0;
        camera.position.x += (31 + target - camera.position.x) * 0.008;
      }
      renderer.render(scene, camera);
    };
    animate();
    return () => {
      cancelAnimationFrame(id);
      observer.disconnect();
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh || o instanceof THREE.Points) {
          o.geometry.dispose();
          const materials = Array.isArray(o.material)
            ? o.material
            : [o.material];
          materials.forEach((m: THREE.Material) => m.dispose());
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [reduced]);
  return (
    <div
      className="city-canvas"
      ref={host}
      aria-label="Three dimensional city with lit districts, a railway, and floodwater"
      role="img"
    />
  );
}
