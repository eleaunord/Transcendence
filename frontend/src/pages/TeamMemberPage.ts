import { createSidebar } from "../utils/sidebar";
import { t } from '../utils/translator';

export function createTeamMemberPage(navigate: (path: string) => void, name: string): HTMLElement {
  const container = document.createElement('div');
  container.className = 'relative min-h-screen bg-gray-900 text-white overflow-hidden';

  // Sidebar
  const sidebar = createSidebar(navigate);
  sidebar.classList.add('z-40');
  container.appendChild(sidebar);

  // Mapping des backgrounds
  const backgrounds: { [key: string]: string } = {
    shinhye: '/assets/Team_cards/card_shinhye.jpg',
    alix: '/assets/Team_cards/card_alix.jpg',
    gnouma: '/assets/Team_cards/card_gnouma.jpg',
    rime: '/assets/Team_cards/card_rime.jpg',
    eleonore: '/assets/Team_cards/card_eleonore.jpg',
  };

  const backgroundUrl = backgrounds[name.toLowerCase()];

  // Création du fond
  const backgroundImage = document.createElement('div');
  backgroundImage.id = 'backgroundImage';

  // 💡 Style complet et correct
  backgroundImage.style.position = 'absolute';
  backgroundImage.style.top = '0';
  backgroundImage.style.left = '80px'; // ✅ correspond à Tailwind `left-20`
  backgroundImage.style.right = '0';
  backgroundImage.style.bottom = '0';
  backgroundImage.style.zIndex = '0';
  backgroundImage.style.backgroundSize = 'cover';
  backgroundImage.style.backgroundPosition = 'center';
  backgroundImage.style.backgroundRepeat = 'no-repeat';
  backgroundImage.style.opacity = '1'; // ✅ sécurité

  if (backgroundUrl) {
    backgroundImage.style.backgroundImage = `url('${backgroundUrl}')`;
  } else {
    console.warn("⚠️ Aucun fond trouvé pour :", name);
  }

  // Test visuel (à supprimer ensuite)
  //backgroundImage.style.border = '2px dashed red';

  container.appendChild(backgroundImage);

  // Main section
  const mainSection = document.createElement('div');
  mainSection.className = 'relative mt-24 flex flex-col z-30 px-10';

  const title = document.createElement('h2');
  title.textContent = t(`team.name.${name.toLowerCase()}`) || '404 not found';
  title.className = 'text-4xl font-bold mb-10 text-white text-center';
  mainSection.appendChild(title);

  const bioWrapper = document.createElement('div');
  bioWrapper.className = `
    bg-black/60
    p-10 rounded-2xl shadow-2xl
    max-w-4xl w-full
    transform transition-all duration-300
    hover:scale-[1.01]
    ml-auto mr-auto md:ml-32
  `.trim();

  const bio = document.createElement('p');
  bio.className = 'text-lg text-gray-300 text-justify max-w-4xl leading-relaxed';
  bio.innerHTML = t(`team.bio.${name.toLowerCase()}`) || "This member is not part of our team... sorry!";

  bioWrapper.appendChild(bio);
  mainSection.appendChild(bioWrapper);
  container.appendChild(mainSection);

  return container;
}