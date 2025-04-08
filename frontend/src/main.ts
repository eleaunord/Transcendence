import { HomePage } from './pages/HomePage';
import { GamePage } from './pages/GamePage';

const app = document.getElementById('app');

// Fonction pour afficher la page d'accueil
function showHomePage() {
  if (app) {
    app.innerHTML = HomePage();  // Injecte la page d'accueil dans le div avec l'id "app"
    
    // Attacher l'événement de clic pour commencer la partie
    const startButton = document.getElementById('startGameButton');
    if (startButton) {
      startButton.addEventListener('click', () => {
        showGamePage();  // Afficher la page de jeu
      });
    }
  }
}

// Fonction pour afficher la page de jeu avec le panneau coulissant
function showGamePage() {
  if (app) {
    app.innerHTML = GamePage();  // Injecte la page de jeu dans le div avec l'id "app"

    // Attacher l'événement pour faire coulisser l'encadré gauche
    const toggleButton = document.getElementById('togglePanel');
    const leftPanel = document.getElementById('leftPanel');

    if (toggleButton && leftPanel) {
      toggleButton.addEventListener('click', () => {
        // Si le panneau est actuellement visible, on le cache avec un effet de glissement
        if (leftPanel.classList.contains('w-64')) {
          leftPanel.classList.remove('w-64');
          leftPanel.classList.add('w-0'); // Réduit la largeur à 0
          leftPanel.style.transform = 'translateX(-100%)';  // Fait glisser le panneau à gauche (hors de l'écran)
        } else {
          leftPanel.classList.remove('w-0');
          leftPanel.classList.add('w-64'); // Restaure la largeur normale
          leftPanel.style.transform = 'translateX(0)';  // Fait revenir le panneau à sa position normale
        }
      });
    }
  }
}

// Initialiser l'application en affichant la page d'accueil (et non la page de jeu)
showHomePage();