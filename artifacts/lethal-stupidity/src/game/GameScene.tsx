import { Canvas } from "@react-three/fiber";
import { useGameStore } from "./useGameStore";
import { FacilityMap } from "./FacilityMap";
import { MonsterEntity } from "./MonsterEntity";
import { ScrapEntity } from "./ScrapEntity";
import { PlayerController } from "./PlayerController";
import { Flashlight } from "./Flashlight";
import { GameLoop } from "./GameLoop";
import { GameHUD } from "./GameHUD";
import { useEffect } from "react";
import { useVoiceDetection } from "./useVoiceDetection";

export function GameScene() {
  const phase = useGameStore((s) => s.phase);
  const monsters = useGameStore((s) => s.monsters);
  const scrapItems = useGameStore((s) => s.scrapItems);
  const playerPosition = useGameStore((s) => s.playerPosition);
  const collectScrap = useGameStore((s) => s.collectScrap);
  const updateMicLevel = useGameStore((s) => s.updateMicLevel);
  const { micLevel, startMic, micEnabled } = useVoiceDetection();

  useEffect(() => {
    if (phase === "playing" && !micEnabled) {
      startMic();
    }
  }, [phase, micEnabled, startMic]);

  useEffect(() => {
    updateMicLevel(micLevel);
  }, [micLevel, updateMicLevel]);

  if (phase !== "playing") return null;

  return (
    <>
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "#000",
        zIndex: 1,
      }}>
        <Canvas
          shadows
          camera={{ fov: 75, near: 0.1, far: 100, position: [0, 1.6, 0] }}
          style={{ width: "100%", height: "100%" }}
        >
          <ambientLight intensity={0.03} color="#2233ff" />
          <fog attach="fog" args={["#000011", 5, 40]} />

          <FacilityMap />

          {monsters.map((m) => (
            <MonsterEntity key={m.id} monster={m} />
          ))}

          {scrapItems.map((item) => (
            <ScrapEntity
              key={item.id}
              item={item}
              playerPosition={playerPosition}
              onCollect={() => collectScrap(item.id)}
            />
          ))}

          <PlayerController />
          <Flashlight />
          <GameLoop />
        </Canvas>
      </div>
      <GameHUD />
    </>
  );
}
