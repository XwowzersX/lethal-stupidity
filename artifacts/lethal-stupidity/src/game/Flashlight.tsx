import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "./useGameStore";

export function Flashlight() {
  const { camera } = useThree();
  const lightRef = useRef<THREE.SpotLight>(null);
  const targetRef = useRef<THREE.Object3D>(null);
  const flashlightOn = useGameStore((s) => s.flashlightOn);

  useFrame(() => {
    if (lightRef.current && targetRef.current) {
      lightRef.current.position.copy(camera.position);
      const dir = new THREE.Vector3();
      camera.getWorldDirection(dir);
      targetRef.current.position.copy(camera.position).add(dir.multiplyScalar(15));
      lightRef.current.target = targetRef.current;
    }
  });

  if (!flashlightOn) return null;

  return (
    <>
      <spotLight
        ref={lightRef}
        angle={0.45}
        penumbra={0.4}
        intensity={3}
        distance={35}
        color="#ffffdd"
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
      />
      <object3D ref={targetRef} />
    </>
  );
}
