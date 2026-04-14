import * as THREE from "three";

export interface Monster {
  id: string;
  name: string;
  position: THREE.Vector3;
  speed: number;
  hearingRange: number;
  chaseSpeed: number;
  state: "idle" | "patrolling" | "alerted" | "chasing";
  alertLevel: number;
  color: string;
  scale: [number, number, number];
  patrolTarget: THREE.Vector3 | null;
  patrolTimer: number;
  deathMessage: string;
}

export interface ScrapItem {
  id: string;
  name: string;
  value: number;
  position: THREE.Vector3;
  collected: boolean;
}

export interface GameState {
  phase: "menu" | "playing" | "dead" | "extracted";
  health: number;
  scrapCollected: number;
  scrapQuota: number;
  timeRemaining: number;
  micLevel: number;
  noiseLevel: number;
  flashlightOn: boolean;
  deathMessage: string;
  totalScrapValue: number;
}

export const INITIAL_GAME_STATE: GameState = {
  phase: "menu",
  health: 100,
  scrapCollected: 0,
  scrapQuota: 150,
  timeRemaining: 300,
  micLevel: 0,
  noiseLevel: 0,
  flashlightOn: true,
  deathMessage: "",
  totalScrapValue: 0,
};

export const MONSTER_TEMPLATES = [
  {
    name: "Screaming Larry",
    speed: 1.5,
    hearingRange: 15,
    chaseSpeed: 4,
    color: "#ff3366",
    scale: [1.2, 2, 1.2] as [number, number, number],
    deathMessage: "Screaming Larry heard you sneeze and took it personally.",
  },
  {
    name: "The Wobbler",
    speed: 0.8,
    hearingRange: 25,
    chaseSpeed: 6,
    color: "#66ff33",
    scale: [2, 1, 2] as [number, number, number],
    deathMessage: "The Wobbler wobbled you to death. How embarrassing.",
  },
  {
    name: "Sir Trips-a-Lot",
    speed: 3,
    hearingRange: 10,
    chaseSpeed: 2.5,
    color: "#3366ff",
    scale: [0.8, 3, 0.8] as [number, number, number],
    deathMessage: "Sir Trips-a-Lot tripped over you. You were crushed.",
  },
  {
    name: "Greg",
    speed: 2,
    hearingRange: 20,
    chaseSpeed: 5,
    color: "#ff9933",
    scale: [1.5, 1.5, 1.5] as [number, number, number],
    deathMessage: "Greg got you. Just Greg. Nothing special about Greg.",
  },
  {
    name: "The Honker",
    speed: 1,
    hearingRange: 30,
    chaseSpeed: 7,
    color: "#cc33ff",
    scale: [1, 1.8, 1.3] as [number, number, number],
    deathMessage: "The Honker honked so hard your soul left your body.",
  },
];

export const SCRAP_ITEMS = [
  { name: "Rubber Duck", value: 15 },
  { name: "Old Shoe", value: 8 },
  { name: "Broken Phone", value: 25 },
  { name: "Mystery Goo", value: 30 },
  { name: "Someone's Keys", value: 12 },
  { name: "Half a Sandwich", value: 5 },
  { name: "Gold Tooth", value: 45 },
  { name: "Haunted Doll", value: 50 },
  { name: "Tax Documents", value: 35 },
  { name: "USB with 'homework'", value: 40 },
  { name: "Expired Coupon", value: 3 },
  { name: "Slightly Damp Sock", value: 7 },
];
