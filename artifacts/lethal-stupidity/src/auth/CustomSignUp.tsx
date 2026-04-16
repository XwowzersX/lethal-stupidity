import { useState } from "react";
import { useSignUp } from "@clerk/react";
import { useLocation } from "wouter";

type Step = "identity" | "verify" | "password";

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  fontFamily: "'Share Tech Mono', monospace",
  fontSize: 13,
  letterSpacing: 1.5,
  background: "rgba(0,0,0,0.55)",
  border: "1px solid rgba(0,255,65,0.28)",
  borderRadius: 4,
  color: "#00ff41",
  outline: "none",
  padding: "12px 13px",
};

function fieldLabel(label: string) {
  return (
    <div style={{ fontSize: 9, letterSpacing: 3, color: "rgba(0,255,65,0.48)", marginBottom: 7 }}>
      {label}
    </div>
  );
}

function formatError(error: unknown) {
  if (!error) return "";
  if (typeof error === "string") return error;
  if (typeof error === "object" && "message" in error && typeof error.message === "string") return error.message;
  if (typeof error === "object" && "errors" in error && Array.isArray(error.errors) && error.errors[0]?.message) {
    return error.errors[0].message;
  }
  return "The Company rejected this request. Check the fields and try again.";
}

function TerminalButton({
  children,
  disabled,
  onClick,
  danger = false,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
  danger?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const color = danger ? "#ff2244" : "#00ff41";
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%",
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: 12,
        letterSpacing: 3,
        padding: "12px 18px",
        background: hovered && !disabled ? `rgba(${danger ? "255,34,68" : "0,255,65"},0.12)` : "transparent",
        border: `1px solid ${disabled ? "rgba(0,255,65,0.12)" : hovered ? color : "rgba(0,255,65,0.38)"}`,
        color: disabled ? "rgba(0,255,65,0.22)" : color,
        cursor: disabled ? "not-allowed" : "pointer",
        borderRadius: 4,
        textShadow: hovered && !disabled ? `0 0 10px ${color}` : "none",
        transition: "all 0.15s ease",
      }}
    >
      {children}
    </button>
  );
}

