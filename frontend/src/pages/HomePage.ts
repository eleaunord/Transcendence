import { setLanguage, applyTranslations } from '../utils/translator';
import { t } from '../utils/translator';

export function createHomePage(navigate: (path: string) => void): HTMLElement {
  // Fonction pour démarrer le jeu
  const handleSignIn = () => {
    navigate('/auth'); // SPA 라우팅 → état maintenu
  };

  const handleSignUp = () => {
    if (!privacyCheckbox.checked) {
      highlightCheckbox();
      return;
    }
    navigate('/signup');  // Redirection classique
  };

  const handleGoogleLogin = () => {
    if (!privacyCheckbox.checked) {
      highlightCheckbox();
      return;
    }
    window.location.href = '/api/auth/google'; // Backend Google OAuth
  };

  const highlightCheckbox = () => {
    privacyCheckboxContainer.classList.add('animate-bounce', 'text-red-400');
    setTimeout(() => {
      privacyCheckboxContainer.classList.remove('animate-bounce', 'text-red-400');
    }, 1500);
  };

  // Création des éléments principaux
  const container = document.createElement('div');
  container.className = 'relative flex flex-col justify-center items-center h-screen bg-gray-900 text-white';

  // 🔤 Boutons de langue en haut à droite
  const langSwitcher = document.createElement('div');
  langSwitcher.className = 'absolute top-4 right-4 flex gap-2 z-50';

  const buttonStyle = 'text-xs px-2 py-1 bg-white text-black rounded hover:bg-gray-200 shadow-sm transition';

  const btnFR = document.createElement('button');
  btnFR.textContent = '🇫🇷';
  btnFR.className = buttonStyle;
  btnFR.onclick = () => {
    setLanguage('fr');
    applyTranslations();
  };

  const btnEN = document.createElement('button');
  btnEN.textContent = '🇬🇧';
  btnEN.className = buttonStyle;
  btnEN.onclick = () => {
    setLanguage('en');
    applyTranslations();
  };

  const btnKO = document.createElement('button');
  btnKO.textContent = '🇰🇷';
  btnKO.className = buttonStyle;
  btnKO.onclick = () => {
    setLanguage('ko');
    applyTranslations();
  };

  langSwitcher.appendChild(btnFR);
  langSwitcher.appendChild(btnEN);
  langSwitcher.appendChild(btnKO);
  container.appendChild(langSwitcher);

  const background = document.createElement('div');
  background.className = 'absolute inset-0 bg-cover bg-center opacity-40';
  background.style.backgroundImage = "url(/assets/background/ciel.jpg)";
  container.appendChild(background);

  const content = document.createElement('div');
  content.className = 'relative z-10 flex flex-col justify-center items-center';

  // 13 로그인 필요 경고 메시지 처리
  const msg = localStorage.getItem('protected_route_notice');
  if (msg) {
    const warning = document.createElement('div');
    warning.textContent = `${msg}`;
    warning.className = 'bg-yellow-300 text-black px-4 py-2 mb-4 text-center rounded shadow';
    content.appendChild(warning);
    localStorage.removeItem('protected_route_notice');
  }

  // 13 추가 2FA 리다이렉션 경고 메시지 처리
  if (localStorage.getItem('2fa_redirect_notice')) {
    const warning = document.createElement('div');
    warning.setAttribute('data-i18n', 'warning.2fa'); //추가
    warning.className = 'bg-yellow-300 text-black px-4 py-2 mb-4 text-center rounded shadow';
    content.appendChild(warning);
    localStorage.removeItem('2fa_redirect_notice');
  }

  const title = document.createElement('h1');
  title.className = 'text-5xl font-extrabold mb-4';
  title.setAttribute('data-i18n', 'home.title');


  const paragraph = document.createElement('p');
  paragraph.className = 'text-xl mb-8';
  paragraph.setAttribute('data-i18n', 'home.subtitle');

  // Création de la checkbox GDPR
  const privacyCheckboxContainer = document.createElement('div');
  privacyCheckboxContainer.className = 'mb-4 flex items-center text-xl';

  const privacyCheckbox = document.createElement('input');
  privacyCheckbox.type = 'checkbox';
  privacyCheckbox.id = 'privacy-consent';
  privacyCheckbox.className = 'mr-2';

  const privacyLabel = document.createElement('label');
  privacyLabel.htmlFor = 'privacy-consent';
  privacyLabel.innerHTML = t('privacy.consent');
  privacyLabel.setAttribute('data-i18n-html', 'privacy.consent');

  setTimeout(() => {
    const privacyLink = document.getElementById('privacy-link');
    if (privacyLink) {
      privacyLink.addEventListener('click', (e) => {
        e.preventDefault();
        navigate('/privacy-policy'); // SPA 라우팅 함수 사용
      });
    }
  }, 0);
  
  privacyCheckboxContainer.appendChild(privacyCheckbox);
  privacyCheckboxContainer.appendChild(privacyLabel);

  // Création des boutons
  const signup = document.createElement('button');
  signup.id = 'signup';
  signup.className = 'bg-white hover:bg-gray-100 text-blue-600 border border-gray-300 font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-300';
  signup.setAttribute('data-i18n', 'home.signup');
  signup.addEventListener('click', handleSignUp);

  const signin = document.createElement('button');
  signin.id = 'SignIn';
  signin.className = 'bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-300';
  signin.setAttribute('data-i18n', 'home.login');
  signin.addEventListener('click', handleSignIn);

  const googleButton = document.createElement('button');
  googleButton.id = 'google-login';
  googleButton.className = 'bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-300 mt-4';
  googleButton.setAttribute('data-i18n', 'home.google');
  googleButton.addEventListener('click', handleGoogleLogin);

  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'flex space-x-4';

  buttonContainer.appendChild(signup);
  buttonContainer.appendChild(signin);

  // Assemblage des éléments
  content.appendChild(title);
  content.appendChild(paragraph);

  // Ajout de la checkbox avant les boutons
  content.appendChild(privacyCheckboxContainer);

  content.appendChild(buttonContainer);
  content.appendChild(googleButton);

  container.appendChild(content);

  return container;
}



