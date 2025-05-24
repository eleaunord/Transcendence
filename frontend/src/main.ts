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
import { createAnonymizePage } from './pages/AnonymizePage';
import { createDeleteAccountPage } from './pages/DeleteAccountPage';
import { createPrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { createExportDataPage } from './pages/ExportDataPage';
import { createModeMemoryPage } from './pages/ModeMemoryPage';
import { createMemoryVersusPage } from './pages/MemoryVersusPage';
import { createGameCustomizationPage } from './pages/GameCustomizationPage';
import { createMemoryCustomizationPage } from './pages/MemoryCustomizationPage';
import { setLanguage, applyTranslations } from './utils/translator'
import { createMemoryOpponentPage } from './pages/MemoryOpponentPage';
import { createMemoryFriendPage } from './pages/MemoryFriendPage';
import { createBracketPage } from './pages/BracketPage';
import { renderNotFoundPage } from './pages/404Page'; 
import { refreshSidebar } from './utils/sidebar';

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
  // Note: La route '/' est maintenant gérée directement dans le router
  // pour permettre la redirection automatique vers /game si connecté
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
  '/about': useWithNavigate((createAboutPage)),
  //'/local': useWithNavigate(protectedRoute(createLocalPage)),
  '/ai': useWithNavigate(protectedRoute(createAIPage)),
  '/tournament': useWithNavigate(protectedRoute(createTournamentPage)),
  '/versus': useWithNavigate(protectedRoute(createVersusPage)),
  '/mode': useWithNavigate(protectedRoute(createModePage)),
  '/memory-mode': useWithNavigate(protectedRoute(createModeMemoryPage)),
  '/memory-versus': useWithNavigate(protectedRoute(createMemoryVersusPage)),
  '/memory-opponent': useWithNavigate(protectedRoute(createMemoryOpponentPage)),
  '/memory-friend': useWithNavigate(protectedRoute(createMemoryFriendPage)),
  '/anonymize': useWithNavigate(protectedRoute(createAnonymizePage)),
  '/delete-account': useWithNavigate(protectedRoute(createDeleteAccountPage)),
  '/privacy-policy': useWithNavigate(createPrivacyPolicyPage),
  '/export-data': useWithNavigate(protectedRoute(createExportDataPage)),
  '/bracket': useWithNavigate(protectedRoute(createBracketPage)),
  '/404': useWithNavigate(() => renderNotFoundPage()),
}

navigate = initRouter(routes, 'team')!;

console.log('🏁 Router chargé');

// === INTERNATIONALISATION ===
window.addEventListener('DOMContentLoaded', () => {
  applyTranslations();
});

(window as any).switchLang = (lang: string) => {
    setLanguage(lang as 'en' | 'fr' | 'ko');
  applyTranslations();
};

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    // Increased delay and added multiple attempts
    setTimeout(() => {
      refreshSidebar();
      // If still no image after refresh, try again
      setTimeout(() => {
        const profileImg = document.getElementById('profile-img-sidebar') as HTMLImageElement;
        if (profileImg && !profileImg.src.includes('default.jpg')) {
          refreshSidebar();
        }
      }, 300);
    }, 200);
  }
});