import { createSidebar } from "../utils/sidebar";
import { applyUserTheme } from '../utils/theme';
import { loadMemorySettings } from '../utils/memorySettings';
import { t } from '../utils/translator';

export function createMemoryVersusPage(navigate: (path: string) => void): HTMLElement {
  let moves = 0;
  let userId: number | null = null;
  const storedUserId = sessionStorage.getItem('userId');
  if (storedUserId && !isNaN(Number(storedUserId))) {
    userId = Number(storedUserId);
  }
  let currentPlayer = 1;
  const opponentType = localStorage.getItem('memory-opponent') || 'guest';
  const opponentName = localStorage.getItem('opponent-name') || t('opponent.guest');
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
  gameHeader.className = 'absolute top-0 left-0 right-0 flex justify-center items-center gap-12 text-xl font-semibold py-2 bg-black bg-opacity-70 z-20';


  const player1Status = document.createElement('div');
  const player2Status = document.createElement('div');
  const turnIndicator = document.createElement('div');
  const timerDisplay = document.createElement('div');

  player1Status.textContent = `👤 ${t('memory.score.you')} : 0`;
  player2Status.textContent = `🎮 ${opponentName} : 0`;
  turnIndicator.textContent = t('memory.turn.you');
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
  cardsContainer.className = 'grid grid-cols-6 gap-2 pt-8';


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
        turnIndicator.textContent = currentPlayer === 1
          ? t('memory.turn.you')
          : t('memory.turn.opponent', { opponent: opponentName });
        updateAvatarHighlight();
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
    player1Status.textContent = `👤 ${t('memory.score.you')} : ${scores[1]}`;
    player2Status.textContent = `🎮 ${opponentName} : ${scores[2]}`;
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
        turnIndicator.textContent = currentPlayer === 1
          ? t('memory.turn.you')
          : t('memory.turn.opponent', { opponent: opponentName });
        startTurnTimer();
        updateAvatarHighlight();
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
    const token = localStorage.getItem("token");

    if (!token) {
      console.warn("❗ Token manquant. Utilisateur non connecté ?");
      return;
    }

    const result = {
      opponent: opponentName,
      score1: scores[1],
      score2: scores[2],
      //winner: scores[1] > scores[2] ? 'Joueur' : scores[2] > scores[1] ? opponentName : 'Égalité',
      winner: scores[1] > scores[2]
      ? t('memory.score.you')
      : scores[2] > scores[1]
      ? opponentName
      : t('memory.victory.draw'),
          pairCount,
      turnTime,
      timestamp: new Date().toISOString(),
    };

    console.log('[DEBUG MEMORY RESULT] Résultat envoyé au backend :', result);

    try {
      const response = await fetch('/api/memory/end', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(result),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`);
      }

      console.log('✅ Résultat sauvegardé avec succès.');
    } catch (error) {
      console.error('❌ Erreur lors de l’envoi des résultats :', error);
    }
  }

  // function showVictoryAnimation() {
  //   const overlay = document.createElement('div');
  //   overlay.className = 'absolute inset-0 bg-black bg-opacity-70 flex flex-col justify-center items-center text-white text-4xl font-bold z-50 space-y-6';

  //   const winner = scores[1] > scores[2] ? 'Vous' : scores[2] > scores[1] ? opponentName : 'Égalité';
  //   const victoryText = document.createElement('div');
  //   if (winner === 'Égalité') {
  //     victoryText.textContent = t('memory.victory.draw');
  //   } else if (winner === 'Vous') {
  //     victoryText.textContent = t('memory.victory.you');
  //   } else {
  //     victoryText.textContent =  t('memory.victory.opponent', { opponent: winner });
  //   }
  //   const scoreText = document.createElement('div');
  //   scoreText.className = 'text-2xl mt-4 text-center leading-relaxed';
  //   scoreText.innerHTML = `
  //     <div class="text-3xl font-semibold underline mb-2">${t('memory.victory.scores')}</div>
  //     <div class="text-center">${t('memory.score.you')} : ${scores[1]}</div>
  //     <div class="text-center">${opponentName} : ${scores[2]}</div>
  //   `;

  //   overlay.append(victoryText, scoreText);
  //   saveMemoryGameResult();
  //   gameFrame.appendChild(overlay);
  // }

  function showVictoryAnimation() {
  const overlay = document.createElement('div');
  overlay.className = 'absolute inset-0 bg-black bg-opacity-70 flex flex-col justify-center items-center text-white text-4xl font-bold z-50 space-y-6';

  const winner = scores[1] > scores[2] ? 'Vous' : scores[2] > scores[1] ? opponentName : 'Égalité';

  // Title
  const bravoText = document.createElement('div');
  bravoText.textContent =
  winner === 'Égalité'
    ? t('memory.victory.draw')
    : winner === 'Vous'
    ? t('memory.victory.you')
    : t('memory.victory.opponent', { opponent: opponentName });
  bravoText.style.cssText = `
    font-size: 48px;
    font-weight: bold;
    text-align: center;
    margin-bottom: 10px;
  `;

  // Score summary
  const scoreText = document.createElement('div');
  scoreText.innerHTML = `
    <div class="text-3xl font-semibold underline mb-2">${t('memory.victory.scores')}</div>
    <div class="text-xl text-center">${t('memory.score.you')} : ${scores[1]}</div>
    <div class="text-xl text-center">${opponentName} : ${scores[2]}</div>
  `;
  scoreText.style.cssText = `
    font-size: 24px;
    text-align: center;
    margin-bottom: 30px;
  `;

  // Return button
  const returnBtn = document.createElement('button');
  returnBtn.textContent = t('memory.backToModes');
  returnBtn.style.cssText = `
    background-color: #d97706;
    color: white;
    font-weight: 700;
    padding: 12px 24px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    font-size: 16px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: background-color 0.2s;
  `;
  returnBtn.onmouseover = () => {
    returnBtn.style.backgroundColor = '#facc15';
  };
  returnBtn.onmouseout = () => {
    returnBtn.style.backgroundColor = '#fbbf24';
  };
  returnBtn.onclick = () => navigate('/memory-mode');

  overlay.appendChild(bravoText);
  overlay.appendChild(scoreText);
  overlay.appendChild(returnBtn);

  saveMemoryGameResult();
  gameFrame.appendChild(overlay);
}


  const avatarsOverlay = document.createElement('div');
  //avatarsOverlay.className = 'w-full flex justify-center items-center gap-32 pt-2 pb-1 z-30';
  avatarsOverlay.className = 'w-full flex justify-center items-center gap-32 pt-1 pb-4 z-30';


 const playerName = localStorage.getItem('username') || 'Vous';
 const playerPicture =
    sessionStorage.getItem('profilePicture') ||
    localStorage.getItem('profile-picture') ||
    '/assets/profile-pictures/default.jpg';

  
  const opponentPicture = opponentType === 'friend'
    ? localStorage.getItem('opponent-picture') || '/assets/profile-pictures/default.jpg'
    : '/assets/guest-avatars/moon.jpg'; // guest = moon


  const createAvatar = (name: string, imgSrc: string): HTMLElement => {
    const wrapper = document.createElement('div');
    wrapper.className = 'flex flex-col items-center';

    const img = document.createElement('img');
    img.src = imgSrc;
    img.alt = name;
    img.className = 'w-20 h-20 rounded-full border-4 shadow-md object-cover';

    const label = document.createElement('div');
    label.textContent = name;
    label.className = 'mt-2 text-base font-semibold text-white bg-black/60 px-4 py-1 rounded-full';

    wrapper.appendChild(img);
    wrapper.appendChild(label);
    return wrapper;
  };

  const playerAvatar = createAvatar(playerName, playerPicture);
  const opponentAvatar = createAvatar(opponentName, opponentPicture);

  const playerImg = playerAvatar.querySelector('img') as HTMLImageElement;
  const opponentImg = opponentAvatar.querySelector('img') as HTMLImageElement;


const updateAvatarHighlight = () => {
  if (currentPlayer === 1) {
    // you’re up
    playerImg.style.borderColor = 'limegreen';
    playerImg.style.opacity = '1';

    opponentImg.style.borderColor = 'rgba(255,0,0,0.5)';
    opponentImg.style.opacity = '0.3';
  } else {
    // opponent’s up
    opponentImg.style.borderColor = 'limegreen';
    opponentImg.style.opacity = '1';

    playerImg.style.borderColor = 'rgba(255,0,0,0.5)';
    playerImg.style.opacity = '0.3';
  }
};


  updateAvatarHighlight(); // initial highlight

  avatarsOverlay.append(playerAvatar, opponentAvatar);

  gameFrame.appendChild(gameHeader);
  gameFrame.appendChild(avatarsOverlay);
  gameFrame.appendChild(cardsContainer);

  //gameFrame.appendChild(avatarsOverlay);
  
  gameArea.appendChild(gameFrame);

  const layout = document.createElement('div');
  layout.className = 'flex flex-col flex-1 gap-2';
  layout.id = 'game-layout';
  layout.appendChild(gameArea);

  // const backBtn = document.createElement('button');
  // backBtn.textContent = t('memory.backToModes');
  // backBtn.className = 'fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg';
  // backBtn.onclick = () => navigate('/memory-mode');

  container.append(layout)
  // container.appendChild(backBtn);

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

