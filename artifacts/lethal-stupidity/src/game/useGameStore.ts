import { create } from "zustand";
import * as THREE from "three";
import {
  GameState,
  INITIAL_GAME_STATE,
  Monster,
  ScrapItem,
  MazeLayout,
  MONSTER_TEMPLATES,
  SCRAP_ITEMS,
  LEVEL_CONFIGS,
} from "./types";
import { canMoveThrough, generateMazeLayout } from "./mazeGenerator";

function randomPosition(range: number, y = 0): THREE.Vector3 {
  return new THREE.Vector3(
    (Math.random() - 0.5) * range,
    y,
    (Math.random() - 0.5) * range
  );
}

function pickSpawn(spawns: THREE.Vector3[], index: number, fallbackRange: number, y = 0) {
  const spawn = spawns[index % Math.max(1, spawns.length)];
  if (spawn) return spawn.clone().setY(y);
  return randomPosition(fallbackRange, y);
}

function generateMonsters(level: number, mazeLayout: MazeLayout): Monster[] {
  const config = LEVEL_CONFIGS[Math.min(level - 1, LEVEL_CONFIGS.length - 1)];
  const count = config.monsterCount;
  if (count === 0) return [];

  const monsters: Monster[] = [];
  const shuffled = [...MONSTER_TEMPLATES].sort(() => Math.random() - 0.5);

  for (let i = 0; i < count; i++) {
    const template = shuffled[i % shuffled.length];
    const scale = template.scale;
    monsters.push({
      id: `monster-${i}`,
      name: template.name,
      position: pickSpawn(mazeLayout.monsterSpawns, i, 60, scale[1] / 2),
      speed: template.speed * (1 + (level - 1) * 0.1),
      hearingRange: template.hearingRange * (1 + (level - 1) * 0.05),
      chaseSpeed: template.chaseSpeed * (1 + (level - 1) * 0.1),
      state: "patrolling",
      alertLevel: 0,
      color: template.color,
      scale,
      patrolTarget: pickSpawn(mazeLayout.patrolPoints, i + 3, 60, scale[1] / 2),
      patrolTimer: 0,
      deathMessage: template.deathMessage,
      modelChar: template.modelChar,
    });
  }
  return monsters;
}

function generateScrap(level: number, mazeLayout: MazeLayout): ScrapItem[] {
  const config = LEVEL_CONFIGS[Math.min(level - 1, LEVEL_CONFIGS.length - 1)];
  const needed = config.scrapQuota;
  const avgValue = 22;
  const baseCount = Math.ceil(needed / avgValue) + 5 + Math.floor(Math.random() * 6);
  const count = Math.min(baseCount, 30);
  const items: ScrapItem[] = [];
  for (let i = 0; i < count; i++) {
    const template = SCRAP_ITEMS[Math.floor(Math.random() * SCRAP_ITEMS.length)];
    items.push({
      id: `scrap-${i}`,
      name: template.name,
      value: template.value,
      position: pickSpawn(mazeLayout.scrapSpawns, i, 55, 0.3),
      collected: false,
    });
  }
  return items;
}

interface GameStore extends GameState {
  monsters: Monster[];
  scrapItems: ScrapItem[];
  playerPosition: THREE.Vector3;
  enterElevator: (level: number, isRespawn?: boolean) => void;
  startLevel: () => void;
  nextLevel: () => void;
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
  mazeLayout: null,

  enterElevator: (level: number, isRespawn = false) => {
    const config = LEVEL_CONFIGS[Math.min(level - 1, LEVEL_CONFIGS.length - 1)];
    set({
      phase: "elevator",
      currentLevel: level,
      isRespawn,
      scrapQuota: config.scrapQuota,
      timeRemaining: config.timeLimit,
      health: 100,
      scrapCollected: 0,
      micLevel: 0,
      noiseLevel: 0,
      flashlightOn: true,
      deathMessage: "",
      monsters: [],
      scrapItems: [],
      mazeLayout: null,
      playerPosition: new THREE.Vector3(0, 1.6, 0),
    });
  },

  startLevel: () => {
    const state = get();
    const level = state.currentLevel;
    const config = LEVEL_CONFIGS[Math.min(level - 1, LEVEL_CONFIGS.length - 1)];
    const mazeLayout = generateMazeLayout(level);
    set({
      phase: "playing",
      health: 100,
      scrapCollected: 0,
      scrapQuota: config.scrapQuota,
      timeRemaining: config.timeLimit,
      micLevel: 0,
      noiseLevel: 0,
      flashlightOn: true,
      deathMessage: "",
      mazeLayout,
      monsters: generateMonsters(level, mazeLayout),
      scrapItems: generateScrap(level, mazeLayout),
      playerPosition: mazeLayout.elevatorPosition.clone(),
    });
  },

  nextLevel: () => {
    const state = get();
    const nextLvl = state.currentLevel + 1;
    get().enterElevator(nextLvl, false);
  },

  startGame: () => {
    get().enterElevator(1, false);
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
    const mazeLayout = state.mazeLayout;
    const patrolPoints = state.mazeLayout?.patrolPoints ?? [];

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
        const desired = m.position.clone().add(dir.multiplyScalar(m.chaseSpeed * delta));
        if (!mazeLayout || canMoveThrough(mazeLayout, m.position, desired)) {
          m.position.copy(desired);
        }
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
        const desired = m.position.clone().add(dir.multiplyScalar(m.speed * 0.5 * delta));
        if (!mazeLayout || canMoveThrough(mazeLayout, m.position, desired)) {
          m.position.copy(desired);
        }
        m.position.y = m.scale[1] / 2;
      } else {
        m.patrolTimer -= delta;
        if (
          m.patrolTimer <= 0 ||
          !m.patrolTarget ||
          m.position.distanceTo(m.patrolTarget) < 2
        ) {
          m.patrolTarget = pickSpawn(
            patrolPoints,
            Math.floor(Math.random() * Math.max(1, patrolPoints.length)),
            60,
            m.scale[1] / 2,
          );
          m.patrolTimer = 3 + Math.random() * 5;
        }
        if (m.patrolTarget) {
          const dir = new THREE.Vector3()
            .subVectors(m.patrolTarget, m.position)
            .normalize();
          dir.y = 0;
          const desired = m.position.clone().add(dir.multiplyScalar(m.speed * delta));
          if (!mazeLayout || canMoveThrough(mazeLayout, m.position, desired)) {
            m.position.copy(desired);
          } else {
            m.patrolTimer = 0;
          }
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
    const extractionPosition = state.mazeLayout?.extractionPosition ?? new THREE.Vector3();
    const nearExtract = state.playerPosition.distanceTo(extractionPosition) < 4.5;
    if (nearExtract && state.scrapCollected >= state.scrapQuota) {
      set({ phase: "extracted" });
    }
  },

  returnToMenu: () => {
    set({ ...INITIAL_GAME_STATE, monsters: [], scrapItems: [], mazeLayout: null, playerPosition: new THREE.Vector3(0, 1.6, 0) });
  },
}));
