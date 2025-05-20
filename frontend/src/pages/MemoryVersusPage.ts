import { createSidebar } from "../utils/sidebar";
import { applyUserTheme } from '../utils/theme';
import { loadMemorySettings } from '../utils/memorySettings';

export function createMemoryVersusPage(navigate: (path: string) => void): HTMLElement {
  let moves = 0;
  let userId: number | null = null;
  let currentPlayer = 1;
  const scores: Record<number, number> = { 1: 0, 2: 0 };
  const { pairCount, theme, turnTime } = loadMemorySettings();

  const themeAssets: Record<string, { background: string; icons: string[]; folder: string }> = {
    classic: {
      background: '/assets/background/game_background.jpg',
      folder: 'theme2',
      icons: ['comet', 'knight', 'moon', 'star', 'sword', 'dnd'],
    },
    cloud: {
      background: '/assets/background/cloud_background.jpg',
      folder: 'theme0',
      icons: ['blue_dragon', 'blue_lady', 'blue_star', 'blue_tarot', 'blue_witch', 'blue_flower'],
    },
    sun: {
      background: '/assets/background/sun_background.jpg',
      folder: 'theme1',
      icons: ['orange_eye', 'orange_knight', 'orange_mage', 'orange_queen', 'orange_tarot', 'orange_witch'],
    },
  };

  const selectedTheme = themeAssets[theme] || themeAssets["classic"];

  let icons: string[] = [];
  while (icons.length < pairCount) icons.push(...selectedTheme.icons);
  icons = icons.slice(0, pairCount);
  let cards = [...icons, ...icons];
  cards.sort(() => Math.random() - 0.5);

  const container = document.createElement('div');
  container.className = 'flex flex-col h-screen bg-gray-900 text-white';
  const sidebar = createSidebar(navigate);
  container.appendChild(sidebar);

  const backgroundImage = document.createElement('div');
  backgroundImage.id = 'backgroundImage';
  backgroundImage.className = 'absolute top-0 left-20 right-0 bottom-0 bg-cover bg-center transition-all duration-300';
  container.appendChild(backgroundImage);
  applyUserTheme(backgroundImage);

  const gameHeader = document.createElement('div');
  gameHeader.className = 'flex justify-center items-center gap-12 text-xl font-semibold py-4 bg-black bg-opacity-60 shadow-md z-10';

  const player1Status = document.createElement('div');
  const player2Status = document.createElement('div');
  const turnIndicator = document.createElement('div');
  const timerDisplay = document.createElement('div');

  player1Status.textContent = `👤 ${userId !== null ? 'Vous' : 'Joueur 1'} : 0`;
  player2Status.textContent = '🎮 Invité : 0';
  turnIndicator.textContent = '👉 Tour de Joueur 1';
  timerDisplay.textContent = '';
  timerDisplay.className = 'text-white';

  gameHeader.append(player1Status, turnIndicator, player2Status, timerDisplay);

  const gameArea = document.createElement('div');
  gameArea.className = 'flex-1 bg-gray-900 flex justify-center items-center';

  const gameFrame = document.createElement('div');
  gameFrame.className = 'w-5/6 h-5/6 border-4 border-white relative overflow-hidden bg-black grid place-content-center';
  gameFrame.style.backgroundImage = `url(${selectedTheme.background})`;
  gameFrame.style.backgroundSize = 'cover';
  gameFrame.style.backgroundPosition = 'center';

  const cardsContainer = document.createElement('div');
  cardsContainer.className = 'grid grid-cols-6 gap-2';

  let flippedCards: { card: HTMLElement, inner: HTMLElement, icon: string }[] = [];
  let lockBoard = false;

  let turnTimer: number | null = null;
  let timeLeft = turnTime ?? 20;

  function updateTimerDisplay() {
    timerDisplay.textContent = `⏱ ${timeLeft}s`;
    timerDisplay.style.color = timeLeft <= 5 ? 'red' : 'white';
  }

  function startTurnTimer() {
    clearTurnTimer();
    timeLeft = turnTime ?? 20;
    updateTimerDisplay();

    turnTimer = window.setInterval(() => {
      timeLeft--;
      updateTimerDisplay();

      if (timeLeft <= 0) {
        clearTurnTimer();
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        turnIndicator.textContent = `👉 Tour de ${currentPlayer === 1 ? 'Joueur 1' : 'Invité'}`;
        startTurnTimer();
      }
    }, 1000);
  }

  function clearTurnTimer() {
    if (turnTimer !== null) {
      clearInterval(turnTimer);
      turnTimer = null;
    }
  }

  function createMemoryCard(icon: string, themeFolder: string): HTMLElement {
    const card = document.createElement('div');
    card.className = 'memory-card w-20 h-28 perspective';
    card.style.perspective = '1000px';

    const inner = document.createElement('div');
    inner.className = 'memory-inner relative w-full h-full transition-transform duration-500';
    inner.style.transformStyle = 'preserve-3d';

    const front = document.createElement('div');
    front.className = 'memory-front absolute w-full h-full rounded-lg';
    front.style.backgroundImage = 'url(/assets/icons/card_background.jpg)';
    front.style.backgroundPosition = 'center';
    front.style.backgroundSize = 'cover';
    front.style.backfaceVisibility = 'hidden';

    const back = document.createElement('div');
    back.className = 'memory-back absolute w-full h-full rounded-lg';
    back.style.backgroundImage = `url(/assets/icons/${themeFolder}/${icon}.jpg)`;
    back.style.backgroundPosition = 'center';
    back.style.backgroundSize = 'cover';
    back.style.backfaceVisibility = 'hidden';
    back.style.transform = 'rotateY(180deg)';

    inner.append(front, back);
    card.appendChild(inner);
    return card;
  }

  function updateScoreDisplay() {
    player1Status.textContent = `👤 ${userId !== null ? 'Vous' : 'Joueur 1'} : ${scores[1]}`;
    player2Status.textContent = `🎮 Invité : ${scores[2]}`;
  }

  cards.forEach(icon => {
    const card = createMemoryCard(icon, selectedTheme.folder);
    const innerCard = card.querySelector('.memory-inner') as HTMLElement;

    card.addEventListener('click', () => {
      if (lockBoard || card.classList.contains('flipped')) return;

      card.classList.add('flipped');
      innerCard.style.transform = 'rotateY(180deg)';
      flippedCards.push({ card, inner: innerCard, icon });

      if (flippedCards.length === 2) {
        lockBoard = true;
        setTimeout(checkMatch, 800);
      }
    });

    cardsContainer.appendChild(card);
  });

  startTurnTimer();

  function checkMatch() {
    const [first, second] = flippedCards;

    if (first.icon === second.icon) {
      scores[currentPlayer]++;
      updateScoreDisplay();
      (first.card as HTMLElement).style.visibility = 'hidden';
      (second.card as HTMLElement).style.visibility = 'hidden';
    } else {
      setTimeout(() => {
        first.inner.style.transform = 'rotateY(0deg)';
        second.inner.style.transform = 'rotateY(0deg)';
        first.card.classList.remove('flipped');
        second.card.classList.remove('flipped');

        currentPlayer = currentPlayer === 1 ? 2 : 1;
        turnIndicator.textContent = `👉 Tour de ${currentPlayer === 1 ? 'Joueur 1' : 'Invité'}`;
        startTurnTimer();
      }, 500);
    }

    flippedCards = [];
    lockBoard = false;

    const allHidden = Array.from(cardsContainer.querySelectorAll('.memory-card'))
      .every(card => (card as HTMLElement).style.visibility === 'hidden');
    if (allHidden) {
      clearTurnTimer();
      setTimeout(showVictoryAnimation, 800);
    }
  }

  async function saveMemoryGameResult() {
    const user_id = Number(sessionStorage.getItem("userId"));

    if (!user_id || isNaN(user_id)) {
      console.warn("❗ user_id invalide ou manquant dans sessionStorage");
      return;
    }

    const result = {
      user_id,
      opponent: 'Invité',
      score1: scores[1],
      score2: scores[2],
      winner: scores[1] > scores[2] ? 'Joueur' : scores[2] > scores[1] ? 'Invité' : 'Égalité',
      pairCount,
      turnTime,
      timestamp: new Date().toISOString(),
    };

    console.log('[DEBUG MEMORY RESULT] Résultat envoyé au backend :', result);

  }


  function showVictoryAnimation() {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black bg-opacity-70 flex flex-col justify-center items-center text-white text-4xl font-bold z-50 space-y-6';

    const winner = scores[1] > scores[2] ? 'Joueur 1' : scores[2] > scores[1] ? 'Invité' : 'Égalité';
    const victoryText = document.createElement('div');
    victoryText.textContent = `🏆 ${winner} a gagné !`;

    const scoreText = document.createElement('div');
    scoreText.className = 'text-2xl mt-4';
    scoreText.textContent = `Scores - Joueur 1 : ${scores[1]}, Invité : ${scores[2]}`;

    const replayBtn = document.createElement('button');
    replayBtn.className = 'mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300';
    replayBtn.textContent = 'Rejouer';
    replayBtn.onclick = () => {
      container.innerHTML = '';
      container.appendChild(createMemoryVersusPage(navigate));
    };

    overlay.append(victoryText, scoreText, replayBtn);
    saveMemoryGameResult();
    container.appendChild(overlay);
  }

  gameFrame.appendChild(cardsContainer);
  gameArea.appendChild(gameFrame);

  const layout = document.createElement('div');
  layout.className = 'flex flex-col flex-1 gap-2';
  layout.id = 'game-layout';
  layout.appendChild(gameHeader);
  layout.appendChild(gameArea);

  const backBtn = document.createElement('button');
  backBtn.textContent = 'Retour aux modes de jeu';
  backBtn.className = 'fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg';
  backBtn.onclick = () => navigate('/memory-mode');

  container.append(layout)
  container.appendChild(backBtn);

  // Adaptation layout/sidebar (effet fluide)
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
    if (layout) layout.classList.add('ml-44');
  });

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
    if (layout) layout.classList.remove('ml-44');
  });

  return container;
}

