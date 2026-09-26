// src/app.js
// Main entry point for Infinite Zeroes game (Vanilla JS)
import { initGenerators } from "./generators.js";
import { loadGame, saveGame } from "./offline.js";
import { initUpgrades } from "./upgrades.js";
import { initPrestige } from "./prestige.js";

// DOM references
const currencyEl = document.getElementById("currency");

let gameState = {
  zeroes: 0,
  generators: [], // will be populated by initGenerators
  upgrades: [],
  prestigeLevel: 0,
  lastTimestamp: Date.now(),
};

function updateDisplay() {
  currencyEl.textContent = gameState.zeroes.toLocaleString();
}

function tick() {
  // each generator produces zeroes per tick
  const delta = gameState.generators.reduce((sum, gen) => sum + gen.tick(), 0);
  gameState.zeroes += delta;
  updateDisplay();
  saveGame(gameState);
}

function startGameLoop() {
  setInterval(tick, 1000); // 1‑second tick (can be adjusted)
}

function init() {
  // Load saved state (including offline gain calculation)
  const saved = loadGame();
  if (saved) {
    gameState = { ...gameState, ...saved };
    // Re‑instantiate generator objects from saved data
    gameState.generators = initGenerators(gameState.generators);
  } else {
    // Fresh start – create default generators
    gameState.generators = initGenerators();
  }
  // Initialize other systems (upgrades, prestige UI placeholders)
  initUpgrades(gameState);
  initPrestige(gameState);
  updateDisplay();
  startGameLoop();
}

// Ensure the script runs after DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

export { gameState };
