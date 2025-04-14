type RouteMap = { [path: string]: (navigate: (path: string) => void) => HTMLElement };

/**
 * Permet de protéger une route : redirige vers /auth si aucun token n’est présent.
 */
export function protectedRoute(
  page: (navigate: (path: string) => void) => HTMLElement
): (navigate: (path: string) => void) => HTMLElement {
  return (navigate) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth');
      const redirecting = document.createElement('div');
      redirecting.textContent = 'Redirection vers la page de connexion...';
      redirecting.className = 'text-white text-center mt-10 text-xl';
      return redirecting;
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

  function renderRoute(path: string) {
    const page = routes[path];
    if (page && root) {
      root.innerHTML = '';
      root.appendChild(page(navigate));
    }
  }

  window.addEventListener('popstate', () => {
    renderRoute(window.location.pathname);
  });

  renderRoute(window.location.pathname);

  return navigate;
}

