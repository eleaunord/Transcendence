export function createSignUpPage(navigate: (path: string) => void): HTMLElement {
  let error = '';

  const handleSignUp = async () => {
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
        body: JSON.stringify({ username,email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        error = data.error || 'Signup failed';
        updateError();
        return;
      }

      localStorage.setItem('token', data.token);
      navigate('/profile-creation'); // Utilisation du routeur SPA
    } catch (err) {
      error = 'Network error';
      updateError();
    }
  };

  // Création de l’UI
  const container = document.createElement('div');
  container.className = 'flex flex-col justify-center items-center h-screen bg-gray-900 text-white';

  const title = document.createElement('h1');
  title.className = 'text-4xl font-bold mb-8';
  title.textContent = 'Sign up';

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

  // Email
  const emailDiv = document.createElement('div');
  //usernameDiv.className = 'mb_';
  const emailLabel = document.createElement('label');
  emailLabel.htmlFor = 'email';
  emailLabel.className = 'block text-lg mb-2';
  emailLabel.textContent = 'Email';
  const emailInput = document.createElement('input');
  emailInput.type = 'email';
  emailInput.id = 'email';
  emailInput.placeholder = 'Email';
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
  passwordLabel.textContent = 'Password';
  const passwordInput = document.createElement('input');
  passwordInput.type = 'password';
  passwordInput.id = 'password';
  passwordInput.placeholder = 'Password';
  passwordInput.className = 'w-full p-2 bg-gray-700 text-white rounded-lg';
  passwordInput.required = true;
  passwordDiv.appendChild(passwordLabel);
  passwordDiv.appendChild(passwordInput);

  // Button
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg';
  button.textContent = 'Sign up';
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
