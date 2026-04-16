import { useGameStore } from "./useGameStore";
import { LEVEL_CONFIGS } from "./types";
import { getMazeCell } from "./mazeGenerator";

function MiniMap() {
  const mazeLayout = useGameStore((s) => s.mazeLayout);
  const playerPosition = useGameStore((s) => s.playerPosition);
  const playerYaw = useGameStore((s) => s.playerYaw);
  const monsters = useGameStore((s) => s.monsters);

  if (!mazeLayout) return null;

  const currentCell = getMazeCell(mazeLayout, playerPosition.x, playerPosition.z);
  const nearbyMonsters = monsters.filter((monster) => monster.position.distanceTo(playerPosition) < 22);
  const elevatorVector = mazeLayout.extractionPosition.clone().sub(playerPosition);
  const elevatorAngle = Math.atan2(elevatorVector.x, elevatorVector.z);
  const visibleRadius = 3;
  const cellPx = 26;
  const center = 80;
  const mapSize = 160;

  return (
    <div style={{
      position: "absolute",
      right: 20,
      bottom: 82,
      width: mapSize + 18,
      background: "rgba(0,0,0,0.82)",
      border: "1px solid #00ff0066",
      borderRadius: 10,
      padding: 9,
      boxShadow: "0 0 20px rgba(0,255,0,0.12)",
    }}>
      <div style={{ fontSize: 10, color: "#66ff88", letterSpacing: 2, marginBottom: 7, textAlign: "center" }}>
        LOCAL MAP
      </div>

      {/* Outer clip circle */}
      <div style={{
        position: "relative",
        width: mapSize,
        height: mapSize,
        margin: "0 auto",
        borderRadius: "50%",
        overflow: "hidden",
        background: "#020602",
        border: "1px solid #1a331a",
      }}>
        {/* Rotating world layer — yaw rotates map so forward = up */}
        <div style={{
          position: "absolute",
          inset: 0,
          transform: `rotate(${-playerYaw}rad)`,
          transformOrigin: "center",
        }}>
          {mazeLayout.cells.map((cell) => {
            if (!currentCell) return null;
            const dx = cell.gridX - currentCell.gridX;
            const dz = cell.gridZ - currentCell.gridZ;
            if (Math.abs(dx) > visibleRadius || Math.abs(dz) > visibleRadius) return null;
            const left = center + dx * cellPx - cellPx / 2 + 1;
            const top = center + dz * cellPx - cellPx / 2 + 1;
            const w = cellPx - 2;
            return (
              <div key={cell.id} style={{
                position: "absolute",
                left,
                top,
                width: w,
                height: w,
                borderTop: cell.open.north ? "1px solid #1a4a1a" : "2px solid #00dd00",
                borderRight: cell.open.east ? "1px solid #1a4a1a" : "2px solid #00dd00",
                borderBottom: cell.open.south ? "1px solid #1a4a1a" : "2px solid #00dd00",
                borderLeft: cell.open.west ? "1px solid #1a4a1a" : "2px solid #00dd00",
                background: cell.id === currentCell.id ? "rgba(0,255,0,0.18)" : "rgba(0,60,0,0.1)",
                boxSizing: "border-box",
              }} />
            );
          })}

          {/* Nearby monsters */}
          {nearbyMonsters.map((monster) => {
            const dx = (monster.position.x - playerPosition.x) / mazeLayout.cellSize;
            const dz = (monster.position.z - playerPosition.z) / mazeLayout.cellSize;
            return (
              <div key={monster.id} style={{
                position: "absolute",
                left: center + dx * cellPx - 5,
                top: center + dz * cellPx - 5,
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: monster.state === "chasing" ? "#ff2200" : "#ffcc00",
                boxShadow: `0 0 8px ${monster.state === "chasing" ? "#ff2200" : "#ffcc00"}`,
              }} />
            );
          })}

          {/* Extract arrow orbiting in world-space, auto-corrected by map rotation */}
          <div style={{
            position: "absolute",
            left: center - 6,
            top: 10,
            width: 0,
            height: 0,
            borderLeft: "6px solid transparent",
            borderRight: "6px solid transparent",
            borderBottom: "14px solid #00ff88",
            transform: `rotate(${elevatorAngle}rad)`,
            transformOrigin: `6px ${center - 10}px`,
            filter: "drop-shadow(0 0 4px #00ff88)",
          }} />
        </div>

        {/* Player dot — always centered, never rotates */}
        <div style={{
          position: "absolute",
          left: center - 4,
          top: center - 4,
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "#00ffff",
          boxShadow: "0 0 8px #00ffff",
          pointerEvents: "none",
        }} />

        {/* Forward indicator — tiny tick at top */}
        <div style={{
          position: "absolute",
          top: 4,
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: 9,
          color: "#00ff88",
          lineHeight: 1,
        }}>▲</div>
      </div>

      <div style={{ marginTop: 7, fontSize: 9, color: "#446644", lineHeight: 1.5, textAlign: "center" }}>
        ▲ = forward &nbsp;◉ = extract &nbsp;● = monsters
      </div>
    </div>
  );
}

