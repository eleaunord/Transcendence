import { t } from '../utils/translator';

export function createSignUpPage(navigate: (path: string) => void): HTMLElement {
  let error = '';

  const handleSignUp = async () => {
    console.log('handleSignup exécutée');
    const usernameInput = document.getElementById('username') as HTMLInputElement;
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    const emailInput = document.getElementById('email') as HTMLInputElement;

    const username = usernameInput?.value.trim();
    const email = emailInput?.value.trim();
    const password = passwordInput?.value;

    error = '';
    updateError();

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();
      console.log(data);

      if (!res.ok) {
        error = t(data.error )|| t('signup.error.failed');
        updateError();
        return;
      }

      localStorage.setItem('token', data.token);

      try {
        const resMe = await fetch('/api/me', {
          headers: {
            Authorization: `Bearer ${data.token}`
          }
        });

        if (resMe.ok) {
          const user = await resMe.json();
          sessionStorage.setItem('username', user.username);
          sessionStorage.setItem('userEmail', user.email); // 추가
          sessionStorage.setItem('profilePicture', user.image);
          sessionStorage.setItem('userId', user.id.toString()); // 1905 추가
          console.log('[SIGNUP] Utilisateur chargé :', user);
        } else {
          console.warn('[SIGNUP] Impossible de charger /api/me');
        }
      } catch (e) {
        console.error('[SIGNUP] Erreur lors du chargement de /api/me :', e);
      }

      // Ajoute une image par défaut pour tout nouvel utilisateur
      await fetch('/api/me/image', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${data.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image: '/assets/profile-pictures/default.jpg' })
      });

      // 0505 changed 'profile-creation' to '/2fa'
      navigate('/2fa'); // Utilisation du routeur SPA
    } catch (err) {
      error = t('signup.error.network');
      updateError();
    }
  };

  // Création de l’UI
  const container = document.createElement('div');
  container.className = 'flex flex-col justify-center items-center h-screen bg-gray-900 text-white';

  const title = document.createElement('h1');
  title.className = 'text-4xl font-bold mb-8';
  title.textContent = t('signup.title');

  const form = document.createElement('form');
  form.id = 'authForm';
  form.className = 'w-80 p-6 bg-gray-800 rounded-lg border-2 border-white';

  // Username
  const usernameDiv = document.createElement('div');
  usernameDiv.className = 'mb-4';
  const usernameLabel = document.createElement('label');
  usernameLabel.htmlFor = 'username';
  usernameLabel.className = 'block text-lg mb-2';
  usernameLabel.textContent = t('signup.username');
  const usernameInput = document.createElement('input');
  usernameInput.type = 'text';
  usernameInput.id = 'username';
  usernameInput.placeholder = t('signup.username');
  usernameInput.className = 'w-full p-2 bg-gray-700 text-white rounded-lg';
  usernameInput.required = true;
  usernameDiv.appendChild(usernameLabel);
  usernameDiv.appendChild(usernameInput);

  // Email
  const emailDiv = document.createElement('div');
  const emailLabel = document.createElement('label');
  emailLabel.htmlFor = 'email';
  emailLabel.className = 'block text-lg mb-2';
  emailLabel.textContent = t('signup.email');
  const emailInput = document.createElement('input');
  emailInput.type = 'email';
  emailInput.id = 'email';
  emailInput.placeholder = t('signup.email');
  emailInput.className = 'w-full p-2 bg-gray-700 text-white rounded-lg mb-4';
  emailInput.required = true;
  emailDiv.appendChild(emailLabel);
  emailDiv.appendChild(emailInput);

  // Password
  const passwordDiv = document.createElement('div');
  passwordDiv.className = 'mb-6';
  const passwordLabel = document.createElement('label');
  passwordLabel.htmlFor = 'password';
  passwordLabel.className = 'block text-lg mb-2';
  passwordLabel.textContent = t('signup.password');
  const passwordInput = document.createElement('input');
  passwordInput.type = 'password';
  passwordInput.id = 'password';
  passwordInput.placeholder = t('signup.password');
  passwordInput.className = 'w-full p-2 bg-gray-700 text-white rounded-lg';
  passwordInput.required = true;
  passwordDiv.appendChild(passwordLabel);
  passwordDiv.appendChild(passwordInput);

  // Button
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg';
  button.textContent = t('signup.button');
  button.addEventListener('click', handleSignUp);

  // Error Message
  const errorMessage = document.createElement('p');
  errorMessage.className = 'mt-4 text-red-500';
  errorMessage.style.display = 'none';

  const updateError = () => {
    if (error) {
      errorMessage.textContent = error;
      errorMessage.style.display = 'block';
    } else {
      errorMessage.textContent = '';
      errorMessage.style.display = 'none';
    }
  };

  // Assemble form
  form.appendChild(usernameDiv);
  form.appendChild(emailDiv);
  form.appendChild(passwordDiv);
  form.appendChild(button);
  form.appendChild(errorMessage);

  // Assemble page
  container.appendChild(title);
  container.appendChild(form);

  return container;
}
