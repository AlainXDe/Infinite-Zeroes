// src/app.js
// Main entry point for Infinite Zeroes game

import { initGenerators, tickGenerators } from "./generators.js";
import { loadState, saveState } from "./offline.js";

const zeroCounterElem = document.getElementById("zero-counter");
const gameArea = document.getElementById("game-area");
const resetButton = document.getElementById("reset-button");

let zeroCount = 0;
let generators = [];

/**
 * Re‑hydrate generators after loading from storage.
 * Stored generator objects contain only name and level; we need to restore the
 * full generator prototype (including baseRate and rate getter).
 */
function rehydrateGenerators(savedGens) {
  const baseGens = initGenerators(); // creates full prototypes
  const map = new Map(baseGens.map((g) => [g.name, g]));
  const result = [];
  for (const saved of savedGens) {
    const prototype = map.get(saved.name);
    if (prototype) {
      prototype.level = saved.level ?? 1;
      result.push(prototype);
    }
  }
  // Add any new generators that weren't saved yet (defaults to level 1)
  for (const [name, gen] of map) {
    if (!result.find((g) => g.name === name)) {
      result.push(gen);
    }
  }
  return result;
}

function updateZeroDisplay() {
  zeroCounterElem.textContent = Math.floor(zeroCount);
}

function startGame() {
  // Load saved state (zero count and generator levels)
  const saved = loadState();
  if (saved) {
    zeroCount = saved.zeroCount ?? 0;
    generators = rehydrateGenerators(saved.generators ?? []);
  } else {
    generators = initGenerators();
  }
  renderGenerators();
  updateZeroDisplay();
  // Game loop – tick every second
  setInterval(() => {
    const produced = tickGenerators(generators);
    zeroCount += produced;
    updateZeroDisplay();
    saveState({ zeroCount, generators });
  }, 1000);
}

function renderGenerators() {
  gameArea.innerHTML = ""; // clear
  generators.forEach((gen) => {
    const div = document.createElement("div");
    div.className = "generator";
    div.setAttribute("role", "region");
    div.setAttribute("aria-label", `${gen.name} generator`);

    const title = document.createElement("div");
    title.className = "title";
    title.textContent = `${gen.name}`;
    div.appendChild(title);

    const rate = document.createElement("div");
    rate.textContent = `Rate: ${gen.rate.toFixed(2)} Z/s`;
    div.appendChild(rate);

    const level = document.createElement("div");
    level.textContent = `Level: ${gen.level}`;
    div.appendChild(level);

    const upgradeBtn = document.createElement("button");
    upgradeBtn.textContent = "Upgrade";
    upgradeBtn.addEventListener("click", () => {
      gen.upgrade();
      renderGenerators(); // re‑render to reflect new level/rate
    });
    div.appendChild(upgradeBtn);

    gameArea.appendChild(div);
  });
}

resetButton.addEventListener("click", () => {
  if (confirm("Reset all progress? This cannot be undone.")) {
    zeroCount = 0;
    generators = initGenerators();
    saveState({ zeroCount, generators });
    renderGenerators();
    updateZeroDisplay();
  }
});

// Start after DOM ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startGame);
} else {
  startGame();
}
