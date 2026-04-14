import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Monster } from "./types";
import { createMonsterSkinTexture } from "./textures";

interface MonsterEntityProps {
  monster: Monster;
}

function MonsterEyes({ scale, state, timeRef }: {
  scale: [number, number, number];
  state: Monster["state"];
  timeRef: React.MutableRefObject<number>;
}) {
  const leftRef = useRef<THREE.Mesh>(null);
  const rightRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const t = timeRef.current;
    const eyeScale = (state === "alerted" || state === "chasing")
      ? 1.4 + Math.sin(t * 6) * 0.2
      : 1 + Math.sin(t * 2) * 0.05;

    leftRef.current?.scale.setScalar(eyeScale);
    rightRef.current?.scale.setScalar(eyeScale);
  });

  const eyeColor = state === "chasing" ? "#ff2200" : state === "alerted" ? "#ffaa00" : "#ffffff";
  const eyeEmissive = state === "chasing" ? "#ff0000" : state === "alerted" ? "#ff8800" : "#888888";
  const eyeDepth = scale[2] * 0.52;
  const eyeHeight = scale[1] * 0.2;

  return (
    <>
      <mesh ref={leftRef} position={[-scale[0] * 0.22, eyeHeight, eyeDepth]}>
        <sphereGeometry args={[0.14, 10, 10]} />
        <meshStandardMaterial color={eyeColor} emissive={eyeEmissive} emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[-scale[0] * 0.22, eyeHeight, eyeDepth + 0.03]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color="#000" />
      </mesh>
      <mesh ref={rightRef} position={[scale[0] * 0.22, eyeHeight, eyeDepth]}>
        <sphereGeometry args={[0.14, 10, 10]} />
        <meshStandardMaterial color={eyeColor} emissive={eyeEmissive} emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[scale[0] * 0.22, eyeHeight, eyeDepth + 0.03]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color="#000" />
      </mesh>
    </>
  );
}

export function MonsterEntity({ monster }: MonsterEntityProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const shadowRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(Math.random() * Math.PI * 2);

  const skinTexture = useMemo(() => createMonsterSkinTexture(monster.color), [monster.color]);

  const alertColor = monster.state === "chasing"
    ? "#ff2200"
    : monster.state === "alerted"
    ? "#ff8800"
    : monster.color;

  useFrame((_, delta) => {
    timeRef.current += delta;
    const t = timeRef.current;
    const group = groupRef.current;
    if (!group) return;

    group.position.set(monster.position.x, monster.position.y, monster.position.z);

    if (monster.state === "chasing") {
      const bounce = Math.abs(Math.sin(t * 12)) * 0.4;
      group.position.y = monster.scale[1] / 2 + bounce;
      group.rotation.z = Math.sin(t * 10) * 0.2;
      group.rotation.x = Math.sin(t * 8) * 0.1;

      if (bodyRef.current) {
        const mat = bodyRef.current.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = 0.3 + Math.sin(t * 8) * 0.2;
      }
    } else if (monster.state === "alerted") {
      group.rotation.z = Math.sin(t * 5) * 0.12;
      group.rotation.y += delta * 1.5;
    } else {
      group.rotation.z = Math.sin(t * 2) * 0.04;
    }

    if (shadowRef.current) {
      const shadowY = -(monster.scale[1] / 2 + (group.position.y - monster.scale[1] / 2));
      shadowRef.current.position.y = shadowY + 0.02;
    }
  });

  const [sw, , sd] = monster.scale;
  const shadowRadius = Math.max(sw, sd) * 0.6;

  return (
    <group ref={groupRef} position={monster.position.toArray()}>
      <mesh ref={bodyRef} castShadow>
        <boxGeometry args={monster.scale} />
        <meshStandardMaterial
          map={skinTexture}
          roughness={0.7}
          metalness={0.1}
          emissive={new THREE.Color(alertColor)}
          emissiveIntensity={monster.state === "chasing" ? 0.3 : 0}
        />
      </mesh>

      <mesh position={[0, monster.scale[1] * 0.45, 0]} castShadow>
        <boxGeometry args={[monster.scale[0] * 0.9, monster.scale[1] * 0.12, monster.scale[2] * 0.9]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
      </mesh>

      <MonsterEyes scale={monster.scale} state={monster.state} timeRef={timeRef} />

      <mesh ref={shadowRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[shadowRadius, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.4} />
      </mesh>

      {monster.state === "alerted" && (
        <group position={[0, monster.scale[1] * 0.65, 0]}>
          <mesh>
            <coneGeometry args={[0.25, 0.55, 4]} />
            <meshStandardMaterial
              color="#ffcc00"
              emissive="#ffcc00"
              emissiveIntensity={1.5}
              transparent
              opacity={0.9}
            />
          </mesh>
          <mesh position={[0, 0.1, 0]}>
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshStandardMaterial color="#ff6600" emissive="#ff6600" emissiveIntensity={2} />
          </mesh>
        </group>
      )}

      {monster.state === "chasing" && (
        <group position={[0, monster.scale[1] * 0.7, 0]}>
          <mesh>
            <coneGeometry args={[0.35, 0.7, 4]} />
            <meshStandardMaterial
              color="#ff0000"
              emissive="#ff0000"
              emissiveIntensity={2}
              transparent
              opacity={0.85}
            />
          </mesh>
        </group>
      )}

      <pointLight
        color={alertColor}
        intensity={
          monster.state === "chasing" ? 3 :
          monster.state === "alerted" ? 1 : 0
        }
        distance={10}
      />
    </group>
  );
}
