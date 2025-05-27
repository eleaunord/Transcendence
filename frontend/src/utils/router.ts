import { t } from '../utils/translator';
import { refreshSidebar } from './sidebar';

export type RouteMap = { [path: string]: (navigate: (path: string) => void) => HTMLElement };

/**
 * Vérifie si le token est valide côté serveur
 */


async function validateToken(): Promise<{ isValid: boolean; pending2FA: boolean; user?: any }> {
  const token = localStorage.getItem('token');
  if (!token) return { isValid: false, pending2FA: false };

  try {
    const res = await fetch('/api/validate-token', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });


    if (res.ok) {
      const data = await res.json();
      
      if (data.valid && data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        refreshSidebar();
      }
      return { isValid: data.valid === true, pending2FA: false, user: data.user };
    }

    if (res.status === 403) {
      const data = await res.json();
      return { isValid: false, pending2FA: data.pending_2fa === true, user: data.user };
    }

    // Invalid token
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
    return { isValid: false, pending2FA: false };

  } catch (err) {
    console.error('[TokenValidation] Network error:', err);
    return { isValid: false, pending2FA: false };
  }
}

/**
 * Permet de protéger une route : redirige vers /auth si aucun token valide n'est présent.
 */
export function protectedRoute(
  page: (navigate: (path: string) => void) => HTMLElement,
  message: string = t('protected.login_required')
): (navigate: (path: string) => void) => HTMLElement {
  return (navigate) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      const placeholder = document.createElement('div');
      placeholder.textContent = t('protected.redirecting');
      placeholder.className = 'text-white text-center mt-40 text-xl';
      localStorage.setItem('protected_route_notice', message);
      setTimeout(() => {
        navigate('/');
      }, 0);
      return placeholder;
    }

    // Créer un placeholder pendant la validation
    const placeholder = document.createElement('div');
    placeholder.textContent = t('protected.validating') || 'Validating session...';
    placeholder.className = 'text-white text-center mt-40 text-xl';

    // Valider le token de manière asynchrone
    validateToken().then(isValid => {
      if (isValid) {
        // Token valide, rendre la page
        const actualPage = page(navigate);
        placeholder.parentNode?.replaceChild(actualPage, placeholder);
      } else {
        // Token invalide, rediriger vers la page d'accueil
        localStorage.setItem('protected_route_notice', message);
        navigate('/');
      }
    }).catch(error => {
      console.error('[ProtectedRoute] Token validation failed:', error);
      localStorage.setItem('protected_route_notice', message);
      navigate('/');
    });

    return placeholder;
  };
}

/**
 * Version améliorée pour les routes 2FA avec validation de token
 */
export function protected2FARoute(
  page: (navigate: (path: string) => void) => HTMLElement
): (navigate: (path: string) => void) => HTMLElement {
  return (navigate) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setTimeout(() => {
        localStorage.setItem('2fa_redirect_notice', '1');
        navigate('/');
      }, 0);
      return document.createElement('div');
    }

    // Créer un placeholder pendant la validation
    const placeholder = document.createElement('div');
    placeholder.textContent = 'Validating session...';
    placeholder.className = 'text-white text-center mt-40 text-xl';

    // Valider le token de manière asynchrone
    validateToken().then(isValid => {
      if (isValid) {
        const actualPage = page(navigate);
        placeholder.parentNode?.replaceChild(actualPage, placeholder);
      } else {
        localStorage.setItem('2fa_redirect_notice', '1');
        navigate('/');
      }
    }).catch(error => {
      console.error('[router.ts : 2FA] Token validation failed:', error);
      localStorage.setItem('2fa_redirect_notice', '1');
      navigate('/');
    });

    return placeholder;
  };
}

