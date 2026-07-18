import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { SplashFallback } from "./SplashFallback";

interface SplashScene3DProps {
  mode: "professional" | "spider";
  exiting: boolean;
  reduced: boolean;
}

function disposeScene(scene: THREE.Scene) {
  scene.traverse((object) => {
    const mesh = object as THREE.Mesh;
    mesh.geometry?.dispose();
    const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
    if (Array.isArray(material)) material.forEach((item) => item.dispose());
    else material?.dispose();
  });
}

export function SplashScene3D({ mode, exiting, reduced }: SplashScene3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const modeRef = useRef(mode);
  const exitingRef = useRef(exiting);
  const [failed, setFailed] = useState(false);

  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { exitingRef.current = exiting; }, [exiting]);

  useEffect(() => {
    if (reduced) return;
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
      if (!renderer.getContext()) throw new Error("WebGL unavailable");
    } catch {
      setFailed(true);
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1 : 1.4));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x05070b, 9, 22);
    const camera = new THREE.PerspectiveCamera(42, mount.clientWidth / Math.max(1, mount.clientHeight), 0.1, 80);
    camera.position.set(0, 0.15, 8.5);

    const root = new THREE.Group();
    scene.add(root);

    const palette = {
      pro: {
        glass: new THREE.Color(0x172633),
        edge: new THREE.Color(0x6d8390),
        node: new THREE.Color(0x4ebbe8),
        node2: new THREE.Color(0x72d4c1),
        core: new THREE.Color(0x28333e),
        path: new THREE.Color(0x42616d),
      },
      spider: {
        glass: new THREE.Color(0x1b0c13),
        edge: new THREE.Color(0x8d1024),
        node: new THREE.Color(0xff4055),
        node2: new THREE.Color(0x4cc8f2),
        core: new THREE.Color(0x171015),
        path: new THREE.Color(0xb51b33),
      },
    };
    const current = {
      glass: palette.pro.glass.clone(),
      edge: palette.pro.edge.clone(),
      node: palette.pro.node.clone(),
      node2: palette.pro.node2.clone(),
      core: palette.pro.core.clone(),
      path: palette.pro.path.clone(),
    };

    const glassMaterials: THREE.MeshPhysicalMaterial[] = [];
    const edgeMaterials: THREE.MeshStandardMaterial[] = [];
    const nodeMaterials: THREE.MeshStandardMaterial[] = [];
    const pathMaterials: THREE.MeshStandardMaterial[] = [];
    const lineMaterials: THREE.LineBasicMaterial[] = [];

    const coreMaterial = new THREE.MeshStandardMaterial({ color: current.core, metalness: 0.82, roughness: 0.32 });
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.7, 1), coreMaterial);
    root.add(core);

    const coreWireMaterial = new THREE.MeshBasicMaterial({ color: current.edge, wireframe: true, transparent: true, opacity: 0.38 });
    const coreWire = new THREE.Mesh(new THREE.IcosahedronGeometry(0.92, 1), coreWireMaterial);
    root.add(coreWire);

    function addPanel(width: number, height: number, position: THREE.Vector3, rotation: THREE.Euler, variant: "code" | "browser" | "design" | "timeline" | "palette") {
      const group = new THREE.Group();
      const edge = new THREE.MeshStandardMaterial({ color: current.edge, metalness: 0.6, roughness: 0.4, emissive: current.edge, emissiveIntensity: 0.08 });
      const glass = new THREE.MeshPhysicalMaterial({ color: current.glass, roughness: 0.18, metalness: 0.1, transparent: true, opacity: 0.72, transmission: 0.28, thickness: 0.35 });
      const muted = new THREE.MeshStandardMaterial({ color: current.edge, emissive: current.edge, emissiveIntensity: 0.1, transparent: true, opacity: 0.22, roughness: 0.52 });
      edgeMaterials.push(edge);
      glassMaterials.push(glass);
      edgeMaterials.push(muted);

      const border = new THREE.Mesh(new THREE.BoxGeometry(width, height, 0.035), edge);
      const pane = new THREE.Mesh(new THREE.PlaneGeometry(width * 0.94, height * 0.9), glass);
      pane.position.z = 0.035;
      group.add(border, pane);

      const addLine = (x: number, y: number, w: number, h = height * 0.035, accent = false) => {
        const rowMat = new THREE.MeshStandardMaterial({ color: accent ? current.node2 : current.node, emissive: accent ? current.node2 : current.node, emissiveIntensity: accent ? 0.35 : 0.2, transparent: true, opacity: accent ? 0.62 : 0.42 });
        nodeMaterials.push(rowMat);
        const rowMesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), rowMat);
        rowMesh.position.set(x, y, 0.052);
        group.add(rowMesh);
      };
      const addBox = (x: number, y: number, w: number, h: number, material = muted) => {
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
        mesh.position.set(x, y, 0.05);
        group.add(mesh);
      };
      const addCircle = (x: number, y: number, r: number, accent = false) => {
        const dotMat = new THREE.MeshStandardMaterial({ color: accent ? current.node2 : current.node, emissive: accent ? current.node2 : current.node, emissiveIntensity: 0.7, transparent: true, opacity: 0.72 });
        nodeMaterials.push(dotMat);
        const dot = new THREE.Mesh(new THREE.CircleGeometry(r, 16), dotMat);
        dot.position.set(x, y, 0.06);
        group.add(dot);
      };

      if (variant === "browser") {
        addBox(0, height * 0.35, width * 0.82, height * 0.11, muted);
        [-0.36, -0.29, -0.22].forEach((x, index) => addCircle(width * x, height * 0.35, height * 0.022, index === 2));
        addBox(-width * 0.26, height * 0.02, width * 0.22, height * 0.42);
        addBox(width * 0.08, height * 0.04, width * 0.48, height * 0.4);
        addLine(width * 0.07, height * 0.13, width * 0.32, height * 0.028, true);
        addLine(width * 0.03, height * 0.01, width * 0.42);
        addLine(width * 0.02, -height * 0.12, width * 0.34);
      } else if (variant === "design") {
        addBox(-width * 0.18, 0, width * 0.46, height * 0.52);
        addCircle(width * 0.19, height * 0.17, height * 0.08, true);
        addBox(width * 0.23, -height * 0.12, width * 0.2, height * 0.18);
        addLine(-width * 0.18, -height * 0.35, width * 0.62, height * 0.026, true);
        addLine(-width * 0.18, -height * 0.43, width * 0.42);
      } else if (variant === "timeline") {
        addLine(0, height * 0.2, width * 0.72, height * 0.025, true);
        for (let i = 0; i < 5; i += 1) {
          addBox(-width * 0.32 + i * width * 0.16, -height * 0.04, width * 0.12, height * (0.14 + (i % 2) * 0.08));
        }
        addLine(-width * 0.1, -height * 0.34, width * 0.44);
      } else if (variant === "palette") {
        for (let i = 0; i < 5; i += 1) {
          addCircle(-width * 0.3 + i * width * 0.15, height * 0.12, height * 0.055, i % 2 === 0);
        }
        addBox(-width * 0.06, -height * 0.16, width * 0.58, height * 0.22);
        addLine(-width * 0.06, -height * 0.18, width * 0.44, height * 0.028, true);
      } else {
        for (let row = 0; row < 5; row += 1) {
          addLine(-width * 0.14, height * (0.22 - row * 0.13), width * (0.58 - row * 0.07), height * 0.032, row === 1);
        }
        addBox(-width * 0.38, 0, width * 0.08, height * 0.62);
      }

      group.position.copy(position);
      group.rotation.copy(rotation);
      root.add(group);
      return group;
    }

    const panels = [
      addPanel(2.3, 1.38, new THREE.Vector3(-2.25, 0.2, -0.5), new THREE.Euler(0.08, 0.52, -0.06), "code"),
      addPanel(2.75, 1.65, new THREE.Vector3(0.05, 0.76, -1.12), new THREE.Euler(-0.08, -0.1, 0.02), "browser"),
      addPanel(2.05, 1.28, new THREE.Vector3(2.22, -0.02, -0.35), new THREE.Euler(0.12, -0.55, 0.07), "design"),
      addPanel(1.82, 1.05, new THREE.Vector3(0.82, -1.46, 0.2), new THREE.Euler(0.18, -0.28, 0.08), "timeline"),
      addPanel(1.45, 0.82, new THREE.Vector3(-1.25, -1.08, 0.05), new THREE.Euler(0.16, 0.4, -0.1), "palette"),
    ];

    panels.forEach((panel, index) => {
      panel.userData.base = panel.position.clone();
      panel.position.z -= 4 + index * 0.55;
      panel.scale.setScalar(0.72);
    });

    const endpoints = [new THREE.Vector3(-1.35, 0.12, -0.2), new THREE.Vector3(0.2, 0.62, -0.6), new THREE.Vector3(1.38, -0.02, -0.1), new THREE.Vector3(0.62, -0.92, 0.2), new THREE.Vector3(-0.78, -0.72, 0.05)];
    endpoints.forEach((end, index) => {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(end.x * 0.5, end.y * 0.35 + (index % 2 ? 0.35 : -0.2), end.z + 0.4),
        end,
      ]);
      const material = new THREE.MeshStandardMaterial({ color: current.path, emissive: current.path, emissiveIntensity: 0.45, roughness: 0.45 });
      pathMaterials.push(material);
      root.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 32, 0.012, 6), material));

      const nodeMaterial = new THREE.MeshStandardMaterial({ color: index === 1 ? current.node2 : current.node, emissive: index === 1 ? current.node2 : current.node, emissiveIntensity: 1.1 });
      nodeMaterials.push(nodeMaterial);
      const node = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 12), nodeMaterial);
      node.position.copy(end);
      root.add(node);
    });

    const gridMaterial = new THREE.MeshBasicMaterial({ color: current.edge, wireframe: true, transparent: true, opacity: 0.1 });
    const grid = new THREE.Mesh(new THREE.PlaneGeometry(7, 4.4, 12, 8), gridMaterial);
    grid.position.z = -2.7;
    root.add(grid);

    const orbit = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.RingGeometry(1.25, 1.28, 64)), new THREE.LineBasicMaterial({ color: current.node2, transparent: true, opacity: 0.25 }));
    lineMaterials.push(orbit.material as THREE.LineBasicMaterial);
    orbit.rotation.set(0.45, 0.25, -0.15);
    root.add(orbit);

    scene.add(new THREE.HemisphereLight(0xa6bfd4, 0x06080c, 0.7));
    const key = new THREE.DirectionalLight(0xe7f2ff, 1.25);
    key.position.set(3, 5, 6);
    scene.add(key);
    const rim = new THREE.PointLight(current.node, 2.8, 22);
    rim.position.set(-2.8, -1.2, 3);
    scene.add(rim);

    const resizeObserver = new ResizeObserver(() => {
      if (!mount.clientWidth || !mount.clientHeight) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    });
    resizeObserver.observe(mount);

    let frame = 0;
    let running = true;
    const clock = new THREE.Clock();

    const onVisibility = () => { running = document.visibilityState === "visible"; };
    document.addEventListener("visibilitychange", onVisibility);

    const animate = () => {
      frame = requestAnimationFrame(animate);
      if (!running) return;
      const elapsed = clock.getElapsedTime();
      const target = modeRef.current === "spider" ? palette.spider : palette.pro;
      current.glass.lerp(target.glass, 0.06);
      current.edge.lerp(target.edge, 0.06);
      current.node.lerp(target.node, 0.06);
      current.node2.lerp(target.node2, 0.06);
      current.core.lerp(target.core, 0.06);
      current.path.lerp(target.path, 0.06);

      coreMaterial.color.copy(current.core);
      coreWireMaterial.color.copy(current.edge);
      glassMaterials.forEach((item) => item.color.copy(current.glass));
      edgeMaterials.forEach((item) => { item.color.copy(current.edge); item.emissive.copy(current.edge); });
      pathMaterials.forEach((item) => { item.color.copy(current.path); item.emissive.copy(current.path); });
      lineMaterials.forEach((item) => item.color.copy(current.node2));
      nodeMaterials.forEach((item, index) => {
        const color = index % 3 === 1 ? current.node2 : current.node;
        item.color.copy(color);
        item.emissive.copy(color);
      });
      rim.color.copy(current.node);

      const progress = Math.min(1, elapsed / 2.35);
      panels.forEach((panel, index) => {
        const base = panel.userData.base as THREE.Vector3;
        const delay = index * 0.08;
        const local = Math.max(0, Math.min(1, (progress - delay) / 0.72));
        const ease = 1 - Math.pow(1 - local, 3);
        panel.position.x = base.x;
        panel.position.y = base.y + Math.sin(elapsed * 0.55 + index) * 0.035;
        panel.position.z = THREE.MathUtils.lerp(base.z - 4 - index * 0.55, base.z, ease);
        panel.scale.setScalar(THREE.MathUtils.lerp(0.72, 1, ease));
      });

      const exitScale = exitingRef.current ? 1 + Math.min(0.85, (elapsed % 10) * 0.08) : 1;
      root.scale.setScalar(exitScale);
      root.rotation.y = Math.sin(elapsed * 0.25) * 0.08 + (modeRef.current === "spider" ? -0.08 : 0);
      root.rotation.x = Math.sin(elapsed * 0.2) * 0.035;
      core.rotation.x += 0.006;
      core.rotation.y += modeRef.current === "spider" ? 0.009 : 0.006;
      coreWire.rotation.y -= 0.004;
      camera.position.z = exitingRef.current ? 7.6 - Math.sin(Math.min(1, elapsed / 3)) * 0.8 : 8.5;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", onVisibility);
      resizeObserver.disconnect();
      disposeScene(scene);
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, [reduced]);

  if (failed || reduced) return <SplashFallback mode={mode} exiting={exiting} />;

  return <div ref={mountRef} className={`absolute inset-0 transition duration-700 ${exiting ? "scale-110 opacity-0 blur-sm" : "scale-100 opacity-100"}`} aria-hidden="true" />;
}
