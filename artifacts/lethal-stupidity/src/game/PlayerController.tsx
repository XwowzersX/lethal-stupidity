import { useRef, useEffect, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import * as THREE from "three";
import { useGameStore } from "./useGameStore";
import { canMoveThrough } from "./mazeGenerator";

export function PlayerController() {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const moveState = useRef({ forward: false, backward: false, left: false, right: false, sprint: false, crouch: false });
  const velocity = useRef(new THREE.Vector3());
  const playerPos = useRef(new THREE.Vector3(0, 1.6, 0));
  const verticalVelocity = useRef(0);
  const jumpHeight = useRef(0);
  const grounded = useRef(true);
  const footstepTimer = useRef(0);
  const footstepPulse = useRef(0);

  const frameCount = useRef(0);
  const frontVector = useRef(new THREE.Vector3());
  const sideVector = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const phase = useGameStore((s) => s.phase);
  const mazeLayout = useGameStore((s) => s.mazeLayout);
  const updatePlayerPosition = useGameStore((s) => s.updatePlayerPosition);
  const updateMovementNoise = useGameStore((s) => s.updateMovementNoise);
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
      case "ControlLeft": case "ControlRight": case "KeyC": moveState.current.crouch = true; break;
      case "Space":
        e.preventDefault();
        if (grounded.current && !moveState.current.crouch) {
          grounded.current = false;
          verticalVelocity.current = 6.5;
          footstepPulse.current = Math.max(footstepPulse.current, 0.35);
        }
        break;
      case "KeyF": toggleFlashlight(); break;
      case "KeyE": {
        const pp = playerPos.current;
        const extraction = mazeLayout?.extractionPosition ?? new THREE.Vector3();
        const dist = pp.distanceTo(extraction);
        if (dist < 4 && scrapCollected >= scrapQuota) {
          extract();
        }
        break;
      }
    }
  }, [phase, mazeLayout, toggleFlashlight, extract, scrapCollected, scrapQuota]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    switch (e.code) {
      case "KeyW": case "ArrowUp": moveState.current.forward = false; break;
      case "KeyS": case "ArrowDown": moveState.current.backward = false; break;
      case "KeyA": case "ArrowLeft": moveState.current.left = false; break;
      case "KeyD": case "ArrowRight": moveState.current.right = false; break;
      case "ShiftLeft": case "ShiftRight": moveState.current.sprint = false; break;
      case "ControlLeft": case "ControlRight": case "KeyC": moveState.current.crouch = false; break;
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

  useEffect(() => {
    if (phase === "playing" && mazeLayout) {
      playerPos.current.copy(mazeLayout.elevatorPosition);
      verticalVelocity.current = 0;
      jumpHeight.current = 0;
      grounded.current = true;
      footstepTimer.current = 0;
      footstepPulse.current = 0;
      camera.position.copy(mazeLayout.elevatorPosition);
      updatePlayerPosition(mazeLayout.elevatorPosition.clone());
      updateMovementNoise(0);
    }
  }, [phase, mazeLayout, camera, updatePlayerPosition, updateMovementNoise]);

  useFrame((_, delta) => {
    if (phase !== "playing") return;

    const wantsMove = moveState.current.forward || moveState.current.backward || moveState.current.left || moveState.current.right;
    const isCrouching = moveState.current.crouch;
    const isSprinting = moveState.current.sprint && !isCrouching;
    const speed = isCrouching ? 2.35 : isSprinting ? 8 : 5;
    frontVector.current.set(0, 0, Number(moveState.current.backward) - Number(moveState.current.forward));
    sideVector.current.set(Number(moveState.current.left) - Number(moveState.current.right), 0, 0);
    direction.current
      .subVectors(frontVector.current, sideVector.current)
      .normalize()
      .multiplyScalar(speed);
    direction.current.applyEuler(camera.rotation);
    direction.current.y = 0;

    velocity.current.lerp(direction.current, 0.15);
    const desired = playerPos.current.clone().addScaledVector(velocity.current, delta);

    if (mazeLayout) {
      const tryX = playerPos.current.clone();
      tryX.x = desired.x;
      if (canMoveThrough(mazeLayout, playerPos.current, tryX)) {
        playerPos.current.x = desired.x;
      } else {
        velocity.current.x = 0;
      }

      const tryZ = playerPos.current.clone();
      tryZ.z = desired.z;
      if (canMoveThrough(mazeLayout, playerPos.current, tryZ)) {
        playerPos.current.z = desired.z;
      } else {
        velocity.current.z = 0;
      }
    } else {
      playerPos.current.copy(desired);
    }

    const boundary = mazeLayout ? Math.max(mazeLayout.width, mazeLayout.height) * mazeLayout.cellSize : 33;
    playerPos.current.x = Math.max(-boundary, Math.min(boundary, playerPos.current.x));
    playerPos.current.z = Math.max(-boundary, Math.min(boundary, playerPos.current.z));
    if (!grounded.current || verticalVelocity.current !== 0) {
      verticalVelocity.current -= 18 * delta;
      jumpHeight.current += verticalVelocity.current * delta;
      if (jumpHeight.current <= 0) {
        if (!grounded.current && verticalVelocity.current < -3) {
          footstepPulse.current = Math.max(footstepPulse.current, isSprinting ? 0.55 : 0.38);
        }
        jumpHeight.current = 0;
        verticalVelocity.current = 0;
        grounded.current = true;
      }
    }

    const eyeHeight = isCrouching ? 1.02 : 1.6;
    playerPos.current.y = eyeHeight + jumpHeight.current;

    if (wantsMove && grounded.current) {
      footstepTimer.current += delta;
      const stepInterval = isCrouching ? 0.58 : isSprinting ? 0.22 : 0.36;
      if (footstepTimer.current >= stepInterval) {
        footstepTimer.current = 0;
        footstepPulse.current = Math.max(footstepPulse.current, isCrouching ? 0.1 : isSprinting ? 0.55 : 0.32);
      }
    } else {
      footstepTimer.current = 0;
    }

    footstepPulse.current = Math.max(0, footstepPulse.current - delta * 1.8);
    const movementNoise = Math.max(footstepPulse.current, !grounded.current ? 0.12 : 0);
    updateMovementNoise(movementNoise);

    camera.position.copy(playerPos.current);
    frameCount.current++;
    if (frameCount.current % 6 === 0) {
      updatePlayerPosition(playerPos.current.clone());
    }

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
