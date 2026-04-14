import { useGameStore } from "./useGameStore";

const EXTRACT_QUOTES = [
  "The Company is mildly impressed. Don't let it go to your head.",
  "You survived! The bar was on the floor and you barely cleared it.",
  "Employee of the month material? Let's not get carried away.",
  "Against all odds (and intelligence), you made it back.",
  "The monsters are filing a complaint about your escape.",
  "Congratulations! Your life insurance premiums have only slightly increased.",
];

export function ExtractScreen() {
  const phase = useGameStore((s) => s.phase);
  const totalScrapValue = useGameStore((s) => s.totalScrapValue);
  const scrapQuota = useGameStore((s) => s.scrapQuota);
  const returnToMenu = useGameStore((s) => s.returnToMenu);
  const startGame = useGameStore((s) => s.startGame);

  if (phase !== "extracted") return null;

  const quote = EXTRACT_QUOTES[Math.floor(Math.random() * EXTRACT_QUOTES.length)];
  const bonus = totalScrapValue - scrapQuota;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(0, 15, 0, 0.95)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Courier New', monospace",
      color: "#00ff00",
      zIndex: 2000,
    }}>
      <div style={{
        fontSize: 60,
        fontWeight: "bold",
        textShadow: "0 0 30px #00ff00, 0 0 60px #00ff00",
        marginBottom: 20,
      }}>
        EXTRACTED!
      </div>

      <div style={{
        fontSize: 18,
        color: "#88ff88",
        marginBottom: 30,
        textAlign: "center",
        maxWidth: 500,
        fontStyle: "italic",
      }}>
        "{quote}"
      </div>

      <div style={{
        background: "rgba(0,255,0,0.1)",
        border: "1px solid #00ff0044",
        borderRadius: 8,
        padding: "20px 40px",
        marginBottom: 40,
        textAlign: "center",
      }}>
        <div style={{ fontSize: 14, marginBottom: 8, opacity: 0.7 }}>MISSION SUMMARY</div>
        <div style={{ fontSize: 24, marginBottom: 4 }}>Total Scrap: ${totalScrapValue}</div>
        <div style={{ fontSize: 14, opacity: 0.7 }}>Quota: ${scrapQuota}</div>
        {bonus > 0 && (
          <div style={{ fontSize: 16, color: "#ffff00", marginTop: 8 }}>
            Bonus: +${bonus}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 20 }}>
        <button
          onClick={startGame}
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: 18,
            padding: "12px 32px",
            background: "transparent",
            border: "2px solid #00ff00",
            color: "#00ff00",
            cursor: "pointer",
            borderRadius: 4,
            letterSpacing: 2,
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(0,255,0,0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          [NEXT SHIFT]
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
          [CLOCK OUT]
        </button>
      </div>
    </div>
  );
}
