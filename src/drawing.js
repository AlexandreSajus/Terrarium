import { BUNNY_HUNGER_MAX, TILE_SIZE } from "./config.js";
import { applyCamera, clampCamera, getVisibleTileBounds } from "./camera.js";
import { getPlantState } from "./plants.js";

export function drawVisibleTiles(app, camera, tileLayer, plantLayer) {
  const { startX, endX, startY, endY } = getVisibleTileBounds(app, camera);

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

export function drawVisibleBunnies(app, camera, bunnyLayer, bunnies) {
  const { startX, endX, startY, endY } = getVisibleTileBounds(app, camera);
  bunnyLayer.clear();

  for (const bunny of bunnies) {
    if (bunny.x < startX || bunny.x > endX || bunny.y < startY || bunny.y > endY) {
      continue;
    }

    const px = bunny.x * TILE_SIZE + TILE_SIZE * 0.5;
    const py = bunny.y * TILE_SIZE + TILE_SIZE * 0.5;
    const hungerRatio = bunny.hunger / BUNNY_HUNGER_MAX;
    const hungerColor = hungerRatio > 0.7 ? 0x7be07f : hungerRatio > 0.4 ? 0xf5d76a : 0xf27575;

    bunnyLayer.beginFill(0xf4f6fb);
    bunnyLayer.drawEllipse(px, py + 1, 6, 5);
    bunnyLayer.drawEllipse(px - 3, py - 5, 2, 4);
    bunnyLayer.drawEllipse(px + 3, py - 5, 2, 4);
    bunnyLayer.endFill();

    bunnyLayer.beginFill(0x2d2f38, 0.85);
    bunnyLayer.drawRect(px - 8, py - 13, 16, 3);
    bunnyLayer.endFill();

    bunnyLayer.beginFill(hungerColor);
    bunnyLayer.drawRect(px - 8, py - 13, 16 * hungerRatio, 3);
    bunnyLayer.endFill();
  }
}

export function renderFrame(app, camera, world, tileLayer, plantLayer, bunnyLayer, bunnies) {
  clampCamera(app, camera);
  applyCamera(world, camera);
  drawVisibleTiles(app, camera, tileLayer, plantLayer);
  drawVisibleBunnies(app, camera, bunnyLayer, bunnies);
}
