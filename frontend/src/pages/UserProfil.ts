// export function createUserProfilePage(navigate: (path: string) => void): HTMLElement {

//     let profilePicture = sessionStorage.getItem('profilePicture') || '/public/assets/photo_profil.png';
//     let isModalOpen = false;
//     let profileTheme = 'bg-gray-900';
//     let backgroundImage = '/assets/profile-themes/default_cover.jpg';
//     const playerLevel = 5;
//     const gameHistory = [
//       { opponent: 'AI', result: 'Win', date: '2025-04-09' },
//       { opponent: 'PlayerTwo', result: 'Loss', date: '2025-04-08' },
//       { opponent: 'AI', result: 'Win', date: '2025-04-07' },
//     ];
  
//     const getPlayerBadge = (level: number) => {
//       if (level <= 5) return 'Novice';
//       if (level <= 10) return 'Intermediate';
//       return 'Expert';
//     };
  
//     const updateProfilePicture = (src: string) => {
//       profilePicture = src;
//       sessionStorage.setItem('profilePicture', src);
//       profileImg.src = profilePicture;
//       closeModal();
//     };
  
//     const updateTheme = (theme: string, bg: string) => {
//       profileTheme = theme;
//       backgroundImage = bg;
//       bgLayer.style.backgroundImage = `url(${backgroundImage})`;
//     };
  
//     const openModal = () => {
//       isModalOpen = true;
//       modalOverlay.style.display = 'flex';
//     };
  
//     const closeModal = () => {
//       isModalOpen = false;
//       modalOverlay.style.display = 'none';
//     };
  
//     const container = document.createElement('div');
//     container.className = 'relative flex flex-col h-screen text-white overflow-hidden';
  
//     const bgLayer = document.createElement('div');
//     bgLayer.className = 'absolute inset-0 bg-cover bg-center z-0';
//     bgLayer.style.backgroundImage = `url(${backgroundImage})`;
  
//     const header = document.createElement('header');
//     header.className = 'bg-blue-800 p-4 shadow-lg fixed top-0 left-0 w-full z-20';
//     const h1 = document.createElement('h1');
//     h1.className = 'text-3xl font-bold text-center';
//     h1.textContent = 'Profil Utilisateur';
//     header.appendChild(h1);
  
//     const contentWrap = document.createElement('div');
//     contentWrap.className = 'flex flex-1 justify-center items-center mt-20 z-10';
  
//     const card = document.createElement('div');
//     card.className = 'w-3/4 p-6 rounded-lg border-2 border-white bg-gray-900/80';
  
//     // Thème buttons
//     const themes = [
//       ['bg-red-600', '/assets/profile-themes/stars.jpg'],
//       ['bg-green-600', '/assets/profile-themes/moon_sun_black.jpg'],
//       ['bg-blue-600', '/assets/profile-themes/moon_sun_blue.jpg'],
//     ];
  
//     const themeRow = document.createElement('div');
//     themeRow.className = 'flex justify-between mb-4';
//     themes.forEach(([theme, bg]) => {
//       const btn = document.createElement('button');
//       btn.className = `px-4 py-2 ${theme} hover:bg-opacity-80 text-white font-semibold rounded-lg`;
//       btn.textContent = `Thème ${themes.indexOf([theme, bg]) + 1}`;
//       btn.addEventListener('click', () => updateTheme(theme, bg));
//       themeRow.appendChild(btn);
//     });
  
//     // Profil image
//     const profileWrap = document.createElement('div');
//     profileWrap.className = 'flex justify-center mb-4 relative';
  
//     const profileImg = document.createElement('img');
//     profileImg.src = profilePicture;
//     profileImg.alt = 'Player Profile';
//     profileImg.className = 'w-32 h-32 rounded-full border-4 border-white';
  
//     const sparkleBtn = document.createElement('button');
//     sparkleBtn.textContent = '✨';
//     sparkleBtn.className = 'absolute top-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700';
//     sparkleBtn.addEventListener('click', openModal);
  
//     profileWrap.appendChild(profileImg);
//     profileWrap.appendChild(sparkleBtn);
  
