// src/app.js
// Main entry point for Infinite Zeroes game

import { initGenerators, tickGenerators } from "./generators.js";
import {
  getActiveSlot,
  setActiveSlot,
  loadProfile,
  saveProfile,
  createDefaultProfile,
  deleteProfile,
  listProfiles,
} from "./offline.js";
import { formatNumber } from "./notation.js";
import { applyTheme, THEMES } from "./themes.js";
import { t, setLanguage, getLanguage, translations } from "./i18n.js";

// DOM Elements
const zeroCounterElem = document.getElementById("zero-counter");
const zeroRateElem = document.getElementById("zero-rate");
const playerAliasBadge = document.getElementById("player-alias-badge");
const appTitleElem = document.getElementById("app-title");
const clickPromptElem = document.getElementById("click-prompt");
const generatorsContainer = document.getElementById("generators-container");
const resetButton = document.getElementById("reset-button");

// Modal & Navigation Elements
const menuBtn = document.getElementById("menu-btn");
const menuModal = document.getElementById("menu-modal");
const modalBackdrop = document.getElementById("modal-backdrop");
const closeModalBtn = document.getElementById("close-modal-btn");
const modalNavTitle = document.getElementById("modal-nav-title");

// Tabs
const tabAliasBtn = document.getElementById("tab-alias-btn");
const tabStatsBtn = document.getElementById("tab-stats-btn");
const tabOptionsBtn = document.getElementById("tab-options-btn");
const tabAliasPanel = document.getElementById("tab-alias");
const tabStatsPanel = document.getElementById("tab-stats");
const tabOptionsPanel = document.getElementById("tab-options");

// Tab: Alias & Profiles
const aliasInput = document.getElementById("alias-input");
const saveAliasBtn = document.getElementById("save-alias-btn");
const profilesListElem = document.getElementById("profiles-list");
const aliasLabel = document.getElementById("alias-label");
const profilesHeading = document.getElementById("profiles-heading");

// Tab: Stats
const statsContainer = document.getElementById("stats-container");

// Tab: Options
const themeSelect = document.getElementById("theme-select");
const langSelect = document.getElementById("lang-select");
const notationSelect = document.getElementById("notation-select");
const themeLabel = document.getElementById("theme-label");
const langLabel = document.getElementById("lang-label");
const notationLabel = document.getElementById("notation-label");

// Current Game State in memory
let currentSlot = 1;
let profileState = null;
let liveGenerators = [];
let gameLoopInterval = null;
let lastTickTime = Date.now();

/**
 * Re-hydrate generator prototypes with their saved levels.
 */
function rehydrateGenerators(savedGens) {
  const baseGens = initGenerators();
  const map = new Map(baseGens.map((g) => [g.name, g]));
  const result = [];
  
  if (Array.isArray(savedGens)) {
    for (const saved of savedGens) {
      const prototype = map.get(saved.name);
      if (prototype) {
        prototype.level = saved.level ?? 0;
        result.push(prototype);
      }
    }
  }

  // Include any newly added generator prototypes from definitions
  for (const [name, gen] of map) {
    if (!result.find((g) => g.name === name)) {
      result.push(gen);
    }
  }
  return result;
}

/**
 * Load and initialize the selected profile slot.
 */
function initializeProfile(slotIndex) {
  currentSlot = slotIndex;
  setActiveSlot(slotIndex);

  let loaded = loadProfile(slotIndex);
  if (!loaded) {
    loaded = createDefaultProfile(slotIndex);
    saveProfile(slotIndex, loaded);
  }

  profileState = loaded;
  liveGenerators = rehydrateGenerators(profileState.generators);

  // Apply saved settings
  setLanguage(profileState.settings.language || "en");
  applyTheme(profileState.settings.theme || "dark");

  // Calculate offline progression
  const now = Date.now();
  if (profileState.lastTimestamp) {
    const elapsedSeconds = Math.max(0, Math.floor((now - profileState.lastTimestamp) / 1000));
    if (elapsedSeconds > 0) {
      const offlineEarned = tickGenerators(liveGenerators, elapsedSeconds);
      if (offlineEarned > 0) {
        addZeroes(offlineEarned);
      }
      profileState.stats.playtimeSeconds += elapsedSeconds;
    }
  }
  profileState.lastTimestamp = now;
  lastTickTime = now;

  updateAllUI();
}

