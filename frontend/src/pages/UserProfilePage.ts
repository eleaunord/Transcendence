// export function createUserProfilePage(navigate: (path: string) => void): HTMLElement {

//   let profilePicture = sessionStorage.getItem('profilePicture') || '/public/assets/profil-pictures/default.jpg';
//   let isModalOpen = false;
//   let profileTheme = 'bg-gray-900';
//   let backgroundImage = '/assets/profile-themes/default_cover.jpg';
//   const playerLevel = 5;
//   const gameHistory = [
//     { opponent: 'AI', result: 'Win', date: '2025-04-09' },
//     { opponent: 'PlayerTwo', result: 'Loss', date: '2025-04-08' },
//     { opponent: 'AI', result: 'Win', date: '2025-04-07' },
//   ];

//   const getPlayerBadge = (level: number) => {
//     if (level <= 5) return 'Novice';
//     if (level <= 10) return 'Intermediate';
//     return 'Expert';
//   };

//   const updateProfilePicture = (src: string) => {
//     profilePicture = src;
//     sessionStorage.setItem('profilePicture', src);
//     profileImg.src = profilePicture;
//     closeModal();
//   };

//   const updateTheme = (theme: string, bg: string) => {
//     profileTheme = theme;
//     backgroundImage = bg;
//     bgLayer.style.backgroundImage = `url(${backgroundImage})`;
//   };

//   const openModal = () => {
//     isModalOpen = true;
//     modalOverlay.style.display = 'flex';
//   };

//   const closeModal = () => {
//     isModalOpen = false;
//     modalOverlay.style.display = 'none';
//   };

//   const container = document.createElement('div');
//   container.className = 'relative flex flex-col h-screen text-white overflow-hidden';

//   const bgLayer = document.createElement('div');
//   bgLayer.className = 'absolute inset-0 bg-cover bg-center z-0';
//   bgLayer.style.backgroundImage = `url(${backgroundImage})`;

//   const header = document.createElement('header');
//   header.className = 'bg-blue-800 p-4 shadow-lg fixed top-0 left-0 w-full z-20';
//   const h1 = document.createElement('h1');
//   h1.className = 'text-3xl font-bold text-center';
//   h1.textContent = 'Profil Utilisateur';
//   header.appendChild(h1);

//   const contentWrap = document.createElement('div');
//   contentWrap.className = 'flex flex-1 justify-center items-center mt-20 z-10';

//   const card = document.createElement('div');
//   card.className = 'w-3/4 p-6 rounded-lg border-2 border-white bg-gray-900/80';

//   // Thème buttons
//   //const themes = [
//   //   ['bg-red-600', '/assets/profile-themes/stars.jpg'],
//   //   ['bg-green-600', '/assets/profile-themes/moon_sun_black.jpg'],
//   //   ['bg-blue-600', '/assets/profile-themes/moon_sun_blue.jpg'],
//   // ];

//   // const themeRow = document.createElement('div');
//   // themeRow.className = 'flex justify-between mb-4';
//   // themes.forEach(([theme, bg]) => {
//   //   const btn = document.createElement('button');
//   //   btn.className = `px-4 py-2 ${theme} hover:bg-opacity-80 text-white font-semibold rounded-lg`;
//   //   btn.textContent = `Thème ${themes.indexOf([theme, bg]) + 1}`;
//   //   btn.addEventListener('click', () => updateTheme(theme, bg));
//   //   themeRow.appendChild(btn);
//   // });

//   // Profil image
//   const profileWrap = document.createElement('div');
//   profileWrap.className = 'flex justify-center mb-4 relative';

//   const profileImg = document.createElement('img');
//   profileImg.src = profilePicture;
//   profileImg.alt = 'Player Profile';
//   profileImg.className = 'w-32 h-32 rounded-full border-4 border-white';

//   // const sparkleBtn = document.createElement('button');
//   // sparkleBtn.textContent = '✨';
//   // sparkleBtn.className = 'absolute top-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700';
//   // sparkleBtn.addEventListener('click', openModal);

//   profileWrap.appendChild(profileImg);
//   //profileWrap.appendChild(sparkleBtn);

//   // Infos
//   // const infoBox = document.createElement('div');
//   // infoBox.className = 'bg-gray-700/80 p-4 rounded-lg border-2 border-white mb-4';
//   // infoBox.innerHTML = `
//   //   <ul class="space-y-4 text-center text-lg">
//   //     <li><strong>Username:</strong> PlayerOne</li>
//   //     <li><strong>Level:</strong> ${playerLevel} (${getPlayerBadge(playerLevel)})</li>
//   //     <li><strong>Wins:</strong> 10</li>
//   //   </ul>
//   // `;

