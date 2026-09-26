// src/generators.js
/**
 * Simple generator definition for "Infinite Zeroes".
 * Each generator produces a number of zeroes per tick.
 * The production is influenced by a base rate, a level multiplier,
 * and a small random variance to keep the game dynamic.
 */

export class Generator {
  constructor(name, baseRate = 1, level = 1) {
    this.name = name;
    this.baseRate = baseRate; // zeroes per tick at level 1
    this.level = level;
  }

  /**
   * Calculate zeroes produced this tick.
   * We add a ±5% random jitter to avoid completely deterministic growth.
   */
  tick() {
    const variance = 0.95 + Math.random() * 0.1; // 0.95‑1.05
    const production = this.baseRate * this.level * variance;
    return Math.floor(production);
  }
}

/**
 * Initialise the set of generators.
 * If `savedData` is provided, we rebuild the Generator instances from it.
 */
export function initGenerators(savedData = []) {
  // Default generator list – you can expand this later.
  const defaults = [
    new Generator("Zero Core", 1, 1),
    new Generator("Zero Engine", 5, 1),
    new Generator("Zero Reactor", 20, 1),
  ];

  if (!savedData || savedData.length === 0) {
    return defaults;
  }

  // Re‑hydrate saved generators
  return savedData.map((g) => new Generator(g.name, g.baseRate, g.level));
}

/**
 * Serialise generators for storage.
 */
export function serializeGenerators(generators) {
  return generators.map((gen) => ({
    name: gen.name,
    baseRate: gen.baseRate,
    level: gen.level,
  }));
}
