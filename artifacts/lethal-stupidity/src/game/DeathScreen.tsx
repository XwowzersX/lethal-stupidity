import { useEffect, useRef } from "react";
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
  const currentLevel = useGameStore((s) => s.currentLevel);
  const enterElevator = useGameStore((s) => s.enterElevator);
  const returnToMenu = useGameStore((s) => s.returnToMenu);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tipRef = useRef(STUPID_TIPS[Math.floor(Math.random() * STUPID_TIPS.length)]);

  useEffect(() => {
    if (phase !== "dead") return;

    tipRef.current = STUPID_TIPS[Math.floor(Math.random() * STUPID_TIPS.length)];

    timerRef.current = setTimeout(() => {
      enterElevator(currentLevel, true);
    }, 4000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phase, currentLevel, enterElevator]);

  if (phase !== "dead") return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(8, 0, 0, 0.97)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Courier New', monospace",
      color: "#ff3333",
      zIndex: 2000,
      animation: "fadeIn 0.4s ease-in",
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes pulseRed { 0%,100%{text-shadow:0 0 30px #ff0000,0 0 60px #ff0000} 50%{text-shadow:0 0 60px #ff0000,0 0 120px #ff0000} }
        @keyframes countdown { from{width:100%} to{width:0%} }
      `}</style>

      <div style={{
        fontSize: 88,
        fontWeight: "bold",
        animation: "pulseRed 1.5s ease-in-out infinite",
        marginBottom: 24,
        letterSpacing: 4,
      }}>
        YOU DIED
      </div>

      <div style={{
        fontSize: 17,
        color: "#cc5555",
        marginBottom: 20,
        textAlign: "center",
        maxWidth: 480,
        lineHeight: 1.6,
        padding: "0 20px",
      }}>
        {deathMessage}
      </div>

      <div style={{
        fontSize: 12,
        color: "#553333",
        marginBottom: 32,
        fontStyle: "italic",
      }}>
        {tipRef.current}
      </div>

      <div style={{
        fontSize: 13,
        color: "#883333",
        marginBottom: 8,
        letterSpacing: 2,
      }}>
        RETURNING TO ELEVATOR IN 4s...
      </div>

      <div style={{
        width: 200,
        height: 3,
        background: "#1a0000",
        borderRadius: 2,
        overflow: "hidden",
        marginBottom: 32,
      }}>
        <div style={{
          height: "100%",
          background: "#ff3333",
          animation: "countdown 4s linear forwards",
        }} />
      </div>

      <button
        onClick={returnToMenu}
        style={{
          fontFamily: "'Courier New', monospace",
          fontSize: 14,
          padding: "10px 28px",
          background: "transparent",
          border: "1px solid #442222",
          color: "#553333",
          cursor: "pointer",
          borderRadius: 4,
          letterSpacing: 2,
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#664444";
          e.currentTarget.style.color = "#886666";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "#442222";
          e.currentTarget.style.color = "#553333";
        }}
      >
        [QUIT TO MENU]
      </button>
    </div>
  );
}
