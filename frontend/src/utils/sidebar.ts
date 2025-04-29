export function createSidebar(navigate: (path: string) => void): HTMLElement {
    const sidebar = document.createElement('div');
    sidebar.id = 'sidebar';
    sidebar.className = 'fixed top-0 left-0 h-full bg-gray-800 bg-opacity-75 transition-all duration-300 ease-in-out z-20 flex flex-col p-4 w-20 hover:w-64 overflow-hidden';
  
    const menuItems = [
      { icon: '/assets/side-bar/profil.png', label: 'Profile', route: '/user-profile' },
      { icon: '/assets/side-bar/custom.png', label: 'Customization', route: '/customization' },
      { icon: '/assets/side-bar/leaderboard.png', label: 'Leaderboard', route: '/leaderboard' },
      { icon: '/assets/side-bar/friends.png', label: 'Friends', route: '/friends' },
      { icon: '/assets/side-bar/pong.png', label: 'Games', route: '/game' },
      { icon: '/assets/side-bar/aboutUs.png', label: 'About us', route: '/about' },
      { icon: '/assets/side-bar/logout.png', label: 'Log out', route: '/auth' },
    ];
  
    menuItems.forEach(item => {
      const menuItem = document.createElement('div');
      menuItem.className = 'flex items-center gap-4 p-2 cursor-pointer hover:bg-blue-700 rounded-md transition-colors duration-200';
  
      const icon = document.createElement('img');
      icon.src = item.icon;
      icon.className = 'w-8 h-8';
  
      const label = document.createElement('span');
      label.textContent = item.label;
      label.className = 'whitespace-nowrap opacity-0 sidebar-label transition-opacity duration-300';
  
      menuItem.appendChild(icon);
      menuItem.appendChild(label);
      menuItem.addEventListener('click', () => navigate(item.route));
  
      sidebar.appendChild(menuItem);
    });
  
    return sidebar;
  }
  