export function CustomSignUp() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<Step>("identity");
  const [emailAddress, setEmailAddress] = useState("");
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState("");

  const busy = fetchStatus === "fetching";
  const errorMessage = localError || errors?.global?.message || "";

  const submitIdentity = async () => {
    setLocalError("");
    const cleanEmail = emailAddress.trim();
    const cleanUsername = username.trim();
    if (!cleanEmail || !cleanUsername) {
      setLocalError("Email address and username are both required.");
      return;
    }

    try {
      const result = await signUp.create({
        emailAddress: cleanEmail,
        unsafeMetadata: { workerUsername: cleanUsername },
      });
      if (result.error) {
        setLocalError(formatError(result.error));
        return;
      }

      const verification = await signUp.verifications.sendEmailCode();
      if (verification.error) {
        setLocalError(formatError(verification.error));
        return;
      }
      setStep("verify");
    } catch (error) {
      setLocalError(formatError(error));
    }
  };

  const submitCode = async () => {
    setLocalError("");
    if (!code.trim()) {
      setLocalError("Enter the verification code from your email.");
      return;
    }

    try {
      const result = await signUp.verifications.verifyEmailCode({ code: code.trim() });
      if (result.error) {
        setLocalError(formatError(result.error));
        return;
      }
      setStep("password");
    } catch (error) {
      setLocalError(formatError(error));
    }
  };

  const submitPassword = async () => {
    setLocalError("");
    if (password.length < 8) {
      setLocalError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    try {
      const result = await signUp.update({
        password,
        unsafeMetadata: { workerUsername: username.trim() },
      });
      if (result.error) {
        setLocalError(formatError(result.error));
        return;
      }

      if (signUp.status === "complete") {
        const finalized = await signUp.finalize({
          navigate: ({ session, decorateUrl }) => {
            const destination = decorateUrl(session?.currentTask ? "/" : "/");
            if (destination.startsWith("http")) {
              window.location.href = destination;
            } else {
              setLocation(destination);
            }
          },
        });
        if (finalized.error) setLocalError(formatError(finalized.error));
      } else {
        setLocalError("Account is not complete yet. Confirm your email and password fields.");
      }
    } catch (error) {
      setLocalError(formatError(error));
    }
  };

  const resendCode = async () => {
    setLocalError("");
    try {
      const result = await signUp.verifications.sendEmailCode();
      if (result.error) setLocalError(formatError(result.error));
    } catch (error) {
      setLocalError(formatError(error));
    }
  };

  return (
    <div
      style={{
        width: "min(420px, calc(100vw - 48px))",
        border: "1px solid rgba(0,255,65,0.25)",
        borderRadius: 6,
        background: "rgba(0,10,0,0.72)",
        padding: "28px 30px",
        boxShadow: "0 0 50px rgba(0,255,65,0.06), inset 0 0 18px rgba(0,255,65,0.03)",
        position: "relative",
      }}
    >
      <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
        {(["identity", "verify", "password"] as const).map((item, index) => (
          <div
            key={item}
            style={{
              flex: 1,
              height: 3,
              background: index <= ["identity", "verify", "password"].indexOf(step) ? "#00ff41" : "rgba(0,255,65,0.15)",
              boxShadow: item === step ? "0 0 10px #00ff41" : "none",
            }}
          />
        ))}
      </div>

      <div style={{ fontSize: 10, color: "rgba(0,255,65,0.45)", letterSpacing: 3, marginBottom: 18, textAlign: "center" }}>
        {step === "identity" && "STEP 01 — IDENTIFY NEW EMPLOYEE"}
        {step === "verify" && "STEP 02 — VERIFY EMAIL ADDRESS"}
        {step === "password" && "STEP 03 — CREATE ACCESS PASSWORD"}
      </div>

      {step === "identity" && (
        <form onSubmit={(e) => { e.preventDefault(); submitIdentity(); }} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          <label>
            {fieldLabel("EMAIL ADDRESS")}
            <input
              style={inputStyle}
              type="email"
              autoComplete="email"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              placeholder="employee@company.net"
            />
          </label>
          <label>
            {fieldLabel("USERNAME")}
            <input
              style={inputStyle}
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="quota-goblin"
            />
          </label>
          <TerminalButton disabled={busy} onClick={submitIdentity}>SEND VERIFICATION CODE</TerminalButton>
        </form>
      )}

      {step === "verify" && (
        <form onSubmit={(e) => { e.preventDefault(); submitCode(); }} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          <div style={{ fontSize: 10, color: "rgba(0,255,65,0.42)", letterSpacing: 2, lineHeight: 1.7 }}>
            A code was dispatched to {emailAddress}. Enter it before the onboarding terminal becomes suspicious.
          </div>
          <label>
            {fieldLabel("EMAIL CODE")}
            <input
              style={{ ...inputStyle, letterSpacing: 5, textAlign: "center" }}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="000000"
            />
          </label>
          <TerminalButton disabled={busy} onClick={submitCode}>CONFIRM EMAIL</TerminalButton>
          <TerminalButton disabled={busy} onClick={resendCode}>RESEND CODE</TerminalButton>
        </form>
      )}

      {step === "password" && (
        <form onSubmit={(e) => { e.preventDefault(); submitPassword(); }} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          <label>
            {fieldLabel("PASSWORD")}
            <input
              style={inputStyle}
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="minimum 8 characters"
            />
          </label>
          <label>
            {fieldLabel("CONFIRM PASSWORD")}
            <input
              style={inputStyle}
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="type it again"
            />
          </label>
          <TerminalButton disabled={busy} onClick={submitPassword}>FINALIZE ACCOUNT</TerminalButton>
        </form>
      )}

      {errorMessage && (
        <div style={{ marginTop: 16, border: "1px solid rgba(255,34,68,0.28)", borderRadius: 4, padding: "10px 12px", color: "#ff5570", fontSize: 10, letterSpacing: 1.5, lineHeight: 1.5 }}>
          {errorMessage}
        </div>
      )}

      <button
        type="button"
        onClick={() => setLocation("/sign-in")}
        style={{
          marginTop: 18,
          width: "100%",
          background: "transparent",
          border: "none",
          color: "rgba(0,255,65,0.42)",
          cursor: "pointer",
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: 10,
          letterSpacing: 2,
        }}
      >
        ALREADY EMPLOYED? SIGN IN
      </button>
      <div id="clerk-captcha" />
    </div>
  );
}