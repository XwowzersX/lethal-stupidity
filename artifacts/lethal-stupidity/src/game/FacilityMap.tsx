import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "./useGameStore";
import { MazeCell } from "./types";
import { getCellObstacleBounds } from "./mazeGenerator";
import {
  createConcreteTexture,
  createRustMetalTexture,
  createFloorTexture,
  createCeilingTexture,
  createNormalMap,
} from "./textures";

function useTextures() {
  return useMemo(() => {
    const floor = createFloorTexture();
    const concrete = createConcreteTexture();
    const metal = createRustMetalTexture();
    const ceiling = createCeilingTexture();
    const concreteNormal = createNormalMap(concrete);
    return { floor, concrete, metal, ceiling, concreteNormal };
  }, []);
}

interface WallProps {
  position: [number, number, number];
  size: [number, number, number];
  texture: THREE.CanvasTexture;
  normalMap?: THREE.CanvasTexture;
  metal?: boolean;
}

function Wall({ position, size, texture, normalMap, metal = false }: WallProps) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        map={texture}
        color={metal ? "#c8c0b0" : "#d8d8d0"}
        normalMap={normalMap}
        normalScale={new THREE.Vector2(0.3, 0.3)}
        emissive={metal ? "#202018" : "#1d1f22"}
        emissiveIntensity={metal ? 0.18 : 0.3}
        roughness={metal ? 0.55 : 0.9}
        metalness={metal ? 0.35 : 0.05}
      />
    </mesh>
  );
}

function CeilingLight({ position, hazard }: { position: [number, number, number]; hazard: MazeCell["hazard"] }) {
  const lightRef = useRef<THREE.PointLight>(null);
  const stateRef = useRef({
    baseIntensity: hazard === "dark" ? 0.55 : hazard === "alarm" ? 1.3 : 1.0,
    flickerTimer: 0,
    flickerInterval: 1.5 + ((position[0] * 13 + position[2] * 7) % 9),
    isFlickering: hazard === "dark" || hazard === "alarm",
  });

  useFrame((_, delta) => {
    const state = stateRef.current;
    if (!state.isFlickering) return;
    state.flickerTimer += delta;
    if (state.flickerTimer > state.flickerInterval) {
      state.flickerTimer = 0;
      state.flickerInterval = 0.08 + Math.abs(Math.sin(position[0] + position[2] + state.flickerTimer)) * 0.22;
      if (lightRef.current) {
        const blink = Math.abs(Math.sin(Date.now() * 0.013 + position[0]));
        lightRef.current.intensity = blink > 0.18 ? state.baseIntensity : 0.15;
      }
      if (Math.random() > 0.82) state.flickerInterval = 1.5 + Math.random() * 4;
    }
  });

  const color = hazard === "alarm" ? "#ffb0a0" : "#fff1c4";

  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[2.4, 0.12, 0.45]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.6} metalness={0.8} />
      </mesh>
      <mesh position={[0, -0.08, 0]}>
        <boxGeometry args={[2, 0.03, 0.34]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.1} roughness={0.1} />
      </mesh>
      <pointLight ref={lightRef} color={color} intensity={stateRef.current.baseIntensity} distance={12} decay={1.8} castShadow={false} />
    </group>
  );
}

function Pipe({ position, rotation = [0, 0, 0], length, texture }: { position: [number, number, number]; rotation?: [number, number, number]; length: number; texture: THREE.CanvasTexture }) {
  return (
    <mesh position={position} rotation={rotation}>
      <cylinderGeometry args={[0.09, 0.09, length, 6]} />
      <meshStandardMaterial map={texture} color="#c8b7a0" roughness={0.48} metalness={0.65} emissive="#15100b" emissiveIntensity={0.12} />
    </mesh>
  );
}

function CrateCluster({ cell, texture }: { cell: MazeCell; texture: THREE.CanvasTexture }) {
  const obstacles = getCellObstacleBounds(cell);
  return (
    <group>
      {obstacles.map((obstacle, index) => {
        return (
          <mesh key={index} position={[obstacle.x, 0.55 + index * 0.08, obstacle.z]} rotation={[0, index * 0.4, 0]}>
            <boxGeometry args={[1.2, 1.1, 1.2]} />
            <meshStandardMaterial map={texture} color="#c4aa87" roughness={0.75} metalness={0.15} emissive="#181006" emissiveIntensity={0.08} />
          </mesh>
        );
      })}
    </group>
  );
}

