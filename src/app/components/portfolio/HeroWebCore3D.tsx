import { useContext, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import * as THREE from "three";
import { ThemeModeContext } from "../../context/ThemeModeContext";

/**
 * HeroWebCore3D — a genuine WebGL "Digital Interface Core" rendered with a
 * direct Three.js renderer (react-three-fiber's reconciler is unstable in this
 * preview). It reads clearly as web development: a central dark data core with
 * several floating browser-like glass frames (title bar, traffic-light dots and
 * UI rows), connected to the core by thin data-path tubes with glowing nodes.
 *
 * Professional state = graphite/glass with cyan-teal data nodes and cool silver
 * light. Spider state = darker, more angular crimson-threaded panels with red
 * nodes and crimson rim light. Materials interpolate smoothly on mode change.
 * It reacts to pointer (small damped camera tilt), scroll (dolly + drift) and a
 * slow idle float. Brightened lighting + ACES tone mapping keep it readable on
 * ordinary laptop screens.
 */
export function HeroWebCore3D({ className = "" }: { className?: string }) {
  const { mode } = useContext(ThemeModeContext);
  const reduce = useReducedMotion();
  const mountRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  const modeRef = useRef(mode);
  const reduceRef = useRef(!!reduce);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { reduceRef.current = !!reduce; }, [reduce]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
      if (!renderer.getContext()) throw new Error("no webgl");
    } catch {
      setFailed(true);
      return;
    }
    const isMobile = window.innerWidth < 640;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 1.5));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x05060a, 10, 22);
    const camera = new THREE.PerspectiveCamera(40, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 0.2, 9);

    const root = new THREE.Group();
    scene.add(root);

    // --- Palettes -----------------------------------------------------------
    const PRO = {
      core: new THREE.Color(0x323c47),
      glass: new THREE.Color(0x182833),
      edge: new THREE.Color(0x5a7180),
      path: new THREE.Color(0x46606c),
      node: new THREE.Color(0x4cc8f2),
      node2: new THREE.Color(0x37c9b0),
      rim: new THREE.Color(0x6fd0e8),
    };
    const SPIDER = {
      core: new THREE.Color(0x140d12),
      glass: new THREE.Color(0x1c1016),
      edge: new THREE.Color(0x7a1f2e),
      path: new THREE.Color(0x8d1024),
      node: new THREE.Color(0xff4055),
      node2: new THREE.Color(0x4cc8f2),
      rim: new THREE.Color(0xe5223d),
    };
    const cur = {
      core: PRO.core.clone(), glass: PRO.glass.clone(), edge: PRO.edge.clone(),
      path: PRO.path.clone(), node: PRO.node.clone(), node2: PRO.node2.clone(), rim: PRO.rim.clone(),
    };

    // Material registries so palette lerps touch every relevant surface.
    const glassMats: THREE.MeshPhysicalMaterial[] = [];
    const edgeMats: THREE.MeshStandardMaterial[] = [];
    const pathMats: THREE.MeshStandardMaterial[] = [];
    const nodeMats: THREE.MeshStandardMaterial[] = [];
    const node2Mats: THREE.MeshStandardMaterial[] = [];
    const rowMats: THREE.MeshStandardMaterial[] = [];

    // --- Central data core --------------------------------------------------
    const coreMat = new THREE.MeshStandardMaterial({ color: cur.core, metalness: 0.9, roughness: 0.3 });
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.85, 1), coreMat);
    root.add(core);
    // Thin metallic frame around the core (angular detail).
    const coreCageMat = new THREE.MeshStandardMaterial({ color: cur.edge, metalness: 0.8, roughness: 0.35, wireframe: true });
    edgeMats.push(coreCageMat);
    const coreCage = new THREE.Mesh(new THREE.IcosahedronGeometry(1.05, 0), coreCageMat);
    root.add(coreCage);

    // --- Browser-like interface frame builder -------------------------------
    const frameGroups: THREE.Group[] = [];
    function buildFrame(w: number, h: number) {
      const g = new THREE.Group();
      // Border/backing panel.
      const edgeMat = new THREE.MeshStandardMaterial({ color: cur.edge, metalness: 0.6, roughness: 0.4, emissive: cur.edge.clone().multiplyScalar(0.15) });
      edgeMats.push(edgeMat);
      const backing = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.04), edgeMat);
      g.add(backing);
      // Smoked-glass surface.
      const glassMat = new THREE.MeshPhysicalMaterial({ color: cur.glass, metalness: 0.1, roughness: 0.12, transmission: 0.6, thickness: 0.4, transparent: true, opacity: 0.9, ior: 1.25 });
      glassMats.push(glassMat);
      const glass = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.94, h * 0.94), glassMat);
      glass.position.z = 0.03;
      g.add(glass);
      // Title bar.
      const barMat = new THREE.MeshStandardMaterial({ color: cur.edge, metalness: 0.5, roughness: 0.5 });
      edgeMats.push(barMat);
      const bar = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.94, h * 0.13), barMat);
      bar.position.set(0, h * 0.4, 0.035);
      g.add(bar);
      // Traffic-light dots (accent nodes).
      for (let i = 0; i < 3; i++) {
        const dotMat = new THREE.MeshStandardMaterial({ color: cur.node, emissive: cur.node, emissiveIntensity: 0.9 });
        (i === 1 ? node2Mats : nodeMats).push(dotMat);
        const dot = new THREE.Mesh(new THREE.CircleGeometry(h * 0.022, 12), dotMat);
        dot.position.set(-w * 0.4 + i * w * 0.07, h * 0.4, 0.04);
        g.add(dot);
      }
      // UI rows (content lines).
      for (let r = 0; r < 4; r++) {
        const rowMat = new THREE.MeshStandardMaterial({ color: cur.node, emissive: cur.node, emissiveIntensity: 0.25, transparent: true, opacity: 0.6 });
        rowMats.push(rowMat);
        const rw = w * (0.7 - r * 0.09);
        const row = new THREE.Mesh(new THREE.PlaneGeometry(rw, h * 0.045), rowMat);
        row.position.set(-w * 0.47 + rw / 2, h * 0.2 - r * h * 0.16, 0.04);
        g.add(row);
      }
      return g;
    }

    // Three frames at different depths / angles — assembled around the core.
    const frameDefs = [
      { w: 2.4, h: 1.6, pos: [2.3, 0.9, 0.4], rot: [-0.15, -0.5, 0.05] },
      { w: 2.0, h: 1.35, pos: [-2.5, 0.2, -0.6], rot: [0.1, 0.6, -0.06] },
      { w: 1.7, h: 1.15, pos: [1.2, -1.7, -0.3], rot: [0.25, -0.3, 0.1] },
    ];
    frameDefs.forEach((f) => {
      const g = buildFrame(f.w, f.h);
      g.position.set(f.pos[0], f.pos[1], f.pos[2]);
      g.rotation.set(f.rot[0], f.rot[1], f.rot[2]);
      frameGroups.push(g);
      root.add(g);
    });

    // --- Data paths (tubes) from core to each frame, with end nodes ---------
    const endNodes: THREE.Mesh[] = [];
    frameDefs.forEach((f, i) => {
      const start = new THREE.Vector3(0, 0, 0);
      const end = new THREE.Vector3(f.pos[0] * 0.62, f.pos[1] * 0.62, f.pos[2]);
      const mid = new THREE.Vector3((start.x + end.x) / 2 + (i % 2 ? 0.5 : -0.5), (start.y + end.y) / 2 + 0.4, (start.z + end.z) / 2 + 0.6);
      const curve = new THREE.CatmullRomCurve3([start, mid, end]);
      const pMat = new THREE.MeshStandardMaterial({ color: cur.path, emissive: cur.path, emissiveIntensity: 0.4, metalness: 0.4, roughness: 0.5 });
      pathMats.push(pMat);
      root.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 20, 0.018, 6, false), pMat));
      const nMat = new THREE.MeshStandardMaterial({ color: cur.node, emissive: cur.node, emissiveIntensity: 1.3 });
      nodeMats.push(nMat);
      const node = new THREE.Mesh(new THREE.SphereGeometry(0.075, 14, 14), nMat);
      node.position.copy(end);
      endNodes.push(node);
      root.add(node);
    });

    // --- Code-grid fragment (subtle wireframe plane behind the core) --------
    const gridMat = new THREE.MeshBasicMaterial({ color: cur.edge, wireframe: true, transparent: true, opacity: 0.12 });
    edgeMats.push(gridMat as unknown as THREE.MeshStandardMaterial);
    const grid = new THREE.Mesh(new THREE.PlaneGeometry(7, 7, 10, 10), gridMat);
    grid.position.z = -2.4;
    root.add(grid);

    // --- Lighting (brightened + tone-mapped) --------------------------------
    const hemi = new THREE.HemisphereLight(0x9fb2c4, 0x0b0e16, 0.85);
    scene.add(hemi);
    const key = new THREE.DirectionalLight(0xdfeaf2, 1.35);
    key.position.set(4, 5, 6);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x5fd0d0, 0.4);
    fill.position.set(-5, 1, 4);
    scene.add(fill);
    const rim = new THREE.PointLight(cur.rim, 2.6, 30);
    rim.position.set(-3, -1.5, -3);
    scene.add(rim);

    // --- Interaction state --------------------------------------------------
    const pointerTarget = { x: 0, y: 0 };
    const pointer = { x: 0, y: 0 };
    let scrollN = 0;
    const onPointerMove = (e: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      pointerTarget.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointerTarget.y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    };
    const onScroll = () => { scrollN = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 1.5))); };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    const ro = new ResizeObserver(() => {
      if (!mount.clientWidth || !mount.clientHeight) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    });
    ro.observe(mount);

    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 });
    io.observe(mount);

    // --- Animation loop -----------------------------------------------------
    let raf = 0;
    let spin = 0;
    const clock = new THREE.Clock();
    const animate = () => {
      raf = requestAnimationFrame(animate);
      if (!visible) return;
      const t = clock.getElapsedTime();
      const spider = modeRef.current === "spider";
      const still = reduceRef.current;
      const P = spider ? SPIDER : PRO;
      const k = 0.05;
      cur.core.lerp(P.core, k); cur.glass.lerp(P.glass, k); cur.edge.lerp(P.edge, k);
      cur.path.lerp(P.path, k); cur.node.lerp(P.node, k); cur.node2.lerp(P.node2, k); cur.rim.lerp(P.rim, k);

      coreMat.color.copy(cur.core);
      glassMats.forEach((m) => m.color.copy(cur.glass));
      edgeMats.forEach((m) => { m.color.copy(cur.edge); if (m.emissive) m.emissive.copy(cur.edge).multiplyScalar(0.15); });
      pathMats.forEach((m) => { m.color.copy(cur.path); m.emissive.copy(cur.path); m.emissiveIntensity = spider ? 0.7 : 0.4; });
      const pulse = still ? 1.2 : 1.2 + Math.sin(t * 2) * (spider ? 0.7 : 0.35);
      nodeMats.forEach((m) => { m.color.copy(cur.node); m.emissive.copy(cur.node); m.emissiveIntensity = pulse; });
      node2Mats.forEach((m) => { m.color.copy(cur.node2); m.emissive.copy(cur.node2); m.emissiveIntensity = pulse * 0.8; });
      rowMats.forEach((m) => { m.color.copy(cur.node); m.emissive.copy(cur.node); });
      rim.color.copy(cur.rim);

      if (!still) {
        spin += spider ? 0.0014 : 0.0008;
        core.rotation.x = t * 0.2; core.rotation.y = t * 0.25;
        coreCage.rotation.x = -t * 0.12; coreCage.rotation.y = t * 0.18;
        // Frames breathe subtly at different phases (assembly feel).
        frameGroups.forEach((g, i) => { g.position.z = frameDefs[i].pos[2] + Math.sin(t * 0.6 + i) * 0.12; });
        endNodes.forEach((n, i) => { const s = 1 + Math.sin(t * 2 + i) * 0.15; n.scale.setScalar(s); });
      }

      pointer.x += (pointerTarget.x - pointer.x) * 0.06;
      pointer.y += (pointerTarget.y - pointer.y) * 0.06;
      root.rotation.y = spin + pointer.x * 0.1;      // ~5-6° pointer tilt
      root.rotation.x = pointer.y * 0.08 + scrollN * 0.2;
      camera.position.z = 9 - scrollN * 1.4;          // dolly in on scroll
      camera.position.x = pointer.x * 0.3;
      camera.lookAt(0, 0, 0);
      root.position.z = -scrollN * 1.2;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
      ro.disconnect();
      io.disconnect();
      scene.traverse((obj: THREE.Object3D) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else if (mat) mat.dispose();
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  if (failed) {
    return (
      <div className={`pointer-events-none ${className}`} aria-hidden>
        <div className="absolute inset-[12%] rounded-lg border border-[var(--color-accent-main)]/25 bg-[linear-gradient(135deg,rgba(255,255,255,0.04),transparent)]" />
        <div className="absolute inset-[26%] rounded-lg border border-[var(--color-accent-secondary)]/20" />
        <div className="absolute inset-[40%] rounded-full bg-[radial-gradient(circle,rgba(76,200,242,0.18),transparent_70%)] blur-xl" />
      </div>
    );
  }

  return <div ref={mountRef} className={`pointer-events-none ${className}`} aria-hidden />;
}
