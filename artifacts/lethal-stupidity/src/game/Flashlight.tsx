import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "./useGameStore";

export function Flashlight() {
  const { camera } = useThree();
  const lightRef = useRef<THREE.SpotLight>(null);
  const lightRef2 = useRef<THREE.SpotLight>(null);
  const targetRef = useRef<THREE.Object3D>(null);
  const directionRef = useRef(new THREE.Vector3());
  const targetPositionRef = useRef(new THREE.Vector3());
  const flashlightOn = useGameStore((s) => s.flashlightOn);

  useFrame(() => {
    if (!targetRef.current) return;
    const dir = directionRef.current;
    camera.getWorldDirection(dir);
    targetPositionRef.current.copy(camera.position).addScaledVector(dir, 14);

    if (lightRef.current) {
      lightRef.current.position.copy(camera.position);
      lightRef.current.position.y -= 0.1;
      lightRef.current.intensity = flashlightOn ? 3.8 : 0;
      if (lightRef.current.target) {
        lightRef.current.target.position.copy(targetPositionRef.current);
        lightRef.current.target.updateMatrixWorld();
      }
    }
    if (lightRef2.current) {
      lightRef2.current.position.copy(camera.position);
      lightRef2.current.intensity = flashlightOn ? 1.2 : 0;
      if (lightRef2.current.target) {
        lightRef2.current.target.position.copy(targetPositionRef.current);
        lightRef2.current.target.updateMatrixWorld();
      }
    }
    if (targetRef.current) {
      targetRef.current.position.copy(targetPositionRef.current);
      targetRef.current.updateMatrixWorld();
    }
  });

  return (
    <>
      <object3D ref={targetRef} />
      <spotLight
        ref={lightRef}
        target={targetRef.current ?? undefined}
        angle={0.5}
        penumbra={0.65}
        intensity={0}
        distance={34}
        color="#fff1d6"
        castShadow={false}
      />
      <spotLight
        ref={lightRef2}
        target={targetRef.current ?? undefined}
        angle={0.72}
        penumbra={0.95}
        intensity={0}
        distance={22}
        color="#fff0e0"
        castShadow={false}
      />
    </>
  );
}
