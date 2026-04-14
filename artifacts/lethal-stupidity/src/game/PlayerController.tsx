import { useRef, useEffect, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import * as THREE from "three";
import { useGameStore } from "./useGameStore";

export function PlayerController() {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const moveState = useRef({ forward: false, backward: false, left: false, right: false, sprint: false });
  const velocity = useRef(new THREE.Vector3());
  const playerPos = useRef(new THREE.Vector3(0, 1.6, 0));

  const phase = useGameStore((s) => s.phase);
  const updatePlayerPosition = useGameStore((s) => s.updatePlayerPosition);
  const toggleFlashlight = useGameStore((s) => s.toggleFlashlight);
  const collectScrap = useGameStore((s) => s.collectScrap);
  const extract = useGameStore((s) => s.extract);
  const scrapItems = useGameStore((s) => s.scrapItems);
  const scrapCollected = useGameStore((s) => s.scrapCollected);
  const scrapQuota = useGameStore((s) => s.scrapQuota);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (phase !== "playing") return;
    switch (e.code) {
      case "KeyW": case "ArrowUp": moveState.current.forward = true; break;
      case "KeyS": case "ArrowDown": moveState.current.backward = true; break;
      case "KeyA": case "ArrowLeft": moveState.current.left = true; break;
      case "KeyD": case "ArrowRight": moveState.current.right = true; break;
      case "ShiftLeft": case "ShiftRight": moveState.current.sprint = true; break;
      case "KeyF": toggleFlashlight(); break;
      case "KeyE": {
        const pp = playerPos.current;
        const dist = Math.sqrt(pp.x * pp.x + pp.z * pp.z);
        if (dist < 4 && scrapCollected >= scrapQuota) {
          extract();
        }
        break;
      }
    }
  }, [phase, toggleFlashlight, extract, scrapCollected, scrapQuota]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    switch (e.code) {
      case "KeyW": case "ArrowUp": moveState.current.forward = false; break;
      case "KeyS": case "ArrowDown": moveState.current.backward = false; break;
      case "KeyA": case "ArrowLeft": moveState.current.left = false; break;
      case "KeyD": case "ArrowRight": moveState.current.right = false; break;
      case "ShiftLeft": case "ShiftRight": moveState.current.sprint = false; break;
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  useFrame((_, delta) => {
    if (phase !== "playing") return;

    const speed = moveState.current.sprint ? 8 : 5;
    const frontVector = new THREE.Vector3(0, 0, Number(moveState.current.backward) - Number(moveState.current.forward));
    const sideVector = new THREE.Vector3(Number(moveState.current.left) - Number(moveState.current.right), 0, 0);
    const direction = new THREE.Vector3()
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(speed);
    direction.applyEuler(camera.rotation);
    direction.y = 0;

    velocity.current.lerp(direction, 0.15);
    playerPos.current.add(velocity.current.clone().multiplyScalar(delta));

    const boundary = 33;
    playerPos.current.x = Math.max(-boundary, Math.min(boundary, playerPos.current.x));
    playerPos.current.z = Math.max(-boundary, Math.min(boundary, playerPos.current.z));
    playerPos.current.y = 1.6;

    camera.position.copy(playerPos.current);
    updatePlayerPosition(playerPos.current.clone());

    for (const item of scrapItems) {
      if (!item.collected) {
        const dist = playerPos.current.distanceTo(item.position);
        if (dist < 2.5) {
          collectScrap(item.id);
        }
      }
    }
  });

  return <>{phase === "playing" && <PointerLockControls ref={controlsRef} />}</>;
}
