import { createSidebar } from "../utils/sidebar";
import { applyUserTheme } from "../utils/theme";
import { t } from '../utils/translator';

export function createModePage(navigate: (path: string) => void): HTMLElement {
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

    //Menu de sélection du mode
    const modeMenu = document.createElement("div");
    modeMenu.className = "absolute inset-0 flex flex-col items-center justify-center z-20 bg-black bg-opacity-70 gap-10 ";
    
    const btnStyle =
      'w-96 text-center text-white text-5xl font-bold py-4 rounded-lg shadow-lg transition duration-300';

    // Mode Versus
    const versusBtn = document.createElement('button');
    versusBtn.textContent = 'Mode Versus';
    versusBtn.className = 'bg-blue-600/80 hover:bg-blue-700/50 ' + btnStyle;
    versusBtn.addEventListener('click', () => {
      navigate('/customization-game');
    });

    // Mode Tournoi
    const tournamentBtn = document.createElement('button');
    tournamentBtn.textContent = 'Mode Tournoi';
    tournamentBtn.className = 'bg-purple-800 hover:bg-purple-800/50 ' + btnStyle;
    tournamentBtn.addEventListener('click', () => {
      navigate('/tournament');
    });

    // Mode Duo (désactivé)
    const duoWrapper = document.createElement('div');
    duoWrapper.className = 'relative animate-fade-in';

    const duoBtn = document.createElement('button');
    duoBtn.textContent = 'Mode Duo';
    duoBtn.className = 'bg-gray-700 text-white opacity-50 cursor-not-allowed ' + btnStyle;
    duoBtn.disabled = true;
    duoBtn.title = 'Fonctionnalité bientôt disponible !';

    const duoBadge = document.createElement('span');
    duoBadge.textContent = 'À venir';
    duoBadge.className =
      'absolute top-0 right-0 -mt-3 -mr-3 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full shadow';

    duoWrapper.appendChild(duoBtn);
    duoWrapper.appendChild(duoBadge);

    modeMenu.append(versusBtn, tournamentBtn, duoWrapper);

    // Gestion du clic sur Versus
    versusBtn.addEventListener('click', () => {
      navigate('/customization-game'); // ATTENTION 
    });
  
    // Gestion du clic sur Tournoi
    tournamentBtn.addEventListener('click', () => {
      navigate('/tournament');
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