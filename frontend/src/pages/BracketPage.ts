import { createSidebar } from "../utils/sidebar";
import { applyUserTheme } from '../utils/theme';
import { createPongScene } from '../games/pong3d/PongScene';
import { loadPongSettings } from '../utils/pongSettings';
import { t } from "../utils/translator";

type Player = {
  id: string;
  username: string;
  source: 'friend' | 'guest';
  avatar?: string;
};


export function createBracketPage(navigate: (path: string) => void): HTMLElement {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id'); 
  // const previousId = sessionStorage.getItem('lastTournamentId');
  // if (previousId !== id) {
  //   sessionStorage.removeItem('semiFinalists');
  //   sessionStorage.setItem('lastTournamentId', id ?? '');
  // }

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
  title.textContent = t('bracket.title', { id: id || 'N/A' });
  title.className = 'text-3xl font-bold mb-6 text-center';
  gameFrame.appendChild(title);

  const bracketWrapper = document.createElement('div');
  bracketWrapper.className = 'relative flex gap-16';
  gameFrame.appendChild(bracketWrapper);

  const svgLines = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svgLines.classList.add('absolute', 'inset-0', 'pointer-events-none');
  svgLines.style.zIndex = '10';
  svgLines.style.overflow = 'visible';
  gameFrame.appendChild(svgLines);

  // Gradient defs
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const linearGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
  linearGradient.setAttribute('id', 'gradientStroke');
  linearGradient.setAttribute('x1', '0%');
  linearGradient.setAttribute('y1', '0%');
  linearGradient.setAttribute('x2', '100%');
  linearGradient.setAttribute('y2', '0%');

  const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  stop1.setAttribute('offset', '0%');
  stop1.setAttribute('stop-color', '#00ff88');

  const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  stop2.setAttribute('offset', '100%');
  stop2.setAttribute('stop-color', '#00ffff');

  linearGradient.append(stop1, stop2);
  defs.appendChild(linearGradient);
  svgLines.appendChild(defs);

  const connect = (from: HTMLElement, to: HTMLElement) => {
    const fromRect = from.getBoundingClientRect();
    const toRect = to.getBoundingClientRect();
    const gridRect = bracketWrapper.getBoundingClientRect();

    const x1 = fromRect.right - gridRect.left;
    const y1 = fromRect.top + fromRect.height / 2 - gridRect.top;
    const x2 = toRect.left - gridRect.left;
    const y2 = toRect.top + toRect.height / 2 - gridRect.top;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M${x1},${y1} C${x1 + 50},${y1} ${x2 - 50},${y2} ${x2},${y2}`);
    path.setAttribute('class', 'bracket-line');
    svgLines.appendChild(path);
  };

  const round1 = document.createElement('div');
  round1.className = 'flex flex-col justify-between h-96';
  bracketWrapper.appendChild(round1);

  const semiFinal = document.createElement('div');
  semiFinal.className = 'flex flex-col justify-center gap-48 h-96';
  bracketWrapper.appendChild(semiFinal);

  const final = document.createElement('div');
  final.className = 'flex flex-col justify-center h-96';
  bracketWrapper.appendChild(final);

  // sessionStorage.removeItem('semiFinalists');
  let semiFinalists: (Player | null)[] = [null, null];
  const savedSemiFinalists = sessionStorage.getItem("semiFinalists");
  if (savedSemiFinalists) {
    semiFinalists = JSON.parse(savedSemiFinalists);
    console.log("[INIT] semiFinalists restored from sessionStorage:", semiFinalists);
  }
  
  function saveWinnerToSemiFinal(winner: Player) {
    const alreadyIn = semiFinalists.some(p => p?.id === winner.id);
    if (alreadyIn) {
      console.log("[DEBUG] Winner already present, skipping:", winner);
      return;
    }
    if (!semiFinalists[0]) {
      console.log("[DEBUG] Putting winner in semiFinalists[0]", winner);
      semiFinalists[0] = winner;
    } else if (!semiFinalists[1]) {
      console.log("[DEBUG] Putting winner in semiFinalists[1]", winner);
      semiFinalists[1] = winner;
    } else {
      console.warn("[WARN] semiFinalists full, cannot insert:", winner);
    }
    sessionStorage.setItem("semiFinalists", JSON.stringify(semiFinalists));
  }

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
    playBtn.textContent = t('bracket.play');
    playBtn.className = 'mt-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm';
    playBtn.addEventListener('click', () => {
      console.log(`[MATCH] ${p1.username} vs ${p2.username}`);
      const nextPhase = semiFinalists.includes(null) ? 'semiFinal' : 'final';
      console.log(`[MATCH DEBUG] NEXT PHASE : ${nextPhase}`);
      showTournamentAnnouncement(p1, p2, nextPhase, id);
    });

    matchDiv.appendChild(playBtn);
    return matchDiv;
  };

  const updateLines = () => {
    svgLines.innerHTML = '<defs>' + defs.innerHTML + '</defs>';
    const r1 = round1.querySelectorAll('div');
    const s1 = semiFinal.querySelectorAll('div');
    const f1 = final.querySelector('div');

    if (r1.length >= 2 && s1.length >= 2) {
      connect(r1[0], s1[0]);
      connect(r1[1], s1[1]);
    }

    if (s1.length >= 2 && f1) {
      connect(s1[0], f1);
      connect(s1[1], f1);
    }
  };
  
  const saveSemiFinalists = () => {
    sessionStorage.setItem("semiFinalists", JSON.stringify(semiFinalists));
  };
  
  const updateSemiFinal = () => {
    console.log('[SEMI FINAL] Updating semi-final with players:', semiFinalists);
    semiFinal.innerHTML = '';

    semiFinalists.forEach((player) => {
      const slot = document.createElement('div');
      slot.className = 'p-2 border rounded bg-gray-700 w-48 text-center';
      slot.textContent = player ? player.username : t('bracket.waiting');
      semiFinal.appendChild(slot);
    });

    saveSemiFinalists();
    updateLines();

    if (semiFinalists[0] && semiFinalists[1]) {
      renderFinal(semiFinalists[0]!, semiFinalists[1]!);
    }
  };

  const renderFinal = (p1: Player, p2: Player) => {
    console.log('[FINAL] Rendering final between:', p1.username, 'and', p2.username);
    final.innerHTML = '';
    final.appendChild(renderMatch(p1, p2, (winner) => {
      finalist = winner;
      renderWinner();
    }));

    updateLines();
  };

  const renderWinner = () => {
    final.innerHTML = '';
    const winnerDiv = document.createElement('div');
    winnerDiv.className = 'p-4 border-2 border-yellow-500 bg-gray-700 w-48 text-center font-bold animate-pulse';
    winnerDiv.textContent = t('bracket.winner', { name: finalist?.username || '...' });
    final.appendChild(winnerDiv);
    updateLines();
  };

  fetch(`/api/tournaments/${id}`)
  .then(res => res.json())
  .then((data: { players: Player[] }) => {
    const players = data.players;
    if (players.length !== 4) {
      console.warn('Le bracket est prévu pour 4 joueurs.');
      return;
    }

    // 비동기 렌더 함수
    round1.appendChild(renderMatch(players[0], players[1], (winner) => {
      saveWinnerToSemiFinal(winner);
      updateSemiFinal();
    }));
    round1.appendChild(renderMatch(players[2], players[3], (winner) => {
      saveWinnerToSemiFinal(winner);
      updateSemiFinal();
    }));

    // 세미파이널 슬롯이 모두 설정된 뒤에 matchWinner 적용
    setTimeout(() => {
      const matchWinnerStr = sessionStorage.getItem('matchWinner');
      if (matchWinnerStr) {
        console.log('[BRACKET PAGE] matchWinner from session:', matchWinnerStr);
        const { winner, nextPhase } = JSON.parse(matchWinnerStr);
        sessionStorage.removeItem('matchWinner');

        console.log(`[SESSION DEBUG] winner from session:`, winner);
        console.log(`[SESSION DEBUG] nextPhase:`, nextPhase);
    
          if (nextPhase === 'semiFinal') {
            saveWinnerToSemiFinal(winner);
            updateSemiFinal();
          } else if (nextPhase === 'final') {
            finalist = winner;
            renderWinner();
          }
        }
      }, 100);// bracket DOM이 완전히 구성된 후 실행
  })
  .catch(err => {
    console.error(err);
  });

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

  function showTournamentAnnouncement(p1: Player, p2: Player, nextPhase: string, tournamentId: string | null) {
  const overlay = document.createElement('div');
  overlay.className = 'absolute inset-0 z-50 flex justify-center items-center bg-black bg-opacity-80';

  const matchBox = document.createElement('div');
  matchBox.className = 'bg-gray-800 text-white rounded-2xl border-4 border-yellow-400 p-12 flex flex-col items-center gap-6';

  const title = document.createElement('div');
  title.textContent = t('bracket.next_match');
  title.className = 'text-3xl font-bold text-yellow-400';
  matchBox.appendChild(title);

  const playerContainer = document.createElement('div');
  playerContainer.className = 'flex items-center gap-12';

  const createPlayerCard = (player: Player) => {
    const card = document.createElement('div');
    card.className = 'flex flex-col items-center';

    const img = document.createElement('img');
    img.src = player.avatar || '/assets/profile-pictures/default.jpg';
    img.className = 'w-24 h-24 rounded-full border-4 border-gray-500';

    const name = document.createElement('div');
    name.textContent = player.username;
    name.className = 'mt-2 text-lg font-semibold';

    card.append(img, name);
    return card;
  };

  playerContainer.append(createPlayerCard(p1), document.createTextNode('VS'), createPlayerCard(p2));
  matchBox.appendChild(playerContainer);

  const countdown = document.createElement('div');
  countdown.className = 'text-xl mt-4 font-bold text-yellow-300';
  matchBox.appendChild(countdown);

  overlay.appendChild(matchBox);
  document.body.appendChild(overlay);

  let timeLeft = 4;
  countdown.textContent = t('bracket.countdown', { timeLeft });

  sessionStorage.removeItem("matchWinner"); // 2105 추가
  const interval = setInterval(() => {
    timeLeft--;
    if (timeLeft > 0) {
      countdown.textContent = t('bracket.countdown', { timeLeft });
    } else {
      clearInterval(interval);
      console.log(`[MATCH ANNONCE] saving match res for next phase:` , { p1, p2, nextPhase });
      sessionStorage.removeItem("matchWinner"); // 여기 추가
      
      sessionStorage.setItem('currentMatch', JSON.stringify({
        p1: { ...p1, id: String(p1.id) },
        p2: { ...p2, id: String(p2.id) },
        nextPhase,
        tournamentId
      }));
      overlay.remove();
      launchBracketGame(container);
    }
  }, 1000);
}

function launchBracketGame(container: HTMLElement) {
  const canvas = document.createElement('canvas');
  canvas.id = 'pong-canvas';
  canvas.className = 'w-full h-full absolute top-0 left-0';
  canvas.style.display = 'block';
  canvas.style.backgroundColor = 'black';

  const scoreBoard = document.createElement('div');
  scoreBoard.id = "scoreBoard";
  scoreBoard.className = `
    absolute top-6 left-1/2 transform -translate-x-1/2
    text-3xl font-bold z-10
  `.replace(/\s+/g, ' ').trim();
  scoreBoard.style.color = '#e0e7ff';
  scoreBoard.style.textShadow = `
    0 0 6px rgba(255, 255, 255, 0.5),
    0 0 10px rgba(173, 216, 230, 0.4),
    0 0 16px rgba(255, 255, 200, 0.3)
  `;
  scoreBoard.style.transition = 'all 0.3s ease-in-out';

  const announce = document.createElement("div");
  announce.id = "announce";
  announce.className = "absolute top-16 left-1/2 transform -translate-x-1/2 text-yellow-300 text-xl font-semibold";

  const btnReturn = document.createElement("button");
  btnReturn.textContent = t('bracket.return');
  btnReturn.className = `
    absolute bottom-8 left-1/2 transform -translate-x-1/2 
    bg-yellow-400 hover:bg-yellow-500 text-black font-bold 
    py-3 px-8 rounded-lg shadow-lg transition duration-300 hidden z-20
  `.replace(/\s+/g, ' ').trim();
  btnReturn.addEventListener("click", () => location.reload());

const layout = document.getElementById('game-layout');
layout!.innerHTML = '';
layout!.className = 'flex flex-1 justify-center items-center'; // ensure it's centered

  const frame = document.createElement('div');
  frame.className = 'w-3/4 h-3/4 border-4 border-white relative overflow-hidden bg-black';
  frame.style.position = 'relative';
  frame.style.margin = 'auto';

  frame.appendChild(canvas);
  frame.appendChild(scoreBoard);
  frame.appendChild(announce);
  frame.appendChild(btnReturn);

  layout!.appendChild(frame);

  const matchData = sessionStorage.getItem("currentMatch");
  if (!matchData) {
    console.error("❌ currentMatch not found in sessionStorage");
    return;
  }

  const parsed = JSON.parse(matchData);


  const settings = loadPongSettings();
  createPongScene(
    canvas,
    {
      mode: 'tournament',
      speed: settings.speed,
      scoreToWin: settings.scoreToWin,
      paddleSize: settings.paddleSize,
      theme: settings.theme,
      tournamentContext: parsed
    },
    btnReturn
  );
}

  return container;
}
