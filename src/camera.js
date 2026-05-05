import { GRID_HEIGHT, GRID_WIDTH, TILE_SIZE, WORLD_HEIGHT, WORLD_WIDTH } from "./config.js";
import { clamp } from "./utils.js";

export function createCamera() {
  return {
    x: 0,
    y: 0,
    zoom: 1,
  };
}

export function applyCamera(world, camera) {
  world.position.set(camera.x, camera.y);
  world.scale.set(camera.zoom);
}

export function clampCamera(app, camera) {
  const viewportWidth = app.screen.width;
  const viewportHeight = app.screen.height;
  const scaledWorldWidth = WORLD_WIDTH * camera.zoom;
  const scaledWorldHeight = WORLD_HEIGHT * camera.zoom;

  const minX = Math.min(0, viewportWidth - scaledWorldWidth);
  const minY = Math.min(0, viewportHeight - scaledWorldHeight);
  const maxX = 0;
  const maxY = 0;

  camera.x = clamp(camera.x, minX, maxX);
  camera.y = clamp(camera.y, minY, maxY);
}

export function screenToWorld(screenX, screenY, camera) {
  return {
    x: (screenX - camera.x) / camera.zoom,
    y: (screenY - camera.y) / camera.zoom,
  };
}

export function getVisibleTileBounds(app, camera) {
  const worldLeft = -camera.x / camera.zoom;
  const worldTop = -camera.y / camera.zoom;
  const worldRight = worldLeft + app.screen.width / camera.zoom;
  const worldBottom = worldTop + app.screen.height / camera.zoom;

  return {
    startX: clamp(Math.floor(worldLeft / TILE_SIZE) - 1, 0, GRID_WIDTH - 1),
    endX: clamp(Math.ceil(worldRight / TILE_SIZE) + 1, 0, GRID_WIDTH - 1),
    startY: clamp(Math.floor(worldTop / TILE_SIZE) - 1, 0, GRID_HEIGHT - 1),
    endY: clamp(Math.ceil(worldBottom / TILE_SIZE) + 1, 0, GRID_HEIGHT - 1),
  };
}
