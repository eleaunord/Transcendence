import { t } from '../utils/translator';

export function createProfileCard(): HTMLElement {
  const profileCard = document.createElement('div');
  profileCard.id = 'profileCard';
  profileCard.className = `
    relative bg-white/10 backdrop-blur-md p-10
    rounded-2xl shadow-2xl
    flex flex-col items-center gap-7
    w-96
    transform transition-all duration-300
    hover:scale-105 hover:shadow-3xl
  `.replace(/\s+/g, ' ').trim();

  // --- Avatar animé ---
  const spinningBorder = document.createElement('div');
  spinningBorder.className = `
    relative w-36 h-36
    flex items-center justify-center
  `.replace(/\s+/g, ' ').trim();
  
  // green online dot
  const onlineDot = document.createElement('div');
  onlineDot.className = `
    absolute top-2 right-2      /* pull it out just a bit from the edge */
    w-8 h-8                      /* 2rem × 2rem = 32px × 32px */
    rounded-full
    bg-green-500
    border-2 border-white
    z-10
  `.replace(/\s+/g, ' ').trim();

  spinningBorder.appendChild(onlineDot);

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

  // --- Gestion du clic sur l'image ---
  profileImg.addEventListener('click', () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';

    fileInput.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        const file = target.files[0];

        if (file.size > 2 * 1024 * 1024) {
          alert(t('profile.avatar.tooLarge'));
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          profileImg.src = result;
          sessionStorage.setItem('profilePicture', result);

          // new 18H
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          user.image = result;
          localStorage.setItem('user', JSON.stringify(user));

          const token = localStorage.getItem('token');
          if (token) {
            fetch('/api/me/image', {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ image: result })
            }).catch(err => {
              console.error('Erreur mise à jour avatar :', err);
              alert(t('profile.avatar.saveError'));
            });
          }

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

  // Assemblage du visuel
  staticBackground.appendChild(profileImg);
  spinningBorder.appendChild(animatedBorder);
  spinningBorder.appendChild(staticBackground);
  profileCard.appendChild(spinningBorder);

  // Username
  const username = document.createElement('h2');
  username.id = 'usernameValue';
  username.className = 'text-xl font-semibold text-white';
  username.textContent = t('profile.username.default');

  profileCard.appendChild(username);

  return profileCard;
}
