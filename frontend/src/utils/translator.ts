import fr from '../i18n/fr.json';
import en from '../i18n/en.json';
import ko from '../i18n/ko.json';

const translations: Record<string, any> = { fr, en, ko };

let currentLang = sessionStorage.getItem("lang") || "en";

export function setLanguage(lang: string) {
  if (translations[lang]) {
    currentLang = lang;
    sessionStorage.setItem("lang", lang);
  }
}

export function getLanguage(): string {
  return currentLang;
}

export function t(key: string): string {
  return translations[currentLang][key] || key;
}

export function applyTranslations() {
  // innerText (par défaut)
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (key) el.innerText = t(key);
  });

  // innerHTML (pour les textes avec balises HTML, comme le lien RGPD)
  document.querySelectorAll<HTMLElement>('[data-i18n-html]').forEach(el => {
    const key = el.getAttribute('data-i18n-html');
    if (key) el.innerHTML = t(key);
  });
}
