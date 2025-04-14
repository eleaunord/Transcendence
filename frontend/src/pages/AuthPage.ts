import { IS_DEV_MODE } from '../config';

export function createAuthPage(navigate: (path: string) => void): HTMLElement {
  let error = '';

  const handleLogin = async () => {
    const usernameInput = document.getElementById('username') as HTMLInputElement;
    const passwordInput = document.getElementById('password') as HTMLInputElement;

    const username = usernameInput?.value;
    const password = passwordInput?.value;

    error = '';
    updateError();

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        error = data.error || 'Erreur de connexion';
        updateError();
        return;
      }

      localStorage.setItem('token', data.token);
      navigate('/profile-creation');
    } catch (err) {
      error = 'Erreur réseau';
      updateError();
    }
  };

  const container = document.createElement('div');
  container.className = 'flex flex-col justify-center items-center h-screen bg-gray-900 text-white';

  const title = document.createElement('h1');
  title.className = 'text-4xl font-bold mb-8';
  title.textContent = 'Sign in';

  const form = document.createElement('form');
  form.id = 'authForm';
  form.className = 'w-80 p-6 bg-gray-800 rounded-lg border-2 border-white';

  // Username
  const usernameDiv = document.createElement('div');
  usernameDiv.className = 'mb-4';
  const usernameLabel = document.createElement('label');
  usernameLabel.htmlFor = 'username';
  usernameLabel.className = 'block text-lg mb-2';
  usernameLabel.textContent = 'Username';
  const usernameInput = document.createElement('input');
  usernameInput.type = 'text';
  usernameInput.id = 'username';
  usernameInput.placeholder = 'Username';
  usernameInput.className = 'w-full p-2 bg-gray-700 text-white rounded-lg';
  usernameInput.required = true;
  usernameDiv.appendChild(usernameLabel);
  usernameDiv.appendChild(usernameInput);

  // Password
  const passwordDiv = document.createElement('div');
  passwordDiv.className = 'mb-6';
  const passwordLabel = document.createElement('label');
  passwordLabel.htmlFor = 'password';
  passwordLabel.className = 'block text-lg mb-2';
  passwordLabel.textContent = 'Password';
  const passwordInput = document.createElement('input');
  passwordInput.type = 'password';
  passwordInput.id = 'password';
  passwordInput.placeholder = 'Password';
  passwordInput.className = 'w-full p-2 bg-gray-700 text-white rounded-lg';
  passwordInput.required = true;
  passwordDiv.appendChild(passwordLabel);
  passwordDiv.appendChild(passwordInput);

  // Submit button
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg';
  button.textContent = 'Sign in';
  button.addEventListener('click', handleLogin);

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

  // Ajout bouton DEV si actif
  if (IS_DEV_MODE) {
    const devBanner = document.createElement('div');
    devBanner.className = 'w-full bg-yellow-500 text-black text-center py-2 font-semibold z-50';
    devBanner.textContent = '⚠️ MODE DÉVELOPPEMENT ACTIVÉ ⚠️';
    container.appendChild(devBanner);
    const devLoginBtn = document.createElement('button');
    devLoginBtn.type = 'button';
    devLoginBtn.textContent = 'Connexion Dev';
    devLoginBtn.className =
      'w-full mt-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg';
    devLoginBtn.addEventListener('click', () => {
      localStorage.setItem('token', 'dev-token');
      navigate('/profile-creation');
    });
    form.appendChild(devLoginBtn);
  }

  // Assemble form
  form.appendChild(usernameDiv);
  form.appendChild(passwordDiv);
  form.appendChild(button);
  form.appendChild(errorMessage);

  // Assemble page
  container.appendChild(title);
  container.appendChild(form);

  return container;
}
