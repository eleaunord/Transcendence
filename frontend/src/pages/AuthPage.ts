import { t } from '../utils/translator'; // Ajout pour i18n

export function createAuthPage(navigate: (path: string) => void): HTMLElement {
  let error = '';
const handleLogin = async () => {
  const username = (document.getElementById('username') as HTMLInputElement).value;
  const password = (document.getElementById('password') as HTMLInputElement).value;

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
      error = t(data.error) || t('auth.error.connection');
      updateError();
      return;
    }

    // Store the token (which may have pending_2fa flag)
    localStorage.setItem('token', data.token);
    sessionStorage.setItem('token', data.token);
    sessionStorage.setItem('userEmail', data.user.email);

    // Check if 2FA is required
    if (data.requires_2fa || data.user.is_2fa_enabled) {
      sessionStorage.removeItem('2fa_code_sent'); // Clear any previous state
      return navigate('/2fa?mode=input');
    }

    // For users without 2FA: fetch full profile and continue
    const me = await fetch('/api/me', {
      headers: { Authorization: `Bearer ${data.token}` }
    });

    if (!me.ok) {
      console.warn('Unable to load user profile');
      error = t('auth.error.loadProfile');
      updateError();
      return;
    }

    const user = await me.json();
    
    // Store user info
    localStorage.setItem('user', JSON.stringify(user));
    sessionStorage.setItem('username', user.username);
    sessionStorage.setItem('profilePicture', user.image);
    sessionStorage.setItem('userId', user.id.toString());

    // Navigate to appropriate page
    if (!user.seen_2fa_prompt) {
      navigate('/2fa');
    } else {
      navigate('/profile-creation');
    }

  } catch (e) {
    console.error('Network error:', e);
    error = t('auth.error.network');
    updateError();
  }
};

  const container = document.createElement('div');
  container.className = 'flex flex-col justify-center items-center h-screen bg-gray-900 text-white';

  const title = document.createElement('h1');
  title.className = 'text-4xl font-bold mb-8';
  title.textContent = t('auth.title');

  const form = document.createElement('form');
  form.id = 'authForm';
  form.className = 'w-80 p-6 bg-gray-800 rounded-lg border-2 border-white';

  // Username
  const usernameDiv = document.createElement('div');
  usernameDiv.className = 'mb-4';
  const usernameLabel = document.createElement('label');
  usernameLabel.htmlFor = 'username';
  usernameLabel.className = 'block text-lg mb-2';
  usernameLabel.textContent = t('auth.username');
  const usernameInput = document.createElement('input');
  usernameInput.type = 'text';
  usernameInput.id = 'username';
  usernameInput.placeholder = t('auth.username');
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
  passwordLabel.textContent = t('auth.password');
  const passwordInput = document.createElement('input');
  passwordInput.type = 'password';
  passwordInput.id = 'password';
  passwordInput.placeholder = t('auth.password');
  passwordInput.className = 'w-full p-2 bg-gray-700 text-white rounded-lg';
  passwordInput.required = true;
  passwordDiv.appendChild(passwordLabel);
  passwordDiv.appendChild(passwordInput);

  // Submit button
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg';
  button.textContent = t('auth.button');
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