function CrawlPassageWall({
  cell,
  direction,
  wallHeight,
  wallThickness,
  cellSize,
  texture,
  normalMap,
}: {
  cell: MazeCell;
  direction: "east" | "south";
  wallHeight: number;
  wallThickness: number;
  cellSize: number;
  texture: THREE.CanvasTexture;
  normalMap: THREE.CanvasTexture;
}) {
  const passageWidth = 2.7;
  const passageHeight = 1.22;
  const sideLength = (cellSize - passageWidth) / 2;
  const passageHalf = passageWidth / 2;
  const sideOffset = passageHalf + sideLength / 2;
  const upperHeight = wallHeight - passageHeight;
  const upperY = passageHeight + upperHeight / 2;
  const thresholdColor = cell.story === "security" ? "#304128" : "#1b261d";

  if (direction === "east") {
    return (
      <>
        <Wall position={[cell.worldX + cellSize / 2, wallHeight / 2, cell.worldZ - sideOffset]} size={[wallThickness, wallHeight, sideLength]} texture={texture} normalMap={normalMap} />
        <Wall position={[cell.worldX + cellSize / 2, wallHeight / 2, cell.worldZ + sideOffset]} size={[wallThickness, wallHeight, sideLength]} texture={texture} normalMap={normalMap} />
        <Wall position={[cell.worldX + cellSize / 2, upperY, cell.worldZ]} size={[wallThickness, upperHeight, passageWidth]} texture={texture} normalMap={normalMap} />
        <mesh position={[cell.worldX + cellSize / 2, 0.08, cell.worldZ]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.35, passageWidth]} />
          <meshStandardMaterial color={thresholdColor} emissive="#0b120b" emissiveIntensity={0.5} roughness={0.85} />
        </mesh>
        <mesh position={[cell.worldX + cellSize / 2, passageHeight + 0.03, cell.worldZ]}>
          <boxGeometry args={[wallThickness + 0.08, 0.07, passageWidth]} />
          <meshStandardMaterial color="#101510" emissive="#050805" emissiveIntensity={0.6} roughness={0.9} />
        </mesh>
      </>
    );
  }

  return (
    <>
      <Wall position={[cell.worldX - sideOffset, wallHeight / 2, cell.worldZ + cellSize / 2]} size={[sideLength, wallHeight, wallThickness]} texture={texture} normalMap={normalMap} />
      <Wall position={[cell.worldX + sideOffset, wallHeight / 2, cell.worldZ + cellSize / 2]} size={[sideLength, wallHeight, wallThickness]} texture={texture} normalMap={normalMap} />
      <Wall position={[cell.worldX, upperY, cell.worldZ + cellSize / 2]} size={[passageWidth, upperHeight, wallThickness]} texture={texture} normalMap={normalMap} />
      <mesh position={[cell.worldX, 0.045, cell.worldZ + cellSize / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[passageWidth, 1.35]} />
        <meshStandardMaterial color={thresholdColor} emissive="#0b120b" emissiveIntensity={0.5} roughness={0.85} />
      </mesh>
      <mesh position={[cell.worldX, passageHeight + 0.03, cell.worldZ + cellSize / 2]}>
        <boxGeometry args={[passageWidth, 0.07, wallThickness + 0.08]} />
        <meshStandardMaterial color="#101510" emissive="#050805" emissiveIntensity={0.6} roughness={0.9} />
      </mesh>
    </>
  );
}

function BloodStain({ cell }: { cell: MazeCell }) {
  const scale = 0.8 + (cell.templateId % 5) * 0.28;
  return (
    <mesh position={[cell.worldX - 1.6 + (cell.templateId % 3), 0.035, cell.worldZ + 1.5]} rotation={[-Math.PI / 2, 0, cell.templateId * 0.7]}>
      <circleGeometry args={[scale, 12]} />
      <meshBasicMaterial color="#4b0000" transparent opacity={0.62} />
    </mesh>
  );
}

