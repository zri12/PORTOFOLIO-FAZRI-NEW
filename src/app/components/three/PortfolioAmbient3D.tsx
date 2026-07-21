import { useContext, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import { useReducedMotion } from "motion/react";
import * as THREE from "three";
import { ThemeModeContext } from "../../context/ThemeModeContext";
import { getPublicSceneRoute, sceneStates } from "./sceneStates";
import { WebGLFallback } from "./WebGLFallback";

function disposeScene(scene: THREE.Scene) {
  scene.traverse((object) => {
    const mesh = object as THREE.Mesh;
    mesh.geometry?.dispose();
    const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
    if (Array.isArray(material)) material.forEach((item) => item.dispose());
    else material?.dispose();
  });
}

export function PortfolioAmbient3D() {
  const { mode } = useContext(ThemeModeContext);
  const { pathname } = useLocation();
  const reduce = !!useReducedMotion();
  const mountRef = useRef<HTMLDivElement>(null);
  const modeRef = useRef(mode);
  const routeRef = useRef(getPublicSceneRoute(pathname));
  const sectionIndexRef = useRef(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { routeRef.current = getPublicSceneRoute(pathname); }, [pathname]);

  useEffect(() => {
    if (reduce) return;
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

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1 : 1.25));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(44, mount.clientWidth / Math.max(1, mount.clientHeight), 0.1, 80);
    camera.position.set(0, 0, 10);

    const root = new THREE.Group();
    root.position.set(2.5, 0.1, -2.2);
    scene.add(root);

    const pro = {
      glass: new THREE.Color(0x132330),
      edge: new THREE.Color(0x4ebbe8),
      path: new THREE.Color(0x4a6a78),
      node: new THREE.Color(0x72d4c1),
    };
    const spider = {
      glass: new THREE.Color(0x1a0d13),
      edge: new THREE.Color(0xff4055),
      path: new THREE.Color(0x8d1024),
      node: new THREE.Color(0x4cc8f2),
    };
    const current = {
      glass: pro.glass.clone(),
      edge: pro.edge.clone(),
      path: pro.path.clone(),
      node: pro.node.clone(),
    };
    const glassMats: THREE.MeshBasicMaterial[] = [];
    const edgeMats: THREE.MeshBasicMaterial[] = [];
    const pathMats: THREE.LineBasicMaterial[] = [];
    const nodeMats: THREE.MeshBasicMaterial[] = [];

    const panelDefs = [
      { size: [2.8, 1.6], pos: [-2.3, 0.8, -1.2], rot: [0.1, 0.42, -0.04] },
      { size: [2.2, 1.35], pos: [0.25, 0.25, -0.7], rot: [-0.08, -0.16, 0.02] },
      { size: [1.9, 1.1], pos: [2.1, -0.7, -1.4], rot: [0.15, -0.45, 0.06] },
      { size: [1.4, 0.85], pos: [-0.8, -1.55, -0.9], rot: [0.25, 0.22, -0.08] },
    ];

    panelDefs.forEach((def) => {
      const group = new THREE.Group();
      const glass = new THREE.MeshBasicMaterial({ color: current.glass, transparent: true, opacity: 0.18, depthWrite: false });
      const edge = new THREE.MeshBasicMaterial({ color: current.edge, transparent: true, opacity: 0.28 });
      glassMats.push(glass);
      edgeMats.push(edge);
      const pane = new THREE.Mesh(new THREE.PlaneGeometry(def.size[0], def.size[1]), glass);
      const border = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(def.size[0], def.size[1])), edge);
      group.add(pane, border);
      group.position.set(def.pos[0], def.pos[1], def.pos[2]);
      group.rotation.set(def.rot[0], def.rot[1], def.rot[2]);
      group.userData.base = group.position.clone();
      root.add(group);
    });

    const pathPoints = [
      [new THREE.Vector3(-2.3, 0.8, -1.2), new THREE.Vector3(0.25, 0.25, -0.7)],
      [new THREE.Vector3(0.25, 0.25, -0.7), new THREE.Vector3(2.1, -0.7, -1.4)],
      [new THREE.Vector3(0.25, 0.25, -0.7), new THREE.Vector3(-0.8, -1.55, -0.9)],
    ];
    pathPoints.forEach(([a, b]) => {
      const material = new THREE.LineBasicMaterial({ color: current.path, transparent: true, opacity: 0.28 });
      pathMats.push(material);
      root.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([a, b]), material));
    });

    panelDefs.forEach((def, index) => {
      const material = new THREE.MeshBasicMaterial({ color: index === 1 ? current.node : current.edge, transparent: true, opacity: 0.52 });
      nodeMats.push(material);
      const node = new THREE.Mesh(new THREE.CircleGeometry(0.055, 16), material);
      node.position.set(def.pos[0], def.pos[1], def.pos[2] + 0.03);
      root.add(node);
    });

    scene.add(new THREE.AmbientLight(0xffffff, 0.65));

    let raf = 0;
    let running = document.visibilityState === "visible";
    let scrollProgress = 0;
    const currentState = { intensity: 0, cameraX: 0, cameraY: 0, panelSpread: 1, depth: 0 };

    const onScroll = () => {
      scrollProgress = Math.min(1, Math.max(0, window.scrollY / Math.max(1, window.innerHeight * 2)));
    };
    const onSection = (event: Event) => {
      const detail = (event as CustomEvent<{ index?: number }>).detail;
      sectionIndexRef.current = Math.max(0, detail?.index ?? 0);
    };
    const onVisibility = () => { running = document.visibilityState === "visible"; };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("portfolio-section-active", onSection);
    document.addEventListener("visibilitychange", onVisibility);

    const resizeObserver = new ResizeObserver(() => {
      if (!mount.clientWidth || !mount.clientHeight) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    });
    resizeObserver.observe(mount);

    const clock = new THREE.Clock();
    const minFrameMs = window.innerWidth < 768 ? 50 : window.innerWidth < 1024 ? 33 : 16;
    let lastRenderAt = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      if (!running) return;
      const now = performance.now();
      if (now - lastRenderAt < minFrameMs) return;
      lastRenderAt = now;
      const elapsed = clock.getElapsedTime();
      const targetPalette = modeRef.current === "spider" ? spider : pro;
      current.glass.lerp(targetPalette.glass, 0.045);
      current.edge.lerp(targetPalette.edge, 0.045);
      current.path.lerp(targetPalette.path, 0.045);
      current.node.lerp(targetPalette.node, 0.045);
      glassMats.forEach((mat) => mat.color.copy(current.glass));
      edgeMats.forEach((mat) => mat.color.copy(current.edge));
      pathMats.forEach((mat) => mat.color.copy(current.path));
      nodeMats.forEach((mat) => mat.color.copy(current.node));

      const targetState = sceneStates[routeRef.current];
      const sectionPulse = Math.sin(sectionIndexRef.current * 0.7) * 0.16;
      currentState.intensity += (targetState.intensity - currentState.intensity) * 0.04;
      currentState.cameraX += (targetState.cameraX + sectionPulse - currentState.cameraX) * 0.04;
      currentState.cameraY += (targetState.cameraY - currentState.cameraY) * 0.04;
      currentState.panelSpread += (targetState.panelSpread - currentState.panelSpread) * 0.04;
      currentState.depth += (targetState.depth - currentState.depth) * 0.04;

      mount.style.opacity = String(Math.max(0, currentState.intensity - scrollProgress * 0.38));
      root.position.x = 2.4 + currentState.cameraX;
      root.position.y = currentState.cameraY;
      root.position.z = -2.2 + currentState.depth - scrollProgress * 0.75;
      root.rotation.y = Math.sin(elapsed * 0.18) * 0.05 + (modeRef.current === "spider" ? -0.08 : 0);
      root.rotation.x = Math.sin(elapsed * 0.16) * 0.025;

      root.children.forEach((child, index) => {
        const base = child.userData.base as THREE.Vector3 | undefined;
        if (base) {
          child.position.x = base.x * currentState.panelSpread;
          child.position.y = base.y + Math.sin(elapsed * 0.35 + index) * 0.035;
        }
      });

      camera.position.x = currentState.cameraX * 0.35;
      camera.position.y = currentState.cameraY * 0.2;
      camera.lookAt(0, 0, -2);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("portfolio-section-active", onSection);
      document.removeEventListener("visibilitychange", onVisibility);
      resizeObserver.disconnect();
      disposeScene(scene);
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, [reduce]);

  if (reduce || failed) return <WebGLFallback mode={mode} />;

  return (
    <div
      ref={mountRef}
      className="portfolio-ambient-layer pointer-events-none fixed inset-0 z-[2] overflow-hidden mix-blend-screen"
      aria-hidden="true"
    />
  );
}
