import { useMemo } from "react";
import * as THREE from "three";

interface WallProps {
  position: [number, number, number];
  size: [number, number, number];
}

function Wall({ position, size }: WallProps) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#2a2a3a" roughness={0.9} metalness={0.1} />
    </mesh>
  );
}

function Pillar({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <cylinderGeometry args={[0.4, 0.5, 6, 8]} />
      <meshStandardMaterial color="#3a3a4a" roughness={0.8} metalness={0.3} />
    </mesh>
  );
}

function WarningSign({ position, rotation }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <planeGeometry args={[1.5, 1]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={0.1} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[1.3, 0.8]} />
        <meshStandardMaterial color="#ff3300" emissive="#ff3300" emissiveIntensity={0.05} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export function FacilityMap() {
  const walls = useMemo(() => {
    const w: WallProps[] = [];
    const mapSize = 70;
    const wallHeight = 6;
    const wallThickness = 1;

    w.push({ position: [0, wallHeight / 2, -mapSize / 2], size: [mapSize, wallHeight, wallThickness] });
    w.push({ position: [0, wallHeight / 2, mapSize / 2], size: [mapSize, wallHeight, wallThickness] });
    w.push({ position: [-mapSize / 2, wallHeight / 2, 0], size: [wallThickness, wallHeight, mapSize] });
    w.push({ position: [mapSize / 2, wallHeight / 2, 0], size: [wallThickness, wallHeight, mapSize] });

    w.push({ position: [-15, wallHeight / 2, -10], size: [20, wallHeight, wallThickness] });
    w.push({ position: [15, wallHeight / 2, 10], size: [20, wallHeight, wallThickness] });
    w.push({ position: [-10, wallHeight / 2, 15], size: [wallThickness, wallHeight, 15] });
    w.push({ position: [10, wallHeight / 2, -15], size: [wallThickness, wallHeight, 15] });

    w.push({ position: [-25, wallHeight / 2, -25], size: [10, wallHeight, wallThickness] });
    w.push({ position: [25, wallHeight / 2, 25], size: [10, wallHeight, wallThickness] });
    w.push({ position: [-25, wallHeight / 2, 0], size: [wallThickness, wallHeight, 12] });
    w.push({ position: [25, wallHeight / 2, 0], size: [wallThickness, wallHeight, 12] });

    return w;
  }, []);

  const pillars = useMemo(() => {
    const p: [number, number, number][] = [];
    for (let x = -25; x <= 25; x += 10) {
      for (let z = -25; z <= 25; z += 10) {
        if (Math.abs(x) < 5 && Math.abs(z) < 5) continue;
        if (Math.random() > 0.6) {
          p.push([x, 3, z]);
        }
      }
    }
    return p;
  }, []);

  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[70, 70]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.95} />
      </mesh>

      <mesh receiveShadow position={[0, 6, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[70, 70]} />
        <meshStandardMaterial color="#0a0a1e" roughness={1} side={THREE.DoubleSide} />
      </mesh>

      {walls.map((w, i) => (
        <Wall key={i} position={w.position} size={w.size} />
      ))}

      {pillars.map((p, i) => (
        <Pillar key={i} position={p} />
      ))}

      <WarningSign position={[-5, 2.5, -34.4]} />
      <WarningSign position={[12, 2.5, -34.4]} />
      <WarningSign position={[34.4, 2.5, -10]} rotation={[0, Math.PI / 2, 0]} />
      <WarningSign position={[-34.4, 2.5, 15]} rotation={[0, -Math.PI / 2, 0]} />

      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2, 3, 32]} />
        <meshStandardMaterial color="#33ff33" emissive="#33ff33" emissiveIntensity={0.3} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.3, 2.7, 4]} />
        <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={0.5} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