// export function createHomePage(navigate: (path: string) => void): HTMLElement {
//   // Fonction pour démarrer le jeu
//   const handleSignIn = () => {
//     navigate('/auth'); // SPA 라우팅 → 상태 유지됨
//   };

//   const handleSignUp = () => {
//     navigate('/signup');  // Redirection classique
//   };

//   const handleGoogleLogin = () => {
//     window.location.href = '/api/auth/google'; // 백엔드 Google OAuth 경로
//   };

//   // Création des éléments
//   const container = document.createElement('div');
//   container.className = 'relative flex flex-col justify-center items-center h-screen bg-gray-900 text-white';

//   const background = document.createElement('div');
//   background.className = 'absolute inset-0 bg-cover bg-center opacity-40';
//   background.style.backgroundImage = "url(/assets/photo_pong.png)";
//   container.appendChild(background);

//   const content = document.createElement('div');
//   content.className = 'relative z-10 flex flex-col justify-center items-center';

//   const title = document.createElement('h1');
//   title.className = 'text-5xl font-extrabold mb-4';
//   title.textContent = 'Bienvenue sur Transcendance !';

//   const paragraph = document.createElement('p');
//   paragraph.className = 'text-xl mb-8';
//   paragraph.textContent = 'Préparez-vous à jouer à un jeu classique avec vos amis.';
  
//   const signup = document.createElement('button');
//   signup.id = 'signup';
//   signup.className = 'bg-white hover:bg-gray-100 text-blue-600 border border-gray-300 font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-300';
//   signup.textContent = 'Sign up';
//   signup.addEventListener('click', handleSignUp);

//   const signin = document.createElement('button');
//   signin.id = 'SignIn';
//   signin.className = 'bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-300';
//   signin.textContent = 'Sign in';
//   signin.addEventListener('click', handleSignIn);
//   // button.addEventListener('enter', handleStartGame);
  
//   const googleButton = document.createElement('button');
//   googleButton.id = 'google-login';
//   googleButton.className = 'bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-300';
//   googleButton.textContent = 'Sign in/up with Google';
//   googleButton.addEventListener('click', handleGoogleLogin);
//   const buttonContainer = document.createElement('div');
//   buttonContainer.className = 'flex space-x-4'; // ou 'flex flex-col space-y-4' pour vertical

//   buttonContainer.appendChild(signup);
//   buttonContainer.appendChild(signin);

//   // Assemblage
//   content.appendChild(title);
//   content.appendChild(paragraph);
//   content.appendChild(buttonContainer); // Ajoute les deux boutons ensemble
//   // content.appendChild(signup);
//   // content.appendChild(signin);
//   container.appendChild(content);
//   content.appendChild(googleButton);

//   return container;
// }