/**
 * Add zeroes and update lifetime/run/today stats.
 */
function addZeroes(amount) {
  if (amount <= 0) return;
  profileState.zeroCount += amount;
  profileState.stats.lifetimeZeroes += amount;
  profileState.stats.runZeroes += amount;
  profileState.stats.todayZeroes += amount;
}

/**
 * Update currency counter and rate displays.
 */
function updateZeroDisplay() {
  const notation = profileState?.settings?.notation || "standard";
  zeroCounterElem.textContent = formatNumber(profileState.zeroCount, notation);
  
  const totalRate = tickGenerators(liveGenerators, 1);
  zeroRateElem.textContent = `+${formatNumber(totalRate, notation)} ${t("rateUnit")}`;
}

/**
 * Render generator cards.
 */
function renderGenerators() {
  generatorsContainer.innerHTML = "";
  const notation = profileState?.settings?.notation || "standard";

  liveGenerators.forEach((gen) => {
    const card = document.createElement("div");
    card.className = "generator";
    card.setAttribute("role", "region");
    card.setAttribute("aria-label", `${gen.name} generator`);

    const header = document.createElement("div");
    header.className = "gen-header";

    const title = document.createElement("span");
    title.className = "gen-title";
    title.textContent = gen.name;
    header.appendChild(title);

    const levelBadge = document.createElement("span");
    levelBadge.className = "gen-level-badge";
    levelBadge.textContent = `${t("level")}: ${gen.level}`;
    header.appendChild(levelBadge);

    card.appendChild(header);

    const details = document.createElement("div");
    details.className = "gen-details";

    const rateText = document.createElement("div");
    rateText.textContent = `Rate: +${formatNumber(gen.rate, notation)} ${t("rateUnit")}`;
    details.appendChild(rateText);

    const costText = document.createElement("div");
    costText.className = "gen-cost";
    costText.textContent = `${t("cost")}: ${formatNumber(gen.nextCost, notation)} 0s`;
    details.appendChild(costText);

    card.appendChild(details);

    const buyBtn = document.createElement("button");
    buyBtn.className = "btn-primary";
    buyBtn.textContent = `${t("upgrade")} (+1)`;
    buyBtn.disabled = profileState.zeroCount < gen.nextCost;

    buyBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // Do not trigger screen click increment
      const cost = gen.nextCost;
      if (profileState.zeroCount >= cost) {
        profileState.zeroCount -= cost;
        gen.upgrade();

        // Update stats
        profileState.stats.totalBoughtGenerators += 1;
        profileState.stats.boughtSpecificGenerators[gen.name] =
          (profileState.stats.boughtSpecificGenerators[gen.name] || 0) + 1;

        profileState.generators = liveGenerators.map((g) => ({ name: g.name, level: g.level }));
        saveCurrentProfile();
        updateZeroDisplay();
        renderGenerators();
      }
    });

    card.appendChild(buyBtn);
    generatorsContainer.appendChild(card);
  });
}

/**
 * Check and refresh buy button disabled state without re-creating DOM.
 */
function updateButtonStates() {
  const cards = generatorsContainer.children;
  liveGenerators.forEach((gen, index) => {
    const card = cards[index];
    if (card) {
      const btn = card.querySelector("button");
      if (btn) {
        btn.disabled = profileState.zeroCount < gen.nextCost;
      }
    }
  });
}

/**
 * Format total seconds into H:M:S display.
 */
function formatPlaytime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

/**
 * Render statistics in the Stats tab.
 */