//   // Historique
//   const historyBox = document.createElement('div');
//  // historyBox.className = 'bg-gray-700/80 p-4 rounded-lg border-2 border-white mb-4';
//   // const historyTitle = document.createElement('h3');
//   // historyTitle.className = 'text-xl text-center mb-4';
//   // historyTitle.textContent = 'Historique des Parties';
//   // const historyList = document.createElement('ul');
//   // historyList.className = 'space-y-2';
//   // gameHistory.forEach((game) => {
//   //   const li = document.createElement('li');
//   //   li.textContent = `${game.date} - Opponent: ${game.opponent} - Result: ${game.result}`;
//   //   historyList.appendChild(li);
//   // });

//   // historyBox.appendChild(historyTitle);
//   // historyBox.appendChild(historyList);

//   // Back button
//   const backBtn = document.createElement('button');
//   backBtn.className =
//     'fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg z-30';
//   backBtn.textContent = 'Retour';
//   backBtn.addEventListener('click', () => window.history.back());

//   // Modale de changement de photo
//   const modalOverlay = document.createElement('div');
//   modalOverlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50';
//   modalOverlay.style.display = 'none';

//   const modalContent = document.createElement('div');
//   modalContent.className = 'bg-gray-800 p-6 rounded-lg w-3/4 md:w-1/2';

//   const modalTitle = document.createElement('h2');
//   modalTitle.className = 'text-2xl font-bold text-white text-center mb-4';
//   modalTitle.textContent = 'Choisissez une nouvelle photo';

//   const grid = document.createElement('div');
//   grid.className = 'grid grid-cols-3 gap-4';
//   const images = ['star_icon.jpg', 'bigstar_icon.jpg', 'moon_icon.jpg', 'sun_icon.jpg', 'fire_icon.jpg'];
//   images.forEach((image, index) => {
//     const choice = document.createElement('div');
//     choice.className = 'cursor-pointer';
//     choice.innerHTML = `<img src="/assets/profile-pictures/${image}" alt="Option ${index + 1}" class="w-full h-32 object-cover rounded-lg" />`;
//     choice.addEventListener('click', () =>
//       updateProfilePicture(`/assets/profile-pictures/${image}`)
//     );
//     grid.appendChild(choice);
//   });

//   const upload = document.createElement('div');
//   upload.className =
//     'cursor-pointer bg-gray-600 flex justify-center items-center text-white font-semibold rounded-lg';
//   upload.textContent = '+ Télécharger';
//   upload.addEventListener('click', () => fileInput.click());
//   grid.appendChild(upload);

//   const fileInput = document.createElement('input');
//   fileInput.type = 'file';
//   fileInput.accept = 'image/*';
//   fileInput.className = 'hidden';
//   fileInput.addEventListener('change', (e) => {
//     const file = (e.target as HTMLInputElement)?.files?.[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         if (reader.result) updateProfilePicture(reader.result as string);
//       };
//       reader.readAsDataURL(file);
//     }
//   });

//   const closeModalBtn = document.createElement('button');
//   closeModalBtn.className =
//     'mt-4 w-full py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg';
//   closeModalBtn.textContent = 'Fermer';
//   closeModalBtn.addEventListener('click', closeModal);

//   modalContent.appendChild(modalTitle);
//   modalContent.appendChild(grid);
//   modalContent.appendChild(fileInput);
//   modalContent.appendChild(closeModalBtn);
//   modalOverlay.appendChild(modalContent);

//   // Assemble page
//   //card.appendChild(themeRow);
//   card.appendChild(profileWrap);
//   //card.appendChild(infoBox);
//   card.appendChild(historyBox);
//   contentWrap.appendChild(card);

//   container.appendChild(bgLayer);
//   container.appendChild(header);
//   container.appendChild(contentWrap);
//   container.appendChild(backBtn);
//   container.appendChild(modalOverlay);

//    return container;
//export function createSideMenuPage(navigate: (path: string) => void): HTMLElement {
 // export function createSideMenuWithIconsPage(navigate: (path: string) => void): HTMLElement {
 // export function createUserProfilePage(navigate: (path: string) => void): HTMLElement {
