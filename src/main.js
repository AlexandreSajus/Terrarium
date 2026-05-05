import * as PIXI from "https://cdn.jsdelivr.net/npm/pixi.js@7.4.2/dist/pixi.mjs";

const GRID_WIDTH = 10_000;
const GRID_HEIGHT = 10_000;
const TILE_SIZE = 32;

const WORLD_WIDTH = GRID_WIDTH * TILE_SIZE;
const WORLD_HEIGHT = GRID_HEIGHT * TILE_SIZE;

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 3;

const app = new PIXI.Application({
  antialias: true,
  background: "#10151d",
  resizeTo: window,
});

document.body.appendChild(app.view);

const world = new PIXI.Container();
app.stage.addChild(world);

const tileLayer = new PIXI.Graphics();
const plantLayer = new PIXI.Graphics();
world.addChild(tileLayer);
world.addChild(plantLayer);

const camera = {
  x: 0,
  y: 0,
  zoom: 1,
};

const drag = {
  active: false,
  startX: 0,
  startY: 0,
  cameraStartX: 0,
  cameraStartY: 0,
};

function hash2D(x, y) {
  let h = (x * 374761393 + y * 668265263) >>> 0;
  h = (h ^ (h >> 13)) * 1274126177;
  return (h ^ (h >> 16)) >>> 0;
}

function getPlantState(tileX, tileY) {
  return hash2D(tileX, tileY) % 3;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function screenToWorld(screenX, screenY) {
  return {
    x: (screenX - camera.x) / camera.zoom,
    y: (screenY - camera.y) / camera.zoom,
  };
}

function applyCamera() {
  world.position.set(camera.x, camera.y);
  world.scale.set(camera.zoom);
}

function clampCamera() {
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

function drawVisibleTiles() {
  const worldLeft = -camera.x / camera.zoom;
  const worldTop = -camera.y / camera.zoom;
  const worldRight = worldLeft + app.screen.width / camera.zoom;
  const worldBottom = worldTop + app.screen.height / camera.zoom;

  const startX = clamp(Math.floor(worldLeft / TILE_SIZE) - 1, 0, GRID_WIDTH - 1);
  const endX = clamp(Math.ceil(worldRight / TILE_SIZE) + 1, 0, GRID_WIDTH - 1);
  const startY = clamp(Math.floor(worldTop / TILE_SIZE) - 1, 0, GRID_HEIGHT - 1);
  const endY = clamp(Math.ceil(worldBottom / TILE_SIZE) + 1, 0, GRID_HEIGHT - 1);

  tileLayer.clear();
  plantLayer.clear();

  for (let y = startY; y <= endY; y++) {
    for (let x = startX; x <= endX; x++) {
      const px = x * TILE_SIZE;
      const py = y * TILE_SIZE;

      const checker = (x + y) % 2;
      const tileColor = checker === 0 ? 0x283a2d : 0x314a37;
      tileLayer.beginFill(tileColor);
      tileLayer.drawRect(px, py, TILE_SIZE, TILE_SIZE);
      tileLayer.endFill();

      tileLayer.lineStyle(1, 0x1e2b21, 0.35);
      tileLayer.drawRect(px, py, TILE_SIZE, TILE_SIZE);

      const centerX = px + TILE_SIZE * 0.5;
      const centerY = py + TILE_SIZE * 0.5;
      const plantState = getPlantState(x, y);

      if (plantState === 0) {
        plantLayer.beginFill(0x8a6a42);
        plantLayer.drawCircle(centerX, centerY + 6, 4);
        plantLayer.endFill();
      } else if (plantState === 1) {
        plantLayer.lineStyle(2, 0x6faa5d, 1);
        plantLayer.moveTo(centerX, centerY + 8);
        plantLayer.lineTo(centerX, centerY - 2);

        plantLayer.beginFill(0x7ec06a);
        plantLayer.drawEllipse(centerX - 4, centerY, 4, 2.8);
        plantLayer.drawEllipse(centerX + 4, centerY - 2, 4, 2.8);
        plantLayer.endFill();
      } else {
        plantLayer.beginFill(0x4eb061);
        plantLayer.drawRoundedRect(centerX - 6, centerY - 8, 12, 14, 4);
        plantLayer.endFill();

        plantLayer.beginFill(0x357c43);
        plantLayer.drawRect(centerX - 1.5, centerY + 6, 3, 6);
        plantLayer.endFill();
      }
    }
  }
}

function renderFrame() {
  clampCamera();
  applyCamera();
  drawVisibleTiles();
}

app.view.addEventListener("pointerdown", (event) => {
  drag.active = true;
  drag.startX = event.clientX;
  drag.startY = event.clientY;
  drag.cameraStartX = camera.x;
  drag.cameraStartY = camera.y;
});

window.addEventListener("pointerup", () => {
  drag.active = false;
});

window.addEventListener("pointermove", (event) => {
  if (!drag.active) {
    return;
  }

  const dx = event.clientX - drag.startX;
  const dy = event.clientY - drag.startY;
  camera.x = drag.cameraStartX + dx;
  camera.y = drag.cameraStartY + dy;
  renderFrame();
});

app.view.addEventListener(
  "wheel",
  (event) => {
    event.preventDefault();

    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    const beforeZoom = screenToWorld(event.clientX, event.clientY);

    camera.zoom = clamp(camera.zoom * zoomFactor, MIN_ZOOM, MAX_ZOOM);
    camera.x = event.clientX - beforeZoom.x * camera.zoom;
    camera.y = event.clientY - beforeZoom.y * camera.zoom;

    renderFrame();
  },
  { passive: false }
);

window.addEventListener("resize", renderFrame);

camera.zoom = MAX_ZOOM;
camera.x = app.screen.width * 0.5 - (WORLD_WIDTH * camera.zoom) / 2;
camera.y = app.screen.height * 0.5 - (WORLD_HEIGHT * camera.zoom) / 2;
renderFrame();
