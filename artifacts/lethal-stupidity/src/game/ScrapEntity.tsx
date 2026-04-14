import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ScrapItem } from "./types";

interface ScrapEntityProps {
  item: ScrapItem;
  onCollect: () => void;
  playerPosition: THREE.Vector3;
}

export function ScrapEntity({ item, onCollect, playerPosition }: ScrapEntityProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(Math.random() * Math.PI * 2);

  useFrame((_, delta) => {
    timeRef.current += delta;
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 2;
      meshRef.current.position.y = item.position.y + Math.sin(timeRef.current * 2) * 0.15;

      const dist = meshRef.current.position.distanceTo(playerPosition);
      if (dist < 2.5) {
        onCollect();
      }
    }
  });

  if (item.collected) return null;

  const hue = (item.value / 50) * 0.3;
  const color = new THREE.Color().setHSL(hue, 0.8, 0.6);

  return (
    <group position={item.position.toArray()}>
      <mesh ref={meshRef} castShadow>
        <dodecahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>
      <pointLight color={color} intensity={0.5} distance={4} />
    </group>
  );
}
