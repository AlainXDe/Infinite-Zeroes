// src/generators.js
// Generator definitions and core tick logic for Infinite Zeroes

/**
 * Create a generator object prototype.
 * @param {string} name - Display name of the generator.
 * @param {number} baseRate - Base production rate (zeros per second) at level 1.
 * @param {number} baseCost - Base cost to purchase the first level / upgrade.
 */
function createGenerator(name, baseRate, baseCost) {
  return {
    name,
    level: 0, // Starts at 0 (or 1 once bought)
    baseRate,
    baseCost,
    // Current production rate, grows exponentially with level.
    get rate() {
      if (this.level <= 0) return 0;
      // 15% increase per level
      return this.baseRate * this.level * Math.pow(1.15, this.level - 1);
    },
    // Cost to upgrade to next level
    get nextCost() {
      return Math.floor(this.baseCost * Math.pow(1.15, this.level));
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
  return [
    createGenerator("Zero Miner", 0.5, 10),
    createGenerator("Zero Forge", 2.0, 50),
    createGenerator("Zero Processor", 8.0, 250),
    createGenerator("Void Collector", 32.0, 1200),
  ];
}

/**
 * Tick all generators for deltaSeconds and return total zeros produced.
 * @param {Array<Object>} generators - Array of generator objects.
 * @param {number} deltaSeconds - Time step in seconds.
 * @returns {number} Total zeros produced.
 */
export function tickGenerators(generators, deltaSeconds = 1) {
  let total = 0;
  for (const gen of generators) {
    total += gen.rate * deltaSeconds;
  }
  return total;
}
