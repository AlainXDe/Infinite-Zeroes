// src/notation.js
// Number formatting logic (Standard, Scientific, Engineering, Raw)

const SUFFIXES = [
  "", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc",
  "Ud", "Dd", "Td", "Qad", "Qid", "Sxd", "Spd", "Ocd", "Nod", "Vg",
  "Uvg", "Dvg", "Tvg", "Qavg", "Qivg", "Sxvg", "Spvg", "Ocvg", "Novg", "Tg",
  "Utg", "Dtg", "Ttg", "Qatg", "Qitg", "Sxtg", "Sptg", "Octg", "Notg", "Qag",
  "Uqag", "Dqag", "Tqag", "Qaqag", "Qiqag", "Sxqag", "Spqag", "Ocqag", "Noqag", "Qig"
];

/**
 * Format a number according to the chosen notation.
 * @param {number} num 
 * @param {string} notation - 'standard' | 'scientific' | 'engineering' | 'raw'
 * @param {number} decimals
 */
export function formatNumber(num, notation = "standard", decimals = 2) {
  if (num === null || num === undefined || isNaN(num)) return "0";
  if (num === 0) return "0";
  if (num < 0) return "-" + formatNumber(-num, notation, decimals);

  if (notation === "raw") {
    return Math.floor(num).toLocaleString();
  }

  if (num < 1000) {
    return num >= 10 ? num.toFixed(decimals > 0 ? 1 : 0) : num.toFixed(decimals);
  }

  if (notation === "scientific") {
    return num.toExponential(decimals).replace("+", "");
  }

  if (notation === "engineering") {
    const exp = Math.floor(Math.log10(num));
    const engExp = Math.floor(exp / 3) * 3;
    const mantissa = num / Math.pow(10, engExp);
    return `${mantissa.toFixed(decimals)}e${engExp}`;
  }

  // standard suffix notation
  const tier = Math.floor(Math.log10(num) / 3);
  if (tier < SUFFIXES.length) {
    const scale = Math.pow(10, tier * 3);
    const scaled = num / scale;
    return `${scaled.toFixed(decimals)} ${SUFFIXES[tier]}`.trim();
  }

  // fallback to scientific if exceeds suffixes
  return num.toExponential(decimals).replace("+", "");
}
