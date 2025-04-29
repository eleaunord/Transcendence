import { createSidebar } from "../utils/sidebar"; // (adapte le chemin si besoin)

export function createUserProfilePage(navigate: (path: string) => void): HTMLElement {
  const container = document.createElement('div');
  container.className = 'relative min-h-screen bg-gray-900 text-white overflow-hidden';

  const sidebar = createSidebar(navigate);
  container.appendChild(sidebar);

  
  //---------------------Background Image--------------------/
 
  const backgroundImage = document.createElement('div');
  backgroundImage.id = 'backgroundImage';
  backgroundImage.className = 'absolute top-0 left-20 right-0 bottom-0 bg-cover bg-center transition-all duration-300';
  backgroundImage.style.backgroundImage = 'url(/assets/profile-themes/arabesque.png)';
  container.appendChild(backgroundImage);

  // Main Content
  const mainContent = document.createElement('div');
  mainContent.id = 'mainContent';
  mainContent.className = 'relative ml-20 p-8 transition-all duration-300 z-10';

  const title = document.createElement('h1');
  title.className = 'text-3xl font-bold mb-8 text-center ';
  
  // title.className = 'text-3xl font-bold mb-8 text-center text-gold-50
  title.textContent = 'User Profile';
  mainContent.appendChild(title);

  container.appendChild(mainContent);

  // --- Profile Section (Cadre + Formulaire côte à côte) ---
  const profileSection = document.createElement('div');
  profileSection.className = `
    relative ml-24 mt-24
    flex flex-row items-start gap-x-20
    z-30
  `.replace(/\s+/g, ' ').trim();

  // --- Profile Card ---
  const profileCard = document.createElement('div');
  profileCard.id = 'profileCard';
  profileCard.className = `
    relative bg-white/10 backdrop-blur-md p-10
    rounded-2xl shadow-2xl
    flex flex-col items-center gap-7
    w-80
    transform transition-all duration-300
    hover:scale-105 hover:shadow-3xl
  `.replace(/\s+/g, ' ').trim();

  // Bordure animée autour de l'image
  const spinningBorder = document.createElement('div');
  spinningBorder.className = `
    relative w-36 h-36
    flex items-center justify-center
  `.replace(/\s+/g, ' ').trim();

  const animatedBorder = document.createElement('div');
  animatedBorder.className = `
    absolute inset-0
    rounded-full
    bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500
    animate-spin-slow
  `.replace(/\s+/g, ' ').trim();

  const staticBackground = document.createElement('div');
  staticBackground.className = `
    relative w-32 h-32
    bg-gray-900 rounded-full
    flex items-center justify-center
    overflow-hidden
  `.replace(/\s+/g, ' ').trim();

  const profilePicture = sessionStorage.getItem('profilePicture') || '/public/assets/profil-pictures/default.jpg';
  const profileImg = document.createElement('img');
  profileImg.src = profilePicture;
  profileImg.alt = 'Player Profile';
  profileImg.className = `
    w-full h-full object-cover rounded-full
    border-4 border-gray-900
    cursor-pointer
    transition-transform duration-300 hover:scale-110
  `.replace(/\s+/g, ' ').trim();

  staticBackground.appendChild(profileImg);
  spinningBorder.appendChild(animatedBorder);
  spinningBorder.appendChild(staticBackground);
  profileCard.appendChild(spinningBorder);

  const username = document.createElement('h2');
  username.id = 'usernameValue';
  username.className = 'text-xl font-semibold text-white';
  username.textContent = 'Username';
  profileCard.appendChild(username);


 // Changer la photo de profil au clic
 profileImg.addEventListener('click', () => {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.style.display = 'none';

  fileInput.addEventListener('change', (event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      const file = target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        profileImg.src = result;
        sessionStorage.setItem('profilePicture', result);
      };
      reader.readAsDataURL(file);
    }
  });

  document.body.appendChild(fileInput);
  fileInput.click();
  document.body.removeChild(fileInput);
});

  // --------- Formulaire de modification à droite ----------/
