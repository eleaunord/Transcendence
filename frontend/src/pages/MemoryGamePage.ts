import { createSidebar } from "../utils/sidebar"; 
import { applyUserTheme } from '../utils/theme';

export function createMemoryGamePage(navigate: (path: string) => void): HTMLElement {
    let moves = 0; // Compteur de coups
  
    const container = document.createElement('div');
    container.className = 'flex flex-col h-screen bg-gray-900 text-white';
    const sidebar = createSidebar(navigate);
    container.appendChild(sidebar);
    //---------------------Background Image--------------------/
 
     const backgroundImage = document.createElement('div');
     backgroundImage.id = 'backgroundImage';
     backgroundImage.className = 'absolute top-0 left-20 right-0 bottom-0 bg-cover bg-center transition-all duration-300';
     backgroundImage.style.backgroundImage = 'url(/assets/profile-themes/arabesque.png)';
     
     applyUserTheme(backgroundImage);
     container.appendChild(backgroundImage);

  
    // Game Area
    const gameArea = document.createElement('div');
    gameArea.className = 'flex-1 bg-gray-900 flex justify-center items-center';
  
    const gameFrame = document.createElement('div');
    gameFrame.className = 'w-5/6 h-5/6 border-4 border-white relative overflow-hidden bg-black grid place-content-center';
    gameFrame.style.backgroundImage = 'url(/assets/background/game_background.jpg)';
    gameFrame.style.backgroundSize = 'cover';
    gameFrame.style.backgroundPosition = 'center';
    gameFrame.classList.add('max-w-[90%]', 'max-h-[80%]');
  
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'grid grid-cols-6 gap-2';
  
    const images = ['comet', 'knight', 'moon', 'star', 'sword', 'dnd'];
    let cards = [...images, ...images];
    cards.sort(() => Math.random() - 0.5);
  
    let flippedCards: { card: HTMLElement, inner: HTMLElement, icon: string }[] = [];
    let lockBoard = false;
  
    // Fonction pour créer une carte
    function createMemoryCard(icon: string): HTMLElement {
      const card = document.createElement('div');
      card.className = 'memory-card w-20 h-28 perspective'; // taille plus compacte
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
      back.style.transform = 'rotateY(180deg)'; // Image retournée
  
      innerCard.appendChild(front);
      innerCard.appendChild(back);
      card.appendChild(innerCard);
  
      return card;
    }
  
    cards.forEach(icon => {
      const card = createMemoryCard(icon);
      const innerCard = card.querySelector('.memory-inner') as HTMLElement;
  
      card.addEventListener('click', () => {
        if (lockBoard || card.classList.contains('flipped')) return;
  
        card.classList.add('flipped');
        innerCard.style.transform = 'rotateY(180deg)';
        flippedCards.push({ card, inner: innerCard, icon });
  
        moves++; // Compter les coups
  
        if (flippedCards.length === 2) {
          lockBoard = true;
          setTimeout(checkMatch, 800);
        }
      });
  
      cardsContainer.appendChild(card);
    });
  
    gameFrame.appendChild(cardsContainer);
  
    function checkMatch() {
      const [first, second] = flippedCards;
  
      if (first.icon === second.icon) {
        first.card.removeEventListener('click', () => { });
        second.card.removeEventListener('click', () => { });
      } else {
        first.inner.style.transform = 'rotateY(0deg)';
        second.inner.style.transform = 'rotateY(0deg)';
        first.card.classList.remove('flipped');
        second.card.classList.remove('flipped');
      }
      flippedCards = [];
      lockBoard = false;
  
      const allFlipped = Array.from(gameFrame.querySelectorAll('.memory-card')).every(card => card.classList.contains('flipped'));
      if (allFlipped) {
        setTimeout(showVictoryAnimation, 500);
      }
    }
  
    function showVictoryAnimation() {
      const victoryOverlay = document.createElement('div');
      victoryOverlay.className = 'fixed inset-0 bg-black bg-opacity-70 flex flex-col justify-center items-center text-white text-4xl font-bold z-50 space-y-6';
      
      const victoryText = document.createElement('div');
      victoryText.textContent = `🎉 Bravo ! 🎉`;
  
      const moveText = document.createElement('div');
      moveText.className = 'text-2xl mt-4';
      moveText.textContent = `Tu as terminé en ${moves} coups !`;
  
      const replayBtn = document.createElement('button');
      replayBtn.className = 'mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300';
      replayBtn.textContent = 'Rejouer';
      replayBtn.addEventListener('click', () => {
        moves = 0;
        container.innerHTML = '';
        container.appendChild(createMemoryGamePage(navigate));
      });
  
      victoryOverlay.appendChild(victoryText);
      victoryOverlay.appendChild(moveText);
      victoryOverlay.appendChild(replayBtn);
  
      container.appendChild(victoryOverlay);
    }
  
    const layout = document.createElement('div');
    layout.className = 'flex flex-1';
    layout.id = 'game-layout';
    // layout.appendChild(leftPanel);
    layout.appendChild(gameArea);
  
    gameArea.appendChild(gameFrame);
  
    const backBtn = document.createElement('button');
    backBtn.className = 'fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-300';
    backBtn.textContent = 'Retour à la personnalisation';
    backBtn.addEventListener('click', () => navigate('/customization'));
  

    container.appendChild(layout);
    container.appendChild(backBtn);
  
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
      if (backgroundImage) {
        backgroundImage.className = 'absolute top-0 left-20 right-0 bottom-0 bg-cover bg-center transition-all duration-300';
      }
      const layout = document.getElementById('game-layout');
          if (layout) {
      layout.classList.remove('ml-44');
      }
  
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
  