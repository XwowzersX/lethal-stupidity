import { create } from "zustand";
import * as THREE from "three";
import {
  GameState,
  INITIAL_GAME_STATE,
  Monster,
  ScrapItem,
  MONSTER_TEMPLATES,
  SCRAP_ITEMS,
} from "./types";

function randomPosition(range: number, y = 0): THREE.Vector3 {
  return new THREE.Vector3(
    (Math.random() - 0.5) * range,
    y,
    (Math.random() - 0.5) * range
  );
}

function generateMonsters(): Monster[] {
  const monsters: Monster[] = [];
  const shuffled = [...MONSTER_TEMPLATES].sort(() => Math.random() - 0.5);
  const count = 3 + Math.floor(Math.random() * 3);
  for (let i = 0; i < count; i++) {
    const template = shuffled[i % shuffled.length];
    monsters.push({
      id: `monster-${i}`,
      name: template.name,
      position: randomPosition(60, template.scale[1] / 2),
      speed: template.speed,
      hearingRange: template.hearingRange,
      chaseSpeed: template.chaseSpeed,
      state: "patrolling",
      alertLevel: 0,
      color: template.color,
      scale: template.scale,
      patrolTarget: randomPosition(60, template.scale[1] / 2),
      patrolTimer: 0,
      deathMessage: template.deathMessage,
    });
  }
  return monsters;
}

function generateScrap(): ScrapItem[] {
  const items: ScrapItem[] = [];
  const count = 15 + Math.floor(Math.random() * 10);
  for (let i = 0; i < count; i++) {
    const template = SCRAP_ITEMS[Math.floor(Math.random() * SCRAP_ITEMS.length)];
    items.push({
      id: `scrap-${i}`,
      name: template.name,
      value: template.value,
      position: randomPosition(55, 0.3),
      collected: false,
    });
  }
  return items;
}

interface GameStore extends GameState {
  monsters: Monster[];
  scrapItems: ScrapItem[];
  playerPosition: THREE.Vector3;
  startGame: () => void;
  updateMicLevel: (level: number) => void;
  collectScrap: (id: string) => void;
  takeDamage: (amount: number, deathMsg: string) => void;
  toggleFlashlight: () => void;
  updatePlayerPosition: (pos: THREE.Vector3) => void;
  updateMonsters: (delta: number) => void;
  updateTimer: (delta: number) => void;
  extract: () => void;
  returnToMenu: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...INITIAL_GAME_STATE,
  monsters: [],
  scrapItems: [],
  playerPosition: new THREE.Vector3(0, 1.6, 0),

  startGame: () => {
    set({
      ...INITIAL_GAME_STATE,
      phase: "playing",
      monsters: generateMonsters(),
      scrapItems: generateScrap(),
      playerPosition: new THREE.Vector3(0, 1.6, 0),
    });
  },

  updateMicLevel: (level: number) => {
    const noiseLevel = level > 0.15 ? level : 0;
    set({ micLevel: level, noiseLevel });
  },

  collectScrap: (id: string) => {
    const state = get();
    const item = state.scrapItems.find((s) => s.id === id);
    if (!item || item.collected) return;
    set({
      scrapItems: state.scrapItems.map((s) =>
        s.id === id ? { ...s, collected: true } : s
      ),
      scrapCollected: state.scrapCollected + item.value,
      totalScrapValue: state.totalScrapValue + item.value,
    });
  },

  takeDamage: (amount: number, deathMsg: string) => {
    const state = get();
    const newHealth = state.health - amount;
    if (newHealth <= 0) {
      set({ health: 0, phase: "dead", deathMessage: deathMsg });
    } else {
      set({ health: newHealth });
    }
  },

  toggleFlashlight: () => {
    set({ flashlightOn: !get().flashlightOn });
  },

  updatePlayerPosition: (pos: THREE.Vector3) => {
    set({ playerPosition: pos });
  },

  updateMonsters: (delta: number) => {
    const state = get();
    if (state.phase !== "playing") return;

    const playerPos = state.playerPosition;
    const noise = state.noiseLevel;

    const updatedMonsters = state.monsters.map((monster) => {
      const m = { ...monster, position: monster.position.clone() };
      const dist = m.position.distanceTo(playerPos);

      if (noise > 0.2 && dist < m.hearingRange) {
        m.alertLevel = Math.min(m.alertLevel + noise * delta * 3, 1);
      } else {
        m.alertLevel = Math.max(m.alertLevel - delta * 0.3, 0);
      }

      if (m.alertLevel > 0.7) {
        m.state = "chasing";
      } else if (m.alertLevel > 0.3) {
        m.state = "alerted";
      } else {
        m.state = m.state === "chasing" ? "alerted" : "patrolling";
      }

      if (m.state === "chasing") {
        const dir = new THREE.Vector3()
          .subVectors(playerPos, m.position)
          .normalize();
        dir.y = 0;
        m.position.add(dir.multiplyScalar(m.chaseSpeed * delta));
        m.position.y = m.scale[1] / 2;

        if (dist < 2) {
          const store = get();
          if (store.phase === "playing") {
            store.takeDamage(100, m.deathMessage);
          }
        }
      } else if (m.state === "alerted") {
        const dir = new THREE.Vector3()
          .subVectors(playerPos, m.position)
          .normalize();
        dir.y = 0;
        m.position.add(dir.multiplyScalar(m.speed * 0.5 * delta));
        m.position.y = m.scale[1] / 2;
      } else {
        m.patrolTimer -= delta;
        if (
          m.patrolTimer <= 0 ||
          !m.patrolTarget ||
          m.position.distanceTo(m.patrolTarget) < 2
        ) {
          m.patrolTarget = randomPosition(60, m.scale[1] / 2);
          m.patrolTimer = 3 + Math.random() * 5;
        }
        if (m.patrolTarget) {
          const dir = new THREE.Vector3()
            .subVectors(m.patrolTarget, m.position)
            .normalize();
          dir.y = 0;
          m.position.add(dir.multiplyScalar(m.speed * delta));
          m.position.y = m.scale[1] / 2;
        }
      }

      return m;
    });

    set({ monsters: updatedMonsters });
  },

  updateTimer: (delta: number) => {
    const state = get();
    if (state.phase !== "playing") return;
    const newTime = state.timeRemaining - delta;
    if (newTime <= 0) {
      set({
        timeRemaining: 0,
        phase: "dead",
        deathMessage: "Time's up! The Company has terminated your contract... and you.",
      });
    } else {
      set({ timeRemaining: newTime });
    }
  },

  extract: () => {
    const state = get();
    if (state.scrapCollected >= state.scrapQuota) {
      set({ phase: "extracted" });
    }
  },

  returnToMenu: () => {
    set({ ...INITIAL_GAME_STATE });
  },
}));
