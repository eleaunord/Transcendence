export type MemorySettings = {
  pairCount: 6 | 9 | 12; // ATTENTION -> 12, 18 ou 24 cartes
  theme: string;         // ATTENTION -> ex : "classic", "cloud", "sun"
  timerMode?: "none" | "short" | "medium" | "long"; // pour Solo
  turnTime?: number; // pour Versus
};

const SETTINGS_KEY = 'memorySettings';

const defaultSettings: MemorySettings = {
  pairCount: 6,
  theme: 'classic'
};

export function saveMemorySettings(settings: MemorySettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Erreur en sauvegardant les préférences Memory :', e);
  }
}

export function loadMemorySettings(): MemorySettings {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (!saved) return defaultSettings;
    const parsed = JSON.parse(saved);

    // sécurité : on vérifie que les données sont valides
    const validPairCount = [6, 9, 12].includes(parsed.pairCount);
    const validTheme = typeof parsed.theme === 'string';

    if (validPairCount && validTheme) {
      return parsed;
    }
    return defaultSettings;
  } catch (e) {
    console.warn('Impossible de charger les préférences Memory :', e);
    return defaultSettings;
  }
}

