import { useState, useEffect } from "react";
import { useLocation } from "wouter";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

interface AuthScreenProps {
  onGuest: () => void;
}

function GlitchTitle() {
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    const loop = () => {
      const delay = 3000 + Math.random() * 5000;
      setTimeout(() => {
        setGlitch(true);
        setTimeout(() => setGlitch(false), 120 + Math.random() * 80);
        loop();
      }, delay);
    };
    loop();
  }, []);

  return (
    <div style={{ textAlign: "center", marginBottom: 12, userSelect: "none" }}>
      <div style={{
        fontFamily: "'Orbitron', monospace",
        fontSize: "clamp(48px, 8vw, 80px)",
        fontWeight: 900,
        color: "#00ff41",
        letterSpacing: "0.12em",
        textShadow: glitch
          ? "3px 0 #ff0040, -3px 0 #00aaff, 0 0 30px #00ff41"
          : "0 0 20px rgba(0,255,65,0.6), 0 0 60px rgba(0,255,65,0.2)",
        transform: glitch ? `translate(${(Math.random()-0.5)*6}px, 0)` : "none",
        transition: glitch ? "none" : "text-shadow 0.3s",
        lineHeight: 1.1,
      }}>
        LETHAL
      </div>
      <div style={{
        fontFamily: "'Orbitron', monospace",
        fontSize: "clamp(32px, 5vw, 52px)",
        fontWeight: 900,
        color: "#ff2244",
        letterSpacing: "0.22em",
        textShadow: glitch
          ? "3px 0 #00ff41, -3px 0 #ff0040, 0 0 30px #ff2244"
          : "0 0 18px rgba(255,34,68,0.7), 0 0 50px rgba(255,34,68,0.2)",
        transform: glitch ? `translate(${(Math.random()-0.5)*4}px, 0)` : "none",
        lineHeight: 1.2,
        marginTop: 4,
      }}>
        STUPIDITY
      </div>
    </div>
  );
}

function TerminalCard({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      border: "1px solid rgba(0,255,65,0.25)",
      borderRadius: 6,
      background: "rgba(0,10,0,0.7)",
      backdropFilter: "blur(4px)",
      padding: "28px 32px",
      position: "relative",
      ...style,
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, rgba(0,255,65,0.5), transparent)" }} />
      {children}
    </div>
  );
}

