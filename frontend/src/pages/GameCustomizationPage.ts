import { createSidebar } from "../utils/sidebar";
import { applyUserTheme } from "../utils/theme";
import { savePongSettings } from "../utils/pongSettings";
import { t } from '../utils/translator'; 

export function createGameCustomizationPage(navigate: (path: string) => void): HTMLElement {
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

  function createButtonGroup(title: string, options: { label: string, value: number }[], selected: number): HTMLDivElement {
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

  function getSelectedValue(container: HTMLDivElement): number {
    const selected = container.querySelector('button.bg-blue-600') as HTMLButtonElement;
    return selected ? Number(selected.dataset.value) : 0;
  }

  const speedGroup = createButtonGroup(t('custom.speed'), [
    { label: t('custom.speed.normal'), value: 5 },
    { label: t('custom.speed.fast'), value: 8 },
    { label: t('custom.speed.very_fast'), value: 11 },
  ], 5);

  const scoreGroup = createButtonGroup(t('custom.score'), [
    { label: "3", value: 3 },
    { label: "5", value: 5 },
    { label: "10", value: 10 },
  ], 5);

  const sizeGroup = createButtonGroup(t('custom.size'), [
    { label: t('custom.size.normal'), value: 1 },
    { label: t('custom.size.small'), value: 0.75 },
    { label: t('custom.size.very_small'), value: 0.5 },
  ], 1);

  const themeGroup = createButtonGroup(t('custom.theme'), [
    { label: t('custom.theme.classic'), value: 0 },
    { label: t('custom.theme.energy'), value: 1 },
    { label: t('custom.theme.nebula'), value: 2 },
  ], 0);

  const startButton = document.createElement('button');
  startButton.textContent = t('custom.start');
  startButton.className = "mt-4 bg-green-600 hover:bg-green-700 text-white text-2xl font-bold py-2 px-6 rounded transition";
  startButton.onclick = () => {
    const speed = getSelectedValue(speedGroup);
    const scoreToWin = getSelectedValue(scoreGroup);
    const paddleSize = getSelectedValue(sizeGroup);
    const theme = getSelectedValue(themeGroup);
    savePongSettings({ speed, scoreToWin, paddleSize, theme });
    navigate('/versus');
  };

  innerPanel.append(speedGroup, scoreGroup, sizeGroup, themeGroup, startButton);
  customizationMenu.appendChild(innerPanel);

  gameFrame.appendChild(customizationMenu);
  gameArea.appendChild(gameFrame);

  const layout = document.createElement('div');
  layout.className = 'flex flex-1';
  layout.id = 'game-layout';
  layout.appendChild(gameArea);

  container.appendChild(layout);

  sidebar.addEventListener('mouseenter', () => {
    document.querySelectorAll('.sidebar-label').forEach(label => {
      (label as HTMLElement).classList.remove('opacity-0');
      (label as HTMLElement).classList.add('opacity-100');
    });
    backgroundImage.className = 'absolute top-0 left-64 right-0 bottom-0 bg-cover bg-center transition-all duration-300';
    layout.classList.add('ml-44');
  });

  sidebar.addEventListener('mouseleave', () => {
    document.querySelectorAll('.sidebar-label').forEach(label => {
      (label as HTMLElement).classList.add('opacity-0');
      (label as HTMLElement).classList.remove('opacity-100');
    });
    backgroundImage.className = 'absolute top-0 left-20 right-0 bottom-0 bg-cover bg-center transition-all duration-300';
    layout.classList.remove('ml-44');
  });

  return container;
}
