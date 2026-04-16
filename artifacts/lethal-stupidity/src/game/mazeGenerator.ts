import * as THREE from "three";
import { MazeCell, MazeDirection, MazeLayout } from "./types";

type MutableCell = Omit<MazeCell, "worldX" | "worldZ"> & {
  visited: boolean;
};

const DIRECTIONS: Array<{
  dir: MazeDirection;
  opposite: MazeDirection;
  dx: number;
  dz: number;
}> = [
  { dir: "north", opposite: "south", dx: 0, dz: -1 },
  { dir: "east", opposite: "west", dx: 1, dz: 0 },
  { dir: "south", opposite: "north", dx: 0, dz: 1 },
  { dir: "west", opposite: "east", dx: -1, dz: 0 },
];

const PLAYER_RADIUS = 0.45;
const CRAWL_PASSAGE_HALF_WIDTH = 1.35;

const SEGMENT_TEMPLATES = [
  ["Reception Desk", "office", "clutter"],
  ["Broken Cubicles", "office", "clutter"],
  ["HR Complaint Room", "office", "blood"],
  ["Payroll Closet", "office", "dark"],
  ["Storage Racks", "storage", "clutter"],
  ["Forklift Graveyard", "storage", "clutter"],
  ["Cardboard Canyon", "storage", "clear"],
  ["Wet Box Room", "storage", "blood"],
  ["Pipe Junction", "maintenance", "pipes"],
  ["Steam Leak Hall", "maintenance", "pipes"],
  ["Breaker Nook", "maintenance", "dark"],
  ["Pump Chamber", "maintenance", "alarm"],
  ["Medical Intake", "medical", "clear"],
  ["Surgery Mistake", "medical", "blood"],
  ["Specimen Corner", "medical", "dark"],
  ["Bandage Storage", "medical", "clutter"],
  ["Foundry Catwalk", "industrial", "pipes"],
  ["Generator Bay", "industrial", "alarm"],
  ["Rust Pit", "industrial", "blood"],
  ["Machine Alcove", "industrial", "clutter"],
  ["Security Checkpoint", "security", "clear"],
  ["Camera Nest", "security", "alarm"],
  ["Lockdown Office", "security", "dark"],
  ["Evidence Cage", "security", "clutter"],
  ["Deep Concrete Bend", "deep", "dark"],
  ["The Smell Room", "deep", "blood"],
  ["Wrong Turn", "deep", "clear"],
  ["Quiet Hall", "deep", "dark"],
  ["Long Hall A", "maintenance", "clear"],
  ["Long Hall B", "industrial", "pipes"],
  ["Corner Trap A", "storage", "clutter"],
  ["Corner Trap B", "medical", "blood"],
  ["Open Office", "office", "clear"],
  ["Wide Storage", "storage", "clutter"],
  ["Maintenance Loop", "maintenance", "pipes"],
  ["Industrial Loop", "industrial", "alarm"],
  ["Security Loop", "security", "clear"],
  ["Deep Loop", "deep", "dark"],
  ["Scrap Pocket", "storage", "clutter"],
  ["Employee Mistake Zone", "office", "blood"],
] as const;

