import {
  BUNNY_EAT_GAIN,
  BUNNY_HUNGER_DECAY,
  BUNNY_HUNGER_MAX,
  BUNNY_REPRODUCTION_CHANCE,
  BUNNY_REPRODUCTION_THRESHOLD,
  GRID_HEIGHT,
  GRID_WIDTH,
  INITIAL_BUNNY_COUNT,
  MAX_BUNNIES,
} from "./config.js";
import { getPlantState, getTileKey, setPlantState } from "./plants.js";
import { clamp, shuffleInPlace } from "./utils.js";

const MOVE_DIRECTIONS = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
  { x: 0, y: 0 },
];

const ADJACENT_DIRECTIONS = [
  { x: -1, y: -1 },
  { x: 0, y: -1 },
  { x: 1, y: -1 },
  { x: -1, y: 0 },
  { x: 1, y: 0 },
  { x: -1, y: 1 },
  { x: 0, y: 1 },
  { x: 1, y: 1 },
];

const UNIQUE_PAIR_DIRECTIONS = [
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: 1, y: 1 },
  { x: 1, y: -1 },
];

export const bunnies = [];
const occupancy = new Map();

let totalReproductionBirths = 0;

export function getTotalReproductionBirths() {
  return totalReproductionBirths;
}

function getFreeAdjacentSpawnTile(parentA, parentB) {
  const candidates = [];

  for (const parent of [parentA, parentB]) {
    for (const dir of ADJACENT_DIRECTIONS) {
      const nx = parent.x + dir.x;
      const ny = parent.y + dir.y;
      if (nx < 0 || nx >= GRID_WIDTH || ny < 0 || ny >= GRID_HEIGHT) {
        continue;
      }

      const key = getTileKey(nx, ny);
      if (!occupancy.has(key)) {
        candidates.push({ x: nx, y: ny });
      }
    }
  }

  if (candidates.length === 0) {
    return null;
  }

  return candidates[Math.floor(Math.random() * candidates.length)];
}

export function initializeBunnies() {
  let attempts = 0;
  while (bunnies.length < INITIAL_BUNNY_COUNT && attempts < INITIAL_BUNNY_COUNT * 12) {
    attempts += 1;
    const x = Math.floor(Math.random() * GRID_WIDTH);
    const y = Math.floor(Math.random() * GRID_HEIGHT);
    const key = getTileKey(x, y);
    if (occupancy.has(key)) {
      continue;
    }

    const bunny = {
      x,
      y,
      hunger: 50 + Math.floor(Math.random() * 45),
    };
    bunnies.push(bunny);
    occupancy.set(key, bunny);
  }
}

export function tickBunnies() {
  const survivors = [];

  for (const bunny of bunnies) {
    bunny.hunger = clamp(bunny.hunger - BUNNY_HUNGER_DECAY, 0, BUNNY_HUNGER_MAX);

    const oldKey = getTileKey(bunny.x, bunny.y);
    occupancy.delete(oldKey);

    if (bunny.hunger <= 0) {
      continue;
    }

    const shuffledMoves = [...MOVE_DIRECTIONS];
    shuffleInPlace(shuffledMoves);

    let moved = false;
    for (const move of shuffledMoves) {
      const nx = bunny.x + move.x;
      const ny = bunny.y + move.y;
      if (nx < 0 || nx >= GRID_WIDTH || ny < 0 || ny >= GRID_HEIGHT) {
        continue;
      }

      const nextKey = getTileKey(nx, ny);
      if (occupancy.has(nextKey)) {
        continue;
      }

      bunny.x = nx;
      bunny.y = ny;
      occupancy.set(nextKey, bunny);
      moved = true;
      break;
    }

    if (!moved) {
      occupancy.set(oldKey, bunny);
    }

    if (getPlantState(bunny.x, bunny.y) === 2) {
      bunny.hunger = clamp(bunny.hunger + BUNNY_EAT_GAIN, 0, BUNNY_HUNGER_MAX);
      setPlantState(bunny.x, bunny.y, 0);
    }

    survivors.push(bunny);
  }

  if (survivors.length >= MAX_BUNNIES) {
    bunnies.length = 0;
    bunnies.push(...survivors);
    return;
  }

  const newborns = [];
  for (const bunny of survivors) {
    if (bunny.hunger < BUNNY_REPRODUCTION_THRESHOLD) {
      continue;
    }

    for (const dir of UNIQUE_PAIR_DIRECTIONS) {
      if (survivors.length + newborns.length >= MAX_BUNNIES) {
        break;
      }

      const nx = bunny.x + dir.x;
      const ny = bunny.y + dir.y;
      if (nx < 0 || nx >= GRID_WIDTH || ny < 0 || ny >= GRID_HEIGHT) {
        continue;
      }

      const neighbor = occupancy.get(getTileKey(nx, ny));
      if (!neighbor || neighbor.hunger < BUNNY_REPRODUCTION_THRESHOLD) {
        continue;
      }

      if (Math.random() >= BUNNY_REPRODUCTION_CHANCE) {
        continue;
      }

      const spawnTile = getFreeAdjacentSpawnTile(bunny, neighbor);
      if (!spawnTile) {
        continue;
      }

      const spawnKey = getTileKey(spawnTile.x, spawnTile.y);
      if (occupancy.has(spawnKey)) {
        continue;
      }

      const child = {
        x: spawnTile.x,
        y: spawnTile.y,
        hunger: Math.floor(BUNNY_HUNGER_MAX * 0.55),
      };
      newborns.push(child);
      occupancy.set(spawnKey, child);
      totalReproductionBirths += 1;
    }
  }

  bunnies.length = 0;
  bunnies.push(...survivors, ...newborns);
}
