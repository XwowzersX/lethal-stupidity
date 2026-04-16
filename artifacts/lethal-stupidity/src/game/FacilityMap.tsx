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
  createCrateTexture,
  createBarrelTexture,
} from "./textures";

function useTextures() {
  return useMemo(() => {
    const floor = createFloorTexture();
    const concrete = createConcreteTexture();
    const metal = createRustMetalTexture();
    const ceiling = createCeilingTexture();
    const concreteNormal = createNormalMap(concrete);
    const crate = createCrateTexture();
    const barrel = createBarrelTexture();
    return { floor, concrete, metal, ceiling, concreteNormal, crate, barrel };
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
        color={metal ? "#b8b4a8" : "#c8c8c0"}
        normalMap={normalMap}
        normalScale={new THREE.Vector2(0.5, 0.5)}
        emissive={metal ? "#181810" : "#151718"}
        emissiveIntensity={metal ? 0.12 : 0.22}
        roughness={metal ? 0.45 : 0.88}
        metalness={metal ? 0.45 : 0.04}
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
      <cylinderGeometry args={[0.09, 0.09, length, 8]} />
      <meshStandardMaterial map={texture} color="#b8a890" roughness={0.42} metalness={0.72} emissive="#100c08" emissiveIntensity={0.1} />
    </mesh>
  );
}

function Crate({ position, rotation, crateTexture, size = [1.1, 1.1, 1.1] }: {
  position: [number, number, number];
  rotation: number;
  crateTexture: THREE.CanvasTexture;
  size?: [number, number, number];
}) {
  return (
    <mesh position={position} rotation={[0, rotation, 0]}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        map={crateTexture}
        color="#c8a860"
        roughness={0.82}
        metalness={0.04}
        emissive="#100800"
        emissiveIntensity={0.06}
      />
    </mesh>
  );
}

function Barrel({ position, rotation, barrelTexture }: {
  position: [number, number, number];
  rotation: number;
  barrelTexture: THREE.CanvasTexture;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.35, 0.32, 1.1, 10]} />
        <meshStandardMaterial map={barrelTexture} color="#a0b888" roughness={0.65} metalness={0.35} emissive="#050c04" emissiveIntensity={0.1} />
      </mesh>
      {/* Lid */}
      <mesh position={[0, 1.12, 0]}>
        <cylinderGeometry args={[0.37, 0.37, 0.06, 10]} />
        <meshStandardMaterial color="#2a2f1e" roughness={0.55} metalness={0.5} />
      </mesh>
      {/* Banding */}
      {[0.25, 0.65, 1.05].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <cylinderGeometry args={[0.36, 0.36, 0.06, 10]} />
          <meshStandardMaterial color="#1a1e12" roughness={0.45} metalness={0.65} />
        </mesh>
      ))}
    </group>
  );
}

function Locker({ position, rotation }: { position: [number, number, number]; rotation: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Body */}
      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[0.7, 2.2, 0.45]} />
        <meshStandardMaterial color="#2a3530" roughness={0.6} metalness={0.55} emissive="#081008" emissiveIntensity={0.08} />
      </mesh>
      {/* Door panel */}
      <mesh position={[0, 1.1, 0.23]}>
        <boxGeometry args={[0.65, 2.12, 0.04]} />
        <meshStandardMaterial color="#243028" roughness={0.55} metalness={0.6} />
      </mesh>
      {/* Vent slots */}
      {[-0.55, 1.75].map((y, i) => (
        <mesh key={i} position={[0, y, 0.26]}>
          <boxGeometry args={[0.4, 0.1, 0.04]} />
          <meshStandardMaterial color="#121a12" roughness={0.7} metalness={0.4} />
        </mesh>
      ))}
      {/* Handle */}
      <mesh position={[0.2, 1.1, 0.26]}>
        <boxGeometry args={[0.06, 0.18, 0.05]} />
        <meshStandardMaterial color="#888" roughness={0.3} metalness={0.85} />
      </mesh>
    </group>
  );
}

