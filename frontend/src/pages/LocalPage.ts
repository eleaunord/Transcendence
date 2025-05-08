import { createPongScene } from '../games/pong3d/PongScene';
import { createSidebar } from "../utils/sidebar"; 
import { applyUserTheme } from "../utils/theme";

export function createLocalPage(navigate: (path: string) => void): HTMLElement {

      const container = document.createElement('div');
      container.className = 'flex flex-col h-screen bg-gray-900 text-white';
    
      const sidebar = createSidebar(navigate);
      container.appendChild(sidebar);
    
      const backgroundImage = document.createElement('div');
      backgroundImage.id = 'backgroundImage';
      backgroundImage.className = 'absolute top-0 left-20 right-0 bottom-0 bg-cover bg-center transition-all duration-300';
  
      container.appendChild(backgroundImage);
      applyUserTheme(backgroundImage);
    
      const gameArea = document.createElement('div');
      gameArea.className = 'flex-1 bg-gray-900 flex justify-center items-center';
    
      const gameFrame = document.createElement('div');
      gameFrame.className = 'w-3/4 h-3/4 border-4 border-white relative overflow-hidden bg-black';
    
      const canvas = document.createElement('canvas');
      canvas.id = 'pong-canvas';
      canvas.className = 'w-full h-full absolute top-0 left-0';
      canvas.style.display = 'block';
      canvas.style.backgroundColor = 'black';
    
      const modeMenu = document.createElement("div");
      modeMenu.className = "absolute inset-0 flex flex-col items-center justify-center gap-4 z-20 bg-black bg-opacity-70";
    
      const btnLocal = document.createElement("button");
      btnLocal.textContent = "Jouer à 2 sur le même clavier";
      btnLocal.className = "bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded";
    
      const btnAI = document.createElement("button");
      btnAI.textContent = "Jouer contre l'IA";
      btnAI.className = "bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded";
    
      modeMenu.append(btnLocal, btnAI);
    
      btnLocal.addEventListener("click", () => {
        navigate("/local");
        // modeMenu.remove();
        // launchGame("local");
      });
    
      btnAI.addEventListener("click", () => {
        // modeMenu.remove();
        navigate("/ai");
        // launchGame("ai");
      });
    
      function launchGame(mode: 'local' | 'ai') {
        memoryBtn.style.display = "none";
        const scoreBoard = document.createElement("div");
        scoreBoard.id = "scoreBoard";
        scoreBoard.className = `
          absolute top-6 left-1/2 transform -translate-x-1/2
          text-3xl font-bold z-10
        `.replace(/\s+/g, ' ').trim();
        scoreBoard.innerText = "0 - 0";
    
        scoreBoard.style.color = '#e0e7ff';
        scoreBoard.style.textShadow = `
          0 0 6px rgba(255, 255, 255, 0.5),
          0 0 10px rgba(173, 216, 230, 0.4),
          0 0 16px rgba(255, 255, 200, 0.3)
        `;
        scoreBoard.style.transition = 'all 0.3s ease-in-out';
    
        const announce = document.createElement("div");
        announce.id = "announce";
        announce.className = "absolute top-16 left-1/2 transform -translate-x-1/2 text-yellow-300 text-xl font-semibold";
        announce.innerText = "";
    
        gameFrame.appendChild(scoreBoard);
        gameFrame.appendChild(announce);
    
        createPongScene(canvas, { mode });
      }
    
      const memoryBtn = document.createElement('button');
      memoryBtn.textContent = 'Jouer à Memory';
      memoryBtn.className =
      'absolute z-30 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition duration-300';
      memoryBtn.style.top = '80%';
      memoryBtn.style.left = '50%';
      memoryBtn.style.transform = 'translate(-50%, -50%)';
      memoryBtn.addEventListener('click', () => {
        navigate('/memory');
      });
    
      gameFrame.appendChild(canvas);
      gameFrame.appendChild(modeMenu);
      gameFrame.appendChild(memoryBtn);
      gameArea.appendChild(gameFrame);
    
      const layout = document.createElement('div');
      layout.className = 'flex flex-1';
      layout.id = 'game-layout';
      layout.appendChild(gameArea);
    
      const backBtn = document.createElement('button');
      backBtn.className =
        'fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-300';
      backBtn.textContent = 'Retour à la personnalisation';
      backBtn.addEventListener('click', () => navigate('/customization'));
    
      container.appendChild(layout);
      container.appendChild(backBtn);
    
      return container;
    }
    