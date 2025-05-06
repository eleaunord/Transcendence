import { createSidebar } from "../utils/sidebar";

export function createLeaderboardPage(navigate: (path: string) => void): HTMLElement {
  const container = document.createElement('div');
  container.className = 'relative min-h-screen bg-gray-900 text-white overflow-hidden';

  const sidebar = createSidebar(navigate);
  sidebar.classList.add('z-40'); // Ensure sidebar is above background
  container.appendChild(sidebar);

  const backgroundImage = document.createElement('div');
  backgroundImage.id = 'backgroundImage';
  backgroundImage.className = 'absolute top-0 left-20 right-0 bottom-0 bg-cover bg-center transition-all duration-300 z-10';
  backgroundImage.style.backgroundImage = 'url(/assets/profile-themes/arabesque.png)';
  container.appendChild(backgroundImage);

  const leaderboardSection = document.createElement('div');
  leaderboardSection.className = 'relative mt-24 flex flex-col items-center z-30';

  const title = document.createElement('h2');
  title.textContent = 'Leaderboard';
  title.className = 'text-4xl font-bold mb-8 text-white';
  leaderboardSection.appendChild(title);

  const leaderboardCard = document.createElement('div');
  leaderboardCard.className = 'bg-gray-700/80 backdrop-blur-md p-4 rounded-md shadow-xl w-[32rem]'; // increased width and padding

  const table = document.createElement('table');
  table.className = 'w-full text-center text-white border-collapse';

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  headerRow.className = 'bg-gray-600/90';

  const friendHeader = document.createElement('th');
  friendHeader.textContent = 'Friends';
  friendHeader.className = 'py-3 px-6 text-lg font-semibold'; // increased padding and text size

  const pointsHeader = document.createElement('th');
  pointsHeader.textContent = 'Points';
  pointsHeader.className = 'py-3 px-6 text-lg font-semibold'; // increased padding and text size

  headerRow.appendChild(friendHeader);
  headerRow.appendChild(pointsHeader);
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');

  const medalSVGs = {
    gold: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="inline-block ml-2">
      <circle cx="12" cy="12" r="10" fill="#FFD700" stroke="#FF8C00" stroke-width="1"/>
      <text x="12" y="16" font-size="12" font-weight="bold" text-anchor="middle" fill="#FF8C00">1</text>
    </svg>`,
    silver: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="inline-block ml-2">
      <circle cx="12" cy="12" r="10" fill="#C0C0C0" stroke="#808080" stroke-width="1"/>
      <text x="12" y="16" font-size="12" font-weight="bold" text-anchor="middle" fill="#808080">2</text>
    </svg>`,
    bronze: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="inline-block ml-2">
      <circle cx="12" cy="12" r="10" fill="#FF8C69" stroke="#FF6347" stroke-width="1"/>
      <text x="12" y="16" font-size="12" font-weight="bold" text-anchor="middle" fill="#FF6347">3</text>
    </svg>`
  };

  const topPlayers = [
    { name: 'Alix', points: 325, medal: 'gold' },
    { name: 'Gnouma', points: 225, medal: 'silver' },
    { name: 'Rime', points: 175, medal: 'bronze' },
    { name: 'Soye', points: 125 },
    { name: 'Shinhye', points: 120 }
  ];

  topPlayers.forEach(player => {
    const tr = document.createElement('tr');
    tr.className = 'bg-gray-900 hover:bg-gray-800';

    const nameCell = document.createElement('td');
    nameCell.className = 'py-4 px-6 border border-gray-800 text-base'; // increased padding and font
    nameCell.innerHTML = `${player.name} ${player.medal ? medalSVGs[player.medal as keyof typeof medalSVGs] : ''}`;

    const pointsCell = document.createElement('td');
    pointsCell.className = 'py-4 px-6 border border-gray-800 text-base'; // increased padding and font
    pointsCell.textContent = player.points.toString();

    tr.appendChild(nameCell);
    tr.appendChild(pointsCell);
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  leaderboardCard.appendChild(table);
  leaderboardSection.appendChild(leaderboardCard);
  container.appendChild(leaderboardSection);

  // Sidebar hover logic
  sidebar.addEventListener('mouseenter', () => {
    document.querySelectorAll('.sidebar-label').forEach(label => {
      (label as HTMLElement).classList.remove('opacity-0');
      (label as HTMLElement).classList.add('opacity-100');
    });
    const backgroundImage = document.getElementById('backgroundImage');
    if (backgroundImage) {
      backgroundImage.className = 'absolute top-0 left-64 right-0 bottom-0 bg-cover bg-center transition-all duration-300 z-10';
    }
  });

  sidebar.addEventListener('mouseleave', () => {
    document.querySelectorAll('.sidebar-label').forEach(label => {
      (label as HTMLElement).classList.add('opacity-0');
      (label as HTMLElement).classList.remove('opacity-100');
    });
    const backgroundImage = document.getElementById('backgroundImage');
    if (backgroundImage) {
      backgroundImage.className = 'absolute top-0 left-20 right-0 bottom-0 bg-cover bg-center transition-all duration-300 z-10';
    }
  });

  return container;
}
