import { createSidebar } from "../utils/sidebar";
import { applyUserTheme } from "../utils/theme";
import { t } from '../utils/translator';

export function createMemoryOpponentPage(navigate: (path: string) => void): HTMLElement {
    const container = document.createElement('div');
    container.className = 'flex flex-col h-screen bg-gray-900 text-white';
    
    const sidebar = createSidebar(navigate);
    container.appendChild(sidebar);
  
     //---------------------Background Image--------------------/
   
     const backgroundImage = document.createElement('div');
     backgroundImage.id = 'backgroundImage';
     backgroundImage.className = 'absolute top-0 left-20 right-0 bottom-0 bg-cover bg-center transition-all duration-300';

     container.appendChild(backgroundImage);
     applyUserTheme(backgroundImage);
  
  
    // Central game display
    const gameArea = document.createElement('div');
    gameArea.className = 'flex-1 bg-gray-900 flex justify-center items-center';
  
    const gameFrame = document.createElement('div');
    gameFrame.className = 'w-3/4 h-3/4 border-4 border-white relative overflow-hidden bg-black';
  
    // Canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'pong-canvas';
    canvas.className = 'w-full h-full absolute top-0 left-0';
    canvas.style.display = 'block';
    canvas.style.backgroundColor = 'black';

    const btnStyle =
      'w-96 text-center text-white text-5xl font-bold py-4 rounded-lg shadow-lg transition duration-300';

    // Boutons de sélection du mode
    const versusBtn = document.createElement('button');
    versusBtn.textContent = t('memory.opponent.friend');
    versusBtn.className =
      'bg-blue-600/80 hover:bg-blue-700/50 ' + btnStyle;

    const guestBtn = document.createElement('button');
    guestBtn.textContent = t('memory.opponent.guest');
    guestBtn.className =
      'bg-purple-800 hover:bg-purple-800/50 ' + btnStyle;

    // Gestion du clic
    versusBtn.addEventListener('click', () => {
      localStorage.setItem('memory-mode', 'versus');
      localStorage.setItem('memory-opponent', 'friend');
      navigate('/memory-friend');
    });

    guestBtn.addEventListener('click', () => {
      localStorage.setItem('memory-mode', 'versus');
      localStorage.setItem('memory-opponent', 'Guest');
      localStorage.setItem('opponent-name', 'Guest');
      localStorage.removeItem('opponent-id');
      navigate('/customization-memory');
    });

    // Menu de sélection du mode
    const modeMenu = document.createElement("div");
    modeMenu.className = "absolute inset-0 flex flex-col items-center justify-center z-20 bg-black bg-opacity-70 gap-10 ";
    modeMenu.append(versusBtn, guestBtn);

    gameFrame.appendChild(canvas);
    modeMenu.append(versusBtn, guestBtn);
    gameFrame.appendChild(modeMenu);
    gameArea.appendChild(gameFrame);

    // Main layout
    const layout = document.createElement('div');
    layout.className = 'flex flex-1';
    layout.id = 'game-layout';
    layout.appendChild(gameArea);
    container.appendChild(layout);
    
  
    return container;   
}