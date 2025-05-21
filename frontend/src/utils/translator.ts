// import fr from '../i18n/fr.json';
// import en from '../i18n/en.json';
// import ko from '../i18n/ko.json';

// const translations: Record<string, any> = { fr, en, ko };

// let currentLang = sessionStorage.getItem("lang") || "en";

// export function setLanguage(lang: string) {
//   if (translations[lang]) {
//     currentLang = lang;
//     sessionStorage.setItem("lang", lang);
//   }
// }

// export function getLanguage(): string {
//   return currentLang;
// }

// export function t(key: string): string {
//   return translations[currentLang][key] || key;
// }

// export function applyTranslations() {
//   // innerText (par défaut)
//   document.querySelectorAll<HTMLElement>('[data-i18n]').forEach(el => {
//     const key = el.getAttribute('data-i18n');
//     if (key) el.innerText = t(key);
//   });

//   // innerHTML (pour les textes avec balises HTML, comme le lien RGPD)
//   document.querySelectorAll<HTMLElement>('[data-i18n-html]').forEach(el => {
//     const key = el.getAttribute('data-i18n-html');
//     if (key) el.innerHTML = t(key);
//   });
// }

import en from '../i18n/en.json';
import fr from '../i18n/fr.json';
import ko from '../i18n/ko.json';

type Lang = 'en' | 'fr' | 'ko';
type Translations = typeof en;

const translations: Record<Lang, Translations> = { en, fr, ko };

// Initialise la langue avec fallback
let currentLang: Lang = (localStorage.getItem('lang') as Lang) || 'en';

// Définir la langue
export function setLanguage(lang: Lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
}

// Obtenir la langue actuelle
export function getLanguage(): Lang {
  return currentLang;
}

// Traduction simple (ne retourne que les string, pas les tableaux)
export function t(key: string, vars?: Record<string, string | number>): string {
  let val = translations[currentLang][key as keyof Translations];
  if (typeof val === 'string') {
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        val = val.replace(`{{${k}}}`, String(v));
      }
    }
    return val;
  }
  return key;
}

export function tArray(key: string): string[] {
  const val = translations[currentLang][key as keyof Translations];
  if (Array.isArray(val)) return val;
  return [];
}

export function applyTranslations() {
  const elements = document.querySelectorAll('[data-i18n]');

  elements.forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (!key) return;

    if (el instanceof HTMLInputElement && el.placeholder) {
      el.placeholder = t(key);
    } else {
      el.innerHTML = t(key);
    }
  });
}