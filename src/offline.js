// src/offline.js
// Multi-profile persistence layer using localStorage (client-side only)

const ACTIVE_SLOT_KEY = "infiniteZeroes_activeSlot";
const PROFILE_KEY_PREFIX = "infiniteZeroes_profile_";

/**
 * Get current active slot index (1, 2, or 3).
 */
export function getActiveSlot() {
  try {
    const raw = localStorage.getItem(ACTIVE_SLOT_KEY);
    const parsed = parseInt(raw, 10);
    return (parsed >= 1 && parsed <= 3) ? parsed : 1;
  } catch {
    return 1;
  }
}

/**
 * Set current active slot index.
 */
export function setActiveSlot(slotIndex) {
  try {
    localStorage.setItem(ACTIVE_SLOT_KEY, slotIndex.toString());
  } catch (e) {
    console.error("Failed to save active slot", e);
  }
}

/**
 * Get the full key for a profile slot.
 */
function getSlotKey(slotIndex) {
  return `${PROFILE_KEY_PREFIX}${slotIndex}`;
}

/**
 * Create default state for a brand new profile slot.
 */
export function createDefaultProfile(slotIndex) {
  const todayStr = new Date().toISOString().slice(0, 10);
  return {
    slot: slotIndex,
    alias: `Player ${slotIndex}`,
    zeroCount: 0,
    generators: [
      { name: "Zero Miner", level: 0 },
      { name: "Zero Forge", level: 0 },
      { name: "Zero Processor", level: 0 },
      { name: "Void Collector", level: 0 },
    ],
    settings: {
      theme: "dark",
      language: "en",
      notation: "standard",
    },
    stats: {
      lifetimeZeroes: 0,
      runZeroes: 0,
      todayZeroes: 0,
      todayDate: todayStr,
      playtimeSeconds: 0,
      clicks: 0,
      totalBoughtGenerators: 0,
      boughtSpecificGenerators: {},
    },
    lastTimestamp: Date.now(),
  };
}

/**
 * Load state for a specific slot.
 */
export function loadProfile(slotIndex) {
  try {
    const raw = localStorage.getItem(getSlotKey(slotIndex));
    if (!raw) return null;
    const data = JSON.parse(raw);
    
    // Check if day rolled over for todayZeroes
    const todayStr = new Date().toISOString().slice(0, 10);
    if (!data.stats) {
      data.stats = createDefaultProfile(slotIndex).stats;
    }
    if (data.stats.todayDate !== todayStr) {
      data.stats.todayDate = todayStr;
      data.stats.todayZeroes = 0;
    }
    return data;
  } catch (e) {
    console.error("Failed to load profile", e);
    return null;
  }
}

/**
 * Save state for a specific slot.
 */
export function saveProfile(slotIndex, state) {
  try {
    const sanitized = {
      slot: slotIndex,
      alias: state.alias || `Player ${slotIndex}`,
      zeroCount: state.zeroCount,
      generators: (state.generators || []).map((g) => ({ name: g.name, level: g.level })),
      settings: state.settings,
      stats: state.stats,
      lastTimestamp: Date.now(),
    };
    localStorage.setItem(getSlotKey(slotIndex), JSON.stringify(sanitized));
  } catch (e) {
    console.error("Failed to save profile", e);
  }
}

/**
 * Delete a profile slot by resetting it to default.
 */
export function deleteProfile(slotIndex) {
  try {
    localStorage.removeItem(getSlotKey(slotIndex));
  } catch (e) {
    console.error("Failed to delete profile", e);
  }
}

/**
 * List metadata for all 3 profile slots.
 */
export function listProfiles() {
  const list = [];
  for (let i = 1; i <= 3; i++) {
    const loaded = loadProfile(i);
    if (loaded) {
      list.push({
        slot: i,
        alias: loaded.alias || `Player ${i}`,
        zeroCount: loaded.zeroCount || 0,
        exists: true,
      });
    } else {
      list.push({
        slot: i,
        alias: `Empty Slot ${i}`,
        zeroCount: 0,
        exists: false,
      });
    }
  }
  return list;
}
