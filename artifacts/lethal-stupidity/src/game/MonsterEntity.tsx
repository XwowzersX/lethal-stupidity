import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Monster } from "./types";

interface MonsterEntityProps {
  monster: Monster;
}

export function MonsterEntity({ monster }: MonsterEntityProps) {
  const groupRef = useRef<THREE.Group>(null);
  const eyeLeftRef = useRef<THREE.Mesh>(null);
  const eyeRightRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    timeRef.current += delta;
    const group = groupRef.current;
    if (!group) return;

    group.position.copy(monster.position);

    const wobbleSpeed = monster.state === "chasing" ? 8 : 3;
    const wobbleAmount = monster.state === "chasing" ? 0.15 : 0.05;
    group.rotation.z = Math.sin(timeRef.current * wobbleSpeed) * wobbleAmount;
    group.rotation.x = Math.cos(timeRef.current * wobbleSpeed * 0.7) * wobbleAmount * 0.5;

    if (monster.state === "chasing") {
      const bounce = Math.abs(Math.sin(timeRef.current * 10)) * 0.3;
      group.position.y = monster.scale[1] / 2 + bounce;
    }

    if (eyeLeftRef.current && eyeRightRef.current) {
      const eyeScale = monster.state === "alerted" || monster.state === "chasing"
        ? 1.5 + Math.sin(timeRef.current * 5) * 0.3
        : 1;
      eyeLeftRef.current.scale.setScalar(eyeScale);
      eyeRightRef.current.scale.setScalar(eyeScale);
    }
  });

  const alertColor = monster.state === "chasing"
    ? "#ff0000"
    : monster.state === "alerted"
    ? "#ffaa00"
    : monster.color;

  return (
    <group ref={groupRef} position={monster.position.toArray()}>
      <mesh castShadow>
        <boxGeometry args={monster.scale} />
        <meshStandardMaterial
          color={alertColor}
          emissive={monster.state === "chasing" ? "#ff0000" : "#000000"}
          emissiveIntensity={monster.state === "chasing" ? 0.5 : 0}
        />
      </mesh>

      <mesh
        ref={eyeLeftRef}
        position={[-monster.scale[0] * 0.25, monster.scale[1] * 0.2, monster.scale[2] * 0.51]}
      >
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.3} />
      </mesh>
      <mesh
        position={[-monster.scale[0] * 0.25, monster.scale[1] * 0.2, monster.scale[2] * 0.53]}
      >
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="black" />
      </mesh>

      <mesh
        ref={eyeRightRef}
        position={[monster.scale[0] * 0.25, monster.scale[1] * 0.2, monster.scale[2] * 0.51]}
      >
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.3} />
      </mesh>
      <mesh
        position={[monster.scale[0] * 0.25, monster.scale[1] * 0.2, monster.scale[2] * 0.53]}
      >
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="black" />
      </mesh>

      {monster.state === "alerted" && (
        <mesh position={[0, monster.scale[1] * 0.6, 0]}>
          <coneGeometry args={[0.2, 0.5, 4]} />
          <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.8} />
        </mesh>
      )}
      {monster.state === "chasing" && (
        <mesh position={[0, monster.scale[1] * 0.6, 0]}>
          <coneGeometry args={[0.3, 0.6, 4]} />
          <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={1} />
        </mesh>
      )}

      <pointLight
        color={alertColor}
        intensity={monster.state === "chasing" ? 2 : monster.state === "alerted" ? 0.5 : 0}
        distance={8}
      />
    </group>
  );
}
