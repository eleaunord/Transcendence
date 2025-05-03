export function createProfileCreationPage(navigate: (path: string) => void): HTMLElement {
  let username = '';
  let selectedImage = '/assets/profile-pictures/default.jpg'; // image par défaut
  let selectedOption: 'game' | 'profile' = 'game';

  const container = document.createElement('div');
  container.className = 'flex flex-col justify-center items-center h-screen bg-gray-900 text-white';

  const updateSelectionUI = () => {
    gameBtn.className = baseBtnClass + (selectedOption === 'game' ? ' bg-blue-600' : ' bg-gray-600');
    customBtn.className = baseBtnClass + (selectedOption === 'profile' ? ' bg-blue-600' : ' bg-gray-600');
  };

  const form = document.createElement('form');
  form.id = 'profileForm';
  form.className = 'w-80 p-6 bg-gray-800 rounded-lg border-2 border-white';

  const welcomeMsg = document.createElement('h1');
  welcomeMsg.className = 'text-3xl font-bold mb-4 text-center';
  welcomeMsg.textContent = 'Bienvenue !';
  form.appendChild(welcomeMsg);

  // --- Photo de profil ---
  const pictureDiv = document.createElement('div');
  pictureDiv.className = 'mb-4';

  // const pictureLabel = document.createElement('label');
  // pictureLabel.className = 'block text-lg mb-2';
  // pictureLabel.textContent = 'Photo de profil';

  const picturePreview = document.createElement('img');
  picturePreview.src = selectedImage;
  picturePreview.alt = 'Player Profile';
  picturePreview.className = 'w-24 h-24 rounded-full border-4 border-white'; // garder le style initial

  const pictureContainer = document.createElement('div');
  pictureContainer.className = 'flex justify-center mb-4';
  pictureContainer.appendChild(picturePreview);

  // pictureDiv.appendChild(pictureLabel);
  pictureDiv.appendChild(pictureContainer);

  // --- Choix game/customization ---
  const choiceDiv = document.createElement('div');
  choiceDiv.className = 'mb-4';

  const buttonsContainer = document.createElement('div');
  buttonsContainer.className = 'flex justify-around';

  const baseBtnClass = 'px-4 py-2 hover:bg-blue-700 text-white font-semibold rounded-lg';

  const gameBtn = document.createElement('button');
  gameBtn.type = 'button';
  gameBtn.textContent = 'Aller au jeu';
  gameBtn.addEventListener('click', async () => {
    selectedOption = 'game';
    updateSelectionUI();

    sessionStorage.setItem('username', username);
    sessionStorage.setItem('profilePicture', selectedImage);

    const token = localStorage.getItem('token');
    if (token) {
      await fetch('/api/me/image', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image: selectedImage })
      });
    }

    navigate('/game');
  });

  const customBtn = document.createElement('button');
  customBtn.type = 'button';
  customBtn.textContent = 'Personnaliser';
  customBtn.addEventListener('click', async () => {
    selectedOption = 'profile';
    updateSelectionUI();

    sessionStorage.setItem('username', username);
    sessionStorage.setItem('profilePicture', selectedImage);

    const token = localStorage.getItem('token');
    if (token) {
      await fetch('/api/me/image', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image: selectedImage })
      });
    }

    navigate('/user-profile');
  });

  buttonsContainer.appendChild(gameBtn);
  buttonsContainer.appendChild(customBtn);
  choiceDiv.appendChild(buttonsContainer);

  // --- Déconnexion ---
  const logoutBtn = document.createElement('button');
  logoutBtn.textContent = 'Se déconnecter';
  logoutBtn.className = 'mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold';
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    navigate('/');
  });

  // --- Chargement /api/me ---
  //gameBtn.disabled = true;
  //customBtn.disabled = true;
  
  const token = localStorage.getItem('token');
  if (token) {
    (async () => {
      try {
        const res = await fetch('/api/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const user = await res.json();
        username = user.username;
        welcomeMsg.textContent = `Bienvenue ${user.username} !`;
        //affiche l'image de profil stocke en base de donnees
        if (user.image) {
          selectedImage = user.image;
          picturePreview.src = user.image;
        }
        // ✅ Réactive les boutons uniquement quand tout est prêt
        //gameBtn.disabled = false;
        //customBtn.disabled = false;
      } catch (err) {
        console.error("Erreur chargement profil:", err);
      }
    })();
  }

  // --- Assemblage du formulaire ---
  form.appendChild(pictureDiv);

  // // --- Sélecteur d’images désactivé pour le moment ---
  // const imageSelector = document.createElement('div');
  // imageSelector.className = 'flex gap-4 justify-center mb-2 flex-wrap';
  // const images = [
  //   'star_icon.jpg',
  //   'moon_icon.jpg',
  //   'sun_icon.jpg',
  //   'fire_icon.jpg',
  //   'bigstar_icon.jpg',
  //   'default.jpg'
  // ];
  // images.forEach(img => {
  //   const avatar = document.createElement('img');
  //   avatar.src = `/assets/profile-pictures/${img}`;
  //   avatar.className = 'w-12 h-12 rounded-full border-2 border-gray-400 hover:border-blue-500 cursor-pointer';
  //   avatar.addEventListener('click', () => {
  //     selectedImage = `/assets/profile-pictures/${img}`;
  //     picturePreview.src = selectedImage;
  //   });
  //   imageSelector.appendChild(avatar);
  // });
  // form.appendChild(imageSelector);

  form.appendChild(choiceDiv);
  container.appendChild(form);
  container.appendChild(logoutBtn);

  updateSelectionUI();
  return container;
}
