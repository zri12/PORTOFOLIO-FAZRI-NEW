import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import * as THREE from "three";

type WebNode = {
  mesh: THREE.Mesh;
  phase: number;
  baseScale: number;
};

type WebSignal = {
  mesh: THREE.Mesh;
  curve: THREE.CatmullRomCurve3;
  phase: number;
  speed: number;
};

function lineMaterial(color: number, opacity: number) {
  return new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

function addLine(
  parent: THREE.Object3D,
  points: THREE.Vector3[],
  color: number,
  opacity: number,
  loop = false,
) {
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = lineMaterial(color, opacity);
  const line = loop
    ? new THREE.LineLoop(geometry, material)
    : new THREE.Line(geometry, material);
  parent.add(line);
  return line;
}

function buildWebTunnel(isMobile: boolean, nodes: WebNode[], signals: WebSignal[]) {
  const group = new THREE.Group();
  const segments = isMobile ? 9 : 14;
  const ringCount = isMobile ? 4 : 7;
  const ringPoints: THREE.Vector3[][] = [];

  for (let ringIndex = 0; ringIndex < ringCount; ringIndex += 1) {
    const progress = ringIndex / Math.max(1, ringCount - 1);
    const radius = THREE.MathUtils.lerp(0.72, isMobile ? 2.25 : 2.8, progress);
    const z = THREE.MathUtils.lerp(-3.4, 0.85, progress);
    const points: THREE.Vector3[] = [];

    for (let segment = 0; segment < segments; segment += 1) {
      const angle = (segment / segments) * Math.PI * 2;
      const irregularity =
        1 + Math.sin(angle * 3 + ringIndex * 0.72) * 0.035;
      points.push(
        new THREE.Vector3(
          Math.cos(angle) * radius * irregularity,
          Math.sin(angle) * radius * irregularity * 0.82,
          z + Math.sin(angle * 2 + ringIndex) * 0.08,
        ),
      );
    }

    ringPoints.push(points);
    addLine(
      group,
      points,
      ringIndex % 3 === 0 ? 0xff8796 : 0xe3213c,
      0.16 + progress * 0.18,
      true,
    );
  }

  for (let segment = 0; segment < segments; segment += 1) {
    const spoke = ringPoints.map((ring) => ring[segment]);
    addLine(
      group,
      spoke,
      segment % 4 === 0 ? 0xffb7c0 : 0xff4055,
      segment % 4 === 0 ? 0.34 : 0.2,
    );
  }

  const nodeGeometry = new THREE.OctahedronGeometry(isMobile ? 0.045 : 0.06, 0);
  const nodeMaterial = new THREE.MeshBasicMaterial({
    color: 0xff4055,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  ringPoints.forEach((ring, ringIndex) => {
    if (ringIndex === 0) return;
    const step = isMobile ? 3 : 5;
    ring.forEach((point, segment) => {
      if ((segment + ringIndex) % step !== 0) return;
      const mesh = new THREE.Mesh(nodeGeometry, nodeMaterial);
      mesh.position.copy(point);
      group.add(mesh);
      nodes.push({
        mesh,
        phase: ringIndex * 0.55 + segment * 0.31,
        baseScale: 0.72 + ringIndex * 0.055,
      });
    });
  });

  const signalGeometry = new THREE.SphereGeometry(isMobile ? 0.05 : 0.07, 10, 10);
  const signalMaterial = new THREE.MeshBasicMaterial({
    color: 0xffd8de,
    transparent: true,
    opacity: 0.96,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const signalCount = isMobile ? 3 : 5;
  for (let index = 0; index < signalCount; index += 1) {
    const segment = (index * 3 + 1) % segments;
    const points = ringPoints.map((ring) => ring[segment]);
    const curve = new THREE.CatmullRomCurve3(points);
    const mesh = new THREE.Mesh(signalGeometry, signalMaterial);
    group.add(mesh);
    signals.push({
      mesh,
      curve,
      phase: index / signalCount,
      speed: 0.035 + index * 0.004,
    });
  }

  return group;
}

function buildWebDisc(isMobile: boolean, nodes: WebNode[]) {
  const group = new THREE.Group();
  const segments = isMobile ? 9 : 12;
  const rings = isMobile ? 3 : 4;
  const outerRadius = isMobile ? 1.25 : 1.75;
  const ringPoints: THREE.Vector3[][] = [];

  for (let ring = 1; ring <= rings; ring += 1) {
    const radius = (ring / rings) * outerRadius;
    const points = Array.from({ length: segments }, (_, segment) => {
      const angle = (segment / segments) * Math.PI * 2;
      const sag = Math.sin(angle * 2 + ring * 0.8) * 0.08;
      return new THREE.Vector3(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        sag + Math.cos(angle * 3) * 0.045,
      );
    });
    ringPoints.push(points);
    addLine(group, points, ring % 2 ? 0xff4055 : 0xff98a6, 0.16, true);
  }

  for (let segment = 0; segment < segments; segment += 1) {
    addLine(
      group,
      [new THREE.Vector3(), ...ringPoints.map((ring) => ring[segment])],
      0xe3213c,
      segment % 3 === 0 ? 0.28 : 0.14,
    );
  }

  const anchorGeometry = new THREE.OctahedronGeometry(0.055, 0);
  const anchorMaterial = new THREE.MeshBasicMaterial({
    color: 0x7fd8ff,
    transparent: true,
    opacity: 0.72,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  ringPoints.at(-1)?.forEach((point, index) => {
    if (index % 3 !== 0) return;
    const mesh = new THREE.Mesh(anchorGeometry, anchorMaterial);
    mesh.position.copy(point);
    group.add(mesh);
    nodes.push({ mesh, phase: index * 0.42, baseScale: 0.7 });
  });

  return group;
}

function disposeScene(scene: THREE.Scene) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();

  scene.traverse((object) => {
    const renderable = object as THREE.Mesh | THREE.Line;
    if (renderable.geometry) geometries.add(renderable.geometry);
    const material = renderable.material as THREE.Material | THREE.Material[] | undefined;
    if (Array.isArray(material)) material.forEach((item) => materials.add(item));
    else if (material) materials.add(material);
  });

  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
}

export function SpiderWebArchitecture3D({ className = "" }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const reduceMotion = !!useReducedMotion();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (reduceMotion) return;
    const mount = mountRef.current;
    if (!mount) return;
    const isMobile = window.innerWidth < 768;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: !isMobile,
        powerPreference: "high-performance",
      });
      if (!renderer.getContext()) throw new Error("WebGL unavailable");
    } catch {
      setFailed(true);
      return;
    }

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, isMobile ? 1 : 1.25),
    );
    renderer.setSize(mount.clientWidth, mount.clientHeight, false);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      44,
      mount.clientWidth / Math.max(1, mount.clientHeight),
      0.1,
      40,
    );
    camera.position.set(0, 0, 8);

    const root = new THREE.Group();
    root.position.set(isMobile ? 1.15 : 2.65, isMobile ? 0.35 : 0.15, -0.7);
    root.rotation.set(-0.04, -0.22, 0.08);
    scene.add(root);

    const nodes: WebNode[] = [];
    const signals: WebSignal[] = [];
    const tunnel = buildWebTunnel(isMobile, nodes, signals);
    root.add(tunnel);

    const disc = buildWebDisc(isMobile, nodes);
    disc.position.set(isMobile ? -1.7 : -4.8, isMobile ? -2.25 : -2.5, -1.1);
    disc.rotation.set(0.45, -0.28, -0.34);
    root.add(disc);

    if (!isMobile) {
      const upperDisc = buildWebDisc(false, nodes);
      upperDisc.scale.setScalar(0.72);
      upperDisc.position.set(3.55, 2.25, -1.8);
      upperDisc.rotation.set(-0.35, 0.5, 0.28);
      root.add(upperDisc);
    }

    const dustGeometry = new THREE.BufferGeometry();
    const dustCount = isMobile ? 12 : 24;
    const dustPositions = new Float32Array(dustCount * 3);
    for (let index = 0; index < dustCount; index += 1) {
      const angle = index * 2.39996;
      const radius = 0.8 + (index % 9) * 0.42;
      dustPositions[index * 3] = Math.cos(angle) * radius;
      dustPositions[index * 3 + 1] = Math.sin(angle) * radius * 0.72;
      dustPositions[index * 3 + 2] = -2.8 + (index % 7) * 0.58;
    }
    dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
    const dustMaterial = new THREE.PointsMaterial({
      color: 0xff4055,
      size: isMobile ? 0.025 : 0.035,
      transparent: true,
      opacity: 0.38,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const dust = new THREE.Points(dustGeometry, dustMaterial);
    root.add(dust);

    const pointerTarget = new THREE.Vector2();
    const pointer = new THREE.Vector2();
    const onPointerMove = (event: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      pointerTarget.x = ((event.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
      pointerTarget.y = ((event.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    const resizeObserver = new ResizeObserver(() => {
      if (!mount.clientWidth || !mount.clientHeight) return;
      const mobile = mount.clientWidth < 768;
      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, mobile ? 1 : 1.25),
      );
      renderer.setSize(mount.clientWidth, mount.clientHeight, false);
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
    });
    resizeObserver.observe(mount);

    let visible = true;
    let pageVisible = document.visibilityState === "visible";
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0 },
    );
    intersectionObserver.observe(mount);
    const onVisibility = () => {
      pageVisible = document.visibilityState === "visible";
    };
    document.addEventListener("visibilitychange", onVisibility);

    const clock = new THREE.Clock();
    let raf = 0;
    const animate = () => {
      raf = window.requestAnimationFrame(animate);
      if (!visible || !pageVisible) return;

      const elapsed = clock.getElapsedTime();
      pointer.lerp(pointerTarget, 0.045);

      root.rotation.y = -0.22 + pointer.x * 0.09 + Math.sin(elapsed * 0.18) * 0.025;
      root.rotation.x = -0.04 + pointer.y * 0.065;
      tunnel.rotation.z = elapsed * 0.025;
      tunnel.rotation.y = Math.sin(elapsed * 0.28) * 0.045;
      disc.rotation.z = -0.34 - elapsed * 0.018;
      dust.rotation.z = elapsed * 0.012;

      nodes.forEach(({ mesh, phase, baseScale }) => {
        const scale = baseScale * (0.82 + Math.sin(elapsed * 2.2 + phase) * 0.24);
        mesh.scale.setScalar(scale);
      });

      signals.forEach(({ mesh, curve, phase, speed }, index) => {
        const progress = (elapsed * speed + phase) % 1;
        mesh.position.copy(curve.getPointAt(progress));
        const pulse = 0.72 + Math.sin(elapsed * 5 + index) * 0.28;
        mesh.scale.setScalar(pulse);
      });

      camera.position.x = pointer.x * 0.22;
      camera.position.y = -pointer.y * 0.14;
      camera.lookAt(0.5, 0, -1.4);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibility);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      disposeScene(scene);
      renderer.dispose();
      renderer.forceContextLoss();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [reduceMotion]);

  if (reduceMotion || failed) {
    return (
      <div
        className={`spider-architecture-fallback pointer-events-none ${className}`}
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      ref={mountRef}
      className={`spider-architecture-3d pointer-events-none ${className}`}
      aria-hidden="true"
    />
  );
}
