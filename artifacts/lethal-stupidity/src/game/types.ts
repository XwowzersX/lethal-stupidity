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
  modelChar: string;
}

export interface ScrapItem {
  id: string;
  name: string;
  value: number;
  position: THREE.Vector3;
  collected: boolean;
}

export type MazeDirection = "north" | "east" | "south" | "west";

export interface MazeCell {
  id: string;
  gridX: number;
  gridZ: number;
  worldX: number;
  worldZ: number;
  open: Record<MazeDirection, boolean>;
  crawl: Record<MazeDirection, boolean>;
  templateId: number;
  templateName: string;
  story: "office" | "storage" | "maintenance" | "medical" | "industrial" | "security" | "deep";
  hazard: "clear" | "clutter" | "pipes" | "blood" | "dark" | "alarm";
}

export interface MazeLayout {
  seed: number;
  level: number;
  width: number;
  height: number;
  cellSize: number;
  cells: MazeCell[];
  elevatorPosition: THREE.Vector3;
  extractionPosition: THREE.Vector3;
  scrapSpawns: THREE.Vector3[];
  monsterSpawns: THREE.Vector3[];
  patrolPoints: THREE.Vector3[];
}

export interface LevelConfig {
  level: number;
  floorName: string;
  monsterCount: number;
  scrapQuota: number;
  timeLimit: number;
  tutorialLines: string[];
  respawnLines: string[];
}

export const LEVEL_CONFIGS: LevelConfig[] = [
  {
    level: 1,
    floorName: "B1 — THE LOBBY",
    monsterCount: 0,
    scrapQuota: 80,
    timeLimit: 300,
    tutorialLines: [
      "Initializing employee orientation protocol...",
      "Welcome, new employee. I am ARIA.",
      "Automated Retention & Incentivization Assistant.",
      "Your mission: collect scrap and reach the extraction zone.",
      "WASD to move. Mouse to look. SHIFT to sprint.",
      "Press F to toggle your flashlight. Press E at the green zone to extract.",
      "Floor B1 is designated a 'safe' zone. No active hazards.",
      "...the definition of 'safe' is subject to periodic revision.",
      "Quota: $80. Time limit: 5 minutes.",
      "Doors opening. Don't die. The paperwork is horrendous.",
    ],
    respawnLines: [
      "Re-initializing employee unit...",
      "The Company has logged your death as 'employee error'.",
      "Returning you to B1 — THE LOBBY.",
      "Quota: $80. Please try harder this time.",
    ],
  },
  {
    level: 2,
    floorName: "B2 — STORAGE",
    monsterCount: 2,
    scrapQuota: 200,
    timeLimit: 270,
    tutorialLines: [
      "Descending to B2 — STORAGE...",
      "Hazard advisory: 2 residents detected on this floor.",
      "Residents are sensitive to noise. Keep quiet.",
      "Quota: $200. Time limit: 4 minutes 30 seconds.",
      "The Company believes in you.",
      "...statistically speaking, one of you will survive.",
    ],
    respawnLines: [
      "Recovering remains...",
      "Returning to B2 — STORAGE. Again.",
      "The residents are confused by your persistence. And so are we.",
      "Quota: $200. You can do this. Probably.",
    ],
  },
  {
    level: 3,
    floorName: "B3 — MAINTENANCE",
    monsterCount: 4,
    scrapQuota: 350,
    timeLimit: 240,
    tutorialLines: [
      "Descending to B3 — MAINTENANCE...",
      "4 residents detected. They are in a bad mood.",
      "They are always in a bad mood.",
      "Quota: $350. Time limit: 4 minutes.",
      "Flashlight conservation advised. The residents notice lights.",
      "Good luck. You will need it.",
    ],
    respawnLines: [
      "Scraping you off the floor...",
      "B3 — MAINTENANCE. Try number: unknown. The counter broke.",
      "4 residents. $350 quota. You know the drill.",
      "...please stop dying. ARIA is getting emotionally affected.",
    ],
  },
  {
    level: 4,
    floorName: "B4 — THE DEEP",
    monsterCount: 6,
    scrapQuota: 500,
    timeLimit: 200,
    tutorialLines: [
      "Descending to B4 — THE DEEP...",
      "This floor was condemned in 2019.",
      "6 residents. They have been here a long time.",
      "They are not happy.",
      "Quota: $500. Time limit: 3 minutes 20 seconds.",
      "ARIA recommends staying very, very quiet.",
    ],
    respawnLines: [
      "Re-materializing employee...",
      "Back to B4 — THE DEEP. Impressive commitment to failure.",
      "$500 quota. 6 residents. You know this already.",
      "ARIA is rooting for you. Out of pity.",
    ],
  },
  {
    level: 5,
    floorName: "B5 — ???",
    monsterCount: 8,
    scrapQuota: 750,
    timeLimit: 180,
    tutorialLines: [
      "Descending to B5...",
      "ARIA cannot verify what is on this floor.",
      "Sensors indicate: 8 readings. Or possibly one very large one.",
      "Quota: $750. Time limit: 3 minutes.",
      "The Company appreciates your sacrifice.",
      "...that was not a slip. Definitely not.",
      "Doors opening.",
    ],
    respawnLines: [
      "Reassembling you...",
      "B5 — ???. You keep coming back.",
      "8 residents. $750 quota. ARIA admires your stubbornness.",
      "Or your stupidity. Probably the latter.",
    ],
  },
  {
    level: 6,
    floorName: "B6 — THE END",
    monsterCount: 10,
    scrapQuota: 1000,
    timeLimit: 150,
    tutorialLines: [
      "Descending to B6...",
      "...",
      "ARIA has no data on this floor.",
      "No employee has returned from B6.",
      "10 residents detected. Or 10 signals. Or 10 things.",
      "Quota: $1000. Time limit: 2 minutes 30 seconds.",
      "If you make it back, you win.",
      "The Company will give you a raise.",
      "...a posthumous raise.",
      "Doors opening.",
    ],
    respawnLines: [
      "...",
      "You died on B6. Somehow you came back.",
      "ARIA is filing a report about this.",
      "$1000 quota. Good luck. You supernatural freak.",
    ],
  },
];

