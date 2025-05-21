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
  
    // 🎮 Canvas Babylon.js
    const canvas = document.createElement('canvas');
    canvas.id = 'pong-canvas';
    canvas.className = 'w-full h-full absolute top-0 left-0';
    canvas.style.display = 'block';
    canvas.style.backgroundColor = 'black';

    //Menu de sélection du mode
    const modeMenu = document.createElement("div");
    modeMenu.className = "absolute inset-0 flex flex-col items-center justify-center z-20 bg-black bg-opacity-70 gap-10 ";
    
    //   boutons de sélection du mode
    const versusBtn = document.createElement('button');
    versusBtn.textContent = t('memory.opponent.friend');
    versusBtn.className =
      ' bg-blue-600/80 hover:bg-blue-700/50 text-white text-5xl font-bold py-4 px-14 rounded-lg shadow-lg transition duration-300';
  
    const guestBtn = document.createElement('button');
    guestBtn.textContent = t('memory.opponent.guest');
    guestBtn.className =
      ' bg-purple-800 hover:bg-purple-800/50 text-white text-5xl font-bold py-4 px-12 rounded-lg shadow-lg transition duration-300';
    modeMenu.append(versusBtn, guestBtn);
    
    // Gestion du clic sur Versus Friend
    versusBtn.addEventListener('click', () => {
      localStorage.setItem('memory-mode', 'versus');
      localStorage.setItem('memory-opponent', 'friend');
      navigate('/memory-friend');
    });
  
    // Gestion du clic sur Versus Guest
    guestBtn.addEventListener('click', () => {
      localStorage.setItem('memory-mode', 'versus');
      localStorage.setItem('memory-opponent', 'guest');
      localStorage.setItem('opponent-name', 'Invité');
      localStorage.removeItem('opponent-id');
      navigate('/customization-memory');
    });


    gameFrame.appendChild(canvas);
    gameArea.appendChild(gameFrame);
    gameFrame.appendChild(modeMenu);
  
    // Main layout
    const layout = document.createElement('div');
    layout.className = 'flex flex-1';
    layout.id = 'game-layout';
    
  
    layout.appendChild(gameArea);
  
    container.appendChild(layout);
    
    sidebar.addEventListener('mouseenter', () => {
      document.querySelectorAll('.sidebar-label').forEach(label => {
        (label as HTMLElement).classList.remove('opacity-0');
        (label as HTMLElement).classList.add('opacity-100');
      });
  
      const backgroundImage = document.getElementById('backgroundImage');
      if (backgroundImage) {
        backgroundImage.className = 'absolute top-0 left-64 right-0 bottom-0 bg-cover bg-center transition-all duration-300';
      }
      const layout = document.getElementById('game-layout');
      if (layout) {
          layout.classList.add('ml-44'); // 11rem = 176px, correspond à w-64 (256px) - w-20 (80px)
      }
    });
  
    // Mouvement de la sidebar 
    sidebar.addEventListener('mouseleave', () => {
      document.querySelectorAll('.sidebar-label').forEach(label => {
        (label as HTMLElement).classList.add('opacity-0');
        (label as HTMLElement).classList.remove('opacity-100');
      });
  
      const backgroundImage = document.getElementById('backgroundImage');
      if (backgroundImage) {
        backgroundImage.className = 'absolute top-0 left-20 right-0 bottom-0 bg-cover bg-center transition-all duration-300';
      }
      const layout = document.getElementById('game-layout');
          if (layout) {
      layout.classList.remove('ml-44');
      }
    });
  
    return container;   
}