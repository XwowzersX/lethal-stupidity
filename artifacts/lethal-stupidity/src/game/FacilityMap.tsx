import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  createConcreteTexture,
  createRustMetalTexture,
  createFloorTexture,
  createCeilingTexture,
  createNormalMap,
} from "./textures";

function useTextures() {
  return useMemo(() => {
    const floor = createFloorTexture();
    const concrete = createConcreteTexture();
    const metal = createRustMetalTexture();
    const ceiling = createCeilingTexture();
    const concreteNormal = createNormalMap(concrete);
    const floorNormal = createNormalMap(floor);
    return { floor, concrete, metal, ceiling, concreteNormal, floorNormal };
  }, []);
}

interface WallProps {
  position: [number, number, number];
  size: [number, number, number];
  texture: THREE.CanvasTexture;
  normalMap?: THREE.CanvasTexture;
}

function Wall({ position, size, texture, normalMap }: WallProps) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        map={texture}
        color="#d8d8d0"
        normalMap={normalMap}
        normalScale={new THREE.Vector2(0.35, 0.35)}
        emissive="#1d1f22"
        emissiveIntensity={0.28}
        roughness={0.9}
        metalness={0.05}
      />
    </mesh>
  );
}

function Pillar({ position, texture }: { position: [number, number, number]; texture: THREE.CanvasTexture }) {
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.4, 0.5, 6, 6]} />
        <meshStandardMaterial map={texture} color="#d6d2c8" emissive="#181818" emissiveIntensity={0.22} roughness={0.8} metalness={0.2} />
      </mesh>
      <mesh position={[0, -2.8, 0]}>
        <boxGeometry args={[1.2, 0.4, 1.2]} />
        <meshStandardMaterial map={texture} color="#d6d2c8" emissive="#181818" emissiveIntensity={0.22} roughness={0.8} />
      </mesh>
      <mesh position={[0, 2.8, 0]}>
        <boxGeometry args={[1.2, 0.4, 1.2]} />
        <meshStandardMaterial map={texture} color="#d6d2c8" emissive="#181818" emissiveIntensity={0.22} roughness={0.8} />
      </mesh>
    </group>
  );
}

function CeilingLight({ position }: { position: [number, number, number]; withShadow?: boolean }) {
  const flickerRef = useRef<THREE.PointLight>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const stateRef = useRef({
    baseIntensity: 1.1 + Math.random() * 0.5,
    flickerTimer: 0,
    flickerInterval: 3 + Math.random() * 10,
    isFlickering: Math.random() > 0.85,
  });

  useFrame((_, delta) => {
    const s = stateRef.current;
    s.flickerTimer += delta;

    if (s.isFlickering && s.flickerTimer > s.flickerInterval) {
      s.flickerTimer = 0;
      s.flickerInterval = 0.05 + Math.random() * 0.2;

      const flicker = Math.random();
      if (flickerRef.current) {
        flickerRef.current.intensity = flicker > 0.18 ? s.baseIntensity : Math.random() * 0.25;
      }

      if (Math.random() > 0.9) {
        s.flickerInterval = 1 + Math.random() * 5;
      }
    }
  });

  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[1.5, 0.1, 0.4]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.6} metalness={0.8} />
      </mesh>
      <mesh ref={meshRef} position={[0, -0.06, 0]}>
        <boxGeometry args={[1.3, 0.02, 0.3]} />
        <meshStandardMaterial
          color="#ffffcc"
          emissive="#ffffcc"
          emissiveIntensity={1.8}
          roughness={0.1}
        />
      </mesh>
      <pointLight
        ref={flickerRef}
        color="#ffe8b0"
        intensity={stateRef.current.baseIntensity}
        distance={14}
        decay={2}
        castShadow={false}
      />
    </group>
  );
}