function createRng(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function shuffle<T>(items: T[], rng: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function makeCell(x: number, z: number, templateId: number): MutableCell {
  const template = SEGMENT_TEMPLATES[templateId % SEGMENT_TEMPLATES.length];
  return {
    id: `${x}:${z}`,
    gridX: x,
    gridZ: z,
    open: { north: false, east: false, south: false, west: false },
    crawl: { north: false, east: false, south: false, west: false },
    templateId,
    templateName: template[0],
    story: template[1],
    hazard: template[2],
    visited: false,
  };
}

function connect(a: MutableCell, b: MutableCell, direction: MazeDirection) {
  const opposite = DIRECTIONS.find((d) => d.dir === direction)!.opposite;
  a.open[direction] = true;
  b.open[opposite] = true;
}

function connectCrawl(a: MutableCell, b: MutableCell, direction: MazeDirection) {
  const opposite = DIRECTIONS.find((d) => d.dir === direction)!.opposite;
  a.crawl[direction] = true;
  b.crawl[opposite] = true;
}

function getCell(cells: MutableCell[][], x: number, z: number) {
  return cells[z]?.[x] ?? null;
}

function cellToWorld(x: number, z: number, width: number, height: number, cellSize: number, y = 0) {
  return new THREE.Vector3(
    (x - (width - 1) / 2) * cellSize,
    y,
    (z - (height - 1) / 2) * cellSize,
  );
}

function pickInsideCell(cell: MazeCell, cellSize: number, rng: () => number, y: number) {
  const margin = cellSize * 0.24;
  return new THREE.Vector3(
    cell.worldX + (rng() - 0.5) * (cellSize - margin * 2),
    y,
    cell.worldZ + (rng() - 0.5) * (cellSize - margin * 2),
  );
}

function distance2D(a: THREE.Vector3, b: THREE.Vector3) {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

export function generateMazeLayout(level: number): MazeLayout {
  const seed = Date.now() + level * 1009 + Math.floor(Math.random() * 100000);
  const rng = createRng(seed);
  const cellSize = 10;
  const width = level === 1 ? 5 : Math.min(11, 5 + level);
  const height = level === 1 ? 5 : Math.min(11, 5 + level + (level % 2));

  const cells: MutableCell[][] = [];
  for (let z = 0; z < height; z++) {
    const row: MutableCell[] = [];
    for (let x = 0; x < width; x++) {
      row.push(makeCell(x, z, Math.floor(rng() * SEGMENT_TEMPLATES.length)));
    }
    cells.push(row);
  }

  const stack = [cells[0][0]];
  cells[0][0].visited = true;

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const neighbors = shuffle(DIRECTIONS, rng)
      .map((d) => ({ ...d, cell: getCell(cells, current.gridX + d.dx, current.gridZ + d.dz) }))
      .filter((entry) => entry.cell && !entry.cell.visited);

    if (neighbors.length === 0) {
      stack.pop();
      continue;
    }

    const next = neighbors[0];
    connect(current, next.cell!, next.dir);
    next.cell!.visited = true;
    stack.push(next.cell!);
  }

  const extraLoops = Math.floor(width * height * (0.08 + level * 0.025));
  for (let i = 0; i < extraLoops; i++) {
    const cell = cells[Math.floor(rng() * height)][Math.floor(rng() * width)];
    const options = shuffle(DIRECTIONS, rng)
      .map((d) => ({ ...d, cell: getCell(cells, cell.gridX + d.dx, cell.gridZ + d.dz) }))
      .filter((entry) => entry.cell && !cell.open[entry.dir]);
    if (options[0]) connect(cell, options[0].cell!, options[0].dir);
  }

  const openRoomCount = Math.min(2 + level, Math.floor((width * height) / 10));
  for (let i = 0; i < openRoomCount; i++) {
    const x = 1 + Math.floor(rng() * Math.max(1, width - 2));
    const z = 1 + Math.floor(rng() * Math.max(1, height - 2));
    for (const direction of DIRECTIONS) {
      const neighbor = getCell(cells, x + direction.dx, z + direction.dz);
      if (neighbor && rng() > 0.35) connect(cells[z][x], neighbor, direction.dir);
    }
  }

  const crawlPassageCount = Math.max(3, Math.floor(width * height * (0.08 + level * 0.015)));
  for (let i = 0; i < crawlPassageCount; i++) {
    const cell = cells[Math.floor(rng() * height)][Math.floor(rng() * width)];
    const options = shuffle(DIRECTIONS, rng)
      .map((d) => ({ ...d, cell: getCell(cells, cell.gridX + d.dx, cell.gridZ + d.dz) }))
      .filter((entry) => entry.cell && !cell.open[entry.dir] && !cell.crawl[entry.dir]);
    if (options[0]) connectCrawl(cell, options[0].cell!, options[0].dir);
  }

  const mazeCells: MazeCell[] = cells.flat().map((cell) => ({
    ...cell,
    worldX: cellToWorld(cell.gridX, cell.gridZ, width, height, cellSize).x,
    worldZ: cellToWorld(cell.gridX, cell.gridZ, width, height, cellSize).z,
  }));

  const elevatorCell = mazeCells[0];
  const farCells = [...mazeCells].sort((a, b) => {
    const da = Math.abs(a.gridX - elevatorCell.gridX) + Math.abs(a.gridZ - elevatorCell.gridZ);
    const db = Math.abs(b.gridX - elevatorCell.gridX) + Math.abs(b.gridZ - elevatorCell.gridZ);
    return db - da;
  });
  const extractionCell = farCells[0];
  const elevatorPosition = new THREE.Vector3(elevatorCell.worldX, 1.6, elevatorCell.worldZ);
  const extractionPosition = new THREE.Vector3(extractionCell.worldX, 0.02, extractionCell.worldZ);
  const candidateCells = shuffle(
    mazeCells.filter((cell) => {
      const pos = new THREE.Vector3(cell.worldX, 0, cell.worldZ);
      return distance2D(pos, elevatorPosition) > cellSize * 0.75 && distance2D(pos, extractionPosition) > cellSize * 0.5;
    }),
    rng,
  );

  const spawnBudget = Math.min(34, 9 + level * 5);
  const scrapSpawns = candidateCells.slice(0, spawnBudget).map((cell) => pickInsideCell(cell, cellSize, rng, 0.35));
  const monsterSpawns = candidateCells
    .slice(Math.max(0, candidateCells.length - 14))
    .map((cell) => pickInsideCell(cell, cellSize, rng, 1.2));
  const patrolPoints = shuffle(mazeCells, rng).map((cell) => pickInsideCell(cell, cellSize, rng, 1.2));

  return {
    seed,
    level,
    width,
    height,
    cellSize,
    cells: mazeCells,
    elevatorPosition,
    extractionPosition,
    scrapSpawns,
    monsterSpawns,
    patrolPoints,
  };
}

export function getMazeCell(layout: MazeLayout, worldX: number, worldZ: number): MazeCell | null {
  const gridX = Math.round(worldX / layout.cellSize + (layout.width - 1) / 2);
  const gridZ = Math.round(worldZ / layout.cellSize + (layout.height - 1) / 2);
  if (gridX < 0 || gridZ < 0 || gridX >= layout.width || gridZ >= layout.height) return null;
  return layout.cells[gridZ * layout.width + gridX] ?? null;
}

export function canMoveThrough(layout: MazeLayout, from: THREE.Vector3, to: THREE.Vector3, isCrouching = false) {
  const playerRadius = PLAYER_RADIUS;
  const halfSize = layout.cellSize / 2;
  const interiorLimit = halfSize - playerRadius;
  const fromCell = getMazeCell(layout, from.x, from.z);
  const toCell = getMazeCell(layout, to.x, to.z);
  if (!fromCell || !toCell) return false;
  if (collidesWithCellObstacles(toCell, to.x, to.z, playerRadius)) return false;

  if (fromCell.id === toCell.id) {
    const localX = to.x - fromCell.worldX;
    const localZ = to.z - fromCell.worldZ;
    const insideInterior = Math.abs(localX) <= interiorLimit && Math.abs(localZ) <= interiorLimit;
    if (insideInterior) return true;

    if (localX > interiorLimit && fromCell.open.east && Math.abs(localZ) <= interiorLimit) return true;
    if (localX < -interiorLimit && fromCell.open.west && Math.abs(localZ) <= interiorLimit) return true;
    if (localZ > interiorLimit && fromCell.open.south && Math.abs(localX) <= interiorLimit) return true;
    if (localZ < -interiorLimit && fromCell.open.north && Math.abs(localX) <= interiorLimit) return true;
    if (isCrouching && localX > interiorLimit && fromCell.crawl.east && Math.abs(localZ) <= CRAWL_PASSAGE_HALF_WIDTH) return true;
    if (isCrouching && localX < -interiorLimit && fromCell.crawl.west && Math.abs(localZ) <= CRAWL_PASSAGE_HALF_WIDTH) return true;
    if (isCrouching && localZ > interiorLimit && fromCell.crawl.south && Math.abs(localX) <= CRAWL_PASSAGE_HALF_WIDTH) return true;
    if (isCrouching && localZ < -interiorLimit && fromCell.crawl.north && Math.abs(localX) <= CRAWL_PASSAGE_HALF_WIDTH) return true;

    return false;
  }
  const dx = toCell.gridX - fromCell.gridX;
  const dz = toCell.gridZ - fromCell.gridZ;
  if (Math.abs(dx) + Math.abs(dz) !== 1) return false;
  if (dx === 1) {
    return (fromCell.open.east && Math.abs(to.z - fromCell.worldZ) <= interiorLimit) ||
      (isCrouching && fromCell.crawl.east && Math.abs(to.z - fromCell.worldZ) <= CRAWL_PASSAGE_HALF_WIDTH);
  }
  if (dx === -1) {
    return (fromCell.open.west && Math.abs(to.z - fromCell.worldZ) <= interiorLimit) ||
      (isCrouching && fromCell.crawl.west && Math.abs(to.z - fromCell.worldZ) <= CRAWL_PASSAGE_HALF_WIDTH);
  }
  if (dz === 1) {
    return (fromCell.open.south && Math.abs(to.x - fromCell.worldX) <= interiorLimit) ||
      (isCrouching && fromCell.crawl.south && Math.abs(to.x - fromCell.worldX) <= CRAWL_PASSAGE_HALF_WIDTH);
  }
  return (fromCell.open.north && Math.abs(to.x - fromCell.worldX) <= interiorLimit) ||
    (isCrouching && fromCell.crawl.north && Math.abs(to.x - fromCell.worldX) <= CRAWL_PASSAGE_HALF_WIDTH);
}

export function getCellObstacleBounds(cell: MazeCell) {
  if (!(cell.hazard === "clutter" || cell.story === "storage" || cell.templateId % 7 === 0)) return [];

  const count = cell.hazard === "clutter" ? 4 : 2;
  return Array.from({ length: count }).map((_, index) => {
    const side = index % 2 === 0 ? -1 : 1;
    const offset = 2.1 + (index % 3) * 0.7;
    return {
      x: cell.worldX + side * offset,
      z: cell.worldZ + 2.8 - index * 0.9,
      halfX: 0.72,
      halfZ: 0.72,
    };
  });
}

function collidesWithCellObstacles(cell: MazeCell, x: number, z: number, radius: number) {
  return getCellObstacleBounds(cell).some((obstacle) => (
    Math.abs(x - obstacle.x) <= obstacle.halfX + radius &&
    Math.abs(z - obstacle.z) <= obstacle.halfZ + radius
  ));
}