import { setLanguage, t, applyTranslations } from '../utils/translator'

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
    sessionStorage.setItem('privacyAccepted', 'true');
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

  //Création des éléments principaux
  const container = document.createElement('div');
  container.className = 'relative flex flex-col justify-center items-center h-screen bg-gray-900 text-white';

  // Création du conteneur des boutons de langue
  const langSelector = document.createElement('div');
  langSelector.className = 'absolute top-4 right-4 flex gap-2 z-20'; // z-20 pour s'assurer qu'ils sont visibles

  // Création des boutons de langue
  ['en', 'fr', 'ko'].forEach((langCode) => {
    const btn = document.createElement('button');
    btn.className = 'px-2 py-1 border rounded text-sm bg-white text-black';
    btn.textContent = langCode.toUpperCase();

    btn.addEventListener('click', () => {
      setLanguage(langCode as 'en' | 'fr' | 'ko');

      // Pour tester que le bouton fonctionne, on peut recharger
      // location.reload();

      // Version propre : on reconstruit la page dynamiquement
      const root = document.getElementById('app');
      if (root) {
        root.innerHTML = '';
        root.appendChild(createHomePage(navigate));
      }
    });

    langSelector.appendChild(btn);
  });

  // Ajout du sélecteur de langue dans le conteneur principal
  container.appendChild(langSelector);

  const background = document.createElement('div');
  background.className = 'absolute inset-0 bg-cover bg-center opacity-40';
  background.style.backgroundImage = "url(/assets/Backgrounds/bg_homepage.jpg)";
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
    warning.textContent = t('warning.2fa'); //추가
    warning.className = 'bg-yellow-300 text-black px-4 py-2 mb-4 text-center rounded shadow';
    content.appendChild(warning);
    localStorage.removeItem('2fa_redirect_notice');
  }

  const title = document.createElement('h1');
  title.className = 'text-5xl font-extrabold mb-4';
  title.textContent = t('home.title');

  const paragraph = document.createElement('p');
  paragraph.className = 'text-xl mb-8';
  paragraph.textContent = t('home.subtitle');
  
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

  // Création des boutons avec alignement fixe
  const signup = document.createElement('button');
  signup.id = 'signup';
  signup.className = 'w-full bg-white hover:bg-gray-100 text-blue-600 border border-gray-300 font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-300';
  signup.textContent = t('home.signup');
  signup.addEventListener('click', handleSignUp);

  const signin = document.createElement('button');
  signin.id = 'SignIn';
  signin.className = 'w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-300';
  signin.textContent = t('home.login');
  signin.addEventListener('click', handleSignIn);

  const googleButton = document.createElement('button');
  googleButton.className = 'w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-300';
  googleButton.textContent = t('home.google');
  googleButton.addEventListener('click', handleGoogleLogin);

  // Nouveau conteneur pour tous les boutons avec largeur fixe
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'w-80 flex flex-col space-y-4'; // Largeur fixe et espacement vertical

  // Conteneur pour les deux premiers boutons côte à côte
  const topButtonsContainer = document.createElement('div');
  topButtonsContainer.className = 'flex space-x-4';

  topButtonsContainer.appendChild(signup);
  topButtonsContainer.appendChild(signin);
  
  buttonContainer.appendChild(topButtonsContainer);
  buttonContainer.appendChild(googleButton);

  // Assemblage des éléments
  content.appendChild(title);
  content.appendChild(paragraph);

  // Ajout de la checkbox avant les boutons
  content.appendChild(privacyCheckboxContainer);

  content.appendChild(buttonContainer);

  container.appendChild(content);

  return container;
}