//     // Infos
//     const infoBox = document.createElement('div');
//     infoBox.className = 'bg-gray-700/80 p-4 rounded-lg border-2 border-white mb-4';
//     infoBox.innerHTML = `
//       <ul class="space-y-4 text-center text-lg">
//         <li><strong>Username:</strong> PlayerOne</li>
//         <li><strong>Level:</strong> ${playerLevel} (${getPlayerBadge(playerLevel)})</li>
//         <li><strong>Wins:</strong> 10</li>
//       </ul>
//     `;
  
//     // Historique
//     const historyBox = document.createElement('div');
//     historyBox.className = 'bg-gray-700/80 p-4 rounded-lg border-2 border-white mb-4';
//     const historyTitle = document.createElement('h3');
//     historyTitle.className = 'text-xl text-center mb-4';
//     historyTitle.textContent = 'Historique des Parties';
//     const historyList = document.createElement('ul');
//     historyList.className = 'space-y-2';
//     gameHistory.forEach((game) => {
//       const li = document.createElement('li');
//       li.textContent = `${game.date} - Opponent: ${game.opponent} - Result: ${game.result}`;
//       historyList.appendChild(li);
//     });
  
//     historyBox.appendChild(historyTitle);
//     historyBox.appendChild(historyList);
  
//     // Back button
//     const backBtn = document.createElement('button');
//     backBtn.className =
//       'fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg z-30';
//     backBtn.textContent = 'Retour';
//     backBtn.addEventListener('click', () => window.history.back());
  
//     // Modale de changement de photo
//     const modalOverlay = document.createElement('div');
//     modalOverlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50';
//     modalOverlay.style.display = 'none';
  
//     const modalContent = document.createElement('div');
//     modalContent.className = 'bg-gray-800 p-6 rounded-lg w-3/4 md:w-1/2';
  
//     const modalTitle = document.createElement('h2');
//     modalTitle.className = 'text-2xl font-bold text-white text-center mb-4';
//     modalTitle.textContent = 'Choisissez une nouvelle photo';
  
//     const grid = document.createElement('div');
//     grid.className = 'grid grid-cols-3 gap-4';
//     const images = ['star_icon.jpg', 'bigstar_icon.jpg', 'moon_icon.jpg', 'sun_icon.jpg', 'fire_icon.jpg'];
//     images.forEach((image, index) => {
//       const choice = document.createElement('div');
//       choice.className = 'cursor-pointer';
//       choice.innerHTML = `<img src="/assets/profile-pictures/${image}" alt="Option ${index + 1}" class="w-full h-32 object-cover rounded-lg" />`;
//       choice.addEventListener('click', () =>
//         updateProfilePicture(`/assets/profile-pictures/${image}`)
//       );
//       grid.appendChild(choice);
//     });
  
//     const upload = document.createElement('div');
//     upload.className =
//       'cursor-pointer bg-gray-600 flex justify-center items-center text-white font-semibold rounded-lg';
//     upload.textContent = '+ Télécharger';
//     upload.addEventListener('click', () => fileInput.click());
//     grid.appendChild(upload);
  
//     const fileInput = document.createElement('input');
//     fileInput.type = 'file';
//     fileInput.accept = 'image/*';
//     fileInput.className = 'hidden';
//     fileInput.addEventListener('change', (e) => {
//       const file = (e.target as HTMLInputElement)?.files?.[0];
//       if (file) {
//         const reader = new FileReader();
//         reader.onloadend = () => {
//           if (reader.result) updateProfilePicture(reader.result as string);
//         };
//         reader.readAsDataURL(file);
//       }
//     });
  
//     const closeModalBtn = document.createElement('button');
//     closeModalBtn.className =
//       'mt-4 w-full py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg';
//     closeModalBtn.textContent = 'Fermer';
//     closeModalBtn.addEventListener('click', closeModal);
  
//     modalContent.appendChild(modalTitle);
//     modalContent.appendChild(grid);
//     modalContent.appendChild(fileInput);
//     modalContent.appendChild(closeModalBtn);
//     modalOverlay.appendChild(modalContent);
  
//     // Assemble page
//     card.appendChild(themeRow);
//     card.appendChild(profileWrap);
//     card.appendChild(infoBox);
//     card.appendChild(historyBox);
//     contentWrap.appendChild(card);
  
//     container.appendChild(bgLayer);
//     container.appendChild(header);
//     container.appendChild(contentWrap);
//     container.appendChild(backBtn);
//     container.appendChild(modalOverlay);
  
//     return container;
//   }
  