import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { Monster } from "./types";

const CHAR_LETTERS = ["a", "b", "c", "d", "e", "f", "g", "h"];

CHAR_LETTERS.forEach((c) => {
  useGLTF.preload(`/characters/character-${c}.glb`);
});

function AlertIndicator({ state, height }: { state: Monster["state"]; height: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const t = useRef(0);

  useFrame((_, delta) => {
    t.current += delta;
    if (meshRef.current) {
      meshRef.current.rotation.y = t.current * 2;
      const pulse = 1 + Math.sin(t.current * 6) * 0.2;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  if (state === "patrolling" || state === "idle") return null;

  const color = state === "chasing" ? "#ff0000" : "#ffcc00";

  return (
    <group position={[0, height + 0.3, 0]}>
      <mesh ref={meshRef}>
        <coneGeometry args={[0.18, 0.45, 4]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
      </mesh>
      <pointLight color={color} intensity={state === "chasing" ? 4 : 1.5} distance={8} />
    </group>
  );
}

function MonsterModel({ modelChar, scale, state, color }: {
  modelChar: string;
  scale: [number, number, number];
  state: Monster["state"];
  color: string;
}) {
  const { scene } = useGLTF(`/characters/character-${modelChar}.glb`);
  const cloned = useMemo(() => {
    const clone = scene.clone(true);

    clone.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        if (Array.isArray(mesh.material)) {
          mesh.material = mesh.material.map((m) => m.clone());
        } else {
          mesh.material = (mesh.material as THREE.Material).clone();
        }
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
    return clone;
  }, [scene, modelChar]);

  useEffect(() => {
    cloned.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        const applyToMat = (mat: THREE.Material) => {
          const stdMat = mat as THREE.MeshStandardMaterial;
          if (state === "chasing") {
            stdMat.emissive = new THREE.Color("#550000");
            stdMat.emissiveIntensity = 0.5 + Math.random() * 0.1;
          } else if (state === "alerted") {
            stdMat.emissive = new THREE.Color("#443300");
            stdMat.emissiveIntensity = 0.3;
          } else {
            stdMat.emissive = new THREE.Color("#000000");
            stdMat.emissiveIntensity = 0;
          }
        };
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(applyToMat);
        } else {
          applyToMat(mesh.material as THREE.Material);
        }
      }
    });
  }, [state, cloned]);

  const modelScale = scale[1] * 0.52;

  return (
    <primitive
      object={cloned}
      scale={[modelScale, modelScale, modelScale]}
      position={[0, 0, 0]}
    />
  );
}

export function MonsterEntity({ monster }: { monster: Monster }) {
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(Math.random() * Math.PI * 2);
  const facingRef = useRef(new THREE.Vector3(0, 0, 1));

  useFrame((_, delta) => {
    timeRef.current += delta;
    const t = timeRef.current;
    const group = groupRef.current;
    if (!group) return;

    group.position.set(monster.position.x, monster.position.y, monster.position.z);

    if (monster.patrolTarget) {
      const dir = new THREE.Vector3()
        .subVectors(
          monster.state === "chasing" || monster.state === "alerted"
            ? new THREE.Vector3(0, 0, 0)
            : monster.patrolTarget,
          monster.position
        );
      dir.y = 0;
      if (dir.length() > 0.1) {
        facingRef.current.lerp(dir.normalize(), 0.15);
        const angle = Math.atan2(facingRef.current.x, facingRef.current.z);
        group.rotation.y = angle;
      }
    }

    if (monster.state === "chasing") {
      const bounce = Math.abs(Math.sin(t * 10)) * 0.25;
      group.position.y = monster.position.y + bounce;
      group.rotation.z = Math.sin(t * 8) * 0.15;
    } else if (monster.state === "alerted") {
      group.rotation.z = Math.sin(t * 4) * 0.08;
    } else {
      const sway = Math.sin(t * 1.5) * 0.03;
      group.rotation.z = sway;
    }
  });

  const modelHeight = monster.scale[1];

  return (
    <group ref={groupRef} position={monster.position.toArray()}>
      <MonsterModel
        modelChar={monster.modelChar}
        scale={monster.scale}
        state={monster.state}
        color={monster.color}
      />

      <AlertIndicator state={monster.state} height={modelHeight} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[monster.scale[0] * 0.55, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.35} />
      </mesh>
    </group>
  );
}