export interface GameState {
  phase: "menu" | "elevator" | "playing" | "dead" | "extracted";
  health: number;
  scrapCollected: number;
  scrapQuota: number;
  timeRemaining: number;
  micLevel: number;
  movementNoise: number;
  noiseLevel: number;
  flashlightOn: boolean;
  deathMessage: string;
  totalScrapValue: number;
  currentLevel: number;
  isRespawn: boolean;
  mazeLayout: MazeLayout | null;
}

export const INITIAL_GAME_STATE: GameState = {
  phase: "menu",
  health: 100,
  scrapCollected: 0,
  scrapQuota: 80,
  timeRemaining: 300,
  micLevel: 0,
  movementNoise: 0,
  noiseLevel: 0,
  flashlightOn: true,
  deathMessage: "",
  totalScrapValue: 0,
  currentLevel: 1,
  isRespawn: false,
  mazeLayout: null,
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
    modelChar: "a",
  },
  {
    name: "The Wobbler",
    speed: 0.8,
    hearingRange: 25,
    chaseSpeed: 6,
    color: "#66ff33",
    scale: [2, 1, 2] as [number, number, number],
    deathMessage: "The Wobbler wobbled you to death. How embarrassing.",
    modelChar: "b",
  },
  {
    name: "Sir Trips-a-Lot",
    speed: 3,
    hearingRange: 10,
    chaseSpeed: 2.5,
    color: "#3366ff",
    scale: [0.8, 3, 0.8] as [number, number, number],
    deathMessage: "Sir Trips-a-Lot tripped over you. You were crushed.",
    modelChar: "c",
  },
  {
    name: "Greg",
    speed: 2,
    hearingRange: 20,
    chaseSpeed: 5,
    color: "#ff9933",
    scale: [1.5, 1.5, 1.5] as [number, number, number],
    deathMessage: "Greg got you. Just Greg. Nothing special about Greg.",
    modelChar: "d",
  },
  {
    name: "The Honker",
    speed: 1,
    hearingRange: 30,
    chaseSpeed: 7,
    color: "#cc33ff",
    scale: [1, 1.8, 1.3] as [number, number, number],
    deathMessage: "The Honker honked so hard your soul left your body.",
    modelChar: "e",
  },
  {
    name: "Dave",
    speed: 2.5,
    hearingRange: 18,
    chaseSpeed: 4.5,
    color: "#ff6600",
    scale: [1.3, 1.8, 1.3] as [number, number, number],
    deathMessage: "Dave didn't even say sorry.",
    modelChar: "f",
  },
  {
    name: "Big Berta",
    speed: 1,
    hearingRange: 35,
    chaseSpeed: 5.5,
    color: "#ff00aa",
    scale: [2, 2, 2] as [number, number, number],
    deathMessage: "Big Berta sat on you. Completely avoidable.",
    modelChar: "g",
  },
  {
    name: "The Intern",
    speed: 4,
    hearingRange: 8,
    chaseSpeed: 3,
    color: "#00ffff",
    scale: [0.9, 1.7, 0.9] as [number, number, number],
    deathMessage: "Even the intern got you. This is rock bottom.",
    modelChar: "h",
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
