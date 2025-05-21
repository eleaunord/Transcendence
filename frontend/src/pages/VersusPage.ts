import { createSidebar } from '../utils/sidebar';
import { createPongScene } from '../games/pong3d/PongScene';
import { applyUserTheme } from "../utils/theme";
import { loadPongSettings } from '../utils/pongSettings';

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
  canvas.style.zIndex = "0";
  canvas.style.display = 'block';
  canvas.style.backgroundColor = 'black';

  const modeMenu = document.createElement("div");
  modeMenu.className = "absolute inset-0 flex items-center justify-center z-20 bg-black bg-opacity-70 gap-8";

  const btnLocal = document.createElement("button");
  btnLocal.textContent = "1 vs 1";
  btnLocal.className = "bg-blue-600 hover:bg-blue-700 text-white text-5xl font-bold py-4 px-12 rounded-lg transition duration-300";

  const btnAI = document.createElement("button");
  btnAI.textContent = "1 vs AI";
  btnAI.className = "bg-purple-600 hover:bg-purple-700 text-white text-5xl font-bold py-4 px-12 rounded-lg transition duration-300";

  modeMenu.append(btnLocal, btnAI);
  gameFrame.appendChild(canvas);
  gameFrame.appendChild(modeMenu);
  gameArea.appendChild(gameFrame);

  const layout = document.createElement('div');
  layout.className = 'flex flex-1';
  layout.id = 'game-layout';
  layout.appendChild(gameArea);

  container.appendChild(layout);

  btnLocal.addEventListener("click", () => {
    modeMenu.remove();
    showMatchAnnouncement("local");
  });

  btnAI.addEventListener("click", () => {
    modeMenu.remove();
    showMatchAnnouncement("ai");
  });

  function showMatchAnnouncement(mode: 'local' | 'ai') {
    const announcementOverlay = document.createElement("div");
    announcementOverlay.className = "absolute inset-0 z-30 flex justify-center items-center";
    gameFrame.appendChild(announcementOverlay);

    const matchBox = document.createElement("div");
    matchBox.className = "relative z-20 w-fit px-16 py-12 bg-white/10 backdrop-blur-md rounded-2xl border-4 border-yellow-400 shadow-2xl text-center";

    const title = document.createElement("div");
    title.textContent = "VERSUS";
    title.className = "text-2xl font-bold text-yellow-400 mb-8 tracking-widest";
    matchBox.appendChild(title);

    const playersContainer = document.createElement("div");
    playersContainer.className = "flex items-center justify-center gap-16";

    const createPlayerCard = (imgSrc: string, username: string): HTMLElement => {
      const card = document.createElement("div");
      card.className = "flex flex-col items-center";

      const spinningBorder = document.createElement("div");
      spinningBorder.className = "relative w-32 h-32 flex items-center justify-center";

      const animatedBorder = document.createElement("div");
      animatedBorder.className = "absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-spin-slow";

      const staticBackground = document.createElement("div");
      staticBackground.className = "relative w-28 h-28 bg-gray-900 rounded-full flex items-center justify-center overflow-hidden";

      const img = document.createElement("img");
      img.src = imgSrc;
      img.alt = "Profile";
      img.className = "w-full h-full object-cover rounded-full border-4 border-gray-900";

      staticBackground.appendChild(img);
      spinningBorder.appendChild(animatedBorder);
      spinningBorder.appendChild(staticBackground);
      card.appendChild(spinningBorder);

      const name = document.createElement("div");
      name.textContent = username;
      name.className = "text-lg font-semibold mt-3";
      card.appendChild(name);

      return card;
    };

    const userImage = sessionStorage.getItem("profilePicture") || "/assets/profile-pictures/default.jpg";
    const username = sessionStorage.getItem("username") || "Player 1";
    const userCard = createPlayerCard(userImage, username);

    let opponentCard: HTMLElement;
    if (mode === 'local') {
      const player2Image = sessionStorage.getItem("profilePicture") || "/assets/profile-pictures/default.jpg";
      const player2Name = "Guest";
      opponentCard = createPlayerCard(player2Image, player2Name);
    } else {
      opponentCard = createPlayerCard("/assets/profile-pictures/default.jpg", "AI");
    }

    const vsLabel = document.createElement("div");
    vsLabel.textContent = "VS";
    vsLabel.className = "text-3xl font-bold text-yellow-300";

    playersContainer.append(userCard, vsLabel, opponentCard);
    matchBox.appendChild(playersContainer);

    const message = document.createElement("div");
    message.className = "text-xl font-bold text-yellow-300 mt-6";
    matchBox.appendChild(message);

    announcementOverlay.appendChild(matchBox);

    let countdown = 4;
    message.textContent = `Game starts in ${countdown}...`;

    const interval = setInterval(() => {
      countdown--;
      if (countdown > 0) {
        message.textContent = `Game starts in ${countdown}...`;
      } else {
        clearInterval(interval);
        announcementOverlay.remove();
        launchGame(mode);
      }
    }, 1000);
  }

  async function launchGame(mode: 'local' | 'ai') {
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

    const btnReturn = document.createElement("button");
    btnReturn.textContent = "Rejouer";
    btnReturn.className = `
      absolute bottom-8 left-1/2 transform -translate-x-1/2 
      bg-yellow-400 hover:bg-yellow-500 text-black font-bold 
      py-3 px-8 rounded-lg shadow-lg transition duration-300 hidden z-20
    `.replace(/\s+/g, ' ').trim();

    btnReturn.addEventListener("click", () => {
      navigate("/mode");
    });

    gameFrame.appendChild(scoreBoard);
    gameFrame.appendChild(announce);
    gameFrame.appendChild(btnReturn);

    const username = sessionStorage.getItem("username") || "Player 1";
    const opponentName = mode === "ai" ? "AI" : "Guest";

    const playerLabel = document.createElement("div");
    playerLabel.textContent = username;
    playerLabel.className = `
      absolute top-4 left-6 text-white font-bold z-30 text-lg
    `.replace(/\s+/g, ' ').trim();

    const opponentLabel = document.createElement("div");
    opponentLabel.textContent = opponentName;
    opponentLabel.className = `
      absolute top-4 right-6 text-white font-bold z-30 text-lg text-right
    `.replace(/\s+/g, ' ').trim();

    gameFrame.appendChild(playerLabel);
    gameFrame.appendChild(opponentLabel);

    const settings = loadPongSettings();

    await createPongScene(
      canvas,
      {
        mode,
        speed: settings.speed,
        scoreToWin: settings.scoreToWin,
        paddleSize: settings.paddleSize,
        theme: settings.theme
      },
      btnReturn
    );
  }

  return container;
}
