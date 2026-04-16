import { useState, useEffect } from "react";
import { useGameStore } from "./useGameStore";
import { useClerk } from "@clerk/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { LEVEL_CONFIGS } from "./types";

const FLOOR_NAMES = ["B1","B2","B3","B4","B5","B6"];

interface SaveSlot {
  slot: number;
  currentLevel: number;
  updatedAt: string;
}

interface MenuScreenProps {
  isGuest: boolean;
  userName?: string;
}

function useNoise() {
  const [t, setT] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setT((p) => p + 1), 100);
    return () => clearInterval(id);
  }, []);
  return t;
}

function GlitchTitle() {
  const [glitch, setGlitch] = useState(false);
  useEffect(() => {
    const loop = () => {
      setTimeout(() => {
        setGlitch(true);
        setTimeout(() => setGlitch(false), 80 + Math.random() * 60);
        loop();
      }, 4000 + Math.random() * 6000);
    };
    loop();
  }, []);

  return (
    <div style={{ textAlign: "center", userSelect: "none", marginBottom: 8 }}>
      <div style={{
        fontFamily: "'Orbitron', monospace",
        fontSize: "clamp(52px, 9vw, 88px)",
        fontWeight: 900,
        color: "#00ff41",
        letterSpacing: "0.12em",
        textShadow: glitch ? "4px 0 #ff0040, -4px 0 #00aaff, 0 0 40px #00ff41" : "0 0 25px rgba(0,255,65,0.55), 0 0 80px rgba(0,255,65,0.15)",
        transform: glitch ? `translate(${(Math.random()-0.5)*8}px,0)` : "none",
        lineHeight: 1.05,
      }}>LETHAL</div>
      <div style={{
        fontFamily: "'Orbitron', monospace",
        fontSize: "clamp(34px, 5.5vw, 56px)",
        fontWeight: 900,
        color: "#ff2244",
        letterSpacing: "0.24em",
        textShadow: glitch ? "4px 0 #00ff41, -4px 0 #ff0040, 0 0 30px #ff2244" : "0 0 20px rgba(255,34,68,0.65), 0 0 60px rgba(255,34,68,0.18)",
        lineHeight: 1.2,
      }}>STUPIDITY</div>
    </div>
  );
}

function SaveSlotCard({
  slotNum,
  save,
  onPlay,
  onDelete,
}: {
  slotNum: number;
  save?: SaveSlot;
  onPlay: () => void;
  onDelete?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [delHovered, setDelHovered] = useState(false);

  const isEmpty = !save;
  const level = save?.currentLevel ?? 1;
  const levelName = LEVEL_CONFIGS[Math.min(level - 1, LEVEL_CONFIGS.length - 1)]?.floorName ?? `FLOOR B${level}`;
  const dateStr = save?.updatedAt ? new Date(save.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" }) : null;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setDelHovered(false); }}
      style={{
        border: `1px solid ${hovered && !isEmpty ? "rgba(0,255,65,0.45)" : "rgba(0,255,65,0.14)"}`,
        borderRadius: 6,
        background: hovered && !isEmpty ? "rgba(0,20,0,0.85)" : "rgba(0,8,0,0.6)",
        padding: "16px 14px",
        cursor: isEmpty ? "default" : "pointer",
        transition: "all 0.18s ease",
        boxShadow: hovered && !isEmpty ? "0 0 24px rgba(0,255,65,0.12), inset 0 0 16px rgba(0,255,65,0.04)" : "none",
        position: "relative",
        minHeight: 110,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
      }}
      onClick={() => !isEmpty && onPlay()}
    >
      {/* Slot number */}
      <div style={{ fontSize: 9, letterSpacing: 4, color: isEmpty ? "rgba(0,255,65,0.2)" : "rgba(0,255,65,0.45)", fontFamily: "'Share Tech Mono', monospace" }}>
        SLOT {String(slotNum).padStart(2,"0")}
      </div>

      {isEmpty ? (
        <>
          <div style={{ fontSize: 28, color: "rgba(0,255,65,0.12)", lineHeight: 1 }}>◻</div>
          <button
            onClick={(e) => { e.stopPropagation(); onPlay(); }}
            style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: 10,
              letterSpacing: 3,
              padding: "7px 16px",
              background: hovered ? "rgba(0,255,65,0.1)" : "transparent",
              border: "1px solid rgba(0,255,65,0.2)",
              color: hovered ? "#00ff41" : "rgba(0,255,65,0.35)",
              cursor: "pointer",
              borderRadius: 3,
              transition: "all 0.15s",
            }}
          >
            + NEW GAME
          </button>
        </>
      ) : (
        <>
          <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 16, fontWeight: 700, color: "#00ff41", textShadow: hovered ? "0 0 12px rgba(0,255,65,0.6)" : "none", letterSpacing: 2 }}>
            {FLOOR_NAMES[Math.min(level - 1, FLOOR_NAMES.length - 1)]}
          </div>
          <div style={{ fontSize: 9, color: "rgba(0,255,65,0.4)", letterSpacing: 2, fontFamily: "'Share Tech Mono', monospace" }}>
            {levelName.toUpperCase()}
          </div>
          {dateStr && <div style={{ fontSize: 8, color: "rgba(0,255,65,0.25)", letterSpacing: 1, fontFamily: "'Share Tech Mono', monospace" }}>{dateStr}</div>}
          <button
            onClick={(e) => { e.stopPropagation(); onPlay(); }}
            style={{
              fontFamily: "'Share Tech Mono', monospace", fontSize: 10, letterSpacing: 3, padding: "7px 18px",
              background: hovered ? "rgba(0,255,65,0.14)" : "transparent",
              border: "1px solid rgba(0,255,65,0.4)", color: "#00cc35",
              cursor: "pointer", borderRadius: 3, transition: "all 0.15s", marginTop: 2,
            }}
          >▸ CONTINUE</button>
          {onDelete && (
            <button
              onMouseEnter={(e) => { e.stopPropagation(); setDelHovered(true); }}
              onMouseLeave={(e) => { e.stopPropagation(); setDelHovered(false); }}
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              style={{
                position: "absolute", top: 6, right: 8,
                fontFamily: "'Share Tech Mono', monospace", fontSize: 11,
                background: "transparent", border: "none",
                color: delHovered ? "#ff2244" : "rgba(255,34,68,0.25)",
                cursor: "pointer", padding: "2px 4px", lineHeight: 1,
                transition: "color 0.15s",
              }}
            >✕</button>
          )}
        </>
      )}
    </div>
  );
}