function AuthButton({
  onClick,
  primary = false,
  danger = false,
  children,
  style = {},
}: {
  onClick: () => void;
  primary?: boolean;
  danger?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const [hovered, setHovered] = useState(false);
  const color = danger ? "#ff2244" : primary ? "#00ff41" : "#558855";
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: 13,
        letterSpacing: 3,
        padding: "12px 28px",
        background: hovered ? `rgba(${danger ? "255,34,68" : "0,255,65"},0.12)` : "transparent",
        border: `1px solid ${hovered ? color : (primary ? "rgba(0,255,65,0.4)" : "rgba(85,136,85,0.35)")}`,
        color: hovered ? color : (primary ? "#00cc35" : color),
        cursor: "pointer",
        borderRadius: 4,
        textShadow: hovered ? `0 0 10px ${color}` : "none",
        boxShadow: hovered ? `0 0 16px rgba(${danger ? "255,34,68" : "0,255,65"},0.15), inset 0 0 12px rgba(${danger ? "255,34,68" : "0,255,65"},0.05)` : "none",
        transition: "all 0.15s ease",
        width: "100%",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function AuthScreen({ onGuest }: AuthScreenProps) {
  const [, setLocation] = useLocation();

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "radial-gradient(ellipse at 50% -10%, #0a1a0a 0%, #040404 55%, #000 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "'Share Tech Mono', monospace",
      color: "#00ff41",
      overflow: "hidden",
    }}>
      {/* Scanlines */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.15) 2px,rgba(0,0,0,0.15) 4px)", pointerEvents: "none", zIndex: 10 }} />
      {/* Vignette */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)", pointerEvents: "none", zIndex: 9 }} />

      {/* Corner brackets */}
      {[["0,0","top,left"],["0,auto","top,right"],["auto,0","bottom,left"],["auto,auto","bottom,right"]].map(([pos, label], i) => {
        const [t,l] = pos.split(",");
        const [side1,side2] = label.split(",");
        return (
          <div key={i} style={{ position: "absolute", [side1]: 20, [side2]: 20, width: 24, height: 24, borderTop: side1==="top" ? "1px solid rgba(0,255,65,0.3)" : "none", borderBottom: side1==="bottom" ? "1px solid rgba(0,255,65,0.3)" : "none", borderLeft: side2==="left" ? "1px solid rgba(0,255,65,0.3)" : "none", borderRight: side2==="right" ? "1px solid rgba(0,255,65,0.3)" : "none", zIndex: 11 }} />
        );
      })}

      <div style={{ position: "relative", zIndex: 5, display: "flex", flexDirection: "column", alignItems: "center", gap: 0, width: "100%", maxWidth: 700, padding: "0 24px" }}>
        {/* Company header */}
        <div style={{ fontSize: 10, letterSpacing: 6, color: "rgba(0,255,65,0.4)", marginBottom: 20 }}>
          ▸ THE COMPANY — EMPLOYEE ONBOARDING SYSTEM v2.4.1 ◂
        </div>

        <GlitchTitle />

        {/* Tagline */}
        <div style={{ fontSize: 12, color: "#ff2244", letterSpacing: 4, marginBottom: 6, marginTop: 8, textShadow: "0 0 10px rgba(255,34,68,0.4)" }}>
          THE MONSTERS CAN HEAR YOU
        </div>
        <div style={{ fontSize: 10, color: "rgba(0,255,65,0.3)", letterSpacing: 3, marginBottom: 40 }}>
          EMPLOYEE MORTALITY RATE: 94.7% &nbsp;|&nbsp; QUOTA COMPLIANCE: MANDATORY
        </div>

        {/* Auth options */}
        <TerminalCard style={{ width: "100%" }}>
          <div style={{ fontSize: 10, letterSpacing: 4, color: "rgba(0,255,65,0.45)", marginBottom: 20, textAlign: "center" }}>
            ── EMPLOYEE CLASSIFICATION REQUIRED ──
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: 9, letterSpacing: 3, color: "rgba(0,255,65,0.4)", marginBottom: 4 }}>RETURNING EMPLOYEE</div>
              <AuthButton primary onClick={() => setLocation("/sign-in")}>
                ▸ SIGN IN
              </AuthButton>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: 9, letterSpacing: 3, color: "rgba(0,255,65,0.4)", marginBottom: 4 }}>NEW HIRE</div>
              <AuthButton onClick={() => setLocation("/sign-up")}>
                ▸ CREATE ACCOUNT
              </AuthButton>
            </div>
          </div>

          <div style={{ borderTop: "1px solid rgba(0,255,65,0.1)", paddingTop: 16, textAlign: "center" }}>
            <div style={{ fontSize: 9, color: "rgba(255,34,68,0.5)", letterSpacing: 3, marginBottom: 10 }}>
              ⚠ UNREGISTERED ACCESS — NO PROGRESS SAVED
            </div>
            <AuthButton danger onClick={onGuest} style={{ maxWidth: 300, margin: "0 auto" }}>
              CONTINUE AS TEMP WORKER
            </AuthButton>
          </div>
        </TerminalCard>

        <div style={{ marginTop: 20, fontSize: 9, color: "rgba(0,255,65,0.18)", letterSpacing: 2, textAlign: "center", lineHeight: 1.8 }}>
          THE COMPANY IS NOT RESPONSIBLE FOR EMPLOYEE DEATHS, DISMEMBERMENT, OR EMOTIONAL TRAUMA<br />
          SIGN UP WITH ONE EMAIL ADDRESS. DUPLICATE ACCOUNTS WILL BE TERMINATED (AND SO WILL YOU).
        </div>
      </div>
    </div>
  );
}
