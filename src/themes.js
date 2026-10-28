// src/themes.js
// Theme definitions and manager

export const THEMES = [
  { id: "light", labelKey: "themeLight" },
  { id: "dark", labelKey: "themeDark" },
  { id: "blue", labelKey: "themeBlue" },
  { id: "deep-purple", labelKey: "themeDeepPurple" },
  { id: "negative", labelKey: "themeNegative" },
  { id: "crazy", labelKey: "themeCrazy" },
];

function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export function applyTheme(themeName) {
  const root = document.documentElement;
  root.removeAttribute("style");
  root.setAttribute("data-theme", themeName);

  if (themeName === "crazy") {
    const bg = getRandomColor();
    const surface = getRandomColor();
    const text = getRandomColor();
    const accent = getRandomColor();
    const header = getRandomColor();

    root.style.setProperty("--bg-color", bg);
    root.style.setProperty("--surface-color", surface);
    root.style.setProperty("--text-color", text);
    root.style.setProperty("--accent-color", accent);
    root.style.setProperty("--header-bg", header);
  }
}
