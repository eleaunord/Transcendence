
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

// export async function applyUserTheme(bg: HTMLElement) {
//   if (!bg) return;

//   let theme: string | null = sessionStorage.getItem('theme');

//   if (!theme) {
//     const token = localStorage.getItem('token');
//     if (!token) return;

//     try {
//       const res = await fetch('/api/me', {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const user = await res.json();

//       if (typeof user.theme === 'string') {
//         theme = user.theme;
//       } else {
//         theme = '/assets/profile-themes/arabesque.png'; // Valeur par défaut
//       }
//     } catch (err) {
//       console.error('Erreur récupération thème utilisateur :', err);
//       theme = '/assets/profile-themes/arabesque.png'; // Valeur par défaut en cas d'erreur
//     }
//   }

//   if (typeof theme === 'string') {
//     sessionStorage.setItem('theme', theme);
//     bg.style.backgroundImage = `url(${theme})`;
//   }
// }



// export async function applyUserTheme(bg: HTMLElement) {
//   if (!bg) return;

//   let theme: string | null = sessionStorage.getItem('theme');

//   if (!theme) {
//     const token = localStorage.getItem('token');
//     if (!token) return;

//     try {
//       const res = await fetch('/api/me', {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const user = await res.json();
//       console.log("🎨 Utilisateur reçu :", user);

//       if (typeof user.theme === 'string') {
//         theme = user.theme;
//       }
//     } catch (err) {
//       console.error('Erreur récupération thème utilisateur :', err);
//       return;
//     }
//   }

//   if (typeof theme === 'string') {
//     sessionStorage.setItem('theme', theme);
//     bg.style.backgroundImage = `url(${theme})`;
//   }
// }

// export function applyUserTheme(bg: HTMLElement) {
//   if (!bg) return;

//   let theme: string | null = sessionStorage.getItem('theme');

//   if (!theme) {
//     const token = localStorage.getItem('token');
//     if (!token) return;

//     try {
//       const res = fetch('/api/me', {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const user = res.json();
//       console.log("🎨 Utilisateur reçu :", user);

//       if (typeof user.theme === 'string') {
//         theme = user.theme;
//       }
//     } catch (err) {
//       console.error('Erreur récupération thème utilisateur :', err);
//       return;
//     }
//   }

//   if (typeof theme === 'string') {
//         sessionStorage.setItem('theme', theme);
//         bg.style.backgroundImage = `url(${theme})`;
//   }
// }



// export async function applyUserTheme(bg: HTMLElement) {
//   if (!bg) {
//     console.warn("❌ Aucun élément avec l'ID 'backgroundImage' trouvé.");
//     return;
//   }

//   let theme: string | null = sessionStorage.getItem('theme');
//   console.log("📦 Thème trouvé en sessionStorage :", theme);

//   if (!theme) {
//     const token = localStorage.getItem('token');
//     if (!token) {
//       console.warn("⚠️ Aucun token trouvé dans le localStorage.");
//       return;
//     }

//     try {
//       console.log("🔄 Aucune session trouvée, appel à /api/me...");
//       const res = await fetch('/api/me', {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const user = await res.json();
//       console.log("🎨 Utilisateur reçu de /api/me :", user);
      
//       if (typeof user.theme === 'string') {
//         theme = user.theme;
//         console.log("✅ Thème extrait de l'utilisateur :", theme);
//       } else {
//         console.warn("⚠️ Aucun thème trouvé dans les données utilisateur.");
//       }
//     } catch (err) {
//       console.error('❌ Erreur récupération thème utilisateur :', err);
//       return;
//     }
//   }

//   if (typeof theme === 'string') {
//     sessionStorage.setItem('theme', theme);
//     bg.style.backgroundImage = `url(${theme})`;
//     console.log("🖼️ Thème appliqué :", theme);
//   } else {
//     console.warn("⚠️ Thème non défini, aucune image appliquée.");
//   }
// }

