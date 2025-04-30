import { createPongScene } from '../games/pong3d/PongScene';
import { createSidebar } from "../utils/sidebar"; 

export function createGamePage(navigate: (path: string) => void): HTMLElement {

  const container = document.createElement('div');
  container.className = 'flex flex-col h-screen bg-blue-900 text-white';
  
  const sidebar = createSidebar(navigate);
  container.appendChild(sidebar);

   //---------------------Background Image--------------------/
 
   const backgroundImage = document.createElement('div');
   backgroundImage.id = 'backgroundImage';
   backgroundImage.className = 'absolute top-0 left-20 right-0 bottom-0 bg-cover bg-center transition-all duration-300';
   backgroundImage.style.backgroundImage = 'url(/assets/profile-themes/arabesque.png)';
   container.appendChild(backgroundImage);


  const profileTitle = document.createElement('h2');
  profileTitle.className = 'text-xl font-semibold mb-4 text-center';
  profileTitle.textContent = 'Profil';

  const avatar = document.createElement('img');
  avatar.src = '/assets/photo_profil.png';
  avatar.alt = 'Player Profile';
  avatar.className = 'w-24 h-24 rounded-full border-4 border-white cursor-pointer';
  avatar.addEventListener('click', () => navigate('/user-profile'));

  const avatarWrapper = document.createElement('div');
  avatarWrapper.className = 'flex justify-center mb-4';
  avatarWrapper.appendChild(avatar);

  const infoBox = document.createElement('div');
  infoBox.className = 'bg-gray-700 p-4 rounded-lg border-2 border-white';
  infoBox.innerHTML = `
    <ul class="space-y-4 text-center text-lg text-white">
      <li><strong>Username:</strong> PlayerOne</li>
      <li><strong>Level:</strong> 5</li>
      <li><strong>Wins:</strong> 10</li>
    </ul>
  `;

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

  // ▶️ Bouton lancer Pong
  const playBtn = document.createElement('button');
  playBtn.textContent = 'Jouer à Pong 3D';
  playBtn.className =
    'absolute bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition duration-300';
  playBtn.style.top = '40%';
  playBtn.style.left = '50%';
  playBtn.style.transform = 'translate(-50%, -50%)';
  playBtn.addEventListener('click', () => {
    createPongScene(canvas);
    playBtn.remove();
    memoryBtn.remove(); // Enlève aussi le bouton Memory
  });

  // 🎴 Bouton aller au Memory
  const memoryBtn = document.createElement('button');
  memoryBtn.textContent = 'Jouer à Memory';
  memoryBtn.className =
    'absolute bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition duration-300';
  memoryBtn.style.top = '60%';
  memoryBtn.style.left = '50%';
  memoryBtn.style.transform = 'translate(-50%, -50%)';
  memoryBtn.addEventListener('click', () => {
    navigate('/memory');
  });

  const scoreBoard = document.createElement("div");
  scoreBoard.className = "absolute top-6 left-1/2 transform -translate-x-1/2 text-white text-2xl font-bold";
  scoreBoard.innerText = "0 - 0";

  const announce = document.createElement("div");
  announce.className = "absolute top-16 left-1/2 transform -translate-x-1/2 text-yellow-300 text-xl font-semibold";
  announce.innerText = "";
  
  gameFrame.appendChild(canvas);
  gameFrame.appendChild(scoreBoard);
  gameFrame.appendChild(announce);
  gameFrame.appendChild(playBtn);
  gameFrame.appendChild(memoryBtn); // <-- nouveau bouton Memory
  gameArea.appendChild(gameFrame);

  // Main layout
  const layout = document.createElement('div');
  layout.className = 'flex flex-1';
  layout.appendChild(gameArea);

  // Bouton retour
  const backBtn = document.createElement('button');
  backBtn.className =
    'fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-300';
  backBtn.textContent = 'Retour à la personnalisation';
  backBtn.addEventListener('click', () => navigate('/customization'));

  container.appendChild(layout);
  container.appendChild(backBtn);

  return container;
}
