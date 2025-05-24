import { createSidebar } from '../utils/sidebar';
import { applyUserTheme } from '../utils/theme';
import { t } from '../utils/translator';

interface PlayerScore {
  id: number;
  username: string;
  totalPoints: number;
  wins?: number;
  totalGames?: number;
}

type LeaderboardType = 'pong' | 'memory';

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
  title.textContent = t('leaderboard.title');
  title.className = 'text-4xl font-bold mb-8 text-white';
  leaderboardSection.appendChild(title);

  // Create tab buttons
  const tabContainer = document.createElement('div');
  tabContainer.className = 'flex mb-6 bg-gray-800/50 rounded-lg p-1';

  const pongTab = document.createElement('button');
  pongTab.textContent = 'Pong';
  pongTab.className = 'px-6 py-3 rounded-md font-semibold transition-all duration-200 bg-blue-600 text-white shadow-lg';
  
  const memoryTab = document.createElement('button');
  memoryTab.textContent = 'Memory';
  memoryTab.className = 'px-6 py-3 rounded-md font-semibold transition-all duration-200 text-gray-300 hover:text-white hover:bg-gray-700/50';

  tabContainer.appendChild(pongTab);
  tabContainer.appendChild(memoryTab);
  leaderboardSection.appendChild(tabContainer);

  const leaderboardCard = document.createElement('div');
  leaderboardCard.className = 'bg-gray-700/80 backdrop-blur-md p-4 rounded-md shadow-xl w-[36rem]';

  leaderboardSection.appendChild(leaderboardCard);
  container.appendChild(leaderboardSection);

  let currentTab: LeaderboardType = 'pong';

  // Tab switching logic
  function switchTab(tab: LeaderboardType) {
    currentTab = tab;
    
    // Update tab appearance
    if (tab === 'pong') {
      pongTab.className = 'px-6 py-3 rounded-md font-semibold transition-all duration-200 bg-blue-600 text-white shadow-lg';
      memoryTab.className = 'px-6 py-3 rounded-md font-semibold transition-all duration-200 text-gray-300 hover:text-white hover:bg-gray-700/50';
    } else {
      memoryTab.className = 'px-6 py-3 rounded-md font-semibold transition-all duration-200 bg-purple-600 text-white shadow-lg';
      pongTab.className = 'px-6 py-3 rounded-md font-semibold transition-all duration-200 text-gray-300 hover:text-white hover:bg-gray-700/50';
    }

    // Load leaderboard data
    loadLeaderboard(tab);
  }

  pongTab.addEventListener('click', () => switchTab('pong'));
  memoryTab.addEventListener('click', () => switchTab('memory'));

  // Function to load leaderboard data
  function loadLeaderboard(type: LeaderboardType) {
    // Add loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'text-center py-8 text-white';
    loadingIndicator.textContent = t('leaderboard.loading');
    leaderboardCard.innerHTML = '';
    leaderboardCard.appendChild(loadingIndicator);

    // Fetch appropriate leaderboard data
    const endpoint = type === 'pong' ? '/api/leaderboard' : '/api/memory-leaderboard';
    
    fetchLeaderboardData(endpoint)
      .then(topPlayers => {
        // Remove loading indicator
        leaderboardCard.innerHTML = '';
        
        // Create and populate the table
        const table = createLeaderboardTable(topPlayers, type);
        leaderboardCard.appendChild(table);
      })
      .catch(error => {
        leaderboardCard.innerHTML = '';

        const errorMessage = document.createElement('div');
        errorMessage.className = 'text-center py-8 text-red-400';

        // If the error is a network error or a failed response
        if (error instanceof Error && error.message.includes('Failed to fetch leaderboard')) {
          errorMessage.textContent = t('leaderboard.error');
        }

        leaderboardCard.appendChild(errorMessage);
        console.error(`Failed to fetch ${type} leaderboard data:`, error);
      });
  }

  // Initial load
  loadLeaderboard('pong');
  
  // Refresh on window focus
  window.addEventListener('focus', () => {
    loadLeaderboard(currentTab);
  });
  
  return container;
}

async function fetchLeaderboardData(endpoint: string): Promise<PlayerScore[]> {
  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
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

function createLeaderboardTable(players: PlayerScore[], type: LeaderboardType): HTMLTableElement {
  const table = document.createElement('table');
  table.className = 'w-full text-center text-white border-collapse';

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  headerRow.className = 'bg-gray-600/90';

  const rankHeader = document.createElement('th');
  rankHeader.textContent = t('leaderboard.rank');
  rankHeader.className = 'py-3 px-4 text-lg font-semibold';

  const playerHeader = document.createElement('th');
  playerHeader.textContent = t('leaderboard.player');
  playerHeader.className = 'py-3 px-6 text-lg font-semibold';

  const pointsHeader = document.createElement('th');
  pointsHeader.textContent = t('leaderboard.points');
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

  // Limit to top 5 players
  const topFivePlayers = players.slice(0, 5);

  topFivePlayers.forEach((player, index) => {
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