// Formulaire pour modification
  const formContainer = document.createElement('div');
  formContainer.className = `
    flex flex-col gap-4 bg-gray-800 bg-opacity-50 p-8 rounded-xl shadow-md w-96
  `.replace(/\s+/g, ' ').trim();

  const emailRow = document.createElement('div');
  emailRow.className = 'flex justify-between items-center';
  const emailLabel = document.createElement('span');
  emailLabel.textContent = 'Email:';
  const emailValue = document.createElement('span');
  emailValue.id = 'emailValue';
  emailValue.textContent = 'Loading...';
  emailRow.appendChild(emailLabel);
  emailRow.appendChild(emailValue);

  const passwordRow = document.createElement('div');
  passwordRow.className = 'flex justify-between items-center';
  const passwordLabel = document.createElement('span');
  passwordLabel.textContent = 'Password:';
  const passwordValue = document.createElement('span');
  passwordValue.textContent = '********';
  passwordRow.appendChild(passwordLabel);
  passwordRow.appendChild(passwordValue);

  const usernameInput = document.createElement('input');
  usernameInput.type = 'text';
  usernameInput.placeholder = 'New username';
  usernameInput.className = `
    mt-4 p-2 rounded-lg bg-gray-900 text-white placeholder-gray-400
    border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500
  `.replace(/\s+/g, ' ').trim();

  const updateButton = document.createElement('button');
  updateButton.textContent = 'Update Username';
  updateButton.className = `
    mt-2 p-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold
    transition-colors duration-300
  `.replace(/\s+/g, ' ').trim();

  const successMessage = document.createElement('p');
  successMessage.textContent = '✅ Profile updated successfully!';
  successMessage.className = 'text-green-400 font-semibold mt-4 hidden';

  updateButton.addEventListener('click', async () => {
    const newUsername = usernameInput.value.trim();
    if (newUsername.length === 0) {
      alert('Username cannot be empty!');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in.');
      return;
    }

    try {
      updateButton.disabled = true; // Désactive le bouton pendant la requête
      const res = await fetch('/api/me', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: newUsername })
      });

      if (res.ok) {
        const usernameDisplay = document.getElementById('usernameValue');
        if (usernameDisplay) usernameDisplay.textContent = newUsername;
        successMessage.classList.remove('hidden');
        setTimeout(() => successMessage.classList.add('hidden'), 3000); // Message disparaît après 3s
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update.');
      }
    } catch (err) {
      console.error('Update error:', err);
      alert('Server error');
    } finally {
      updateButton.disabled = false; // Réactive le bouton
    }
  });

  formContainer.appendChild(usernameInput);
  formContainer.appendChild(emailRow);
  formContainer.appendChild(passwordRow);
  formContainer.appendChild(updateButton);
  formContainer.appendChild(successMessage);

  profileSection.appendChild(profileCard);
  profileSection.appendChild(formContainer);
  container.appendChild(profileSection);
  // Sidebar hover events
  sidebar.addEventListener('mouseenter', () => {
    document.querySelectorAll('.sidebar-label').forEach(label => {
      (label as HTMLElement).classList.remove('opacity-0');
      (label as HTMLElement).classList.add('opacity-100');
    });

    const mainContent = document.getElementById('mainContent');
    if (mainContent) {
      mainContent.className = 'relative ml-64 p-8 transition-all duration-300 z-10';
    }

    const backgroundImage = document.getElementById('backgroundImage');
    if (backgroundImage) {
      backgroundImage.className = 'absolute top-0 left-64 right-0 bottom-0 bg-cover bg-center transition-all duration-300';
    }

    const profileSection = document.getElementById('profileCard')?.parentElement;
    if (profileSection) {
      profileSection.className = `
      relative mt-24
      flex flex-row items-start justify-center gap-12
      z-30
    `.replace(/\s+/g, ' ').trim();
    
    }
  });

  sidebar.addEventListener('mouseleave', () => {
    document.querySelectorAll('.sidebar-label').forEach(label => {
      (label as HTMLElement).classList.add('opacity-0');
      (label as HTMLElement).classList.remove('opacity-100');
    });

    const mainContent = document.getElementById('mainContent');
    if (mainContent) {
      mainContent.className = 'relative ml-20 p-8 transition-all duration-300 z-10';
    }

    const backgroundImage = document.getElementById('backgroundImage');
    if (backgroundImage) {
      backgroundImage.className = 'absolute top-0 left-20 right-0 bottom-0 bg-cover bg-center transition-all duration-300';
    }

    const profileSection = document.getElementById('profileCard')?.parentElement;
    if (profileSection) {
      profileSection.className = `
      relative mt-24
      flex flex-row items-start justify-center gap-12
      z-30
    `.replace(/\s+/g, ' ').trim();
    
    }
  });
// Chargement dynamique des infos utilisateur
const token = localStorage.getItem('token');
if (token) {
  fetch('/api/me', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(res => res.json())
    .then(user => {
      const usernameDisplay = document.getElementById('usernameValue');
      const emailValue = document.getElementById('emailValue');
      if (usernameDisplay) usernameDisplay.textContent = user.username;
      if (emailValue) emailValue.textContent = user.email;
    })
    .catch(err => console.error('Erreur chargement profil:', err));
}
  return container;
}


