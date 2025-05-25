import { createSidebar } from '../utils/sidebar';
import { applyUserTheme } from "../utils/theme";
import { setLanguage, t } from "../utils/translator";

type Player = {
  id: string;
  name: string;
  source: 'friend' | 'guest';
  avatar?:string;
};

const guestAvatars = [
  '/assets/guest-avatars/bigstar.jpg',
  '/assets/guest-avatars/star.jpg',
  '/assets/guest-avatars/moon.jpg'
];

const playerSlots: (Player | null | 'loading')[] = ['loading', null , null , null ];

export function createTournamentPage(navigate: (path: string) => void): HTMLElement {
  if ((window as any).activePongCleanup) {
    (window as any).activePongCleanup();
    delete (window as any).activePongCleanup;
  }

  for (let i = 1; i < playerSlots.length; i++) {
    playerSlots[i] = null;
  }
  
  const container = document.createElement('div');
  container.className = 'flex flex-col h-screen bg-gray-900 text-white';

  // Sidebar
  const sidebar = createSidebar(navigate);
  container.appendChild(sidebar);

  // Background image
  const backgroundImage = document.createElement('div');
  backgroundImage.id = 'backgroundImage';
  backgroundImage.className = 'absolute top-0 left-20 right-0 bottom-0 bg-cover bg-center transition-all duration-300';
  container.appendChild(backgroundImage);
  applyUserTheme(backgroundImage);

  // Zone de jeu
  const gameArea = document.createElement('div');
  gameArea.className = 'flex-1 bg-gray-900 flex justify-center items-center';

  //Fond de la zone de jeu
  const gameFrame = document.createElement('div');
  gameFrame.className = 'w-3/4 h-3/4 border-4 border-white relative overflow-hidden bg-black';

  // 🎮 Canvas en fond (z-0)
  const canvas = document.createElement('canvas');
  canvas.id = 'pong-canvas';
  canvas.className = 'w-full h-full absolute top-0 left-0 z-0';
  canvas.style.display = 'block';
  canvas.style.backgroundColor = 'black';
  gameFrame.appendChild(canvas);

  // 🔝 Overlay au-dessus du canvas (z-10)
  const overlay = document.createElement('div');
  overlay.className = 'absolute inset-0 z-10 flex flex-col items-center justify-center';
//  overlay.className = 'absolute inset-0 z-10 flex flex-col items-center';


  // ➡ Slots Container
  const slotsContainer = document.createElement('div');
  slotsContainer.className = 'grid grid-cols-4 gap-6 mt-10 justify-items-center max-w-5xl mx-auto';

  //Mise a jour des slots
  const updateSlots = () => {
    slotsContainer.innerHTML = '';

    playerSlots.forEach((player, index) => {
      const slot = document.createElement('div');
      slot.className = 'bg-black-800 rounded p-4 text-center flex flex-col items-center gap-2 min-w-[180px]';

      if (player === 'loading')
      {
        const skeleton = document.createElement('div');
        skeleton.className = 'w-40 h-40 rounded-full bg-sky-600 animate-pulse ';
        const loadingText = document.createElement('span');
        loadingText.className = 'text-sm text-sky-400 animate-pulse';
        loadingText.textContent = t('loading');
        slot.appendChild(skeleton);
        slot.appendChild(loadingText);
      } 
      else if (player) 
      {
        if (player.avatar) 
        {
          const img = document.createElement('img');
          img.src = player.avatar;
          img.alt = player.name;
          img.className = 'w-32 h-32 rounded-full border-2 border-white';
          slot.appendChild(img);
        }
        const name = document.createElement('div');
        name.textContent =
          index === 0
            ? player.name
            : `${player.name} (${player.source === 'friend' ? t('tournament.friend') : t('tournament.guest')})`; // MERGE? : `${player.name} (${player.source === 'friend' ? 'Ami' : 'Invité'})`;
        name.className = 'text-lg font-semibold';
        slot.appendChild(name);

        // [X] 제거 버튼 (첫 슬롯 제외)
        if (index !== 0) 
        {
          const removeBtn = document.createElement('button');
          removeBtn.textContent = '❌';
          removeBtn.title = t('tournament.remove_player'); // MERGE? :'Supprimer ce joueur';
          removeBtn.className = 
            'mt-1 text-red-500 hover:text-red-700 font-bold transition duration-200';
          removeBtn.addEventListener('click', () => {
            playerSlots[index] = null;
            updateSlots();
            refreshFriendDropdown(); // 친구 드롭다운도 갱신 필요
          });
          slot.appendChild(removeBtn);
        }
      } 
      else
        slot.textContent = t('tournament.slot_empty', { num: index + 1 }); // MERGE?  : slot.textContent = `Joueur ${index + 1} : vide`;
      slotsContainer.appendChild(slot);
    });
  };
  updateSlots();

  // ➡ Controls (friendSelect, boutons)
  const friendSelect = document.createElement('select');
  friendSelect.className = 'bg-gray-700 text-white p-2 rounded';
  const defaultOption = document.createElement('option');
  defaultOption.text = t('tournament.select_friend');
  defaultOption.disabled = true;
  defaultOption.selected = true;
  friendSelect.appendChild(defaultOption);

  const controls = document.createElement('div');
  controls.className = 'flex gap-4 mt-6';

  const addFriendBtn = document.createElement('button');
  addFriendBtn.textContent = t('tournament.add_friend');
  addFriendBtn.className = 'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded';

  const guestInput = document.createElement('input');
  guestInput.placeholder = t('tournament.guest_name_placeholder');
  guestInput.className = 'bg-gray-700 text-white p-2 rounded';

  const addGuestBtn = document.createElement('button');
  addGuestBtn.textContent = t('tournament.add_guest');
  addGuestBtn.className = 'bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded';

  controls.append(friendSelect, addFriendBtn, guestInput, addGuestBtn);


  const startBtn = document.createElement('button');
  startBtn.textContent = t('tournament.start');
  startBtn.disabled = true;
  startBtn.className = 'mt-6 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded font-bold transition duration-300 disabled:opacity-40';

  overlay.appendChild(slotsContainer);
  overlay.appendChild(controls);
  overlay.appendChild(startBtn);

  gameFrame.appendChild(overlay);
  gameArea.appendChild(gameFrame);

  const layout = document.createElement('div');
  layout.className = 'flex flex-1';
  layout.id = 'game-layout';
  layout.appendChild(gameArea);
  container.appendChild(layout);

  // Event listeners
  const token = localStorage.getItem('token');
  let friends: Player[] = [];
  
 // 2005 추가  
  function refreshFriendDropdown() {
    friendSelect.innerHTML = ''; // 드롭다운 초기화
  
    const defaultOption = document.createElement('option');
    defaultOption.text = t('tournament.select_friend');
    defaultOption.disabled = true;
    defaultOption.selected = true;
    friendSelect.appendChild(defaultOption);
  
    friends.forEach(friend => {
      const isAlreadySelected = playerSlots.some(
        p => p !== null && p !== 'loading' && p.id === friend.id
      );
      if (isAlreadySelected) return;
  
      const option = document.createElement('option');
      option.value = friend.id;
      option.textContent = friend.name;
      friendSelect.appendChild(option);
    });
  }
  // 2005 추가 끝
  

  if (token) {
    fetch('/api/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(user => {
        playerSlots[0] = {
          id: String(user.id),
          name: user.username,
          source: 'friend',
          avatar: user.image || '/assets/profile-pictures/default.jpg'
        };
        updateSlots();
      });

    fetch('/api/friends', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        friends = data.friends.map((f: any) => ({
          id: String(f.id),
          name: f.username,
          source: 'friend',
          avatar: f.profile_picture
        }));
        refreshFriendDropdown(); // 2005 추가
        updateSlots();
      });
  }

  addFriendBtn.addEventListener('click', () => {
    const selectedId = friendSelect.value;
    const selectedFriend = friends.find(f => f.id === selectedId);
    if (!selectedFriend) return;
    
    const emptyIndex = playerSlots.findIndex((p, idx) => p === null && idx !== 0);
    if (emptyIndex !== -1) {
      playerSlots[emptyIndex] = selectedFriend;
      updateSlots();
      refreshFriendDropdown();
    }
    console.log('[SLOT DEBUG] Friend selected:', selectedFriend);
  });

  addGuestBtn.addEventListener('click', () => {
    //const name = guestInput.value.trim();
    let name = guestInput.value.trim();

    // 🔒 Validation stricte : lettres, chiffres, espaces, _ ou -
    const nameRegex = /^[\w\s-]{3,20}$/;
    if (!nameRegex.test(name)) {
      alert(t('guest.invalid_name')); // à ajouter dans ton fichier de traductions
      return;
    }

    // Protection XSS basique (supprimer < > " ' /)
    name = name.replace(/[<>"'/]/g, '');
    if (!name) return;
  
    const isNameTaken = playerSlots.some(
      p => p !== null && p !== 'loading' && p.name.toLowerCase() === name.toLowerCase()
    );
    if (isNameTaken) {
      alert(t('guest.duplicate_name'));
      return;
    }

    const emptyIndex = playerSlots.findIndex((p, idx) => p === null && idx !== 0);
    if (emptyIndex !== -1) {
      const guestAvatar = guestAvatars[emptyIndex - 1] || '/assets/profile-pictures/default.jpg';
      
      const newGuestId = `guest-${Date.now()}-${Math.random()}`;  // 추가
      console.log('[NEW GUEST STRING ID]', newGuestId);       

      playerSlots[emptyIndex] = {
        id: newGuestId,  // 고유한 guest ID 생성!
        name,
        source: 'guest',
        avatar: guestAvatar
      };
      guestInput.value = '';
      updateSlots();
    }
  });

  startBtn.addEventListener('click', async () => {
    const selectedPlayers = playerSlots.filter(p => p !== null && p !== 'loading') as Player[];
    console.log('Joueurs sélectionnés :', selectedPlayers);

    selectedPlayers.forEach(p => {
      console.log('[PLAYER ID TYPE CHECK]', p.id, typeof p.id);
    });

    try {
      sessionStorage.removeItem('semiFinalists'); //2105 추가

      const response = await fetch('/api/tournaments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: t('tournament.local_name'), players: selectedPlayers })
      });
      
      if (!response.ok) {
        throw new Error(t('tournament.creation_error'));
      }
      
      const data = await response.json();
      console.log(' Tournoi créé avec ID:', data.tournamentId);
      
        // console.log('Status code:', response.status);
        // console.log('Response ok:', response.ok);
        // const data = await response.json();
        // console.log('Response body:', data);
      // On redirige vers la page du bracket avec l'ID
      navigate(`/bracket?id=${data.tournamentId}`);
      // console.log('Je vais naviguer vers', `/bracket?id=${data.tournamentId}`);
    } 
    catch (error)
    {
      console.error(' Impossible de créer le tournoi :', error);
    }
  });
  
  // startBtn.addEventListener('click', () => {
  //   console.log('Tournoi démarré avec les joueurs :', playerSlots);
  //   navigate('/local');
  // });

  const observer = new MutationObserver(() => {
    startBtn.disabled = !playerSlots.every(p => p !== null);
  });
  observer.observe(slotsContainer, { childList: true, subtree: true });

  // // Mouvement de la sidebar
  // sidebar.addEventListener('mouseenter', () => {
  //   document.querySelectorAll('.sidebar-label').forEach(label => {
  //     (label as HTMLElement).classList.remove('opacity-0');
  //     (label as HTMLElement).classList.add('opacity-100');
  //   });

  //   const bg = document.getElementById('backgroundImage');
  //   if (bg) {
  //     bg.className = 'absolute top-0 left-64 right-0 bottom-0 bg-cover bg-center transition-all duration-300';
  //   }
  //   const layoutDiv = document.getElementById('game-layout');
  //   if (layoutDiv) {
  //     layoutDiv.classList.add('ml-44');
  //   }
  // });

  // sidebar.addEventListener('mouseleave', () => {
  //   document.querySelectorAll('.sidebar-label').forEach(label => {
  //     (label as HTMLElement).classList.add('opacity-0');
  //     (label as HTMLElement).classList.remove('opacity-100');
  //   });

  //   const bg = document.getElementById('backgroundImage');
  //   if (bg) {
  //     bg.className = 'absolute top-0 left-20 right-0 bottom-0 bg-cover bg-center transition-all duration-300';
  //   }
  //   const layoutDiv = document.getElementById('game-layout');
  //   if (layoutDiv) {
  //     layoutDiv.classList.remove('ml-44');
  //   }
  // });

  return container;
}
