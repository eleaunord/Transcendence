
export async function applyUserTheme(bg: HTMLElement) {
  if (!bg) return;

  let theme: string | null = sessionStorage.getItem('theme');

  if (!theme) {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch('/api/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = await res.json();
      theme = user.theme || '/assets/Backgrounds/bg_th1.jpg';
    } catch (err) {
      console.error('Erreur récupération thème utilisateur :', err);
      theme = '/assets/Backgrounds/bg_th1.jpg'; // Valeur par défaut en cas d'erreur
    }
  }

  if (typeof theme === 'string') {
    sessionStorage.setItem('theme', theme);

    // Précharger l'image
    const img = new Image();
    img.src = theme;
    img.onload = () => {
      bg.style.backgroundImage = `url(${theme})`;
      bg.style.opacity = '1'; // Afficher l'image une fois chargée
    };
  }
}