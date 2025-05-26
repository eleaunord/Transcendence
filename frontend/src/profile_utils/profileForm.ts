import { t } from '../utils/translator';

export function createProfileForm(): HTMLElement {
  const formContainer = document.createElement('div');
  formContainer.className = `
    relative bg-black/60 p-10
    rounded-2xl shadow-2xl
    flex flex-col items-start gap-6
    w-96
    transform transition-all duration-300
    hover:scale-105 hover:shadow-3xl
  `.trim();


  const emailRow = document.createElement('div');
  emailRow.className = 'flex justify-between items-center';
  const emailLabel = document.createElement('span');
  emailLabel.textContent = t('profile.email.label');
  const emailValue = document.createElement('span');
  emailValue.id = 'emailValue';
  emailValue.textContent = t('profile.email.loading');
  emailRow.appendChild(emailLabel);
  emailRow.appendChild(emailValue);

  const passwordRow = document.createElement('div');
  passwordRow.className = 'flex justify-between items-center';
  const passwordLabel = document.createElement('span');
  passwordLabel.textContent = t('profile.password.label');
  const passwordValue = document.createElement('span');
  passwordValue.textContent = '********';
  passwordRow.appendChild(passwordLabel);
  passwordRow.appendChild(passwordValue);

  const usernameInput = document.createElement('input');
  usernameInput.type = 'text';
  usernameInput.placeholder = t('profile.username.placeholder');
  usernameInput.className = `
    mt-4 p-2 rounded-lg bg-gray-900 text-white placeholder-gray-400
    border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500
  `.replace(/\s+/g, ' ').trim();

  const updateButton = document.createElement('button');
  updateButton.textContent = t('profile.username.update');
  updateButton.className = `
    mt-2 p-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold
    transition-colors duration-300
  `.replace(/\s+/g, ' ').trim();

  const successMessage = document.createElement('p');
  successMessage.textContent = t('profile.update.success');
  successMessage.className = 'text-green-400 font-semibold mt-4 hidden';

  updateButton.addEventListener('click', async () => {
    const newUsername = usernameInput.value.trim();
    if (newUsername.length === 0) {
      alert(t('profile.username.empty'));
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert(t('profile.auth.required'));
      return;
    }

    try {
      updateButton.disabled = true;

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

        sessionStorage.setItem('username', newUsername);
        const sidebarUsername = document.getElementById('sidebar-username');
        if (sidebarUsername) sidebarUsername.textContent = newUsername;

        successMessage.classList.remove('hidden');
        setTimeout(() => successMessage.classList.add('hidden'), 3000);
      } else {
        const data = await res.json();
        alert(t(data.error) || t('profile.update.failed'));
      }
    } catch (err) {
      console.error('Update error:', err);
      alert(t('profile.update.serverError'));
    } finally {
      updateButton.disabled = false;
    }
  });

  formContainer.appendChild(usernameInput);
  formContainer.appendChild(emailRow);
  formContainer.appendChild(passwordRow);
  formContainer.appendChild(updateButton);
  formContainer.appendChild(successMessage);

  return formContainer;
}
