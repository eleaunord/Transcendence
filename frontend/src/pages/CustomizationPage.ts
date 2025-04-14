export function createCustomizationPage(navigate: (path: string) => void): HTMLElement {
  let panelOpen = true;
  let isClicked = false;
  let backgroundImage = '/assets/game-themes/default_cover.jpg';

  const container = document.createElement('div');
  container.className = 'relative flex flex-col h-screen text-white overflow-hidden';

  // BG layer
  const bgLayer = document.createElement('div');
  bgLayer.className = 'absolute inset-0 bg-cover bg-center z-0';
  bgLayer.style.backgroundImage = `url(${backgroundImage})`;

  // Header avec bouton toggle
  const header = document.createElement('header');
  header.className = 'bg-blue-800 p-4 shadow-lg z-20 relative flex items-center';

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

  // Left Panel
  const leftPanel = document.createElement('div');
  leftPanel.id = 'leftPanel';
  leftPanel.className = 'transition-all duration-300 ease-in-out w-64 bg-gray-800/80 p-4 overflow-y-auto z-10';

  const profileTitle = document.createElement('h2');
  profileTitle.className = 'text-xl font-semibold mb-4 text-center';
  profileTitle.textContent = 'Profil';

  const avatar = document.createElement('img');
  avatar.src = '/assets/photo_profil.png';
  avatar.alt = 'Player Profile';
  avatar.className = 'w-24 h-24 rounded-full border-4 border-white cursor-pointer';
  avatar.addEventListener('click', () => navigate('/user-profile'));

  const avatarWrap = document.createElement('div');
  avatarWrap.className = 'flex justify-center mb-4';
  avatarWrap.appendChild(avatar);

  const infoBox = document.createElement('div');
  infoBox.className = 'bg-gray-700/80 p-4 rounded-lg border-2 border-white';
  infoBox.innerHTML = `
    <ul class="space-y-4 text-center text-lg text-white">
      <li><strong>Username:</strong> PlayerOne</li>
      <li><strong>Level:</strong> 5</li>
      <li><strong>Wins:</strong> 10</li>
    </ul>
  `;

  leftPanel.appendChild(profileTitle);
  leftPanel.appendChild(avatarWrap);
  leftPanel.appendChild(infoBox);

  // Central area
  const centralArea = document.createElement('div');
  centralArea.className = 'flex-1 flex justify-center items-center p-6 relative z-10';

  const centralBox = document.createElement('div');
  centralBox.className =
    'w-3/4 h-3/4 border-4 border-white flex justify-center items-center bg-gray-800/80 rounded-lg relative z-20';

  // Theme buttons
  const themes = [
    { name: 'Thème 1', path: '/assets/game-themes/dust.jpg', color: 'bg-red-600 hover:bg-red-700' },
    { name: 'Thème 2', path: '/assets/game-themes/moon_dust.jpg', color: 'bg-green-600 hover:bg-green-700' },
    { name: 'Thème 3', path: '/assets/game-themes/star_dust.jpg', color: 'bg-blue-600 hover:bg-blue-700' },
  ];

  const themeButtons = document.createElement('div');
  themeButtons.className = 'flex justify-between w-full mb-4 absolute top-0 z-30 px-4 py-2';

  themes.forEach(({ name, path, color }) => {
    const btn = document.createElement('button');
    btn.className = `px-4 py-2 ${color} text-white font-semibold rounded-lg`;
    btn.textContent = name;
    btn.addEventListener('click', async () => {
      backgroundImage = path;
      bgLayer.style.backgroundImage = `url(${backgroundImage})`;
      const token = localStorage.getItem('token');
      try {
        await fetch('/api/theme', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ image: path.replace('/assets/game-themes/', '') }),
        });
      } catch (err) {
        console.error('Erreur lors de la sauvegarde du thème', err);
      }
    });
    themeButtons.appendChild(btn);
  });

  // Start button
  const startBtn = document.createElement('button');
  startBtn.type = 'button';
  startBtn.textContent = 'START';
  startBtn.className =
    'w-20 h-20 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full flex items-center justify-center';
  startBtn.addEventListener('click', () => navigate('/game'));

  centralBox.appendChild(themeButtons);
  centralBox.appendChild(startBtn);
  centralArea.appendChild(centralBox);

  // Update panel function
  function updatePanel() {
    leftPanel.className = `transition-all duration-300 ease-in-out ${
      panelOpen ? 'w-64 bg-gray-800/80 p-4' : 'w-px bg-blue-600'
    } overflow-y-auto z-10`;
    toggleBtn.className = `bg-blue-600 p-2 mr-4 rounded hover:bg-blue-700 focus:outline-none transition-transform duration-300 ${
      isClicked ? 'rotate-180' : ''
    }`;
  }

  // Fetch theme on mount
  (async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = await res.json();
      if (user.image) {
        backgroundImage = `/assets/game-themes/${user.image}`;
        bgLayer.style.backgroundImage = `url(${backgroundImage})`;
      }
    } catch (err) {
      console.error('Erreur lors de la récupération du thème utilisateur');
    }
  })();

  // Assemble page
  container.appendChild(bgLayer);
  container.appendChild(header);

  const layout = document.createElement('div');
  layout.className = 'flex flex-1 z-10';
  layout.appendChild(leftPanel);
  layout.appendChild(centralArea);

  container.appendChild(layout);

  return container;
}
