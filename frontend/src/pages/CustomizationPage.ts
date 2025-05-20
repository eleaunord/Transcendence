import { createSidebar } from "../utils/sidebar";
import { applyUserTheme } from "../utils/theme";
import { savePongSettings } from "../utils/pongSettings";

export function createCustomizationPage(navigate: (path: string) => void): HTMLElement {
  const container = document.createElement('div');
  container.className = 'relative flex flex-col h-screen bg-gray-900 text-white overflow-hidden';

  const sidebar = createSidebar(navigate);
  container.appendChild(sidebar);

  const backgroundImage = document.createElement('div');
  backgroundImage.id = 'backgroundImage';
  backgroundImage.className = 'absolute top-0 left-20 right-0 bottom-0 bg-cover bg-center transition-all duration-300';
  container.appendChild(backgroundImage);
  applyUserTheme(backgroundImage);

  const panel = document.createElement('div');
  panel.className = 'flex flex-col gap-8 justify-center items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 bg-black/60 p-8 rounded-lg';

  // Sélection vitesse
  const speedGroup = createOptionGroup("Vitesse de la balle", [
    { label: "Normale", value: 5 },
    { label: "Rapide", value: 8 },
    { label: "Très rapide", value: 11 }
  ]);

  // Score limite
  const scoreGroup = createOptionGroup("Score pour gagner", [
    { label: "3", value: 3 },
    { label: "5", value: 5 },
    { label: "10", value: 10 }
  ]);

  // Taille raquette (sera convertie en paddle scale)
  const paddleSizeGroup = createOptionGroup("Taille des raquettes", [
    { label: "Normale", value: 1 },
    { label: "Petite", value: 0.75 },
    { label: "Très petite", value: 0.5 }
  ]);

  const themeGroup = createOptionGroup("Thème visuel", [
  { label: "Classique", value: 0 },
  { label: "Énergie", value: 1 },
  { label: "Nébuleuse", value: 2 },
  ]);

  const startButton = document.createElement('button');
  startButton.textContent = "Lancer le match";
  startButton.className = "mt-4 bg-green-600 hover:bg-green-700 text-white text-2xl font-bold py-2 px-6 rounded transition";
  startButton.onclick = () => {
    const speed = Number(getSelectedValue(speedGroup));
    const scoreToWin = Number(getSelectedValue(scoreGroup));
    const paddleSize = Number(getSelectedValue(paddleSizeGroup));
    const theme = getSelectedValue(themeGroup);
    savePongSettings({ speed, scoreToWin, paddleSize, theme });
    navigate('/versus');
  };

  panel.append(speedGroup.group, scoreGroup.group, paddleSizeGroup.group, startButton);
  container.appendChild(panel);

  // Sidebar hover
  sidebar.addEventListener('mouseenter', () => {
    document.querySelectorAll('.sidebar-label').forEach(label => {
      (label as HTMLElement).classList.remove('opacity-0');
      (label as HTMLElement).classList.add('opacity-100');
    });
    backgroundImage.className = 'absolute top-0 left-64 right-0 bottom-0 bg-cover bg-center transition-all duration-300';
  });

  sidebar.addEventListener('mouseleave', () => {
    document.querySelectorAll('.sidebar-label').forEach(label => {
      (label as HTMLElement).classList.add('opacity-0');
      (label as HTMLElement).classList.remove('opacity-100');
    });
    backgroundImage.className = 'absolute top-0 left-20 right-0 bottom-0 bg-cover bg-center transition-all duration-300';
  });

  return container;
}

// Crée un groupe d'options radio stylisées
function createOptionGroup(title: string, options: { label: string, value: number }[]) {
  const group = document.createElement('div');
  group.className = 'flex flex-col items-center';

  const titleElem = document.createElement('h3');
  titleElem.textContent = title;
  titleElem.className = 'text-lg font-semibold mb-2';

  const btnContainer = document.createElement('div');
  btnContainer.className = 'flex gap-4';

  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.textContent = opt.label;
    btn.className = 'bg-blue-800 hover:bg-blue-700 text-white py-2 px-4 rounded';
    btn.dataset.value = opt.value.toString();

    btn.addEventListener('click', () => {
      btnContainer.querySelectorAll('button').forEach(b => b.classList.remove('bg-blue-600'));
      btn.classList.add('bg-blue-600');
    });

    btnContainer.appendChild(btn);
  });

  // Sélection par défaut
  btnContainer.querySelector('button')?.classList.add('bg-blue-600');

  group.append(titleElem, btnContainer);
  return { group, btnContainer };
}

// Récupère la valeur sélectionnée d'un bouton groupé
function getSelectedValue(group: { btnContainer: HTMLDivElement }): number {
  const selected = group.btnContainer.querySelector('button.bg-blue-600');
  return selected ? Number((selected as HTMLButtonElement).dataset.value) : 0;
}

