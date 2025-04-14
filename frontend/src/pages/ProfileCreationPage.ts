export function createProfileCreationPage(navigate: (path: string) => void): HTMLElement {
  let username = '';
  const profilePicture = '/assets/photo_profil.png';
  let selectedOption: 'game' | 'customization' = 'game';

  // --- Gestionnaire de soumission ---
  const handleProfileSubmit = () => {
    sessionStorage.setItem('username', username);
    sessionStorage.setItem('profilePicture', profilePicture);

    if (selectedOption === 'game') {
      navigate('/game');
    } else {
      navigate('/customization');
    }
  };

  // --- Mise à jour de l’état sélectionné ---
  const updateSelectionUI = () => {
    gameBtn.className = baseBtnClass + (selectedOption === 'game' ? ' bg-blue-600' : ' bg-gray-600');
    customBtn.className = baseBtnClass + (selectedOption === 'customization' ? ' bg-blue-600' : ' bg-gray-600');
  };

  // --- Création du conteneur ---
  const container = document.createElement('div');
  container.className = 'flex flex-col justify-center items-center h-screen bg-gray-900 text-white';

  const title = document.createElement('h1');
  title.className = 'text-4xl font-bold mb-8';
  title.textContent = 'Créer votre profil';

  const form = document.createElement('form');
  form.id = 'profileForm';
  form.className = 'w-80 p-6 bg-gray-800 rounded-lg border-2 border-white';

  // --- Champ username ---
  const usernameDiv = document.createElement('div');
  usernameDiv.className = 'mb-4';

  const usernameLabel = document.createElement('label');
  usernameLabel.htmlFor = 'username';
  usernameLabel.className = 'block text-lg mb-2';
  usernameLabel.textContent = "Nom d'utilisateur";

  const usernameInput = document.createElement('input');
  usernameInput.type = 'text';
  usernameInput.id = 'username';
  usernameInput.className = 'w-full p-2 bg-gray-700 text-white rounded-lg';
  usernameInput.placeholder = 'Votre nom';
  usernameInput.required = true;
  usernameInput.addEventListener('input', (e) => {
    username = (e.target as HTMLInputElement).value;
  });

  usernameDiv.appendChild(usernameLabel);
  usernameDiv.appendChild(usernameInput);

  // --- Photo de profil ---
  const pictureDiv = document.createElement('div');
  pictureDiv.className = 'mb-4';

  const pictureLabel = document.createElement('label');
  pictureLabel.className = 'block text-lg mb-2';
  pictureLabel.textContent = 'Photo de profil';

  const picturePreview = document.createElement('img');
  picturePreview.src = profilePicture;
  picturePreview.alt = 'Player Profile';
  picturePreview.className = 'w-24 h-24 rounded-full border-4 border-white';

  const pictureContainer = document.createElement('div');
  pictureContainer.className = 'flex justify-center mb-4';
  pictureContainer.appendChild(picturePreview);

  pictureDiv.appendChild(pictureLabel);
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
  });

  const customBtn = document.createElement('button');
  customBtn.type = 'button';
  customBtn.textContent = 'Personnaliser';
  customBtn.addEventListener('click', () => {
    selectedOption = 'customization';
    updateSelectionUI();
  });

  buttonsContainer.appendChild(gameBtn);
  buttonsContainer.appendChild(customBtn);
  choiceDiv.appendChild(buttonsContainer);

  // --- Bouton confirmer ---
  const submitBtn = document.createElement('button');
  submitBtn.type = 'button';
  submitBtn.className = 'w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg';
  submitBtn.textContent = 'Confirmer';
  submitBtn.addEventListener('click', handleProfileSubmit);

  // --- Assemblage du formulaire ---
  form.appendChild(usernameDiv);
  form.appendChild(pictureDiv);
  form.appendChild(choiceDiv);
  form.appendChild(submitBtn);

  container.appendChild(title);
  container.appendChild(form);

  updateSelectionUI(); // Appliquer les bonnes couleurs au démarrage

  return container;
}