export function GameHUD() {
  const health = useGameStore((s) => s.health);
  const scrapCollected = useGameStore((s) => s.scrapCollected);
  const scrapQuota = useGameStore((s) => s.scrapQuota);
  const timeRemaining = useGameStore((s) => s.timeRemaining);
  const micLevel = useGameStore((s) => s.micLevel);
  const movementNoise = useGameStore((s) => s.movementNoise);
  const noiseLevel = useGameStore((s) => s.noiseLevel);
  const flashlightOn = useGameStore((s) => s.flashlightOn);
  const playerPosition = useGameStore((s) => s.playerPosition);
  const currentLevel = useGameStore((s) => s.currentLevel);
  const mazeLayout = useGameStore((s) => s.mazeLayout);
  const levelConfig = LEVEL_CONFIGS[Math.min(currentLevel - 1, LEVEL_CONFIGS.length - 1)];

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = Math.floor(timeRemaining % 60);
  const timeStr = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  const extractionPosition = mazeLayout?.extractionPosition;
  const nearExtract = extractionPosition ? playerPosition.distanceTo(extractionPosition) < 4.5 : Math.sqrt(playerPosition.x ** 2 + playerPosition.z ** 2) < 4;
  const canExtract = nearExtract && scrapCollected >= scrapQuota;

  const noiseBars = Math.floor(noiseLevel * 10);

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: "none",
      fontFamily: "'Courier New', monospace",
      color: "#00ff00",
      zIndex: 100,
    }}>
      <div style={{
        position: "absolute",
        top: 20,
        left: 20,
        background: "rgba(0,0,0,0.7)",
        padding: "12px 16px",
        borderRadius: 8,
        border: "1px solid #00ff0044",
      }}>
        <div style={{ fontSize: 10, color: "#335533", letterSpacing: 3, marginBottom: 8 }}>
          {levelConfig.floorName}
        </div>
        <div style={{ fontSize: 14, marginBottom: 6 }}>
          HEALTH: <span style={{ color: health > 50 ? "#00ff00" : health > 25 ? "#ffaa00" : "#ff0000" }}>
            {"[" + "=".repeat(Math.floor(health / 10)) + " ".repeat(10 - Math.floor(health / 10)) + "]"}
          </span> {health}%
        </div>
        <div style={{ fontSize: 14, marginBottom: 6 }}>
          TIME: <span style={{ color: timeRemaining < 60 ? "#ff0000" : "#00ff00" }}>{timeStr}</span>
        </div>
        <div style={{ fontSize: 14, marginBottom: 0 }}>
          FLASHLIGHT: {flashlightOn ? "ON [F]" : "OFF [F]"}
        </div>
      </div>

      <div style={{
        position: "absolute",
        top: 20,
        right: 20,
        background: "rgba(0,0,0,0.7)",
        padding: "12px 16px",
        borderRadius: 8,
        border: "1px solid #00ff0044",
        textAlign: "right",
      }}>
        <div style={{ fontSize: 16, fontWeight: "bold", marginBottom: 6, color: scrapCollected >= scrapQuota ? "#00ff00" : "#ffaa00" }}>
          SCRAP: ${scrapCollected} / ${scrapQuota}
        </div>
        <div style={{ fontSize: 11, opacity: 0.7 }}>
          {scrapCollected >= scrapQuota ? "QUOTA MET! Return to extract!" : "Keep collecting!"}
        </div>
      </div>

      <div style={{
        position: "absolute",
        bottom: 20,
        left: 20,
        background: "rgba(0,0,0,0.7)",
        padding: "12px 16px",
        borderRadius: 8,
        border: `1px solid ${noiseLevel > 0.5 ? "#ff000088" : "#00ff0044"}`,
      }}>
        <div style={{ fontSize: 12, marginBottom: 4, color: noiseLevel > 0.5 ? "#ff0000" : "#00ff00" }}>
          NOISE LEVEL
        </div>
        <div style={{ fontSize: 16, letterSpacing: 2 }}>
          {"["}
          <span style={{ color: noiseLevel > 0.7 ? "#ff0000" : noiseLevel > 0.4 ? "#ffaa00" : "#00ff00" }}>
            {"|".repeat(noiseBars)}
          </span>
          <span style={{ opacity: 0.2 }}>{".".repeat(Math.max(0, 10 - noiseBars))}</span>
          {"]"}
        </div>
        <div style={{ fontSize: 10, marginTop: 4, opacity: 0.6 }}>
          MIC: {micLevel > 0 ? "ACTIVE" : "OFF"} | STEPS: {movementNoise > 0.2 ? "LOUD" : movementNoise > 0 ? "SOFT" : "QUIET"} {noiseLevel > 0.5 && "MONSTERS CAN HEAR YOU!"}
        </div>
      </div>

      {canExtract && (
        <div style={{
          position: "absolute",
          bottom: 100,
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(0,80,0,0.9)",
          padding: "16px 32px",
          borderRadius: 8,
          border: "2px solid #00ff00",
          fontSize: 18,
          fontWeight: "bold",
          animation: "pulse 1s infinite",
          pointerEvents: "auto",
        }}>
          Press [E] to EXTRACT!
        </div>
      )}

      {nearExtract && !canExtract && scrapCollected < scrapQuota && (
        <div style={{
          position: "absolute",
          bottom: 100,
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(80,0,0,0.9)",
          padding: "12px 24px",
          borderRadius: 8,
          border: "2px solid #ff0000",
          fontSize: 14,
        }}>
          Need ${scrapQuota - scrapCollected} more scrap to extract!
        </div>
      )}

      <div style={{
        position: "absolute",
        bottom: 20,
        right: 20,
        background: "rgba(0,0,0,0.5)",
        padding: "8px 12px",
        borderRadius: 8,
        fontSize: 10,
        opacity: 0.6,
        lineHeight: 1.6,
      }}>
        WASD - Move | SHIFT - Sprint | SPACE - Jump<br />
        CTRL/C - Crouch (quieter steps)<br />
        Mouse - Look | F - Flashlight<br />
        E - Extract (at green circle)
      </div>

      <MiniMap />

      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 2,
        height: 2,
        background: "#00ff00",
        borderRadius: "50%",
        boxShadow: "0 0 4px #00ff00",
      }} />
    </div>
  );
}
