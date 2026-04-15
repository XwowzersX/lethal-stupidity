import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "./useGameStore";

export function Flashlight() {
  const { camera } = useThree();
  const lightRef = useRef<THREE.SpotLight>(null);
  const lightRef2 = useRef<THREE.SpotLight>(null);
  const targetRef = useRef<THREE.Object3D>(null);
  const flashlightOn = useGameStore((s) => s.flashlightOn);

  useFrame(() => {
    if (!targetRef.current) return;
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);

    if (lightRef.current) {
      lightRef.current.position.copy(camera.position);
      lightRef.current.position.y -= 0.1;
      if (lightRef.current.target) {
        lightRef.current.target.position.copy(camera.position).add(dir.clone().multiplyScalar(12));
        lightRef.current.target.updateMatrixWorld();
      }
    }
    if (lightRef2.current) {
      lightRef2.current.position.copy(camera.position);
      if (lightRef2.current.target) {
        lightRef2.current.target.position.copy(camera.position).add(dir.clone().multiplyScalar(12));
        lightRef2.current.target.updateMatrixWorld();
      }
    }
    if (targetRef.current) {
      targetRef.current.position.copy(camera.position).add(dir.multiplyScalar(12));
      targetRef.current.updateMatrixWorld();
    }
  });

  if (!flashlightOn) return null;

  return (
    <>
      <object3D ref={targetRef} />
      <spotLight
        ref={lightRef}
        target={targetRef.current ?? undefined}
        angle={0.42}
        penumbra={0.5}
        intensity={8}
        distance={28}
        color="#ffe8c8"
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
        shadow-bias={-0.001}
        shadow-camera-near={0.5}
        shadow-camera-far={28}
      />
      <spotLight
        ref={lightRef2}
        target={targetRef.current ?? undefined}
        angle={0.58}
        penumbra={0.95}
        intensity={0.9}
        distance={16}
        color="#fff0e0"
        castShadow={false}
      />
    </>
  );
}
