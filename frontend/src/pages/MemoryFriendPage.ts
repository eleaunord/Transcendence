import { createSidebar } from "../utils/sidebar";
import { applyUserTheme } from "../utils/theme";
import { t } from '../utils/translator';

type Friend = {
  id: string;
  username: string;
  profile_picture: string;
};

export function createMemoryFriendPage(navigate: (path: string) => void): HTMLElement {
  const container = document.createElement('div');
  container.className = 'flex flex-col h-screen bg-gray-900 text-white';

  const sidebar = createSidebar(navigate);
  container.appendChild(sidebar);

  const backgroundImage = document.createElement('div');
  backgroundImage.id = 'backgroundImage';
  backgroundImage.className = 'absolute top-0 left-20 right-0 bottom-0 bg-cover bg-center transition-all duration-300';
  container.appendChild(backgroundImage);
  applyUserTheme(backgroundImage);

  const mainArea = document.createElement('div');
  mainArea.className = 'flex-1 flex flex-col items-center justify-center gap-8 z-10 relative';

  const title = document.createElement('h2');
  title.textContent = t('memory.friend.title');
  title.className = 'text-3xl font-bold text-white';

  const friendList = document.createElement('div');
  friendList.className = 'grid grid-cols-3 gap-6 max-w-5xl';

  const token = localStorage.getItem('token');

  if (token) {
    fetch('/api/friends', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        const friends: Friend[] = data.friends;

        friends.forEach(friend => {
          const card = document.createElement('div');
          card.className = 'bg-gray-800 p-4 rounded-lg flex flex-col items-center gap-2 hover:bg-gray-700 transition cursor-pointer';
          
          const img = document.createElement('img');
          img.src = friend.profile_picture || '/assets/profile-pictures/default.jpg';
          img.alt = friend.username;
          img.className = 'w-24 h-24 rounded-full border-2 border-white';

          const name = document.createElement('div');
          name.textContent = friend.username;
          name.className = 'text-lg font-semibold';

          card.appendChild(img);
          card.appendChild(name);

          card.addEventListener('click', () => {
            localStorage.setItem('memory-opponent', 'friend');
            localStorage.setItem('opponent-id', friend.id);
            localStorage.setItem('opponent-name', friend.username);
            navigate('/customization-memory');
          });

          friendList.appendChild(card);
        });
      })
      .catch(error => {
        const errorMsg = document.createElement('p');
        errorMsg.textContent = t('memory.friend.error');
        errorMsg.className = 'text-red-500';
        mainArea.appendChild(errorMsg);
        console.error('Erreur lors du chargement des amis :', error);
      });
  }

  mainArea.appendChild(title);
  mainArea.appendChild(friendList);
  container.appendChild(mainArea);

  // // Animation sidebar
  // sidebar.addEventListener('mouseenter', () => {
  //   document.querySelectorAll('.sidebar-label').forEach(label => {
  //     (label as HTMLElement).classList.remove('opacity-0');
  //     (label as HTMLElement).classList.add('opacity-100');
  //   });
  //   backgroundImage.className = 'absolute top-0 left-64 right-0 bottom-0 bg-cover bg-center transition-all duration-300';
  //   mainArea.classList.add('ml-44');
  // });

  // sidebar.addEventListener('mouseleave', () => {
  //   document.querySelectorAll('.sidebar-label').forEach(label => {
  //     (label as HTMLElement).classList.add('opacity-0');
  //     (label as HTMLElement).classList.remove('opacity-100');
  //   });
  //   backgroundImage.className = 'absolute top-0 left-20 right-0 bottom-0 bg-cover bg-center transition-all duration-300';
  //   mainArea.classList.remove('ml-44');
  // });

  return container;
}
