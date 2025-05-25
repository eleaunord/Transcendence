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
  min-w-[5rem]
`.replace(/\s+/g, ' ').trim();


  // --- Partie haute de la sidebar ---
  const topContainer = document.createElement('div');
  topContainer.className = 'flex flex-col gap-1';

  // --- Profil Section ---
  const profileSection = document.createElement('div');
  profileSection.className = 'relative flex flex-col items-center mb-28 h-36';

  const profileImage = document.createElement('img');
  
  // Enhanced profile picture loading with error handling and caching
  function loadProfilePicture(retryCount = 0) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    let profilePictureSrc = user.image || 
                           sessionStorage.getItem('profilePicture') || 
                           '/assets/profile-pictures/default.jpg';
    
    // If no user data and we haven't retried much, wait and retry
    if (!user.image && !sessionStorage.getItem('profilePicture') && retryCount < 3) {
      setTimeout(() => loadProfilePicture(retryCount + 1), 200);
      return;
    }
    
    // Ensure the image loads properly
    const tempImg = new Image();
    tempImg.onload = () => {
      profileImage.src = profilePictureSrc;
      profileImage.style.opacity = '1';
    };
    tempImg.onerror = () => {
      console.warn('Failed to load profile picture, using default');
      profileImage.src = '/assets/profile-pictures/default.jpg';
      profileImage.style.opacity = '1';
    };
    tempImg.src = profilePictureSrc;
  }

  // Initial load with delay to ensure data is available
  setTimeout(() => loadProfilePicture(), 50);
  
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
      }, 150); // Increased delay to ensure everything is loaded
    }
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Also listen for storage changes in case user data is updated in another tab
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'user' || e.key === null) {
      setTimeout(() => loadProfilePicture(), 100);
    }
  };
  
  window.addEventListener('storage', handleStorageChange);

  profileImage.className = `
  absolute top-0 
  w-12 h-12 hover:w-36 hover:h-36
  rounded-full mb-2 
  border-2 border-white 
  object-cover 
  transition-all duration-300
  opacity-0
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

  const theme = sessionStorage.getItem('theme') || '/assets/Backgrounds/bg_th1.jpg';
const themeMatch = theme.match(/bg_th(\d)/);
const themeId = themeMatch ? `th${themeMatch[1]}` : 'th1';
const themeFolder = `/assets/Icons/Thème ${themeId.slice(-1)}`;

const menuItems = [
  { name: 'profile', label: t('sidebar.profile'), route: '/user-profile' },
  { name: 'custom', label: t('sidebar.customization'), route: '/customization' },
  { name: 'leaderboard', label: t('sidebar.leaderboard'), route: '/leaderboard' },
  { name: 'friends', label: t('sidebar.friends'), route: '/friends' },
  { name: 'pong', label: t('sidebar.games'), route: '/game' },
];

menuItems.forEach(item => {
  const menuItem = document.createElement('div');
menuItem.className = `
  flex items-center gap-4 p-2
  cursor-pointer hover:bg-blue-700
  rounded-md transition-colors duration-200
  shrink-0
`.replace(/\s+/g, ' ').trim();


  const icon = document.createElement('img');
  icon.src = `${themeFolder}/sb_${item.name}_${themeId}.png`;
  icon.className = 'w-12 h-12 min-w-[3rem] min-h-[3rem] shrink-0';



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
  { name: 'aboutus', label: t('sidebar.about'), route: '/about' },
  { name: 'logout', label: t('sidebar.logout'), route: '/' },
];

bottomItems.forEach(item => {
  const menuItem = document.createElement('div');
  menuItem.className = 'flex items-center gap-4 p-2 cursor-pointer hover:bg-blue-700 rounded-md transition-colors duration-200';

  const icon = document.createElement('img');
  icon.src = `${themeFolder}/sb_${item.name}_${themeId}.png`;
  icon.className = 'w-12 h-12 min-w-[3rem] min-h-[3rem] shrink-0';

  const label = document.createElement('span');
  label.textContent = item.label;
  label.className = 'whitespace-nowrap opacity-0 sidebar-label transition-opacity duration-300';

  menuItem.appendChild(icon);
  menuItem.appendChild(label);

  if (item.name === 'logout') {
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
  
  window.addEventListener('themeChanged', () => {
  const theme = sessionStorage.getItem('theme') || '/assets/Backgrounds/bg_th1.jpg';
  const themeMatch = theme.match(/bg_th(\d)/);
  const themeId = themeMatch ? `th${themeMatch[1]}` : 'th1';
  const themeFolder = `/assets/Icons/Thème ${themeId.slice(-1)}`;

  // Liste des icônes par ID et nom logique
  const iconMap = {
    profile: 'sb_profile',
    custom: 'sb_custom',
    leaderboard: 'sb_leaderboard',
    friends: 'sb_friends',
    pong: 'sb_pong',
    aboutus: 'sb_aboutus',
    logout: 'sb_logout'
  };

  // Remplacer les icônes existantes
  Object.entries(iconMap).forEach(([key, baseName]) => {
    const icon = document.querySelector(`img[src*="${baseName}_"]`) as HTMLImageElement;
    if (icon) {
      icon.src = `${themeFolder}/${baseName}_${themeId}.png`;
    }
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
    
    // Start with opacity 0 for smooth loading
    profileImg.style.opacity = '0';
    
    // Preload image before setting it
    const tempImg = new Image();
    tempImg.onload = () => {
      profileImg.src = profilePictureSrc;
      profileImg.style.opacity = '1';
    };
    tempImg.onerror = () => {
      profileImg.src = '/assets/profile-pictures/default.jpg';
      profileImg.style.opacity = '1';
    };
    tempImg.src = profilePictureSrc;
  }
}
