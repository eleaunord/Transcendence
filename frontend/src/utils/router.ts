import { t } from '../utils/translator';

export type RouteMap = { [path: string]: (navigate: (path: string) => void) => HTMLElement };

/**
 * Vérifie si le token est valide côté serveur
 */
async function validateToken(): Promise<boolean> {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    const response = await fetch('/api/validate-token', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.valid === true;
    } else {
      // Token invalide, on le supprime
      localStorage.removeItem('token');
      return false;
    }
  } catch (error) {
    console.error('[TokenValidation] Error validating token:', error);
    return false;
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
    console.log('[ProtectedRoute] Token presence:', token);
    
    if (!token) {
      console.log('[ProtectedRoute] No token found → redirecting to home...');
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
        console.log('[ProtectedRoute] Invalid token → redirecting to home...');
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
    console.log('[2FA] token exists? :', token);
    
    if (!token) {
      console.log('[2FA] User not logged in → redirecting to home...');
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
        console.log('[2FA] Valid token → rendering 2FA page');
        const actualPage = page(navigate);
        placeholder.parentNode?.replaceChild(actualPage, placeholder);
      } else {
        console.log('[2FA] Invalid token → redirecting to home...');
        localStorage.setItem('2fa_redirect_notice', '1');
        navigate('/');
      }
    }).catch(error => {
      console.error('[2FA] Token validation failed:', error);
      localStorage.setItem('2fa_redirect_notice', '1');
      navigate('/');
    });

    return placeholder;
  };
}

/**
 * Fonction pour rediriger les utilisateurs connectés vers /game au lieu de /
 */
async function handleHomeRedirect(navigate: (path: string) => void): Promise<HTMLElement> {
  const token = localStorage.getItem('token');
  
  if (token) {
    console.log('[HomeRedirect] Token found, validating...');
    
    const placeholder = document.createElement('div');
    placeholder.textContent = 'Checking session...';
    placeholder.className = 'text-white text-center mt-40 text-xl';

    try {
      const isValid = await validateToken();
      if (isValid) {
        console.log('[HomeRedirect] Valid token → redirecting to /game');
        setTimeout(() => navigate('/game'), 0);
        return placeholder;
      }
    } catch (error) {
      console.error('[HomeRedirect] Token validation failed:', error);
    }
  }
  
  // Si pas de token ou token invalide, charger la page d'accueil normale
  console.log('[HomeRedirect] No valid token → loading home page');
  const { createHomePage } = await import('../pages/HomePage');
  return createHomePage(navigate);
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