function GuestMenu({ startGame }: { startGame: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, width: "100%" }}>
      <div style={{ fontSize: 11, color: "rgba(255,120,50,0.6)", letterSpacing: 3, textAlign: "center", fontFamily: "'Share Tech Mono', monospace" }}>
        ⚠ TEMP WORKER ACCESS — PROGRESS NOT SAVED
      </div>
      <button
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={startGame}
        style={{
          fontFamily: "'Orbitron', monospace", fontWeight: 700,
          fontSize: 16, letterSpacing: 5, padding: "18px 60px",
          background: hovered ? "rgba(0,255,65,0.1)" : "transparent",
          border: `2px solid ${hovered ? "#00ff41" : "rgba(0,255,65,0.45)"}`,
          color: hovered ? "#00ff41" : "#00cc35",
          cursor: "pointer", borderRadius: 5,
          textShadow: hovered ? "0 0 14px #00ff41" : "none",
          boxShadow: hovered ? "0 0 40px rgba(0,255,65,0.18), inset 0 0 20px rgba(0,255,65,0.07)" : "none",
          transition: "all 0.2s",
        }}
      >
        [ENTER FACILITY]
      </button>
    </div>
  );
}

export function MenuScreen({ isGuest, userName }: MenuScreenProps) {
  const phase = useGameStore((s) => s.phase);
  const startGame = useGameStore((s) => s.startGame);
  const enterElevator = useGameStore((s) => s.enterElevator);
  const { signOut } = useClerk();
  const qc = useQueryClient();

  const { data: savesData, isLoading: savesLoading } = useQuery<SaveSlot[]>({
    queryKey: ["saves"],
    queryFn: () => apiRequest("GET", "/api/saves"),
    enabled: !isGuest,
    retry: false,
  });

  const deleteMutation = useMutation({
    mutationFn: (slot: number) => apiRequest("DELETE", `/api/saves/${slot}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["saves"] }),
  });

  if (phase !== "menu") return null;

  const saves: Record<number, SaveSlot> = {};
  if (savesData) for (const s of savesData) saves[s.slot] = s;

  const handleSlotPlay = (slot: number) => {
    const save = saves[slot];
    if (save) {
      enterElevator(save.currentLevel);
    } else {
      startGame();
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "radial-gradient(ellipse at 50% -5%, #0a1a0a 0%, #040404 55%, #000 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "'Share Tech Mono', monospace", color: "#00ff41", zIndex: 1000, overflow: "hidden",
    }}>
      {/* Scanlines */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.12) 2px,rgba(0,0,0,0.12) 4px)", pointerEvents: "none", zIndex: 10 }} />
      {/* Vignette */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.65) 100%)", pointerEvents: "none", zIndex: 9 }} />

      {/* Corner brackets */}
      {([["top","left"],["top","right"],["bottom","left"],["bottom","right"]] as const).map(([v,h], i) => (
        <div key={i} style={{ position: "absolute", [v]: 18, [h]: 18, width: 20, height: 20, borderTop: v==="top" ? "1px solid rgba(0,255,65,0.25)" : "none", borderBottom: v==="bottom" ? "1px solid rgba(0,255,65,0.25)" : "none", borderLeft: h==="left" ? "1px solid rgba(0,255,65,0.25)" : "none", borderRight: h==="right" ? "1px solid rgba(0,255,65,0.25)" : "none", zIndex: 11 }} />
      ))}

      {/* Header bar */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 44, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", borderBottom: "1px solid rgba(0,255,65,0.08)", background: "rgba(0,0,0,0.4)", zIndex: 12 }}>
        <div style={{ fontSize: 9, letterSpacing: 4, color: "rgba(0,255,65,0.35)" }}>THE COMPANY — FACILITY ASSIGNMENT TERMINAL</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {!isGuest && userName && (
            <div style={{ fontSize: 9, letterSpacing: 2, color: "rgba(0,255,65,0.45)" }}>
              EMPLOYEE: {userName.toUpperCase()}
            </div>
          )}
          {!isGuest && (
            <button
              onClick={() => signOut()}
              style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 9, letterSpacing: 2, background: "transparent", border: "1px solid rgba(255,34,68,0.2)", color: "rgba(255,34,68,0.5)", cursor: "pointer", padding: "4px 10px", borderRadius: 3, transition: "all 0.15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,34,68,0.6)"; e.currentTarget.style.color = "#ff2244"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,34,68,0.2)"; e.currentTarget.style.color = "rgba(255,34,68,0.5)"; }}
            >
              SIGN OUT
            </button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div style={{ position: "relative", zIndex: 5, display: "flex", flexDirection: "column", alignItems: "center", gap: 0, width: "100%", maxWidth: 720, padding: "0 24px", marginTop: 44 }}>
        <GlitchTitle />

        <div style={{ fontSize: 11, color: "#ff2244", letterSpacing: 4, marginBottom: 4, marginTop: 10, textShadow: "0 0 8px rgba(255,34,68,0.4)" }}>
          THE MONSTERS CAN HEAR YOU
        </div>

        {/* Floor progression row */}
        <div style={{ display: "flex", gap: 8, marginBottom: 36, marginTop: 8 }}>
          {LEVEL_CONFIGS.map((cfg, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{
                width: 34, height: 34, border: "1px solid rgba(0,255,65,0.15)", borderRadius: 4,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontFamily: "'Orbitron', monospace", fontWeight: 700,
                color: "rgba(0,255,65,0.35)", letterSpacing: 1,
              }}>B{i+1}</div>
              <div style={{ fontSize: 8, marginTop: 4, color: "rgba(0,255,65,0.2)", letterSpacing: 1 }}>
                {cfg.floorName.split(" ").pop()?.toUpperCase()}
              </div>
            </div>
          ))}
        </div>

        {/* Save slots or guest play button */}
        {!isGuest ? (
          <div style={{ width: "100%" }}>
            <div style={{ fontSize: 9, letterSpacing: 5, color: "rgba(0,255,65,0.35)", marginBottom: 14, textAlign: "center" }}>
              ── SELECT ASSIGNMENT FILE ──
            </div>
            {savesLoading ? (
              <div style={{ textAlign: "center", fontSize: 11, letterSpacing: 4, color: "rgba(0,255,65,0.35)", padding: "24px 0", animation: "ls-blink 1.2s step-end infinite" }}>
                LOADING SAVES_
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
                {[1,2,3,4,5].map((slot) => (
                  <SaveSlotCard
                    key={slot}
                    slotNum={slot}
                    save={saves[slot]}
                    onPlay={() => handleSlotPlay(slot)}
                    onDelete={saves[slot] ? () => deleteMutation.mutate(slot) : undefined}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <GuestMenu startGame={startGame} />
        )}

        <div style={{ marginTop: 28, fontSize: 10, color: "rgba(0,255,65,0.2)", letterSpacing: 2, textAlign: "center", lineHeight: 2 }}>
          WASD — MOVE &nbsp;·&nbsp; SHIFT — SPRINT &nbsp;·&nbsp; SPACE — JUMP &nbsp;·&nbsp; F — FLASHLIGHT &nbsp;·&nbsp; E — EXTRACT
        </div>
      </div>

      {/* Bottom disclaimer */}
      <div style={{ position: "absolute", bottom: 14, fontSize: 9, color: "rgba(0,255,65,0.12)", letterSpacing: 2, zIndex: 11 }}>
        THE COMPANY IS NOT RESPONSIBLE FOR EMPLOYEE DEATHS, DISMEMBERMENT, OR EMOTIONAL TRAUMA
      </div>
    </div>
  );
}
