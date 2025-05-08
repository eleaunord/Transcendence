import  {createSidebar} from '../utils/sidebar';
import { createPongScene } from '../games/pong3d/PongScene';
import { applyUserTheme } from "../utils/theme";

export function createVersusPage(navigate: (path: string) => void): HTMLElement {
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
//   modeMenu.className = "absolute inset-0 flex flex-col items-center justify-center gap-6 z-20 bg-black bg-opacity-70";
  modeMenu.className = "absolute inset-0 flex items-center justify-center z-20 bg-black bg-opacity-70 gap-8 ";

  const btnLocal = document.createElement("button");
  btnLocal.textContent = "1 vs 1";
  btnLocal.className = "bg-blue-600 hover:bg-blue-700 text-white text-5xl font-bold py-4 px-12 rounded-lg transition duration-300";

  const btnAI = document.createElement("button");
  btnAI.textContent = "1 vs AI";
  btnAI.className = "bg-purple-600 hover:bg-purple-700 text-white text-5xl font-bold py-4 px-12 rounded-lg transition duration-300";

  modeMenu.append(btnLocal, btnAI);

  btnLocal.addEventListener("click", () => {
    modeMenu.remove();
    launchGame("local");
  });

  btnAI.addEventListener("click", () => {
    modeMenu.remove();
    launchGame("ai");
  });

  function launchGame(mode: 'local' | 'ai') {
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
  gameFrame.appendChild(canvas);
  gameFrame.appendChild(modeMenu);
  gameArea.appendChild(gameFrame);

  const layout = document.createElement('div');
  layout.className = 'flex flex-1';
  layout.id = 'game-layout';
  layout.appendChild(gameArea);

  container.appendChild(layout);
  return container;
}
