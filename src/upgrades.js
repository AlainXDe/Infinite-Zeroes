// src/upgrades.js
/**
 * Placeholder module for upgrades.
 * Upgrades will modify generator properties (e.g., increase level or baseRate).
 * For now we expose a simple init function that attaches a dummy UI button.
 */

export function initUpgrades(gameState) {
  // Example: add a button to purchase a generic upgrade
  const btn = document.createElement("button");
  btn.textContent = "Upgrade All Generators (+1 level)";
  btn.addEventListener("click", () => {
    // Simple cost: 1000 zeroes per upgrade
    const cost = 1000;
    if (gameState.zeroes >= cost) {
      gameState.zeroes -= cost;
      gameState.generators.forEach((gen) => (gen.level += 1));
      // Update display via app's function (we assume global updateDisplay exists)
      const event = new Event("upgrade-applied");
      document.dispatchEvent(event);
    } else {
      alert("Not enough zeroes for upgrade.");
    }
  });
  document.body.appendChild(btn);
}
