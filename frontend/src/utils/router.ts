import { t } from '../utils/translator';

type RouteMap = { [path: string]: (navigate: (path: string) => void) => HTMLElement };

/**
 * Permet de protéger une route : redirige vers /auth si aucun token n’est présent.
 */
export function protectedRoute(
  page: (navigate: (path: string) => void) => HTMLElement,
  message: string = t('protected.login_required')
): (navigate: (path: string) => void) => HTMLElement {
  return (navigate) => {
    const token = localStorage.getItem('token');
    console.log('[ProtectedRoute] Token presence:', token);

    if (!token) {
      console.log('[ProtectedRoute] User not logged in → redirecting to home...');

      const placeholder = document.createElement('div');
      placeholder.textContent = t('protected.redirecting');
      placeholder.className = 'text-white text-center mt-40 text-xl';

      localStorage.setItem('protected_route_notice', message);

      setTimeout(() => {
        navigate('/');
      }, 0);

      return placeholder;
    }

    return page(navigate);
  };
}

export function initRouter(routes: RouteMap, rootId = 'app') {
  const root = document.getElementById(rootId);
  if (!root) return;

  function navigate(path: string) {
    window.history.pushState({}, '', path);
    renderRoute(path);
  }

  // function renderRoute(path: string) {
  //   const pathOnly = path.split('?')[0]; // DONT REMOVE THIS LINE: c'est pour enlève la query string (ex: ?mode=input) pour matcher uniquement la route de base (ex: /2fa)
  //   const page = routes[pathOnly];
  //   if (page && root) {
  //     root.innerHTML = '';
  //     root.appendChild(page(navigate));
  //   }
  // }
  function renderRoute(path: string) {
    const pathOnly = path.split('?')[0];
    const page = routes[pathOnly] || routes['/404']; // ✅ fallback ici

    if (page && root) {
      root.innerHTML = '';
      root.appendChild(page(navigate));
      
      // (Optionnel) Mettre l’URL à /404 si la route n’existe pas
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
      return document.createElement('div'); // 이걸 붙이면 비어있는 화면이 생김
    }

    console.log('[2FA] User is logged in → rendering 2FA page');
    return page(navigate);
  };
}
