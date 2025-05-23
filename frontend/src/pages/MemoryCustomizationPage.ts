import { createSidebar } from "../utils/sidebar";
import { applyUserTheme } from "../utils/theme";
import { saveMemorySettings } from "../utils/memorySettings";
import { t } from '../utils/translator'; 

export function createMemoryCustomizationPage(navigate: (path: string) => void): HTMLElement {
  const container = document.createElement('div');
  container.className = 'flex flex-col h-screen bg-gray-900 text-white';

  const sidebar = createSidebar(navigate);
  container.appendChild(sidebar);

  const backgroundImage = document.createElement('div');
  backgroundImage.id = 'backgroundImage';
  backgroundImage.className = 'absolute top-0 left-20 right-0 bottom-0 bg-cover bg-center transition-all duration-300';
  container.appendChild(backgroundImage);
  applyUserTheme(backgroundImage);

  const gameArea = document.createElement('div');
  gameArea.className = 'flex-1 bg-gray-900 flex justify-center items-center';

  const gameFrame = document.createElement('div');
  gameFrame.className = 'w-3/4 h-3/4 border-4 border-white relative overflow-hidden bg-black flex items-center justify-center';

  const customizationMenu = document.createElement("div");
  customizationMenu.className = "w-full h-full flex items-center justify-center bg-black bg-opacity-80 text-white";

  const innerPanel = document.createElement('div');
  innerPanel.className = "flex flex-col gap-6 items-center justify-center";

  function createButtonGroup(title: string, options: { label: string, value: number | string }[], selected: number | string): HTMLDivElement {
    const group = document.createElement('div');
    group.className = 'flex flex-col items-center gap-2';

    const label = document.createElement('span');
    label.textContent = title;
    label.className = 'text-lg font-semibold';

    const btnContainer = document.createElement('div');
    btnContainer.className = 'flex gap-4';

    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.textContent = opt.label;
      btn.className = 'bg-blue-800 hover:bg-blue-700 text-white py-2 px-4 rounded transition-all duration-200';
      btn.dataset.value = opt.value.toString();
      if (opt.value === selected) btn.classList.add('bg-blue-600', 'ring-2', 'ring-white', 'ring-offset-2', 'font-bold');

      btn.onclick = () => {
        btnContainer.querySelectorAll('button').forEach(b => {
          b.classList.remove('bg-blue-600', 'ring-2', 'ring-white', 'ring-offset-2', 'font-bold');
        });
        btn.classList.add('bg-blue-600', 'ring-2', 'ring-white', 'ring-offset-2', 'font-bold');
      };

      btnContainer.appendChild(btn);
    });

    group.append(label, btnContainer);
    return group;
  }

  function getSelectedValue(container: HTMLDivElement): number | string {
    const selected = container.querySelector('button.bg-blue-600') as HTMLButtonElement;
    return selected ? selected.dataset.value ?? '' : '';
  }

  // Choix du nombre de cartes (paires)
  const pairCountGroup = createButtonGroup(t('memory.pairs'), [
  { label: t('memory.pairs.6'), value: 6 },
  { label: t('memory.pairs.9'), value: 9 },
  { label: t('memory.pairs.12'), value: 12 },
], 6);

  // Choix du thème Memory
  const themeGroup = createButtonGroup(t('memory.theme'), [
    { label: t('memory.theme.classic'), value: "classic" },
    { label: t('memory.theme.cloud'), value: "cloud" },
    { label: t('memory.theme.sun'), value: "sun" },
  ], "classic");

  // Détermination du mode
  const mode = localStorage.getItem('memory-mode') || 'solo';

  // Détermination de l'adversaire
  const opponentName = localStorage.getItem('opponent-name') || t('opponent.guest');
  // Groupe de temps selon le mode
  let timerGroup: HTMLDivElement;

  if (mode === 'solo') {
    timerGroup = createButtonGroup(t('memory.timer.solo'), [
      { label: t('memory.timer.none'), value: "none" },
      { label: t('memory.timer.short'), value: "short" },
      { label: t('memory.timer.medium'), value: "medium" },
      { label: t('memory.timer.long'), value: "long" },
    ], "none");
  } else {
      timerGroup = createButtonGroup(t('memory.timer.versus'), [
      { label: "10 sec", value: 10 },
      { label: "20 sec", value: 20 },
      { label: "30 sec", value: 30 },
    ], 20);
  }

  // Bouton "Jouer"
  const playButton = document.createElement('button');
  playButton.textContent = t('memory.play');
  playButton.className = "bg-green-600 hover:bg-green-700 text-white text-xl font-bold py-2 px-6 rounded transition";

  playButton.onclick = () => {
    const pairCount = Number(getSelectedValue(pairCountGroup)) as 6 | 9 | 12;
    const theme = getSelectedValue(themeGroup) as string;

    if (mode === 'solo') {
      const timerMode = getSelectedValue(timerGroup) as "none" | "short" | "medium" | "long";
      saveMemorySettings({ pairCount, theme, timerMode });
      navigate('/memory');
    } else {
      const turnTime = Number(getSelectedValue(timerGroup));
      saveMemorySettings({ pairCount, theme, turnTime });
      navigate('/memory-versus');
    }
  };

  // Affichage de l'adversaire
  if (mode === 'versus') {
    const infoText = document.createElement('p');
    infoText.textContent = t('memory.opponent', { name: opponentName });
    infoText.className = 'text-xl text-white font-semibold';
    innerPanel.prepend(infoText);
  }


  // Assemblage
  innerPanel.append(pairCountGroup, themeGroup, timerGroup, playButton);
  customizationMenu.appendChild(innerPanel);
  gameFrame.appendChild(customizationMenu);
  gameArea.appendChild(gameFrame);

  const layout = document.createElement('div');
  layout.className = 'flex flex-1';
  layout.id = 'game-layout';
  layout.appendChild(gameArea);
  container.appendChild(layout);

  // // Sidebar animations
  // sidebar.addEventListener('mouseenter', () => {
  //   document.querySelectorAll('.sidebar-label').forEach(label => {
  //     (label as HTMLElement).classList.remove('opacity-0');
  //     (label as HTMLElement).classList.add('opacity-100');
  //   });
  //   backgroundImage.className = 'absolute top-0 left-64 right-0 bottom-0 bg-cover bg-center transition-all duration-300';
  //   layout.classList.add('ml-44');
  // });

  // sidebar.addEventListener('mouseleave', () => {
  //   document.querySelectorAll('.sidebar-label').forEach(label => {
  //     (label as HTMLElement).classList.add('opacity-0');
  //     (label as HTMLElement).classList.remove('opacity-100');
  //   });
  //   backgroundImage.className = 'absolute top-0 left-20 right-0 bottom-0 bg-cover bg-center transition-all duration-300';
  //   layout.classList.remove('ml-44');
  // });

  return container;
}
