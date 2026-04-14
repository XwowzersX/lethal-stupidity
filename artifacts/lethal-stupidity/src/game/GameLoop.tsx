import { useFrame } from "@react-three/fiber";
import { useGameStore } from "./useGameStore";

export function GameLoop() {
  const updateMonsters = useGameStore((s) => s.updateMonsters);
  const updateTimer = useGameStore((s) => s.updateTimer);
  const phase = useGameStore((s) => s.phase);

  useFrame((_, delta) => {
    if (phase !== "playing") return;
    const clampedDelta = Math.min(delta, 0.1);
    updateMonsters(clampedDelta);
    updateTimer(clampedDelta);
  });

  return null;
}
