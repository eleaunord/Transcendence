import { initRouter } from './utils/router';
import { createHomePage } from './pages/HomePage';
import { createAuthPage } from './pages/AuthPage';
import { createProfileCreationPage } from './pages/ProfileCreationPage';
import { createCustomizationPage } from './pages/CustomizationPage';
import { createGamePage } from './pages/GamePage';
import { createUserProfilePage } from './pages/UserProfilePage';
import { protectedRoute } from './utils/router';
import { createSignUpPage } from './pages/SignUpPage';
import { createGoogleOauthPage } from './pages/GoogleOauth';

// Fonction utilitaire pour injecter `navigate` dans chaque page
function withNavigate(navigate: (path: string) => void) {
  return (fn: (n: typeof navigate) => HTMLElement): () => HTMLElement => {
    return () => fn(navigate);
  };
}

// Initialise le routeur en 2 temps :
let navigate: (path: string) => void = () => {};

const useWithNavigate = withNavigate((path) => navigate(path));

const routes = {
  '/': useWithNavigate(createHomePage),
  '/auth': useWithNavigate(createAuthPage),


  '/profile-creation': useWithNavigate(protectedRoute(createProfileCreationPage)),
  '/game': useWithNavigate(protectedRoute(createGamePage)),
  '/customization': useWithNavigate(protectedRoute(createCustomizationPage)),
  '/user-profile': useWithNavigate(protectedRoute(createUserProfilePage)),
  '/signup': useWithNavigate(createSignUpPage),
  '/auth/google': useWithNavigate(createGoogleOauthPage), 

};

// Maintenant qu'on a les routes, on peut initialiser proprement
navigate = initRouter(routes)!;
