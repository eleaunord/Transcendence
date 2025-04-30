
export function createProfileCreationPage(navigate: (path: string) => void): HTMLElement {
  let username = '';
  const profilePicture = '/assets/photo_profil.png';
  let selectedOption: 'game' | 'profile' = 'game';

  // --- Gestionnaire de soumission ---
  const handleGame = () => {
    sessionStorage.setItem('username', username);
    sessionStorage.setItem('profilePicture', profilePicture);
      navigate('/game');
  };
  
  const handleUserProfil = () => {
    sessionStorage.setItem('username', username);
    sessionStorage.setItem('profilePicture', profilePicture);
      navigate('/user-profile');
  };
  
  // --- Création du conteneur ---
  const container = document.createElement('div');
  container.className = 'flex flex-col justify-center items-center h-screen bg-gray-900 text-white';
  
  // --- Mise à jour de l’état sélectionné ---
  const updateSelectionUI = () => {
    gameBtn.className = baseBtnClass + (selectedOption === 'game' ? ' bg-blue-600' : ' bg-gray-600');
    customBtn.className = baseBtnClass + (selectedOption === 'profile' ? ' bg-blue-600' : ' bg-gray-600');
  };

  const form = document.createElement('form');
  form.id = 'profileForm';
  form.className = 'w-80 p-6 bg-gray-800 rounded-lg border-2 border-white';
  // --- Message de bienvenue ---
  const welcomeMsg = document.createElement('h1');
  welcomeMsg.className = 'text-3xl font-bold mb-4 text-center';
  welcomeMsg.textContent = 'Bienvenue !'; // par défaut
  form.appendChild(welcomeMsg);

  // --- Champ username ---
  const usernameDiv = document.createElement('div');
  usernameDiv.className = 'mb-4';

  const usernameLabel = document.createElement('label');
  usernameLabel.htmlFor = 'username';
  usernameLabel.className = 'block text-lg mb-2';
  usernameLabel.textContent = "Nom d'utilisateur";

  // --- Photo de profil ---
  const pictureDiv = document.createElement('div');
  pictureDiv.className = 'mb-4';

  // const pictureLabel = document.createElement('label');
  // pictureLabel.className = 'block text-lg mb-2';
  // pictureLabel.textContent = 'Photo de profil';

  const picturePreview = document.createElement('img');
  picturePreview.src = profilePicture;
  //picturePreview.src = `/assets/profile-pictures/${selectedImage}`;
  picturePreview.alt = 'Player Profile';
  picturePreview.className = 'w-24 h-24 rounded-full border-4 border-white';

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
  gameBtn.addEventListener('click', () => {
    selectedOption = 'game';
    updateSelectionUI();
    handleGame();
  });

  const customBtn = document.createElement('button');
  customBtn.type = 'button';
  customBtn.textContent = 'Personnaliser';
  customBtn.addEventListener('click', () => {
    selectedOption = 'profile';
    updateSelectionUI();
    handleUserProfil();
  });
  buttonsContainer.appendChild(gameBtn);
  buttonsContainer.appendChild(customBtn);
  choiceDiv.appendChild(buttonsContainer);


  // --- Deconnexion ---
  const logoutBtn = document.createElement('button');
  logoutBtn.textContent = 'Se déconnecter';
  logoutBtn.className = 'mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold';
  logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('token');
  navigate('/'); // ou /login ou /signup, selon ton point d’entrée
  });
  // --- Assemblage du formulaire ---
  // form.appendChild(usernameDiv);
  form.appendChild(pictureDiv);
  form.appendChild(choiceDiv);
  // form.appendChild(submitBtn);

  // container.appendChild(title);
  container.appendChild(form);
  container.appendChild(logoutBtn);

    // --- Chargement /api/me ---
  const imageSelector = document.createElement('div');
  imageSelector.className = 'flex gap-4 justify-center mb-2 flex-wrap';
  const token = localStorage.getItem('token');
  console.log('Token récupéré depuis localStorage :', token);
    const images = [
    'star_icon.jpg',
    'moon_icon.jpg',
    'sun_icon.jpg',
    'fire_icon.jpg',
    'bigstar_icon.jpg',
    'default.jpg'
  ];
  let selectedImage = '/assets/profile-pictures/default.jpg';
  images.forEach(img => {
    const avatar = document.createElement('img');
    avatar.src = `/assets/profile-pictures/${img}`;
    avatar.className = 'w-12 h-12 rounded-full border-2 border-gray-400 hover:border-blue-500 cursor-pointer';
    avatar.addEventListener('click', () => {
      selectedImage = img;
      picturePreview.src = `/assets/profile-pictures/${img}`;
    });
    imageSelector.appendChild(avatar);
  });
  if (token) {
    console.log('Token utilisé pour /api/me:', token);
    fetch('/api/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      // .then(res => res.json())
      // .then(user => {
        .then(res => {
          console.log('Statut de la réponse:', res.status);
          return res.json();
        })
        .then(user => {
          console.log('Données utilisateur reçues:', user);
        username = user.username;
        selectedImage = user.image; //|| 'default.jpg';
        picturePreview.src = `/assets/profile-pictures/${selectedImage}`;
        welcomeMsg.textContent = `Bienvenue ${user.username} !`;
      })
      .catch(err => console.error('Erreur chargement profil:', err));
  }
 updateSelectionUI(); // Applique les bonnes couleurs au démarrage

  return container;
}
