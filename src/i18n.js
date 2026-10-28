// src/i18n.js
// Internationalization dictionary and helper functions

export const translations = {
  en: {
    title: "Infinite Zeroes",
    menu: "Menu",
    close: "Close",
    alias: "Profile & Alias",
    stats: "Stats",
    options: "Options",
    resetGame: "Reset Profile (testing)",
    resetConfirm: "Are you sure you want to reset this profile? All progress will be lost.",
    deleteProfileConfirm: "Are you sure you want to delete this profile slot? All progress on this slot will be erased.",
    profileSlot: "Profile Slot",
    aliasPlaceholder: "Enter player alias",
    saveAlias: "Save Alias",
    deleteProfile: "Delete Profile",
    activeBadge: "Active",
    switchTo: "Switch",
    
    // Stats
    statLifetimeZeroes: "Lifetime Zeroes",
    statRunZeroes: "Run Zeroes",
    statTodayZeroes: "Zeroes Generated Today",
    statPlaytime: "Total Playtime",
    statClicks: "Total Screen Clicks",
    statTotalBoughtGens: "Total Generators Bought",
    statSpecificGens: "Generators by Type",
    
    // Options
    themeLabel: "Theme",
    languageLabel: "Language",
    notationLabel: "Number Notation",
    themeLight: "Light",
    themeDark: "Dark",
    themeBlue: "Blue",
    themeDeepPurple: "Deep Purple",
    themeNegative: "Negative (Inverted)",
    themeCrazy: "Crazy (Random)",
    
    notationStandard: "Standard (K, M, B, T...)",
    notationScientific: "Scientific (e.g. 1.23e6)",
    notationEngineering: "Engineering (e.g. 1.23e6 / 12.3e3)",
    notationRaw: "Raw / Integer",
    
    rateUnit: "Z/s",
    level: "Level",
    cost: "Cost",
    upgrade: "Upgrade",
    clickPrompt: "Click anywhere on screen to generate zeroes!",
  },
  es: {
    title: "Ceros Infinitos",
    menu: "Menú",
    close: "Cerrar",
    alias: "Perfil y Alias",
    stats: "Estadísticas",
    options: "Opciones",
    resetGame: "Reiniciar Perfil (pruebas)",
    resetConfirm: "¿Estás seguro de que quieres reiniciar este perfil? Se perderá todo el progreso.",
    deleteProfileConfirm: "¿Estás seguro de eliminar este perfil? Se borrará todo su progreso.",
    profileSlot: "Ranura de Perfil",
    aliasPlaceholder: "Ingresa tu alias",
    saveAlias: "Guardar Alias",
    deleteProfile: "Eliminar Perfil",
    activeBadge: "Activo",
    switchTo: "Cambiar",
    
    // Stats
    statLifetimeZeroes: "Ceros Históricos (Totales)",
    statRunZeroes: "Ceros en esta Partida",
    statTodayZeroes: "Ceros Generados Hoy",
    statPlaytime: "Tiempo Total Jugado",
    statClicks: "Clics en Pantalla",
    statTotalBoughtGens: "Generadores Comprados (Total)",
    statSpecificGens: "Generadores por Tipo",
    
    // Options
    themeLabel: "Tema",
    languageLabel: "Idioma",
    notationLabel: "Notación Numérica",
    themeLight: "Claro",
    themeDark: "Oscuro",
    themeBlue: "Azul",
    themeDeepPurple: "Púrpura Profundo",
    themeNegative: "Negativo (Invertido)",
    themeCrazy: "Loco (Aleatorio)",
    
    notationStandard: "Estándar (K, M, B, T...)",
    notationScientific: "Científica (ej. 1.23e6)",
    notationEngineering: "Ingeniería (ej. 1.23e6 / 12.3e3)",
    notationRaw: "Entero / Sin formato",
    
    rateUnit: "C/s",
    level: "Nivel",
    cost: "Costo",
    upgrade: "Mejorar",
    clickPrompt: "¡Haz clic en cualquier parte de la pantalla para generar ceros!",
  },
  fr: {
    title: "Zéros Infinis",
    menu: "Menu",
    close: "Fermer",
    alias: "Profil et Alias",
    stats: "Statistiques",
    options: "Options",
    resetGame: "Réinitialiser le profil",
    resetConfirm: "Êtes-vous sûr de vouloir réinitialiser ce profil ? Toute progression sera perdue.",
    deleteProfileConfirm: "Êtes-vous sûr de supprimer ce profil ?",
    profileSlot: "Emplacement de profil",
    aliasPlaceholder: "Entrez un pseudonyme",
    saveAlias: "Sauvegarder l'alias",
    deleteProfile: "Supprimer le profil",
    activeBadge: "Actif",
    switchTo: "Changer",
    
    statLifetimeZeroes: "Zéros totaux à vie",
    statRunZeroes: "Zéros de cette partie",
    statTodayZeroes: "Zéros générés aujourd'hui",
    statPlaytime: "Temps de jeu total",
    statClicks: "Total de clics",
    statTotalBoughtGens: "Générateurs achetés au total",
    statSpecificGens: "Générateurs par type",
    
    themeLabel: "Thème",
    languageLabel: "Langue",
    notationLabel: "Notation numérique",
    themeLight: "Clair",
    themeDark: "Sombre",
    themeBlue: "Bleu",
    themeDeepPurple: "Violet Profond",
    themeNegative: "Négatif (Inversé)",
    themeCrazy: "Fou (Aléatoire)",
    
    notationStandard: "Standard (K, M, B, T...)",
    notationScientific: "Scientifique (ex. 1.23e6)",
    notationEngineering: "Ingénierie",
    notationRaw: "Brut / Entier",
    
    rateUnit: "Z/s",
    level: "Niveau",
    cost: "Coût",
    upgrade: "Améliorer",
    clickPrompt: "Cliquez n'importe où pour générer des zéros !",
  }
};

let currentLang = "en";

export function setLanguage(lang) {
  if (translations[lang]) {
    currentLang = lang;
  }
}

export function getLanguage() {
  return currentLang;
}

export function t(key) {
  const dict = translations[currentLang] || translations.en;
  return dict[key] || translations.en[key] || key;
}
