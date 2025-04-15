export function createHomePage(): HTMLElement {
  // Fonction pour démarrer le jeu
  const handleSignIn = () => {
    window.location.href = '/auth';  // Redirection classique
  };
  const handleSignUp = () => {
    window.location.href = '/signup';  // Redirection classique
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
  
  const signup = document.createElement('signup');
  signup.id = 'signup';
  signup.className = 'bg-white-600 hover:bg-white-700 text-blue font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-300';
  signup.textContent = 'Sign up';
  signup.addEventListener('click', handleSignUp);

  const signin = document.createElement('signin');
  signin.id = 'SignIn';
  signin.className = 'bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-300';
  signin.textContent = 'Sign in';
  signin.addEventListener('click', handleSignIn);
  // button.addEventListener('enter', handleStartGame);
  


  // Assemblage
  content.appendChild(title);
  content.appendChild(paragraph);
  content.appendChild(signup);
  content.appendChild(signin);
  container.appendChild(content);

  return container;
}


