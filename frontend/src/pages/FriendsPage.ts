import { createSidebar } from "../utils/sidebar"; 
import { applyUserTheme } from '../utils/theme';

export function createFriendsPage(navigate: (path: string) => void): HTMLElement {
  const container = document.createElement('div');
  container.className = 'relative min-h-screen bg-gray-900 text-white overflow-hidden';

  const sidebar = createSidebar(navigate);
  container.appendChild(sidebar);

      // Background Image
      const backgroundImage = document.createElement('div');
      backgroundImage.id = 'backgroundImage';
      backgroundImage.className = 'absolute top-0 left-20 right-0 bottom-0 bg-cover bg-center transition-all duration-300';
    
      container.appendChild(backgroundImage);
      applyUserTheme(backgroundImage);;
      
  //   // Friends Section
// Main content
  const main = document.createElement('div');
  main.className = 'relative z-10 ml-80 p-8 flex flex-col gap-8';

  const title = document.createElement('h1');
  title.className = 'text-3xl font-bold text-center';
  title.textContent = 'My Friends';
  // Search bar
  const searchInput = document.createElement('input');
  searchInput.placeholder = 'Search users...';
  searchInput.className = `
    w-full max-w-md p-3 rounded-md bg-gray-800 text-white
    border border-gray-600 placeholder-gray-400
    focus:outline-none focus:ring-2 focus:ring-blue-500
  `.replace(/\s+/g, ' ').trim();
  // Friend list wrapper
  const friendList = document.createElement('div');
  friendList.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';

  // Sample friends (à remplacer plus tard par un fetch /api/friends)
  const friends = [
    { username: 'Alice', avatar: '/assets/profile-pictures/star_icon.jpg', online: true },
    { username: 'Bob', avatar: '/assets/profile-pictures/moon_icon.jpg', online: false },
    { username: 'Charlie', avatar: '/assets/profile-pictures/sun_icon.jpg', online: true },
  ];
  
//   container.appendChild(friendsArrow);
    main.appendChild(title);
    main.appendChild(searchInput);
    main.appendChild(friendList);
    container.appendChild(main);
  return container;
}