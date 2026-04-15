import { useGameStore } from "./useGameStore";

export function MenuScreen() {
  const phase = useGameStore((s) => s.phase);
  const startGame = useGameStore((s) => s.startGame);

  if (phase !== "menu") return null;

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0,
      width: "100vw", height: "100vh",
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
        position: "absolute", inset: 0,
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,0,0.03) 2px, rgba(0,255,0,0.03) 4px)",
        pointerEvents: "none",
      }} />

      <div style={{
        fontSize: 72, fontWeight: "bold",
        textShadow: "0 0 20px #00ff00, 0 0 40px #00ff00, 0 0 60px #00aa00",
        marginBottom: 8, letterSpacing: 4,
      }}>
        LETHAL
      </div>
      <div style={{
        fontSize: 48, fontWeight: "bold",
        color: "#ff3366",
        textShadow: "0 0 20px #ff3366, 0 0 40px #ff3366",
        marginBottom: 48, letterSpacing: 8,
      }}>
        STUPIDITY
      </div>

      <div style={{
        display: "flex",
        gap: 32,
        marginBottom: 48,
        fontSize: 12,
        color: "#334433",
      }}>
        {["B1 – Safe","B2 – Sketchy","B3 – Bad","B4 – The Deep","B5 – ???","B6 – THE END"].map((name, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div style={{
              width: 36, height: 36,
              border: "1px solid #223322",
              borderRadius: 4,
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 4,
              color: "#335533",
              fontSize: 14,
              fontWeight: "bold",
            }}>
              B{i + 1}
            </div>
            <div style={{ fontSize: 9, letterSpacing: 1 }}>{name.split(" – ")[1]}</div>
          </div>
        ))}
      </div>

      <div style={{
        fontSize: 14,
        maxWidth: 460,
        textAlign: "center",
        lineHeight: 1.9,
        marginBottom: 44,
        opacity: 0.7,
      }}>
        Descend through 6 floors of escalating stupidity.<br />
        Collect scrap. Meet your quota. Don't make noise.<br />
        <span style={{ color: "#ff3366" }}>The monsters can hear you.</span><br />
        <span style={{ fontSize: 11, opacity: 0.5 }}>(You're going to be stupid.)</span>
      </div>

      <button
        onClick={startGame}
        style={{
          fontFamily: "'Courier New', monospace",
          fontSize: 22,
          padding: "16px 52px",
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
        marginTop: 28,
        fontSize: 11,
        opacity: 0.35,
        textAlign: "center",
        lineHeight: 1.8,
      }}>
        WASD - Move &nbsp;|&nbsp; SHIFT - Sprint &nbsp;|&nbsp; Mouse - Look<br />
        F - Flashlight &nbsp;|&nbsp; E - Extract &nbsp;|&nbsp; Your Voice - Attract Monsters
      </div>

      <div style={{
        position: "absolute", bottom: 20,
        fontSize: 10, opacity: 0.25,
      }}>
        THE COMPANY IS NOT RESPONSIBLE FOR EMPLOYEE DEATHS, DISMEMBERMENT, OR EMOTIONAL TRAUMA
      </div>
    </div>
  );
}