function Pipe({ from, to, texture }: { from: [number, number, number]; to: [number, number, number]; texture: THREE.CanvasTexture }) {
  const mid: [number, number, number] = [
    (from[0] + to[0]) / 2,
    (from[1] + to[1]) / 2,
    (from[2] + to[2]) / 2,
  ];
  const len = Math.sqrt(
    (to[0] - from[0]) ** 2 + (to[1] - from[1]) ** 2 + (to[2] - from[2]) ** 2
  );
  const dir = new THREE.Vector3(to[0] - from[0], to[1] - from[1], to[2] - from[2]).normalize();
  const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

  return (
    <mesh position={mid} quaternion={quat}>
      <cylinderGeometry args={[0.08, 0.08, len, 6]} />
      <meshStandardMaterial map={texture} roughness={0.5} metalness={0.7} />
    </mesh>
  );
}

function Vent({ position, rotation }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <boxGeometry args={[1, 0.8, 0.05]} />
        <meshStandardMaterial color="#1a1a24" roughness={0.7} metalness={0.5} />
      </mesh>
      {[-0.3, -0.1, 0.1, 0.3].map((y, i) => (
        <mesh key={i} position={[0, y, 0.03]}>
          <boxGeometry args={[0.9, 0.06, 0.1]} />
          <meshStandardMaterial color="#111118" roughness={0.6} metalness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function BloodStain({ position }: { position: [number, number, number] }) {
  const size = 0.5 + Math.random() * 1.5;
  return (
    <mesh position={[position[0], 0.01, position[2]]} rotation={[-Math.PI / 2, 0, Math.random() * Math.PI * 2]}>
      <circleGeometry args={[size, 8]} />
      <meshStandardMaterial
        color="#3a0000"
        roughness={1}
        transparent
        opacity={0.7 + Math.random() * 0.3}
      />
    </mesh>
  );
}

function ExtractionZone() {
  const ringRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.PointLight>(null);
  const tRef = useRef(0);

  useFrame((_, delta) => {
    tRef.current += delta;
    if (ringRef.current) {
      ringRef.current.rotation.z = tRef.current * 0.5;
    }
    if (glowRef.current) {
      glowRef.current.intensity = 1 + Math.sin(tRef.current * 3) * 0.4;
    }
  });

  return (
    <group position={[0, 0.01, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3.5, 24]} />
        <meshStandardMaterial
          color="#003300"
          emissive="#002200"
          emissiveIntensity={0.5}
          transparent
          opacity={0.6}
        />
      </mesh>
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3, 3.5, 24]} />
        <meshStandardMaterial
          color="#00ff00"
          emissive="#00ff00"
          emissiveIntensity={1}
          transparent
          opacity={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2, 2.1, 4]} />
        <meshStandardMaterial
          color="#00ff00"
          emissive="#00ff00"
          emissiveIntensity={2}
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>
      <pointLight ref={glowRef} color="#00ff00" intensity={0.8} distance={8} />
    </group>
  );
}

const BLOOD_POSITIONS: [number, number, number][] = [
  [5, 0, -10], [-8, 0, 15], [20, 0, 5], [-15, 0, -20],
  [30, 0, -5], [-25, 0, 10], [10, 0, 25], [-5, 0, -30],
];

const PIPE_RUNS: Array<[[number, number, number], [number, number, number]]> = [
  [[-35, 5.5, -10], [35, 5.5, -10]],
  [[-35, 5.2, 15], [20, 5.2, 15]],
  [[-10, 5.5, -35], [-10, 5.5, 35]],
  [[20, 5.3, -35], [20, 5.3, 20]],
];

const VENT_POSITIONS: Array<{ position: [number, number, number]; rotation?: [number, number, number] }> = [
  { position: [-34.4, 2.5, -15], rotation: [0, Math.PI / 2, 0] },
  { position: [34.4, 2.5, 10], rotation: [0, -Math.PI / 2, 0] },
  { position: [5, 2.5, -34.4] },
  { position: [-20, 2.5, 34.4], rotation: [0, Math.PI, 0] },
];

const LIGHT_POSITIONS: [number, number, number][] = [
  [0, 5.85, 0], [-15, 5.85, -15], [15, 5.85, 15],
  [-20, 5.85, 10], [20, 5.85, -10], [0, 5.85, -20],
  [0, 5.85, 20], [-30, 5.85, 0], [30, 5.85, 0],
  [-15, 5.85, 20], [15, 5.85, -20], [-5, 5.85, -30],
];

const PILLAR_POSITIONS: [number, number, number][] = [
  [-20, 3, -20], [20, 3, -20], [-20, 3, 20], [20, 3, 20],
  [-10, 3, -10], [10, 3, -10], [-10, 3, 10], [10, 3, 10],
  [-30, 3, 0], [30, 3, 0], [0, 3, -30], [0, 3, 30],
  [-25, 3, 15], [25, 3, -15],
];

const WALL_DEFINITIONS: Array<{ position: [number, number, number]; size: [number, number, number] }> = [
  { position: [0, 3, -35], size: [70, 6, 1] },
  { position: [0, 3, 35], size: [70, 6, 1] },
  { position: [-35, 3, 0], size: [1, 6, 70] },
  { position: [35, 3, 0], size: [1, 6, 70] },
  { position: [-15, 3, -10], size: [20, 6, 1] },
  { position: [15, 3, 10], size: [20, 6, 1] },
  { position: [-10, 3, 15], size: [1, 6, 15] },
  { position: [10, 3, -15], size: [1, 6, 15] },
  { position: [-25, 3, -25], size: [10, 6, 1] },
  { position: [25, 3, 25], size: [10, 6, 1] },
  { position: [-25, 3, 0], size: [1, 6, 12] },
  { position: [25, 3, 0], size: [1, 6, 12] },
  { position: [0, 3, -20], size: [1, 6, 10] },
  { position: [-5, 3, 20], size: [8, 6, 1] },
];

export function FacilityMap() {
  const { floor, concrete, metal, ceiling, concreteNormal } = useTextures();

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[70, 70, 20, 20]} />
        <meshStandardMaterial
          map={floor}
          color="#e0ded2"
          emissive="#202020"
          emissiveIntensity={0.32}
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>

      <mesh position={[0, 6, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[70, 70, 10, 10]} />
        <meshStandardMaterial
          map={ceiling}
          color="#d0d0c8"
          emissive="#15171a"
          emissiveIntensity={0.2}
          roughness={1}
          metalness={0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {WALL_DEFINITIONS.map((w, i) => (
        <Wall
          key={i}
          position={w.position}
          size={w.size}
          texture={i % 3 === 0 ? metal : concrete}
          normalMap={concreteNormal}
        />
      ))}

      {PILLAR_POSITIONS.map((p, i) => (
        <Pillar key={i} position={p} texture={i % 2 === 0 ? concrete : metal} />
      ))}

      {LIGHT_POSITIONS.map((p, i) => (
        <CeilingLight key={i} position={p} />
      ))}

      {PIPE_RUNS.map((run, i) => (
        <Pipe key={i} from={run[0]} to={run[1]} texture={metal} />
      ))}

      {VENT_POSITIONS.map((v, i) => (
        <Vent key={i} position={v.position} rotation={v.rotation} />
      ))}

      {BLOOD_POSITIONS.map((p, i) => (
        <BloodStain key={i} position={p} />
      ))}

      <ExtractionZone />

      <mesh position={[-20, 4, -33.4]}>
        <boxGeometry args={[4, 2, 0.3]} />
        <meshStandardMaterial color="#111118" roughness={0.8} metalness={0.6} />
      </mesh>

      <mesh position={[20, 4, 33.4]}>
        <boxGeometry args={[4, 2, 0.3]} />
        <meshStandardMaterial color="#111118" roughness={0.8} metalness={0.6} />
      </mesh>

      {[-25, 0, 25].map((x, i) => (
        <group key={i}>
          <mesh position={[x, 1, -15]}>
            <boxGeometry args={[1.2, 2, 0.8]} />
            <meshStandardMaterial map={metal} roughness={0.7} metalness={0.5} />
          </mesh>
          <mesh position={[x, 0.5, -15]}>
            <boxGeometry args={[1.4, 0.2, 1]} />
            <meshStandardMaterial color="#111" roughness={1} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
