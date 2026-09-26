// src/prestige.js
/**
 * Placeholder for prestige/ascension system.
 * For now it only displays the current prestige level and provides a dummy button
 * to increase the level (cost is simplified). Future work will expand this with
 * tiered multipliers, rebirth mechanics, and integration with upgrades.
 */

export function initPrestige(gameState) {
  const btn = document.createElement('button');
  btn.textContent = `Prestige (Level ${gameState.prestigeLevel})`;
  btn.addEventListener('click', () => {
    // Simple prestige cost: 10,000 zeroes per level increase
    const cost = 10000 * (gameState.prestigeLevel + 1);
    if (gameState.zeroes >= cost) {
      gameState.zeroes -= cost;
      gameState.prestigeLevel += 1;
      // Example reward: boost all generators baseRate by 10% per prestige level
      gameState.generators.forEach(gen => {
        gen.baseRate = Math.round(gen.baseRate * 1.1);
      });
      alert(`Prestiged! New prestige level: ${gameState.prestigeLevel}`);
      // Update button label
      btn.textContent = `Prestige (Level ${gameState.prestigeLevel})`;
      // Notify other parts of the app that state changed
      const event = new Event('prestige-applied');
      document.dispatchEvent(event);
    } else {
      alert(`Need ${cost.toLocaleString()} zeroes to prestige.`);
    }
  });
  document.body.appendChild(btn);
}
