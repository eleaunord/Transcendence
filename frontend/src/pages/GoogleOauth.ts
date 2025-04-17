export function createGoogleOauthPage(navigate: (path: string) => void): HTMLElement {
    const container = document.createElement('div');
    container.className = 'flex flex-col justify-center items-center h-screen bg-gray-900 text-white';
  
    const title = document.createElement('h1');
    title.className = 'text-3xl font-bold';
    title.textContent = 'Connexion Google...';
  
    const spinner = document.createElement('div');
    spinner.className = 'mt-4 animate-spin rounded-full h-10 w-10 border-b-2 border-white';
  
    container.appendChild(title);
    container.appendChild(spinner);
  
    // get token from url
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
  
    if (token) {
      // store token and redirect
      localStorage.setItem('token', token);
      setTimeout(() => navigate('/profile-creation'), 1000); // 1초 후 이동
    } else {
      title.textContent = 'Erreur : aucun token trouvé';
      spinner.style.display = 'none';
    }
  
    return container;
  }
  