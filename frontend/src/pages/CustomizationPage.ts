import { createSidebar } from "../utils/sidebar";
import { applyUserTheme } from "../utils/theme";
import { preloadThemeAssets } from '../utils/preloadAssets';

export function createCustomizationPage(navigate: (path: string) => void): HTMLElement {
  if ((window as any).activePongCleanup) {
    (window as any).activePongCleanup();
    delete (window as any).activePongCleanup;
  }
  
  const container = document.createElement('div');
  container.className = 'relative flex flex-col h-screen bg-gray-900 text-white overflow-hidden';

  const sidebar = createSidebar(navigate);
  container.appendChild(sidebar);

  //---------------------Background Image--------------------/
  const backgroundImage = document.createElement('div');
  backgroundImage.id = 'backgroundImage';
  backgroundImage.className = 'absolute top-0 left-20 right-0 bottom-0 bg-cover bg-center transition-all duration-300';

  container.appendChild(backgroundImage);
  applyUserTheme(backgroundImage);
  
  //---------------------Thème Selector--------------------/
  const customizations = document.createElement('div');
  customizations.className = 'flex  space-x-8 justify-center items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 bg-black/50 p-4 rounded-lg';

  const themes = [
    { name: 'Thème 1', path: '/assets/Backgrounds/bg_th1.jpg' },
    { name: 'Thème 2', path: '/assets/Backgrounds/bg_th2.jpg' },
    { name: 'Thème 3', path: '/assets/Backgrounds/bg_th3.jpg' },
  ];

  themes.forEach(({ name, path }) => {
    const img = document.createElement('img');
    img.src = path;
    img.alt = name;
    img.className = 'flex-1 max-w-xs h-auto rounded-lg cursor-pointer hover:border hover:border-white transition-all duration-100';

    img.addEventListener('click', async () => {
      backgroundImage.style.backgroundImage = `url(${path})`;

      sessionStorage.setItem('theme', path);

      const updateThemeEvent = new CustomEvent('themeChanged', { detail: path });
      window.dispatchEvent(updateThemeEvent);

      const token = localStorage.getItem('token');
      try {
        await fetch('/api/me/theme', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          //body: JSON.stringify({ image: path.replace('/assets/game-themes/', '') }),
          body: JSON.stringify({ theme: path }), 
        });
      } catch (err) {
        console.error('Erreur lors de la sauvegarde du thème', err);
      }
    });

    customizations.appendChild(img);
  });

  container.appendChild(customizations);

  preloadThemeAssets();
  return container;
}