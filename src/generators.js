// src/generators.js
// Generator definitions and core tick logic for Infinite Zeroes

/**
 * Create a generator object prototype.
 * @param {string} name - Display name of the generator.
 * @param {number} baseRate - Base production rate (zeros per second) at level 1.
 */
function createGenerator(name, baseRate) {
  return {
    name,
    level: 1,
    baseRate,
    // Current production rate, grows exponentially with level.
    get rate() {
      // 15% increase per additional level (common idle-game scaling).
      return this.baseRate * Math.pow(1.15, this.level - 1);
    },
    upgrade() {
      this.level += 1;
    },
  };
}

/**
 * Initialise the set of generators available at game start.
 * Returns an array of generator objects.
 */
export function initGenerators() {
  // For the initial MVP we provide two simple generators.
  return [
    createGenerator("Zero Miner", 0.5), // 0.5 zero per second at level 1
    createGenerator("Zero Forge", 0.2), // slower but can be upgraded later
  ];
}

/**
 * Tick all generators for one second and return total zeros produced.
 * @param {Array<Object>} generators - Array of generator objects.
 * @returns {number} Total zeros produced this tick.
 */
export function tickGenerators(generators) {
  let total = 0;
  for (const gen of generators) {
    total += gen.rate;
  }
  return total;
}