export function privacyAcceptedRoute(
  page: (navigate: (path: string) => void) => HTMLElement
): (navigate: (path: string) => void) => HTMLElement {
  return (navigate) => {
    const accepted = sessionStorage.getItem('privacyAccepted') === 'true';

    if (!accepted) {
      alert('You must agree to the terms of service to register');

      // navigate 후 렌더링 지연 → setTimeout으로 다음 tick에서 실행
      setTimeout(() => navigate('/'), 0);

      // 눈에 보일 뭔가 반환
      const placeholder = document.createElement('div');
      placeholder.textContent = 'If you do not agree to the terms, you cannot access this page.';
      placeholder.className = 'text-white text-center mt-40 text-xl';
      return placeholder;
    }

    return page(navigate);
  };
}


/**
 * Fonction pour rediriger les utilisateurs connectés vers /game au lieu de /
 */
/**
 * Fonction pour rediriger les utilisateurs connectés vers /game au lieu de /
 */
// Replace your handleHomeRedirect function with this fixed version
async function handleHomeRedirect(navigate: (path: string) => void): Promise<HTMLElement> {
  const token = localStorage.getItem('token');
  const placeholder = document.createElement('div');
  placeholder.textContent = 'Checking session…';
  placeholder.className = 'text-white text-center mt-40 text-xl';

  if (!token) {
    const { createHomePage } = await import('../pages/HomePage');
    return createHomePage(navigate);
  }

  try {
    const validation = await validateToken();
    
    if (validation.isValid) {
      // Token is fully valid, go to game
      navigate('/game');
      return placeholder;
    } else if (validation.pending2FA) {
      // Token exists but needs 2FA verification
      navigate('/2fa?mode=input');
      return placeholder;
    } else {
      // Token is invalid, show login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.clear();
      const { createHomePage } = await import('../pages/HomePage');
      return createHomePage(navigate);
    }
  } catch (err) {
    console.error('[HomeRedirect] Error:', err);
    localStorage.removeItem('token'); 
    localStorage.removeItem('user');
    sessionStorage.clear();
    const { createHomePage } = await import('../pages/HomePage');
    return createHomePage(navigate);
  }
}

export function initRouter(routes: RouteMap, teamPrefix = '', rootId = 'app') {
  const root = document.getElementById(rootId);
  if (!root) return;

  // This function is defined inside initRouter to ensure root is accessible
  function createTeamMemberPage(navigate: (path: string) => void, name: string): HTMLElement {
    const container = document.createElement('div');
    container.className = 'relative min-h-screen bg-gray-900 text-white overflow-hidden';
    
    import('../pages/TeamMemberPage').then(({ createTeamMemberPage }) => {
      const teamMemberElement = createTeamMemberPage(navigate, name);
      container.innerHTML = '';
      container.append(...Array.from(teamMemberElement.childNodes));
      container.className = teamMemberElement.className;
    }).catch(err => {
      console.error('Error loading team member page:', err);
      container.innerHTML = '<div class="text-white text-center mt-40 text-xl">Error loading team member page</div>';
    });
    
    return container;
  }

  function navigate(path: string) {
    window.history.pushState({}, '', path);
    renderRoute(path);
    refreshSidebar();
  }

  function renderRoute(path: string) {
    if (!root) return;

    const pathOnly = path.split('?')[0];
    
    // Gestion spéciale pour la page d'accueil
    if (pathOnly === '/') {
      root.innerHTML = '';
      handleHomeRedirect(navigate).then(element => {
        if (root.children.length === 0) { // Vérifier que la page n'a pas déjà changé
          root.appendChild(element);
        }
      });
      return;
    }
    
    // Check if it's a team member route
    if (teamPrefix && pathOnly.startsWith(`/${teamPrefix}/`)) {
      const name = decodeURIComponent(pathOnly.split(`/${teamPrefix}/`)[1]);
      root.innerHTML = '';
      root.appendChild(createTeamMemberPage(navigate, name));
      return;
    }
    
    const page = routes[pathOnly] || routes['/404'];

    if (page && root) {
      root.innerHTML = '';
      root.appendChild(page(navigate));
      
      if (!routes[pathOnly]) {
        window.history.replaceState({}, '', '/404');
      }
    }
  }

  window.addEventListener('popstate', () => {
    renderRoute(window.location.pathname);
  });
  
  renderRoute(window.location.pathname);
  return navigate;
}