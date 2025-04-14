export function createHomePage(): HTMLElement {
  // Fonction pour démarrer le jeu
  const handleStartGame = () => {
    window.location.href = '/auth';  // Redirection classique
  };

  // Création des éléments
  const container = document.createElement('div');
  container.className = 'relative flex flex-col justify-center items-center h-screen bg-gray-900 text-white';

  const background = document.createElement('div');
  background.className = 'absolute inset-0 bg-cover bg-center opacity-40';
  background.style.backgroundImage = "url(/public/assets/photo_pong.png)";
  container.appendChild(background);

  const content = document.createElement('div');
  content.className = 'relative z-10 flex flex-col justify-center items-center';

  const title = document.createElement('h1');
  title.className = 'text-5xl font-extrabold mb-4';
  title.textContent = 'Bienvenue sur Transcendance !';

  const paragraph = document.createElement('p');
  paragraph.className = 'text-xl mb-8';
  paragraph.textContent = 'Préparez-vous à jouer à un jeu classique avec vos amis.';

  const button = document.createElement('button');
  button.id = 'startGameButton';
  button.className = 'bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-300';
  button.textContent = 'Commencer la partie';
  button.addEventListener('click', handleStartGame);

  // Assemblage
  content.appendChild(title);
  content.appendChild(paragraph);
  content.appendChild(button);
  container.appendChild(content);

  return container;
}


