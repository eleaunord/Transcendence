export function loadUserData(token: string): void {
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

      if (user.image && profileImg) {
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
    .catch(err => {
      console.error('Erreur chargement profil:', err);
    });
}

