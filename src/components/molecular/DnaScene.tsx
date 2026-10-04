import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

const complement: Record<string, string> = { A: 'T', T: 'A', C: 'G', G: 'C' };
const baseColors: Record<string, string> = { A: '#57dedf', T: '#bc9df1', C: '#6edcaf', G: '#e9b980' };
const dummy = new THREE.Object3D();

function Helix({ sequence, selected, onSelect, rotating }: { sequence: string; selected: number; onSelect: (index: number) => void; rotating: boolean }) {
  const group = useRef<THREE.Group>(null);
  const atoms = useRef<THREE.InstancedMesh>(null);
  const rungs = useRef<THREE.InstancedMesh>(null);
  const n = sequence.length;
  const positions = useMemo(() => Array.from({ length: n }, (_, i) => {
    const theta = i * Math.PI / 5 + .35;
    const y = (i - (n - 1) / 2) * Math.min(.26, 7.2 / Math.max(n, 1));
    return { theta, y, a: new THREE.Vector3(Math.cos(theta) * 1.08, y, Math.sin(theta) * 1.08), b: new THREE.Vector3(-Math.cos(theta) * 1.08, y, -Math.sin(theta) * 1.08) };
  }), [n]);
  const strands = useMemo(() => [0, 1].map(side => new THREE.CatmullRomCurve3(positions.map(p => side === 0 ? p.a : p.b))), [positions]);
  useEffect(() => {
    if (!atoms.current || !rungs.current) return;
    positions.forEach((p, i) => {
      for (let side = 0; side < 2; side++) {
        const base = side === 0 ? sequence[i] : complement[sequence[i] ?? 'A'];
        dummy.position.copy(side === 0 ? p.a : p.b); dummy.scale.setScalar(i === selected ? 1.45 : 1); dummy.rotation.set(0, 0, 0); dummy.updateMatrix();
        atoms.current?.setMatrixAt(i * 2 + side, dummy.matrix);
        atoms.current?.setColorAt(i * 2 + side, new THREE.Color(baseColors[base ?? 'A']));
      }
      dummy.position.copy(p.a).add(p.b).multiplyScalar(.5);
      dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), p.b.clone().sub(p.a).normalize());
      dummy.scale.set(1, p.a.distanceTo(p.b), 1); dummy.updateMatrix();
      rungs.current?.setMatrixAt(i, dummy.matrix);
      rungs.current?.setColorAt(i, new THREE.Color(i === selected ? '#e7f4f4' : '#618b9b'));
    });
    atoms.current.instanceMatrix.needsUpdate = true;
    rungs.current.instanceMatrix.needsUpdate = true;
    if (atoms.current.instanceColor) atoms.current.instanceColor.needsUpdate = true;
    if (rungs.current.instanceColor) rungs.current.instanceColor.needsUpdate = true;
  }, [positions, selected, sequence]);
  useFrame((_, delta) => { if (rotating && group.current) group.current.rotation.y += Math.min(delta, .05) * .22; });
  return <group ref={group} rotation={[.12, .4, -.1]}>
    {strands.map((curve, i) => <mesh key={i}><tubeGeometry args={[curve, Math.max(32, n * 10), .035, 8, false]} /><meshStandardMaterial color={i ? '#a791df' : '#64b6c3'} metalness={.35} roughness={.35} /></mesh>)}
    <instancedMesh key={`atoms-${n}`} ref={atoms} args={[undefined, undefined, n * 2]} onClick={e => { e.stopPropagation(); if (e.instanceId !== undefined) onSelect(Math.floor(e.instanceId / 2)); }}>
      <sphereGeometry args={[.13, 12, 10]} /><meshStandardMaterial vertexColors metalness={.18} roughness={.32} emissive={'#2c6570'} emissiveIntensity={.28} />
    </instancedMesh>
    <instancedMesh key={`rungs-${n}`} ref={rungs} args={[undefined, undefined, n]} onClick={e => { e.stopPropagation(); if (e.instanceId !== undefined) onSelect(e.instanceId); }}>
      <cylinderGeometry args={[.023, .023, 1, 6]} /><meshStandardMaterial vertexColors metalness={.25} roughness={.5} />
    </instancedMesh>
  </group>;
}

export function DnaScene({ sequence, selected, onSelect, rotating }: { sequence: string; selected: number; onSelect: (index: number) => void; rotating: boolean }) {
  return <div className="absolute inset-0" role="img" aria-label={`Interactive three-dimensional DNA double helix showing ${sequence.length} base pairs. Drag to rotate and scroll to zoom.`}>
    <Canvas camera={{ position: [0, 0, 10.5], fov: 42 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={1.4} /><directionalLight position={[3, 5, 6]} intensity={2.2} /><pointLight position={[-4, -2, 2]} intensity={1.5} color="#a791df" />
      <Helix sequence={sequence} selected={selected} onSelect={onSelect} rotating={rotating} />
      <OrbitControls enablePan={false} minDistance={5.5} maxDistance={17} enableDamping dampingFactor={.08} />
    </Canvas>
  </div>;
}