function renderStats() {
  statsContainer.innerHTML = "";
  const notation = profileState.settings.notation || "standard";
  const stats = profileState.stats;

  const rows = [
    { label: t("statLifetimeZeroes"), val: formatNumber(stats.lifetimeZeroes, notation) },
    { label: t("statRunZeroes"), val: formatNumber(stats.runZeroes, notation) },
    { label: t("statTodayZeroes"), val: formatNumber(stats.todayZeroes, notation) },
    { label: t("statPlaytime"), val: formatPlaytime(stats.playtimeSeconds) },
    { label: t("statClicks"), val: stats.clicks.toLocaleString() },
    { label: t("statTotalBoughtGens"), val: stats.totalBoughtGenerators.toLocaleString() },
  ];

  rows.forEach(({ label, val }) => {
    const row = document.createElement("div");
    row.className = "stat-row";

    const labelSpan = document.createElement("span");
    labelSpan.className = "stat-label";
    labelSpan.textContent = label;

    const valSpan = document.createElement("span");
    valSpan.className = "stat-val";
    valSpan.textContent = val;

    row.appendChild(labelSpan);
    row.appendChild(valSpan);
    statsContainer.appendChild(row);
  });

  // Specific generators purchased breakdown
  const specificHeader = document.createElement("div");
  specificHeader.className = "section-label";
  specificHeader.style.marginTop = "0.75rem";
  specificHeader.textContent = t("statSpecificGens");
  statsContainer.appendChild(specificHeader);

  liveGenerators.forEach((gen) => {
    const count = stats.boughtSpecificGenerators[gen.name] || 0;
    const row = document.createElement("div");
    row.className = "stat-row";

    const labelSpan = document.createElement("span");
    labelSpan.className = "stat-label";
    labelSpan.textContent = `${gen.name} (${t("level")} ${gen.level})`;

    const valSpan = document.createElement("span");
    valSpan.className = "stat-val";
    valSpan.textContent = `${count} purchased`;

    row.appendChild(labelSpan);
    row.appendChild(valSpan);
    statsContainer.appendChild(row);
  });
}

/**
 * Render Profiles list in the Alias tab.
 */
function renderProfilesList() {
  profilesListElem.innerHTML = "";
  const profiles = listProfiles();
  const notation = profileState.settings.notation || "standard";

  profiles.forEach((p) => {
    const card = document.createElement("div");
    card.className = `profile-card ${p.slot === currentSlot ? "active-slot" : ""}`;

    const info = document.createElement("div");
    info.className = "profile-card-info";

    const nameLine = document.createElement("div");
    nameLine.className = "profile-card-name";
    nameLine.textContent = `Slot ${p.slot}: ${p.alias}`;

    if (p.slot === currentSlot) {
      const badge = document.createElement("span");
      badge.className = "badge";
      badge.textContent = t("activeBadge");
      nameLine.appendChild(badge);
    }
    info.appendChild(nameLine);

    const details = document.createElement("div");
    details.className = "profile-card-details";
    details.textContent = `${formatNumber(p.zeroCount, notation)} zeroes`;
    info.appendChild(details);

    card.appendChild(info);

    const actions = document.createElement("div");
    actions.className = "profile-card-actions";

    if (p.slot !== currentSlot) {
      const switchBtn = document.createElement("button");
      switchBtn.className = "btn-secondary btn-small";
      switchBtn.textContent = t("switchTo");
      switchBtn.addEventListener("click", () => {
        saveCurrentProfile();
        initializeProfile(p.slot);
        renderProfilesList();
      });
      actions.appendChild(switchBtn);
    }

    const delBtn = document.createElement("button");
    delBtn.className = "btn-danger btn-small";
    delBtn.textContent = t("deleteProfile");
    delBtn.addEventListener("click", () => {
      if (confirm(t("deleteProfileConfirm"))) {
        deleteProfile(p.slot);
        if (p.slot === currentSlot) {
          initializeProfile(currentSlot);
        }
        renderProfilesList();
      }
    });
    actions.appendChild(delBtn);

    card.appendChild(actions);
    profilesListElem.appendChild(card);
  });
}

/**
 * Populate Options dropdowns.
 */
