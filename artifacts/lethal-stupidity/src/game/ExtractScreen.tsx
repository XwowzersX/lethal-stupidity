import { useGameStore } from "./useGameStore";
import { LEVEL_CONFIGS } from "./types";

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
  const scrapCollected = useGameStore((s) => s.scrapCollected);
  const scrapQuota = useGameStore((s) => s.scrapQuota);
  const currentLevel = useGameStore((s) => s.currentLevel);
  const nextLevel = useGameStore((s) => s.nextLevel);
  const returnToMenu = useGameStore((s) => s.returnToMenu);

  if (phase !== "extracted") return null;

  const quote = EXTRACT_QUOTES[Math.floor(Math.random() * EXTRACT_QUOTES.length)];
  const bonus = scrapCollected - scrapQuota;
  const isLastLevel = currentLevel >= LEVEL_CONFIGS.length;
  const nextLevelConfig = !isLastLevel
    ? LEVEL_CONFIGS[Math.min(currentLevel, LEVEL_CONFIGS.length - 1)]
    : null;

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0,
      width: "100vw", height: "100vh",
      background: "rgba(0, 12, 0, 0.97)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Courier New', monospace",
      color: "#00ff00",
      zIndex: 2000,
    }}>
      <style>{`
        @keyframes glow { 0%,100%{text-shadow:0 0 30px #00ff00,0 0 60px #00ff00} 50%{text-shadow:0 0 60px #00ff00,0 0 120px #00aa00} }
      `}</style>

      <div style={{
        fontSize: 13,
        color: "#224422",
        letterSpacing: 6,
        marginBottom: 12,
      }}>
        ARIA SYSTEMS — EXTRACTION CONFIRMED
      </div>

      <div style={{
        fontSize: 64,
        fontWeight: "bold",
        animation: "glow 2s ease-in-out infinite",
        marginBottom: 8,
        letterSpacing: 4,
      }}>
        EXTRACTED
      </div>

      <div style={{
        fontSize: 13,
        color: "#446644",
        marginBottom: 6,
        letterSpacing: 2,
      }}>
        FLOOR {`B${currentLevel}`} — {LEVEL_CONFIGS[Math.min(currentLevel - 1, LEVEL_CONFIGS.length - 1)].floorName}
      </div>

      <div style={{
        fontSize: 16,
        color: "#559955",
        marginBottom: 28,
        textAlign: "center",
        maxWidth: 440,
        fontStyle: "italic",
        lineHeight: 1.5,
      }}>
        "{quote}"
      </div>

      <div style={{
        background: "rgba(0,255,0,0.05)",
        border: "1px solid #003300",
        borderRadius: 6,
        padding: "20px 40px",
        marginBottom: 32,
        textAlign: "center",
        minWidth: 280,
      }}>
        <div style={{ fontSize: 11, marginBottom: 12, opacity: 0.5, letterSpacing: 3 }}>MISSION SUMMARY</div>
        <div style={{ fontSize: 26, marginBottom: 4 }}>
          Scrap Collected: <span style={{ color: "#ffff44" }}>${scrapCollected}</span>
        </div>
        <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 4 }}>
          Quota: ${scrapQuota}
        </div>
        {bonus > 0 && (
          <div style={{ fontSize: 15, color: "#88ff44", marginTop: 8 }}>
            Overage Bonus: +${bonus} (goes to The Company)
          </div>
        )}
        {!isLastLevel && nextLevelConfig && (
          <div style={{
            marginTop: 14,
            paddingTop: 14,
            borderTop: "1px solid #002200",
            fontSize: 12,
            color: "#446644",
          }}>
            NEXT: {nextLevelConfig.floorName} &nbsp;·&nbsp; {nextLevelConfig.monsterCount} hazard{nextLevelConfig.monsterCount !== 1 ? "s" : ""} &nbsp;·&nbsp; ${nextLevelConfig.scrapQuota} quota
          </div>
        )}
        {isLastLevel && (
          <div style={{
            marginTop: 14,
            paddingTop: 14,
            borderTop: "1px solid #002200",
            fontSize: 14,
            color: "#ffff00",
            textShadow: "0 0 10px #ffff00",
          }}>
            YOU HAVE CLEARED ALL FLOORS. THE COMPANY IS CONFUSED.
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 16 }}>
        {!isLastLevel ? (
          <button
            onClick={nextLevel}
            style={{
              fontFamily: "'Courier New', monospace",
              fontSize: 18,
              padding: "13px 36px",
              background: "transparent",
              border: "2px solid #00ff00",
              color: "#00ff00",
              cursor: "pointer",
              borderRadius: 4,
              letterSpacing: 3,
              transition: "all 0.2s",
              textShadow: "0 0 8px #00ff00",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0,255,0,0.12)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            [ DESCEND DEEPER ]
          </button>
        ) : (
          <button
            onClick={returnToMenu}
            style={{
              fontFamily: "'Courier New', monospace",
              fontSize: 18,
              padding: "13px 36px",
              background: "transparent",
              border: "2px solid #ffff00",
              color: "#ffff00",
              cursor: "pointer",
              borderRadius: 4,
              letterSpacing: 3,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,0,0.1)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            [ CLAIM YOUR RAISE ]
          </button>
        )}
        <button
          onClick={returnToMenu}
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: 16,
            padding: "13px 28px",
            background: "transparent",
            border: "1px solid #224422",
            color: "#446644",
            cursor: "pointer",
            borderRadius: 4,
            letterSpacing: 2,
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#334433"; e.currentTarget.style.color = "#558855"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#224422"; e.currentTarget.style.color = "#446644"; }}
        >
          [ CLOCK OUT ]
        </button>
      </div>
    </div>
  );
}