export function createUserProfilePage(navigate: (path: string) => void): HTMLElement {
    const container = document.createElement('div');
    container.className = 'relative min-h-screen bg-gray-900 text-white overflow-hidden';
  
    // Sidebar container
    const sidebar = document.createElement('div');
    sidebar.id = 'sidebar';
    sidebar.className = 'fixed  top-0 left-0 h-full bg-white-800 opacity-75 transition-all duration-300 ease-in-out z-20 flex flex-col p-4 w-20 hover:w-64 overflow-hidden';
  
    const menuItems = [
      { icon: '/assets/side-bar/profil.png', label: 'Profile', route: '/user-profile' },
      { icon: '/assets/side-bar/custom.png', label: 'Customization', route: '/' },
      { icon: '/assets/side-bar/leaderboard.png', label: 'leaderboard', route: '/user-profile' },
      { icon: '/assets/side-bar/friends.png', label: 'Friends', route: '/user-profile' },
      { icon: '/assets/side-bar/pong.png', label: 'Games', route: '/game' },
      { icon: '/assets/side-bar/aboutUs.png', label: 'About us', route: '/user-profile' },
      { icon: '/assets/side-bar/logout.png', label: 'Log out', route: '/' },

    ];
  
    menuItems.forEach(item => {
      const menuItem = document.createElement('div');
      menuItem.className = 'flex items-center gap-4 p-2 cursor-pointer hover:bg-blue-00 rounded-md';
  
      const icon = document.createElement('img');
      icon.src = item.icon; // l'URL l'image
      icon.className = 'w-8 h-8'; // taille de l'image
      
      const label = document.createElement('span');
      label.textContent = item.label;
      label.className = 'whitespace-nowrap opacity-0 sidebar-label transition-opacity duration-300';
  
      menuItem.appendChild(icon);
      menuItem.appendChild(label);
      menuItem.addEventListener('click', () => navigate(item.route));
  
      sidebar.appendChild(menuItem);
    });
  
    // Main content
    const mainContent = document.createElement('div');
    mainContent.className = 'ml-20 p-8';
  
    const title = document.createElement('h1');
    title.className = 'text-3xl font-bold';
    title.textContent = 'Page';
  
    mainContent.appendChild(title);
  
    container.appendChild(sidebar);
    container.appendChild(mainContent);
  
    // Hover event to show/hide labels
    sidebar.addEventListener('mouseenter', () => {
      document.querySelectorAll('.sidebar-label').forEach(label => {
        (label as HTMLElement).classList.remove('opacity-0');
        (label as HTMLElement).classList.add('opacity-100');
      });
    });
  
    sidebar.addEventListener('mouseleave', () => {
      document.querySelectorAll('.sidebar-label').forEach(label => {
        (label as HTMLElement).classList.add('opacity-0');
        (label as HTMLElement).classList.remove('opacity-100');
      });
    });
  
    return container;
  }
  


// export function createUserProfilePage(navigate: (path: string) => void): HTMLElement {
  
//   let backgroundImage = 'assets/profile-themes/default_cover.jpg'

//   const container = document.createElement('div');
//   container.className = 'relative min-h-screen bg-gray-900 text-white overflow-hidden';

//   // Sidebar
//   const sidebar = document.createElement('div');
//   sidebar.id = 'sidebar';
//   sidebar.className = 'fixed top-0 left-[-300px] w-64 h-full bg-blue-800 transition-all duration-300 ease-in-out p-6 z-20';
  
//   const sidebarTitle = document.createElement('h2');
//   sidebarTitle.className = 'text-2xl font-bold mb-6';
//   sidebarTitle.textContent = 'Menu';
//   sidebar.appendChild(sidebarTitle);

//   const menuList = document.createElement('ul');
//   ['Home', 'Profile', 'Settings'].forEach(item => {
//     const li = document.createElement('li');
//     li.className = 'mb-4 cursor-pointer hover:underline';
//     li.textContent = item;
//     menuList.appendChild(li);
//   });

//   sidebar.appendChild(menuList);

//   // Toggle Button
//   const toggleBtn = document.createElement('button');
//   toggleBtn.id = 'toggleBtn';
//   toggleBtn.className = 'absolute top-4 left-4 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded z-30';
//   toggleBtn.textContent = '☰ Menu';

//   // Main Content
//   const mainContent = document.createElement('div');
//   mainContent.className = 'p-8';

//   const mainTitle = document.createElement('h1');
//   mainTitle.className = 'backgroundImage text-3xl font-bold';
//   mainTitle.textContent = 'Main Page Content';

//   const mainParagraph = document.createElement('p');
//   mainParagraph.className = 'mt-4';
//   mainParagraph.textContent = 'Welcome to your side menu test page!';

//   mainContent.appendChild(mainTitle);
//   mainContent.appendChild(mainParagraph);

//   // Assemble page
//   container.appendChild(sidebar);
//   container.appendChild(toggleBtn);
//   container.appendChild(mainContent);

//   // Toggle functionality
//   toggleBtn.addEventListener('click', () => {
//     if (sidebar.style.left === '0px') {
//       sidebar.style.left = '-300px';
//     } else {
//       sidebar.style.left = '0px';
//     }
//   });

//   return container;
// }