function populateOptions() {
  // Theme dropdown
  themeSelect.innerHTML = "";
  THEMES.forEach((theme) => {
    const opt = document.createElement("option");
    opt.value = theme.id;
    opt.textContent = t(theme.labelKey);
    if (theme.id === profileState.settings.theme) {
      opt.selected = true;
    }
    themeSelect.appendChild(opt);
  });

  // Language dropdown
  langSelect.innerHTML = "";
  [
    { id: "en", label: "English" },
    { id: "es", label: "Español" },
    { id: "fr", label: "Français" },
  ].forEach((lang) => {
    const opt = document.createElement("option");
    opt.value = lang.id;
    opt.textContent = lang.label;
    if (lang.id === getLanguage()) {
      opt.selected = true;
    }
    langSelect.appendChild(opt);
  });

  // Notation dropdown
  notationSelect.innerHTML = "";
  [
    { id: "standard", labelKey: "notationStandard" },
    { id: "scientific", labelKey: "notationScientific" },
    { id: "engineering", labelKey: "notationEngineering" },
    { id: "raw", labelKey: "notationRaw" },
  ].forEach((not) => {
    const opt = document.createElement("option");
    opt.value = not.id;
    opt.textContent = t(not.labelKey);
    if (not.id === profileState.settings.notation) {
      opt.selected = true;
    }
    notationSelect.appendChild(opt);
  });
}

/**
 * Synchronize static labels when language changes.
 */
function refreshStaticLabels() {
  appTitleElem.textContent = t("title");
  clickPromptElem.textContent = t("clickPrompt");
  resetButton.textContent = t("resetGame");
  modalNavTitle.textContent = t("menu");

  tabAliasBtn.textContent = t("alias");
  tabStatsBtn.textContent = t("stats");
  tabOptionsBtn.textContent = t("options");

  aliasLabel.textContent = t("alias");
  saveAliasBtn.textContent = t("saveAlias");
  profilesHeading.textContent = `${t("alias")} (Slots 1-3)`;

  themeLabel.textContent = t("themeLabel");
  langLabel.textContent = t("languageLabel");
  notationLabel.textContent = t("notationLabel");
}

/**
 * Update the whole UI suite.
 */
function updateAllUI() {
  playerAliasBadge.textContent = profileState.alias;
  aliasInput.value = profileState.alias;

  refreshStaticLabels();
  populateOptions();
  renderProfilesList();
  renderGenerators();
  updateZeroDisplay();
}

/**
 * Save active profile to localStorage.
 */
function saveCurrentProfile() {
  if (!profileState) return;
  profileState.generators = liveGenerators.map((g) => ({ name: g.name, level: g.level }));
  saveProfile(currentSlot, profileState);
}

/**
 * Screen Click / Tap Increment Mechanic.
 * Increments when clicking anywhere on screen NOT on a button or inside modal content.
 */
function handleScreenClick(e) {
  // If clicked inside an interactive element, do not trigger screen click
  if (
    e.target.closest("button") ||
    e.target.closest("input") ||
    e.target.closest("select") ||
    e.target.closest(".modal-content") ||
    e.target.closest(".profile-card")
  ) {
    return;
  }

  // Award zero
  const clickPower = 1;
  addZeroes(clickPower);
  profileState.stats.clicks += 1;

  // Floating particle animation at click location
  spawnClickParticle(e.clientX, e.clientY, `+${clickPower}`);

  updateZeroDisplay();
  updateButtonStates();
}

function spawnClickParticle(x, y, text) {
  const particle = document.createElement("div");
  particle.className = "click-particle";
  particle.textContent = text;
  particle.style.left = `${x}px`;
  particle.style.top = `${y}px`;
  document.body.appendChild(particle);

  setTimeout(() => {
    particle.remove();
  }, 800);
}

/**
 * Modal visibility & Tab management
 */
function openMenuModal() {
  menuModal.classList.remove("hidden");
  menuBtn.setAttribute("aria-expanded", "true");
  renderProfilesList();
  renderStats();
}

