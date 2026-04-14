import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ScrapItem } from "./types";

interface ScrapEntityProps {
  item: ScrapItem;
  onCollect: () => void;
  playerPosition: THREE.Vector3;
}

function getItemGeometry(id: string): React.ReactNode {
  const hash = id.charCodeAt(id.length - 1) % 6;
  switch (hash) {
    case 0: return <boxGeometry args={[0.35, 0.35, 0.35]} />;
    case 1: return <dodecahedronGeometry args={[0.25, 0]} />;
    case 2: return <octahedronGeometry args={[0.28, 0]} />;
    case 3: return <tetrahedronGeometry args={[0.3, 0]} />;
    case 4: return <cylinderGeometry args={[0.15, 0.15, 0.4, 8]} />;
    case 5: return <coneGeometry args={[0.2, 0.45, 6]} />;
    default: return <sphereGeometry args={[0.22, 8, 8]} />;
  }
}

export function ScrapEntity({ item, onCollect, playerPosition }: ScrapEntityProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const timeRef = useRef(Math.random() * Math.PI * 2);
  const collectedRef = useRef(false);

  const color = useMemo(() => {
    const hue = ((item.value / 50) * 0.4 + 0.05) % 1;
    return new THREE.Color().setHSL(hue, 0.9, 0.6);
  }, [item.value]);

  useFrame((_, delta) => {
    if (item.collected || collectedRef.current) return;
    timeRef.current += delta;
    const t = timeRef.current;

    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 1.5;
      meshRef.current.rotation.x += delta * 0.5;
      meshRef.current.position.y = 0 + Math.sin(t * 2) * 0.12;
    }

    if (glowRef.current) {
      glowRef.current.rotation.y -= delta * 0.8;
      const pulse = 0.8 + Math.sin(t * 3) * 0.2;
      glowRef.current.scale.setScalar(pulse);
    }

    if (lightRef.current) {
      lightRef.current.intensity = 0.6 + Math.sin(t * 4) * 0.2;
    }

    const dist = (meshRef.current?.getWorldPosition(new THREE.Vector3()) ?? item.position).distanceTo(playerPosition);
    if (dist < 2.5 && !collectedRef.current) {
      collectedRef.current = true;
      onCollect();
    }
  });

  if (item.collected) return null;

  return (
    <group position={item.position.toArray()}>
      <mesh ref={meshRef} castShadow>
        {getItemGeometry(item.id)}
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          metalness={0.7}
          roughness={0.2}
        />
      </mesh>

      <mesh ref={glowRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.5, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1}
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.28, 0]}>
        <circleGeometry args={[0.3, 16]} />
        <meshBasicMaterial color="#000" transparent opacity={0.3} />
      </mesh>

      <pointLight ref={lightRef} color={color} intensity={0.6} distance={5} />
    </group>
  );
}
