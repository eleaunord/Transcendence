import { t } from "../utils/translator";

export function createSidebar(navigate: (path: string) => void): HTMLElement {
  const sidebar = document.createElement('div');
  sidebar.id = 'sidebar';

  sidebar.className = `
  fixed top-0 left-0 h-full w-20 hover:w-64
  bg-gray-800 text-white
  transition-all duration-300 ease-in-out
  z-40
  flex flex-col justify-between p-4
  overflow-visible
`.replace(/\s+/g, ' ').trim();

  // --- Partie haute de la sidebar ---
  const topContainer = document.createElement('div');
  topContainer.className = 'flex flex-col gap-1';

  // --- Profil Section ---
  const profileSection = document.createElement('div');
  profileSection.className = 'relative flex flex-col items-center mb-28 h-36';

  const profileImage = document.createElement('img');
  
  // Enhanced profile picture loading with error handling and caching
  function loadProfilePicture() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    let profilePictureSrc = user.image || 
                           sessionStorage.getItem('profilePicture') || 
                           '/assets/profile-pictures/default.jpg';
    
    // Ensure the image loads properly
    const tempImg = new Image();
    tempImg.onload = () => {
      profileImage.src = profilePictureSrc;
    };
    tempImg.onerror = () => {
      console.warn('Failed to load profile picture, using default');
      profileImage.src = '/assets/profile-pictures/default.jpg';
    };
    tempImg.src = profilePictureSrc;
  }

  // Initial load
  loadProfilePicture();
  
  // Enhanced event listener for profile picture updates
  const handleProfilePictureUpdate = (e: Event) => {
    const customEvent = e as CustomEvent<string>;
    if (customEvent.detail) {
      // Preload the new image before setting it
      const tempImg = new Image();
      tempImg.onload = () => {
        profileImage.src = customEvent.detail;
      };
      tempImg.src = customEvent.detail;
    }
  };

  window.addEventListener('profilePictureUpdated', handleProfilePictureUpdate);
  
  // Add visibility change listener to reload profile picture when tab becomes visible
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      setTimeout(() => {
        loadProfilePicture();
      }, 100); // Small delay to ensure everything is loaded
    }
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);

  profileImage.className = `
  absolute top-0 
  w-12 h-12 hover:w-36 hover:h-36
  rounded-full mb-2 
  border-2 border-white 
  object-cover 
  transition-all duration-300
  opacity-100
`.replace(/\s+/g, ' ').trim();

  profileImage.id = 'profile-img-sidebar';
  
  // Add error handling for the profile image
  profileImage.onerror = () => {
    console.warn('Profile image failed to load, using default');
    profileImage.src = '/assets/profile-pictures/default.jpg';
  };

  const usernameText = document.createElement('span');
  usernameText.id = 'sidebar-username';
  usernameText.className = 'text-white text-xl opacity-0 sidebar-label transition-opacity duration-300 p-4 mt-36 absolute';

  // Load username
  function loadUsername() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    usernameText.textContent = user.username || t('sidebar.username');
  }
  
  loadUsername();

  const statsContainer = document.createElement('div');
  statsContainer.id = 'sidebar-stats-container';
  statsContainer.className = 'flex gap-2 mt-2 opacity-0 sidebar-label transition-opacity duration-300';

  profileSection.appendChild(profileImage);
  profileSection.appendChild(usernameText);
  profileSection.appendChild(statsContainer);
  topContainer.appendChild(profileSection);

  // --- Menu principal ---
  const menuItems = [
    { icon: '/assets/side-bar/profil.png', label: t('sidebar.profile'), route: '/user-profile' },
    { icon: '/assets/side-bar/custom.png', label: t('sidebar.customization'), route: '/customization' },
    { icon: '/assets/side-bar/leaderboard.png', label: t('sidebar.leaderboard'), route: '/leaderboard' },
    { icon: '/assets/side-bar/friends.png', label: t('sidebar.friends'), route: '/friends' },
    { icon: '/assets/side-bar/pong.png', label: t('sidebar.games'), route: '/game' },
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
    { icon: '/assets/side-bar/aboutUs.png', label: t('sidebar.about'), route: '/about' },
    { icon: '/assets/side-bar/logout.png', label: t('sidebar.logout'), route: '/' },
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
    
    if (item.label === 'Log out' || item.label === t('sidebar.logout')) {
      menuItem.addEventListener('click', () => {
        localStorage.removeItem('token');
        sessionStorage.clear();
        localStorage.clear();
        navigate(item.route);
      });
    } else {
      menuItem.addEventListener('click', () => navigate(item.route));
    }

    bottomContainer.appendChild(menuItem);
  });

  // Assemble toute la sidebar
  sidebar.appendChild(topContainer);
  sidebar.appendChild(bottomContainer);

  // Mouvement de la sidebar
  sidebar.addEventListener('mouseenter', () => {
    const profileImg = document.getElementById('profile-img-sidebar') as HTMLImageElement;
    if (profileImg) {
      profileImg.classList.remove('w-12', 'h-12');
      profileImg.classList.add('w-36', 'h-36');
    }
  
    document.querySelectorAll('.sidebar-label').forEach(label => {
      (label as HTMLElement).classList.remove('opacity-0');
      (label as HTMLElement).classList.add('opacity-100');
    });
  });
  
  sidebar.addEventListener('mouseleave', () => {
    const profileImg = document.getElementById('profile-img-sidebar') as HTMLImageElement;
    if (profileImg) {
      profileImg.classList.remove('w-36', 'h-36');
      profileImg.classList.add('w-12', 'h-12');
    }
  
    document.querySelectorAll('.sidebar-label').forEach(label => {
      (label as HTMLElement).classList.add('opacity-0');
      (label as HTMLElement).classList.remove('opacity-100');
    });
  });
  
  return sidebar;
}

export function refreshSidebar() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const usernameText = document.getElementById('sidebar-username');
  if (usernameText) {
    usernameText.textContent = user.username || 'User';
  }

  const profileImg = document.getElementById('profile-img-sidebar') as HTMLImageElement;
  if (profileImg) {
    const profilePictureSrc = user.image || 
                             sessionStorage.getItem('profilePicture') || 
                             '/assets/profile-pictures/default.jpg';
    
    // Preload image before setting it
    const tempImg = new Image();
    tempImg.onload = () => {
      profileImg.src = profilePictureSrc;
    };
    tempImg.onerror = () => {
      profileImg.src = '/assets/profile-pictures/default.jpg';
    };
    tempImg.src = profilePictureSrc;
  }
}