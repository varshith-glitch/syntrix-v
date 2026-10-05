import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function Core({ compact = false }: { compact?: boolean }) {
  const mount = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = mount.current;
    if (!el) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.z = 8.5;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    el.appendChild(renderer.domElement);
    const group = new THREE.Group(); scene.add(group);
    const shell = new THREE.Mesh(new THREE.SphereGeometry(2.22, 48, 32), new THREE.MeshBasicMaterial({ color: 0x72d8e2, transparent: true, opacity: 0.075, side: THREE.DoubleSide, wireframe: true })); group.add(shell);
    const inner = new THREE.Mesh(new THREE.IcosahedronGeometry(1.55, 2), new THREE.MeshBasicMaterial({ color: 0x817bd9, transparent: true, opacity: 0.13, wireframe: true })); group.add(inner);
    const points: THREE.Vector3[] = [];
    const strands: [THREE.Vector3[], THREE.Vector3[]] = [[], []];
    for (let i = 0; i <= 88; i++) {
      const t = (i / 88) * Math.PI * 8;
      const y = (i / 88 - .5) * 3.2;
      strands[0].push(new THREE.Vector3(Math.cos(t) * .78, y, Math.sin(t) * .78));
      strands[1].push(new THREE.Vector3(-Math.cos(t) * .78, y, -Math.sin(t) * .78));
      if (i % 4 === 0) { const a = strands[0][i], b = strands[1][i]; if (a && b) points.push(a, b); }
    }
    const cyan = new THREE.LineBasicMaterial({ color: 0x86eaf0, transparent: true, opacity: .86 });
    const violet = new THREE.LineBasicMaterial({ color: 0xac91ee, transparent: true, opacity: .75 });
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(strands[0]), cyan));
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(strands[1]), violet));
    for (let i = 0; i < points.length; i += 2) { const a = points[i], b = points[i+1]; if (a && b) group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([a, b]), new THREE.LineBasicMaterial({ color: 0x84bbb8, transparent: true, opacity: .27 }))); }
    const particlePositions = new Float32Array(270 * 3);
    for (let i = 0; i < 270; i++) { const a = i * 2.39996, r = 1.4 + (i % 17) / 17 * 1.6, h = ((i * 73) % 101) / 101 * 2 - 1; particlePositions.set([Math.cos(a) * r * Math.sqrt(1-h*h), h*r, Math.sin(a)*r*Math.sqrt(1-h*h)], i*3); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particles = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0x84e2dd, size: .035, transparent: true, opacity: .78, sizeAttenuation: true })); group.add(particles);
    const orbit = new THREE.Group(); scene.add(orbit);
    for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; const node = new THREE.Mesh(new THREE.SphereGeometry(i % 2 ? .07 : .1, 12, 8), new THREE.MeshBasicMaterial({ color: i % 2 ? 0x9e8cdf : 0x8be4c5 })); node.position.set(Math.cos(a)*2.6, Math.sin(a*1.7)*.85, Math.sin(a)*2.6); orbit.add(node); }
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.6, .008, 8, 100), new THREE.MeshBasicMaterial({ color: 0x7ab6bc, transparent: true, opacity: .24 })); ring.rotation.x = 1.13; scene.add(ring);
    const resize = () => { const w = el.clientWidth, h = el.clientHeight; renderer.setSize(w,h); camera.aspect=w/h; camera.updateProjectionMatrix(); };
    const observer = new ResizeObserver(resize); observer.observe(el); resize();
    let frame = 0; let raf = 0; let last = 0; let inView = true;
    const running = () => inView && document.visibilityState === 'visible';
    const start = () => { if (!reducedMotion && !raf && running()) raf = requestAnimationFrame(animate); };
    const io = new IntersectionObserver(([entry]) => { inView = !!entry?.isIntersecting; if (inView) start(); }, { threshold: 0.01 }); io.observe(el);
    const onVis = () => start(); document.addEventListener('visibilitychange', onVis);
    const animate = (now: number) => { raf = 0; if (!running()) return; raf = requestAnimationFrame(animate); if (now - last < 33) return; last = now; frame += .008; group.rotation.y = frame; group.rotation.z = Math.sin(frame*.4)*.08; orbit.rotation.y = -frame*.45; ring.rotation.z = frame*.11; renderer.render(scene,camera); };
    renderer.render(scene, camera); start();
    return () => { cancelAnimationFrame(raf); io.disconnect(); document.removeEventListener('visibilitychange', onVis); observer.disconnect(); renderer.dispose(); scene.traverse(obj => { if (obj instanceof THREE.Mesh || obj instanceof THREE.Line || obj instanceof THREE.Points) { obj.geometry.dispose(); const materials = Array.isArray(obj.material) ? obj.material : [obj.material]; materials.forEach(m=>m.dispose()); } }); el.removeChild(renderer.domElement); };
  }, []);
  return <div ref={mount} aria-label="Animated SYNTRIX Core: DNA strands, particles and orbiting nodes" role="img" className={compact ? 'h-20 w-20 shrink-0' : 'h-full w-full min-h-[185px] sm:min-h-[250px]'} />;
}
