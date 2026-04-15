import { useGameStore } from "./useGameStore";
import { LEVEL_CONFIGS } from "./types";

export function GameHUD() {
  const health = useGameStore((s) => s.health);
  const scrapCollected = useGameStore((s) => s.scrapCollected);
  const scrapQuota = useGameStore((s) => s.scrapQuota);
  const timeRemaining = useGameStore((s) => s.timeRemaining);
  const micLevel = useGameStore((s) => s.micLevel);
  const noiseLevel = useGameStore((s) => s.noiseLevel);
  const flashlightOn = useGameStore((s) => s.flashlightOn);
  const playerPosition = useGameStore((s) => s.playerPosition);
  const currentLevel = useGameStore((s) => s.currentLevel);
  const levelConfig = LEVEL_CONFIGS[Math.min(currentLevel - 1, LEVEL_CONFIGS.length - 1)];

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = Math.floor(timeRemaining % 60);
  const timeStr = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  const nearExtract = Math.sqrt(playerPosition.x ** 2 + playerPosition.z ** 2) < 4;
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
          MIC: {micLevel > 0 ? "ACTIVE" : "OFF"} {noiseLevel > 0.5 && "MONSTERS CAN HEAR YOU!"}
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
        WASD - Move | SHIFT - Sprint<br />
        Mouse - Look | F - Flashlight<br />
        E - Extract (at green circle)
      </div>

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
