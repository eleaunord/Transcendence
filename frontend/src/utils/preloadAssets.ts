// src/utils/preloadAssets.ts

const preloadImage = (src: string) => {
  const img = new Image();
  img.src = src;
};

export function preloadThemeAssets() {
  // Préchargement des backgrounds
  const backgrounds = [
    '/assets/Backgrounds/bg_th1.jpg',
    '/assets/Backgrounds/bg_th2.jpg',
    '/assets/Backgrounds/bg_th3.jpg',
  ];

  // Préchargement des icônes pour chaque thème et chaque nom de menu
  const iconNames = [
    'sb_profile',
    'sb_custom',
    'sb_leaderboard',
    'sb_friends',
    'sb_pong',
    'sb_aboutus',
    'sb_logout',
  ];

  const themes = ['th1', 'th2', 'th3'];

  // Backgrounds
  backgrounds.forEach(preloadImage);

  // Icônes
  themes.forEach(themeId => {
    const themeFolder = `/assets/Icons/Thème ${themeId.slice(-1)}`;
    iconNames.forEach(icon => {
      preloadImage(`${themeFolder}/${icon}_${themeId}.png`);
    });
  });
}
