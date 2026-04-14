import { useGameStore } from "./useGameStore";

export function MenuScreen() {
  const phase = useGameStore((s) => s.phase);
  const startGame = useGameStore((s) => s.startGame);

  if (phase !== "menu") return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "linear-gradient(180deg, #0a0a1a 0%, #1a0a2a 50%, #0a1a0a 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Courier New', monospace",
      color: "#00ff00",
      zIndex: 1000,
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,0,0.03) 2px, rgba(0,255,0,0.03) 4px)",
        pointerEvents: "none",
      }} />

      <div style={{
        fontSize: 72,
        fontWeight: "bold",
        textShadow: "0 0 20px #00ff00, 0 0 40px #00ff00, 0 0 60px #00aa00",
        marginBottom: 8,
        letterSpacing: 4,
      }}>
        LETHAL
      </div>
      <div style={{
        fontSize: 48,
        fontWeight: "bold",
        color: "#ff3366",
        textShadow: "0 0 20px #ff3366, 0 0 40px #ff3366",
        marginBottom: 40,
        letterSpacing: 8,
      }}>
        STUPIDITY
      </div>

      <div style={{
        fontSize: 14,
        maxWidth: 500,
        textAlign: "center",
        lineHeight: 1.8,
        marginBottom: 40,
        opacity: 0.8,
      }}>
        Welcome, Employee #{Math.floor(Math.random() * 9999).toString().padStart(4, "0")}.<br />
        The Company requires you to collect scrap from the facility.<br />
        Use your microphone wisely - <span style={{ color: "#ff3366" }}>the monsters can hear you</span>.<br />
        Meet your quota. Extract alive. Don't be stupid.<br />
        <span style={{ fontSize: 11, opacity: 0.6 }}>(You're going to be stupid.)</span>
      </div>

      <button
        onClick={startGame}
        style={{
          fontFamily: "'Courier New', monospace",
          fontSize: 24,
          padding: "16px 48px",
          background: "transparent",
          border: "2px solid #00ff00",
          color: "#00ff00",
          cursor: "pointer",
          borderRadius: 4,
          textShadow: "0 0 10px #00ff00",
          boxShadow: "0 0 20px rgba(0,255,0,0.2), inset 0 0 20px rgba(0,255,0,0.1)",
          transition: "all 0.2s",
          letterSpacing: 4,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(0,255,0,0.15)";
          e.currentTarget.style.boxShadow = "0 0 40px rgba(0,255,0,0.4), inset 0 0 30px rgba(0,255,0,0.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.boxShadow = "0 0 20px rgba(0,255,0,0.2), inset 0 0 20px rgba(0,255,0,0.1)";
        }}
      >
        [ENTER FACILITY]
      </button>

      <div style={{
        marginTop: 30,
        fontSize: 11,
        opacity: 0.4,
        textAlign: "center",
        lineHeight: 1.8,
      }}>
        WASD - Move | SHIFT - Sprint | Mouse - Look<br />
        F - Flashlight | E - Extract | Your Voice - Attract Monsters
      </div>

      <div style={{
        position: "absolute",
        bottom: 20,
        fontSize: 10,
        opacity: 0.3,
      }}>
        THE COMPANY IS NOT RESPONSIBLE FOR EMPLOYEE DEATHS, DISMEMBERMENT, OR EMOTIONAL TRAUMA
      </div>
    </div>
  );
}
