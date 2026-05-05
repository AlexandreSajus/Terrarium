import { BUNNY_HISTORY_LIMIT } from "./config.js";

export function createBunnyGraph() {
  const bunnyGraphCanvas = document.getElementById("bunny-graph");
  const bunnyCountValue = document.getElementById("bunny-count");
  const bunnyBirthsValue = document.getElementById("bunny-births");
  const bunnyGraphCtx = bunnyGraphCanvas?.getContext("2d") ?? null;

  const bunnyHistory = [];
  const birthsHistory = [];

  function drawBunnyGraph(bunnies, totalReproductionBirths) {
    if (!bunnyGraphCtx || !bunnyGraphCanvas) {
      return;
    }

    const width = bunnyGraphCanvas.width;
    const height = bunnyGraphCanvas.height;
    bunnyGraphCtx.clearRect(0, 0, width, height);

    bunnyGraphCtx.fillStyle = "#0f141d";
    bunnyGraphCtx.fillRect(0, 0, width, height);

    bunnyGraphCtx.strokeStyle = "rgba(219, 229, 243, 0.12)";
    bunnyGraphCtx.lineWidth = 1;
    for (let i = 1; i <= 3; i++) {
      const y = (height / 4) * i;
      bunnyGraphCtx.beginPath();
      bunnyGraphCtx.moveTo(0, y);
      bunnyGraphCtx.lineTo(width, y);
      bunnyGraphCtx.stroke();
    }

    if (bunnyHistory.length > 1) {
      const maxPopulation = Math.max(10, ...bunnyHistory);
      const xStep = width / (BUNNY_HISTORY_LIMIT - 1);

      bunnyGraphCtx.beginPath();
      bunnyGraphCtx.moveTo(0, height - (bunnyHistory[0] / maxPopulation) * height);
      for (let i = 1; i < bunnyHistory.length; i++) {
        const x = i * xStep;
        const y = height - (bunnyHistory[i] / maxPopulation) * height;
        bunnyGraphCtx.lineTo(x, y);
      }
      bunnyGraphCtx.strokeStyle = "#88f0a4";
      bunnyGraphCtx.lineWidth = 2;
      bunnyGraphCtx.stroke();
    }

    if (birthsHistory.length > 1) {
      const maxBirths = Math.max(1, ...birthsHistory);
      const xStep = width / (BUNNY_HISTORY_LIMIT - 1);

      bunnyGraphCtx.beginPath();
      bunnyGraphCtx.moveTo(0, height - (birthsHistory[0] / maxBirths) * height);
      for (let i = 1; i < birthsHistory.length; i++) {
        const x = i * xStep;
        const y = height - (birthsHistory[i] / maxBirths) * height;
        bunnyGraphCtx.lineTo(x, y);
      }
      bunnyGraphCtx.strokeStyle = "#7cc4ff";
      bunnyGraphCtx.lineWidth = 2;
      bunnyGraphCtx.stroke();
    }

    if (bunnyCountValue) {
      bunnyCountValue.textContent = `${bunnies.length}`;
    }
    if (bunnyBirthsValue) {
      bunnyBirthsValue.textContent = `${totalReproductionBirths}`;
    }
  }

  function pushBunnyCountSample(bunnies, totalReproductionBirths) {
    bunnyHistory.push(bunnies.length);
    birthsHistory.push(totalReproductionBirths);
    if (bunnyHistory.length > BUNNY_HISTORY_LIMIT) {
      bunnyHistory.shift();
    }
    if (birthsHistory.length > BUNNY_HISTORY_LIMIT) {
      birthsHistory.shift();
    }
    drawBunnyGraph(bunnies, totalReproductionBirths);
  }

  return { pushBunnyCountSample, drawBunnyGraph };
}
