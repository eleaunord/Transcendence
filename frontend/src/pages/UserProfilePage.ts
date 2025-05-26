import { createSidebar } from "../utils/sidebar";
import { applyUserTheme } from "../utils/theme";
import { createProfileCard } from "../profile_utils/profileCard";
import { createProfileForm } from "../profile_utils/profileForm";
import { createSettingsPanel } from "../profile_utils/settingsPanel";
import { createHistorySection } from "../profile_utils/historySection";

import { loadUserData } from "../profile_events/loadUserData";
import { initSidebarHoverEffects } from "../profile_events/initSidebarHoverEffects";
import { setLanguage, t,applyTranslations } from '../utils/translator'

export function createUserProfilePage(navigate: (path: string) => void): HTMLElement {
  if ((window as any).activePongCleanup) {
    (window as any).activePongCleanup();
    delete (window as any).activePongCleanup;
  }
  
  const token: string | null = localStorage.getItem('token');

  const container = document.createElement('div');
  container.className = 'relative min-h-screen bg-gray-900 text-white overflow-hidden';

  // Ajout des boutons de langue
  const langSelector = document.createElement('div');
  langSelector.className = 'absolute top-4 right-4 flex gap-2 z-20';

  ['en', 'fr', 'ko'].forEach((langCode) => {
    const btn = document.createElement('button');
    btn.className = 'px-2 py-1 border rounded text-sm bg-white text-black';
    btn.textContent = langCode.toUpperCase();

    btn.addEventListener('click', () => {
      setLanguage(langCode as 'en' | 'fr' | 'ko');
      const root = document.getElementById('app');
      if (root) {
        root.innerHTML = '';
        root.appendChild(createUserProfilePage(navigate)); // Recharge la page actuelle
      }
    });

    langSelector.appendChild(btn);
  });

  container.appendChild(langSelector);

  const sidebar = createSidebar(navigate);
  sidebar.classList.add('sidebar'); // nécessaire pour les effets de hover
  sidebar.style.zIndex = '50';
  container.appendChild(sidebar);

  // -------- Background Image --------
  const backgroundImage = document.createElement('div');
  backgroundImage.id = 'backgroundImage';
  backgroundImage.className = 'absolute top-0 left-20 right-0 bottom-0 bg-cover bg-center transition-all duration-300';
  container.appendChild(backgroundImage);
  applyUserTheme(backgroundImage);

  // -------- Profile Section (card + form) --------
  const profileSection = document.createElement('div');
  profileSection.id = 'profileSection';
  profileSection.className = `
    relative mt-11
    flex flex-row items-start justify-center gap-x-16
    z-20 w-full max-w-5xl mx-auto px-4
  `.replace(/\s+/g, ' ').trim();

  const profileCard = createProfileCard();
  const formContainer = createProfileForm();

  profileSection.appendChild(profileCard);
  profileSection.appendChild(formContainer);
  container.appendChild(profileSection);
  
  // -------- History Section --------
  if (token) {
    const historySection = createHistorySection(token);
    container.appendChild(historySection);
  }

  // -------- Settings Section --------
  const settingsSection = createSettingsPanel(navigate);
  container.appendChild(settingsSection);

  // -------- Events (hover + user data) --------
  initSidebarHoverEffects();

  if (token) {
    loadUserData(token);
  }

  return container;
}
