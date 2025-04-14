export function createGamePage(navigate: (path: string) => void): HTMLElement {
  let panelOpen = true;
  let isClicked = false;

  const container = document.createElement('div');
  container.className = 'flex flex-col h-screen bg-blue-900 text-white';

  // Header avec bouton toggle intégré
  const header = document.createElement('header');
  header.className = 'bg-blue-800 p-4 shadow-lg flex items-center';

  const toggleBtn = document.createElement('button');
  toggleBtn.className =
    'bg-blue-600 p-2 mr-4 rounded hover:bg-blue-700 focus:outline-none transition-transform duration-300';
  toggleBtn.innerHTML = '<span class="text-white text-xl">≡</span>';
  toggleBtn.addEventListener('click', () => {
    panelOpen = !panelOpen;
    isClicked = true;
    updatePanel();
    setTimeout(() => {
      isClicked = false;
      updatePanel();
    }, 300);
  });

  const h1 = document.createElement('h1');
  h1.className = 'text-3xl font-bold text-center flex-1';
  h1.textContent = 'Transcendance';

  header.appendChild(toggleBtn);
  header.appendChild(h1);

  // Left panel
  const leftPanel = document.createElement('div');
  leftPanel.id = 'leftPanel';
  leftPanel.className = 'transition-all duration-300 ease-in-out w-64 bg-gray-800 p-4 overflow-y-auto';

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

  leftPanel.appendChild(profileTitle);
  leftPanel.appendChild(avatarWrapper);
  leftPanel.appendChild(infoBox);

  // Central game display
  const gameArea = document.createElement('div');
  gameArea.className = 'flex-1 bg-gray-900 flex justify-center items-center';

  const gameFrame = document.createElement('div');
  gameFrame.className = 'w-3/4 h-3/4 border-4 border-white flex justify-center items-center';

  const gameImage = document.createElement('img');
  gameImage.src = '/assets/photo_pong.png';
  gameImage.alt = 'Game Preview';
  gameImage.className = 'w-full h-full object-cover rounded-lg';

  gameFrame.appendChild(gameImage);
  gameArea.appendChild(gameFrame);

  // Main layout
  const layout = document.createElement('div');
  layout.className = 'flex flex-1';
  layout.appendChild(leftPanel);
  layout.appendChild(gameArea);

  // Bouton retour à la personnalisation
  const backBtn = document.createElement('button');
  backBtn.className =
    'fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-300';
  backBtn.textContent = 'Retour à la personnalisation';
  backBtn.addEventListener('click', () => navigate('/customization'));

  // Update panel toggle classes
  const updatePanel = () => {
    leftPanel.className = `transition-all duration-300 ease-in-out ${
      panelOpen ? 'w-64 bg-gray-800 p-4' : 'w-px bg-blue-600'
    } overflow-y-auto`;

    toggleBtn.className = `bg-blue-600 p-2 mr-4 rounded hover:bg-blue-700 focus:outline-none transition-transform duration-300 ${
      isClicked ? 'rotate-180' : ''
    }`;
  };

  // Assemble page
  container.appendChild(header);
  container.appendChild(layout);
  container.appendChild(backBtn);

  return container;
}
