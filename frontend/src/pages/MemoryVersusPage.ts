import { createSidebar } from "../utils/sidebar";
import { applyUserTheme } from '../utils/theme';

export function createMemoryVersusPage(navigate: (path: string) => void): HTMLElement {
  let moves = 0;
  let currentPlayer = 1;
  const scores: Record<number, number> = { 1: 0, 2: 0 };

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
  gameFrame.className = 'w-5/6 h-5/6 border-4 border-white relative overflow-hidden bg-black grid place-content-center';
  gameFrame.style.backgroundImage = 'url(/assets/background/game_background.jpg)';
  gameFrame.style.backgroundSize = 'cover';
  gameFrame.style.backgroundPosition = 'center';
  gameFrame.classList.add('max-w-[90%]', 'max-h-[80%]');

  const statusBar = document.createElement('div');
  statusBar.className = 'absolute top-4 left-1/2 transform -translate-x-1/2 flex gap-12 text-xl font-semibold';

  const player1Status = document.createElement('div');
  player1Status.textContent = '👤 Joueur 1 : 0';
  const player2Status = document.createElement('div');
  player2Status.textContent = '🎮 Invité : 0';
  const turnIndicator = document.createElement('div');
  turnIndicator.textContent = '👉 Tour de Joueur 1';

  statusBar.appendChild(player1Status);
  statusBar.appendChild(turnIndicator);
  statusBar.appendChild(player2Status);
  gameFrame.appendChild(statusBar);

  const cardsContainer = document.createElement('div');
  cardsContainer.className = 'grid grid-cols-6 gap-2';

  const images = ['comet', 'knight', 'moon', 'star', 'sword', 'dnd'];
  let cards = [...images, ...images];
  cards.sort(() => Math.random() - 0.5);

  let flippedCards: { card: HTMLElement, inner: HTMLElement, icon: string }[] = [];
  let lockBoard = false;

  function createMemoryCard(icon: string): HTMLElement {
    const card = document.createElement('div');
    card.className = 'memory-card w-20 h-28 perspective';
    card.style.perspective = '1000px';

    const innerCard = document.createElement('div');
    innerCard.className = 'memory-inner relative w-full h-full transition-transform duration-500';
    innerCard.style.transformStyle = 'preserve-3d';
    innerCard.style.transform = 'rotateY(0deg)';

    const front = document.createElement('div');
    front.className = 'memory-front absolute w-full h-full rounded-lg';
    front.style.backgroundImage = 'url(/assets/icons/card_background.jpg)';
    front.style.backgroundSize = 'cover';
    front.style.backgroundPosition = 'center';
    front.style.backfaceVisibility = 'hidden';

    const back = document.createElement('div');
    back.className = 'memory-back absolute w-full h-full rounded-lg';
    back.style.backgroundImage = `url(/assets/icons/${icon}.jpg)`;
    back.style.backgroundSize = 'cover';
    back.style.backgroundPosition = 'center';
    back.style.backfaceVisibility = 'hidden';
    back.style.transform = 'rotateY(180deg)';

    innerCard.appendChild(front);
    innerCard.appendChild(back);
    card.appendChild(innerCard);

    return card;
  }

  function updateScoreDisplay() {
    player1Status.textContent = `👤 Joueur 1 : ${scores[1]}`;
    player2Status.textContent = `🎮 Invité : ${scores[2]}`;
  }

  cards.forEach(icon => {
    const card = createMemoryCard(icon);
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

  function checkMatch() {
    const [first, second] = flippedCards;
    // const scores: { [key: number]: number } = { 1: 0, 2: 0 };

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
      }, 500);
    }

    flippedCards = [];
    lockBoard = false;

    const allHidden = Array.from(gameFrame.querySelectorAll('.memory-card'))
        .every(card => (card as HTMLElement).style.visibility === 'hidden');
    if (allHidden) {
      setTimeout(showVictoryAnimation, 800);
    }
  }

  function showVictoryAnimation() {
    const victoryOverlay = document.createElement('div');
    victoryOverlay.className = 'fixed inset-0 bg-black bg-opacity-70 flex flex-col justify-center items-center text-white text-4xl font-bold z-50 space-y-6';

    const winner = scores[1] > scores[2] ? 'Joueur 1' : scores[2] > scores[1] ? 'Invité' : 'Égalité';
    const victoryText = document.createElement('div');
    victoryText.textContent = `🏆 ${winner} a gagné !`;

    const moveText = document.createElement('div');
    moveText.className = 'text-2xl mt-4';
    moveText.textContent = `Scores - Joueur 1 : ${scores[1]}, Invité : ${scores[2]}`;

    const replayBtn = document.createElement('button');
    replayBtn.className = 'mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300';
    replayBtn.textContent = 'Rejouer';
    replayBtn.addEventListener('click', () => {
      moves = 0;
      container.innerHTML = '';
      container.appendChild(createMemoryVersusPage(navigate));
    });

    victoryOverlay.appendChild(victoryText);
    victoryOverlay.appendChild(moveText);
    victoryOverlay.appendChild(replayBtn);
    container.appendChild(victoryOverlay);
  }

  gameFrame.appendChild(cardsContainer);
  gameArea.appendChild(gameFrame);

  const layout = document.createElement('div');
  layout.className = 'flex flex-1';
  layout.id = 'game-layout';
  layout.appendChild(gameArea);

  const backBtn = document.createElement('button');
  backBtn.className = 'fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-300';
  backBtn.textContent = 'Retour à la personnalisation';
  backBtn.addEventListener('click', () => navigate('/customization'));

  container.appendChild(layout);
  container.appendChild(backBtn);

  // Sidebar animation
  sidebar.addEventListener('mouseenter', () => {
    document.querySelectorAll('.sidebar-label').forEach(label => {
      (label as HTMLElement).classList.remove('opacity-0');
      (label as HTMLElement).classList.add('opacity-100');
    });

    const backgroundImage = document.getElementById('backgroundImage');
    if (backgroundImage) backgroundImage.className = 'absolute top-0 left-64 right-0 bottom-0 bg-cover bg-center transition-all duration-300';

    const layout = document.getElementById('game-layout');
    if (layout) layout.classList.add('ml-44');

    const profileSection = document.getElementById('profileCard')?.parentElement;
    if (profileSection) {
      profileSection.className = `
        relative mt-24
        flex flex-row items-start justify-center gap-12
        z-30
      `.replace(/\s+/g, ' ').trim();
    }
  });

  sidebar.addEventListener('mouseleave', () => {
    document.querySelectorAll('.sidebar-label').forEach(label => {
      (label as HTMLElement).classList.add('opacity-0');
      (label as HTMLElement).classList.remove('opacity-100');
    });

    const backgroundImage = document.getElementById('backgroundImage');
    if (backgroundImage) backgroundImage.className = 'absolute top-0 left-20 right-0 bottom-0 bg-cover bg-center transition-all duration-300';

    const layout = document.getElementById('game-layout');
    if (layout) layout.classList.remove('ml-44');

    const profileSection = document.getElementById('profileCard')?.parentElement;
    if (profileSection) {
      profileSection.className = `
        relative mt-24
        flex flex-row items-start justify-center gap-12
        z-30
      `.replace(/\s+/g, ' ').trim();
    }
  });

  return container;
}
