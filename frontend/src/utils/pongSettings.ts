export type PongSettings = {
  speed: number;
  scoreToWin: number;
  paddleSize: number;
  theme: number;
};

const SETTINGS_KEY = 'pongSettings';

export function savePongSettings(settings: PongSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadPongSettings(): PongSettings {
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) {
    return {
      speed: 5,
      scoreToWin: 5,
      paddleSize: 1, // ATTENTION -> Valeur par défaut « normale »
      theme: 0, // ATTENTION -> par défaut = thème classique
    };
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      speed: Number(parsed.speed) || 5,
      scoreToWin: Number(parsed.scoreToWin) || 5,
      paddleSize: Number(parsed.paddleSize) || 1,
      theme: Number(parsed.theme) || 0, 
    };
  } catch (e) {
    console.warn("Erreur de parsing des paramètres Pong", e);
    return {
      speed: 5,
      scoreToWin: 5,
      paddleSize: 1,
      theme: 0,
    };
  }
}
