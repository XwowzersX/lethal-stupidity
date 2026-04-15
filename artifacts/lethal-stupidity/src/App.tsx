import { MenuScreen } from "./game/MenuScreen";
import { ElevatorScene } from "./game/ElevatorScene";
import { GameScene } from "./game/GameScene";
import { DeathScreen } from "./game/DeathScreen";
import { ExtractScreen } from "./game/ExtractScreen";

function App() {
  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", background: "#000" }}>
      <MenuScreen />
      <ElevatorScene />
      <GameScene />
      <DeathScreen />
      <ExtractScreen />
    </div>
  );
}

export default App;
