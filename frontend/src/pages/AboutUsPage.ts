import { createSidebar } from "../utils/sidebar";
import { applyUserTheme } from "../utils/theme";


export function createAboutPage(navigate: (path: string) => void): HTMLElement {
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

  // --- Main section for title + team ---
  const mainSection = document.createElement('div');
  mainSection.className = 'relative mt-24 flex flex-col items-center z-30';

  const title = document.createElement('h2'); // use <h2> for consistency with Friends
  title.textContent = 'About Us';
  title.className = 'text-4xl font-bold mb-10 text-white';
  mainSection.appendChild(title);

  // Team container
  const teamContainer = document.createElement('div');
  teamContainer.className = `
    flex flex-col items-center justify-center gap-20
    max-w-7xl mx-auto px-4
  `.replace(/\s+/g, ' ').trim();

  const defaultImage = '/assets/profile-pictures/default.jpg';

  const topNames = ['Shinhye', 'Alix', 'Gnouma'];
  const bottomNames = ['Rime', 'Eléonore'];

  // Helper function to create a member block
const createMember = (name: string): HTMLElement => {
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

  button.addEventListener('click', () => {
    //window.location.href = `/team/${name.toLowerCase()}`;
    navigate(`/team/${name.toLowerCase()}`);
  });



  const img = document.createElement('img');
  img.src = defaultImage;
  img.alt = name;
  img.className = 'w-full h-full object-cover';

  button.appendChild(img);

  const label = document.createElement('span');
  label.textContent = name;
  label.className = `
    mt-3 text-xl font-semibold text-white bg-black/60
    px-4 py-1 rounded-full shadow-md text-center
    min-w-[9rem]
  `.trim();


  wrapper.appendChild(button);
  wrapper.appendChild(label);

  return wrapper;
};

  // Top row (3 members)
  const topRow = document.createElement('div');
  topRow.className = 'flex justify-center gap-24';
  topNames.forEach(name => topRow.appendChild(createMember(name)));

  // Bottom row (2 members)
  const bottomRow = document.createElement('div');
  bottomRow.className = 'flex justify-center gap-44';
  bottomNames.forEach(name => bottomRow.appendChild(createMember(name)));

  teamContainer.appendChild(topRow);
  teamContainer.appendChild(bottomRow);
  mainSection.appendChild(teamContainer);
  container.appendChild(mainSection);

  return container;
}
