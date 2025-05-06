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
import { create2FAPage } from './pages/2FAPages';
// import { createPong3DPage } from './pages/Pong3DPage';
import { createMemoryGamePage } from './pages/MemoryGamePage';
import { createFriendsPage } from './pages/FriendsPage';
import { createLeaderboardPage } from './pages/LeaderboardPage';
import { createAboutPage } from './pages/AboutUsPage';
import { createLocalPage } from './pages/LocalPage';
import { createAIPage } from './pages/AIPage';
import { createTournamentPage } from './pages/TournamentPage';
import { createVersusPage } from './pages/VersusPage';
import { createModePage } from './pages/ModePage';

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
  '/2fa': useWithNavigate((navigate) => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode') === 'input' ? 'input' : 'activation';
    return create2FAPage(navigate, mode);
  }),
  // '/pong': useWithNavigate(protectedRoute(createPong3DPage)),
  '/memory': useWithNavigate(protectedRoute(createMemoryGamePage)),
  '/friends': useWithNavigate(protectedRoute(createFriendsPage)),
  '/leaderboard': useWithNavigate(protectedRoute(createLeaderboardPage)),
  '/about': useWithNavigate(protectedRoute(createAboutPage)),
  '/local': useWithNavigate(protectedRoute(createLocalPage)),
  '/ai': useWithNavigate(protectedRoute(createAIPage)),
  '/tournament': useWithNavigate(protectedRoute(createTournamentPage)),
  '/versus': useWithNavigate(protectedRoute(createVersusPage)),
  '/mode': useWithNavigate(protectedRoute(createModePage)),
}
// Maintenant qu'on a les routes, on peut initialiser proprement
navigate = initRouter(routes)!;
console.log('🏁 Router chargé');