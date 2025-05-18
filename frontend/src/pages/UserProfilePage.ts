import { createSidebar } from "../utils/sidebar"; 
import { applyUserTheme } from "../utils/theme";

export function createUserProfilePage(navigate: (path: string) => void): HTMLElement {
  const container = document.createElement('div');
  container.className = 'relative min-h-screen bg-gray-900 text-white overflow-hidden';

  const sidebar = createSidebar(navigate);
  sidebar.style.zIndex = '50';
  container.appendChild(sidebar);

  
  //---------------------Background Image--------------------/
 
  const backgroundImage = document.createElement('div');
  backgroundImage.id = 'backgroundImage';
  backgroundImage.className = 'absolute top-0 left-20 right-0 bottom-0 bg-cover bg-center transition-all duration-300';
  container.appendChild(backgroundImage);
  applyUserTheme(backgroundImage);

  // --- Profile Section (Cadre + Formulaire côte à côte) ---
  const profileSection = document.createElement('div');
  profileSection.className = `
    relative mt-24 ml-24
    flex flex-row items-start justify-center gap-x-20
    z-20
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

      // 🔒 Vérification de la taille du fichier
      if (file.size > 2 * 1024 * 1024) { // 2 Mo
        alert("Image trop volumineuse. Choisissez une image de moins de 2 Mo.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        profileImg.src = result;
        sessionStorage.setItem('profilePicture', result);
      
        // mise à jour de l'image sur le backend
        const token = localStorage.getItem('token');
        if (token) {
          fetch('/api/me/image', {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ image: result })
          })
          .then(res => {
            if (!res.ok) throw new Error('Upload failed');
          })
          .catch(err => {
            console.error('Erreur mise à jour avatar :', err);
            alert('Erreur lors de la sauvegarde de la photo');
          });
        }
      
        // notifier autres composants
        const updateEvent = new CustomEvent('profilePictureUpdated', { detail: result });
        window.dispatchEvent(updateEvent);
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

        //met a jour username dans le profil, dans la valeur stockee et la sidebar
        sessionStorage.setItem('username', newUsername);
        const sidebarUsername = document.getElementById('sidebar-username');
        if (sidebarUsername) sidebarUsername.textContent = newUsername;

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

  // --------- Settings Section (Centered below profile section) ----------/
  const settingsSection = document.createElement('div');
  settingsSection.className = `
    relative mt-12 ml-24 mb-12
    flex flex-col items-center
    z-20 w-full
  `.replace(/\s+/g, ' ').trim();


  const settingsContainer = document.createElement('div');
  settingsContainer.className = `
    bg-white/10 backdrop-blur-md
    rounded-2xl shadow-2xl
    transform transition-all duration-300
    hover:scale-105 hover:shadow-3xl
    px-6 pt-6 pb-10 min-h-[200px] w-full max-w-5xl
  `.replace(/\s+/g, ' ').trim();




  const settingsTitle = document.createElement('h3');
  settingsTitle.textContent = 'Settings';
  settingsTitle.className = 'text-xl font-semibold mb-4';
  settingsContainer.appendChild(settingsTitle);

  // Create horizontal buttons row with more space between items
  const buttonsRow = document.createElement('div');
  buttonsRow.className = `
    flex flex-row justify-between items-start gap-8
  `.replace(/\s+/g, ' ').trim();

  // Common button class - same width as "Anonymize my account" button
  const commonButtonClass = `
    w-56 py-2 px-4 rounded-lg text-white font-semibold
    transition-colors duration-300 text-center
  `.replace(/\s+/g, ' ').trim();

  // ------- 2FA Button and description -------
  const twoFAContainer = document.createElement('div');
  twoFAContainer.className = 'flex flex-col items-center text-center w-56';

  const twoFAButton = document.createElement('button');
  twoFAButton.id = 'toggle2FAButton';
  twoFAButton.textContent = 'OFF';
  twoFAButton.className = `
    ${commonButtonClass} bg-red-400 hover:bg-red-500
  `.replace(/\s+/g, ' ').trim();

  const twoFADescription = document.createElement('p');
  twoFADescription.className = 'mt-2 text-sm text-gray-300 italic';
  twoFADescription.textContent = 'Clicking 2FA ON/OFF will enable or disable two-factor authentication.';

  twoFAButton.addEventListener('click', async () => {
    const token = localStorage.getItem('token');
    if (!token) return alert('Not authenticated.');
  
    twoFAButton.disabled = true;
  
    try {
      const isCurrentlyEnabled = twoFAButton.textContent === 'ON';
      const newValue = !isCurrentlyEnabled;
  
      const res = await fetch('/api/me/2fa', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ enable: newValue })
      });
  
      if (!res.ok) throw new Error('Failed to toggle 2FA');
  
      const result = await res.json();
      
      if (result.is_2fa_enabled) {
        twoFAButton.textContent = 'ON';
        twoFAButton.className = twoFAButton.className.replace('bg-red-400 hover:bg-red-500', 'bg-green-400 hover:bg-green-500');
      } else {
        twoFAButton.textContent = 'OFF';
        twoFAButton.className = twoFAButton.className.replace('bg-green-400 hover:bg-green-500', 'bg-red-400 hover:bg-red-500');
      }
    } catch (err) {
      console.error('2FA toggle error:', err);
      alert('Error toggling 2FA');
    } finally {
      twoFAButton.disabled = false;
    }
  });

  twoFAContainer.appendChild(twoFAButton);
  twoFAContainer.appendChild(twoFADescription);

  // ------- Export Data Button and description -------
  const exportContainer = document.createElement('div');
  exportContainer.className = 'flex flex-col items-center text-center w-56';

  const exportDataButton = document.createElement('button');
  exportDataButton.textContent = 'Export my data';
  exportDataButton.className = `
    ${commonButtonClass} bg-purple-500 hover:bg-purple-600
  `.replace(/\s+/g, ' ').trim();

  const exportDescription = document.createElement('p');
  exportDescription.className = 'mt-2 text-sm text-gray-300 italic';
  exportDescription.textContent = 'Clicking Export my data will download a copy of your account information.';

  exportDataButton.addEventListener('click', () => {
    navigate('/export-data');
  });

  exportContainer.appendChild(exportDataButton);
  exportContainer.appendChild(exportDescription);

  // ------- Anonymize Button and description -------
  const anonymizeContainer = document.createElement('div');
  anonymizeContainer.className = 'flex flex-col items-center text-center w-56';

  const anonymizeButton = document.createElement('button');
  anonymizeButton.textContent = 'Anonymize my account';
  anonymizeButton.className = `
    ${commonButtonClass} bg-yellow-500 hover:bg-yellow-600
  `.replace(/\s+/g, ' ').trim();

  const anonymizeDescription = document.createElement('p');
  anonymizeDescription.className = 'mt-2 text-sm text-gray-300 italic';
  anonymizeDescription.textContent = "Click here to anonymize your account — you'll appear as anonymous_something on the leaderboard instead of your username.";

  anonymizeButton.addEventListener('click', () => {
    navigate('/anonymize');
  });

  anonymizeContainer.appendChild(anonymizeButton);
  anonymizeContainer.appendChild(anonymizeDescription);

  // ------- Delete Account Button and description -------
  const deleteContainer = document.createElement('div');
  deleteContainer.className = 'flex flex-col items-center text-center w-56';

  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Delete account';
  deleteButton.className = `
    ${commonButtonClass} bg-red-600 hover:bg-red-700
  `.replace(/\s+/g, ' ').trim();

  const deleteDescription = document.createElement('p');
  deleteDescription.className = 'mt-2 text-sm text-gray-300 italic';
  deleteDescription.textContent = 'Clicking Delete my account will permanently remove your account.';

  deleteButton.addEventListener('click', () => {
    navigate('/delete-account');
  });

  deleteContainer.appendChild(deleteButton);
  deleteContainer.appendChild(deleteDescription);

  // Add all buttons to the row
  buttonsRow.appendChild(twoFAContainer);
  buttonsRow.appendChild(exportContainer);
  buttonsRow.appendChild(anonymizeContainer);
  buttonsRow.appendChild(deleteContainer);

  // Add buttons row to settings container
  settingsContainer.appendChild(buttonsRow);
  settingsSection.appendChild(settingsContainer);
  container.appendChild(settingsSection);

  // Sidebar hover events (mouvement sidebar)
  sidebar.addEventListener('mouseenter', () => {
    document.querySelectorAll('.sidebar-label').forEach(label => {
      (label as HTMLElement).classList.remove('opacity-0');
      (label as HTMLElement).classList.add('opacity-100');
    });

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
        const profileImg = document.querySelector('img[alt="Player Profile"]') as HTMLImageElement;
      
        if (usernameDisplay) usernameDisplay.textContent = user.username;
        if (emailValue) emailValue.textContent = user.email;
        
        sessionStorage.setItem('username', user.username);
      
        if (user.image) {
          profileImg.src = user.image;
          sessionStorage.setItem('profilePicture', user.image);
        }
      
        const sidebarUsername = document.getElementById('sidebar-username');
        if (sidebarUsername) sidebarUsername.textContent = user.username;

        const toggle2FAButton = document.getElementById('toggle2FAButton') as HTMLButtonElement;

        if (user.is_2fa_enabled !== undefined && toggle2FAButton) {
          if (user.is_2fa_enabled === 1) {
            toggle2FAButton.textContent = 'ON';
            toggle2FAButton.className = toggle2FAButton.className.replace('bg-red-400 hover:bg-red-500', 'bg-green-400 hover:bg-green-500');
          } else {
            toggle2FAButton.textContent = 'OFF';
            toggle2FAButton.className = toggle2FAButton.className.replace('bg-green-400 hover:bg-green-500', 'bg-red-400 hover:bg-red-500');
          }
        }
      })
      .catch(err => console.error('Erreur chargement profil:', err));
  }

  return container;
}