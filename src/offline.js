// src/offline.js
// Simple persistence layer using localStorage (client‑side only)

const STORAGE_KEY = "infiniteZeroesState";

/**
 * Load saved state from localStorage.
 * Returns an object { zeroCount, generators } or null if none.
 */
export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Re‑hydrate generator objects (they lose methods when parsed)
    if (Array.isArray(parsed.generators)) {
      // We only need level and name; other properties are recomputed via rate getter.
      // We'll store generator name and level only.
      const rehydrated = parsed.generators.map((g) => {
        // The baseRate is not stored; we need a lookup based on name.
        // For now we assume the same ordering as initGenerators and will restore later.
        return {
          name: g.name,
          level: g.level,
          // baseRate will be filled in by initGenerators if missing.
        };
      });
      parsed.generators = rehydrated;
    }
    return parsed;
  } catch (e) {
    console.error("Failed to load game state", e);
    return null;
  }
}

/**
 * Save current state to localStorage.
 * @param {Object} state - Object containing zeroCount and generators.
 */
export function saveState(state) {
  try {
    // Strip functions / prototypes before storing.
    const sanitized = {
      zeroCount: state.zeroCount,
      generators: state.generators.map((g) => ({ name: g.name, level: g.level })),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
  } catch (e) {
    console.error("Failed to save game state", e);
  }
}
