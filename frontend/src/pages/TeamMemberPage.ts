import { createSidebar } from "../utils/sidebar";
import { applyUserTheme } from "../utils/theme";

// Map route names to full display names
const fullNameMap: Record<string, string> = {
  shinhye: "Shinhye YUN",
  alix: "Alix CERALINE",
  gnouma: "Gnouma DUKURAY",
  rime: "Rime YOUNSSI",
  eléonore: "Eléonore ROTY",
};

const bioMap: Record<string, string> = {
  shinhye: `Shinhye YUN is a multidisciplinary creator passionate about design and user experience. With a background in visual arts, she brings aesthetic finesse to every project, transforming ideas into immersive digital experiences.`,
  
  alix: `Alix CERALINE is a technology enthusiast with a keen eye for detail. She excels at turning complex problems into elegant solutions and believes that collaboration is the cornerstone of innovation.`,
  
  gnouma: `Gnouma DUKURAY is known for her strong analytical skills and her empathetic leadership. She enjoys working across disciplines to drive impactful results and foster inclusive teamwork.`,
  
  rime: `Rime YOUNSSI is a strategist at heart with a flair for storytelling. Her work bridges creativity and logic, bringing a unique voice to every challenge she tackles.`,
  
 eléonore: `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Étudiante en Master 2 Management de la Technologie et de l’Innovation à Paris-Dauphine, et en formation à l’école 42, j'ai un profil hybride entre stratégie, innovation et développement informatique. Mon profil hybride témoigne de ma curiosité et de mon envie d’apprendre, de comprendre, et de transformer ces connaissances en projets concrets.<br/>
<br/>
C’est à 42 que j’ai découvert une passion pour le développement et pour le débogage — comprendre un problème en profondeur, le démonter pièce par pièce, puis le résoudre est devenu une vraie source de satisfaction. L’école est pour moi un terrain d’expérimentation stimulant, qui a nourri une curiosité grandissante pour les nouvelles technologies, comme le machine learning et ses applications concrètes, ou encore le développement de jeux.<br/>
<br/>
J’ai rejoint le projet Transcendance en cours de route, mais l’intégration s’est faite très naturellement grâce à la dynamique de l’équipe. J’ai principalement travaillé sur le frontend, mais l’organisation en mode collaboratif — où chacun prenait en charge les besoins du moment une fois sa partie terminée — m’a permis d’intervenir sur une grande variété de problèmes. Une posture polyvalente, presque de couteau suisse du développement. Ce projet a été à la fois formateur et stimulant : voir des lignes de code prendre forme à l’écran, jusqu’à devenir une interface fluide, interactive et visuellement soignée, a rendu l’expérience particulièrement motivante.<br/>
<br/>
Transcendance a été une expérience très enrichissante qui m’a donné envie d’aller plus loin dans le développement. Et c’est aussi une super aventure humaine, qui m’a fait grandir à tous les niveaux.`,
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
  //mainSection.className = 'relative mt-24 flex flex-col items-center z-30 px-6'; //middle
  mainSection.className = 'relative mt-24 flex flex-col z-30 px-10';


  const title = document.createElement('h2');
  title.textContent = fullNameMap[name.toLowerCase()] || '404 not found';
  title.className = 'text-4xl font-bold mb-10 text-white text-center';
  mainSection.appendChild(title);

  const bioWrapper = document.createElement('div');
bioWrapper.className = `
  bg-white/10 backdrop-blur-md
  p-10 rounded-2xl shadow-2xl
  max-w-4xl w-full
  transform transition-all duration-300
  hover:scale-[1.01]
  ml-auto mr-auto md:ml-32
`.replace(/\s+/g, ' ').trim();


  const bio = document.createElement('p');
  //bio.className = 'text-lg text-gray-300 text-justify max-w-4xl leading-relaxed'; //middle
  bio.className = 'text-lg text-gray-300 text-justify max-w-4xl leading-relaxed';

  
  bio.innerHTML = bioMap[name.toLowerCase()] || "This member is not part of our team... sorry!";



  bioWrapper.appendChild(bio);
  mainSection.appendChild(bioWrapper);

  //mainSection.appendChild(bio);
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
