import { GRID_WIDTH, GROWTH_CHANCE } from "./config.js";
import { clampCamera, getVisibleTileBounds } from "./camera.js";

const plantOverrides = new Map();

function hash2D(x, y) {
  let h = (x * 374761393 + y * 668265263) >>> 0;
  h = (h ^ (h >> 13)) * 1274126177;
  return (h ^ (h >> 16)) >>> 0;
}

export function getTileKey(tileX, tileY) {
  return tileY * GRID_WIDTH + tileX;
}

function getBasePlantState(tileX, tileY) {
  return hash2D(tileX, tileY) % 3;
}

export function getPlantState(tileX, tileY) {
  const key = getTileKey(tileX, tileY);
  return plantOverrides.get(key) ?? getBasePlantState(tileX, tileY);
}

export function setPlantState(tileX, tileY, nextState) {
  const key = getTileKey(tileX, tileY);
  const baseState = getBasePlantState(tileX, tileY);

  if (nextState === baseState) {
    plantOverrides.delete(key);
    return;
  }

  plantOverrides.set(key, nextState);
}

export function tickPlantGrowth(app, camera) {
  clampCamera(app, camera);
  const { startX, endX, startY, endY } = getVisibleTileBounds(app, camera);

  for (let y = startY; y <= endY; y++) {
    for (let x = startX; x <= endX; x++) {
      const currentState = getPlantState(x, y);
      if (currentState >= 2) {
        continue;
      }

      if (Math.random() < GROWTH_CHANCE) {
        setPlantState(x, y, currentState + 1);
      }
    }
  }
}
