import { createSidebar } from "../utils/sidebar";
import { applyUserTheme } from "../utils/theme";

// Map route names to full display names
const fullNameMap: Record<string, string> = {
  shinhye: "Shinhye Yun",
  alix: "Alix Ceralin",
  gnouma: "Gnouma Dukuray",
  rime: "Rime Younssi",
  eléonore: "Eléonore Roty",
};

export function createTeamMemberPage(navigate: (path: string) => void, name: string): HTMLElement {
  const container = document.createElement('div');
  container.className = 'relative min-h-screen bg-gray-900 text-white overflow-hidden';

  // Sidebar
  const sidebar = createSidebar(navigate);
  sidebar.classList.add('z-40');
  container.appendChild(sidebar);

  // Background
  const backgroundImage = document.createElement('div');
  backgroundImage.id = 'backgroundImage';
  backgroundImage.className = 'absolute top-0 left-20 right-0 bottom-0 bg-cover bg-center transition-all duration-300';
  container.appendChild(backgroundImage);
  applyUserTheme(backgroundImage);

  // Main section
  const mainSection = document.createElement('div');
  mainSection.className = 'relative mt-24 flex flex-col items-center z-30 px-6';

  const title = document.createElement('h2');
  title.textContent = fullNameMap[name.toLowerCase()] || 'Member';
  title.className = 'text-4xl font-bold mb-10 text-white text-center';
  mainSection.appendChild(title);

  const bio = document.createElement('p');
  bio.className = 'text-lg text-gray-300 text-justify max-w-4xl leading-relaxed';

  bio.textContent = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam ut est vel nisi lacinia vestibulum. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Curabitur at sem tincidunt, suscipit erat vitae, accumsan quam. Vivamus auctor lacinia sem eu efficitur. Cras tincidunt eros lacus, vel eleifend est feugiat ac.

Suspendisse iaculis facilisis tempus. Mauris vel ipsum tellus. Donec non cursus neque, sed lacinia sapien. Integer ut turpis in justo auctor tincidunt. Sed at quam neque. Aliquam porttitor, sem non maximus dictum, leo neque euismod orci, at interdum diam elit auctor mauris. Vivamus vulputate purus molestie tempus mollis. Suspendisse pulvinar pellentesque velit aliquet facilisis.

Ut luctus neque massa, eget sagittis mi feugiat sit amet. Nulla odio dui, pharetra ultricies suscipit id, finibus ac ipsum. Integer egestas metus velit, vitae placerat enim feugiat quis. Phasellus nisi purus, luctus ac ornare ac, efficitur aliquet sem. Ut scelerisque neque quis sagittis tempus. Aliquam in eros sit amet nibh ultricies efficitur vitae at libero.`;

  mainSection.appendChild(bio);
  container.appendChild(mainSection);

  return container;
}

// import { createSidebar } from "../utils/sidebar";
// import { applyUserTheme } from "../utils/theme";

// // Map route names to full display names
// const fullNameMap: Record<string, string> = {
//   shinhye: "Shinhye Yun",
//   alix: "Alix Ceralin",
//   gnouma: "Gnouma Dukuray",
//   rime: "Rime Younssi",
//   eléonore: "Eléonore Roty",
// };

// export function createTeamMemberPage(name: string): HTMLElement {
//   const container = document.createElement('div');
//   container.className = 'relative min-h-screen bg-gray-900 text-white overflow-hidden';

//   // Sidebar
//   const sidebar = createSidebar(() => {});
//   sidebar.classList.add('z-40');
//   container.appendChild(sidebar);

//   // Background
//   const backgroundImage = document.createElement('div');
//   backgroundImage.id = 'backgroundImage';
//   backgroundImage.className = 'absolute top-0 left-20 right-0 bottom-0 bg-cover bg-center transition-all duration-300';
//   container.appendChild(backgroundImage);
//   applyUserTheme(backgroundImage);

//   // Main section
//   const mainSection = document.createElement('div');
//   mainSection.className = 'relative mt-24 flex flex-col items-center z-30';

//   const title = document.createElement('h2');
//   title.textContent = fullNameMap[name.toLowerCase()] || 'Member'; // fallback if not found
//   title.className = 'text-4xl font-bold mb-10 text-white';
//   mainSection.appendChild(title);

//   // Bio
//   const bio = document.createElement('p');
//   bio.textContent = `This is ${fullNameMap[name.toLowerCase()] || name}'s profile page.`;
//   bio.className = 'mt-6 text-lg text-center text-gray-300 max-w-xl';
//   mainSection.appendChild(bio);

//   container.appendChild(mainSection);

//   return container;
// }
