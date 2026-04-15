import { lazy, Suspense } from "react";
import { MenuScreen } from "./game/MenuScreen";
import { ElevatorScene } from "./game/ElevatorScene";
import { DeathScreen } from "./game/DeathScreen";
import { ExtractScreen } from "./game/ExtractScreen";
import { useGameStore } from "./game/useGameStore";

const GameScene = lazy(() =>
  import("./game/GameScene").then((module) => ({ default: module.GameScene })),
);

function App() {
  const phase = useGameStore((s) => s.phase);

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", background: "#000" }}>
      {phase === "menu" && <MenuScreen />}
      {phase === "elevator" && <ElevatorScene />}
      {phase === "playing" && (
        <Suspense fallback={<div style={{ color: "#00ff00", fontFamily: "'Courier New', monospace", padding: 24 }}>Loading facility...</div>}>
          <GameScene />
        </Suspense>
      )}
      {phase === "dead" && <DeathScreen />}
      {phase === "extracted" && <ExtractScreen />}
    </div>
  );
}

export default App;
