export function createSidebar(navigate: (path: string) => void): HTMLElement {
    const sidebar = document.createElement('div');
    sidebar.id = 'sidebar';
    // sidebar.className = 'fixed top-0 left-0 h-full bg-gray-800 bg-opacity-75 transition-all duration-300 ease-in-out z-20 flex flex-col justify-between p-4 w-20 hover:w-64 overflow-hidden';
    sidebar.className = 'fixed top-0 left-0 h-full bg-gray-800 bg-opacity-75 transition-all duration-300 ease-in-out z-20 flex flex-col justify-between p-4 w-20 hover:w-64 overflow-visible';

    // --- Partie haute de la sidebar ---
    const topContainer = document.createElement('div');
    topContainer.className = 'flex flex-col gap-1';
  
    // --- Profil Section ---
    const profileSection = document.createElement('div');
    profileSection.className = 'flex flex-col items-center mb-28 transition-all duration-300';
  
    const profileImage = document.createElement('img');
    profileImage.src = sessionStorage.getItem('profilePicture') || '/assets/profile-pictures/default.jpg';
    profileImage.className = 'w-36 h-36 rounded-full mb-2 border-2 border-white object-cover transition-transform duration-300 hover:scale-110';
    profileImage.id = 'profile-img-sidebar';
  
    const usernameText = document.createElement('span');
    usernameText.id = 'sidebar-username';
    usernameText.className = 'text-white text-lg opacity-0 sidebar-label transition-opacity duration-300 mb-1';
    usernameText.textContent = 'Username';
  
    const statsContainer = document.createElement('div');
    statsContainer.id = 'sidebar-stats-container';
    statsContainer.className = 'flex gap-2 mt-2 opacity-0 sidebar-label transition-opacity duration-300';
  
    const winsBox = document.createElement('div');
    winsBox.className = 'bg-green-700 text-white px-3 py-2 rounded-md flex items-center gap-1';
    const winEmoji = document.createElement('span');
    winEmoji.textContent = ' 🏆 ';
    const winCount = document.createElement('span');
    winCount.id = 'win-count';
    winCount.textContent = '0';
    winsBox.appendChild(winEmoji);
    winsBox.appendChild(winCount);
  
    const lossesBox = document.createElement('div');
    lossesBox.className = 'bg-red-600 text-white px-3 py-2 rounded-md flex items-center gap-1';
    const lossEmoji = document.createElement('span');
    lossEmoji.textContent = ' 💀 ';
    const lossCount = document.createElement('span');
    lossCount.id = 'loss-count';
    lossCount.textContent = '0';
    lossesBox.appendChild(lossEmoji);
    lossesBox.appendChild(lossCount);
  
    statsContainer.appendChild(winsBox);
    statsContainer.appendChild(lossesBox);
  
    profileSection.appendChild(profileImage);
    profileSection.appendChild(usernameText);
    profileSection.appendChild(statsContainer);
    topContainer.appendChild(profileSection);
  
    // --- Menu principal ---
    const menuItems = [
      { icon: '/assets/side-bar/profil.png', label: 'Profile', route: '/user-profile' },
      { icon: '/assets/side-bar/custom.png', label: 'Customization', route: '/customization' },
      { icon: '/assets/side-bar/leaderboard.png', label: 'Leaderboard', route: '/leaderboard' },
      { icon: '/assets/side-bar/friends.png', label: 'Friends', route: '/friends' },
      { icon: '/assets/side-bar/pong.png', label: 'Games', route: '/game' },
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
  
      topContainer.appendChild(menuItem);
    });
  
    // --- Partie basse de la sidebar ---
    const bottomContainer = document.createElement('div');
    bottomContainer.className = 'flex flex-col gap-2';
  
    const bottomItems = [
      { icon: '/assets/side-bar/aboutUs.png', label: 'About us', route: '/about' },
      { icon: '/assets/side-bar/logout.png', label: 'Log out', route: '/auth' },
    ];
  
    bottomItems.forEach(item => {
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
  
      bottomContainer.appendChild(menuItem);
    });
  
    // Assemble toute la sidebar
    sidebar.appendChild(topContainer);
    sidebar.appendChild(bottomContainer);

    // Mouvement de la sidebar
    sidebar.addEventListener('mouseenter', () => {
        // const profileImg = document.getElementById('profile-img-sidebar') as HTMLImageElement;
        // if (profileImg) {
        //  // profileImg.style.transform = 'scale(3)';

        //   profileImg.classList.remove('w-12', 'h-12');
        //   profileImg.classList.add('w-36', 'h-36');
        // }
      
        document.querySelectorAll('.sidebar-label').forEach(label => {
          (label as HTMLElement).classList.remove('opacity-0');
          (label as HTMLElement).classList.add('opacity-100');
        });
      });
      
      sidebar.addEventListener('mouseleave', () => {
        // const profileImg = document.getElementById('profile-img-sidebar') as HTMLImageElement;
        // if (profileImg) {
        //  //profileImg.style.transform = 'scale(1)';

        //   profileImg.classList.remove('w-36', 'h-36');
        //   profileImg.classList.add('w-12', 'h-12');
        // }
      
        document.querySelectorAll('.sidebar-label').forEach(label => {
          (label as HTMLElement).classList.add('opacity-0');
          (label as HTMLElement).classList.remove('opacity-100');
        });
      });
      
    // // --- Charger dynamiquement les infos du joueur ---
    // const token = localStorage.getItem('token');
    // if (token) {
    //   fetch('/api/me', {
    //     headers: { Authorization: `Bearer ${token}` }
    //   })
    //     .then(res => res.json())
    //     .then(user => {
    //       const usernameText = document.getElementById('sidebar-username');
    //       const winCount = document.getElementById('win-count');
    //       const lossCount = document.getElementById('loss-count');
    //       if (usernameText) usernameText.textContent = user.username;
    //       if (winCount) winCount.textContent = (user.wins || 0).toString();
    //       if (lossCount) lossCount.textContent = (user.losses || 0).toString();
    //     })
    //     .catch(err => console.error('Erreur chargement sidebar:', err));
    // }
  
    return sidebar;
  }
  