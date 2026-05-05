import * as PIXI from "https://cdn.jsdelivr.net/npm/pixi.js@7.4.2/dist/pixi.mjs";

import { bunnies, getTotalReproductionBirths, initializeBunnies, tickBunnies } from "./bunnies.js";
import { clampCamera, createCamera, screenToWorld } from "./camera.js";
import { GROWTH_TICK_MS, MAX_ZOOM, MIN_ZOOM, WORLD_HEIGHT, WORLD_WIDTH } from "./config.js";
import { renderFrame } from "./drawing.js";
import { createBunnyGraph } from "./graphing.js";
import { tickPlantGrowth } from "./plants.js";
import { clamp } from "./utils.js";

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
const bunnyLayer = new PIXI.Graphics();
world.addChild(tileLayer);
world.addChild(plantLayer);
world.addChild(bunnyLayer);

const camera = createCamera();

const drag = {
  active: false,
  startX: 0,
  startY: 0,
  cameraStartX: 0,
  cameraStartY: 0,
};

const { pushBunnyCountSample } = createBunnyGraph();

function tickSimulation() {
  tickPlantGrowth(app, camera);
  tickBunnies();
  pushBunnyCountSample(bunnies, getTotalReproductionBirths());
  renderFrame(app, camera, world, tileLayer, plantLayer, bunnyLayer, bunnies);
}

function requestRender() {
  renderFrame(app, camera, world, tileLayer, plantLayer, bunnyLayer, bunnies);
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
  requestRender();
});

app.view.addEventListener(
  "wheel",
  (event) => {
    event.preventDefault();

    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    const beforeZoom = screenToWorld(event.clientX, event.clientY, camera);

    camera.zoom = clamp(camera.zoom * zoomFactor, MIN_ZOOM, MAX_ZOOM);
    camera.x = event.clientX - beforeZoom.x * camera.zoom;
    camera.y = event.clientY - beforeZoom.y * camera.zoom;

    requestRender();
  },
  { passive: false }
);

window.addEventListener("resize", requestRender);

camera.zoom = MAX_ZOOM;
clampCamera(app, camera);
camera.x = app.screen.width * 0.5 - (WORLD_WIDTH * camera.zoom) / 2;
camera.y = app.screen.height * 0.5 - (WORLD_HEIGHT * camera.zoom) / 2;

initializeBunnies();
pushBunnyCountSample(bunnies, getTotalReproductionBirths());
requestRender();
window.setInterval(tickSimulation, GROWTH_TICK_MS);
