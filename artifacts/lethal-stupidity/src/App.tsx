import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { ClerkProvider, SignIn, SignUp, useAuth, useClerk, useUser } from "@clerk/react";
import { Switch, Route, useLocation, Router as WouterRouter } from "wouter";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { MenuScreen } from "./game/MenuScreen";
import { AuthScreen } from "./game/AuthScreen";
import { ElevatorScene } from "./game/ElevatorScene";
import { DeathScreen } from "./game/DeathScreen";
import { ExtractScreen } from "./game/ExtractScreen";
import { useGameStore } from "./game/useGameStore";

const GameScene = lazy(() =>
  import("./game/GameScene").then((m) => ({ default: m.GameScene })),
);

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string) {
  return basePath && path.startsWith(basePath) ? path.slice(basePath.length) || "/" : path;
}

function BackArrow({ to }: { to: string }) {
  const [, setLocation] = useLocation();
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={() => setLocation(to)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "absolute", top: 20, left: 24,
        fontFamily: "'Share Tech Mono', monospace", fontSize: 11, letterSpacing: 3,
        background: "transparent", border: "none",
        color: hovered ? "#00ff41" : "rgba(0,255,65,0.4)",
        cursor: "pointer", padding: "6px 10px", display: "flex", alignItems: "center", gap: 8,
        textShadow: hovered ? "0 0 10px #00ff41" : "none",
        transition: "all 0.15s",
        zIndex: 20,
      }}
    >
      ◂ BACK
    </button>
  );
}

function AuthPageWrapper({ children, subtitle }: { children: React.ReactNode; subtitle: string }) {
  return (
    <div style={{
      minHeight: "100vh", background: "radial-gradient(ellipse at 50% 0%, #061406 0%, #030303 70%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "'Share Tech Mono', monospace", position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,255,65,0.012) 2px,rgba(0,255,65,0.012) 4px)", pointerEvents: "none" }} />
      <BackArrow to="/" />
      <div style={{ marginBottom: 28, textAlign: "center" }}>
        <div style={{ fontSize: 10, color: "#00ff41", letterSpacing: 5, opacity: 0.5, marginBottom: 8 }}>THE COMPANY — EMPLOYEE PORTAL</div>
        <div style={{ fontSize: 26, fontFamily: "'Orbitron', monospace", color: "#00ff41", letterSpacing: 6, textShadow: "0 0 20px #00ff41" }}>{subtitle}</div>
      </div>
      {children}
      <div style={{ marginTop: 24, fontSize: 9, color: "#223322", letterSpacing: 2, textAlign: "center" }}>
        THE COMPANY IS NOT RESPONSIBLE FOR DATA LOSS, IDENTITY THEFT, OR EXISTENTIAL DREAD
      </div>
    </div>
  );
}

function SignInPage() {
  // To update login providers, app branding, or OAuth settings use the Auth
  // pane in the workspace toolbar. More information can be found in the Replit docs.
  return (
    <AuthPageWrapper subtitle="SIGN IN">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </AuthPageWrapper>
  );
}

function SignUpPage() {
  // To update login providers, app branding, or OAuth settings use the Auth
  // pane in the workspace toolbar. More information can be found in the Replit docs.
  return (
    <AuthPageWrapper subtitle="REGISTER">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </AuthPageWrapper>
  );
}

function ClerkQueryCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevRef = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    return addListener(({ user }) => {
      const id = user?.id ?? null;
      if (prevRef.current !== undefined && prevRef.current !== id) qc.clear();
      prevRef.current = id;
    });
  }, [addListener, qc]);
  return null;
}

function GameApp() {
  const { isSignedIn, isLoaded } = useAuth();
  const { signOut } = useClerk();
  const { user } = useUser();
  const phase = useGameStore((s) => s.phase);
  const [guestMode, setGuestMode] = useState(() => sessionStorage.getItem("ls_guest") === "1");

  useEffect(() => {
    if (isSignedIn) sessionStorage.removeItem("ls_guest");
  }, [isSignedIn]);

  if (!isLoaded) {
    return (
      <div style={{ width: "100vw", height: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Share Tech Mono', monospace", color: "#00ff41" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 10, letterSpacing: 6, marginBottom: 10, opacity: 0.5 }}>THE COMPANY</div>
          <div style={{ fontSize: 14, letterSpacing: 4, animation: "ls-blink 1.2s step-end infinite" }}>AUTHENTICATING_</div>
        </div>
      </div>
    );
  }

  if (!isSignedIn && !guestMode) {
    return <AuthScreen onGuest={() => { sessionStorage.setItem("ls_guest", "1"); setGuestMode(true); }} />;
  }

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", background: "#000" }}>
      {phase === "menu" && (
        <MenuScreen
          isGuest={!isSignedIn}
          userName={user?.firstName ?? user?.username ?? undefined}
          onBack={!isSignedIn ? () => { sessionStorage.removeItem("ls_guest"); setGuestMode(false); } : undefined}
          onSignOut={() => signOut()}
        />
      )}
      {phase === "elevator" && <ElevatorScene />}
      {phase === "playing" && (
        <Suspense fallback={<div style={{ color: "#00ff41", fontFamily: "'Share Tech Mono', monospace", padding: 24, fontSize: 12, letterSpacing: 3 }}>LOADING FACILITY...</div>}>
          <GameScene />
        </Suspense>
      )}
      {phase === "dead" && <DeathScreen />}
      {phase === "extracted" && <ExtractScreen />}
    </div>
  );
}

function GuestOnlyGameApp() {
  const phase = useGameStore((s) => s.phase);
  const [guestMode, setGuestMode] = useState(() => sessionStorage.getItem("ls_guest") === "1");

  if (!guestMode) {
    return <AuthScreen onGuest={() => { sessionStorage.setItem("ls_guest", "1"); setGuestMode(true); }} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ width: "100vw", height: "100vh", overflow: "hidden", background: "#000" }}>
        {phase === "menu" && (
          <MenuScreen
            isGuest={true}
            onBack={() => { sessionStorage.removeItem("ls_guest"); setGuestMode(false); }}
          />
        )}
        {phase === "elevator" && <ElevatorScene />}
        {phase === "playing" && (
          <Suspense fallback={<div style={{ color: "#00ff41", fontFamily: "'Share Tech Mono', monospace", padding: 24, fontSize: 12, letterSpacing: 3 }}>LOADING FACILITY...</div>}>
            <GameScene />
          </Suspense>
        )}
        {phase === "dead" && <DeathScreen />}
        {phase === "extracted" && <ExtractScreen />}
      </div>
    </QueryClientProvider>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  if (!clerkPubKey) {
    return <GuestOnlyGameApp />;
  }

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryCacheInvalidator />
        <Switch>
          <Route path="/sign-in/*?" component={SignInPage} />
          <Route path="/sign-up/*?" component={SignUpPage} />
          <Route component={GameApp} />
        </Switch>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}
