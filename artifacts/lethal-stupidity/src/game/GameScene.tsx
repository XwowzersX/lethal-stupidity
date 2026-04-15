import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "./useGameStore";
import { FacilityMap } from "./FacilityMap";
import { MonsterEntity } from "./MonsterEntity";
import { ScrapEntity } from "./ScrapEntity";
import { PlayerController } from "./PlayerController";
import { Flashlight } from "./Flashlight";
import { GameLoop } from "./GameLoop";
import { GameHUD } from "./GameHUD";
import { DustParticles } from "./DustParticles";
import { useEffect, useRef, useState } from "react";
import { useVoiceDetection } from "./useVoiceDetection";

function VignetteDamage({ health }: { health: number }) {
  const opacity = Math.max(0, (50 - health) / 50) * 0.7;
  return (
    <div style={{
      position: "fixed",
      inset: 0,
      pointerEvents: "none",
      background: `radial-gradient(ellipse at center, transparent 40%, rgba(180,0,0,${opacity}) 100%)`,
      zIndex: 50,
      transition: "background 0.3s",
    }} />
  );
}

function NoisePulse({ noiseLevel }: { noiseLevel: number }) {
  if (noiseLevel < 0.3) return null;
  return (
    <div style={{
      position: "fixed",
      inset: 0,
      pointerEvents: "none",
      border: `4px solid rgba(255,0,0,${(noiseLevel - 0.3) * 1.4})`,
      boxShadow: `inset 0 0 ${noiseLevel * 60}px rgba(255,0,0,${(noiseLevel - 0.3) * 0.4})`,
      zIndex: 50,
      animation: noiseLevel > 0.6 ? "pulse 0.3s infinite" : undefined,
    }} />
  );
}

function ClickToPlay() {
  const [locked, setLocked] = useState(false);
  const phase = useGameStore((s) => s.phase);

  useEffect(() => {
    const onLock = () => setLocked(true);
    const onUnlock = () => setLocked(false);
    document.addEventListener("pointerlockchange", onLock);
    document.addEventListener("pointerlocklost", onUnlock);
    return () => {
      document.removeEventListener("pointerlockchange", onLock);
      document.removeEventListener("pointerlocklost", onUnlock);
    };
  }, []);

  if (locked || phase !== "playing") return null;
  return (
    <div style={{
      position: "fixed",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(0,0,0,0.5)",
      zIndex: 200,
      cursor: "pointer",
      fontFamily: "'Courier New', monospace",
      color: "#00ff00",
      fontSize: 24,
      letterSpacing: 4,
    }}
    onClick={() => document.querySelector("canvas")?.requestPointerLock()}
    >
      [CLICK TO RESUME]
    </div>
  );
}

export function GameScene() {
  const phase = useGameStore((s) => s.phase);
  const monsters = useGameStore((s) => s.monsters);
  const scrapItems = useGameStore((s) => s.scrapItems);
  const playerPosition = useGameStore((s) => s.playerPosition);
  const collectScrap = useGameStore((s) => s.collectScrap);
  const updateMicLevel = useGameStore((s) => s.updateMicLevel);
  const health = useGameStore((s) => s.health);
  const noiseLevel = useGameStore((s) => s.noiseLevel);
  const { micLevel, startMic, micEnabled } = useVoiceDetection();
  const startedMicRef = useRef(false);

  useEffect(() => {
    if (phase === "playing" && !micEnabled && !startedMicRef.current) {
      startedMicRef.current = true;
      startMic();
    }
    if (phase !== "playing") {
      startedMicRef.current = false;
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
        top: 0, left: 0,
        width: "100vw", height: "100vh",
        background: "#000",
        zIndex: 1,
      }}>
        <Canvas
          shadows={{ type: THREE.PCFShadowMap }}
          camera={{ fov: 80, near: 0.05, far: 100, position: [0, 1.6, 0] }}
          dpr={[0.75, 1.5]}
          performance={{ min: 0.5 }}
          gl={{
            antialias: false,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 0.6,
            powerPreference: "high-performance",
          }}
          style={{ width: "100%", height: "100%" }}
        >
          <ambientLight intensity={0.04} color="#1a2244" />
          <fog attach="fog" args={["#000608", 4, 35]} />

          <FacilityMap />
          <DustParticles />

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

      <VignetteDamage health={health} />
      <NoisePulse noiseLevel={noiseLevel} />
      <ClickToPlay />
      <GameHUD />
    </>
  );
}
