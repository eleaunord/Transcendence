import { createSidebar } from "../utils/sidebar";
import { applyUserTheme } from '../utils/theme';
import { loadMemorySettings } from '../utils/memorySettings';
import { t } from '../utils/translator';


export function createMemoryGamePage(navigate: (path: string) => void): HTMLElement {
  const { pairCount, theme, timerMode } = loadMemorySettings();

  const themeAssets: Record<string, { background: string; icons: string[]; folder: string }> = {
    classic: {
      background: '/assets/Memory/Theme2/memory_bg1.jpg',
      folder: 'Theme2',
      icons: ['memory_th1_01', 'memory_th1_02', 'memory_th1_03', 'memory_th1_04', 'memory_th1_05', 'memory_th1_06'],
    },
    cloud: {
      background: '/assets/Memory/Theme1/memory_bg0.jpg',
      folder: 'Theme1',
      icons: ['memory_th0_01', 'memory_th0_02', 'memory_th0_03', 'memory_th0_04', 'memory_th0_05', 'memory_th0_06'],
    },
    sun: {
      background: '/assets/Memory/Theme3/memory_bg2.jpg',
      folder: 'Theme3',
      icons: ['memory_th2_01', 'memory_th2_02', 'memory_th2_03', 'memory_th2_04', 'memory_th2_05', 'memory_th2_06'],
    },
  };

  const selectedTheme = themeAssets[theme] || themeAssets.classic;
  let icons: string[] = [];
  while (icons.length < pairCount) icons.push(...selectedTheme.icons);
  icons = icons.slice(0, pairCount);
  const cards = [...icons, ...icons].sort(() => Math.random() - 0.5);

  let moves = 0;
  let timeLeft: number = timerMode === 'short' ? 60 : timerMode === 'medium' ? 90 : timerMode === 'long' ? 120 : 0;
  let timerInterval: number | null = null;
  const flippedCards: { card: HTMLElement, inner: HTMLElement, icon: string }[] = [];
  let lockBoard = false;

  const container = document.createElement('div');
  container.className = 'flex flex-col h-screen bg-gray-900 text-white';
  const sidebar = createSidebar(navigate);
  container.appendChild(sidebar);

  const backgroundImage = document.createElement('div');
  backgroundImage.id = 'backgroundImage';
  backgroundImage.className = 'absolute top-0 left-20 right-0 bottom-0 bg-cover bg-center transition-all duration-300';
  container.appendChild(backgroundImage);
  applyUserTheme(backgroundImage);

  const layout = document.createElement('div');
  layout.className = 'flex flex-col flex-1 gap-2';
  layout.id = 'game-layout';

  const gameHeader = document.createElement('div');
  gameHeader.className = 'flex justify-center items-center gap-8 text-xl font-semibold py-4 bg-black bg-opacity-60 shadow-md z-10';

  const movesDisplay = document.createElement('div');
  movesDisplay.textContent = `🔢 ${t('memory.moves')}: 0`;

  const timerDisplay = document.createElement('div');
  timerDisplay.textContent = timerMode !== 'none' ? `⏱ ${t('memory.time')}: ${timeLeft}s` : '';
  timerDisplay.className = 'text-white';

  gameHeader.appendChild(movesDisplay);timerDisplay.textContent = timerMode !== 'none' ? `⏱ ${t('memory.time')}: ${timeLeft}s` : '';
  if (timerMode !== 'none') gameHeader.appendChild(timerDisplay);
  layout.appendChild(gameHeader);

  const gameArea = document.createElement('div');
  gameArea.className = 'flex-1 bg-gray-900 flex justify-center items-center';

  const gameFrame = document.createElement('div');
  gameFrame.className = 'w-5/6 h-5/6 border-4 border-white relative overflow-hidden bg-black grid place-content-center';
  gameFrame.style.backgroundImage = `url(${selectedTheme.background})`;
  gameFrame.style.backgroundSize = 'cover';
  gameFrame.style.backgroundPosition = 'center';

  const cardsContainer = document.createElement('div');
  cardsContainer.className = 'grid grid-cols-6 gap-2';

  function createMemoryCard(icon: string, folder: string): HTMLElement {
    const card = document.createElement('div');
    card.className = 'memory-card w-20 h-28 perspective';
    card.style.perspective = '1000px';

    const innerCard = document.createElement('div');
    innerCard.className = 'memory-inner relative w-full h-full transition-transform duration-500';
    innerCard.style.transformStyle = 'preserve-3d';
    innerCard.style.transform = 'rotateY(0deg)';

    const front = document.createElement('div');
    front.className = 'memory-front absolute w-full h-full rounded-lg';
    front.style.backgroundImage = 'url(/assets/Memory/memory_backcard.jpg)';
    front.style.backgroundSize = 'cover';
    front.style.backgroundPosition = 'center';
    front.style.backfaceVisibility = 'hidden';

    const back = document.createElement('div');
    back.className = 'memory-back absolute w-full h-full rounded-lg';
    back.style.backgroundImage = `url(/assets/Memory/${folder}/${icon}.jpg)`;
    back.style.backgroundSize = 'cover';
    back.style.backgroundPosition = 'center';
    back.style.backfaceVisibility = 'hidden';
    back.style.transform = 'rotateY(180deg)';

    innerCard.appendChild(front);
    innerCard.appendChild(back);
    card.appendChild(innerCard);

    return card;
  }

  function updateTimerDisplay() {
    if (timerMode !== 'none') timerDisplay.textContent = `⏱ ${t('memory.time')}: ${timeLeft}s`;
  }

  function startTimer() {
    if (timerMode === 'none') return;
    timerInterval = window.setInterval(() => {
      timeLeft--;
      updateTimerDisplay();
      if (timeLeft <= 0) {
        clearInterval(timerInterval!);
        showGameOver();
      }
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval !== null) clearInterval(timerInterval);
  }

  function checkMatch() {
    const [first, second] = flippedCards;

    if (first.icon === second.icon) {
      first.card.removeEventListener('click', () => {});
      second.card.removeEventListener('click', () => {});
    } else {
      first.inner.style.transform = 'rotateY(0deg)';
      second.inner.style.transform = 'rotateY(0deg)';
      first.card.classList.remove('flipped');
      second.card.classList.remove('flipped');
    }

    flippedCards.length = 0;
    lockBoard = false;

    const allFlipped = Array.from(gameFrame.querySelectorAll('.memory-card')).every(card => card.classList.contains('flipped'));
    if (allFlipped) {
      stopTimer();
      setTimeout(showVictoryAnimation, 500);
    }
  }

function showVictoryAnimation() {
  const overlay = document.createElement('div');
  overlay.className = 'absolute inset-0 bg-black bg-opacity-70 flex flex-col justify-center items-center text-white font-bold z-50';

  // Title
  const bravoText = document.createElement('div');
  bravoText.textContent = t('memory.victory.solo');
  bravoText.style.cssText = `
    font-size: 48px;
    font-weight: bold;
    text-align: center;
    margin-bottom: 10px;
  `;

  // Subtitle
  const moveCountText = document.createElement('div');
  moveCountText.textContent = t('memory.victory.moves', { count: moves });
  moveCountText.style.cssText = `
    font-size: 24px;
    text-align: center;
    margin-bottom: 30px;
  `;

  // Styled return button
  const returnBtn = document.createElement('button');
  returnBtn.textContent = t('memory.backToModes');
  returnBtn.style.cssText = `
    background-color: #d97706; /* Darker amber for contrast */
    color: white;
    font-weight: 700;          /* Bold text */
    padding: 12px 24px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    font-size: 16px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: background-color 0.2s;
  `;



  returnBtn.onmouseover = () => {
    returnBtn.style.backgroundColor = '#facc15'; // Brighter hover effect
  };
  returnBtn.onmouseout = () => {
    returnBtn.style.backgroundColor = '#fbbf24';
  };


  returnBtn.onclick = () => navigate('/memory-mode');

  overlay.appendChild(bravoText);
  overlay.appendChild(moveCountText);
  overlay.appendChild(returnBtn);

  gameFrame.appendChild(overlay);
}


  // function showGameOver() {
  //   const overlay = document.createElement('div');
  //   overlay.className = 'absolute inset-0 bg-black bg-opacity-80 flex flex-col justify-center items-center text-white text-4xl font-bold z-50 space-y-6';

  //   overlay.innerHTML = `<div>💀 Temps écoulé !</div><div class="text-2xl mt-4">Tu as perdu...</div>`;
  //   gameFrame.appendChild(overlay);
  // }

  function showGameOver() {
  const overlay = document.createElement('div');
  overlay.className = 'absolute inset-0 bg-black bg-opacity-80 flex flex-col justify-center items-center text-white text-4xl font-bold z-50 space-y-6';

  const title = document.createElement('div');
  title.textContent = t('memory.defeat.timeout');

  const subtitle = document.createElement('div');
  subtitle.textContent = t('memory.defeat.message');
  subtitle.className = 'text-2xl mt-4';

  overlay.innerHTML = ''; // efface le innerHTML brut
  overlay.appendChild(title);
  overlay.appendChild(subtitle);

  gameFrame.appendChild(overlay);
}

  cards.forEach(icon => {
    const card = createMemoryCard(icon, selectedTheme.folder);
    const innerCard = card.querySelector('.memory-inner') as HTMLElement;

    card.addEventListener('click', () => {
      if (lockBoard || card.classList.contains('flipped')) return;
      card.classList.add('flipped');
      innerCard.style.transform = 'rotateY(180deg)';
      flippedCards.push({ card, inner: innerCard, icon });
      moves++;
      movesDisplay.textContent = `🔢 ${t('memory.moves')}: ${moves}`;

      if (flippedCards.length === 2) {
        lockBoard = true;
        setTimeout(checkMatch, 800);
      }
    });

    cardsContainer.appendChild(card);
  });

  startTimer();
  gameFrame.appendChild(cardsContainer);
  gameArea.appendChild(gameFrame);
  layout.appendChild(gameArea);

  container.appendChild(layout);

  // const backBtn = document.createElement('button');
  // backBtn.className = 'fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg';
  // backBtn.textContent = 'Retour aux modes de jeu';
  // backBtn.onclick = () => navigate('/memory-mode');
  // container.appendChild(backBtn);

  // sidebar.addEventListener('mouseenter', () => {
  //   document.querySelectorAll('.sidebar-label').forEach(label => {
  //     (label as HTMLElement).classList.remove('opacity-0');
  //     (label as HTMLElement).classList.add('opacity-100');
  //   });
  //   const bg = document.getElementById('backgroundImage');
  //   if (bg) bg.className = 'absolute top-0 left-64 right-0 bottom-0 bg-cover bg-center transition-all duration-300';
  //   const layoutEl = document.getElementById('game-layout');
  //   if (layoutEl) layoutEl.classList.add('ml-44');
  // });

  // sidebar.addEventListener('mouseleave', () => {
  //   document.querySelectorAll('.sidebar-label').forEach(label => {
  //     (label as HTMLElement).classList.add('opacity-0');
  //     (label as HTMLElement).classList.remove('opacity-100');
  //   });
  //   const bg = document.getElementById('backgroundImage');
  //   if (bg) bg.className = 'absolute top-0 left-20 right-0 bottom-0 bg-cover bg-center transition-all duration-300';
  //   const layoutEl = document.getElementById('game-layout');
  //   if (layoutEl) layoutEl.classList.remove('ml-44');
  // });

  return container;
}
  