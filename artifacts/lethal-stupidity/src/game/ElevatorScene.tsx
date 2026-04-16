import { CSSProperties, useEffect, useRef, useState } from "react";
import { useGameStore } from "./useGameStore";
import { LEVEL_CONFIGS } from "./types";

const MONO: CSSProperties = { fontFamily: "'Courier New', monospace" };

function useTypewriter(lines: string[], started: boolean) {
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [done, setDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!started) return;
    setDisplayedLines([]);
    setCurrentLine(0);
    setCurrentChar(0);
    setDone(false);
  }, [started, lines]);

  useEffect(() => {
    if (!started || done) return;
    if (currentLine >= lines.length) {
      setDone(true);
      return;
    }

    const line = lines[currentLine];
    if (currentChar <= line.length) {
      timerRef.current = setTimeout(() => {
        setDisplayedLines((prev) => {
          const next = [...prev];
          next[currentLine] = line.slice(0, currentChar);
          return next;
        });
        setCurrentChar((c) => c + 1);
      }, currentChar === 0 ? 600 : 28);
    } else {
      timerRef.current = setTimeout(() => {
        setCurrentLine((l) => l + 1);
        setCurrentChar(0);
      }, 380);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [started, lines, currentLine, currentChar, done]);

  return { displayedLines, done };
}

export function ElevatorScene() {
  const phase = useGameStore((s) => s.phase);
  const currentLevel = useGameStore((s) => s.currentLevel);
  const isRespawn = useGameStore((s) => s.isRespawn);
  const startLevel = useGameStore((s) => s.startLevel);

  const [started, setStarted] = useState(false);
  const [floorDisplay, setFloorDisplay] = useState(1);
  const [shake, setShake] = useState(false);

  const config = LEVEL_CONFIGS[Math.min(currentLevel - 1, LEVEL_CONFIGS.length - 1)];
  const lines = isRespawn ? config.respawnLines : config.tutorialLines;

  const { displayedLines, done } = useTypewriter(lines, started);

  useEffect(() => {
    if (phase !== "elevator") {
      setStarted(false);
      return;
    }

    const t = setTimeout(() => setStarted(true), 800);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "elevator") return;

    let floor = 1;
    setFloorDisplay(floor);

    const interval = setInterval(() => {
      floor = Math.min(floor + 1, currentLevel);
      setFloorDisplay(floor);
      if (floor >= currentLevel) clearInterval(interval);
    }, 350);

    const shakeTimer = setTimeout(() => {
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }, currentLevel * 350 + 200);

    return () => {
      clearInterval(interval);
      clearTimeout(shakeTimer);
    };
  }, [phase, currentLevel]);

  if (phase !== "elevator") return null;

  const floorColor = currentLevel === 1 ? "#00ff88" : currentLevel <= 3 ? "#ffcc00" : "#ff4444";

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "#060608",
      zIndex: 1000,
      overflow: "hidden",
      ...MONO,
      display: "flex",
      flexDirection: "column",
    }}>
      <div style={{
        position: "absolute",
        inset: 0,
        background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,200,100,0.015) 3px, rgba(0,200,100,0.015) 4px)",
        pointerEvents: "none",
        zIndex: 1,
      }} />

      <div style={{
        position: "absolute",
        inset: 0,
        transform: shake ? `translate(${(Math.random()-0.5)*4}px, ${(Math.random()-0.5)*4}px)` : "none",
        transition: shake ? "none" : "transform 0.1s",
      }}>
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: "30%",
          background: "linear-gradient(180deg, #0a0f0a 0%, transparent 100%)",
        }} />
        <div style={{
          position: "absolute",
          bottom: 0, left: 0, right: 0,
          height: "25%",
          background: "linear-gradient(0deg, #050506 0%, transparent 100%)",
        }} />

        <div style={{
          position: "absolute",
          left: "50%",
          top: "12%",
          transform: "translateX(-50%)",
          textAlign: "center",
        }}>
          <div style={{
            fontSize: 11,
            color: "#446644",
            letterSpacing: 6,
            marginBottom: 8,
          }}>
            ARIA SYSTEMS v4.1.0
          </div>
          <div style={{
            fontSize: 11,
            color: "#334433",
            letterSpacing: 4,
            marginBottom: 20,
          }}>
            EMPLOYEE DEPLOYMENT TERMINAL
          </div>

          <div style={{
            display: "inline-block",
            border: "2px solid #223322",
            borderRadius: 6,
            padding: "12px 32px",
            background: "rgba(0,20,10,0.6)",
            marginBottom: 8,
          }}>
            <div style={{ fontSize: 11, color: "#446644", letterSpacing: 4, marginBottom: 6 }}>
              DESCENDING TO FLOOR
            </div>
            <div style={{
              fontSize: 48,
              fontWeight: "bold",
              color: floorColor,
              textShadow: `0 0 20px ${floorColor}, 0 0 40px ${floorColor}66`,
              letterSpacing: 4,
              lineHeight: 1,
              minWidth: 80,
            }}>
              B{floorDisplay}
            </div>
            <div style={{
              fontSize: 13,
              color: "#557755",
              letterSpacing: 2,
              marginTop: 6,
            }}>
              {config.floorName}
            </div>
          </div>

          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: 24,
            marginTop: 12,
          }}>
            <Stat label="MONSTERS" value={config.monsterCount === 0 ? "NONE" : `${config.monsterCount}`}
              color={config.monsterCount === 0 ? "#00ff88" : "#ff4444"} />
            <Stat label="QUOTA" value={`$${config.scrapQuota}`} color="#ffcc00" />
            <Stat label="TIME" value={formatTime(config.timeLimit)} color="#88aaff" />
          </div>
        </div>

        <div style={{
          position: "absolute",
          left: "50%",
          top: "46%",
          transform: "translateX(-50%)",
          width: 580,
          maxWidth: "90vw",
        }}>
          <div style={{
            border: "1px solid #1a2a1a",
            borderRadius: 4,
            background: "rgba(0,10,5,0.8)",
            padding: "20px 24px",
            minHeight: 220,
            position: "relative",
          }}>
            <div style={{
              position: "absolute",
              top: 10,
              left: 16,
              fontSize: 9,
              color: "#335533",
              letterSpacing: 3,
            }}>
              ARIA INTERCOM ● {isRespawn ? "RESPAWN PROTOCOL" : currentLevel === 1 ? "ORIENTATION" : "FLOOR BRIEFING"}
            </div>

            <div style={{ marginTop: 16 }}>
              {displayedLines.map((line, i) => (
                <div key={i} style={{
                  fontSize: 14,
                  color: i === displayedLines.length - 1 ? "#88ff99" : "#557755",
                  lineHeight: 1.7,
                  transition: "color 0.5s",
                }}>
                  {i === displayedLines.length - 1 && (
                    <span style={{ color: "#00ff88", marginRight: 6 }}>›</span>
                  )}
                  {line}
                  {i === displayedLines.length - 1 && !done && (
                    <span style={{
                      display: "inline-block",
                      width: 8,
                      height: 14,
                      background: "#00ff88",
                      marginLeft: 2,
                      verticalAlign: "middle",
                      animation: "blink 0.7s step-end infinite",
                    }} />
                  )}
                </div>
              ))}
              {!started && (
                <div style={{ fontSize: 13, color: "#334433" }}>
                  Establishing connection...
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{
          position: "absolute",
          bottom: "8%",
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
        }}>
          {done ? (
            <button
              onClick={startLevel}
              autoFocus
              style={{
                ...MONO,
                fontSize: 20,
                padding: "14px 56px",
                background: "transparent",
                border: `2px solid ${floorColor}`,
                color: floorColor,
                cursor: "pointer",
                borderRadius: 4,
                textShadow: `0 0 12px ${floorColor}`,
                boxShadow: `0 0 24px ${floorColor}33, inset 0 0 16px ${floorColor}11`,
                letterSpacing: 4,
                transition: "all 0.2s",
                animation: "pulse-border 1.5s ease-in-out infinite",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `${floorColor}18`;
                e.currentTarget.style.boxShadow = `0 0 48px ${floorColor}55, inset 0 0 24px ${floorColor}22`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.boxShadow = `0 0 24px ${floorColor}33, inset 0 0 16px ${floorColor}11`;
              }}
            >
              [ DEPLOY TO FACILITY ]
            </button>
          ) : (
            <button
              onClick={startLevel}
              style={{
                ...MONO,
                fontSize: 13,
                padding: "10px 28px",
                background: "rgba(0,20,10,0.55)",
                border: "1px solid #335533",
                color: "#66aa77",
                cursor: "pointer",
                borderRadius: 4,
                letterSpacing: 3,
                boxShadow: "inset 0 0 12px rgba(0,255,120,0.08)",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#00ff88";
                e.currentTarget.style.borderColor = "#00ff88";
                e.currentTarget.style.background = "rgba(0,40,18,0.8)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#66aa77";
                e.currentTarget.style.borderColor = "#335533";
                e.currentTarget.style.background = "rgba(0,20,10,0.55)";
              }}
            >
              <span style={{ animation: "blink 1s step-end infinite", display: "inline-block" }}>■</span>
              {" "}[ SKIP ARIA BRIEFING ]
            </button>
          )}

          <div style={{
            marginTop: 16,
            fontSize: 10,
            color: "#223322",
            letterSpacing: 2,
          }}>
            WASD - MOVE &nbsp;|&nbsp; MOUSE - LOOK &nbsp;|&nbsp; F - FLASHLIGHT &nbsp;|&nbsp; E - EXTRACT &nbsp;|&nbsp; SHIFT - SPRINT
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes pulse-border { 0%,100%{opacity:1} 50%{opacity:0.7} }
      `}</style>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 9, color: "#335533", letterSpacing: 3, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 16, color, fontWeight: "bold", textShadow: `0 0 10px ${color}88` }}>{value}</div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
