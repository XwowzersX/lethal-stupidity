import { useGameStore } from "./useGameStore";

const STUPID_TIPS = [
  "Tip: Try not talking. Ever.",
  "Tip: The monsters have feelings too. They're just very aggressive about it.",
  "Tip: Maybe don't sneeze next time.",
  "Tip: Your coworkers would have survived. Just saying.",
  "Tip: The Company suggests being less dead.",
  "Tip: Have you tried not being heard?",
  "Tip: Silence is golden. And also survival.",
  "Tip: Greg sends his regards.",
  "Tip: Your life insurance has been denied. Again.",
  "Tip: The exit was right there. RIGHT THERE.",
  "Tip: Fun fact - monsters have excellent hearing and zero chill.",
  "Tip: Next time, consider a career change.",
];

export function DeathScreen() {
  const phase = useGameStore((s) => s.phase);
  const deathMessage = useGameStore((s) => s.deathMessage);
  const totalScrapValue = useGameStore((s) => s.totalScrapValue);
  const returnToMenu = useGameStore((s) => s.returnToMenu);
  const startGame = useGameStore((s) => s.startGame);

  if (phase !== "dead") return null;

  const tip = STUPID_TIPS[Math.floor(Math.random() * STUPID_TIPS.length)];

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(15, 0, 0, 0.95)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Courier New', monospace",
      color: "#ff3333",
      zIndex: 2000,
    }}>
      <div style={{
        fontSize: 80,
        fontWeight: "bold",
        textShadow: "0 0 30px #ff0000, 0 0 60px #ff0000",
        marginBottom: 20,
      }}>
        YOU DIED
      </div>

      <div style={{
        fontSize: 18,
        color: "#ff6666",
        marginBottom: 30,
        textAlign: "center",
        maxWidth: 500,
        lineHeight: 1.6,
      }}>
        {deathMessage}
      </div>

      <div style={{
        fontSize: 14,
        color: "#888",
        marginBottom: 10,
      }}>
        Scrap collected: ${totalScrapValue}
      </div>

      <div style={{
        fontSize: 13,
        color: "#666",
        marginBottom: 40,
        fontStyle: "italic",
      }}>
        {tip}
      </div>

      <div style={{ display: "flex", gap: 20 }}>
        <button
          onClick={startGame}
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: 18,
            padding: "12px 32px",
            background: "transparent",
            border: "2px solid #ff3333",
            color: "#ff3333",
            cursor: "pointer",
            borderRadius: 4,
            letterSpacing: 2,
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,0,0,0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          [TRY AGAIN]
        </button>
        <button
          onClick={returnToMenu}
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: 18,
            padding: "12px 32px",
            background: "transparent",
            border: "2px solid #666",
            color: "#666",
            cursor: "pointer",
            borderRadius: 4,
            letterSpacing: 2,
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          [QUIT]
        </button>
      </div>
    </div>
  );
}
