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
  mainArea.className = 'flex-1 flex flex-col items-center justify-center gap-10 z-10 relative mt-10';

  const title = document.createElement('h2');
  title.textContent = t('memory.friend.title');
  title.className = 'text-4xl font-bold text-white';
  mainArea.appendChild(title);

  const topRow = document.createElement('div');
  topRow.className = 'flex justify-center gap-24';

  const bottomRow = document.createElement('div');
  bottomRow.className = 'flex justify-center gap-44';

  const token = localStorage.getItem('token');

  if (token) {
    fetch('/api/friends', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        const friends: Friend[] = data.friends;

        const createFriendCard = (friend: Friend): HTMLElement => {
          const wrapper = document.createElement('div');
          wrapper.className = 'flex flex-col items-center';

          const button = document.createElement('button');
          button.className = `
            w-44 h-44 md:w-52 md:h-52
            rounded-full overflow-hidden
            border-4 border-white shadow-xl
            transform transition-transform duration-300 hover:scale-110
            focus:outline-none
          `.trim();

          const img = document.createElement('img');
          img.src = friend.profile_picture || '/assets/profile-pictures/default.jpg';
          img.alt = friend.username;
          img.className = 'w-full h-full object-cover';
          button.appendChild(img);

          button.addEventListener('click', () => {
            localStorage.setItem('memory-opponent', 'friend');
            localStorage.setItem('opponent-id', friend.id);
            localStorage.setItem('opponent-name', friend.username);
            localStorage.setItem('opponent-picture', friend.profile_picture);
            navigate('/customization-memory');
          });

          const label = document.createElement('span');
          label.textContent = friend.username;
          label.className = `
            mt-3 text-xl font-semibold text-white bg-black/60
            px-4 py-1 rounded-full shadow-md text-center min-w-[9rem]
          `.trim();

          wrapper.append(button, label);
          return wrapper;
        };

        friends.slice(0, 3).forEach(friend => topRow.appendChild(createFriendCard(friend)));
        friends.slice(3, 5).forEach(friend => bottomRow.appendChild(createFriendCard(friend)));
      })
      .catch(error => {
        const errorMsg = document.createElement('p');
        errorMsg.textContent = t('memory.friend.error');
        errorMsg.className = 'text-red-500';
        mainArea.appendChild(errorMsg);
        console.error('Erreur lors du chargement des amis :', error);
      });
  }

  mainArea.appendChild(topRow);
  mainArea.appendChild(bottomRow);
  container.appendChild(mainArea);

  return container;
}