function CellLabel({ cell }: { cell: MazeCell }) {
  return (
    <group position={[cell.worldX, 0.04, cell.worldZ]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh>
        <ringGeometry args={[0.8, 0.86, 12]} />
        <meshBasicMaterial color={cell.story === "deep" ? "#6633ff" : cell.story === "medical" ? "#55ffdd" : "#2244ff"} transparent opacity={0.28} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function CellDecor({ cell, metal }: { cell: MazeCell; metal: THREE.CanvasTexture }) {
  return (
    <group>
      <CellLabel cell={cell} />
      {(cell.hazard === "clutter" || cell.story === "storage" || cell.templateId % 7 === 0) && <CrateCluster cell={cell} texture={metal} />}
      {(cell.hazard === "pipes" || cell.story === "maintenance" || cell.story === "industrial") && (
        <>
          <Pipe position={[cell.worldX - 2.8, 5.45, cell.worldZ]} rotation={[0, 0, Math.PI / 2]} length={4.4} texture={metal} />
          <Pipe position={[cell.worldX + 2.8, 5.25, cell.worldZ + 1.5]} rotation={[Math.PI / 2, 0, 0]} length={4.8} texture={metal} />
        </>
      )}
      {(cell.hazard === "blood" || cell.templateId % 11 === 0) && <BloodStain cell={cell} />}
      {cell.hazard === "alarm" && (
        <mesh position={[cell.worldX, 2.2, cell.worldZ - 4.4]}>
          <boxGeometry args={[0.5, 0.5, 0.18]} />
          <meshStandardMaterial color="#ff3322" emissive="#ff2200" emissiveIntensity={1.5} roughness={0.3} />
        </mesh>
      )}
    </group>
  );
}

function ExtractionZone({ position }: { position: THREE.Vector3 }) {
  const ringRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.PointLight>(null);
  const tRef = useRef(0);

  useFrame((_, delta) => {
    tRef.current += delta;
    if (ringRef.current) ringRef.current.rotation.z = tRef.current * 0.65;
    if (glowRef.current) glowRef.current.intensity = 1.2 + Math.sin(tRef.current * 3) * 0.35;
  });

  return (
    <group position={[position.x, 0.05, position.z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3.4, 24]} />
        <meshStandardMaterial color="#003300" emissive="#003a00" emissiveIntensity={0.8} transparent opacity={0.64} />
      </mesh>
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.65, 3.35, 24]} />
        <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={1.6} transparent opacity={0.92} side={THREE.DoubleSide} />
      </mesh>
      <pointLight ref={glowRef} color="#00ff88" intensity={1.2} distance={11} />
    </group>
  );
}

function ElevatorPad({ position }: { position: THREE.Vector3 }) {
  return (
    <group position={[position.x, 0.04, position.z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3.2, 24]} />
        <meshStandardMaterial color="#0a2630" emissive="#00aaff" emissiveIntensity={0.55} transparent opacity={0.52} />
      </mesh>
      <mesh position={[0, 1.2, -4.65]}>
        <boxGeometry args={[5, 2.4, 0.25]} />
        <meshStandardMaterial color="#18212a" roughness={0.7} metalness={0.4} emissive="#061018" emissiveIntensity={0.35} />
      </mesh>
    </group>
  );
}

export function FacilityMap() {
  const mazeLayout = useGameStore((s) => s.mazeLayout);
  const { floor, concrete, metal, ceiling, concreteNormal } = useTextures();

  if (!mazeLayout) return null;

  const wallHeight = 5.4;
  const wallThickness = 0.42;
  const cellSize = mazeLayout.cellSize;
  const wallLength = cellSize + wallThickness;

  return (
    <group>
      {mazeLayout.cells.map((cell) => (
        <group key={cell.id}>
          <mesh position={[cell.worldX, 0, cell.worldZ]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[cellSize, cellSize, 2, 2]} />
            <meshStandardMaterial map={floor} color="#e0ded2" emissive="#202020" emissiveIntensity={0.34} roughness={0.9} metalness={0.05} />
          </mesh>
          <mesh position={[cell.worldX, wallHeight, cell.worldZ]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[cellSize, cellSize, 1, 1]} />
            <meshStandardMaterial map={ceiling} color="#d0d0c8" emissive="#15171a" emissiveIntensity={0.2} roughness={1} metalness={0} side={THREE.DoubleSide} />
          </mesh>
          {!cell.open.east && (cell.crawl.east ? <CrawlPassageWall cell={cell} direction="east" wallHeight={wallHeight} wallThickness={wallThickness} cellSize={cellSize} texture={cell.templateId % 3 === 0 ? metal : concrete} normalMap={concreteNormal} /> : <Wall position={[cell.worldX + cellSize / 2, wallHeight / 2, cell.worldZ]} size={[wallThickness, wallHeight, wallLength]} texture={cell.templateId % 3 === 0 ? metal : concrete} normalMap={concreteNormal} metal={cell.templateId % 3 === 0} />)}
          {!cell.open.south && (cell.crawl.south ? <CrawlPassageWall cell={cell} direction="south" wallHeight={wallHeight} wallThickness={wallThickness} cellSize={cellSize} texture={cell.templateId % 4 === 0 ? metal : concrete} normalMap={concreteNormal} /> : <Wall position={[cell.worldX, wallHeight / 2, cell.worldZ + cellSize / 2]} size={[wallLength, wallHeight, wallThickness]} texture={cell.templateId % 4 === 0 ? metal : concrete} normalMap={concreteNormal} metal={cell.templateId % 4 === 0} />)}
          {cell.gridX === 0 && !cell.open.west && <Wall position={[cell.worldX - cellSize / 2, wallHeight / 2, cell.worldZ]} size={[wallThickness, wallHeight, wallLength]} texture={metal} normalMap={concreteNormal} metal />}
          {cell.gridZ === 0 && !cell.open.north && <Wall position={[cell.worldX, wallHeight / 2, cell.worldZ - cellSize / 2]} size={[wallLength, wallHeight, wallThickness]} texture={metal} normalMap={concreteNormal} metal />}
          {(cell.templateId + cell.gridX + cell.gridZ) % 2 === 0 && <CeilingLight position={[cell.worldX, 5.25, cell.worldZ]} hazard={cell.hazard} />}
          <CellDecor cell={cell} metal={metal} />
        </group>
      ))}
      <ElevatorPad position={mazeLayout.elevatorPosition} />
      <ExtractionZone position={mazeLayout.extractionPosition} />
    </group>
  );
}
