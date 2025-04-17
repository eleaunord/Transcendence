export function createHomePage(): HTMLElement {
  // Fonction pour démarrer le jeu
  const handleSignIn = () => {
    window.location.href = '/auth';  // Redirection classique
  };
  const handleSignUp = () => {
    window.location.href = '/signup';  // Redirection classique
  };

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google'; // 백엔드 Google OAuth 경로
  };
  
  // Création des éléments
  const container = document.createElement('div');
  container.className = 'relative flex flex-col justify-center items-center h-screen bg-gray-900 text-white';

  const background = document.createElement('div');
  background.className = 'absolute inset-0 bg-cover bg-center opacity-40';
  background.style.backgroundImage = "url(/assets/photo_pong.png)";
  container.appendChild(background);

  const content = document.createElement('div');
  content.className = 'relative z-10 flex flex-col justify-center items-center';

  const title = document.createElement('h1');
  title.className = 'text-5xl font-extrabold mb-4';
  title.textContent = 'Bienvenue sur Transcendance !';

  const paragraph = document.createElement('p');
  paragraph.className = 'text-xl mb-8';
  paragraph.textContent = 'Préparez-vous à jouer à un jeu classique avec vos amis.';
  
  const signup = document.createElement('button');
  signup.id = 'signup';
  signup.className = 'bg-white hover:bg-gray-100 text-blue-600 border border-gray-300 font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-300';
  signup.textContent = 'Sign up';
  signup.addEventListener('click', handleSignUp);

  const signin = document.createElement('button');
  signin.id = 'SignIn';
  signin.className = 'bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-300';
  signin.textContent = 'Sign in';
  signin.addEventListener('click', handleSignIn);
  // button.addEventListener('enter', handleStartGame);
  
  const googleButton = document.createElement('button');
  googleButton.id = 'google-login';
  googleButton.className = 'bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-300';
  googleButton.textContent = 'Sign in/up with Google';
  googleButton.addEventListener('click', handleGoogleLogin);
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'flex space-x-4'; // ou 'flex flex-col space-y-4' pour vertical

  buttonContainer.appendChild(signup);
  buttonContainer.appendChild(signin);

  // Assemblage
  content.appendChild(title);
  content.appendChild(paragraph);
  content.appendChild(buttonContainer); // Ajoute les deux boutons ensemble
  // content.appendChild(signup);
  // content.appendChild(signin);
  container.appendChild(content);
  content.appendChild(googleButton);

  return container;
}


