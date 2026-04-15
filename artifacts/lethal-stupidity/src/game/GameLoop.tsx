import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGameStore } from "./useGameStore";

const AI_UPDATE_RATE = 1 / 15;

export function GameLoop() {
  const updateMonsters = useGameStore((s) => s.updateMonsters);
  const updateTimer = useGameStore((s) => s.updateTimer);
  const phase = useGameStore((s) => s.phase);
  const aiAccum = useRef(0);

  useFrame((_, delta) => {
    if (phase !== "playing") return;
    const clampedDelta = Math.min(delta, 0.1);

    updateTimer(clampedDelta);

    aiAccum.current += clampedDelta;
    if (aiAccum.current >= AI_UPDATE_RATE) {
      updateMonsters(aiAccum.current);
      aiAccum.current = 0;
    }
  });

  return null;
}
