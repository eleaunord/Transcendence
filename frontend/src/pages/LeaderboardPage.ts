import { createSidebar } from '../utils/sidebar';
import { applyUserTheme } from '../utils/theme';

interface PlayerScore {
  id: number;
  username: string;
  totalPoints: number;
}

// Fallback mock data in case API fails + TO TEST 
const MOCK_LEADERBOARD_DATA: PlayerScore[] = [
  { id: 1, username: "GamerPro99", totalPoints: 12450 },
  { id: 2, username: "PixelMaster", totalPoints: 10820 },
  { id: 3, username: "LegendaryGamer", totalPoints: 9740 },
  { id: 4, username: "NinjaPlayer", totalPoints: 8650 },
  { id: 5, username: "RocketQueen", totalPoints: 7920 },
  { id: 6, username: "EpicWarrior", totalPoints: 7210 },
  { id: 7, username: "ShadowHunter", totalPoints: 6580 },
  { id: 8, username: "MagicWizard", totalPoints: 5940 },
  { id: 9, username: "SpeedRacer", totalPoints: 5320 },
  { id: 10, username: "CosmicPlayer", totalPoints: 4780 }
];


export function createLeaderboardPage(navigate: (path: string) => void): HTMLElement {
  const container = document.createElement('div');
  container.className = 'relative min-h-screen bg-gray-900 text-white overflow-hidden';

  const sidebar = createSidebar(navigate);
  sidebar.classList.add('z-40'); // Ensure sidebar is above background
  container.appendChild(sidebar);

  const backgroundImage = document.createElement('div');
  backgroundImage.id = 'backgroundImage';
  backgroundImage.className = 'absolute top-0 left-20 right-0 bottom-0 bg-cover bg-center transition-all duration-300';

  container.appendChild(backgroundImage);
  applyUserTheme(backgroundImage);

  const leaderboardSection = document.createElement('div');
  leaderboardSection.className = 'relative mt-24 flex flex-col items-center z-30';

  const title = document.createElement('h2');
  title.textContent = 'Leaderboard';
  title.className = 'text-4xl font-bold mb-8 text-white';
  leaderboardSection.appendChild(title);

  const leaderboardCard = document.createElement('div');
  leaderboardCard.className = 'bg-gray-700/80 backdrop-blur-md p-4 rounded-md shadow-xl w-[32rem]';

  // Add loading indicator
  const loadingIndicator = document.createElement('div');
  loadingIndicator.className = 'text-center py-8 text-white';
  loadingIndicator.textContent = 'Loading leaderboard...';
  leaderboardCard.appendChild(loadingIndicator);

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

  // Fetch leaderboard data from backend
  fetchLeaderboardData()
    .then(topPlayers => {
      // Remove loading indicator
      leaderboardCard.innerHTML = '';
      
      // Create and populate the table
      const table = createLeaderboardTable(topPlayers);
      leaderboardCard.appendChild(table);
    })
    .catch(error => {
      leaderboardCard.innerHTML = '';

      const errorMessage = document.createElement('div');
      errorMessage.className = 'text-center py-8 text-red-400';

      // If the error is a network error or a failed response
      if (error instanceof Error && error.message.includes('Failed to fetch leaderboard')) {
        errorMessage.textContent = 'Error fetching leaderboard data. Please check your internet connection or try again later.';
      }

      leaderboardCard.appendChild(errorMessage);
      console.error('Failed to fetch leaderboard data:', error);

      // MOCK DATA for testing
      //const table = createLeaderboardTable(MOCK_LEADERBOARD_DATA);
      //leaderboardCard.appendChild(table);
    });

  return container;
}

async function fetchLeaderboardData(): Promise<PlayerScore[]> {

  //throw new Error('Simulated API failure');
  
  // Update the API URL to match what's being used in the browser
  const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3001' 
    : 'https://api.yourgame.com'; // Update with your production API URL
    
  try {
    const response = await fetch(`${API_BASE_URL}/api/leaderboard`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Check if the response is okay (status 2xx)
    if (!response.ok) {
      throw new Error(`Failed to fetch leaderboard: ${response.status}`);
    }

    const data = await response.json();
    return data.leaderboard;
  } catch (error) {
    // Better error handling
    if (error instanceof TypeError) {
      console.error('Network error or failed to reach the server:', error);
      // Try to provide more helpful error message
      if (navigator.onLine === false) {
        throw new Error('Failed to fetch leaderboard: You appear to be offline');
      } else {
        throw new Error('Failed to fetch leaderboard: Server may be down or unreachable');
      }
    } else {
      console.error('API error:', error);
      throw error;  // Re-throw error to be caught in the calling code
    }
  }
}

function createLeaderboardTable(players: PlayerScore[]): HTMLTableElement {
  const table = document.createElement('table');
  table.className = 'w-full text-center text-white border-collapse';

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  headerRow.className = 'bg-gray-600/90';

  const rankHeader = document.createElement('th');
  rankHeader.textContent = 'Rank';
  rankHeader.className = 'py-3 px-4 text-lg font-semibold';

  const playerHeader = document.createElement('th');
  playerHeader.textContent = 'Player';
  playerHeader.className = 'py-3 px-6 text-lg font-semibold';

  const pointsHeader = document.createElement('th');
  pointsHeader.textContent = 'Points';
  pointsHeader.className = 'py-3 px-4 text-lg font-semibold';

  headerRow.appendChild(rankHeader);
  headerRow.appendChild(playerHeader);
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

  players.forEach((player, index) => {
    const tr = document.createElement('tr');
    tr.className = 'bg-gray-900 hover:bg-gray-800';

    const rankCell = document.createElement('td');
    rankCell.className = 'py-4 px-4 border border-gray-800 text-base';
    rankCell.textContent = `${index + 1}`;

    const nameCell = document.createElement('td');
    nameCell.className = 'py-4 px-6 border border-gray-800 text-base';
    
    let medal = '';
    if (index === 0) medal = medalSVGs.gold;
    else if (index === 1) medal = medalSVGs.silver;
    else if (index === 2) medal = medalSVGs.bronze;
    
    nameCell.innerHTML = `${player.username} ${medal}`;

    const pointsCell = document.createElement('td');
    pointsCell.className = 'py-4 px-4 border border-gray-800 text-base';
    pointsCell.textContent = player.totalPoints.toString();

    tr.appendChild(rankCell);
    tr.appendChild(nameCell);
    tr.appendChild(pointsCell);
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  return table;
}