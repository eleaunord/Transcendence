import { initRouter, protectedRoute, protected2FARoute } from './utils/router';
import { createHomePage } from './pages/HomePage';
import { createAuthPage } from './pages/AuthPage';
import { createProfileCreationPage } from './pages/ProfileCreationPage';
import { createCustomizationPage } from './pages/CustomizationPage';
import { createGamePage } from './pages/GamePage';
import { createUserProfilePage } from './pages/UserProfilePage';
import { createSignUpPage } from './pages/SignUpPage';
import { createGoogleOauthPage } from './pages/GoogleOauth';
import { create2FAPage } from './pages/2FAPages';
// import { createPong3DPage } from './pages/Pong3DPage';
import { createMemoryGamePage } from './pages/MemoryGamePage';
import { createFriendsPage } from './pages/FriendsPage';
import { createLeaderboardPage } from './pages/LeaderboardPage';
import { createAboutPage } from './pages/AboutUsPage';
//import { createLocalPage } from './pages/LocalPage';
import { createAIPage } from './pages/AIPage';
import { createTournamentPage } from './pages/TournamentPage';
import { createVersusPage } from './pages/VersusPage';
import { createModePage } from './pages/ModePage';
import { createAnonymizePage } from './pages/AnonymizePage'; // 1705 추가
import { createDeleteAccountPage } from './pages/DeleteAccountPage';
import { createPrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { createExportDataPage } from './pages/ExportDataPage';
import { createModeMemoryPage } from './pages/ModeMemoryPage';
import { createMemoryVersusPage } from './pages/MemoryVersusPage';
import { createGameCustomizationPage } from './pages/GameCustomizationPage';
import { createMemoryCustomizationPage } from './pages/MemoryCustomizationPage';
import { setLanguage, applyTranslations } from './utils/translator'
import { createBracketPage } from './pages/BracketPage';

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
  '/customization-game' : useWithNavigate(protectedRoute(createGameCustomizationPage)),
  '/customization-memory' : useWithNavigate(protectedRoute(createMemoryCustomizationPage)),
  '/user-profile': useWithNavigate(protectedRoute(createUserProfilePage)),
  '/signup': useWithNavigate(createSignUpPage),
  '/auth/google': useWithNavigate(createGoogleOauthPage),
  '/2fa': useWithNavigate((navigate) => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode') === 'input' ? 'input' : 'activation';
    const pageFn = protected2FARoute((nav) => create2FAPage(nav, mode));
    return pageFn(navigate);
  }),
  // '/pong': useWithNavigate(protectedRoute(createPong3DPage)),
  '/memory': useWithNavigate(protectedRoute(createMemoryGamePage)),
  '/friends': useWithNavigate(protectedRoute(createFriendsPage)),
  '/leaderboard': useWithNavigate(protectedRoute(createLeaderboardPage)),
  '/about': useWithNavigate(protectedRoute(createAboutPage)), // 여기 변경해야함: maybe this shouldn't be a protected route
  //'/local': useWithNavigate(protectedRoute(createLocalPage)), // ATTENTION vérifier l'utilité de cette page
  '/ai': useWithNavigate(protectedRoute(createAIPage)),
  '/tournament': useWithNavigate(protectedRoute(createTournamentPage)),
  '/versus': useWithNavigate(protectedRoute(createVersusPage)),
  '/mode': useWithNavigate(protectedRoute(createModePage)),
  '/memory-mode': useWithNavigate(protectedRoute(createModeMemoryPage)),
  '/memory-versus': useWithNavigate(protectedRoute(createMemoryVersusPage)),
  '/anonymize': useWithNavigate(protectedRoute(createAnonymizePage)),
  '/delete-account': useWithNavigate(protectedRoute(createDeleteAccountPage)),
  '/privacy-policy': useWithNavigate(createPrivacyPolicyPage),
  '/export-data': useWithNavigate(protectedRoute(createExportDataPage)), //0805 추가
  '/bracket': useWithNavigate(protectedRoute(createBracketPage)),

}

navigate = initRouter(routes)!;
console.log('🏁 Router chargé');

// // === INTERNATIONALISATION ===
window.addEventListener('DOMContentLoaded', () => {
  applyTranslations();
});

(window as any).switchLang = (lang: string) => {
    setLanguage(lang as 'en' | 'fr' | 'ko');
  applyTranslations();
};