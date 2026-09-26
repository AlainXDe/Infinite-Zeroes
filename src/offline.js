// src/offline.js
/**
 * Simple persistence layer using localStorage.
 * Stores the entire gameState object as JSON.
 * On load, it also calculates offline gains based on the time elapsed
 * since the last saved timestamp.
 */

import { serializeGenerators } from "./generators.js";

const STORAGE_KEY = "infinite_zeroes_state";

export function saveGame(state) {
  try {
    const data = {
      zeroes: state.zeroes,
      generators: serializeGenerators(state.generators),
      upgrades: state.upgrades,
      prestigeLevel: state.prestigeLevel,
      lastTimestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save game", e);
  }
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    // Calculate offline gain
    const now = Date.now();
    const elapsedSec = Math.floor((now - data.lastTimestamp) / 1000);
    const perSec = data.generators.reduce((sum, g) => sum + g.baseRate * g.level, 0);
    const offlineGain = perSec * elapsedSec;
    if (offlineGain > 0) {
      data.zeroes += offlineGain;
    }
    // Return restored state (without upgrades logic for simplicity)
    return {
      zeroes: data.zeroes,
      generators: data.generators,
      upgrades: data.upgrades,
      prestigeLevel: data.prestigeLevel,
      lastTimestamp: now,
    };
  } catch (e) {
    console.error("Failed to load game", e);
    return null;
  }
}