function ShelfUnit({ position, rotation, crateTexture }: {
  position: [number, number, number];
  rotation: number;
  crateTexture: THREE.CanvasTexture;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Frame */}
      {[0.02, 1.05, 2.08].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <boxGeometry args={[2.2, 0.06, 0.5]} />
          <meshStandardMaterial color="#333338" roughness={0.5} metalness={0.7} />
        </mesh>
      ))}
      {/* Side uprights */}
      {[-1.05, 1.05].map((x, i) => (
        <mesh key={i} position={[x, 1.07, 0]}>
          <boxGeometry args={[0.06, 2.2, 0.5]} />
          <meshStandardMaterial color="#282830" roughness={0.5} metalness={0.7} />
        </mesh>
      ))}
      {/* Items on shelves */}
      <Crate position={[-0.5, 0.6, 0]} rotation={0.2} crateTexture={crateTexture} size={[0.7, 0.7, 0.7]} />
      <Crate position={[0.4, 0.6, 0]} rotation={-0.15} crateTexture={crateTexture} size={[0.55, 0.55, 0.55]} />
      <Crate position={[-0.6, 1.65, 0]} rotation={0.1} crateTexture={crateTexture} size={[0.6, 0.6, 0.6]} />
    </group>
  );
}

function CrateCluster({ cell, crateTexture, barrelTexture }: { cell: MazeCell; crateTexture: THREE.CanvasTexture; barrelTexture: THREE.CanvasTexture }) {
  const obstacles = getCellObstacleBounds(cell);
  const seed = cell.templateId * 7 + cell.gridX * 3 + cell.gridZ;
  return (
    <group>
      {obstacles.map((obstacle, index) => {
        const variation = (seed + index) % 4;
        if (variation === 0) {
          return (
            <Barrel
              key={index}
              position={[obstacle.x, 0, obstacle.z]}
              rotation={(seed + index) * 0.9}
              barrelTexture={barrelTexture}
            />
          );
        }
        const stackHeight = (seed + index) % 3 === 0 ? 2 : 1;
        return (
          <group key={index}>
            <Crate
              position={[obstacle.x, 0.56, obstacle.z]}
              rotation={(seed + index) * 0.55}
              crateTexture={crateTexture}
            />
            {stackHeight > 1 && (
              <Crate
                position={[obstacle.x + 0.05, 1.68, obstacle.z + 0.05]}
                rotation={(seed + index) * 0.55 + 0.4}
                crateTexture={crateTexture}
                size={[0.85, 0.85, 0.85]}
              />
            )}
          </group>
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

function CellDecor({ cell, metal, crate, barrel }: { cell: MazeCell; metal: THREE.CanvasTexture; crate: THREE.CanvasTexture; barrel: THREE.CanvasTexture }) {
  const seed = cell.templateId * 11 + cell.gridX * 5 + cell.gridZ * 7;
  const hasLocker = (cell.story === "security" || cell.story === "medical") && seed % 3 === 0;
  const hasShelf = (cell.story === "storage" || cell.story === "industrial") && seed % 4 === 0;

  return (
    <group>
      {(cell.hazard === "clutter" || cell.story === "storage" || cell.templateId % 7 === 0) && (
        <CrateCluster cell={cell} crateTexture={crate} barrelTexture={barrel} />
      )}
      {(cell.hazard === "pipes" || cell.story === "maintenance" || cell.story === "industrial") && (
        <>
          <Pipe position={[cell.worldX - 2.8, 5.45, cell.worldZ]} rotation={[0, 0, Math.PI / 2]} length={4.4} texture={metal} />
          <Pipe position={[cell.worldX + 2.8, 5.25, cell.worldZ + 1.5]} rotation={[Math.PI / 2, 0, 0]} length={4.8} texture={metal} />
          <Pipe position={[cell.worldX, 2.2, cell.worldZ - 3.5]} rotation={[Math.PI / 2, 0, 0]} length={3.0} texture={metal} />
        </>
      )}
      {(cell.hazard === "blood" || cell.templateId % 11 === 0) && <BloodStain cell={cell} />}
      {cell.hazard === "alarm" && (
        <mesh position={[cell.worldX, 2.2, cell.worldZ - 4.4]}>
          <boxGeometry args={[0.5, 0.5, 0.18]} />
          <meshStandardMaterial color="#ff3322" emissive="#ff2200" emissiveIntensity={1.5} roughness={0.3} />
        </mesh>
      )}
      {hasLocker && (
        <Locker position={[cell.worldX - 2.5, 0, cell.worldZ - 3.5]} rotation={(seed % 4) * (Math.PI / 2)} />
      )}
      {hasShelf && (
        <ShelfUnit position={[cell.worldX + 2.5, 0, cell.worldZ - 1.5]} rotation={(seed % 2) * Math.PI} crateTexture={crate} />
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
  const { floor, concrete, metal, ceiling, concreteNormal, crate, barrel } = useTextures();

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
            <meshStandardMaterial map={floor} color="#d8d6cc" emissive="#1a1a1a" emissiveIntensity={0.28} roughness={0.88} metalness={0.06} />
          </mesh>
          <mesh position={[cell.worldX, wallHeight, cell.worldZ]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[cellSize, cellSize, 1, 1]} />
            <meshStandardMaterial map={ceiling} color="#c0c0b8" emissive="#101214" emissiveIntensity={0.18} roughness={1} metalness={0} side={THREE.DoubleSide} />
          </mesh>
          {!cell.open.east && (cell.crawl.east
            ? <CrawlPassageWall cell={cell} direction="east" wallHeight={wallHeight} wallThickness={wallThickness} cellSize={cellSize} texture={cell.templateId % 3 === 0 ? metal : concrete} normalMap={concreteNormal} />
            : <Wall position={[cell.worldX + cellSize / 2, wallHeight / 2, cell.worldZ]} size={[wallThickness, wallHeight, wallLength]} texture={cell.templateId % 3 === 0 ? metal : concrete} normalMap={concreteNormal} metal={cell.templateId % 3 === 0} />
          )}
          {!cell.open.south && (cell.crawl.south
            ? <CrawlPassageWall cell={cell} direction="south" wallHeight={wallHeight} wallThickness={wallThickness} cellSize={cellSize} texture={cell.templateId % 4 === 0 ? metal : concrete} normalMap={concreteNormal} />
            : <Wall position={[cell.worldX, wallHeight / 2, cell.worldZ + cellSize / 2]} size={[wallLength, wallHeight, wallThickness]} texture={cell.templateId % 4 === 0 ? metal : concrete} normalMap={concreteNormal} metal={cell.templateId % 4 === 0} />
          )}
          {cell.gridX === 0 && !cell.open.west && <Wall position={[cell.worldX - cellSize / 2, wallHeight / 2, cell.worldZ]} size={[wallThickness, wallHeight, wallLength]} texture={metal} normalMap={concreteNormal} metal />}
          {cell.gridZ === 0 && !cell.open.north && <Wall position={[cell.worldX, wallHeight / 2, cell.worldZ - cellSize / 2]} size={[wallLength, wallHeight, wallThickness]} texture={metal} normalMap={concreteNormal} metal />}
          {(cell.templateId + cell.gridX + cell.gridZ) % 2 === 0 && <CeilingLight position={[cell.worldX, 5.25, cell.worldZ]} hazard={cell.hazard} />}
          <CellDecor cell={cell} metal={metal} crate={crate} barrel={barrel} />
        </group>
      ))}
      <ElevatorPad position={mazeLayout.elevatorPosition} />
      <ExtractionZone position={mazeLayout.extractionPosition} />
    </group>
  );
}
