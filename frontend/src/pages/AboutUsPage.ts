import { createSidebar } from "../utils/sidebar";
import { applyUserTheme } from "../utils/theme";

type Friend = {
  username: string;
  profile_picture: string;
};

export function createAboutPage(navigate: (path: string) => void): HTMLElement {
  if ((window as any).activePongCleanup) {
    (window as any).activePongCleanup();
    delete (window as any).activePongCleanup;
  }

  const container = document.createElement('div');
  container.className = 'relative min-h-screen bg-gray-900 text-white overflow-hidden';

  const sidebar = createSidebar(navigate);
  sidebar.classList.add('z-40');
  container.appendChild(sidebar);

  const backgroundImage = document.createElement('div');
  backgroundImage.id = 'backgroundImage';
  backgroundImage.className = 'absolute top-0 left-20 right-0 bottom-0 bg-cover bg-center transition-all duration-300';
  container.appendChild(backgroundImage);
  applyUserTheme(backgroundImage);

  const mainSection = document.createElement('div');
  mainSection.className = 'relative mt-24 flex flex-col items-center z-30';

  const title = document.createElement('h2');
  title.textContent = 'About Us';
  title.className = 'text-4xl font-bold mb-10 text-white';
  mainSection.appendChild(title);

  const teamContainer = document.createElement('div');
  teamContainer.className = `
    flex flex-col items-center justify-center gap-20
    max-w-7xl mx-auto px-4
  `.replace(/\s+/g, ' ').trim();

  // --- Membres codés en dur ---
  const team: Friend[] = [
    { username: 'Shinhye', profile_picture: '/assets/Team_cards/card_shinhye.png' },
    { username: 'Alix',    profile_picture: '/assets/Team_cards/card_alix.png' },
    { username: 'Gnouma',  profile_picture: '/assets/Team_cards/card_gnouma.png' },
    { username: 'Rime',    profile_picture: '/assets/Team_cards/card_rime.png' },
    { username: 'Eleonore', profile_picture: '/assets/Team_cards/card_eleonore.png' },
  ];

  const createMember = (member: Friend): HTMLElement => {
    const wrapper = document.createElement('div');
    wrapper.className = 'flex flex-col items-center';

    const button = document.createElement('button');
    button.className = `
      w-44 h-44 md:w-52 md:h-52
      rounded-full overflow-hidden
      border-4 border-white shadow-xl
      transform transition-transform duration-300 hover:scale-110
      focus:outline-none
    `.trim();

    const img = document.createElement('img');
    img.src = member.profile_picture;
    img.alt = member.username;
    img.className = 'w-full h-full object-cover';
    button.appendChild(img);

    button.addEventListener('click', () => {
      navigate(`/team/${member.username.toLowerCase()}`);
    });

    const label = document.createElement('span');
    label.textContent = member.username;
    label.className = `
      mt-3 text-xl font-semibold text-white bg-black/60
      px-4 py-1 rounded-full shadow-md text-center min-w-[9rem]
    `.trim();

    wrapper.append(button, label);
    return wrapper;
  };

  const topRow = document.createElement('div');
  topRow.className = 'flex justify-center gap-24';
  team.slice(0, 3).forEach(member => topRow.appendChild(createMember(member)));

  const bottomRow = document.createElement('div');
  bottomRow.className = 'flex justify-center gap-44';
  team.slice(3, 5).forEach(member => bottomRow.appendChild(createMember(member)));

  teamContainer.appendChild(topRow);
  teamContainer.appendChild(bottomRow);
  mainSection.appendChild(teamContainer);
  container.appendChild(mainSection);

  return container;
}
