
import { createSidebar } from "../utils/sidebar";
import { applyUserTheme } from '../utils/theme';

type Player = {
  id: string;
  username: string;
  source: 'friend' | 'guest';
  avatar?: string;
};

export function createBracketPage(navigate: (path: string) => void): HTMLElement {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

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
  gameFrame.className = 'w-3/4 h-3/4 border-4 border-white relative overflow-hidden bg-black flex flex-col items-center p-8 gap-6';

  const title = document.createElement('h1');
  title.textContent = `Tournoi #${id || 'N/A'}`;
  title.className = 'text-3xl font-bold mb-6 text-center';
  gameFrame.appendChild(title);

  const bracketWrapper = document.createElement('div');
  bracketWrapper.className = 'relative flex gap-16';
  gameFrame.appendChild(bracketWrapper);

//   const svgLines = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
//   svgLines.classList.add('absolute', 'inset-0', 'pointer-events-none');
//   svgLines.style.zIndex = '10';
//   svgLines.style.overflow = 'visible';
//   gameFrame.appendChild(svgLines);

//   // Gradient defs
//   const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
//   const linearGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
//   linearGradient.setAttribute('id', 'gradientStroke');
//   linearGradient.setAttribute('x1', '0%');
//   linearGradient.setAttribute('y1', '0%');
//   linearGradient.setAttribute('x2', '100%');
//   linearGradient.setAttribute('y2', '0%');

//   const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
//   stop1.setAttribute('offset', '0%');
//   stop1.setAttribute('stop-color', '#00ff88');

//   const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
//   stop2.setAttribute('offset', '100%');
//   stop2.setAttribute('stop-color', '#00ffff');

//   linearGradient.append(stop1, stop2);
//   defs.appendChild(linearGradient);
//   svgLines.appendChild(defs);

//   const connect = (from: HTMLElement, to: HTMLElement) => {
//     const fromRect = from.getBoundingClientRect();
//     const toRect = to.getBoundingClientRect();
//     const gridRect = bracketWrapper.getBoundingClientRect();

//     const x1 = fromRect.right - gridRect.left;
//     const y1 = fromRect.top + fromRect.height / 2 - gridRect.top;
//     const x2 = toRect.left - gridRect.left;
//     const y2 = toRect.top + toRect.height / 2 - gridRect.top;

//     const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
//     path.setAttribute('d', `M${x1},${y1} C${x1 + 50},${y1} ${x2 - 50},${y2} ${x2},${y2}`);
//     path.setAttribute('class', 'bracket-line');
//     svgLines.appendChild(path);
//   };

  const round1 = document.createElement('div');
  round1.className = 'flex flex-col justify-between h-96';
  bracketWrapper.appendChild(round1);

  const semiFinal = document.createElement('div');
  semiFinal.className = 'flex flex-col justify-center gap-48 h-96';
  bracketWrapper.appendChild(semiFinal);

  const final = document.createElement('div');
  final.className = 'flex flex-col justify-center h-96';
  bracketWrapper.appendChild(final);

  let semiFinalists: (Player | null)[] = [null, null];
  let finalist: Player | null = null;

  const renderMatch = (p1: Player, p2: Player, onWinner: (winner: Player) => void) => {
    const matchDiv = document.createElement('div');
    matchDiv.className = 'flex flex-col items-center gap-2 p-2 border rounded bg-gray-800 w-48';

    [p1, p2].forEach(player => {
      const playerRow = document.createElement('div');
      playerRow.className = 'flex items-center gap-2 w-full';

      const avatar = document.createElement('img');
      avatar.src = player.avatar || '/assets/profile-pictures/default.jpg';
      avatar.className = 'w-10 h-10 rounded-full';

      const name = document.createElement('span');
      name.textContent = player.username;

      playerRow.append(avatar, name);
      matchDiv.appendChild(playerRow);
    });

    const playBtn = document.createElement('button');
    playBtn.textContent = 'play';
    playBtn.className = 'mt-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm';
    playBtn.addEventListener('click', () => {
    sessionStorage.setItem('currentMatch', JSON.stringify({
        p1,
        p2,
        nextPhase: semiFinalists.includes(null) ? 'semiFinal' : 'final',
        tournamentId: id
        }));
        navigate('/versus');
    //   const winner = Math.random() < 0.5 ? p1 : p2;
    //   onWinner(winner);
    });

    matchDiv.appendChild(playBtn);

    return matchDiv;
  };

//   const updateLines = () => {
//     svgLines.innerHTML = '<defs>' + defs.innerHTML + '</defs>';
//     const r1 = round1.querySelectorAll('div');
//     const s1 = semiFinal.querySelectorAll('div');
//     const f1 = final.querySelector('div');

//     if (r1.length >= 2 && s1.length >= 2) {
//       connect(r1[0], s1[0]);
//       connect(r1[1], s1[1]);
//     }

//     if (s1.length >= 2 && f1) {
//       connect(s1[0], f1);
//       connect(s1[1], f1);
//     }
//   };

  const updateSemiFinal = () => {
    semiFinal.innerHTML = '';

    semiFinalists.forEach((player) => {
      const slot = document.createElement('div');
      slot.className = 'p-2 border rounded bg-gray-700 w-48 text-center';
      slot.textContent = player ? player.username : 'En attente';
      semiFinal.appendChild(slot);
    });

    // updateLines();

    if (semiFinalists[0] && semiFinalists[1]) {
      renderFinal(semiFinalists[0]!, semiFinalists[1]!);
    }
  };

  const renderFinal = (p1: Player, p2: Player) => {
    final.innerHTML = '';
    final.appendChild(renderMatch(p1, p2, (winner) => {
      finalist = winner;
      renderWinner();
    }));

    // updateLines();
  };

  const renderWinner = () => {
    final.innerHTML = '';
    const winnerDiv = document.createElement('div');
    winnerDiv.className = 'p-4 border-2 border-yellow-500 bg-gray-700 w-48 text-center font-bold animate-pulse';
    winnerDiv.textContent = '🏆 Winner : ' + finalist?.username;
    final.appendChild(winnerDiv);
    // updateLines();
  };

  fetch(`/api/tournaments/${id}`)
    .then(res => res.json())
    .then((data: { players: Player[] }) => {
      const players = data.players;
      if (players.length !== 4) {
        console.warn('Le bracket est prévu pour 4 joueurs.');
        return;
      }

      round1.appendChild(renderMatch(players[0], players[1], (winner) => {
        semiFinalists[0] = winner;
        updateSemiFinal();
      }));

      round1.appendChild(renderMatch(players[2], players[3], (winner) => {
        semiFinalists[1] = winner;
        updateSemiFinal();
      }));

    //   setTimeout(updateLines, 300);
    })
    .catch(err => {
      console.error(err);
    });

const matchWinnerStr = sessionStorage.getItem('matchWinner');
if (matchWinnerStr) {
  const { winner, nextPhase } = JSON.parse(matchWinnerStr);
  sessionStorage.removeItem('matchWinner');

  if (nextPhase === 'semiFinal') {
    if (!semiFinalists[0]) semiFinalists[0] = winner;
    else if (!semiFinalists[1]) semiFinalists[1] = winner;
    updateSemiFinal();
  } else if (nextPhase === 'final') {
    finalist = winner;
    renderWinner();
  }
}


  const layout = document.createElement('div');
  layout.className = 'flex flex-1';
  layout.id = 'game-layout';
  layout.appendChild(gameArea);
  gameArea.appendChild(gameFrame);
  container.appendChild(layout);

  sidebar.addEventListener('mouseenter', () => {
    document.querySelectorAll('.sidebar-label').forEach(label => {
      (label as HTMLElement).classList.remove('opacity-0');
      (label as HTMLElement).classList.add('opacity-100');
    });
    backgroundImage.className = 'absolute top-0 left-64 right-0 bottom-0 bg-cover bg-center transition-all duration-300';
    layout.classList.add('ml-44');
  });

  sidebar.addEventListener('mouseleave', () => {
    document.querySelectorAll('.sidebar-label').forEach(label => {
      (label as HTMLElement).classList.add('opacity-0');
      (label as HTMLElement).classList.remove('opacity-100');
    });
    backgroundImage.className = 'absolute top-0 left-20 right-0 bottom-0 bg-cover bg-center transition-all duration-300';
    layout.classList.remove('ml-44');
  });

  return container;
}
