import { t } from "../utils/translator";

export function createSidebar(navigate: (path: string) => void): HTMLElement {
  const sidebar = document.createElement('div');
  sidebar.id = 'sidebar';
  // sidebar.className = 'fixed top-0 left-0 h-full bg-gray-800 bg-opacity-75 transition-all duration-300 ease-in-out z-20 flex flex-col justify-between p-4 w-20 hover:w-64 overflow-hidden';
  //sidebar.className = 'fixed top-0 left-0 h-full bg-gray-800 bg-opacity-75 transition-all duration-300 ease-in-out z-20 flex flex-col justify-between p-4 w-20 hover:w-64 overflow-visible';

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
  // profileSection.className = 'flex flex-col items-center mb-28 transition-all duration-300';
  profileSection.className = 'relative flex flex-col items-center mb-28 h-36';

  const profileImage = document.createElement('img');
  let profilePictureSrc = sessionStorage.getItem('profilePicture') || '/assets/profile-pictures/default.jpg';
  profileImage.src = profilePictureSrc;

  // Ajout du listener d'événement(changement photo profil)
  window.addEventListener('profilePictureUpdated', (e: Event) => {
    const customEvent = e as CustomEvent<string>;
    profileImage.src = customEvent.detail;
  });
  profileImage.className = `
  absolute top-0 
  w-12 h-12 hover:w-36 hover:h-36
  rounded-full mb-2 
  border-2 border-white 
  object-cover 
  transition-all duration-300
`.replace(/\s+/g, ' ').trim();

  // profileImage.className = 'w-36 h-36 rounded-full mb-2 border-2 border-white object-cover transition-transform duration-300 hover:scale-110';
  profileImage.id = 'profile-img-sidebar';

  const usernameText = document.createElement('span');
  usernameText.id = 'sidebar-username';
  // usernameText.className = 'text-white text-lg opacity-0 sidebar-label transition-opacity duration-300 mb-1';
  usernameText.className = 'text-white text-xl opacity-0 sidebar-label transition-opacity duration-300 p-4 mt-36 absolute';

  //met a jour username avec ce qui est stocke
  usernameText.textContent = sessionStorage.getItem('username') || t('sidebar.username');


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
    if (item.label === 'Log out') {
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
       // profileImg.style.transform = 'scale(3)';

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
       //profileImg.style.transform = 'scale(1)';

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
