import { t } from '../utils/translator';

export function initSidebarHoverEffects(): void {
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;

  // sidebar.addEventListener('mouseenter', () => {
  //   document.querySelectorAll('.sidebar-label').forEach(label => {
  //     (label as HTMLElement).classList.remove('opacity-0');
  //     (label as HTMLElement).classList.add('opacity-100');
  //   });

  //   const backgroundImage = document.getElementById('backgroundImage');
  //   if (backgroundImage) {
  //     backgroundImage.className = 'absolute top-0 left-64 right-0 bottom-0 bg-cover bg-center transition-all duration-300';
  //   }

  //   const profileSection = document.getElementById('profileCard')?.parentElement;
  //   if (profileSection) {
  //     profileSection.className = `
  //       relative mt-24
  //       flex flex-row justify-center items-start gap-20
  //       z-20 w-full max-w-7xl mx-auto px-4
  //     `.replace(/\s+/g, ' ').trim();
  //   }
  // });

  // sidebar.addEventListener('mouseleave', () => {
  //   document.querySelectorAll('.sidebar-label').forEach(label => {
  //     (label as HTMLElement).classList.add('opacity-0');
  //     (label as HTMLElement).classList.remove('opacity-100');
  //   });

  //   const backgroundImage = document.getElementById('backgroundImage');
  //   if (backgroundImage) {
  //     backgroundImage.className = 'absolute top-0 left-20 right-0 bottom-0 bg-cover bg-center transition-all duration-300';
  //   }

  //   const profileSection = document.getElementById('profileSection');
  //   if (profileSection) {
  //     profileSection.className = `
  //       relative mt-24
  //       flex flex-row items-start justify-center gap-12
  //       z-30
  //     `.replace(/\s+/g, ' ').trim();
  //   }
  // });
}