function closeMenuModal() {
  menuModal.classList.add("hidden");
  menuBtn.setAttribute("aria-expanded", "false");
}

function switchTab(activeTab) {
  const tabs = [
    { btn: tabAliasBtn, panel: tabAliasPanel },
    { btn: tabStatsBtn, panel: tabStatsPanel },
    { btn: tabOptionsBtn, panel: tabOptionsPanel },
  ];

  tabs.forEach(({ btn, panel }) => {
    const isActive = btn === activeTab;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-selected", isActive.toString());
    panel.classList.toggle("active", isActive);
    if (isActive) {
      panel.removeAttribute("hidden");
    } else {
      panel.setAttribute("hidden", "");
    }
  });

  if (activeTab === tabStatsBtn) {
    renderStats();
  }
}

/**
 * Event Listeners Setup
 */
function setupEventListeners() {
  // Global screen clicking
  window.addEventListener("pointerdown", handleScreenClick);

  // Menu toggles
  menuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    openMenuModal();
  });
  closeModalBtn.addEventListener("click", closeMenuModal);
  modalBackdrop.addEventListener("click", closeMenuModal);

  // Tab buttons
  tabAliasBtn.addEventListener("click", () => switchTab(tabAliasBtn));
  tabStatsBtn.addEventListener("click", () => switchTab(tabStatsBtn));
  tabOptionsBtn.addEventListener("click", () => switchTab(tabOptionsBtn));

  // Save alias
  saveAliasBtn.addEventListener("click", () => {
    const val = aliasInput.value.trim();
    if (val) {
      profileState.alias = val;
      playerAliasBadge.textContent = val;
      saveCurrentProfile();
      renderProfilesList();
    }
  });

  // Theme change
  themeSelect.addEventListener("change", (e) => {
    const val = e.target.value;
    profileState.settings.theme = val;
    applyTheme(val);
    saveCurrentProfile();
  });

  // Language change
  langSelect.addEventListener("change", (e) => {
    const val = e.target.value;
    profileState.settings.language = val;
    setLanguage(val);
    saveCurrentProfile();
    updateAllUI();
  });

  // Notation change
  notationSelect.addEventListener("change", (e) => {
    const val = e.target.value;
    profileState.settings.notation = val;
    saveCurrentProfile();
    updateZeroDisplay();
    renderGenerators();
    renderStats();
    renderProfilesList();
  });

  // Reset profile button in footer
  resetButton.addEventListener("click", (e) => {
    e.stopPropagation();
    if (confirm(t("resetConfirm"))) {
      const reset = createDefaultProfile(currentSlot);
      reset.settings = profileState.settings; // Preserve settings
      reset.alias = profileState.alias;
      profileState = reset;
      liveGenerators = rehydrateGenerators(profileState.generators);
      saveCurrentProfile();
      updateAllUI();
    }
  });

  // Keyboard accessibility: Escape closes modal
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !menuModal.classList.contains("hidden")) {
      closeMenuModal();
    }
  });
}

/**
 * Game Loop: 1-second interval for generation, stats, and autosave
 */
function startGameLoop() {
  if (gameLoopInterval) clearInterval(gameLoopInterval);

  gameLoopInterval = setInterval(() => {
    const now = Date.now();
    const deltaSeconds = (now - lastTickTime) / 1000;
    lastTickTime = now;

    const produced = tickGenerators(liveGenerators, deltaSeconds);
    if (produced > 0) {
      addZeroes(produced);
    }

    profileState.stats.playtimeSeconds += deltaSeconds;
    profileState.lastTimestamp = now;

    updateZeroDisplay();
    updateButtonStates();

    // Auto-save state
    saveCurrentProfile();

    // If stats tab is currently open, live update it
    if (!tabStatsPanel.hasAttribute("hidden")) {
      renderStats();
    }
  }, 1000);
}

/**
 * Initialization on DOM ready
 */
function init() {
  const activeSlot = getActiveSlot();
  initializeProfile(activeSlot);
  setupEventListeners();
  startGameLoop();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
